import { authenticateUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error || !user) {
      return Response.json({
        authenticated: false,
        user: null,
        error: error || 'Invalid or expired token'
      });
    }

    return Response.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return Response.json({
      authenticated: false,
      user: null,
      error: 'Token verification failed'
    });
  }
}
