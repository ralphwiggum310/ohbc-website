'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiExternalLink } from 'react-icons/fi';

interface Track {
  id: string;
  title: string;
  permalink_url: string;
  stream_url: string;
  artwork_url: string;
  duration: number;
  user: {
    username: string;
  };
}

interface CustomAudioPlayerProps {
  playlistId: string;
  title: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ playlistId, title }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>(null);

  // Fetch playlist tracks from our API route
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching tracks for playlist:', playlistId);
        const apiUrl = `/api/soundcloud/tracks?playlistId=${playlistId}`;
        console.log('API URL:', apiUrl);
        
        const startTime = Date.now();
        const response = await fetch(apiUrl, { signal });
        const responseTime = Date.now() - startTime;
        
        console.log('Response status:', response.status, 'Time:', responseTime + 'ms');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch tracks: ${response.status} ${response.statusText}\n${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received tracks:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: expected an array of tracks');
        }
        
        setTracks(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error in fetchTracks:', errorMessage, err);
        setError(`Failed to load audio: ${errorMessage}`);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchTracks();

    return () => {
      controller.abort();
    };
  }, [playlistId]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Playback failed:', err);
        setError('Playback failed. Please try again.');
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  // Handle track end
  const handleTrackEnd = () => {
    if (currentTrackIndex < tracks.length - 1) {
      // Play next track
      setCurrentTrackIndex(prev => prev + 1);
    } else {
      // End of playlist
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  // Update progress bar
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume || 0.7;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Set up progress interval when playing
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(updateProgress, 500);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  // Update audio element when track changes
  useEffect(() => {
    if (tracks.length > 0 && audioRef.current) {
      const currentTrack = tracks[currentTrackIndex];
      if (currentTrack) {
        audioRef.current.src = currentTrack.stream_url;
        if (isPlaying) {
          audioRef.current.play().catch(err => {
            console.error('Autoplay failed:', err);
            setError('Autoplay was prevented. Please click play to start.');
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentTrackIndex, tracks, isPlaying]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="flex justify-center space-x-4 pt-4">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || tracks.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <p className="text-red-500 mb-4">
          {error || 'No tracks found in this playlist.'}
        </p>
        <a
          href="https://soundcloud.com/ohbcpayson"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          Listen on SoundCloud <FiExternalLink className="ml-1" />
        </a>
      </div>
    );
  }

  const currentTrack = tracks[currentTrackIndex];
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {/* Track Info */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-gray-600 text-sm">
          {currentTrack.user?.username || 'Orchard Hills Bible Church'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          aria-label="Seek"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={toggleMute}
          className="p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentTrackIndex(prev => Math.max(0, prev - 1))}
            disabled={currentTrackIndex === 0}
            className={`p-2 ${currentTrackIndex === 0 ? 'text-gray-400' : 'text-gray-700 hover:text-blue-600'}`}
            aria-label="Previous track"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} className="ml-1" />}
          </button>
          
          <button
            onClick={() => setCurrentTrackIndex(prev => Math.min(tracks.length - 1, prev + 1))}
            disabled={currentTrackIndex === tracks.length - 1}
            className={`p-2 ${currentTrackIndex === tracks.length - 1 ? 'text-gray-400' : 'text-gray-700 hover:text-blue-600'}`}
            aria-label="Next track"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
        
        <div className="w-24 flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-label="Volume control"
          />
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={handleTrackEnd}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        preload="metadata"
      />

      {/* Playlist */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <h4 className="font-medium text-gray-700 mb-3">Playlist</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              onClick={() => setCurrentTrackIndex(index)}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${currentTrackIndex === index ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                <span className="w-6 text-center text-sm text-gray-500 mr-2">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{track.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {track.user?.username || 'Orchard Hills Bible Church'}
                  </p>
                </div>
                {currentTrackIndex === index && (
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex-shrink-0 ml-2">
                    <div className="w-full h-full rounded-full bg-blue-600 animate-ping opacity-75"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SoundCloud Branding (required by SoundCloud's terms) */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <a
          href={currentTrack.permalink_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-gray-500 hover:text-blue-600"
        >
          <span>Listen on</span>
          <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="#FF5500">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.02.24-2.76-1.68-6.24-2.1-10.32-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.44-1.02 8.16-.6 11.22 1.32.42.24.48.84.18 1.2zm1.44-3.3c-.3.42-.84.6-1.26.3-3.18-1.92-8.04-2.46-11.82-1.38-.48.12-.96-.18-1.08-.66-.12-.48.18-.96.66-1.08 4.32-1.2 9.54-.6 13.14 1.56.42.24.54.84.18 1.26zm.12-3.36c-3.78-2.22-10.02-2.46-13.56-1.38-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.08-1.2 10.92-.96 15.12 1.56.54.3.72 1.02.42 1.56-.3.42-1.08.6-1.62.36z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
