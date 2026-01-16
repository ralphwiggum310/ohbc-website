import type { DefaultSession, User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Enable debugging in development
const DEBUG = process.env.NODE_ENV === 'development';

// Extend the User and Session types
declare module 'next-auth' {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      role?: string;
    } & DefaultSession['user'];
  }
}

type JWTParams = {
  token: JWT;
  user?: User;
  trigger?: 'signIn' | 'signUp' | 'update';
  session?: any;
};

type SessionParams = {
  session: Session;
  token: JWT;
};

type RedirectParams = {
  url: string;
  baseUrl: string;
};

export const authConfig: NextAuthOptions = {
  debug: DEBUG,
  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: JWTParams) {
      if (DEBUG) {
        console.log('JWT Callback - Token:', JSON.stringify(token, null, 2));
        console.log('JWT Callback - User:', JSON.stringify(user, null, 2));
      }
      
      // Initial sign in
      if (user) {
        token.role = (user as User & { role?: string }).role || 'user';
      }
      
      // Update token with session data if needed
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }: SessionParams): Promise<Session> {
      if (DEBUG) {
        console.log('Session Callback - Token:', JSON.stringify(token, null, 2));
        console.log('Session Callback - Session:', JSON.stringify(session, null, 2));
      }
      
      if (session.user) {
        session.user.role = (token.role as string) || 'user';
      }
      
      return session;
    },
    async redirect({ url, baseUrl }: RedirectParams) {
      if (DEBUG) console.log('Redirect Callback - URL:', url, 'Base URL:', baseUrl);
      
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch (e) {
        if (DEBUG) console.error('Invalid URL in redirect:', e);
      }
      
      return baseUrl;
    },
  },
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // JWT configuration
  jwt: {
    // Use a consistent secret for both signing and encryption
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-at-least-32-characters',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Use the same secret for NextAuth
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-at-least-32-characters',
  trustHost: true,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminUsername = 'Admin';
        const adminPassword = 'Ohbc@1970';
        
        if (credentials?.username === adminUsername && credentials?.password === adminPassword) {
          return { 
            id: '1',
            name: 'Admin',
            email: 'orchardhillsbiblechurch@gmail.com',
            role: 'admin',
          };
        }
        return null;
      },
    }),
  ]
};
