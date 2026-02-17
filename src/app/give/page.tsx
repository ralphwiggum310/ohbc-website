'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import Link from 'next/link';

const ZEFFY_DONATION_URL = 'https://www.zeffy.com/en-US/donation-form/gifts-and-offerings';

const GivePage = () => {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <HeroSection 
        title="Support Our Ministry"
        subtitle="Your generous donation helps us continue our mission"
        className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-gray-800 dark:to-gray-900 text-white py-3 sm:py-4"
      >
        <div className="mt-6"></div>
      </HeroSection>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200 p-8">
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white">Online Giving</h2>
            
            <div className="text-center">
              <Link 
                href={ZEFFY_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 text-base sm:text-lg"
              >
                Donate Now
              </Link>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Your Generosity Makes a Difference</h3>
              
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed sm:leading-normal">
                At Orchard Hills Bible Church, we exist to equip God's people to serve in the church and in the community.
              </p>
              
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-sm sm:text-base text-gray-700 dark:text-gray-300 my-4 sm:my-6">
                2 Corinthians 9:7 - "Each one must do just as he has purposed in his heart, not grudgingly or under compulsion, for God loves a cheerful giver."
              </blockquote>
              
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed sm:leading-normal">
                Thank you for supporting our ministry. Your gifts help us fulfill our mission to share the Gospel and serve our community.
              </p>
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                All donations are tax-deductible as allowed by law. A receipt will be provided for your records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GivePage;
