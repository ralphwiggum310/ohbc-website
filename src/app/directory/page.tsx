'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface DirectoryEntry {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  suffix?: string;
  nickname?: string;
  photo_url?: string;
  photo_filename?: string;
  profile_picture_filename?: string;
  profile_picture_status?: string;
  bio?: string;
  primary_email?: string;
  secondary_email?: string;
  home_phone?: string;
  mobile_phone?: string;
  work_phone?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  spouse_name?: string;
  children_names?: string[];
  anniversary_date?: string;
  occupation?: string;
  company?: string;
  status?: string;
  membership_status?: string;
  ministries?: string[];
  categories?: string[];
}

export default function DirectoryPage() {
  const { user, isLoading } = useAuth();
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [selectedMember, setSelectedMember] = useState<DirectoryEntry | null>(null);
  
  // Search menu state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [occupationSearch, setOccupationSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [statusSearch, setStatusSearch] = useState('');
  const [ministrySearch, setMinistrySearch] = useState('');
  
  const router = useRouter();

  // Generate A-Z letters
  const letters = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const clearAllFilters = () => {
    setSearchTerm('');
    setEmailSearch('');
    setPhoneSearch('');
    setOccupationSearch('');
    setCitySearch('');
    setStatusSearch('');
    setMinistrySearch('');
  };

  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(letter);
    // Scroll to top when letter is selected
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchDirectory();
  }, [user, isLoading]);

  const fetchDirectory = async () => {
    try {
      const response = await fetch('/api/directory/search?');

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      } else {
        setError('Failed to fetch directory');
      }
    } catch (error) {
      console.error('Error fetching directory:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchTerm === '' || emailSearch === '' || phoneSearch === '' || occupationSearch === '' || citySearch === '' || ministrySearch === '' || statusSearch === '' ||
      entry.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.nickname && entry.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.primary_email && entry.primary_email.toLowerCase().includes(emailSearch.toLowerCase())) ||
      (entry.mobile_phone && entry.mobile_phone.includes(phoneSearch)) ||
      (entry.home_phone && entry.home_phone.includes(phoneSearch)) ||
      (entry.work_phone && entry.work_phone.includes(phoneSearch)) ||
      (entry.occupation && entry.occupation.toLowerCase().includes(occupationSearch.toLowerCase())) ||
      (entry.company && entry.company.toLowerCase().includes(occupationSearch.toLowerCase())) ||
      (entry.address_city && entry.address_city.toLowerCase().includes(citySearch.toLowerCase())) ||
      (entry.status && entry.status.toLowerCase().includes(statusSearch.toLowerCase()));
    
    const matchesLetter = selectedLetter === 'All' || 
      entry.last_name.toUpperCase().startsWith(selectedLetter);
    
    return matchesSearch && matchesLetter;
  });

  // Sort entries alphabetically by last name, then first name
  const sortedEntries = filteredEntries.sort((a, b) => {
    const lastNameCompare = a.last_name.localeCompare(b.last_name);
    if (lastNameCompare !== 0) return lastNameCompare;
    return a.first_name.localeCompare(b.first_name);
  });

  // Group entries by first letter
  const groupedEntries = sortedEntries.reduce((groups, entry) => {
    const firstLetter = entry.last_name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(entry);
    return groups;
  }, {} as Record<string, DirectoryEntry[]>);

  const getDisplayName = (entry: DirectoryEntry) => {
    if (entry.nickname) return `${entry.nickname} ${entry.last_name}`;
    return `${entry.first_name} ${entry.last_name}`;
  };

  const getProfilePictureUrl = (entry: DirectoryEntry) => {
    // Check for approved profile picture first
    if (entry.profile_picture_status === 'approved' && entry.profile_picture_filename) {
      return `/data/users/directory/approved/${entry.profile_picture_filename}`;
    }
    
    // Fallback to legacy photo_url
    if (entry.photo_url) {
      return entry.photo_url;
    }
    
    return null;
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatAddress = (entry: DirectoryEntry) => {
    const parts = [];
    if (entry.address_street) parts.push(entry.address_street);
    if (entry.address_city) parts.push(entry.address_city);
    if (entry.address_state) parts.push(entry.address_state);
    if (entry.address_zip) parts.push(entry.address_zip);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Church Directory</h1>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">Browse our church members and connect with our community.</p>
        </div>

        {/* Search Menu */}
        <div className="mb-4 sm:mb-8">
          <div className="relative">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-2 sm:px-4 py-2 pl-8 sm:pl-10 pr-8 sm:pr-4 text-xs sm:text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  {searchTerm || 'Search directory...'}
                </span>
                <svg
                  className="w-4 h-4 sm:h-5 sm:w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 mt-1">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-0"
                    />
                  </div>
                  
                  <div className="p-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Search Options</h4>
                    
                    {/* Search by Name */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By Name</label>
                      <input
                        type="text"
                        placeholder="Enter name to search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-0"
                      />
                    </div>
                    
                    {/* Search by Email */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By Email</label>
                      <input
                        type="email"
                        placeholder="Enter email to search..."
                        onChange={(e) => setEmailSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-0"
                      />
                    </div>
                    
                    {/* Search by Phone */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By Phone</label>
                      <input
                        type="tel"
                        placeholder="Enter phone number..."
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-0"
                      />
                    </div>
                    
                    {/* Search by Occupation */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By Occupation</label>
                      <input
                        type="text"
                        placeholder="Enter occupation..."
                        onChange={(e) => setOccupationSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-0"
                      />
                    </div>
                    
                    {/* Search by City */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By City</label>
                      <input
                        type="text"
                        placeholder="Enter city..."
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-0"
                      />
                    </div>
                    
                    {/* Search by Status */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By Status</label>
                      <select
                        onChange={(e) => setStatusSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-0"
                      >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Visitor">Visitor</option>
                      </select>
                    </div>
                    
                    {/* Search by Ministry */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By Ministry</label>
                      <select
                        onChange={(e) => setMinistrySearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-0"
                      >
                        <option value="">All Ministries</option>
                        <option value="Worship Team">Worship Team</option>
                        <option value="Teaching Team">Teaching Team</option>
                        <option value="Music Team">Music Team</option>
                        <option value="Youth Ministry">Youth Ministry</option>
                      </select>
                    </div>
                    
                    {/* Clear Filters */}
                    <div className="flex gap-2">
                      <button
                        onClick={clearAllFilters}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setDropdownOpen(false)}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-8">
          {/* A-Z Sidebar */}
          <div className="w-12 sm:w-20 flex-shrink-0">
            <div className="sticky top-8">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4 hidden sm:block">Jump to:</h3>
              <div className="space-y-1">
                {letters.map(letter => (
                  <button
                    key={letter}
                    onClick={() => handleLetterSelect(letter)}
                    className={`w-full py-1 px-1 sm:px-2 text-xs sm:text-sm rounded transition-colors ${
                      selectedLetter === letter
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Directory Content */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading directory...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-8">
                {Object.entries(groupedEntries)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([letter, letterEntries]) => (
                    <div key={letter}>
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        {letter}
                      </h2>
                      <div className="space-y-2">
                        {letterEntries.map(entry => (
                          <div
                            key={entry.id}
                            onClick={() => setSelectedMember(entry)}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 sm:p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                          >
                            <div className="flex items-center gap-3 sm:gap-4">
                              {/* Name only */}
                              <div className="flex-1">
                                <h3 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white">
                                  {getDisplayName(entry)}
                                </h3>
                                {entry.occupation && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 sm:block hidden">
                                    {entry.occupation}
                                    {entry.company && ` at ${entry.company}`}
                                  </p>
                                )}
                              </div>

                              {/* Click indicator */}
                              <div className="text-gray-400 sm:block hidden">
                                <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {getDisplayName(selectedMember)}
                </h2>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Photo and Basic Info */}
              <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6">
                {getProfilePictureUrl(selectedMember) && (
                  <div className="flex-shrink-0">
                    <Image
                      src={getProfilePictureUrl(selectedMember)!}
                      alt={getDisplayName(selectedMember)}
                      width={80}
                      height={80}
                      className="w-16 h-16 sm:w-30 sm:h-30 rounded-lg object-cover"
                    />
                  </div>
                )}

                <div className="flex-1">
                  {selectedMember.occupation && (
                    <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      {selectedMember.occupation}
                      {selectedMember.company && ` at ${selectedMember.company}`}
                    </p>
                  )}
                  {selectedMember.status && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                      Status: {selectedMember.status}
                    </p>
                  )}
                  {selectedMember.bio && (
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-4">{selectedMember.bio}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                  {selectedMember.primary_email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${selectedMember.primary_email}`} className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        {selectedMember.primary_email}
                      </a>
                    </div>
                  )}
                  
                  {selectedMember.mobile_phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${selectedMember.mobile_phone}`} className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        {formatPhoneNumber(selectedMember.mobile_phone)} (Mobile)
                      </a>
                    </div>
                  )}
                  
                  {selectedMember.home_phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${selectedMember.home_phone}`} className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        {formatPhoneNumber(selectedMember.home_phone)} (Home)
                      </a>
                    </div>
                  )}
                  
                  {selectedMember.work_phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      <a href={`tel:${selectedMember.work_phone}`} className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        {formatPhoneNumber(selectedMember.work_phone)} (Work)
                      </a>
                    </div>
                  )}
                </div>

                {/* Address */}
                {formatAddress(selectedMember) && (
                  <div className="mt-3 sm:mt-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {formatAddress(selectedMember)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Family Information */}
                {(selectedMember.spouse_name || selectedMember.children_names) && (
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4">Family Information</h4>
                    {selectedMember.spouse_name && (
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          Spouse: {selectedMember.spouse_name}
                        </span>
                      </div>
                    )}
                    {selectedMember.children_names && selectedMember.children_names.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          Children: {selectedMember.children_names.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
