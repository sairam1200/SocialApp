"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/utils/cn.util";

const DEFAULT_AVATAR_SRC = "/images/avatar-placeholder.svg";

type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<UserAvatarSize, string> = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-20 h-20",
};

export interface UserAvatarProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  src?: string | null;
  alt?: string;
  size?: UserAvatarSize;
  fallback?: string;
  showBorder?: boolean;
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  (
    {
      src,
      alt = "avatar",
      size = "md",
      fallback,
      showBorder = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [imgError, setImgError] = React.useState(false);

    const resolvedSrc =
      !src || imgError ? (fallback ?? DEFAULT_AVATAR_SRC) : src;

    return (
      <div
        ref={ref}
        data-slot="user-avatar"
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          showBorder && "ring-2 ring-background",
          className,
        )}
        {...props}
      >
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          sizes="100%"
          className="object-cover"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    );
  },
);
UserAvatar.displayName = "UserAvatar";

export { UserAvatar, type UserAvatarSize };
