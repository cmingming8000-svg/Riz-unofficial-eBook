import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://raw.githubusercontent.com/cmingming8000-svg/Rizal-md-s/main/New/Rizal-md-s-rizal-book-corrections-245b1';

const chapters = [
  { id: 'prologue', title: 'Prologue: Rizal and His Times', file: 'PROLOGUE.md' },
  { id: 'ch1', title: 'Chapter 1: Advent of A National Hero', file: 'Chapter1.md' },
  { id: 'ch2', title: 'Chapter 2: Childhood Years in Calamba', file: 'Chapter2.md' },
  { id: 'ch3', title: 'Chapter 3: Early Education in Calamba and Biñan', file: 'Chapter3.md' },
  { id: 'ch4', title: 'Chapter 4: Scholastic Triumphs at Ateneo de Manila (1872-1877)', file: 'Chapter4.md' },
  { id: 'ch5', title: 'Chapter 5: Medical Studies at UST (1877-1882)', file: 'Chapter5.md' },
  { id: 'ch6', title: 'Chapter 6: In Sunny Spain (1882-1885)', file: 'Chapter6.md' },
  { id: 'ch7', title: 'Chapter 7: Paris to Berlin (1885-1887)', file: 'Chapter7.md' },
  { id: 'ch8', title: 'Chapter 8: Noli Me Tangere Published in Berlin (1887)', file: 'Chapter8.md' },
  { id: 'ch9', title: "Chapter 9: Rizal's Grand Tour of Europe with Viola (1887)", file: 'Chapter9.md' },
  { id: 'ch10', title: 'Chapter 10: First Homecoming, 1887-88', file: 'Chapter10.md' },
  { id: 'ch11', title: 'Chapter 11: In Hong Kong and Macao, 1888', file: 'Chapter11.md' },
  { id: 'ch12', title: 'Chapter 12: Romantic Interlude in Japan (1888)', file: 'Chapter12.md' },
  { id: 'ch13', title: "Chapter 13: Rizal's Visit to the United States (1888)", file: 'Chapter13.md' },
  { id: 'ch14', title: 'Chapter 14: Rizal in London (1888-89)', file: 'Chapter14.md' },
  { id: 'ch15', title: "Chapter 15: Second Sojourn in Paris and Universal Exposition of 1889", file: 'Chapter15.md' },
  { id: 'ch16', title: 'Chapter 16: In Belgian Brussels (1890)', file: 'Chapter16.md' },
  { id: 'ch17', title: 'Chapter 17: Misfortunes in Madrid (1890-91)', file: 'Chapter17.md' },
  { id: 'ch18', title: 'Chapter 18: Biarritz Vacation and Romance with Nelly Boustead (1891)', file: 'Chapter18.md' },
  { id: 'ch19', title: 'Chapter 19: El Filibusterismo Published in Ghent (1891)', file: 'Chapter19.md' },
  { id: 'ch20', title: 'Chapter 20: Ophthalmic Surgeon in Hong Kong (1891-92)', file: 'Chapter20.md' },
  { id: 'ch21', title: 'Chapter 21: Second Homecoming and The Liga Filipina', file: 'Chapter21.md' },
  { id: 'ch22', title: 'Chapter 22: Exile in Dapitan, 1892-96', file: 'Chapter22.md' },
  { id: 'ch23', title: 'Chapter 23: Last Trip Abroad, (1896)', file: 'Chapter23.md' },
  { id: 'ch24', title: 'Chapter 24: Last Homecoming and Trial', file: 'Chapter24.md' },
  { id: 'ch25', title: 'Chapter 25: Martyrdom at Bagumbayan', file: 'Chapter25.md' },
];

function mdToHtml(md) {
  let html = md;
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/(?:^> .+(?:\n> .+)*\n?)/gm, (match) => {
    const content = match.replace(/^> ?/gm, '').trim();
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    return '<blockquote>' + paragraphs.map(p => `<p>${p.replace(/\n/g, ' ')}</p>`).join('') + '</blockquote>';
  });
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/^---+$/gm, '<hr>');
  html = html.replace(/(?:^- .+$\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });
  html = html.replace(/(?:^\d+\. .+$\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(h[1-6]|blockquote|ul|ol|hr|p)/.test(block)) return block;
    return `<p>${block.replace(/\n/g, ' ')}</p>`;
  }).join('\n');
  return html;
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function rizalBookPlugin() {
  return {
    name: 'rizal-book-plugin',
    enforce: 'pre',
    async closeBundle() {
      console.log('📚 Fetching book chapters from GitHub...');
      const chapterData = [];
      for (const ch of chapters) {
        try {
          const response = await fetch(`${BASE_URL}/${ch.file}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const markdown = await response.text();
          chapterData.push({ id: ch.id, title: ch.title, html: mdToHtml(markdown) });
          console.log(`  ✓ ${ch.title}`);
        } catch (e) {
          console.error(`  ✗ Failed: ${ch.file}: ${e.message}`);
          chapterData.push({ id: ch.id, title: ch.title, html: '<p>Failed to load.</p>' });
        }
      }
      console.log(`📖 Building single HTML file with ${chapterData.length} chapters...`);

      const tocHtml = chapterData.map(ch =>
        `<li><a href="#${ch.id}">${esc(ch.title)}</a></li>`
      ).join('\n');

      const chaptersHtml = chapterData.map(ch =>
        `<section id="${ch.id}"><h2 class="chapter-title">${esc(ch.title)}</h2><div class="chapter-content">${ch.html}</div></section>`
      ).join('\n');

      const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Jose Rizal: Life, Works, and Writings of a Genius</title>
<style>
:root{--bg:#faf6ed;--text:#3d2b1f;--sidebar:#f5efe0;--border:#d4c5a0;--accent:#8b4513;--accent-bg:rgba(139,69,19,.08)}
[data-theme="light"]{--bg:#fff;--text:#2c2c2c;--sidebar:#f5f5f5;--border:#e0e0e0;--accent:#8b4513;--accent-bg:rgba(139,69,19,.08)}
[data-theme="dark"]{--bg:#1a1a2e;--text:#e0e0e0;--sidebar:#16213e;--border:#2a2a4a;--accent:#d4a574;--accent-bg:rgba(212,165,116,.1)}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:Georgia,'Times New Roman',serif;background:var(--bg);color:var(--text);line-height:1.8;transition:background .3s,color .3s}
.controls{position:fixed;top:20px;right:20px;z-index:1000;display:flex;gap:10px;background:var(--sidebar);padding:10px 15px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.15);border:1px solid var(--border)}
.ctrl-btn{background:none;border:1px solid var(--border);padding:6px 12px;border-radius:4px;cursor:pointer;color:var(--text);font-size:13px;font-weight:600;transition:all .2s}
.ctrl-btn:hover{background:var(--accent);color:var(--sidebar);border-color:var(--accent)}
.theme-dot{width:24px;height:24px;border-radius:50%;border:2px solid var(--border);cursor:pointer;transition:all .2s}
.theme-dot:hover{transform:scale(1.1)}
.theme-dot.active{border:3px solid var(--accent)}
.layout{display:flex;max-width:1200px;margin:0 auto}
.sidebar{width:280px;background:var(--sidebar);border-right:1px solid var(--border);padding:20px;position:sticky;top:0;height:100vh;overflow-y:auto}
.sidebar h2{font-size:16px;font-weight:700;margin-bottom:20px;color:var(--accent)}
.toc{list-style:none}
.toc li{margin-bottom:8px}
.toc a{display:block;padding:8px 12px;text-decoration:none;color:var(--text);font-size:14px;line-height:1.4;border-radius:6px;transition:all .2s}
.toc a:hover{background:var(--accent-bg);color:var(--accent)}
.main{flex:1;max-width:800px;margin:0 auto;padding:40px 60px}
.cover{text-align:center;padding:60px 0;border-bottom:3px double var(--accent);margin-bottom:60px}
.cover h1{font-size:2.5em;font-weight:700;margin-bottom:20px;color:var(--accent);font-variant:small-caps}
.cover .subtitle{font-size:1.2em;font-style:italic;margin-bottom:30px;opacity:.8}
.cover .author{font-size:1em;margin-top:40px;letter-spacing:.1em;text-transform:uppercase;opacity:.7}
.cover .edition{font-size:.9em;margin-top:15px;opacity:.5;font-style:italic}
section{margin-bottom:80px;scroll-margin-top:20px}
.chapter-title{font-size:2em;font-weight:700;text-align:center;margin-bottom:40px;color:var(--accent);padding-bottom:20px;border-bottom:2px solid var(--accent)}
.chapter-content{text-align:justify;line-height:1.9;hyphens:auto;-webkit-hyphens:auto;-moz-hyphens:auto;word-wrap:break-word;overflow-wrap:break-word}
.chapter-content p{margin-bottom:1.2em;text-indent:1.5em;text-align:justify;hyphens:auto;-webkit-hyphens:auto;-moz-hyphens:auto}
.chapter-content p:first-of-type{text-indent:0}
.chapter-content p:first-of-type::first-letter{font-size:3em;float:left;line-height:.8;margin-right:.1em;margin-top:.1em;color:var(--accent);font-weight:700}
.chapter-content h2{font-size:1.5em;margin:2em 0 1em;color:var(--accent);text-align:center;font-variant:small-caps}
.chapter-content h3{font-size:1.2em;margin:1.5em 0 .8em;color:var(--accent);font-style:italic}
.chapter-content blockquote{margin:1.5em 2em;padding:1em 1.5em;border-left:4px solid var(--accent);background:var(--accent-bg);font-style:italic}
.chapter-content blockquote p{text-indent:0;margin-bottom:.6em}
.chapter-content ul,.chapter-content ol{margin:1.2em 2em}
.chapter-content li{margin-bottom:.5em;line-height:1.7}
.chapter-content strong{font-weight:700;color:var(--accent)}
.chapter-content em{font-style:italic}
.chapter-content hr{border:none;height:1px;background:linear-gradient(to right,transparent,var(--accent),transparent);margin:2.5em 0;opacity:.3}
.footer{border-top:3px double var(--accent);padding-top:30px;margin-top:60px;text-align:center;font-size:.9em;opacity:.6}
@media(max-width:768px){.sidebar{display:none}.main{padding:20px}.cover h1{font-size:1.8em}.chapter-title{font-size:1.5em}.controls{top:10px;right:10px;padding:8px 12px}.ctrl-btn{padding:5px 10px;font-size:12px}.theme-dot{width:20px;height:20px}}
</style>
</head>
<body data-theme="sepia">
<div class="controls">
<button class="ctrl-btn" onclick="fs(-2)">A-</button>
<span id="fl" style="min-width:30px;text-align:center">17</span>
<button class="ctrl-btn" onclick="fs(2)">A+</button>
<button class="theme-dot" style="background:#fff" onclick="st('light')" title="Light"></button>
<button class="theme-dot active" style="background:#faf6ed" onclick="st('sepia')" title="Sepia"></button>
<button class="theme-dot" style="background:#1a1a2e" onclick="st('dark')" title="Dark"></button>
</div>
<div class="layout">
<aside class="sidebar">
<h2>Contents</h2>
<ol class="toc">${tocHtml}</ol>
</aside>
<main class="main">
<div class="cover">
<h1>Jose Rizal</h1>
<p class="subtitle">Life, Works, and Writings of a Genius,<br>Writer, Scientist, and National Hero</p>
<p class="author">Gregorio F. Zaide &amp; Sonia M. Zaide</p>
<p class="edition">Second Edition</p>
</div>
${chaptersHtml}
<div class="footer">
<p>Based on "Jose Rizal: Life, Works, and Writings of a Genius, Writer, Scientist, and National Hero"</p>
<p>2nd Edition by Gregorio F. Zaide and Sonia M. Zaide</p>
</div>
</main>
</div>
<script>
function st(t){document.body.setAttribute('data-theme',t);document.querySelectorAll('.theme-dot').forEach(function(d){d.classList.remove('active')});event.target.classList.add('active')}
var fz=17;function fs(d){fz=Math.max(14,Math.min(22,fz+d));document.querySelector('.main').style.fontSize=fz+'px';document.getElementById('fl').textContent=fz}
</script>
</body>
</html>`;

      fs.writeFileSync(path.resolve('index.html'), finalHtml, 'utf-8');
      const distDir = path.resolve('dist');
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, 'index.html'), finalHtml, 'utf-8');
      console.log(`✅ Single HTML file written: index.html (${(finalHtml.length / 1024).toFixed(1)} KB)`);
    }
  };
}
