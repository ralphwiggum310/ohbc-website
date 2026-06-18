// Test directory API with unified database
import { searchDirectory, getCategories, getFeaturedEntries } from '../src/lib/directory-unified.js';

console.log('=== DIRECTORY API TEST ===');

// Test 1: Basic search
console.log('\n1. Testing basic search...');
const searchResults = searchDirectory('', {});
console.log(`Found ${searchResults.length} users`);
if (searchResults.length > 0) {
  const first = searchResults[0];
  console.log('First user:', first.first_name, first.last_name);
  console.log('Has photo:', !!first.photo_url);
  console.log('Has email:', !!first.primary_email);
  console.log('Membership status:', first.membership_status);
}

// Test 2: Search with term
console.log('\n2. Testing search with term...');
const searchWithTerm = searchDirectory('allen', {});
console.log(`Found ${searchWithTerm.length} users matching 'allen'`);

// Test 3: Categories
console.log('\n3. Testing categories...');
const categories = getCategories();
console.log(`Found ${categories.length} categories`);

// Test 4: Featured entries
console.log('\n4. Testing featured entries...');
const featured = getFeaturedEntries(3);
console.log(`Found ${featured.length} featured entries`);

console.log('\n=== TEST COMPLETE ===');
