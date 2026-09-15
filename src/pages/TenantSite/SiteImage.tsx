import { useState } from "react";

/**
 * Any `*Url` the API sends can be null — the tenant never uploaded one, or the
 * object store is unreachable — and a URL that is present can still fail to
 * load. The page must be presentable without a single image, so every image
 * falls back to text rather than a broken frame.
 */
const SiteImage = ({
  src,
  alt,
  className,
  fallback,
  imgProps,
}: {
  src: string | null;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  /** Escape hatch for per-image hints — `loading`, `fetchPriority`, `aria-hidden`. */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <>{fallback ?? null}</>;

  return (
    <img {...imgProps} src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
};

export default SiteImage;
