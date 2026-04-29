# Playbook

## Purpose

- Optimize for fast discovery and real-world use.

## Curation Rules

- **Preserve links**: Never remove existing resources.
- **Categorize by problem**: Place each link where it’s most useful.
- **One category only**: Choose the most practical fit.
- **Write good descriptions**: Clear, practical, and opinionated (max 110 characters).
- **Always tag types**: Add a type tag at the end of every link.

## Link Format (Required)

- Format:

`- [Resource Name](https://url) - Short practical description *(type)*`

- Example:

`- [Flexbox Froggy](https://flexboxfroggy.com) - Learn Flexbox alignment through an interactive game *(playground)*`

## Choose the right category

> Pick the single category that best matches the **problem the resource solves**, not the resource type. When more than one fits, prefer the most specific subcategory.

| EN | PT-BR | Description |
|----|-------|-------------|
| `Frameworks` | `Frameworks` | Parent group for ready-to-use systems that ship structure and components. Use a subcategory whenever possible. |
| `Frameworks → CSS Frameworks` | `Frameworks → Frameworks CSS` | Class-based or utility-based systems that ship a **complete styling foundation** — grid, typography, components, theming — for any UI (Tailwind, Bulma, Pure.css). Boundary with `UI & Components`: a framework covers the whole interface; libraries focused on a single domain (charts, modals, animations) go to `UI & Components`. |
| `Frameworks → CSS-in-JS` | `Frameworks → CSS-in-JS` | Libraries that author styles inside JavaScript/TypeScript (Vanilla Extract, styled-components). |
| `Tooling` | `Ferramentas` | Parent group for utilities that help build, debug, or transform CSS. Always prefer a subcategory. |
| `Tooling → Style Generators` | `Ferramentas → Geradores de Estilo` | Visual tools that output ready-to-copy CSS via a UI (gradients, shadows, glassmorphism, loaders, custom resets). |
| `Tooling → Utilities` | `Ferramentas → Utilitários` | Standalone workflow helpers that don't generate styles via UI and don't run as a build pipeline: linters, formatters, normalize variants, audit/inspection helpers. Boundary: tools that **output styles via a visual UI** go to `Style Generators`; tools that **transform CSS as a build step** go to `Architecture → CSS Authoring & Build`. |
| `Tooling → Debugging` | `Ferramentas → Depuração (Debug)` | Resources to inspect, audit, or troubleshoot CSS (Can I Use, specificity calculators, DevTools tricks). |
| `Layout & Positioning` | `Layout e Posicionamento` | Anything about Flexbox, Grid, positioning, alignment, and layout mental models. |
| `Animation & Visual Effects` | `Animação e Efeitos Visuais` | Tutorials, techniques, and tools focused on a specific animation or visual effect: transitions, keyframes, scroll-driven animations, easing curves, GPU-friendly tricks. Boundary with `What's New in CSS`: tutorials on **how to use** an effect go here; recap/release-notes/surveys covering **what shipped recently** (even if they include animations) go to `What's New in CSS`. |
| `What's New in CSS` | `Novidades em CSS` | Recap posts, browser release notes, experimental/behind-flag features, and survey articles from roughly the last 12 months covering **what shipped or is shipping** across CSS. Boundary: focused tutorials on a single technique go to the topical category (animations → `Animation & Visual Effects`; layout → `Layout & Positioning`). When a feature stabilizes and reaches wide support, move it to its topical category (e.g., container queries → `Responsive Design`; cascade layers/nesting → `Architecture → CSS Authoring & Build`). |
| `UI & Components` | `UI e Componentes` | Concrete, drop-in component libraries and pure-CSS UI primitives focused on a **single domain** (charts, modals, tooltips, cards, loaders). Boundary: full styling systems covering an entire UI go to `Frameworks → CSS Frameworks`; theory/governance of design systems goes to `Architecture → Design Systems`. |
| `Forms & UX Patterns` | `Formulários e Padrões de UX` | Form styling, validation states, focus management, and CSS-driven interaction patterns. |
| `Responsive Design` | `Design Responsivo` | Fluid typography, breakpoints, responsive grids, container queries, and adaptive UI strategies. |
| `Architecture` | `Arquitetura` | Parent group for organizing and scaling CSS codebases. Always prefer a subcategory. |
| `Architecture → CSS Authoring & Build` | `Arquitetura → Autoria e Build` | Tools and language features that shape **how CSS is written and transformed** before reaching the browser: preprocessors (Sass), build pipelines (PostCSS, Lightning CSS), and native authoring features that affect cascade and structure (`@layer`, native nesting). Boundary with `Tooling → Utilities`: anything that runs as a build pipeline transforming stylesheets belongs here; standalone helpers without a build step go to Utilities. |
| `Architecture → Naming & Methodologies` | `Arquitetura → Nomenclatura e Metodologias` | Conventions for naming selectors and structured approaches (methodologies) that define how to organize, compose, and reason about CSS at scale. |
| `Architecture → Design Systems` | `Arquitetura → Design Systems` | Theory, governance, and structural artifacts of design systems: tokens, hierarchy, atomic composition, system-level decisions and process. Boundary with `UI & Components`: this is about **how a system is built and reasoned about**; concrete component libraries and primitives ready to drop into a UI go to `UI & Components`. |
| `Architecture → Scaling Strategies` | `Arquitetura → Estratégias de Escala` | Practical playbooks and case studies on keeping CSS maintainable as projects grow: combining methodologies, scoping, namespacing, tokens, and living style guides. Articles describe the **outcome** (how teams scaled), not the methodology itself (which goes to `Naming & Methodologies`). |
| `Performance & Optimization` | `Performance e Otimização` | Critical CSS, render performance, `content-visibility`, PurgeCSS, GPU-friendly animations. |
| `Accessibility (a11y)` | `Acessibilidade (a11y)` | WCAG, focus indicators, contrast, keyboard navigation, and accessible CSS practices. |
| `Learning & References` | `Aprendizado e Referências` | General-purpose learning hubs that span multiple topics (almanacs, course catalogs, podcasts, magazines). |
| `Inspiration` | `Inspiração` | Galleries, awards, and showcases used to spark design ideas, not to teach a specific technique. |

## Allowed Type Tags

> Tags are ordered in this documentation by priority. When in doubt, choose the **first applicable tag from top to bottom**.

### English and Portuguese tags

| EN | PT-BR | Description |
|----|-------|-------------|
| `(video)` | `(vídeo)` | Video content explaining a concept or technique |
| `(podcast)` | `(podcast)` | Audio discussion or interview about CSS topics |
| `(course)` | `(curso)` | Structured learning content with lessons or modules |
| `(playground)` | `(playground)` | Interactive environment to test and experiment |
| `(cheatsheet)` | `(cheatsheet)` | Compact visual quick-reference card |
| `(showcase)` | `(showcase)` | Gallery, award, or curated collection of example sites or work |
| `(guide)` | `(guia)` | Step-by-step explanation of a topic |
| `(reference)` | `(referência)` | Lookup-style resource for quick consultation |
| `(article)` | `(artigo)` | Written content explaining concepts or ideas |
| `(library)` | `(biblioteca)` | Reusable collection of styles, components, or class systems |
| `(tool)` | `(ferramenta)` | Build, inspection, or transformation helper without a more specific tag |