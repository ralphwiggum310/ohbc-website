import { getCustomAuth, isAdmin } from '@/lib/custom-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import UploadForm from './UploadForm';

export default async function AdminAnnouncements() {
  const session = await getCustomAuth();
  
  // If not authenticated, redirect to signin with callback URL
  if (!session) {
    const callbackUrl = encodeURIComponent('/admin/announcements');
    return redirect(`/auth/signin?callbackUrl=${callbackUrl}`);
  }

  // Check if user is admin
  if (!isAdmin(session)) {
    return redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Announcements</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Upload and manage weekly bulletins and announcements
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200">
            <div className="px-4 py-5 sm:p-6">
              <UploadForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
