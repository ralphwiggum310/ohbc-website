import { getCustomAuth, isAdmin } from '@/lib/custom-auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCustomAuth();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin/dashboard');
  }
  
  // Check if user is admin
  const isUserAdmin = isAdmin(session);
  if (!isUserAdmin) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex h-full">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
