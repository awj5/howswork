import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import PlansData from "@/data/plans.json";
import supabaseAdmin from "@/utils/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const pricePlans: Record<string, number> = Object.fromEntries(
  PlansData.flatMap((plan) =>
    plan.price.flatMap((price) => [price.monthly, price.annually].filter(Boolean).map((priceID) => [priceID, plan.id]))
  )
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerID = session.customer;
      const subscriptionID = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionID); // Get the price ID from the subscription
      const priceID = subscription.items.data[0].price.id;
      const planID = pricePlans[priceID];
      if (!planID) break;

      const { error: companyPlanError } = await supabaseAdmin
        .from("company_plan")
        .update({ plan_id: planID, subscription_id: subscriptionID })
        .eq("stripe_customer_id", customerID);

      if (companyPlanError) console.error(companyPlanError);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerID = subscription.customer;
      const priceID = subscription.items.data[0].price.id;
      const planID = pricePlans[priceID];
      if (!planID) break;

      const { error: companyPlanError } = await supabaseAdmin
        .from("company_plan")
        .update({ plan_id: planID, subscription_id: subscription.id })
        .eq("stripe_customer_id", customerID);

      if (companyPlanError) console.error(companyPlanError);
      break;
    }

    // Cancelled
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerID = subscription.customer;

      const { error: companyPlanError } = await supabaseAdmin
        .from("company_plan")
        .update({ plan_id: 1, subscription_id: null })
        .eq("stripe_customer_id", customerID);

      if (companyPlanError) console.error(companyPlanError);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
