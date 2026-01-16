'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import HeroSection from '@/components/HeroSection';
import DonationForm from '@/components/DonationForm';

// Type declarations
declare global {
  interface ConnectionInfo {
    effectiveType?: string;
    saveData?: boolean;
  }

  interface Window {
    gtag?: (event: string, action: string, params: Record<string, unknown>) => void;
    Connection?: {
      effectiveType?: string;
      saveData?: boolean;
    };
  }

  interface Navigator {
    connection?: ConnectionInfo;
  }
}

const ZEFFY_FORM_URL = 'https://www.zeffy.com/en-US/donation-form/gifts-and-offerings';
const ZEFFY_EMBED_URL = 'https://www.zeffy.com/embed/donation-form/gifts-and-offerings';
const MAX_RETRIES = 3;

// Domains that need to be preconnected for Zeffy and related services
const ZEFFY_DOMAINS = [
  'www.zeffy.com',
  'www.google-analytics.com',
  'www.googletagmanager.com',
  'js.stripe.com',
  'm.stripe.com',
  'api.stripe.com',
  'checkout.stripe.com',
];

const GivePage = () => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [iframeSrc, setIframeSrc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Check if the viewport is mobile-sized
  const checkIfMobile = useCallback((width: number): boolean => {
    return width < 768;
  }, []);
  
  // Update mobile state on mount and window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsClient(true);

    // Set initial iframe source with parameters
    const params = new URLSearchParams();
    params.append('embed', 'true');
    params.append('form', 'gifts-and-offerings');
    params.append('t', Date.now().toString());
    
    // Add device info
    params.append('isMobile', String(isMobile));
    params.append('isTablet', String(!isMobile && window.innerWidth <= 1024));
    
    setIframeSrc(`${ZEFFY_EMBED_URL}?${params.toString()}`);

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isClient, isMobile]);

  // Generate iframe URL with parameters
  const getIframeUrl = useCallback((): string => {
    const params = new URLSearchParams();
    
    // Get connection info if available
    const connection = (navigator as any)?.connection as ConnectionInfo | undefined;

    // Standard parameters
    params.append('embed', 'true');
    params.append('hideTitle', 'true');
    params.append('form', 'gifts-and-offerings');
    params.append('t', Date.now().toString());

    if (typeof window !== 'undefined') {
      // Device info
      params.append('isMobile', String(isMobile));
      params.append('isTablet', String(!isMobile && window.innerWidth <= 1024));

      // Connection info
      if (connection) {
        if (connection.saveData) params.append('saveData', 'true');
        if (connection.effectiveType) {
          params.append('effectiveType', connection.effectiveType);
        }
      }

      // Performance optimizations
      params.append('lazy', 'true');
      params.append('optimizeForMobile', String(isMobile));
      params.append('fastLoad', 'true');
      params.append('minimalUI', 'true');

      // Accessibility
      params.append('noAriaHidden', 'true');
      params.append('noAriaLive', 'true');
      params.append('noAriaModal', 'true');
    }

    return `${ZEFFY_EMBED_URL}?${params.toString()}`;
  }, [isMobile]);

  // Handle loading the iframe
  const handleLoadIframe = useCallback(() => {
    setIsIframeLoaded(true);
    setIsLoading(false);
    setHasError(false);

    // Track successful load in analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'iframe_loaded', {
        event_category: 'engagement',
        event_label: 'Zeffy Donation Form Loaded'
      });
    }
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);

    // Track error in analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'iframe_error', {
        event_category: 'error',
        event_label: 'Zeffy Donation Form Failed to Load',
        value: retryCount + 1
      });
    }
  }, [retryCount]);

  // Handle retry loading the iframe
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) return;

    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);

    // Force a fresh URL to prevent caching issues
    const newUrl = getIframeUrl();
    setIframeSrc(newUrl);
  }, [getIframeUrl, retryCount]);

  // Handle showing the form
  const handleShowForm = useCallback(() => {
    setShowForm(true);
    setIsLoading(true);

    // Set the iframe source when showing the form
    const url = getIframeUrl();
    setIframeSrc(url);
  }, [getIframeUrl]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Load the iframe when it becomes visible
  useEffect(() => {
    if (isVisible && !iframeSrc) {
      const url = getIframeUrl();
      setIframeSrc(url);
    }
  }, [isVisible, iframeSrc, getIframeUrl]);

  // Set up loading timeout
  useEffect(() => {
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        if (!isIframeLoaded) {
          handleIframeError();
        }
      }, 10000); // 10 second timeout
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, isIframeLoaded, handleIframeError]);

  // Add resource hints for performance
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const links: Array<{ rel: string; href: string; crossOrigin?: string }> = [];

    ZEFFY_DOMAINS.forEach(domain => {
      links.push({ rel: 'preconnect', href: `https://${domain}` });
      links.push({ rel: 'dns-prefetch', href: `//${domain}` });
    });

    // Add Stripe preconnect
    links.push({
      rel: 'preconnect',
      href: 'https://m.stripe.com',
      crossOrigin: 'anonymous'
    });

    // Add Google Analytics preconnect
    links.push({
      rel: 'preconnect',
      href: 'https://www.google-analytics.com',
      crossOrigin: 'anonymous'
    });

    // Add styles for the iframe container
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .donation-iframe-container {
        position: relative;
        width: 100%;
        min-height: 800px;
        border: none;
        overflow: hidden;
      }
      
      .donation-iframe {
        width: 100%;
        height: 100%;
        border: none;
        min-height: 800px;
      }
      
      .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    `;

    links.forEach(link => {
      const linkElement = document.createElement('link');
      linkElement.rel = link.rel;
      linkElement.href = link.href;
      if (link.crossOrigin) {
        linkElement.crossOrigin = link.crossOrigin;
      }
      document.head.appendChild(linkElement);
    });

    document.head.appendChild(styleElement);

    return () => {
      links.forEach(link => {
        const linkElement = document.querySelector(`link[rel="${link.rel}"][href="${link.href}"]`);
        if (linkElement) {
          document.head.removeChild(linkElement);
        }
      });

      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donation form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection 
        title="Support Our Ministry"
        subtitle="Your generous donation helps us continue our mission"
        className="bg-gradient-to-r from-blue-700 to-blue-900 text-white"
      >
        <div className="mt-6"></div>
      </HeroSection>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Online Giving</h2>
              <p className="text-gray-600 text-center mb-8">
                Make a secure one-time or recurring donation using our online form.
              </p>
              <div className="mt-6">
                <DonationForm />
              </div>
            </div>
            
            <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Your Generosity Makes a Difference</h3>
              <p className="text-blue-700 mb-4">
                Thank you for supporting our ministry. Your gifts help us fulfill our mission to share the Gospel and serve our community.
              </p>
              <p className="text-sm text-blue-600">
                All donations are tax-deductible as allowed by law. A receipt will be provided for your records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GivePage;
