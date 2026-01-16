import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'bible study';
  const maxResults = searchParams.get('maxResults') || '10';
  const type = searchParams.get('type') || 'video';
  
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YouTube API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const channelId = 'UChBLU82WKDW8PRJSqeZf0ww'; // OHBC YouTube channel ID
    
    // First, search for videos in the channel
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('channelId', channelId);
    searchUrl.searchParams.append('maxResults', maxResults);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('key', apiKey);
    searchUrl.searchParams.append('order', 'date');
    if (query) searchUrl.searchParams.append('q', query);

    // Get the list of videos
    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      throw new Error(searchData.error?.message || 'Failed to fetch videos');
    }

    // Extract video IDs for detailed information
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    
    // Get detailed video information including duration
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.append('part', 'snippet,contentDetails,statistics');
    videosUrl.searchParams.append('id', videoIds);
    videosUrl.searchParams.append('key', apiKey);

    const videosResponse = await fetch(videosUrl.toString());
    const videosData = await videosResponse.json();

    if (!videosResponse.ok) {
      throw new Error(videosData.error?.message || 'Failed to fetch video details');
    }

    // Combine search results with detailed video information
    const items = searchData.items.map((item: any) => {
      const videoDetails = videosData.items.find((v: any) => v.id === item.id.videoId);
      return {
        ...item,
        contentDetails: videoDetails?.contentDetails,
        statistics: videoDetails?.statistics
      };
    });

    return NextResponse.json({ ...searchData, items });
    
  } catch (error) {
    console.error('Error in YouTube API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
