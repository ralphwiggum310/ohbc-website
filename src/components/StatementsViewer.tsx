'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface Statement {
  title: string;
  content: string;
  verses: string;
}

interface StatementsViewerProps {
  statements: Statement[];
  title: string;
  description: string;
}

export default function StatementsViewer({ statements, title, description }: StatementsViewerProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
      </div>
      
      <div className="space-y-4">
        {statements.map((statement, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleExpanded(index)}
              className="w-full px-6 py-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {statement.title}
                </h3>
                <div className="flex items-center space-x-2">
                  {expandedItems.has(index) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </button>
            
            {expandedItems.has(index) && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div 
                  className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: statement.content }}
                />
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-2">Reference Verses:</p>
                  <p>{statement.verses}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
