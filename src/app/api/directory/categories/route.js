import { getCategories } from '@/lib/directory';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  // Require authentication
  const authenticatedHandler = requireAuth(async (req) => {
    try {
      const categories = await getCategories();

      return Response.json({
        success: true,
        categories
      });

    } catch (error) {
      console.error('Directory categories error:', error);
      return Response.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }
  });

  return authenticatedHandler(request);
}
