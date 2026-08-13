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
import { cn } from "../../../lib/utils";
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
  // gap-0/py-0 hands the spacing to the header and body rather than fighting
  // Card's own py-6 + gap-6, which left every section airier than its contents.
  // The rule sits on the body as border-t, not on the header as border-b:
  // CardHeader carries a `[.border-b]:pb-6` variant whose compound selector
  // outranks any padding set here, so a divider there forces the old spacing
  // back.
  // h-full + a growing body so two cards side by side end on the same line;
  // without it a card is only as tall as its own fields and the row looks torn.
  <Card className="pro-card-glow h-full gap-0 py-0">
    <CardHeader className="relative gap-0.5 px-4 py-3">
      <CardTitle className="flex items-center gap-2 text-sm">
        <span className="pro-head-badge">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </CardTitle>
      {description && <CardDescription className="text-xs">{description}</CardDescription>}
    </CardHeader>
    {/* @container so the fields inside lay themselves out against the CARD's
        width, not the viewport's. The cards are half-width now, so a viewport
        breakpoint would put three fields in a 450px card. */}
    <CardContent className="@container relative flex-1 border-t px-4 py-4">{children}</CardContent>
  </Card>
);

/**
 * A number field that carries its unit in an addon beside the box.
 *
 * An addon rather than a label floating inside the input on padding: `Input`'s
 * base class is `px-3`, and Bootstrap ships `.px-3` with `!important`, so no
 * `ps-*` override can win — the value printed straight over the prefix. The
 * addon owns its own strip of the group, so nothing can overlap.
 *
 * `border-s`/`border-e` rather than left/right, so the currency sits before the
 * number in Arabic too. The spinner is hidden: stepper arrows on a rate field
 * invite dragging a price by accident, and they would crowd the suffix.
 */
const UnitAddon = ({ side, children }: { side: "start" | "end"; children: React.ReactNode }) => (
  <span
    className={cn(
      "flex shrink-0 select-none items-center bg-muted/60 px-2.5 text-xs font-medium text-muted-foreground",
      side === "start" ? "border-e border-border" : "border-s border-border"
    )}
  >
    {children}
  </span>
);

const UnitInput = ({
  prefix,
  suffix,
  className,
  wrapperClassName,
  ...props
}: React.ComponentProps<typeof Input> & {
  prefix?: string;
  suffix?: string;
  wrapperClassName?: string;
}) => (
  // Fills its grid cell rather than carrying its own cap: the column decides the
  // width, so every control on the page ends on the same edge.
  <div
    className={cn(
      "flex h-10 w-full items-stretch overflow-hidden rounded-md bg-card ring-1 ring-input focus-within:ring-2 focus-within:ring-ring [&:has(input:disabled)]:opacity-60",
      wrapperClassName
    )}
  >
    {prefix && <UnitAddon side="start">{prefix}</UnitAddon>}
    <Input
      className={cn(
        "h-full min-w-0 flex-1 rounded-none border-0 bg-transparent tabular-nums shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        className
      )}
      {...props}
    />
    {suffix && <UnitAddon side="end">{suffix}</UnitAddon>}
  </div>
);

/**
 * One setting: its name directly above its control.
 *
 * Not a label column beside the control. That reads well in a narrow settings
 * panel, but across a 1200px card it opened a 200px gutter between a setting
 * and the box that sets it — twice per line — and the eye had four alignment
 * edges to track instead of one. Stacked, a label and its field are one object.
 */
const Field = ({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
  </div>
);

/**
 * The settings of one section, as a grid that answers to the card it is in.
 *
 * Container breakpoints, not viewport ones: a half-width card is ~450px on a
 * wide screen, where `sm:`/`lg:` would happily put three fields. The column is
 * what sizes the control, so the field just fills its cell — no arbitrary
 * max-width, and every control lines up on the same edges.
 */
const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-4 @md:grid-cols-2 @3xl:grid-cols-3">
    {children}
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
      {/* align-items-center: the controls are one 40px row against a two-line
          title block, so centring them reads level with it. */}
      <div className="mb-3 pb-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
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

      {/* ring, not border: Bootstrap's `.border` is !important and unthemed, so
          a bare border here goes light grey in dark mode. */}
      {readOnly && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground ring-1 ring-border">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t("cfg.readOnly")}</span>
        </div>
      )}

      {/* Two columns, not one long stack. Six full-width cards each holding two
          short fields meant the page was mostly empty space read top to bottom,
          and the worked example — the one thing worth watching while you edit —
          sat at the very bottom where you could not see it change. The form
          keeps the fluid column; the example moves into a rail that sticks to
          the top of the viewport. Under xl they stack, example last. */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="flex flex-col gap-3">
          {/* Full width, alone at the top. It is the master switch for the whole
              product, not a peer of the fields that price it — and as a card in
              the pack it was one short row of content under a header, with the
              switch marooned in the middle of the page.

              No inner box either: the section card already frames this, and a
              border inside a border read as a panel that had lost its contents. */}
          <Section icon={Wallet} title={t("cfg.availability.title")}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="m-0 text-sm font-medium">{t("cfg.availability.enabled")}</p>
                <p className="m-0 mt-0.5 text-xs text-muted-foreground">
                  {t("cfg.availability.enabledHint")}
                </p>
              </div>
              <Switch
                checked={form.enabled}
                disabled={readOnly}
                onCheckedChange={(v) => set("enabled", v)}
              />
            </div>
          </Section>

          {/* Two-up, cards stretched to a common height per row. Paired by size
              so stretching costs almost nothing: Loan amounts (a field pair plus
              the chip list) sits with Tenure (three fields), and the two
              single-row cards, Profit and Late penalty, sit together. That is
              why Tenure comes before Profit here. */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Section icon={Coins} title={t("cfg.amounts.title")}>
              <FieldGrid>
                <Field label={t("cfg.field.minLoanAmount")} htmlFor="sc-min-loan">
                  <UnitInput
                    id="sc-min-loan"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix={currency}
                    placeholder="200.00"
                    disabled={readOnly}
                    value={form.minLoanAmount}
                    onChange={(e) => set("minLoanAmount", e.target.value)}
                  />
                </Field>
                <Field label={t("cfg.field.maxLoanAmount")} htmlFor="sc-max-loan">
                  <UnitInput
                    id="sc-max-loan"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix={currency}
                    placeholder="3000.00"
                    disabled={readOnly}
                    value={form.maxLoanAmount}
                    onChange={(e) => set("maxLoanAmount", e.target.value)}
                  />
                </Field>
              </FieldGrid>

              {/* Its own block below a rule: the chips are a list that grows, not
                a third field in the grid above. */}
              <div className="mt-4 space-y-1.5 border-t pt-4">
                <Label htmlFor="sc-quick-draft">{t("cfg.field.quickAmounts")}</Label>
                <div className="flex min-h-7 flex-wrap items-center gap-2">
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
                    <UnitInput
                      wrapperClassName="max-w-[220px]"
                      id="sc-quick-draft"
                      type="number"
                      min="0"
                      step="0.01"
                      prefix={currency}
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
                    <Button
                      variant="outline"
                      className="h-10 shrink-0 gap-2"
                      onClick={addQuickAmount}
                    >
                      <Plus className="h-4 w-4" />
                      {t("cfg.field.quickAmountsAdd")}
                    </Button>
                  </div>
                )}
              </div>
            </Section>

            <Section icon={CalendarClock} title={t("cfg.tenure.title")}>
              <FieldGrid>
                <Field label={t("cfg.field.minTenureDays")} htmlFor="sc-min-tenure">
                  <UnitInput
                    id="sc-min-tenure"
                    type="number"
                    min="1"
                    step="1"
                    suffix={t("cfg.unit.days")}
                    placeholder="7"
                    disabled={readOnly}
                    value={form.minTenureDays}
                    onChange={(e) => set("minTenureDays", e.target.value)}
                  />
                </Field>
                <Field label={t("cfg.field.maxTenureDays")} htmlFor="sc-max-tenure">
                  <UnitInput
                    id="sc-max-tenure"
                    type="number"
                    min="1"
                    step="1"
                    suffix={t("cfg.unit.days")}
                    placeholder="60"
                    disabled={readOnly}
                    value={form.maxTenureDays}
                    onChange={(e) => set("maxTenureDays", e.target.value)}
                  />
                </Field>
                <Field label={t("cfg.field.defaultTenureDays")} htmlFor="sc-default-tenure">
                  <UnitInput
                    id="sc-default-tenure"
                    type="number"
                    min="1"
                    step="1"
                    suffix={t("cfg.unit.days")}
                    placeholder="60"
                    disabled={readOnly}
                    value={form.defaultTenureDays}
                    onChange={(e) => set("defaultTenureDays", e.target.value)}
                  />
                </Field>
              </FieldGrid>
            </Section>

            <Section icon={Percent} title={t("cfg.profit.title")}>
              <FieldGrid>
                <Field label={t("cfg.field.dailyProfitRate")} htmlFor="sc-profit-rate">
                  <UnitInput
                    id="sc-profit-rate"
                    type="number"
                    min="0"
                    step="0.0001"
                    suffix={t("cfg.unit.percent")}
                    placeholder="0.0833"
                    disabled={readOnly}
                    value={form.dailyProfitRate}
                    onChange={(e) => set("dailyProfitRate", e.target.value)}
                  />
                </Field>
                {/* A per-day percent is unreadable as a price — the tenure total
                  is the number a customer would compare. Built as a cell like
                  every other: name on top, content beneath, on the same 40px
                  line as the field beside it. */}
                {preview.days > 0 && (
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>{t("cfg.profit.title")}</Label>
                    <div className="flex h-10 min-w-0 items-center gap-2">
                      <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatRatePercent(preview.totalRate)}
                      </span>
                      <span className="min-w-0 truncate text-xs text-muted-foreground">
                        {t("cfg.profit.perDay", {
                          rate: formatRatePercent(Number(form.dailyProfitRate) || 0),
                          days: preview.days,
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </FieldGrid>
            </Section>
            <Section icon={AlertTriangle} title={t("cfg.penalty.title")}>
              <FieldGrid>
                <Field label={t("cfg.field.penaltyDailyRate")} htmlFor="sc-penalty-rate">
                  <UnitInput
                    id="sc-penalty-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    suffix={t("cfg.unit.percentPerDay")}
                    placeholder="0.05"
                    disabled={readOnly}
                    value={form.penaltyDailyRate}
                    onChange={(e) => set("penaltyDailyRate", e.target.value)}
                  />
                </Field>
                <Field label={t("cfg.field.penaltyGraceDays")} htmlFor="sc-grace-days">
                  <UnitInput
                    id="sc-grace-days"
                    type="number"
                    min="0"
                    step="1"
                    suffix={t("cfg.unit.days")}
                    placeholder="3"
                    disabled={readOnly}
                    value={form.penaltyGraceDays}
                    onChange={(e) => set("penaltyGraceDays", e.target.value)}
                  />
                </Field>
              </FieldGrid>
            </Section>
          </div>
        </div>

        {/* The terms as money. Percentages per day are hard to price by eye, so
            the largest loan the settings allow is worked through end to end.
            Sticky, because its whole value is watching it move as you type. */}
        {preview.principal > 0 && preview.days > 0 && (
          <aside className="xl:sticky xl:top-3">
            <Section
              icon={Coins}
              title={t("cfg.preview.title")}
              description={t("cfg.preview.subtitle")}
            >
              {/* A receipt, not three tiles side by side: in a 360px rail the
                  terms read down the page, and stacking them puts the sum on
                  one axis with the total under a rule where a total belongs. */}
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {t("cfg.preview.principal")}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatSullisAmount(preview.principal, currency)}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-xs text-muted-foreground">
                    {t("cfg.preview.profit")}
                    <span className="mt-0.5 block text-[11px] opacity-80">
                      {t("cfg.profit.effective", {
                        rate: formatRatePercent(preview.totalRate),
                        days: preview.days,
                      })}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    + {formatSullisAmount(preview.profit, currency)}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-3 border-t pt-3">
                  <span className="text-xs font-medium">{t("cfg.preview.totalDue")}</span>
                  <span className="shrink-0 text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatSullisAmount(preview.totalDue, currency)}
                  </span>
                </div>
              </div>

              {/* The penalty is conditional and never part of the sum above, so
                  it sits apart rather than reading as a fourth term. */}
              {preview.penaltyPerDay > 0 && (
                <div
                  className={`mt-4 flex flex-col gap-1 rounded-lg px-3 py-2 text-xs ring-1 ${TONES.amber}`}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {t("cfg.preview.penaltyPerDay")}
                    <span className="ms-auto font-bold tabular-nums">
                      {formatSullisAmount(preview.penaltyPerDay, currency)}
                    </span>
                  </span>
                  <span className="opacity-80">
                    {graceDays > 0
                      ? t("cfg.preview.penaltyAfterGrace", { days: graceDays })
                      : t("cfg.preview.penaltyNoGrace")}
                  </span>
                </div>
              )}
            </Section>
          </aside>
        )}
      </div>

      {/* A plain row, not a `.pro-card`: that class would pin these buttons to
          the 34px filter-bar height via an !important rule. */}
      {!readOnly && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {isDirty && (
            <Badge variant="outline" className={`border font-medium me-auto ${TONES.amber}`}>
              {t("cfg.unsaved")}
            </Badge>
          )}
          <Button
            variant="outline"
            className="h-10 gap-2"
            disabled={!isDirty || isSaving}
            onClick={() => config && setForm(toForm(config))}
          >
            <RotateCcw className="h-4 w-4" />
            {t("cfg.discard")}
          </Button>
          <Button
            className="wallet-brand-btn h-10 gap-2"
            disabled={!isDirty || isSaving}
            onClick={requestSave}
          >
            <Save className="h-4 w-4" />
            {isSaving ? t("cfg.saving") : t("cfg.save")}
          </Button>
        </div>
      )}

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
  // h-10, matching the currency select it sits beside — the two were 40px and
  // 46px, which read as a misalignment rather than two sizes.
  <div className="flex h-10 shrink-0 items-center gap-2.5 rounded-lg bg-card px-3 ring-1 ring-border">
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

export default SullisCashConfigPage;
