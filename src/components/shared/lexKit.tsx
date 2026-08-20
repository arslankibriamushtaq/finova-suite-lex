import React from "react";
import { AlertTriangle, Ban, Info, Search, type LucideIcon } from "lucide-react";

import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { TONES, TONE_HEX, formatDateTime } from "./detailKitUtils";

/**
 * The presentation pieces every LEX screen shares.
 *
 * Components only — Fast Refresh treats this file as a boundary, so anything
 * that is not a component belongs in the api modules under `redux/apis/apisLex*`.
 */

/* ------------------------------------------------------------------ */
/* Page furniture                                                      */
/* ------------------------------------------------------------------ */

export const LexPageHeader = ({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) => (
  <div className="mb-3 pb-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
    <div className="min-w-0">
      <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
        <span className="pro-head-badge">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h3>
      {subtitle && <p className="mb-0 mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {children && <div className="d-flex align-items-center gap-2">{children}</div>}
  </div>
);

/**
 * A short statement of a rule or a consequence. Used for the things the API
 * enforces and the UI must not soften — an immutable publish, a blocking check,
 * a delist that withdraws terms from every employee of an employer.
 */
export const LexNotice = ({
  tone = "amber",
  icon: Icon,
  children,
  className,
}: {
  tone?: keyof typeof TONES | string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) => {
  const Glyph = Icon || (tone === "amber" || tone === "red" ? AlertTriangle : Info);
  return (
    <div
      className={cn(
        "mb-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ring-1",
        TONES[tone as string] || TONES.slate,
        className
      )}
    >
      <Glyph className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
};

/**
 * `TableView`'s own search box is not wired to anything, so LEX lists carry
 * their own input and pass `search` to the endpoint. Debounced, because the
 * list endpoints take `search` server-side and one call per keystroke is a lot
 * of calls.
 */
export const LexSearch = ({
  value,
  onChange,
  placeholder,
  delay = 350,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  delay?: number;
}) => {
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => setDraft(value), [value]);

  React.useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChange(draft), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, delay]);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-56 border-0 bg-transparent text-sm outline-none"
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Status vocabulary                                                   */
/* ------------------------------------------------------------------ */

/**
 * One tone map for every LEX status word, so ARCHIVED, SUPERSEDED and RETIRED
 * read as "out of force, still here" everywhere rather than as failures.
 */
const LEX_STATUS_TONE: Record<string, string> = {
  DRAFT: "amber",
  PUBLISHED: "emerald",
  ARCHIVED: "slate",
  LIVE: "emerald",
  SUPERSEDED: "slate",
  RETIRED: "slate",
  ACTIVE: "emerald",
  INACTIVE: "slate",

  // Case lifecycle. A case parked on the source or on a field visit is waiting,
  // not failing, so it reads amber rather than red.
  OPEN: "sky",
  IN_REVIEW: "sky",
  AWAITING_SOURCE: "amber",
  AWAITING_PHYSICAL_VERIFICATION: "amber",
  ESCALATED: "orange",
  APPROVED: "emerald",
  DECLINED: "red",
  RESOLVED: "emerald",
  CLOSED: "slate",
};

/**
 * `status` picks the tone; `label` overrides the words. A decided case takes its
 * wording from the decision verb rather than from the lifecycle — `RESOLVED`
 * alone would print the same chip on an approval and a decline.
 */
export const LexStatusBadge = ({
  status,
  label,
  className,
}: {
  status?: string;
  label?: string;
  className?: string;
}) => (
  <Badge
    variant="outline"
    className={cn("border font-medium", TONES[LEX_STATUS_TONE[String(status)] || "slate"], className)}
  >
    {label || status || "—"}
  </Badge>
);

/* ------------------------------------------------------------------ */
/* Tiles                                                               */
/* ------------------------------------------------------------------ */

export const LexTile = ({
  label,
  value,
  hint,
  tone,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: string;
  loading?: boolean;
}) => (
  <div className="pro-tile" title={hint}>
    <span className="pro-tile__label">{label}</span>
    {loading ? (
      <span className="mt-1.5 block h-[18px] w-16 animate-pulse rounded-[2px] bg-muted-foreground/20" />
    ) : (
      <span className={cn("pro-tile__value", tone === "accent" && "pro-tile__value--accent")}>
        {value}
      </span>
    )}
    {hint && <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{hint}</span>}
  </div>
);

/**
 * A headline figure with its share of the whole.
 *
 * The share is the client's own arithmetic — the server sends counts and never
 * percentages — so `denominator` is explicit rather than assumed. It is omitted
 * entirely when there is no denominator this tile is honestly a share of.
 */
export const LexMetricTile = ({
  label,
  value,
  denominator,
  hint,
  tone = "sky",
  loading,
}: {
  label: string;
  value?: number | null;
  denominator?: number | null;
  hint?: string;
  tone?: keyof typeof TONE_HEX | string;
  loading?: boolean;
}) => {
  const share =
    value != null && denominator != null && denominator > 0 ? (value / denominator) * 100 : null;

  return (
    <div className="pro-card flex flex-col gap-2 p-4">
      <span className="pro-tile__label">{label}</span>
      {loading ? (
        <span className="block h-7 w-20 animate-pulse rounded-[3px] bg-muted-foreground/20" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold leading-none tracking-tight text-foreground">
            {value ?? "—"}
          </span>
          {share !== null && (
            <span className="text-xs text-muted-foreground">{share.toFixed(1)}%</span>
          )}
        </div>
      )}
      {/* No denominator means no bar. An empty track would read as 0%, which is
          a different claim from "this is not a share of anything". */}
      {share !== null && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              width: `${Math.min(100, share)}%`,
              backgroundColor: TONE_HEX[tone as string] || TONE_HEX.sky,
            }}
          />
        </div>
      )}
      {hint && <span className="text-[11px] leading-snug text-muted-foreground">{hint}</span>}
    </div>
  );
};

/**
 * A control the mockup asks for that no endpoint can answer yet. Rendered
 * disabled and labelled, rather than omitted: a filter that silently is not
 * there reads as a screen someone forgot to finish, and one that is there but
 * does nothing is worse.
 */
export const LexUnavailableFilter = ({ label, title }: { label: string; title: string }) => (
  <button
    type="button"
    disabled
    title={title}
    className="flex h-10 cursor-not-allowed items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-3 text-sm text-muted-foreground"
  >
    <Ban className="h-3.5 w-3.5" />
    {label}
  </button>
);

/* ------------------------------------------------------------------ */
/* Version lineage                                                     */
/* ------------------------------------------------------------------ */

export interface LexTimelineEntry {
  id: string;
  version?: number;
  status?: string;
  at?: string;
  by?: string;
  note?: string;
}

/**
 * How an auditor answers "what did this rule say in March?". Newest first, and
 * every version is listed — archived and superseded ones are the point.
 */
export const LexVersionTimeline = ({
  entries,
  currentId,
  onSelect,
  emptyText,
}: {
  entries: LexTimelineEntry[];
  currentId?: string;
  onSelect?: (id: string) => void;
  emptyText: string;
}) => {
  if (!entries.length) {
    return <p className="m-0 py-6 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <ol className="m-0 list-none p-0">
      {entries.map((entry) => {
        const isCurrent = entry.id === currentId;
        return (
          <li
            key={entry.id}
            className={cn(
              "relative flex gap-3 border-s border-border ps-4 pb-4 last:pb-0",
              onSelect && "cursor-pointer"
            )}
            onClick={() => onSelect?.(entry.id)}
          >
            <span
              className={cn(
                "absolute -start-[5px] top-1.5 size-2.5 rounded-full ring-2 ring-background",
                isCurrent ? "bg-emerald-500" : "bg-muted-foreground/40"
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">v{entry.version ?? "—"}</span>
                <LexStatusBadge status={entry.status} />
                <span className="text-xs text-muted-foreground">{formatDateTime(entry.at) || "—"}</span>
                {entry.by && <span className="text-xs text-muted-foreground">· {entry.by}</span>}
              </div>
              {entry.note && (
                <p className="m-0 mt-1 text-xs text-muted-foreground">{entry.note}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

/* ------------------------------------------------------------------ */
/* Scope                                                               */
/* ------------------------------------------------------------------ */

/**
 * Scope is never blank. A null product or sector means "all", and a blank cell
 * reads as missing configuration when it is in fact the widest possible one.
 */
export const LexScope = ({
  productName,
  sectorName,
  allProductsLabel,
  allSectorsLabel,
}: {
  productName?: string | null;
  sectorName?: string | null;
  allProductsLabel: string;
  allSectorsLabel: string;
}) => (
  <span className="text-sm">
    {productName || allProductsLabel} / {sectorName || allSectorsLabel}
  </span>
);
