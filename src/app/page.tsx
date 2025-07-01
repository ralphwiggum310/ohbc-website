'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const sections = [
    {
      title: 'Worship With Us',
      description: 'Join our welcoming community for Sunday worship services and midweek Bible studies.',
      image: '/images/site_img/PXL_20210113_2055297232.jpg',
      link: '/visit',
      buttonText: 'Service Times'
    },
    {
      title: 'Prayer Requests',
      description: 'Share your prayer requests with our prayer team or pray for others in our community.',
      image: '/images/prayer.jpg',
      link: '/prayer-requests',
      buttonText: 'Share a Request'
    },
    {
      title: 'Next Steps',
      description: 'New to OHBC? Learn how to get connected and grow in your faith journey.',
      image: '/images/Church/church-building.jpg',
      link: '/next-steps',
      buttonText: 'Get Started'
    },
    {
      title: 'Ministries',
      description: 'Discover opportunities to serve, connect, and grow through our various ministries.',
      image: '/images/site_img/Bible Study.jpg',
      link: '/ministries',
      buttonText: 'Explore Ministries'
    },
    {
      title: 'Watch & Listen',
      description: 'Catch up on recent sermons and worship services online.',
      image: '/images/site_img/watch&listen.jpg',
      link: '/watch-listen',
      buttonText: 'Watch Now'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/Church/church-building.jpg"
            alt="Church Building"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 px-4 w-full max-w-4xl mx-auto text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow">Welcome to Orchard Hills Bible Church</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow">
            To equip God's people to serve in the church and in the community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/visit" 
              className="bg-white/10 hover:bg-white/20 border-2 border-white/50 hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 duration-300"
            >
              Plan Your Visit
            </Link>
            <Link 
              href="/about" 
              className="bg-white/10 hover:bg-white/20 border-2 border-white/50 hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Welcome to Our Church Community</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="relative h-48 w-full">
                <Image 
                  src={section.image} 
                  alt={section.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 3} // Load first 3 images with priority
                />
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h2 className="text-2xl font-bold mb-3 text-gray-800">{section.title}</h2>
                <p className="text-gray-600 mb-4 flex-grow">{section.description}</p>
                <Link 
                  href={section.link}
                  className="text-blue-600 font-semibold hover:underline inline-flex items-center"
                >
                  {section.buttonText}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Call to Action */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Us This Sunday</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">We'd love for you to join us for worship this Sunday at 10:45 AM.</p>
          <Link 
            href="/visit" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold inline-block hover:bg-blue-700 transition-colors"
          >
            Get Directions
          </Link>
        </div>
      </div>
    </div>
  );
}
