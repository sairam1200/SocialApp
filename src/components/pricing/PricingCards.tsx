"use client";

import React from "react";
import { BillingCycle } from "@/types/pricing/pricing.type";
import { PRICING_PLANS } from "@/constants/pricing";

interface PricingCardsProps {
  cycle: BillingCycle;
}

export function PricingCards({ cycle }: PricingCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20 px-4">
      {PRICING_PLANS.map((plan) => {
        const price =
          typeof plan.priceMonthly === "number"
            ? cycle === "monthly"
              ? plan.priceMonthly
              : plan.priceYearly
            : plan.priceMonthly;

        return (
          <div
            key={plan.id}
            /* Outer Wrapper: Enables hover transition & scale */
            className="group relative rounded-2xl p-[2px] transition-all duration-300 hover:-translate-y-2"
          >
            {/* 1. BLUE GRADIENT GLOW (Behind the border) */}
            <div
              className="absolute inset-0 rounded-2x1 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #87878a 10%, #6b11b4 60%, #87878a 100%)",
              }}
              aria-hidden="true"
            />

            {/* 2. CRISP PURPLE GRADIENT BORDER */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-200"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #A288FF 0%, #A288FF 80%)",
              }}
              aria-hidden="true"
            />

            {/* 3. DEFAULT STATIC BORDER (When NOT hovered) */}
            <div className="absolute inset-0 rounded-2xl border border-purple-100 group-hover:border-transparent transition-colors duration-300 pointer-events-none" />

            {/* 4. CARD INNER CONTENT CONTAINER */}
            <div className="relative flex flex-col justify-between h-full w-full rounded-[14px] bg-white p-8 shadow-sm transition-shadow duration-300 group-hover:shadow-2xl">
              <div>
                {/* Top Badge */}
                {plan.badge && (
                  <span className="absolute top-6 right-6 bg-[#5233C6] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}

                {/* Plan Title */}
                <h3 className="text-xl font-bold text-[#5233C6] mb-4">
                  {plan.name}
                </h3>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-neutral-900">
                    {price} {plan.currency}
                  </span>
                  <span className="text-sm text-neutral-500 font-medium">
                    /month
                  </span>
                </div>

                {/* Description Prefix */}
                <p className="text-xs font-semibold text-neutral-500 mb-6">
                  {plan.descriptionPrefix}
                </p>

                {/* Feature Checklist */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm font-medium text-neutral-700"
                    >
                      {/* EXACT MATCH SVG CHECKMARK */}
                      <svg
                        className="w-5 h-5 text-[#5233C6] flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 11.0799V11.9999C21.9988 14.1563 21.3005 16.2545 20.0093 17.9817C18.7182 19.7088 16.9033 20.9723 14.8354 21.5838C12.7674 22.1952 10.5573 22.1218 8.53447 21.3744C6.51168 20.6271 4.78465 19.246 3.61096 17.4369C2.43727 15.6279 1.87979 13.4879 2.02168 11.3362C2.16356 9.18443 2.99721 7.13619 4.39828 5.49694C5.79935 3.85768 7.69279 2.71525 9.79619 2.24001C11.8996 1.76477 14.1003 1.9822 16.07 2.85986M22 3.99986L12 14.0099L9.00001 11.0099"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.buttonVariant === "solid"
                    ? "bg-[#5233C6] text-white hover:bg-[#4327A8]"
                    : "border border-[#5233C6] text-[#5233C6] hover:bg-purple-50"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}