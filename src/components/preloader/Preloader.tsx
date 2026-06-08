"use client";
import { FC } from "react";

interface PreloaderProps {
  message?: string;
}

const Preloader: FC<PreloaderProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        {message && (
          <p className="text-primary font-medium text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Preloader;

