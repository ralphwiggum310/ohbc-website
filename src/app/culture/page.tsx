'use client';

import React, { useState } from 'react';
import BibleVersePopup from '@/components/BibleVersePopup';

// Define the structure for culture statements
interface CultureStatement {
  title: string;
  content: string;
  verses: string;
}

// Update this array with the actual content from 2025_OHBC Culture Statements.docx
const cultureStatements: CultureStatement[] = [
  {
    title: 'Real Relationship',
    content: '⦁ We pursue God because relationship with Him is more than a theory. Our love for God is expressed in personal relationship with Him as we have been changed by His grace. We walk by faith and not by sight, leading us into a pursuit of holiness as we seek to please God in all respects. Christ is to have first place in all areas of our lives.',
    verses: 'Mark 10:23-31, 2 Cor 6:14-18, Phil 3:7-11, Col 1:15-18, Heb 12:1-17, 1 Jn 1:5-2:6'
  },
  {
    title: 'Missional Priorities',
    content: '⦁ We are on mission because Christ has made us His servants. Our responsibility to God in the world is to fulfill the Great Commission by intentionally proclaiming the gospel in our community. Our responsibility to God in the church is to love one another with Christ\'s love by intentionally counting each other as more important than ourselves. We must stay alert because the days for this service are numbered.',
    verses: 'Matt 28:16-20, Luke 12:35-38, John 9:4, 13:34-35, Eph 4:11-16, Phil 2:3-11'
  },
  {
    title: 'Biblical Authority',
    content: '⦁ We are governed by the Bible because God\'s ways are higher than ours. Our dependence on Scripture is rooted in the belief that the Bible is authoritative and sufficient to direct the affairs of our lives and reveal His purposes for us as we humbly submit to Him in all things. This conviction is particularly revealed in our commitment to sound hermeneutics, expository preaching, biblical counseling, and complementary gender roles.',
    verses: 'Rom 15:13-14, 1 Cor 11:3, 1 Tim 2:9-15, 2 Tim 3:16-17, 4:1-5'
  },
  {
    title: 'Authentic Unity',
    content: '⦁ We welcome biblical variety in the church because unity is better than uniformity. Our experience in the body of Christ is defined by great harmony amidst great differences. There are diverse gifts, personalities, and ministries in the church, along with seasons of sanctifying change. Instead of stifling this variety out of fear, we treasure it and guard it as we practice biblical tolerance toward one another in love.',
    verses: 'Rom 12:3-10, 1 Cor 12:4-7, Eph 4:1-6, 1 Pet 4:7-11'
  },
  {
    title: 'Loving Hospitality',
    content: '⦁ We show genuine interest in all who attend because no one should be lost in the crowd. Our worship environment prioritizes visibility, welcoming, and belonging, showing kindness and patience toward everyone. We want to meet people wherever they are in their spiritual walk, being open to any questions they may have about the Bible.',
    verses: 'Acts 17:17, 18:4, 19:8-9, 1 Cor 13:4-7, Phil 4:5, Heb 13:2'
  },
  {
    title: 'Devoted Youth',
    content: '⦁ We intentionally lead children because the next generation matters to God. Our ministry to youth seeks spiritual maturity as the goal for all, as children are vital to the unity of our church. Rooted in Scripture, we desire to partner with parents to instruct children in the fear and admonition of the Lord. Reverence for God, robust theology, and joyful fellowship are essential elements of growing by grace.',
    verses: 'Prov 13:22, 14:26, Matt 18:1-6, Eph 6:1-4'
  },

  // Add more culture statements here following the same structure
];

// Card component for each culture statement
const CultureCard = ({ 
  title, 
  content, 
  verses,
  isEven 
}: { 
  title: string; 
  content: string; 
  verses: string; 
  isEven: boolean;
}) => {
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);

  // Function to make verse references clickable
  const makeVersesClickable = (verseText: string) => {
    // Split the verses by commas and semicolons to handle multiple references
    const verseArray = verseText.split(/[,;]/).map(v => v.trim()).filter(Boolean);
    
    return verseArray.map((verse, index) => {
      // Add a comma or semicolon between verses
      const separator = index < verseArray.length - 1 ? 
        (verseText.includes(';') ? '; ' : ', ') : '';
      
      return (
        <React.Fragment key={index}>
          <span 
            className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
            onClick={() => setSelectedVerse(verse)}
          >
            {verse}
          </span>
          {separator}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={`p-6 rounded-lg shadow-md mb-8 transition-all duration-300 transform hover:scale-[1.01] ${
      isEven 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg' 
        : 'bg-gradient-to-br from-gray-50 to-blue-50 hover:shadow-lg'
    }`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
      <p className="text-gray-700 mb-4 whitespace-pre-line">
        {content}
      </p>
      {verses && (
        <div className="text-sm text-gray-600 mt-4">
          <span className="font-semibold text-gray-800">Key References:</span>{' '}
          <span className="text-blue-600">
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

export default function CultureStatements() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Our Culture</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
            The values and principles that shape our church community
          </p>
        </div>
      </div>

      {/* Culture Statements Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Culture Statements</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These statements reflect who we are and how we seek to live out our faith together.
          </p>
          {cultureStatements[0]?.verses && (
            <p className="text-sm text-gray-500 mt-2">
              Click on any Bible reference to read the verse.
            </p>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          {cultureStatements.map((statement, index) => (
            <CultureCard
              key={index}
              title={statement.title}
              content={statement.content}
              verses={statement.verses}
              isEven={index % 2 === 0}
            />
          ))}
        </div>
      </div>
      
      {cultureStatements[0]?.verses && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 italic">
            (Scripture verses are representative, and not to be considered exhaustive.)
          </p>
        </div>
      )}
    </div>
  );
}
