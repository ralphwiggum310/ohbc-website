-- Orchard Hills Bible Church User Authentication Database Schema
-- Created: 2025-03-09

-- Users table - Core authentication data
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member',
  service_roles TEXT, -- JSON array of service roles (nursery, cleaning, security, sunday_school)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until DATETIME
);

-- Roles table - Define user roles and permissions
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT UNIQUE NOT NULL,
  permissions_json TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table - Extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  phone_visible BOOLEAN DEFAULT 1,
  email_visible BOOLEAN DEFAULT 1,
  ministry_areas TEXT, -- JSON array of ministry areas
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Serving schedules table - Ministry serving assignments
CREATE TABLE IF NOT EXISTS serving_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ministry_area TEXT NOT NULL,
  schedule_date DATETIME NOT NULL,
  role_in_ministry TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed', -- confirmed, pending, declined
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Service roles table - Define available service roles and their permissions
CREATE TABLE IF NOT EXISTS service_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Hex color for UI display
  icon TEXT, -- Icon name for UI
  permissions_json TEXT, -- JSON array of permissions for this service role
  is_active BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default service roles
INSERT OR IGNORE INTO service_roles (role_name, display_name, description, color, icon, sort_order) VALUES
('nursery', 'Nursery', 'Childcare for infants and toddlers during services', '#EC4899', 'baby', 1),
('cleaning', 'Cleaning', 'Church facility cleaning and maintenance', '#10B981', 'broom', 2),
('security', 'Security', 'Church security and safety team', '#EF4444', 'shield', 3),
('sunday_school', 'Sunday School', 'Teaching and assisting with Sunday School classes', '#8B5CF6', 'graduation-cap', 4),
('worship', 'Worship Team', 'Music and worship leading during services', '#F59E0B', 'music', 5),
('greeter', 'Greeter', 'Welcoming guests and members at church entrances', '#06B6D4', 'hand-wave', 6),
('ushers', 'Ushers', 'Seating assistance and offering collection during services', '#6366F1', 'users', 7),
('media', 'Media Team', 'Audio/visual support for services and events', '#84CC16', 'monitor', 8);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Session tokens table - For active user sessions
CREATE TABLE IF NOT EXISTS session_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Insert default roles
INSERT OR IGNORE INTO roles (role_name, permissions_json, description) VALUES
('Super Admin', '{"all": true, "users": ["create", "read", "update", "delete"], "content": ["create", "read", "update", "delete"], "schedules": ["create", "read", "update", "delete"], "directory": ["read", "export"]}', 'Full system access with user management'),
('Admin', '{"users": ["read", "update"], "content": ["create", "read", "update", "delete"], "schedules": ["create", "read", "update", "delete"], "directory": ["read"]}', 'Administrative access without user management'),
('Ministry Leader', '{"content": ["read", "update"], "schedules": ["create", "read", "update"], "directory": ["read"], "team": ["read", "update"]}', 'Ministry team leadership access'),
('Member', '{"directory": ["read"], "schedules": ["read", "update"], "profile": ["read", "update"]}', 'Standard member access'),
('Guest', '{"public": ["read"]}', 'Public access only');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_serving_schedules_user_id ON serving_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_serving_schedules_date ON serving_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_service_roles_name ON service_roles(role_name);
CREATE INDEX IF NOT EXISTS idx_service_roles_active ON service_roles(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_session_tokens_token ON session_tokens(token);
CREATE INDEX IF NOT EXISTS idx_session_tokens_user_id ON session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
