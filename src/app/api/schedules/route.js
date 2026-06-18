import { 
  getUsersByServiceRole,
  getServiceRoles
} from '@/lib/database';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(request) {
  // Require authentication
  const authenticatedHandler = requireAuth(async (req) => {
    try {
      const { searchParams } = new URL(request.url);
      const serviceRole = searchParams.get('serviceRole');
      const user = req.user; // Get user from auth middleware

      // Check if user has access to schedules
      const hasScheduleAccess = user.role === 'Super Admin' || 
                              user.role === 'Admin' || 
                              user.role === 'Ministry Leader' ||
                              (user.service_roles && user.service_roles.length > 0);

      if (!hasScheduleAccess) {
        return Response.json(
          { error: 'Insufficient permissions to access schedules' },
          { status: 403 }
        );
      }

      if (serviceRole) {
        // Get users for specific service role
        const users = await getUsersByServiceRole(serviceRole);
        return Response.json({
          success: true,
          users,
          serviceRole
        });
      } else {
        // Get all service roles
        const serviceRoles = await getServiceRoles();
        return Response.json({
          success: true,
          serviceRoles
        });
      }
    } catch (error) {
      console.error('Schedules error:', error);
      return Response.json(
        { error: 'Failed to fetch schedules' },
        { status: 500 }
      );
    }
  });

  return authenticatedHandler(request);
}
