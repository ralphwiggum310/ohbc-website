'use client';

import { StatsData } from './page';
import { FiRefreshCw, FiFileText, FiDatabase, FiClock, FiAlertCircle } from 'react-icons/fi';

interface StatsDisplayProps {
  initialData: StatsData | null;
  error: string | null;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  isLoading = false 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ className: string }>;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
  isLoading?: boolean;
}) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
    emerald: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
    purple: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
    amber: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
    rose: 'from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700',
    indigo: 'from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r ${colorMap[color]} shadow-md`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </dt>
            {isLoading ? (
              <div className="mt-2 h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            ) : (
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {value}
                </div>
              </dd>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'blue',
  showPercentage = true 
}: { 
  value: number; 
  max?: number;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
  showPercentage?: boolean;
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorMap = {
    blue: 'bg-blue-500 dark:bg-blue-600',
    emerald: 'bg-emerald-500 dark:bg-emerald-600',
    purple: 'bg-purple-500 dark:bg-purple-600',
    amber: 'bg-amber-500 dark:bg-amber-600',
    rose: 'bg-rose-500 dark:bg-rose-600',
    indigo: 'bg-indigo-500 dark:bg-indigo-600',
  };

  return (
    <div className="w-full flex items-center">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
        <div 
          className={`h-full ${colorMap[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showPercentage && (
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-12 text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export function StatsDisplay({ initialData, error, onRefresh, isLoading }: StatsDisplayProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading statistics</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !initialData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <StatCard 
            key={i}
            title="Loading..." 
            value="" 
            icon={FiFileText} 
            isLoading={true}
          />
        ))}
      </div>
    );
  }

  const { totalAnnouncements, totalSize, sections, lastUpdated } = initialData;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Announcements" 
          value={totalAnnouncements.toLocaleString()} 
          icon={FiFileText}
          color="blue"
        />
        
        <StatCard 
          title="Storage Used" 
          value={formatFileSize(totalSize)} 
          icon={FiDatabase}
          color="emerald"
        />
        
        <StatCard 
          title="Last Updated" 
          value={formatDate(lastUpdated)} 
          icon={FiClock}
          color="purple"
        />
      </div>

      {/* Storage Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storage by Section</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Breakdown of storage usage across different sections</p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Object.entries(sections).map(([section, data], index) => {
            const percentage = totalSize > 0 ? (data.size / totalSize) * 100 : 0;
            const colors = ['blue', 'emerald', 'purple', 'amber', 'rose', 'indigo'];
            const color = colors[index % colors.length] as 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
            
            return (
              <div key={section} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 capitalize">
                    {section.replace(/-/g, ' ')}
                  </h4>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {formatFileSize(data.size)}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 mr-3">
                    <ProgressBar 
                      value={data.size} 
                      max={totalSize} 
                      color={color}
                      showPercentage={false}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-12 text-right">
                    {Math.round(percentage)}%
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {data.count} {data.count === 1 ? 'item' : 'items'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Information</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Details about your installation</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Environment</h4>
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <div className="text-sm text-gray-900 dark:text-gray-200">Production</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Version 1.0.0
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Last Data Refresh</h4>
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <div className="text-sm text-gray-900 dark:text-gray-200">
                  {formatDate(lastUpdated)}
                </div>
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  {isLoading ? (
                    <FiRefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  ) : (
                    <FiRefreshCw className="-ml-1 mr-2 h-4 w-4" />
                  )}
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
