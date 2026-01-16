'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiYoutube, FiExternalLink, FiLoader } from 'react-icons/fi';
import Image from 'next/image';
import HeroSection from '@/components/HeroSection';
import dynamic from 'next/dynamic';

// Dynamically import the VideoPlayerModal to avoid SSR issues with the YouTube iframe
const VideoPlayerModal = dynamic(
  () => import('@/components/VideoPlayerModal'),
  { ssr: false }
);

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
  durationInSeconds: number;
  viewCount: string;
  url: string;
  isShort: boolean;
}

type VideoType = 'all' | 'full' | 'shorts';

// Mock data for fallback
const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Sample Sermon 1',
    description: 'This is a sample sermon description.',
    thumbnail: '/images/site_img/sample-thumbnail.jpg',
    publishedAt: new Date().toISOString(),
    duration: '45:30',
    durationInSeconds: 2730, // 45 minutes and 30 seconds
    viewCount: '1234',
    url: '#',
    isShort: false
  },
  {
    id: '2',
    title: 'Sample Short',
    description: 'This is a sample short video.',
    thumbnail: '/images/site_img/sample-short.jpg',
    publishedAt: new Date().toISOString(),
    duration: '1:30',
    durationInSeconds: 90, // 1 minute and 30 seconds
    viewCount: '567',
    url: '#',
    isShort: true
  }
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
  const [videoType, setVideoType] = useState<VideoType>('all');
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // Scroll to top when component mounts or video type changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [videoType]);
  
  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
  }, []);
  
  const closeModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Helper function to parse ISO 8601 duration (e.g., 'PT1H23M45S') into seconds
  const parseDurationToSeconds = (duration: string): number => {
    if (!duration) return 0;
    
    // Handle ISO 8601 format (e.g., PT1H23M45S)
    const match = duration.match(/PT(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?/);
    if (!match) return 0;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    return (hours * 3600) + (minutes * 60) + seconds;
  };

  // Helper function to format seconds into MM:SS or HH:MM:SS
  const formatDuration = (duration: string): string => {
    if (!duration) return '0:00';
    
    // If it's already in a display format, return as is
    if (duration.includes(':')) return duration;
    
    // If it's in ISO 8601 format (PT#M#S or PT#H#M#S)
    const match = duration.match(/PT(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?/);
    if (!match) return '0:00';
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Filter videos based on selected type and duration
  const filteredVideos = useMemo(() => {
    if (!allVideos.length) return [];
    
    let filtered = allVideos.filter(video => {
      if (videoType === 'all') return true;
      
      // Use durationInSeconds if available, otherwise parse from duration string
      const durationInSeconds = video.durationInSeconds || parseDurationToSeconds(video.duration || '0:00');
      
      if (videoType === 'shorts') {
        // Shorts are less than 5 minutes (300 seconds)
        return durationInSeconds < 300;
      } else if (videoType === 'full') {
        // Full sermons are 20 minutes or longer (1200 seconds)
        return durationInSeconds >= 1200;
      }
      
      return true;
    });

    // For shorts, only show the 20 most recent
    if (videoType === 'shorts') {
      // Sort by published date (newest first) and take first 20
      filtered = [...filtered]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 20);
    }
    
    return filtered;
  }, [allVideos, videoType]);

  // Calculate video counts for each category - must match the filtering logic exactly
  const videoCounts = useMemo(() => {
    // Use the same logic as the filteredVideos calculation
    const fullVideos = allVideos.filter(video => {
      const durationInSeconds = video.durationInSeconds || 0;
      return durationInSeconds >= 1200; // 20 minutes or longer
    });

    const shortVideos = allVideos.filter(video => {
      const durationInSeconds = video.durationInSeconds || 0;
      return durationInSeconds < 300; // Less than 5 minutes
    });

    return {
      all: allVideos.length,
      full: fullVideos.length,
      shorts: shortVideos.length
    };
  }, [allVideos]);

  // Load videos when component mounts
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setApiStatus('Loading sermons from our channel...');
        
        // Fetch more videos from our channel (up to 70)
        const response = await fetch(`/api/youtube?maxResults=70`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch videos');
        }
        
        if (data.items && data.items.length > 0) {
          const videos = data.items.map((item: any) => {
            // Convert HTML entities in title and description
            const decodeHtml = (html: string) => {
              const txt = document.createElement('textarea');
              txt.innerHTML = html;
              return txt.value;
            };
            
            // Parse and store the duration
            const duration = item.contentDetails?.duration || 'PT0S';
            const durationInSeconds = parseDurationToSeconds(duration);
            const formattedDuration = formatDuration(duration);
            
            // Determine if it's a short based on duration (less than 5 minutes)
            const isShort = durationInSeconds < 300; // 5 minutes = 300 seconds
            
            return {
              id: item.id.videoId || item.id,
              title: decodeHtml(item.snippet.title),
              description: item.snippet.description ? decodeHtml(item.snippet.description) : '',
              thumbnail: item.snippet.thumbnails?.maxres?.url || 
                        item.snippet.thumbnails?.high?.url || 
                        item.snippet.thumbnails?.medium?.url || '',
              publishedAt: item.snippet.publishedAt,
              duration: formattedDuration,
              durationInSeconds: durationInSeconds,
              viewCount: item.statistics?.viewCount || '0',
              url: `https://www.youtube.com/watch?v=${item.id.videoId || item.id}`,
              isShort: isShort
            };
          });
          
          setAllVideos(videos);
          setApiStatus(`Loaded ${videos.length} sermons from our channel`);
        } else {
          // Fallback to mock data if no videos found
          setAllVideos(mockVideos);
          setApiStatus('Using sample data - no videos found from our channel');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos. Using sample data instead.');
        setAllVideos(mockVideos);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Video card component
  const VideoCard = ({ video }: { video: Video }) => {
    // Ensure we have a valid video ID and thumbnail
    if (!video.id) {
      console.warn('Invalid video data:', video);
      return null;
    }

    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative aspect-video bg-gray-100">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title || 'Video thumbnail'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FiYoutube className="text-gray-400 text-4xl" />
            </div>
          )}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            <a 
              href={video.url || `https://www.youtube.com/watch?v=${video.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              {video.title || 'Untitled Video'}
            </a>
          </h3>
          <div className="mt-auto">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{video.viewCount ? formatViewCount(video.viewCount) : 'Views not available'}</span>
              <span>{video.publishedAt ? formatDate(video.publishedAt) : ''}</span>
            </div>
            {video.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {video.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Status indicator
  const StatusIndicator = () => (
    <div className="mb-4">
      {isLoading && (
        <div className="p-2 text-blue-700 bg-blue-100 rounded-md">
          Loading videos...
        </div>
      )}
      {error && (
        <div className="p-2 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      {apiStatus && !isLoading && (
        <div className={`p-2 text-sm rounded-md ${
          apiStatus.includes('sample') ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {apiStatus}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        title="Sermons & Teachings"
        subtitle="Watch and listen to our latest sermons and teachings"
        bgGradient="from-gray-100 to-gray-200"
        textColor="text-gray-900"
      >
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {([
            { type: 'all', label: 'All Videos' },
            { type: 'full', label: 'Sermons' },
            { type: 'shorts', label: 'Shorts' }
          ] as const).map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setVideoType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                videoType === type
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{label}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {videoCounts[type]}
              </span>
            </button>
          ))}
        </div>
      </HeroSection>
      
      <div className="container mx-auto px-4 py-8">
        <StatusIndicator />

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading videos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video: Video) => (
              <div 
                key={video.id} 
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleVideoClick(video)}
              >
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          description={selectedVideo.description}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SermonsPage;
