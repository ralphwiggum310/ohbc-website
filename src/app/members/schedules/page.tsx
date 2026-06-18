'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ServingSchedule {
  id: number;
  user_id: number;
  ministry_area: string;
  schedule_date: string;
  role_in_ministry: string;
  status: string;
  notes?: string;
  first_name?: string;
  last_name?: string;
}

export default function ServingSchedules() {
  const [schedules, setSchedules] = useState<ServingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchSchedules();
  }, []);

  const checkAuthAndFetchSchedules = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Verify token first
      const authResponse = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!authResponse.ok) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/auth/login');
        return;
      }

      // Fetch serving schedules
      const schedulesResponse = await fetch('/api/serving/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (schedulesResponse.ok) {
        const data = await schedulesResponse.json();
        setSchedules(data.schedules);
      } else {
        setError('Failed to load serving schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Serving Schedules
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage your serving assignments
              </p>
            </div>
            <Link
              href="/members/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No serving schedules found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You don't have any serving assignments yet.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Your Serving Assignments
                </h3>
                
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {schedule.ministry_area}
                            </h4>
                            <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                              {schedule.status}
                            </span>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(schedule.schedule_date)} at {formatTime(schedule.schedule_date)}
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Role: {schedule.role_in_ministry}
                            </div>
                            
                            {schedule.first_name && schedule.last_name && (
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {schedule.first_name} {schedule.last_name}
                              </div>
                            )}
                          </div>
                          
                          {schedule.notes && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Notes:</span> {schedule.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
