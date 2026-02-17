'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

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
  // Removed isScrolled state as we're using a consistent color now
  const [showContent, setShowContent] = useState(false);

  // Show navbar content immediately
  useEffect(() => {
    setShowContent(true);
  }, []);

  // Scroll effect removed for consistent color

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

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
            {/* Logo - only shown after animation */}
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

          {/* Desktop Navigation - only shown after animation */}
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
                            WebkitFontSmoothing: 'subpixel-antialiased',
                            color: 'white !important'
                          }}
                      >
                        {link.name}
                      </Link>
                      </div>
                    ))}
                  </div>
                  <div className="ml-4">
                    <ThemeToggle />
                  </div>
                </motion.div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <motion.button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-red-800 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-blue-400"
                    aria-expanded={isMenuOpen}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                  </motion.button>
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence key="mobile-menu">
        {isMenuOpen && showContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden bg-red-900 dark:bg-gray-700 shadow-lg overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <div key={`mobile-${link.name}`} className="relative">
                  <Link
                    href={link.href}
                    className="block px-3 py-2 text-base font-medium text-white transition-all duration-300 ease-in-out hover:scale-105 hover:text-white focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-blue-400 dark:focus:ring-offset-2 dark:focus:ring-offset-gray-700"
                    onClick={handleNavClick}
                    style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      transformOrigin: 'left center',
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      WebkitFontSmoothing: 'subpixel-antialiased',
                      color: 'white !important'
                    }}
                  >
                    {link.mobileText || link.name}
                  </Link>
                </div>
              ))}
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>
    </>
  );
}
