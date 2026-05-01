import { parseArgs } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SUPPORTED_LANGUAGES = ["en", "pt-BR"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const README_BY_LANG: Record<SupportedLanguage, string> = {
  en: "README.md",
  "pt-BR": "pt-br/README.md",
};

const EN_TO_PT_TYPE: Record<string, string> = {
  tool: "ferramenta",
  library: "biblioteca",
  framework: "framework",
  course: "curso",
  video: "vídeo",
  article: "artigo",
  guide: "guia",
  reference: "referência",
  generator: "gerador",
  methodology: "metodologia",
  podcast: "podcast",
  playground: "playground",
  preprocessor: "pré-processador",
};

const EN_TO_PT_CATEGORY: Record<string, string> = {
  Frameworks: "Frameworks",
  "CSS Frameworks": "Frameworks CSS",
  "CSS-in-JS": "CSS-in-JS",
  "Layout & Positioning": "Layout e Posicionamento",
  "Responsive Design": "Design Responsivo",
  "Animation & Visual Effects": "Animação e Efeitos Visuais",
  "UI & Components": "UI e Componentes",
  "Forms & UX Patterns": "Formulários e Padrões de UX",
  Tooling: "Ferramentas",
  "Style Generators": "Geradores de Estilo",
  Utilities: "Utilitários",
  Debugging: "Depuração (Debug)",
  Architecture: "Arquitetura",
  "Build & Language Features": "Build e Recursos da Linguagem",
  "Naming & Methodologies": "Nomenclatura e Metodologias",
  "Design Systems": "Design Systems",
  "Scaling Strategies": "Estratégias de Escalabilidade",
  "Performance & Optimization": "Performance e Otimização",
  "Accessibility (a11y)": "Acessibilidade (a11y)",
  "What's New in CSS": "Novidades em CSS",
  "Learning & References": "Aprendizado e Referências",
  Inspiration: "Inspiração",
};

const DESCRIPTION_MAX_LENGTH = 110;

export function isDescriptionPoor(description: string, title?: string): boolean {
  const trimmed = description.trim();
  if (trimmed.length < 30) return true;
  if (trimmed.split(/\s+/).length <= 3) return true;
  if (title && trimmed.toLowerCase() === title.toLowerCase()) return true;
  return false;
}

function validateDescriptionLength(description: string): void {
  if (description.length <= DESCRIPTION_MAX_LENGTH) return;
  console.error(
    `Error: Description exceeds ${DESCRIPTION_MAX_LENGTH} characters (${description.length} chars).`
  );
  console.error(`  Current : "${description}"`);
  console.error(
    `  Action  : Rewrite it to answer "What problem does this resource solve?" within ${DESCRIPTION_MAX_LENGTH} characters, then re-run with --description "rewritten version".`
  );
  process.exit(1);
}

export function extractMetaDescription(html: string): string | undefined {
  const match =
    html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"[^>]*>/i) ||
    html.match(/<meta[^>]*content="([^"]+)"[^>]*name="description"[^>]*>/i) ||
    html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"[^>]*>/i);
  return match ? match[1].trim().replace(/\n/g, " ") : undefined;
}

export function detectLangFromResponse(html: string, headers: Headers): SupportedLanguage | null {
  const contentLang = headers.get("content-language");
  if (contentLang) {
    if (contentLang.toLowerCase().startsWith("pt")) return "pt-BR";
    if (contentLang.toLowerCase().startsWith("en")) return "en";
  }

  const htmlLangMatch = html.match(/<html[^>]*\slang="([^"]+)"/i);
  if (htmlLangMatch) {
    const lang = htmlLangMatch[1].toLowerCase();
    if (lang.startsWith("pt")) return "pt-BR";
    if (lang.startsWith("en")) return "en";
  }

  return null;
}

export function insertEntry(
  content: string,
  category: string,
  entry: { title: string; link: string; description: string; type: string }
): string | null {
  const categoryRegex = new RegExp(
    `^(#+)\\s+${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`,
    "im"
  );
  const match = content.match(categoryRegex);
  if (!match) return null;

  const sectionStartIndex = match.index! + match[0].length;

  const nextSectionRegex = /^#+\s+.+$/gm;
  nextSectionRegex.lastIndex = sectionStartIndex;
  const nextMatch = nextSectionRegex.exec(content);
  const sectionEndIndex = nextMatch ? nextMatch.index : content.length;

  const sectionContent = content.substring(sectionStartIndex, sectionEndIndex);
  const listItemRegex = /^- \[.*$/gm;
  let lastListItemIndex = -1;
  let m: RegExpExecArray | null;
  while ((m = listItemRegex.exec(sectionContent)) !== null) {
    lastListItemIndex = m.index + m[0].length;
  }

  const { title, link, description, type } = entry;
  let insertIndex: number;
  let newEntry: string;

  if (lastListItemIndex !== -1) {
    insertIndex = sectionStartIndex + lastListItemIndex;
    newEntry = `\n- [${title}](${link}) - ${description} *(${type})*`;
  } else {
    // Empty section: skip leading whitespace, end with \n to avoid concatenating placeholder text
    const trimOffset = sectionContent.search(/\S/);
    insertIndex = sectionStartIndex + (trimOffset === -1 ? 1 : trimOffset);
    newEntry = `- [${title}](${link}) - ${description} *(${type})*\n\n`;
  }

  return content.substring(0, insertIndex) + newEntry + content.substring(insertIndex);
}

async function main() {
  const { values } = parseArgs({
    options: {
      link: { type: "string" },
      description: { type: "string" },
      title: { type: "string" },
      tag: { type: "string" },
      category: { type: "string" },
      lang: { type: "string" },
      "description-from-internet": { type: "string", default: "true" },
    },
    strict: false,
  });

  const link = values.link as string | undefined;
  if (!link) {
    console.error("Error: --link is required.");
    process.exit(1);
  }

  const rawLang = values.lang as string | undefined;
  if (rawLang && !SUPPORTED_LANGUAGES.includes(rawLang as SupportedLanguage)) {
    console.error(
      `Error: Language "${rawLang}" is not supported. Only "en" and "pt-BR" are accepted.`
    );
    process.exit(1);
  }

  let title = values.title as string | undefined;
  let description = values.description as string | undefined;
  const fetchFromInternet = values["description-from-internet"] === "true";
  let lang = rawLang as SupportedLanguage | undefined;

  const needsFetch =
    fetchFromInternet && (!lang || !description || isDescriptionPoor(description, title));

  if (needsFetch) {
    try {
      console.log(`Fetching metadata from ${link}...`);
      const response = await fetch(link);
      const html = await response.text();

      const fetchedDescription = extractMetaDescription(html);
      if (!description) {
        description = fetchedDescription;
      } else if (isDescriptionPoor(description, title) && fetchedDescription) {
        console.warn(
          `Warning: Provided description is too short or generic. Enriching with metadata from the URL.`
        );
        console.warn(`  Original : "${description}"`);
        console.warn(`  Enriched : "${fetchedDescription}"`);
        description = fetchedDescription;
      }

      if (!lang) {
        const detected = detectLangFromResponse(html, response.headers);
        if (!detected) {
          console.error(
            `Error: Could not detect language from "${link}". Only English and Portuguese (pt-BR) are accepted. Use --lang en or --lang pt-BR.`
          );
          process.exit(1);
        }
        lang = detected;
        console.log(`Detected language: ${lang}`);
      }
    } catch (e) {
      console.warn(`Warning: Could not fetch metadata from ${link}.`, e);
    }
  }

  if (!lang) {
    console.error(`Error: Language could not be determined. Use --lang en or --lang pt-BR.`);
    process.exit(1);
  }

  if (!title) {
    console.error(
      "Error: --title is required. Copying the page <title> is no longer supported; provide a curated title manually."
    );
    process.exit(1);
  }

  const readmeFile = README_BY_LANG[lang];

  description = description || "No description provided.";
  validateDescriptionLength(description);
  const rawType = values["tag"] as string | undefined;
  if (!rawType) {
    console.error("Error: --tag is required. See .github/PLAYBOOK.md for allowed values.");
    process.exit(1);
  }
  const type = lang === "pt-BR" ? (EN_TO_PT_TYPE[rawType] ?? rawType) : rawType;

  const enCategory = values.category as string | undefined;
  if (!enCategory) {
    console.error("Error: --category is required. Use the category name from README.md.");
    process.exit(1);
  }

  const category = lang === "pt-BR" ? (EN_TO_PT_CATEGORY[enCategory] ?? enCategory) : enCategory;

  const readmePath = join(process.cwd(), readmeFile);
  const readmeContent = readFileSync(readmePath, "utf-8");

  const updated = insertEntry(readmeContent, category, { title: title!, link, description, type });

  if (!updated) {
    console.error(`Error: Category "${category}" not found in ${readmeFile}.`);
    console.error(`Please provide a valid category from the taxonomy.`);
    process.exit(1);
  }

  writeFileSync(readmePath, updated, "utf-8");
  console.log(`Successfully added "${title}" to category "${category}" in ${readmeFile}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
