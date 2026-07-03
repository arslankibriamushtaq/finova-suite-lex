import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { CreditCard, CheckCircle2, Layers, Send, BarChart3, PieChart } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { getAdminCardStats } from "../../../redux/apis/apisCardManagement";
import { CARD_TYPE_LABELS, prettyEnum, cardStatusClasses } from "./cardConstants";
import "../../../components/Dashboard/DashboardOverview.css";

const STATUS_BAR_COLORS: Record<string, string> = {
  ACTIVE: "#22c55e",
  ISSUED: "#3b82f6",
  REQUESTED: "#f59e0b",
  FROZEN: "#06b6d4",
  BLOCKED: "#f97316",
  EXPIRED: "#94a3b8",
  CANCELLED: "#ef4444",
};

// Colors for the "Cards by Type" progress bars (cycled).
const TYPE_BAR_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#06b6d4", "#f43f5e", "#8b5cf6"];

const StatCard = ({
  label,
  value,
  icon,
  theme,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  theme: string;
}) => (
  <div className={`stat-card stat-card--${theme}`}>
    <div className="stat-card__row">
      <span className="stat-card__title">{label}</span>
      <span className="stat-card__icon">{icon}</span>
    </div>
    <p className="stat-card__value">{value}</p>
  </div>
);

const CardsDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAdminCardStats()
      .then((res) => setStats(res?.data?.data ?? res?.data))
      .catch((error: any) => {
        if (!error?.response?.data?.message) toast.error("Failed to load card stats");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const byStatus: Record<string, number> = stats?.byStatus || {};
  const byType: Record<string, number> = stats?.byType || {};

  const statusChartData = Object.entries(byStatus).map(([name, count]) => ({
    name: prettyEnum(name),
    key: name,
    count: Number(count),
  }));

  const activeCount = byStatus.ACTIVE || 0;
  const issuedCount = byStatus.ISSUED || 0;
  const typeCount = Object.keys(byType).length;

  return (
    <div className="service card-dashboard-page">
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <CreditCard className="h-4 w-4" />
          </span>
          Cards Dashboard
        </h3>
        <Button className="gap-2" onClick={() => navigate("/CardManagement/Cards")}>
          <Layers className="h-4 w-4" />
          View all cards
        </Button>
      </div>

      {/* Summary cards — matches the project's dashboard stat-card style */}
      <div className="dashboard-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Total Cards"
          theme="emerald"
          value={isLoading ? "…" : stats?.total ?? 0}
          icon={<CreditCard strokeWidth={2} />}
        />
        <StatCard
          label="Active"
          theme="teal"
          value={isLoading ? "…" : activeCount}
          icon={<CheckCircle2 strokeWidth={2} />}
        />
        <StatCard
          label="Issued"
          theme="indigo"
          value={isLoading ? "…" : issuedCount}
          icon={<Send strokeWidth={2} />}
        />
        <StatCard
          label="Card Types"
          theme="amber"
          value={isLoading ? "…" : typeCount}
          icon={<Layers strokeWidth={2} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* By status chart */}
        <div className="pro-card p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="pro-head-badge">
              <BarChart3 className="h-4 w-4" />
            </span>
            <p className="m-0 text-sm font-semibold leading-none text-foreground">Cards by Status</p>
          </div>
          {statusChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "var(--surface-border)" }}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  allowDecimals={false}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--theme-table-row-hover)" }}
                  contentStyle={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_BAR_COLORS[entry.key] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By type breakdown */}
        <div className="pro-card p-4">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="pro-head-badge">
              <PieChart className="h-4 w-4" />
            </span>
            <p className="m-0 text-sm font-semibold leading-none text-foreground">Cards by Type</p>
          </div>
          {Object.keys(byType).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
          ) : (
            <div className="space-y-3.5">
              {Object.entries(byType).map(([type, count], i) => {
                const total = stats?.total || Number(count) || 1;
                const pct = Math.round((Number(count) / total) * 100);
                const color = TYPE_BAR_COLORS[i % TYPE_BAR_COLORS.length];
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="size-2.5 rounded-full" style={{ background: color }} />
                        {CARD_TYPE_LABELS[type] || prettyEnum(type)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{count}</span> ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Status legend */}
          <div className="mt-5 pt-4 border-t">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Status breakdown
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byStatus).map(([status, count]) => (
                <span
                  key={status}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${cardStatusClasses(status)}`}
                >
                  {prettyEnum(status)}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsDashboard;
