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
      console.log(`Building single HTML file with ${chapterData.length} chapters...`);

      const tocHtml = chapterData.map(ch =>
        `<li><a href="#${ch.id}">${esc(ch.title)}</a></li>`
      ).join('\n');

      const chaptersHtml = chapterData.map(ch =>
        `<section id="${ch.id}" data-title="${esc(ch.title)}"><h2 class="chapter-title">${esc(ch.title)}</h2><div class="chapter-content">${ch.html}</div></section>`
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
.header{position:sticky;top:0;z-index:100;background:var(--sidebar);border-bottom:1px solid var(--border);padding:10px 20px;display:flex;align-items:center;gap:15px;flex-wrap:wrap}
.header h1{font-size:18px;color:var(--accent);white-space:nowrap}
.search-box{flex:1;min-width:200px;position:relative}
.search-box input{width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:14px}
.search-box input:focus{outline:none;border-color:var(--accent)}
.search-mode{display:flex;gap:5px;align-items:center;font-size:12px}
.search-mode label{display:flex;align-items:center;gap:3px;cursor:pointer}
.controls{display:flex;gap:8px;align-items:center}
.ctrl-btn{background:none;border:1px solid var(--border);padding:6px 10px;border-radius:4px;cursor:pointer;color:var(--text);font-size:12px;font-weight:600;transition:all .2s}
.ctrl-btn:hover{background:var(--accent);color:var(--sidebar);border-color:var(--accent)}
.theme-dot{width:22px;height:22px;border-radius:50%;border:2px solid var(--border);cursor:pointer;transition:all .2s}
.theme-dot:hover{transform:scale(1.1)}
.theme-dot.active{border:3px solid var(--accent)}
.layout{display:flex;max-width:1200px;margin:0 auto}
.sidebar{width:280px;background:var(--sidebar);border-right:1px solid var(--border);padding:20px;position:sticky;top:50px;height:calc(100vh - 50px);overflow-y:auto}
.sidebar h2{font-size:16px;font-weight:700;margin-bottom:15px;color:var(--accent)}
.sidebar-tabs{display:flex;gap:5px;margin-bottom:15px}
.sidebar-tab{flex:1;padding:6px;text-align:center;border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:12px;background:none;color:var(--text)}
.sidebar-tab.active{background:var(--accent);color:var(--sidebar);border-color:var(--accent)}
.sidebar-panel{display:none}
.sidebar-panel.active{display:block}
.toc{list-style:none}
.toc li{margin-bottom:6px}
.toc a{display:block;padding:6px 10px;text-decoration:none;color:var(--text);font-size:13px;line-height:1.4;border-radius:6px;transition:all .2s}
.toc a:hover{background:var(--accent-bg);color:var(--accent)}
.toc a.active{background:var(--accent-bg);color:var(--accent);font-weight:700;border-left:3px solid var(--accent)}
.bookmark-item,.note-item{padding:8px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;font-size:12px;cursor:pointer}
.bookmark-item:hover,.note-item:hover{background:var(--accent-bg)}
.bookmark-item .delete,.note-item .delete{float:right;color:#c00;cursor:pointer;font-weight:700}
.main{flex:1;max-width:800px;margin:0 auto;padding:40px 60px}
.cover{text-align:center;padding:60px 0;border-bottom:3px double var(--accent);margin-bottom:60px}
.cover h1{font-size:2.5em;font-weight:700;margin-bottom:20px;color:var(--accent);font-variant:small-caps}
.cover .subtitle{font-size:1.2em;font-style:italic;margin-bottom:30px;opacity:.8}
.cover .author{font-size:1em;margin-top:40px;letter-spacing:.1em;text-transform:uppercase;opacity:.7}
.cover .edition{font-size:.9em;margin-top:15px;opacity:.5;font-style:italic}
section{margin-bottom:80px;scroll-margin-top:70px}
.chapter-title{font-size:2em;font-weight:700;text-align:center;margin-bottom:40px;color:var(--accent);padding-bottom:20px;border-bottom:2px solid var(--accent)}
.chapter-content{text-align:justify;line-height:1.9;word-break:keep-all;overflow-wrap:normal}
.chapter-content p{margin-bottom:1.2em;text-indent:1.5em;text-align:justify;word-break:keep-all;overflow-wrap:normal}
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
mark{padding:2px 4px;border-radius:3px;cursor:pointer}
mark.yellow{background:#fff59d}
mark.green{background:#a5d6a7}
mark.blue{background:#90caf9}
mark.pink{background:#f48fb1}
mark.orange{background:#ffcc80}
.search-results{position:absolute;top:100%;left:0;right:0;background:var(--sidebar);border:1px solid var(--border);border-radius:6px;max-height:400px;overflow-y:auto;z-index:200;display:none;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.search-result{padding:10px;border-bottom:1px solid var(--border);cursor:pointer;font-size:13px}
.search-result:hover{background:var(--accent-bg)}
.search-result:last-child{border-bottom:none}
.search-result .chapter{font-weight:700;color:var(--accent);font-size:11px;margin-bottom:4px}
.search-result .snippet{color:var(--text);opacity:.8}
.search-result .snippet mark{background:#fff59d;padding:1px 3px;border-radius:2px}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center}
.modal.active{display:flex}
.modal-content{background:var(--sidebar);border:1px solid var(--border);border-radius:8px;padding:30px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto}
.modal-content h2{margin-bottom:20px;color:var(--accent)}
.modal-content input,.modal-content textarea{width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);font-family:inherit;margin-bottom:10px}
.modal-content textarea{min-height:100px;resize:vertical}
.modal-buttons{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
.highlight-popup{position:absolute;background:var(--sidebar);border:1px solid var(--border);border-radius:6px;padding:8px;display:none;z-index:500;box-shadow:0 4px 12px rgba(0,0,0,.2)}
.highlight-popup.active{display:flex;gap:5px}
.highlight-color{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent}
.highlight-color:hover{border-color:var(--text)}
.highlight-color.yellow{background:#fff59d}
.highlight-color.green{background:#a5d6a7}
.highlight-color.blue{background:#90caf9}
.highlight-color.pink{background:#f48fb1}
.highlight-color.orange{background:#ffcc80}
.empty-state{text-align:center;padding:20px;opacity:.5;font-size:13px;font-style:italic}
.chat-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center}
.chat-modal.active{display:flex}
.chat-container{background:var(--sidebar);border:1px solid var(--border);border-radius:8px;width:90%;max-width:600px;height:80vh;display:flex;flex-direction:column}
.chat-header{padding:15px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.chat-header h2{font-size:18px;color:var(--accent);margin:0}
.chat-close{background:none;border:none;font-size:24px;cursor:pointer;color:var(--text);line-height:1}
.chat-messages{flex:1;overflow-y:auto;padding:20px}
.chat-message{margin-bottom:15px;padding:12px 15px;border-radius:8px;max-width:85%}
.chat-message.user{background:var(--accent);color:var(--sidebar);margin-left:auto;border-bottom-right-radius:2px}
.chat-message.assistant{background:var(--bg);color:var(--text);border:1px solid var(--border);border-bottom-left-radius:2px}
.chat-message .citation{display:block;margin-top:8px;font-size:11px;opacity:.7;font-style:italic}
.chat-message .citation a{color:var(--accent);text-decoration:none}
.chat-message .citation a:hover{text-decoration:underline}
.chat-message .actions{display:flex;gap:8px;margin-top:10px}
.chat-message .action-btn{padding:4px 10px;font-size:11px;border:1px solid var(--border);border-radius:4px;background:none;color:var(--text);cursor:pointer;transition:all .2s}
.chat-message .action-btn:hover{background:var(--accent);color:var(--sidebar);border-color:var(--accent)}
mark.ai-highlight{background:#ffd54f;outline:2px solid #ff9800;outline-offset:2px;cursor:pointer;animation:pulse 2s ease-in-out 3}
@keyframes pulse{0%,100%{outline-color:#ff9800}50%{outline-color:#ff5722}}
.ai-highlights-indicator{position:fixed;bottom:20px;left:20px;background:var(--sidebar);border:1px solid var(--border);border-radius:8px;padding:12px 16px;box-shadow:0 4px 12px rgba(0,0,0,.2);z-index:500;display:none;max-width:300px}
.ai-highlights-indicator.active{display:block}
.ai-highlights-indicator h4{font-size:13px;margin-bottom:8px;color:var(--accent)}
.ai-highlights-indicator p{font-size:12px;margin-bottom:10px;line-height:1.4}
.ai-highlights-indicator .indicator-buttons{display:flex;gap:8px}
.ai-highlights-indicator .indicator-btn{padding:5px 12px;font-size:11px;border:1px solid var(--border);border-radius:4px;background:none;color:var(--text);cursor:pointer;transition:all .2s}
.ai-highlights-indicator .indicator-btn:hover{background:var(--accent);color:var(--sidebar);border-color:var(--accent)}
.ai-highlights-indicator .indicator-btn.primary{background:var(--accent);color:var(--sidebar);border-color:var(--accent)}
.chat-input-area{padding:15px 20px;border-top:1px solid var(--border);display:flex;gap:10px}
.chat-input-area textarea{flex:1;padding:10px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-family:inherit;font-size:14px;resize:none;min-height:40px;max-height:100px}
.chat-input-area button{padding:10px 20px;background:var(--accent);color:var(--sidebar);border:none;border-radius:6px;cursor:pointer;font-weight:600;transition:opacity .2s}
.chat-input-area button:hover{opacity:.9}
.chat-input-area button:disabled{opacity:.5;cursor:not-allowed}
.chat-disclaimer{padding:10px 20px;background:var(--accent-bg);font-size:11px;text-align:center;color:var(--text);opacity:.8}
@media(max-width:768px){.sidebar{display:none}.main{padding:20px}.cover h1{font-size:1.8em}.chapter-title{font-size:1.5em}.header{padding:8px 12px}.header h1{font-size:16px}.controls{gap:5px}.ctrl-btn{padding:4px 8px;font-size:11px}.theme-dot{width:18px;height:18px}.chat-container{width:95%;height:90vh}}
</style>
</head>
<body data-theme="sepia">
<div class="header">
<h1>Jose Rizal</h1>
<div class="search-box">
<input type="text" id="searchInput" placeholder="Search the book...">
<div class="search-results" id="searchResults"></div>
</div>
<div class="search-mode">
<label><input type="radio" name="searchMode" value="keyword" checked> Keyword</label>
<label><input type="radio" name="searchMode" value="ai"> AI</label>
</div>
<div class="controls">
<button class="ctrl-btn" onclick="fs(-2)">A-</button>
<span id="fl" style="min-width:25px;text-align:center;font-size:12px">17</span>
<button class="ctrl-btn" onclick="fs(2)">A+</button>
<button class="theme-dot" data-theme="light" style="background:#fff" onclick="st('light')" title="Light"></button>
<button class="theme-dot active" data-theme="sepia" style="background:#faf6ed" onclick="st('sepia')" title="Sepia"></button>
<button class="theme-dot" data-theme="dark" style="background:#1a1a2e" onclick="st('dark')" title="Dark"></button>
<button class="ctrl-btn" onclick="openChat()">Chat</button>
<button class="ctrl-btn" onclick="openSettings()">Settings</button>
<button class="ctrl-btn" onclick="exportData()">Export</button>
<button class="ctrl-btn" onclick="document.getElementById('importFile').click()">Import</button>
<input type="file" id="importFile" accept=".json" style="display:none" onchange="importData(event)">
</div>
</div>
<div class="layout">
<aside class="sidebar">
<div class="sidebar-tabs">
<button class="sidebar-tab active" data-tab="toc" onclick="switchTab('toc')">Contents</button>
<button class="sidebar-tab" data-tab="bookmarks" onclick="switchTab('bookmarks')">Bookmarks</button>
<button class="sidebar-tab" data-tab="notes" onclick="switchTab('notes')">Notes</button>
</div>
<div class="sidebar-panel active" id="tocPanel">
<ol class="toc">${tocHtml}</ol>
</div>
<div class="sidebar-panel" id="bookmarksPanel">
<div id="bookmarksList"></div>
</div>
<div class="sidebar-panel" id="notesPanel">
<div id="notesList"></div>
</div>
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
<div class="highlight-popup" id="highlightPopup">
<div class="highlight-color yellow" onclick="highlightSelection('yellow')"></div>
<div class="highlight-color green" onclick="highlightSelection('green')"></div>
<div class="highlight-color blue" onclick="highlightSelection('blue')"></div>
<div class="highlight-color pink" onclick="highlightSelection('pink')"></div>
<div class="highlight-color orange" onclick="highlightSelection('orange')"></div>
<div class="highlight-color" style="background:#999;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold" onclick="addNoteToSelection()">N</div>
</div>
<div class="modal" id="settingsModal">
<div class="modal-content">
<h2>Settings</h2>
<label style="display:block;margin-bottom:10px;font-size:14px">Gemini API Key (for AI search):</label>
<input type="password" id="apiKeyInput" placeholder="Enter your Gemini API key">
<p style="font-size:12px;opacity:.7;margin-bottom:15px">Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" style="color:var(--accent)">Google AI Studio</a></p>
<div class="modal-buttons">
<button class="ctrl-btn" onclick="closeSettings()">Cancel</button>
<button class="ctrl-btn" onclick="saveApiKey()">Save</button>
</div>
</div>
</div>
<div class="modal" id="noteModal">
<div class="modal-content">
<h2>Add Note</h2>
<textarea id="noteText" placeholder="Enter your note..."></textarea>
<div class="modal-buttons">
<button class="ctrl-btn" onclick="closeNoteModal()">Cancel</button>
<button class="ctrl-btn" onclick="saveNote()">Save</button>
</div>
</div>
</div>
<div class="chat-modal" id="chatModal">
<div class="chat-container">
<div class="chat-header">
<h2>Book Chat</h2>
<button class="chat-close" onclick="closeChat()">&times;</button>
</div>
<div class="chat-disclaimer">Answers are based ONLY on the book content. Ask questions about Jose Rizal's life, works, and writings.</div>
<div class="chat-messages" id="chatMessages">
<div class="chat-message assistant">
Hello! I'm here to help you learn about Jose Rizal based on this book. Ask me anything about his life, works, or the historical context. All my answers come directly from the book content.
</div>
</div>
<div class="chat-input-area">
<textarea id="chatInput" placeholder="Ask a question about the book..." rows="2"></textarea>
<button id="chatSendBtn" onclick="sendChatMessage()">Send</button>
</div>
</div>
</div>
<div class="ai-highlights-indicator" id="aiHighlightsIndicator">
<h4>AI Source Highlights</h4>
<p>The AI has highlighted where it found this information in the book.</p>
<div class="indicator-buttons">
<button class="indicator-btn" onclick="dismissAIHighlights()">Dismiss</button>
<button class="indicator-btn primary" onclick="viewAIHighlights()">View Highlights</button>
</div>
</div>
<script>
// State
let highlights = JSON.parse(localStorage.getItem('highlights') || '[]');
let notes = JSON.parse(localStorage.getItem('notes') || '[]');
let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
let preferences = JSON.parse(localStorage.getItem('preferences') || '{}');
let currentSelection = null;
let currentNoteSelection = null;

// Initialize preferences
if (preferences.theme) {
  document.body.setAttribute('data-theme', preferences.theme);
  document.querySelectorAll('.theme-dot').forEach(function(d) { d.classList.remove('active'); });
  var savedBtn = document.querySelector('.theme-dot[data-theme="' + preferences.theme + '"]');
  if (savedBtn) savedBtn.classList.add('active');
}
if (preferences.fontSize) {
  document.querySelector('.main').style.fontSize = preferences.fontSize + 'px';
  document.getElementById('fl').textContent = preferences.fontSize;
}

// Apply saved highlights
function applyHighlights() {
  highlights.forEach(h => {
    const section = document.getElementById(h.chapterId);
    if (section) {
      const content = section.querySelector('.chapter-content');
      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) {
        const idx = node.textContent.indexOf(h.text);
        if (idx !== -1) {
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + h.text.length);
          const mark = document.createElement('mark');
          mark.className = h.color;
          mark.dataset.highlightId = h.id;
          mark.onclick = function(e) {
            if (confirm('Remove this highlight?')) {
              removeHighlight(h.id);
            }
          };
          range.surroundContents(mark);
          break;
        }
      }
    }
  });
}
applyHighlights();

// Theme
function st(t) {
  document.body.setAttribute('data-theme', t);
  document.querySelectorAll('.theme-dot').forEach(function(d) { d.classList.remove('active'); });
  var btn = document.querySelector('.theme-dot[data-theme="' + t + '"]');
  if (btn) btn.classList.add('active');
  preferences.theme = t;
  localStorage.setItem('preferences', JSON.stringify(preferences));
}

// Font size
var fz = preferences.fontSize || 17;
document.querySelector('.main').style.fontSize = fz + 'px';
document.getElementById('fl').textContent = fz;
function fs(d) {
  fz = Math.max(14, Math.min(22, fz + d));
  document.querySelector('.main').style.fontSize = fz + 'px';
  document.getElementById('fl').textContent = fz;
  preferences.fontSize = fz;
  localStorage.setItem('preferences', JSON.stringify(preferences));
}

// TOC tracking
const sections = document.querySelectorAll('section[id]');
const tocLinks = document.querySelectorAll('.toc a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });
sections.forEach(section => observer.observe(section));

// Sidebar tabs
function switchTab(tab) {
  document.querySelectorAll('.sidebar-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.sidebar-panel').forEach(function(p) { p.classList.remove('active'); });
  var btn = document.querySelector('.sidebar-tab[data-tab="' + tab + '"]');
  if (btn) btn.classList.add('active');
  document.getElementById(tab + 'Panel').classList.add('active');
  if (tab === 'bookmarks') renderBookmarks();
  if (tab === 'notes') renderNotes();
}

// Search
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
let searchTimeout;

searchInput.addEventListener('input', function() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => performSearch(this.value), 300);
});

searchInput.addEventListener('focus', function() {
  if (this.value) performSearch(this.value);
});

document.addEventListener('click', function(e) {
  if (!e.target.closest('.search-box')) {
    searchResults.style.display = 'none';
  }
});

async function performSearch(query) {
  if (!query.trim()) {
    searchResults.style.display = 'none';
    return;
  }
  
  const mode = document.querySelector('input[name="searchMode"]:checked').value;
  
  if (mode === 'ai') {
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
      searchResults.innerHTML = '<div class="search-result">Please add your Gemini API key in settings</div>';
      searchResults.style.display = 'block';
      return;
    }
    await performAISearch(query, apiKey);
  } else {
    performKeywordSearch(query);
  }
}

function performKeywordSearch(query) {
  const keywords = query.toLowerCase().split(/\\s+/).filter(k => k.length > 2);
  const results = [];
  
  sections.forEach(section => {
    const title = section.dataset.title;
    const content = section.querySelector('.chapter-content').textContent;
    const lowerContent = content.toLowerCase();
    
    let matchCount = 0;
    let firstMatch = -1;
    
    keywords.forEach(keyword => {
      const idx = lowerContent.indexOf(keyword);
      if (idx !== -1) {
        matchCount++;
        if (firstMatch === -1) firstMatch = idx;
      }
    });
    
    if (matchCount > 0) {
      const start = Math.max(0, firstMatch - 50);
      const end = Math.min(content.length, firstMatch + 100);
      let snippet = content.substring(start, end);
      if (start > 0) snippet = '...' + snippet;
      if (end < content.length) snippet = snippet + '...';
      
      keywords.forEach(keyword => {
        const regex = new RegExp('(' + keyword + ')', 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');
      });
      
      results.push({
        chapterId: section.id,
        title: title,
        snippet: snippet,
        score: matchCount
      });
    }
  });
  
  results.sort((a, b) => b.score - a.score);
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result">No results found</div>';
  } else {
    searchResults.innerHTML = results.slice(0, 10).map(r =>
      '<div class="search-result" onclick="jumpToChapter(&#39;' + r.chapterId + '&#39;)">' +
      '<div class="chapter">' + r.title + '</div>' +
      '<div class="snippet">' + r.snippet + '</div>' +
      '</div>'
    ).join('');
  }
  searchResults.style.display = 'block';
}

async function performAISearch(query, apiKey) {
  searchResults.innerHTML = '<div class="search-result">Searching with AI...</div>';
  searchResults.style.display = 'block';
  
  try {
    const chaptersText = Array.from(sections).map(s => 
      'CHAPTER: ' + s.dataset.title + '\\n' + s.querySelector('.chapter-content').textContent.substring(0, 2000)
    ).join('\\n\\n');
    
    const prompt = 'You are helping a reader find information in a book about Jose Rizal. Question: "' + query + '"\\n\\nBased on the book content below, identify which chapters contain relevant information and provide a brief answer. Format your response as JSON with "answer" (string) and "chapters" (array of chapter titles).\\n\\n' + chaptersText;
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
      })
    });
    
    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    let result;
    try {
      const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
      result = JSON.parse(jsonMatch[0]);
    } catch (e) {
      result = { answer: text, chapters: [] };
    }
    
    let html = '<div class="search-result" style="cursor:default">';
    html += '<div style="margin-bottom:10px"><strong>AI Answer:</strong><br>' + result.answer + '</div>';
    
    if (result.chapters && result.chapters.length > 0) {
      html += '<div><strong>Relevant Chapters:</strong></div>';
      result.chapters.forEach(chTitle => {
        const section = Array.from(sections).find(s => s.dataset.title.includes(chTitle));
        if (section) {
          html += '<div style="margin-top:5px;padding:5px;background:var(--accent-bg);border-radius:4px;cursor:pointer" onclick="jumpToChapter(&#39;' + section.id + '&#39;)">' + section.dataset.title + '</div>';
        }
      });
    }
    
    html += '</div>';
    searchResults.innerHTML = html;
  } catch (e) {
    searchResults.innerHTML = '<div class="search-result">AI search failed: ' + e.message + '</div>';
  }
}

function jumpToChapter(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  searchResults.style.display = 'none';
  searchInput.value = '';
}

// Chat functionality
let chatHistory = [];

function openChat() {
  document.getElementById('chatModal').classList.add('active');
  document.getElementById('chatInput').focus();
}

function closeChat() {
  document.getElementById('chatModal').classList.remove('active');
}

let aiHighlightElements = [];
let chatMessagePassages = {};
let chatMessageCounter = 0;

function addChatMessage(role, content, citations = [], sourcePassages = []) {
  const messagesDiv = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message ' + role;
  
  let html = content;
  
  // Add citations if provided
  if (citations.length > 0) {
    html += '<span class="citation">Sources: ';
    html += citations.map(function(c) { return '<a href="#' + c.id + '" onclick="event.preventDefault(); jumpToChapter(&#39;' + c.id + '&#39;);">' + c.title + '</a>'; }).join(', ');
    html += '</span>';
  }
  
  // Add action buttons for AI messages
  if (role === 'assistant' && sourcePassages.length > 0) {
    const messageId = 'msg-' + (++chatMessageCounter);
    chatMessagePassages[messageId] = sourcePassages;
    html += '<div class="actions">';
    html += '<button class="action-btn" onclick="showSourceInBook(&#39;' + messageId + '&#39;)">Show in Book</button>';
    html += '</div>';
  }
  
  messageDiv.innerHTML = html;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showSourceInBook(messageId) {
  const passages = chatMessagePassages[messageId];
  if (!passages) return;
  
  // Clear previous AI highlights
  dismissAIHighlights();
  
  // Highlight each passage
  passages.forEach(passage => {
    const section = document.getElementById(passage.chapterId);
    if (!section) return;
    
    const content = section.querySelector('.chapter-content');
    const text = content.textContent;
    const searchText = passage.text;
    
    // Find the text in the content
    const index = text.indexOf(searchText);
    if (index === -1) return;
    
    // Use TreeWalker to find the text node
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
    let node;
    let currentIndex = 0;
    
    while (node = walker.nextNode()) {
      const nodeLength = node.textContent.length;
      
      if (currentIndex + nodeLength > index) {
        // Found the node containing our text
        const startOffset = index - currentIndex;
        const endOffset = Math.min(startOffset + searchText.length, nodeLength);
        
        try {
          const range = document.createRange();
          range.setStart(node, startOffset);
          range.setEnd(node, endOffset);
          
          const mark = document.createElement('mark');
          mark.className = 'ai-highlight';
          mark.onclick = function() {
            if (confirm('Remove this highlight?')) {
              const parent = this.parentNode;
              while (this.firstChild) {
                parent.insertBefore(this.firstChild, this);
              }
              parent.removeChild(this);
              aiHighlightElements = aiHighlightElements.filter(el => el !== this);
              if (aiHighlightElements.length === 0) {
                document.getElementById('aiHighlightsIndicator').classList.remove('active');
              }
            }
          };
          
          range.surroundContents(mark);
          aiHighlightElements.push(mark);
        } catch (e) {
          console.error('Could not highlight:', e);
        }
        
        break;
      }
      
      currentIndex += nodeLength;
    }
  });
  
  // Show indicator (but don't scroll)
  if (aiHighlightElements.length > 0) {
    document.getElementById('aiHighlightsIndicator').classList.add('active');
  }
}

function dismissAIHighlights() {
  aiHighlightElements.forEach(mark => {
    const parent = mark.parentNode;
    if (parent) {
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
    }
  });
  aiHighlightElements = [];
  document.getElementById('aiHighlightsIndicator').classList.remove('active');
}

function viewAIHighlights() {
  if (aiHighlightElements.length > 0) {
    // Scroll to first highlight
    aiHighlightElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Hide indicator after viewing
    document.getElementById('aiHighlightsIndicator').classList.remove('active');
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  const message = input.value.trim();
  
  if (!message) return;
  
  const apiKey = localStorage.getItem('geminiApiKey');
  if (!apiKey) {
    alert('Please add your Gemini API key in Settings to use the chat feature.');
    openSettings();
    return;
  }
  
  // Add user message to UI
  addChatMessage('user', message);
  input.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = 'Thinking...';
  
  // Build conversation history
  chatHistory.push({ role: 'user', content: message });
  
  try {
    // Build book context - include all chapter content
    const bookContext = Array.from(document.querySelectorAll('section[id]')).map(section => {
      const title = section.dataset.title;
      const content = section.querySelector('.chapter-content').textContent;
      return '=== ' + title + ' ===\n' + content;
    }).join('\n\n');
    
    // System prompt - STRICT book-only instruction
    const systemPrompt = 'You are a helpful assistant that answers questions about Jose Rizal based ONLY on the book content provided below.\n\n' +
      'CRITICAL RULES:\n' +
      '1. You must ONLY use information from the book content provided\n' +
      '2. If the answer is not in the book, say "I don\'t have information about that in this book"\n' +
      '3. Always cite which chapter(s) your answer comes from\n' +
      '4. Do not use any external knowledge or make assumptions\n' +
      '5. Be concise but thorough\n' +
      '6. Format your response clearly with chapter citations at the end\n' +
      '7. At the end of your response, include a JSON array called "sourcePassages" with exact quotes from the book that you used. Format: [{"chapterId": "ch1", "text": "exact quote from the book"}]\n\n' +
      'BOOK CONTENT:\n' +
      bookContext + '\n\n' +
      'Respond to the user\'s question using ONLY the information from the book above. Include the sourcePassages JSON at the end.';
    
    // Prepare messages for API
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt + '\n\nUser question: ' + chatHistory[0].content }] }
    ];
    
    // Add conversation history (last 5 exchanges to keep context manageable)
    if (chatHistory.length > 1) {
      const recentHistory = chatHistory.slice(-10);
      let contextMsg = 'Previous conversation:\n';
      recentHistory.forEach(msg => {
        contextMsg += (msg.role === 'user' ? 'User: ' : 'Assistant: ') + msg.content + '\n';
      });
      contextMsg += '\nCurrent question: ' + message;
      messages[0].parts[0].text = systemPrompt + '\n\n' + contextMsg;
    }
    
    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from AI');
    }
    
    let aiResponse = data.candidates[0].content.parts[0].text;
    
    // Extract sourcePassages JSON from response
    let sourcePassages = [];
    const jsonMatch = aiResponse.match(/sourcePassages["\s:]*\[([\s\S]*?)\]/i);
    if (jsonMatch) {
      try {
        const passagesJson = '[' + jsonMatch[1] + ']';
        sourcePassages = JSON.parse(passagesJson);
        // Remove the JSON from the display text
        aiResponse = aiResponse.replace(/sourcePassages["\s:]*\[[\s\S]*?\]/i, '').trim();
      } catch (e) {
        console.error('Failed to parse sourcePassages:', e);
      }
    }
    
    // Extract citations from response
    const citations = [];
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      const title = section.dataset.title;
      if (aiResponse.toLowerCase().includes(title.toLowerCase()) || 
          aiResponse.toLowerCase().includes(title.split(':')[0].toLowerCase())) {
        citations.push({ id: section.id, title: title });
      }
    });
    
    // Add AI response to UI
    addChatMessage('assistant', aiResponse, citations, sourcePassages);
    
    // Add to history
    chatHistory.push({ role: 'assistant', content: aiResponse });
    
  } catch (error) {
    addChatMessage('assistant', 'Sorry, I encountered an error: ' + error.message + '\n\nPlease check your API key in settings and try again.');
    console.error('Chat error:', error);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
}

// Handle Enter key in chat input
document.getElementById('chatInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

// Highlighting
document.addEventListener('mouseup', function(e) {
  const selection = window.getSelection();
  if (selection.toString().trim().length > 0 && e.target.closest('.chapter-content')) {
    currentSelection = {
      text: selection.toString(),
      range: selection.getRangeAt(0).cloneRange(),
      chapterId: e.target.closest('section').id
    };
    
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const popup = document.getElementById('highlightPopup');
    popup.style.left = (rect.left + window.scrollX) + 'px';
    popup.style.top = (rect.top + window.scrollY - 40) + 'px';
    popup.classList.add('active');
  } else {
    document.getElementById('highlightPopup').classList.remove('active');
  }
});

function highlightSelection(color) {
  if (!currentSelection) return;
  
  const id = Date.now().toString();
  const highlight = {
    id: id,
    text: currentSelection.text,
    color: color,
    chapterId: currentSelection.chapterId,
    timestamp: Date.now()
  };
  
  highlights.push(highlight);
  localStorage.setItem('highlights', JSON.stringify(highlights));
  
  try {
    const mark = document.createElement('mark');
    mark.className = color;
    mark.dataset.highlightId = id;
    mark.onclick = function() {
      if (confirm('Remove this highlight?')) {
        removeHighlight(id);
      }
    };
    currentSelection.range.surroundContents(mark);
  } catch (e) {
    console.error('Could not highlight:', e);
  }
  
  document.getElementById('highlightPopup').classList.remove('active');
  window.getSelection().removeAllRanges();
}

function removeHighlight(id) {
  highlights = highlights.filter(h => h.id !== id);
  localStorage.setItem('highlights', JSON.stringify(highlights));
  
  const mark = document.querySelector('[data-highlight-id="' + id + '"]');
  if (mark) {
    const parent = mark.parentNode;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
  }
}

// Notes
function addNoteToSelection() {
  if (!currentSelection) return;
  currentNoteSelection = currentSelection;
  document.getElementById('highlightPopup').classList.remove('active');
  document.getElementById('noteModal').classList.add('active');
  document.getElementById('noteText').value = '';
  document.getElementById('noteText').focus();
}

function closeNoteModal() {
  document.getElementById('noteModal').classList.remove('active');
  currentNoteSelection = null;
}

function saveNote() {
  const text = document.getElementById('noteText').value.trim();
  if (!text || !currentNoteSelection) return;
  
  const note = {
    id: Date.now().toString(),
    text: text,
    selection: currentNoteSelection.text,
    chapterId: currentNoteSelection.chapterId,
    timestamp: Date.now()
  };
  
  notes.push(note);
  localStorage.setItem('notes', JSON.stringify(notes));
  
  closeNoteModal();
  window.getSelection().removeAllRanges();
}

function renderNotes() {
  const list = document.getElementById('notesList');
  if (notes.length === 0) {
    list.innerHTML = '<div class="empty-state">No notes yet. Select text and click the "N" button to add a note.</div>';
    return;
  }
  
  list.innerHTML = notes.map(n => {
    const section = document.getElementById(n.chapterId);
    const chapterTitle = section ? section.dataset.title : 'Unknown';
    return '<div class="note-item" onclick="jumpToChapter(&#39;' + n.chapterId + '&#39;)">' +
      '<span class="delete" onclick="event.stopPropagation();deleteNote(&#39;' + n.id + '&#39;)">×</span>' +
      '<div style="font-weight:700;color:var(--accent);font-size:11px;margin-bottom:4px">' + chapterTitle + '</div>' +
      '<div style="font-style:italic;opacity:.7;margin-bottom:4px">"' + n.selection.substring(0, 50) + '..."</div>' +
      '<div>' + n.text + '</div>' +
      '</div>';
  }).join('');
}

function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

// Bookmarks
function addBookmark() {
  const activeLink = document.querySelector('.toc a.active');
  if (!activeLink) return;
  
  const id = activeLink.getAttribute('href').substring(1);
  const title = activeLink.textContent;
  
  if (bookmarks.find(b => b.chapterId === id)) {
    alert('Already bookmarked!');
    return;
  }
  
  bookmarks.push({
    id: Date.now().toString(),
    chapterId: id,
    title: title,
    timestamp: Date.now()
  });
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  renderBookmarks();
}

function renderBookmarks() {
  const list = document.getElementById('bookmarksList');
  if (bookmarks.length === 0) {
    list.innerHTML = '<div class="empty-state">No bookmarks yet. Press Ctrl+D while reading to bookmark a chapter.</div>';
    return;
  }
  
  list.innerHTML = bookmarks.map(b =>
    '<div class="bookmark-item" onclick="jumpToChapter(&#39;' + b.chapterId + '&#39;)">' +
    '<span class="delete" onclick="event.stopPropagation();deleteBookmark(&#39;' + b.id + '&#39;)">×</span>' +
    '<div>' + b.title + '</div>' +
    '</div>'
  ).join('');
}

function deleteBookmark(id) {
  bookmarks = bookmarks.filter(b => b.id !== id);
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  renderBookmarks();
}

// Settings
function openSettings() {
  document.getElementById('apiKeyInput').value = localStorage.getItem('geminiApiKey') || '';
  document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('active');
}

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key) {
    localStorage.setItem('geminiApiKey', key);
    alert('API key saved!');
  } else {
    localStorage.removeItem('geminiApiKey');
  }
  closeSettings();
}

// Export/Import
function exportData() {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    highlights: highlights,
    notes: notes,
    bookmarks: bookmarks,
    preferences: preferences
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rizal-annotations-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.highlights) {
        highlights = data.highlights;
        localStorage.setItem('highlights', JSON.stringify(highlights));
      }
      if (data.notes) {
        notes = data.notes;
        localStorage.setItem('notes', JSON.stringify(notes));
      }
      if (data.bookmarks) {
        bookmarks = data.bookmarks;
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      }
      if (data.preferences) {
        preferences = data.preferences;
        localStorage.setItem('preferences', JSON.stringify(preferences));
        location.reload();
      }
      
      alert('Data imported successfully!');
    } catch (e) {
      alert('Failed to import: ' + e.message);
    }
  };
  reader.readAsText(file);
}

// Keyboard shortcut for bookmark
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    addBookmark();
  }
});
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
