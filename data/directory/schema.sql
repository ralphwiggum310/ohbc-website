-- Directory Database Schema for Orchard Hills Bible Church
-- Separate database for member rolodex with enhanced search capabilities

-- Categories for organizing directory entries
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Directory entries (rolodex)
CREATE TABLE IF NOT EXISTS directory_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    suffix VARCHAR(20),
    nickname VARCHAR(50),
    photo_url VARCHAR(500), -- URL or relative path to image file
    photo_filename VARCHAR(255), -- Original filename for reference
    bio TEXT,
    
    -- Contact Information
    primary_email VARCHAR(255),
    secondary_email VARCHAR(255),
    home_phone VARCHAR(20),
    mobile_phone VARCHAR(20),
    work_phone VARCHAR(20),
    
    -- Address Information
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'USA',
    
    -- Family Information
    spouse_name VARCHAR(200),
    children_names TEXT, -- JSON array of children names
    anniversary_date DATE,
    
    -- Professional Information
    occupation VARCHAR(200),
    company VARCHAR(200),
    work_address TEXT,
    
    -- Church Information
    member_since DATE,
    baptism_date DATE,
    membership_status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Visitor
    ministry_areas TEXT, -- JSON array of ministry involvement
    spiritual_gifts TEXT, -- JSON array of spiritual gifts
    life_groups TEXT, -- JSON array of life group involvement
    
    -- Social Media
    facebook_url VARCHAR(500),
    instagram_url VARCHAR(500),
    twitter_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    
    -- Privacy Settings
    is_public BOOLEAN DEFAULT 0, -- Visible to non-members
    show_email BOOLEAN DEFAULT 1,
    show_phone BOOLEAN DEFAULT 1,
    show_address BOOLEAN DEFAULT 0,
    show_occupation BOOLEAN DEFAULT 1,
    
    -- Metadata
    user_id INTEGER, -- Link to users table if applicable
    category_id INTEGER,
    tags TEXT, -- JSON array of searchable tags
    notes TEXT, -- Internal notes
    is_featured BOOLEAN DEFAULT 0, -- Featured member spotlight
    sort_priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Search index for fast full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS directory_search USING fts5(
    entry_id,
    first_name,
    last_name,
    middle_name,
    nickname,
    bio,
    occupation,
    company,
    ministry_areas,
    spiritual_gifts,
    tags,
    content='directory_entries',
    content_rowid='id'
);

-- Directory categories for better organization
INSERT OR IGNORE INTO categories (name, description, icon, sort_order) VALUES
('Leadership', 'Church leadership team', 'users', 1),
('Staff', 'Church staff members', 'briefcase', 2),
('Volunteers', 'Dedicated volunteers', 'heart', 3),
('Members', 'Church members', 'users', 4),
('Families', 'Family units', 'home', 5),
('Youth', 'Youth group members', 'graduation-cap', 6),
('Children', 'Children ministry', 'baby', 7),
('Seniors', 'Senior members', 'user-check', 8);

-- Triggers for updating search index
CREATE TRIGGER IF NOT EXISTS directory_search_insert AFTER INSERT ON directory_entries BEGIN
    INSERT INTO directory_search(entry_id, first_name, last_name, middle_name, nickname, bio, occupation, company, ministry_areas, spiritual_gifts, tags)
    VALUES (new.id, new.first_name, new.last_name, new.middle_name, new.nickname, new.bio, new.occupation, new.company, new.ministry_areas, new.spiritual_gifts, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS directory_search_delete AFTER DELETE ON directory_entries BEGIN
    DELETE FROM directory_search WHERE entry_id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS directory_search_update AFTER UPDATE ON directory_entries BEGIN
    DELETE FROM directory_search WHERE entry_id = old.id;
    INSERT INTO directory_search(entry_id, first_name, last_name, middle_name, nickname, bio, occupation, company, ministry_areas, spiritual_gifts, tags)
    VALUES (new.id, new.first_name, new.last_name, new.middle_name, new.nickname, new.bio, new.occupation, new.company, new.ministry_areas, new.spiritual_gifts, new.tags);
END;

-- Trigger for updating timestamps
CREATE TRIGGER IF NOT EXISTS directory_entries_updated_at 
    AFTER UPDATE ON directory_entries
BEGIN
    UPDATE directory_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS categories_updated_at 
    AFTER UPDATE ON categories
BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_directory_entries_name ON directory_entries(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_directory_entries_category ON directory_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_directory_entries_status ON directory_entries(membership_status, is_active);
CREATE INDEX IF NOT EXISTS idx_directory_entries_featured ON directory_entries(is_featured, sort_priority);
CREATE INDEX IF NOT EXISTS idx_directory_entries_user ON directory_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, sort_order);
