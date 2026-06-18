import { searchDirectory, getCategories, getFeaturedEntries } from '@/lib/directory-unified';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  // Require authentication
  const authenticatedHandler = requireAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const searchTerm = searchParams.get('search') || '';
      const categoryId = searchParams.get('category');
      const membershipStatus = searchParams.get('status');
      const ministryArea = searchParams.get('ministry');
      const limit = searchParams.get('limit');
      const offset = searchParams.get('offset');

      // Build filters object
      const filters = {};
      if (categoryId) filters.category_id = parseInt(categoryId);
      if (membershipStatus) filters.membership_status = membershipStatus;
      if (ministryArea) filters.ministry_area = ministryArea;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      // Search directory
      const entries = await searchDirectory(searchTerm, filters);

      return Response.json({
        success: true,
        entries,
        count: entries.length,
        searchTerm,
        filters
      });
    } catch (error) {
      console.error('Directory search error:', error);
      return Response.json(
        { error: 'Failed to search directory' },
        { status: 500 }
      );
    }
  });

  return authenticatedHandler(request);
}
