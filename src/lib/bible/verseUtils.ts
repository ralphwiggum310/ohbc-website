import React from 'react';

// Function to parse a verse reference string into individual references
export function parseVerseReferences(referenceString: string): string[] {
  if (!referenceString) return [];
  
  // Split by semicolon and trim each part
  return referenceString
    .split(';')
    .map(ref => ref.trim())
    .filter(ref => ref.length > 0);
}

// Function to check if a string looks like a Bible reference
export function isBibleReference(text: string): boolean {
  // Simple regex to match common Bible reference patterns
  const referenceRegex = /^[1-9]?[A-Za-z]+(?:\s+\d+)?(?:\s*[\:\,\-\.]\s*\d+)*$/;
  return referenceRegex.test(text.trim());
}

// Function to extract all verse references from text
export function extractVerseReferences(text: string): string[] {
  // This regex matches common Bible reference patterns
  const referenceRegex = /\b(?:[1-9]?[A-Za-z]+\s+\d+\s*[\:\,\-\.]\s*\d+\s*(?:[\-\–]\s*\d+\s*[\:\,\-\.]\s*\d+)*)/g;
  
  const matches = text.match(referenceRegex) || [];
  return matches.map(match => match.trim());
}

// Function to create a clickable verse reference component
export function createClickableVerse(
  reference: string, 
  onClick: (ref: string) => void,
  className: string = 'text-blue-600 hover:text-blue-800 underline cursor-pointer'
): React.ReactElement {
  return React.createElement(
    'span',
    {
      key: reference,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(reference);
      },
      className,
      title: `View ${reference}`
    },
    reference
  );
}

// Function to process text and make verse references clickable
export function processTextWithVerses(
  text: string, 
  onVerseClick: (ref: string) => void,
  className?: string
): (string | React.ReactElement)[] {
  // First, split by common verse reference patterns
  const parts = text.split(/(\b(?:[1-9]?[A-Za-z]+\s+\d+\s*[\:\,\-\.]\s*\d+\s*(?:[\-\–]\s*\d+\s*[\:\,\-\.]\s*\d+)*)\b)/g);
  
  return parts.map((part, index) => {
    // Check if this part looks like a verse reference
    if (isBibleReference(part)) {
      return createClickableVerse(part, onVerseClick, className);
    }
    return part;
  });
}
