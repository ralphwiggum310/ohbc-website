'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { FiYoutube, FiClock, FiExternalLink } from 'react-icons/fi';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  videoUrl: string;
}

const YOUTUBE_CHANNEL_ID = 'UChBLU82WKDW8PRJSqeZf0ww';
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';

const WatchPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format duration from ISO 8601 to human readable
  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Format view count
  const formatViewCount = (count: string): string => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Fetch videos from YouTube API
  useEffect(() => {
    const fetchVideos = async () => {
      console.log('YOUTUBE_API_KEY:', YOUTUBE_API_KEY ? '***' : 'Not set');
      if (!YOUTUBE_API_KEY) {
        const errorMsg = 'YouTube API key is not configured. Please check your .env.local file';
        console.error(errorMsg);
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch uploads playlist ID from channel
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`;
        console.log('Fetching channel data from:', channelUrl);
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();
        console.log('Channel API response:', channelData);
        
        if (!channelData.items || channelData.items.length === 0) {
          throw new Error('Channel not found');
        }
        
        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        
        // Fetch videos from uploads playlist
        const playlistResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=12&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
        );
        const playlistData = await playlistResponse.json();
        
        if (!playlistData.items || playlistData.items.length === 0) {
          throw new Error('No videos found in the playlist');
        }
        
        // Get video IDs for batch request
        const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
        
        // Fetch video details including duration and view count
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        console.log('Fetching videos from:', videosUrl);
        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();
        console.log('Videos API response:', videosData);
        
        // Transform and sort videos
        const videosList = videosData.items.map((video: any) => ({
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.medium.url,
          publishedAt: video.snippet.publishedAt,
          duration: formatDuration(video.contentDetails.duration),
          viewCount: video.statistics.viewCount,
          videoUrl: `https://www.youtube.com/watch?v=${video.id}`
        })).sort((a: Video, b: Video) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        
        setVideos(videosList);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Watch Sermons | Orchard Hills Bible Church</title>
          <meta name="description" content="Watch video sermons and teachings from Orchard Hills Bible Church" />
        </Head>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Watch Sermons | Orchard Hills Bible Church</title>
          <meta name="description" content="Watch video sermons and teachings from Orchard Hills Bible Church" />
        </Head>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Videos</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Watch Sermons | Orchard Hills Bible Church</title>
          <meta name="description" content="Watch video sermons and teachings from Orchard Hills Bible Church" />
        </Head>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Videos Available</h2>
            <p className="text-gray-600 mb-6">Check back later for new sermon videos and teachings.</p>
            <a
              href="https://www.youtube.com/@OrchardHillsBibleChurch"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiYoutube className="mr-2" /> Visit Our YouTube Channel
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Watch Sermons | Orchard Hills Bible Church</title>
        <meta name="description" content="Watch video sermons and teachings from Orchard Hills Bible Church" />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        {/* YouTube Channel CTA - Moved to top */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1 mb-4 md:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Watch Sermons</h1>
              <p className="text-lg text-gray-600">
                Get notified when we upload new videos and live streams.
              </p>
            </div>
            <a 
              href="https://www.youtube.com/@OrchardHillsBibleChurch?sub_confirmation=1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 whitespace-nowrap"
            >
              <FiYoutube className="mr-2 h-5 w-5" />
              Subscribe on YouTube
            </a>
          </div>
        </div>
        
        {/* Video Grid Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Latest Videos</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm rounded-md bg-blue-50 text-blue-700">All</button>
              <button className="px-3 py-1 text-sm rounded-md hover:bg-gray-100">Sermons</button>
              <button className="px-3 py-1 text-sm rounded-md hover:bg-gray-100">Bible Studies</button>
            </div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <a 
                  href={video.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block relative group"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      width={480}
                      height={270}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors flex items-center justify-center">
                      <div className="bg-black bg-opacity-70 rounded-full p-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                </a>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    <a 
                      href={video.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-red-600 transition-colors"
                    >
                      {video.title}
                    </a>
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{formatViewCount(video.viewCount)}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(video.publishedAt)}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        

      </main>
    </div>
  );
};

export default WatchPage;
