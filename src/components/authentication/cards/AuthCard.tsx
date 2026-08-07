
import { FC } from "react";
import { ReactNode } from "react";

interface ICardProps {
  children: ReactNode;
  className?: string;
  width?: string;
}

const AuthCard: FC<ICardProps> = ({ children, className, width }) => {
  return (
    <div className="flex justify-center mt-7.5 mb-[43px] px-4 max-sm:mt-6">
      <div
        className={`w-full ${width ? width : "max-w-[549px]"} h-fit bg-card border border-primary-light rounded-lg shadow-[0_4px_6px_0_rgba(97,54,255,0.25)] ${className || ""}`}
      >
        {children}
      </div>
    </div>

  );
};

export default AuthCard;
