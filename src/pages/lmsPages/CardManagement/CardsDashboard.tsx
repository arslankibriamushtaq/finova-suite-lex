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
} from "recharts";
import { CreditCard, CheckCircle2, Layers, Send } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { getAdminCardStats } from "../../../redux/apis/apisCardManagement";
import { CARD_TYPE_LABELS, prettyEnum, cardStatusClasses } from "./cardConstants";

const STATUS_BAR_COLORS: Record<string, string> = {
  ACTIVE: "#22c55e",
  ISSUED: "#3b82f6",
  REQUESTED: "#f59e0b",
  BLOCKED: "#f97316",
  EXPIRED: "#94a3b8",
  CANCELLED: "#ef4444",
};

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <div className="pro-card p-4 flex items-center justify-between gap-3">
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
    <span className="pro-head-badge">{icon}</span>
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Total Cards"
          value={isLoading ? "…" : stats?.total ?? 0}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          label="Active"
          value={isLoading ? "…" : activeCount}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label="Issued"
          value={isLoading ? "…" : issuedCount}
          icon={<Send className="h-4 w-4" />}
        />
        <StatCard
          label="Card Types"
          value={isLoading ? "…" : typeCount}
          icon={<Layers className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* By status chart */}
        <div className="pro-card p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Cards by Status</p>
          {statusChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "var(--theme-table-row-hover)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
          <p className="text-sm font-semibold text-foreground mb-3">Cards by Type</p>
          {Object.keys(byType).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byType).map(([type, count]) => {
                const total = stats?.total || Number(count) || 1;
                const pct = Math.round((Number(count) / total) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {CARD_TYPE_LABELS[type] || prettyEnum(type)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Status legend */}
          <div className="mt-5 pt-4 border-t">
            <p className="text-sm font-semibold text-foreground mb-2">Status breakdown</p>
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
