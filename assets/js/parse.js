export function sliceContent(md) {
  const lines = md.split("\n");
  const skip = new Set(["Awesome CSS", "Summary", "Sumário"]);
  const idx = lines.findIndex((l) => /^#\s/.test(l) && !skip.has(l.replace(/^#\s+/, "").trim()));
  return idx === -1 ? md : lines.slice(idx).join("\n");
}

export function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function highlight(text, matches, key) {
  if (!matches || !text) return escapeHtml(text || "");
  const m = matches.find((m) => m.key === key);
  if (!m) return escapeHtml(text);
  let result = "";
  let lastIdx = 0;
  for (const [start, end] of m.indices) {
    result += escapeHtml(text.slice(lastIdx, start));
    result += "<mark>" + escapeHtml(text.slice(start, end + 1)) + "</mark>";
    lastIdx = end + 1;
  }
  result += escapeHtml(text.slice(lastIdx));
  return result;
}

export function extractItems(md) {
  const items = [];
  let currentSection = "";
  const lines = sliceContent(md).split("\n");
  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      currentSection = h1[1].trim();
      continue;
    }

    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      currentSection = h2[1].trim();
      continue;
    }

    const m = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)(.*)/);
    if (m) {
      const raw = m[3].replace(/^\s*[-–—]\s*/, "").trim();
      const tagMatch = raw.match(/^(.*?)\s*\*\(([^)]+)\)\*\s*$/);
      const desc = tagMatch ? tagMatch[1].trim() : raw;
      const tag = tagMatch ? tagMatch[2] : null;
      items.push({ title: m[1], url: m[2], desc, tag, section: currentSection });
    }
  }
  return items;
}
