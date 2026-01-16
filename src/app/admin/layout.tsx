import { auth, isAdmin } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin/dashboard');
  }
  
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-full">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
