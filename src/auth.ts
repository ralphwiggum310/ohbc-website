import { getServerSession, type DefaultSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

export type { Session } from 'next-auth';

// Extend the User type to include the role
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

// Define the credentials provider
const credentialsProvider = CredentialsProvider({
  name: 'credentials',
  credentials: {
    username: { label: 'Username', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials?.username || !credentials?.password) {
      console.log('Missing credentials');
      return null;
    }

    // Ensure required environment variables are set
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials are not properly configured');
      return null;
    }
    
    console.log('Authorization attempt for username:', credentials.username);
    
    if (credentials.username === adminUsername && credentials.password === adminPassword) {
      const user = { 
        id: '1',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin',
      };
      console.log('User authenticated successfully');
      return user;
    }
    
    console.log('Authentication failed for user:', credentials.username);
    return null;
  },
});

// Create auth configuration
export const authOptions: NextAuthOptions = {
  ...authConfig,
  providers: [credentialsProvider],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

// Export the auth function and other methods
export const auth = () => getServerSession(authOptions);

export const isAdmin = async (): Promise<boolean> => {
  const session = await auth();
  return (session?.user as any)?.role === 'admin';
};

// Export for API routes
export const runtime = 'nodejs';
