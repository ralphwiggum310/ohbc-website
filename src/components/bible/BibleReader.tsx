'use client';

import { useState, useEffect } from 'react';
import { BibleVersion, Book, Verse } from '@/types/bible';

type LoadingState = {
  versions: boolean;
  books: boolean;
  chapters: boolean;
  verses: boolean;
};

export default function BibleReader() {
  // State declarations - all hooks at the top
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Array<{number: number, verseCount: number}>>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number | ''>('');
  const [loading, setLoading] = useState<LoadingState>({
    versions: true,
    books: false,
    chapters: false,
    verses: false,
  });
  const [error, setError] = useState<string | null>(null);
  
  // Fetch Bible versions on component mount
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(prev => ({ ...prev, versions: true }));
        const response = await fetch('/api/bible/versions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch versions');
        }
        
        const data = await response.json();
        setVersions(data);
        
        // Auto-select first version if available
        if (data.length > 0) {
          setSelectedVersion(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching versions:', err);
        setError('Failed to load Bible versions');
      } finally {
        setLoading(prev => ({ ...prev, versions: false }));
      }
    };

    fetchVersions();
  }, []);

  // Fetch books when version changes
  useEffect(() => {
    const fetchBooks = async () => {
      if (!selectedVersion) return;
      
      try {
        setLoading(prev => ({ ...prev, books: true }));
        setBooks([]);
        setChapters([]);
        setVerses([]);
        
        const response = await fetch(`/api/bible/books?version=${selectedVersion}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        setBooks(data);
        
        // Auto-select first book if available
        if (data.length > 0) {
          setSelectedBook(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books');
      } finally {
        setLoading(prev => ({ ...prev, books: false }));
      }
    };

    fetchBooks();
  }, [selectedVersion]);

  // Fetch chapters when book changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedVersion || !selectedBook) {
        setChapters([]);
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, chapters: true }));
        
        const response = await fetch(
          `/api/bible/chapters?version=${selectedVersion}&book=${selectedBook}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch chapters');
        }
        
        const data = await response.json();
        setChapters(data);
        
        // Auto-select first chapter when chapters change
        if (data.length > 0) {
          setSelectedChapter(Number(data[0].number));
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setError('Failed to load chapters');
        setChapters([]);
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    };
    
    fetchChapters();
  }, [selectedVersion, selectedBook]);
  
  // Fetch verses when chapter changes
  useEffect(() => {
    const fetchVerses = async () => {
      if (!selectedVersion || !selectedBook || !selectedChapter) {
        setVerses([]);
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, verses: true }));
        setError(null);
        
        const response = await fetch(
          `/api/bible/verses?version=${selectedVersion}&book=${selectedBook}&chapter=${selectedChapter}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch verses: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No verses found for the selected chapter');
        }
        
        setVerses(data);
      } catch (err) {
        console.error('Error fetching verses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load verses');
        setVerses([]);
      } finally {
        setLoading(prev => ({ ...prev, verses: false }));
      }
    };

    fetchVerses();
  }, [selectedVersion, selectedBook, selectedChapter]);
  
  // Event handlers
  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVersion(e.target.value);
    setSelectedBook('');
    setSelectedChapter('');
    setVerses([]);
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBook(e.target.value);
    setSelectedChapter('');
    setVerses([]);
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterNumber = e.target.value ? Number(e.target.value) : '';
    setSelectedChapter(chapterNumber);
    setVerses([]);
  };
  
  // Helper function
  const getBookName = (bookId: string): string => {
    const book = books.find(b => b.id === bookId);
    return book ? book.name : '';
  };

  // Render loading state for versions
  if (loading.versions) {
    return <div className="p-4">Loading Bible versions...</div>;
  }

  // Determine what to render
  let content;
  
  if (error) {
    content = (
      <div className="p-4 text-red-600">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  } else {

  // Fetch chapters when book changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedVersion || !selectedBook) {
        setChapters([]);
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, chapters: true }));
        
        const response = await fetch(
          `/api/bible/chapters?version=${selectedVersion}&book=${selectedBook}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch chapters');
        }
        
        const data = await response.json();
        setChapters(data);
        
        // Auto-select first chapter when chapters change
        if (data.length > 0) {
          setSelectedChapter(data[0].number.toString());
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setError('Failed to load chapters');
        setChapters([]);
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    };
    
    fetchChapters();
  }, [selectedVersion, selectedBook]);

    content = (
      <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header with dropdowns */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
              Version
            </label>
            <select
              id="version"
              value={selectedVersion}
              onChange={handleVersionChange}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading.versions}
            >
              <option value="">Select a version</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-1">
              Book
            </label>
            <select
              id="book"
              value={selectedBook}
              onChange={handleBookChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading.books || !selectedVersion}
            >
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-1">
              Chapter
            </label>
            <select
              id="chapter"
              value={selectedChapter}
              onChange={handleChapterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading.chapters || !selectedBook}
            >
              {chapters.map((chapter) => (
                <option key={chapter.number} value={String(chapter.number)}>
                  {chapter.number} ({chapter.verseCount} verses)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading.verses && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              Loading {getBookName(selectedBook)} {selectedChapter}...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bible text */}
        {!loading.verses && verses.length > 0 && (
          <div className="prose max-w-none prose-p:my-2">
            <h2 className="text-2xl font-bold mb-6">
              {selectedBook ? getBookName(selectedBook) : ''} {selectedChapter}
            </h2>
            <div className="space-y-4">
              {verses.map((verse) => {
                // Create a unique key using book, chapter, and verse numbers
                const verseKey = `${verse.book}-${verse.chapter}-${verse.verse}`;
                return (
                  <p key={verseKey} className="text-lg leading-relaxed mb-4">
                    <sup className="text-sm text-gray-500 font-bold mr-1">
                      {verse.verse}
                    </sup>
                    <span className="verse-text">
                      {verse.text.replace(/\n/g, ' ').trim()}
                    </span>
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* No verses found */}
        {!loading.verses && verses.length === 0 && selectedChapter && (
          <div className="text-center py-8 text-gray-500">
            No verses found for {getBookName(selectedBook)} {selectedChapter}
          </div>
        )}
      </div>
      </div>
    );
  }
  
  return content;
}
