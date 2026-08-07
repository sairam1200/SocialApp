"use client";

import React, { useState } from "react";
import { BillingCycle } from "@/types/pricing/pricing.type";
import { PricingHero } from "./PricingHero";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PricingCards } from "@/components/pricing/PricingCards";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import LandingFooter from "@/components/landing-page/LandingFooter";

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");

  return (
    <div className="w-full bg-[#F0EBFF] min-h-screen">
      {/* 1. Hero Banner */}
      <PricingHero />

      /* 2. Pricing Content Area - Moved completely below Hero */
      <div className="pt-6 pb-16 relative z-20 space-y-10">
        <BillingToggle cycle={billingCycle} onChange={setBillingCycle} />
        <PricingCards cycle={billingCycle} />
        <ComparisonTable />
        <LandingFooter />
      </div>
    </div>
  );
}