import { bookChapters } from './book-data.js';

// Theme management
const themes = {
  light: { bg: '#ffffff', text: '#2c2c2c', sidebar: '#f5f5f5', border: '#e0e0e0', accent: '#8b4513', accentBg: 'rgba(139,69,19,0.08)', headerBg: 'rgba(245,245,245,0.92)' },
  sepia: { bg: '#faf6ed', text: '#3d2b1f', sidebar: '#f5efe0', border: '#d4c5a0', accent: '#8b4513', accentBg: 'rgba(139,69,19,0.08)', headerBg: 'rgba(245,239,224,0.92)' },
  dark: { bg: '#1a1a2e', text: '#e0e0e0', sidebar: '#16213e', border: '#2a2a4a', accent: '#d4a574', accentBg: 'rgba(212,165,116,0.1)', headerBg: 'rgba(22,33,62,0.92)' },
};

let currentTheme = 'sepia';
let currentFontSize = 18;

function setTheme(theme) {
  currentTheme = theme;
  const t = themes[theme];
  const root = document.documentElement;
  root.style.setProperty('--bg', t.bg);
  root.style.setProperty('--text', t.text);
  root.style.setProperty('--sidebar-bg', t.sidebar);
  root.style.setProperty('--border', t.border);
  root.style.setProperty('--accent', t.accent);
  root.style.setProperty('--accent-bg', t.accentBg);
  root.style.setProperty('--header-bg', t.headerBg);
  document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
  document.querySelector(`.theme-dot-${theme}`)?.classList.add('active');
}

function changeFontSize(delta) {
  currentFontSize = Math.max(14, Math.min(26, currentFontSize + delta));
  document.getElementById('mainContent').style.fontSize = currentFontSize + 'px';
  document.getElementById('fontSizeLabel').textContent = currentFontSize;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}

function renderBook() {
  // Build TOC
  const tocList = document.getElementById('tocList');
  bookChapters.forEach(ch => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + ch.id;
    a.textContent = ch.title;
    a.onclick = (e) => {
      e.preventDefault();
      document.getElementById(ch.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.innerWidth < 1024) toggleSidebar();
    };
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // Build chapters
  const content = document.getElementById('bookContent');
  bookChapters.forEach(ch => {
    const section = document.createElement('div');
    section.className = 'chapter';
    section.innerHTML = `
      <h1 class="chapter-heading" id="${ch.id}">${ch.title}</h1>
      <div class="chapter-body">${ch.html}</div>
    `;
    content.appendChild(section);
  });

  // Scroll spy
  const headings = document.querySelectorAll('.chapter-heading');
  const tocLinks = document.querySelectorAll('.toc-list a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.toc-list a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });
  headings.forEach(h => observer.observe(h));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTheme('sepia');
  renderBook();
});

// Export for global access
window.setTheme = setTheme;
window.changeFontSize = changeFontSize;
window.toggleSidebar = toggleSidebar;
