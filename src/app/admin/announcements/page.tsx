'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Trash2, 
  Download, 
  FileText,
  Image,
  File,
  Folder,
  RefreshCw
} from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadPath: string;
  uploadDate: string;
  category: string;
}

type Category = 'general' | 'bulletins';

export default function ManageAnnouncements() {
  const [files, setFiles] = useState<Record<Category, UploadedFile[]>>({
    general: [],
    bulletins: []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('general');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles('general');
    fetchFiles('bulletins');
  }, []);

  const fetchFiles = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/files?category=${category}`);
      const data = await response.json();
      setFiles(prev => ({
        ...prev,
        [category]: data.files || []
      }));
    } catch (error) {
      console.error(`Error fetching ${category} files:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', selectedCategory);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        await fetchFiles(selectedCategory);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    if (files.length > 1) {
      alert('Please upload one file at a time');
      return;
    }

    const file = files[0];
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB');
      return;
    }

    await uploadFile(file);
  };

  const handleDelete = async (category: Category, filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/admin/upload?category=${category}&filename=${filename}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await fetchFiles(category);
      } else {
        alert(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryInfo = (category: Category) => {
    return category === 'general' 
      ? { title: 'General Announcements', description: 'General church announcements and documents' }
      : { title: 'Sunday Bulletins', description: 'Weekly Sunday service bulletins' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage announcement files and bulletins
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {(['general', 'bulletins'] as Category[]).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Folder className="inline-block w-4 h-4 mr-2" />
            {getCategoryInfo(category).title}
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload to {getCategoryInfo(selectedCategory).title}
          </CardTitle>
          <CardDescription>
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <div className="space-y-4">
              <div className="flex justify-center">
                {uploading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {uploading ? 'Uploading...' : isDragOver ? 'Drop file here' : 'Drag & drop file here'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  or click to browse
                </p>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{getCategoryInfo(selectedCategory).title}</CardTitle>
              <CardDescription>{getCategoryInfo(selectedCategory).description}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFiles(selectedCategory)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {files[selectedCategory].length === 0 ? (
            <div className="text-center py-12">
              <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No files uploaded yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload your first {selectedCategory === 'general' ? 'announcement' : 'bulletin'} to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {files[selectedCategory].map((file) => (
                <div key={file.name} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.uploadPath, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedCategory, file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
