# How to Contribute

Thanks for your interest in contributing to **Awesome CSS**!

To keep the repository organized and useful, please follow these guidelines.

## 1. Adding New Links

Found a great CSS resource? You can add it in one of the following ways:

### 1.1 Using Claude: /auto-tagger skill

To make things easier, an **Auto-Tagger** skill is available. It automatically classifies a link and inserts a properly formatted entry into the correct `README.md`.

```bash
/auto-tagger https://css-tricks.com/snippets/css/a-guide-to-flexbox/
```

> Curation decisions are made by humans. The auto-tagger only handles the mechanical work—classification, tagging, and placement. Please review the output before submitting.

### 1.2 Using the npm script

This script adds a resource based on the information you provide:

```bash
npm run add-resource -- \
  --link "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" \
  --title "A Complete Guide to Flexbox" \
  --description "Visual reference covering all flexbox properties with examples" \
  --category "Layout & Positioning" \
  --tag guide \
  --lang en
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--link` `--title` `--tag` `--category` | yes | — | See [PLAYBOOK.md](.github/PLAYBOOK.md) |
| `--description` `--lang` | no | fetched from URL | Short description and language |

**Automatic behavior:**

- Descriptions over 110 characters will cause an error. Rewrite them concisely and try again.
- If `--lang` is not provided, the script detects it via the HTML lang attribute and Content-Language header. Unsupported languages are rejected.

### 1.3 Manual insert

You can also add entries manually:

- Use `README.md` for English resources
- Use `pt-br/README.md` for Portuguese resources

Follow the existing structure. See [PLAYBOOK.md](.github/PLAYBOOK.md) for details.

## 3. Documentation or Structure Improvements

Pull requests for fixing broken links, improving descriptions, or refining formatting are always welcome!

## 2. Proposing New Categories or Features

Open an [Issue](https://github.com/michellegalindo/awesome-css/issues) to discuss ideas.
