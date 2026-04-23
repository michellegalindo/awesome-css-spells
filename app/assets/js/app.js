let allItems = [];
let fuse = null;

async function init() {
  try {
    const res = await fetch('README.md');
    if (!res.ok) throw new Error('not found');
    const md = await res.text();
    processMarkdown(md);
  } catch {
    processMarkdown(MOCK_MD);
  }
}

init();

function processMarkdown(md) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('rendered').classList.remove('hidden');

  const titleMatch = md.match(/^#\s+(.+)/m);
  const title = titleMatch ? titleMatch[1] : 'README';
  document.getElementById('list-title').textContent = title;
  document.title = title;

  document.getElementById('rendered').innerHTML = marked.parse(md);

  document.querySelectorAll('#rendered h2').forEach(h => {
    const id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-');
    h.id = id;
  });

  buildTOC();

  allItems = extractItems(md);
  buildFuse();

  document.getElementById('stat-links').textContent = allItems.length;
  document.getElementById('stat-sections').textContent =
    document.querySelectorAll('#rendered h2').length;

  document.getElementById('search').disabled = false;
  document.getElementById('search').focus();
}

function buildTOC() {
  const toc = document.getElementById('toc');
  toc.innerHTML = '';
  document.querySelectorAll('#rendered h2').forEach(h => {
    const a = document.createElement('a');
    a.className = 'toc-item';
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.addEventListener('click', e => {
      e.preventDefault();
      clearSearch();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  document.querySelectorAll('#rendered h2').forEach(h => observer.observe(h));
}

function extractItems(md) {
  const items = [];
  let currentSection = '';
  const lines = md.split('\n');
  for (const line of lines) {
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
const countEl = document.getElementById('search-count');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  if (!q) { clearSearch(); return; }

  const hits = fuse.search(q);
  renderedEl.classList.add('hidden');
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
  countEl.innerHTML = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') clearSearch(); });
