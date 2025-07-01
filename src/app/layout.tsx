import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { StripeProvider } from './providers';
import Navbar from './components/Navbar';

// Initialize the Inter font with the required subsets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Orchard Hills Bible Church',
  description: 'Welcome to Orchard Hills Bible Church - A place to belong, believe, and become who God created you to be.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans bg-gray-50">
        <StripeProvider>
          <Navbar />
          <main>{children}</main>
        </StripeProvider>
      </body>
    </html>
  );
}
