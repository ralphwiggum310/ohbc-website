import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Test the API endpoint directly
async function testBibleApi() {
  console.log('Testing Bible API...');
  
  // Test cases
  const testCases = [
    { book: 'john', chapter: 3, version: 'kjv' },
    { book: 'genesis', chapter: 1, version: 'asv' },
    { book: 'psalm', chapter: 23, version: 'web' },
    { book: 'matthew', chapter: 5, version: 'niv' },
    { book: 'romans', chapter: 8, version: 'esv' },
    { book: 'revelation', chapter: 22, version: 'nkjv' }
  ];

  for (const test of testCases) {
    console.log(`\n=== Testing ${test.book} ${test.chapter} (${test.version}) ===`);
    
    try {
      // Create a mock request object
      const request = new Request(
        `http://localhost:3000/api/bible/passage?book=${test.book}&chapter=${test.chapter}&version=${test.version}`
      );
      
      // Call the API route handler directly
      const response = await GET(request);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Success!');
        console.log(`Reference: ${data.reference}`);
        console.log(`Version: ${data.version}`);
        console.log(`Verses found: ${data.verses.length}`);
        console.log('Sample verse:', {
          verse: data.verses[0]?.verse,
          text: data.verses[0]?.text?.substring(0, 50) + '...'
        });
      } else {
        console.error('❌ Error:', data.error);
        console.log('Details:', data.details || 'No details');
        if (data.suggestions) {
          console.log('Suggestions:', data.suggestions);
        }
        console.log('Available versions:', data.availableVersions);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
  
  console.log('\n=== Test complete ===');
}

// Run the test
testBibleApi().catch(console.error);
