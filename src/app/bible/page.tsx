'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Types
interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
}

interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

interface BibleVerse {
  id: number;
  verse: number;
  text: string;
}

interface Chapter {
  number: number;
  verses: number;
}

export default function BiblePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load versions on mount
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const response = await fetch('/api/bible/versions');
        if (!response.ok) throw new Error('Failed to load versions');
        const data = await response.json();
        setVersions(data);
        
        // Set default version if not already set
        if (data.length > 0 && !selectedVersion) {
          setSelectedVersion(data[0].id);
        }
      } catch (err) {
        setError('Failed to load Bible versions. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVersions();
  }, []);

  // Load books when version changes
  useEffect(() => {
    console.log(`[Frontend] Books useEffect triggered. selectedVersion: ${selectedVersion}, selectedBook: ${selectedBook}`);
    if (!selectedVersion) return;
    
    const loadBooks = async () => {
      try {
        console.log(`[Frontend] Loading books for version: ${selectedVersion}`);
        const response = await fetch(`/api/bible/${selectedVersion}/books`);
        if (!response.ok) throw new Error('Failed to load books');
        const data = await response.json();
        console.log(`[Frontend] Received ${data.length} books:`, data.slice(0, 3).map((b: any) => ({ id: b.id, name: b.name })));
        setBooks(data);
        
        // Set default book if not already set
        if (data.length > 0 && !selectedBook) {
          console.log(`[Frontend] Setting default book to: ${data[0].id}`);
          setSelectedBook(data[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load books. Please try again.');
        console.error(err);
      }
    };

    loadBooks();
  }, [selectedVersion]);

  // Load chapters when book changes
  useEffect(() => {
    if (!selectedVersion || !selectedBook) return;

    const loadChapters = async () => {
      try {
        const response = await fetch(`/api/bible/${selectedVersion}/${selectedBook}/chapters`);
        if (!response.ok) throw new Error('Failed to load chapters');
        const data = await response.json();
        // data.chapters is an array of chapter objects, not a number
        const chaptersArray = data.chapters.map((chapter: any) => chapter.number);
        setChapters(chaptersArray);

        // Reset chapter selection if current selection is invalid
        if (chaptersArray.length > 0 &&
            (!selectedChapter || parseInt(selectedChapter) > chaptersArray.length)) {
          setSelectedChapter('1');
        }
      } catch (err) {
        setError('Failed to load chapters. Please try again.');
        console.error(err);
      }
    };

    loadChapters();
  }, [selectedVersion, selectedBook]);

  // Load verses when chapter changes
  useEffect(() => {
    if (!selectedVersion || !selectedBook || !selectedChapter) return;

    const loadVerses = async () => {
      try {
        const response = await fetch(
          `/api/bible/${selectedVersion}/${selectedBook}/${selectedChapter}/verses`
        );
        if (!response.ok) throw new Error('Failed to load verses');
        const data = await response.json();
        setVerses(data);
        setError(null);
      } catch (err) {
        setError('Failed to load verses. Please try again.');
        console.error(err);
      }
    };

    loadVerses();
  }, [selectedVersion, selectedBook, selectedChapter]);

  // Initialize from URL params on first load
  useEffect(() => {
    try {
      if (!searchParams) return;
      
      const version = searchParams.get('v');
      const book = searchParams.get('b');
      const chapter = searchParams.get('c');
      
      if (version) setSelectedVersion(version);
      if (book) setSelectedBook(book);
      if (chapter) setSelectedChapter(chapter);
    } catch (error) {
      console.warn('Error reading URL params:', error);
    }
  }, [searchParams]);

  // Handle selection changes
  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersion = e.target.value;
    console.log(`[Frontend] Version changed from ${selectedVersion} to ${newVersion}`);
    setSelectedVersion(newVersion);
    // Reset chapter when version changes (but keep book selection since all versions have same books)
    setSelectedChapter('1');
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBook(e.target.value);
    // Reset chapter when book changes
    setSelectedChapter('1');
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChapter(e.target.value);
  };

  // Helper functions
  const getBookName = (id: string) => {
    const book = books.find(b => b.id.toString() === id);
    return book ? book.name : 'Book';
  };

  // Navigation functions
  const goToPreviousChapter = () => {
    const currentChapter = parseInt(selectedChapter);
    if (currentChapter > 1) {
      setSelectedChapter((currentChapter - 1).toString());
    } else if (books.length > 1) {
      // Go to last chapter of previous book
      const currentBookIndex = books.findIndex(b => b.id.toString() === selectedBook);
      if (currentBookIndex > 0) {
        const prevBook = books[currentBookIndex - 1];
        setSelectedBook(prevBook.id.toString());
        setSelectedChapter(prevBook.chapters.toString());
      }
    }
  };

  const goToNextChapter = () => {
    const currentChapter = parseInt(selectedChapter);
    if (currentChapter < chapters.length) {
      setSelectedChapter((currentChapter + 1).toString());
    } else if (books.length > 1) {
      // Go to first chapter of next book
      const currentBookIndex = books.findIndex(b => b.id.toString() === selectedBook);
      if (currentBookIndex < books.length - 1) {
        const nextBook = books[currentBookIndex + 1];
        setSelectedBook(nextBook.id.toString());
        setSelectedChapter('1');
      }
    }
  };

  if (isLoading && !selectedVersion) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
   );
}
 
return (
  <>
    <style jsx>{`
      @media (prefers-color-scheme: dark) {
        select option {
          background-color: #374151 !important;
          color: #f9fafb !important;
        }
      }
      .dark select option {
        background-color: #374151 !important;
        color: #f9fafb !important;
      }
    `}</style>
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Bible Reader</h1>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 mb-4 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left side - Navigation menus */}
          <div className="w-full lg:w-80 space-y-3">
            {/* Version selector */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <label htmlFor="version" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Version
              </label>
              <div className="relative">
                <select
                  id="version"
                  value={selectedVersion}
                  onChange={handleVersionChange}
                  className="w-full p-1.5 pl-2 pr-6 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.abbreviation}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              {/* Current version display */}
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {versions.find((v: any) => v.id === selectedVersion)?.name}
              </div>
            </div>
            
            {/* Book selector */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <label htmlFor="book" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Book
              </label>
              <div className="relative">
                <select
                  id="book"
                  value={selectedBook}
                  onChange={handleBookChange}
                  className="w-full p-1.5 pl-2 pr-6 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedVersion || isLoading}
                >
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              {/* Current book display */}
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {getBookName(selectedBook)}
              </div>
            </div>
            
            {/* Chapter selector */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <label htmlFor="chapter" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chapter
              </label>
              <div className="flex gap-1">
                <button
                  onClick={goToPreviousChapter}
                  disabled={
                    !selectedBook || 
                    isLoading || 
                    (parseInt(selectedChapter) <= 1 && 
                     books.find((b: any) => b.id.toString() === selectedBook)?.testament === 'NT')
                  }
                  className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  &larr;
                </button>
                <div className="relative flex-1">
                  <select
                    id="chapter"
                    value={selectedChapter}
                    onChange={handleChapterChange}
                    className="w-full p-1.5 pl-2 pr-6 text-sm border-t border-b border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center transition-colors duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedBook || isLoading}
                  >
                    {chapters.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={goToNextChapter}
                  disabled={!selectedBook || isLoading || 
                    (parseInt(selectedChapter) >= chapters.length && 
                     books.findIndex((b: any) => b.id.toString() === selectedBook) === books.length - 1)}
                  className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  &rarr;
                </button>
              </div>
              {/* Current chapter display */}
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Chapter {selectedChapter} of {chapters.length}
              </div>
            </div>
          </div>
          
          {/* Right side - Bible text */}
          <div className="flex-1 min-w-0">
            {/* Bible text */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                {selectedBook && getBookName(selectedBook)} {selectedChapter}
              </h2>
              
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : verses.length > 0 ? (
                <div className="space-y-3 text-sm sm:text-base leading-relaxed">
                  {verses.map((verse) => (
                    <p key={verse.id} className="mb-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mr-2">{verse.verse}.</span>
                      <span className="text-gray-800 dark:text-gray-200">{verse.text}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No verses found for selected passage.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
