'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { FiYoutube, FiExternalLink, FiMusic, FiPlay, FiPause } from 'react-icons/fi';

// SoundCloud playlist ID - replace with your actual playlist ID
const SOUNDCLOUD_PLAYLIST_ID = '1234567890';
const SOUNDCLOUD_WIDGET_URL = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${SOUNDCLOUD_PLAYLIST_ID}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;

// Sample sermon data - replace with your actual sermon data
const recentSermons = [
  {
    id: 1,
    title: 'The Power of Faith',
    date: 'November 28, 2023',
    speaker: 'Pastor John Smith',
    duration: '42:15',
    url: 'https://soundcloud.com/example/sermon-1'
  },
  {
    id: 2,
    title: 'Finding Peace in Troubled Times',
    date: 'November 21, 2023',
    speaker: 'Pastor Sarah Johnson',
    duration: '38:45',
    url: 'https://soundcloud.com/example/sermon-2'
  },
  // Add more sermons as needed
];

const ListenPage = () => {
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Check if user is on mobile
  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    setIsMobile(isAndroid || isIOS);
  }, []);
  
  // Function to open SoundCloud in the app or web
  const openSoundCloud = () => {
    const webUrl = 'https://soundcloud.com/your-channel';
    
    if (isMobile) {
      const userAgent = navigator.userAgent;
      
      // iOS: Try to open the app directly with a simple link
      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        window.location.href = 'soundcloud://users/your-username';
        
        // Fallback to web after a short delay
        setTimeout(() => {
          if (!document.hidden) {
            window.open(webUrl, '_blank', 'noopener,noreferrer');
          }
        }, 500);
      } 
      // Android: Use a direct link that will trigger the app chooser
      else if (/Android/i.test(userAgent)) {
        window.location.href = `intent://soundcloud.com/your-channel#Intent;package=com.soundcloud.android;scheme=https;end`;
        
        // Fallback to web after a short delay
        setTimeout(() => {
          if (!document.hidden) {
            window.open(webUrl, '_blank', 'noopener,noreferrer');
          }
        }, 500);
      } else {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    // Set a timeout to detect if the iframe is blocked
    const timer = setTimeout(() => {
      if (isLoading && !iframeBlocked) {
        // Check if iframe is in the DOM but not loaded
        const iframe = iframeRef.current;
        if (iframe && (!iframe.contentWindow || !iframe.contentWindow.length)) {
          setIframeBlocked(true);
        }
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, iframeBlocked]);

  const handlePlay = (id: number) => {
    setCurrentTrack(id);
    setIsPlaying(id);
  };

  const handlePause = () => {
    setIsPlaying(null);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeBlocked(false);
  };

  const handleIframeError = () => {
    setIframeBlocked(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Listen | Orchard Hills Bible Church</title>
        <meta name="description" content="Listen to audio sermons and teachings from Orchard Hills Bible Church" />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Listen to Sermons</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse our collection of audio sermons and teachings. Available on your favorite platforms.
          </p>
        </div>
        
        {/* SoundCloud Player */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Latest Sermons</h2>
          {isMobile && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Mobile User?</span> For the best experience, 
                <button 
                  onClick={openSoundCloud}
                  className="ml-1 text-blue-600 font-medium hover:underline"
                >
                  open in the SoundCloud app
                </button>
              </p>
            </div>
          )}
          
          <div className="mb-8">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden relative">
              <iframe
                ref={iframeRef}
                width="100%"
                height="300"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                src={SOUNDCLOUD_WIDGET_URL}
                className="w-full h-[300px]"
                style={{
                  visibility: isLoading ? 'hidden' : 'visible',
                  opacity: isLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="text-sm text-gray-500">Loading player...</div>
                  </div>
                </div>
              )}
            </div>
            {!iframeBlocked && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                Having trouble with the player?{' '}
                <a 
                  href="https://soundcloud.com/your-channel" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline font-medium"
                >
                  Listen on SoundCloud
                </a>
              </div>
            )}
          
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Recent Sermons</h3>
          <div className="space-y-4">
            {recentSermons.map((sermon) => (
              <div 
                key={sermon.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{sermon.title}</h4>
                    <p className="text-sm text-gray-500">{sermon.speaker} • {sermon.date} • {sermon.duration}</p>
                  </div>
                  <button 
                    onClick={() => isPlaying === sermon.id ? handlePause() : handlePlay(sermon.id)}
                    className="ml-4 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    aria-label={isPlaying === sermon.id ? 'Pause' : 'Play'}
                  >
                    {isPlaying === sermon.id ? <FiPause /> : <FiPlay />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Other Listening Options */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">More Ways to Listen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 flex items-start hover:shadow-md transition-shadow">
              <div className="bg-red-100 p-3 rounded-full mr-4 flex-shrink-0">
                <FiYoutube className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">YouTube</h3>
                <p className="text-gray-600 mb-3">Watch and listen to our latest messages and teachings on YouTube.</p>
                <a 
                  href="https://www.youtube.com/@OrchardHillsBibleChurch/playlists" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:underline font-medium"
                >
                  Watch on YouTube <FiExternalLink className="ml-1" />
                </a>
              </div>
            </div>
            
            <div className="border rounded-lg p-6 flex items-start hover:shadow-md transition-shadow">
              <div className="bg-orange-100 p-3 rounded-full mr-4 flex-shrink-0">
                <FiMusic className="text-orange-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Podcast</h3>
                <p className="text-gray-600 mb-3">Subscribe to our podcast for the latest messages and teachings on the go.</p>
                <a 
                  href="https://www.youtube.com/@OrchardHillsBibleChurch/playlists" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:underline font-medium"
                >
                  Subscribe on YouTube <FiExternalLink className="ml-1" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-red-50 rounded-lg p-6 border border-red-100">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="font-semibold text-lg mb-1">Stay Connected</h3>
                <p className="text-gray-600">Subscribe to our YouTube channel to get notified about new audio messages.</p>
              </div>
              <a 
                href="https://www.youtube.com/@OrchardHillsBibleChurch?sub_confirmation=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 whitespace-nowrap"
              >
                <FiYoutube className="mr-2 h-5 w-5" />
                Subscribe on YouTube
              </a>
            </div>
          </div>
        </div>

        {/* SoundCloud Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Listen on SoundCloud</h2>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-100 p-4 rounded-full">
                <FiMusic className="text-orange-500 text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Orchard Hills Bible Church on SoundCloud</h3>
            <p className="text-gray-600 mb-6">Listen to our audio messages and teachings on SoundCloud</p>
            <a 
              href="https://soundcloud.com/ohbcpayson" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.2 15.1c-.4 0-.8.3-.8.8 0 .4.3.8.8.8s.8-.3.8-.8c0-.5-.4-.8-.8-.8zm1.2-1.8c0-3.8-3.1-6.9-6.9-6.9-3.8 0-6.9 3.1-6.9 6.9 0 .4.3.8.8.8s.8-.3.8-.8c0-2.9 2.4-5.3 5.3-5.3 2.9 0 5.3 2.4 5.3 5.3 0 .4.3.8.8.8s.8-.4.8-.8zm-2.4 0c0-2.4-1.9-4.3-4.3-4.3s-4.3 1.9-4.3 4.3c0 .4.3.8.8.8s.8-.3.8-.8c0-1.5 1.2-2.7 2.7-2.7s2.7 1.2 2.7 2.7c0 .4.3.8.8.8s.8-.4.8-.8z"/>
              </svg>
              Listen on SoundCloud
            </a>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-medium mb-4">Listen to our latest message:</h4>
              <div className="bg-gray-100 rounded-lg p-4">
                <iframe 
                  width="100%" 
                  height="166" 
                  scrolling="no" 
                  frameBorder="no" 
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/ohbcpayson&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                  className="w-full h-[166px]"
                ></iframe>
                <div className="mt-4">
                  <h5 className="font-medium">More ways to listen:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                    <li>
                      <a href="https://soundcloud.com/ohbcpayson" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                        Browse all messages on SoundCloud
                      </a>
                    </li>
                    <li>
                      <a href="https://soundcloud.com/ohbcpayson/sets" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                        View sermon series playlists
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center">
                Having issues with the player? Try these direct links:
                <div className="mt-2 flex justify-center space-x-4">
                  <a href="https://soundcloud.com/ohbcpayson" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                    SoundCloud Profile
                  </a>
                  <a href="https://soundcloud.com/ohbcpayson/sets" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                    Sermon Playlists
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListenPage;
