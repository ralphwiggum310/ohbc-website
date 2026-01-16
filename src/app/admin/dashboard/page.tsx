'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    description: 'Manage church announcements',
    comingSoon: false,
  },
  {
    name: 'Prayer Requests',
    href: '#', // TODO: Update with actual path
    icon: FiMessageSquare,
    description: 'View and manage prayer requests',
    comingSoon: true,
  },
  {
    name: 'Schedules',
    href: '#', // TODO: Update with actual path
    icon: FiCalendar,
    description: 'Manage church schedules',
    comingSoon: true,
  },
  {
    name: 'Users',
    href: '#', // TODO: Update with actual path
    icon: FiUsers,
    description: 'Manage user accounts',
    comingSoon: true,
  },
  {
    name: 'Statistics',
    href: '#',
    icon: FiBarChart2,
    description: 'View site statistics',
    comingSoon: true,
  },
  {
    name: 'Settings',
    href: '#', // TODO: Update with actual path
    icon: FiSettings,
    description: 'Configure site settings',
    comingSoon: true,
  },
];

export default function AdminDashboard() {
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

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {/* Stats Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Statistics</h2>
            <button
              onClick={loadStats}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <FiRefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
              ) : (
                <FiRefreshCw className="-ml-1 mr-2 h-4 w-4" />
              )}
              Refresh
            </button>
          </div>
          
          {error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
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

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Link 
                key={card.name}
                href={card.comingSoon ? '#' : card.href}
                className={`group bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 ${card.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                aria-disabled={card.comingSoon}
                tabIndex={card.comingSoon ? -1 : 0}
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                        {card.name}
                        {card.comingSoon && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Coming Soon
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
