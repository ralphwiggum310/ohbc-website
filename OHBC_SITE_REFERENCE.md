# OHBC Website — Site Reference

Orchard Hills Bible Church website built with Next.js 16 App Router.
- **Domain:** orchardhillsbiblechurch.com
- **GitHub:** https://github.com/ralphwiggum310/ohbc-website (branch: `main`)
- **Local dev path:** `C:\ClaudeCode\ohbc_website\`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js ^16.1.6 (App Router) |
| Language | TypeScript 5.9 + JavaScript (mixed) |
| UI | React 19, Tailwind CSS 3, Framer Motion, Radix UI, Lucide |
| Database | better-sqlite3 (synchronous), SQLite files |
| Auth | Custom JWT (jsonwebtoken + bcryptjs), cookie-based |
| Media | PDFs via react-pdf-viewer, audio via SoundCloud widget |
| Build | `npm run build` → `next build`, served with `npm start` → `next start` |

> **IMPORTANT:** `output: 'standalone'` must NOT be in `next.config.js`. It changes
> `process.cwd()` internally and breaks SQLite path resolution (SQLITE_READONLY error).

---

## Project Directory Layout

```
ohbc_website/
├── src/
│   ├── app/                        # Next.js App Router pages & API routes
│   │   ├── layout.tsx              # Root layout (Inter font, ClientWrapper)
│   │   ├── page.tsx                # Home page
│   │   ├── admin/                  # Admin panel pages (protected)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/          # StatsDisplay + StatsFetcher components
│   │   │   ├── users/[id]/profile/ # User profile edit (async params)
│   │   │   ├── announcements/      # File upload management
│   │   │   ├── directory/
│   │   │   ├── events/
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   ├── members/                # Member-only pages (login required)
│   │   │   ├── dashboard/
│   │   │   ├── directory/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   └── schedules/
│   │   ├── announcements/page.tsx  # Public announcements (PDF viewer)
│   │   ├── bible/page.tsx          # Bible reader (calls /api/bible/*)
│   │   ├── sermons/page.tsx        # Sermons / Watch-Listen
│   │   ├── auth/                   # Login, register, forgot-password pages
│   │   └── api/                    # API routes (see section below)
│   ├── components/                 # Shared React components
│   │   ├── Navbar.tsx
│   │   ├── BibleReader/
│   │   ├── admin/                  # AdminHeader, AdminSidebar, AuthGuard
│   │   ├── auth/                   # LoginForm, RegisterForm
│   │   ├── member/                 # MemberCard, MemberSearch, RolodexNav
│   │   └── ui/                     # button, card, badge, input (shadcn-style)
│   ├── lib/                        # Server-side utilities
│   │   ├── auth.js                 # loginUser, authenticateUser, requireAuth, requireRole
│   │   ├── db.ts                   # Users DB wrapper (initializeUsersDatabase)
│   │   ├── db/bible-db.ts          # Bible DB connection
│   │   └── bible/                  # Bible service layer
│   └── contexts/
│       ├── AuthContext.tsx         # JWT token state (localStorage + cookie)
│       └── ThemeContext.tsx
├── data/                           # SQLite databases (NOT served publicly)
│   ├── users/
│   │   ├── ohbc_users.db           # Auth + member data
│   │   ├── schema.sql              # Canonical schema
│   │   ├── init-db.js              # node init-db.js  → creates DB from schema
│   │   └── add-default-admin.js    # node add-default-admin.js → admin@ohbc.com
│   ├── bible/
│   │   └── bibles.db               # KJV + other translations (read-only)
│   └── directory/
│       ├── ohbc_directory.db
│       └── schema.sql
├── public/
│   ├── uploads/                    # File uploads (NOT in git — persist on VPS)
│   │   ├── announcements/          # General announcements PDFs
│   │   ├── bulletins/              # Weekly bulletin PDFs
│   │   └── schedules/
│   ├── images/
│   └── logo/
└── next.config.js
```

---

## API Routes

### Auth (`/api/auth/`)
| Route | Method | Purpose |
|---|---|---|
| `/api/auth/login` | POST | loginUser() from lib/auth.js, returns JWT cookies |
| `/api/auth/logout` | POST | Clears cookies |
| `/api/auth/verify` | GET | Validates current token, returns user |
| `/api/auth/refresh` | POST | Issues new access token from refresh cookie |
| `/api/auth/register` | POST | New member registration |
| `/api/auth/forgot-password` | POST | Password reset email |

### Announcements (`/api/announcements/`)
| Route | Method | Purpose |
|---|---|---|
| `/api/announcements` | GET | Lists files; `?section=general` or `?section=bulletins` |
| `/api/announcements/files` | GET | Direct file listing |

**Folder mapping** (critical — filenames ≠ folder names):
```ts
const SECTION_DIRS = {
  general: 'announcements',   // public/uploads/announcements/
  bulletins: 'bulletins',     // public/uploads/bulletins/
};
```

### Bible (`/api/bible/`)
| Route | Method | Purpose |
|---|---|---|
| `/api/bible/versions` | GET | All Bible translations |
| `/api/bible/[versionId]/books` | GET | Books for a version |
| `/api/bible/[versionId]/[bookId]/chapters` | GET | Chapters |
| `/api/bible/[versionId]/[bookId]/[chapter]/verses` | GET | Verse content |
| `/api/bible/search` | GET | Full-text search |

Bible DB path: `data/bible/bibles.db` (Linux case-sensitive — all lowercase)

### Users/Admin (`/api/admin/`)
| Route | Purpose |
|---|---|
| `/api/admin/users` | List/create users |
| `/api/admin/users/[id]` | Get/update/delete user |
| `/api/admin/users/login-info` | Update login credentials |
| `/api/admin/stats` | Dashboard statistics |
| `/api/admin/upload` | File upload handler |
| `/api/admin/files` | Manage uploaded files |

---

## Authentication System

**Flow:** Login → JWT access token (1h) + refresh token (7d) set as httpOnly cookies.

**Key file:** `src/lib/auth.js`
- `loginUser(identifier, password)` — supports email or phone login
- `authenticateUser(request)` — verifies JWT, returns fresh DB user
- `requireAuth(handler)` — middleware wrapper
- `requireRole('Admin')` — role-based middleware

**DB columns used by auth.js:**
```sql
email, password_hash, role, phone,
failed_login_attempts, locked_until, is_active, last_login
```

**Role hierarchy:** Super Admin (5) > Admin (4) > Ministry Leader (3) > Member (2) > Guest (1)

**Account lockout:** 5 failed attempts → locked 30 minutes.

**Database path resolution:**
```js
// In auth.js and db.ts — env var takes priority over cwd
const USERS_DB_PATH = process.env.USERS_DB_PATH
  || path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');
```

---

## Key Caveats & Past Bug Fixes

| Issue | Root Cause | Fix Applied |
|---|---|---|
| `SQLITE_READONLY` on login | `output: 'standalone'` changes `process.cwd()` | Removed from next.config.js |
| Bible page crash (`f.find is not a function`) | Hardcoded Windows path in `lib/db/bible-db.ts` | `path.join(process.cwd(), 'data', 'bible', 'bibles.db')` |
| 0 general announcements | `SECTION_DIRS.general` was `'general'`, folder is `'announcements'` | Fixed mapping |
| Wrong bulletin sort order | Filenames like `"Apr. 5, 2026"` not parsed | Added word-month regex parser |
| Build error: `@/lib/database` not found | Stale JS routes referenced non-existent module | Rewrote those routes using `auth.js` |
| Next.js 15 async params | `params.id` used without `await params` | Added `Promise<{id}>` types + await |
| `StatsData` not exported | Defined in `page.tsx` but never exported | Moved to `StatsDisplay.tsx` |
| Linux npm install fail | `"os": ["win32"]` in package.json | Removed Windows-only fields |

---

## VPS Configuration

### Server Details
- **Provider:** VPS (Ubuntu 22.04 LTS)
- **Domain:** orchardhillsbiblechurch.com
- **IP:** (check with `dig orchardhillsbiblechurch.com` or hosting panel)
- **OS:** Ubuntu 22.04

### Directory Layout on VPS
```
/var/www/ohbc/
├── app/                    # Git clone of the repo (main branch)
│   ├── .env.production     # Environment variables (NOT in git)
│   ├── data/               # SQLite databases
│   │   ├── users/ohbc_users.db
│   │   └── bible/bibles.db
│   └── public/uploads/     # Uploaded files (persist across deploys)
├── logs/
│   ├── access.log
│   └── error.log
└── (nginx config not in this dir — see /etc/nginx/)
```

### Deploy User
- Username: `deploy`
- All app files owned by `deploy:deploy`
- Git pull and npm commands must run as `sudo -u deploy`

### Environment Variables (`.env.production`)
Located at `/var/www/ohbc/app/.env.production` — never committed to git.

```env
NODE_ENV=production
JWT_SECRET=<64-char hex secret>
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=https://orchardhillsbiblechurch.com
UPLOAD_BASE_DIR=/var/www/ohbc/app/public
USERS_DB_PATH=/var/www/ohbc/app/data/users/ohbc_users.db
PORT=3000
```

> `USERS_DB_PATH` is critical — pins the absolute DB path so it's immune to
> any internal `process.cwd()` changes in Next.js.

### systemd Service

**File:** `/etc/systemd/system/ohbc-website.service`

```ini
[Unit]
Description=OHBC Website (Next.js)
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/ohbc/app
EnvironmentFile=/var/www/ohbc/app/.env.production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/www/ohbc/logs/access.log
StandardError=append:/var/www/ohbc/logs/error.log

[Install]
WantedBy=multi-user.target
```

**Service management:**
```bash
sudo systemctl start ohbc-website
sudo systemctl stop ohbc-website
sudo systemctl restart ohbc-website
sudo systemctl status ohbc-website

# View logs
tail -f /var/www/ohbc/logs/error.log
tail -f /var/www/ohbc/logs/access.log
journalctl -u ohbc-website -f
```

### Nginx Configuration

**File:** `/etc/nginx/sites-available/ohbc` (symlinked to `sites-enabled/`)

```nginx
server {
    listen 80;
    server_name orchardhillsbiblechurch.com www.orchardhillsbiblechurch.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name orchardhillsbiblechurch.com www.orchardhillsbiblechurch.com;

    ssl_certificate /etc/letsencrypt/live/orchardhillsbiblechurch.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/orchardhillsbiblechurch.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve uploaded files directly (bypass Next.js for performance)
    location /uploads/ {
        alias /var/www/ohbc/app/public/uploads/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate
Managed by Let's Encrypt / Certbot. Auto-renewal via cron/systemd timer.
```bash
sudo certbot renew --dry-run   # test renewal
```

---

## Database Management

### Users Database
- **Path (VPS):** `/var/www/ohbc/app/data/users/ohbc_users.db`
- **Schema source:** `data/users/schema.sql`

**Initialize from scratch:**
```bash
cd /var/www/ohbc/app
sudo -u deploy node data/users/init-db.js
sudo -u deploy node data/users/add-default-admin.js
```

**Default admin credentials:**
- Email: `admin@ohbc.com`
- Password: `Ohbc@1970`
- Role: Super Admin
- **Change this password after first login.**

**Check DB health:**
```bash
sqlite3 /var/www/ohbc/app/data/users/ohbc_users.db ".tables"
sqlite3 /var/www/ohbc/app/data/users/ohbc_users.db "SELECT id, email, role FROM users;"
```

**Fix permissions if DB was created as root:**
```bash
sudo chown deploy:deploy /var/www/ohbc/app/data/users/ohbc_users.db
sudo chown deploy:deploy /var/www/ohbc/app/data/users/ohbc_users.db-shm 2>/dev/null || true
sudo chown deploy:deploy /var/www/ohbc/app/data/users/ohbc_users.db-wal 2>/dev/null || true
```

### Bible Database
- **Path:** `/var/www/ohbc/app/data/bible/bibles.db`
- Read-only — must be copied to VPS manually (not generated by scripts)
- Contains KJV and other translations

---

## Deploy Procedure (Manual)

```bash
# SSH into VPS
ssh deploy@orchardhillsbiblechurch.com

cd /var/www/ohbc/app

# 1. Pull latest code
sudo -u deploy git pull origin main

# 2. Install dependencies (if package.json changed)
sudo -u deploy npm install

# 3. Build
sudo -u deploy npm run build

# 4. Restart service
sudo systemctl restart ohbc-website

# 5. Verify
sleep 5
sudo systemctl status ohbc-website
curl -s http://localhost:3000/api/auth/verify
```

### Automated CI/CD (Planned — Not Yet Active)
- Deploy script: `/home/deploy/scripts/deploy-ohbc.sh`
- GitHub Actions secrets needed: `VPS_HOST`, `VPS_SSH_KEY`
- Sudoers entry needed for deploy user to restart systemd service

---

## File Upload System

Uploads land in `public/uploads/` on the VPS. These are NOT in git.

| URL path | Filesystem path | Used for |
|---|---|---|
| `/uploads/announcements/` | `public/uploads/announcements/` | General announcements (PDFs) |
| `/uploads/bulletins/` | `public/uploads/bulletins/` | Weekly bulletins (PDFs) |
| `/uploads/schedules/` | `public/uploads/schedules/` | Service schedules |

**Env var:** `UPLOAD_BASE_DIR=/var/www/ohbc/app/public`
The API routes use this to resolve the correct absolute path on VPS.

**Bulletin filename format:** `"Apr. 5, 2026"` — the announcements page has a
word-month date parser to sort these correctly (newest first).

---

## Troubleshooting Quick Reference

```bash
# Service not starting
sudo systemctl status ohbc-website
tail -50 /var/www/ohbc/logs/error.log

# Login returning "Internal server error"
# → Check DB permissions and path:
ls -la /var/www/ohbc/app/data/users/
sqlite3 /var/www/ohbc/app/data/users/ohbc_users.db "SELECT COUNT(*) FROM users;"

# Test login directly
curl -s -X POST https://orchardhillsbiblechurch.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ohbc.com","password":"Ohbc@1970"}' | python3 -m json.tool

# Bible page not loading
# → Check bibles.db exists and is lowercase
ls -la /var/www/ohbc/app/data/bible/

# 502 Bad Gateway from nginx
# → Next.js process is dead
sudo systemctl restart ohbc-website
# → Or VPS ran out of memory during build
free -h
# Build needs ~1.5GB RAM; if VPS has <2GB, kill other processes first

# Port conflict
sudo ss -tlnp | grep 3000
```
