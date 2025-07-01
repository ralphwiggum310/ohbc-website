import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Visit Us - Orchard Hills Bible Church',
  description: 'Join us for worship at Orchard Hills Bible Church. Find service times, directions, and contact information.',
};

export default function VisitPage() {
  const address = '1612 UT-198, Payson, UT 84655';
  const phone = '(801) 609-4107';
  const email = 'orchardhillsbiblechurch@gmail.com';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Greeting */}
      <div className="relative py-6 md:py-8 bg-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Come Visit Us</h1>
          <p className="text-gray-600 text-sm">We can't wait to meet you!</p>
        </div>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-center text-gray-700 mb-4">
            At Orchard Hills Bible Church, we welcome everyone with open arms. Whether you're new to the area, 
            looking for a church home, or just curious about faith, we'd love to meet you!
          </p>
          <p className="text-center text-gray-700">
            Have questions?{' '}
            <a href={`mailto:${email}`} className="text-[#991b1e] hover:underline font-medium">Email us</a> or give us a call.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Map */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-64 md:h-full w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3046.290123078512!2d-111.74312332386126!3d40.22968547144418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x874d8b20e1d0f7b9%3A0x1e9a4f0c4b9b5b1a!2s1612%20UT-198%2C%20Payson%2C%20UT%2084655!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="min-h-[400px]"
                title="Orchard Hills Bible Church Location"
              ></iframe>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Our Location</h2>
              <p className="text-gray-700 mb-4">{address}</p>
              <a
                href={`https://www.google.com/maps/dir//${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#991b1e] text-white px-6 py-2 rounded-lg hover:bg-[#7e1719] transition-colors"
              >
                Get Directions
              </a>
            </div>
          </div>

          {/* Right Column - Service Times & Contact */}
          <div className="space-y-8">
            {/* Service Times */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Service Times</h2>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg">Sunday School</h3>
                  <p className="text-gray-700">9:30 AM - 10:30 AM</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg">Sunday Morning Service</h3>
                  <p className="text-gray-700">10:45 AM - 12:15 PM</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Wednesday Evening Bible Study</h3>
                  <p className="text-gray-700">7:00 PM - 8:15 PM</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-gray-700">{address}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <a href={`tel:${phone}`} className="text-[#991b1e] hover:underline">
                    {phone}
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a href={`mailto:${email}`} className="text-[#991b1e] hover:underline">
                    {email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
