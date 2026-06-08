"use client";
import React from "react";
import { cn } from "@/utils/cn.util";

interface BadgeProps {
  label: string;
  onClick?: (value: string) => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "outline";
  className?: string;
  disabled?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  onClick,
  variant = "primary",
  className,
  disabled = false
}) => {
  const variantStyles = {
    primary: "bg-[#6400bf] text-white border-[#a366e0] hover:bg-[#7f33ff]",
    secondary: "bg-[#B42CEA] text-white border-[#B42CEA] hover:bg-[#9a1fd1]",
    success: "bg-green-600 text-white border-green-700 hover:bg-green-700",
    warning: "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600",
    error: "bg-red-600 text-white border-red-700 hover:bg-red-700",
    info: "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
    outline: "bg-transparent text-[#6400bf] border-[#6400bf] hover:bg-[#6400bf] hover:text-white",
  };

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick && onClick(label)}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center px-3 py-[4px] rounded-md text-sm border transition-colors",
        variantStyles[variant],
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer",
        className
      )}
    >
      {label}
    </button>
  );
};

export default Badge;

