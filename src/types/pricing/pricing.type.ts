export type BillingCycle = "monthly" | "yearly";

export interface PlanFeature {
  name: string;
  includedIn: ("essential" | "creator" | "visionary")[];
}

export interface PricingPlan {
  id: "essential" | "creator" | "visionary";
  name: string;
  priceMonthly: number | "Free";
  priceYearly: number | "Free";
  currency: string;
  badge?: string;
  descriptionPrefix: string;
  features: string[];
  buttonText: string;
  buttonVariant: "outline" | "solid";
}