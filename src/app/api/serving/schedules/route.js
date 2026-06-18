import { getUserServingSchedules, getAllServingSchedules, createServingSchedule } from '@/lib/database';
import { requireAuth, requirePermission } from '@/lib/auth';

export async function GET(request) {
  // Require authentication
  const authenticatedHandler = requireAuth(async (req) => {
    // Check if user has permission to view schedules
    const hasScheduleAccess = requirePermission('schedules', 'read');
    const protectedHandler = hasScheduleAccess(async (req) => {
      try {
        let schedules;
        
        // Admin/leaders can see all schedules, members only see their own
        if (['Super Admin', 'Admin', 'Ministry Leader'].includes(req.user.role)) {
          schedules = await getAllServingSchedules();
        } else {
          schedules = await getUserServingSchedules(req.user.id);
        }

        return Response.json({
          success: true,
          schedules
        });

      } catch (error) {
        console.error('Serving schedules error:', error);
        return Response.json(
          { error: 'Failed to fetch serving schedules' },
          { status: 500 }
        );
      }
    });

    return protectedHandler(req);
  });

  return authenticatedHandler(request);
}

export async function POST(request) {
  // Require authentication
  const authenticatedHandler = requireAuth(async (req) => {
    // Check if user has permission to create schedules
    const hasCreatePermission = requirePermission('schedules', 'create');
    const protectedHandler = hasCreatePermission(async (req) => {
      try {
        const { userId, ministryArea, scheduleDate, roleInMinistry, status, notes } = await request.json();

        // Validation
        if (!userId || !ministryArea || !scheduleDate || !roleInMinistry) {
          return Response.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        // Users can only create schedules for themselves unless they're leaders/admins
        if (!['Super Admin', 'Admin', 'Ministry Leader'].includes(req.user.role) && 
            parseInt(userId) !== req.user.id) {
          return Response.json(
            { error: 'Cannot create schedules for other users' },
            { status: 403 }
          );
        }

        const scheduleId = await createServingSchedule({
          userId,
          ministryArea,
          scheduleDate,
          roleInMinistry,
          status,
          notes
        });

        return Response.json({
          success: true,
          message: 'Serving schedule created successfully',
          scheduleId
        });

      } catch (error) {
        console.error('Create serving schedule error:', error);
        return Response.json(
          { error: 'Failed to create serving schedule' },
          { status: 500 }
        );
      }
    });

    return protectedHandler(req);
  });

  return authenticatedHandler(request);
}
