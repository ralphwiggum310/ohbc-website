'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  BookUser,
  Image,
  UserCog,
  Home,
  Bell,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Prayer Requests', href: '/admin/prayer-requests', icon: Users },
  { name: 'User Management', href: '/admin/users', icon: UserCog },
  { name: 'Directory', href: '/admin/directory', icon: BookUser },
  { name: 'Profile Pictures', href: '/admin/profile-pictures', icon: Image },
  { name: 'Statistics', href: '/admin/statistics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-6" style={{ backgroundColor: '#5c1a1a' }}>
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                  style={isActive ? { backgroundColor: '#5c1a1a' } : undefined}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0" />
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-6" style={{ backgroundColor: '#5c1a1a' }}>
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                  style={isActive ? { backgroundColor: '#5c1a1a' } : undefined}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0" />
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {navigation.find(item => item.href === pathname)?.name || 'Admin'}
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
