import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
      const session = event.data.object as any;
      const userId = session.metadata.userId || session.client_reference_id;

      await supabase
        .from('profiles')
        .update({ is_subscribed: true })
        .eq('id', userId);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await supabase
          .from('profiles')
          .update({ is_subscribed: false })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
