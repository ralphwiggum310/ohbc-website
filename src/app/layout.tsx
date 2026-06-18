import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import ClientWrapper from './components/ClientWrapper';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Orchard Hills Bible Church',
  description: 'Welcome to Orchard Hills Bible Church — A place to belong, believe, and become who God created you to be.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OHBC',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#5c1a1a',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
