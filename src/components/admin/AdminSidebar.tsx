'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiUpload, 
  FiLogOut, 
  FiSettings, 
  FiMessageSquare, 
  FiCalendar, 
  FiUsers,
  FiBarChart2 
} from 'react-icons/fi';
import { signOut } from 'next-auth/react';

type NavigationItem = {
  name: string;
  href: string;
  icon: any;
  disabled?: boolean;
  badge?: string;
  onClick?: () => void;
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await signOut({
      redirect: false,
      callbackUrl: '/api/auth/signin'
    });
    router.push('/api/auth/signin');
    router.refresh();
  };
  
  const navigation: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: FiHome 
    },
    { 
      name: 'Announcements', 
      href: '/admin/announcements', 
      icon: FiUpload 
    },
    { 
      name: 'Prayer Requests', 
      href: '#', 
      icon: FiMessageSquare,
      disabled: true,
      badge: 'Soon'
    },
    { 
      name: 'Schedules', 
      href: '#', 
      icon: FiCalendar,
      disabled: true,
      badge: 'Soon'
    },
    { 
      name: 'Users', 
      href: '#', 
      icon: FiUsers,
      disabled: true,
      badge: 'Soon'
    },
    { 
      name: 'Statistics', 
      href: '#', 
      icon: FiBarChart2,
      disabled: true,
      badge: 'Soon'
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: FiSettings,
      disabled: true,
      badge: 'Soon'
    },
  ];

  return (
    <div className="flex flex-col w-64 h-screen bg-white border-r">
      <div className="px-4 py-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Control Panel</h2>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="px-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 transform rounded-lg hover:bg-gray-100 hover:text-gray-700 ${
                pathname === item.href ? 'bg-gray-100 text-gray-700' : ''
              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-disabled={item.disabled}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                }
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="mx-4 font-medium">{item.name}</span>
              {item.badge && (
                <span className="px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-gray-800 bg-gray-200 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Sticky Sign Out Button */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full px-4 py-3 text-gray-700 transition-colors duration-200 transform rounded-lg hover:bg-red-50 hover:text-red-600"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="ml-3 font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
