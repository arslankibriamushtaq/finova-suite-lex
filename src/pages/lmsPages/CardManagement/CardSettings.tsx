import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, SlidersHorizontal, Coins, ChevronDown, Wallet } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import {
  getAdminTierLimits,
  updateAdminTierLimit,
  getAdminCardFees,
  updateAdminCardFee,
  getAdminTierSpendLimits,
  updateAdminTierSpendLimits,
} from "../../../redux/apis/apisCardManagement";
import { CARD_TYPE_LABELS, prettyEnum, formatMoney } from "./cardConstants";

const unwrap = (res: any): any[] => {
  const body = res?.data;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data?.content)) return body.data.content;
  return [];
};

// ---- Tier limits section --------------------------------------------------
const TierLimitsTab = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [dailyLimit, setDailyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    getAdminTierLimits()
      .then((res) => setRows(unwrap(res)))
      .catch((e: any) => {
        if (!e?.response?.data?.message) toast.error("Failed to load tier limits");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (row: any) => {
    setEditRow(row);
    setDailyLimit(row.dailyLimit ?? "");
    setMonthlyLimit(row.monthlyLimit ?? "");
  };

  const save = async () => {
    if (!editRow) return;
    if (dailyLimit === "" || monthlyLimit === "") return toast.error("Both limits are required");
    if (Number(dailyLimit) < 0 || Number(monthlyLimit) < 0)
      return toast.error("Limits must be ≥ 0");
    try {
      setIsSaving(true);
      await updateAdminTierLimit({
        tier: editRow.tier,
        dailyLimit: Number(dailyLimit),
        monthlyLimit: Number(monthlyLimit),
      });
      toast.success("Tier limit updated");
      setEditRow(null);
      load();
    } catch (e: any) {
      if (!e?.response?.data?.message) toast.error("Failed to update tier limit");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pro-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ background: "var(--theme-table-background-color)" }}>
            <th className="px-4 py-3 font-semibold text-white">Tier</th>
            <th className="px-4 py-3 font-semibold text-white">Daily Limit</th>
            <th className="px-4 py-3 font-semibold text-white">Monthly Limit</th>
            <th className="px-4 py-3 font-semibold text-white text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                No tier limits configured
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.tier} className="border-t" style={{ borderColor: "var(--surface-border)" }}>
                <td className="px-4 py-3 font-medium">{prettyEnum(row.tier)}</td>
                <td className="px-4 py-3">{formatMoney(row.dailyLimit)}</td>
                <td className="px-4 py-3">{formatMoney(row.monthlyLimit)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-block text-left" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Select
                          <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            openEdit(row);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className="pro-dialog sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Edit {editRow ? prettyEnum(editRow.tier) : ""} Limits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Daily Limit</Label>
              <Input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Limit</Label>
              <Input
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ---- Fees section ---------------------------------------------------------
const FeesTab = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [issuanceFee, setIssuanceFee] = useState("");
  const [shipmentFee, setShipmentFee] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    getAdminCardFees()
      .then((res) => setRows(unwrap(res)))
      .catch((e: any) => {
        if (!e?.response?.data?.message) toast.error("Failed to load fees");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (row: any) => {
    setEditRow(row);
    setIssuanceFee(row.issuanceFee ?? "");
    setShipmentFee(row.shipmentFee ?? "");
    setCurrency(row.currency || "CAD");
  };

  const save = async () => {
    if (!editRow) return;
    if (issuanceFee === "" || shipmentFee === "") return toast.error("Both fees are required");
    if (Number(issuanceFee) < 0 || Number(shipmentFee) < 0) return toast.error("Fees must be ≥ 0");
    try {
      setIsSaving(true);
      await updateAdminCardFee({
        cardType: editRow.cardType,
        tier: editRow.tier,
        issuanceFee: Number(issuanceFee),
        shipmentFee: Number(shipmentFee),
        currency: currency.trim() || "CAD",
      });
      toast.success("Fee updated");
      setEditRow(null);
      load();
    } catch (e: any) {
      if (!e?.response?.data?.message) toast.error("Failed to update fee");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pro-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ background: "var(--theme-table-background-color)" }}>
            <th className="px-4 py-3 font-semibold text-white">Card Type</th>
            <th className="px-4 py-3 font-semibold text-white">Tier</th>
            <th className="px-4 py-3 font-semibold text-white">Issuance Fee</th>
            <th className="px-4 py-3 font-semibold text-white">Shipment Fee</th>
            <th className="px-4 py-3 font-semibold text-white">Total</th>
            <th className="px-4 py-3 font-semibold text-white text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No fees configured
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={`${row.cardType}-${row.tier}`}
                className="border-t"
                style={{ borderColor: "var(--surface-border)" }}
              >
                <td className="px-4 py-3 font-medium">
                  {CARD_TYPE_LABELS[row.cardType] || prettyEnum(row.cardType)}
                </td>
                <td className="px-4 py-3">{prettyEnum(row.tier)}</td>
                <td className="px-4 py-3">{formatMoney(row.issuanceFee, row.currency)}</td>
                <td className="px-4 py-3">{formatMoney(row.shipmentFee, row.currency)}</td>
                <td className="px-4 py-3 font-medium">
                  {formatMoney(row.totalFee ?? Number(row.issuanceFee) + Number(row.shipmentFee), row.currency)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-block text-left" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Select
                          <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            openEdit(row);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className="pro-dialog sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              Edit Fee —{" "}
              {editRow
                ? `${CARD_TYPE_LABELS[editRow.cardType] || prettyEnum(editRow.cardType)} · ${prettyEnum(
                    editRow.tier
                  )}`
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issuance Fee</Label>
                <Input
                  type="number"
                  value={issuanceFee}
                  onChange={(e) => setIssuanceFee(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Shipment Fee</Label>
                <Input
                  type="number"
                  value={shipmentFee}
                  onChange={(e) => setShipmentFee(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ---- Tier spend limits section (min/max spend per tier + category) --------
const unwrapCells = (res: any): any[] => {
  const body = res?.data;
  const d = body?.data ?? body;
  if (Array.isArray(d?.cells)) return d.cells;
  if (Array.isArray(d)) return d;
  if (Array.isArray(body?.cells)) return body.cells;
  return [];
};

const TierSpendLimitsTab = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [minLimit, setMinLimit] = useState("");
  const [maxLimit, setMaxLimit] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    getAdminTierSpendLimits()
      .then((res) => setRows(unwrapCells(res)))
      .catch((e: any) => {
        if (!e?.response?.data?.message) toast.error("Failed to load card limits");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (row: any) => {
    setEditRow(row);
    setMinLimit(row.minLimit ?? "");
    setMaxLimit(row.maxLimit ?? "");
  };

  const save = async () => {
    if (!editRow) return;
    if (minLimit === "" || maxLimit === "") return toast.error("Both limits are required");
    if (Number(minLimit) < 0 || Number(maxLimit) < 0) return toast.error("Limits must be ≥ 0");
    if (Number(maxLimit) < Number(minLimit))
      return toast.error("Max limit must be ≥ min limit");
    try {
      setIsSaving(true);
      await updateAdminTierSpendLimits({
        cells: [
          {
            tier: editRow.tier,
            category: editRow.category,
            minLimit: Number(minLimit),
            maxLimit: Number(maxLimit),
          },
        ],
      });
      toast.success("Card limit updated");
      setEditRow(null);
      load();
    } catch (e: any) {
      if (!e?.response?.data?.message) toast.error("Failed to update card limit");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pro-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ background: "var(--theme-table-background-color)" }}>
            <th className="px-4 py-3 font-semibold text-white">Tier</th>
            <th className="px-4 py-3 font-semibold text-white">Category</th>
            <th className="px-4 py-3 font-semibold text-white">Min Limit</th>
            <th className="px-4 py-3 font-semibold text-white">Max Limit</th>
            <th className="px-4 py-3 font-semibold text-white text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No card limits configured
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={`${row.tier}-${row.category}`}
                className="border-t"
                style={{ borderColor: "var(--surface-border)" }}
              >
                <td className="px-4 py-3 font-medium">{prettyEnum(row.tier)}</td>
                <td className="px-4 py-3">{prettyEnum(row.category)}</td>
                <td className="px-4 py-3">{formatMoney(row.minLimit)}</td>
                <td className="px-4 py-3">{formatMoney(row.maxLimit)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-block text-left" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Select
                          <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            openEdit(row);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className="pro-dialog sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              Edit Limit —{" "}
              {editRow ? `${prettyEnum(editRow.tier)} · ${prettyEnum(editRow.category)}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Limit</Label>
              <Input type="number" value={minLimit} onChange={(e) => setMinLimit(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Max Limit</Label>
              <Input type="number" value={maxLimit} onChange={(e) => setMaxLimit(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CardSettings = () => {
  return (
    <div className="service card-settings-page">
      <style>{`
        /* Underline tabs — match the project's tab style (not shadcn pills) */
        .card-settings-page [data-slot="tabs-list"] {
          background: transparent !important;
          padding: 0 !important;
          height: auto !important;
          gap: 0 !important;
          border-radius: 0 !important;
          justify-content: flex-start !important;
          border-bottom: 1px solid var(--surface-border);
          width: 100%;
        }
        .card-settings-page [data-slot="tabs-trigger"] {
          flex: 0 0 auto !important;
          width: auto !important;
          background: transparent !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          color: var(--muted-foreground) !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          padding: 7px 12px !important;
          position: relative;
        }
        .card-settings-page [data-slot="tabs-trigger"]:hover { color: var(--foreground) !important; }
        .card-settings-page [data-slot="tabs-trigger"][data-state="active"] {
          color: #10b981 !important;
          font-weight: 600 !important;
        }
        .card-settings-page [data-slot="tabs-trigger"][data-state="active"]::after {
          content: "";
          position: absolute;
          left: 12px; right: 12px; bottom: -1px;
          height: 2px;
          border-radius: 2px;
          background: #10b981;
        }
        /* Tables — match the shared TableView (branded header, striped, hover, 12px) */
        .card-settings-page table thead tr {
          background: var(--theme-table-background-color) !important;
        }
        .card-settings-page table thead th {
          color: #ffffff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 10px 14px !important;
          letter-spacing: 0.2px;
        }
        .card-settings-page table tbody td {
          font-size: 12px !important;
          padding: 10px 14px !important;
          border-bottom: 1px solid var(--surface-border) !important;
          color: var(--foreground);
        }
        .card-settings-page table tbody tr:nth-child(even) {
          background: var(--theme-table-row-alt);
        }
        .card-settings-page table tbody tr:hover {
          background: var(--theme-table-row-hover);
        }
        /* Right-align the Action column (header + cells) so the Select button
           lines up under the "Action" heading, with breathing room from the edge. */
        .card-settings-page table th:last-child,
        .card-settings-page table td:last-child {
          text-align: right !important;
          padding-right: 24px !important;
        }
        /* Compact, professional row action (Edit) button — the global .pro-card
           rule sizes buttons to 34px, too tall for an inline table action. */
        .card-settings-page table [data-slot="button"] {
          height: 28px !important;
          min-height: 28px !important;
          padding: 0 12px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          gap: 6px !important;
          border-radius: 6px !important;
          border: 1px solid color-mix(in srgb, #10b981 35%, transparent) !important;
          background: color-mix(in srgb, #10b981 8%, transparent) !important;
          color: #059669 !important;
          box-shadow: none !important;
          transition: background 0.15s ease, border-color 0.15s ease !important;
        }
        .card-settings-page table [data-slot="button"]:hover {
          background: color-mix(in srgb, #10b981 16%, transparent) !important;
          border-color: #10b981 !important;
          color: #047857 !important;
        }
        .card-settings-page table [data-slot="button"] svg {
          width: 13px !important;
          height: 13px !important;
        }
      `}</style>
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          Card Settings
        </h3>
      </div>

      <Tabs defaultValue="tier-limits" className="w-full">
        <TabsList className="mb-3">
          <TabsTrigger value="tier-limits" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Tier Limits
          </TabsTrigger>
          <TabsTrigger value="fees" className="gap-2">
            <Coins className="h-4 w-4" />
            Order Fees
          </TabsTrigger>
          <TabsTrigger value="spend-limits" className="gap-2">
            <Wallet className="h-4 w-4" />
            Card Limits
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tier-limits">
          <p className="text-sm text-muted-foreground mb-3">
            Default daily / monthly limits per tier. New cards inherit their tier's limit at
            issuance unless an explicit limit is provided.
          </p>
          <TierLimitsTab />
        </TabsContent>
        <TabsContent value="fees">
          <p className="text-sm text-muted-foreground mb-3">
            One-time issuance fee + shipment fee (physical only) per card type and tier. These quote
            and configure fees only.
          </p>
          <FeesTab />
        </TabsContent>
        <TabsContent value="spend-limits">
          <p className="text-sm text-muted-foreground mb-3">
            Min / max spend limits per tier and spend category (e.g. POS, ATM). These bound the
            limits that can be set on cards of each tier.
          </p>
          <TierSpendLimitsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CardSettings;
