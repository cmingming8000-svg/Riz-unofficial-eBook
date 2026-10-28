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

      const chaptersHtml = chapterData.map((ch, idx) =>
        `<div class="chapter" data-chapter="${ch.id}" data-chapter-index="${idx}"><h1 class="chapter-title">${esc(ch.title)}</h1><div class="chapter-content">${ch.html}</div></div>`
      ).join('\n');

      const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Jose Rizal: Life, Works, and Writings of a Genius</title>
<style>
:root{--bg:#f5f1e8;--text:#2c2416;--paper:#faf8f3;--accent:#6b4423;--accent-light:#8b6234;--border:#d4c5a0;--shadow:rgba(44,36,22,.15)}
[data-theme="light"]{--bg:#ffffff;--text:#1a1a1a;--paper:#ffffff;--accent:#4a4a4a;--accent-light:#666666;--border:#e0e0e0;--shadow:rgba(0,0,0,.1)}
[data-theme="dark"]{--bg:#1a1a1a;--text:#e8e8e8;--paper:#2a2a2a;--accent:#c9a882;--accent-light:#d4b896;--border:#3a3a3a;--shadow:rgba(0,0,0,.5)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;overflow:hidden}
body{
  font-family:'Palatino Linotype','Book Antiqua',Palatino,'Times New Roman',serif;
  background:var(--bg);
  color:var(--text);
  transition:background .4s,color .4s;
  -webkit-font-smoothing:antialiased;
  font-size:17px;
}
.book-viewport{
  width:100%;height:100vh;
  position:relative;
  overflow:hidden;
  perspective:1500px;
}
.book-container{
  position:absolute;
  top:0;left:0;right:0;bottom:0;
  max-width:900px;
  margin:0 auto;
  background:var(--paper);
  box-shadow:0 0 60px var(--shadow);
  overflow:hidden;
}
#book-content{
  display:none;
}
#pages-container{
  position:absolute;
  top:0;left:0;right:0;bottom:0;
}
.page{
  position:absolute;
  top:0;left:0;right:0;bottom:0;
  padding:60px 80px 80px;
  overflow:hidden;
  opacity:0;
  pointer-events:none;
  transform-origin:left center;
  transition:transform .5s ease,opacity .3s ease;
  background:var(--paper);
  display:flex;
  flex-direction:column;
}
.page-content{
  flex:1;
  overflow:hidden;
}
.page.active{
  opacity:1;
  pointer-events:auto;
  transform:rotateY(0deg);
}
.page.flip-out{
  animation:flipOut .5s ease forwards;
}
.page.flip-in{
  animation:flipIn .5s ease forwards;
}
@keyframes flipOut{
  0%{transform:rotateY(0);opacity:1}
  100%{transform:rotateY(-90deg);opacity:0}
}
@keyframes flipIn{
  0%{transform:rotateY(90deg);opacity:0}
  100%{transform:rotateY(0);opacity:1}
}
.page.flip-out-rev{animation:flipOutRev .5s ease forwards}
.page.flip-in-rev{animation:flipInRev .5s ease forwards}
@keyframes flipOutRev{
  0%{transform:rotateY(0);opacity:1}
  100%{transform:rotateY(90deg);opacity:0}
}
@keyframes flipInRev{
  0%{transform:rotateY(-90deg);opacity:0}
  100%{transform:rotateY(0);opacity:1}
}
.page-num{
  position:absolute;
  bottom:25px;
  left:0;right:0;
  text-align:center;
  font-size:.8em;
  opacity:.4;
  font-style:italic;
}
.page-content{
  height:100%;
  overflow:hidden;
}
.controls{
  position:fixed;
  top:15px;
  right:15px;
  z-index:1000;
  display:flex;
  gap:8px;
  background:var(--paper);
  padding:8px 12px;
  border-radius:8px;
  box-shadow:0 4px 20px var(--shadow);
  border:1px solid var(--border);
}
.ctrl-btn{
  background:none;
  border:1px solid var(--border);
  padding:5px 10px;
  border-radius:4px;
  cursor:pointer;
  color:var(--text);
  font-size:13px;
  font-weight:600;
  transition:all .2s;
}
.ctrl-btn:hover{background:var(--accent);color:var(--paper);border-color:var(--accent)}
.theme-dot{
  width:22px;height:22px;border-radius:50%;
  border:2px solid var(--border);cursor:pointer;
  transition:all .2s;
}
.theme-dot:hover{transform:scale(1.1)}
.theme-dot.active{border:3px solid var(--accent);box-shadow:0 0 0 2px var(--paper),0 0 0 4px var(--accent)}
.nav-controls{
  position:fixed;
  bottom:15px;
  left:50%;
  transform:translateX(-50%);
  display:flex;
  gap:12px;
  align-items:center;
  background:var(--paper);
  padding:10px 18px;
  border-radius:30px;
  box-shadow:0 4px 20px var(--shadow);
  border:1px solid var(--border);
  z-index:1000;
}
.nav-btn{
  background:none;
  border:2px solid var(--accent);
  width:38px;height:38px;
  border-radius:50%;
  cursor:pointer;
  color:var(--accent);
  font-size:18px;
  font-weight:700;
  transition:all .2s;
  display:flex;
  align-items:center;
  justify-content:center;
}
.nav-btn:hover{background:var(--accent);color:var(--paper)}
.nav-btn:disabled{opacity:.3;cursor:not-allowed}
.page-indicator{
  font-size:13px;
  color:var(--text);
  min-width:70px;
  text-align:center;
  font-weight:600;
}
.book-cover{
  text-align:center;
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  height:100%;
}
.book-cover::before{
  content:'';
  position:absolute;
  top:30px;left:30px;right:30px;bottom:30px;
  border:2px solid var(--accent);
  opacity:.3;
  pointer-events:none;
}
.book-title{
  font-size:2.8em;
  font-weight:700;
  line-height:1.2;
  margin-bottom:20px;
  color:var(--accent);
  letter-spacing:.02em;
  font-variant:small-caps;
}
.book-subtitle{
  font-size:1.2em;
  font-style:italic;
  margin-bottom:30px;
  opacity:.8;
  line-height:1.5;
}
.book-author{
  font-size:1em;
  margin-top:40px;
  letter-spacing:.1em;
  text-transform:uppercase;
  opacity:.7;
}
.book-edition{
  font-size:.85em;
  margin-top:15px;
  opacity:.5;
  font-style:italic;
}
.ornament{
  text-align:center;
  margin:30px 0;
  font-size:1.8em;
  opacity:.3;
  color:var(--accent);
}
.toc-title{
  font-size:1.8em;
  text-align:center;
  margin-bottom:30px;
  color:var(--accent);
  font-variant:small-caps;
  letter-spacing:.1em;
}
.toc-list{
  list-style:none;
  max-width:700px;
  margin:0 auto;
  columns:2;
  column-gap:40px;
}
.toc-item{
  margin-bottom:10px;
  padding:6px 0;
  border-bottom:1px dotted var(--border);
  break-inside:avoid;
}
.toc-item a{
  color:var(--text);
  text-decoration:none;
  transition:color .2s;
  font-size:0.95em;
  cursor:pointer;
  display:block;
}
.toc-item a:hover{color:var(--accent)}
.chapter-title{
  font-size:2em;
  font-weight:700;
  text-align:center;
  margin-bottom:40px;
  color:var(--accent);
  line-height:1.3;
  font-variant:small-caps;
  letter-spacing:.05em;
}
.chapter-title::after{
  content:'❦';
  display:block;
  margin-top:15px;
  font-size:.5em;
  opacity:.4;
}
.chapter-content,
.page-content{
  text-align:justify;
  hyphens:auto;
  line-height:1.9;
  font-size:1.05em;
}
.page-content > *:first-child:not(.chapter-title){
  text-indent:0;
}
.page-content p{
  margin-bottom:1.2em;
  text-indent:1.5em;
}
.chapter-content p{
  margin-bottom:1.2em;
  text-indent:1.5em;
}
.chapter-content p:first-child,
.chapter-content > p:first-of-type{
  text-indent:0;
}
.chapter-content h2{
  font-size:1.5em;
  margin:2em 0 1em;
  color:var(--accent);
  font-weight:600;
  text-align:center;
  font-variant:small-caps;
  letter-spacing:.05em;
}
.chapter-content h3{
  font-size:1.25em;
  margin:1.8em 0 .8em;
  color:var(--accent-light);
  font-weight:600;
  font-style:italic;
}
.chapter-content h4{
  font-size:1.05em;
  margin:1.5em 0 .6em;
  color:var(--accent-light);
  font-weight:600;
}
.chapter-content blockquote{
  margin:1.5em 1.5em;
  padding:.8em 1.2em;
  border-left:4px solid var(--accent);
  background:rgba(107,68,35,.05);
  font-style:italic;
}
.chapter-content blockquote p{
  text-indent:0;
  margin-bottom:.6em;
}
.chapter-content ul,.chapter-content ol{
  margin:1.2em 1.5em;
}
.chapter-content li{
  margin-bottom:.5em;
  line-height:1.7;
}
.chapter-content strong{
  font-weight:700;
  color:var(--accent);
}
.chapter-content em{font-style:italic}
.chapter-content hr{
  border:none;
  height:1px;
  background:linear-gradient(to right,transparent,var(--accent),transparent);
  margin:2.5em 0;
  opacity:.3;
}
.colophon{
  text-align:center;
  font-size:.9em;
  opacity:.6;
  line-height:1.8;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  height:100%;
}
@media(max-width:768px){
  .book-container{box-shadow:none}
  .page{padding:40px 20px 70px}
  .book-title{font-size:1.8em}
  .book-subtitle{font-size:1em}
  .chapter-title{font-size:1.4em;margin-bottom:25px}
  .controls{top:8px;right:8px;padding:6px 10px;gap:5px}
  .ctrl-btn{padding:4px 8px;font-size:11px}
  .theme-dot{width:18px;height:18px}
  .nav-controls{bottom:8px;padding:8px 14px;gap:8px}
  .nav-btn{width:34px;height:34px;font-size:15px}
  .page-indicator{font-size:11px;min-width:55px}
  .book-cover::before{top:15px;left:15px;right:15px;bottom:15px}
  .chapter-content{font-size:.95em;line-height:1.8}
  .chapter-content blockquote{margin:1em .5em;padding:.6em .8em}
  .chapter-content h2{font-size:1.3em}
  .chapter-content h3{font-size:1.15em}
}
@media print{
  .controls,.nav-controls{display:none}
  .book-container{box-shadow:none;max-width:100%}
  .page{position:relative;display:block!important;page-break-after:always;opacity:1;transform:none}
}
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
<div class="controls">
<button class="ctrl-btn" onclick="fs(-2)">A-</button>
<span id="fl" style="min-width:30px;text-align:center">17</span>
<button class="ctrl-btn" onclick="fs(2)">A+</button>
<button class="theme-dot" style="background:#fff" onclick="st('light')" title="Light"></button>
<button class="theme-dot active" style="background:#f5f1e8" onclick="st('sepia')" title="Sepia"></button>
<button class="theme-dot" style="background:#1a1a1a" onclick="st('dark')" title="Dark"></button>
</div>
<div class="book-viewport">
<div class="book-container" id="mc">
<div id="book-content" style="display:none">
<div class="book-cover">
<div class="book-title">Jose Rizal</div>
<div class="book-subtitle">Life, Works, and Writings of a Genius,<br>Writer, Scientist, and National Hero</div>
<div class="ornament">❦</div>
<div class="book-author">Gregorio F. Zaide &amp; Sonia M. Zaide</div>
<div class="book-edition">Second Edition</div>
</div>
<div class="toc-page">
<div class="toc-title">Contents</div>
<ol class="toc-list">${tocHtml.replace(/<li><a href="#([^"]+)" data-target="[^"]+">([^<]+)<\/a><\/li>/g, (match, id, title) => '<li class="toc-item"><a data-chapter="'+id+'">'+title+'</a></li>')}</ol>
</div>
${chaptersHtml}
<div class="colophon">
<div class="ornament">❦</div>
<p>Based on "Jose Rizal: Life, Works, and Writings of a Genius,<br>Writer, Scientist, and National Hero"</p>
<p>Second Edition by Gregorio F. Zaide and Sonia M. Zaide</p>
<p style="margin-top:20px;font-style:italic">A Digital Edition</p>
</div>
</div>
<div id="pages-container"></div>
</div>
</div>
<div class="nav-controls">
<button class="nav-btn" id="prevBtn" onclick="prevPage()">‹</button>
<span class="page-indicator" id="pageIndicator">1 / 1</span>
<button class="nav-btn" id="nextBtn" onclick="nextPage()">›</button>
</div>
<script>
let currentPage = 0;
let totalPages = 0;
let pages = [];
let touchStartX = 0;
let touchEndX = 0;
let isAnimating = false;
let chapterPageMap = {};

function paginateContent() {
  const content = document.getElementById('book-content');
  const container = document.getElementById('pages-container');
  
  // Calculate available page height (viewport minus padding)
  const pageHeight = window.innerHeight - 160;
  const pageWidth = Math.min(740, window.innerWidth - 80);
  
  // Get all content sections
  const cover = content.querySelector('.book-cover');
  const toc = content.querySelector('.toc-page');
  const chapters = Array.from(content.querySelectorAll('.chapter'));
  const colophon = content.querySelector('.colophon');
  
  const allPages = [];
  
  // Add cover
  allPages.push({type: 'cover', html: cover.outerHTML});
  
  // Add TOC
  allPages.push({type: 'toc', html: toc.outerHTML});
  
  // Process each chapter
  chapters.forEach((chapter, chapterIdx) => {
    const chapterId = chapter.getAttribute('data-chapter');
    const title = chapter.querySelector('.chapter-title');
    const contentDiv = chapter.querySelector('.chapter-content');
    
    // Create hidden measurement div
    const measureDiv = document.createElement('div');
    measureDiv.style.cssText = 'position:absolute;visibility:hidden;width:' + pageWidth + 'px;left:-9999px;top:0;';
    document.body.appendChild(measureDiv);
    
    // Measure title height
    const titleClone = title.cloneNode(true);
    measureDiv.appendChild(titleClone);
    const titleHeight = titleClone.offsetHeight + 50;
    
    // Split chapter content into pages
    const elements = Array.from(contentDiv.children);
    let currentPageElements = [];
    let currentHeight = titleHeight;
    let isFirstPage = true;
    
    elements.forEach((el) => {
      const clone = el.cloneNode(true);
      measureDiv.appendChild(clone);
      const elHeight = clone.offsetHeight + 25;
      
      // Check if we need a new page
      if (currentHeight + elHeight > pageHeight && currentPageElements.length > 0) {
        // Save current page
        const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
        allPages.push({
          type: 'chapter',
          chapterId: chapterId,
          chapterIndex: chapterIdx,
          html: (isFirstPage ? title.outerHTML : '') + '<div class="chapter-content">' + pageHtml + '</div>',
          isFirstPage: isFirstPage
        });
        isFirstPage = false;
        
        // Reset for new page
        currentPageElements = [];
        currentHeight = 0;
        measureDiv.innerHTML = '';
        
        // Add current element to new page
        const newClone = el.cloneNode(true);
        measureDiv.appendChild(newClone);
        currentHeight = newClone.offsetHeight + 25;
      } else {
        currentHeight += elHeight;
      }
      
      currentPageElements.push(clone);
    });
    
    // Add final page of chapter
    if (currentPageElements.length > 0) {
      const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
      allPages.push({
        type: 'chapter',
        chapterId: chapterId,
        chapterIndex: chapterIdx,
        html: (isFirstPage ? title.outerHTML : '') + '<div class="chapter-content">' + pageHtml + '</div>',
        isFirstPage: isFirstPage
      });
    }
    
    measureDiv.remove();
  });
  
  // Add colophon
  allPages.push({type: 'colophon', html: colophon.outerHTML});
  
  // Build chapter-to-page mapping
  chapterPageMap = {};
  allPages.forEach((page, idx) => {
    if (page.type === 'chapter' && page.chapterId && !chapterPageMap[page.chapterId]) {
      chapterPageMap[page.chapterId] = idx;
    }
  });
  
  // Create page elements
  container.innerHTML = '';
  allPages.forEach((pageData, idx) => {
    const pageEl = document.createElement('div');
    pageEl.className = 'page';
    pageEl.setAttribute('data-page', idx);
    pageEl.innerHTML = '<div class="page-content">' + pageData.html + '</div><div class="page-num">' + (idx + 1) + '</div>';
    container.appendChild(pageEl);
  });
  
  pages = container.querySelectorAll('.page');
  totalPages = pages.length;
  
  // Show first page
  if (pages.length > 0) {
    pages[0].classList.add('active');
  }
  updatePageIndicator();
  
  // Attach TOC handlers
  attachTocHandlers();
}

function updatePageIndicator() {
  document.getElementById('pageIndicator').textContent = (currentPage + 1) + ' / ' + totalPages;
  document.getElementById('prevBtn').disabled = currentPage === 0;
  document.getElementById('nextBtn').disabled = currentPage === totalPages - 1;
}

function updatePage(direction) {
  if (isAnimating) return;
  isAnimating = true;
  
  const oldPage = pages[currentPage];
  
  pages.forEach((page, idx) => {
    page.classList.remove('active', 'flip-out', 'flip-in', 'flip-out-rev', 'flip-in-rev');
    if (idx === currentPage) {
      page.classList.add('active');
    }
  });
  
  if (direction && oldPage) {
    if (direction === 'next') {
      oldPage.classList.add('flip-out');
      pages[currentPage].classList.add('flip-in');
    } else if (direction === 'prev') {
      oldPage.classList.add('flip-out-rev');
      pages[currentPage].classList.add('flip-in-rev');
    }
  }
  
  updatePageIndicator();
  
  setTimeout(() => {
    isAnimating = false;
    pages.forEach(page => {
      page.classList.remove('flip-out', 'flip-in', 'flip-out-rev', 'flip-in-rev');
    });
  }, 500);
}

function nextPage() {
  if (currentPage < totalPages - 1 && !isAnimating) {
    currentPage++;
    updatePage('next');
  }
}

function prevPage() {
  if (currentPage > 0 && !isAnimating) {
    currentPage--;
    updatePage('prev');
  }
}

function goToChapter(id) {
  if (chapterPageMap[id] !== undefined) {
    const targetPage = chapterPageMap[id];
    if (targetPage !== currentPage) {
      const direction = targetPage > currentPage ? 'next' : 'prev';
      currentPage = targetPage;
      updatePage(direction);
    }
  }
}

// Attach TOC click handlers after pagination
function attachTocHandlers() {
  document.querySelectorAll('.toc-item a[data-chapter]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const chapterId = this.getAttribute('data-chapter');
      if (chapterId && chapterPageMap[chapterId] !== undefined) {
        goToChapter(chapterId);
      }
    });
  });
}

function st(t){
  document.body.setAttribute('data-theme',t);
  document.querySelectorAll('.theme-dot').forEach(function(d){d.classList.remove('active')});
  event.target.classList.add('active');
}

var fz=17;
function fs(d){
  fz=Math.max(14,Math.min(22,fz+d));
  document.getElementById('mc').style.fontSize=fz+'px';
  document.getElementById('fl').textContent=fz;
  // Re-paginate on font size change
  setTimeout(paginateContent, 100);
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextPage();
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevPage();
  }
});

// Touch/swipe navigation
document.addEventListener('touchstart', function(e) {
  touchStartX = e.changedTouches[0].screenX;
}, {passive: true});

document.addEventListener('touchend', function(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, {passive: true});

function handleSwipe() {
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextPage();
    else prevPage();
  }
}

// Click on left/right side of book to navigate
document.querySelector('.book-viewport').addEventListener('click', function(e) {
  if (e.target.closest('.nav-controls') || e.target.closest('.controls') || e.target.closest('a')) return;
  const rect = this.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = rect.width;
  if (x < width * 0.3) prevPage();
  else if (x > width * 0.7) nextPage();
});

// Initialize pagination when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', paginateContent);
} else {
  paginateContent();
}

// Re-paginate on window resize
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(paginateContent, 250);
});
</script>
</body>
</html>`;

      // Write to BOTH root index.html AND dist/index.html
      fs.writeFileSync(path.resolve('index.html'), finalHtml, 'utf-8');
      const distDir = path.resolve('dist');
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, 'index.html'), finalHtml, 'utf-8');
      console.log(`✅ Single HTML file written: index.html (${(finalHtml.length / 1024).toFixed(1)} KB)`);
    }
  };
}
