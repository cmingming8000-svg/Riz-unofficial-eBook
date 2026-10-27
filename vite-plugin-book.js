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
        `<li><a href="#${ch.id}" data-target="${ch.id}">${esc(ch.title)}</a></li>`
      ).join('\n');

      const chaptersHtml = chapterData.map(ch =>
        `<div class="ch"><h1 class="ch-heading" id="${ch.id}">${esc(ch.title)}</h1><div class="cb">${ch.html}</div></div>`
      ).join('\n');

      const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Jose Rizal: Life, Works, and Writings of a Genius</title>
<style>
:root{--bg:#faf6ed;--text:#3d2b1f;--sidebar:#f5efe0;--border:#d4c5a0;--accent:#8b4513;--accent-bg:rgba(139,69,19,.08);--header-bg:rgba(245,239,224,.92)}
[data-theme="light"]{--bg:#fff;--text:#2c2c2c;--sidebar:#f5f5f5;--border:#e0e0e0;--accent:#8b4513;--accent-bg:rgba(139,69,19,.08);--header-bg:rgba(245,245,245,.92)}
[data-theme="dark"]{--bg:#1a1a2e;--text:#e0e0e0;--sidebar:#16213e;--border:#2a2a4a;--accent:#d4a574;--accent-bg:rgba(212,165,116,.1);--header-bg:rgba(22,33,62,.92)}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:70px}
body{font-family:Georgia,'Times New Roman',serif;background:var(--bg);color:var(--text);line-height:1.85;transition:background .3s,color .3s;-webkit-font-smoothing:antialiased}
.hdr{position:sticky;top:0;z-index:100;background:var(--header-bg);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:10px 20px;display:flex;align-items:center;justify-content:space-between}
.hdr-l{display:flex;align-items:center;gap:12px}
.menu{background:none;border:none;cursor:pointer;padding:8px;color:var(--text);font-size:20px;border-radius:6px;display:none}
.hdr-t h1{font-size:15px;font-weight:700}
.hdr-t p{font-size:11px;opacity:.6}
.ctrls{display:flex;align-items:center;gap:8px}
.fbtn{background:none;border:1px solid var(--border);padding:3px 8px;border-radius:4px;cursor:pointer;color:var(--text);font-size:12px;font-weight:700}
.fsz{font-size:11px;opacity:.6;min-width:24px;text-align:center}
.dots{display:flex;gap:4px;margin-left:8px}
.dot{width:22px;height:22px;border-radius:50%;border:1px solid var(--border);cursor:pointer;padding:0}
.dot.on{border:2px solid var(--accent)}
.d-l{background:#fff}.d-s{background:#faf6ed}.d-d{background:#1a1a2e}
.wrap{display:flex}
.side{position:fixed;top:53px;left:0;height:calc(100vh - 53px);width:300px;overflow-y:auto;z-index:90;background:var(--sidebar);border-right:1px solid var(--border);transform:translateX(-100%);transition:transform .3s;padding:20px}
.side.open{transform:translateX(0)}
.side h2{font-size:15px;font-weight:700;margin-bottom:16px;opacity:.8}
.toc{list-style:none}
.toc li{margin-bottom:2px}
.toc a{display:block;padding:7px 12px;border-radius:6px;text-decoration:none;color:var(--text);font-size:13px;line-height:1.4;transition:all .2s;opacity:.7;border-left:3px solid transparent}
.toc a:hover{background:var(--accent-bg);opacity:1}
.toc a.on{background:var(--accent-bg);opacity:1;font-weight:600;border-left-color:var(--accent)}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:80;display:none}
.ov.show{display:block}
.main{flex:1;max-width:780px;margin:0 auto;padding:40px 24px 100px;font-size:18px}
.tp{text-align:center;padding:60px 0 80px;border-bottom:2px solid var(--accent);margin-bottom:60px}
.tp .lb{font-size:13px;letter-spacing:3px;text-transform:uppercase;opacity:.5;margin-bottom:20px}
.tp h1{font-size:2.4em;font-weight:700;line-height:1.2;margin-bottom:16px}
.tp .st{font-size:1.1em;font-style:italic;opacity:.8}
.tp .ed{font-size:.85em;opacity:.5;margin-top:30px}
.tp .au{font-size:.95em;opacity:.7;margin-top:8px}
.ch{margin-bottom:80px}
.ch-heading{font-size:1.8em;font-weight:700;line-height:1.2;margin-bottom:1.5em;padding-bottom:.4em;border-bottom:2px solid var(--accent);scroll-margin-top:70px}
.cb h2{font-size:1.4em;font-weight:600;margin:2em 0 .6em;opacity:.9}
.cb h3{font-size:1.15em;font-weight:600;margin:1.5em 0 .5em;opacity:.85}
.cb h4{font-size:1.05em;font-weight:600;margin:1.2em 0 .4em;opacity:.8}
.cb p{margin-bottom:1.2em;text-align:justify;hyphens:auto}
.ch>.cb>p:first-of-type::first-letter{font-size:3.2em;float:left;line-height:.8;margin-right:.08em;margin-top:.07em;font-weight:700;color:var(--accent)}
.cb blockquote{border-left:3px solid var(--accent);margin:1.5em 0;padding:.8em 1.2em;font-style:italic;opacity:.85;background:var(--accent-bg);border-radius:0 8px 8px 0}
.cb blockquote p{text-align:left;margin-bottom:.5em}
.cb blockquote p:last-child{margin-bottom:0}
.cb ul,.cb ol{margin:1em 0;padding-left:1.5em}
.cb li{margin-bottom:.5em;line-height:1.7}
.cb strong{font-weight:700}
.cb em{font-style:italic}
.cb hr{border:none;height:1px;background:linear-gradient(to right,transparent,var(--text),transparent);opacity:.15;margin:3em 0}
.ftr{border-top:1px solid var(--border);padding-top:30px;text-align:center;font-size:13px;opacity:.5}
::-webkit-scrollbar{width:8px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px}
::selection{background:rgba(139,69,19,.2)}
@media(min-width:1024px){.side{transform:translateX(0);position:sticky;top:53px;height:calc(100vh - 53px)}}
@media(max-width:640px){.ch-heading{font-size:1.4em}.cb h2{font-size:1.2em}.ch>.cb>p:first-of-type::first-letter{font-size:2.5em}.tp h1{font-size:1.8em}.hdr-t p{display:none}.menu{display:block}}
@media print{.hdr,.side,.ov,.menu{display:none!important}.main{max-width:none;padding:20px}.ch{page-break-before:always}}
</style>
</head>
<body data-theme="sepia">
<header class="hdr">
<div class="hdr-l">
<button class="menu" onclick="document.getElementById('sb').classList.toggle('open');document.getElementById('ov').classList.toggle('show')" aria-label="Menu">&#9776;</button>
<div class="hdr-t"><h1>Jose Rizal</h1><p>Life, Works, and Writings of a Genius</p></div>
</div>
<div class="ctrls">
<button class="fbtn" onclick="fs(-2)">A-</button>
<span class="fsz" id="fl">18</span>
<button class="fbtn" onclick="fs(2)">A+</button>
<div class="dots">
<button class="dot d-l" onclick="st('light')" title="Light"></button>
<button class="dot d-s on" onclick="st('sepia')" title="Sepia"></button>
<button class="dot d-d" onclick="st('dark')" title="Dark"></button>
</div>
</div>
</header>
<div class="wrap">
<aside class="side" id="sb">
<h2>Table of Contents</h2>
<ol class="toc">${tocHtml}</ol>
</aside>
<div class="ov" id="ov" onclick="document.getElementById('sb').classList.remove('open');this.classList.remove('show')"></div>
<main class="main" id="mc">
<div class="tp">
<p class="lb">A Digital Edition</p>
<h1>Jose Rizal</h1>
<p class="st">Life, Works, and Writings of a Genius,<br>Writer, Scientist, and National Hero</p>
<p class="ed">Second Edition</p>
<p class="au">by Gregorio F. Zaide &amp; Sonia M. Zaide</p>
</div>
${chaptersHtml}
<footer class="ftr">
<p>Based on "Jose Rizal: Life, Works, and Writings of a Genius, Writer, Scientist, and National Hero"</p>
<p>2nd Edition by Gregorio F. Zaide and Sonia M. Zaide</p>
</footer>
</main>
</div>
<script>
function st(t){document.body.setAttribute('data-theme',t);document.querySelectorAll('.dot').forEach(function(d){d.classList.remove('on')});var m={light:'d-l',sepia:'d-s',dark:'d-d'};document.querySelector('.'+m[t]).classList.add('on')}
var fz=18;function fs(d){fz=Math.max(14,Math.min(26,fz+d));document.getElementById('mc').style.fontSize=fz+'px';document.getElementById('fl').textContent=fz}
document.querySelectorAll('.toc a').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var el=document.getElementById(this.getAttribute('data-target'));if(el)el.scrollIntoView({behavior:'smooth',block:'start'});if(window.innerWidth<1024){document.getElementById('sb').classList.remove('open');document.getElementById('ov').classList.remove('show')}})});
var hs=document.querySelectorAll('.ch-heading'),ls=document.querySelectorAll('.toc a');
var ob=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){ls.forEach(function(l){l.classList.remove('on')});var lk=document.querySelector('.toc a[data-target="'+e.target.id+'"]');if(lk)lk.classList.add('on')}})},{rootMargin:'-70px 0px -70% 0px'});
hs.forEach(function(h){ob.observe(h)});
</script>
</body>
</html>`;

      // Write directly to dist/index.html
      const distDir = path.resolve('dist');
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, 'index.html'), finalHtml, 'utf-8');
      console.log(`✅ Single HTML file written: dist/index.html (${(finalHtml.length / 1024).toFixed(1)} KB)`);
    }
  };
}
