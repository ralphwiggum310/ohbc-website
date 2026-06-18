import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieHeader
      ? cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key.trim()] = value;
          return acc;
        }, {})
      : {};

    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return Response.json({ error: 'Refresh token required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch {
      return Response.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = Response.json({ success: true, accessToken, expiresIn: 3600 });
    response.headers.set(
      'Set-Cookie',
      `refreshToken=${newRefreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return Response.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}
