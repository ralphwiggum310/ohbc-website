'use client';

import { useState } from 'react';

export default function TestBiblePage() {
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState('3');
  const [version, setVersion] = useState('NASB1995');
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchChapter = async () => {
    if (!book || !chapter) return;
    
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        book,
        chapter,
        version
      });
      
      const response = await fetch(`/api/bible?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch chapter');
      }
      
      setVerses(data.data?.verses || []);
    } catch (err: any) {
      console.error('Error fetching chapter:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Bible API Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
            <input
              type="text"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g. John"
            />
          </div>
          
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="1"
            />
          </div>
          
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="NASB1995">NASB 1995</option>
              <option value="NKJV">NKJV</option>
              <option value="KJV">KJV</option>
              <option value="NIV">NIV</option>
              <option value="ESV">ESV</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchChapter}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Loading...' : 'Fetch'}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {verses.length > 0 && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{book} {chapter}</h2>
            <div className="space-y-3">
              {verses.map((verse) => (
                <div key={verse.id} className="flex">
                  <span className="text-gray-500 w-8 flex-shrink-0">{verse.verse}.</span>
                  <span>{verse.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {verses.length === 0 && !loading && !error && (
          <div className="text-center text-gray-500 py-8">
            <p>Enter a book and chapter to view verses</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">API Response:</h3>
        <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-60">
          {JSON.stringify(verses, null, 2)}
        </pre>
      </div>
    </div>
  );
}
