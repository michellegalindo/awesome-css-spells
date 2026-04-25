import { readFileSync, writeFileSync, writeSync, openSync, closeSync, unlinkSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const EN_PATH = resolve(ROOT, "index.html");
const PTBR_PATH = resolve(ROOT, "pt-br", "index.html");

const DRY_RUN = process.argv.includes("--dry-run");
const CHECK = process.argv.includes("--check");

type Slot = {
  extract: RegExp;
  apply: (html: string, val: string) => string;
};

const SLOTS: Record<string, Slot> = {
  htmlLang: {
    extract: /<html lang="([^"]+)"/,
    apply: (html, val) => html.replace(/<html lang="[^"]+"/, `<html lang="${val}"`),
  },
  title: {
    extract: /<title>([^<]*)<\/title>/,
    apply: (html, val) => html.replace(/<title>[^<]*<\/title>/, `<title>${val}</title>`),
  },
  h1SrOnly: {
    extract: /<h1 class="sr-only">([^<]*)<\/h1>/,
    apply: (html, val) =>
      html.replace(/<h1 class="sr-only">[^<]*<\/h1>/, `<h1 class="sr-only">${val}</h1>`),
  },
  statsInner: {
    extract: /id="stats">([\s\S]*?)<\/div>/,
    apply: (html, val) => html.replace(/(id="stats">)([\s\S]*?)(<\/div>)/, `$1${val}$3`),
  },
  topbarLinksInner: {
    extract: /id="topbar-links">([\s\S]*?)<\/div>/,
    apply: (html, val) => html.replace(/(id="topbar-links">)([\s\S]*?)(<\/div>)/, `$1${val}$3`),
  },
  tagline: {
    extract: /<p class="tagline">([^<]*)<\/p>/,
    apply: (html, val) =>
      html.replace(/<p class="tagline">[^<]*<\/p>/, `<p class="tagline">${val}</p>`),
  },
  loadingText: {
    extract: /id="loading">([^<]*)<\/div>/,
    apply: (html, val) => html.replace(/(id="loading">)[^<]*(<\/div>)/, `$1${val}$2`),
  },
  errorInner: {
    extract: /id="error">([\s\S]*?)<\/div>/,
    apply: (html, val) => html.replace(/(id="error">)([\s\S]*?)(<\/div>)/, `$1${val}$3`),
  },
  langsMobileFull: {
    extract: /(<p id="languages-mobile"[\s\S]*?<\/p>)/,
    apply: (html, val) => html.replace(/<p id="languages-mobile"[\s\S]*?<\/p>/, val),
  },
  logoLinkHref: {
    extract: /class="logo-link"\s+href="([^"]+)"/,
    apply: (html, val) =>
      html.replace(/(class="logo-link"\s+href=")[^"]+(")/, `$1${val}$2`),
  },
  searchPlaceholder: {
    extract: /id="search"[^>]*placeholder="([^"]+)"/,
    apply: (html, val) =>
      html.replace(/(id="search"[^>]*placeholder=")[^"]+(")/,  `$1${val}$2`),
  },
  contributeBadgeSrc: {
    extract: /src="(https:\/\/img\.shields\.io\/badge\/github-[^"]+)"[^>]*alt="GitHub Contribute Badge"/,
    apply: (html, val) =>
      html.replace(
        /(src=")(https:\/\/img\.shields\.io\/badge\/github-[^"]+)("[^>]*alt="GitHub Contribute Badge")/,
        `$1${val}$3`
      ),
  },
  glassesSrc: {
    extract: /id="glasses"\s+src="([^"]+)"/,
    apply: (html, val) => html.replace(/(id="glasses"\s+src=")[^"]+(")/, `$1${val}$2`),
  },
  heroH2Inner: {
    extract: /<h2>([\s\S]*?)<\/h2>/,
    apply: (html, val) => html.replace(/(<h2>)([\s\S]*?)(<\/h2>)/, `$1${val}$3`),
  },
  blockquoteInner: {
    extract: /<blockquote>([\s\S]*?)<\/blockquote>/,
    apply: (html, val) => html.replace(/(<blockquote>)([\s\S]*?)(<\/blockquote>)/, `$1${val}$3`),
  },
  contributorsLabel: {
    extract: /<p class="contributors-label">([^<]*)<\/p>/,
    apply: (html, val) =>
      html.replace(
        /<p class="contributors-label">[^<]*<\/p>/,
        `<p class="contributors-label">${val}</p>`
      ),
  },
};

function extractSlots(html: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [name, slot] of Object.entries(SLOTS)) {
    const match = html.match(slot.extract);
    if (match) result[name] = match[1];
  }
  return result;
}

function applySlots(template: string, slots: Record<string, string>): string {
  let html = template;
  for (const [name, slot] of Object.entries(SLOTS)) {
    if (name in slots) html = slot.apply(html, slots[name]);
  }
  return html;
}

const RELATIVE_PATH_RE = /((?:href|src)=")(?!https?:\/\/|\/|#|\.\.)([^"]+)/g;

function adjustPaths(html: string): string {
  return html.replace(RELATIVE_PATH_RE, (_, attr, path) => `${attr}../${path}`);
}

type Diff = { line: number; current: string; expected: string };

function lineDiff(expected: string, current: string): Diff[] {
  const exp = expected.split("\n");
  const cur = current.split("\n");
  const diffs: Diff[] = [];
  for (let i = 0; i < Math.max(exp.length, cur.length); i++) {
    if (exp[i] !== cur[i])
      diffs.push({ line: i + 1, current: cur[i] ?? "(missing)", expected: exp[i] ?? "(remove)" });
  }
  return diffs;
}

const TMP_PATH = resolve(ROOT, ".sync_ptbr_tmp.html");

function formatHtml(html: string): string {
  writeFileSync(TMP_PATH, html, "utf-8");
  try {
    execSync(`npx prettier --write "${TMP_PATH}"`, { stdio: "pipe" });
    return readFileSync(TMP_PATH, "utf-8");
  } finally {
    try { unlinkSync(TMP_PATH); } catch {}
  }
}

async function run() {
  const enHtml = readFileSync(EN_PATH, "utf-8");
  const ptBrHtml = readFileSync(PTBR_PATH, "utf-8");

  const ptBrSlots = extractSlots(ptBrHtml);
  const enSlots = extractSlots(enHtml);

  const missing = Object.keys(SLOTS).filter((k) => !(k in ptBrSlots));
  if (missing.length) {
    console.warn(`⚠  slots not found in pt-br: ${missing.join(", ")}`);
  }

  for (const [name, val] of Object.entries(ptBrSlots)) {
    if (val === enSlots[name]) {
      console.warn(`⚠  slot "${name}" is identical to English — may need translation`);
    }
  }

  const synced = formatHtml(adjustPaths(applySlots(enHtml, ptBrSlots)));
  const ptBrFormatted = formatHtml(ptBrHtml);
  const diffs = lineDiff(synced, ptBrFormatted);

  if (!diffs.length) {
    console.log("✓ pt-br/index.html is in sync with index.html");
    return;
  }

  console.log(`${diffs.length} structural difference(s) found:\n`);
  for (const d of diffs) {
    console.log(`  Line ${d.line}:`);
    console.log(`    current:  ${d.current}`);
    console.log(`    expected: ${d.expected}`);
  }

  if (CHECK) process.exit(1);
  if (DRY_RUN) return;

  writeFileSync(PTBR_PATH, synced, "utf-8");
  console.log(`\n✓ Written`);
}

run();
