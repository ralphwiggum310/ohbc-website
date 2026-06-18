'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const MAROON = '#5c1a1a';

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'fill-current' : ''}`} fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Sermons',
    href: '/sermons',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6`} fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Give',
    href: '/give',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    label: 'Visit',
    href: '/visit',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'More',
    href: '/announcements',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin pages — they have their own sidebar nav
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* Spacer so page content isn't hidden behind the bar */}
      <div className="h-16 md:hidden" aria-hidden="true" />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-700"
        style={{ backgroundColor: '#fff' }}
        aria-label="Mobile navigation"
      >
        <div className="dark:bg-gray-900 h-16 flex items-stretch">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:opacity-70"
                style={{ color: active ? MAROON : '#6b7280' }}
                aria-current={active ? 'page' : undefined}
              >
                {item.icon(active)}
                <span className={`text-[10px] font-medium leading-none ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for phones with home indicator */}
        <div className="h-safe-bottom bg-white dark:bg-gray-900" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>
    </>
  );
}
