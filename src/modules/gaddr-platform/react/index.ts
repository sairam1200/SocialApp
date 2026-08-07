/**
 * The React half of the contract.
 *
 * Separated from the rest because the rest imports nothing at all and this
 * imports React. The same split as `src/modules/assistant/`, and for the same
 * reason: a product that only wants the data should not have to take a UI
 * dependency to get it.
 *
 * `src/__tests__/platform-contract.test.ts` allows `react` and relative
 * specifiers here, and nothing else. A `@/` import would tie the switcher to
 * one application and break every copy of it.
 */

export { GaddrSwitcher, type GaddrSwitcherProps } from "./GaddrSwitcher";
export { PRODUCT_GLYPH_IDS, ProductGlyph } from "./ProductGlyph";
