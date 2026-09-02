import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  Ban,
  Bell,
  Bitcoin,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  CreditCard,
  EyeOff,
  FileCheck2,
  FileText,
  Gavel,
  Globe,
  HandCoins,
  KeyRound,
  Landmark,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Wallet as WalletIcon,
  Workflow,
} from "lucide-react";

import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { cn } from "../../../lib/utils";
import { useLanguage } from "../../../hooks/use-language";
import { getCustomerTimeline } from "../../../redux/apis/apisCrud";
import { formatDateTime } from "../../../components/shared/detailKitUtils";

/* ------------------------------------------------------------------ */
/* Payload shapes — only the fields this page reads                    */
/* ------------------------------------------------------------------ */

type Tone = "POSITIVE" | "NEGATIVE" | "WARNING" | "NEUTRAL";

type TimelineEvent = {
  id: string;
  category?: string;
  type?: string;
  tone?: Tone | string;
  title?: string;
  titleAr?: string | null;
  description?: string | null;
  occurredAt?: string;
  source?: string;
  meta?: Record<string, string>;
};

type TimelineMonth = {
  year: number;
  month: number;
  monthName?: string;
  eventCount?: number;
  events?: TimelineEvent[];
};

type TimelineYear = {
  year: number;
  eventCount?: number;
  months?: TimelineMonth[];
};

type TimelinePayload = {
  customerId?: string;
  cifNumber?: string;
  customerName?: string;
  zoneId?: string;
  totalEvents?: number;
  years?: TimelineYear[];
};

type Side = "left" | "right";

/** One rendered line of the timeline: a year divider, or an event on a side. */
type TimelineRowModel =
  | { kind: "year"; year: number }
  | { kind: "event"; event: TimelineEvent; side: Side; monthLabel: string | null };

/* ------------------------------------------------------------------ */
/* Tone → colour                                                       */
/* ------------------------------------------------------------------ */

/**
 * Every colour on this screen comes from a `--timeline-*` token in tokens.css,
 * so the timeline follows the tenant theme instead of a stray Tailwind palette
 * (the brand has no green — a "positive" event is brand red, not emerald).
 *
 * The accent is category-first, with the two alarming tones overriding it: a
 * failed step or a hard block always reads negative, a soft block always reads
 * warning, whatever category it came from.
 */
const CATEGORY_ACCENTS: Record<string, string> = {
  ONBOARDING: "var(--timeline-onboarding)",
  CUSTOMER: "var(--timeline-customer)",
  BUSINESS: "var(--timeline-customer)",
  GLOBAL_PROFILE: "var(--timeline-customer)",
  AUTH: "var(--timeline-auth)",
  KYC: "var(--timeline-kyc)",
  CONSENT: "var(--timeline-kyc)",
  DOCUMENT: "var(--timeline-document)",
  PII: "var(--timeline-document)",
  PRIVACY: "var(--timeline-document)",
  RISK: "var(--timeline-risk)",
  FRAUD: "var(--timeline-fraud)",
  REVIEW_CASE: "var(--timeline-fraud)",
  BLOCK: "var(--timeline-block)",
  WALLET: "var(--timeline-wallet)",
  BANK_ACCOUNT: "var(--timeline-wallet)",
  TRANSACTION: "var(--timeline-transaction)",
  CRYPTO: "var(--timeline-transaction)",
  CARD: "var(--timeline-card)",
  LOAN: "var(--timeline-loan)",
  EMPLOYMENT: "var(--timeline-loan)",
  COLLECTION: "var(--timeline-collection)",
  NOTIFICATION: "var(--timeline-notification)",
};

const accentFor = (event: TimelineEvent): string => {
  if (event.tone === "NEGATIVE") return "var(--timeline-negative)";
  if (event.tone === "WARNING") return "var(--timeline-warning)";
  return CATEGORY_ACCENTS[String(event.category || "")] || "var(--timeline-neutral)";
};

/**
 * The accent lands on a row as `--evt`; everything below tints itself from that
 * one variable, so a card, its tail, its spine segment and its dot can never
 * drift apart. Set through `style` because the value is a variable, not a colour.
 */
const accentVar = (event: TimelineEvent) => ({ "--evt": accentFor(event) }) as React.CSSProperties;

/** Card surface + border, mixed against the card surface so both themes work. */
const CARD_SURFACE =
  "border-[color-mix(in_srgb,var(--evt)_30%,var(--surface-border))] bg-[color-mix(in_srgb,var(--evt)_7%,var(--surface-card))]";

/** One glyph per event category; unknown categories get the generic clock. */
const CATEGORY_ICONS: Record<string, typeof CalendarClock> = {
  ONBOARDING: Workflow,
  CUSTOMER: UserRound,
  BUSINESS: Building2,
  GLOBAL_PROFILE: Globe,
  AUTH: KeyRound,
  KYC: FileCheck2,
  CONSENT: ShieldCheck,
  DOCUMENT: FileText,
  PII: EyeOff,
  PRIVACY: EyeOff,
  RISK: ShieldAlert,
  FRAUD: ShieldAlert,
  REVIEW_CASE: Gavel,
  BLOCK: Ban,
  WALLET: WalletIcon,
  BANK_ACCOUNT: Landmark,
  TRANSACTION: ArrowLeftRight,
  CRYPTO: Bitcoin,
  CARD: CreditCard,
  LOAN: HandCoins,
  EMPLOYMENT: Briefcase,
  COLLECTION: Landmark,
  NOTIFICATION: Bell,
};

/**
 * A busy customer draws hundreds of wallet movements and notifications a month,
 * which buries the events an admin actually opened this screen for. Both are
 * folded away behind a toggle rather than dropped — the count is always shown.
 */
const NOISY_CATEGORIES = ["TRANSACTION", "NOTIFICATION"];

/** How many rows render before the "show more" button; keeps a huge history responsive. */
const PAGE_SIZE = 120;

/** "REVIEW_CASE" → "Review case". Categories are not translated by the API. */
const categoryLabel = (category: string) =>
  category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, " ");

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

const ALL = "__all__";

/** Years offered in the dropdown: current year back 10, newest first. */
const yearOptions = () => {
  const now = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => now - i);
};

const AccountTimeline = () => {
  const { t } = useTranslation("customerManagement");
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { id: customerId } = useParams();

  const [data, setData] = useState<TimelinePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [month, setMonth] = useState<string>(ALL);
  const [year, setYear] = useState<string>(ALL);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  /* Client-side only — the API always returns every category. */
  const [category, setCategory] = useState<string>(ALL);
  const [showNoisy, setShowNoisy] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const monthNames = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        new Date(2024, i, 1).toLocaleDateString(isRTL ? "ar-u-ca-gregory-nu-latn" : undefined, {
          month: "long",
        })
      ),
    [isRTL]
  );

  /* `month` is meaningless without a year — the server answers 422. Clearing it
     alongside the year keeps the request valid without surfacing an error. */
  const handleYearChange = (value: string) => {
    setYear(value);
    if (value === ALL) setMonth(ALL);
  };

  const hasFilters = year !== ALL || month !== ALL || !!from || !!to || category !== ALL;
  const clearFilters = () => {
    setYear(ALL);
    setMonth(ALL);
    setFrom("");
    setTo("");
    setCategory(ALL);
  };

  const load = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerTimeline(customerId, {
        year: year === ALL ? null : Number(year),
        month: year === ALL || month === ALL ? null : Number(month),
        from: from || null,
        to: to || null,
        order: "asc",
      });
      setData(res?.data?.data ?? res?.data ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.message || t("timeline.loadFailed"));
      setData(null);
    } finally {
      setLoading(false);
    }
    /* `reloadKey` is deliberately in the list: bumping it is what the Retry
       button uses to re-run this request with identical filters. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, year, month, from, to, reloadKey, t]);

  useEffect(() => {
    load();
  }, [load]);

  const years = useMemo(() => data?.years || [], [data]);

  /** Every event in payload order, so the client-side filters can work on a flat list. */
  const allEvents = useMemo(() => {
    const out: { event: TimelineEvent; year: number; month: number; monthName?: string }[] = [];
    years.forEach((yearBucket) =>
      (yearBucket.months || []).forEach((monthBucket) =>
        (monthBucket.events || []).forEach((event) =>
          out.push({
            event,
            year: yearBucket.year,
            month: monthBucket.month,
            monthName: monthBucket.monthName,
          })
        )
      )
    );
    return out;
  }, [years]);

  /** Categories actually present, so the filter never offers an empty option. */
  const categories = useMemo(
    () =>
      Array.from(new Set(allEvents.map((e) => String(e.event.category || "")).filter(Boolean))).sort(),
    [allEvents]
  );

  const noisyCount = useMemo(
    () => allEvents.filter((e) => NOISY_CATEGORIES.includes(String(e.event.category))).length,
    [allEvents]
  );

  const filtered = useMemo(
    () =>
      allEvents.filter(({ event }) => {
        const eventCategory = String(event.category || "");
        if (category !== ALL) return eventCategory === category;
        if (!showNoisy && NOISY_CATEGORIES.includes(eventCategory)) return false;
        return true;
      }),
    [allEvents, category, showNoisy]
  );

  /* A filter change should always land the reader at the top of the new list. */
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [category, showNoisy, year, month, from, to]);

  /**
   * The mock alternates sides down the spine, so the side is positional — an
   * event's own tone only drives its colour. Year dividers and month pills are
   * recomputed from the *filtered* list, so hiding a category never leaves a
   * divider or a pill stranded above events that are no longer there.
   */
  const rows = useMemo(() => {
    const out: TimelineRowModel[] = [];
    let lastYear: number | null = null;
    let lastMonth: string | null = null;
    filtered.slice(0, visible).forEach((entry, index) => {
      if (entry.year !== lastYear) {
        out.push({ kind: "year", year: entry.year });
        lastYear = entry.year;
        lastMonth = null;
      }
      const monthKey = `${entry.year}-${entry.month}`;
      out.push({
        kind: "event",
        event: entry.event,
        side: index % 2 === 0 ? "left" : "right",
        monthLabel:
          monthKey === lastMonth ? null : entry.monthName || monthNames[entry.month - 1] || null,
      });
      lastMonth = monthKey;
    });
    return out;
  }, [filtered, visible, monthNames]);

  const hasMore = filtered.length > visible;

  const isEmpty = !loading && !error && filtered.length === 0;
  const initials = (data?.customerName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="acct-timeline flex flex-col gap-4 p-4 md:p-6">
      {/* A global heading rule oversizes h1/h2 — pin them for this page, and give
          every card the project's surface + brand-tinted border. */}
      <style>{`
        .acct-timeline h1 { font-size: 1.125rem !important; line-height: 1.3 !important; margin: 0 !important; }
        .acct-timeline h2 { font-size: 0.9375rem !important; line-height: 1.3 !important; margin: 0 !important; }
        .acct-timeline [data-slot="card"] {
          background-color: var(--surface-card) !important;
          background-image: none !important;
          border-color: color-mix(in srgb, var(--primary) 16%, var(--surface-border)) !important;
          color: var(--foreground) !important;
          box-shadow: 0 1px 2px color-mix(in srgb, var(--primary) 6%, transparent),
                      0 8px 20px -16px color-mix(in srgb, var(--primary) 35%, transparent) !important;
        }
      `}</style>

      {/* Header — back link, identity, event count, filters */}
      <Card className="gap-0 p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex size-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t("timeline.back")}
            >
              <ArrowLeft className={cn("size-4", isRTL && "rotate-180")} />
            </button>
            <div>
              <h1 className="font-semibold text-foreground">{t("timeline.title")}</h1>
              <div className="mt-0.5 text-xs text-muted-foreground">{t("timeline.breadcrumb")}</div>
            </div>
          </div>

          {!loading && !error ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <CalendarClock className="size-3.5" />
              {filtered.length === allEvents.length
                ? t("timeline.eventCount", { count: allEvents.length })
                : t("timeline.eventCountFiltered", {
                    shown: filtered.length,
                    total: allEvents.length,
                  })}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials || <UserRound className="size-5" />}
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {data?.cifNumber || "—"}
              </div>
              <div className="text-base font-semibold text-foreground">{data?.customerName || "—"}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <Filter label={t("timeline.filter.month")}>
              <Select value={month} onValueChange={setMonth} disabled={year === ALL}>
                <SelectTrigger className="h-9 w-[168px]">
                  <SelectValue placeholder={t("timeline.filter.allMonths")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("timeline.filter.allMonths")}</SelectItem>
                  {monthNames.map((name, i) => (
                    <SelectItem key={name} value={String(i + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Filter>

            <Filter label={t("timeline.filter.year")}>
              <Select value={year} onValueChange={handleYearChange}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder={t("timeline.filter.allYears")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("timeline.filter.allYears")}</SelectItem>
                  {yearOptions().map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Filter>

            <Filter label={t("timeline.filter.from")}>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 w-[150px] rounded-md border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </Filter>

            <Filter label={t("timeline.filter.to")}>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 w-[150px] rounded-md border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </Filter>

            <Filter label={t("timeline.filter.category")}>
              <Select value={category} onValueChange={setCategory} disabled={categories.length === 0}>
                <SelectTrigger className="h-9 w-[176px]">
                  <SelectValue placeholder={t("timeline.filter.allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("timeline.filter.allCategories")}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Filter>

            {hasFilters ? (
              <Button variant="ghost" className="h-9 gap-1.5 text-muted-foreground" onClick={clearFilters}>
                <RotateCcw className="size-3.5" />
                {t("timeline.filter.clear")}
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="px-4 py-6 md:px-8 md:py-8">
        {/* Wallet movements and notifications can run to hundreds a month, so they
            stay folded away until asked for — never silently dropped. */}
        {!loading && !error && noisyCount > 0 && category === ALL ? (
          <div className="mb-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={() => setShowNoisy((v) => !v)}
            >
              <ArrowLeftRight className="size-3.5" />
              {showNoisy
                ? t("timeline.hideNoisy", { count: noisyCount })
                : t("timeline.showNoisy", { count: noisyCount })}
            </Button>
          </div>
        ) : null}

        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              {t("timeline.retry")}
            </Button>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <CalendarClock className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">{t("timeline.empty")}</p>
            {hasFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {t("timeline.filter.clear")}
              </Button>
            ) : null}
          </div>
        ) : (
          /* The spine's geometry is mirrored by an RTL page, which would point
             every tail away from the line — pin the layout to LTR and let the
             card text pick its own direction (`dir="auto"`) instead. */
          <div dir="ltr" className="relative mx-auto w-full max-w-5xl">
            {/* One continuous track behind the tone-coloured segments */}
            <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />

            {rows.map((row) =>
              row.kind === "year" ? (
                <YearDivider key={`y-${row.year}`} year={row.year} />
              ) : (
                <TimelineRow
                  key={row.event.id}
                  event={row.event}
                  monthLabel={row.monthLabel}
                  side={row.side}
                />
              )
            )}

            {hasMore ? (
              <div className="relative flex justify-center pt-8">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  <ChevronDown className="size-3.5" />
                  {t("timeline.showMore", { count: filtered.length - visible })}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

const Filter = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </label>
    {children}
  </div>
);

const YearDivider = ({ year }: { year: number }) => (
  <div className="relative flex justify-center py-7">
    <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
    <span className="relative rounded-full border bg-card px-4 py-1 text-xs font-semibold tracking-wide text-muted-foreground shadow-sm">
      {year}
    </span>
  </div>
);

/** A card, its tail, the spine dot and — on a month's first event — the pill. */
const TimelineRow = ({
  event,
  monthLabel,
  side,
}: {
  event: TimelineEvent;
  monthLabel: string | null;
  side: Side;
}) => {
  const left = side === "left";

  return (
    <div style={accentVar(event)} className="grid grid-cols-[1fr_auto_1fr] items-center">
      {/* Inner column: whichever side the card is on. Outer column: the month
          pill, so it always hugs the spine opposite the card. */}
      <div className="flex justify-end">
        {left ? (
          <EventCard event={event} side="left" />
        ) : monthLabel ? (
          <MonthPill label={monthLabel} side="left" />
        ) : null}
      </div>

      {/* Spine segment + dot */}
      <div className="relative flex w-12 self-stretch">
        <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[color-mix(in_srgb,var(--evt)_55%,var(--surface-border))]" />
        <span className="relative m-auto size-3.5 rounded-full bg-[var(--evt)] ring-4 ring-[var(--surface-card)]" />
      </div>

      <div className="flex justify-start">
        {!left ? (
          <EventCard event={event} side="right" />
        ) : monthLabel ? (
          <MonthPill label={monthLabel} side="right" />
        ) : null}
      </div>
    </div>
  );
};

const MonthPill = ({ label, side }: { label: string; side: Side }) => (
  <span
    className={cn(
      "relative my-3 inline-block bg-[var(--evt)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm",
      /* Pointed at the spine, rounded away from it — the mock's tag shape. */
      side === "left" ? "mr-2 rounded-l-full rounded-r-md" : "ml-2 rounded-r-full rounded-l-md"
    )}
  >
    {label}
  </span>
);

const EventCard = ({ event, side }: { event: TimelineEvent; side: Side }) => {
  const { isRTL } = useLanguage();
  const Icon = CATEGORY_ICONS[String(event.category || "")] || CalendarClock;
  /* Only some sources carry an Arabic title; fall back to the English one. */
  const title = (isRTL && event.titleAr) || event.title || event.type || "—";

  return (
    <div
      className={cn(
        "relative my-3 w-full max-w-sm rounded-xl border px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md",
        CARD_SURFACE,
        side === "left" ? "mr-3" : "ml-3"
      )}
    >
      {/* Tail — a rotated square borrowing the card's own surface and border.
          Physical left/right, matched to the grid column, not to text direction. */}
      <span
        className={cn(
          "absolute top-1/2 size-2.5 -translate-y-1/2 rotate-45 border",
          CARD_SURFACE,
          side === "left" ? "-right-[6px] border-b-0 border-l-0" : "-left-[6px] border-r-0 border-t-0"
        )}
      />

      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--evt)_18%,transparent)] text-[var(--evt)]">
          <Icon className="size-4" />
        </span>
        <div dir="auto" className="min-w-0">
          <div className="text-sm font-semibold leading-snug text-foreground">
            {title}
          </div>
          {event.description ? (
            <div className="mt-0.5 break-words text-xs text-muted-foreground">{event.description}</div>
          ) : null}
          <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">
            {formatDateTime(event.occurredAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-4">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex justify-end">
          {i % 2 === 0 ? <Skeleton className="h-20 w-full max-w-md rounded-xl" /> : null}
        </div>
        <div className="flex w-10 justify-center">
          <Skeleton className="size-4 rounded-full" />
        </div>
        <div className="flex justify-start">
          {i % 2 === 1 ? <Skeleton className="h-20 w-full max-w-md rounded-xl" /> : null}
        </div>
      </div>
    ))}
  </div>
);

export default AccountTimeline;
