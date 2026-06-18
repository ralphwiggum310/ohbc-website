import Database from 'better-sqlite3';
import path from 'path';

// Directory database path
const DB_PATH = path.join(process.cwd(), 'data', 'directory', 'ohbc_directory.db');

// Helper function to get database connection
function getDb() {
  return new Database(DB_PATH);
}

// Helper function to run queries
function runQuery(db, query, params = []) {
  const stmt = db.prepare(query);
  return stmt.run(params);
}

// Helper function to get single row
function getQuery(db, query, params = []) {
  const stmt = db.prepare(query);
  return stmt.get(params);
}

// Helper function to get multiple rows
function allQuery(db, query, params = []) {
  const stmt = db.prepare(query);
  return stmt.all(params);
}

// Directory operations
export function searchDirectory(searchTerm = '', filters = {}) {
  const db = getDb();
  try {
    let query = `
      SELECT 
        de.*,
        c.name as category_name,
        c.icon as category_icon
      FROM directory_entries de
      LEFT JOIN categories c ON de.category_id = c.id
      WHERE de.is_active = 1
    `;
    
    const params = [];

    // Add search term if provided
    if (searchTerm) {
      query += ` AND de.id IN (
        SELECT entry_id FROM directory_search 
        WHERE directory_search MATCH ?
      )`;
      params.push(searchTerm);
    }

    // Add filters
    if (filters.category_id) {
      query += ` AND de.category_id = ?`;
      params.push(filters.category_id);
    }

    if (filters.membership_status) {
      query += ` AND de.membership_status = ?`;
      params.push(filters.membership_status);
    }

    if (filters.ministry_area) {
      query += ` AND (de.ministry_areas LIKE ? OR de.spiritual_gifts LIKE ?)`;
      const ministryPattern = `%"${filters.ministry_area}"%`;
      params.push(ministryPattern, ministryPattern);
    }

    // Add ordering
    query += ` ORDER BY de.sort_priority DESC, de.last_name ASC, de.first_name ASC`;

    // Add pagination
    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET ?`;
      params.push(filters.offset);
    }

    const results = allQuery(db, query, params);
    
    // Parse JSON fields
    return results.map(entry => ({
      ...entry,
      ministry_areas: entry.ministry_areas ? JSON.parse(entry.ministry_areas) : [],
      spiritual_gifts: entry.spiritual_gifts ? JSON.parse(entry.spiritual_gifts) : [],
      children_names: entry.children_names ? JSON.parse(entry.children_names) : [],
      tags: entry.tags ? JSON.parse(entry.tags) : []
    }));

  } finally {
    db.close();
  }
}

export function getDirectoryEntryById(id) {
  const db = getDb();
  try {
    const query = `
      SELECT 
        de.*,
        c.name as category_name,
        c.icon as category_icon
      FROM directory_entries de
      LEFT JOIN categories c ON de.category_id = c.id
      WHERE de.id = ? AND de.is_active = 1
    `;
    
    const entry = getQuery(db, query, [id]);
    
    if (!entry) return null;

    // Parse JSON fields
    return {
      ...entry,
      ministry_areas: entry.ministry_areas ? JSON.parse(entry.ministry_areas) : [],
      spiritual_gifts: entry.spiritual_gifts ? JSON.parse(entry.spiritual_gifts) : [],
      children_names: entry.children_names ? JSON.parse(entry.children_names) : [],
      tags: entry.tags ? JSON.parse(entry.tags) : []
    };

  } finally {
    db.close();
  }
}

export function getCategories() {
  const db = getDb();
  try {
    const query = `
      SELECT * FROM categories 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, name ASC
    `;
    
    return allQuery(db, query);
  } finally {
    db.close();
  }
}

export function getFeaturedEntries(limit = 6) {
  const db = getDb();
  try {
    const query = `
      SELECT 
        de.*,
        c.name as category_name,
        c.icon as category_icon
      FROM directory_entries de
      LEFT JOIN categories c ON de.category_id = c.id
      WHERE de.is_active = 1 AND de.is_featured = 1
      ORDER BY de.sort_priority DESC, de.last_name ASC
      LIMIT ?
    `;
    
    const results = allQuery(db, query, [limit]);
    
    // Parse JSON fields
    return results.map(entry => ({
      ...entry,
      ministry_areas: entry.ministry_areas ? JSON.parse(entry.ministry_areas) : [],
      spiritual_gifts: entry.spiritual_gifts ? JSON.parse(entry.spiritual_gifts) : [],
      children_names: entry.children_names ? JSON.parse(entry.children_names) : [],
      tags: entry.tags ? JSON.parse(entry.tags) : []
    }));

  } finally {
    db.close();
  }
}

export function createDirectoryEntry(entryData) {
  const db = getDb();
  try {
    const {
      first_name,
      last_name,
      middle_name,
      suffix,
      nickname,
      photo_url,
      photo_filename,
      bio,
      primary_email,
      secondary_email,
      home_phone,
      mobile_phone,
      work_phone,
      address_street,
      address_city,
      address_state,
      address_zip,
      address_country,
      spouse_name,
      children_names,
      anniversary_date,
      occupation,
      company,
      work_address,
      member_since,
      baptism_date,
      membership_status,
      ministry_areas,
      spiritual_gifts,
      life_groups,
      facebook_url,
      instagram_url,
      twitter_url,
      linkedin_url,
      is_public,
      show_email,
      show_phone,
      show_address,
      show_occupation,
      user_id,
      category_id,
      tags,
      notes,
      is_featured,
      sort_priority,
      created_by
    } = entryData;

    const query = `
      INSERT INTO directory_entries (
        first_name, last_name, middle_name, suffix, nickname, photo_url, photo_filename, bio,
        primary_email, secondary_email, home_phone, mobile_phone, work_phone,
        address_street, address_city, address_state, address_zip, address_country,
        spouse_name, children_names, anniversary_date, occupation, company, work_address,
        member_since, baptism_date, membership_status, ministry_areas, spiritual_gifts, life_groups,
        facebook_url, instagram_url, twitter_url, linkedin_url,
        is_public, show_email, show_phone, show_address, show_occupation,
        user_id, category_id, tags, notes, is_featured, sort_priority, created_by
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    const params = [
      first_name, last_name, middle_name, suffix, nickname, photo_url, photo_filename, bio,
      primary_email, secondary_email, home_phone, mobile_phone, work_phone,
      address_street, address_city, address_state, address_zip, address_country,
      spouse_name, JSON.stringify(children_names || []), anniversary_date, occupation, company, work_address,
      member_since, baptism_date, membership_status, JSON.stringify(ministry_areas || []), 
      JSON.stringify(spiritual_gifts || []), JSON.stringify(life_groups || []),
      facebook_url, instagram_url, twitter_url, linkedin_url,
      is_public ? 1 : 0, show_email ? 1 : 0, show_phone ? 1 : 0, 
      show_address ? 1 : 0, show_occupation ? 1 : 0,
      user_id, category_id, JSON.stringify(tags || []), notes, is_featured ? 1 : 0, sort_priority, created_by
    ];

    const result = runQuery(db, query, params);
    return result.lastInsertRowid;

  } finally {
    db.close();
  }
}

export function updateDirectoryEntry(id, entryData) {
  const db = getDb();
  try {
    const {
      first_name,
      last_name,
      middle_name,
      suffix,
      nickname,
      photo_url,
      photo_filename,
      bio,
      primary_email,
      secondary_email,
      home_phone,
      mobile_phone,
      work_phone,
      address_street,
      address_city,
      address_state,
      address_zip,
      address_country,
      spouse_name,
      children_names,
      anniversary_date,
      occupation,
      company,
      work_address,
      member_since,
      baptism_date,
      membership_status,
      ministry_areas,
      spiritual_gifts,
      life_groups,
      facebook_url,
      instagram_url,
      twitter_url,
      linkedin_url,
      is_public,
      show_email,
      show_phone,
      show_address,
      show_occupation,
      user_id,
      category_id,
      tags,
      notes,
      is_featured,
      sort_priority,
      updated_by
    } = entryData;

    const query = `
      UPDATE directory_entries SET
        first_name = ?, last_name = ?, middle_name = ?, suffix = ?, nickname = ?, photo_url = ?, photo_filename = ?, bio = ?,
        primary_email = ?, secondary_email = ?, home_phone = ?, mobile_phone = ?, work_phone = ?,
        address_street = ?, address_city = ?, address_state = ?, address_zip = ?, address_country = ?,
        spouse_name = ?, children_names = ?, anniversary_date = ?, occupation = ?, company = ?, work_address = ?,
        member_since = ?, baptism_date = ?, membership_status = ?, ministry_areas = ?, spiritual_gifts = ?, life_groups = ?,
        facebook_url = ?, instagram_url = ?, twitter_url = ?, linkedin_url = ?,
        is_public = ?, show_email = ?, show_phone = ?, show_address = ?, show_occupation = ?,
        user_id = ?, category_id = ?, tags = ?, notes = ?, is_featured = ?, sort_priority = ?, updated_by = ?
      WHERE id = ?
    `;

    const params = [
      first_name, last_name, middle_name, suffix, nickname, photo_url, photo_filename, bio,
      primary_email, secondary_email, home_phone, mobile_phone, work_phone,
      address_street, address_city, address_state, address_zip, address_country,
      spouse_name, JSON.stringify(children_names || []), anniversary_date, occupation, company, work_address,
      member_since, baptism_date, membership_status, JSON.stringify(ministry_areas || []), 
      JSON.stringify(spiritual_gifts || []), JSON.stringify(life_groups || []),
      facebook_url, instagram_url, twitter_url, linkedin_url,
      is_public ? 1 : 0, show_email ? 1 : 0, show_phone ? 1 : 0, 
      show_address ? 1 : 0, show_occupation ? 1 : 0,
      user_id, category_id, JSON.stringify(tags || []), notes, is_featured ? 1 : 0, sort_priority, updated_by, id
    ];

    runQuery(db, query, params);
    return true;

  } finally {
    db.close();
  }
}

export function deleteDirectoryEntry(id) {
  const db = getDb();
  try {
    runQuery(db, 'UPDATE directory_entries SET is_active = 0 WHERE id = ?', [id]);
    return true;
  } finally {
    db.close();
  }
}

export function getDirectoryStats() {
  const db = getDb();
  try {
    const total = getQuery(db, 'SELECT COUNT(*) as count FROM directory_entries WHERE is_active = 1');
    const featured = getQuery(db, 'SELECT COUNT(*) as count FROM directory_entries WHERE is_active = 1 AND is_featured = 1');
    const categories = getQuery(db, 'SELECT COUNT(*) as count FROM categories WHERE is_active = 1');
    
    return {
      total: total.count,
      featured: featured.count,
      categories: categories.count
    };
  } finally {
    db.close();
  }
}
