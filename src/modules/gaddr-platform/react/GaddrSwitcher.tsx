import { useEffect, useId, useRef, useState } from "react";
import type { GaddrProduct } from "../estate";
import { isLinkable, productLabel } from "../estate";
import { ProductGlyph } from "./ProductGlyph";

/**
 * The Gaddr product switcher, for a product that is not Gaddr Jobs.
 *
 * ── Why this ships its own styling ────────────────────────────────────────
 *
 * The five products have five different stacks and five different token sets.
 * One is Next.js with a full shadcn theme, two are Vite with Tailwind, one has
 * no design system at all. A component written against `bg-popover` renders
 * unstyled in three of them, and the failure is silent: the markup is right,
 * the menu is invisible.
 *
 * So every colour here is `var(--token, fallback)`. In a product that defines
 * the shadcn variables it adopts them and looks native; anywhere else it falls
 * back to a neutral panel that respects the reader's colour scheme. That is
 * what lets a new product mount it and have it look right on the first try,
 * which is the whole promise of the contract.
 *
 * ── What it does not do ───────────────────────────────────────────────────
 *
 * Routing. Every row is a plain `<a>`, because half the products have a router
 * and the ones that do disagree about the component. Rows point at other
 * origins anyway, where a client-side router would be wrong.
 *
 * ── Accessibility ─────────────────────────────────────────────────────────
 *
 * A `nav`, not `role="menu"`. Several rows have no destination yet and so are
 * not interactive, and a menu whose children are not all menuitems is invalid
 * ARIA. Escape closes and returns focus, the arrows walk the rows, and a row
 * without a destination is a `span` rather than a disabled link: there is no
 * such thing as a disabled anchor, `aria-disabled` on an `<a href>` still
 * navigates, and dropping the href leaves an element that takes focus and does
 * nothing.
 */

export interface GaddrSwitcherProps {
  /** From `gaddrProducts({ currentProductId })`. */
  products: GaddrProduct[];
  /** From `gaddrLabs()`. */
  labs: GaddrProduct[];
  /**
   * Translate a key. A product with no i18n can pass a lookup into a plain
   * object, or `(key) => FALLBACK[key] ?? key`.
   */
  t: (key: string) => string;
  /** Shown on the trigger. Usually the product's own wordmark. */
  brand?: React.ReactNode;
  /**
   * Where the panel opens. `above` is for a trigger sitting at the bottom of a
   * sidebar, which is where two of the products put it; a panel that always
   * opened downward would be off-screen there.
   */
  placement?: "below" | "above";
  /**
   * Replaces the trigger's own styling.
   *
   * The panel is the part that has to be identical everywhere; the trigger sits
   * in a header somebody else designed and often has to match it. A product
   * that passes this owns the button's whole appearance, including its hover
   * and focus states.
   */
  triggerClassName?: string;
  className?: string;
}

const PANEL_WIDTH = "19.5rem";

export function GaddrSwitcher({
  products,
  labs,
  t,
  brand,
  placement = "below",
  triggerClassName,
  className,
}: GaddrSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [labsExpanded, setLabsExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const styleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      setLabsExpanded(false);
      triggerRef.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setLabsExpanded(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function onPanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const rows = Array.from(
      panelRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-row]") ??
        [],
    );
    if (rows.length === 0) return;
    const index = rows.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      event.key === "ArrowDown"
        ? rows[(index + 1) % rows.length]
        : rows[(index - 1 + rows.length) % rows.length];
    next?.focus();
  }

  return (
    <div ref={rootRef} className={className} style={{ position: "relative" }}>
      {/* Scoped by the generated id so two copies on one page, which happens
          when a header and a footer both render one, do not fight. */}
      <style>{scopedCss(styleId)}</style>

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t("products.switch")}
        data-gdr={styleId}
        className={triggerClassName ?? "gdr-trigger"}
        onClick={() =>
          setOpen((value) => {
            if (value) setLabsExpanded(false);
            return !value;
          })
        }
      >
        {brand}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          width="14"
          height="14"
          role="presentation"
          aria-hidden
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <nav
        ref={panelRef}
        aria-label={t("products.label")}
        data-gdr={styleId}
        className="gdr-panel"
        data-open={open ? "true" : "false"}
        data-placement={placement}
        onKeyDown={onPanelKeyDown}
        style={{ width: PANEL_WIDTH }}
      >
        <p className="gdr-heading">{t("products.platformHeading")}</p>
        <ul className="gdr-list">
          {products.map((product) => (
            <Row
              key={product.id}
              product={product}
              t={t}
              onNavigate={() => {
                setOpen(false);
                setLabsExpanded(false);
              }}
            />
          ))}
        </ul>

        <div className="gdr-labs-heading">
          <p className="gdr-heading gdr-heading-divided">
            {t("products.labsHeading")}
          </p>
          <button
            type="button"
            className="gdr-labs-toggle"
            aria-expanded={labsExpanded}
            aria-controls={`${styleId}-labs`}
            aria-label={t(
              labsExpanded ? "products.collapseLabs" : "products.expandLabs",
            )}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setLabsExpanded(true);
            }}
            onClick={() => setLabsExpanded((value) => !value)}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              style={{ transform: labsExpanded ? "rotate(180deg)" : undefined }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        <ul
          id={`${styleId}-labs`}
          className="gdr-list"
          hidden={!labsExpanded}
        >
          {labs.map((product) => (
            <Row
              key={product.id}
              product={product}
              t={t}
              onNavigate={() => {
                setOpen(false);
                setLabsExpanded(false);
              }}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}

/**
 * One row. At module scope, not nested: a component defined inside another is
 * a new type on every render, so React remounts the list and any focus inside
 * it is lost.
 */
function Row({
  product,
  t,
  onNavigate,
}: {
  product: GaddrProduct;
  t: (key: string) => string;
  onNavigate: () => void;
}) {
  const body = (
    <>
      <ProductGlyph
        id={product.id}
        className={product.current ? "gdr-glyph gdr-glyph-here" : "gdr-glyph"}
      />
      <span className="gdr-text">
        <span className="gdr-line">
          <span className="gdr-name">{productLabel(product)}</span>
          {product.current ? (
            <span className="gdr-chip gdr-chip-here">
              {t("products.youAreHere")}
            </span>
          ) : null}
          {!product.current && product.viaKey ? (
            <span className="gdr-chip">{t(product.viaKey)}</span>
          ) : null}
          {!isLinkable(product) ? (
            <span className="gdr-chip">{t("products.soon")}</span>
          ) : null}
        </span>
        <span className="gdr-blurb">{t(product.blurbKey)}</span>
      </span>
    </>
  );

  if (!isLinkable(product)) {
    return <li className="gdr-row gdr-row-quiet">{body}</li>;
  }

  return (
    <li>
      <a
        data-row
        href={product.href}
        target={product.current ? undefined : "_blank"}
        rel={product.current ? undefined : "noopener noreferrer"}
        onClick={onNavigate}
        className="gdr-row gdr-row-link"
      >
        {body}
      </a>
    </li>
  );
}

/**
 * The stylesheet.
 *
 * Every colour reads a host token first and falls back second, so this looks
 * native inside a shadcn theme and correct outside one. The dark fallbacks are
 * under `prefers-color-scheme` rather than a class, because a product without a
 * design system has no theme class to hook.
 */
function scopedCss(id: string): string {
  return `
[data-gdr="${id}"] {
  --gdr-fg: var(--foreground, #0b0d10);
  --gdr-muted: var(--muted-foreground, #616a75);
  --gdr-surface: var(--popover, #ffffff);
  --gdr-line: var(--border, #e4e7ec);
  --gdr-accent: var(--accent, #f2f4f7);
  --gdr-brand: var(--primary, #3355ff);
  --gdr-chip: var(--muted, #f2f4f7);
  color: var(--gdr-fg);
}
@media (prefers-color-scheme: dark) {
  [data-gdr="${id}"] {
    --gdr-fg: var(--foreground, #f5f7fa);
    --gdr-muted: var(--muted-foreground, #98a2b3);
    --gdr-surface: var(--popover, #14171c);
    --gdr-line: var(--border, #262b33);
    --gdr-accent: var(--accent, #1d222a);
    --gdr-chip: var(--muted, #1d222a);
  }
}
button[data-gdr="${id}"].gdr-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.375rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
button[data-gdr="${id}"].gdr-trigger:hover { background: var(--gdr-accent); }
button[data-gdr="${id}"].gdr-trigger svg { transition: transform 180ms ease; }
nav[data-gdr="${id}"].gdr-panel {
  position: absolute;
  inset-inline-start: 0;
  z-index: 50;
  max-height: calc(100dvh - 5rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--gdr-line);
  border-radius: 0.75rem;
  background: var(--gdr-surface);
  box-shadow: 0 12px 32px -8px rgb(0 0 0 / 0.18);
  transition: opacity 180ms ease, transform 180ms ease;
}
nav[data-gdr="${id}"][data-placement="below"] {
  top: 100%;
  margin-top: 0.5rem;
  transform-origin: top;
}
nav[data-gdr="${id}"][data-placement="above"] {
  bottom: 100%;
  margin-bottom: 0.5rem;
  transform-origin: bottom;
}
nav[data-gdr="${id}"][data-open="false"] {
  visibility: hidden;
  opacity: 0;
  transform: scale(0.97);
}
nav[data-gdr="${id}"][data-open="true"] {
  visibility: visible;
  opacity: 1;
  transform: scale(1);
}
[data-gdr="${id}"] .gdr-heading {
  margin: 0;
  padding: 0.75rem 0.875rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gdr-muted);
}
[data-gdr="${id}"] .gdr-labs-heading {
  display: flex;
  align-items: center;
  border-top: 1px solid var(--gdr-line);
}
[data-gdr="${id}"] .gdr-labs-heading .gdr-heading-divided {
  flex: 1;
  border-top: 0;
}
[data-gdr="${id}"] .gdr-heading-divided { border-top: 1px solid var(--gdr-line); }
[data-gdr="${id}"] .gdr-list { margin: 0; padding: 0 0 0.375rem; list-style: none; }
[data-gdr="${id}"] .gdr-labs-toggle {
  display: flex;
  width: auto;
  justify-content: center;
  border: 0;
  background: var(--gdr-surface);
  color: var(--gdr-muted);
  cursor: pointer;
  padding: 0.5rem 0.875rem;
}
[data-gdr="${id}"] .gdr-labs-toggle svg { transition: transform 180ms ease; }
[data-gdr="${id}"] .gdr-labs-toggle:hover,
[data-gdr="${id}"] .gdr-labs-toggle:focus-visible { color: var(--gdr-brand); background: var(--gdr-accent); }
[data-gdr="${id}"] .gdr-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  text-decoration: none;
  color: inherit;
}
[data-gdr="${id}"] .gdr-row-quiet { opacity: 0.8; }
[data-gdr="${id}"] .gdr-row-link { transition: background 120ms ease; }
[data-gdr="${id}"] .gdr-row-link:hover,
[data-gdr="${id}"] .gdr-row-link:focus-visible { background: var(--gdr-accent); }
[data-gdr="${id}"] .gdr-glyph { margin-top: 0.125rem; flex: none; color: var(--gdr-muted); }
[data-gdr="${id}"] .gdr-glyph-here { color: var(--gdr-brand); }
[data-gdr="${id}"] .gdr-text { min-width: 0; flex: 1; }
[data-gdr="${id}"] .gdr-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
[data-gdr="${id}"] .gdr-name { font-size: 0.875rem; font-weight: 600; }
[data-gdr="${id}"] .gdr-chip {
  border-radius: 9999px;
  background: var(--gdr-chip);
  padding: 0.0625rem 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--gdr-muted);
}
[data-gdr="${id}"] .gdr-chip-here { color: var(--gdr-brand); }
[data-gdr="${id}"] .gdr-blurb {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--gdr-muted);
}
@media (prefers-reduced-motion: reduce) {
  [data-gdr="${id}"] * { transition: none !important; }
}
`;
}
