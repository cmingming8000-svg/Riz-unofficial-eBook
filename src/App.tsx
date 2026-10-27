import { useState, useEffect, useRef } from 'react';
import { bookChapters, type BookChapter } from './generated-book-data';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [activeChapter, setActiveChapter] = useState('');
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!mainRef.current) return;
    const headings = mainRef.current.querySelectorAll('.chapter-heading');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveChapter(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  const themeStyles = {
    light: { bg: '#ffffff', text: '#2c2c2c', sidebar: '#f5f5f5', border: '#e0e0e0', accent: '#8b4513', accentBg: 'rgba(139,69,19,0.08)', headerBg: 'rgba(245,245,245,0.92)' },
    sepia: { bg: '#faf6ed', text: '#3d2b1f', sidebar: '#f5efe0', border: '#d4c5a0', accent: '#8b4513', accentBg: 'rgba(139,69,19,0.08)', headerBg: 'rgba(245,239,224,0.92)' },
    dark: { bg: '#1a1a2e', text: '#e0e0e0', sidebar: '#16213e', border: '#2a2a4a', accent: '#d4a574', accentBg: 'rgba(212,165,116,0.1)', headerBg: 'rgba(22,33,62,0.92)' },
  };

  const t = themeStyles[theme];

  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSidebarOpen(false);
    }
  };

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh', fontFamily: "Georgia, 'Times New Roman', serif", transition: 'background 0.3s, color 0.3s' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: t.headerBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${t.border}`,
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: t.text, fontSize: '20px', borderRadius: '6px' }}
            aria-label="Toggle menu"
          >☰</button>
          <div>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 700, fontFamily: "Georgia, serif" }}>Jose Rizal</h1>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.6 }}>Life, Works, and Writings of a Genius</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} style={{ background: 'none', border: `1px solid ${t.border}`, padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', color: t.text, fontSize: '12px', fontWeight: 'bold' }}>A-</button>
          <span style={{ fontSize: '11px', opacity: 0.6, minWidth: '24px', textAlign: 'center' }}>{fontSize}</span>
          <button onClick={() => setFontSize(Math.min(26, fontSize + 2))} style={{ background: 'none', border: `1px solid ${t.border}`, padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', color: t.text, fontSize: '12px', fontWeight: 'bold' }}>A+</button>
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            {(['light', 'sepia', 'dark'] as const).map((th) => (
              <button key={th} onClick={() => setTheme(th)} style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: theme === th ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                background: th === 'light' ? '#fff' : th === 'sepia' ? '#faf6ed' : '#1a1a2e',
                cursor: 'pointer', padding: 0
              }} title={th} />
            ))}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          position: 'fixed', top: '53px', left: 0, height: 'calc(100vh - 53px)',
          width: '300px', overflowY: 'auto', zIndex: 90,
          background: t.sidebar, borderRight: `1px solid ${t.border}`,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          padding: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', opacity: 0.8 }}>Table of Contents</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {bookChapters.map((ch: BookChapter) => (
              <li key={ch.id} style={{ marginBottom: '2px' }}>
                <button
                  onClick={() => scrollToChapter(ch.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '7px 12px', borderRadius: '6px',
                    background: activeChapter === ch.id ? t.accentBg : 'transparent',
                    border: activeChapter === ch.id ? `3px solid ${t.accent}` : '3px solid transparent',
                    color: t.text, fontSize: '13px', lineHeight: '1.4',
                    cursor: 'pointer', transition: 'all 0.2s',
                    opacity: activeChapter === ch.id ? 1 : 0.7,
                    fontWeight: activeChapter === ch.id ? 600 : 400,
                    fontFamily: "Georgia, serif",
                  }}
                  onMouseEnter={(e) => { if (activeChapter !== ch.id) (e.target as HTMLElement).style.opacity = '1'; }}
                  onMouseLeave={(e) => { if (activeChapter !== ch.id) (e.target as HTMLElement).style.opacity = '0.7'; }}
                >
                  {ch.title}
                </button>
              </li>
            ))}
          </ol>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 80 }} />
        )}

        {/* Main Content */}
        <main ref={mainRef} style={{ flex: 1, maxWidth: '780px', margin: '0 auto', padding: '40px 24px 100px', fontSize: `${fontSize}px`, lineHeight: 1.85 }}>
          {/* Title Page */}
          <div style={{ textAlign: 'center', padding: '60px 0 80px', borderBottom: `2px solid ${t.accent}`, marginBottom: '60px' }}>
            <p style={{ fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.5, marginBottom: '20px' }}>A Digital Edition</p>
            <h1 style={{ fontSize: '2.4em', fontWeight: 700, lineHeight: 1.2, marginBottom: '16px', fontFamily: "Georgia, serif" }}>Jose Rizal</h1>
            <p style={{ fontSize: '1.1em', fontStyle: 'italic', opacity: 0.8, marginBottom: '8px' }}>Life, Works, and Writings of a Genius,<br />Writer, Scientist, and National Hero</p>
            <p style={{ fontSize: '0.85em', opacity: 0.5, marginTop: '30px' }}>Second Edition</p>
            <p style={{ fontSize: '0.95em', opacity: 0.7, marginTop: '8px' }}>by Gregorio F. Zaide &amp; Sonia M. Zaide</p>
          </div>

          {/* Chapters */}
          {bookChapters.map((ch: BookChapter) => (
            <div key={ch.id} className="book-chapter" style={{ marginBottom: '80px' }}>
              <h1
                id={ch.id}
                className="chapter-heading"
                style={{
                  fontSize: '1.8em', fontWeight: 700, lineHeight: 1.2,
                  marginBottom: '1.5em', paddingBottom: '0.4em',
                  borderBottom: `2px solid ${t.accent}`,
                  scrollMarginTop: '80px',
                }}
              >
                {ch.title}
              </h1>
              <div
                className="chapter-body"
                style={{ fontFamily: "Georgia, serif" }}
                dangerouslySetInnerHTML={{ __html: ch.html }}
              />
            </div>
          ))}

          {/* Footer */}
          <footer style={{ borderTop: `1px solid ${t.border}`, paddingTop: '30px', textAlign: 'center', fontSize: '13px', opacity: 0.5 }}>
            <p>Based on "Jose Rizal: Life, Works, and Writings of a Genius, Writer, Scientist, and National Hero"</p>
            <p>2nd Edition by Gregorio F. Zaide and Sonia M. Zaide</p>
          </footer>
        </main>
      </div>

      {/* Inline styles for chapter content */}
      <style>{`
        .chapter-body p {
          margin-bottom: 1.2em;
          text-align: justify;
          hyphens: auto;
        }
        .book-chapter > .chapter-body > p:first-of-type::first-letter {
          font-size: 3.2em;
          float: left;
          line-height: 0.8;
          margin-right: 0.08em;
          margin-top: 0.07em;
          font-weight: 700;
          color: ${t.accent};
        }
        .chapter-body h2 {
          font-size: 1.4em;
          font-weight: 600;
          margin: 2em 0 0.6em;
          line-height: 1.3;
          opacity: 0.9;
        }
        .chapter-body h3 {
          font-size: 1.15em;
          font-weight: 600;
          margin: 1.5em 0 0.5em;
          opacity: 0.85;
        }
        .chapter-body h4 {
          font-size: 1.05em;
          font-weight: 600;
          margin: 1.2em 0 0.4em;
          opacity: 0.8;
        }
        .chapter-body blockquote {
          border-left: 3px solid ${t.accent};
          margin: 1.5em 0;
          padding: 0.8em 1.2em;
          font-style: italic;
          opacity: 0.85;
          background: ${t.accentBg};
          border-radius: 0 8px 8px 0;
        }
        .chapter-body blockquote p {
          text-align: left !important;
          margin-bottom: 0.5em;
        }
        .chapter-body blockquote p:last-child {
          margin-bottom: 0;
        }
        .chapter-body ul, .chapter-body ol {
          margin: 1em 0;
          padding-left: 1.5em;
        }
        .chapter-body li {
          margin-bottom: 0.5em;
          line-height: 1.7;
        }
        .chapter-body strong { font-weight: 700; }
        .chapter-body em { font-style: italic; }
        .chapter-body hr {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, ${t.text}, transparent);
          opacity: 0.15;
          margin: 3em 0;
        }
        .chapter-body a {
          color: ${t.accent};
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
        ::selection { background: rgba(139, 69, 19, 0.2); }
        @media (min-width: 1024px) {
          aside { transform: translateX(0) !important; position: sticky; top: 53px; height: calc(100vh - 53px); }
          main { margin-left: 0; }
        }
        @media (max-width: 640px) {
          .chapter-heading { font-size: 1.4em !important; }
          .chapter-body h2 { font-size: 1.2em; }
          .book-chapter > .chapter-body > p:first-of-type::first-letter { font-size: 2.5em; }
        }
      `}</style>
    </div>
  );
}

export default App;
