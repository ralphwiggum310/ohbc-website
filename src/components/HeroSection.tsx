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
  bgGradient = 'from-gray-200 to-gray-300',
  textColor = 'text-gray-900',
  className = '',
  backgroundImage,
  children,
}) => {
  const hasBackgroundImage = !!backgroundImage;
  const isWhiteText = textColor === 'text-white' || hasBackgroundImage;
  const textColorClass = isWhiteText ? 'text-white' : textColor;
  const subtitleColorClass = isWhiteText ? 'text-gray-200' : 'text-gray-700';
  
  // Extract the image path from url() if it exists
  const getImagePath = (imgPath: string): string => {
    if (!imgPath) return '';
    // Handle url('/path/to/image.jpg') format
    const urlMatch = imgPath.match(/url\(['"]?(.*?)['"]?\)/);
    return urlMatch ? urlMatch[1] : imgPath;
  };

  // Determine the container classes
  const containerClasses = [
    'relative w-full',
    hasBackgroundImage ? 'h-[30vh]' : '', // Reduced height from 50vh to 30vh
    className // Allow custom classes to be passed in
  ].filter(Boolean).join(' ');

  // Determine the content container classes
  const contentClasses = [
    'relative z-10 w-full h-full',
    'flex items-center',
    hasBackgroundImage ? 'h-[30vh] py-4' : 'py-8 md:py-12', // Reduced height and padding
    !hasBackgroundImage ? `bg-gradient-to-r ${bgGradient}` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
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
            <h1 className={`text-3xl sm:text-4xl font-bold ${textColorClass} mb-3 sm:mb-4`}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={`text-lg sm:text-xl ${subtitleColorClass} max-w-4xl mx-auto leading-relaxed`}>
              {subtitle}
            </p>
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
