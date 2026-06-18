// Test the profile API directly
import Database from 'better-sqlite3';
import path from 'path';

async function testProfileAPI() {
  try {
    console.log('Testing profile data for admin user (ID: 40)...');
    
    const usersDb = new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));
    
    // Test the query that the profile API uses
    const result = usersDb.prepare(
      `SELECT id, email, first_name, last_name, middle_name, suffix, nickname, 
              photo_url, photo_filename, bio, primary_email, secondary_email, 
              home_phone, mobile_phone, work_phone, address_street, address_city, 
              address_state, address_zip, address_country, spouse_name, children_names, 
              anniversary_date, occupation, company, membership_status, ministry_areas, 
              categories, facebook_url, instagram_url, twitter_url, linkedin_url,
              work_address, member_since, baptism_date, spiritual_gifts, life_groups
       FROM users WHERE id = ?`
    ).all([40]); // Admin user ID

    if (result.length === 0) {
      console.log('❌ Profile not found for admin user');
      return;
    }

    const profile = result[0];
    console.log('✅ Admin profile found!');
    console.log('ID:', profile.id);
    console.log('Name:', profile.first_name, profile.last_name);
    console.log('Email:', profile.email);
    console.log('Status:', profile.membership_status);
    
    // Test with user ID 1 (Donovan Allen)
    console.log('\\nTesting with user ID 1 (Donovan Allen)...');
    const result2 = usersDb.prepare(
      `SELECT id, email, first_name, last_name FROM users WHERE id = ?`
    ).all([1]);
    
    if (result2.length > 0) {
      const profile2 = result2[0];
      console.log('✅ User 1 found:', profile2.first_name, profile2.last_name);
    }
    
    usersDb.close();
    
  } catch (error) {
    console.error('❌ Error testing profile API:', error);
  }
}

testProfileAPI();
