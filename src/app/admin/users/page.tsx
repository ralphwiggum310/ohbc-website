'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Settings, Key, User as UserIcon, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MemberUser {
  id: number;
  email: string;
  phone?: string;
  role: string;
  service_roles?: string[];
  created_at: string;
  last_login?: string;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until?: string;
  first_name: string;
  last_name: string;
  bio?: string;
  photo_url?: string;
  phone_visible: boolean;
  email_visible: boolean;
  ministry_areas?: string;
  tags?: string;
  notes?: string;
}

interface UserStats {
  total: number;
  active: number;
  new: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<MemberUser[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, new: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<MemberUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showServiceRolesModal, setShowServiceRolesModal] = useState(false);
  const [showLoginInfoModal, setShowLoginInfoModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [selectedServiceRoles, setSelectedServiceRoles] = useState<string[]>([]);
  const [availableServiceRoles, setAvailableServiceRoles] = useState<any[]>([]);
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    phone: '',
    password: '',
    role: ''
  });

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) { router.replace('/auth/signin'); return; }
    if (currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin') { router.replace('/members/dashboard'); return; }
    fetchUsers();
  }, [currentUser, authLoading]);

  const fetchUsers = async () => {
    try {
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setUsers(data.users);
        setStats(data.stats);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user: MemberUser) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleRoleUpdate = async (newRole: string) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateRole', newRole })
      });

      if (response.ok) {
        showSuccess('Role updated successfully');
        setShowRoleModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError('Failed to update user role');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleStatusToggle = async (user: MemberUser) => {
    try {
      const response = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleStatus' })
      });

      if (response.ok) {
        showSuccess('Status updated successfully');
        fetchUsers();
      } else {
        setError('Failed to update user status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const response = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetPassword', newPassword })
      });

      if (response.ok) {
        showSuccess('Password reset successfully');
        setShowPasswordModal(false);
        setNewPassword('');
        setSelectedUser(null);
      } else {
        setError('Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleServiceRolesUpdate = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/users/service-roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, serviceRoles: selectedServiceRoles })
      });

      if (response.ok) {
        showSuccess('Service roles updated successfully');
        setShowServiceRolesModal(false);
        setSelectedServiceRoles([]);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError('Failed to update service roles');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleLoginInfoUpdate = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/users/login-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, loginInfo })
      });

      if (response.ok) {
        showSuccess('Login information updated successfully');
        setShowLoginInfoModal(false);
        setLoginInfo({ email: '', phone: '', password: '', role: '' });
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError('Failed to update login information');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const fetchServiceRoles = async () => {
    try {
      const response = await fetch('/api/admin/users/service-roles');

      if (response.ok) {
        const data = await response.json();
        setAvailableServiceRoles(data.serviceRoles);
      }
    } catch (error) {
      console.error('Error fetching service roles:', error);
    }
  };

  useEffect(() => {
    if (showServiceRolesModal) {
      fetchServiceRoles();
      if (selectedUser) {
        setSelectedServiceRoles(selectedUser.service_roles || []);
      }
    }
  }, [showServiceRolesModal, selectedUser]);

  useEffect(() => {
    if (showLoginInfoModal && selectedUser) {
      setLoginInfo({
        email: selectedUser.email || '',
        phone: selectedUser.phone || '',
        password: '',
        role: selectedUser.role || ''
      });
    }
  }, [showLoginInfoModal, selectedUser]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Ministry Leader':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Member':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
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
                User Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentUser?.role}
              </div>
              <Link
                href="/admin/dashboard"
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
          {successMessage && (
            <div className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-md">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Active Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.active}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        New Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.new}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
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
                placeholder="Search users by name, email, or role..."
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Users ({filteredUsers.length})
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.photo_url ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.photo_url}
                                  alt={`${user.first_name} ${user.last_name}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {user.first_name[0]}{user.last_name[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => {
                                router.push(`/admin/users/${user.id}/profile`);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPasswordModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Reset Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Change Role for {selectedUser.first_name} {selectedUser.last_name}
              </h3>
            </div>
            <div className="mt-4">
              <select
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                defaultValue={selectedUser.role}
                onChange={(e) => handleRoleUpdate(e.target.value)}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Ministry Leader">Ministry Leader</option>
                <option value="Member">Member</option>
                <option value="Guest">Guest</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Roles Modal */}
      {showServiceRolesModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Service Roles for {selectedUser.first_name} {selectedUser.last_name}
              </h3>
            </div>
            <div className="mt-4 space-y-2">
              {availableServiceRoles.map((role) => (
                <label key={role.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedServiceRoles.includes(role.role_name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServiceRoles([...selectedServiceRoles, role.role_name]);
                      } else {
                        setSelectedServiceRoles(selectedServiceRoles.filter(r => r !== role.role_name));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {role.display_name}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleServiceRolesUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowServiceRolesModal(false);
                  setSelectedServiceRoles([]);
                  setSelectedUser(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Info Modal */}
      {showLoginInfoModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Login Info for {selectedUser.first_name} {selectedUser.last_name}
              </h3>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={loginInfo.email}
                  onChange={(e) => setLoginInfo({...loginInfo, email: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="tel"
                  value={loginInfo.phone}
                  onChange={(e) => setLoginInfo({...loginInfo, phone: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={loginInfo.password}
                  onChange={(e) => setLoginInfo({...loginInfo, password: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  value={loginInfo.role}
                  onChange={(e) => setLoginInfo({...loginInfo, role: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Ministry Leader">Ministry Leader</option>
                  <option value="Member">Member</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleLoginInfoUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowLoginInfoModal(false);
                  setLoginInfo({ email: '', phone: '', password: '', role: '' });
                  setSelectedUser(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Reset Password for {selectedUser.first_name} {selectedUser.last_name}
              </h3>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handlePasswordReset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Reset
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
