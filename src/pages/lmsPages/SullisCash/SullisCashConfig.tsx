import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Coins,
  Save,
  RotateCcw,
  Plus,
  X,
  CalendarClock,
  Percent,
  AlertTriangle,
  Wallet,
  Clock,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { LEDGER_CURRENCIES } from "../../../redux/apis/apisCrudLms";
import {
  getSullisCashConfig,
  getSullisCashConfigs,
  updateSullisCashConfig,
  sullisCashErrorMessage,
  formatSullisAmount,
  formatRatePercent,
  sullisCashProfit,
  sullisCashTotalDue,
  sullisCashTotalRate,
  sullisCashPenaltyPerDay,
  type SullisCashConfig,
  type UpdateSullisCashConfigRequest,
} from "../../../redux/apis/apisSullisCash";
import { usePermissions, SULLIS_CASH_PERMISSIONS } from "../../../hooks/useProductPermissions";

/**
 * Every numeric field is held as a string while editing — a half-typed number
 * ("0.", "") is not a number, and coercing early fights the user's keystrokes.
 * Quick amounts are strings for the same reason.
 */
type FormState = {
  enabled: boolean;
  minLoanAmount: string;
  maxLoanAmount: string;
  quickAmounts: string[];
  dailyProfitRate: string;
  minTenureDays: string;
  maxTenureDays: string;
  defaultTenureDays: string;
  penaltyDailyRate: string;
  penaltyGraceDays: string;
};

const emptyForm: FormState = {
  enabled: false,
  minLoanAmount: "",
  maxLoanAmount: "",
  quickAmounts: [],
  dailyProfitRate: "",
  minTenureDays: "",
  maxTenureDays: "",
  defaultTenureDays: "",
  penaltyDailyRate: "",
  penaltyGraceDays: "",
};

const toForm = (config: SullisCashConfig): FormState => ({
  enabled: !!config.enabled,
  minLoanAmount: String(config.minLoanAmount ?? ""),
  maxLoanAmount: String(config.maxLoanAmount ?? ""),
  quickAmounts: (config.quickAmounts ?? []).map((a) => String(a)),
  // Rates come back over-padded (0.083300); Number() drops the noise zeros so
  // the field shows what was actually set.
  dailyProfitRate: config.dailyProfitRate == null ? "" : String(Number(config.dailyProfitRate)),
  minTenureDays: String(config.minTenureDays ?? ""),
  maxTenureDays: String(config.maxTenureDays ?? ""),
  defaultTenureDays: String(config.defaultTenureDays ?? ""),
  penaltyDailyRate: config.penaltyDailyRate == null ? "" : String(Number(config.penaltyDailyRate)),
  penaltyGraceDays: String(config.penaltyGraceDays ?? ""),
});

/**
 * A titled form section.
 *
 * Deliberately a shadcn <Card> + `.pro-card-glow`, NOT `.pro-card`. The latter
 * is the filter/table card: index.css hangs unscoped `!important` filter-bar
 * rules off it — `.pro-card [data-slot="button"]` and `[data-slot="select-trigger"]`
 * are pinned to 34px/12px — so a form placed inside one ends up with 40px inputs
 * beside crushed 34px buttons. `.pro-card-glow` layers on the same emerald
 * border, glow and hover lift without those descendant rules, and is what the
 * other settings screens use.
 *
 * The icon badge is the theme's own `.pro-head-badge` rather than the
 * hand-rolled emerald utilities the older settings pages repeat.
 */
const Section = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Coins;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <Card className="pro-card-glow">
    <CardHeader className="relative pb-3">
      <CardTitle className="flex items-center gap-2.5 text-base">
        <span className="pro-head-badge">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </CardTitle>
      {description && <CardDescription className="mt-1">{description}</CardDescription>}
    </CardHeader>
    <CardContent className="relative">{children}</CardContent>
  </Card>
);

const Field = ({
  label,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`space-y-2 ${className || ""}`}>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const SullisCashConfigPage = () => {
  const { t } = useTranslation("sullisCash");
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission(SULLIS_CASH_PERMISSIONS.CONFIG_UPDATE);

  // Terms are per currency: 3,000 SAR and 3,000 CAD are different offers, so
  // every field on this page belongs to the currency selected here.
  const [currency, setCurrency] = useState("SAR");
  /** Currencies this tenant already has terms for; the rest can be seeded. */
  const [configured, setConfigured] = useState<string[]>([]);
  const [config, setConfig] = useState<SullisCashConfig | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quickDraft, setQuickDraft] = useState("");

  const load = async (code: string) => {
    setIsLoading(true);
    try {
      // Never 404s — an untouched currency is seeded from platform defaults.
      const data = await getSullisCashConfig(code);
      setConfig(data);
      setForm(toForm(data));
    } catch (error) {
      toast.error(sullisCashErrorMessage(error, t("cfg.toast.loadFailed")));
    } finally {
      setIsLoading(false);
    }
  };

  /** Which currencies already have terms, so the picker can say which are new. */
  const loadConfigured = async () => {
    try {
      const rows = await getSullisCashConfigs();
      const codes = rows.map((r) => r.currency).filter(Boolean);
      setConfigured(codes);
      // Open on a currency that actually has terms rather than assuming SAR.
      if (codes.length && !codes.includes(currency)) setCurrency(codes[0]);
    } catch (error) {
      toast.error(sullisCashErrorMessage(error, t("cfg.toast.loadFailed")));
    }
  };

  useEffect(() => {
    loadConfigured();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load(currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Compared as JSON rather than field by field: the shapes are flat and the
  // baseline is whatever the server last returned, so this cannot drift.
  const isDirty = useMemo(
    () => (config ? JSON.stringify(form) !== JSON.stringify(toForm(config)) : false),
    [form, config]
  );

  const addQuickAmount = () => {
    const raw = quickDraft.trim();
    if (!raw) return;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      return toast.error(t("cfg.valid.quickAmountInvalid"));
    }
    const min = Number(form.minLoanAmount);
    const max = Number(form.maxLoanAmount);
    // Checked on entry as well as on save — a chip that could never be offered
    // should not sit in the list looking valid.
    if (Number.isFinite(min) && Number.isFinite(max) && (value < min || value > max)) {
      return toast.error(
        t("cfg.valid.quickAmountRange", { amount: formatSullisAmount(value, currency) })
      );
    }
    if (form.quickAmounts.some((a) => Number(a) === value)) {
      setQuickDraft("");
      return;
    }
    set(
      "quickAmounts",
      [...form.quickAmounts, String(value)].sort((a, b) => Number(a) - Number(b))
    );
    setQuickDraft("");
  };

  const removeQuickAmount = (amount: string) =>
    set(
      "quickAmounts",
      form.quickAmounts.filter((a) => a !== amount)
    );

  /**
   * Mirror of the API's own rules so a 400/409 never comes back as a surprise:
   * min > 0, max ≥ min, every quick amount inside the range, rates ≥ 0,
   * tenure window ordered, default tenure inside it, grace ≥ 0.
   */
  const validate = (): string | null => {
    const min = Number(form.minLoanAmount);
    const max = Number(form.maxLoanAmount);
    const rate = Number(form.dailyProfitRate);
    const minDays = Number(form.minTenureDays);
    const maxDays = Number(form.maxTenureDays);
    const defDays = Number(form.defaultTenureDays);
    const penaltyRate = Number(form.penaltyDailyRate);
    const grace = Number(form.penaltyGraceDays);

    if (!Number.isFinite(min) || min <= 0) return t("cfg.valid.minLoanAmount");
    if (!Number.isFinite(max) || max < min) return t("cfg.valid.maxLoanAmount");

    for (const raw of form.quickAmounts) {
      const value = Number(raw);
      if (!Number.isFinite(value)) return t("cfg.valid.quickAmountInvalid");
      if (value < min || value > max) {
        return t("cfg.valid.quickAmountRange", { amount: formatSullisAmount(value, currency) });
      }
    }

    if (!Number.isFinite(rate) || rate < 0) return t("cfg.valid.dailyProfitRate");
    if (!Number.isFinite(minDays) || minDays <= 0) return t("cfg.valid.minTenureDays");
    if (!Number.isFinite(maxDays) || maxDays < minDays) return t("cfg.valid.maxTenureDays");
    if (!Number.isFinite(defDays) || defDays < minDays || defDays > maxDays) {
      return t("cfg.valid.defaultTenureDays");
    }
    if (!Number.isFinite(penaltyRate) || penaltyRate < 0) return t("cfg.valid.penaltyDailyRate");
    if (!Number.isFinite(grace) || grace < 0) return t("cfg.valid.penaltyGraceDays");
    return null;
  };

  const requestSave = () => {
    const problem = validate();
    if (problem) return toast.error(problem);
    setConfirmOpen(true);
  };

  const save = async () => {
    const body: UpdateSullisCashConfigRequest = {
      enabled: form.enabled,
      minLoanAmount: Number(form.minLoanAmount),
      maxLoanAmount: Number(form.maxLoanAmount),
      quickAmounts: form.quickAmounts.map(Number),
      dailyProfitRate: Number(form.dailyProfitRate),
      minTenureDays: Number(form.minTenureDays),
      maxTenureDays: Number(form.maxTenureDays),
      defaultTenureDays: Number(form.defaultTenureDays),
      penaltyDailyRate: Number(form.penaltyDailyRate),
      penaltyGraceDays: Number(form.penaltyGraceDays),
    };

    setIsSaving(true);
    try {
      const saved = await updateSullisCashConfig(currency, body);
      // Re-seed from the response, not the request: the server is the authority
      // on rounding, so the form must show what it actually stored.
      setConfig(saved);
      setForm(toForm(saved));
      // A first save materialises the row, so the picker must learn about it.
      if (!configured.includes(currency)) setConfigured((prev) => [...prev, currency]);
      toast.success(t("cfg.toast.saved", { currency }));
      setConfirmOpen(false);
    } catch (error) {
      toast.error(sullisCashErrorMessage(error, t("cfg.toast.saveFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  // The worked example runs at the borrowing limit over the default tenure —
  // the largest exposure the current terms allow, which is the number worth
  // seeing before saving a rate.
  const preview = useMemo(() => {
    const principal = Number(form.maxLoanAmount) || 0;
    const rate = Number(form.dailyProfitRate) || 0;
    const days = Number(form.defaultTenureDays) || 0;
    const penaltyRate = Number(form.penaltyDailyRate) || 0;
    return {
      principal,
      days,
      profit: sullisCashProfit(principal, rate, days),
      totalDue: sullisCashTotalDue(principal, rate, days),
      totalRate: sullisCashTotalRate(rate, days),
      penaltyPerDay: sullisCashPenaltyPerDay(principal, penaltyRate),
    };
  }, [form.maxLoanAmount, form.dailyProfitRate, form.defaultTenureDays, form.penaltyDailyRate]);

  const graceDays = Number(form.penaltyGraceDays) || 0;
  const readOnly = !canUpdate;

  if (isLoading) {
    return (
      <div className="service">
        <div className="mb-3 pb-2 border-bottom">
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div className="min-w-0">
          <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
            <span className="pro-head-badge">
              <Coins className="h-4 w-4" />
            </span>
            {t("cfg.title")}
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("cfg.subtitle")}</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* Which currency's terms are on screen. A currency with no row yet is
              marked New — opening it seeds one from platform defaults, and it
              only becomes real on save. */}
          <Select value={currency} onValueChange={setCurrency}>
            {/* bg-card: the trigger ships `bg-transparent`, which reads fine
                inside a white `.pro-card` but disappears here — this one sits
                straight on the sage page background. */}
            <SelectTrigger className="min-w-[190px] bg-card data-[size=default]:h-10">
              <SelectValue placeholder={t("cfg.currency.label")} />
            </SelectTrigger>
            <SelectContent>
              {Array.from(new Set([...configured, ...LEDGER_CURRENCIES])).map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                  {!configured.includes(code) ? ` · ${t("cfg.currency.new")}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <StatusPill
            enabled={form.enabled}
            label={form.enabled ? t("cfg.availability.on") : t("cfg.availability.off")}
            updatedAt={config?.updatedAt ? formatDateTime(config.updatedAt) : undefined}
            updatedLabel={t("cfg.updatedAtShort")}
          />
        </div>
      </div>

      {readOnly && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t("cfg.readOnly")}</span>
        </div>
      )}

      <div className="space-y-4">
        <Section icon={Wallet} title={t("cfg.availability.title")}>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">{t("cfg.availability.enabled")}</p>
              <p className="text-xs text-muted-foreground">{t("cfg.availability.enabledHint")}</p>
            </div>
            <Switch
              checked={form.enabled}
              disabled={readOnly}
              onCheckedChange={(v) => set("enabled", v)}
            />
          </div>
        </Section>

        <Section icon={Coins} title={t("cfg.amounts.title")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={t("cfg.field.minLoanAmount")} htmlFor="sc-min-loan">
              <Input
                id="sc-min-loan"
                type="number"
                min="0"
                step="0.01"
                placeholder="200.00"
                disabled={readOnly}
                value={form.minLoanAmount}
                onChange={(e) => set("minLoanAmount", e.target.value)}
              />
            </Field>
            <Field
              label={t("cfg.field.maxLoanAmount")}
              htmlFor="sc-max-loan"
              hint={t("cfg.field.maxLoanAmountHint")}
            >
              <Input
                id="sc-max-loan"
                type="number"
                min="0"
                step="0.01"
                placeholder="3000.00"
                disabled={readOnly}
                value={form.maxLoanAmount}
                onChange={(e) => set("maxLoanAmount", e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="sc-quick-draft">{t("cfg.field.quickAmounts")}</Label>
            <div className="flex flex-wrap items-center gap-2">
              {form.quickAmounts.map((amount) => (
                <Badge
                  key={amount}
                  variant="outline"
                  className={`border font-medium gap-1 ${TONES.emerald}`}
                >
                  {formatSullisAmount(Number(amount), currency)}
                  {!readOnly && (
                    <button
                      type="button"
                      aria-label={t("cfg.field.quickAmountsRemove", {
                        amount: formatSullisAmount(Number(amount), currency),
                      })}
                      onClick={() => removeQuickAmount(amount)}
                      className="rounded-sm p-0.5 transition-opacity hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {form.quickAmounts.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  {t("cfg.field.quickAmountsEmpty")}
                </span>
              )}
            </div>
            {!readOnly && (
              <div className="flex items-center gap-2">
                <Input
                  id="sc-quick-draft"
                  type="number"
                  min="0"
                  step="0.01"
                  className="max-w-[200px]"
                  placeholder="1600"
                  value={quickDraft}
                  onChange={(e) => setQuickDraft(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter adds the chip instead of submitting anything —
                    // there is no form element to submit to.
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addQuickAmount();
                    }
                  }}
                />
                <Button variant="outline" className="gap-2" onClick={addQuickAmount}>
                  <Plus className="h-4 w-4" />
                  {t("cfg.field.quickAmountsAdd")}
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{t("cfg.field.quickAmountsHint")}</p>
          </div>
        </Section>

        <Section icon={Percent} title={t("cfg.profit.title")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label={t("cfg.field.dailyProfitRate")}
              htmlFor="sc-profit-rate"
              hint={t("cfg.field.dailyProfitRateHint")}
            >
              <Input
                id="sc-profit-rate"
                type="number"
                min="0"
                step="0.0001"
                placeholder="0.0833"
                disabled={readOnly}
                value={form.dailyProfitRate}
                onChange={(e) => set("dailyProfitRate", e.target.value)}
              />
            </Field>
            {/* A per-day percent is unreadable as a price — the tenure total is
                the number a customer would actually compare, so it is shown
                beside the input as its own stat rather than a floating badge. */}
            {preview.days > 0 && (
              <PreviewStat
                label={t("cfg.profit.title")}
                value={formatRatePercent(preview.totalRate)}
                caption={t("cfg.profit.perDay", {
                  rate: formatRatePercent(Number(form.dailyProfitRate) || 0),
                  days: preview.days,
                })}
              />
            )}
          </div>
        </Section>

        <Section icon={CalendarClock} title={t("cfg.tenure.title")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label={t("cfg.field.minTenureDays")} htmlFor="sc-min-tenure">
              <Input
                id="sc-min-tenure"
                type="number"
                min="1"
                step="1"
                placeholder="7"
                disabled={readOnly}
                value={form.minTenureDays}
                onChange={(e) => set("minTenureDays", e.target.value)}
              />
            </Field>
            <Field label={t("cfg.field.maxTenureDays")} htmlFor="sc-max-tenure">
              <Input
                id="sc-max-tenure"
                type="number"
                min="1"
                step="1"
                placeholder="60"
                disabled={readOnly}
                value={form.maxTenureDays}
                onChange={(e) => set("maxTenureDays", e.target.value)}
              />
            </Field>
            <Field
              label={t("cfg.field.defaultTenureDays")}
              htmlFor="sc-default-tenure"
              hint={t("cfg.field.defaultTenureDaysHint")}
            >
              <Input
                id="sc-default-tenure"
                type="number"
                min="1"
                step="1"
                placeholder="60"
                disabled={readOnly}
                value={form.defaultTenureDays}
                onChange={(e) => set("defaultTenureDays", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section icon={AlertTriangle} title={t("cfg.penalty.title")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label={t("cfg.field.penaltyDailyRate")}
              htmlFor="sc-penalty-rate"
              hint={t("cfg.field.penaltyDailyRateHint")}
            >
              <Input
                id="sc-penalty-rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.05"
                disabled={readOnly}
                value={form.penaltyDailyRate}
                onChange={(e) => set("penaltyDailyRate", e.target.value)}
              />
            </Field>
            <Field
              label={t("cfg.field.penaltyGraceDays")}
              htmlFor="sc-grace-days"
              hint={t("cfg.field.penaltyGraceDaysHint")}
            >
              <Input
                id="sc-grace-days"
                type="number"
                min="0"
                step="1"
                placeholder="3"
                disabled={readOnly}
                value={form.penaltyGraceDays}
                onChange={(e) => set("penaltyGraceDays", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* The terms as money. Percentages per day are hard to price by eye, so
            the largest loan the settings allow is worked through end to end. */}
        {preview.principal > 0 && preview.days > 0 && (
          <Section
            icon={Coins}
            title={t("cfg.preview.title")}
            description={t("cfg.preview.subtitle")}
          >
            {/* Laid out as the equation it is — principal + profit = total —
                rather than four equal tiles that hide the arithmetic. The
                operator cells sit between the tiles on desktop and stack
                between them on phones, so the sum reads either way. */}
            <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <PreviewStat
                label={t("cfg.preview.principal")}
                value={formatSullisAmount(preview.principal, currency)}
              />
              <Operator symbol="+" />
              <PreviewStat
                label={t("cfg.preview.profit")}
                value={formatSullisAmount(preview.profit, currency)}
                caption={t("cfg.profit.effective", {
                  rate: formatRatePercent(preview.totalRate),
                  days: preview.days,
                })}
              />
              <Operator symbol="=" />
              <PreviewStat
                label={t("cfg.preview.totalDue")}
                value={formatSullisAmount(preview.totalDue, currency)}
                tone="total"
              />
            </div>

            {/* The penalty is conditional and not part of the sum above, so it
                sits below the divider rather than pretending to be a fourth
                term of the equation. */}
            {preview.penaltyPerDay > 0 && (
              <div
                className={`mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-xs ${TONES.amber}`}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{t("cfg.preview.penaltyPerDay")}</span>
                <span className="font-bold tabular-nums">
                  {formatSullisAmount(preview.penaltyPerDay, currency)}
                </span>
                <span className="opacity-80">
                  {graceDays > 0
                    ? t("cfg.preview.penaltyAfterGrace", { days: graceDays })
                    : t("cfg.preview.penaltyNoGrace")}
                </span>
              </div>
            )}
          </Section>
        )}

        {/* A plain row, not a `.pro-card`: that class would pin these buttons to
            the 34px filter-bar height via an !important rule. */}
        {!readOnly && (
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            {isDirty && (
              <Badge variant="outline" className={`border font-medium me-auto ${TONES.amber}`}>
                {t("cfg.unsaved")}
              </Badge>
            )}
            <Button
              variant="outline"
              className="gap-2"
              disabled={!isDirty || isSaving}
              onClick={() => config && setForm(toForm(config))}
            >
              <RotateCcw className="h-4 w-4" />
              {t("cfg.discard")}
            </Button>
            <Button
              className="wallet-brand-btn gap-2"
              disabled={!isDirty || isSaving}
              onClick={requestSave}
            >
              <Save className="h-4 w-4" />
              {isSaving ? t("cfg.saving") : t("cfg.save")}
            </Button>
          </div>
        )}
      </div>

      {/* Confirmed rather than saved outright: this re-prices a live lending
          product, and the snapshot rule is the one thing an admin must know
          before changing a rate.

          Built on Dialog + `pro-dialog confirm-dialog`, NOT AlertDialog. Every
          global dialog rule in the app — tokens.css sizing and dark mode,
          `.pro-dialog` typography, `.confirm-dialog`'s borderless header/footer
          — is written against [data-slot="dialog-*"]. AlertDialog is a separate
          Radix family those selectors never match, so it renders as raw shadcn:
          oversized title, wrong paddings, an overlay that does not match the
          app's other modals. */}
      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogContent className="pro-dialog confirm-dialog sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
              <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400" />
            </span>
            <DialogTitle className="text-center">{t("cfg.confirm.title")}</DialogTitle>
            <DialogDescription className="text-center">
              {t("cfg.confirm.description")}
            </DialogDescription>
          </DialogHeader>

          {/* Turning the product off is the one change a customer notices
              immediately, so it is called out separately. */}
          {config?.enabled && !form.enabled && (
            <div
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-start text-xs ${TONES.amber}`}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{t("cfg.confirm.disableWarning")}</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSaving}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={save} disabled={isSaving}>
              {isSaving ? t("cfg.saving") : t("cfg.confirm.action")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * The product's live state, as one chip: a state dot, what the dot means, and
 * when the terms last changed. Previously a Badge with a loose timestamp under
 * it — two unrelated-looking elements. A dot reads as "status" at a glance in a
 * way a filled pill does not, and the halo ring keeps it visible against the
 * card without shouting.
 */
const StatusPill = ({
  enabled,
  label,
  updatedAt,
  updatedLabel,
}: {
  enabled: boolean;
  label: string;
  updatedAt?: string;
  updatedLabel: string;
}) => (
  // The outline is a `ring-1`, not `border border-border`: Bootstrap ships an
  // unlayered `.border { border-color: var(--bs-border-color) !important }` that
  // beats the Tailwind border colour, so in dark mode this chip drew a light
  // grey #dee2e6 outline around a dark surface. Bootstrap has no `.ring-1`, so
  // the token colour survives. Same reason `shadow-sm` is gone — Bootstrap's is
  // `!important` and would overwrite the ring's box-shadow.
  <div className="flex shrink-0 items-center gap-2.5 rounded-lg bg-card px-3 py-2 ring-1 ring-border">
    <span
      className={`size-2 shrink-0 rounded-full ring-4 ${
        enabled ? "bg-emerald-500 ring-emerald-500/15" : "bg-slate-400 ring-slate-400/15"
      }`}
    />
    <div className="min-w-0 leading-tight">
      <p className="m-0 text-xs font-semibold text-foreground">{label}</p>
      {updatedAt && (
        <p className="m-0 mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {updatedLabel} {updatedAt}
          </span>
        </p>
      )}
    </div>
  </div>
);

/**
 * One figure in the worked example.
 *
 * `tabular-nums` matters here: without it the digits are proportional, so the
 * amounts in adjacent tiles do not line up and the column reads as ragged.
 * `tone="total"` tints the result so the eye lands on what is actually repaid
 * rather than treating all three terms as equals.
 */
const PreviewStat = ({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: "default" | "total";
}) => {
  const isTotal = tone === "total";
  return (
    <div
      className={`flex flex-col rounded-lg border px-4 py-3 ${
        isTotal ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/40"
      }`}
    >
      <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`m-0 mt-1 font-bold tabular-nums ${
          isTotal ? "text-lg text-emerald-600 dark:text-emerald-400" : "text-base text-foreground"
        }`}
      >
        {value}
      </p>
      {caption && <p className="m-0 mt-1 text-[11px] text-muted-foreground">{caption}</p>}
    </div>
  );
};

/**
 * The `+` / `=` between the tiles. Muted and light so it guides the eye without
 * competing with the figures it joins.
 */
const Operator = ({ symbol }: { symbol: string }) => (
  <div
    aria-hidden="true"
    className="flex items-center justify-center text-lg font-light text-muted-foreground"
  >
    {symbol}
  </div>
);

export default SullisCashConfigPage;
