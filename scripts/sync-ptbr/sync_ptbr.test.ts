import { test } from "node:test";
import assert from "node:assert/strict";
import { extractSlots, applySlots, adjustPaths, lineDiff } from "./sync_ptbr.ts";

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head><title>Hello</title></head>
<body>
  <h1 class="sr-only">Awesome CSS</h1>
  <p class="tagline">Curated list</p>
  <input id="search" type="text" placeholder="Search..." />
</body>
</html>`;

test("extractSlots reads htmlLang, title and tagline", () => {
  const slots = extractSlots(SAMPLE_HTML);
  assert.equal(slots.htmlLang, "en");
  assert.equal(slots.title, "Hello");
  assert.equal(slots.tagline, "Curated list");
  assert.equal(slots.searchPlaceholder, "Search...");
});

test("applySlots replaces extracted slots", () => {
  const ptSlots = { htmlLang: "pt-BR", title: "Olá", tagline: "Lista curada" };
  const out = applySlots(SAMPLE_HTML, ptSlots);
  assert.match(out, /<html lang="pt-BR"/);
  assert.match(out, /<title>Olá<\/title>/);
  assert.match(out, /<p class="tagline">Lista curada<\/p>/);
});

test("applySlots is a no-op when slots are empty", () => {
  assert.equal(applySlots(SAMPLE_HTML, {}), SAMPLE_HTML);
});

test("extractSlots + applySlots round-trip preserves structure", () => {
  const slots = extractSlots(SAMPLE_HTML);
  assert.equal(applySlots(SAMPLE_HTML, slots), SAMPLE_HTML);
});

test("adjustPaths prefixes relative paths with ../", () => {
  const html = `<link href="assets/css/style.css"><img src="favicon.png">`;
  const out = adjustPaths(html);
  assert.match(out, /href="\.\.\/assets\/css\/style\.css"/);
  assert.match(out, /src="\.\.\/favicon\.png"/);
});

test("adjustPaths leaves absolute, anchor and parent paths untouched", () => {
  const html = `<a href="https://x.com"><a href="/abs"><a href="#anchor"><a href="../already">`;
  const out = adjustPaths(html);
  assert.match(out, /href="https:\/\/x\.com"/);
  assert.match(out, /href="\/abs"/);
  assert.match(out, /href="#anchor"/);
  assert.match(out, /href="\.\.\/already"/);
});

test("lineDiff returns empty array for identical strings", () => {
  assert.deepEqual(lineDiff("a\nb\nc", "a\nb\nc"), []);
});

test("lineDiff reports differing lines with 1-based numbering", () => {
  const diffs = lineDiff("a\nb\nc", "a\nB\nc");
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].line, 2);
  assert.equal(diffs[0].expected, "b");
  assert.equal(diffs[0].current, "B");
});

test("lineDiff marks missing and extra lines", () => {
  const diffs = lineDiff("a\nb", "a");
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].current, "(missing)");
  assert.equal(diffs[0].expected, "b");

  const extra = lineDiff("a", "a\nb");
  assert.equal(extra.length, 1);
  assert.equal(extra[0].current, "b");
  assert.equal(extra[0].expected, "(remove)");
});
