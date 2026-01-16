const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

const PDFJS_VERSION = '3.11.174';
const BASE_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
const FILES = [
  'web/viewer.html',
  'web/viewer.css',
  'web/viewer.js',
  'web/viewer.html',
  'web/locale/locale/en-US/viewer.properties',
  'build/pdf.js',
  'build/pdf.worker.js',
  'build/pdf.sandbox.js',
  'web/debugger.js',
  'web/cmaps/'
];

async function downloadFile(url, filePath) {
  console.log(`Downloading ${url} to ${filePath}`);
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const response = await new Promise((resolve) => {
    https.get(url, resolve);
  });

  if (response.statusCode !== 200) {
    throw new Error(`Failed to download ${url}: ${response.statusCode}`);
  }

  await pipeline(response, fs.createWriteStream(filePath));
  console.log(`Downloaded ${filePath}`);
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public', 'pdfjs');
  
  for (const file of FILES) {
    const url = `${BASE_URL}/${file}`;
    const filePath = path.join(publicDir, file);
    
    try {
      if (file.endsWith('/')) {
        // It's a directory
        fs.mkdirSync(filePath, { recursive: true });
        console.log(`Created directory ${filePath}`);
      } else {
        await downloadFile(url, filePath);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
  
  console.log('PDF.js viewer setup complete!');
}

main().catch(console.error);
