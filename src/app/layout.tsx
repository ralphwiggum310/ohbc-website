'use client';

import { Inter } from 'next/font/google';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '../styles/globals.css';
import Navbar from './components/Navbar';
import Head from 'next/head';

// Initialize the Inter font with the required subsets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Error boundary fallback component
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{errorMessage}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Root layout with ThemeProvider
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <Head>
        <title>Orchard Hills Bible Church</title>
        <meta name="description" content="Welcome to Orchard Hills Bible Church - A place to belong, believe, and become who God created you to be." />
        <style>{`
          :root {
            --color-primary-50: #f0f9ff;
            --color-primary-100: #e0f2fe;
            --color-primary-200: #bae6fd;
            --color-primary-300: #7dd3fc;
            --color-primary-400: #38bdf8;
            --color-primary-500: #0ea5e9;
            --color-primary-600: #0284c7;
            --color-primary-700: #0369a1;
            --color-primary-800: #075985;
            --color-primary-900: #0c4a6e;
            
            --color-secondary-50: #f8fafc;
            --color-secondary-100: #f1f5f9;
            --color-secondary-200: #e2e8f0;
            --color-secondary-300: #cbd5e1;
            --color-secondary-400: #94a3b8;
            --color-secondary-500: #64748b;
            --color-secondary-600: #475569;
            --color-secondary-700: #334155;
            --color-secondary-800: #1e293b;
            --color-secondary-900: #0f172a;
          }
          
          .dark {
            --color-primary-50: #f0f9ff;
            --color-primary-100: #e0f2fe;
            --color-primary-200: #bae6fd;
            --color-primary-300: #7dd3fc;
            --color-primary-400: #38bdf8;
            --color-primary-500: #0ea5e9;
            --color-primary-600: #0284c7;
            --color-primary-700: #0369a1;
            --color-primary-800: #075985;
            --color-primary-900: #0c4a6e;
            
            --color-secondary-50: #0f172a;
            --color-secondary-100: #1e293b;
            --color-secondary-200: #334155;
            --color-secondary-300: #475569;
            --color-secondary-400: #64748b;
            --color-secondary-500: #94a3b8;
            --color-secondary-600: #cbd5e1;
            --color-secondary-700: #e2e8f0;
            --color-secondary-800: #f1f5f9;
            --color-secondary-900: #f8fafc;
          }
        `}</style>
      </Head>
      <body className="bg-white dark:bg-gray-900">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <SessionProvider>
            <ThemeProvider>
              <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
                <Navbar />
                <main className="flex-1">{children}</main>
              </div>
            </ThemeProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
