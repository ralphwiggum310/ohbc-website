import { searchDirectory } from '@/lib/directory-unified';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  // Require authentication
  const authenticatedHandler = requireAuth(async (req) => {
    try {
      // Get search parameters from URL
      const { searchParams } = new URL(req.url);
      const searchTerm = searchParams.get('search') || '';
      const filters = {
        category_id: searchParams.get('category_id') || '',
        membership_status: searchParams.get('membership_status') || '',
        ministry_area: searchParams.get('ministry_area') || '',
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')) : undefined
      };

      // Search the directory
      const members = await searchDirectory(searchTerm, filters);

      return Response.json({
        success: true,
        members,
        count: members.length,
        searchTerm,
        filters
      });

    } catch (error) {
      console.error('Members directory error:', error);
      return Response.json(
        { error: 'Failed to fetch members directory' },
        { status: 500 }
      );
    }
  });

  return authenticatedHandler(request);
}
