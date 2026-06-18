'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';

export default function NextSteps() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      {/* Hero Section */}
      <HeroSection 
        title="Next Steps"
        subtitle="Discover how you can grow and get connected at Orchard Hills Bible Church."
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-12 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">Get Connected</h2>
              
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0`}>
                    1
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Attend a Service</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Join us for worship on Sunday morning and Wednesday night.
                    </p>
                    <Link 
                      href="/visit" 
                      className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 mt-2 inline-block transition-colors"
                    >
                      Service Times & Directions →
                    </Link>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0`}>
                    2
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Learn About Our Beliefs</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Discover what we believe and how it shapes our church community.
                    </p>
                    <Link 
                      href="/what-we-believe" 
                      className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 mt-2 inline-block transition-colors"
                    >
                      Our Beliefs →
                    </Link>
                  </div>
                </div>



                {/* Step 3 */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0`}>
                    3
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Get Baptized</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      If you've been saved by the grace of the Lord Jesus Christ and have not yet obeyed His command to be baptized, take the step to publicly declare your faith in Him through believer's baptism. Just let one of our pastors know!
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0`}>
                    4
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Serve in Ministry</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      As you've identified with the Lord through faith and baptism, identify with our local body by joining church membership and using your gifts to serve others.
                    </p>
                    <Link 
                      href="/ministries" 
                      className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 mt-2 inline-block transition-colors"
                    >
                      Find a Serving Opportunity →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4">Have Questions?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We'd love to help you take your next step. Reach out to us with any questions you may have.
                </p>
                <a 
                  href="mailto:orchardhillsbiblechurch@gmail.com" 
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 sm:py-3 px-5 sm:px-6 rounded-lg inline-block transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
