"use client";

import React from "react";
import { BillingCycle } from "@/types/pricing/pricing.type";

interface BillingToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export function BillingToggle({ cycle, onChange }: BillingToggleProps) {
  return (
    <div className="flex justify-center mb-12">
      <div className="bg-white p-1 rounded-full shadow-xs border border-purple-100 inline-flex items-center">
        <button
          onClick={() => onChange("monthly")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            cycle === "monthly"
              ? "bg-[#5233C6] text-white shadow-xs"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange("yearly")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            cycle === "yearly"
              ? "bg-[#5233C6] text-white shadow-xs"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Yearly (Save 20%)
        </button>
      </div>
    </div>
  );
}