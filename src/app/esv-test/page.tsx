'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('Starting test...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const addDebugInfo = (info: string) => {
    console.log(`[DEBUG] ${info}`);
    setDebugInfo(prev => `${prev}\n${new Date().toISOString()}: ${info}`);
  };

  useEffect(() => {
    const testApi = async () => {
      addDebugInfo('Starting API test...');
      try {
        // Use our API route instead of direct ESV API call
        const passage = 'John 3:16';
        const apiUrl = `/api/esv?passage=${encodeURIComponent(passage)}`;
        addDebugInfo(`Making request to our API route: ${apiUrl}`);
        
        let response;
        try {
          response = await fetch(apiUrl);
          addDebugInfo(`Received response with status: ${response.status}`);
        } catch (error) {
          const errorMsg = `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          addDebugInfo(errorMsg);
          throw new Error(errorMsg);
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `API request failed with status ${response.status}: ${JSON.stringify(errorData)}`
          );
        }

        const data = await response.json();
        setTestResult(`✅ Success! API is working.\n\nResponse:\n${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        console.error('Test error:', error);
        setTestResult(
          `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ESV API Test</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Testing API connection...</p>
          </div>
        ) : (
          <div className="space-y-4">
        <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Test Result:</h3>
          {testResult}
        </div>
        
        <div className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-4 rounded max-h-60 overflow-auto">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          {debugInfo || 'No debug information available'}
        </div>
      </div>
        )}
        
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h2 className="font-semibold text-lg mb-2">Troubleshooting:</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Make sure your API key is in <code className="bg-blue-100 px-1.5 py-0.5 rounded">.env.local</code> as <code className="bg-blue-100 px-1.5 py-0.5 rounded">NEXT_PUBLIC_ESV_API_KEY=your_key_here</code></li>
            <li>Restart your development server after adding the API key</li>
            <li>Check your API key at <a href="https://api.esv.org/account/profile/" target="_blank" className="text-blue-600 hover:underline">ESV API Dashboard</a></li>
            <li>Make sure your key hasn't exceeded any rate limits</li>
            <li>If testing locally, ensure your API key is for development (not production)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
