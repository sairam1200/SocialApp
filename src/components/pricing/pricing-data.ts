export type PricingPlan = {
  name: string;
  price: string;
  monthlyPrice: string;
  annualPrice: string;
  includedText: string;
  intro?: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
  badge?: string;
};

export type ComparisonFeature = {
  name: string;
  essential: boolean;
  creator: boolean;
  visionary: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Essential",
    price: "Free",
    monthlyPrice: "Free",
    annualPrice: "Free",
    includedText: "/month",
    intro: "Start with:",
    buttonText: "Get started",
    features: [
      "Universal Profile",
      "Manual Linking",
      "Social Search",
      "Activity Feed",
      "Basic Filters",
      "Content Preview",
    ],
  },
  {
    name: "Creator",
    price: "190 SEK",
    monthlyPrice: "190 SEK",
    annualPrice: "152 SEK", // 20% off
    includedText: "/month",
    intro: "Everything in Essential, plus:",
    buttonText: "Try for free",
    badge: "Best choice",
    features: [
      "Verified Identity",
      "AI Captions",
      "Smart Hashtags",
      "Post Scheduling",
      "Smart Suggestions",
      "Data export (CSV/PDF)",
      "Admin controls",
      "Media Filters",
    ],
  },
  {
    name: "Visionary",
    price: "490 SEK",
    monthlyPrice: "490 SEK",
    annualPrice: "392 SEK", // 20% off
    includedText: "/month",
    intro: "Everything in Creator, plus:",
    buttonText: "Try for free",
    features: [
      "Deep Web Search",
      "Advanced Filters",
      "Saved Collections",
      "AI Time Suggestions",
      "Advanced Analytics",
      "Automation Tools",
      "Priority Search",
      "Early AI Features",
    ],
  },
];

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  { name: "Universal Profile", essential: true, creator: true, visionary: true },
  { name: "Manual Profile Linking", essential: true, creator: true, visionary: true },
  { name: "Cross-Platform Search", essential: true, creator: true, visionary: true },
  { name: "Activity Feed", essential: true, creator: true, visionary: true },
  { name: "Basic Filters", essential: false, creator: true, visionary: true },
  { name: "Verified Identity", essential: false, creator: true, visionary: true },
  { name: "AI Captions", essential: false, creator: true, visionary: true },
  { name: "Smart Hashtags", essential: false, creator: true, visionary: true },
  { name: "Content Scheduling", essential: false, creator: true, visionary: true },
  { name: "Advanced Analytics", essential: false, creator: false, visionary: true },
  { name: "AI Time Suggestions", essential: false, creator: false, visionary: true },
  { name: "Saved Collections", essential: false, creator: false, visionary: true },
  { name: "Deep Web Search", essential: false, creator: false, visionary: true },
  { name: "Automation Tools", essential: false, creator: false, visionary: true },
  { name: "Early AI Features", essential: false, creator: false, visionary: true },
];