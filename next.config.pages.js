// This file helps Next.js understand which pages should be excluded from static generation
const excludeFromStaticGeneration = [
  '/api/auth/**',
  '/admin/**',
  '/dashboard/**',
  '/_error',
  '/_document',
  '/_app'
];

// This will be used in next.config.js
export default excludeFromStaticGeneration;
