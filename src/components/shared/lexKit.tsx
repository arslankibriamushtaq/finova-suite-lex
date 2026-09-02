import React from "react";
import { AlertTriangle, Ban, Info, type LucideIcon } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SearchField } from "./filterKit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";
import { TONES, TONE_HEX, formatDateTime } from "./detailKitUtils";
import { employerCategoryOf } from "../../redux/apis/apisLexCases";

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
  /** Text, or a node where the sub-line carries a code, a chip or a link. */
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  // Spacing uses arbitrary values on purpose: Bootstrap ships `.mb-3` / `.pb-2`
  // unlayered with different values, so a plain Tailwind class here would be
  // silently overridden. `text-dark` was doing the same kind of damage — it
  // pinned the title to near-black, so every one of these headers stayed dark
  // grey in dark mode.
  <div className="mb-[1.5rem] flex flex-wrap items-center justify-between gap-3 border-b border-[var(--surface-border)] pb-[0.875rem]">
    <div className="min-w-0">
      <h3 className="mb-0 flex items-center gap-2.5 font-bold text-foreground">
        <span className="pro-head-badge">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h3>
      {subtitle && (
        <p className="mb-0 mt-1.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
    </div>
    {children && <div className="flex items-center gap-2">{children}</div>}
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

/**
 * The Approved Employer List verdict.
 *
 * One component for all three values so they cannot drift apart on one screen
 * and merge on another. **`UNKNOWN` is styled apart from `NOT_WHITELISTED` on
 * purpose**: the first says nobody ran the check — no employer name, or the
 * list was unreachable — and the second says the check ran and found no active
 * listing. Only the second is grounds for declining, so collapsing them would
 * manufacture an adverse finding out of a lookup that never happened.
 */
export const LexEmployerBadge = ({
  category,
  t,
  className,
}: {
  category?: string | null;
  t: (key: string) => string;
  className?: string;
}) => {
  const resolved = employerCategoryOf(category);
  if (!resolved) return <span className={cn("text-sm", className)}>—</span>;

  return (
    <Badge
      variant="outline"
      className={cn("border font-medium", TONES[resolved.tone], className)}
      title={t(resolved.hintKey)}
    >
      {t(resolved.labelKey)}
    </Badge>
  );
};

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
  icon: Icon,
  tone = "slate",
  loading,
}: {
  label: string;
  /** A count, or an already-formatted figure such as "2h 15m". */
  value?: React.ReactNode;
  denominator?: number | null;
  hint?: string;
  icon?: LucideIcon;
  tone?: keyof typeof TONE_HEX | string;
  loading?: boolean;
}) => {
  // A share is only meaningful over a raw count. A formatted duration is not a
  // numerator, so a tile holding one gets no bar rather than a wrong one.
  const share =
    typeof value === "number" && denominator != null && denominator > 0
      ? (value / denominator) * 100
      : null;

  return (
    <div
      // Border, gradient, badge, share pill and bar are all mixed from one
      // custom property, so a tile can never end up part one colour and part
      // another — and a new tone needs a hex, not a stylesheet edit.
      style={{ "--c": TONE_HEX[tone as string] || TONE_HEX.slate } as React.CSSProperties}
      className={cn("lex-kpi", hint && "cursor-help")}
      title={hint}
    >
      {Icon ? (
        <span className="lex-kpi__icon" aria-hidden="true">
          <Icon />
        </span>
      ) : null}

      <span className="lex-kpi__label">
        {label}
        {/* The hint is a native tooltip, invisible until hovered. The mark is
            what tells a reader there is one to hover. */}
        {hint ? <Info className="lex-kpi__hint" aria-hidden="true" /> : null}
      </span>

      {loading ? (
        <span className="mt-2 block h-8 w-24 animate-pulse rounded-[2px] bg-muted-foreground/20" />
      ) : (
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="lex-kpi__value">{value ?? "—"}</span>
          {share !== null && <span className="lex-kpi__share">{share.toFixed(1)}%</span>}
        </div>
      )}

      {/* No denominator means no bar. An empty track would read as 0%, which is
          a different claim from "this is not a share of anything". */}
      {share !== null && (
        <div className="lex-kpi__track">
          <div className="lex-kpi__fill" style={{ width: `${Math.min(100, share)}%` }} />
        </div>
      )}
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
  // A shadcn Button rather than a bare one, purely so it carries
  // data-slot="button": that attribute is what the app's filter-bar rules match
  // to pin every control in a .pro-card.p-3 row to 34px. As a plain button with
  // h-10 it stood 6px taller than the search field, the sort select and Refresh
  // beside it.
  <Button
    type="button"
    variant="outline"
    disabled
    title={title}
    className="cursor-not-allowed gap-1.5 border-dashed bg-muted/30 font-normal text-muted-foreground"
  >
    <Ban className="h-3.5 w-3.5" />
    {label}
  </Button>
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
                isCurrent ? "bg-red-500" : "bg-muted-foreground/40"
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
/**
 * The Product half of a scope, read from the LOS catalogue.
 *
 * "All Products" is the wildcard (`productId: null`), added by the picker just
 * as "All Sectors" is. The id must be one the LOS catalogue actually has: a
 * scope naming an unknown product is refused with `LEX.PRODUCT.UNKNOWN_SCOPE`,
 * so post ids that came from here rather than remembered or hand-typed ones.
 *
 * The validation is deliberately not a hard dependency — if `product-service`
 * cannot be reached the scope saves unchecked, because refusing to save a
 * configuration during an unrelated outage would strand authoring entirely.
 */
export const LexProductSelect = ({
  value,
  onChange,
  products,
  allProductsLabel,
  disabled,
  className,
}: {
  /** `null` means All Products. */
  value: string | null;
  onChange: (next: string | null) => void;
  products: { id: string; name: string }[];
  allProductsLabel: string;
  disabled?: boolean;
  className?: string;
}) => {
  const ALL = "__ALL__";
  /**
   * A scope may already name a product this catalogue no longer returns.
   * Keeping it as an option stops the next save silently widening the scope to
   * All Products.
   */
  const options = products.some((p) => p.id === value)
    ? products
    : value
      ? [{ id: value, name: value }, ...products]
      : products;

  return (
    <Select
      value={value ?? ALL}
      disabled={disabled}
      onValueChange={(next) => onChange(next === ALL ? null : next)}
    >
      <SelectTrigger className={cn("h-10 bg-card", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allProductsLabel}</SelectItem>
        {options.map((product) => (
          <SelectItem key={product.id} value={product.id}>
            {product.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

/**
 * The Sector half of a scope.
 *
 * **"All Sectors" is the wildcard, not a row.** It is `sectorId: null`, so the
 * picker adds the option itself and maps it back to null on the way out —
 * sending a literal id for it would name a sector the company does not have,
 * which the server refuses with `LEX.SECTOR.UNKNOWN_SCOPE`.
 *
 * The options come from `GET /config/sectors`; nothing here is hardcoded,
 * because the list is data and a company can add a segment at any time.
 */
export const LexSectorSelect = ({
  value,
  onChange,
  sectors,
  allSectorsLabel,
  disabled,
  className,
}: {
  /** `null` means All Sectors. */
  value: string | null;
  onChange: (next: string | null) => void;
  sectors: { id: string; displayName: string; active?: boolean }[];
  allSectorsLabel: string;
  disabled?: boolean;
  className?: string;
}) => {
  const ALL = "__ALL__";
  /**
   * A deactivated sector still named by this scope stays in the list, marked.
   * Dropping it would silently rewrite the scope to All Sectors on the next
   * save — a much wider rule than anybody chose.
   */
  const options = sectors.filter((s) => s.active !== false || s.id === value);

  return (
    <Select
      value={value ?? ALL}
      disabled={disabled}
      onValueChange={(next) => onChange(next === ALL ? null : next)}
    >
      <SelectTrigger className={cn("h-10 bg-card", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allSectorsLabel}</SelectItem>
        {options.map((sector) => (
          <SelectItem key={sector.id} value={sector.id}>
            {sector.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

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
