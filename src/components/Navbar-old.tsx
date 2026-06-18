'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from '@/app/components/ThemeToggle';
import { createPortal } from 'react-dom';

const navLinks = [
  { 
    name: 'Home', 
    href: '/', 
    mobileText: 'Home',
    tooltip: 'Home'
  },
  { 
    name: 'Leadership', 
    href: '/leadership',
    mobileText: 'Leadership',
    tooltip: 'Leadership'
  },
  { 
    name: 'What We Believe', 
    href: '/what-we-believe',
    mobileText: 'Beliefs',
    tooltip: 'What We Believe'
  },
  { 
    name: 'Visit', 
    href: '/visit',
    mobileText: 'Visit',
    tooltip: 'Visit Us'
  },
  { 
    name: 'Give', 
    href: '/give',
    mobileText: 'Give',
    tooltip: 'Give Online'
  },
  { 
    name: 'Announcements', 
    href: '/announcements',
    mobileText: 'Announcements',
    tooltip: 'Announcements & Bulletins'
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Authentication state
  let user = null;
  let isLoading = true;
  let logout = () => {};
  
  try {
    const auth = useAuth();
    user = auth.user;
    isLoading = auth.isLoading;
    logout = auth.logout;
  } catch (error) {
    console.error('Auth context not available:', error);
    isLoading = false;
  }

  // Show navbar content immediately
  useEffect(() => {
    setShowContent(true);
  }, []);

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  // Handle profile icon click - simplified for testing
  const handleProfileClick = (e: React.MouseEvent) => {
    console.log('Profile icon clicked - testing');
    // Completely simplified - just toggle state without any event handling
    if (user) {
      setShowUserMenu(!showUserMenu);
    } else {
      window.location.href = '/auth/signin';
    }
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showUserMenu]);

  if (isLoading) {
    return (
      <>
        <style jsx global suppressHydrationWarning>{`
          .navbar-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            background-color: #5c1a1a; /* Deep maroon color */
          }
          
          .dark .navbar-container {
            background-color: #111827 !important; /* Keep dark mode color */
            color: white;
          }
          
          /* Ensure all text in the navbar is white, but exclude dropdown menus */
          .navbar-container > :not(.absolute) > * {
            color: white !important;
          }
          
          /* Dropdown menus should use their own color scheme */
          .navbar-container .absolute {
            color: inherit !important;
          }
          
          /* Add padding to the top of the main content to prevent overlap */
          main {
            padding-top: 64px; /* Height of the navbar */
          }
        `}</style>
        <header className="navbar-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="h-10 w-10"></div>
            </div>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      <style jsx global suppressHydrationWarning>{`
        .navbar-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          background-color: #5c1a1a; /* Deep maroon color */
        }
        
        .dark .navbar-container {
          background-color: #111827 !important; /* Keep dark mode color */
          color: white;
        }
        
        /* Ensure all text in the navbar is white */
        .navbar-container * {
          color: white !important;
        }
        
        /* Add padding to the top of the main content to prevent overlap */
        main {
          padding-top: 64px; /* Height of the navbar */
        }
      `}</style>
      <header className="navbar-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* Logo */}
            <AnimatePresence key="logo-presence">
              {showContent ? (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex-shrink-0"
                >
                  <Link 
                    href="/"
                    className="inline-block transition-transform duration-300 hover:scale-110"
                    style={{
                      transformOrigin: 'left center',
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      WebkitFontSmoothing: 'subpixel-antialiased'
                    }}
                  >
                    <img 
                      src="/logo/logo and name White (transparent).png" 
                      alt="Orchard Hills Bible Church" 
                      className="h-10 w-auto"
                    />
                  </Link>
                </motion.div>
              ) : (
                <div key="logo-placeholder" className="h-10 w-10"></div>
              )}
            </AnimatePresence>

            {/* Desktop Navigation */}
            <AnimatePresence>
              {showContent && (
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="hidden md:flex items-center space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      {navLinks.map((link) => (
                        <div key={`desktop-${link.name}`} className="relative">
                          <Link
                            href={link.href}
                            className="relative px-2.5 py-1.5 text-xs sm:text-sm font-medium text-white transition-all duration-300 ease-in-out inline-block hover:scale-110 hover:z-10 hover:text-white"
                            title={link.tooltip}
                            style={{
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                              transformOrigin: 'center center',
                              willChange: 'transform',
                              backfaceVisibility: 'hidden',
                              WebkitFontSmoothing: 'subpixel-antialiased'
                            }}
                          >
                            {link.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Desktop Right Side */}
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="hidden md:flex items-center space-x-4"
                  >
                    <ThemeToggle />
                    
                    {/* Profile Icon */}
                    <div className="relative">
                      <button
                        onClick={handleProfileClick}
                        className="relative h-8 w-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors overflow-hidden z-10"
                        title={user ? 'Profile Menu' : 'Sign In'}
                      >
                        {user ? (
                          user.photo_url ? (
                            <img 
                              src={user.photo_url} 
                              alt="Profile" 
                              className="h-8 w-8 object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-white">
                              {getInitials(user.email)}
                            </span>
                          )
                        ) : (
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </button>
                      
                      {/* User Dropdown - Temporarily disabled for testing */}
                      {/* {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1" style={{ backgroundColor: 'white' }}>
                          <div className="px-4 py-2 border-b border-gray-200" style={{ borderColor: '#e5e7eb' }}>
                            <p className="text-sm font-medium" style={{ color: '#111827' }}>{user.email}</p>
                            <p className="text-xs" style={{ color: '#6b7280' }}>{user.role}</p>
                          </div>
                          <Link
                            href="/members/profile"
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                            style={{ color: '#111827' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowUserMenu(false);
                            }}
                          >
                            Profile
                          </Link>
                          <Link
                            href="/directory"
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                            style={{ color: '#111827' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowUserMenu(false);
                            }}
                          >
                            Directory
                          </Link>
                          <Link
                            href="/events"
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                            style={{ color: '#111827' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowUserMenu(false);
                            }}
                          >
                            Schedule
                          </Link>
                          {user && (user.role === 'Admin' || user.role === 'Super Admin') && (
                            <Link
                              href="/admin/dashboard"
                              className="block px-4 py-2 text-sm hover:bg-gray-100"
                              style={{ color: '#111827' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowUserMenu(false);
                              }}
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          <div className="border-t border-gray-200" style={{ borderColor: '#e5e7eb' }}></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            style={{ color: '#111827' }}
                          >
                            Log out
                          </button>
                        </div>
                      )} */}
                    </div>
                </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Mobile menu button */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="md:hidden"
                >
                  {/* Unified Profile Icon - always visible */}
                  <button
                    onClick={handleProfileClick}
                    className="p-2 text-white hover:bg-white/10 rounded-md"
                  >
                    {user ? (
                      user.photo_url ? (
                        <img 
                          src={user.photo_url} 
                          alt="Profile" 
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-white">
                          {getInitials(user.email)}
                        </span>
                      )
                    ) : (
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Mobile Menu - Temporarily disabled for testing */}
                  {/* <AnimatePresence>
                    {showUserMenu && user && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 shadow-lg"
                      >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                          {/* Navigation Links */}
                          {navLinks.map((link) => (
                            <Link
                              key={`mobile-${link.name}`}
                              href={link.href}
                              onClick={handleNavClick}
                              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                              {link.mobileText || link.name}
                            </Link>
                          ))}
                          
                          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                            {/* User Profile Section */}
                            <div className="px-3 py-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                            </div>
                            
                            {/* Action Links */}
                            <Link
                              href="/members/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                              Edit Profile
                            </Link>
                            
                            <Link
                              href="/directory"
                              onClick={() => setShowUserMenu(false)}
                              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                              Directory
                            </Link>
                            
                            <Link
                              href="/events"
                              onClick={() => setShowUserMenu(false)}
                              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                              Schedule
                            </Link>
                            
                            {user && (user.role === 'Admin' || user.role === 'Super Admin') && (
                              <Link
                                href="/admin/dashboard"
                                onClick={() => setShowUserMenu(false)}
                                className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                              >
                                Admin Dashboard
                              </Link>
                            )}
                            
                            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                              <button
                                onClick={() => {
                                  logout();
                                  setShowUserMenu(false);
                                }}
                                className="w-full px-4 py-2 text-base font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                              >
                                Sign Out
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence> */}
                </motion.div>
              )}
              
              <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-base font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence> */}
  </motion.div>
)}
</AnimatePresence>
</div>
</div>

{/* Mobile menu - Temporarily disabled for testing */}
{/* <AnimatePresence>
  {isMenuOpen && user && (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.3 }}
      className="md:hidden bg-white dark:bg-gray-800 shadow-lg"
    >
      <div className="px-2 pt-2 pb-3 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={`mobile-${link.name}`}
            href={link.href}
            onClick={handleNavClick}
            className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            {link.mobileText || link.name}
          </Link>
        ))}
      </div>
      
      {/* Mobile auth buttons */}
      <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
        <div className="px-2 space-y-2">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
          </div>
          <button
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Log out
          </button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence> */}
</header>
</>
);
}
