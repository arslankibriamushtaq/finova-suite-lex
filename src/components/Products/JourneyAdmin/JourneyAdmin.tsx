import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Info, RefreshCw, RotateCcw, Route, Save } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../../ui/button";
import { Tabs, TabsContent } from "../../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  DetailTabsList,
  DetailTabsTrigger,
  EmptyState,
  TabSkeleton,
} from "../../shared/detailKit";
import { LexNotice, LexPageHeader } from "../../shared/lexKit";
import { getAllProducts } from "../../../redux/apis/apisCrudProductManagement";
import {
  getCountryFieldTypes,
  getCountryStepTypes,
  getCountrySteps,
  getLoanDrivers,
  getLoanFieldTypes,
  getLoanStepTypes,
  getLoanSteps,
  asStepRow,
  journeyErrorMessage,
  putCountrySteps,
  putLoanSteps,
  refreshCountryStepCache,
  type FieldType,
  type JourneyStepRow,
  stepKey,
  type StepType,
} from "../../../redux/apis/apisJourneyAdmin";
import JourneySteps from "./JourneySteps";

/** The three countries the onboarding config is seeded for. Codes are ISO-3. */
const COUNTRIES = ["SAU", "ARE", "PAK"];

type Surface = "loan" | "onboarding";

export default function JourneyAdmin() {
  const { t } = useTranslation("journeyAdmin");
  const [surface, setSurface] = useState<Surface>("loan");

  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [countryCode, setCountryCode] = useState(COUNTRIES[0]);

  const [stepTypes, setStepTypes] = useState<StepType[]>([]);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [rows, setRows] = useState<JourneyStepRow[]>([]);
  const [baseline, setBaseline] = useState<JourneyStepRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(rows) !== JSON.stringify(baseline),
    [rows, baseline]
  );

  /* ---------------------------------------------------------------- */
  /* Catalogues                                                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [types, fields] = await Promise.all([
          surface === "loan" ? getLoanStepTypes() : getCountryStepTypes(),
          surface === "loan" ? getLoanFieldTypes() : getCountryFieldTypes(),
        ]);
        if (cancelled) return;
        setStepTypes(Array.isArray(types) ? types : []);
        setFieldTypes(Array.isArray(fields) ? fields : []);
        // Drivers only shape the loan screen; a failure there is not worth a
        // toast, the driver chip simply falls back to the step's own value.
        if (surface === "loan") await getLoanDrivers().catch(() => []);
      } catch (err: any) {
        if (!cancelled) toast.error(journeyErrorMessage(err, t("ja.err.catalogues")));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [surface, t]);

  /* ---------------------------------------------------------------- */
  /* Product list, for the loan surface                                */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (surface !== "loan" || products.length) return;
    (async () => {
      try {
        const response = await getAllProducts(0, 100);
        const list = response?.data?.data?.content || response?.data?.data || [];
        const rowsOut = Array.isArray(list) ? list : [];
        setProducts(rowsOut);
        if (rowsOut.length && !productId) setProductId(rowsOut[0].id);
      } catch (err: any) {
        toast.error(journeyErrorMessage(err, t("ja.err.products")));
      }
    })();
  }, [surface, products.length, productId, t]);

  /* ---------------------------------------------------------------- */
  /* Steps                                                             */
  /* ---------------------------------------------------------------- */

  const load = useCallback(async () => {
    if (surface === "loan" && !productId) return;
    try {
      setLoading(true);
      setError(null);
      const data =
        surface === "loan" ? await getLoanSteps(productId) : await getCountrySteps(countryCode);
      const list = Array.isArray(data?.steps) ? data.steps : [];
      const normalised: JourneyStepRow[] = list.map(asStepRow);
      setRows(normalised);
      setBaseline(JSON.parse(JSON.stringify(normalised)));
    } catch (err: any) {
      setError(journeyErrorMessage(err, t("ja.err.steps")));
      setRows([]);
      setBaseline([]);
    } finally {
      setLoading(false);
    }
  }, [surface, productId, countryCode, t]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------------------------------------------------------------- */
  /* Save — replace-all                                                */
  /* ---------------------------------------------------------------- */

  const save = async () => {
    try {
      setSaving(true);
      if (surface === "loan") {
        /* The whole list goes every time: this endpoint is replace-all, and a
           step left out is removed from the journey. `enabled` is written
           explicitly because null means "leave as stored", which would keep a
           re-enabled step switched off. */
        const payload = rows.map((row) => ({
          stepCode: stepKey(row),
          enabled: row.enabled !== false,
          labelEn: row.step.labelEn,
          labelAr: row.step.labelAr,
          description: row.step.description,
          timeoutMinutes: row.step.timeoutMinutes,
          maxAttempts: row.step.maxAttempts,
          visible: row.step.visible,
          blocking: row.step.blocking,
          required: row.step.required,
          config: row.step.config,
          fields: (row.step.fields || []).map((f) => ({
            ...f.field,
            enabled: f.enabled !== false,
          })),
        }));
        const data = await putLoanSteps(productId, payload as any);
        // The PUT answers with the persisted list, so it replaces local state
        // rather than triggering another GET — but it needs the same
        // normalising the initial read gets.
        const next = Array.isArray(data?.steps) ? data.steps.map(asStepRow) : rows;
        setRows(next);
        setBaseline(JSON.parse(JSON.stringify(next)));
        toast.success(t("ja.saved"));
      } else {
        const payload = rows.map((row) => ({
          stepType: stepKey(row),
          enabled: row.enabled !== false,
          fields: (row.step.fields || []).map((f) => ({
            ...f.field,
            enabled: f.enabled !== false,
          })),
        }));
        const { status } = await putCountrySteps(countryCode, payload as any);
        // An approval chain on COUNTRY_CONFIG answers 202 with a requestId:
        // the change is queued for a checker, not applied.
        if (status === 202) toast.success(t("ja.queuedForApproval"));
        else toast.success(t("ja.saved"));
        await load();
      }
    } catch (err: any) {
      toast.error(journeyErrorMessage(err, t("ja.err.save")));
    } finally {
      setSaving(false);
    }
  };

  const refreshCache = async () => {
    try {
      await refreshCountryStepCache(countryCode);
      toast.success(t("ja.cacheRefreshed"));
    } catch (err: any) {
      toast.error(journeyErrorMessage(err, t("ja.err.cache")));
    }
  };

  const enabledCount = rows.filter((r) => r.enabled !== false).length;

  return (
    <div className="service">
      <LexPageHeader icon={Route} title={t("ja.title")} subtitle={t("ja.subtitle")}>
        <Button variant="outline" size="sm" className="gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {t("common:refresh")}
        </Button>
        {dirty && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setRows(JSON.parse(JSON.stringify(baseline)))}
          >
            <RotateCcw className="h-4 w-4" />
            {t("ja.discard")}
          </Button>
        )}
        <Button size="sm" className="gap-2" onClick={save} disabled={saving || !dirty}>
          <Save className="h-4 w-4" />
          {saving ? t("ja.saving") : t("ja.save")}
        </Button>
      </LexPageHeader>

      <Tabs value={surface} onValueChange={(value) => setSurface(value as Surface)}>
        <DetailTabsList>
          <DetailTabsTrigger value="loan">{t("ja.tab.loan")}</DetailTabsTrigger>
          <DetailTabsTrigger value="onboarding">{t("ja.tab.onboarding")}</DetailTabsTrigger>
        </DetailTabsList>

        <TabsContent value="loan" className="mt-3" />
        <TabsContent value="onboarding" className="mt-3" />
      </Tabs>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {surface === "loan" ? (
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder={t("ja.selectProduct")} />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name || p.nameEn || p.productCode || p.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <span className="whitespace-nowrap text-xs text-muted-foreground sm:ms-auto">
            {t("ja.countLabel", { enabled: enabledCount, total: rows.length })}
          </span>

          {surface === "onboarding" && (
            <Button variant="outline" size="sm" className="gap-2" onClick={refreshCache}>
              <RefreshCw className="h-4 w-4" />
              {t("ja.refreshCache")}
            </Button>
          )}
        </div>
      </div>

      {/* The two things an operator has to know before touching either list. */}
      <LexNotice tone="sky" icon={Info}>
        {surface === "loan" ? t("ja.notice.loan") : t("ja.notice.onboarding")}
      </LexNotice>

      {error && (
        <LexNotice tone="red" icon={AlertTriangle}>
          {error}
        </LexNotice>
      )}

      {loading ? (
        <TabSkeleton variant="fields" count={3} />
      ) : rows.length === 0 ? (
        <div className="pro-card p-4">
          <EmptyState icon={Route} text={t("ja.empty")} />
        </div>
      ) : (
        <JourneySteps
          rows={rows}
          stepTypes={stepTypes}
          fieldTypes={fieldTypes}
          reorderIsReal={surface === "loan"}
          onChange={setRows}
        />
      )}
    </div>
  );
}
