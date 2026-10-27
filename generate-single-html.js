import fs from 'fs';
import { bookChapters } from './src/generated-book-data.js';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jose Rizal: Life, Works, and Writings of a Genius</title>
    <style>
        :root {
            --bg: #faf6ed;
            --text: #3d2b1f;
            --sidebar-bg: #f5efe0;
            --border: #d4c5a0;
            --accent: #8b4513;
            --accent-light: rgba(139, 69, 19, 0.1);
            --header-bg: rgba(245, 239, 224, 0.95);
        }
        [data-theme="light"] {
            --bg: #ffffff;
            --text: #1a1a1a;
            --sidebar-bg: #f8f8f8;
            --border: #e0e0e0;
            --accent: #8b4513;
            --accent-light: rgba(139, 69, 19, 0.08);
            --header-bg: rgba(248, 248, 248, 0.95);
        }
        [data-theme="dark"] {
            --bg: #1a1a2e;
            --text: #e0e0e0;
            --sidebar-bg: #16213e;
            --border: #2a2a4a;
            --accent: #d4a574;
            --accent-light: rgba(212, 165, 116, 0.1);
            --header-bg: rgba(22, 33, 62, 0.95);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; scroll-padding-top: 80px; }
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.85;
            transition: background 0.3s, color 0.3s;
            -webkit-font-smoothing: antialiased;
        }
        .header {
            position: sticky; top: 0; z-index: 100;
            background: var(--header-bg);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            padding: 10px 20px;
            display: flex; align-items: center; justify-content: space-between;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .menu-btn {
            background: none; border: none; cursor: pointer; padding: 8px;
            color: var(--text); font-size: 20px; border-radius: 6px;
            display: flex; align-items: center;
        }
        .menu-btn:hover { background: var(--accent-light); }
        .header-title h1 { font-size: 15px; font-weight: 700; }
        .header-title p { font-size: 11px; opacity: 0.6; }
        .header-controls { display: flex; align-items: center; gap: 8px; }
        .font-btn {
            background: none; border: 1px solid var(--border); padding: 3px 8px;
            border-radius: 4px; cursor: pointer; color: var(--text);
            font-size: 12px; font-weight: bold;
        }
        .font-btn:hover { background: var(--accent-light); }
        .font-size-label { font-size: 11px; opacity: 0.6; min-width: 24px; text-align: center; }
        .theme-dots { display: flex; gap: 4px; margin-left: 8px; }
        .theme-dot {
            width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--border);
            cursor: pointer; padding: 0; transition: border 0.2s;
        }
        .theme-dot.active { border: 2px solid var(--accent); }
        .layout { display: flex; }
        .sidebar {
            position: fixed; top: 53px; left: 0; height: calc(100vh - 53px);
            width: 300px; overflow-y: auto; z-index: 90;
            background: var(--sidebar-bg); border-right: 1px solid var(--border);
            transform: translateX(-100%); transition: transform 0.3s ease;
            padding: 20px;
        }
        .sidebar.open { transform: translateX(0); }
        .sidebar h2 { font-size: 15px; font-weight: 700; margin-bottom: 16px; opacity: 0.8; }
        .toc-list { list-style: none; }
        .toc-list li { margin-bottom: 2px; }
        .toc-list a {
            display: block; padding: 7px 12px; border-radius: 6px;
            text-decoration: none; color: var(--text); font-size: 13px;
            line-height: 1.4; transition: all 0.2s; opacity: 0.7;
        }
        .toc-list a:hover { background: var(--accent-light); opacity: 1; }
        .toc-list a.active { background: var(--accent-light); opacity: 1; font-weight: 600; border-left: 3px solid var(--accent); }
        .overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.4);
            z-index: 80; display: none;
        }
        .overlay.show { display: block; }
        .main-content {
            flex: 1; max-width: 760px; margin: 0 auto;
            padding: 40px 24px 100px;
        }
        .title-page {
            text-align: center; padding: 60px 0 80px;
            border-bottom: 2px solid var(--accent); margin-bottom: 60px;
        }
        .title-page .label { font-size: 13px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.5; margin-bottom: 20px; }
        .title-page h1 { font-size: 2.4em; font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
        .title-page .subtitle { font-size: 1.1em; font-style: italic; opacity: 0.8; margin-bottom: 8px; }
        .title-page .edition { font-size: 0.85em; opacity: 0.5; margin-top: 30px; }
        .title-page .authors { font-size: 0.95em; opacity: 0.7; margin-top: 8px; }
        .chapter { margin-bottom: 80px; }
        .chapter-heading {
            font-size: 1.8em; font-weight: 700; line-height: 1.2;
            margin-bottom: 1.5em; padding-bottom: 0.4em;
            border-bottom: 2px solid var(--accent);
            scroll-margin-top: 80px;
        }
        .chapter-body h2 {
            font-size: 1.4em; font-weight: 600; margin: 2em 0 0.6em;
            line-height: 1.3; opacity: 0.9;
        }
        .chapter-body h3 {
            font-size: 1.15em; font-weight: 600; margin: 1.5em 0 0.5em;
            opacity: 0.85;
        }
        .chapter-body h4 {
            font-size: 1.05em; font-weight: 600; margin: 1.2em 0 0.4em;
            opacity: 0.8;
        }
        .chapter-body p { margin-bottom: 1.2em; text-align: justify; hyphens: auto; }
        .chapter-body > p:first-of-type::first-letter {
            font-size: 3.2em; float: left; line-height: 0.8;
            margin-right: 0.08em; margin-top: 0.07em;
            font-weight: 700; color: var(--accent);
        }
        .chapter-body blockquote {
            border-left: 3px solid var(--accent);
            margin: 1.5em 0; padding: 0.8em 1.2em;
            font-style: italic; opacity: 0.85;
            background: var(--accent-light);
            border-radius: 0 8px 8px 0;
        }
        .chapter-body blockquote p { text-align: left !important; margin-bottom: 0.5em; }
        .chapter-body blockquote p:last-child { margin-bottom: 0; }
        .chapter-body ul, .chapter-body ol { margin: 1em 0; padding-left: 1.5em; }
        .chapter-body li { margin-bottom: 0.5em; line-height: 1.7; }
        .chapter-body strong { font-weight: 700; }
        .chapter-body em { font-style: italic; }
        .chapter-body hr {
            border: none; height: 1px;
            background: linear-gradient(to right, transparent, var(--text), transparent);
            opacity: 0.15; margin: 3em 0;
        }
        .footer {
            border-top: 1px solid var(--border);
            padding: 30px 20px; text-align: center;
            font-size: 13px; opacity: 0.5;
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
        [data-theme="dark"] ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }
        ::selection { background: rgba(139, 69, 19, 0.2); }
        @media (min-width: 1024px) {
            .sidebar { transform: translateX(0); position: sticky; top: 53px; height: calc(100vh - 53px); }
            .menu-btn { display: none; }
            .overlay { display: none !important; }
        }
        @media (max-width: 640px) {
            .chapter-heading { font-size: 1.4em; }
            .chapter-body h2 { font-size: 1.2em; }
            .chapter-body > p:first-of-type::first-letter { font-size: 2.5em; }
            .title-page h1 { font-size: 1.8em; }
            .header-title p { display: none; }
        }
        @media print {
            .header, .sidebar, .overlay, .menu-btn { display: none !important; }
            .main-content { max-width: none; padding: 20px; }
            .chapter { page-break-before: always; }
        }
    </style>
</head>
<body data-theme="sepia">
    <header class="header">
        <div class="header-left">
            <button class="menu-btn" onclick="toggleSidebar()" aria-label="Toggle menu">☰</button>
            <div class="header-title">
                <h1>Jose Rizal</h1>
                <p>Life, Works, and Writings of a Genius</p>
            </div>
        </div>
        <div class="header-controls">
            <button class="font-btn" onclick="changeFontSize(-2)">A-</button>
            <span class="font-size-label" id="fontSizeLabel">18</span>
            <button class="font-btn" onclick="changeFontSize(2)">A+</button>
            <div class="theme-dots">
                <button class="theme-dot" style="background:#fff" onclick="setTheme('light')" title="Light"></button>
                <button class="theme-dot active" style="background:#faf6ed" onclick="setTheme('sepia')" title="Sepia"></button>
                <button class="theme-dot" style="background:#1a1a2e" onclick="setTheme('dark')" title="Dark"></button>
            </div>
        </div>
    </header>

    <div class="layout">
        <aside class="sidebar" id="sidebar">
            <h2>Table of Contents</h2>
            <ol class="toc-list" id="tocList"></ol>
        </aside>
        <div class="overlay" id="overlay" onclick="toggleSidebar()"></div>

        <main class="main-content" id="mainContent">
            <div class="title-page">
                <p class="label">A Digital Edition</p>
                <h1>Jose Rizal</h1>
                <p class="subtitle">Life, Works, and Writings of a Genius,<br>Writer, Scientist, and National Hero</p>
                <p class="edition">Second Edition</p>
                <p class="authors">by Gregorio F. Zaide &amp; Sonia M. Zaide</p>
            </div>
            <div id="bookContent"></div>
            <footer class="footer">
                <p>Based on "Jose Rizal: Life, Works, and Writings of a Genius, Writer, Scientist, and National Hero"</p>
                <p>2nd Edition by Gregorio F. Zaide and Sonia M. Zaide</p>
            </footer>
        </main>
    </div>

    <script>
        const bookChapters = ${JSON.stringify(bookChapters)};

        function setTheme(theme) {
            document.body.setAttribute('data-theme', theme);
            document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
            event.target.classList.add('active');
        }

        let currentFontSize = 18;
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
            const container = document.getElementById('bookContent');
            const tocList = document.getElementById('tocList');
            
            let html = '';
            let tocHtml = '';
            
            bookChapters.forEach((ch, i) => {
                html += '<div class="chapter" id="' + ch.id + '-section">';
                html += '<h1 class="chapter-heading" id="' + ch.id + '">' + ch.title + '</h1>';
                html += '<div class="chapter-body">' + ch.html + '</div>';
                html += '</div>';
                
                tocHtml += '<li><a href="#' + ch.id + '" onclick="if(window.innerWidth<1024)toggleSidebar()">' + ch.title + '</a></li>';
            });
            
            container.innerHTML = html;
            tocList.innerHTML = tocHtml;
            
            setupScrollSpy();
        }

        function setupScrollSpy() {
            const chapters = document.querySelectorAll('.chapter-heading');
            const links = document.querySelectorAll('.toc-list a');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        links.forEach(l => l.classList.remove('active'));
                        const link = document.querySelector('.toc-list a[href="#' + entry.target.id + '"]');
                        if (link) link.classList.add('active');
                    }
                });
            }, { rootMargin: '-80px 0px -70% 0px' });
            
            chapters.forEach(ch => observer.observe(ch));
        }

        document.addEventListener('DOMContentLoaded', renderBook);
    </script>
</body>
</html>`;

fs.writeFileSync('rizal-book.html', html, 'utf-8');
console.log('✅ Generated rizal-book.html - a single, self-contained HTML file');
console.log('📖 Contains all 26 chapters');
console.log('🎨 Includes themes (light/sepia/dark)');
console.log('📱 Fully responsive');
console.log('🔌 Works completely offline');
