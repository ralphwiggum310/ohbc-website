'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface MinistrySection {
  title: string;
  description: string[];
  image: string;
  schedule?: string;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  additionalInfo?: string[];
}

const ministries: { [key: string]: MinistrySection } = {
  youth: {
    title: 'Youth Ministries',
    description: [
      'At Orchard Hills Bible Church, we are passionate about investing in the next generation. Our Youth Ministry is designed to help middle school and high school students grow in their relationship with Jesus Christ while building meaningful relationships with their peers.',
      'We provide a safe and engaging environment where students can explore their faith, ask tough questions, and develop a biblical worldview that will guide them through the challenges of adolescence and beyond.'
    ],
    image: '/images/ministries/youth-group.jpg',
    schedule: 'Wednesdays • 7:00 PM - 8:15 PM',
    contact: {
      name: 'Youth Leader Name',
      email: 'youth@orchardhillsbiblechurch.com',
      phone: '(555) 123-4567'
    },
    additionalInfo: [
      'Weekly Bible studies and discussion groups',
      'Monthly service projects and outreach events',
      'Annual summer camp and winter retreats',
      'Special events throughout the year'
    ]
  },
  missionaries: {
    title: 'Missionaries We Support',
    description: [
      'We are committed to fulfilling the Great Commission by supporting missionaries around the world. Through prayer and financial support, we partner with these dedicated individuals and organizations to spread the Gospel and make disciples of all nations.',
      'Our missionaries serve in various capacities, including church planting, Bible translation, medical missions, and humanitarian aid.'
    ],
    image: '/images/ministries/missionaries.jpg',
    additionalInfo: [
      'Monthly prayer updates from our missionaries',
      'Opportunities to support specific mission projects',
      'Annual mission conference',
      'Short-term mission trip opportunities'
    ]
  }
};

const MinistryCard = ({ ministry }: { ministry: MinistrySection }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <div className="md:flex">
        <div className="md:flex-shrink-0 md:w-1/3 relative h-48 md:h-auto">
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{ministry.title}</h2>
          
          {ministry.description.map((paragraph, idx) => (
            <p key={idx} className="text-gray-600 mb-4">
              {paragraph}
            </p>
          ))}

          {ministry.schedule && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-800 mb-1">When We Meet</h3>
              <p className="text-blue-700">{ministry.schedule}</p>
            </div>
          )}

          {ministry.contact && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Contact</h3>
              <p className="text-gray-700">{ministry.contact.name}</p>
              <p className="text-blue-600 hover:underline">
                <a href={`mailto:${ministry.contact.email}`}>{ministry.contact.email}</a>
              </p>
              <p className="text-gray-700">{ministry.contact.phone}</p>
            </div>
          )}
        </div>
      </div>
      
      {ministry.additionalInfo && (
        <div className="px-6 pb-6 md:px-8 md:pb-8">
          <h3 className="font-semibold text-gray-800 mb-3">What We Offer</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ministry.additionalInfo.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function Ministries() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 py-6 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ministries</h1>
          <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto">
            Growing together in faith, serving together in love
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Ministries</h2>
            <p className="text-gray-600">
              At Orchard Hills Bible Church, we believe that every believer has been given spiritual gifts to serve the body of Christ. 
              Our ministries are designed to help you grow in your faith, connect with others, and make a difference in our community and beyond.
            </p>
          </div>

          <div className="space-y-12">
            <MinistryCard ministry={ministries.youth} />
            <Link href="/missionaries" className="block">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 md:w-1/3 relative h-48 md:h-auto">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Image 
                        src="/images/Church/Missionaries.png" 
                        alt="Missionaries We Support"
                        width={400}
                        height={300}
                        className="h-full w-auto object-contain"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Missionaries We Support</h2>
                    <p className="text-gray-600 mb-4">
                      Learn about the missionaries and organizations we partner with to spread the Gospel around the world.
                    </p>
                    <div className="text-blue-600 font-medium inline-flex items-center">
                      View All Missionaries
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Get Involved</h2>
            <p className="text-gray-600 mb-4">
              Interested in serving in one of our ministries? We'd love to help you find a place where you can use your gifts and talents to serve others.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Contact Us About Serving
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
