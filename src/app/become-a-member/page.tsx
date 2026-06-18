'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';

export default function BecomeAMember() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      {/* Hero Section */}
      <HeroSection 
        title="Become a Member"
        subtitle="Join our church family and discover the joy of belonging to a community of faith."
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-12 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">Welcome to Our Family</h2>
              
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                  Becoming a member of Orchard Hills Bible Church is more than just attending services - it's about 
                  finding your spiritual home, building meaningful relationships, and growing together in faith. 
                  We invite you to join our family and discover the joy of belonging to a community that cares 
                  deeply about God and each other.
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  Membership is a commitment to journey together in faith, support one another through life's 
                  challenges, and work collectively to share God's love with our community and beyond.
                </p>
              </div>
            </div>
          </div>

          {/* Membership Process */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-12 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">Your Journey to Membership</h2>
              
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0`}>
                    1
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Attend Our Services</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Join us for worship and experience our community firsthand. Get to know our pastors, 
                      members, and the heart of our church family.
                    </p>
                    <Link 
                      href="/visit" 
                      className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 mt-2 inline-block transition-colors"
                    >
                      Service Times & Directions &rarr;
                    </Link>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0`}>
                    2
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Complete Discovery Class</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Learn about our beliefs, history, and vision for ministry. This class is designed to help 
                      you understand what it means to be part of Orchard Hills Bible Church.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Classes are offered quarterly on Sunday afternoons.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0`}>
                    3
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Meet with an Elder</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Share your faith journey and get to know our leadership team. This is a wonderful opportunity 
                      to ask questions and connect with those who shepherd our church.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0`}>
                    4
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Join the Family</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Be welcomed into our church family during a Sunday service celebration. We'll rejoice with 
                      you as you take this important step in your faith journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What We Believe */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-12 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">What We Believe</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      &check;
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">The Bible is God's Word</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        We believe the Bible is inspired by God and is our ultimate authority for faith and life.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      &check;
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Jesus is Our Savior</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        We believe Jesus Christ died for our sins, rose again, and offers eternal life to all who believe.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      &check;
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">The Church is God's Family</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        We believe the church is a community of believers called to love God and love one another.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      &check;
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">We're Called to Serve</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        We believe every believer is gifted and called to serve God and make a difference in the world.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  href="/what-we-believe" 
                  className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Read Our Complete Statement of Faith &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Get Involved */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-12 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">Get Involved</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    <span className="text-2xl">&hearts;</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Small Groups</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Join a small group to build relationships and grow in faith together.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    <span className="text-2xl">&#9865;</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Serve Teams</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Use your gifts to serve others and make a difference in our community.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    <span className="text-2xl">&#10084;</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Outreach</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Join us in sharing God's love through local and global outreach initiatives.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
            <div className="p-6 sm:p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Take the Next Step?</h2>
              <p className="text-blue-100 text-lg mb-8">
                We'd love to hear from you and help you begin your journey to membership.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Contact Us
                </Link>
                
                <Link 
                  href="/visit"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors duration-200"
                >
                  Visit This Sunday
                </Link>
              </div>
              
              <div className="mt-8">
                <p className="text-blue-100 text-sm">
                  Questions about membership? Email us at{' '}
                  <a 
                    href="mailto:info@orchardhillsbible.org" 
                    className="text-white hover:underline transition-colors"
                  >
                    info@orchardhillsbible.org
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
