import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "../../../components/Dashboard/DashboardOverview.css";
import {
  Wallet,
  BadgeCheck,
  Clock,
  Banknote,
  Snowflake,
  XCircle,
  Users,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import PulseLoading from "../../../components/Loader/PulseLoader";
import { useTranslation } from "react-i18next";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getAdminWalletDashboard,
  type WalletDashboardData,
  type WalletsCreatedPoint,
} from "../../../redux/apis/apisWalletAdmin";

const RECENT_LIMIT = 10;
const CURRENCY = "CAD"; // Canadian Dollar

type CardTheme =
  | "emerald"
  | "teal"
  | "amber"
  | "green"
  | "rose"
  | "cyan"
  | "violet"
  | "indigo";

/** What the little percentage chip on a card means. */
type ChipKind = "share" | "growth" | "none";

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  theme: CardTheme;
  /** Mini trend series driving the in-card sparkline. */
  series: { x: number; y: number }[];
  /** Real, per-card percentage chip (or null when no honest number exists). */
  chip: { text: string; title: string; tone: "up" | "down" | "neutral" } | null;
}

/** Solid brand color per theme — mirrors the CSS `--c` used by the cards. */
const THEME_COLOR: Record<CardTheme, string> = {
  emerald: "#10b981",
  teal: "#14b8a6",
  amber: "#f59e0b",
  green: "#22c55e",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  indigo: "#6366f1",
};

/**
 * Build a cumulative growth curve from the real daily-creation cadence,
 * scaled so the final point equals the card's current value. This keeps the
 * sparkline shaped by real data while ending on the exact metric shown.
 */
const buildTrend = (
  points: WalletsCreatedPoint[],
  target: number
): { x: number; y: number }[] => {
  if (!points.length || !target) return [];
  const totalCreated = points.reduce((s, p) => s + (p.count || 0), 0) || 1;
  let cum = 0;
  return points.map((p, i) => {
    cum += p.count || 0;
    return { x: i, y: Math.round((cum / totalCreated) * target * 100) / 100 };
  });
};

/** Compact, axis-less area chart shown at the bottom of every stat card. */
const Sparkline = ({
  data,
  color,
}: {
  data: { x: number; y: number }[];
  color: string;
}) => {
  if (!data || data.length < 2) return null;
  const gid = `spark-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          cursor={false}
          contentStyle={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            borderRadius: 4,
            fontSize: 11,
            padding: "2px 8px",
            color: "var(--foreground)",
          }}
          labelFormatter={() => ""}
          formatter={(v: any) => [
            Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 }),
            "",
          ]}
        />
        <Area
          type="monotone"
          dataKey="y"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gid})`}
          dot={false}
          activeDot={{ r: 2.5, strokeWidth: 0 }}
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: "#dcfce7", color: "#166534" },
  PENDING_ACTIVATION: { bg: "#fef3c7", color: "#92400e" },
  FROZEN: { bg: "#cffafe", color: "#155e75" },
  CLOSED: { bg: "#fee2e2", color: "#991b1b" },
};

const WalletHome = () => {
  const { t } = useTranslation("walletBlocks");
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<WalletDashboardData | null>(null);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  const loadDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res: any = await getAdminWalletDashboard({
        from: fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : undefined,
        to: toDate ? dayjs(toDate).format("YYYY-MM-DD") : undefined,
        recentLimit: RECENT_LIMIT,
      });
      setDashboard(res?.data?.data ?? null);
    } catch (error: any) {
      if (!silent) toast.error(error?.message || t("dashboard.toast.loadStatsFailed"));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Reload whenever the date range changes (and on mount)
  useEffect(() => {
    loadDashboard();
  }, [fromDate, toDate]);

  // Live refresh — silently poll every 60s so the cards/graphs stay current.
  useEffect(() => {
    const id = setInterval(() => loadDashboard(true), 60_000);
    return () => clearInterval(id);
  }, [fromDate, toDate]);

  const summary = dashboard?.summary;

  const fmt = (n: number) =>
    Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  // Chart — wallets created per day (already aggregated by the API)
  const chartData = dashboard?.walletsCreated ?? [];

  // Real period growth for count totals: new wallets added in the selected
  // range (from walletsCreated) relative to the base that existed before it.
  const total = summary?.totalWallets ?? 0;
  const newInPeriod = chartData.reduce((s, p) => s + (p.count || 0), 0);
  const priorBase = total - newInPeriod;
  const periodGrowth = priorBase > 0 ? (newInPeriod / priorBase) * 100 : null;

  const pctText = (n: number) => `${n.toFixed(n > 0 && n < 10 ? 1 : 0)}%`;

  // Each card carries a `chipKind` describing which real percentage (if any)
  // is honest for it: `share` = portion of total wallets, `growth` = period
  // growth from walletsCreated, `none` = no reliable per-card series.
  const defs: Array<
    Omit<StatCard, "series" | "chip"> & { metric: number; chipKind: ChipKind }
  > = [
    { title: t("dashboard.totalWallets"), value: summary?.totalWallets ?? 0, icon: Wallet, theme: "emerald", metric: summary?.totalWallets ?? 0, chipKind: "growth" },
    { title: t("dashboard.activeWallets"), value: summary?.activeWallets ?? 0, icon: BadgeCheck, theme: "teal", metric: summary?.activeWallets ?? 0, chipKind: "share" },
    { title: t("dashboard.pendingActivation"), value: summary?.pendingActivation ?? 0, icon: Clock, theme: "amber", metric: summary?.pendingActivation ?? 0, chipKind: "share" },
    { title: t("dashboard.totalBalance", { currency: CURRENCY }), value: fmt(summary?.totalBalance ?? 0), icon: Banknote, theme: "green", metric: summary?.totalBalance ?? 0, chipKind: "none" },
    { title: t("dashboard.frozenWallets"), value: summary?.frozenWallets ?? 0, icon: Snowflake, theme: "cyan", metric: summary?.frozenWallets ?? 0, chipKind: "share" },
    { title: t("dashboard.closedWallets"), value: summary?.closedWallets ?? 0, icon: XCircle, theme: "rose", metric: summary?.closedWallets ?? 0, chipKind: "share" },
    { title: t("dashboard.totalCustomers"), value: summary?.totalCustomers ?? 0, icon: Users, theme: "indigo", metric: summary?.totalCustomers ?? 0, chipKind: "none" },
    { title: t("dashboard.walletAccounts"), value: summary?.walletAccounts ?? 0, icon: ArrowLeftRight, theme: "violet", metric: summary?.walletAccounts ?? 0, chipKind: "growth" },
  ];

  const cards: StatCard[] = defs.map(({ metric, chipKind, ...rest }) => {
    let chip: StatCard["chip"] = null;
    if (chipKind === "share" && total > 0) {
      const pct = (metric / total) * 100;
      chip = {
        text: t("dashboard.chipOfTotal", { pct: pctText(pct) }),
        title: t("dashboard.chipOfTotalTitle", {
          metric: metric.toLocaleString(),
          total: total.toLocaleString(),
        }),
        tone: "neutral",
      };
    } else if (chipKind === "growth" && periodGrowth !== null) {
      chip = {
        text: `${periodGrowth >= 0 ? "▲" : "▼"} ${pctText(Math.abs(periodGrowth))}`,
        title: t("dashboard.chipNewInPeriod", { count: newInPeriod.toLocaleString() }),
        tone: periodGrowth >= 0 ? "up" : "down",
      };
    }
    return { ...rest, series: buildTrend(chartData, metric), chip };
  });

  // Recent wallets table (already sorted + limited by the API)
  const recent = dashboard?.recentWallets ?? [];

  const cardWrap: React.CSSProperties = {
    background:
      "linear-gradient(135deg, color-mix(in srgb, #e60000 8%, var(--surface-card)) 0%, var(--surface-card) 55%)",
    border: "1px solid color-mix(in srgb, #e60000 18%, var(--surface-border))",
    borderRadius: 2,
    boxShadow: "0 6px 18px -12px color-mix(in srgb, #e60000 40%, transparent)",
    padding: "18px 20px",
    marginTop: 16,
    color: "var(--foreground)",
  };

  return (
    <div className="dashboard dash-one">
      {/* Header + date filters */}
      <div className="col-12 py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <h3 className="mb-0" style={{ color: "var(--foreground)", fontSize: "22px", fontWeight: 600 }}>
          {t("dashboard.title")}
        </h3>
        <div className="d-flex align-items-end gap-1 flex-wrap">
          <div style={{ minWidth: 160 }}>
            {/* <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
              From
            </label> */}
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              placeholder={t("dashboard.fromPlaceholder")}
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            {/* <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
              To
            </label> */}
            <DatePicker
              value={toDate}
              onChange={setToDate}
              placeholder={t("dashboard.toPlaceholder")}
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                fromDate ? current && current < dayjs(fromDate).startOf("day") : false
              }
            />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="row gy-3 dashboard-stats">
        {cards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="col-12 col-sm-6 col-lg-3 d-flex">
              <div className={`stat-card stat-card--${stat.theme}`}>
                <div className="stat-card__row">
                  <span className="stat-card__title">{stat.title}</span>
                  <span className="stat-card__icon">
                    <Icon strokeWidth={2} />
                  </span>
                </div>
                <div className="stat-card__value-row">
                  <p className="stat-card__value">
                    {loading ? <PulseLoading size="sm" /> : stat.value}
                  </p>
                  {!loading && stat.chip && (
                    <span
                      className={`stat-card__chip stat-card__chip--${stat.chip.tone}`}
                      title={stat.chip.title}
                    >
                      {stat.chip.text}
                    </span>
                  )}
                </div>
                <div className="stat-card__spark">
                  {!loading && (
                    <Sparkline data={stat.series} color={THEME_COLOR[stat.theme]} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div style={cardWrap}>
        <h5 style={{ fontWeight: 700, margin: "0 0 14px", color: "var(--foreground)" }}>
          {t("dashboard.walletsCreated")}
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => (v ? dayjs(v).format("MMM D") : "")}
              axisLine={{ stroke: "var(--surface-border)" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface-card)",
                border: "1px solid var(--surface-border)",
                borderRadius: 2,
                color: "var(--foreground)",
              }}
            />
            <Bar
              dataKey="count"
              name={t("dashboard.walletsBar")}
              fill="var(--chart-series-1, #c00000)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent wallets table */}
      <div style={{ ...cardWrap, padding: 0, overflow: "hidden" }}>
        <h5 style={{ fontWeight: 700, margin: 0, padding: "18px 20px 12px", color: "var(--foreground)" }}>
          {t("dashboard.recentWallets")}
        </h5>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "#c00000", color: "#fff" }}>
                {[t("dashboard.col.walletNumber"), t("dashboard.col.accountNumber"), t("dashboard.col.name"), t("dashboard.col.balance", { currency: CURRENCY }), t("dashboard.col.status"), t("dashboard.col.createdAt")].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted-foreground)" }}>
                    {loading ? t("dashboard.loadingRow") : t("dashboard.noWallets")}
                  </td>
                </tr>
              ) : (
                recent.map((w, i) => {
                  const badge = STATUS_BADGE[w.status] || { bg: "var(--muted)", color: "var(--foreground)" };
                  return (
                    <tr
                      key={w.id || i}
                      style={{
                        borderBottom: "1px solid var(--surface-border)",
                        background: i % 2 ? "var(--surface-card-alt)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{w.walletNumber || "-"}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12 }}>{w.accountNumber || "-"}</td>
                      <td style={{ padding: "12px 16px" }}>{w.name || "-"}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{fmt(Number(w.balance ?? 0))}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: badge.bg, color: badge.color, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                          {(w.status || "-").toString().replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)" }}>
                        {w.createdAt ? dayjs(w.createdAt).format("MMM D, YYYY") : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WalletHome;
