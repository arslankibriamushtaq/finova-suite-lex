import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  PauseCircle,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { LexPageHeader } from "../../components/shared/lexKit";
import { money } from "../../components/shared/tenancyKitUtils";
import { cn } from "../../lib/utils";
import { getTenantStats, toTenancyError, type TenantStats } from "../../redux/apis/apisTenancyAdmin";

/**
 * The platform at a glance.
 *
 * Six tiles and one number that matters. `monthlyRecurringRevenue` already
 * normalises annual plans to a monthly figure — it is NOT divided again here.
 *
 * Two tiles are alarms rather than statistics: tenants stuck in PROVISIONING
 * mean the SAGA is stalling, and a failed signup means somebody paid and got
 * nothing. Both link straight to the filtered register.
 */

/**
 * One statistic, on the shared `stat-card` the wallet dashboard uses, so the
 * two consoles look like one product.
 *
 * `share` is the client's own arithmetic — the endpoint sends counts, never
 * percentages — so the denominator is passed explicitly and the chip is omitted
 * where a tile is not honestly a share of anything. "0% of total" on a figure
 * that is a share of nothing is a different claim from saying nothing.
 */
const StatTile = ({
  label,
  value,
  denominator,
  to,
  theme,
  icon,
}: {
  label: string;
  value: number;
  denominator?: number;
  to?: string;
  /** One of the shared stat-card themes in DashboardOverview.css. */
  theme: string;
  icon: LucideIcon;
}) => {
  const share =
    denominator != null && denominator > 0 ? (value / denominator) * 100 : null;

  const Icon = icon;

  const body = (
    <div className={cn("stat-card h-full", `stat-card--${theme}`)}>
      <div className="stat-card__row">
        <span className="stat-card__title">{label}</span>
        <span className="stat-card__icon">
          <Icon strokeWidth={2} />
        </span>
      </div>
      <div className="stat-card__value-row">
        <p className="stat-card__value">{value}</p>
        {share !== null ? (
          <span
            className="stat-card__chip"
            title={`${share.toFixed(1)}% of all tenants`}
          >
            {share.toFixed(0)}% of total
          </span>
        ) : null}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block h-full no-underline">
      {body}
    </Link>
  ) : (
    body
  );
};

const PlatformDashboard = () => {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      setStats(await getTenantStats());
    } catch (error) {
      const e = toTenancyError(error, "Could not load platform statistics.");
      toast.error(e.traceId ? `${e.message} (trace ${e.traceId})` : e.message);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <LexPageHeader
        icon={Building2}
        title="Platform Dashboard"
        subtitle="Every tenant on the platform, and what they are worth."
      >
        <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="me-1 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="me-1 h-4 w-4" />
          )}
          Refresh
        </Button>
      </LexPageHeader>

      {isLoading && !stats ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] w-full" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* `dashboard-stats` is what scopes the per-theme tint in
              DashboardOverview.css, so it stays even though the grid is
              Tailwind's. */}
          <div className="dashboard-stats grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile
              label="Total tenants"
              value={stats.totalTenants}
              to="/Platform/Tenants"
              theme="emerald"
              icon={Building2}
            />
            <StatTile
              label="Active"
              value={stats.activeTenants}
              denominator={stats.totalTenants}
              to="/Platform/Tenants?status=ACTIVE"
              theme="indigo"
              icon={CheckCircle2}
            />
            <StatTile
              label="Suspended"
              value={stats.suspendedTenants}
              denominator={stats.totalTenants}
              to="/Platform/Tenants?status=SUSPENDED"
              theme="cyan"
              icon={PauseCircle}
            />
            {/* Amber and rose carry the two alarms: a tenant stuck mid-SAGA and
                a signup that took money and delivered nothing. */}
            <StatTile
              label="Provisioning"
              value={stats.provisioningTenants}
              denominator={stats.totalTenants}
              to="/Platform/Tenants?status=PROVISIONING"
              theme="amber"
              icon={Loader2}
            />
            <StatTile
              label="Pending signups"
              value={stats.pendingSignups}
              theme="violet"
              icon={Clock}
            />
            <StatTile
              label="Failed signups"
              value={stats.failedSignups}
              to="/Platform/Tenants?status=FAILED"
              theme="rose"
              icon={AlertTriangle}
            />
          </div>

          {/* The one number the page exists for, so it gets the brand surface
              rather than a seventh tile. */}
          <div className="pro-card mt-3 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="pro-head-badge">
                <Banknote className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">
                  Monthly recurring revenue — annual plans already normalised to a monthly
                  figure
                </div>
                <div className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
                  {money(stats.monthlyRecurringRevenue, stats.currency)}
                </div>
              </div>
            </div>
          </div>

          {stats.provisioningTenants > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Tenants sit in <strong>PROVISIONING</strong> for a second or two. One that has been
              there longer is not mid-SAGA — it is stuck, and identity-service or Keycloak is where
              to look.
            </p>
          )}
          {stats.failedSignups > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Each failed signup is somebody who paid and got nothing — a refund decision waiting to
              be made.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
};

export default PlatformDashboard;
