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
    try {
      // Call the logout API to clear the cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Redirect to signin page
    router.push('/auth/signin');
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
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.disabled ? '#' : item.href}
            onClick={item.onClick}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              pathname === item.href
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
            {item.badge && (
              <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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
