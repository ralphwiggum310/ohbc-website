import { authenticateUser } from '@/lib/auth';

export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (!user) return Response.json({ error: error || 'Unauthorized' }, { status: 401 });

  // Serving schedules feature not yet implemented
  return Response.json({ success: true, schedules: [] });
}

export async function POST(request) {
  const { user, error } = await authenticateUser(request);
  if (!user) return Response.json({ error: error || 'Unauthorized' }, { status: 401 });

  return Response.json({ error: 'Serving schedules feature not yet implemented' }, { status: 501 });
}
