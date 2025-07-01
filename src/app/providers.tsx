'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// Only load Stripe if the publishable key is available
let stripePromise: any = null;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey, {
    // Required for Stripe Elements to work in a cross-origin iframe
    betas: ['elements_enable_deferred_intent_beta_1'],
    // Required for cross-origin iframe support
    stripeAccount: undefined, // Set your Stripe account ID here if using Connect
    // Required for cross-origin iframe support
    apiVersion: '2022-11-15', // Use the latest API version
    // Required for cross-origin iframe support
    locale: 'auto',
  });
}

export function StripeProvider({ children }: { children: ReactNode }) {
  // If Stripe isn't configured, just render the children without the Elements provider
  if (!stripePublishableKey) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
