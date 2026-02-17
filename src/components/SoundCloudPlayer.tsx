'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiSkipBack, FiSkipForward, FiExternalLink } from 'react-icons/fi';
import { FaSoundcloud } from 'react-icons/fa';

interface SoundCloudPlayerProps {
  playlistId: string;
  title?: string;
  clientId?: string;
}

interface Track {
  id: string;
  title: string;
  permalink_url: string;
  artwork_url: string;
  duration: number;
  stream_url: string;
  user: {
    username: string;
  };
}

const SoundCloudPlayer: React.FC<SoundCloudPlayerProps> = ({ 
  playlistId, 
  title = 'Playlist',
  clientId 
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch tracks from SoundCloud API
  useEffect(() => {
    const fetchTracks = async () => {
      if (!clientId) {
        setError('SoundCloud client ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // First, get the playlist data
        const response = await fetch(
          `https://api.soundcloud.com/playlists/${playlistId}?client_id=${clientId}&representation=full`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.tracks || !Array.isArray(data.tracks)) {
          throw new Error('No tracks found in playlist');
        }
        
        // Process tracks
        const processedTracks = data.tracks.map((track: any) => ({
          id: track.id,
          title: track.title,
          permalink_url: track.permalink_url,
          artwork_url: track.artwork_url || track.user?.avatar_url || '',
          duration: track.duration / 1000, // Convert to seconds
          stream_url: `${track.media?.transcodings?.[0]?.url || `https://api.soundcloud.com/tracks/${track.id}/stream`}?client_id=${clientId}`,
          user: {
            username: track.user?.username || 'SoundCloud User'
          }
        }));
        
        setTracks(processedTracks);
        
      } catch (err) {
        console.error('Error fetching SoundCloud tracks:', err);
        setError(`Failed to load tracks: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTracks();
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playlistId, clientId]);

  // Handle track changes
  useEffect(() => {
    if (tracks.length === 0 || !audioRef.current) return;
    
    const currentTrack = tracks[currentTrackIndex];
    if (!currentTrack) return;
    
    const setupAudio = async () => {
      try {
        // If we have a transcoding URL, resolve it to get the actual stream URL
        let streamUrl = currentTrack.stream_url;
        
        if (streamUrl.includes('transcodings')) {
          const response = await fetch(streamUrl);
          if (response.ok) {
            const data = await response.json();
            streamUrl = data.url;
          }
        }
        
        // Set up the audio element
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = streamUrl;
          audioRef.current.volume = isMuted ? 0 : volume;
          
          if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error('Playback failed:', error);
                setIsPlaying(false);
              });
            }
          }
          
          // Set up progress tracking
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
          
          progressInterval.current = setInterval(() => {
            if (audioRef.current) {
              setProgress(audioRef.current.currentTime);
              setDuration(audioRef.current.duration || 0);
            }
          }, 1000);
        }
      } catch (err) {
        console.error('Error setting up audio:', err);
        setError(`Failed to play track: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    setupAudio();
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentTrackIndex, tracks, isPlaying, isMuted, volume]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Playback failed:', error);
          setIsPlaying(false);
        });
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle track navigation
  const playNextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
  };
  
  const playPrevTrack = () => {
    setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length);
  };
  
  // Handle volume changes
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
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    
    setIsMuted(!isMuted);
  };
  
  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX / progressBar.clientWidth;
    const newTime = clickPosition * duration;
    
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const currentTrack = tracks[currentTrackIndex];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        onEnded={playNextTrack}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      {/* Artwork */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
        {currentTrack?.artwork_url ? (
          <img 
            src={currentTrack.artwork_url.replace('-large', '-t500x500')} 
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
            <FaSoundcloud className="text-white text-6xl" />
          </div>
        )}
        
        {/* Track info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">{currentTrack?.title || title}</h3>
          <p className="text-gray-300 text-sm">
            {currentTrack?.user?.username || 'SoundCloud'}
          </p>
        </div>
      </div>
      
      {/* Player controls */}
      <div className="p-4">
        {/* Progress bar */}
        <div 
          className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
            style={{ width: `${(progress / (duration || 1)) * 100}%` }}
          />
        </div>
        
        {/* Time display */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        {/* Main controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={playPrevTrack}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              disabled={tracks.length <= 1}
            >
              <FiSkipBack size={20} />
            </button>
            
            <button 
              onClick={togglePlayPause}
              className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full"
              disabled={isLoading || tracks.length === 0}
            >
              {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} className="ml-1" />}
            </button>
            
            <button 
              onClick={playNextTrack}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              disabled={tracks.length <= 1}
            >
              <FiSkipForward size={20} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleMute}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {isMuted || volume === 0 ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 accent-blue-600 dark:accent-blue-500"
            />
          </div>
        </div>
        
        {/* Track list */}
        {tracks.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Playlist ({tracks.length} tracks)
            </h4>
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
              {tracks.map((track, index) => (
                <div 
                  key={track.id}
                  className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center ${
                    index === currentTrackIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                  onClick={() => setCurrentTrackIndex(index)}
                >
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {index === currentTrackIndex && isPlaying ? (
                      <div className="flex space-x-1">
                        <div className="w-1 h-3 bg-blue-600 dark:bg-blue-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-3 bg-blue-600 dark:bg-blue-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-3 bg-blue-600 dark:bg-blue-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p 
                      className={`text-sm truncate ${
                        index === currentTrackIndex 
                          ? 'text-blue-600 dark:text-blue-400 font-medium' 
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {track.user?.username}
                    </p>
                  </div>
                  <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Loading and error states */}
        {isLoading && (
          <div className="mt-4 text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading tracks...</p>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
            {error}
            <div className="mt-2">
              <a 
                href={`https://soundcloud.com/ohbcpayson/sets/${playlistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                Open in SoundCloud <FiExternalLink className="ml-1" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundCloudPlayer;
