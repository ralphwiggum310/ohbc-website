'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // You can add any client-side logic here
  }, [pathname, searchParams]);

  return <Component {...pageProps} />;
}
