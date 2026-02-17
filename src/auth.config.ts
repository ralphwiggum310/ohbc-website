import type { DefaultSession, NextAuthOptions } from 'next-auth';

import CredentialsProvider from 'next-auth/providers/credentials';

// Enable debug in development
const debug = process.env.NODE_ENV === 'development';

// Types are now defined at the top of the file

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: 'Ohbc@1970',
  user: {
    id: '1',
    name: 'Admin',
    email: 'orchardhillsbiblechurch@gmail.com',
    role: 'admin' as const
  }
};

// Custom logger implementation
const customLogger = {
  error: (code: string, metadata: unknown) => {
    console.error(code, metadata);
  },
  warn: (code: string) => {
    console.warn(code);
  },
  debug: (code: string, metadata: unknown) => {
    console.log(code, metadata);
  }
};

export const authConfig: NextAuthOptions = {
  debug: debug,
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    // Use a secure secret for JWT signing
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
    // Set a reasonable expiration time
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  logger: debug ? customLogger : undefined,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (debug) {
        console.log('SignIn Callback:', { user, account, profile, email, credentials });
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/admin/dashboard';
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      // Initial sign in
      if (user) {
        token = {
          ...token,
          id: user.id,
          role: (user as any).role || 'user',
          name: user.name,
          email: user.email,
        };
      }
      if (debug) {
        console.log('JWT Callback:', { token, user, account });
      }
      return token;
    },
    async session({ session, token, user }) {
      // Ensure session has the required user data
      if (token) {
        (session.user as any) = {
          ...(session.user as any),
          id: (token as any).id as string,
          name: token.name as string,
          email: token.email as string | null | undefined,
          role: token.role as string,
        };
        
        if (debug) {
          console.log('Session Callback:', { session, token, user });
        }
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        
        const { username, password } = credentials;
        
        // In a real app, you would validate the credentials against your database
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
          if (debug) {
            console.log('Authentication successful for user:', username);
          }
          return {
            id: ADMIN_CREDENTIALS.user.id,
            name: ADMIN_CREDENTIALS.user.name,
            email: ADMIN_CREDENTIALS.user.email,
            role: ADMIN_CREDENTIALS.user.role
          };
        }
        
        // If credentials are invalid
        if (debug) {
          console.log('Authentication failed for user:', username);
        }
        
        return null;
      },
    }),
  ],
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }
        
        // Trim and normalize input
        const username = credentials.username.toString().trim();
        const password = credentials.password.toString().trim();
        
        // Hardcoded admin credentials
        if (username === 'Admin' && password === 'Ohbc@1970') {
          console.log('Authentication successful');
          return {
            id: '1',
            name: 'Admin',
            email: 'orchardhillsbiblechurch@gmail.com',
            role: 'admin'
          };
        }
        
        // If credentials are invalid
        console.log('Authentication failed for user:', username);
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};
