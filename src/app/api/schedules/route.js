import { authenticateUser } from '@/lib/auth';

export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (!user) return Response.json({ error: error || 'Unauthorized' }, { status: 401 });

  const allowedRoles = ['Super Admin', 'Admin', 'Ministry Leader', 'Member'];
  if (!allowedRoles.includes(user.role)) {
    return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Service roles / schedules feature not yet implemented
  const { searchParams } = new URL(request.url);
  const serviceRole = searchParams.get('serviceRole');

  if (serviceRole) {
    return Response.json({ success: true, users: [], serviceRole });
  }

  return Response.json({ success: true, serviceRoles: [] });
}
