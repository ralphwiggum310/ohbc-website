import Database from 'better-sqlite3';
import path from 'path';

const usersDb = new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));

try {
  const adminUser = usersDb.prepare(`
    SELECT id, email, first_name, last_name, role, is_active,
           profile_picture_filename, profile_picture_status
    FROM users WHERE email = ?
  `).get('admin@ohbc.local');
  
  console.log('Admin user profile check:');
  if (adminUser) {
    console.log('ID:', adminUser.id);
    console.log('Name:', adminUser.first_name, adminUser.last_name);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Active:', adminUser.is_active);
    console.log('Profile picture filename:', adminUser.profile_picture_filename);
    console.log('Profile picture status:', adminUser.profile_picture_status);
  } else {
    console.log('Admin user not found!');
  }
  
  // Check if the profile query would work
  console.log('\nTesting profile query...');
  const profileQuery = usersDb.prepare(`
    SELECT id, email, first_name, last_name, middle_name, suffix, nickname, 
            photo_url, photo_filename, bio, primary_email, secondary_email, 
            home_phone, mobile_phone, work_phone, address_street, address_city, 
            address_state, address_zip, address_country, spouse_name, children_names, 
            anniversary_date, occupation, company, membership_status, ministry_areas, 
            categories, facebook_url, instagram_url, twitter_url, linkedin_url,
            work_address, member_since, baptism_date, spiritual_gifts, life_groups
    FROM users WHERE id = ?
  `).get(40);
  
  if (profileQuery) {
    console.log('Profile query successful for user ID 40');
    console.log('Found name:', profileQuery.first_name, profileQuery.last_name);
  } else {
    console.log('Profile query failed for user ID 40');
  }
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  usersDb.close();
}
