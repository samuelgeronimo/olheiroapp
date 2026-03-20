/**
 * Stripe API Utility for Olheiro App
 * Handles checkout session generation for monthly subscriptions.
 */

/**
 * Generates a Stripe Checkout Session for the user.
 * Best used within a Supabase Edge Function to protect the STRIPE_SECRET_KEY.
 * For this client-side utility, we point towards a redirect or an edge function.
 */
import { supabase } from './supabase';

/**
 * Generates a Stripe Checkout Session via Next.js API Route.
 */
export async function createStripeCheckout(userId: string, userEmail: string) {
  try {
    const isProduction = process.env.NEXT_PUBLIC_STRIPE_MODE === 'production';
    const priceId = isProduction 
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROD 
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST;

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        priceId: priceId || 'price_1TD6Y1DqblMH6A92ITY1mN5Q',
        email: userEmail,
        userId: userId
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    // Redirect to the URL returned by the Stripe API
    return data.url;

  } catch (err: any) {
    console.error('Error generating checkout session:', err);
    throw err;
  }
}
