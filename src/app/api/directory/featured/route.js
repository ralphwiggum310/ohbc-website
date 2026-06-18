import { getFeaturedEntries } from '@/lib/directory';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  // Require authentication
  const authenticatedHandler = requireAuth(async (req) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = searchParams.get('limit') || 6;

      const featuredEntries = await getFeaturedEntries(parseInt(limit));

      return Response.json({
        success: true,
        entries: featuredEntries
      });

    } catch (error) {
      console.error('Directory featured entries error:', error);
      return Response.json(
        { error: 'Failed to fetch featured entries' },
        { status: 500 }
      );
    }
  });

  return authenticatedHandler(request);
}
