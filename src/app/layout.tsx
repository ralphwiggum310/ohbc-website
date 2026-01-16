'use client';

import { Inter } from 'next/font/google';
import { ErrorBoundary } from 'react-error-boundary';
import { ReactNode } from 'react';
import '../styles/globals.css';
import Navbar from './components/Navbar';

// Initialize the Inter font with the required subsets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Error boundary fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-700 mb-6">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Root layout with SessionProvider
export default function RootLayout({ children }: { children: ReactNode }) {

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>Orchard Hills Bible Church</title>
        <meta name="description" content="Welcome to Orchard Hills Bible Church - A place to belong, believe, and become who God created you to be." />
      </head>
      <body className="font-sans bg-gray-50">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Navbar hideInitially={true} />
          <main className="min-h-[calc(100vh-4rem)] pt-16">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
