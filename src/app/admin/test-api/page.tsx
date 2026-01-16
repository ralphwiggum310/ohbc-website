'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [testResult, setTestResult] = useState<string>('Running test...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        setIsLoading(true);
        
        // Test 1: Basic fetch to stats endpoint
        const response = await fetch('/api/admin/stats');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
        
        const data = await response.json();
        setTestResult(`✅ Success! Received data: ${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        console.error('Test failed:', error);
        setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Statistics Endpoint Test</h2>
        <div className="p-4 bg-gray-50 rounded-md font-mono text-sm whitespace-pre-wrap">
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Testing /api/admin/stats...
            </div>
          ) : (
            testResult
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium mb-2">Troubleshooting Steps:</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
            <li>Check if you're logged in as an admin user</li>
            <li>Verify the API endpoint is accessible in your browser: <code className="bg-gray-100 px-1 rounded">/api/admin/stats</code></li>
            <li>Check the browser's network tab for detailed error information</li>
            <li>Make sure the server is running and the endpoint is properly implemented</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
