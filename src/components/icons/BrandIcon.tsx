import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn.util";
import { FC } from "react";

interface IBrandIconProps {
  className?: string;
  href: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  autoSize?: boolean; // If true, ignore width/height props
}

const BrandIcon: FC<IBrandIconProps> = ({ className, href, src, alt }) => {
  return (
    <Link href={href} className={cn("inline-block", className)}>
      <div className="relative w-8 h-8">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
        />
      </div>
    </Link>
  );
};

export default BrandIcon;
