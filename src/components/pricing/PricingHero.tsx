"use client";

import React from "react";
import Link from "next/link";

export function PricingHero() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 85% 35%, #4C1F93 0%, #32166F 48%, #0D0932 100%)",
      }}
    >
      {/* Background Wave Image Pattern */}
      <div
        className="pointer-events-none absolute inset-0 bg-repeat bg-top"
        style={{
          backgroundImage: "url('/images/landing-bg-pattern.webp')",
          opacity: 0.12,
        }}
        aria-hidden="true"
      />

      <div
        className="relative mx-auto max-w-[1440px] px-8 pt-8 md:px-14"
        style={{ paddingBottom: "100px" }}
      >
        {/* Top Navigation */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-8 text-base">
            {[
              { name: "Explore", href: "/discover" },
              { name: "About", href: "/platform-status" },
              { name: "Premium", href: "/pricing" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="group relative font-medium text-white/80 transition-colors duration-200 hover:text-white"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-full border border-white/80 px-5 py-2 font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10 hover:shadow-md"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-white px-5 py-2 font-semibold text-[#180A40] shadow-sm transition-all duration-200 hover:bg-[#F2EEFF] hover:shadow-lg hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="mx-auto mt-20 max-w-3xl pb-2 text-center">
          <h1 className="inline-block cursor-default text-4xl font-semibold transition-transform duration-300 hover:scale-[1.02] md:text-5xl">
            Get the most out of Gaddr
          </h1>

          <p className="mt-5 text-lg md:text-xl leading-relaxed text-[#F1EDFF] opacity-90 transition-opacity duration-300 hover:opacity-100">
            Gaddr is the ultimate ecosystem for social search and digital
            identity. We are a platform designed for creators, marketers, and
            power users who are tired of disconnected digital experiences.
          </p>
        </div>
      </div>
    </section>
  );
}