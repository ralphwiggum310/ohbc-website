import { NextResponse } from 'next/server';

// SoundCloud Widget API endpoint
const WIDGET_API = 'https://api-widget.soundcloud.com';

// Public client ID for SoundCloud API (from the official widget)
const CLIENT_ID = 'a3e059563d7fd3372b49b37f00a00bcf';

// Helper function to handle errors
function handleError(error: unknown, message: string, status = 500) {
  console.error(`${message}:`, error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  return NextResponse.json(
    { 
      error: message,
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    },
    { status }
  );
}

// Parse track data from the widget API response
function parseTracksFromWidget(data: any) {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return data.map((track: any) => ({
    id: track.id || '',
    title: track.title || 'Unknown Track',
    permalink_url: track.permalink_url || `https://soundcloud.com/ohbcpayson/${track.permalink || ''}`,
    stream_url: track.stream_url || `https://api.soundcloud.com/tracks/${track.id}/stream`,
    artwork_url: track.artwork_url || '',
    duration: track.duration ? Math.floor(track.duration / 1000) : 0, // Convert to seconds
    user: {
      username: track.user?.username || 'Orchard Hills Bible Church'
    }
  }));
}

export async function GET(request: Request) {
  console.log('Received request:', request.url);
  
  try {
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');

    if (!playlistId) {
      return handleError(new Error('No playlistId provided'), 'Missing playlistId parameter', 400);
    }
    
    console.log('Fetching playlist:', playlistId);

    // First, try to fetch the playlist data using the widget API
    const widgetUrl = `${WIDGET_API}/playlists/${playlistId}?client_id=${CLIENT_ID}&representation=full`;
    console.log('Fetching from SoundCloud widget API:', widgetUrl);
    
    const widgetRes = await fetch(widgetUrl, {
      headers: {
        'Referer': 'https://soundcloud.com/',
        'Origin': 'https://soundcloud.com'
      }
    });
    
    console.log('SoundCloud widget API response status:', widgetRes.status);

    if (!widgetRes.ok) {
      const errorText = await widgetRes.text();
      console.error('SoundCloud widget API error response:', errorText);
      
      // If we get a 404, try with a different URL format
      if (widgetRes.status === 404) {
        const altWidgetUrl = `${WIDGET_API}/resolve?url=https://soundcloud.com/ohbcpayson/sets/${playlistId}&client_id=${CLIENT_ID}`;
        console.log('Trying alternative URL:', altWidgetUrl);
        
        const altRes = await fetch(altWidgetUrl, {
          headers: {
            'Referer': 'https://soundcloud.com/',
            'Origin': 'https://soundcloud.com'
          }
        });
        
        if (altRes.ok) {
          const altData = await altRes.json();
          console.log('Successfully fetched with alternative URL');
          const tracks = parseTracksFromWidget(altData.tracks || []);
          return NextResponse.json(tracks);
        }
      }
      
      throw new Error(`SoundCloud widget API error: ${widgetRes.status} ${widgetRes.statusText}`);
    }

    const widgetData = await widgetRes.json();
    console.log('Received SoundCloud widget data');
    
    // Parse tracks from the widget response
    const tracks = parseTracksFromWidget(widgetData.tracks || []);
    console.log(`Found ${tracks.length} tracks in playlist`);
    
    if (tracks.length === 0) {
      console.warn('No tracks found in playlist');
      // Fallback to a single track with the playlist URL
      tracks.push({
        id: playlistId,
        title: 'Playlist',
        permalink_url: `https://soundcloud.com/ohbcpayson/sets/${playlistId}`,
        stream_url: `https://soundcloud.com/ohbcpayson/sets/${playlistId}`,
        artwork_url: widgetData.artwork_url || '',
        duration: 0,
        user: {
          username: widgetData.user?.username || 'Orchard Hills Bible Church'
        }
      });
    }
    
    return NextResponse.json(tracks);
    
  } catch (error) {
    return handleError(error, 'Failed to fetch tracks from SoundCloud');
  }
}

export const dynamic = 'force-dynamic';
