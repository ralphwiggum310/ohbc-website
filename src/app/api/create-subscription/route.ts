import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

// Map frequency to Stripe interval
const getPriceId = (amount: number, frequency: string) => {
  // In a real application, you would create these prices in your Stripe dashboard
  // and use the price IDs here. This is just for demonstration.
  const priceIdMap: Record<string, string> = {
    'monthly_1000': 'price_monthly',
    'quarterly_1000': 'price_quarterly',
    'annually_1000': 'price_annually',
    // Add more mappings as needed
  };
  
  const key = `${frequency}_${amount}`;
  return priceIdMap[key] || `custom_${frequency}_${amount}`;
};

export async function POST(request: Request) {
  try {
    const { amount, name, email, frequency } = await request.json();

    // Validate the amount
    if (amount < 50) { // Minimum donation of $0.50
      return NextResponse.json(
        { error: 'Donation amount must be at least $0.50' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Create a customer in Stripe
    // 2. Create a subscription for that customer
    // 3. Store the customer and subscription IDs in your database

    // First, create a customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        frequency,
        amount: amount.toString(),
      },
    });

    // Create a setup intent for the subscription
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      customer: customer.id,
      metadata: {
        name,
        frequency,
        amount: amount.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      // In a real app, you would also return the subscription ID
      // subscriptionId: subscription.id,
    });
  } catch (err) {
    console.error('Error creating subscription:', err);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
