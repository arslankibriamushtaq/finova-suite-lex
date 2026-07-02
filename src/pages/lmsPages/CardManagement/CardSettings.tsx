import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, SlidersHorizontal, Coins } from "lucide-react";
import { Button } from "../../../components/ui/button";
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
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(row)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className="sm:max-w-[440px]">
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
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(row)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className="sm:max-w-[460px]">
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

const CardSettings = () => {
  return (
    <div className="service card-settings-page">
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
      </Tabs>
    </div>
  );
};

export default CardSettings;
