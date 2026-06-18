import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';

// JWT verification helper
function getUserIdFromToken(request: Request) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    }
    
    // Fallback to cookies if header not available
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    // Extract accessToken from cookies
    const cookies = cookieHeader.split(';').reduce((acc: any, cookie: string) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {});
    
    const accessToken = cookies.accessToken;
    if (!accessToken) return null;
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Database helper
function getUsersDb() {
  const dbPath = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');
  return new Database(dbPath);
}

// Matomo configuration - these should be in your environment variables
const MATOMO_URL = process.env.MATOMO_URL || 'https://your-matomo-domain.com';
const MATOMO_SITE_ID = process.env.MATOMO_SITE_ID || '1';
const MATOMO_TOKEN = process.env.MATOMO_API_TOKEN || '';

// Helper function to make Matomo API requests
async function fetchMatomoData(method: string, params: Record<string, string>) {
  const baseUrl = `${MATOMO_URL}/index.php`;
  const urlParams = new URLSearchParams({
    module: 'API',
    method,
    idSite: MATOMO_SITE_ID,
    period: 'month',
    date: 'today',
    format: 'JSON',
    token_auth: MATOMO_TOKEN,
    ...params
  });

  try {
    const response = await fetch(`${baseUrl}?${urlParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Matomo API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Matomo data:', error);
    return null;
  }
}

// Get visitor statistics
async function getVisitorStats() {
  const data = await fetchMatomoData('VisitsSummary.get', {});
  
  if (!data) {
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      bounceRate: 0,
      avgTimeOnSite: 0
    };
  }

  return {
    totalVisits: data.nb_visits || 0,
    uniqueVisitors: data.nb_uniq_visitors || 0,
    bounceRate: data.bounce_rate || 0,
    avgTimeOnSite: data.avg_time_on_site || 0
  };
}

// Get page statistics
async function getPageStats() {
  const data = await fetchMatomoData('Actions.getPageUrls', {
    filter_limit: '10'
  });
  
  if (!data) {
    return {
      totalPages: 0,
      topPages: []
    };
  }

  return {
    totalPages: Array.isArray(data) ? data.length : 0,
    topPages: Array.isArray(data) ? data.slice(0, 5).map((page: any) => ({
      url: page.label || 'Unknown',
      visits: page.nb_visits || 0,
      title: page.label || 'Unknown Page'
    })) : []
  };
}

// Get device statistics
async function getDeviceStats() {
  const data = await fetchMatomoData('DevicesDetection.getType', {});
  
  if (!data) {
    return {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };
  }

  const result = {
    desktop: 0,
    mobile: 0,
    tablet: 0
  };

  if (Array.isArray(data)) {
    data.forEach((device: any) => {
      const label = device.label?.toLowerCase() || '';
      if (label.includes('desktop')) result.desktop += device.nb_visits || 0;
      else if (label.includes('mobile')) result.mobile += device.nb_visits || 0;
      else if (label.includes('tablet')) result.tablet += device.nb_visits || 0;
    });
  }

  return result;
}

// Get referrer statistics
async function getReferrerStats() {
  const data = await fetchMatomoData('Referrers.getWebsites', {
    filter_limit: '10'
  });
  
  if (!data) {
    return {
      totalReferrers: 0,
      topReferrers: []
    };
  }

  return {
    totalReferrers: Array.isArray(data) ? data.length : 0,
    topReferrers: Array.isArray(data) ? data.slice(0, 5).map((referrer: any) => ({
      url: referrer.label || 'Direct',
      visits: referrer.nb_visits || 0
    })) : []
  };
}

export async function GET(request: Request) {
  try {
    // JWT authentication check
    const tokenData = getUserIdFromToken(request);
    if (!tokenData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user details from database to verify role
    const db = getUsersDb();
    let user;
    try {
      user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(tokenData.userId || tokenData.id);
    } finally {
      db.close();
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin (allow both Admin and Super Admin)
    if (!['Admin', 'Super Admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if Matomo is configured
    if (!MATOMO_URL || !MATOMO_TOKEN) {
      return NextResponse.json(
        { 
          error: 'Matomo not configured',
          message: 'Please set MATOMO_URL and MATOMO_API_TOKEN environment variables'
        },
        { status: 500 }
      );
    }

    // Fetch all statistics in parallel
    const [visitorStats, pageStats, deviceStats, referrerStats] = await Promise.all([
      getVisitorStats(),
      getPageStats(),
      getDeviceStats(),
      getReferrerStats()
    ]);

    const analyticsData = {
      visitors: visitorStats,
      pages: pageStats,
      devices: deviceStats,
      referrers: referrerStats,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
