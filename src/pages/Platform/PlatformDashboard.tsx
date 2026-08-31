import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, Building2, Loader2, RefreshCw } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { LexPageHeader } from "../../components/shared/lexKit";
import { money } from "../../components/shared/tenancyKitUtils";
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
const Tile = ({
  label,
  value,
  to,
  alarm,
}: {
  label: string;
  value: React.ReactNode;
  to?: string;
  alarm?: boolean;
}) => {
  const body = (
    <div
      className={`h-100 rounded-lg border p-3 transition-colors ${
        alarm
          ? "border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10"
          : "border-border bg-card hover:bg-muted/40"
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {alarm && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
  return to ? (
    <Link to={to} className="text-decoration-none">
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
        <div className="row g-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="col-6 col-lg-4 col-xl-2" key={i}>
              <Skeleton className="h-[86px] w-full" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="row g-3">
            <div className="col-6 col-lg-4 col-xl-2">
              <Tile label="Total tenants" value={stats.totalTenants} to="/Platform/Tenants" />
            </div>
            <div className="col-6 col-lg-4 col-xl-2">
              <Tile
                label="Active"
                value={stats.activeTenants}
                to="/Platform/Tenants?status=ACTIVE"
              />
            </div>
            <div className="col-6 col-lg-4 col-xl-2">
              <Tile
                label="Suspended"
                value={stats.suspendedTenants}
                to="/Platform/Tenants?status=SUSPENDED"
              />
            </div>
            <div className="col-6 col-lg-4 col-xl-2">
              <Tile
                label="Provisioning"
                value={stats.provisioningTenants}
                to="/Platform/Tenants?status=PROVISIONING"
                alarm={stats.provisioningTenants > 0}
              />
            </div>
            <div className="col-6 col-lg-4 col-xl-2">
              <Tile label="Pending signups" value={stats.pendingSignups} />
            </div>
            <div className="col-6 col-lg-4 col-xl-2">
              <Tile
                label="Failed signups"
                value={stats.failedSignups}
                to="/Platform/Tenants?status=FAILED"
                alarm={stats.failedSignups > 0}
              />
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">
              Monthly recurring revenue — annual plans already normalised to a monthly figure
            </div>
            <div className="mt-1 text-3xl font-semibold text-foreground">
              {money(stats.monthlyRecurringRevenue, stats.currency)}
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
