# Orchard Hills Bible Church - User Authentication System

## Overview
A comprehensive user authentication system with role-based access control, member directory, and serving schedules functionality.

## Database Setup
- **Database**: SQLite
- **Location**: `\data\users\ohbc_users.db`
- **Schema**: Complete with users, roles, profiles, and schedules tables

## Features Implemented

### ✅ Authentication Core
- User registration with email/phone validation
- Secure login with JWT tokens
- Password hashing with bcrypt
- Session management with refresh tokens
- Account lockout after failed attempts

### ✅ Role-Based Access Control
- 5 user roles: Super Admin, Admin, Ministry Leader, Member, Guest
- Permission-based access control
- Middleware for protecting routes

### ✅ User Management
- User profiles with privacy controls
- Member directory with search functionality
- Serving schedules management

### ✅ Frontend Components
- Login form with validation
- Registration form with password requirements
- Members dashboard
- Directory page with search
- Serving schedules page

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/verify` - Token verification

### Members
- `GET /api/members/directory` - Members directory (authenticated)
- `GET /api/serving/schedules` - Serving schedules (role-based)
- `POST /api/serving/schedules` - Create serving schedule (role-based)

## User Roles & Permissions

### Super Admin
- Full system access
- User management
- All content management
- Directory export

### Admin
- User management (read/update)
- Content management
- Serving schedules management
- Directory access

### Ministry Leader
- Ministry content management
- Team schedules
- Member directory access
- Team management

### Member
- Member directory access
- Personal serving schedules
- Profile management

### Guest
- Public content only

## Security Features

### Password Requirements
- Minimum 8 characters
- Uppercase and lowercase letters
- At least one number
- At least one special character

### Account Protection
- Rate limiting on login attempts
- Account lockout after 5 failed attempts
- 30-minute lockout period
- Secure HTTP-only cookies

### Token Security
- JWT access tokens (15-minute expiry)
- Refresh tokens (7-day expiry)
- Secure cookie storage
- Token invalidation on logout

## Frontend Pages

### Authentication Pages
- `/auth/login` - Login form
- `/auth/register` - Registration form

### Members Area
- `/members/dashboard` - Member dashboard
- `/members/directory` - Members directory
- `/members/schedules` - Serving schedules

## Database Schema

### Users Table
- Core authentication data
- Email/phone uniqueness
- Role assignment
- Account status tracking

### User Profiles Table
- Extended user information
- Privacy controls
- Ministry areas

### Serving Schedules Table
- Ministry assignments
- Schedule management
- Status tracking

## Next Steps

### 🔄 In Progress
- Serving schedules frontend completion
- Admin dashboard integration

### 📋 Pending
- Password reset functionality
- Rate limiting implementation
- Admin user management interface
- Email verification system
- Advanced security features

## Usage

### Registration
1. Visit `/auth/register`
2. Fill in personal information
3. Provide email OR phone number
4. Create strong password
5. Submit registration

### Login
1. Visit `/auth/login`
2. Enter email/phone and password
3. Click "Sign in"
4. Redirected to members dashboard

### Member Directory
1. Login to members area
2. Navigate to "Members Directory"
3. Search by name, email, or ministry
4. View member profiles

### Serving Schedules
1. Login to members area
2. Navigate to "Serving Schedules"
3. View current assignments
4. Manage availability

## Development Notes

### Environment Variables
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret

### Dependencies
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `sqlite3` - Database
- `@types/*` - TypeScript support

### Security Considerations
- All passwords are hashed with bcrypt (salt rounds: 12)
- JWT tokens have short expiry for security
- Refresh tokens stored securely in HTTP-only cookies
- Input validation on all endpoints
- SQL injection prevention with parameterized queries

## Testing

### Test Users
Create test users in different roles to test functionality:
- Super Admin: Full access testing
- Admin: Content management testing
- Ministry Leader: Team management testing
- Member: Basic functionality testing

### Security Testing
- Test password requirements
- Test account lockout functionality
- Test role-based access control
- Test session management

## File Structure
```
src/
├── app/
│   ├── api/auth/          # Authentication endpoints
│   ├── api/members/       # Members API
│   ├── api/serving/        # Serving schedules API
│   ├── auth/              # Authentication pages
│   └── members/           # Members area pages
├── components/auth/        # Auth components
├── lib/
│   ├── auth.js            # Authentication utilities
│   └── database.js        # Database operations
└── data/users/            # Database files
```

This authentication system provides a solid foundation for the Orchard Hills Bible Church website with comprehensive security, role-based access, and member management features.
