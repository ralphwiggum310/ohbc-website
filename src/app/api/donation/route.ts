import { NextResponse } from 'next/server';

// Helper function to log errors with timestamps
function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${message}`, error ? error : '');
}

export async function GET() {
  const zeffyUrl = 'https://www.zeffy.com/embed/donation-form/gifts-and-offerings';
  
  try {
    logError('Attempting to fetch donation form from:', zeffyUrl);
    
    const response = await fetch(zeffyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.zeffy.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'TE': 'Trailers',
      },
      redirect: 'follow',
      mode: 'no-cors',
    });

    logError('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      logError(`Failed to fetch form: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch form: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    logError('Successfully fetched donation form');
    
    // Fix any relative URLs in the HTML
    const processedHtml = html
      .replace(/(src|href)="\//g, '$1="https://www.zeffy.com/')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove any scripts
    
    // Return the HTML with proper CORS headers
    return new Response(processedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'self' https://www.zeffy.com; script-src 'self' 'unsafe-inline' https://www.zeffy.com; style-src 'self' 'unsafe-inline' https://www.zeffy.com; img-src 'self' data: https://www.zeffy.com; font-src 'self' https://www.zeffy.com data:; connect-src 'self' https://www.zeffy.com; frame-src 'self' https://www.zeffy.com;"
      },
    });
    
  } catch (error: any) {
    logError('Error in donation proxy:', error);
    
    // Return a user-friendly error page with debugging info
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Donation Form Error</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
          .error-container { max-width: 800px; margin: 50px auto; padding: 20px; border: 1px solid #e74c3c; border-radius: 5px; background-color: #fdecea; }
          .error-title { color: #c0392b; margin-top: 0; }
          .error-message { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #e74c3c; }
          .try-again { margin-top: 20px; }
          .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; }
          .btn:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1 class="error-title">Unable to Load Donation Form</h1>
          <p>We're having trouble loading the donation form. Please try one of these options:</p>
          
          <div class="error-message">
            <p><strong>Error Details:</strong> ${error?.message || 'Unknown error occurred'}</p>
            <p>If this problem persists, please contact support with the error details above.</p>
          </div>
          
          <div class="try-again">
            <a href="${zeffyUrl}" class="btn" target="_blank" rel="noopener noreferrer">
              Open Donation Form in New Tab
            </a>
            <button onclick="window.location.reload()" class="btn" style="margin-left: 10px; background: #7f8c8d;">
              Try Again
            </button>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p>Need help? Contact us at <a href="mailto:info@orchardhillsbible.org">info@orchardhillsbible.org</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return new Response(errorHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
}
