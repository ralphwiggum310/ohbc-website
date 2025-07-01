'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const BIBLE_VERSIONS = [
  { id: 'KJV', name: 'King James Version' },
  { id: 'NASB1995', name: 'NASB 1995' }
];

const OLD_TESTAMENT_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
];

const NEW_TESTAMENT_BOOKS = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
  'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

// Define chapter counts for each book
const BOOK_CHAPTERS: Record<string, number> = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10,
  'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52,
  'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3,
  'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3,
  'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4, 'Matthew': 28,
  'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16, '1 Corinthians': 16,
  '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6, 'Philippians': 4,
  'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6,
  '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
  '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1,
  'Revelation': 22
};

export default function BibleReader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [book, setBook] = useState(searchParams.get('book') || 'John');
  const [chapter, setChapter] = useState(parseInt(searchParams.get('chapter') || '1'));
  const [version, setVersion] = useState(searchParams.get('version') || 'NASB1995');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [verses, setVerses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlBook = params.get('book') || 'John';
      const urlChapter = parseInt(params.get('chapter') || '1');
      const urlVersion = params.get('version') || 'NASB1995';

      setBook(urlBook);
      setChapter(urlChapter);
      setVersion(urlVersion);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (book) params.set('book', book);
    if (chapter) params.set('chapter', chapter.toString());
    if (version) params.set('version', version);

    if (book && chapter && version) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      fetchChapter();
    }
  }, [book, chapter, version, pathname, router]);

  const fetchChapter = async () => {
    if (!book || !chapter) return;

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        book,
        chapter: chapter.toString(),
        version
      });

      const response = await fetch(`/api/bible?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch chapter');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.data?.verses) {
        setVerses(data.data.verses);
      } else if (data.data?.content) {
        setVerses([{
          id: `${book}-${chapter}-1`,
          reference: `${book} ${chapter}:1`,
          text: data.data.content
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim(),
          verse: '1'
        }]);
      } else {
        setVerses([]);
        setError('No verses found for this chapter.');
      }
    } catch (err: any) {
      console.error('Error fetching chapter:', err);
      let errorMessage = err.message || 'Failed to load chapter. Please try again.';

      if (err.message.includes('403') || err.message.includes('not include the Old Testament')) {
        errorMessage = `The ${version} version does not include the Old Testament. Please try KJV, NASB, or ESV for Old Testament books.`;
      } else if (err.message.includes('404') || err.message.includes('not found')) {
        errorMessage = 'The requested passage could not be found. The translation may not include this book or chapter.';
      }

      setError(errorMessage);
      setVerses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const params = new URLSearchParams({
        search: searchQuery,
        version
      });

      const response = await fetch(`/api/bible?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data.data?.results || data.data?.verses || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const navigateToVerse = (verseRef: string) => {
    const match = verseRef.match(/(\d*\s*[a-zA-Z]+)\s*(\d+):(\d+)/);
    if (match) {
      setBook(match[1].trim());
      setChapter(parseInt(match[2]));
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const nextChapter = () => {
    setChapter(prev => prev + 1);
  };

  const prevChapter = () => {
    if (chapter > 1) {
      setChapter(prev => prev - 1);
    }
  };

  // Main component return
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-xl border border-blue-100 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-blue-400"></div>
      <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-blue-100 rounded-full opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 -mb-32 -ml-32 bg-blue-200 rounded-full opacity-20"></div>
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 19.477 5.754 19 7.5 19s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 19.477 18.247 19 16.5 19c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-serif tracking-tight">Bible Reader</h1>
          <p className="mt-2 text-lg text-gray-600">Read and study the Word of God</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-200 mx-auto mt-3 rounded-full"></div>
        </div>
      
        {/* Version and Book Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
      >
        <div className="space-y-1">
          <label htmlFor="version" className="block text-sm font-semibold text-gray-600 uppercase tracking-wider">
            Bible Version
          </label>
          <div className="relative">
            <select
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="appearance-none w-full p-4 pr-10 border-2 border-blue-100 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white/80 backdrop-blur-sm font-medium focus:outline-none transition-all duration-200 cursor-pointer hover:shadow-lg"
            >
              {BIBLE_VERSIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="book" className="block text-sm font-semibold text-gray-600 uppercase tracking-wider">
            Book & Chapter
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <select
                id="book"
                value={book}
                onChange={(e) => setBook(e.target.value)}
                className="appearance-none w-full p-4 pr-10 border-2 border-blue-100 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white/80 backdrop-blur-sm font-medium focus:outline-none transition-all duration-200 cursor-pointer hover:shadow-lg"
              >
                <optgroup label="Old Testament" className="bg-white">
                  {OLD_TESTAMENT_BOOKS.map((b) => (
                    <option key={b} value={b} className="hover:bg-blue-100">
                      {b}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="New Testament" className="bg-white">
                  {NEW_TESTAMENT_BOOKS.map((b) => (
                    <option key={b} value={b} className="hover:bg-blue-100">
                      {b}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border-2 border-blue-100 px-2">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={prevChapter}
                disabled={chapter <= 1}
                className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                aria-label="Previous chapter"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <span className="px-2 font-bold text-gray-700 w-8 text-center">{chapter}</span>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={nextChapter}
                className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
                aria-label="Next chapter"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the Bible..."
              className="w-full p-4 pl-12 pr-28 border-2 border-blue-100 rounded-2xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white/90 backdrop-blur-sm text-lg font-medium placeholder-gray-400 focus:outline-none focus:shadow-outline transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="absolute inset-y-1 right-1 px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
      
      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-blue-50 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Search Results for "{searchQuery}"
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
              </span>
            </div>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-blue-50/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-blue-100"
                  onClick={() => navigateToVerse(result.reference || result.verse)}
                >
                  <p className="font-semibold text-blue-700 flex items-center">
                    <svg className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {result.reference || result.verse}
                  </p>
                  <p className="mt-1.5 text-gray-700 pl-6">
                    {result.text.length > 150 ? `${result.text.substring(0, 150)}...` : result.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter Content */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-2 border-blue-50 overflow-hidden relative"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-blue-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 -ml-8 -mb-8 bg-blue-200 rounded-full opacity-30"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 font-serif tracking-tight">
              {book} {chapter}
              <span className="ml-3 inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                {BIBLE_VERSIONS.find(v => v.id === version)?.name}
              </span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-200 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading {book} {chapter}...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : verses.length > 0 ? (
              <div className="space-y-6">
                <div className="prose prose-lg max-w-none text-gray-700">
                  {verses.map((verse) => (
                    <p key={verse.id} className="mb-4 leading-relaxed">
                      <span className="text-sm text-blue-600 font-medium mr-1">
                        {verse.verse}.
                      </span>
                      {verse.text}
                    </p>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={prevChapter}
                    disabled={chapter <= 1}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${chapter <= 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Previous Chapter
                  </button>
                  
                  <div className="text-sm text-gray-500">
                    {book} {chapter}
                  </div>
                  
                  <button
                    onClick={nextChapter}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next Chapter
                    <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No content found</h3>
                <p className="mt-1 text-sm text-gray-500">We couldn't find any content for this chapter.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };
  
  // Main component return
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-xl border border-blue-100 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-blue-400"></div>
      <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-blue-100 rounded-full opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 -mb-32 -ml-32 bg-blue-200 rounded-full opacity-20"></div>
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 19.477 5.754 19 7.5 19s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 19.477 18.247 19 16.5 19c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-serif tracking-tight">Bible Reader</h1>
          <p className="mt-2 text-lg text-gray-600">Read and study the Word of God</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-200 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Version and Book Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          <div className="flex flex-col gap-6">
            {/* Book Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Book</label>
              <div className="relative">
                <select
                  value={book}
                  onChange={(e) => {
                    setBook(e.target.value);
                    setChapter(1);
                  }}
                  className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <optgroup label="Old Testament">
                    {OLD_TESTAMENT_BOOKS.map((bookName) => (
                      <option key={bookName} value={bookName}>
                        {bookName}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="New Testament">
                    {NEW_TESTAMENT_BOOKS.map((bookName) => (
                      <option key={bookName} value={bookName}>
                        {bookName}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Chapter Selection and Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto space-y-2">
                <label className="block text-sm font-medium text-gray-700">Chapter</label>
                <div className="relative">
                  <select
                    value={chapter}
                    onChange={(e) => setChapter(Number(e.target.value))}
                    className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: BOOK_CHAPTERS[book] || 1 }, (_, i) => i + 1).map((chap) => (
                      <option key={chap} value={chap}>
                        Chapter {chap}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 sm:mt-8">
                <motion.button
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={prevChapter}
                  disabled={chapter <= 1}
                  className="p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous Chapter"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                
                <span className="text-sm font-medium text-gray-500">
                  {chapter} of {BOOK_CHAPTERS[book] || '?'}
                </span>
                
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextChapter}
                  disabled={chapter >= (BOOK_CHAPTERS[book] || 1)}
                  className="p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next Chapter"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bible Content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading content</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button
                onClick={fetchChapter}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : verses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No content found</h3>
              <p className="mt-1 text-sm text-gray-500">We couldn't find any content for this chapter.</p>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                key={`${book}-${chapter}-${version}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="prose prose-blue max-w-none"
              >
                {verses.map((verse) => (
                  <p key={verse.verse} className="mb-4">
                    <span className="text-blue-600 font-medium">{verse.verse}</span> {verse.text}
                  </p>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
