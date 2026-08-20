import React from "react";
import { AlertTriangle, Info, type LucideIcon } from "lucide-react";

import { Badge } from "../ui/badge";
import { SearchField } from "./filterKit";
import { cn } from "../../lib/utils";
import { TONES, formatDateTime } from "./detailKitUtils";

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
  id,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  delay?: number;
  id?: string;
  className?: string;
}) => {
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => setDraft(value), [value]);

  React.useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChange(draft), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, delay]);

  // Presentation is the shared SearchField, so a LEX list searches and clears
  // exactly like every other list page; only the debounce is LEX's own.
  return (
    <SearchField
      id={id}
      value={draft}
      onChange={setDraft}
      placeholder={placeholder}
      className={className ?? "w-64"}
    />
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
};

export const LexStatusBadge = ({ status, className }: { status?: string; className?: string }) => (
  <Badge
    variant="outline"
    className={cn("border font-medium", TONES[LEX_STATUS_TONE[String(status)] || "slate"], className)}
  >
    {status || "—"}
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
  <div className={cn("pro-tile", hint && "cursor-help")} title={hint}>
    <span className="pro-tile__label">{label}</span>
    {loading ? (
      <span className="mt-1.5 block h-[18px] w-16 animate-pulse rounded-[2px] bg-muted-foreground/20" />
    ) : (
      <span className={cn("pro-tile__value", tone === "accent" && "pro-tile__value--accent")}>
        {value}
      </span>
    )}
  </div>
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
/**
 * `publishedBy` comes back as a user id, not a name. A raw UUID on an audit
 * screen reads as noise — it is not something a person can act on — so a
 * uuid-shaped value is dropped rather than printed.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
        const at = formatDateTime(entry.at);
        const by = entry.by && !UUID_RE.test(entry.by) ? entry.by : null;
        return (
          <li key={entry.id} className="relative flex border-s border-border ps-4 pb-2 last:pb-0">
            <span
              className={cn(
                "absolute -start-[5px] top-3 size-2.5 rounded-full ring-2 ring-background",
                isCurrent ? "bg-emerald-500" : "bg-muted-foreground/40"
              )}
            />
            <div
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={() => onSelect?.(entry.id)}
              onKeyDown={(e) => {
                if (!onSelect) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(entry.id);
                }
              }}
              className={cn(
                "min-w-0 flex-1 rounded-[2px] border px-3 py-2 transition-colors",
                isCurrent ? "pro-tile" : "border-transparent",
                onSelect && !isCurrent && "cursor-pointer hover:border-border hover:bg-muted/40",
                onSelect && isCurrent && "cursor-pointer"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">v{entry.version ?? "—"}</span>
                <LexStatusBadge status={entry.status} />
                {at && <span className="text-xs text-muted-foreground">{at}</span>}
                {by && <span className="text-xs text-muted-foreground">· {by}</span>}
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
