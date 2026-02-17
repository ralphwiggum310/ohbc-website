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
    <div className="flex flex-col min-h-0 bg-white dark:bg-gray-900">
      {/* Animated Hero Section */}
      <AnimatedHero
        logoPath="/logo/OHBC_animated_logo.png"
        backgroundImage="/images/site_img/homepage_hero_building.jpg"
        mobileBackgroundImage="/images/site_img/mobile_homepage_hero_building.jpg"
        subtitle="We exist to equip God's people to serve in the church and in the community."
      />

      {/* Main Content */}
      <main className="container mx-auto px-1.5 py-3 sm:py-4 flex-grow">
        <h2 className="text-base sm:text-xl font-bold text-center mb-3 sm:mb-5 text-gray-800 dark:text-blue-100">Welcome to Our Church Community</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="card-group bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Link 
                href={section.link}
                target="_self"
                rel=""
                className="flex flex-col h-full group"
              >
                <div className="relative w-full pt-[56.25%] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="absolute inset-0">
                    <Image 
                      src={section.image} 
                      alt={section.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={index < 3}
                      style={{
                        objectPosition: 'center center'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                </div>
                
                <div className="card-content p-1.5 sm:p-2 flex-1 flex flex-col">
                  <h3 className="text-xxs sm:text-sm font-semibold mb-0.5 text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-[0.6rem] sm:text-xs line-clamp-2 leading-tight">
                    {section.description}
                  </p>
                  <div className="mt-0.5 sm:mt-1">
                    <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium text-[0.6rem] sm:text-xxs group-hover:underline">
                      {section.buttonText}
                      <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
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
      <div className="bg-gray-100 dark:bg-gray-800 py-4 sm:py-6 transition-colors duration-200 -mt-1">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-lg sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white">Join Us This Sunday</h2>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-300 mb-3 max-w-2xl mx-auto">We'd love for you to join us for worship this Sunday at 10:45 AM.</p>
          <Link 
            href="/visit" 
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium inline-block transition-colors"
          >
            Get Directions
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-4 transition-colors duration-200">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Orchard Hills Bible Church. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
