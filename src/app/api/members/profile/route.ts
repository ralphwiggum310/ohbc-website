import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Helper function to parse JWT and get user ID
function getUserIdFromToken(token: string): number | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId || decoded.id || null;
  } catch (error: any) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from session cookie
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse JWT token to get user ID
    const userId = getUserIdFromToken(accessToken);
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user profile from database
    const result = await query(
      `SELECT id, email, first_name, last_name, middle_name, suffix, nickname, 
              photo_url, photo_filename, bio, primary_email, secondary_email, 
              home_phone, mobile_phone, work_phone, address_street, address_city, 
              address_state, address_zip, address_country, spouse_name, children_names, 
              anniversary_date, occupation, company, membership_status, ministry_areas, 
              categories, facebook_url, instagram_url, twitter_url, linkedin_url,
              work_address, member_since, baptism_date, spiritual_gifts, life_groups
       FROM users WHERE id = ?`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = result.rows[0];
    
    // Parse JSON fields if they exist
    if (profile.children_names && typeof profile.children_names === 'string') {
      try {
        profile.children_names = JSON.parse(profile.children_names);
      } catch (e) {
        profile.children_names = [];
      }
    }
    if (profile.ministry_areas && typeof profile.ministry_areas === 'string') {
      try {
        profile.ministry_areas = JSON.parse(profile.ministry_areas);
      } catch (e) {
        profile.ministry_areas = [];
      }
    }
    if (profile.categories && typeof profile.categories === 'string') {
      try {
        profile.categories = JSON.parse(profile.categories);
      } catch (e) {
        profile.categories = [];
      }
    }
    if (profile.spiritual_gifts && typeof profile.spiritual_gifts === 'string') {
      try {
        profile.spiritual_gifts = JSON.parse(profile.spiritual_gifts);
      } catch (e) {
        profile.spiritual_gifts = [];
      }
    }
    if (profile.life_groups && typeof profile.life_groups === 'string') {
      try {
        profile.life_groups = JSON.parse(profile.life_groups);
      } catch (e) {
        profile.life_groups = [];
      }
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from session cookie
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse JWT token to get user ID
    const userId = getUserIdFromToken(accessToken);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    // Update user profile in database
    await query(
      `UPDATE users SET 
        email = ?, first_name = ?, last_name = ?, middle_name = ?, suffix = ?, 
        nickname = ?, bio = ?, primary_email = ?, secondary_email = ?, 
        home_phone = ?, mobile_phone = ?, work_phone = ?, address_street = ?, 
        address_city = ?, address_state = ?, address_zip = ?, address_country = ?, 
        spouse_name = ?, children_names = ?, anniversary_date = ?, 
        occupation = ?, company = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        body.email,
        body.first_name,
        body.last_name,
        body.middle_name,
        body.suffix,
        body.nickname,
        body.bio,
        body.primary_email,
        body.secondary_email,
        body.home_phone,
        body.mobile_phone,
        body.work_phone,
        body.address_street,
        body.address_city,
        body.address_state,
        body.address_zip,
        body.address_country,
        body.spouse_name,
        JSON.stringify(body.children_names || []),
        body.anniversary_date,
        body.occupation,
        body.company,
        userId
      ]
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
