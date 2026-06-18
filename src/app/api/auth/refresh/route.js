import { refreshUserToken } from '@/lib/auth';

export async function POST(request) {
  try {
    // Get refresh token from cookie
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieHeader ? cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {}) : {};

    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return Response.json(
        { error: 'Refresh token required' },
        { status: 401 }
      );
    }

    // Refresh token
    const result = await refreshUserToken(refreshToken);

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Set new refresh token as HTTP-only cookie
    const response = Response.json({
      success: true,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn
    });

    response.headers.set('Set-Cookie', `refreshToken=${result.tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`); // 7 days

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return Response.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
