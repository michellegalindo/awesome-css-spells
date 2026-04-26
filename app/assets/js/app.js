let allItems = [];
let fuse = null;

async function init() {
  const base = location.href.endsWith("/") ? location.href : location.href + "/";
  const res = await fetch(new URL("README.md", base).href);
  if (!res.ok) return;
  const md = await res.text();
  processMarkdown(md);
}

init();

function sliceContent(md) {
  const lines = md.split("\n");
  const skip = new Set(["Awesome CSS", "Summary", "Sumário"]);
  const idx = lines.findIndex((l) => /^#\s/.test(l) && !skip.has(l.replace(/^#\s+/, "").trim()));
  return idx === -1 ? md : lines.slice(idx).join("\n");
}

function processMarkdown(md) {
  document.getElementById("loading").style.display = "none";
  document.getElementById("rendered").classList.remove("hidden");
  const raw = marked.parse(sliceContent(md));
  const processed = raw
    .replace(/<a href="(?!#)([^"]*)"/g, '<a href="$1" target="_blank" rel="noopener"')
    .replace(/<\/a> - /g, "</a><br>")
    .replace(/<em>\(([^)]+)\)<\/em>/g, '<span class="reference-tag">$1</span>');
  document.getElementById("rendered").innerHTML = processed;

  document.querySelectorAll("#rendered li").forEach((li) => {
    const tag = li.querySelector(".reference-tag");
    if (!tag) return;

    const innerA = li.querySelector("a[href]");
    if (!innerA) return;

    const outerA = document.createElement("a");
    outerA.href = innerA.href;
    outerA.target = innerA.target;
    outerA.rel = innerA.rel;

    const title = document.createElement("span");
    title.className = "li-title";
    while (innerA.firstChild) title.appendChild(innerA.firstChild);
    outerA.appendChild(title);
    innerA.remove();

    if (li.firstChild !== tag && li.firstChild.nodeName === "BR") {
      outerA.appendChild(li.firstChild);
    }

    const desc = document.createElement("span");
    desc.className = "li-desc";
    while (li.firstChild !== tag) desc.appendChild(li.firstChild);
    if (desc.hasChildNodes()) outerA.appendChild(desc);

    outerA.appendChild(tag);
    li.appendChild(outerA);
  });

  const allHeadings = [...document.querySelectorAll("#rendered h1, #rendered h2")];
  allHeadings.forEach((h) => {
    if (h.tagName === "H1") {
      const h2 = document.createElement("h2");
      h2.innerHTML = h.innerHTML;
      h.replaceWith(h2);
    } else {
      const h3 = document.createElement("h3");
      h3.innerHTML = h.innerHTML;
      h.replaceWith(h3);
    }
  });

  document.querySelectorAll("#rendered h2, #rendered h3").forEach((h) => {
    const id = h.textContent
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    h.id = id;
  });

  buildTOC();

  allItems = extractItems(md);
  buildFuse();

  document.getElementById("stat-links").textContent = allItems.length;
  document.getElementById("stat-sections").textContent = [
    ...document.querySelectorAll("#rendered h2"),
  ].filter((h) => h.textContent.trim() !== "Summary").length;

  document.querySelectorAll("#rendered h2").forEach((h) => {
    const btn = document.createElement("button");
    btn.className = "anchor-copy";
    btn.textContent = "#";
    btn.setAttribute("aria-label", "Copy link to section");
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(`${location.origin}${location.pathname}#${h.id}`).then(() => {
        btn.classList.add("copied");
        setTimeout(() => btn.classList.remove("copied"), 1500);
      });
    });
    h.appendChild(btn);
  });

  document.getElementById("search").disabled = false;
  document.getElementById("search").focus();
}

function buildTOC() {
  const toc = document.getElementById("toc");
  toc.innerHTML = "";
  const sections = [...document.querySelectorAll("#rendered h2, #rendered h3")].filter(
    (h) => h.textContent.trim() !== "Summary"
  );

  sections.forEach((h) => {
    const a = document.createElement("a");
    a.className = h.tagName === "H3" ? "toc-item toc-sub" : "toc-item";
    a.href = "#" + h.id;
    a.textContent = h.textContent;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      clearSearch();
      const top =
        h.getBoundingClientRect().top -
        contentEl.getBoundingClientRect().top +
        contentEl.scrollTop -
        80;
      contentEl.scrollTo({ top, behavior: "smooth" });
    });
    toc.appendChild(a);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          document.querySelectorAll(".toc-item").forEach((a) => a.classList.remove("active"));
          const active = toc.querySelector(`a[href="#${entry.target.id}"]`);
          if (active) {
            active.classList.add("active");
            active.scrollIntoView({ block: "nearest" });
          }
        }
      });
    },
    { rootMargin: "-60px 0px -70% 0px" }
  );

  sections.forEach((h) => observer.observe(h));
}

function extractItems(md) {
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

function buildFuse() {
  fuse = new Fuse(allItems, {
    keys: [
      { name: "title", weight: 0.5 },
      { name: "desc", weight: 0.35 },
      { name: "section", weight: 0.15 },
    ],
    includeMatches: true,
    threshold: 0.35,
    minMatchCharLength: 2,
  });
}

function highlight(text, matches, key) {
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

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const searchInput = document.getElementById("search");
const resultsEl = document.getElementById("results");
const renderedEl = document.getElementById("rendered");
const heroEl = document.getElementById("hero");
const countEl = document.getElementById("search-count");

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  if (!q) {
    clearSearch();
    return;
  }

  const hits = fuse.search(q);
  renderedEl.classList.add("hidden");
  heroEl.classList.add("hidden");
  resultsEl.classList.add("active");

  countEl.innerHTML = `<span class="num">${hits.length}</span> results`;

  if (hits.length === 0) {
    resultsEl.innerHTML = `<div class="no-results"><span class="big">¯\\_(ツ)_/¯</span>No results for "<strong>${escapeHtml(q)}</strong>"</div>`;
    return;
  }

  resultsEl.innerHTML = hits
    .map(({ item, matches }) => {
      const tagHtml = item.tag ? `<span class="reference-tag">${escapeHtml(item.tag)}</span>` : "";
      return `
    <div class="result-item">
      <a class="result-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
        <span class="result-section">${escapeHtml(item.section)}</span>
        <span class="li-title">${highlight(item.title, matches, "title")}</span><br>
        ${item.desc ? `<span class="li-desc">${highlight(item.desc, matches, "desc")}</span>` : ""}
        ${tagHtml}
      </a>
    </div>
  `;
    })
    .join("");
});

function clearSearch() {
  searchInput.value = "";
  resultsEl.classList.remove("active");
  resultsEl.innerHTML = "";
  renderedEl.classList.remove("hidden");
  heroEl.classList.remove("hidden");
  countEl.innerHTML = "";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    clearSearch();
    closeMenu();
  }
});

async function loadContributors() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/michellegalindo/awesome-css/contributors?per_page=30&page=1"
    );
    if (!res.ok) return;
    const contributors = await res.json();
    const el = document.getElementById("contributors");
    el.innerHTML = contributors
      .map(
        (c) => `
      <a class="contributor-avatar" href="${escapeHtml(c.html_url)}" target="_blank" rel="noopener" title="${escapeHtml(c.login)}">
        <img src="${escapeHtml(c.avatar_url)}&s=96" alt="${escapeHtml(c.login)}" width="48" height="48">
      </a>
    `
      )
      .join("");
  } catch (e) {
    console.error("[contributors]", e);
  }
}

loadContributors();

function initConfetti() {
  const el = document.querySelector(".hero-right");
  if (!el) return;

  const colorsDark = ["#fc7972", "#fd76a8", "#f87be6", "#cc8ff7", "#74b9ff", "#55efc4", "#ffeaa7", "#fd79a8"];
  const colorsLight = ["#e03030", "#d4268a", "#b026c4", "#7c3fd4", "#1a6fd4", "#00956b", "#c47a00", "#c4256e"];
  let firing = false;

  function getOrCreateCanvas() {
    let canvas = el.querySelector(".confetti-canvas");
    if (!canvas) {
      canvas = document.createElement("div");
      canvas.className = "confetti-canvas";
      el.appendChild(canvas);
    }
    return canvas;
  }

  function fireworks() {
    const canvas = getOrCreateCanvas();
    const cx = Math.random() * el.offsetWidth;
    const cy = Math.random() * el.offsetHeight;
    const count = 22;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "confetti-particle";

      const isCircle = Math.random() > 0.78;
      const w = 5 + Math.random() * 8;
      const h = isCircle ? w : 2 + Math.random() * 3;
      const palette = document.documentElement.classList.contains("light") ? colorsLight : colorsDark;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const speed = 70 + Math.random() * 110;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const rotate = (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 360);
      const duration = 0.45 + Math.random() * 0.35;

      particle.style.cssText = `
        left:${cx}px;top:${cy}px;
        width:${w}px;height:${h}px;
        background:${color};
        border-radius:${isCircle ? "50%" : "2px"};
        animation-duration:${duration}s;
        --dx:${dx}px;--dy:${dy}px;--rotate:${rotate}deg;
      `;

      canvas.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
    }
  }

  function burst(remaining) {
    if (remaining === 0) {
      firing = false;
      return;
    }
    fireworks();
    setTimeout(() => burst(remaining - 1), 550);
  }

  document.getElementById("confetti-trigger").addEventListener("click", () => {
    if (firing) return;
    firing = true;
    burst(5);
  });
}

initConfetti();

const menuToggleEl = document.getElementById("menu-toggle");
const sidebarEl = document.getElementById("sidebar");
const backdropEl = document.getElementById("sidebar-backdrop");
const glassesEl = document.getElementById("glasses");
let glassesTimeout = null;

function openMenu() {
  sidebarEl.classList.add("open");
  backdropEl.classList.add("visible");
  menuToggleEl.setAttribute("aria-expanded", "true");
  glassesTimeout = setTimeout(() => glassesEl.classList.add("visible"), 320);
}

function closeMenu() {
  clearTimeout(glassesTimeout);
  glassesEl.classList.remove("visible");
  sidebarEl.classList.remove("open");
  backdropEl.classList.remove("visible");
  menuToggleEl.setAttribute("aria-expanded", "false");
}

menuToggleEl.addEventListener("click", () => {
  sidebarEl.classList.contains("open") ? closeMenu() : openMenu();
});

backdropEl.addEventListener("click", closeMenu);

document.getElementById("toc").addEventListener("click", (e) => {
  if (e.target.closest(".toc-item")) closeMenu();
});

const contentEl = document.getElementById("content");
const topbarWrapEl = document.getElementById("topbar-wrap");
let lastScrollY = 0;

contentEl.addEventListener("scroll", () => {
  const y = contentEl.scrollTop;
  if (y > lastScrollY && y > 60) {
    topbarWrapEl.classList.add("topbar--compact");
  } else if (y < lastScrollY) {
    topbarWrapEl.classList.remove("topbar--compact");
  }
  lastScrollY = y;
});

const themeToggleEl = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

const sunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const moonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function applyTheme(theme) {
  if (theme === "light") {
    htmlEl.classList.add("light");
    themeToggleEl.innerHTML = moonSvg;
    themeToggleEl.setAttribute("aria-label", "Switch to dark mode");
    themeToggleEl.setAttribute("aria-pressed", "true");
  } else {
    htmlEl.classList.remove("light");
    themeToggleEl.innerHTML = sunSvg;
    themeToggleEl.setAttribute("aria-label", "Switch to light mode");
    themeToggleEl.setAttribute("aria-pressed", "false");
  }
}

const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme ?? (systemPrefersDark ? "dark" : "light"));

themeToggleEl.addEventListener("click", () => {
  const next = htmlEl.classList.contains("light") ? "dark" : "light";
  localStorage.setItem("theme", next);
  applyTheme(next);
});
