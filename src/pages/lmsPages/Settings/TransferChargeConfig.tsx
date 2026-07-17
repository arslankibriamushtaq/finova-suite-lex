import { useEffect, useState } from "react";
import { Save, Coins, Calculator } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../../../components/ui/button";
import { usePermissions, WALLET_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Switch } from "../../../components/ui/switch";
import { Skeleton } from "../../../components/ui/skeleton";

import {
  listChargeConfigs,
  updateChargeConfig,
  previewExternalTransferCharge,
  ChargeConfig,
  ChargeMode,
  UpdateChargeConfigRequest,
  ChargePreviewResponse,
} from "../../../redux/apis/apisWalletAdmin";

const CHARGE_MODES: { value: ChargeMode; label: string }[] = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FIXED", label: "Fixed" },
];

/* Editable mirror of ChargeConfig — numeric fields are held as strings so the
   inputs can be cleared while typing. */
interface RailForm {
  rail: string;
  chargeMode: ChargeMode;
  percentValue: string;
  fixedAmount: string;
  fixedCurrency: string;
  minCharge: string;
  shaSenderShare: string;
  active: boolean;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

const toForm = (c: ChargeConfig): RailForm => ({
  rail: c.rail,
  chargeMode: c.chargeMode,
  percentValue: c.percentValue != null ? String(c.percentValue) : "",
  fixedAmount: c.fixedAmount != null ? String(c.fixedAmount) : "",
  fixedCurrency: c.fixedCurrency || "",
  minCharge: c.minCharge != null ? String(c.minCharge) : "",
  shaSenderShare: c.shaSenderShare != null ? String(c.shaSenderShare) : "",
  active: c.active ?? true,
  updatedAt: c.updatedAt,
  updatedBy: c.updatedBy,
});

const isBlank = (v: string) => v === "" || v === null || v === undefined;

const TransferChargeConfig = () => {
  const { hasPermission } = usePermissions();
  const canEditWallet = hasPermission(WALLET_PERMISSIONS.EDIT);
  const [rails, setRails] = useState<RailForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingRail, setSavingRail] = useState<string | null>(null);

  // Charge calculator (POST external/charges)
  const [calcType, setCalcType] = useState<string>("");
  const [calcAmount, setCalcAmount] = useState<string>("");
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcResult, setCalcResult] = useState<ChargePreviewResponse | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await listChargeConfigs();
      const rows: ChargeConfig[] = res?.data?.data || res?.data || [];
      const forms = Array.isArray(rows) ? rows.map(toForm) : [];
      setRails(forms);
      if (forms.length && !calcType) setCalcType(forms[0].rail);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load transfer charge configs");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRail = (rail: string, patch: Partial<RailForm>) => {
    setRails((prev) => prev.map((r) => (r.rail === rail ? { ...r, ...patch } : r)));
  };

  const handleSave = async (form: RailForm) => {
    // Validate + build the mode-relevant payload only.
    const share = Number(form.shaSenderShare);
    if (!isBlank(form.shaSenderShare) && (Number.isNaN(share) || share < 0 || share > 1)) {
      return toast.error(`${form.rail}: SHA sender share must be between 0 and 1`);
    }

    const payload: UpdateChargeConfigRequest = {
      chargeMode: form.chargeMode,
      active: form.active,
    };
    if (!isBlank(form.shaSenderShare)) payload.shaSenderShare = share;

    if (form.chargeMode === "PERCENTAGE") {
      const pct = Number(form.percentValue);
      if (isBlank(form.percentValue) || Number.isNaN(pct) || pct < 0) {
        return toast.error(`${form.rail}: percent value must be a valid non-negative number`);
      }
      const min = Number(form.minCharge);
      if (isBlank(form.minCharge) || Number.isNaN(min) || min < 0) {
        return toast.error(`${form.rail}: minimum charge must be a valid non-negative number`);
      }
      payload.percentValue = pct;
      payload.minCharge = min;
    } else {
      const fixed = Number(form.fixedAmount);
      if (isBlank(form.fixedAmount) || Number.isNaN(fixed) || fixed < 0) {
        return toast.error(`${form.rail}: fixed amount must be a valid non-negative number`);
      }
      if (isBlank(form.fixedCurrency)) {
        return toast.error(`${form.rail}: fixed currency is required`);
      }
      payload.fixedAmount = fixed;
      payload.fixedCurrency = form.fixedCurrency.trim().toUpperCase();
    }

    setSavingRail(form.rail);
    try {
      const res = await updateChargeConfig(form.rail, payload);
      const updated: ChargeConfig = res?.data?.data || res?.data;
      if (updated) updateRail(form.rail, toForm(updated));
      toast.success(`${form.rail} charge config saved`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || `Failed to save ${form.rail}`);
    } finally {
      setSavingRail(null);
    }
  };

  const handleCalculate = async () => {
    if (!calcType) return toast.error("Select a transfer type");
    const amount = Number(calcAmount);
    if (isBlank(calcAmount) || Number.isNaN(amount) || amount <= 0) {
      return toast.error("Enter a valid amount greater than 0");
    }
    setCalcLoading(true);
    setCalcResult(null);
    try {
      const res = await previewExternalTransferCharge({ type: calcType, amount });
      setCalcResult(res?.data?.data || res?.data || null);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to calculate charge");
    } finally {
      setCalcLoading(false);
    }
  };

  const fmt = (v: number | null | undefined) =>
    v === null || v === undefined ? "—" : Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3">
        <h3 className="m-0 flex items-center gap-2.5 text-lg font-semibold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
            <Coins className="size-4" />
          </span>
          Transfer Charges
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* ---- Charge calculator ---- */}
          <Card className="pro-card-glow">
            <CardHeader className="relative pb-3">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                  <Calculator className="size-4" />
                </span>
                Charge Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Transfer Type</Label>
                  <Select value={calcType} onValueChange={setCalcType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rail" />
                    </SelectTrigger>
                    <SelectContent>
                      {rails.map((r) => (
                        <SelectItem key={r.rail} value={r.rail}>
                          {r.rail}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1000"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCalculate} disabled={calcLoading} className="gap-2">
                    <Calculator className="h-4 w-4" />
                    {calcLoading ? "Calculating..." : "Calculate"}
                  </Button>
                </div>
              </div>

              {calcResult && (
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border bg-muted/20 p-4 text-sm md:grid-cols-4">
                  <ResultItem label="Charge Mode" value={calcResult.chargeMode} />
                  <ResultItem
                    label="Charge Amount"
                    value={`${fmt(calcResult.chargeAmount)} ${calcResult.currency}`}
                  />
                  <ResultItem
                    label="Sender Charge"
                    value={`${fmt(calcResult.senderCharge)} ${calcResult.currency}`}
                  />
                  <ResultItem
                    label="Receiver Charge"
                    value={
                      calcResult.receiverCharge == null
                        ? "—"
                        : `${fmt(calcResult.receiverCharge)} ${calcResult.currency}`
                    }
                  />
                  <ResultItem
                    label="Amount"
                    value={`${fmt(calcResult.amount)} ${calcResult.currency}`}
                  />
                  <ResultItem
                    label="Total Amount"
                    value={`${fmt(calcResult.totalAmount)} ${calcResult.currency}`}
                    highlight
                  />
                  <ResultItem
                    label="Beneficiary Receives"
                    value={
                      calcResult.beneficiaryReceives == null
                        ? "—"
                        : `${fmt(calcResult.beneficiaryReceives)} ${calcResult.destCurrency || calcResult.currency}`
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* ---- Per-rail charge config ---- */}
          {rails.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                <Coins className="size-5" />
              </span>
              <p className="text-sm text-muted-foreground">No charge configs found.</p>
            </div>
          ) : (
            rails.map((form) => (
              <Card key={form.rail} className="pro-card-glow">
                <CardHeader className="relative pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2.5 text-base">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-semibold text-emerald-600 ring-1 ring-emerald-500/15">
                        {form.rail.slice(0, 2)}
                      </span>
                      {form.rail}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={form.active}
                        onCheckedChange={(checked) => updateRail(form.rail, { active: checked })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {form.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Charge Mode</Label>
                      <Select
                        value={form.chargeMode}
                        onValueChange={(value) =>
                          updateRail(form.rail, { chargeMode: value as ChargeMode })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHARGE_MODES.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {form.chargeMode === "PERCENTAGE" ? (
                      <>
                        <div className="space-y-2">
                          <Label>Percent Value</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.0001"
                            placeholder="e.g. 2"
                            value={form.percentValue}
                            onChange={(e) => updateRail(form.rail, { percentValue: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Minimum Charge</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.01"
                            value={form.minCharge}
                            onChange={(e) => updateRail(form.rail, { minCharge: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Fixed Amount</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="e.g. 2"
                            value={form.fixedAmount}
                            onChange={(e) => updateRail(form.rail, { fixedAmount: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fixed Currency</Label>
                          <Input
                            placeholder="CAD"
                            value={form.fixedCurrency}
                            onChange={(e) => updateRail(form.rail, { fixedCurrency: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>SHA Sender Share (0 – 1)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        placeholder="0.5"
                        value={form.shaSenderShare}
                        onChange={(e) => updateRail(form.rail, { shaSenderShare: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                      {form.updatedAt
                        ? `Last updated ${new Date(form.updatedAt).toLocaleString()}`
                        : "Not updated yet"}
                    </p>
                    {canEditWallet && (
                    <Button
                      onClick={() => handleSave(form)}
                      disabled={savingRail === form.rail}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {savingRail === form.rail ? "Saving..." : "Save"}
                    </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const ResultItem = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={highlight ? "font-semibold text-emerald-600" : "font-medium text-foreground"}>
      {value}
    </span>
  </div>
);

export default TransferChargeConfig;
