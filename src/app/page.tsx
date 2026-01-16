'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedHero from '@/components/AnimatedHero';

interface SectionCard {
  title: string;
  description: string;
  image: string;
  link: string;
  buttonText: string;
  isExternal?: boolean;
}

export default function Home() {
  const sections: SectionCard[] = [
    {
      title: 'Worship With Us',
      description: 'Join our welcoming community for Sunday worship services and midweek Bible studies.',
      image: '/images/site_img/home_card_worship.jpg',
      link: '/visit',
      buttonText: 'Service Times'
    },
    {
      title: 'Next Steps',
      description: 'New to OHBC? Learn how to get connected and grow in your faith journey.',
      image: '/images/site_img/home_card_nextsteps.jpg',
      link: '/next-steps',
      buttonText: 'Get Started'
    },
    {
      title: 'Ministries',
      description: 'Discover opportunities to serve, connect, and grow through our various ministries.',
      image: '/images/site_img/home_card_ministries.png',
      link: '/ministries',
      buttonText: 'Explore Ministries'
    },
    {
      title: 'Announcements',
      description: 'Stay updated with our latest news, weekly bulletins, and important announcements.',
      image: '/images/site_img/home_card_announcements.png',
      link: '/announcements',
      buttonText: 'View All'
    },
    // Prayer Requests section is temporarily hidden
    // {
    //   title: 'Prayer Requests',
    //   description: 'Share your prayer requests with our prayer team or pray for others in our community.',
    //   image: '/images/site_img/prayer-request.png',
    //   link: '/prayer-requests',
    //   buttonText: 'Share a Request'
    // },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Animated Hero Section */}
      <AnimatedHero
        logoPath="/logo/OHBC_animated_logo.png"
        backgroundImage="/images/site_img/homepage_hero_building.jpg"
        mobileBackgroundImage="/images/site_img/mobile_homepage_hero_building.jpg"
        subtitle="We exist to equip God's people to serve in the church and in the community."
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Welcome to Our Church Community</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="card-group bg-white rounded-lg overflow-hidden flex flex-col h-full"
            >
              <Link 
                href={section.link}
                target="_self"
                rel=""
                className="flex flex-col h-full"
              >
                <div className="card-image-container relative w-full aspect-video bg-gray-100 overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image 
                      src={section.image} 
                      alt={section.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 3}
                      style={{
                        objectPosition: 'center center',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-2xl font-bold mb-3 text-gray-800 card-link">
                    {section.title}
                    {section.isExternal && (
                      <span className="ml-2 inline-block">
                        <svg className="w-4 h-4 text-blue-500 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-600 mb-4 flex-grow">{section.description}</p>
                  <div className="text-blue-600 font-semibold inline-flex items-center group-hover:underline">
                    {section.buttonText}
                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        .card-group {
          transition: all 0.3s ease-in-out;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .card-group:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .card-image-container {
          min-height: 12rem;
        }
        .card-link {
          transition: color 0.2s ease-in-out;
        }
        .card-link:hover {
          color: #2563eb; /* blue-600 */
        }
      `}</style>

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
