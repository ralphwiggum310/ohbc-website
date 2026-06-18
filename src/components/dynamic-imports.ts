import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import heavy components to reduce initial bundle size
export const AnimatedHero = dynamic(() => import('@/components/AnimatedHero'), {
  loading: () => React.createElement('div', {
    className: 'w-full h-96 bg-gray-200 animate-pulse flex items-center justify-center'
  }, React.createElement('div', { className: 'text-gray-500' }, 'Loading...')),
  ssr: false
});

export const BibleVersePopup = dynamic(() => import('@/components/BibleVersePopup'), {
  loading: () => React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  }, React.createElement('div', { className: 'bg-white p-6 rounded-lg animate-pulse' }, 
    React.createElement('div', { className: 'text-gray-500' }, 'Loading Bible verse...'))),
  ssr: false
});

export const CustomAudioPlayer = dynamic(() => import('@/components/CustomAudioPlayer'), {
  loading: () => React.createElement('div', {
    className: 'w-full h-16 bg-gray-200 animate-pulse rounded'
  }),
  ssr: false
});

export const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  loading: () => React.createElement('div', {
    className: 'w-full h-96 bg-gray-200 animate-pulse flex items-center justify-center'
  }, React.createElement('div', { className: 'text-gray-500' }, 'Loading PDF...')),
  ssr: false
});

export const SoundCloudPlayer = dynamic(() => import('@/components/SoundCloudPlayer'), {
  loading: () => React.createElement('div', {
    className: 'w-full h-32 bg-gray-200 animate-pulse rounded'
  }),
  ssr: false
});

export const VideoPlayerModal = dynamic(() => import('@/components/VideoPlayerModal'), {
  loading: () => React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
  }, React.createElement('div', { className: 'bg-gray-200 animate-pulse w-96 h-64 rounded' })),
  ssr: false
});
