'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ClientProviders to avoid Chrome extension conflicts
const ClientProviders = dynamic(() => import('./ClientProviders').then(mod => mod.default), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
