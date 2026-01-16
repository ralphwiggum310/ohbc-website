'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiYoutube, FiExternalLink, FiLoader } from 'react-icons/fi';
import Image from 'next/image';
import HeroSection from '@/components/HeroSection';

// Types for YouTube API response
interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
  };
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  url: string;
  isShort: boolean;
}

type VideoType = 'all' | 'full' | 'shorts';

// Mock data for fallback
const mockVideos: Video[] = [
  {
    id: 'mock1',
    title: 'Sample Sermon Title',
    description: 'This is a sample sermon description.',
    thumbnail: '/images/site_img/placeholder.jpg',
    publishedAt: new Date().toISOString(),
    duration: 'PT45M30S',
    viewCount: '1234',
    url: '#',
    isShort: false,
  },
];

// Format duration from ISO 8601 to MM:SS or HH:MM:SS
const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '00:00';
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Format date to readable format
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format view count
const formatViewCount = (count: string): string => {
  const num = parseInt(count);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`;
  }
  return `${num} views`;
};

const SermonsPage = () => {
  // State declarations
  const [videoType, setVideoType] = useState<VideoType>('all');
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string>('');
  
  // Filter videos based on selected type
  const videos = useMemo(() => {
    if (videoType === 'all') return allVideos;
    return allVideos.filter(video => 
      videoType === 'shorts' ? video.isShort : !video.isShort
    );
  }, [allVideos, videoType]);

  // Test YouTube API connection
  const testYouTubeAPI = async (): Promise<boolean> => {
    if (!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) {
      setError('YouTube API key is not configured');
      return false;
    }

    try {
      setApiStatus('Testing YouTube API connection...');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to connect to YouTube API');
      }
      
      setApiStatus('YouTube API connection successful!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`YouTube API Error: ${errorMessage}`);
      setApiStatus(`Error: ${errorMessage}`);
      return false;
    }
  };

  // Fetch videos from YouTube API
  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First test the API connection
      const isApiAvailable = await testYouTubeAPI();
      if (!isApiAvailable) {
        throw new Error('YouTube API is not available');
      }

      // If we get here, API is available - implement actual fetching here
      // For now, use mock data
      setAllVideos(mockVideos);
      
    } catch (err) {
      console.error('Error fetching videos:', err);
      setAllVideos(mockVideos); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  };

  // Load videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  // Video card component
  const VideoCard = ({ video }: { video: Video }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-video">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatViewCount(video.viewCount)}</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>
      </div>
    </div>
  );

  // API Test component
  const ApiTestButton = () => (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-2">YouTube API Test</h3>
      <button
        onClick={testYouTubeAPI}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>
      {apiStatus && (
        <div className="mt-2 p-2 text-sm rounded-md bg-gray-100">
          {apiStatus}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        title="Sermons & Teachings"
        subtitle="Watch our latest sermons and Bible teachings"
        bgGradient="from-blue-700 to-blue-900"
        textColor="text-white"
      >
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {(['all', 'full', 'shorts'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setVideoType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                videoType === type
                  ? 'bg-white text-blue-600'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {type === 'all' && 'All Videos'}
              {type === 'full' && 'Full Sermons'}
              {type === 'shorts' && 'Shorts'}
            </button>
          ))}
        </div>
      </HeroSection>

      <div className="container mx-auto px-4 py-12">
        <ApiTestButton />
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading videos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>{error}</p>
            <p className="mt-2 text-sm text-gray-600">Using sample data instead.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SermonsPage;
