'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiCheckCircle, FiAlertCircle, FiLoader, FiTrash2, FiX } from 'react-icons/fi';

type FileInfo = {
  name: string;
  path: string;
  size: number;
  section: string;
  lastModified: number;
};

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const sections = [
    { value: 'general', label: 'General' },
    { value: 'quarterly', label: 'Quarterly & Weekly' },
    { value: 'sunday-bulletins', label: 'Sunday bulletins' },
  ];
  const [selectedSection, setSelectedSection] = useState(sections[0].value);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a PDF, JPG, PNG, or GIF file.');
        return;
      }
      
      // Check file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File is too large. Maximum size is 10MB.');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError(`File is too large. Maximum size is 10MB.`);
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a PDF, JPG, PNG, or GIF file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('section', selectedSection);

    setUploadStatus('uploading');
    setError('');
    setIsLoading(true);

    console.log('Starting file upload...', {
      file: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      section: selectedSection
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Upload failed:', response.status, data);
        throw new Error(data.message || response.statusText || 'Upload failed');
      }

      console.log('Upload successful:', data);
      handleUploadSuccess();
      
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(errorMessage);
      setUploadStatus('error');
      
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setError('');
        setUploadStatus('idle');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Fetch files for the current section
  const fetchFiles = async (sectionName: string) => {
    try {
      setIsLoadingFiles(true);
      const response = await fetch(`/api/list-files?section=${sectionName}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Delete a file
  const handleDeleteFile = async (file: FileInfo) => {
    try {
      setIsLoading(true);
      // Normalize section name (replace hyphens with underscores)
      const normalizedSection = file.section.replace(/-/g, '_');
      
      const response = await fetch(`/api/delete-file?path=${encodeURIComponent(file.path)}&section=${normalizedSection}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to delete file');
      }

      // Refresh the file list
      await fetchFiles(selectedSection);
      setFileToDelete(null);
      setUploadStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      setUploadStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSection = e.target.value as 'general' | 'sunday-bulletins' | 'quarterly';
    setSelectedSection(newSection);
    fetchFiles(newSection);
  };

  // Load files when section changes
  useEffect(() => {
    fetchFiles(selectedSection);
  }, [selectedSection]);

  // Handle successful upload
  const handleUploadSuccess = () => {
    fetchFiles(selectedSection);
    setUploadStatus('success');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setUploadStatus('idle');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements Upload</h1>
            <p className="text-gray-600">Upload new announcements to the website</p>
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
              <p className="font-medium">Supported file types: PDF, JPG, PNG, GIF</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Announcement Type
              </label>
              <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {sections.map(({ value, label }) => (
                  <div
                    key={value}
                    className={`border rounded-md p-4 cursor-pointer transition-colors ${
                      selectedSection === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedSection(value as 'general' | 'quarterly' | 'sunday-bulletins')}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload File
              </label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  <div className="flex flex-col items-center justify-center text-sm text-gray-600">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-blue-600 hover:text-blue-500">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          accept=".pdf,.jpg,.jpeg,.png,.gif"
                        />
                      </label>
                    </div>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  {selectedFile ? (
                    <div className="mt-2 p-3 bg-green-50 rounded-md">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Drag and drop a file here, or click to select
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {uploadStatus === 'success' && (
                  <div className="flex items-center text-green-600">
                    <FiCheckCircle className="h-5 w-5 mr-2" />
                    <span>Operation completed successfully!</span>
                  </div>
                )}
                {uploadStatus === 'error' && error && (
                  <div className="flex items-center text-red-600">
                    <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="break-words max-w-md">{error}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedFile || isLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  !selectedFile || isLoading
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="-ml-1 mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </button>
            </div>

            {/* File List */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {sections.find(s => s.value === selectedSection)?.label || selectedSection} Announcements
                {isLoadingFiles && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
              </h3>
              
              {!isLoadingFiles && files.length === 0 ? (
                <p className="text-gray-500 text-sm">No files uploaded yet.</p>
              ) : (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {files.map((file) => (
                    <li key={file.path} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">
                          {file.name}
                        </span>
                        <span className="ml-2 flex-shrink-0 text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setFileToDelete(file)}
                          className="font-medium text-red-600 hover:text-red-500"
                          disabled={isLoading}
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Delete Confirmation Modal */}
            {fileToDelete && (
              <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                  <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <FiAlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Delete File
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete <span className="font-medium">{fileToDelete.name}</span>? This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                        onClick={() => handleDeleteFile(fileToDelete)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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
          </form>
        </div>
      </div>
    </div>
  );
}
