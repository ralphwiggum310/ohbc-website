'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [section, setSection] = useState('general');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('section', section);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage('File uploaded successfully!');
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New File</h3>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="general">General</option>
              <option value="sunday_bulletins">Bulletins</option>
            </select>
          </div>

          <div>
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              File
            </label>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
