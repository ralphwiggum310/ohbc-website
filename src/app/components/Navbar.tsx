'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

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
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Show navbar content after hero animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? 'bg-red-950 shadow-md' : 'bg-red-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo - only shown after animation */}
          <AnimatePresence>
            {showContent ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0"
              >
                <Link href="/" className="flex items-center">
                  <img 
                    src="/logo/logo and name White (transparent).png" 
                    alt="Orchard Hills Bible Church" 
                    className="h-10 w-auto"
                  />
                </Link>
              </motion.div>
            ) : (
              <div className="h-10 w-10"></div>
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
                  className="hidden md:block"
                >
                  <div className="flex items-center space-x-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="text-white hover:bg-red-800 hover:bg-opacity-75 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        title={link.tooltip}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <motion.button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-red-800 focus:outline-none"
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
      <AnimatePresence>
        {isMenuOpen && showContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden bg-red-900 shadow-lg overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-red-800"
                  onClick={handleNavClick}
                >
                  {link.mobileText || link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
