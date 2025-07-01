// Bible page temporarily disabled
/*
import BibleReader from '../components/BibleReader/BibleReader';

export const metadata = {
  title: 'Bible Reader | OHBC',
  description: 'Read and search the Bible online with multiple translations including NASB, NKJV, KJV, NIV, and ESV.',
};

export default function BiblePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <BibleReader />
      </div>
    </main>
  );
}
*/

// Temporary placeholder component
export default function BiblePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Bible Reader Temporarily Unavailable</h1>
        <p className="text-gray-600 mb-6">We're currently working on improving our Bible reader. Please check back soon!</p>
        <a 
          href="https://www.biblegateway.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Visit Bible Gateway
        </a>
      </div>
    </main>
  );
}
