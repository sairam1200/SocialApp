"use client";

import Link from "next/link";
import { cn } from "@/utils/cn.util";
import Arrow from "@/components/svg/arrow-down.svg";
import EnvelopIcon from "@/components/svg/envelop.svg";

export default function HelpSettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold mb-2">Help</h2>
                <p className="text-sm text-gray-neutral">
                    Find answers to common questions or contact support
                </p>
            </div>

            <section className="space-y-4">
                <h3 className="font-semibold text-[20px] mb-2">Contact us</h3>

                <div className="space-y-3">
                    <Link
                        href="mailto:support@gaddr.com"
                        className={cn(
                            "flex w-full items-center justify-between gap-4",
                            "border-b border-[#D9D9D9] p-4",
                            "hover:bg-gray-50 transition"
                        )}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <EnvelopIcon className="w-4 h-4" />
                            <div className="min-w-0 text-left">
                                <p className="font-medium truncate">Contact customer support</p>
                            </div>
                        </div>

                        <Arrow className="rotate-270 w-4 h-4 shrink-0" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
