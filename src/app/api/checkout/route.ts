import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();
    
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    if (!stripeSecretKey) {
      console.warn("Stripe Secret Key not found. Returning stub session.");
      // Stub mode for when user hasn't added their keys yet
      return NextResponse.json({ 
        sessionId: null, 
        message: "Stripe not configured. Pass keys to process.env to enable checkout." 
      });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-04-10" as any });
    
    // Attempt to get user from Supabase to associate checkout session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: user?.id,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: "Error creating checkout session", message: err.message }, { status: 500 });
  }
}
