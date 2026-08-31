import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, Banknote, Building2, Loader2, RefreshCw } from "lucide-react";

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
 * One statistic, on the app's shared `.pro-tile` surface so this page matches
 * the Lex and tenancy screens rather than inventing a card of its own.
 *
 * `share` is the client's own arithmetic — the endpoint sends counts, never
 * percentages — so the denominator is passed explicitly and the bar is omitted
 * where a tile is not honestly a share of anything. An empty track would read
 * as 0%, which is a different claim.
 */
const StatTile = ({
  label,
  value,
  denominator,
  to,
  alarm,
}: {
  label: string;
  value: number;
  denominator?: number;
  to?: string;
  alarm?: boolean;
}) => {
  const share =
    denominator != null && denominator > 0 ? (value / denominator) * 100 : null;

  const body = (
    <div
      className={cn(
        "pro-tile flex h-full flex-col gap-1.5 transition-colors",
        alarm &&
          "border-[color-mix(in_srgb,var(--color-warning)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_7%,var(--surface-card))]",
        to && !alarm && "hover:bg-[color-mix(in_srgb,var(--primary)_7%,var(--surface-card))]",
        to && alarm && "hover:bg-[color-mix(in_srgb,var(--color-warning)_12%,var(--surface-card))]"
      )}
    >
      <span className="pro-tile__label flex items-center gap-1.5">
        {alarm ? (
          <AlertTriangle
            className="h-3.5 w-3.5 shrink-0 text-[var(--color-warning)]"
            aria-hidden="true"
          />
        ) : null}
        {label}
      </span>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold leading-tight tabular-nums text-foreground">
          {value}
        </span>
        {share !== null ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {share.toFixed(0)}%
          </span>
        ) : null}
      </div>

      {share !== null ? (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              width: `${Math.min(100, share)}%`,
              backgroundColor: alarm ? "var(--color-warning)" : "var(--primary)",
            }}
          />
        </div>
      ) : null}
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[86px] w-full" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <StatTile
              label="Total tenants"
              value={stats.totalTenants}
              to="/Platform/Tenants"
            />
            <StatTile
              label="Active"
              value={stats.activeTenants}
              denominator={stats.totalTenants}
              to="/Platform/Tenants?status=ACTIVE"
            />
            <StatTile
              label="Suspended"
              value={stats.suspendedTenants}
              denominator={stats.totalTenants}
              to="/Platform/Tenants?status=SUSPENDED"
            />
            <StatTile
              label="Provisioning"
              value={stats.provisioningTenants}
              denominator={stats.totalTenants}
              to="/Platform/Tenants?status=PROVISIONING"
              alarm={stats.provisioningTenants > 0}
            />
            <StatTile label="Pending signups" value={stats.pendingSignups} />
            <StatTile
              label="Failed signups"
              value={stats.failedSignups}
              to="/Platform/Tenants?status=FAILED"
              alarm={stats.failedSignups > 0}
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
