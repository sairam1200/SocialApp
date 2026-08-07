import { FC } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn.util";

interface IInputProps {
  label?: string;
  type: string;
  name: string;
  placeholder?: string;
  labelClassName?: string;
  required?: boolean;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: string;
  placeholderIcon?: string;
  altText?: string;
  style?: React.CSSProperties;
  rightElement?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  "aria-label"?: string;
}

const AuthInput: FC<IInputProps> = ({
  label,
  type,
  name,
  placeholder,
  labelClassName,
  required,
  error,
  onChange,
  onBlur,
  value,
  style,
  placeholderIcon,
  altText = "icon",
  rightElement,
  inputMode,
  autoComplete,
  "aria-label": ariaLabel,
}) => {
  return (
    <div className="mt-4">
      <label
        htmlFor={name}
        className={`block select-none ${labelClassName || "text-sm font-medium text-muted-foreground mb-2"}`}
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <div className="relative">
        {placeholderIcon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none select-none">
            <Image
              src={placeholderIcon}
              alt={altText}
              width={13.33}
              height={10.67}
            />
          </span>
        )}
        <input
          type={type}
          name={name}
          id={name}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          style={style}
          inputMode={inputMode}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          className={cn(
            "w-full text-base font-normal pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-1 focus:border-transparent",
            error
              ? "focus:ring-red-700 border-red-700"
              : "focus:ring-primary border-primary-light",
            placeholderIcon
              ? "pl-9"
              : "pl-4"
          )}
        />
        {/* Right Side Element (Spinner etc) */}
        {rightElement && (
          <span className="absolute inset-y-0 right-2 flex items-center">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <small className="text-red-700 text-xs mt-1 select-none">{error}</small>
      )}
    </div>
  );
};

export default AuthInput;
