'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/app/components/ThemeToggle';
import { FiMenu, FiX, FiUser, FiLogOut, FiSliders, FiBell } from 'react-icons/fi';

const navLinks = [
  { name: 'Home',           href: '/',               tooltip: 'Home' },
  { name: 'Leadership',     href: '/leadership',      tooltip: 'Leadership' },
  { name: 'What We Believe',href: '/what-we-believe', tooltip: 'What We Believe' },
  { name: 'Visit',          href: '/visit',           tooltip: 'Visit Us' },
  { name: 'Give',           href: '/give',            tooltip: 'Give Online' },
  { name: 'Announcements',  href: '/announcements',   tooltip: 'Announcements & Bulletins' },
  { name: 'Bible',          href: '/bible',           tooltip: 'Bible Reader' },
];

const MAROON = '#5c1a1a';

export default function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showContent, setShowContent]   = useState(false);
  const [unreadCount, setUnreadCount]   = useState(0);
  const pathname    = usePathname();
  const { user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setShowContent(true); }, []);

  // Close menus when route changes
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Poll unread notification count for logged-in users
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const fetchUnread = async () => {
      try {
        const res  = await fetch('/api/notifications?unread=true');
        const data = await res.json();
        setUnreadCount(data.unreadCount ?? 0);
      } catch {
        // silently ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const isAdmin     = user?.role === 'Admin' || user?.role === 'Super Admin';
  const displayName = user?.email ? user.email.split('@')[0] : '';

  return (
    <>
      <style jsx global>{`
        .navbar-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          background-color: ${MAROON};
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        body {
          padding-top: 64px;
        }
      `}</style>

      <header className="navbar-root">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 transition-transform duration-200 hover:scale-105">
              <img
                src="/logo/logo and name White (transparent).png"
                alt="Orchard Hills Bible Church"
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop nav links */}
            {showContent && (
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    href={link.href}
                    title={link.tooltip}
                    className={`px-3 py-2 text-sm font-medium text-white rounded-md transition-colors hover:bg-white/20 ${
                      pathname === link.href ? 'bg-white/25' : ''
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            )}

            {/* Desktop right side */}
            {showContent && (
              <div className="hidden md:flex items-center space-x-3">
                <ThemeToggle />

                {/* Notification bell (logged-in users) */}
                {user && (
                  <Link href="/members/notifications"
                    className="relative p-2 rounded-md text-white hover:bg-white/20 transition-colors"
                    aria-label="Notifications">
                    <FiBell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-gray-900 leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                    aria-label={user ? 'Account menu' : 'Sign in'}
                  >
                    {user?.photo_url ? (
                      <img src={user.photo_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <FiUser size={16} />
                    )}
                    <span>{user ? displayName : 'Member Login'}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden"
                      >
                        {user ? (
                          <>
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                              <p className="text-xs font-medium mt-0.5" style={{ color: MAROON }}>{user.role}</p>
                            </div>
                            <div className="py-1">
                              <Link href={isAdmin ? '/admin/dashboard' : '/members/dashboard'} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <FiUser size={14} /> My Dashboard
                              </Link>
                              <Link href="/members/notifications" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <FiBell size={14} />
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-gray-900">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                  </span>
                                )}
                              </Link>
                              <Link href="/members/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <FiSliders size={14} /> My Profile
                              </Link>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                              <button
                                onClick={() => { logout(); setUserMenuOpen(false); }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <FiLogOut size={14} /> Sign Out
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="py-1">
                            <Link href="/auth/signin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <FiUser size={14} /> Sign In
                            </Link>
                            <Link href="/become-a-member" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                              Learn About Membership
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Mobile right side: bell + theme toggle + hamburger */}
            {showContent && (
              <div className="md:hidden flex items-center space-x-1">
                {user && (
                  <Link href="/members/notifications" onClick={() => setMobileOpen(false)}
                    className="relative p-2 rounded-md text-white hover:bg-white/20 transition-colors"
                    aria-label="Notifications">
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-gray-900 leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                <ThemeToggle />
                <button
                  onClick={() => setMobileOpen(v => !v)}
                  className="p-2 rounded-md text-white hover:bg-white/20 transition-colors"
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileOpen}
                >
                  {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileOpen && showContent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
              style={{ backgroundColor: '#4a1515' }}
            >
              <nav className="px-4 py-3 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-3 text-base font-medium text-white rounded-md transition-colors hover:bg-white/15 active:bg-white/25 ${
                      pathname === link.href ? 'bg-white/20' : ''
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Auth section */}
                <div className="border-t border-white/20 pt-3 mt-2 space-y-1">
                  {user ? (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-white">{displayName}</p>
                        <p className="text-xs text-white/60">{user.role}</p>
                      </div>
                      <Link href={isAdmin ? '/admin/dashboard' : '/members/dashboard'} onClick={() => setMobileOpen(false)} className="block px-3 py-3 text-base font-medium text-white rounded-md hover:bg-white/15">
                        My Dashboard
                      </Link>
                      <Link href="/members/notifications" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-3 text-base font-medium text-white rounded-md hover:bg-white/15">
                        <FiBell size={18} />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-gray-900">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="flex items-center gap-2 w-full text-left px-3 py-3 text-base font-medium text-red-300 rounded-md hover:bg-white/15"
                      >
                        <FiLogOut size={18} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-3 text-base font-medium text-white rounded-md hover:bg-white/15">
                      <FiUser size={18} /> Member Login
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
