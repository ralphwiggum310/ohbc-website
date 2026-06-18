import { getDirectoryEntryById } from '@/lib/directory';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  // Require authentication
  const authenticatedHandler = requireAuth(async (req) => {
    try {
      const entryId = params.id;
      
      if (!entryId) {
        return Response.json(
          { error: 'Entry ID is required' },
          { status: 400 }
        );
      }

      const entry = await getDirectoryEntryById(parseInt(entryId));

      if (!entry) {
        return Response.json(
          { error: 'Directory entry not found' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        entry
      });

    } catch (error) {
      console.error('Directory entry error:', error);
      return Response.json(
        { error: 'Failed to fetch directory entry' },
        { status: 500 }
      );
    }
  });

  return authenticatedHandler(request);
}
