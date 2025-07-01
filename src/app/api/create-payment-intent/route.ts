import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: Request) {
  try {
    const { amount, name, email } = await request.json();

    // Validate the amount
    if (amount < 50) { // Minimum donation of $0.50
      return NextResponse.json(
        { error: 'Donation amount must be at least $0.50' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        name,
        email,
      },
      receipt_email: email,
      description: 'Donation to Orchard Hills Bible Church',
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
