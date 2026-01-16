import fetch from 'node-fetch';
import http from 'http';
import https from 'https';

// Create custom agent to handle self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Only for testing, not for production
});

const httpAgent = new http.Agent({
  keepAlive: true
});

const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/bible/passage';

async function testEndpoint(book, chapter, version = 'kjv') {
  const url = new URL(ENDPOINT, BASE_URL);
  url.searchParams.set('book', book);
  url.searchParams.set('chapter', chapter);
  url.searchParams.set('version', version);
  
  console.log(`\nTesting: ${url.toString()}`);
  
  try {
    const response = await fetch(url.toString(), {
      agent: url => url.protocol === 'https:' ? httpsAgent : httpAgent
    });
    
    const data = await response.json().catch(() => ({}));
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.verses) {
      console.log(`✅ Successfully retrieved ${data.verses.length} verses`);
      console.log(`📖 ${data.reference} (${data.version}):`);
      data.verses.slice(0, 3).forEach((v, i) => {
        console.log(`   ${v.verse}. ${v.text.substring(0, 60)}${v.text.length > 60 ? '...' : ''}`);
        if (i === 2 && data.verses.length > 3) {
          console.log(`   ... and ${data.verses.length - 3} more verses`);
        }
      });
    }
    
    return { status: response.status, data };
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('Starting API endpoint tests...');
  
  // Test valid requests
  await testEndpoint('genesis', 1, 'kjv');
  await testEndpoint('psalm', 23, 'esv');
  
  // Test error cases
  await testEndpoint('', 1); // Missing book
  await testEndpoint('nonexistent', 1); // Invalid book
  await testEndpoint('genesis', 1, 'invalid_version'); // Invalid version
  
  console.log('\nTests completed');
}

runTests().catch(console.error);
