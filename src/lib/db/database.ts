// This is a client-safe wrapper around the server database utilities
// Importing this file on the client will work, but database operations will fail
// unless they're performed in a server context (API routes, server components, or server actions)

import { closeDatabase } from './server-db';

export { 
  getDatabase, 
  getRepository, 
  closeDatabase 
} from './server-db';

export const isServer = typeof window === 'undefined';

// Handle application shutdown
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
