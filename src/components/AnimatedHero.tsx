'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import Image from 'next/image';

interface AnimatedHeroProps {
  logoPath: string;
  backgroundImage: string;
  mobileBackgroundImage?: string;
  title?: string;
  subtitle: string;
}

const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  logoPath,
  backgroundImage,
  mobileBackgroundImage = backgroundImage,
  title,
  subtitle,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const controls = useAnimation();
  const [animationState, setAnimationState] = useState<'initial' | 'logoMoving' | 'contentVisible'>('initial');

  // Set up mobile detection and animation
  useEffect(() => {
    // Mark as mounted
    setIsMounted(true);
    
    // Set initial mobile state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Start animation sequence after mount
    const animate = async () => {
      try {
        await controls.start('initial');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnimationState('logoMoving');
        await controls.start('logoMoving');
        setAnimationState('contentVisible');
      } catch (error) {
        console.error('Animation error:', error);
      }
    };
    
    // Small delay to ensure component is mounted
    const timer = setTimeout(animate, 50);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, [controls]);

  // Animation variants
  const logoVariants: Variants = {
    initial: { 
      scale: 1.8, 
      opacity: 1,
      transition: { 
        duration: 1.5, 
        ease: [0.22, 1, 0.36, 1]
      }
    },
    logoMoving: { 
      scale: 0.5, 
      opacity: 0,
      transition: { 
        duration: 1.5, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut"
      }
    }
  };

  const leftTextVariants: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] as any,
        type: 'tween'
      }
    }
  };

  const rightTextVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] as any,
        delay: 0.2,
        type: 'tween'
      }
    }
  };

  // Calculate a fixed height based on viewport height
  const heroHeight = {
    base: '40vh',  // Increased from 30vh to provide more space on mobile
    sm: '45vh',
    md: '50vh'
  };

  // Server render - simple div with matching dimensions
  if (!isMounted) {
    return (
      <div 
        className="relative w-full bg-gray-100 dark:bg-gray-800"
        style={{ height: heroHeight.base }}
      />
    );
  }

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ height: isMobile ? heroHeight.base : window.innerWidth >= 768 ? heroHeight.md : heroHeight.sm }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative w-full h-full">
          <div className={`relative w-full h-full overflow-hidden ${isMobile ? 'scale-110' : ''}`}>
            <div className={`relative w-full h-full ${isMobile ? 'scale-95' : ''}`}>
              <Image
                src={isMobile ? mobileBackgroundImage : backgroundImage}
                alt="Church Building"
                fill
                className="object-cover"
                priority
                quality={100}
                sizes="100vw"
                style={{
                  objectPosition: 'center',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
      </div>

      {/* Content - Positioned higher on mobile */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-start pt-2 sm:pt-0 sm:justify-center items-center">
        <AnimatePresence mode="wait">
          {/* Logo Animation */}
          {animationState !== 'contentVisible' && (
            <motion.div
              key="logo"
              className="w-32 h-32 md:w-48 md:h-48 relative mb-8"
              initial="initial"
              animate={controls}
              variants={logoVariants}
              exit={{ opacity: 0 }}
            >
              <Image
                src={logoPath}
                alt="OHBC Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          )}

          {/* Content Animation */}
          {animationState === 'contentVisible' && (
            <motion.div
              key="content"
              className="w-full max-w-5xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center justify-start gap-0 sm:gap-2 pt-0 sm:pt-12 md:pt-16">
                {title && (
                  <motion.div 
                    className="text-center"
                    initial="hidden"
                    animate="visible"
                    variants={contentVariants}
                  >
                    <motion.h1 
                      className="text-2xl sm:text-5xl md:text-7xl font-bold text-white drop-shadow-lg"
                      variants={leftTextVariants}
                    >
                      {title.split(' ').slice(0, 2).join(' ')}
                    </motion.h1>
                    <motion.h1 
                      className="text-2xl sm:text-5xl md:text-7xl font-bold text-white drop-shadow-lg"
                      variants={rightTextVariants}
                    >
                      {title.split(' ').slice(2).join(' ')}
                    </motion.h1>
                  </motion.div>
                )}
                
                {/* Subtitle */}
                <motion.p 
                  className="text-base sm:text-3xl md:text-4xl font-medium text-white text-center max-w-4xl mx-auto leading-tight mt-1 sm:mt-6 text-shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {subtitle}
                </motion.p>

                {/* Service Times */}
                <motion.div 
                  className="bg-transparent max-w-xs sm:max-w-md mx-auto mt-6 sm:mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <h3 className="text-sm sm:text-lg font-bold text-white drop-shadow-md mb-2 sm:mb-3">
                    Service Times
                  </h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-base text-white drop-shadow-md">
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
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedHero;
