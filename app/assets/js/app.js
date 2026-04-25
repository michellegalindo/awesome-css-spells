let allItems = [];
let fuse = null;

async function init() {
  const res = await fetch('README.md');
  if (!res.ok) return;
  const md = await res.text();
  processMarkdown(md);
}

init();

function sliceContent(md) {
  const lines = md.split('\n');
  const skip = new Set(['Awesome CSS', 'Summary']);
  const idx = lines.findIndex(l => /^#\s/.test(l) && !skip.has(l.replace(/^#\s+/, '').trim()));
  return idx === -1 ? md : lines.slice(idx).join('\n');
}

function processMarkdown(md) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('rendered').classList.remove('hidden');
  const raw = marked.parse(sliceContent(md));
  const processed = raw
    .replace(/<\/a> - /g, ' 🔗</a><br>')
    .replace(/<em>\(([^)]+)\)<\/em>/g, '<span class="reference-tag">$1</span>');
  document.getElementById('rendered').innerHTML = processed;

  document.querySelectorAll('#rendered li').forEach(li => {
    const tag = li.querySelector('.reference-tag');
    if (!tag) return;
    const body = document.createElement('div');
    while (li.firstChild !== tag) body.appendChild(li.firstChild);
    li.insertBefore(body, tag);
  });

  const allHeadings = [...document.querySelectorAll('#rendered h1, #rendered h2')];
  allHeadings.forEach(h => {
    if (h.tagName === 'H1') {
      const h2 = document.createElement('h2');
      h2.innerHTML = h.innerHTML;
      h.replaceWith(h2);
    } else {
      const h3 = document.createElement('h3');
      h3.innerHTML = h.innerHTML;
      h.replaceWith(h3);
    }
  });

  document.querySelectorAll('#rendered h2, #rendered h3').forEach(h => {
    const id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-');
    h.id = id;
  });

  buildTOC();

  allItems = extractItems(md);
  buildFuse();

  document.getElementById('stat-links').textContent = allItems.length;
  document.getElementById('stat-sections').textContent =
    [...document.querySelectorAll('#rendered h2')].filter(h => h.textContent.trim() !== 'Summary').length;

  document.getElementById('search').disabled = false;
  document.getElementById('search').focus();
}

function buildTOC() {
  const toc = document.getElementById('toc');
  toc.innerHTML = '';
  const sections = [...document.querySelectorAll('#rendered h2, #rendered h3')]
    .filter(h => h.textContent.trim() !== 'Summary');

  sections.forEach(h => {
    const a = document.createElement('a');
    a.className = h.tagName === 'H3' ? 'toc-item toc-sub' : 'toc-item';
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.addEventListener('click', e => {
      e.preventDefault();
      clearSearch();
      const top = h.getBoundingClientRect().top - contentEl.getBoundingClientRect().top + contentEl.scrollTop - 80;
      contentEl.scrollTo({ top, behavior: 'smooth' });
    });
    toc.appendChild(a);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.toc-item').forEach(a => a.classList.remove('active'));
        const active = toc.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) { active.classList.add('active'); active.scrollIntoView({ block:'nearest' }); }
      }
    });
  }, { rootMargin: '-60px 0px -70% 0px' });

  sections.forEach(h => observer.observe(h));
}

function extractItems(md) {
  const items = [];
  let currentSection = '';
  const lines = sliceContent(md).split('\n');
  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      currentSection = h1[1].trim();
      continue;
    }

    const h2 = line.match(/^##\s+(.+)/);
    if (h2) { currentSection = h2[1].trim(); continue; }

    const m = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)(.*)/);
    if (m) {
      const desc = m[3].replace(/^\s*[-–—]\s*/, '').trim();
      items.push({ title: m[1], url: m[2], desc, section: currentSection });
    }
  }
  return items;
}

function buildFuse() {
  fuse = new Fuse(allItems, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'desc', weight: 0.35 },
      { name: 'section', weight: 0.15 }
    ],
    includeMatches: true,
    threshold: 0.35,
    minMatchCharLength: 2,
  });
}

function highlight(text, matches, key) {
  if (!matches || !text) return escapeHtml(text || '');
  const m = matches.find(m => m.key === key);
  if (!m) return escapeHtml(text);
  let result = '';
  let lastIdx = 0;
  for (const [start, end] of m.indices) {
    result += escapeHtml(text.slice(lastIdx, start));
    result += '<mark>' + escapeHtml(text.slice(start, end + 1)) + '</mark>';
    lastIdx = end + 1;
  }
  result += escapeHtml(text.slice(lastIdx));
  return result;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const searchInput = document.getElementById('search');
const resultsEl = document.getElementById('results');
const renderedEl = document.getElementById('rendered');
const heroEl = document.getElementById('hero');
const countEl = document.getElementById('search-count');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  if (!q) { clearSearch(); return; }

  const hits = fuse.search(q);
  renderedEl.classList.add('hidden');
  heroEl.classList.add('hidden');
  resultsEl.classList.add('active');

  countEl.innerHTML = `<span class="num">${hits.length}</span> results`;

  if (hits.length === 0) {
    resultsEl.innerHTML = `<div class="no-results"><span class="big">¯\\_(ツ)_/¯</span>No results for "<strong>${escapeHtml(q)}</strong>"</div>`;
    return;
  }

  resultsEl.innerHTML = hits.map(({ item, matches }) => `
    <div class="result-item">
      <div class="result-section">${escapeHtml(item.section)}</div>
      <div class="result-title">
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
          ${highlight(item.title, matches, 'title')}
        </a>
      </div>
      ${item.desc ? `<div class="result-desc">${highlight(item.desc, matches, 'desc')}</div>` : ''}
    </div>
  `).join('');
});

function clearSearch() {
  searchInput.value = '';
  resultsEl.classList.remove('active');
  resultsEl.innerHTML = '';
  renderedEl.classList.remove('hidden');
  heroEl.classList.remove('hidden');
  countEl.innerHTML = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') clearSearch(); });

async function loadContributors() {
  try {
    const res = await fetch('https://api.github.com/repos/michellegalindo/awesome-css/contributors?per_page=30&page=1');
    if (!res.ok) return;
    const contributors = await res.json();
    const el = document.getElementById('contributors');
    el.innerHTML = contributors.map(c => `
      <a class="contributor-avatar" href="${escapeHtml(c.html_url)}" target="_blank" rel="noopener" title="${escapeHtml(c.login)}">
        <img src="${escapeHtml(c.avatar_url)}&s=96" alt="${escapeHtml(c.login)}" width="48" height="48">
      </a>
    `).join('');
  } catch (e) {
    console.error('[contributors]', e);
  }
}

loadContributors();

const contentEl = document.getElementById('content');
const topbarWrapEl = document.getElementById('topbar-wrap');
let lastScrollY = 0;

contentEl.addEventListener('scroll', () => {
  const y = contentEl.scrollTop;
  if (y > lastScrollY && y > 60) {
    topbarWrapEl.classList.add('topbar--compact');
  } else if (y < lastScrollY) {
    topbarWrapEl.classList.remove('topbar--compact');
  }
  lastScrollY = y;
});
