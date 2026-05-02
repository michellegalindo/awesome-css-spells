import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isDescriptionPoor,
  extractMetaDescription,
  detectLangFromResponse,
  insertEntry,
} from "./add_readme_resource.ts";

test("isDescriptionPoor flags short descriptions", () => {
  assert.equal(isDescriptionPoor("too short"), true);
});

test("isDescriptionPoor flags <=3 words", () => {
  assert.equal(isDescriptionPoor("supercalifragilisticexpialidocious is fun"), true);
});

test("isDescriptionPoor flags description equal to title", () => {
  const text = "A complete guide to modern CSS layouts";
  assert.equal(isDescriptionPoor(text, text), true);
  assert.equal(isDescriptionPoor(text, text.toUpperCase()), true);
});

test("isDescriptionPoor accepts a good description", () => {
  assert.equal(
    isDescriptionPoor("A practical guide for building accessible CSS components", "Foo"),
    false
  );
});

test("extractMetaDescription handles name=description", () => {
  const html = `<meta name="description" content="A useful CSS guide">`;
  assert.equal(extractMetaDescription(html), "A useful CSS guide");
});

test("extractMetaDescription handles reversed attribute order", () => {
  const html = `<meta content="Reversed order works" name="description">`;
  assert.equal(extractMetaDescription(html), "Reversed order works");
});

test("extractMetaDescription falls back to og:description", () => {
  const html = `<meta property="og:description" content="OG fallback">`;
  assert.equal(extractMetaDescription(html), "OG fallback");
});

test("extractMetaDescription returns undefined when missing", () => {
  assert.equal(extractMetaDescription("<html><body>no meta</body></html>"), undefined);
});

test("extractMetaDescription strips newlines", () => {
  const html = `<meta name="description" content="line one\nline two">`;
  assert.equal(extractMetaDescription(html), "line one line two");
});

test("detectLangFromResponse prefers content-language header", () => {
  const headers = new Headers({ "content-language": "pt-BR" });
  assert.equal(detectLangFromResponse('<html lang="en">', headers), "pt-BR");
});

test("detectLangFromResponse falls back to html lang", () => {
  const headers = new Headers();
  assert.equal(detectLangFromResponse('<html lang="pt-br">', headers), "pt-BR");
  assert.equal(detectLangFromResponse('<html lang="en-US">', headers), "en");
});

test("detectLangFromResponse returns null for unknown languages", () => {
  const headers = new Headers();
  assert.equal(detectLangFromResponse('<html lang="fr">', headers), null);
  assert.equal(detectLangFromResponse("no lang here", headers), null);
});

test("insertEntry returns null for unknown category", () => {
  const content = "## Tools\n- [A](https://a.com) - Some description text here *(tool)*\n";
  assert.equal(
    insertEntry(content, "Unknown", {
      title: "X",
      link: "https://x.com",
      description: "desc",
      type: "tool",
    }),
    null
  );
});

test("insertEntry appends after last item in non-empty section", () => {
  const content =
    "## Tools\n- [A](https://a.com) - First item description here *(tool)*\n\n## Next\n";
  const result = insertEntry(content, "Tools", {
    title: "B",
    link: "https://b.com",
    description: "Second item description here",
    type: "tool",
  });
  assert.ok(result !== null);
  const posA = result!.indexOf("- [A]");
  const posB = result!.indexOf("- [B]");
  assert.ok(posA < posB, "new item should come after existing item");
  assert.ok(result!.includes("*(tool)*\n- [B]"), "new item appended right after last item");
});

test("insertEntry inserts correctly in empty section with placeholder text", () => {
  const content = "## Tools\nContribute here\n\n## Next\n";
  const result = insertEntry(content, "Tools", {
    title: "New",
    link: "https://new.com",
    description: "New item description here for testing",
    type: "tool",
  });
  assert.ok(result !== null);
  const itemLine = "- [New](https://new.com) - New item description here for testing *(tool)*";
  assert.ok(result!.includes(itemLine), "item present");
  const itemEnd = result!.indexOf(itemLine) + itemLine.length;
  assert.equal(result![itemEnd], "\n", "item followed by newline, not concatenated to placeholder");
});
