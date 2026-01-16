'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NextSteps() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Next Steps</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Discover how you can grow and get connected at Orchard Hills Bible Church.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Get Connected</h2>
              
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Attend a Service</h3>
                    <p className="text-gray-600">
                      Join us for worship on Sunday morning and Wednesday night.
                    </p>
                    <Link href="/visit" className="text-blue-600 hover:underline mt-2 inline-block">
                      Service Times & Directions →
                    </Link>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Learn About Our Beliefs</h3>
                    <p className="text-gray-600">
                      Discover what we believe and how it shapes our church community.
                    </p>
                    <Link href="/what-we-believe" className="text-blue-600 hover:underline mt-2 inline-block">
                      Our Beliefs →
                    </Link>
                  </div>
                </div>



                {/* Step 3 */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Get Baptized</h3>
                    <p className="text-gray-600">
                      If you've been saved by the grace of the Lord Jesus Christ and have not yet obeyed His command to be baptized, take the step to publicly declare your faith in Him through believer's baptism. Just let one of our pastors know!
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Serve in Ministry</h3>
                    <p className="text-gray-600">
                      As you've identified with the Lord through faith and baptism, identify with our local body by joining church membership and using your gifts to serve others.
                    </p>
                    <Link href="/ministries" className="text-blue-600 hover:underline mt-2 inline-block">
                      Find a Serving Opportunity →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Have Questions?</h3>
                <p className="text-gray-600 mb-6">
                  We'd love to help you take your next step. Reach out to us with any questions you may have.
                </p>
                <a 
                  href="mailto:orchardhillsbiblechurch@gmail.com" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg inline-block transition-colors"
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
