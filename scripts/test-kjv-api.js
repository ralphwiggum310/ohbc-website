// Test script for KJV API endpoint
require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');

async function testKjvApi() {
  const apiKey = process.env.BIBLE_API_KEY;
  
  if (!apiKey) {
    console.error('❌ BIBLE_API_KEY is not set in environment variables');
    process.exit(1);
  }

  const testCases = [
    { book: 'John', chapter: '3' },
    { book: 'Genesis', chapter: '1' },
    { book: 'Psalm', chapter: '23' },
    { book: 'Matthew', chapter: '5' }
  ];

  console.log('🔍 Testing KJV API Endpoint\n');
  
  for (const testCase of testCases) {
    const { book, chapter } = testCase;
    const url = `http://localhost:3000/api/kjv?book=${encodeURIComponent(book)}&chapter=${chapter}`;
    
    console.log(`📖 Testing: ${book} ${chapter}`);
    console.log(`   URL: ${url}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Response Time: ${responseTime}ms`);
      
      if (!response.ok) {
        console.error('   ❌ Error:', data.error || 'Unknown error');
        if (data.details) console.log('   Details:', data.details);
      } else {
        console.log('   ✅ Success!');
        console.log(`   Verses: ${data.verses?.length || 0}`);
        
        // Log first few verses if available
        if (data.verses && data.verses.length > 0) {
          console.log('\n   Sample Verses:');
          data.verses.slice(0, 3).forEach((verse, index) => {
            console.log(`   ${index + 1}. ${verse.verse}. ${verse.text.substring(0, 50)}...`);
          });
          if (data.verses.length > 3) {
            console.log(`   ... and ${data.verses.length - 3} more`);
          }
        }
      }
    } catch (error) {
      console.error('   ❌ Request failed:', error.message);
    }
    
    console.log('\n' + '-'.repeat(80) + '\n');
  }
}

// Run the tests
testKjvApi().catch(console.error);
