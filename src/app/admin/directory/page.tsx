'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function Avatar({ photoFilename, firstName, lastName }: {
  photoFilename?: string;
  firstName: string;
  lastName: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

  if (!photoFilename || failed) {
    return (
      <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-gray-600 dark:text-gray-200">{initials}</span>
      </div>
    );
  }

  return (
    <img
      className="h-12 w-12 rounded-full object-cover flex-shrink-0"
      src={`/api/profile-images/${encodeURIComponent(photoFilename)}`}
      alt={`${firstName} ${lastName}`}
      onError={() => setFailed(true)}
    />
  );
}

interface DirectoryEntry {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  suffix?: string;
  nickname?: string;
  photo_url?: string;
  photo_filename?: string;
  bio?: string;
  primary_email?: string;
  secondary_email?: string;
  mobile_phone?: string;
  home_phone?: string;
  work_phone?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  occupation?: string;
  company?: string;
  membership_status?: string;
  ministry_areas?: string[];
  categories?: string[];
  is_public: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_address: boolean;
  show_occupation: boolean;
  category_name?: string;
  category_icon?: string;
  tags?: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminDirectoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/auth/signin'); return; }
    if (user.role !== 'Admin' && user.role !== 'Super Admin') { router.replace('/members/dashboard'); return; }
    fetchEntries();
  }, [user, authLoading]);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/admin/directory?includePrivate=true');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.members || []);
      } else {
        setError('Failed to load directory entries');
      }
    } catch (error) {
      console.error('Error fetching directory entries:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = (entry: DirectoryEntry) => {
    router.push(`/admin/users/${entry.id}/profile`);
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/directory?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEntries(entries.filter(e => e.id !== id));
        setError('Directory entry deleted successfully');
      } else {
        setError('Failed to delete directory entry');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const filteredEntries = entries ? entries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.first_name.toLowerCase().includes(searchLower) ||
      entry.last_name.toLowerCase().includes(searchLower) ||
      (entry.primary_email && entry.primary_email.toLowerCase().includes(searchLower)) ||
      (entry.ministry_areas && entry.ministry_areas.some((area: string) => area.toLowerCase().includes(searchLower)))
    );
  }) : [];

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Visitor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !entries.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Directory Management</h1>
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/dashboard"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ← Back to Dashboard
                </Link>
                <button
                  onClick={() => setShowImport(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Import Members
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search directory..."
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Directory Table */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar
                              photoFilename={entry.photo_filename}
                              firstName={entry.first_name}
                              lastName={entry.last_name}
                            />
                            <div className="ml-4">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {entry.first_name} {entry.middle_name && entry.middle_name + ' '}{entry.suffix && ', ' + entry.suffix}
                              </p>
                              {entry.nickname && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  "{entry.nickname}" • {entry.occupation}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.primary_email && entry.show_email && (
                              <div className="flex items-center">
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0l7.89-4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {entry.primary_email}
                              </div>
                            )}
                            {entry.mobile_phone && entry.show_phone && (
                              <div className="flex items-center mt-1">
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502.864l-2.257-1.14a1 1 0 00-.952 0L4.5 12.684A1 1 0 013 12.318V7a2 2 0 012-2h3.28z" />
                                </svg>
                                {entry.mobile_phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(entry.membership_status)}`}>
                            {entry.membership_status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
