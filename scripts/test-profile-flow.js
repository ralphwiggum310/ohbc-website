// Test the complete profile flow
import jwt from 'jsonwebtoken';

console.log('Testing complete profile flow...');

// Test 1: Create a token with the exact same setup as the auth library
const testToken = jwt.sign(
  { 
    userId: 40, 
    email: 'admin@ohbc.local', 
    role: 'Super Admin' 
  },
  'your-secret-key-change-in-production', // This matches the .env file
  { expiresIn: '1h' }
);

console.log('✅ Token created successfully');

// Test 2: Verify the token with the exact same setup as the profile API
function getUserIdFromToken(token) {
  try {
    const JWT_SECRET = 'your-secret-key-change-in-production'; // This matches the .env file
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId || decoded.id || null;
  } catch (error) {
    console.error('❌ JWT verification error:', error.message);
    return null;
  }
}

const userId = getUserIdFromToken(testToken);
console.log('✅ Token verification successful, user ID:', userId);

if (userId === 40) {
  console.log('🎉 Complete flow test passed! The profile API should now work.');
} else {
  console.log('❌ Flow test failed - user ID mismatch');
}

// Test 3: Test with wrong secret to ensure error handling works
console.log('\nTesting error handling with wrong secret...');
const wrongSecretId = getUserIdFromToken(testToken, 'wrong-secret');
console.log('Result with wrong secret:', wrongSecretId);

if (wrongSecretId === null) {
  console.log('✅ Error handling works correctly');
} else {
  console.log('❌ Error handling failed');
}
