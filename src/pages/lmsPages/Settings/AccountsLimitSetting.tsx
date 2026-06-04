import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";

import {
  getWalletLimitBounds,
  updateWalletLimitBounds,
  WalletLimitBounds,
} from "../../../redux/apis/apisWalletAdmin";

type FormState = Record<keyof WalletLimitBounds, string>;

const FIELD_KEYS: (keyof WalletLimitBounds)[] = [
  "minDailyLimit",
  "maxDailyLimit",
  "defaultDailyLimit",
  "minMonthlyLimit",
  "maxMonthlyLimit",
  "defaultMonthlyLimit",
  "minYearlyLimit",
  "maxYearlyLimit",
  "defaultYearlyLimit",
];

const PERIODS: {
  label: string;
  min: keyof WalletLimitBounds;
  max: keyof WalletLimitBounds;
  def: keyof WalletLimitBounds;
}[] = [
  { label: "Daily", min: "minDailyLimit", max: "maxDailyLimit", def: "defaultDailyLimit" },
  { label: "Monthly", min: "minMonthlyLimit", max: "maxMonthlyLimit", def: "defaultMonthlyLimit" },
  { label: "Yearly", min: "minYearlyLimit", max: "maxYearlyLimit", def: "defaultYearlyLimit" },
];

const emptyForm = (): FormState =>
  FIELD_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {} as FormState);

const AccountsLimitSetting = () => {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getWalletLimitBounds();
      const data = res?.data?.data || res?.data || {};
      const next = emptyForm();
      FIELD_KEYS.forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          next[key] = String(data[key]);
        }
      });
      setForm(next);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load account limit settings");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (key: keyof WalletLimitBounds, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const payload = {} as WalletLimitBounds;
    for (const key of FIELD_KEYS) {
      const raw = form[key];
      if (raw === "" || raw === null || raw === undefined) {
        return toast.error("All limit fields are required");
      }
      const num = Number(raw);
      if (Number.isNaN(num) || num < 0) {
        return toast.error("Limits must be valid non-negative numbers");
      }
      payload[key] = num;
    }

    for (const p of PERIODS) {
      const min = payload[p.min];
      const max = payload[p.max];
      const def = payload[p.def];
      if (min > max) {
        return toast.error(`${p.label}: minimum cannot be greater than maximum`);
      }
      if (def < min || def > max) {
        return toast.error(`${p.label}: default must be between minimum and maximum`);
      }
    }

    setIsSaving(true);
    try {
      await updateWalletLimitBounds(payload);
      toast.success("Account limit settings saved");
      load();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          Accounts Limit Setting
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {PERIODS.map((p) => (
            <Card key={p.label} className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{p.label} Limit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={form[p.min]}
                      onChange={(e) => updateField(p.min, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={form[p.max]}
                      onChange={(e) => updateField(p.max, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={form[p.def]}
                      onChange={(e) => updateField(p.def, e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsLimitSetting;
