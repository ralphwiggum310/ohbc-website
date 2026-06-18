import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';
import { Announcement, Event, PrayerRequest, User, Sermon, SiteSettings } from '@/types/content';

class ContentManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'content.db');
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });

      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      
      // Create tables
      this.createTables();
      
      console.log('Content database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize content database:', error);
      throw error;
    }
  }

  private createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Announcements table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT CHECK(type IN ('weekly', 'special', 'urgent')) NOT NULL,
        status TEXT CHECK(status IN ('draft', 'published', 'archived')) NOT NULL,
        publishDate DATETIME,
        expireDate DATETIME,
        attachments TEXT, -- JSON array
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        createdBy TEXT NOT NULL
      )
    `);

    // Events table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        startDate DATETIME NOT NULL,
        endDate DATETIME,
        location TEXT NOT NULL,
        type TEXT CHECK(type IN ('service', 'study', 'fellowship', 'outreach')) NOT NULL,
        status TEXT CHECK(status IN ('draft', 'published', 'cancelled')) NOT NULL,
        recurring TEXT, -- JSON object
        attachments TEXT, -- JSON array
        maxAttendees INTEGER,
        currentAttendees INTEGER DEFAULT 0,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        createdBy TEXT NOT NULL
      )
    `);

    // Prayer requests table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS prayer_requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        request TEXT NOT NULL,
        isPublic BOOLEAN DEFAULT 0,
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'completed')) NOT NULL,
        category TEXT CHECK(category IN ('health', 'family', 'spiritual', 'financial', 'other')) NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        approvedBy TEXT,
        approvedAt DATETIME
      )
    `);

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'member', 'guest')) NOT NULL,
        isActive BOOLEAN DEFAULT 1,
        lastLogin DATETIME,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);

    // Sermons table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sermons (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        speaker TEXT NOT NULL,
        date DATETIME NOT NULL,
        series TEXT,
        scripture TEXT,
        audioUrl TEXT,
        videoUrl TEXT,
        notes TEXT,
        slides TEXT,
        status TEXT CHECK(status IN ('draft', 'published')) NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        createdBy TEXT NOT NULL
      )
    `);

    // Site settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY DEFAULT 'main',
        churchName TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        serviceTimes TEXT NOT NULL, -- JSON object
        socialMedia TEXT, -- JSON object
        giving TEXT, -- JSON object
        updatedAt DATETIME NOT NULL,
        updatedBy TEXT NOT NULL
      )
    `);
  }

  // Announcements
  async getAnnouncements(filters?: {
    status?: Announcement['status'];
    type?: Announcement['type'];
    limit?: number;
  }): Promise<Announcement[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM announcements WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY createdAt DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      ...row,
      attachments: row.attachments ? JSON.parse(row.attachments) : [],
      publishDate: row.publishDate ? new Date(row.publishDate) : undefined,
      expireDate: row.expireDate ? new Date(row.expireDate) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `announcement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const stmt = this.db.prepare(`
      INSERT INTO announcements (
        id, title, content, type, status, publishDate, expireDate,
        attachments, createdAt, updatedAt, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.title,
      data.content,
      data.type,
      data.status,
      data.publishDate?.toISOString(),
      data.expireDate?.toISOString(),
      JSON.stringify(data.attachments || []),
      now.toISOString(),
      now.toISOString(),
      data.createdBy
    );

    return {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateAnnouncement(id: string, data: Partial<Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Announcement> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date();
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachments') {
        updates.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      } else if (key === 'publishDate' || key === 'expireDate') {
        updates.push(`${key} = ?`);
        params.push(value instanceof Date ? value.toISOString() : value);
      } else {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    updates.push('updatedAt = ?');
    params.push(now.toISOString());
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE announcements SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...params);

    const updated = await this.getAnnouncements();
    return updated.find(a => a.id === id)!;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM announcements WHERE id = ?');
    stmt.run(id);
  }

  // Events
  async getEvents(filters?: {
    status?: Event['status'];
    type?: Event['type'];
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM events WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters?.startDate) {
      query += ' AND startDate >= ?';
      params.push(filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query += ' AND startDate <= ?';
      params.push(filters.endDate.toISOString());
    }

    query += ' ORDER BY startDate ASC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      ...row,
      recurring: row.recurring ? JSON.parse(row.recurring) : undefined,
      attachments: row.attachments ? JSON.parse(row.attachments) : [],
      startDate: new Date(row.startDate),
      endDate: row.endDate ? new Date(row.endDate) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const stmt = this.db.prepare(`
      INSERT INTO events (
        id, title, description, startDate, endDate, location, type, status,
        recurring, attachments, maxAttendees, currentAttendees,
        createdAt, updatedAt, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.title,
      data.description,
      data.startDate.toISOString(),
      data.endDate?.toISOString(),
      data.location,
      data.type,
      data.status,
      JSON.stringify(data.recurring),
      JSON.stringify(data.attachments || []),
      data.maxAttendees,
      data.currentAttendees || 0,
      now.toISOString(),
      now.toISOString(),
      data.createdBy
    );

    return {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Prayer Requests
  async getPrayerRequests(filters?: {
    status?: PrayerRequest['status'];
    category?: PrayerRequest['category'];
    isPublic?: boolean;
  }): Promise<PrayerRequest[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM prayer_requests WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.isPublic !== undefined) {
      query += ' AND isPublic = ?';
      params.push(filters.isPublic ? 1 : 0);
    }

    query += ' ORDER BY createdAt DESC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      ...row,
      isPublic: Boolean(row.isPublic),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      approvedAt: row.approvedAt ? new Date(row.approvedAt) : undefined,
    }));
  }

  async createPrayerRequest(data: Omit<PrayerRequest, 'id' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedAt'>): Promise<PrayerRequest> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `prayer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const stmt = this.db.prepare(`
      INSERT INTO prayer_requests (
        id, name, email, phone, request, isPublic, status, category,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name,
      data.email,
      data.phone,
      data.request,
      data.isPublic ? 1 : 0,
      data.status,
      data.category,
      now.toISOString(),
      now.toISOString()
    );

    return {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updatePrayerRequest(id: string, data: Partial<Omit<PrayerRequest, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PrayerRequest> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date();
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'isPublic') {
        updates.push(`${key} = ?`);
        params.push(value ? 1 : 0);
      } else {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    updates.push('updatedAt = ?');
    params.push(now.toISOString());
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE prayer_requests SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...params);

    const updated = await this.getPrayerRequests();
    return updated.find(p => p.id === id)!;
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
let contentManager: ContentManager | null = null;

export function getContentManager(): ContentManager {
  if (!contentManager) {
    contentManager = new ContentManager();
  }
  return contentManager;
}

export { ContentManager };
