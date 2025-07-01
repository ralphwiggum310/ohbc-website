'use client';

import React from 'react';
import Head from 'next/head';

const WatchListenPage = () => {
  // Sample video data - replace with actual video content
  const videos = [
    {
      id: 1,
      title: 'Sunday Service - June 25, 2023',
      description: 'Join us for our weekly Sunday service.',
      date: 'June 25, 2023',
      thumbnail: '/images/sermon-thumbnail.jpg',
      videoUrl: '#'
    },
    // Add more video entries as needed
  ];

  // Sample audio data - replace with actual audio content
  const audioSermons = [
    {
      id: 1,
      title: 'The Power of Faith',
      speaker: 'Pastor John Smith',
      date: 'June 25, 2023',
      duration: '42:15',
      audioUrl: '#'
    },
    {
      id: 2,
      title: 'Walking in Love',
      speaker: 'Pastor John Smith',
      date: 'June 18, 2023',
      duration: '38:52',
      audioUrl: '#'
    },
    // Add more audio entries as needed
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Watch & Listen | Orchard Hills Bible Church</title>
        <meta name="description" content="Watch and listen to sermons and teachings from Orchard Hills Bible Church" />
      </Head>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Watch & Listen</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Sermons, teachings, and messages from Orchard Hills Bible Church
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Videos Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Videos</h2>
          </div>
          
          <div className="mb-8 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">YouTube Channel</h3>
              <p className="text-gray-600 mb-6">Subscribe to our YouTube channel for video sermons, Bible studies, and more.</p>
              <a 
                href="https://www.youtube.com/@OrchardHillsBibleChurch/playlists" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Visit Our YouTube Channel
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.length > 0 ? (
              videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative pt-[56.25%] bg-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{video.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{video.date}</p>
                    <p className="text-gray-600">{video.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No videos available at this time. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* Audio Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Audio Sermons</h2>
          </div>
          
          {/* SoundCloud Channel Widget */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">OHBC Audio Sermons</h3>
              <p className="text-gray-600 mb-6">Listen to our latest sermons and Bible studies from Orchard Hills Bible Church.</p>
              
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  width="100%" 
                  height="450" 
                  scrolling="no" 
                  frameBorder="no" 
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/ohbcpayson&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                  className="w-full rounded-lg"
                  title="OHBC Audio Sermons"
                ></iframe>
              </div>
              
              <div className="mt-4 text-center">
                <a 
                  href="https://soundcloud.com/ohbcpayson" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                >
                  <span>View all sermons on SoundCloud</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Additional SoundCloud Playlist */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-8">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Bible Study Series</h3>
              <p className="text-gray-600 mb-6">Explore our in-depth Bible study series and teachings.</p>
              
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  width="100%" 
                  height="450" 
                  scrolling="no" 
                  frameBorder="no" 
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1513200853&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                  className="w-full rounded-lg"
                  title="Bible Study Series"
                ></iframe>
              </div>
              
              <div className="mt-4 text-center">
                <a 
                  href="https://soundcloud.com/ohbcpayson/sets/bible-study" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                >
                  <span>View all Bible studies on SoundCloud</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Second Additional SoundCloud Playlist */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-8">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Sunday Morning Messages</h3>
              <p className="text-gray-600 mb-6">Listen to our weekly Sunday morning worship services.</p>
              
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  width="100%" 
                  height="450" 
                  scrolling="no" 
                  frameBorder="no" 
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1752723957&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                  className="w-full rounded-lg"
                  title="Sunday Morning Messages"
                ></iframe>
              </div>
              
              <div className="mt-4 text-center">
                <a 
                  href="https://soundcloud.com/ohbcpayson/sets/sunday-morning" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                >
                  <span>View all Sunday messages on SoundCloud</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Third Additional SoundCloud Playlist */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-8">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Special Services</h3>
              <p className="text-gray-600 mb-6">Recordings from special services and events throughout the year.</p>
              
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  width="100%" 
                  height="450" 
                  scrolling="no" 
                  frameBorder="no" 
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1761516552&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                  className="w-full rounded-lg"
                  title="Special Services"
                ></iframe>
              </div>
              
              <div className="mt-4 text-center">
                <a 
                  href="https://soundcloud.com/ohbcpayson/sets/special-services" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                >
                  <span>View all special services on SoundCloud</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WatchListenPage;
