import Database from 'better-sqlite3';
import path from 'path';

const dirDb = new Database(path.join(process.cwd(), 'data', 'directory', 'ohbc_directory.db'));
const usersDb = new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));

try {
  const dirEntries = dirDb.prepare('SELECT * FROM directory_entries WHERE is_active = 1').all();
  console.log('Updating', dirEntries.length, 'entries with additional data...');

  let updated = 0;
  for (const entry of dirEntries) {
    try {
      const stmt = usersDb.prepare(`
        UPDATE users SET 
          middle_name = ?, suffix = ?, nickname = ?, photo_url = ?, photo_filename = ?,
          bio = ?, primary_email = ?, secondary_email = ?, home_phone = ?, mobile_phone = ?,
          work_phone = ?, address_street = ?, address_city = ?, address_state = ?, address_zip = ?,
          address_country = ?, spouse_name = ?, children_names = ?, anniversary_date = ?,
          occupation = ?, company = ?, work_address = ?, member_since = ?, baptism_date = ?,
          membership_status = ?, ministry_areas = ?, spiritual_gifts = ?, life_groups = ?,
          facebook_url = ?, instagram_url = ?, twitter_url = ?, linkedin_url = ?,
          is_public = ?, show_email = ?, show_phone = ?, show_address = ?, show_occupation = ?,
          user_id = ?, category_id = ?, tags = ?, notes = ?, is_featured = ?,
          sort_priority = ?, created_at = ?, updated_at = ?, created_by = ?, updated_by = ?
        WHERE id = ?
      `);
      
      stmt.run(
        entry.middle_name, entry.suffix, entry.nickname, entry.photo_url, entry.photo_filename,
        entry.bio, entry.primary_email, entry.secondary_email, entry.home_phone, entry.mobile_phone,
        entry.work_phone, entry.address_street, entry.address_city, entry.address_state, entry.address_zip,
        entry.address_country, entry.spouse_name, entry.children_names, entry.anniversary_date,
        entry.occupation, entry.company, entry.work_address, entry.member_since, entry.baptism_date,
        entry.membership_status, entry.ministry_areas, entry.spiritual_gifts, entry.life_groups,
        entry.facebook_url, entry.instagram_url, entry.twitter_url, entry.linkedin_url,
        entry.is_public, entry.show_email, entry.show_phone, entry.show_address, entry.show_occupation,
        entry.user_id, entry.category_id, entry.tags, entry.notes, entry.is_featured,
        entry.sort_priority, entry.created_at, entry.updated_at, entry.created_by, entry.updated_by,
        entry.id
      );
      
      updated++;
      if (updated % 10 === 0) {
        console.log('Updated', updated, 'entries...');
      }
    } catch (error) {
      console.log('Error updating', entry.first_name, entry.last_name + ':', error.message);
    }
  }

  console.log('Update completed! Total updated:', updated);
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  dirDb.close();
  usersDb.close();
}
