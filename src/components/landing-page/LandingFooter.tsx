"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { apiClient } from "@/services/apiClient.service";

const footerLinks = [
    {
        title: "About",
        links: [{ label: "About us", href: "https://gaddr.com/" }],
    },
    {
        title: "Features",
        links: [{ label: "Platform features", href: "/platform-status" }],
    },
    {
        title: "Support",
        links: [
            { label: "Help Center", href: "/contact" },
            { label: "FAQ", href: "#" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms & Conditions", href: "/terms" },
        ],
    },
];

const LandingFooter = () => {
    const [email, setEmail] = useState("");
    const [validationError, setValidationError] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const handleSubscribe = async () => {
        const trimmed = email.trim().toLowerCase();

        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setValidationError("Please enter a valid email address.");
            setStatusMessage(null);
            return;
        }

        setValidationError("");
        setLoading(true);
        setStatusMessage(null);

        try {
            const result = await apiClient.Newsletter.subscribeAsync({
                email: trimmed,
            });

            if (result.success) {
                if (result.alreadySubscribed) {
                    setStatusMessage("You're already subscribed to Gaddr updates.");
                } else {
                    setStatusMessage(
                        "🎉 Thanks! You've been subscribed to Gaddr updates.",
                    );
                }
                setEmail("");
            } else {
                setStatusMessage("Something went wrong. Please try again later.");
            }
        } catch {
            setStatusMessage("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Pure background tint with no top border line */
        <footer className="w-full bg-[#F0EBFF] pt-12 pb-8 text-black-default">
            <div className="max-w-7xl mx-auto px-5">
                {/* TOP GRID */}
                <div className="flex flex-wrap xl:justify-between gap-10 pb-12">
                    {/* Logo + Text */}
                    <div>
                        <Image loading="eager" fetchPriority="high" src="/images/gaddr.svg" alt="gaddr" width={160} height={80} sizes="160px" className="mb-4" />
                        <p className="text-sm text-[#333] max-w-xs leading-relaxed">
                            Discover and stay inspired.<br />All your social content in one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-6 md:gap-10">
                        {footerLinks.map((section) => (
                            <div key={section.title}>
                                <h3 className="font-bold text-base mb-3 text-neutral-900">{section.title}</h3>
                                <div className="flex flex-col gap-2">
                                    {section.links.map((link) => (
                                        <Link key={link.label} href={link.href} className="text-sm text-[#5233C6] hover:text-[#32166F] transition-colors">
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* NEWSLETTER */}
                    <div className="max-w-80 w-full">
                        <h3 className="font-bold text-base mb-2 flex items-center gap-1.5 text-neutral-900">
                            Stay Updated <span>🔔</span>
                        </h3>
                        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                            Get the latest job opportunities, hiring trends & platform updates to your inbox.
                        </p>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
                                <Input
									type="email"
									placeholder="Enter email..."
									className="text-xs pl-9 !bg-white text-gray-900 border border-purple-200 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#5233C6] rounded-lg"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (validationError) setValidationError("");
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !loading) handleSubscribe();
									}}
									/>
                            </div>

                            <Button
                                className="rounded-lg bg-[#5233C6] hover:bg-[#32166F] p-2.5 flex-shrink-0"
                                onClick={handleSubscribe}
                                disabled={loading}
                            >
                                <ArrowRight className="w-4 h-4 text-white" />
                            </Button>
                        </div>

                        {validationError && (
                            <p className="text-xs text-red-500 mb-2">{validationError}</p>
                        )}

                        {statusMessage && (
                            <p className="text-xs text-gray-700 mb-2">{statusMessage}</p>
                        )}

                        <p className="text-[11px] text-gray-500 leading-normal">
                            By subscribing, you agree to our{" "}
                            <Link href="/privacy-policy" className="text-[#5233C6]">
                                Privacy policy
                            </Link>{" "}
                            and{" "}
                            <Link href="/terms" className="text-[#5233C6]">
                                terms & conditions
                            </Link>{" "}
                            to receive updates.
                        </p>
                    </div>
                </div>

                {/* BOTTOM BAR DIVIDER */}
                <div className="border-t border-[#A1A1A1]/40 pt-6">
                    <p className="text-xs text-neutral-600">
                        {new Date().getFullYear()} Gaddr Search & Me. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;