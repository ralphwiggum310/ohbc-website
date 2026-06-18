import { 
  updateUserLoginInfo
} from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';

export async function PUT(request) {
  // Require authentication and super admin permissions
  const authenticatedHandler = requireAuth(async (req) => {
    const hasUserPermission = requireRole('super_admin');
    const protectedHandler = hasUserPermission(async (req) => {
      try {
        const body = await request.json();
        const { userId, loginInfo } = body;

        if (!userId || !loginInfo) {
          return Response.json(
            { error: 'User ID and login info are required' },
            { status: 400 }
          );
        }

        await updateUserLoginInfo(userId, loginInfo);

        return Response.json({
          success: true,
          message: 'Login information updated successfully'
        });
      } catch (error) {
        console.error('Update login info error:', error);
        return Response.json(
          { error: 'Failed to update login information' },
          { status: 500 }
        );
      }
    });

    return protectedHandler(request);
  });

  return authenticatedHandler(request);
}
