import { NextResponse } from 'next/server';
import https from 'https';

export const dynamic = 'force-dynamic';

// Create a custom agent that allows self-signed certificates for development
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const debug = searchParams.get('debug') === 'true';

  if (!url) {
    return NextResponse.json(
      { error: 'Missing URL parameter' },
      { status: 400 }
    );
  }

  try {
    // Log the incoming request
    if (debug) {
      console.log('[Proxy] Incoming request:', {
        url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      });
    }

    // Validate the URL to prevent SSRF attacks
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch (e) {
      console.error('[Proxy] Invalid URL:', url);
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }
    
    // Only allow specific domains for security
    const allowedDomains = [
      'bible.helloao.org',
      'api.scripture.api.bible',
      'api.esv.org'
    ];

    if (!allowedDomains.some(domain => targetUrl.hostname.endsWith(domain))) {
      console.error('[Proxy] Domain not allowed:', targetUrl.hostname);
      return NextResponse.json(
        { 
          error: 'Domain not allowed',
          requestedDomain: targetUrl.hostname,
          allowedDomains
        },
        { status: 403 }
      );
    }

    // Prepare headers for the external request
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Forward necessary headers from the original request
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    if (debug) {
      console.log('[Proxy] Forwarding request to:', targetUrl.toString());
      console.log('[Proxy] Request headers:', headers);
    }

    // Forward the request to the target URL with custom agent
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
      credentials: 'omit',
      cache: 'no-store',
      // @ts-ignore - The agent property exists in Node.js but not in the browser
      agent: (url) => url.protocol === 'https:' ? httpsAgent : undefined
    });

    if (debug) {
      console.log('[Proxy] Received response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    }

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to read error response');
      console.error(`[Proxy] Error from ${targetUrl.hostname}:`, {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      return new NextResponse(JSON.stringify({
        error: 'Failed to fetch from target URL',
        status: response.status,
        statusText: response.statusText,
        details: errorText
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Try to parse the response as JSON
    let data;
    try {
      const responseText = await response.text();
      data = responseText ? JSON.parse(responseText) : null;
      
      if (debug) {
        console.log('[Proxy] Parsed response data:', 
          JSON.stringify(data, null, 2).substring(0, 1000));
      }
    } catch (error) {
      console.error('[Proxy] Failed to parse JSON response:', error);
      return NextResponse.json(
        { 
          error: 'Invalid JSON response from target',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 502 }
      );
    }

    // Return the response with appropriate status and headers
    return new NextResponse(JSON.stringify(data || {}), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('[Proxy] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Handle OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
