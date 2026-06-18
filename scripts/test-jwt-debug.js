// Test JWT token creation and verification
import jwt from 'jsonwebtoken';

console.log('Testing JWT token creation and verification...');

// Create a test token like the auth library does
const testToken = jwt.sign(
  { 
    userId: 40, 
    email: 'admin@ohbc.local', 
    role: 'Super Admin' 
  },
  'your-secret-key-change-in-production',
  { expiresIn: '1h' }
);

console.log('Test token created:', testToken);

// Test verification like the profile API does
function getUserIdFromToken(token) {
  try {
    const JWT_SECRET = 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId || decoded.id || null;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

const userId = getUserIdFromToken(testToken);
console.log('Extracted user ID:', userId);

// Test with a slightly different secret (common mistake)
console.log('\\nTesting with wrong secret...');
function getUserIdFromTokenWrong(token) {
  try {
    const JWT_SECRET = 'your-secret-key'; // Wrong
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId || decoded.id || null;
  } catch (error) {
    console.error('JWT verification error with wrong secret:', error.message);
    return null;
  }
}

const userIdWrong = getUserIdFromTokenWrong(testToken);
console.log('Result with wrong secret:', userIdWrong);

// Test expired token
console.log('\\nTesting expired token...');
const expiredToken = jwt.sign(
  { 
    userId: 40, 
    email: 'admin@ohbc.local', 
    role: 'Super Admin' 
  },
  'your-secret-key-change-in-production',
  { expiresIn: '-1h' } // Expired 1 hour ago
);

const userIdExpired = getUserIdFromToken(expiredToken);
console.log('Result with expired token:', userIdExpired);
