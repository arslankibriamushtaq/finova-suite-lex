import "./Loader.css";

type Size = "sm" | "md" | "lg";

/**
 * Compact branded inline spinner — the same brand-coloured ring as the
 * full-screen <Loader/>, scaled for stat cards, modals and buttons.
 * Exported as `PulseLoading` to stay drop-in compatible with existing imports.
 */
const PulseLoading = ({ size = "md" }: { size?: Size } = {}) => {
  const sizeClass =
    size === "sm" ? "brand-spinner--sm" : size === "lg" ? "brand-spinner--lg" : "";
  return <span className={`brand-spinner ${sizeClass}`.trim()} role="status" aria-label="Loading" />;
};

export default PulseLoading;
