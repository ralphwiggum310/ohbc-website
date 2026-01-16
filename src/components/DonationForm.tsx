'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiExternalLink, FiAlertCircle, FiLoader, FiArrowRight } from 'react-icons/fi';

// Add type declarations for window.gtag
declare global {
  interface Window {
    gtag?: (event: string, action: string, params: Record<string, unknown>) => void;
  }
}

const ZEFFY_FORM_URL = 'https://www.zeffy.com/en-US/donation-form/gifts-and-offerings';
const ZEFFY_EMBED_URL = 'https://www.zeffy.com/embed/donation-form/gifts-and-offerings';

interface ConnectionInfo {
  effectiveType?: string;
  saveData?: boolean;
}

interface Window {
  gtag?: (event: string, action: string, params: Record<string, unknown>) => void;
}

const DonationForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle direct redirect for mobile or if iframe fails
  const handleDirectRedirect = useCallback(() => {
    setIsRedirecting(true);
    window.open(ZEFFY_FORM_URL, '_blank');
  }, []);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setIsIframeLoaded(true);
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // On mobile or if iframe previously failed, redirect directly
    if (isMobile || hasError) {
      handleDirectRedirect();
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
  }, [isMobile, hasError, handleDirectRedirect]);

  // Generate iframe URL with parameters
  const getIframeUrl = useCallback((): string => {
    const params = new URLSearchParams();
    const connection = (navigator as any)?.connection as ConnectionInfo | undefined;
    
    // Standard parameters
    params.append('embed', 'true');
    params.append('hideTitle', 'true');
    params.append('noHeader', 'true');
    params.append('t', Date.now().toString());
    
    // Device info
    params.append('isMobile', String(isMobile));
    params.append('viewportWidth', String(window.innerWidth));
    
    // Connection info
    if (connection) {
      if (connection.saveData) params.append('saveData', 'true');
      if (connection.effectiveType) {
        params.append('effectiveType', connection.effectiveType);
      }
    }
    
    return `${ZEFFY_EMBED_URL}?${params.toString()}`;
  }, [isMobile]);

  // If redirecting, show loading state
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FiLoader className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-lg font-medium">Redirecting to secure donation form...</p>
        <p className="text-gray-600 mt-2">If you're not redirected automatically, 
          <a 
            href={ZEFFY_FORM_URL} 
            className="text-blue-600 hover:underline ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            click here to continue
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!isLoading && !hasError && !isIframeLoaded && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Make a Donation</h2>
          <p className="text-gray-600 mb-6">
            Your generous gift helps support our church's mission and ministries.
          </p>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center mx-auto"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                Donate Now
                <FiArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <FiLoader className="animate-spin text-blue-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading secure donation form...</p>
        </div>
      )}

      {hasError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                We're having trouble loading the secure donation form. Please try again or use the direct link below.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleDirectRedirect}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Open Donation Form in New Tab
                  <FiExternalLink className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMobile && !hasError && (
        <div className={`w-full ${!isIframeLoaded ? 'hidden' : ''}`}>
          <iframe
            ref={iframeRef}
            src={getIframeUrl()}
            className="w-full min-h-[800px] border-0"
            title="Donation Form"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            allow="payment"
          />
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>All donations are securely processed by our payment processor.</p>
        <p className="mt-1">For any questions, please contact the church office.</p>
      </div>
    </div>
  );
};

export default DonationForm;
