'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { bibleService, BIBLE_VERSIONS } from '@/services/bibleService';

type BiblePassage = {
  reference: string;
  verses: Array<{
    book: string;
    chapter: number;
    verse: number;
    text: string;
    version: string;
  }>;
  text: string;
  version: string;
};

// Types
type Book = {
  name: string;
  chapters: number;
};

// List of all Bible books with their chapters
const BIBLE_BOOKS: Book[] = [
  // Old Testament
  { name: 'Genesis', chapters: 50 },
  { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },
  { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },
  { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },
  { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },
  { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 },
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },
  { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },
  { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },
  { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
  // New Testament
  { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 },
];

const ModernBibleReader: React.FC = () => {
  // State - Set NASB1995 as the default version
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState('nasb1995');
  const [passage, setPassage] = useState<BiblePassage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);
  
  // Refs for request tracking and debouncing
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestId = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Get available chapters for the selected book
  const currentBook = BIBLE_BOOKS.find(b => b.name === selectedBook) || BIBLE_BOOKS[0];
  const availableChapters = currentBook?.chapters || 1;
  
  // Fetch verses when version, book, or chapter changes
  const loadPassage = useCallback(async (book: string, chapter: number, version: string, requestId: number) => {
    // Cancel any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setLoading(true);
    setError(null);
    
    try {
      const passageData = await bibleService.getPassage(book, chapter, version);
      
      // Only update state if this is the most recent request
      if (requestId === lastRequestId.current) {
        setPassage(passageData);
      }
    } catch (err) {
      // Ignore aborted requests
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      console.error('Error loading passage:', err);
      
      // Only update error state if this is the most recent request
      if (requestId === lastRequestId.current) {
        setError(err instanceof Error ? err.message : 'Failed to load passage');
      }
    } finally {
      // Only update loading state if this is the most recent request
      if (requestId === lastRequestId.current) {
        setLoading(false);
      }
    }
  }, []);
  
  // Debounced effect for loading passages
  useEffect(() => {
    // Clear any pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Increment request ID to track the most recent request
    const currentRequestId = ++lastRequestId.current;
    
    // Set a debounce timer (300ms)
    debounceTimer.current = setTimeout(() => {
      loadPassage(selectedBook, selectedChapter, selectedVersion, currentRequestId);
    }, 300);
    
    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Cancel any in-flight requests when component unmounts or dependencies change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedBook, selectedChapter, selectedVersion, loadPassage]);
  
  // Navigation handlers
  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBook(e.target.value);
    setSelectedChapter(1); // Reset to first chapter when book changes
  };
  
  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChapter(Number(e.target.value));
  };
  
  const navigateChapter = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedChapter > 1) {
      setSelectedChapter(prev => prev - 1);
    } else if (direction === 'next' && selectedChapter < availableChapters) {
      setSelectedChapter(prev => prev + 1);
    }
  };
  
  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVersion(e.target.value);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Handle font size change
  const changeFontSize = (delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)));
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center md:text-left">Bible Reader</h1>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            {/* Version Selector */}
            <div className="flex-1">
              <label htmlFor="version" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Version
              </label>
              <select
                id="version"
                value={selectedVersion}
                onChange={handleVersionChange}
                className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                disabled={loading}
              >
                {/* Show all available versions including empty ones */}
                {BIBLE_VERSIONS.filter(v => 
                  ['kjv', 'asv', 'erv', 'web', 'niv', 'nasb'].includes(v.id.toLowerCase())
                ).sort((a, b) => a.name.localeCompare(b.name)).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Selector */}
            <div className="flex-1">
              <label htmlFor="book" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Book
              </label>
              <select
                id="book"
                value={selectedBook}
                onChange={handleBookChange}
                className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                disabled={loading}
              >
                {BIBLE_BOOKS.map((book) => (
                  <option key={book.name} value={book.name}>
                    {book.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Navigation */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="chapter" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Chapter
                </label>
                <div className="flex">
                  <button
                    onClick={() => navigateChapter('prev')}
                    disabled={selectedChapter <= 1 || loading}
                    className={`px-3 py-2 rounded-l border ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'} disabled:opacity-50`}
                  >
                    &lt;
                  </button>
                  <select
                    id="chapter"
                    value={selectedChapter}
                    onChange={handleChapterChange}
                    className={`w-16 text-center border-t border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                    disabled={loading}
                  >
                    {Array.from({ length: availableChapters }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => navigateChapter('next')}
                    disabled={selectedChapter >= availableChapters || loading}
                    className={`px-3 py-2 rounded-r border ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'} disabled:opacity-50`}
                  >
                    &gt;
                  </button>
                </div>
              </div>

              {/* Display total chapters */}
              <div className="text-sm text-gray-500 mb-1">
                of {availableChapters}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <>
                    <span className="text-sm font-medium">Light Mode</span>
                    <span>☀️</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium">Dark Mode</span>
                    <span>🌙</span>
                  </>
                )}
              </button>
            </div>

            {/* Font Size Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize((prev) => Math.max(12, prev - 1))}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                disabled={fontSize <= 12}
              >
                A-
              </button>
              <span className="text-sm w-8 text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize((prev) => Math.min(24, prev + 1))}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                disabled={fontSize >= 24}
              >
                A+
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="text-base md:text-lg" style={{ fontSize: `${fontSize}px` }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2">Loading {selectedBook} {selectedChapter}...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-100">
              <p className="font-semibold">Error Loading Passage</p>
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-blue-700 dark:text-blue-400 font-bold">{selectedBook} {selectedChapter}</span>
                <span className="text-sm text-gray-800 dark:text-gray-300 ml-2 font-medium">
                  {passage?.version ? `(${passage.version.toUpperCase()})` : selectedVersion.toUpperCase()}
                </span>
              </h2>
              <div className="mt-4 space-y-4">
                {passage?.verses?.map((verse: { verse: number; text: string }, index: number) => {
                  // Create a function to safely render HTML content
                  const createMarkup = (html: string) => {
                    return { __html: html };
                  };
                  
                  return (
                    <p key={index} className="leading-relaxed mb-3 text-justify">
                      <sup className="text-xs font-medium text-blue-700 dark:text-blue-400 mr-1 align-super">
                        {verse.verse}
                      </sup>
                      <span 
                        className={`${darkMode ? 'text-white' : 'text-gray-900'} leading-relaxed`}
                        dangerouslySetInnerHTML={createMarkup(verse.text)}
                      />
                    </p>
                  );
                }) || (
                  <p className="text-gray-700 dark:text-gray-200 italic">No verses found for this passage.</p>
                )}
              </div>

              {/* Chapter Navigation */}
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => navigateChapter('prev')}
                  disabled={selectedChapter <= 1 || loading}
                  className={`w-full sm:w-auto px-4 py-2 rounded ${selectedChapter <= 1 ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  &larr; Previous Chapter
                </button>
                <span className="text-sm text-gray-500">
                  {selectedBook} {selectedChapter}
                </span>
                <button
                  onClick={() => navigateChapter('next')}
                  disabled={selectedChapter >= availableChapters || loading}
                  className={`w-full sm:w-auto px-4 py-2 rounded ${selectedChapter >= availableChapters ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Next Chapter &rarr;
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModernBibleReader;
