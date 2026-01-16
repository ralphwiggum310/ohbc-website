import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import UploadForm from './UploadForm';

export default async function AdminAnnouncements() {
  const session = await auth();
  
  // If not authenticated, redirect to signin with callback URL
  if (!session) {
    const callbackUrl = encodeURIComponent('/admin/announcements');
    return redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
  }

  // Check if user is admin
  const user = session.user as { role?: string };
  if (user.role !== 'admin') {
    return redirect('/');
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
            <p className="mt-1 text-sm text-gray-600">
              Upload and manage weekly bulletins and announcements
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <UploadForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
