import Database from 'better-sqlite3';
import path from 'path';

// Database path
const DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');

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
        id, first_name, last_name, middle_name, suffix, nickname, 
        photo_url, primary_email, mobile_phone, home_phone, work_phone, 
        address_city, address_state, address_zip, occupation, company, 
        membership_status, ministry_areas, categories, bio, photo_filename,
        facebook_url, instagram_url, twitter_url, linkedin_url,
        spouse_name, children_names, anniversary_date, work_address,
        member_since, baptism_date, spiritual_gifts, life_groups
      FROM users 
      WHERE is_active = 1 AND membership_status = 'Active'
    `;
    
    const params = [];

    // Add search term if provided
    if (searchTerm) {
      query += ` AND (
        first_name LIKE ? OR last_name LIKE ? OR nickname LIKE ? OR
        occupation LIKE ? OR company LIKE ?
      )`;
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add category filter
    if (filters.category_id) {
      query += ` AND ministry_areas LIKE ?`;
      params.push(`%${filters.category_id}%`);
    }

    // Add status filter
    if (filters.membership_status) {
      query += ` AND membership_status = ?`;
      params.push(filters.membership_status);
    }

    // Add ministry filter
    if (filters.ministry_area) {
      query += ` AND ministry_areas LIKE ?`;
      params.push(`%${filters.ministry_area}%`);
    }

    // Add ordering
    query += ` ORDER BY last_name ASC, first_name ASC`;

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
    
    // Parse JSON fields and format results
    return results.map(entry => ({
      id: entry.id,
      first_name: entry.first_name,
      last_name: entry.last_name,
      middle_name: entry.middle_name,
      suffix: entry.suffix,
      nickname: entry.nickname,
      photo_url: entry.photo_url,
      photo_filename: entry.photo_filename,
      primary_email: entry.primary_email,
      mobile_phone: entry.mobile_phone,
      home_phone: entry.home_phone,
      work_phone: entry.work_phone,
      address_city: entry.address_city,
      address_state: entry.address_state,
      address_zip: entry.address_zip,
      occupation: entry.occupation,
      company: entry.company,
      membership_status: entry.membership_status,
      ministry_areas: entry.ministry_areas ? JSON.parse(entry.ministry_areas) : [],
      categories: entry.categories ? JSON.parse(entry.categories) : [],
      bio: entry.bio,
      facebook_url: entry.facebook_url,
      instagram_url: entry.instagram_url,
      twitter_url: entry.twitter_url,
      linkedin_url: entry.linkedin_url,
      spouse_name: entry.spouse_name,
      children_names: entry.children_names ? JSON.parse(entry.children_names) : [],
      anniversary_date: entry.anniversary_date,
      work_address: entry.work_address,
      member_since: entry.member_since,
      baptism_date: entry.baptism_date,
      spiritual_gifts: entry.spiritual_gifts ? JSON.parse(entry.spiritual_gifts) : [],
      life_groups: entry.life_groups ? JSON.parse(entry.life_groups) : []
    }));
  } catch (error) {
    console.error('Directory search error:', error);
    return [];
  } finally {
    db.close();
  }
}

export function getDirectoryEntryById(id) {
  const db = getDb();
  try {
    const query = `
      SELECT 
        id, first_name, last_name, middle_name, suffix, nickname, 
        photo_url, photo_filename, primary_email, mobile_phone, home_phone, work_phone, 
        address_street, address_city, address_state, address_zip, address_country,
        occupation, company, work_address, membership_status, ministry_areas, categories,
        bio, facebook_url, instagram_url, twitter_url, linkedin_url,
        spouse_name, children_names, anniversary_date, member_since, baptism_date,
        spiritual_gifts, life_groups, is_featured, sort_priority
      FROM users 
      WHERE id = ? AND is_active = 1 AND membership_status = 'Active'
    `;
    
    const entry = getQuery(db, query, [id]);
    
    if (!entry) return null;
    
    // Parse JSON fields
    return {
      id: entry.id,
      first_name: entry.first_name,
      last_name: entry.last_name,
      middle_name: entry.middle_name,
      suffix: entry.suffix,
      nickname: entry.nickname,
      photo_url: entry.photo_url,
      photo_filename: entry.photo_filename,
      primary_email: entry.primary_email,
      mobile_phone: entry.mobile_phone,
      home_phone: entry.home_phone,
      work_phone: entry.work_phone,
      address_street: entry.address_street,
      address_city: entry.address_city,
      address_state: entry.address_state,
      address_zip: entry.address_zip,
      address_country: entry.address_country,
      occupation: entry.occupation,
      company: entry.company,
      work_address: entry.work_address,
      membership_status: entry.membership_status,
      ministry_areas: entry.ministry_areas ? JSON.parse(entry.ministry_areas) : [],
      categories: entry.categories ? JSON.parse(entry.categories) : [],
      bio: entry.bio,
      facebook_url: entry.facebook_url,
      instagram_url: entry.instagram_url,
      twitter_url: entry.twitter_url,
      linkedin_url: entry.linkedin_url,
      spouse_name: entry.spouse_name,
      children_names: entry.children_names ? JSON.parse(entry.children_names) : [],
      anniversary_date: entry.anniversary_date,
      member_since: entry.member_since,
      baptism_date: entry.baptism_date,
      spiritual_gifts: entry.spiritual_gifts ? JSON.parse(entry.spiritual_gifts) : [],
      life_groups: entry.life_groups ? JSON.parse(entry.life_groups) : [],
      is_featured: entry.is_featured,
      sort_priority: entry.sort_priority
    };
  } catch (error) {
    console.error('Directory entry error:', error);
    return null;
  } finally {
    db.close();
  }
}

export function getCategories() {
  const db = getDb();
  try {
    const query = `
      SELECT DISTINCT 
        ministry_areas
      FROM users 
      WHERE is_active = 1 AND membership_status = 'Active' 
        AND ministry_areas IS NOT NULL AND ministry_areas != '[]' AND ministry_areas != ''
    `;
    
    const results = allQuery(db, query);
    
    // Parse and extract unique categories
    const allCategories = [];
    results.forEach(row => {
      try {
        const ministries = JSON.parse(row.ministry_areas);
        if (Array.isArray(ministries)) {
          ministries.forEach(ministry => {
            if (ministry && ministry.name) {
              allCategories.push({
                id: ministry.id || ministry.name,
                name: ministry.name,
                icon: ministry.icon || ''
              });
            }
          });
        }
      } catch (error) {
        console.log('Error parsing ministry_areas:', error.message);
      }
    });
    
    // Remove duplicates and sort
    const uniqueCategories = allCategories.filter((category, index, self) =>
      index === self.findIndex(c => c.id === category.id)
    ).sort((a, b) => a.name.localeCompare(b.name));
    
    return uniqueCategories;
  } catch (error) {
    console.error('Categories error:', error);
    return [];
  } finally {
    db.close();
  }
}

export function getFeaturedEntries(limit = 6) {
  const db = getDb();
  try {
    const query = `
      SELECT 
        id, first_name, last_name, middle_name, suffix, nickname, 
        photo_url, photo_filename, primary_email, mobile_phone, home_phone, work_phone, 
        address_city, address_state, address_zip, occupation, company, 
        membership_status, ministry_areas, categories, bio, facebook_url,
        instagram_url, twitter_url, linkedin_url, spouse_name, children_names,
        anniversary_date, work_address, member_since, baptism_date,
        spiritual_gifts, life_groups, is_featured, sort_priority
      FROM users 
      WHERE is_active = 1 AND membership_status = 'Active' AND is_featured = 1
      ORDER BY sort_priority ASC, last_name ASC, first_name ASC
      LIMIT ?
    `;
    
    const results = allQuery(db, query, [limit]);
    
    // Parse JSON fields and format results
    return results.map(entry => ({
      id: entry.id,
      first_name: entry.first_name,
      last_name: entry.last_name,
      middle_name: entry.middle_name,
      suffix: entry.suffix,
      nickname: entry.nickname,
      photo_url: entry.photo_url,
      photo_filename: entry.photo_filename,
      primary_email: entry.primary_email,
      mobile_phone: entry.mobile_phone,
      home_phone: entry.home_phone,
      work_phone: entry.work_phone,
      address_city: entry.address_city,
      address_state: entry.address_state,
      address_zip: entry.address_zip,
      occupation: entry.occupation,
      company: entry.company,
      membership_status: entry.membership_status,
      ministry_areas: entry.ministry_areas ? JSON.parse(entry.ministry_areas) : [],
      categories: entry.categories ? JSON.parse(entry.categories) : [],
      bio: entry.bio,
      facebook_url: entry.facebook_url,
      instagram_url: entry.instagram_url,
      twitter_url: entry.twitter_url,
      linkedin_url: entry.linkedin_url,
      spouse_name: entry.spouse_name,
      children_names: entry.children_names ? JSON.parse(entry.children_names) : [],
      anniversary_date: entry.anniversary_date,
      work_address: entry.work_address,
      member_since: entry.member_since,
      baptism_date: entry.baptism_date,
      spiritual_gifts: entry.spiritual_gifts ? JSON.parse(entry.spiritual_gifts) : [],
      life_groups: entry.life_groups ? JSON.parse(entry.life_groups) : [],
      is_featured: entry.is_featured,
      sort_priority: entry.sort_priority
    }));
  } catch (error) {
    console.error('Featured entries error:', error);
    return [];
  } finally {
    db.close();
  }
}

// Admin directory operations - shows ALL records regardless of status
export function searchDirectoryAdmin(searchTerm = '', filters = {}) {
  const db = getDb();
  try {
    let query = `
      SELECT 
        id, first_name, last_name, middle_name, suffix, nickname, 
        photo_url, primary_email, mobile_phone, home_phone, work_phone, 
        address_city, address_state, address_zip, occupation, company, 
        membership_status, ministry_areas, categories, bio, photo_filename,
        facebook_url, instagram_url, twitter_url, linkedin_url,
        spouse_name, children_names, anniversary_date, work_address,
        member_since, baptism_date, spiritual_gifts, life_groups,
        is_active, status
      FROM users 
      WHERE 1=1
    `;
    
    const params = [];

    // Add search term if provided
    if (searchTerm) {
      query += ` AND (
        first_name LIKE ? OR last_name LIKE ? OR nickname LIKE ? OR
        occupation LIKE ? OR company LIKE ?
      )`;
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add category filter
    if (filters.category_id) {
      query += ` AND ministry_areas LIKE ?`;
      params.push(`%${filters.category_id}%`);
    }

    // Add status filter (optional for admin)
    if (filters.membership_status) {
      query += ` AND membership_status = ?`;
      params.push(filters.membership_status);
    }

    // Add active filter (optional for admin)
    if (filters.is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(filters.is_active ? 1 : 0);
    }

    // Add ministry filter
    if (filters.ministry_area) {
      query += ` AND ministry_areas LIKE ?`;
      params.push(`%${filters.ministry_area}%`);
    }

    // Add ordering
    query += ` ORDER BY last_name ASC, first_name ASC`;

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
    
    // Parse JSON fields and format results
    return results.map(entry => ({
      id: entry.id,
      first_name: entry.first_name,
      last_name: entry.last_name,
      middle_name: entry.middle_name,
      suffix: entry.suffix,
      nickname: entry.nickname,
      photo_url: entry.photo_url,
      photo_filename: entry.photo_filename,
      primary_email: entry.primary_email,
      mobile_phone: entry.mobile_phone,
      home_phone: entry.home_phone,
      work_phone: entry.work_phone,
      address_city: entry.address_city,
      address_state: entry.address_state,
      address_zip: entry.address_zip,
      occupation: entry.occupation,
      company: entry.company,
      membership_status: entry.membership_status,
      ministry_areas: entry.ministry_areas ? JSON.parse(entry.ministry_areas) : [],
      categories: entry.categories ? JSON.parse(entry.categories) : [],
      bio: entry.bio,
      facebook_url: entry.facebook_url,
      instagram_url: entry.instagram_url,
      twitter_url: entry.twitter_url,
      linkedin_url: entry.linkedin_url,
      spouse_name: entry.spouse_name,
      children_names: entry.children_names ? JSON.parse(entry.children_names) : [],
      anniversary_date: entry.anniversary_date,
      work_address: entry.work_address,
      member_since: entry.member_since,
      baptism_date: entry.baptism_date,
      spiritual_gifts: entry.spiritual_gifts ? JSON.parse(entry.spiritual_gifts) : [],
      life_groups: entry.life_groups ? JSON.parse(entry.life_groups) : [],
      is_active: entry.is_active,
      status: entry.status
    }));
  } catch (error) {
    console.error('Error searching admin directory:', error);
    return [];
  } finally {
    db.close();
  }
}
