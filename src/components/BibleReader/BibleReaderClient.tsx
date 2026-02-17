'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled
// const ModernBibleReader = dynamic(
//   () => import('./ModernBibleReader'),
//   { 
//     ssr: false, 
//     loading: () => (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     ) 
//   }
// );

export default function BibleReaderClient() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Bible Reader</h2>
        <p className="text-gray-600">Bible Reader is temporarily unavailable.</p>
        <p className="text-sm text-gray-500 mt-2">Please use the main Bible page instead.</p>
      </div>
    </div>
  );
}
