'use client';

import { useState } from 'react';

interface CSVPreview {
  headers: string[];
  sampleData: any[];
  totalRows: number;
}

interface ColumnMapping {
  [key: string]: string;
}

export default function DirectoryImport() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setError('');
      setSuccess('');
    }
  };

  const analyzeCSV = async () => {
    if (!csvFile) return;

    setImporting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);

      const response = await fetch('/api/admin/directory/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPreview(result);
        // Auto-map common columns
        const autoMapping: ColumnMapping = {};
        result.headers.forEach((header: string) => {
          const lowerHeader = header.toLowerCase();
          
          if (lowerHeader.includes('first') || lowerHeader.includes('fname') || lowerHeader.includes('given')) {
            autoMapping.first_name = header;
          } else if (lowerHeader.includes('last') || lowerHeader.includes('lname') || lowerHeader.includes('surname') || lowerHeader.includes('family')) {
            autoMapping.last_name = header;
          } else if (lowerHeader.includes('email')) {
            autoMapping.primary_email = header;
          } else if (lowerHeader.includes('phone') || lowerHeader.includes('telephone')) {
            autoMapping.mobile_phone = header;
          } else if (lowerHeader.includes('address') || lowerHeader.includes('street')) {
            autoMapping.address_street = header;
          } else if (lowerHeader.includes('city')) {
            autoMapping.address_city = header;
          } else if (lowerHeader.includes('state')) {
            autoMapping.address_state = header;
          } else if (lowerHeader.includes('zip') || lowerHeader.includes('postal')) {
            autoMapping.address_zip = header;
          }
        });
        
        setColumnMapping(autoMapping);
        setSuccess('CSV file analyzed successfully! Please review the mapping below.');
      } else {
        setError(result.error || 'Failed to analyze CSV file');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleMappingChange = (dbField: string, csvHeader: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [dbField]: csvHeader
    }));
  };

  const getAvailableHeaders = () => {
    return preview?.headers || [];
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Import Directory Data from CSV
      </h3>
      
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-200 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Expected format: CSV with headers containing names, addresses, and contact information
        </p>
      </div>

      {csvFile && (
        <button
          onClick={analyzeCSV}
          disabled={importing}
          className="mb-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded"
        >
          {importing ? 'Analyzing...' : 'Analyze CSV'}
        </button>
      )}

      {/* Preview and Mapping */}
      {preview && (
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              CSV Analysis Results
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <p><strong>Total rows:</strong> {preview.totalRows}</p>
              <p><strong>Headers found:</strong> {preview.headers.join(', ')}</p>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Column Mapping
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Map your CSV columns to the database fields:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <select
                  value={columnMapping.first_name || ''}
                  onChange={(e) => handleMappingChange('first_name', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {getAvailableHeaders().map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <select
                  value={columnMapping.last_name || ''}
                  onChange={(e) => handleMappingChange('last_name', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {getAvailableHeaders().map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <select
                  value={columnMapping.primary_email || ''}
                  onChange={(e) => handleMappingChange('primary_email', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {getAvailableHeaders().map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <select
                  value={columnMapping.mobile_phone || ''}
                  onChange={(e) => handleMappingChange('mobile_phone', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {getAvailableHeaders().map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <select
                  value={columnMapping.address_street || ''}
                  onChange={(e) => handleMappingChange('address_street', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {getAvailableHeaders().map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <select
                  value={columnMapping.address_city || ''}
                  onChange={(e) => handleMappingChange('address_city', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {getAvailableHeaders().map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <select
                  value={columnMapping.address_state || ''}
                  onChange={(e) => handleMappingChange('address_state', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {getAvailableHeaders().map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ZIP Code
                </label>
                <select
                  value={columnMapping.address_zip || ''}
                  onChange={(e) => handleMappingChange('address_zip', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {getAvailableHeaders().map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sample Data Preview */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Sample Data (First 3 rows)
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {preview.headers.map((header, index) => (
                      <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {preview.sampleData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {preview.headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row[header] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
