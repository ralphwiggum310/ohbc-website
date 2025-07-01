// Simple test script to verify Bible API key
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.BIBLE_API_KEY;
const API_BASE_URL = 'https://api.scripture.api.bible/v1/bibles';

async function testBibleAPI() {
  try {
    if (!API_KEY) {
      console.error('ERROR: BIBLE_API_KEY is not set in environment variables');
      return;
    }

    console.log('Testing Bible API with key:', API_KEY ? 'Key found' : 'No key found');
    
    // Test listing Bibles (should work with any valid key)
    const response = await axios.get(`${API_BASE_URL}`, {
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    
    console.log('✅ Success! Your Bible API key is working correctly.');
    console.log(`Found ${response.data.data.length} Bible versions`);
    
  } catch (error) {
    console.error('❌ Error testing Bible API:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.error('\n🔑 Authentication failed. Your BIBLE_API_KEY might be invalid.');
      console.log('\nTo get a new API key:');
      console.log('1. Go to https://scripture.api.bible/');
      console.log('2. Sign in to your account');
      console.log('3. Go to API Keys section');
      console.log('4. Create a new key or copy an existing one');
      console.log('5. Update your .env.local file with the new key');
    }
  }
}

testBibleAPI();
