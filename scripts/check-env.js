// Script to check environment configuration for Bible API
require('dotenv').config({ path: '.env.local' });

console.log('Checking environment configuration...\n');

const requiredVars = [
  'ESV_API_KEY',
  'BIBLE_API_KEY',
  'NEXT_PUBLIC_ESV_API_KEY',
  'NEXT_PUBLIC_BIBLE_API_KEY'
];

console.log('Environment Variables:');
console.log('---------------------');

let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = value !== undefined && value !== '';
  
  if (isPresent) {
    const maskedValue = value.substring(0, 5) + '*'.repeat(Math.max(0, value.length - 5));
    console.log(`✅ ${varName}=${maskedValue}`);
  } else {
    console.log(`❌ ${varName} is not set`);
    allVarsPresent = false;
  }
});

console.log('\nEnvironment File Check:');
console.log('----------------------');

const fs = require('fs');
const envPath = '.env.local';
const envExamplePath = '.env.example';

try {
  const envExists = fs.existsSync(envPath);
  const envExampleExists = fs.existsSync(envExamplePath);
  
  console.log(`🔍 ${envPath}: ${envExists ? 'Found' : 'Not found'}`);
  console.log(`📝 ${envExamplePath}: ${envExampleExists ? 'Found' : 'Not found'}`);
  
  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasApiKeys = envContent.includes('BIBLE_API_KEY') && envContent.includes('ESV_API_KEY');
    console.log(`   Contains API keys: ${hasApiKeys ? '✅ Yes' : '❌ No'}`);
  }
  
  if (envExampleExists) {
    const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
    const hasApiKeyPlaceholders = exampleContent.includes('BIBLE_API_KEY') && exampleContent.includes('ESV_API_KEY');
    console.log(`   Example contains API key placeholders: ${hasApiKeyPlaceholders ? '✅ Yes' : '❌ No'}`);
  }
} catch (error) {
  console.error('Error checking environment files:', error.message);
}

console.log('\nNext.js Environment:');
console.log('-------------------');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set (defaults to development)'}`);
console.log(`NEXT_PHASE: ${process.env.NEXT_PHASE || 'Not set'}`);
console.log(`NEXT_PUBLIC_VERCEL_ENV: ${process.env.NEXT_PUBLIC_VERCEL_ENV || 'Not set'}`);

console.log('\nConclusion:');
console.log('-----------');
if (allVarsPresent) {
  console.log('✅ All required environment variables are present');
  console.log('💡 If you\'re still having issues, check that the keys have the correct permissions and are not rate-limited.');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('💡 Make sure to set up your .env.local file with all required API keys');
  console.log('   You can copy .env.example to .env.local and fill in your API keys');
}

console.log('\nTo set up your environment:');
console.log('1. Create a .env.local file if it doesn\'t exist');
console.log('2. Add your API keys:');
console.log('   ESV_API_KEY=your_esv_key_here');
console.log('   BIBLE_API_KEY=your_bible_api_key_here');
console.log('3. Restart your development server after making changes');
