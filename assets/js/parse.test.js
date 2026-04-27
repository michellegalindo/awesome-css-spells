import { test } from "node:test";
import assert from "node:assert/strict";
import { sliceContent, escapeHtml, highlight, extractItems } from "./parse.js";

test("sliceContent skips Summary and Sumário", () => {
  const md = "# Awesome CSS\n## Summary\n## Sumário\n## Layout\n- item";
  assert.equal(sliceContent(md), "## Layout\n- item");
});

test("sliceContent returns input when no heading matches", () => {
  const md = "no headings here";
  assert.equal(sliceContent(md), md);
});

test("escapeHtml escapes &, <, >, and quotes", () => {
  assert.equal(
    escapeHtml(`<a href="x">&"</a>`),
    "&lt;a href=&quot;x&quot;&gt;&amp;&quot;&lt;/a&gt;"
  );
});

test("highlight wraps matched ranges in <mark>", () => {
  const matches = [{ key: "title", indices: [[0, 2]] }];
  assert.equal(highlight("Hello", matches, "title"), "<mark>Hel</mark>lo");
});

test("highlight escapes content around matches", () => {
  const matches = [{ key: "title", indices: [[1, 1]] }];
  assert.equal(highlight("<a>", matches, "title"), "&lt;<mark>a</mark>&gt;");
});

test("highlight returns escaped text when no match for key", () => {
  const matches = [{ key: "desc", indices: [[0, 0]] }];
  assert.equal(highlight("<x>", matches, "title"), "&lt;x&gt;");
});

test("highlight returns empty escape when text is empty", () => {
  assert.equal(highlight("", null, "title"), "");
});

test("extractItems parses a single section with one entry", () => {
  const md = `## Layout & Positioning
- [Grid Garden](https://example.com) - Learn CSS Grid by playing *(playground)*
`;
  const items = extractItems(md);
  assert.deepEqual(items, [
    {
      title: "Grid Garden",
      url: "https://example.com",
      desc: "Learn CSS Grid by playing",
      tag: "playground",
      section: "Layout & Positioning",
    },
  ]);
});

test("extractItems handles entries without a tag", () => {
  const md = `## Misc
- [Foo](https://foo.com) - Plain description`;
  const [item] = extractItems(md);
  assert.equal(item.tag, null);
  assert.equal(item.desc, "Plain description");
});

test("extractItems tracks section changes across h2 and h3", () => {
  const md = `## A
- [One](https://1.com) - desc one *(guide)*
### B
- [Two](https://2.com) - desc two *(tool)*`;
  const items = extractItems(md);
  assert.equal(items[0].section, "A");
  assert.equal(items[1].section, "B");
});

test("extractItems ignores non-matching lines", () => {
  const md = `## A
random text
- [Ok](https://ok.com) - good description here *(guide)*
not a list item`;
  assert.equal(extractItems(md).length, 1);
});
