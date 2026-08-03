import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  ZoomIn,
  ZoomOut,
  X,
  RotateCwSquare,
  RotateCcwSquare,
  Check,
  Copy,
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export const formatMoney = (value: any, currency?: string) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return `${currency ? currency + " " : ""}0.00`;
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

export const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ------------------------------------------------------------------ */
/* Tone / status helpers                                               */
/* ------------------------------------------------------------------ */

export const TONES: Record<string, string> = {
  emerald:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  amber:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  sky: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  orange:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
  red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  slate:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
};

export const TONE_HEX: Record<string, string> = {
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  sky: "#0ea5e9",
  slate: "#94a3b8",
};

export const statusTone = (status?: string): string => {
  switch ((status || "").toUpperCase()) {
    case "ACTIVE":
    case "COMPLETED":
    case "APPROVED":
    case "VERIFIED":
    case "SUCCESS":
      return "emerald";
    case "PENDING":
    case "PENDING_ACTIVATION":
    case "PENDING_REVIEW":
    case "IN_PROGRESS":
      return "amber";
    case "FROZEN":
      return "sky";
    case "SUSPENDED":
      return "orange";
    case "FAILED":
    case "REJECTED":
    case "CLOSED":
    case "BLOCKED":
      return "red";
    default:
      return "slate";
  }
};

export const riskTone = (level?: string): string => {
  switch ((level || "").toUpperCase()) {
    case "LOW":
      return "emerald";
    case "MEDIUM":
      return "amber";
    case "HIGH":
    case "CRITICAL":
      return "red";
    default:
      return "slate";
  }
};

export const StatusBadge = ({ status, className }: { status?: string; className?: string }) => (
  <Badge variant="outline" className={cn("border font-medium", TONES[statusTone(status)], className)}>
    {status || "—"}
  </Badge>
);

export const chartTooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 12,
  boxShadow: "var(--surface-elevation-2, 0 4px 12px rgba(0,0,0,0.12))",
};

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */

/** Label / value row. */
export const Field = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="-mx-2 flex items-center justify-between gap-4 rounded-md border-b border-border/60 px-2 py-2.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span
      className={cn(
        "min-w-0 break-words text-end font-medium text-foreground",
        mono && "font-mono text-xs"
      )}
    >
      {value ?? "—"}
    </span>
  </div>
);

/** Section title inside a tab. */
export const Block = ({ title, right, children, className, icon: Icon }: any) => (
  <div
    className={cn(
      "onb-card relative overflow-hidden rounded-xl border p-4 transition-shadow duration-200 hover:shadow-md md:p-5",
      className
    )}
  >
    {/* Soft emerald glow accent — consistent across all cards */}
    <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-emerald-500/[0.07] blur-2xl" />
    <div className="relative mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
            <Icon className="size-4" />
          </span>
        )}
        <h3 className="m-0 text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
      {right}
    </div>
    <div className="relative">{children}</div>
  </div>
);

export const CopyButton = ({ text }: { text?: string }) => {
  const { t } = useTranslation("customerManagement");
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label={t("onboarding360.action.copy")}
    >
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
    </button>
  );
};

export const EmptyState = ({ icon: Icon, text }: any) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
    <Icon className="size-8 text-muted-foreground/40" />
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Document image (lazy-loaded via a caller-supplied fetcher)          */
/* ------------------------------------------------------------------ */

export const DocImage = ({
  cacheKey,
  label,
  onEnlarge,
  fetcher,
}: {
  cacheKey?: string;
  label: string;
  onEnlarge?: (src: string, label: string) => void;
  fetcher: () => Promise<{ base64Image?: string; contentType?: string } | null>;
}) => {
  const { t } = useTranslation("customerManagement");
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!cacheKey) {
      setErr(true);
      return;
    }
    let alive = true;
    setErr(false);
    setSrc(null);
    fetcher()
      .then((d) => {
        if (alive && d?.base64Image) {
          setSrc(`data:${d.contentType || "image/jpeg"};base64,${d.base64Image}`);
        } else if (alive) {
          setErr(true);
        }
      })
      .catch(() => alive && setErr(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  if (err)
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
        {t("onboarding360.doc.failedToLoad", { label })}
      </div>
    );
  if (!src) return <Skeleton className="h-48 w-full rounded-lg" />;
  return (
    <button
      type="button"
      onClick={() => onEnlarge?.(src, label)}
      className="group relative block w-full overflow-hidden rounded-lg border"
    >
      <img src={src} alt={label} loading="lazy" className="h-48 w-full bg-muted object-cover transition-transform duration-200 group-hover:scale-105" />
      <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/45 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        <ZoomIn className="size-4" /> {t("onboarding360.doc.clickToEnlarge")}
      </span>
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Lightbox — enlarge + zoom (wheel / buttons) + rotate                */
/* ------------------------------------------------------------------ */

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

export const Lightbox = ({
  image,
  onClose,
}: {
  image: { src: string; label: string } | null;
  onClose: () => void;
}) => {
  const { t } = useTranslation("customerManagement");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [image?.src]);

  if (!image) return null;

  const clampZoom = (v: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v));

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
      onWheel={(e) => {
        e.preventDefault();
        setZoom((z) => clampZoom(z + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)));
      }}
    >
      <div
        className="relative flex max-h-[90vh] max-w-4xl flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 rounded-full bg-background/90 px-2 py-1.5 shadow-md ring-1 ring-border">
          <button
            type="button"
            onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
            disabled={zoom <= ZOOM_MIN}
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-30"
            aria-label={t("onboarding360.lightbox.zoomOut")}
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="min-w-10 px-1 text-center text-xs font-medium text-muted-foreground tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
            disabled={zoom >= ZOOM_MAX}
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-30"
            aria-label={t("onboarding360.lightbox.zoomIn")}
          >
            <ZoomIn className="size-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-border" />
          <button
            type="button"
            onClick={() => setRotation((r) => r - 90)}
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            aria-label={t("onboarding360.lightbox.rotateLeft")}
          >
            <RotateCcwSquare className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => r + 90)}
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            aria-label={t("onboarding360.lightbox.rotateRight")}
          >
            <RotateCwSquare className="size-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-border" />
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            aria-label={t("common:close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex max-h-[75vh] w-full items-center justify-center overflow-hidden">
          <img
            src={image.src}
            alt={image.label}
            className="max-h-[75vh] max-w-full select-none rounded-lg object-contain transition-transform duration-150"
            style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
            draggable={false}
          />
        </div>
        <div className="text-center text-sm font-medium text-white">{image.label}</div>
      </div>
    </div>,
    document.body
  );
};
