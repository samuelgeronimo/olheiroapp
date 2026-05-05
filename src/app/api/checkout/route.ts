import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error - Usando a versão de API mais recente permitida localmente
  apiVersion: '2025-01-27.acacia',
});

export async function POST(req: Request) {
  try {
    const { priceId, email, userId } = await req.json();
    console.log('API Request /api/checkout:', { priceId, email, userId });
    console.log('Using Secret Key:', process.env.STRIPE_SECRET_KEY ? 'DEFINED' : 'MISSING');

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/profile?success=true`,
      cancel_url: `${req.headers.get('origin')}/profile?canceled=true`,
      client_reference_id: userId,
      metadata: { userId }
    });

    return NextResponse.json(
      { url: session.url },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
