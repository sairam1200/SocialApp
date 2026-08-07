/**
 * One glyph per Gaddr property.
 *
 * The switcher used to draw the Gaddr mark on every row, which meant six
 * identical shapes down the left edge: a reader scanning the list got no help
 * from them and the eye had to fall back to reading each label in full. A
 * distinct silhouette per product is the only part of a menu row that can be
 * recognised without reading.
 *
 * Drawn here rather than imported from an icon set because four of the ten are
 * products, not concepts, and no general set has a mark for MajMap. Mixing
 * hand-drawn shapes with lucide's would be visible, so all ten follow lucide's
 * construction exactly: a 24 unit box, `currentColor` stroke at 1.5, round caps
 * and joins, geometry kept off the half-pixel. They sit next to lucide icons
 * elsewhere in the shell without looking like a different family.
 *
 * `currentColor` and no fill, so a row inherits its state colour: muted when
 * idle, brand when it is the current product, and legible on both themes with
 * no second copy of the artwork.
 *
 * Part of the portable contract, so every product draws the same mark for the
 * same product. React is the only import: no class-name helper, no icon
 * package, nothing from a host application. A sibling that copies the contract
 * directory gets the icons with it and does not have to redraw them.
 */

const PATHS: Record<string, React.ReactNode> = {
  // A case with a divider and a clasp.
  jobs: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
      <path d="M10.5 12.5v1.5h3v-1.5" />
    </>
  ),
  // A lens over a list of results.
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m15.5 15.5 5.5 5.5" />
      <path d="M8.5 10h5" />
      <path d="M8.5 12.75h3" />
    </>
  ),
  // A person inside a ring, the shape used for identity throughout the app.
  me: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="10" r="2.75" />
      <path d="M6.8 18.4a5.6 5.6 0 0 1 10.4 0" />
    </>
  ),
  // A card with its magnetic band and a signature line.
  pay: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6 14.5h4" />
    </>
  ),
  // Three columns at different heights, which is what a board looks like.
  work: (
    <>
      <rect x="3" y="4.5" width="4.5" height="15" rx="1.5" />
      <rect x="9.75" y="4.5" width="4.5" height="10" rx="1.5" />
      <rect x="16.5" y="4.5" width="4.5" height="12.5" rx="1.5" />
    </>
  ),
  // A branch rejoining a trunk: a forge, which is what Gaddr Code is.
  code: (
    <>
      <circle cx="7" cy="5" r="2.25" />
      <circle cx="7" cy="19" r="2.25" />
      <circle cx="17" cy="9.5" r="2.25" />
      <path d="M7 7.25v9.5" />
      <path d="M17 11.75v.75a4 4 0 0 1-4 4H9.25" />
    </>
  ),
  // A hub with three satellites: tasks fanning out from one brief.
  neurtask: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="5" cy="6" r="1.75" />
      <circle cx="19" cy="7" r="1.75" />
      <circle cx="17" cy="18.5" r="1.75" />
      <path d="m6.4 7.3 3.6 3.2" />
      <path d="m17.6 8.2-3.6 2.2" />
      <path d="m15.7 17.2-2.3-3.1" />
    </>
  ),
  // A folded paper map.
  majmap: (
    <>
      <path d="M9 4.5 3 6.75v12.75L9 17.25l6 2.25 6-2.25V4.5l-6 2.25L9 4.5Z" />
      <path d="M9 4.5v12.75" />
      <path d="M15 6.75V19.5" />
    </>
  ),
  // A framed chart.
  visualiter: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M7.5 15.5v-3" />
      <path d="M12 15.5V9" />
      <path d="M16.5 15.5v-5" />
    </>
  ),
  // A calculator: readout above, keys below.
  calcaios: (
    <>
      <rect x="4.5" y="3" width="15" height="18" rx="2.5" />
      <rect x="8" y="6.5" width="8" height="3" rx="1" />
      <path d="M8.5 13h.01" />
      <path d="M12 13h.01" />
      <path d="M15.5 13h.01" />
      <path d="M8.5 16.5h.01" />
      <path d="M12 16.5h.01" />
      <path d="M15.5 16.5h.01" />
    </>
  ),
};

/** Anything without its own drawing gets a plain rounded square. */
const FALLBACK = <rect x="4" y="4" width="16" height="16" rx="4" />;

export function ProductGlyph({
  id,
  className,
  size = 20,
}: {
  /** A `GaddrProduct.id`. An unknown id draws the fallback, it never throws. */
  id: string;
  className?: string;
  /** Pixels. Set explicitly because not every host sizes SVGs with a class. */
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      aria-hidden
      className={className}
      width={size}
      height={size}
    >
      {PATHS[id] ?? FALLBACK}
    </svg>
  );
}

/** Exported for the test that asserts every registry row has a drawing. */
export const PRODUCT_GLYPH_IDS = Object.keys(PATHS);
