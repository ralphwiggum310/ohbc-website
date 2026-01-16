'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FileText, Image as FileImage, File as FilePdf, File, Calendar, Megaphone, Newspaper } from 'lucide-react';

// Dynamically import the PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
  () => import('@/components/PDFViewer'),
  { ssr: false }
);

type AnnouncementFile = {
  name: string;
  path: string;
  type: 'pdf' | 'image';
  size: number;
  modified: Date;
  section: 'quarterly' | 'general' | 'sunday_bulletins';
};

type AnnouncementSections = {
  quarterly: AnnouncementFile[];
  general: AnnouncementFile[];
  sunday_bulletins: AnnouncementFile[];
};

type FilterType = 'general' | 'quarterly' | 'sunday_bulletins';

export default function AnnouncementsPage() {
  const [sections, setSections] = useState<AnnouncementSections>({
    quarterly: [],
    general: [],
    sunday_bulletins: []
  });
  const [activeFilter, setActiveFilter] = useState<FilterType>('general');
  const [isLoading, setIsLoading] = useState(true);
  const handleFileClick = useCallback(async (e: React.MouseEvent, file: AnnouncementFile) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For PDFs, open directly in a new tab
    if (file.type === 'pdf') {
      // Ensure the path starts with a slash and doesn't have double slashes
      const cleanPath = file.path.replace(/^\/+|\/+$/g, '');
      const absoluteUrl = file.path.startsWith('http') 
        ? file.path 
        : `${window.location.origin}/${cleanPath}`;
      
      // Try to open the file directly
      const newWindow = window.open(absoluteUrl, '_blank');
      
      // If the window failed to open or if the file doesn't load, try the API endpoint
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.open(`/api/file?path=${encodeURIComponent(cleanPath)}`, '_blank');
      }
      return;
    }
    
    // For non-PDF files, open in a new tab
    try {
      const response = await fetch(file.path);
      if (!response.ok) throw new Error('Failed to load file');
      
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        if (file.type === 'image') {
          // For images, create a simple HTML page to display the image
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${file.name}</title>
                <style>
                  body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
                  img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                </style>
              </head>
              <body>
                <img src="${fileURL}" alt="${file.name}" />
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          // For other file types, let the browser handle it
          newWindow.location.href = fileURL;
        }
      } else {
        // If popup is blocked, fall back to download
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
      }
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Failed to open the file. Please try again or download it instead.');
    }
  }, []);
  
  // No longer needed as we're handling PDFs directly
  const closePdfViewer = useCallback(() => {}, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch('/api/announcements');
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      const data = await response.json();
      
      // Transform the data to match our AnnouncementFile type
      const transformedData = {
        quarterly: [],
        general: [],
        sunday_bulletins: []
      } as AnnouncementSections;
      
      // Map the API response to our data structure
      Object.entries(data).forEach(([section, files]) => {
        // Normalize section name (replace hyphens with underscores)
        const normalizedSection = section.replace(/-/g, '_') as keyof AnnouncementSections;
        
        if (normalizedSection in transformedData) {
          transformedData[normalizedSection] = (files as any[]).map(file => ({
            ...file,
            modified: new Date(file.lastModified),
            section: normalizedSection as AnnouncementFile['section']
          }));
        }
      });
      
      setSections(transformedData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const getFileIcon = (type: 'pdf' | 'image') => {
    switch (type) {
      case 'pdf':
        return <FilePdf className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case 'image':
        return <FileImage className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      default:
        return <File className="w-5 h-5 text-gray-500 flex-shrink-0" />;
    }
  };

  const formatFileName = (name: string) => {
    // Remove file extension and any date prefix (format: YYYY-MM-DD - )
    return name
      .replace(/^\d{4}-\d{1,2}-\d{1,2}\s*-\s*/, '')
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const sectionIcons = {
    general: <Megaphone className="w-5 h-5" />,
    quarterly: <Newspaper className="w-5 h-5" />,
    sunday_bulletins: <FileText className="w-5 h-5" />
  };

  const sectionTitles = {
    general: (count: number) => `General Announcements (${count})`,
    quarterly: (count: number) => `Quarterly & Weekly (${count})`,
    sunday_bulletins: (count: number) => `Sunday Bulletins (${count})`
  };

  const getSectionTitle = (section: keyof AnnouncementSections) => {
    return sectionTitles[section](sections[section].length);
  };

  const getSectionIcon = (section: keyof AnnouncementSections) => {
    return sectionIcons[section];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Announcements</h1>
          <div className="space-y-12">
            {['quarterly', 'general', 'sunday_bulletins'].map((section) => (
              <div key={section} className="space-y-4">
                <div className="h-8 bg-gray-200 rounded-md w-64"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasAnnouncements = Object.values(sections).some(section => section.length > 0);

  // Filter sections based on active filter
  const filteredSections = Object.entries(sections).filter(
    ([section]) => section === activeFilter
  ) as Array<[keyof AnnouncementSections, AnnouncementFile[]]>;

  const filterButtons = [
    { id: 'general' as const, label: getSectionTitle('general') },
    { id: 'quarterly' as const, label: getSectionTitle('quarterly') },
    { id: 'sunday_bulletins' as const, label: getSectionTitle('sunday_bulletins') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-8">
          {filterButtons.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveFilter(id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {!hasAnnouncements ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No announcements available at this time.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredSections.map(([section, files]) => (
              <div key={section} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  {getSectionIcon(section)}
                  {getSectionTitle(section).replace(/\(\d+\)\s*$/, '')}
                </h2>
                {files.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {files.map((file) => (
                      <div
                        key={file.path}
                        onClick={(e) => handleFileClick(e, file)}
                        className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="ml-4 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {formatFileName(file.name)}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <span>{file.type.toUpperCase()}</span>
                              <span className="mx-1">•</span>
                              <span>{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No files available in this category</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
