import Database from 'better-sqlite3';
import path from 'path';

async function testProfileDirect() {
  try {
    console.log('Testing profile query directly with admin user (ID: 40)...');
    
    const usersDb = new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));
    
    // Test the exact query that the profile API uses
    const result = usersDb.prepare(`
      SELECT id, email, first_name, last_name, middle_name, suffix, nickname, 
              photo_url, photo_filename, bio, primary_email, secondary_email, 
              home_phone, mobile_phone, work_phone, address_street, address_city, 
              address_state, address_zip, address_country, spouse_name, children_names, 
              anniversary_date, occupation, company, membership_status, ministry_areas, 
              categories, facebook_url, instagram_url, twitter_url, linkedin_url,
              work_address, member_since, baptism_date, spiritual_gifts, life_groups
       FROM users WHERE id = ?
    `).all(40);

    console.log('Query result type:', typeof result);
    console.log('Result length:', result.length);
    
    if (result.length > 0) {
      const profile = result[0];
      console.log('✅ Profile found!');
      console.log('ID:', profile.id);
      console.log('Name:', profile.first_name, profile.last_name);
      console.log('Email:', profile.email);
      console.log('Status:', profile.membership_status);
      
      // Simulate the API response format
      const apiResponse = {
        rows: result,
        hasMore: false
      };
      
      console.log('\nSimulated API response:');
      console.log('Rows length:', apiResponse.rows.length);
      
      if (apiResponse.rows.length === 0) {
        console.log('❌ Would return "Profile not found"');
      } else {
        console.log('✅ Would return profile data');
      }
    } else {
      console.log('❌ No profile found');
    }
    
    usersDb.close();
    
  } catch (error) {
    console.error('❌ Error testing profile query:', error);
  }
}

testProfileDirect();
