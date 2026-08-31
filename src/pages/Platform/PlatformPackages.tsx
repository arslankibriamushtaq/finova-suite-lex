import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Boxes, Loader2, Package, Pencil, Plus, Tag } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
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
import { EmptyState } from "../../components/shared/detailKit";
import { LexPageHeader } from "../../components/shared/lexKit";
import { money } from "../../components/shared/tenancyKitUtils";
import {
  createPackage,
  getPlatformPackages,
  setPackageActive,
  toTenancyError,
  updatePackage,
  updatePackagePricing,
  type PlatformPackage,
} from "../../redux/apis/apisTenancyAdmin";

const PACKAGE_CODE_RE = /^[A-Z][A-Z0-9_]{1,49}$/;

/**
 * BurqPay refuses a single checkout above this. The binding figure is not one
 * package but the dearest thing a buyer can assemble — every package on sale,
 * billed annually, with VAT — so that is what the pricing dialog checks. Price
 * above it and the buyer completes the whole funnel and is refused at payment.
 */
const CHECKOUT_CEILING = 100000;
const VAT_MULTIPLIER = 1.15;

/**
 * The catalogue and the price list.
 *
 * Three edits live here and they are deliberately three separate dialogs,
 * because they carry three different risks:
 *
 * - **Pricing** affects new quotes only — every existing subscription stores
 *   the unit prices it was sold at. That sentence is on the screen, because
 *   without it the confirm reads like it is about to reprice every customer.
 * - **Modules** decide what a buyer receives. Changing them is a change to the
 *   product, not to any live account, so it is its own screen rather than a
 *   field beside the description.
 * - **Name/description** is the safe one.
 */
const PlatformPackages = () => {
  const [rows, setRows] = useState<PlatformPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [pricing, setPricing] = useState<PlatformPackage | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [annualPrice, setAnnualPrice] = useState("");
  const [reason, setReason] = useState("");

  const [details, setDetails] = useState<PlatformPackage | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [modules, setModules] = useState<PlatformPackage | null>(null);
  const [moduleCodes, setModuleCodes] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getPlatformPackages();
      setRows([...data].sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      toast.error(toTenancyError(error, "Could not load the catalogue.").message);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /**
   * The worst basket a buyer could take to checkout if this edit were saved:
   * every package on sale, annually, with VAT — with the edited package priced
   * at what is currently typed. Withdrawn packages are excluded because nobody
   * can add one to a new quote.
   */
  const worstCaseCheckout = useMemo(() => {
    // The package being priced right now — an existing one in the pricing
    // dialog, or the one being created.
    const editedCode = pricing?.packageCode ?? (createOpen ? newCode.trim().toUpperCase() : null);
    if (!editedCode) return 0;

    const typed = Number(annualPrice);
    const edited = Number.isFinite(typed) ? typed : 0;

    // Withdrawn packages are excluded: nobody can add one to a new quote.
    const others = rows
      .filter((p) => p.active && p.packageCode !== editedCode)
      .reduce((sum, p) => sum + p.annualPrice, 0);

    return (others + edited) * VAT_MULTIPLIER;
  }, [rows, pricing, createOpen, newCode, annualPrice]);

  const overCeiling = worstCaseCheckout > CHECKOUT_CEILING;

  const fail = (error: unknown, fallback: string) => {
    const e = toTenancyError(error, fallback);
    if (e.status === 409) {
      toast.error("Somebody else changed this package. Reloading — please re-apply your change.");
      load();
      return;
    }
    toast.error(e.traceId ? `${e.message} (trace ${e.traceId})` : e.message);
  };

  const savePricing = async () => {
    if (!pricing) return;
    setBusy(true);
    try {
      await updatePackagePricing(pricing.packageCode, {
        monthlyPrice: Number(monthlyPrice),
        annualPrice: Number(annualPrice),
        currency: pricing.currency,
        reason: reason.trim(),
      });
      toast.success("Price list updated. New quotes only — no existing bill moved.");
      setPricing(null);
      setReason("");
      await load();
    } catch (error) {
      fail(error, "Could not update the price.");
    } finally {
      setBusy(false);
    }
  };

  const saveDetails = async () => {
    if (!details) return;
    setBusy(true);
    try {
      await updatePackage(details.packageCode, {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        displayOrder: Number(displayOrder),
      });
      toast.success("Package updated.");
      setDetails(null);
      await load();
    } catch (error) {
      fail(error, "Could not update the package.");
    } finally {
      setBusy(false);
    }
  };

  const saveModules = async () => {
    if (!modules) return;
    setBusy(true);
    try {
      const codes = moduleCodes
        .split(/[\s,]+/)
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);
      await updatePackage(modules.packageCode, { moduleCodes: codes });
      toast.success(
        "Product updated. New buyers get this set; existing tenants pick it up on their next subscription change."
      );
      setModules(null);
      await load();
    } catch (error) {
      fail(error, "Could not update the modules.");
    } finally {
      setBusy(false);
    }
  };

  const create = async () => {
    setBusy(true);
    try {
      await createPackage({
        packageCode: newCode.trim().toUpperCase(),
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        moduleCodes: moduleCodes
          .split(/[\s,]+/)
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean),
        monthlyPrice: Number(monthlyPrice),
        annualPrice: Number(annualPrice),
        currency: "SAR",
        bundle: false,
        displayOrder: Number(displayOrder) || 0,
      });
      toast.success("Package created.");
      setCreateOpen(false);
      await load();
    } catch (error) {
      fail(error, "Could not create the package.");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (p: PlatformPackage) => {
    setBusy(true);
    try {
      await setPackageActive(p.packageCode, !p.active);
      toast.success(
        p.active
          ? "Withdrawn from the public catalog. Existing subscribers keep it."
          : "Back on sale."
      );
      await load();
    } catch (error) {
      fail(error, "Could not change the package state.");
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setNameEn("");
    setNameAr("");
    setDescriptionEn("");
    setDescriptionAr("");
    setModuleCodes("");
    setMonthlyPrice("");
    setAnnualPrice("");
    setDisplayOrder("0");
    setNewCode("");
  };

  return (
    <div>
      <LexPageHeader
        icon={Boxes}
        title="Packages & Pricing"
        subtitle="Everything the platform sells, withdrawn packages included."
      >
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setCreateOpen(true);
          }}
        >
          <Plus className="me-1 h-4 w-4" />
          New package
        </Button>
      </LexPageHeader>

      <p className="mb-3 text-sm text-muted-foreground">
        A price change applies to <strong>new quotes only</strong>. Every existing subscription
        stores the unit prices it was sold at, so no customer's bill moves.
      </p>

      {isLoading && rows.length === 0 ? (
        <div className="grid gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Package} text="The catalogue is empty." />
      ) : (
        <div className="grid gap-2">
          {rows.map((p) => (
            <div key={p.packageCode} className="pro-card p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.nameEn}</span>
                    <span className="font-mono text-xs text-muted-foreground">{p.packageCode}</span>
                    {p.bundle && (
                      <Badge variant="outline" className="border-border text-[10px]">
                        bundle
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        p.active
                          ? "border-red-200 bg-red-50 text-red-700 text-[10px]"
                          : "border-slate-500/40 bg-slate-500/10 text-slate-600 text-[10px]"
                      }
                    >
                      {p.active ? "on sale" : "withdrawn"}
                    </Badge>
                  </div>
                  <div dir="rtl" className="text-xs text-muted-foreground">
                    {p.nameAr}
                  </div>
                  <div className="mt-1 text-sm">
                    {money(p.monthlyPrice, p.currency)} / month ·{" "}
                    {money(p.annualPrice, p.currency)} / year
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.moduleCodes?.map((m) => (
                      <Badge
                        key={m}
                        variant="outline"
                        className="border-border font-mono text-[10px]"
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPricing(p);
                      setMonthlyPrice(String(p.monthlyPrice));
                      setAnnualPrice(String(p.annualPrice));
                      setReason("");
                    }}
                  >
                    <Tag className="me-1 h-4 w-4" />
                    Pricing
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDetails(p);
                      setNameEn(p.nameEn);
                      setNameAr(p.nameAr);
                      setDescriptionEn(p.descriptionEn || "");
                      setDescriptionAr(p.descriptionAr || "");
                      setDisplayOrder(String(p.displayOrder));
                    }}
                  >
                    <Pencil className="me-1 h-4 w-4" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setModules(p);
                      setModuleCodes((p.moduleCodes || []).join(", "));
                    }}
                  >
                    Modules
                  </Button>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={p.active}
                      disabled={busy}
                      onCheckedChange={() => toggleActive(p)}
                    />
                    <span className="text-xs text-muted-foreground">on sale</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pricing ------------------------------------------------------- */}
      <Dialog open={!!pricing} onOpenChange={(open) => !open && setPricing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Price {pricing?.nameEn}</DialogTitle>
            <DialogDescription>
              This affects <strong>new quotes only</strong>. Every existing subscription keeps the
              unit prices it was sold at — no customer's bill moves.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <div>
              <Label htmlFor="p-monthly">Monthly price ({pricing?.currency})</Label>
              <Input
                id="p-monthly"
                type="number"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="p-annual">Annual price ({pricing?.currency})</Label>
              <Input
                id="p-annual"
                type="number"
                value={annualPrice}
                onChange={(e) => setAnnualPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="p-reason">Reason (required)</Label>
              <Input
                id="p-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. 2027 price list"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Stored with the old and new prices and your name. A price list without a reason is
                unusable in a billing dispute six months later.
              </p>
            </div>

            {overCeiling && (
              <div className="rounded-md border border-[color-mix(in_srgb,var(--color-warning)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-2 text-xs">
                <strong>Above the checkout ceiling.</strong> Everything on sale, billed annually
                with VAT, comes to {money(worstCaseCheckout, pricing?.currency)} — and the payment
                provider refuses a single checkout above{" "}
                {money(CHECKOUT_CEILING, pricing?.currency)}. A buyer taking the full set would
                complete the whole funnel and be refused at payment.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPricing(null)}>
              Discard
            </Button>
            <Button disabled={busy || !reason.trim() || !monthlyPrice || !annualPrice} onClick={savePricing}>
              {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
              Update price list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details ------------------------------------------------------- */}
      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {details?.packageCode}</DialogTitle>
            <DialogDescription>
              Names, descriptions and ordering. What the package grants is edited separately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <div>
              <Label htmlFor="d-en">Name (EN)</Label>
              <Input id="d-en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="d-ar">Name (AR)</Label>
              <Input id="d-ar" dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="d-den">Description (EN)</Label>
              <Textarea
                id="d-den"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="d-dar">Description (AR)</Label>
              <Textarea
                id="d-dar"
                dir="rtl"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="d-order">Display order</Label>
              <Input
                id="d-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetails(null)}>
              Discard
            </Button>
            <Button disabled={busy} onClick={saveDetails}>
              {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modules ------------------------------------------------------- */}
      <Dialog open={!!modules} onOpenChange={(open) => !open && setModules(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What {modules?.packageCode} grants</DialogTitle>
            <DialogDescription>
              This is a change to the product, not to any live account. Adding a code grants it to
              everyone who buys this package from now on; existing tenants pick it up when their
              subscription is next changed. Removing one does not strip it from existing tenants.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="m-codes">Module codes</Label>
            <Textarea
              id="m-codes"
              rows={4}
              value={moduleCodes}
              onChange={(e) => setModuleCodes(e.target.value)}
              placeholder="ONBOARDING, KYC, CUSTOMER, WORKFLOW"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Comma or space separated. These are identity-service module codes — they drive the
              tenant's Casbin policies.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModules(null)}>
              Discard
            </Button>
            <Button disabled={busy || !moduleCodes.trim()} onClick={saveModules}>
              {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
              Change the product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create -------------------------------------------------------- */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New package</DialogTitle>
            <DialogDescription>
              It is created withdrawn or on sale per the server default — check the list afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <div>
              <Label htmlFor="c-code">Package code</Label>
              <Input
                id="c-code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="SME"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                <strong>Permanent — there is no rename.</strong> Subscriptions and invoices are
                written against this code. Format: {"A–Z, then A–Z 0–9 _ (2–50)"}.
              </p>
            </div>
            <div>
              <Label htmlFor="c-en">Name (EN)</Label>
              <Input id="c-en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="c-ar">Name (AR)</Label>
              <Input id="c-ar" dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="c-mods">Module codes</Label>
              <Textarea
                id="c-mods"
                value={moduleCodes}
                onChange={(e) => setModuleCodes(e.target.value)}
                placeholder="CUSTOMER, LENDING, PRODUCT"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="c-monthly">Monthly (SAR)</Label>
                <Input
                  id="c-monthly"
                  type="number"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="c-annual">Annual (SAR)</Label>
                <Input
                  id="c-annual"
                  type="number"
                  value={annualPrice}
                  onChange={(e) => setAnnualPrice(e.target.value)}
                />
              </div>
            </div>
            {overCeiling && (
              <div className="rounded-md border border-[color-mix(in_srgb,var(--color-warning)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-2 text-xs">
                <strong>Above the checkout ceiling.</strong> With this package on sale, everything
                billed annually with VAT comes to {money(worstCaseCheckout, "SAR")} — and the
                payment provider refuses a single checkout above {money(CHECKOUT_CEILING, "SAR")}.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Discard
            </Button>
            <Button
              disabled={
                busy ||
                !PACKAGE_CODE_RE.test(newCode.trim().toUpperCase()) ||
                !nameEn.trim() ||
                !moduleCodes.trim()
              }
              onClick={create}
            >
              {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformPackages;
