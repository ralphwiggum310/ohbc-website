'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiBarChart2, FiUsers, FiEye, FiDownload, FiCalendar } from 'react-icons/fi';

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
};

const MetricCard = ({ title, value, icon, trend }: MetricCardProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        {trend !== undefined && (
          <p className={`mt-1 text-sm ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
          </p>
        )}
      </div>
      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
    </div>
  </div>
);

export default function StatisticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    visitors: 0,
    pageViews: 0,
    downloads: 0,
    avgTimeOnSite: '0:00',
  });
  const [dateRange, setDateRange] = useState('week');
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication and admin status
  useEffect(() => {
    const checkAuth = async () => {
      const session = await auth();
      if (!session) {
        redirect('/api/auth/signin');
      }
      
      const user = session.user as { role?: string };
      if (user.role !== 'admin') {
        redirect('/admin/dashboard');
      }
      
      setIsAdmin(true);
      // Simulate loading data
      setTimeout(() => {
        // In a real implementation, fetch data from Matomo API here
        setMetrics({
          visitors: 1242,
          pageViews: 5678,
          downloads: 342,
          avgTimeOnSite: '4:32',
        });
        setIsLoading(false);
      }, 1000);
    };

    checkAuth();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Website Analytics</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Track and analyze website traffic and user behavior
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setDateRange('week')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  dateRange === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 text-sm font-medium ${
                  dateRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setDateRange('year')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  dateRange === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                This Year
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Visitors"
                value={metrics.visitors.toLocaleString()}
                icon={<FiUsers className="h-6 w-6" />}
                trend={12.5}
              />
              <MetricCard
                title="Page Views"
                value={metrics.pageViews.toLocaleString()}
                icon={<FiEye className="h-6 w-6" />}
                trend={8.2}
              />
              <MetricCard
                title="Downloads"
                value={metrics.downloads.toLocaleString()}
                icon={<FiDownload className="h-6 w-6" />}
                trend={-3.1}
              />
              <MetricCard
                title="Avg. Time on Site"
                value={metrics.avgTimeOnSite}
                icon={<FiCalendar className="h-6 w-6" />}
              />
            </div>

            {/* Charts Section */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Visitors Overview</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-gray-500 dark:text-gray-400">Visitor chart will be displayed here</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Pages</h3>
                <div className="space-y-4">
                  {['Home', 'Sermons', 'About Us', 'Events', 'Contact'].map((page, index) => (
                    <div key={page} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{page}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{Math.floor(Math.random() * 1000)} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
