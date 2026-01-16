'use client';

import { useState, useEffect } from 'react';

export default function YoutubeTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testYoutubeApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/youtube-test');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch from YouTube API');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">YouTube API Test</h1>
        
        <div className="mb-6">
          <button
            onClick={testYoutubeApi}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Testing...' : 'Test YouTube API'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Error:</p>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
              <pre className="text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
