import { cn } from "@/utils/cn.util";

const STEP_LABELS = [
  "About you",
  "Interests",
  "Connected profiles",
  "Review profile",
] as const;

export function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mx-auto w-full max-w-4xl flex-none p-6">
      <div className="mb-4 text-md font-bold text-primary">Step {step}/4</div>
      <div className="mb-2 grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div
            key={stepNumber}
            className={cn(
              "h-2 rounded-full border-2 transition-colors duration-300",
              step >= stepNumber
                ? "border-primary bg-primary"
                : "border-indigo-200 bg-transparent",
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {STEP_LABELS.map((label, index) => (
          <span
            key={label}
            className={cn(
              "text-center text-[10px] font-semibold md:text-xs",
              step >= index + 1 ? "text-[#24183f]" : "text-[#514667]",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
