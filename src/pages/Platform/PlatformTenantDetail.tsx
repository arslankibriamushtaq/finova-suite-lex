import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Building2, Loader2, PauseCircle, PlayCircle, XCircle } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { LexPageHeader } from "../../components/shared/lexKit";
import { TenancyStatusBadge } from "../../components/shared/tenancyKit";
import { money } from "../../components/shared/tenancyKitUtils";
import {
  cancelTenant,
  getPlatformPackages,
  getTenantOverview,
  reactivateTenant,
  setTenantPackages,
  suspendTenant,
  toTenancyError,
  type PlatformPackage,
  type TenantOverview,
} from "../../redux/apis/apisTenancyAdmin";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-b-0">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="min-w-0 break-words text-end font-medium text-foreground">{value ?? "—"}</span>
  </div>
);

/**
 * One customer.
 *
 * Three things happen here that are not reads:
 *
 * - **Suspend** is the reversible action and the visually obvious one. It is
 *   offered only from ACTIVE — the server answers 422 otherwise, so the button
 *   is hidden rather than allowed to fail.
 * - **Cancel** cannot be undone by any endpoint on this service; recovering a
 *   cancelled tenant is a database job. It asks for the tenant code to be typed.
 * - **Packages** is a full replacement seeded with the current plan, never an
 *   "add package" — sending `["LOS"]` to a tenant on three packages removes two.
 */
const PlatformTenantDetail = () => {
  const { tenantId = "" } = useParams();

  const [overview, setOverview] = useState<TenantOverview | null>(null);
  const [packages, setPackages] = useState<PlatformPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const tenant = overview?.tenant;

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getTenantOverview(tenantId);
      setOverview(data);
    } catch (error) {
      toast.error(toTenancyError(error, "Could not load this tenant.").message);
      setOverview(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    getPlatformPackages()
      .then(setPackages)
      .catch(() => setPackages([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  /**
   * What the tenant is on today, so the multi-select opens seeded rather than
   * empty — an empty one turns "add LMS" into "remove everything else".
   *
   * The overview carries entitled modules, not package codes, so this infers
   * the plan: a package is current when every module it grants is entitled.
   * It over-reports where one package's modules are a subset of another's, so
   * the operator confirms the ticks against the invoice before applying —
   * which the dialog's copy asks them to do anyway.
   */
  const currentCodes = useMemo(() => {
    const entitled = new Set(overview?.entitledModules || []);
    if (entitled.size === 0) return [];
    return packages
      .filter((p) => p.moduleCodes?.length && p.moduleCodes.every((m) => entitled.has(m)))
      .map((p) => p.packageCode);
  }, [packages, overview]);

  const handleError = (error: unknown, fallback: string) => {
    const e = toTenancyError(error, fallback);
    if (e.status === 409) {
      toast.error("Somebody else changed this tenant. Reloading — please re-apply your change.");
      load();
      return;
    }
    if (e.code === "TENANCY.IDENTITY.UNAVAILABLE") {
      toast.error(
        "identity-service is unreachable and the change may be half-applied. Reloading before you retry."
      );
      load();
      return;
    }
    toast.error(e.traceId ? `${e.message} (trace ${e.traceId})` : e.message);
  };

  // 204 No Content on all three transitions — refetch rather than assume.
  const runTransition = async (fn: () => Promise<void>, done: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(done);
      setSuspendOpen(false);
      setCancelOpen(false);
      setReason("");
      setConfirmCode("");
      await load();
    } catch (error) {
      handleError(error, "The action failed.");
    } finally {
      setBusy(false);
    }
  };

  const savePackages = async () => {
    setBusy(true);
    try {
      const result = await setTenantPackages(tenantId, selected);
      // Upgrade and downgrade are different messages and the operator needs to
      // know which one the customer got.
      if (result.invoiceId && result.chargedNow > 0) {
        toast.success(
          `Charged ${money(result.chargedNow, result.currency)} now — invoice raised. Renewal date unchanged.`
        );
      } else {
        toast.success(
          "Packages updated. Nothing charged now — dropped modules are credited at renewal, not refunded."
        );
      }
      setPackagesOpen(false);
      await load();
    } catch (error) {
      handleError(error, "Could not change the packages.");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="d-grid gap-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div>
        <Link to="/Platform/Tenants" className="text-decoration-none text-sm">
          <ArrowLeft className="me-1 inline h-4 w-4" />
          Back to tenants
        </Link>
        <p className="mt-3 text-sm text-muted-foreground">This tenant could not be loaded.</p>
      </div>
    );
  }

  const isProvisioningStuck = tenant.status === "PROVISIONING" && !overview?.subscriptionNo;

  return (
    <div>
      <Link to="/Platform/Tenants" className="text-decoration-none text-sm">
        <ArrowLeft className="me-1 inline h-4 w-4" />
        Back to tenants
      </Link>

      <LexPageHeader icon={Building2} title={tenant.companyName} subtitle={tenant.tenantCode}>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <TenancyStatusBadge status={tenant.status} />
          {/* Suspend is legal only from ACTIVE — anything else is a 422. */}
          {tenant.status === "ACTIVE" && (
            <Button size="sm" onClick={() => setSuspendOpen(true)}>
              <PauseCircle className="me-1 h-4 w-4" />
              Suspend
            </Button>
          )}
          {tenant.status === "SUSPENDED" && (
            <Button
              size="sm"
              onClick={() => runTransition(() => reactivateTenant(tenantId), "Tenant reactivated.")}
              disabled={busy}
            >
              <PlayCircle className="me-1 h-4 w-4" />
              Reactivate
            </Button>
          )}
          {tenant.status !== "CANCELLED" && (
            <Button size="sm" variant="ghost" onClick={() => setCancelOpen(true)}>
              <XCircle className="me-1 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </LexPageHeader>

      {isProvisioningStuck && (
        <div className="mb-3 rounded-lg border border-amber-500/50 bg-amber-500/5 p-3 text-sm">
          Mid-SAGA: provisioning with no subscription yet. If it has been here longer than a minute
          or two it is stuck — check identity-service and Keycloak.
        </div>
      )}

      {tenant.status === "SUSPENDED" && tenant.suspensionReason && (
        <div className="mb-3 rounded-lg border border-orange-500/50 bg-orange-500/5 p-3 text-sm">
          <strong>Suspended:</strong> {tenant.suspensionReason}
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-1 text-sm font-semibold">Company</div>
            <Row
              label="Name (AR)"
              value={
                tenant.companyNameAr ? <span dir="rtl">{tenant.companyNameAr}</span> : "—"
              }
            />
            <Row label="CR number" value={tenant.crNumber} />
            <Row label="VAT number" value={tenant.vatNumber} />
            <Row label="Country / City" value={[tenant.countryCode, tenant.city].filter(Boolean).join(" · ") || "—"} />
            <Row label="Email" value={tenant.companyEmail} />
            <Row label="Phone" value={tenant.companyPhone} />
            <Row label="Website" value={tenant.website} />
            <Row label="Admin" value={tenant.adminEmail} />
            <Row label="Created" value={tenant.createdAt} />
            <Row label="Activated" value={tenant.activatedAt} />
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-1 d-flex align-items-center justify-content-between">
              <div className="text-sm font-semibold">Subscription</div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelected(currentCodes);
                  setPackagesOpen(true);
                }}
                disabled={!overview?.subscriptionNo}
              >
                Change packages
              </Button>
            </div>
            <Row label="Number" value={overview?.subscriptionNo} />
            <Row label="Status" value={<TenancyStatusBadge status={overview?.subscriptionStatus} />} />
            <Row label="Period ends" value={overview?.currentPeriodEnd} />
            <Row label="Recurring" value={money(overview?.recurringAmount, overview?.currency)} />
            <Row label="Invoices" value={overview?.invoiceCount} />
            <Row label="Lifetime billed" value={money(overview?.lifetimeBilled, overview?.currency)} />
          </div>

          <div className="mt-3 rounded-lg border border-border bg-card p-3">
            <div className="mb-2 text-sm font-semibold">
              Entitled modules
              <span className="ms-2 fw-normal text-xs text-muted-foreground">
                what this customer can actually reach
              </span>
            </div>
            <div className="d-flex flex-wrap gap-1">
              {(overview?.entitledModules || []).map((m) => (
                <Badge key={m} variant="outline" className="border-border font-mono text-[11px]">
                  {m}
                </Badge>
              ))}
              {!overview?.entitledModules?.length && (
                <span className="text-sm text-muted-foreground">None yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suspend ------------------------------------------------------- */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend {tenant.companyName}</DialogTitle>
            <DialogDescription>
              Every user carrying this tenant id is disabled and the subscription is suspended.
              Nothing is deleted, and reactivating puts it all back.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="suspend-reason">Reason shown to the customer</Label>
            <Textarea
              id="suspend-reason"
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="This text appears on the tenant record and in their portal."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Keep active
            </Button>
            <Button
              disabled={busy || !reason.trim()}
              onClick={() => runTransition(() => suspendTenant(tenantId, reason.trim()), "Tenant suspended.")}
            >
              {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel -------------------------------------------------------- */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel {tenant.companyName}</DialogTitle>
            <DialogDescription>
              This cannot be undone from here. A cancelled tenant cannot be reactivated by any
              endpoint on this service — recovering one is a database job. If you want something
              reversible, suspend instead.
            </DialogDescription>
          </DialogHeader>
          <div className="d-grid gap-2">
            <div>
              <Label htmlFor="cancel-reason">Reason shown to the customer</Label>
              <Textarea
                id="cancel-reason"
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cancel-code">
                Type <span className="font-mono">{tenant.tenantCode}</span> to confirm
              </Label>
              <Input
                id="cancel-code"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep the tenant
            </Button>
            <Button
              variant="destructive"
              disabled={busy || !reason.trim() || confirmCode !== tenant.tenantCode}
              onClick={() => runTransition(() => cancelTenant(tenantId, reason.trim()), "Tenant cancelled.")}
            >
              {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
              Cancel tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Packages ------------------------------------------------------ */}
      <Dialog open={packagesOpen} onOpenChange={setPackagesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Packages for {tenant.companyName}</DialogTitle>
            <DialogDescription>
              This replaces the plan with exactly what is ticked. Adding charges the difference plus
              VAT now and raises an invoice; removing is credited at renewal, not refunded. The
              renewal date does not move.
            </DialogDescription>
          </DialogHeader>
          <div className="d-grid gap-2" style={{ maxHeight: 320, overflowY: "auto" }}>
            {packages.map((p) => (
              <label key={p.packageCode} className="d-flex align-items-start gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(p.packageCode)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked ? [...prev, p.packageCode] : prev.filter((c) => c !== p.packageCode)
                    )
                  }
                />
                <span>
                  <span className="fw-medium">{p.nameEn}</span>{" "}
                  <span className="font-mono text-xs text-muted-foreground">{p.packageCode}</span>
                  {!p.active && (
                    <Badge variant="outline" className="ms-1 border-border text-[10px]">
                      withdrawn
                    </Badge>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {money(p.monthlyPrice, p.currency)} / month
                  </div>
                </span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackagesOpen(false)}>
              Discard
            </Button>
            <Button disabled={busy || selected.length === 0} onClick={savePackages}>
              {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformTenantDetail;
