import Database from 'better-sqlite3';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');

function getDb() {
  return new Database(DB_PATH);
}

function getTokenData(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return jwt.verify(authHeader.substring(7), JWT_SECRET) as any;
    }
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const idx = c.indexOf('=');
          return [c.slice(0, idx).trim(), c.slice(idx + 1).trim()];
        })
      );
      const token = cookies.accessToken || cookies.refreshToken;
      if (token) return jwt.verify(token, JWT_SECRET) as any;
    }
    return null;
  } catch {
    return null;
  }
}

function requireAdmin(request: Request) {
  const tokenData = getTokenData(request);
  if (!tokenData) return { error: 'Unauthorized', status: 401 };

  const db = getDb();
  try {
    const admin = db.prepare('SELECT id, email, role FROM users WHERE id = ? AND is_active = 1')
      .get(tokenData.userId || tokenData.id) as any;
    if (!admin) return { error: 'Unauthorized', status: 401 };
    if (!['Admin', 'Super Admin'].includes(admin.role)) return { error: 'Insufficient permissions', status: 403 };
    return { admin };
  } finally {
    db.close();
  }
}

function getUserById(id: string | number) {
  const db = getDb();
  try {
    const user = db.prepare(`
      SELECT
        id, first_name, last_name, middle_name, suffix, nickname,
        photo_url, photo_filename, bio, primary_email, secondary_email,
        mobile_phone, home_phone, work_phone,
        address_street, address_city, address_state, address_zip, address_country,
        occupation, company, spouse_name, children_names, anniversary_date,
        member_since, baptism_date, membership_status, ministry_areas, categories,
        spiritual_gifts, life_groups, work_address,
        facebook_url, instagram_url, twitter_url, linkedin_url,
        is_public, show_email, show_phone, show_address, show_occupation,
        is_featured, is_active, role, email, phone,
        created_at, updated_at, last_login
      FROM users WHERE id = ?
    `).get(Number(id)) as any;

    if (!user) return null;

    // Parse JSON fields
    if (user.ministry_areas) {
      try { user.ministry_areas = JSON.parse(user.ministry_areas); } catch { user.ministry_areas = []; }
    }
    if (user.categories) {
      try { user.categories = JSON.parse(user.categories); } catch { user.categories = []; }
    }

    return user;
  } finally {
    db.close();
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const user = getUserById(id);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({ success: true, user });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const body = await request.json();
  const { adminSection, serviceRoles, ...updateData } = body;

  const fieldMap: Record<string, string> = {
    first_name: 'first_name', last_name: 'last_name', middle_name: 'middle_name',
    suffix: 'suffix', nickname: 'nickname', bio: 'bio',
    primary_email: 'primary_email', secondary_email: 'secondary_email',
    mobile_phone: 'mobile_phone', home_phone: 'home_phone', work_phone: 'work_phone',
    address_street: 'address_street', address_city: 'address_city',
    address_state: 'address_state', address_zip: 'address_zip',
    occupation: 'occupation', company: 'company',
    membership_status: 'membership_status', role: 'role', status: 'status',
    is_public: 'is_public', show_email: 'show_email', show_phone: 'show_phone',
    show_address: 'show_address', show_occupation: 'show_occupation',
    spouse_name: 'spouse_name', children_names: 'children_names',
    anniversary_date: 'anniversary_date', member_since: 'member_since',
    baptism_date: 'baptism_date', spiritual_gifts: 'spiritual_gifts',
    // camelCase aliases from older frontend code
    firstName: 'first_name', lastName: 'last_name', middleName: 'middle_name',
    primaryEmail: 'primary_email', secondaryEmail: 'secondary_email',
    mobilePhone: 'mobile_phone', homePhone: 'home_phone', workPhone: 'work_phone',
    addressStreet: 'address_street', addressCity: 'address_city',
    addressState: 'address_state', addressZip: 'address_zip',
    membershipStatus: 'membership_status',
    isPublic: 'is_public', showEmail: 'show_email', showPhone: 'show_phone',
    showAddress: 'show_address', showOccupation: 'show_occupation',
  };

  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, val] of Object.entries(updateData)) {
    if (val === undefined) continue;
    const col = fieldMap[key];
    if (col) {
      fields.push(`${col} = ?`);
      values.push(val);
    }
  }

  if (updateData.ministry_areas !== undefined) {
    fields.push('ministry_areas = ?');
    values.push(JSON.stringify(updateData.ministry_areas));
  }
  if (updateData.categories !== undefined) {
    fields.push('categories = ?');
    values.push(JSON.stringify(updateData.categories));
  }

  if (fields.length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(Number(id));

  const db = getDb();
  try {
    const result = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    if (result.changes === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    return Response.json({ success: true, message: 'User updated successfully' });
  } finally {
    db.close();
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  if ((auth as any).admin.role !== 'Super Admin') {
    return Response.json({ error: 'Only Super Admin can delete users' }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  try {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(Number(id));
    if (result.changes === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    return Response.json({ success: true, message: 'User deleted successfully' });
  } finally {
    db.close();
  }
}
