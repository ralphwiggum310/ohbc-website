import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

// Use nodejs runtime for API routes
export const runtime = 'nodejs';
