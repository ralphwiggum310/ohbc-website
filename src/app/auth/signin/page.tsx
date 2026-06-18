'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await login(email, password);

      if (result.success) {
        setMessage('Login successful! Redirecting...');
        const verifyRes = await fetch('/api/auth/verify');
        const verifyData = await verifyRes.json();
        const role = verifyData.user?.role ?? '';
        setTimeout(() => {
          if (role === 'Admin' || role === 'Super Admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/members/dashboard');
          }
        }, 900);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f4f0] dark:bg-gray-950">
      {/* Top maroon banner */}
      <div className="w-full py-6" style={{ backgroundColor: '#5c1a1a' }}>
        <div className="max-w-md mx-auto flex flex-col items-center px-4">
          <Link href="/">
            <Image
              src="/logo/logo and name White (transparent).png"
              alt="Orchard Hills Bible Church"
              width={220}
              height={60}
              className="h-14 w-auto"
              priority
            />
          </Link>
          <p className="mt-2 text-sm text-white/80">Member Portal</p>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          {/* Card header */}
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sign in to access member-only content and resources.
            </p>
          </div>

          {/* Divider */}
          <div className="mx-8 border-t border-gray-100 dark:border-gray-700" />

          <div className="px-8 py-6">
            {message && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                  style={{ '--tw-ring-color': '#5c1a1a' } as React.CSSProperties}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium hover:underline"
                    style={{ color: '#5c1a1a' }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#5c1a1a' }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-xs text-gray-400">
              Need access?{' '}
              <Link href="/become-a-member" className="font-medium hover:underline" style={{ color: '#5c1a1a' }}>
                Learn about membership
              </Link>
            </p>
          </div>
        </div>

      </div>

      {/* Back to site link */}
      <div className="py-6 text-center">
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline">
          ← Back to Orchard Hills Bible Church
        </Link>
      </div>
    </div>
  );
}
