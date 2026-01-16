'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Download, ExternalLink, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './button';

type PdfViewerProps = {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
};

export function PdfViewer({ fileUrl, fileName, onClose }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && numPages && pageNumber < numPages) {
        setPageNumber(prev => Math.min(prev + 1, numPages));
      } else if (e.key === 'ArrowLeft' && pageNumber > 1) {
        setPageNumber(prev => Math.max(prev - 1, 1));
      } else if (e.key === '+' || e.key === '=') {
        setScale(prev => Math.min(prev + 0.1, 2));
      } else if (e.key === '-' || e.key === '_') {
        setScale(prev => Math.max(prev - 0.1, 0.5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, pageNumber, onClose]);

  // Handle iframe load
  const handleLoad = () => {
    setIsLoading(false);
    // Try to get the number of pages from the PDF (this works with some PDF viewers)
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        // @ts-ignore - PDF.js viewer API
        iframe.contentWindow.PDFViewerApplication?.pdfDocument?.then((pdf: any) => {
          setNumPages(pdf.numPages);
        });
      }
    } catch (e) {
      console.log('Could not get page count', e);
    }
  };

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle open in new tab
  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle zoom in/out
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  // Calculate iframe dimensions based on scale
  const iframeStyle = {
    width: '100%',
    height: 'calc(100% - 60px)',
    border: 'none',
    transform: `scale(${scale})`,
    transformOrigin: '0 0',
    transition: 'transform 0.2s ease-in-out',
  };

  // Calculate container dimensions based on scale
  const containerStyle = {
    width: '100%',
    height: `calc(100vh - 60px)`, // Account for header
    overflow: 'hidden',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative w-full max-w-6xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 truncate max-w-md">
                {fileName}
              </h3>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={zoomOut}
                    title="Zoom Out (Ctrl + -)"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500 w-12 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={zoomIn}
                    title="Zoom In (Ctrl + +)"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-1">
                  {numPages && (
                    <div className="flex items-center text-sm text-gray-500 mx-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                        disabled={pageNumber <= 1}
                        title="Previous Page (Left Arrow)"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="mx-2">
                        {pageNumber} / {numPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                        disabled={pageNumber >= numPages}
                        title="Next Page (Right Arrow)"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenInNewTab}
                    title="Open in New Tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                    title="Close (Esc)"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* PDF Content */}
            <div className="relative flex-1 bg-gray-100 overflow-auto" ref={containerRef}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-gray-500">Loading PDF...</div>
                </div>
              )}
              
              <div style={containerStyle}>
                <iframe
                  ref={iframeRef}
                  src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(fileUrl)}#page=${pageNumber}&zoom=${scale * 100}`}
                  title={fileName}
                  style={iframeStyle}
                  onLoad={handleLoad}
                  className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
