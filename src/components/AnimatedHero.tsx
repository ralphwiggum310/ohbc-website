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

  useEffect(() => {
    setIsMounted(true);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const animate = async () => {
      try {
        await controls.start('initial');
        await new Promise(resolve => setTimeout(resolve, 900));
        setAnimationState('logoMoving');
        await controls.start('logoMoving');
        setAnimationState('contentVisible');
      } catch {
        // component unmounted mid-animation
      }
    };

    const timer = setTimeout(animate, 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, [controls]);

  const logoVariants: Variants = {
    initial: {
      scale: 1.6,
      opacity: 1,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
    logoMoving: {
      scale: 0.4,
      opacity: 0,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Mobile: 45vh, tablet: 50vh, desktop: 55vh
  const heroHeight = isMobile ? '45vh' : '55vh';

  if (!isMounted) {
    return <div className="relative w-full bg-gray-800" style={{ height: '45vh' }} />;
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ height: heroHeight }}>
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={isMobile ? mobileBackgroundImage : backgroundImage}
          alt="Orchard Hills Bible Church"
          fill
          className="object-cover"
          priority
          quality={85}
          sizes="100vw"
          style={{ objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {/* Animated logo intro */}
          {animationState !== 'contentVisible' && (
            <motion.div
              key="logo"
              className="relative"
              style={{ width: isMobile ? 140 : 200, height: isMobile ? 140 : 200 }}
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

          {/* Main content after animation */}
          {animationState === 'contentVisible' && (
            <motion.div
              key="content"
              className="w-full max-w-3xl mx-auto text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {title && (
                <motion.h1
                  className="text-3xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-3"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  {title}
                </motion.h1>
              )}

              <motion.p
                className="text-base sm:text-2xl md:text-3xl font-medium text-white/95 leading-snug drop-shadow mb-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                {subtitle}
              </motion.p>

              {/* Service times */}
              <motion.div
                className="inline-block text-left bg-black/30 backdrop-blur-sm rounded-xl px-5 py-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                <h3 className="text-xs sm:text-sm font-bold text-white/80 uppercase tracking-wider mb-2">
                  Service Times
                </h3>
                <div className="space-y-1.5 text-sm sm:text-base text-white">
                  <div className="flex justify-between gap-8">
                    <span>Sunday School</span>
                    <span className="font-semibold">9:30 AM</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span>Sunday Service</span>
                    <span className="font-semibold">10:45 AM</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span>Wed. Bible Study</span>
                    <span className="font-semibold">7:00 PM</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedHero;
