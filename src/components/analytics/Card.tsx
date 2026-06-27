"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/cn.util";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E6E6E6] bg-white",
        padding && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
