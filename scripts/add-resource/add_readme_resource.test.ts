import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isDescriptionPoor,
  extractMetaDescription,
  detectLangFromResponse,
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
