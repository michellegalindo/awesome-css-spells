import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const { values } = parseArgs({
    options: {
      link: { type: 'string' },
      description: { type: 'string' },
      title: { type: 'string' },
      type: { type: 'string', default: 'guide' },
      category: { type: 'string' },
      'description-from-internet': { type: 'string', default: 'true' },
    },
    strict: false,
  });

  const link = values.link as string | undefined;
  if (!link) {
    console.error('Error: --link is required.');
    process.exit(1);
  }

  let title = values.title as string | undefined;
  let description = values.description as string | undefined;
  const fetchFromInternet = values['description-from-internet'] === 'true';

  if (fetchFromInternet && (!title || !description)) {
    try {
      console.log(`Fetching metadata from ${link}...`);
      const response = await fetch(link);
      const html = await response.text();

      if (!title) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim().replace(/\n/g, ' ');
        }
      }

      if (!description) {
        const descMatch = 
          html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"[^>]*>/i) || 
          html.match(/<meta[^>]*content="([^"]+)"[^>]*name="description"[^>]*>/i) ||
          html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"[^>]*>/i);
        if (descMatch) {
          description = descMatch[1].trim().replace(/\n/g, ' ');
        }
      }
    } catch (e) {
      console.warn(`Warning: Could not fetch metadata from ${link}.`, e);
    }
  }

  title = title || 'Unknown Title';
  description = description || 'No description provided.';
  const type = (values.type as string | undefined) || 'guide';

  let category = values.category as string | undefined;
  if (!category) {
    // Basic inference based on title and description
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('grid') || text.includes('flexbox') || text.includes('layout')) {
      category = 'Layout & Positioning';
    } else if (text.includes('animation') || text.includes('transition') || text.includes('scroll-driven')) {
      category = 'Animation & Visual Effects';
    } else if (text.includes('form') || text.includes('input') || text.includes('checkbox')) {
      category = 'Forms & UX Patterns';
    } else if (text.includes('responsive') || text.includes('media query')) {
      category = 'Responsive Design';
    } else if (text.includes('container quer')) {
      category = 'Container Queries';
    } else if (text.includes('layer')) {
      category = 'Cascade Layers';
    } else if (text.includes('nesting')) {
      category = 'Nesting';
    } else if (text.includes('tailwind') || text.includes('framework')) {
      category = 'CSS Frameworks';
    } else if (text.includes('generator')) {
      category = 'Generators';
    } else if (text.includes('performance') || text.includes('optimiz')) {
      category = 'Performance & Optimization';
    } else if (text.includes('a11y') || text.includes('accessib')) {
      category = 'Accessibility (a11y)';
    } else {
      category = 'Learning & References'; // default fallback
    }
    console.log(`Inferred category: ${category}`);
  }

  const readmePath = join(process.cwd(), 'README.md');
  let readmeContent = readFileSync(readmePath, 'utf-8');

  // Find the category section
  const categoryRegex = new RegExp(`^(#+)\\s+${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'im');
  const match = readmeContent.match(categoryRegex);

  if (!match) {
    console.error(`Error: Category "${category}" not found in README.md.`);
    console.error(`Please provide a valid category from the taxonomy.`);
    process.exit(1);
  }

  const sectionStartIndex = match.index! + match[0].length;
  
  // Find the start of the next section
  const nextSectionRegex = /^#+\s+.+$/gm;
  nextSectionRegex.lastIndex = sectionStartIndex;
  const nextMatch = nextSectionRegex.exec(readmeContent);

  const sectionEndIndex = nextMatch ? nextMatch.index : readmeContent.length;
  const sectionContent = readmeContent.substring(sectionStartIndex, sectionEndIndex);
  
  // Find the last list item in this section
  const listItemRegex = /^- \[.*$/gm;
  let lastListItemIndex = -1;
  let listItemMatch;
  while ((listItemMatch = listItemRegex.exec(sectionContent)) !== null) {
    lastListItemIndex = listItemMatch.index + listItemMatch[0].length;
  }

  let insertIndex = sectionStartIndex;
  if (lastListItemIndex !== -1) {
    insertIndex += lastListItemIndex;
  } else {
    // If no list items, insert right after the heading
    insertIndex += 1;
  }

  const newEntry = `\n- [${title}](${link}) - ${description} *(${type})*`;

  readmeContent = 
    readmeContent.substring(0, insertIndex) + 
    newEntry + 
    readmeContent.substring(insertIndex);

  writeFileSync(readmePath, readmeContent, 'utf-8');
  console.log(`Successfully added "${title}" to category "${category}".`);
}

main().catch(console.error);
