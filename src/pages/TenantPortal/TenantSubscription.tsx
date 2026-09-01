import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Boxes, CalendarClock, CreditCard, Loader2, Repeat } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Switch } from "../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { formatDate } from "../../components/shared/detailKitUtils";
import { LexPageHeader } from "../../components/shared/lexKit";
import { TenancyStatusBadge } from "../../components/shared/tenancyKit";
import { money } from "../../components/shared/tenancyKitUtils";
import { getCatalogPackages, type CatalogPackage } from "../../redux/apis/apisTenantProvisioning";
import {
  getMySubscription,
  getMySubscriptionHistory,
  setMyAutoRenew,
  setMyPackages,
  toTenancyError,
  type SubscriptionResponse,
} from "../../redux/apis/apisTenancyAdmin";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-b-0">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="min-w-0 break-words text-end font-medium text-foreground">{value ?? "—"}</span>
  </div>
);

/**
 * The customer's own plan.
 *
 * The change-plan control is the console's endpoint with different copy: this
 * is **real billing**, charged to the card on file the moment it is confirmed,
 * so the dialog states the amount rule before the button rather than after.
 *
 * Full replacement, as on the console side: the ticks are the plan, and
 * unticking is how a package is dropped.
 */
const TenantSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [history, setHistory] = useState<SubscriptionResponse[]>([]);
  const [catalog, setCatalog] = useState<CatalogPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const currentCodes = useMemo(
    () => (subscription?.items || []).map((i) => i.packageCode),
    [subscription]
  );

  const load = async () => {
    try {
      setSubscription(await getMySubscription());
    } catch (error) {
      const e = toTenancyError(error, "Could not load your subscription.");
      // A tenant mid-provisioning or cancelled simply has none.
      if (e.code !== "TENANCY.SUBSCRIPTION.NOT_FOUND") toast.error(e.message);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    getMySubscriptionHistory()
      .then(setHistory)
      .catch(() => setHistory([]));
    getCatalogPackages()
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);

  const toggleAutoRenew = async (enabled: boolean) => {
    setBusy(true);
    try {
      setSubscription(await setMyAutoRenew(enabled));
      toast.success(
        enabled
          ? "Auto-renew on — your plan renews on the period end date."
          : "Auto-renew off — your plan ends on the period end date."
      );
    } catch (error) {
      toast.error(toTenancyError(error, "Could not change auto-renew.").message);
    } finally {
      setBusy(false);
    }
  };

  const applyChange = async () => {
    setBusy(true);
    try {
      const result = await setMyPackages(selected);
      if (result.invoiceId && result.chargedNow > 0) {
        toast.success(
          `${money(result.chargedNow, result.currency)} charged now, including VAT. An invoice is in your billing history.`
        );
      } else {
        toast.success(
          "Plan updated. Nothing charged now — the reduction is credited at your next renewal."
        );
      }
      setChangeOpen(false);
      await load();
    } catch (error) {
      const e = toTenancyError(error, "Could not change your plan.");
      if (e.status === 409) {
        toast.error("Your subscription changed elsewhere. Reloading — please try again.");
        load();
      } else {
        toast.error(e.traceId ? `${e.message} (trace ${e.traceId})` : e.message);
      }
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div>
      <LexPageHeader icon={CreditCard} title="Plan & Packages" subtitle="What you are subscribed to today.">
        {subscription && (
          <Button
            size="sm"
            onClick={() => {
              setSelected(currentCodes);
              setChangeOpen(true);
            }}
          >
            Change plan
          </Button>
        )}
      </LexPageHeader>

      {!subscription ? (
        <p className="text-sm text-muted-foreground">
          You have no active subscription. If you have just signed up, provisioning is still
          finishing — this page fills in within a minute or two.
        </p>
      ) : (
        <>
          {/* What the customer is paying and until when, before any of the
              plan's paperwork. */}
          <div className="dashboard-stats mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="stat-card stat-card--emerald">
              <div className="stat-card__row">
                <span className="stat-card__title">Recurring</span>
                <span className="stat-card__icon">
                  <CreditCard strokeWidth={2} />
                </span>
              </div>
              <div className="stat-card__value-row">
                <p className="stat-card__value">
                  {money(subscription.recurringAmount, subscription.currency)}
                </p>
              </div>
            </div>
            <div className="stat-card stat-card--indigo">
              <div className="stat-card__row">
                <span className="stat-card__title">Billing cycle</span>
                <span className="stat-card__icon">
                  <Repeat strokeWidth={2} />
                </span>
              </div>
              <div className="stat-card__value-row">
                <p className="stat-card__value">{subscription.billingCycle}</p>
              </div>
            </div>
            <div className="stat-card stat-card--violet">
              <div className="stat-card__row">
                <span className="stat-card__title">Renews on</span>
                <span className="stat-card__icon">
                  <CalendarClock strokeWidth={2} />
                </span>
              </div>
              <div className="stat-card__value-row">
                <p className="stat-card__value">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>
            <div className="stat-card stat-card--amber">
              <div className="stat-card__row">
                <span className="stat-card__title">Packages</span>
                <span className="stat-card__icon">
                  <Boxes strokeWidth={2} />
                </span>
              </div>
              <div className="stat-card__value-row">
                <p className="stat-card__value">{subscription.items?.length ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <section className="pro-card p-4">
              <h2 className="pro-card-title mb-3">Plan</h2>
              <Row
                label="Subscription"
                value={
                  <span className="select-all font-mono text-xs">
                    {subscription.subscriptionNo}
                  </span>
                }
              />
              <Row label="Status" value={<TenancyStatusBadge status={subscription.status} />} />
              <Row
                label="Current period"
                value={`${formatDate(subscription.currentPeriodStart)} → ${formatDate(
                  subscription.currentPeriodEnd
                )}`}
              />
              <div className="flex items-center justify-between gap-4 py-2 text-sm">
                <div className="min-w-0">
                  <div className="text-muted-foreground">Auto-renew</div>
                  {/* The consequence, not just the state — this is the switch
                      that decides whether the workspace keeps running. */}
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {subscription.autoRenew
                      ? `Renews automatically on ${formatDate(subscription.currentPeriodEnd)}.`
                      : "Your plan will end at the close of this period."}
                  </div>
                </div>
                <Switch
                  checked={subscription.autoRenew}
                  disabled={busy}
                  onCheckedChange={toggleAutoRenew}
                />
              </div>
            </section>

            <section className="pro-card p-4">
              <h2 className="pro-card-title mb-3">Your packages</h2>
              <div className="grid gap-2">
                {subscription.items?.map((item) => {
                  // The catalogue is already loaded for the change dialog, so
                  // the line can carry the name the customer bought rather than
                  // the code we happen to store it under.
                  const pkg = catalog.find((c) => c.packageCode === item.packageCode);
                  return (
                    <div
                      key={item.packageCode}
                      className="flex items-center justify-between gap-3 rounded-[2px] border border-[var(--surface-border)] p-2.5"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {pkg?.nameEn || item.packageCode}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {item.packageCode}
                        </div>
                      </div>
                      <div className="shrink-0 text-end">
                        <div className="text-sm font-semibold tabular-nums text-foreground">
                          {money(item.unitPrice, subscription.currency)}
                        </div>
                        {item.quantity > 1 ? (
                          <div className="text-[11px] text-muted-foreground">
                            × {item.quantity}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {history.length > 1 && (
              <section className="pro-card p-4 lg:col-span-2">
                <h2 className="pro-card-title mb-3">Plan history</h2>
                <div className="grid gap-2">
                  {history.map((h) => (
                    <div
                      key={h.subscriptionId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-[var(--surface-border)] p-2.5 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs">{h.subscriptionNo}</span>
                        <TenancyStatusBadge status={h.status} />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(h.currentPeriodStart)} → {formatDate(h.currentPeriodEnd)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}

      <Dialog open={changeOpen} onOpenChange={setChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change your plan</DialogTitle>
            <DialogDescription>
              What you tick <strong>is</strong> your plan — unticking a package removes it. Adding
              one charges the difference plus VAT to your card on file immediately and raises an
              invoice. Removing one is credited at your next renewal, not refunded now. Your renewal
              date does not change.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[20rem] gap-2 overflow-y-auto">
            {catalog.map((p) => (
              <label key={p.packageCode} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(p.packageCode)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked ? [...prev, p.packageCode] : prev.filter((c) => c !== p.packageCode)
                    )
                  }
                />
                <span>
                  <span className="font-medium">{p.nameEn}</span>
                  {currentCodes.includes(p.packageCode) && (
                    <Badge variant="outline" className="ms-1 border-border text-[10px]">
                      current
                    </Badge>
                  )}
                  <div dir="rtl" className="text-xs text-muted-foreground">
                    {p.nameAr}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {money(p.monthlyPrice, p.currency)} / month
                  </div>
                </span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeOpen(false)}>
              Keep my plan
            </Button>
            <Button disabled={busy || selected.length === 0} onClick={applyChange}>
              {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
              Confirm and pay any difference
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantSubscription;
