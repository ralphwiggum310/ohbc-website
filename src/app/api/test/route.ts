import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.BIBLE_API_KEY;
  const isKeySet = !!apiKey && apiKey !== 'your_api_key_here';
  
  return NextResponse.json({
    isKeySet,
    keyLength: apiKey?.length || 0,
    message: isKeySet 
      ? 'API key is set and looks valid' 
      : 'API key is missing or not properly set in .env.local',
    hint: isKeySet 
      ? '✅ Your API key is set up correctly!' 
      : '❌ Please check your .env.local file and restart the development server'
  });
}
