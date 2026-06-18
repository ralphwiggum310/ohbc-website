'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ServiceRole {
  id: number;
  role_name: string;
  display_name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
}

interface User {
  id: number;
  email: string;
  phone?: string;
  role: string;
  service_roles: string[];
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

export default function SchedulesPage() {
  const [serviceRoles, setServiceRoles] = useState<ServiceRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roleUsers, setRoleUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Get user info first
      const userResponse = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/auth/login');
        return;
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      // Check if user has access to schedules
      const hasScheduleAccess = userData.user.role === 'Super Admin' || 
                              userData.user.role === 'Admin' || 
                              userData.user.role === 'Ministry Leader' ||
                              (userData.user.service_roles && userData.user.service_roles.length > 0);

      if (!hasScheduleAccess) {
        setError('You do not have permission to access schedules.');
        setLoading(false);
        return;
      }

      // Fetch service roles
      await fetchServiceRoles();

    } catch (error) {
      console.error('Error checking auth:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRoles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServiceRoles(data.serviceRoles);
      } else {
        setError('Failed to fetch service roles');
      }
    } catch (error) {
      console.error('Error fetching service roles:', error);
      setError('Network error. Please try again.');
    }
  };

  const fetchRoleUsers = async (roleName: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/schedules?serviceRole=${roleName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoleUsers(data.users);
      } else {
        setError('Failed to fetch role users');
      }
    } catch (error) {
      console.error('Error fetching role users:', error);
      setError('Network error. Please try again.');
    }
  };

  useEffect(() => {
    if (selectedRole) {
      fetchRoleUsers(selectedRole);
    } else {
      setRoleUsers([]);
    }
  }, [selectedRole]);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getRoleIcon = (iconName?: string) => {
    // Simple icon mapping - in a real app, you'd use a proper icon library
    const icons: { [key: string]: string } = {
      'baby': '👶',
      'broom': '🧹',
      'shield': '🛡️',
      'graduation-cap': '🎓',
      'music': '🎵',
      'hand-wave': '👋',
      'users': '👥',
      'monitor': '🖥️'
    };
    return icons[iconName || ''] || '👤';
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
                Service Schedules
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View service team assignments and schedules
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.role} • {user.service_roles?.join(', ') || 'No service roles'}
                </div>
              )}
              <Link
                href="/members/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
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

          {/* Service Roles Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Service Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {serviceRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.role_name)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === role.role_name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: role.color }}
                    >
                      {getRoleIcon(role.icon)}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {role.display_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Role Users */}
          {selectedRole && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {serviceRoles.find(r => r.role_name === selectedRole)?.display_name} Team
                  </h3>
                  <button
                    onClick={() => setSelectedRole('')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {roleUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No team members found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No users are currently assigned to this service role.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roleUsers.map((user) => (
                      <div key={user.id} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex-shrink-0 h-12 w-12">
                          {user.photo_url ? (
                            <img
                              className="h-12 w-12 rounded-full"
                              src={user.photo_url}
                              alt={`${user.first_name} ${user.last_name}`}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {getInitials(user.first_name, user.last_name)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                          <div className="mt-1">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!selectedRole && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                How to Use Service Schedules
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>Click on any service team to view current team members</li>
                <li>View contact information for team coordination</li>
                <li>See member roles and service assignments</li>
                <li>Admin users can manage team assignments through the admin panel</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
