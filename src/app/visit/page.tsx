import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';

export const metadata = {
  title: 'Visit Us - Orchard Hills Bible Church',
  description: 'Join us for worship at Orchard Hills Bible Church. Find service times, directions, and contact information.',
};

export default function VisitPage() {
  const address = '1612 UT-198, Payson, UT 84655';
  const phone = '(801) 609-4107';
  const email = 'orchardhillsbiblechurch@gmail.com';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <HeroSection 
        title="Come Visit Us"
        subtitle="We'd love to welcome you to Orchard Hills Bible Church"
        className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-gray-800 dark:to-gray-900 text-white py-3 sm:py-4"
      >
        <div className="mt-6"></div>
      </HeroSection>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Service Times & Contact - Now at the top */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Service Times */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">Service Times</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200/50 pb-4">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">Sunday School</h3>
                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200">9:30 AM - 10:30 AM</p>
              </div>
              <div className="border-b border-gray-200/50 pb-4">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">Sunday Morning Service</h3>
                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200">10:45 AM - 12:15 PM</p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">Wednesday Evening Bible Study</h3>
                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200">7:00 PM - 8:15 PM</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-white">Contact Us</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">Address</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{address}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">Phone</h3>
                <a href={`tel:${phone}`} className="text-[#991b1e] hover:underline dark:text-white dark:hover:text-gray-200">
                  {phone}
                </a>
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">Email</h3>
                <a href={`mailto:${email}`} className="text-[#991b1e] hover:underline dark:text-white dark:hover:text-gray-200">
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section - Now below service times and contact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
          <div className="h-64 md:h-[500px] w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3046.290123078512!2d-111.74312332386126!3d40.22968547144418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x874d8b20e1d0f7b9%3A0x1e9a4f0c4b9b5b1a!2s1612%20UT-198%2C%20Payson%2C%20UT%2084655!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Orchard Hills Bible Church Location"
            ></iframe>
          </div>
          <div className="p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">Our Location</h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">{address}</p>
            <a
              href={`https://www.google.com/maps/dir//${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#991b1e] text-white px-6 py-2 rounded-lg hover:bg-[#7e1719] dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
