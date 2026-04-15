import { redirect } from "next/navigation";
import Stripe from "stripe";
import PlansData from "@/data/plans.json";
import { createClient } from "@/utils/supabase/server";
import { baseURL } from "@/utils/helpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function Upgrade({
  searchParams,
}: {
  searchParams: Promise<{ company: string; plan: string; billing: string }>;
}) {
  const { company, plan, billing } = await searchParams;
  const supabase = await createClient();
  const planData = PlansData.find((i) => i.id === Number(plan));
  const priceID = planData?.price[0]?.[billing as "monthly" | "annually"];

  if (!priceID && plan !== "1") redirect(`/error#error_description=${encodeURIComponent("Invalid plan selected")}`); // Plan doesn't exist and isn't starter plan

  // Get auth user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect(`/error#error_description=${encodeURIComponent("Not authenticated")}`);

  // Check user is a company admin
  const { error: companyUsersError } = await supabase
    .from("company_users")
    .select("id")
    .eq("company_id", company)
    .eq("user_id", authData.user.id)
    .single();

  if (companyUsersError)
    redirect(`/error#error_description=${encodeURIComponent("You do not have permission to modify this company")}`);

  // Get company plan
  const { data: companyPlanData, error: companyPlanError } = await supabase
    .from("company_plan")
    .select("id, plan_id, stripe_customer_id")
    .eq("company_id", company)
    .single();

  if (companyPlanError) redirect(`/error#error_description=${encodeURIComponent("Internal server error")}`);

  // Redirect
  if (companyPlanData.plan_id === Number(plan)) {
    redirect("/settings"); // Selected plan is the same as the current plan
  } else if (plan === "1" && companyPlanData.plan_id !== 1) {
    // Cancellation
    // Open portal or do cancellation here
  } else {
    // Open Stripe to subscribe
    const session = await stripe.checkout.sessions.create({
      customer: companyPlanData.stripe_customer_id,
      line_items: [{ price: priceID, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseURL}/settings`,
      cancel_url: `${baseURL}/settings`,
    });

    redirect(session.url!);
  }
}
