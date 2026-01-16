// Test script to verify Bible API keys
const dotenv = require('dotenv');
const path = require('path');

// Type definitions for API responses
interface EsvResponse {
  canonical: string;
  passages: string[];
  [key: string]: unknown;
}

interface BibleApiBookResponse {
  data: {
    name: string;
    abbreviation: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface BibleApiBiblesResponse {
  data: Array<{
    id: string;
    name: string;
    description: string;
    language: {
      name: string;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

// Helper function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Get API keys from environment variables
const ESV_API_TOKEN = process.env.ESV_API_TOKEN;
const BIBLE_API_TOKEN = process.env.BIBLE_API_KEY; // Changed from BIBLE_API_TOKEN to BIBLE_API_KEY

// Test ESV API
async function testEsvApi() {
  if (!ESV_API_TOKEN) {
    console.error('❌ ESV_API_TOKEN is not set in .env.local');
    return false;
  }

  try {
    const response = await fetch(
      'https://api.esv.org/v3/passage/text/?q=John%203:16',
      {
        headers: {
          'Authorization': `Token ${ESV_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as EsvResponse;
    console.log('✅ ESV API test successful!');
    console.log(`📖 ${data.canonical}: ${data.passages[0].substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.error('❌ ESV API test failed:', getErrorMessage(error));
    return false;
  }
}

// Test Bible API (API.Bible)
async function testBibleApi() {
  if (!BIBLE_API_TOKEN) {
    console.log('ℹ️ BIBLE_API_TOKEN is not set in .env.local (required for KJV/NIV/NASB)');
    return false;
  }

  try {
    // First, list available Bibles to verify the API key works
    const biblesResponse = await fetch(
      'https://api.scripture.api.bible/v1/bibles',
      {
        headers: {
          'api-key': BIBLE_API_TOKEN,
        },
      }
    );

    if (!biblesResponse.ok) {
      const errorText = await biblesResponse.text();
      throw new Error(`Failed to fetch Bibles list: ${biblesResponse.status} ${biblesResponse.statusText}\n${errorText}`);
    }

    const biblesData = await biblesResponse.json() as BibleApiBiblesResponse;
    console.log('✅ Bible API test successful!');
    console.log('📚 Available Bibles:');
    
    // Log the first few available Bibles
    const bibles = biblesData.data || [];
    bibles.slice(0, 3).forEach((bible: any) => {
      console.log(`- ${bible.name} (${bible.id})`);
    });
    
    if (bibles.length > 3) {
      console.log(`- ...and ${bibles.length - 3} more`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Bible API test failed:', getErrorMessage(error));
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🔍 Starting Bible API tests...\n');
  
  console.log('=== Testing ESV API ===');
  const esvResult = await testEsvApi();
  
  console.log('\n=== Testing Bible API (API.Bible) ===');
  const bibleApiResult = await testBibleApi();
  
  console.log('\n=== Test Summary ===');
  console.log(`ESV API: ${esvResult ? '✅ Success' : '❌ Failed'}`);
  console.log(`Bible API: ${bibleApiResult ? '✅ Success' : '❌ Failed'}`);
  
  if (esvResult && (BIBLE_API_TOKEN ? bibleApiResult : true)) {
    console.log('\n🎉 All configured API tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the error messages above.');
  }
}

runTests().catch(console.error);
