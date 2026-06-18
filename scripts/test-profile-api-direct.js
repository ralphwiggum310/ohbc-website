// Test the profile API directly
import { query } from '../src/lib/db.js';

async function testProfileAPI() {
  try {
    console.log('Testing profile API with admin user (ID: 40)...');
    
    // Test the exact query that the profile API uses
    const result = await query(
      `SELECT id, email, first_name, last_name, middle_name, suffix, nickname, 
              photo_url, photo_filename, bio, primary_email, secondary_email, 
              home_phone, mobile_phone, work_phone, address_street, address_city, 
              address_state, address_zip, address_country, spouse_name, children_names, 
              anniversary_date, occupation, company, membership_status, ministry_areas, 
              categories, facebook_url, instagram_url, twitter_url, linkedin_url,
              work_address, member_since, baptism_date, spiritual_gifts, life_groups
       FROM users WHERE id = ?`,
      [40],
      {},
      'users'
    );

    console.log('Query result type:', typeof result);
    console.log('Result keys:', Object.keys(result));
    console.log('Rows length:', result.rows?.length);
    console.log('HasMore:', result.hasMore);
    
    if (result.rows && result.rows.length > 0) {
      const profile = result.rows[0];
      console.log('✅ Profile found!');
      console.log('ID:', profile.id);
      console.log('Name:', profile.first_name, profile.last_name);
      console.log('Email:', profile.email);
      console.log('Status:', profile.membership_status);
    } else {
      console.log('❌ No profile found');
      console.log('Full result:', result);
    }
    
  } catch (error) {
    console.error('❌ Error testing profile API:', error);
  }
}

testProfileAPI();
