'use client';

import { useState, useEffect } from 'react';

type PDFViewerModalProps = {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
};

export default function PDFViewerModal({ fileUrl, fileName, onClose }: PDFViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile device
  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load PDF. Please try downloading it instead.');
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Auto-open PDF on mobile
  useEffect(() => {
    if (isMobile) {
      const timeout = setTimeout(() => {
        window.open(fileUrl, '_blank');
        // Close the modal after a short delay
        setTimeout(onClose, 500);
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [fileUrl, isMobile, onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 sm:relative sm:max-w-6xl sm:max-h-[95vh] w-full h-full bg-white flex flex-col">
        {/* Back button for mobile */}
        <div className="sm:hidden flex items-center p-3 border-b bg-white">
          <button
            onClick={onClose}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back</span>
          </button>
        </div>
        {/* Header - Hidden on mobile */}
        <div className="hidden sm:flex flex-shrink-0 items-center justify-between p-3 border-b bg-white">
          <h2 className="text-lg font-medium text-gray-900 truncate pr-2">{fileName}</h2>
          <div className="flex items-center space-x-2">
            <a
              href={fileUrl}
              download
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download
            </a>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* PDF Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-700">Loading PDF...</p>
              </div>
            </div>
          )}
          
          {error ? (
            <div className="h-full flex items-center justify-center p-6 bg-white">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading PDF</h3>
                <p className="text-gray-700 mb-4">{error}</p>
                <div className="space-x-3">
                  <a
                    href={fileUrl}
                    download
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download PDF
                  </a>
                  <button
                    onClick={() => window.open(fileUrl, '_blank')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative">
              {/* PDF Viewer - Always show the iframe */}
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0&view=FitH`}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={fileName}
              />
              
              {/* Mobile controls */}
              {isMobile && (
                <div className="absolute bottom-4 right-4 w-auto max-w-xs bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">PDF Options</span>
                      <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Close"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={fileUrl}
                        download
                        className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="-ml-0.5 mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download
                      </a>
                      <button
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <svg className="-ml-0.5 mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in App
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Desktop controls */}
              {!isMobile && (
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={() => setShowFallback(true)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Show download options"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
