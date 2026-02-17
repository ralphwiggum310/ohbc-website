'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  FiUpload, 
  FiSettings, 
  FiMessageSquare, 
  FiCalendar, 
  FiUsers, 
  FiBarChart2,
  FiHome,
  FiFileText,
  FiHardDrive,
  FiFolder,
  FiRefreshCw
} from 'react-icons/fi';
import { StatsDisplay } from './StatsDisplay';
import { fetchStats } from './StatsFetcher';

// Types for statistics
export interface SectionStats {
  count: number;
  size: number;
}

export interface StatsData {
  totalAnnouncements: number;
  totalSize: number;
  sections: Record<string, SectionStats>;
  lastUpdated: string;
}

const cards = [
  {
    name: 'Announcements',
    href: '/admin/announcements',
    icon: FiFileText,
    description: 'Manage church announcements and updates',
    comingSoon: false,
    color: 'from-blue-500 to-blue-600',
    darkColor: 'from-blue-600 to-blue-700',
  },
  {
    name: 'Prayer Requests',
    href: '/admin/prayer-requests',
    icon: FiMessageSquare,
    description: 'View and manage prayer requests',
    comingSoon: false,
    color: 'from-emerald-500 to-emerald-600',
    darkColor: 'from-emerald-600 to-emerald-700',
  },
  {
    name: 'Events',
    href: '/admin/events',
    icon: FiCalendar,
    description: 'Manage church events and schedules',
    comingSoon: false,
    color: 'from-purple-500 to-purple-600',
    darkColor: 'from-purple-600 to-purple-700',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: FiUsers,
    description: 'Manage user accounts and permissions',
    comingSoon: false,
    color: 'from-amber-500 to-amber-600',
    darkColor: 'from-amber-600 to-amber-700',
  },
  {
    name: 'Statistics',
    href: '/admin/statistics',
    icon: FiBarChart2,
    description: 'View site analytics and metrics',
    comingSoon: false,
    color: 'from-rose-500 to-rose-600',
    darkColor: 'from-rose-600 to-rose-700',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: FiSettings,
    description: 'Configure site settings and preferences',
    comingSoon: false,
    color: 'from-gray-500 to-gray-600',
    darkColor: 'from-gray-600 to-gray-700',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await fetchStats();
      
      if (fetchError) {
        setError(fetchError);
      } else if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login');
      router.push('/auth/signin?callbackUrl=/admin/dashboard');
    } else if (status === 'authenticated') {
      console.log('User authenticated:', session.user);
    }
  }, [status, router, session]);

  // Load stats on mount - only when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      loadStats();
    }
  }, [status]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Welcome back! Here's what's happening with your church management.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
        {/* Stats Section */}
        <div className="mb-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard Overview</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Key metrics and quick actions</p>
              </div>
              <button
                onClick={loadStats}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <FiRefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                ) : (
                  <FiRefreshCw className="-ml-1 mr-2 h-4 w-4" />
                )}
                Refresh Data
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading statistics</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-800/50"
                        onClick={loadStats}
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <StatsDisplay 
                initialData={stats} 
                error={error} 
                onRefresh={loadStats}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <div className="px-1 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Access admin tools and features</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Link 
                key={card.name}
                href={card.comingSoon ? '#' : card.href}
                className={`relative group overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 block h-full ${
                  !card.comingSoon ? 'hover:shadow-lg hover:-translate-y-1' : 'cursor-not-allowed'
                }`}
                aria-disabled={card.comingSoon}
                tabIndex={card.comingSoon ? -1 : 0}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${card.color} ${card.darkColor} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
                
                <div className="p-6">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r ${card.color} ${card.darkColor} shadow-md`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5">
                      <div className="flex items-center">
                        <h3 className={`text-lg font-semibold ${
                          card.comingSoon 
                            ? 'text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        } transition-colors duration-200`}>
                          {card.name}
                        </h3>
                        {card.comingSoon && (
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className={`mt-1.5 text-sm ${
                        card.comingSoon 
                          ? 'text-gray-400 dark:text-gray-500' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {card.description}
                      </p>
                      {!card.comingSoon && (
                        <div className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-200">
                          Open {card.name.toLowerCase()}
                          <svg className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
