// This file ensures that any imports from this file are server-side only
// Check if we're in a browser environment
export const isServer = () => typeof window === 'undefined';

// Helper to throw an error if used on the client side
export function assertServerSide() {
  if (!isServer()) {
    throw new Error('This code can only be used on the server side');
  }
}
