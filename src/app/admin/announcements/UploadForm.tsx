'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChangeEvent, DragEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiCheckCircle, FiAlertCircle, FiLoader, FiTrash2 } from 'react-icons/fi';

interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  section: string;
  lastModified: number;
}

interface Section {
  value: string;
  label: string;
}

const SECTIONS: Section[] = [
  { value: 'announcements', label: 'Announcements' },
  { value: 'bulletin', label: 'Bulletin' },
  { value: 'newsletter', label: 'Newsletter' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>(SECTIONS[0].value);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Validate file type and size
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'File type not allowed. Please upload a PDF, JPG, PNG, or GIF.' 
      };
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.` 
      };
    }
    
    return { valid: true };
  };

  // Handle file input change
  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const { valid, error } = validateFile(file);
      
      if (valid) {
        setSelectedFile(file);
        setError('');
      } else if (error) {
        setError(error);
        setSelectedFile(null);
      }
    }
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const { valid, error } = validateFile(file);
      
      if (valid) {
        setSelectedFile(file);
        setError('');
      } else if (error) {
        setError(error);
        setSelectedFile(null);
      }
    }
  }, []);

  // Handle file upload
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // TODO: Implement actual file upload
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // formData.append('section', selectedSection);
      // 
      // const response = await fetch('/api/announcements/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Upload failed');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to files list
      const newFile: FileInfo = {
        name: selectedFile.name,
        path: `/uploads/${selectedFile.name}`,
        size: selectedFile.size,
        type: selectedFile.type,
        section: selectedSection,
        lastModified: Date.now(),
      };
      
      setFiles(prevFiles => [...prevFiles, newFile]);
      setSelectedFile(null);
      setSuccess('File uploaded successfully!');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, selectedSection]);

  // Handle file deletion
  const handleDeleteClick = useCallback((file: FileInfo) => {
    setFileToDelete(file);
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!fileToDelete) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Implement actual delete API call
      // const response = await fetch(`/api/announcements/files/${encodeURIComponent(fileToDelete.path)}`, {
      //   method: 'DELETE',
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Delete failed');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from files list
      setFiles(prevFiles => prevFiles.filter(f => f.path !== fileToDelete.path));
      setFileToDelete(null);
      setSuccess('File deleted successfully!');
    } catch (err) {
      setError('Failed to delete file. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fileToDelete]);

  // Load files for the selected section
  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    setError('');
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/announcements/files?section=${selectedSection}`);
      // if (!response.ok) throw new Error('Failed to load files');
      // const data = await response.json();
      // setFiles(data.files || []);
      
      // Mock data for now
      setFiles([
        {
          name: 'example.pdf',
          path: '/uploads/example.pdf',
          size: 1024 * 1024, // 1MB
          type: 'application/pdf',
          section: selectedSection,
          lastModified: Date.now() - 86400000, // 1 day ago
        },
      ]);
    } catch (err) {
      setError('Failed to load files. Please try again.');
      console.error('Load files error:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [selectedSection]);

  // Load files when component mounts or section changes
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Get the display name for the selected section
  const selectedSectionLabel = SECTIONS.find(s => s.value === selectedSection)?.label || selectedSection;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Announcement</h2>
      
      {/* Section Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SECTIONS.map((section) => (
            <div
              key={section.value}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                selectedSection === section.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              }`}
              onClick={() => setSelectedSection(section.value)}
            >
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    checked={selectedSection === section.value}
                    readOnly
                  />
                </div>
                <div className="ml-3 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {section.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload New File</h3>
        
        <div 
          className={`mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-md transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <div className="flex text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium focus-within:outline-none"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileInputChange}
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  ref={fileInputRef}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {ALLOWED_FILE_TYPES.map(ext => ext.split('/')[1]).join(', ').toUpperCase()} up to {formatFileSize(MAX_FILE_SIZE)}
            </p>
            
            {selectedFile && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-800">
                <p className="text-sm font-medium text-gray-900 dark:text-green-100">{selectedFile.name}</p>
                <p className="text-xs text-gray-600 dark:text-green-200">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Uploading...
              </>
            ) : (
              <>
                <FiUpload className="-ml-1 mr-2 h-5 w-5 text-white" />
                Upload File
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-200">{success}</p>
          </div>
        )}
      </div>

      {/* File List Section */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {selectedSectionLabel} Files
            {isLoadingFiles && (
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            )}
          </h3>
        </div>
        
        {isLoadingFiles ? (
          <div className="flex justify-center items-center p-8">
            <FiLoader className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : files.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No files uploaded yet.</p>
          </div>
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file) => (
                <li key={file.path} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </div>
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {file.type.split('/')[1].toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(file)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        disabled={isLoading}
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                  <FiAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Delete file
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete <span className="font-medium">{fileToDelete.name}</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setFileToDelete(null)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
