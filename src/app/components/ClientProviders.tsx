'use client';

import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';

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

// Client component for the providers
export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
            <Navbar />
            <main className="flex-1">{children}</main>
            <MobileBottomNav />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}
