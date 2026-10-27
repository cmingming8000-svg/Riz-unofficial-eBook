import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BASE_URL = 'https://raw.githubusercontent.com/cmingming8000-svg/Rizal-md-s/main/New/Rizal-md-s-rizal-book-corrections-245b1';

interface ChapterInfo {
  id: string;
  title: string;
  fileName: string;
}

const chapterList: ChapterInfo[] = [
  { id: 'prologue', title: 'Prologue: Rizal and His Times', fileName: 'PROLOGUE.md' },
  { id: 'ch1', title: 'Chapter 1: Advent of A National Hero', fileName: 'Chapter1.md' },
  { id: 'ch2', title: 'Chapter 2: Childhood Years in Calamba', fileName: 'Chapter2.md' },
  { id: 'ch3', title: 'Chapter 3: Early Education in Calamba and Biñan', fileName: 'Chapter3.md' },
  { id: 'ch4', title: 'Chapter 4: Scholastic Triumphs at Ateneo de Manila (1872-1877)', fileName: 'Chapter4.md' },
  { id: 'ch5', title: 'Chapter 5: Medical Studies at the University of Santo Tomas (1877-1882)', fileName: 'Chapter5.md' },
  { id: 'ch6', title: 'Chapter 6: In Sunny Spain (1882-1885)', fileName: 'Chapter6.md' },
  { id: 'ch7', title: 'Chapter 7: Paris to Berlin (1885-1887)', fileName: 'Chapter7.md' },
  { id: 'ch8', title: 'Chapter 8: Noli Me Tangere Published in Berlin (1887)', fileName: 'Chapter8.md' },
  { id: 'ch9', title: "Chapter 9: Rizal's Grand Tour of Europe with Viola (1887)", fileName: 'Chapter9.md' },
  { id: 'ch10', title: 'Chapter 10: First Homecoming, 1887-88', fileName: 'Chapter10.md' },
  { id: 'ch11', title: 'Chapter 11: In Hong Kong and Macao, 1888', fileName: 'Chapter11.md' },
  { id: 'ch12', title: 'Chapter 12: Romantic Interlude in Japan (1888)', fileName: 'Chapter12.md' },
  { id: 'ch13', title: "Chapter 13: Rizal's Visit to the United States (1888)", fileName: 'Chapter13.md' },
  { id: 'ch14', title: 'Chapter 14: Rizal in London (1888-89)', fileName: 'Chapter14.md' },
  { id: 'ch15', title: "Chapter 15: Rizal's Second Sojourn in Paris and the Universal Exposition of 1889", fileName: 'Chapter15.md' },
  { id: 'ch16', title: 'Chapter 16: In Belgian Brussels (1890)', fileName: 'Chapter16.md' },
  { id: 'ch17', title: 'Chapter 17: Misfortunes in Madrid (1890-91)', fileName: 'Chapter17.md' },
  { id: 'ch18', title: 'Chapter 18: Biarritz Vacation and Romance with Nelly Boustead (1891)', fileName: 'Chapter18.md' },
  { id: 'ch19', title: 'Chapter 19: El Filibusterismo Published in Ghent (1891)', fileName: 'Chapter19.md' },
  { id: 'ch20', title: 'Chapter 20: Ophthalmic Surgeon in Hong Kong (1891-92)', fileName: 'Chapter20.md' },
  { id: 'ch21', title: 'Chapter 21: Second Homecoming and The Liga Filipina', fileName: 'Chapter21.md' },
  { id: 'ch22', title: 'Chapter 22: Exile in Dapitan, 1892-96', fileName: 'Chapter22.md' },
  { id: 'ch23', title: 'Chapter 23: Last Trip Abroad, (1896)', fileName: 'Chapter23.md' },
  { id: 'ch24', title: 'Chapter 24: Last Homecoming and Trial', fileName: 'Chapter24.md' },
  { id: 'ch25', title: 'Chapter 25: Martyrdom at Bagumbayan', fileName: 'Chapter25.md' },
];

function App() {
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');

  const fetchChapter = useCallback(async (index: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/${chapterList[index].fileName}`);
      if (!response.ok) throw new Error('Failed to fetch chapter');
      const text = await response.text();
      setContent(text);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to load chapter. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChapter(currentChapter);
  }, [currentChapter, fetchChapter]);

  const goToChapter = (index: number) => {
    setCurrentChapter(index);
    setSidebarOpen(false);
  };

  const goNext = () => {
    if (currentChapter < chapterList.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const goPrev = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-amber-50 text-amber-950',
    dark: 'bg-gray-900 text-gray-100',
  };

  const themeNavClasses = {
    light: 'bg-gray-50 border-gray-200',
    sepia: 'bg-amber-100/80 border-amber-200',
    dark: 'bg-gray-800 border-gray-700',
  };

  const themeSidebarClasses = {
    light: 'bg-white border-gray-200',
    sepia: 'bg-amber-50 border-amber-200',
    dark: 'bg-gray-800 border-gray-700',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses[theme]}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${themeNavClasses[theme]}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-serif font-bold leading-tight">Jose Rizal</h1>
              <p className="text-xs opacity-60 font-serif">Life, Works, and Writings of a Genius</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm font-serif font-bold">Rizal</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size controls */}
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-sm font-bold"
                title="Decrease font size"
              >
                A-
              </button>
              <span className="text-xs opacity-60 w-8 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-sm font-bold"
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Theme toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded ${theme === 'light' ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                title="Light theme"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded ${theme === 'sepia' ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                title="Sepia theme"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded ${theme === 'dark' ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                title="Dark theme"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-black/5 dark:bg-white/5">
          <div
            className="h-full bg-amber-600 transition-all duration-500"
            style={{ width: `${((currentChapter + 1) / chapterList.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar / Table of Contents */}
        <aside
          className={`fixed lg:sticky top-[60px] left-0 h-[calc(100vh-60px)] w-80 overflow-y-auto z-40 border-r transition-transform duration-300 ${themeSidebarClasses[theme]} ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="p-4">
            <h2 className="font-serif font-bold text-lg mb-4 opacity-80">Table of Contents</h2>
            <ol className="space-y-1">
              {chapterList.map((chapter, index) => (
                <li key={chapter.id}>
                  <button
                    onClick={() => goToChapter(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      index === currentChapter
                        ? 'bg-amber-600/20 text-amber-800 dark:text-amber-200 font-semibold border-l-3 border-amber-600'
                        : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="block leading-snug">{chapter.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Chapter indicator */}
            <div className="mb-8 text-center">
              <span className="inline-block px-4 py-1 rounded-full text-xs font-medium bg-amber-600/10 text-amber-700 dark:text-amber-300">
                {currentChapter + 1} of {chapterList.length}
              </span>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => fetchChapter(currentChapter)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <div
                className="prose prose-lg max-w-none font-serif book-content"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            )}

            {/* Navigation */}
            {!loading && !error && (
              <div className="mt-16 pt-8 border-t border-current/10 flex justify-between items-center">
                <button
                  onClick={goPrev}
                  disabled={currentChapter === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <span className="text-sm opacity-50">
                  {chapterList[currentChapter].title}
                </span>

                <button
                  onClick={goNext}
                  disabled={currentChapter === chapterList.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </article>

          {/* Footer */}
          <footer className="border-t border-current/10 py-8 text-center text-sm opacity-50">
            <p>Based on "Jose Rizal: Life, Works, and Writings of a Genius, Writer, Scientist, and National Hero"</p>
            <p className="mt-1">2nd Edition by Gregorio F. Zaide and Sonia M. Zaide</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
