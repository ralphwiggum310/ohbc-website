'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedHero from '@/components/AnimatedHero';
import MobileCardCarousel from '@/components/MobileCardCarousel';

interface SectionCard {
  title: string;
  description: string;
  image: string;
  link: string;
  buttonText: string;
}

const sections: SectionCard[] = [
  {
    title: 'Worship With Us',
    description: 'Join our welcoming community for Sunday worship services and midweek Bible studies.',
    image: '/images/site_img/home_card_worship.jpg',
    link: '/visit',
    buttonText: 'Service Times',
  },
  {
    title: 'Next Steps',
    description: "New to OHBC? Learn how to get connected and grow in your faith journey.",
    image: '/images/site_img/home_card_nextsteps.jpg',
    link: '/next-steps',
    buttonText: 'Get Started',
  },
  {
    title: 'Ministries',
    description: 'Discover opportunities to serve, connect, and grow through our various ministries.',
    image: '/images/site_img/home_card_ministries.png',
    link: '/ministries',
    buttonText: 'Explore Ministries',
  },
  {
    title: 'Announcements',
    description: 'Stay updated with our latest news, weekly bulletins, and important announcements.',
    image: '/images/site_img/home_card_announcements.png',
    link: '/announcements',
    buttonText: 'View All',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-0 bg-white dark:bg-gray-900">
      {/* Hero */}
      <AnimatedHero
        logoPath="/logo/OHBC_animated_logo.png"
        backgroundImage="/images/site_img/homepage_hero_building.jpg"
        mobileBackgroundImage="/images/site_img/mobile_homepage_hero_building.jpg"
        subtitle="We exist to equip God's people to serve in the church and in the community."
      />

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 py-5 sm:py-8 flex-grow">
        <h2 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800 dark:text-white">
          Welcome to Our Church Community
        </h2>

        {/* Mobile: swipe carousel (single card view) */}
        <MobileCardCarousel sections={sections} />

        {/* Desktop: 4-column grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((section, index) => (
            <Link
              key={index}
              href={section.link}
              className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden flex flex-col shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative w-full pt-[60%] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  priority={index < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-base font-semibold mb-1.5 text-gray-900 dark:text-white group-hover:text-red-800 dark:group-hover:text-blue-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed flex-1">
                  {section.description}
                </p>
                <span className="inline-flex items-center mt-3 text-sm font-medium" style={{ color: '#5c1a1a' }}>
                  {section.buttonText}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Call to action */}
      <div className="bg-gray-100 dark:bg-gray-800 py-8 sm:py-10 transition-colors duration-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white">Join Us This Sunday</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            We'd love for you to join us for worship this Sunday at 10:45 AM.
          </p>
          <Link
            href="/visit"
            className="inline-block text-white px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 text-sm sm:text-base"
            style={{ backgroundColor: '#5c1a1a' }}
          >
            Get Directions
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-5 transition-colors duration-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Orchard Hills Bible Church. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
