import { useEffect, useRef, useState } from "react";
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
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "../../lib/utils";
import { TONES, TONE_HEX, statusTone, riskTone, formatDate } from "./detailKitUtils";

/**
 * Component half of the detail kit. This module must export *only* components
 * so React Fast Refresh can treat it as a refresh boundary — formatters, tone
 * maps and hooks live in `./detailKitUtils`. Import those from there directly;
 * re-exporting them here would break the boundary again.
 */

export const StatusBadge = ({ status, className }: { status?: string; className?: string }) => (
  <Badge variant="outline" className={cn("border font-medium", TONES[statusTone(status)], className)}>
    {status || "—"}
  </Badge>
);

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

/** Shown in place of a page (or a tab) the signed-in role may not read. */
export const PermissionDenied = ({ message }: { message?: string }) => {
  const { t } = useTranslation("customerManagement");
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
        <ShieldAlert className="size-7" />
      </span>
      <h3 className="m-0 text-sm font-semibold text-foreground">{t("permission.deniedTitle")}</h3>
      <p className="m-0 max-w-sm text-sm text-muted-foreground">{message || t("permission.deniedMessage")}</p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Onboarding stepper                                                  */
/* ------------------------------------------------------------------ */

/**
 * Onboarding progress rail. Reads `onboarding.steps` — each step being
 * `{ step, label, labelAr, status, occurredAt }` with status one of
 * COMPLETED / CURRENT / FAILED / PENDING.
 *
 * Renders nothing when there are no steps, so a page can mount it
 * unconditionally against a payload that may not carry them.
 *
 * Presentation lives in the `.onb360-page .onb-*` rules in `styles/tokens.css`,
 * so every page using this gets the animation and RTL connector mirroring.
 */
export const OnboardingStepper = ({
  onboarding,
  isAr,
  hideWhenEmpty = false,
}: {
  onboarding?: any;
  isAr?: boolean;
  hideWhenEmpty?: boolean;
}) => {
  const { t } = useTranslation("customerManagement");
  const steps: any[] = onboarding?.steps || [];

  if (hideWhenEmpty && steps.length === 0 && !onboarding?.failureReason) return null;

  return (
    <div className="px-4 py-3 md:px-5">
      {onboarding?.failureReason && (
        <div className={cn("mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", TONES.red)}>
          <AlertTriangle className="size-4 shrink-0" />
          {onboarding.failureReason}
        </div>
      )}

      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("onboarding360.stepper.noSteps")}</p>
      ) : (
        /* Each step is an equal-width column so its label is bounded by the
           column (wraps, never overlaps the neighbour) — no horizontal scroll.
           Connectors are absolute lines drawn from each circle's centre to the
           next, sitting behind the circles. */
        <div className="relative flex items-start">
          {steps.map((step: any, idx: number) => {
            const status = (step.status || "PENDING").toUpperCase();
            const isFirst = idx === 0;
            const done = status === "COMPLETED";
            const current = status === "CURRENT";
            const failed = status === "FAILED";
            const prevDone = idx > 0 && (steps[idx - 1]?.status || "PENDING").toUpperCase() === "COMPLETED";
            const circle = done
              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
              : failed
              ? "border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/30"
              : current
              ? "border-emerald-500 text-emerald-600 ring-4 ring-emerald-500/15"
              : "border-border text-muted-foreground";
            return (
              <div key={step.step ?? idx} className="relative flex min-w-0 flex-1 flex-col items-center">
                {/* Connector from the previous circle's centre to this one. */}
                {!isFirst && (
                  <div
                    className={cn(
                      "onb-connector absolute top-5 z-0 h-0.5 rounded-full transition-colors duration-500",
                      prevDone ? "bg-emerald-500" : "bg-border"
                    )}
                    style={{ animationDelay: `${idx * 0.18 + 0.1}s` }}
                  />
                )}
                <div
                  className={cn(
                    "onb-step-circle relative z-10 flex size-10 items-center justify-center rounded-full border-2 bg-background transition-all duration-300",
                    circle
                  )}
                  style={{ animationDelay: `${idx * 0.18}s` }}
                >
                  {done ? (
                    <Check className="size-5" strokeWidth={3} />
                  ) : failed ? (
                    <AlertTriangle className="size-5" />
                  ) : (
                    <span className="text-sm font-semibold">{idx + 1}</span>
                  )}
                </div>
                <div className="mt-2 w-full px-1 text-center leading-tight">
                  <div className="onb-label" style={{ animationDelay: `${idx * 0.18 + 0.15}s` }}>
                    <span
                      className={cn(
                        "block break-words text-xs",
                        done || current ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                      )}
                    >
                      {isAr ? step.labelAr || step.label : step.label}
                    </span>
                    {step.occurredAt && (
                      <div className="text-[10px] text-muted-foreground">{formatDate(step.occurredAt)}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Risk gauge                                                          */
/* ------------------------------------------------------------------ */

/**
 * How far to fill the arc when the backend gives a risk *level* but no numeric
 * score. The band is the honest reading of "HIGH" — so the ring shows the band
 * and the centre shows the level word. We never render a fabricated number.
 */
const LEVEL_FILL: Record<string, number> = {
  LOW: 33,
  MEDIUM: 66,
  HIGH: 100,
  CRITICAL: 100,
};

/**
 * Risk as a meter, not a chart: a single value against a fixed limit (0–100),
 * so a one-bar bar chart would be the wrong form. The track uses the same ramp
 * as the fill.
 *
 * Degrades in two steps, because the payload often carries a level with no
 * score: score → numeric arc + number; level only → band arc + level word;
 * neither → empty track + "—".
 *
 * The arc colour is a *status* token (good / warning / critical), so it is
 * always paired with the level text — status is never encoded by colour alone.
 */
export const RiskGauge = ({
  level,
  score,
  flags,
}: {
  level?: string;
  score?: number | null;
  flags?: React.ReactNode;
}) => {
  const { t } = useTranslation("customerManagement");
  const tone = riskTone(level);
  const color = TONE_HEX[tone];

  const numeric = score != null && score !== "" && !Number.isNaN(Number(score));
  const levelKey = (level || "").toUpperCase();
  const bandFill = LEVEL_FILL[levelKey];
  const hasBand = !numeric && bandFill != null;

  const value = numeric ? Math.max(0, Math.min(100, Number(score))) : hasBand ? bandFill : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative size-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="72%"
            outerRadius="100%"
            data={[{ name: "score", value, fill: color }]}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "var(--muted)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Proportional figures — tabular-nums makes a standalone number look loose. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <span
            className={cn("font-bold leading-none", hasBand ? "text-xl" : "text-3xl")}
            style={{ color }}
          >
            {numeric ? value : hasBand ? levelKey : "—"}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            {numeric || !hasBand ? t("onboarding360.risk.score") : t("onboarding360.risk.level")}
          </span>
        </div>
      </div>

      {/* Suppressed when the level is already the centre figure — otherwise the
          same word appears twice under one ring. */}
      {!hasBand && (
        <Badge variant="outline" className={cn("border text-[11px] font-semibold", TONES[tone])}>
          {level || t("onboarding360.risk.notAssessed")}
        </Badge>
      )}

      {flags && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {flags}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Tabs — underline style, matching the project-wide `.nav-tabs` look  */
/* ------------------------------------------------------------------ */

/**
 * Underline tab bar matching the rest of the app (the `.nav-tabs` look in
 * `assets/scss/custom.scss`, and the `.wallet-tabs` / `.coa-tabs` shadcn tab
 * bars in `styles/tokens.css`).
 *
 * The visual styling lives in `.detail-tabs` / `.detail-tab-trigger` in
 * `styles/tokens.css` rather than in Tailwind utilities here. shadcn's Tabs
 * carry their own `data-[state=active]:*` pill utilities, and tokens.css is
 * imported before `@import 'tailwindcss'` — so plain utilities lose the
 * cascade and the underline silently never paints. This is the same approach
 * the wallet and COA tab bars already use.
 *
 * Overflow is handled by a wrapper so a scroll container can never clip the
 * 2px ::after underline, which sits 1px below the trigger box.
 */
export const DetailTabsList = ({ className, ...props }: React.ComponentProps<typeof TabsList>) => (
  <div className="w-full max-w-full overflow-x-auto pb-px">
    <TabsList className={cn("detail-tabs", className)} {...props} />
  </div>
);

export const DetailTabsTrigger = ({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) => (
  <TabsTrigger className={cn("detail-tab-trigger", className)} {...props} />
);

/* ------------------------------------------------------------------ */
/* Tab-switch skeletons                                                */
/* ------------------------------------------------------------------ */

const SkeletonBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="onb-card rounded-xl border p-4 md:p-5">
    <div className="mb-4 flex items-center gap-2.5">
      <Skeleton className="size-8 rounded-lg" />
      <Skeleton className="h-4 w-40" />
    </div>
    {children}
  </div>
);

const FieldRows = ({ rows = 6 }: { rows?: number }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-4">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3.5 w-36" />
      </div>
    ))}
  </div>
);

/**
 * Placeholder for a tab body. `variant` only shapes the bars so the skeleton
 * roughly matches the layout that replaces it — no data required.
 */
export const TabSkeleton = ({
  variant = "fields",
  count = 2,
}: {
  variant?: "fields" | "cards" | "table" | "charts";
  count?: number;
}) => {
  if (variant === "cards") {
    return (
      <SkeletonBlock>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count * 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-3 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="h-8 flex-1 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonBlock>
    );
  }

  if (variant === "table") {
    return (
      <SkeletonBlock>
        <div className="overflow-hidden rounded-lg border">
          <Skeleton className="h-9 w-full rounded-none" />
          {Array.from({ length: count * 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t px-4 py-3">
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          ))}
        </div>
      </SkeletonBlock>
    );
  }

  if (variant === "charts") {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonBlock>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-10" />
            </div>
          </SkeletonBlock>
          <SkeletonBlock>
            <Skeleton className="h-[180px] w-full rounded-lg" />
          </SkeletonBlock>
        </div>
        <SkeletonBlock>
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </SkeletonBlock>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4", count > 1 && "lg:grid-cols-2")}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i}>
          <FieldRows />
        </SkeletonBlock>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Document image (lazy-loaded via a caller-supplied fetcher)          */
/* ------------------------------------------------------------------ */

/**
 * Process-wide cache of decoded document images, keyed by `cacheKey`.
 *
 * Radix unmounts inactive tab panels, so without this every tab switch refired
 * a document-image request — and these payloads are base64, hundreds of KB, and
 * slow. Entries are evicted least-recently-used so a long session can't grow
 * without bound.
 *
 * `cacheKey` MUST be unique per document *and* per owning customer. Passing a
 * bare `"selfie"` or a document `kind` would collide across customers and show
 * one person's document under another's record — always namespace with the
 * customer/membership id.
 */
const MAX_CACHED_IMAGES = 40;
const imageCache = new Map<string, string>();
const imageInFlight = new Map<string, Promise<string | null>>();

const cacheImage = (key: string, url: string) => {
  // Delete-then-set moves the entry to the tail, so `keys().next()` is always
  // the least-recently-used one.
  if (imageCache.has(key)) imageCache.delete(key);
  imageCache.set(key, url);
  while (imageCache.size > MAX_CACHED_IMAGES) {
    const oldest = imageCache.keys().next().value;
    if (oldest === undefined) break;
    imageCache.delete(oldest);
  }
};

/**
 * Read through the cache, marking the entry as recently used. Reading with a
 * bare `imageCache.get` would leave recency untouched and degrade the cache to
 * FIFO — an image you keep coming back to could be evicted before one you
 * loaded once and never looked at again.
 */
const getCachedImage = (key: string): string | undefined => {
  const hit = imageCache.get(key);
  if (hit !== undefined) cacheImage(key, hit);
  return hit;
};

/**
 * Document images are hundreds of KB each and can take tens of seconds. Left
 * unbounded they fill the browser's ~6-connection-per-host budget and starve
 * every other request on the page — that is what made the Owner tab's
 * `documents-bundle` call sit queued behind a wall of in-flight images. Cap how
 * many run at once so ordinary API calls always have a connection available.
 */
const MAX_CONCURRENT_IMAGE_LOADS = 3;
let activeImageLoads = 0;
const imageWaitQueue: Array<() => void> = [];

const acquireImageSlot = (): Promise<void> =>
  new Promise((resolve) => {
    if (activeImageLoads < MAX_CONCURRENT_IMAGE_LOADS) {
      activeImageLoads += 1;
      resolve();
      return;
    }
    imageWaitQueue.push(() => {
      activeImageLoads += 1;
      resolve();
    });
  });

const releaseImageSlot = () => {
  activeImageLoads = Math.max(0, activeImageLoads - 1);
  imageWaitQueue.shift()?.();
};

/** Fetch-once per key: concurrent callers share one request. */
const loadImage = (
  key: string,
  fetcher: () => Promise<{ base64Image?: string; contentType?: string } | null>
): Promise<string | null> => {
  const hit = getCachedImage(key);
  if (hit) return Promise.resolve(hit);
  const pending = imageInFlight.get(key);
  if (pending) return pending;

  const request = acquireImageSlot()
    .then(() => fetcher())
    .then((d) => {
      if (!d?.base64Image) return null;
      const url = `data:${d.contentType || "image/jpeg"};base64,${d.base64Image}`;
      cacheImage(key, url);
      return url;
    })
    .finally(() => {
      releaseImageSlot();
      imageInFlight.delete(key);
    });

  imageInFlight.set(key, request);
  return request;
};

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
  const key = cacheKey ? String(cacheKey) : "";
  // Seed from cache so a cached image paints on the first frame — no skeleton
  // flash when returning to a tab.
  const [src, setSrc] = useState<string | null>(() => (key ? getCachedImage(key) ?? null : null));
  const [err, setErr] = useState(false);
  const [inView, setInView] = useState(false);
  const holderRef = useRef<HTMLDivElement>(null);

  // `fetcher` is an inline arrow at every call site, so its identity changes
  // each render. Hold the latest in a ref and keep it out of effect deps.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Only request what the user can actually see (plus a 300px lead-in), instead
  // of firing every tile on the grid at once.
  useEffect(() => {
    if (!key || src || inView) return;
    const el = holderRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [key, src, inView]);

  useEffect(() => {
    if (!key) {
      setErr(true);
      return;
    }
    const cached = getCachedImage(key);
    if (cached) {
      setSrc(cached);
      setErr(false);
      return;
    }
    if (!inView) return;

    let alive = true;
    setErr(false);
    loadImage(key, () => fetcherRef.current())
      .then((url) => {
        if (!alive) return;
        if (url) setSrc(url);
        else setErr(true);
      })
      .catch(() => alive && setErr(true));
    return () => {
      alive = false;
    };
  }, [key, inView]);

  if (err)
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
        {t("onboarding360.doc.failedToLoad", { label })}
      </div>
    );
  if (!src)
    return (
      <div ref={holderRef}>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  return (
    <button
      type="button"
      onClick={() => onEnlarge?.(src, label)}
      className="group relative block w-full overflow-hidden rounded-lg border"
    >
      <img
        src={src}
        alt={label}
        loading="lazy"
        decoding="async"
        className="h-48 w-full bg-muted object-cover transition-transform duration-200 group-hover:scale-105"
      />
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
