import { requireAuth, requireRole } from '@/lib/auth';

export async function POST(request) {
  // Require authentication and admin permissions
  const authenticatedHandler = requireAuth(async (req) => {
    const hasUserPermission = requireRole('admin');
    const protectedHandler = hasUserPermission(async (req) => {
      try {
        const formData = await request.formData();
        const csvFile = formData.get('csvFile');
        
        if (!csvFile) {
          return Response.json(
            { error: 'CSV file is required' },
            { status: 400 }
          );
        }

        // Validate file type
        if (!csvFile.name.endsWith('.csv')) {
          return Response.json(
            { error: 'File must be a CSV file' },
            { status: 400 }
          );
        }

        // Convert file to buffer
        const csvBuffer = await csvFile.arrayBuffer();
        const csvText = new TextDecoder().decode(csvBuffer);

        // Parse CSV
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          return Response.json(
            { error: 'CSV file appears to be empty or invalid' },
            { status: 400 }
          );
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            data.push(row);
          }
        }

        return Response.json({
          success: true,
          message: 'CSV file processed successfully',
          headers,
          sampleData: data.slice(0, 5),
          totalRows: data.length
        });

      } catch (error) {
        console.error('CSV import error:', error);
        return Response.json(
          { error: 'Failed to process CSV file' },
          { status: 500 }
        );
      }
    });

    return protectedHandler(request);
  });

  return authenticatedHandler(request);
}
