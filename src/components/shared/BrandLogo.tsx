import type { ImgHTMLAttributes } from "react";
import { Images } from "../Config/Images";

type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  alt?: string;
  /** Render the compact mark (icon only) instead of the full wordmark. */
  mark?: boolean;
};

/**
 * Finova logo that follows the active theme: the dark wordmark on light
 * surfaces, the white wordmark in dark mode. Both images are rendered and the
 * `.brand-logo--light` / `.brand-logo--dark` rules in tokens.css pick one.
 */
const BrandLogo = ({ alt = "Finova", className = "", mark = false, ...imgProps }: BrandLogoProps) => (
  <>
    <img
      {...imgProps}
      src={mark ? Images.FinovaMark : Images.FactoringLogo}
      alt={alt}
      className={`brand-logo brand-logo--light ${className}`.trim()}
    />
    <img
      {...imgProps}
      src={mark ? Images.FinovaMarkDark : Images.FactoringLogoDark}
      alt={alt}
      className={`brand-logo brand-logo--dark ${className}`.trim()}
    />
  </>
);

export default BrandLogo;
