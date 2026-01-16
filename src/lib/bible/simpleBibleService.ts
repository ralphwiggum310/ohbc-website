import fs from 'fs/promises';
import path from 'path';

// Simple in-memory cache
let cachedData: any = null;

// Direct path to the KJV data file
const KJV_DATA_PATH = path.join(process.cwd(), 'src', 'lib', 'bible', 'data', 'kjv.json');

// Load the KJV data once and cache it
async function loadKjvData() {
  if (cachedData) return cachedData;
  
  console.log(`[simpleBibleService] Loading KJV data from: ${KJV_DATA_PATH}`);
  const fileContent = await fs.readFile(KJV_DATA_PATH, 'utf-8');
  cachedData = JSON.parse(fileContent);
  console.log(`[simpleBibleService] Loaded ${Object.keys(cachedData.books).length} books`);
  return cachedData;
}

export async function getBooks() {
  const data = await loadKjvData();
  return Object.keys(data.books).map(name => ({
    name,
    chapters: Object.keys(data.books[name].chapters).map(Number)
  }));
}

export async function getChapters(bookName: string) {
  const data = await loadKjvData();
  const book = data.books[bookName];
  if (!book) return [];
  return Object.keys(book.chapters).map(Number);
}

export async function getVerses(bookName: string, chapter: number) {
  const data = await loadKjvData();
  const book = data.books[bookName];
  if (!book) return [];
  return book.chapters[chapter] || [];
}
