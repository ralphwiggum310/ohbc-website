// Test JWT verification with the correct secret
import jwt from 'jsonwebtoken';

// Create a test JWT token with the correct secret (matching auth.js)
const adminToken = jwt.sign(
  { 
    userId: 40, 
    email: 'admin@ohbc.local', 
    role: 'Super Admin' 
  },
  'your-secret-key-change-in-production', // This matches the auth library
  { expiresIn: '1h' }
);

console.log('Testing JWT verification with correct secret...');

// Test the function from profile API
function getUserIdFromToken(token) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'; // Fixed secret
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId || decoded.id || null;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

const userId = getUserIdFromToken(adminToken);
console.log('✅ Successfully extracted user ID:', userId);

// Test with wrong secret (showing the original problem)
function getUserIdFromTokenWrong(token) {
  try {
    const JWT_SECRET = 'your-secret-key'; // Wrong secret (original problem)
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId || decoded.id || null;
  } catch (error) {
    console.error('❌ JWT verification error with wrong secret:', error.message);
    return null;
  }
}

console.log('\\nTesting with wrong secret (original problem)...');
const userIdWrong = getUserIdFromTokenWrong(adminToken);
console.log('Result with wrong secret:', userIdWrong);
