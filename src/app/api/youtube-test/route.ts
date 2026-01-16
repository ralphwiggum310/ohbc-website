import { NextResponse } from 'next/server';

export async function GET() {
  const YOUTUBE_CHANNEL_ID = 'UChBLU82WKDW8PRJSqeZf0ww';
  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const MAX_RESULTS = 50; // Increased to get more full-length sermons

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: 'YouTube API key is not configured' },
      { status: 500 }
    );
  }

  try {
    // First, fetch more videos to ensure we get enough full-length sermons
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}&type=video`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchResponse.ok) {
      const error = await searchResponse.json();
      return NextResponse.json({ success: false, error: error.error?.message || 'Failed to fetch videos' }, { status: searchResponse.status });
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ success: true, data: { items: [] } });
    }

    // Get video details (including duration and view count)
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=contentDetails,snippet,statistics`;
    
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();
    
    if (!videosResponse.ok) {
      console.error('YouTube Videos API Error:', videosData);
      // Return search results without video details if this fails
      return NextResponse.json({ success: true, data: searchData });
    }
    
    // Process and categorize videos
    const items = [];
    let shortsCount = 0;
    
    for (const item of searchData.items) {
      // If we already have 10 shorts, skip any additional ones
      if (shortsCount >= 10 && item.snippet?.title?.toLowerCase().includes('#shorts')) {
        continue;
      }
      
      const videoDetail = videosData.items.find((v: any) => v.id === item.id.videoId);
      if (!videoDetail) continue;
      
      const isShort = item.snippet?.title?.toLowerCase().includes('#shorts') || 
                     item.snippet?.description?.toLowerCase().includes('#shorts') ||
                     (videoDetail.contentDetails?.duration && 
                      videoDetail.contentDetails.duration <= 'PT1M');
      
      if (isShort) shortsCount++;
      
      items.push({
        ...item,
        contentDetails: videoDetail.contentDetails,
        statistics: videoDetail.statistics,
        isShort
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...searchData,
        items
      }
    });
    
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from YouTube API', details: error },
      { status: 500 }
    );
  }
}
