'use client';

import { useState, useEffect } from 'react';

type PDFViewerProps = {
  file: string;
  onClose: () => void;
};

export default function PDFViewer({ file, onClose }: PDFViewerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open PDF in a new tab for all devices
  useEffect(() => {
    // Convert relative path to absolute URL
    const absoluteUrl = file.startsWith('http') ? file : `${window.location.origin}${file}`;
    window.open(absoluteUrl, '_blank');
    
    // Close the viewer after a short delay
    const timer = setTimeout(() => onClose(), 100);
    return () => clearTimeout(timer);
  }, [file, onClose]);

  // Handle iframe error
  const handleIframeError = () => {
    setError('Failed to load PDF. The file may be corrupted or in an unsupported format.');
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render anything as we're opening in a new tab
  return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b">
          <span className="text-sm font-medium text-gray-700">PDF Viewer</span>
          <div className="flex items-center space-x-2">
            <a
              href={file}
              download
              className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 hover:bg-blue-50 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="text-gray-700 hover:bg-gray-200 p-2 rounded-full"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="text-center p-8">
              <p className="text-red-600 mb-4">{error}</p>
              <a
                href={file}
                download
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </a>
            </div>
          ) : (
            <div className="w-full h-full min-h-[70vh]">
              <iframe
                src={`${file}#view=FitH`}
                className="w-full h-full border-0"
                title="PDF Viewer"
                onError={handleIframeError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
