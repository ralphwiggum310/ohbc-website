import React from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  title: string;
  subtitle?: string | React.ReactNode;
  bgGradient?: string;
  textColor?: string;
  className?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  bgGradient = 'from-gray-800 to-gray-900',
  textColor = 'text-white',
  className = '',
  backgroundImage,
  children,
}) => {
  const hasBackgroundImage = !!backgroundImage;
  const isWhiteText = textColor === 'text-white' || hasBackgroundImage;
  const textColorClass = isWhiteText ? 'text-white' : 'text-white dark:text-blue-100';
  const subtitleColorClass = isWhiteText ? 'text-gray-200' : 'text-gray-700 dark:text-blue-200';
  
  // Extract the image path from url() if it exists
  const getImagePath = (imgPath: string): string => {
    if (!imgPath) return '';
    // Handle url('/path/to/image.jpg') format
    const urlMatch = imgPath.match(/url\(['"]?(.*?)['"]?\)/);
    return urlMatch ? urlMatch[1] : imgPath;
  };

  // Filter out any background or text color related classes from the className prop
  const filteredClasses = className 
    ? className
        .split(' ')
        .filter(cls => ![
          'bg-', 'from-', 'to-', 'text-', 'dark:', '!', 
          'py-', 'sm:py-', 'md:py-', 'lg:py-', 'xl:py-',
          'px-', 'sm:px-', 'md:px-', 'lg:px-', 'xl:px-',
          'p-', 'sm:p-', 'md:p-', 'lg:p-', 'xl:p-',
          'm-', 'sm:m-', 'md:m-', 'lg:m-', 'xl:m-',
          'w-', 'h-', 'min-h-', 'max-h-', 'max-w-', 'min-w-'
        ].some(prefix => cls.startsWith(prefix)))
        .join(' ')
        .trim()
    : '';

  // Container classes - only include layout-related classes
  const containerClasses = [
    'relative w-full',
    filteredClasses
  ].filter(Boolean).join(' ');

  // Content classes - force dark gray background and white text
  const contentClasses = [
    'relative z-10 w-full',
    'flex items-center',
    hasBackgroundImage ? 'min-h-[30vh]' : 'py-6 sm:py-8',
    // Force dark gray background in both light and dark modes
    'bg-gray-900',
    // Ensure text is white
    'text-white'
  ].join(' ');

  // Inline style to force the dark gray background
  const containerStyle = {
    backgroundColor: '#111827', // This is the hex code for gray-900
    color: 'white',
    position: 'relative' as const,
    width: '100%'
  };

  return (
    <div className={containerClasses} style={containerStyle}>
      {hasBackgroundImage && (
        <div className="absolute inset-0 -z-10">
          <div className="relative w-full h-full">
            <Image
              src={getImagePath(backgroundImage)}
              alt=""
              fill
              className="object-cover"
              style={{
                objectPosition: 'center center',
              }}
              priority
              quality={85}
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        </div>
      )}
      
      <div className={contentClasses}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {title && (
            <h1 className={`text-2xl sm:text-3xl font-bold ${textColorClass} mb-2 sm:mb-3`}>
              {title}
            </h1>
          )}
          {subtitle && (
            <div className={`text-base sm:text-lg ${subtitleColorClass} max-w-4xl mx-auto leading-relaxed`}>
              {subtitle}
            </div>
          )}
          {children && (
            <div className="mt-4 sm:mt-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
