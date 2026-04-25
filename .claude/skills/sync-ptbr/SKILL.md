---
name: sync-ptbr
description: Verify and sync pt-br/index.html structure with index.html while preserving Portuguese translations. Use when structural changes were made to index.html that need to be reflected in pt-br/index.html, or to audit divergence between the two files.
---

# Sync PT-BR Index

## Purpose

Keep `pt-br/index.html` structurally in sync with `index.html` (English source of truth) while preserving all Brazilian Portuguese translations.

## How to run

**Check for structural diffs (no writes):**
```bash
npx tsx app/sync_ptbr.ts --dry-run
```

**Apply sync:**
```bash
npx tsx app/sync_ptbr.ts
npm run format
```

**CI / pre-merge check (exits 1 if out of sync):**
```bash
npx tsx app/sync_ptbr.ts --check
```

## What the script does

1. Reads `index.html` as the structural template
2. Extracts named **translation slots** from `pt-br/index.html`
3. Applies the en template + pt-br slot values → generates expected pt-br
4. Compares expected vs current `pt-br/index.html` line by line
5. Reports diffs; writes the synced result unless `--dry-run` or `--check`

## Translation slots (preserved from pt-br)

| Slot | What it covers |
|------|----------------|
| `htmlLang` | `lang` attribute on `<html>` |
| `title` | `<title>` text |
| `h1SrOnly` | `<h1 class="sr-only">` text |
| `statsInner` | `#stats` inner HTML (referências / categorias) |
| `topbarLinksInner` | `#topbar-links` inner HTML (language switcher, inverted) |
| `tagline` | `.tagline` text |
| `loadingText` | `#loading` text |
| `errorInner` | `#error` inner HTML |
| `langsMobileInner` | `#languages-mobile` inner HTML (language switcher, inverted) |

Everything outside these slots is treated as structural and overwritten with the en value.

## Warnings to review

- `slot "X" is identical to English` — the pt-br value was not translated; check if this is intentional
- `slots not found in pt-br` — the slot was added to `index.html` but pt-br doesn't have it yet; add it manually before re-running

## After running sync

1. Review any warnings printed by the script
2. Confirm `npm run format` left no unexpected changes
3. Verify the pt-br page visually if hero or topbar slots changed
