'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import DonationModal with SSR disabled
const DonationModal = dynamic(
  () => import('./DonationModal'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const navLinks = [
  // { name: 'Bible', href: '/bible' },  // Temporarily disabled
  { name: 'Leadership', href: '/leadership' },
  { name: 'What We Believe', href: '/what-we-believe' },
  { name: 'Watch & Listen', href: '/watch-listen' },
  { name: 'Prayer', href: '/prayer-requests' },
  { name: 'Visit', href: '/visit' },
];

export default function Navbar() {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  // Handle scroll effect for navbar
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('button[aria-label="Toggle menu"]')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <>
      <header 
        className="shadow-sm sticky top-0 z-50 py-2" 
        style={{ backgroundColor: '#991b1e' }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 h-10 flex items-center">
            <Link href="/">
              <Image 
                src="/logo/logo and name White (transparent).png" 
                alt="OHBC Logo" 
                width={180}
                height={45}
                className="w-auto h-9 object-contain hover:opacity-90 transition-opacity"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="px-2 py-1.5 text-white hover:bg-white hover:bg-opacity-10 rounded text-xs sm:text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => isStripeConfigured && setIsDonationModalOpen(true)}
              className={`ml-1 sm:ml-2 px-3 py-1.5 text-xs sm:text-sm rounded font-medium transition-colors whitespace-nowrap ${isStripeConfigured ? 'text-white border border-white hover:bg-white hover:bg-opacity-10' : 'text-gray-400 cursor-not-allowed'}`}
              disabled={!isStripeConfigured}
              title={!isStripeConfigured ? 'Donations coming soon' : 'Make a donation'}
            >
              {isStripeConfigured ? 'Give' : 'Give (Soon)'}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div 
            className="md:hidden mobile-menu-container border-t border-red-800 absolute left-0 right-0 z-50" 
            style={{ backgroundColor: '#991b1e' }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-white hover:bg-white hover:bg-opacity-10 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (isStripeConfigured) setIsDonationModalOpen(true);
                }}
                className={`w-full text-left px-3 py-2 text-base font-medium rounded-md ${isStripeConfigured ? 'text-white hover:bg-white hover:bg-opacity-10' : 'text-gray-400'}`}
                disabled={!isStripeConfigured}
              >
                {isStripeConfigured ? 'Give' : 'Give (Coming Soon)'}
              </button>
            </div>
          </div>
        )}
      </header>
      
      <DonationModal 
        isOpen={isDonationModalOpen} 
        onCloseAction={() => setIsDonationModalOpen(false)} 
      />
    </>
  );
}
