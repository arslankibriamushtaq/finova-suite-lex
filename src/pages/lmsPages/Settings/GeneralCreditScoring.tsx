import { useEffect, useRef, useState } from "react";
import { Plus, Settings, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../../../components/ui/button";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

import {
  getGeneralCreditScoringCriteria,
  saveGeneralCreditScoringCriteria,
  getCreditScoringFieldDefinitions,
} from "../../../redux/apis/apisRiskManagement";
import AccountsLimitSetting from "./AccountsLimitSetting";

const OPERATORS = [
  { value: "EQ", label: "Equal (=)" },
  { value: "GT", label: "Greater Than (>)" },
  { value: "GTE", label: "Greater or Equal (>=)" },
  { value: "LT", label: "Less Than (<)" },
  { value: "LTE", label: "Less or Equal (<=)" },
  { value: "BETWEEN", label: "Between" },
  { value: "IN", label: "In" },
];

interface Rule {
  id?: string;
  operator: string;
  value: string;
  weight: number;
  percentage: number;
}

interface Criteria {
  id?: string;
  fieldDefinitionId?: string | null;
  customName: string;
  custom?: boolean;
  enabled: boolean;
  sortOrder: number;
  rules: Rule[];
  /** purely a UI-side key for newly added rows that lack a server id */
  _tempId?: string;
}

const tempId = () => `tmp_${Math.random().toString(36).slice(2, 10)}`;

const newRule = (): Rule => ({
  operator: "EQ",
  value: "",
  weight: 0,
  percentage: 0,
});

const newCriteria = (sortOrder: number): Criteria => ({
  customName: "",
  fieldDefinitionId: null,
  custom: true,
  enabled: true,
  sortOrder,
  rules: [newRule()],
  _tempId: tempId(),
});

const GeneralCreditScoring = () => {
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [fieldDefinitions, setFieldDefinitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pendingScrollIndex = useRef<number | null>(null);

  useEffect(() => {
    if (pendingScrollIndex.current === null) return;
    const idx = pendingScrollIndex.current;
    const el = cardRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    pendingScrollIndex.current = null;
  }, [criteria.length]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [critRes, defRes] = await Promise.all([
        getGeneralCreditScoringCriteria(),
        getCreditScoringFieldDefinitions(0, 200),
      ]);
      const rows = critRes?.data?.data || critRes?.data || [];
      setCriteria(Array.isArray(rows) ? rows.map((r: any) => ({ ...r })) : []);

      const defs = defRes?.data?.data || defRes?.data || [];
      let allDefs: any[] = Array.isArray(defs) ? defs : [];
      const totalPages = defRes?.data?.pagination?.totalPages;
      if (typeof totalPages === "number" && totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            getCreditScoringFieldDefinitions(i + 1, 200)
          )
        );
        rest.forEach((res) => {
          const r = res?.data?.data || res?.data || [];
          if (Array.isArray(r)) allDefs = allDefs.concat(r);
        });
      }
      setFieldDefinitions(allDefs);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load general credit scoring criteria");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCriteria = (index: number, patch: Partial<Criteria>) => {
    setCriteria((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const addCriteria = () => {
    setCriteria((prev) => {
      const next = [...prev, newCriteria(prev.length + 1)];
      // Let the next effect (triggered by criteria.length changing) scroll
      // the newly-appended card into view once it's rendered.
      pendingScrollIndex.current = next.length - 1;
      return next;
    });
  };

  const removeCriteria = (index: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRule = (cIdx: number, rIdx: number, patch: Partial<Rule>) => {
    setCriteria((prev) =>
      prev.map((c, i) =>
        i !== cIdx
          ? c
          : { ...c, rules: c.rules.map((r, j) => (j === rIdx ? { ...r, ...patch } : r)) }
      )
    );
  };

  const addRule = (cIdx: number) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i !== cIdx ? c : { ...c, rules: [...c.rules, newRule()] }))
    );
  };

  const removeRule = (cIdx: number, rIdx: number) => {
    setCriteria((prev) =>
      prev.map((c, i) =>
        i !== cIdx ? c : { ...c, rules: c.rules.filter((_, j) => j !== rIdx) }
      )
    );
  };

  const handleFieldDefinitionChange = (cIdx: number, definitionId: string) => {
    const def = fieldDefinitions.find((d) => String(d.id) === definitionId);
    if (!def) return;
    updateCriteria(cIdx, {
      fieldDefinitionId: def.id,
      customName: def.nameEn || def.nameAr || def.fieldKey || "",
    });
  };

  const handleSave = async () => {
    if (criteria.length === 0) {
      return toast.error("Add at least one criteria before saving");
    }
    for (const c of criteria) {
      if (!c.customName.trim()) {
        return toast.error("Every criteria must have a name");
      }
      if (!c.rules || c.rules.length === 0) {
        return toast.error(`Criteria "${c.customName}" has no rules`);
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        criteria: criteria.map((c, i) => ({
          id: c.id,
          fieldDefinitionId: c.fieldDefinitionId,
          customName: c.customName,
          custom: c.custom ?? false,
          enabled: c.enabled,
          sortOrder: i + 1,
          rules: c.rules.map((r) => ({
            id: r.id,
            operator: r.operator,
            value: r.value,
            weight: Number(r.weight) || 0,
            percentage: Number(r.percentage) || 0,
          })),
        })),
      };
      await saveGeneralCreditScoringCriteria(payload);
      toast.success("General credit scoring saved");
      loadAll();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="service">
      <style>{`
        .gcs-tabs-list {
          background: transparent !important;
          padding: 0;
          border-radius: 0;
          height: auto;
          gap: 0;
          justify-content: flex-start;
          width: fit-content;
          align-self: flex-start;
          margin-top: 14px;
          margin-bottom: 16px;
        }
        .gcs-tabs-trigger {
          flex: 0 0 auto !important;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          color: var(--muted-foreground) !important;
          padding: 10px 16px !important;
          font-weight: 500;
          font-size: 14px;
          box-shadow: none !important;
          outline: none !important;
          position: relative;
          transition: color 0.15s ease;
        }
        .gcs-tabs-trigger:hover,
        .gcs-tabs-trigger:active,
        .gcs-tabs-trigger:focus,
        .gcs-tabs-trigger:focus-visible,
        .gcs-tabs-trigger[data-state="active"] {
          outline: 0 !important;
          box-shadow: none !important;
          border: 0 !important;
          --tw-ring-shadow: 0 0 #0000 !important;
          --tw-ring-offset-shadow: 0 0 #0000 !important;
        }
        .gcs-tabs-trigger:hover {
          color: var(--foreground) !important;
        }
        .gcs-tabs-trigger[data-state="active"] {
          background: transparent !important;
          color: var(--foreground) !important;
          box-shadow: none !important;
          font-weight: 600;
        }
        .gcs-tabs-trigger[data-state="active"]::after {
          content: "";
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: -1px;
          height: 2px;
          background-color: var(--foreground);
        }
        html.dark .gcs-tabs-trigger[data-state="active"] {
          color: #ffffff !important;
        }
        html.dark .gcs-tabs-trigger[data-state="active"]::after {
          background-color: #ffffff;
        }
      `}</style>

      <Tabs defaultValue="general-credit-scoring" className="w-full">
        <TabsList className="gcs-tabs-list">
          <TabsTrigger value="general-credit-scoring" className="gcs-tabs-trigger">
            General Credit Scoring
          </TabsTrigger>
          <TabsTrigger value="accounts-limit-setting" className="gcs-tabs-trigger">
            Accounts Limit Setting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general-credit-scoring">
          <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3">
            <h3 className="m-0 flex items-center gap-2.5 text-lg font-semibold text-foreground">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                <Settings className="size-4" />
              </span>
              General Credit Scoring
            </h3>
            <Button variant="outline" onClick={addCriteria} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Criteria
            </Button>
          </div>

          {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : criteria.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
            <Settings className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">No criteria configured yet.</p>
          <Button onClick={addCriteria} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Criteria
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {criteria.map((c, cIdx) => (
            <div
              key={c.id || c._tempId || cIdx}
              ref={(el) => {
                cardRefs.current[cIdx] = el;
              }}
              style={{ scrollMarginTop: 96 }}
            >
            <Card className="pro-card-glow">
              <CardHeader className="relative pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-semibold text-emerald-600 ring-1 ring-emerald-500/15">
                      {cIdx + 1}
                    </span>
                    <CardTitle className="text-base">Criteria #{cIdx + 1}</CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.enabled}
                        onCheckedChange={(checked) => updateCriteria(cIdx, { enabled: checked })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {c.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriteria(cIdx)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credit Scoring Field</Label>
                    <Select
                      value={c.fieldDefinitionId ? String(c.fieldDefinitionId) : ""}
                      onValueChange={(value) => handleFieldDefinitionChange(cIdx, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a field definition" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldDefinitions.map((def) => (
                          <SelectItem key={def.id} value={String(def.id)}>
                            {def.nameEn || def.nameAr || def.fieldKey}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      placeholder="Display name shown in scoring reports"
                      value={c.customName}
                      onChange={(e) => updateCriteria(cIdx, { customName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Rules</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Define operator, value, weight, and percentage for each rule.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addRule(cIdx)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </Button>
                </div>

                {c.rules.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-muted/30 py-4 text-center text-sm text-muted-foreground">
                    No rules added. Click "Add Rule" to create scoring rules.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {c.rules.map((rule, rIdx) => (
                      <div
                        key={rule.id || rIdx}
                        className="grid grid-cols-1 gap-2 rounded-lg border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 md:grid-cols-5"
                      >
                        <div className="space-y-1">
                          <Label className="text-xs">Operator</Label>
                          <Select
                            value={rule.operator}
                            onValueChange={(value) =>
                              updateRule(cIdx, rIdx, { operator: value })
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATORS.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Value</Label>
                          <Input
                            placeholder={
                              rule.operator === "BETWEEN" ? "e.g. 3000,7999" : "e.g. SAUDI"
                            }
                            value={rule.value}
                            onChange={(e) =>
                              updateRule(cIdx, rIdx, { value: e.target.value })
                            }
                            className="h-9"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Weight</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={rule.weight}
                            onChange={(e) =>
                              updateRule(cIdx, rIdx, { weight: Number(e.target.value) })
                            }
                            placeholder="3.0"
                            className="h-9"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Percentage (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={rule.percentage ?? ""}
                            onChange={(e) =>
                              updateRule(cIdx, rIdx, {
                                percentage: Number(e.target.value),
                              })
                            }
                            placeholder="20.0"
                            className="h-9"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(cIdx, rIdx)}
                            className="text-destructive hover:text-destructive h-9"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          ))}

          {/* Bottom save row — keep Save anchored at the end so users
              don't need to scroll back up after editing the last criteria */}
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
          )}
        </TabsContent>

        <TabsContent value="accounts-limit-setting">
          <AccountsLimitSetting />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralCreditScoring;
