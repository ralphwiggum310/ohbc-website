import { NextResponse } from 'next/server';

// This endpoint will help us verify if the Bible API key is being loaded correctly
export async function GET() {
  const apiKey = process.env.BIBLE_API_KEY;
  const isKeyConfigured = !!apiKey;
  
  // Don't expose the actual API key in the response
  return NextResponse.json({
    isConfigured: isKeyConfigured,
    keyLength: isKeyConfigured ? apiKey.length : 0,
    message: isKeyConfigured 
      ? 'Bible API key is configured' 
      : 'Bible API key is NOT configured. Please check your .env.local file',
    hint: isKeyConfigured 
      ? 'Key appears to be properly loaded' 
      : 'Make sure you have BIBLE_API_KEY in your .env.local file and have restarted your dev server'
  });
}
