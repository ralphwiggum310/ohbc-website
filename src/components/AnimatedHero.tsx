'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence, Variants, Transition } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface AnimatedHeroProps {
  logoPath: string;
  backgroundImage: string;
  mobileBackgroundImage?: string;
  title?: string; // Made optional
  subtitle: string;
}

const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  logoPath,
  backgroundImage,
  mobileBackgroundImage,
  title,
  subtitle,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Use mobile image if provided and on mobile, otherwise use the default backgroundImage
  const currentBackgroundImage = isMobile && mobileBackgroundImage 
    ? mobileBackgroundImage 
    : backgroundImage;

  // Debug logging
  React.useEffect(() => {
    console.log('Current device type:', isMobile ? 'Mobile' : 'Desktop');
    console.log('Using image:', currentBackgroundImage);
  }, [isMobile, currentBackgroundImage]);

  const [animationState, setAnimationState] = useState<'initial' | 'logoMoving' | 'contentVisible'>('initial');
  const controls = useAnimation();

  // Initial animation sequence
  useEffect(() => {
    let isMounted = true;
    
    const sequence = async () => {
      if (!isMounted) return;
      
      try {
        // Start with the logo large in the center
        await controls.start('initial');
        
        // After 1 second, start the scale down and fade out animation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!isMounted) return;
        
        // Combine scale down and fade out into one smooth animation
        setAnimationState('logoMoving');
        await controls.start('logoMoving');
        
        if (!isMounted) return;
        setAnimationState('contentVisible');
      } catch (error) {
        console.error('Animation error:', error);
      }
    };

    sequence();
    
    return () => {
      isMounted = false;
      controls.stop();
    };
  }, [controls]);

  // Animation variants with proper TypeScript types
  const logoVariants: Variants = {
    initial: {
      scale: 1.8,
      x: '0%',
      y: 0,
      opacity: 1,
      transition: {
        scale: {
          duration: 1.5,  // Increased from 1.0 to 1.5 seconds
          ease: [0.22, 1, 0.36, 1]
        },
        opacity: {
          duration: 1.5,  // Increased from 1.0 to 1.5 seconds
          ease: "easeInOut"
        }
      } as Transition
    },
    logoMoving: {
      scale: 0.5,
      x: '0%',
      y: 0,
      opacity: 0,
      transition: {
        scale: {
          duration: 1.5,  // Increased from 1.0 to 1.5 seconds
          ease: [0.22, 1, 0.36, 1]
        },
        opacity: {
          duration: 1.5,  // Increased from 1.0 to 1.5 seconds
          ease: "easeInOut"
        }
      } as Transition
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      } as Transition
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      } as Transition
    }
  };

  const leftTextVariants: Variants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      } as Transition
    }
  };

  const rightTextVariants: Variants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      } as Transition
    }
  };

  return (
    <div className="relative w-full min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] overflow-hidden bg-gray-900">
      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          {/* Mobile Image */}
          <div className="md:hidden w-full h-full">
            <Image
              src={mobileBackgroundImage || backgroundImage}
              alt=""
              fill
              className="object-cover object-center scale-110"
              priority
              quality={75}
              sizes="100vw"
            />
          </div>
          
          {/* Desktop Image */}
          <div className="hidden md:block w-full h-full">
            <Image
              src={backgroundImage}
              alt=""
              fill
              className="object-cover object-top scale-110"
              priority
              quality={75}
              sizes="100vw"
            />
          </div>
          
          <div className="absolute inset-0 bg-black/40 md:bg-black/30"></div>
        </div>
      </div>

      {/* Animated Logo - Centered with welcome text */}
      <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
        <motion.div
          className="w-full max-w-[250px] h-auto sm:max-w-[300px] md:max-w-[350px]"
          initial="initial"
          animate={controls}
          variants={logoVariants}
        >
          <div className="relative w-full h-full">
            <Image
              src={logoPath}
              alt="Orchard Hills Bible Church"
              width={350}
              height={175}
              className="w-full h-auto object-contain"
              priority
              sizes="(max-width: 640px) 250px, (max-width: 1024px) 300px, 350px"
            />
          </div>
        </motion.div>
      </div>

      {/* Hero Content */}
      <AnimatePresence>
        {animationState === 'contentVisible' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-start pt-8 sm:pt-12 md:pt-16 text-center px-4 z-10"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
            style={{ marginTop: '5vh' }}
          >
            <motion.div className="w-full max-w-5xl mx-auto px-4">
              {title && (
                <motion.div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12">
                  <motion.h1 
                    className="text-3xl sm:text-5xl md:text-7xl font-bold text-white drop-shadow-lg"
                    variants={leftTextVariants}
                  >
                    {title.split(' ').slice(0, 2).join(' ')}
                  </motion.h1>
                  <motion.h1 
                    className="text-3xl sm:text-5xl md:text-7xl font-bold text-white drop-shadow-lg"
                    variants={rightTextVariants}
                  >
                    {title.split(' ').slice(2).join(' ')}
                  </motion.h1>
                </motion.div>
              )}
              
              <motion.p 
                className="text-base sm:text-xl md:text-2xl font-medium text-white mb-3 sm:mb-4 drop-shadow-lg max-w-2xl mx-auto leading-relaxed px-2 sm:px-4"
                initial="hidden"
                animate="visible"
                variants={itemVariants}
              >
                {subtitle}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Times (positioned at bottom) */}
      <AnimatePresence>
        {animationState === 'contentVisible' && (
          <motion.div 
            className="absolute bottom-4 sm:bottom-8 left-0 right-0 z-10 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 max-w-xs sm:max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2 drop-shadow-md">Service Times</h3>
              <div className="space-y-1 sm:space-y-2 text-sm sm:text-base text-white drop-shadow-md">
                <div className="flex justify-between">
                  <span>Sunday School</span>
                  <span className="font-medium ml-4">9:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday Service</span>
                  <span className="font-medium ml-4">10:45 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Wednesday Study</span>
                  <span className="font-medium ml-4">7:00 PM</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedHero;
