'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Megaphone, Newspaper, FileText, Image as FileImage, File as FilePdf, File } from 'lucide-react';
import dynamic from 'next/dynamic';

// Types
interface AnnouncementFile {
  name: string;
  path: string;
  type: 'pdf' | 'image' | 'other';
  size: number;
  modified: Date;
  section: 'general' | 'bulletins';
  extractedDate?: Date;
  url?: string;
  lastModified?: string;
}

interface AnnouncementSections {
  general: AnnouncementFile[];
  bulletins: AnnouncementFile[];
}

type FilterType = 'general' | 'sunday_bulletins';

// Helper functions
const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

const extractDateFromFilename = (filename: string): Date => {
  // Numeric MM/DD/YYYY or MM-DD-YYYY
  const numericMatch = filename.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (numericMatch) {
    const [, month, day, year] = numericMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day));
  }
  // "Apr. 5, 2026" or "Feb 15 2026" or "Jan. 1, 2026"
  const wordMatch = filename.match(/([A-Za-z]{3})\.?\s+(\d{1,2})[,\s]+(\d{4})/);
  if (wordMatch) {
    const monthNum = MONTH_MAP[wordMatch[1].toLowerCase()];
    if (monthNum !== undefined) {
      return new Date(parseInt(wordMatch[3]), monthNum, parseInt(wordMatch[2]));
    }
  }
  return new Date(0);
};

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

export default function AnnouncementsPage() {
  // State
  const [sections, setSections] = useState<AnnouncementSections>({
    general: [],
    bulletins: []
  });
  const [activeFilter, setActiveFilter] = useState<FilterType>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; name: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Container classes with dark mode support
  const containerClasses = 'min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200';

  // Format file size to be more readable
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Format date to be more readable
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Format file name for display
  const formatFileName = useCallback((fileName: string): string => {
    return fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/, '')
      .replace(/[_-]+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  // Process and sort files
  const processFiles = useCallback((files: AnnouncementFile[]): AnnouncementFile[] => {
    return files.map(file => ({
      ...file,
      extractedDate: extractDateFromFilename(file.name)
    })).sort((a, b) => {
      const dateA = a.extractedDate || a.modified;
      const dateB = b.extractedDate || b.modified;
      return dateB.getTime() - dateA.getTime();
    });
  }, []);

  // Format display date
  const formatDisplayDate = useCallback((file: AnnouncementFile): string => {
    const dateToUse = file.extractedDate || file.modified;
    return formatDate(dateToUse);
  }, [formatDate]);

  // Handle file click
  const handleFileClick = useCallback(async (e: React.MouseEvent, file: AnnouncementFile) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (file.type === 'pdf') {
      const cleanPath = file.path.replace(/^\/+|\/+$/g, '');
      const absoluteUrl = file.path.startsWith('http') 
        ? file.path 
        : `${window.location.origin}/${cleanPath}`;
      
      const newWindow = window.open(absoluteUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.open(`/api/file?path=${encodeURIComponent(cleanPath)}`, '_blank');
      }
      return;
    }
    
    try {
      const response = await fetch(file.path);
      if (!response.ok) throw new Error('Failed to load file');
      
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        if (file.type === 'image') {
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
          newWindow.location.href = fileURL;
        }
      } else {
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

  // Get file icon based on type
  const getFileIcon = useCallback((file: AnnouncementFile) => {
    switch (file.type) {
      case 'pdf':
        return <FilePdf className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />;
      case 'image':
        return <FileImage className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
      default:
        return <File className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />;
    }
  }, []);

  // Get section icon with responsive sizing and dark mode support
  const getSectionIcon = useCallback((section: keyof AnnouncementSections) => {
    const iconProps = {
      className: 'w-4 h-4 sm:w-5 sm:h-5'
    };
    
    const iconContent = section === 'general' ? (
      <Megaphone {...iconProps} />
    ) : (
      <Newspaper {...iconProps} />
    );
    
    return (
      <div className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-full transition-colors ${
        section === activeFilter
          ? section === 'general'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/70 dark:text-blue-200'
            : 'bg-green-100 text-green-600 dark:bg-green-900/70 dark:text-green-200'
          : 'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/50'
      }`}>
        {iconContent}
      </div>
    );
  }, [isMobile, activeFilter]);

  // Section data
  const sectionsList = useMemo(() => [
    { 
      id: 'general' as const, 
      label: `General Announcements (${sections.general.length})`,
      description: 'Latest news and updates'
    },
    { 
      id: 'bulletins' as const, 
      label: `Sunday Bulletins (${sections.bulletins.length})`,
      description: 'Weekly service information'
    },
  ], [sections]);

  // Filtered sections
  const filteredSections = useMemo(() => {
    return Object.entries(sections)
      .filter(([section]) => section === activeFilter)
      .map(([section, files]) => [
        section,
        processFiles(files)
      ]) as Array<[keyof AnnouncementSections, AnnouncementFile[]]>;
  }, [sections, activeFilter, processFiles]);

  // Check if there are any announcements
  const hasAnnouncements = useMemo(() => 
    Object.values(sections).some(section => section.length > 0),
    [sections]
  );

  // Set up effects
  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load announcements data
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Real API call
        const response = await fetch('/api/announcements');
        const data = await response.json();
        setSections(data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading announcements:', error);
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-64"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Announcements</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Stay updated with our latest news and bulletins</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-6 sm:mb-8">
          {sectionsList.map(({ id, label, description }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`px-4 py-3 sm:px-6 sm:py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 w-full sm:w-auto ${
                activeFilter === id
                  ? 'bg-white shadow-md dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-transparent hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              aria-current={activeFilter === id ? 'page' : undefined}
            >
              {getSectionIcon(id)}
              <div className="text-left flex-1">
                <div className={`text-sm sm:text-base font-medium ${
                  activeFilter === id 
                    ? 'text-blue-600 dark:text-blue-300 font-semibold' 
                    : 'text-gray-700 dark:text-gray-100'
                }`}>
                  {label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {filteredSections.map(([section, files]) => (
            <div key={section} className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.length > 0 ? (
                files.map((file) => (
                  <div 
                    key={file.path} 
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                    onClick={(e) => handleFileClick(e, file)}
                  >
                    <div className="flex items-center space-x-4">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {formatFileName(file.name)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDisplayDate(file)} • {formatFileSize(file.size)}
                        </p>
                      </div>
                      <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {file.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No files available in this category
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
