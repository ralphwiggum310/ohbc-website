// Test script for the KJV API endpoint
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_BASE_URL = 'http://localhost:3000/api/kjv';

async function testKjvEndpoint() {
  console.log('Testing KJV API Endpoint\n');
  
  const testCases = [
    { book: 'John', chapter: '3' },
    { book: 'Genesis', chapter: '1' },
    { book: 'Psalm', chapter: '23' },
    { book: 'Matthew', chapter: '5' }
  ];

  for (const testCase of testCases) {
    const { book, chapter } = testCase;
    const url = `${API_BASE_URL}?book=${encodeURIComponent(book)}&chapter=${chapter}`;
    
    console.log(`\n=== Testing: ${book} ${chapter} ===`);
    console.log(`URL: ${url}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url);
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Response Time: ${responseTime}ms`);
      
      if (!response.ok) {
        console.error('Error:', data);
        continue;
      }
      
      console.log('Response Data:');
      console.log(`- Reference: ${data.reference}`);
      console.log(`- Version: ${data.version}`);
      console.log(`- Verse Count: ${data.verses?.length || 0}`);
      
      if (data.verses && data.verses.length > 0) {
        console.log('\nSample Verses:');
        data.verses.slice(0, 3).forEach((verse: any, index: number) => {
          console.log(`  ${verse.verse}. ${verse.text.substring(0, 80)}${verse.text.length > 80 ? '...' : ''}`);
        });
        if (data.verses.length > 3) {
          console.log(`  ... and ${data.verses.length - 3} more`);
        }
      }
      
      if (data.copyright) {
        console.log(`\nCopyright: ${data.copyright}`);
      }
      
    } catch (error) {
      console.error('Request failed:', error);
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Run the test
testKjvEndpoint().catch(console.error);
