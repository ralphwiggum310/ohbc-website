# OHBC Lite - Database and API Documentation

This document provides an overview of the database structure and API endpoints for the OHBC Lite application.

## Database Configuration

The application uses SQLite3 for data storage with the following configuration:
- **Development Database**: `./data/ohbc-dev.db`
- **Production Database**: `./data/ohbc.db`
- **ORM**: TypeORM with SQLite3 driver
- **WAL Mode**: Enabled for better concurrency

## Database Models

### 1. User
Stores user authentication and basic profile information.

**Fields:**
- `id` (Primary Key, auto-increment)
- `email` (String, required, unique)
- `password` (String, required)
- `firstName` (String, required)
- `lastName` (String, required)
- `role` (String, enum: ['admin', 'member', 'guest'], default: 'guest')
- `isActive` (Boolean, default: true)
- `lastLogin` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### 2. Member
Extends user information with church-specific member details.

**Fields:**
- `user` (Reference to User, required)
- `phoneNumber` (String)
- `address` (Object with street, city, state, zipCode)
- `dateOfBirth` (Date)
- `joinDate` (Date, default: now)
- `familyMembers` (Array of objects with name, relationship, dateOfBirth)
- `isActive` (Boolean, default: true)
- `notes` (String)
- `createdAt` (Date)
- `updatedAt` (Date)

### 3. PrayerRequest
Manages prayer requests with approval workflow.

**Fields:**
- `title` (String, required)
- `content` (String, required)
- `user` (Reference to User, required)
- `isApproved` (Boolean, default: false)
- `isPublic` (Boolean, default: true)
- `status` (String, enum: ['pending', 'approved', 'rejected'], default: 'pending')
- `createdAt` (Date)
- `updatedAt` (Date)

### 4. Schedule
Manages church events and schedules.

**Fields:**
- `title` (String, required)
- `description` (String)
- `startTime` (Date, required)
- `endTime` (Date, required)
- `location` (String)
- `createdBy` (Reference to User, required)
- `isRecurring` (Boolean, default: false)
- `recurrencePattern` (Object with frequency, interval, endDate)
- `attendees` (Array of objects with user reference and status)
- `isPublic` (Boolean, default: true)
- `category` (String, enum: ['service', 'meeting', 'event', 'other'], required)
- `createdAt` (Date)
- `updatedAt` (Date)

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signout` - User sign out
- `GET /api/auth/session` - Get current session

### Prayer Requests
- `GET /api/prayer-requests` - List prayer requests (with pagination)
- `POST /api/prayer-requests` - Create a new prayer request
- `GET /api/prayer-requests/[id]` - Get a specific prayer request
- `PUT /api/prayer-requests/[id]` - Update a prayer request
- `DELETE /api/prayer-requests/[id]` - Delete a prayer request

### Members
- `GET /api/members` - List members (with search and pagination)
- `POST /api/members` - Create a new member (admin only)
- `GET /api/members/[id]` - Get a specific member
- `PUT /api/members/[id]` - Update a member
- `DELETE /api/members/[id]` - Deactivate a member (admin only)

### Schedules
- `GET /api/schedules` - List schedules (with date range filtering)
- `POST /api/schedules` - Create a new schedule
- `GET /api/schedules/[id]` - Get a specific schedule
- `PUT /api/schedules/[id]` - Update a schedule
- `DELETE /api/schedules/[id]` - Delete a schedule
- `POST /api/schedules/[id]/attendance` - Update attendance for a schedule

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# File Uploads
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create the data directory for SQLite database files:
   ```bash
   mkdir -p data
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   This will automatically create the SQLite database file and initialize the schema.

## Authentication

All API endpoints (except authentication) require a valid session token. Include the session token in the `Authorization` header:

```
Authorization: Bearer <session-token>
```

## Error Handling

All API responses follow this format:

```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
}
```

## Next Steps

1. Implement frontend components to interact with these API endpoints
2. Add more specific validation rules as needed
3. Implement email notifications for important events (new prayer requests, schedule updates, etc.)
4. Add more detailed audit logging
5. Implement rate limiting and other security measures for production use
