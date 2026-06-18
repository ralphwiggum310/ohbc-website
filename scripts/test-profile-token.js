// Test profile API with admin user
import jwt from 'jsonwebtoken';

// Create a test JWT token for admin user (ID: 40)
const adminToken = jwt.sign(
  { 
    userId: 40, 
    email: 'admin@ohbc.local', 
    role: 'Super Admin' 
  },
  'your-secret-key-change-in-production',
  { expiresIn: '1h' }
);

console.log('Test JWT token for admin user:');
console.log('Token:', adminToken);
console.log('Decoded:', jwt.decode(adminToken));

// Test the token parsing function
function getUserIdFromToken(token) {
  try {
    const JWT_SECRET = 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId || decoded.id || null;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

console.log('\\nParsing test token...');
const userId = getUserIdFromToken(adminToken);
console.log('Extracted user ID:', userId);
