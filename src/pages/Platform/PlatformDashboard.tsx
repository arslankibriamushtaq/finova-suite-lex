import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Banknote,
  Building2,
  CircleCheck,
  Cog,
  LayoutDashboard,
  PauseCircle,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";

import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { LexPageHeader } from "../../components/shared/lexKit";
import { money } from "../../components/shared/tenancyKitUtils";
import {
  getPlatformDashboard,
  toTenancyError,
  type DashboardPeriod,
  type PlatformDashboard as Dashboard,
} from "../../redux/apis/apisTenancyAdmin";
import "./platformDashboard.css";

/**
 * The platform at a glance.
 *
 * One call draws every widget here, and the shape of that call is the only
 * thing this screen decides: radios send `period`, the pickers send `from`+`to`,
 * and never both — the server lets a range win over a preset, and a UI that
 * sends both is relying on a precedence rule its reader cannot see.
 *
 * Two rules from the contract are load-bearing and easy to get wrong:
 *
 *   - `monthlyRecurringRevenue` has ALREADY normalised annual plans to a
 *     monthly figure. Dividing by twelve here would quarter the number twice.
 *   - a tenant on the everything-tier is on every module, so BUNDLE_ALL's
 *     `activeTenants` are already inside each module's count. Summing the
 *     products would count those companies once per module they own.
 *
 * And what the date filter does NOT move is worth stating on the page rather
 * than leaving someone to infer it: status counts and per-product tenant counts
 * are "how things stand now" questions. Only pipeline, sales and the chart are
 * questions about a window.
 */

const PRESETS: { key: DashboardPeriod; label: string }[] = [
  { key: "TODAY", label: "Today" },
  { key: "LAST_WEEK", label: "Last Week" },
  { key: "LAST_MONTH", label: "Last Month" },
];

/**
 * Slice colours.
 *
 * The pie is a legend of five products, not a ranking — the brand red would
 * make whichever product happened to be first look like the important one. A
 * flat, evenly-weighted set says "these are the categories" instead.
 */
const SLICE = ["#7dd3fc", "#fde68a", "#5eead4", "#f0abfc", "#cbd5e1"];

const MONTH_LABEL = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** "2026-08" → "AUG". Parsed rather than dated: no timezone can move a label. */
const monthLabel = (month: string): string => {
  const index = Number(month.split("-")[1]) - 1;
  return MONTH_LABEL[index] ?? month;
};

/** Compact axis ticks — a six-figure revenue axis is unreadable in full. */
const compact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)} k`;
  return String(value);
};

const PlatformDashboard = () => {
  const [data, setData] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The filter, as the server understands it: a preset OR a range, never both.
  const [preset, setPreset] = useState<DashboardPeriod | null>(null);
  // Dayjs, not strings: the picker speaks Dayjs and the API wants plain
  // YYYY-MM-DD, so the conversion happens once, at the call.
  const [from, setFrom] = useState<Dayjs | null>(null);
  const [to, setTo] = useState<Dayjs | null>(null);

  /** Which product the revenue chart is showing; empty string is "All". */
  const [series, setSeries] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(
        await getPlatformDashboard(
          from && to
            ? // Plain dates, never timestamps: days are cut in the platform's
              // reporting zone, so a browser offset would ask a different
              // question from the one on screen.
              { from: from.format("YYYY-MM-DD"), to: to.format("YYYY-MM-DD") }
            : preset
              ? { period: preset }
              : {}
        )
      );
    } catch (error) {
      const failure = toTenancyError(error, "Could not load the dashboard.");
      // A token without super_admin should not reach this screen at all, so a
      // 403 here is a routing problem worth naming rather than a toast.
      toast.error(
        failure.code === "COMMON.AUTH.ACCESS_DENIED"
          ? "This dashboard is for platform administrators only."
          : failure.message
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [preset, from, to]);

  useEffect(() => {
    // A half-filled range is not a question the server can answer, so it is not
    // asked: both pickers must be set before the range replaces the preset.
    if ((from && !to) || (to && !from)) return;
    load();
  }, [load, from, to]);

  const currency = data?.currency ?? "SAR";

  const pie = useMemo(() => (data?.products ?? []).filter((p) => p.sales > 0), [data]);

  const bars = useMemo(
    () =>
      (data?.revenue ?? []).map((month) => ({
        label: monthLabel(month.month),
        // A package with no sales that month is simply absent from byPackage.
        value: series ? (month.byPackage[series] ?? 0) : month.total,
      })),
    [data, series]
  );

  const donut = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Leads", value: data.funnel.leads, fill: "#cbd5e1" },
      { name: "Opportunities", value: data.funnel.opportunities, fill: "#1f2937" },
      { name: "Tenants", value: data.funnel.won, fill: "#C81D25" },
    ];
  }, [data]);

  const pickPreset = (key: DashboardPeriod) => {
    // Choosing a preset abandons the range, or the two would disagree.
    setFrom(null);
    setTo(null);
    setPreset(key);
  };

  /**
   * What the two pickers will accept.
   *
   * Each end bounds the other, so an inverted range cannot be built — the
   * server answers one with COMMON.REQUEST.BAD_REQUEST, and a control that can
   * produce a refusable request is a control that will.
   *
   * Neither end takes a future date: sales are paid invoices bucketed by issue
   * date, so a window running into next year returns exactly what one ending
   * today returns.
   */
  const noFuture = (day: Dayjs) => day.isAfter(dayjs().endOf("day"));
  const disabledFrom = (current: Dayjs) =>
    !!current && (noFuture(current) || (to ? current.isAfter(to.endOf("day")) : false));
  const disabledTo = (current: Dayjs) =>
    !!current && (noFuture(current) || (from ? current.isBefore(from.startOf("day")) : false));

  return (
    <div className="pf-dash">
      <LexPageHeader icon={LayoutDashboard} title="Dashboard" subtitle="The platform at a glance.">
        <Button size="sm" variant="outline" onClick={load} disabled={isLoading}>
          <RefreshCw className={`me-1 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </LexPageHeader>

      {/* --- Filter -------------------------------------------------------- */}
      <div className="no-card pf-filter mb-3">
        {PRESETS.map((option) => (
          <label key={option.key} className="pf-radio">
            <input
              type="radio"
              name="pf-period"
              checked={preset === option.key && !from && !to}
              onChange={() => pickPreset(option.key)}
            />
            {option.label}
          </label>
        ))}

        {/* antd's picker, which is what the other 113 date fields in this app
            use. react-datepicker is in package.json but imported nowhere, so
            reaching for it would introduce a second date control rather than
            reuse one. */}
        <DatePicker
          placeholder="From"
          format="YYYY-MM-DD"
          value={from}
          disabledDate={disabledFrom}
          onChange={(date) => {
            setFrom(date);
            setPreset(null);
          }}
        />
        <DatePicker
          placeholder="To"
          format="YYYY-MM-DD"
          value={to}
          disabledDate={disabledTo}
          onChange={(date) => {
            setTo(date);
            setPreset(null);
          }}
        />
      </div>

      {isLoading && !data ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">The dashboard could not be loaded.</p>
      ) : (
        <>
          <section className="pro-card p-4">
            <h2 className="pro-card-title mb-3">Overview</h2>

            <div className="pf-grid">
              {/* The headline. Leads and opportunities live inside it because
                  they are the same funnel read at three depths, and three
                  separate tiles would invite them to be read as unrelated. */}
              <article className="pf-hero">
                <div className="pf-hero__top">
                  <span className="pf-hero__label">Total Tenants</span>
                  <span className="pf-hero__icon" aria-hidden="true">
                    <Building2 />
                  </span>
                </div>
                <p className="pf-hero__value">{data.tenants.total.toLocaleString()}</p>

                <div className="pf-hero__split">
                  <div>
                    <span className="pf-hero__sublabel">Leads</span>
                    <span className="pf-hero__subvalue">{data.funnel.leads}</span>
                  </div>
                  <div>
                    <span className="pf-hero__sublabel">Opportunities</span>
                    <span className="pf-hero__subvalue">{data.funnel.opportunities}</span>
                  </div>
                </div>
              </article>

              <article className="pf-tile">
                <span className="pf-tile__icon" aria-hidden="true">
                  <CircleCheck />
                </span>
                <span className="pf-tile__label">Active</span>
                <span className="pf-tile__value">{data.tenants.active.toLocaleString()}</span>
              </article>

              <article className="pf-tile">
                <span className="pf-tile__icon" aria-hidden="true">
                  <Cog />
                </span>
                <span className="pf-tile__label">Provisioning</span>
                <span className="pf-tile__value">{data.tenants.provisioning.toLocaleString()}</span>
              </article>

              <article className="pf-panel pf-panel--sales">
                <span className="pf-panel__label">Total Sales / Product-wise</span>
                <p className="pf-panel__amount">{money(data.totalSales, currency)}</p>

                {pie.length === 0 ? (
                  <p className="pf-empty">No paid invoices in this period.</p>
                ) : (
                  <div className="pf-pie">
                    <div className="pf-pie__chart">
                      <ResponsiveContainer width="100%" height={170}>
                        <PieChart>
                          <Pie
                            data={pie}
                            dataKey="sales"
                            nameKey="nameEn"
                            innerRadius={0}
                            outerRadius={82}
                            stroke="var(--surface-card)"
                            strokeWidth={2}
                          >
                            {pie.map((entry, index) => (
                              <Cell key={entry.packageCode} fill={SLICE[index % SLICE.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => money(value, currency)}
                            contentStyle={{ fontSize: 12, borderRadius: 2 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* A legend of our own: recharts' places itself under the
                        chart and wraps five product names into three lines. */}
                    <ul className="pf-legend">
                      {pie.map((entry, index) => (
                        <li key={entry.packageCode}>
                          <span
                            className="pf-legend__dot"
                            style={{ background: SLICE[index % SLICE.length] }}
                            aria-hidden="true"
                          />
                          {entry.nameEn}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>

              <article className="pf-tile">
                <span className="pf-tile__icon" aria-hidden="true">
                  <PauseCircle />
                </span>
                <span className="pf-tile__label">Suspended</span>
                <span className="pf-tile__value">{data.tenants.suspended.toLocaleString()}</span>
              </article>

              <article className="pf-tile">
                <span className="pf-tile__icon" aria-hidden="true">
                  <TriangleAlert />
                </span>
                <span className="pf-tile__label">Failed</span>
                <span className="pf-tile__value">{data.tenants.failed.toLocaleString()}</span>
              </article>

              <article className="pf-dark">
                <div className="pf-dark__top">
                  <div>
                    <span className="pf-dark__label">Monthly recurring revenue</span>
                    {/* Already normalised server-side — annual plans are divided
                        by twelve before they arrive. */}
                    <p className="pf-dark__value">
                      {money(data.monthlyRecurringRevenue, currency)}
                    </p>
                  </div>
                  <span className="pf-dark__icon" aria-hidden="true">
                    <Banknote />
                  </span>
                </div>

                <div className="pf-dark__split">
                  {data.products
                    .filter((product) => !product.bundle)
                    .slice(0, 4)
                    .map((product) => (
                      <div key={product.packageCode}>
                        <span className="pf-dark__sublabel">{product.packageCode}</span>
                        <span className="pf-dark__subvalue">{product.activeTenants}</span>
                      </div>
                    ))}
                </div>
              </article>
            </div>
          </section>

          <div className="pf-bottom">
            {/* --- Revenue ------------------------------------------------- */}
            <section className="pro-card p-4">
              <div className="pf-revenue__head">
                <h2 className="pro-card-title">Revenue</h2>

                <div className="pf-series">
                  <label className="pf-radio">
                    <input
                      type="radio"
                      name="pf-series"
                      checked={series === ""}
                      onChange={() => setSeries("")}
                    />
                    All
                  </label>
                  {data.products.map((product) => (
                    <label key={product.packageCode} className="pf-radio">
                      <input
                        type="radio"
                        name="pf-series"
                        checked={series === product.packageCode}
                        onChange={() => setSeries(product.packageCode)}
                      />
                      {product.nameEn}
                    </label>
                  ))}
                </div>
              </div>

              {/* Drawn from revenue[] as it comes: the server zero-fills the
                  empty months and returns them in order, so a gap in the bars
                  would be this page losing data rather than the data having a
                  gap. */}
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickFormatter={compact}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "color-mix(in srgb, var(--primary) 6%, transparent)" }}
                    formatter={(value: number) => money(value, currency)}
                    contentStyle={{ fontSize: 12, borderRadius: 2 }}
                  />
                  <Bar dataKey="value" fill="#F79E9E" radius={[2, 2, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* --- Onboardings --------------------------------------------- */}
            <section className="pro-card p-4">
              <h2 className="pf-donut__title">Tenant Onboardings</h2>

              {donut.every((slice) => slice.value === 0) ? (
                <p className="pf-empty">No signups in this period.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={donut}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={95}
                        paddingAngle={1}
                        stroke="var(--surface-card)"
                        strokeWidth={2}
                      >
                        {donut.map((slice) => (
                          <Cell key={slice.name} fill={slice.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2 }} />
                    </PieChart>
                  </ResponsiveContainer>

                  <ul className="pf-legend pf-legend--row">
                    {donut.map((slice) => (
                      <li key={slice.name}>
                        <span
                          className="pf-legend__dot"
                          style={{ background: slice.fill }}
                          aria-hidden="true"
                        />
                        {slice.name}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          {/* The filter is prominent, so what it does not touch has to be said.
              Otherwise "Total Tenants" under "Last Week" reads as a weekly
              figure, and it is not one. */}
          <p className="mt-3 text-xs text-muted-foreground">
            Tenant status counts and per-product tenant numbers are current totals and do not follow
            the date filter. Pipeline, sales and the revenue chart cover {data.range.from} to{" "}
            {data.range.to}.
          </p>
        </>
      )}
    </div>
  );
};

export default PlatformDashboard;
