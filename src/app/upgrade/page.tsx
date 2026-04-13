import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const priceIDs: Record<string, Record<string, string>> = {
  "tier-team": {
    monthly: "price_1TKcA3Fe3iYFR8it4K4ZTzz4",
    annually: "price_1TKcFJFe3iYFR8itIVPLia73",
  },
  "tier-business": {
    monthly: "price_1TKcClFe3iYFR8itW05WSZOd",
    annually: "price_1TKcHqFe3iYFR8itsGafibq3",
  },
};

export default async function Upgrade({ searchParams }: { searchParams: Promise<{ plan: string; billing: string }> }) {
  const { plan, billing } = await searchParams;
  const supabase = await createClient();
  const priceID = priceIDs[plan]?.[billing];

  if (!priceID) redirect(`/error#error_description=${encodeURIComponent("Invalid plan selected")}`);

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect(`/error#error_description=${encodeURIComponent("Not authenticated")}`);
}
