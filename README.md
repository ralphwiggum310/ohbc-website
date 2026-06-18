# OHBC Website - Cleaned & Modernized

A modern, maintainable church website built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 What's New

- **Clean Architecture**: Removed all unnecessary files and configurations
- **Modern Admin Interface**: Built with shadcn/ui components
- **Content Management System**: Easy content updates without code changes
- **Performance Optimized**: Reduced bundle size and improved loading times
- **Better Developer Experience**: Consistent TypeScript and organized code structure

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite with TypeORM
- **Authentication**: NextAuth.js
- **Deployment**: Docker optimized

## 📁 Clean Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── (pages)/           # Public pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── admin/             # Admin-specific components
│   └── ...                # Other components
├── lib/                   # Utilities and services
├── types/                 # TypeScript definitions
└── styles/                # Global styles
```

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env.local
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Admin Features

- **Content Management**: Update announcements, events, sermons
- **User Management**: Role-based access control
- **Analytics**: Visitor statistics and engagement metrics
- **Media Management**: Upload and organize images and documents

## 📱 Performance

- **Optimized Images**: Next.js Image component with lazy loading
- **Code Splitting**: Dynamic imports for better performance
- **Bundle Optimization**: Removed unused dependencies
- **SEO Ready**: Meta tags and structured data

## 🛡️ Security

- **Authentication**: Secure session management
- **Role-Based Access**: Admin, member, and guest roles
- **Input Validation**: Form validation and sanitization
- **HTTPS Ready**: Production-ready security headers

## 📦 Deployment

### Docker
```bash
docker build -t ohbc-website .
docker run -p 3000:3000 ohbc-website
```

### Vercel
Connect your repository to Vercel for automatic deployments.

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Test your changes thoroughly
4. Update documentation as needed

## 📄 License

MIT License - see LICENSE file for details.
