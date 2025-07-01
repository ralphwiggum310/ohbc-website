// Simple script to test the Bible API key
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.BIBLE_API_KEY;
const API_URL = 'https://api.scripture.api.bible/v1/bibles';

async function testKey() {
  if (!API_KEY) {
    console.error('❌ Error: BIBLE_API_KEY not found in .env.local');
    return;
  }

  console.log('Testing Bible API key...');
  console.log(`Key: ${API_KEY.substring(0, 5)}...${API_KEY.substring(API_KEY.length - 5)}`);

  try {
    const response = await axios.get(API_URL, {
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success! API key is valid');
    console.log(`Found ${response.data.data.length} Bible versions`);
  } catch (error) {
    console.error('❌ Error testing API key:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n🔑 The API key appears to be invalid or expired.');
        console.log('Please get a new key from https://scripture.api.bible/');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received from server');
      console.log('Error:', error.message);
    } else {
      // Something happened in setting up the request
      console.log('Error:', error.message);
    }
  }
}

testKey();
