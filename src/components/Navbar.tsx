'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/app/components/ThemeToggle';
import { FiMenu, FiX } from 'react-icons/fi';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setShowContent(true); }, []);

  // Close mobile menu when route changes
  useEffect(() => { setMobileOpen(false); }, [pathname]);

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
              </div>
            )}

            {/* Mobile right side: theme toggle + hamburger */}
            {showContent && (
              <div className="md:hidden flex items-center space-x-1">
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
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
