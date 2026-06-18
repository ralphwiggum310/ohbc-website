'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  bio?: string;
  photo_url?: string;
  ministry_areas?: string;
  role: string;
}

export default function MembersDirectory() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchMembers();
  }, []);

  const checkAuthAndFetchMembers = async () => {
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

      // Fetch members directory
      const membersResponse = await fetch('/api/members/directory', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (membersResponse.ok) {
        const data = await membersResponse.json();
        setMembers(data.members);
      } else {
        setError('Failed to load members directory');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.first_name.toLowerCase().includes(searchLower) ||
      member.last_name.toLowerCase().includes(searchLower) ||
      (member.email && member.email.toLowerCase().includes(searchLower)) ||
      (member.ministry_areas && member.ministry_areas.toLowerCase().includes(searchLower))
    );
  });

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
                Members Directory
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect with other church members
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

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search members by name, email, or ministry..."
              />
            </div>
          </div>

          {/* Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No members found' : 'No members available'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back later for member updates'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {member.photo_url ? (
                          <img
                            className="h-12 w-12 rounded-full"
                            src={member.photo_url}
                            alt={`${member.first_name} ${member.last_name}`}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                              {member.first_name[0]}{member.last_name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {member.first_name} {member.last_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    
                    {member.bio && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                    
                    <div className="mt-4 space-y-1">
                      {member.email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {member.email}
                        </div>
                      )}
                      
                      {member.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {member.phone}
                        </div>
                      )}
                      
                      {member.ministry_areas && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {member.ministry_areas}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
