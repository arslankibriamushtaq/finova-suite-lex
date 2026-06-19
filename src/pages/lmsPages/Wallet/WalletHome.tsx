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
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getAdminWalletDashboard,
  type WalletDashboardData,
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

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  theme: CardTheme;
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: "#dcfce7", color: "#166534" },
  PENDING_ACTIVATION: { bg: "#fef3c7", color: "#92400e" },
  FROZEN: { bg: "#cffafe", color: "#155e75" },
  CLOSED: { bg: "#fee2e2", color: "#991b1b" },
};

const WalletHome = () => {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<WalletDashboardData | null>(null);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res: any = await getAdminWalletDashboard({
        from: fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : undefined,
        to: toDate ? dayjs(toDate).format("YYYY-MM-DD") : undefined,
        recentLimit: RECENT_LIMIT,
      });
      setDashboard(res?.data?.data ?? null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load wallet statistics");
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever the date range changes (and on mount)
  useEffect(() => {
    loadDashboard();
  }, [fromDate, toDate]);

  const summary = dashboard?.summary;

  const fmt = (n: number) =>
    Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  const cards: StatCard[] = [
    { title: "Total Wallets", value: summary?.totalWallets ?? 0, icon: Wallet, theme: "emerald" },
    { title: "Active Wallets", value: summary?.activeWallets ?? 0, icon: BadgeCheck, theme: "teal" },
    { title: "Pending Activation", value: summary?.pendingActivation ?? 0, icon: Clock, theme: "amber" },
    { title: `Total Balance (${CURRENCY})`, value: fmt(summary?.totalBalance ?? 0), icon: Banknote, theme: "green" },
    { title: "Frozen Wallets", value: summary?.frozenWallets ?? 0, icon: Snowflake, theme: "cyan" },
    { title: "Closed Wallets", value: summary?.closedWallets ?? 0, icon: XCircle, theme: "rose" },
    { title: "Total Customers", value: summary?.totalCustomers ?? 0, icon: Users, theme: "indigo" },
    { title: "Wallet Accounts", value: summary?.walletAccounts ?? 0, icon: ArrowLeftRight, theme: "violet" },
  ];

  // Chart — wallets created per day (already aggregated by the API)
  const chartData = dashboard?.walletsCreated ?? [];

  // Recent wallets table (already sorted + limited by the API)
  const recent = dashboard?.recentWallets ?? [];

  const cardWrap: React.CSSProperties = {
    background:
      "linear-gradient(135deg, color-mix(in srgb, #10b981 8%, var(--surface-card)) 0%, var(--surface-card) 55%)",
    border: "1px solid color-mix(in srgb, #10b981 18%, var(--surface-border))",
    borderRadius: 6,
    boxShadow: "0 6px 18px -12px color-mix(in srgb, #10b981 40%, transparent)",
    padding: "18px 20px",
    marginTop: 16,
    color: "var(--foreground)",
  };

  return (
    <div className="dashboard dash-one">
      {/* Header + date filters */}
      <div className="col-12 py-3 d-flex flex-wrap justify-content-between align-items-end gap-3">
        <h3 className="mb-0 fw-bold" style={{ color: "var(--foreground)" }}>
          Wallet Dashboard
        </h3>
        <div className="d-flex align-items-end gap-3 flex-wrap">
          <div style={{ minWidth: 160 }}>
            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
              From
            </label>
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              placeholder="Select From Date"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
              To
            </label>
            <DatePicker
              value={toDate}
              onChange={setToDate}
              placeholder="Select To Date"
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
                <p className="stat-card__value">
                  {loading ? <PulseLoading size="sm" /> : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div style={cardWrap}>
        <h5 style={{ fontWeight: 700, margin: "0 0 14px", color: "var(--foreground)" }}>
          Wallets Created
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradWallets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
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
                borderRadius: 6,
                color: "var(--foreground)",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Wallets"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradWallets)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent wallets table */}
      <div style={{ ...cardWrap, padding: 0, overflow: "hidden" }}>
        <h5 style={{ fontWeight: 700, margin: 0, padding: "18px 20px 12px", color: "var(--foreground)" }}>
          Recent Wallets
        </h5>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "#059669", color: "#fff" }}>
                {["Wallet Number", "Account Number", "Name", `Balance (${CURRENCY})`, "Status", "Created At"].map((h) => (
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
                    {loading ? "Loading…" : "No wallets found"}
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
