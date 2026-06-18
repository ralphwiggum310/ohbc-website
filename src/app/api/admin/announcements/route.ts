import { NextRequest, NextResponse } from 'next/server';
import { getContentManager } from '@/lib/content-manager';
import { Announcement } from '@/types/content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentManager = getContentManager();

    const filters = {
      status: searchParams.get('status') as Announcement['status'] || undefined,
      type: searchParams.get('type') as Announcement['type'] || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };

    const announcements = await contentManager.getAnnouncements(filters);

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contentManager = getContentManager();

    const announcement = await contentManager.createAnnouncement({
      ...body,
      createdBy: 'admin', // TODO: Get from session
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const contentManager = getContentManager();

    const announcement = await contentManager.updateAnnouncement(id, body);

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const contentManager = getContentManager();
    await contentManager.deleteAnnouncement(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
