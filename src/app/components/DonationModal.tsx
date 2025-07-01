'use client';

import { useState, ReactElement } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe.js
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Ensure we have a valid Stripe promise
if (!stripePromise) {
  console.error('Stripe publishable key is not set. Please check your environment variables.');
}

interface CheckoutFormProps {
  onSuccess: () => void;
  onCloseAction: () => void;
}

const CheckoutForm = ({ onSuccess, onCloseAction }: CheckoutFormProps): ReactElement => {
  const [amount, setAmount] = useState('25.00');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      if (isRecurring) {
        // Handle subscription creation
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountInCents, name, email, frequency }),
        });

        const subscriptionData = await response.json();

        if (subscriptionData.error) {
          throw new Error(subscriptionData.error);
        }

        // For subscriptions, use setup intent to collect payment method
        const { error: setupError } = await stripe.confirmCardSetup(
          subscriptionData.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement)!,
              billing_details: { name, email },
            },
          }
        );

        if (setupError) {
          throw new Error(setupError.message || 'Subscription setup failed');
        }

        onSuccess();
      } else {
        // Handle one-time payment
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountInCents, name, email }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Confirm the payment on the client
        const { error: paymentError } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement)!,
              billing_details: { name, email },
            },
            receipt_email: email,
          }
        );

        if (paymentError) {
          throw new Error(paymentError.message || 'Payment failed');
        }

        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Donation Amount ($)
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Recurring</span>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`${
                isRecurring ? 'bg-red-700' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  isRecurring ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        </div>
        
        {isRecurring && (
          <div className="mb-4">
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        )}
        <div className="mt-1">
          <input
            type="number"
            id="amount"
            min="0.50"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' },
                },
                invalid: { color: '#9e2146' },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm py-2">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCloseAction}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          disabled={!stripe || isProcessing}
        >
          {isProcessing 
            ? 'Processing...' 
            : `${isRecurring ? 'Subscribe' : 'Donate'} $${amount}${isRecurring ? `/${frequency}` : ''}`}
        </button>
      </div>
    </form>
  );
};

interface DonationModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

const DonationModal = ({ isOpen, onCloseAction }: DonationModalProps) => {
  const [donationComplete, setDonationComplete] = useState(false);
  const [isRecurring] = useState(false); // Removed unused setIsRecurring

  if (!isOpen) return null;

  const handleSuccess = () => {
    setDonationComplete(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {donationComplete ? 'Thank You!' : 'Make a Donation'}
          </h2>
          <button
            onClick={onCloseAction}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {donationComplete ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isRecurring ? 'Subscription Created!' : 'Donation Successful!'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {isRecurring 
                ? 'Thank you for your generous recurring support. A confirmation has been sent to your email.'
                : 'Thank you for your generous support. A receipt has been sent to your email.'}
            </p>
            <button
              type="button"
              onClick={onCloseAction}
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-700 text-base font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              onSuccess={handleSuccess} 
              onCloseAction={onCloseAction} 
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default DonationModal;
