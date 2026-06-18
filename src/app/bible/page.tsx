'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, BookOpen,
  Minus, Plus, X, Search, ArrowLeft, ArrowRight,
} from 'lucide-react';

const MAROON = '#5c1a1a';

// ── Types ────────────────────────────────────────────────────────────────────

interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  displayName: string;
}

interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
  abbreviation: string;
}

interface BibleVerse {
  id: number;
  verse: number;
  text: string;
}

interface SearchResult {
  id: number;
  book_id: number;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

type SearchMode = 'similar' | 'exact';
type FontSize   = 'sm' | 'base' | 'lg' | 'xl' | '2xl';

const FONT_SIZES: FontSize[] = ['sm', 'base', 'lg', 'xl', '2xl'];
const fontSizeClass: Record<FontSize, string> = {
  sm:   'text-sm leading-6',
  base: 'text-base leading-7',
  lg:   'text-lg leading-8',
  xl:   'text-xl leading-9',
  '2xl':'text-2xl leading-10',
};

// ── Highlight helper ──────────────────────────────────────────────────────────

function HighlightedText({
  text, query, mode, caseSensitive,
}: { text: string; query: string; mode: SearchMode; caseSensitive: boolean }) {
  if (!query) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = mode === 'exact' ? `\\b${escaped}\\b` : escaped;
  const regex   = new RegExp(`(${pattern})`, caseSensitive ? 'g' : 'gi');
  const parts   = text.split(regex);
  const testRe  = new RegExp(pattern, caseSensitive ? '' : 'i');
  return (
    <>
      {parts.map((part, i) =>
        testRe.test(part)
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded-sm px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BiblePage() {
  const searchParams = useSearchParams();

  // Reader state
  const [versions, setVersions]               = useState<BibleVersion[]>([]);
  const [books, setBooks]                     = useState<BibleBook[]>([]);
  const [verses, setVerses]                   = useState<BibleVerse[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [selectedBook, setSelectedBook]       = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('1');
  const [fontSize, setFontSize]               = useState<FontSize>('base');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  // Nav sheet (mobile)
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [sheetView, setSheetView]   = useState<'book' | 'chapter'>('book');
  const [bookSearch, setBookSearch] = useState('');

  // Search
  const [searchOpen, setSearchOpen]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchMode, setSearchMode]         = useState<SearchMode>('similar');
  const [caseSensitive, setCaseSensitive]   = useState(false);
  const [searchResults, setSearchResults]   = useState<SearchResult[]>([]);
  const [searchTotal, setSearchTotal]       = useState(0);
  const [searchLoading, setSearchLoading]   = useState(false);
  const [searchError, setSearchError]       = useState<string | null>(null);
  const [searchDone, setSearchDone]         = useState(false);
  const [activeResult, setActiveResult]     = useState<SearchResult | null>(null);
  const [resultIndex, setResultIndex]       = useState(0);

  const verseContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef    = useRef<HTMLInputElement>(null);

  // ── Data fetching ───────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/bible/versions')
      .then(r => r.json())
      .then((data: BibleVersion[] | { error: string }) => {
        if (!Array.isArray(data)) {
          setError('Failed to load Bible versions.');
          return;
        }
        setVersions(data);
        const v = searchParams?.get('v');
        const nasb = data.find((ver: BibleVersion) => ver.abbreviation === 'NASB');
        setSelectedVersion(v || nasb?.id?.toString() || data[0]?.id?.toString() || '');
      })
      .catch(() => setError('Failed to load Bible versions.'));
  }, []);

  useEffect(() => {
    if (!selectedVersion) return;
    fetch(`/api/bible/${selectedVersion}/books`)
      .then(r => r.json())
      .then((data: BibleBook[]) => {
        setBooks(data);
        const b = searchParams?.get('b');
        setSelectedBook(b || data[0]?.id?.toString() || '');
      })
      .catch(() => setError('Failed to load books.'));
  }, [selectedVersion]);

  useEffect(() => {
    if (!selectedVersion || !selectedBook || !selectedChapter) return;
    setLoading(true);
    setError(null);
    fetch(`/api/bible/${selectedVersion}/${selectedBook}/${selectedChapter}/verses`)
      .then(r => r.json())
      .then((data: BibleVerse[]) => setVerses(data))
      .catch(() => setError('Failed to load verses.'))
      .finally(() => setLoading(false));
    verseContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedVersion, selectedBook, selectedChapter]);

  // Scroll to highlighted verse after verses load
  useEffect(() => {
    if (!activeResult || loading) return;
    if (
      activeResult.book_id.toString() === selectedBook &&
      activeResult.chapter.toString()  === selectedChapter
    ) {
      requestAnimationFrame(() => {
        document.getElementById(`verse-${activeResult.verse}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [activeResult, verses, loading]);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const currentBook    = books.find(b => b.id.toString() === selectedBook);
  const totalChapters  = currentBook?.chapters ?? 0;
  const currentVersion = versions.find(v => v.id.toString() === selectedVersion);
  const otBooks        = books.filter(b => b.testament === 'OT');
  const ntBooks        = books.filter(b => b.testament === 'NT');
  const filteredOT     = otBooks.filter(b => b.name.toLowerCase().includes(bookSearch.toLowerCase()));
  const filteredNT     = ntBooks.filter(b => b.name.toLowerCase().includes(bookSearch.toLowerCase()));

  const isAtStart = parseInt(selectedChapter) === 1 &&
    books.findIndex(b => b.id.toString() === selectedBook) === 0;
  const isAtEnd = parseInt(selectedChapter) === totalChapters &&
    books.findIndex(b => b.id.toString() === selectedBook) === books.length - 1;

  // ── Navigation ───────────────────────────────────────────────────────────────

  const prevChapter = useCallback(() => {
    const cur = parseInt(selectedChapter);
    if (cur > 1) { setSelectedChapter((cur - 1).toString()); return; }
    const idx = books.findIndex(b => b.id.toString() === selectedBook);
    if (idx > 0) {
      const prev = books[idx - 1];
      setSelectedBook(prev.id.toString());
      setSelectedChapter(prev.chapters.toString());
    }
  }, [selectedChapter, selectedBook, books]);

  const nextChapter = useCallback(() => {
    const cur = parseInt(selectedChapter);
    if (cur < totalChapters) { setSelectedChapter((cur + 1).toString()); return; }
    const idx = books.findIndex(b => b.id.toString() === selectedBook);
    if (idx < books.length - 1) {
      const next = books[idx + 1];
      setSelectedBook(next.id.toString());
      setSelectedChapter('1');
    }
  }, [selectedChapter, selectedBook, totalChapters, books]);

  const selectBook = (bookId: string) => {
    setSelectedBook(bookId);
    setSelectedChapter('1');
    setSheetView('chapter');
  };

  const selectChapter = (ch: number) => {
    setSelectedChapter(ch.toString());
    setSheetOpen(false);
    setSheetView('book');
    setBookSearch('');
  };

  const decreaseFontSize = () => {
    const i = FONT_SIZES.indexOf(fontSize);
    if (i > 0) setFontSize(FONT_SIZES[i - 1]);
  };

  const increaseFontSize = () => {
    const i = FONT_SIZES.indexOf(fontSize);
    if (i < FONT_SIZES.length - 1) setFontSize(FONT_SIZES[i + 1]);
  };

  // ── Search ───────────────────────────────────────────────────────────────────

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim() || !selectedVersion) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchDone(false);
    setActiveResult(null);
    setResultIndex(0);
    try {
      const params = new URLSearchParams({
        version: selectedVersion,
        q: searchQuery,
        mode: searchMode,
        caseSensitive: caseSensitive.toString(),
      });
      const res  = await fetch(`/api/bible/search?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data.results ?? []);
      setSearchTotal(data.total ?? 0);
    } catch (err: any) {
      setSearchError(err.message ?? 'Search failed.');
      setSearchResults([]);
      setSearchTotal(0);
    } finally {
      setSearchLoading(false);
      setSearchDone(true);
    }
  };

  const navigateToResult = (result: SearchResult, index: number) => {
    setSelectedBook(result.book_id.toString());
    setSelectedChapter(result.chapter.toString());
    setActiveResult(result);
    setResultIndex(index);
    setSearchOpen(false);
  };

  const goToPrevResult = () => {
    if (resultIndex <= 0) return;
    const next = resultIndex - 1;
    navigateToResult(searchResults[next], next);
  };

  const goToNextResult = () => {
    if (resultIndex >= searchResults.length - 1) return;
    const next = resultIndex + 1;
    navigateToResult(searchResults[next], next);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-2">

          <button onClick={prevChapter} disabled={isAtStart}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            aria-label="Previous chapter">
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => { setSheetOpen(true); setSheetView('book'); setBookSearch(''); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:cursor-default md:pointer-events-none">
            <BookOpen size={15} className="text-gray-400 dark:text-gray-500 md:hidden" />
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
              {currentBook?.name ?? '—'} {selectedChapter}
            </span>
            <ChevronRight size={14} className="text-gray-400 rotate-90 md:hidden" />
          </button>

          <button onClick={nextChapter} disabled={isAtEnd}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            aria-label="Next chapter">
            <ChevronRight size={20} />
          </button>

          {/* Search button */}
          <button onClick={openSearch}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Search">
            <Search size={18} />
          </button>

          <select value={selectedVersion} onChange={e => setSelectedVersion(e.target.value)}
            className="text-xs font-medium px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none">
            {versions.map(v => <option key={v.id} value={v.id}>{v.abbreviation}</option>)}
          </select>

          <div className="hidden sm:flex items-center gap-0.5 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <button onClick={decreaseFontSize} disabled={fontSize === FONT_SIZES[0]}
              className="px-2 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              aria-label="Decrease font size"><Minus size={14} /></button>
            <span className="text-xs text-gray-500 dark:text-gray-400 px-1 select-none">Aa</span>
            <button onClick={increaseFontSize} disabled={fontSize === FONT_SIZES[FONT_SIZES.length - 1]}
              className="px-2 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              aria-label="Increase font size"><Plus size={14} /></button>
          </div>
        </div>

        {/* Active search result banner */}
        {activeResult && searchResults.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-1.5 flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800/50">
            <span className="text-gray-500 dark:text-gray-400">
              Search: <span className="font-medium text-gray-700 dark:text-gray-300">"{searchQuery}"</span>
              <span className="ml-2 text-gray-400">({resultIndex + 1} of {searchTotal})</span>
            </span>
            <div className="flex items-center gap-1">
              <button onClick={goToPrevResult} disabled={resultIndex === 0}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors text-gray-600 dark:text-gray-300"
                aria-label="Previous result"><ArrowLeft size={14} /></button>
              <button onClick={goToNextResult} disabled={resultIndex >= searchResults.length - 1}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors text-gray-600 dark:text-gray-300"
                aria-label="Next result"><ArrowRight size={14} /></button>
              <button onClick={() => { setActiveResult(null); setSearchResults([]); setSearchDone(false); }}
                className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 dark:text-gray-500"
                aria-label="Clear search"><X size={14} /></button>
              <button onClick={openSearch}
                className="ml-1 px-2 py-0.5 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
                All results
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden max-w-5xl w-full mx-auto">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={bookSearch} onChange={e => setBookSearch(e.target.value)}
                placeholder="Search books…"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1"
                style={{ '--tw-ring-color': MAROON } as React.CSSProperties} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredOT.length > 0 && (
              <div>
                <p className="px-3 pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Old Testament</p>
                {filteredOT.map(book => (
                  <button key={book.id}
                    onClick={() => { setSelectedBook(book.id.toString()); setSelectedChapter('1'); setBookSearch(''); }}
                    className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${selectedBook === book.id.toString() ? 'font-semibold text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    style={selectedBook === book.id.toString() ? { backgroundColor: MAROON } : {}}>
                    {book.name}
                  </button>
                ))}
              </div>
            )}
            {filteredNT.length > 0 && (
              <div>
                <p className="px-3 pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">New Testament</p>
                {filteredNT.map(book => (
                  <button key={book.id}
                    onClick={() => { setSelectedBook(book.id.toString()); setSelectedChapter('1'); setBookSearch(''); }}
                    className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${selectedBook === book.id.toString() ? 'font-semibold text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    style={selectedBook === book.id.toString() ? { backgroundColor: MAROON } : {}}>
                    {book.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentBook && (
            <div className="border-t border-gray-100 dark:border-gray-800 p-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {currentBook.name} — {totalChapters} chapters
              </p>
              <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto">
                {Array.from({ length: totalChapters }, (_, i) => i + 1).map(ch => (
                  <button key={ch} onClick={() => setSelectedChapter(ch.toString())}
                    className={`text-xs rounded py-1 font-medium transition-colors ${selectedChapter === ch.toString() ? 'text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    style={selectedChapter === ch.toString() ? { backgroundColor: MAROON } : {}}>
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Verse area */}
        <main ref={verseContainerRef} className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {currentBook?.name} <span style={{ color: MAROON }}>{selectedChapter}</span>
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{currentVersion?.name}</p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">{error}</div>
            )}

            {loading && (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1 flex-shrink-0" />
                    <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-4/5' : 'w-3/5'}`} />
                  </div>
                ))}
              </div>
            )}

            {!loading && verses.length > 0 && (
              <div className={fontSizeClass[fontSize]}>
                {verses.map(verse => {
                  const isHighlighted =
                    !!activeResult &&
                    activeResult.book_id.toString() === selectedBook &&
                    activeResult.chapter.toString()  === selectedChapter &&
                    activeResult.verse === verse.verse;
                  return (
                    <p key={verse.id} id={`verse-${verse.verse}`}
                      className={`mb-3 transition-colors ${isHighlighted
                        ? '-mx-2 px-2 py-1 rounded-md border-l-4 bg-amber-50 dark:bg-amber-900/20'
                        : ''}`}
                      style={isHighlighted ? { borderLeftColor: MAROON } : {}}>
                      <sup className="text-xs font-bold mr-1.5 select-none" style={{ color: MAROON }}>
                        {verse.verse}
                      </sup>
                      {isHighlighted && searchQuery
                        ? <HighlightedText text={verse.text} query={searchQuery} mode={searchMode} caseSensitive={caseSensitive} />
                        : <span className="text-gray-800 dark:text-gray-200">{verse.text}</span>}
                    </p>
                  );
                })}
              </div>
            )}

            {!loading && verses.length === 0 && !error && (
              <p className="text-gray-400 dark:text-gray-500 text-sm">No verses found.</p>
            )}

            {!loading && verses.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button onClick={prevChapter} disabled={isAtStart}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={16} />
                  {parseInt(selectedChapter) > 1
                    ? `${currentBook?.name} ${parseInt(selectedChapter) - 1}`
                    : (books[books.findIndex(b => b.id.toString() === selectedBook) - 1]?.name ?? '')}
                </button>
                <button onClick={nextChapter} disabled={isAtEnd}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors">
                  {parseInt(selectedChapter) < totalChapters
                    ? `${currentBook?.name} ${parseInt(selectedChapter) + 1}`
                    : (books[books.findIndex(b => b.id.toString() === selectedBook) + 1]?.name ?? '')}
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Search panel (all screen sizes) ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={closeSearch} />
          <div className="relative w-full sm:w-[420px] h-full sm:h-auto sm:max-h-[90vh] bg-white dark:bg-gray-900 sm:rounded-l-2xl shadow-2xl flex flex-col">

            {/* Search header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Search Bible</h2>
              <button onClick={closeSearch} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search for a word or phrase…"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': MAROON } as React.CSSProperties}
                  />
                </div>
                <button type="submit" disabled={!searchQuery.trim() || searchLoading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: MAROON }}>
                  {searchLoading ? '…' : 'Search'}
                </button>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {/* Match mode */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-700 dark:text-gray-300">
                    <input type="radio" name="mode" value="similar" checked={searchMode === 'similar'}
                      onChange={() => setSearchMode('similar')}
                      className="accent-current" style={{ accentColor: MAROON }} />
                    Similar
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-700 dark:text-gray-300">
                    <input type="radio" name="mode" value="exact" checked={searchMode === 'exact'}
                      onChange={() => setSearchMode('exact')}
                      className="accent-current" style={{ accentColor: MAROON }} />
                    Exact word
                  </label>
                </div>

                {/* Case sensitive */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={caseSensitive}
                    onChange={e => setCaseSensitive(e.target.checked)}
                    style={{ accentColor: MAROON }} />
                  Case sensitive
                </label>
              </div>

              {/* Option descriptions */}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {searchMode === 'similar'
                  ? 'Finds verses containing the text anywhere, including as part of a longer word.'
                  : 'Finds verses where the text appears as a complete word (uses word boundaries).'}
                {caseSensitive ? ' Uppercase and lowercase are treated differently.' : ' Uppercase and lowercase are treated the same.'}
              </p>
            </form>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {searchError && (
                <div className="m-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{searchError}</div>
              )}

              {searchLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: MAROON }} />
                </div>
              )}

              {!searchLoading && searchDone && (
                <>
                  {/* Result count */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {searchTotal === 0
                        ? 'No results found'
                        : <><span style={{ color: MAROON }} className="font-bold">{searchTotal}</span> {searchTotal === 1 ? 'verse' : 'verses'} found</>}
                    </p>
                    {searchTotal > 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {currentVersion?.abbreviation}
                      </span>
                    )}
                  </div>

                  {/* Result list */}
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {searchResults.map((result, i) => {
                      const isActive = activeResult?.id === result.id;
                      return (
                        <button key={result.id} onClick={() => navigateToResult(result, i)}
                          className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isActive ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                          <p className="text-xs font-bold mb-1" style={{ color: MAROON }}>
                            {result.book_name} {result.chapter}:{result.verse}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                            <HighlightedText text={result.text} query={searchQuery} mode={searchMode} caseSensitive={caseSensitive} />
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {!searchLoading && !searchDone && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <Search size={32} className="text-gray-200 dark:text-gray-700 mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">Enter a word or phrase to search across the entire Bible in the selected translation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile nav sheet ── */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50"
            onClick={() => { setSheetOpen(false); setSheetView('book'); setBookSearch(''); }} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              {sheetView === 'chapter'
                ? <button onClick={() => setSheetView('book')} className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300"><ChevronLeft size={16} /> Books</button>
                : <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Select Book</span>}
              {sheetView === 'chapter' && <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{currentBook?.name}</span>}
              <button onClick={() => { setSheetOpen(false); setSheetView('book'); setBookSearch(''); }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={18} /></button>
            </div>

            {sheetView === 'book' && (
              <>
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={bookSearch} onChange={e => setBookSearch(e.target.value)}
                      placeholder="Search books…" autoFocus
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': MAROON } as React.CSSProperties} />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {filteredOT.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Old Testament</p>
                      <div className="grid grid-cols-2">
                        {filteredOT.map(book => (
                          <button key={book.id} onClick={() => selectBook(book.id.toString())}
                            className={`text-left px-4 py-2.5 text-sm border-b border-gray-50 dark:border-gray-800 transition-colors ${selectedBook === book.id.toString() ? 'font-semibold text-white' : 'text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800'}`}
                            style={selectedBook === book.id.toString() ? { backgroundColor: MAROON } : {}}>
                            {book.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {filteredNT.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">New Testament</p>
                      <div className="grid grid-cols-2">
                        {filteredNT.map(book => (
                          <button key={book.id} onClick={() => selectBook(book.id.toString())}
                            className={`text-left px-4 py-2.5 text-sm border-b border-gray-50 dark:border-gray-800 transition-colors ${selectedBook === book.id.toString() ? 'font-semibold text-white' : 'text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800'}`}
                            style={selectedBook === book.id.toString() ? { backgroundColor: MAROON } : {}}>
                            {book.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {sheetView === 'chapter' && (
              <div className="overflow-y-auto flex-1 p-4">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{totalChapters} chapters</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: totalChapters }, (_, i) => i + 1).map(ch => (
                    <button key={ch} onClick={() => selectChapter(ch)}
                      className={`py-3 rounded-xl text-sm font-medium transition-colors ${selectedChapter === ch.toString() ? 'text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                      style={selectedChapter === ch.toString() ? { backgroundColor: MAROON } : {}}>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
