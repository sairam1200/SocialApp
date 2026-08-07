import Image from "next/image";

interface ShareIconProps {
	/** Tailwind sizing/color classes can be supplied by the caller. */
	className?: string;
	/** Intrinsic width used when the icon is rendered without a CSS size. */
	size?: number;
}

/** The product-wide share glyph supplied in the public icon set. */
export function ShareIcon({ className, size = 16 }: ShareIconProps) {
	return (
		<Image
			src="/icons/share.svg"
			alt=""
			aria-hidden="true"
			width={size}
			height={Math.round((size * 14) / 12)}
			className={className}
		/>
	);
}
