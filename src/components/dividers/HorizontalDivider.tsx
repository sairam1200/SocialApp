"use client";
import React, { FC } from "react";

interface IHorizontalDividerProps {
  text?: string;
  width?: string;
  className?: string; // optional for extra styling if needed
}

const HorizontalDivider: FC<IHorizontalDividerProps> = ({
  text,
  width,
  className,
}) => {
  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <div className={`${width} border border-[#BFBFBF]`}></div>
      {text && (
        <p className="font-normal text-base text-[#808080] px-3">{text}</p>
      )}
      <div className={`${width} border border-[#BFBFBF]`}></div>
    </div>
  );
};

export default HorizontalDivider;
