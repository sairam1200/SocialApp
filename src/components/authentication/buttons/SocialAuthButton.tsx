
import { FC } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn.util";

interface ISocialAuthButtonProps {
  label: string;
  type: "button";
  onClick?: () => void;
  onHover?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  iconSrc: string;
  iconWidth?: number;
  iconHeight?: number;
  iconPosition?: "left" | "right";
  altText?: string;
  width?: number;
  height?: number;
}

const SocialAuthButton: FC<ISocialAuthButtonProps> = ({
  label,
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  className,
  iconSrc,
  iconWidth = 20,
  iconHeight = 20,
  altText = "social icon",
  width,
  height,
}) => {
  const renderIcon = () => {
    if (!loading) return null;{
      return (
        <svg
          className="animate-spin"
          width={iconWidth}
          height={iconHeight}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      );
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn("w-full flex cursor-pointer items-center justify-center gap-2 py-[10px] px-[10px] border-[1.5px] rounded-lg border-[#A288FF] focus:outline-none focus:ring-1 focus:ring-[#6400BF] focus:border-transparent bg-[#FFFFFF] hover:bg-[#F3F0FF] active:bg-[#E0D7FF] transition-colors active:scale-[0.98] disabled:opacity-85 disabled:cursor-not-allowed", className)}>
      <Image src={iconSrc} alt={altText} width={width} height={height} />
      <p className="text-sm text-center font-normal text-[#595959]">
        {label}
      </p>
      {renderIcon()}
    </button>
  );
};

export default SocialAuthButton;
