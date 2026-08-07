declare module '*.css'

/**
 * requestIdleCallback types — not in all TS lib targets yet.
 */
interface RequestIdleCallbackOptions {
  timeout?: number;
}

interface RequestIdleCallbackDeadline {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}

interface Window {
  requestIdleCallback: (
    callback: (deadline: RequestIdleCallbackDeadline) => void,
    opts?: RequestIdleCallbackOptions,
  ) => number;
  cancelIdleCallback: (id: number) => void;
}

/**
 * SVGs are compiled to React components by @svgr/webpack (configured as a
 * Turbopack rule in next.config.ts). Without this declaration `yarn type-check`
 * reports TS2307 for every `import Icon from '@/components/svg/*.svg'` on a
 * clean clone, because the only ambient SVG types ship in the generated
 * next-env.d.ts — which is gitignored and typed for static image imports, not
 * components.
 *
 * Keeping this committed is what lets typecheck run as a CI gate.
 */
declare module '*.svg' {
  import type { FC, SVGProps } from 'react'

  export const ReactComponent: FC<SVGProps<SVGSVGElement>>

  const content: FC<SVGProps<SVGSVGElement>>
  export default content
}

/**
 * Raster imports, for the same reason as the SVG block above and with the same
 * consequence when missing: `tsc --noEmit` on a clean clone reported TS2307 for
 * every `import logo from '@/assets/login_icons/gaddr_logo.png'`, six errors in
 * `AuthFooter.tsx` alone. AGENTS.md requires typecheck to stay at zero, so an
 * error that only appears before the first `next build` is an error that makes
 * the gate unrunnable.
 *
 * The shape matches what next-env.d.ts generates — Next's `StaticImageData`,
 * which `next/image` consumes directly — so committing this changes nothing at
 * runtime and only removes the dependency on a generated, gitignored file.
 */
declare module '*.png' {
  import type { StaticImageData } from 'next/image'

  const content: StaticImageData
  export default content
}

declare module '*.jpg' {
  import type { StaticImageData } from 'next/image'

  const content: StaticImageData
  export default content
}

declare module '*.jpeg' {
  import type { StaticImageData } from 'next/image'

  const content: StaticImageData
  export default content
}

declare module '*.webp' {
  import type { StaticImageData } from 'next/image'

  const content: StaticImageData
  export default content
}

declare module '*.avif' {
  import type { StaticImageData } from 'next/image'

  const content: StaticImageData
  export default content
}

declare module '*.gif' {
  import type { StaticImageData } from 'next/image'

  const content: StaticImageData
  export default content
}
