export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'weekly' | 'special' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publishDate?: Date;
  expireDate?: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  type: 'service' | 'study' | 'fellowship' | 'outreach';
  status: 'draft' | 'published' | 'cancelled';
  recurring?: {
    frequency: 'weekly' | 'monthly' | 'yearly';
    days?: number[];
    endDate?: Date;
  };
  attachments?: string[];
  maxAttendees?: number;
  currentAttendees?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PrayerRequest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  request: string;
  isPublic: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  category: 'health' | 'family' | 'spiritual' | 'financial' | 'other';
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member' | 'guest';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sermon {
  id: string;
  title: string;
  description: string;
  speaker: string;
  date: Date;
  series?: string;
  scripture?: string;
  audioUrl?: string;
  videoUrl?: string;
  notes?: string;
  slides?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SiteSettings {
  id: string;
  churchName: string;
  address: string;
  phone: string;
  email: string;
  serviceTimes: {
    sundaySchool: string;
    sundayService: string;
    midweek?: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  giving: {
    onlineGivingUrl?: string;
    mailingAddress?: string;
    textToGiveNumber?: string;
  };
  updatedAt: Date;
  updatedBy: string;
}
