import { FC } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn.util";

interface ISelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  error?: string;
  placeholderIcon?: string;
  altText?: string;
  style?: React.CSSProperties;
}

const AuthSelect: FC<ISelectProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  placeholderIcon,
  altText = "icon",
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-base font-bold text-[#595959] mt-4 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        {placeholderIcon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Image
              src={placeholderIcon}
              alt={altText}
              width={13.33}
              height={10.67}
            />
          </span>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={cn("w-full text-base font-normal pr-3 py-2 bg-[#FFFFFF] border rounded-lg focus:outline-none focus:ring-1 focus:border-transparent", (placeholderIcon ? "pl-9" : "pl-4"), (error ? "focus:ring-red-700 border-red-700" : "focus:ring-[#6400BF] border-[#A288FF]"))}>
          <option value="">Select {label.toLowerCase()}...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-700 text-xs mt-1">{error}</p>}
    </div >
  );
};

export default AuthSelect;
