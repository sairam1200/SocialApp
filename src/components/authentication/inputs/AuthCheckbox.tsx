
import { cn } from "@/utils/cn.util";

interface CheckboxProps {
  name: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  checkboxStyle?: string;
  labelStyle?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  checked,
  onChange,
  onBlur,
  error,
  touched,
  checkboxStyle,
  labelStyle,
}) => {
  return (
    <div>
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        className={cn("w-[17px] h-[17px] rounded-[1px] relative top-0.5 mr-2 cursor-pointer", checkboxStyle)} />

      <label
        htmlFor={name}
        className={cn("text-sm cursor-pointer select-none", (touched && error ? "text-red-700 *:text-red-700" : "text-[#000000]"), labelStyle)}>
        {label}
      </label>

      {/* {touched && error && <p className="text-red-700 text-xs mt-1 select-none">{error}</p>} */}
    </div>
  );
};

export default Checkbox;