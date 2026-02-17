'use client';

import React, { useState } from 'react';
import BibleVersePopup from '../../components/BibleVersePopup';

interface Statement {
  title: string;
  content: string;
  verses: string;
}

interface StatementsViewerProps {
  statements: Statement[];
  title: string;
  description: string;
  showVerseReferences?: boolean;
}

const StatementCard = ({ 
  title, 
  content, 
  verses,
  isEven,
  showVerseReferences = true
}: { 
  title: string; 
  content: string; 
  verses: string; 
  isEven: boolean;
  showVerseReferences?: boolean;
}) => {
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);

  const makeVersesClickable = (verseText: string) => {
    // First, split by semicolons to handle different passages
    const passages = verseText.split(';').map(p => p.trim()).filter(Boolean);
    
    // Track the current book and chapter for abbreviated references
    let currentBook = '';
    let currentChapter = '';
    
    return passages.flatMap((passage, passageIndex) => {
      // For each passage, handle comma-separated verses
      const verseArray = passage.split(',').map(v => v.trim()).filter(Boolean);
      
      return verseArray.map((verse, verseIndex) => {
        // Handle 'and' at the beginning of the verse
        let cleanVerse = verse.replace(/^\s*and\s+/i, '').trim();
        
        // Try to extract book and chapter from the current verse
        const bookMatch = cleanVerse.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\d+))?/);
        
        if (bookMatch) {
          // If we found a book and chapter in this verse, update our current book/chapter
          currentBook = bookMatch[1];
          currentChapter = bookMatch[2];
        } 
        // Handle just chapter:verse (e.g., '8:34' after 'Romans 3:24')
        else if (/^\d+:\d+/.test(cleanVerse)) {
          if (currentBook) {
            cleanVerse = `${currentBook} ${cleanVerse}`;
            // Update current chapter for subsequent verses
            const chapterMatch = cleanVerse.match(/(\d+):/);
            if (chapterMatch) currentChapter = chapterMatch[1];
          }
        }
        // Handle just verse number (e.g., '14' after 'John 1:13')
        else if (/^\d+$/.test(cleanVerse)) {
          if (currentBook && currentChapter) {
            cleanVerse = `${currentBook} ${currentChapter}:${cleanVerse}`;
          }
        }
        // Handle verse ranges (e.g., '24-25' after 'Romans 3:')
        else if (/^\d+-\d+$/.test(cleanVerse)) {
          if (currentBook && currentChapter) {
            cleanVerse = `${currentBook} ${currentChapter}:${cleanVerse}`;
          }
        }
        
        // Normalize the verse reference
        const normalizedVerse = cleanVerse
          .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
          .replace(/(\d+)\s*:\s*(\d+)/g, '$1:$2') // Normalize verse references (e.g., '1:2' instead of '1 : 2')
          .replace(/([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+):(\d+)/, (_, book, chapter, verse) => {
            const normalized = `${book} ${chapter}:${verse}`;
            console.log('Normalized verse reference:', normalized);
            return normalized;
          }); // Ensure proper spacing in references
        
        const separator = passageIndex < passages.length - 1 || verseIndex < verseArray.length - 1 
          ? (verseText.includes(';') && verseIndex === verseArray.length - 1 ? '; ' : ', ') 
          : '';
        
        return (
          <React.Fragment key={`${passageIndex}-${verseIndex}`}>
            <span 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer hover:underline transition-colors"
              onClick={() => setSelectedVerse(normalizedVerse)}
            >
              {verse}
            </span>
            {separator}
          </React.Fragment>
        );
      });
    });
  };

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8 transition-all duration-300 transform hover:scale-[1.01] ${
      isEven 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg dark:from-blue-900/30 dark:to-indigo-900/30' 
        : 'bg-gradient-to-br from-gray-50 to-blue-50 hover:shadow-lg dark:from-gray-800/30 dark:to-blue-900/30'
    }`}>
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">{title}</h2>
      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed sm:leading-normal whitespace-pre-line">
        {content}
      </p>
      {showVerseReferences && verses && (
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3 sm:mt-4">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Key References:</span>{' '}
          <span className="text-blue-600 dark:text-blue-400">
            {makeVersesClickable(verses)}
          </span>
        </div>
      )}

      <BibleVersePopup 
        reference={selectedVerse || ''}
        onCloseAction={() => setSelectedVerse(null)}
        isOpen={!!selectedVerse}
      />
    </div>
  );
};

export const StatementsViewer: React.FC<StatementsViewerProps> = ({
  statements,
  title,
  description,
  showVerseReferences = true
}) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {description}
        </p>
        {showVerseReferences && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Click on any Bible reference to read the verse.
          </p>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        {statements.map((statement, index) => (
          <StatementCard
            key={index}
            title={statement.title}
            content={statement.content}
            verses={statement.verses}
            isEven={index % 2 === 0}
            showVerseReferences={showVerseReferences}
          />
        ))}
      </div>
      
      {showVerseReferences && (
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-t-2 border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            (Scripture verses are representative, and not to be considered exhaustive.)
          </p>
        </div>
      )}
    </div>
  );
};

export default StatementsViewer;
