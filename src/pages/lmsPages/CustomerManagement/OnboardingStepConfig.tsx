import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock,
  GripVertical,
  Info,
  ListOrdered,
  Lock,
  PauseCircle,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Undo2,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, humanizeCode } from "../../../components/shared/detailKitUtils";
import { cn } from "../../../lib/utils";
import {
  COUNTRY_CONFIG_PERMISSIONS,
  useProductPermissions,
} from "../../../hooks/useProductPermissions";
import {
  getOnboardingCountries,
  type CountryConfig,
} from "../../../redux/apis/apisBusinessOnboarding";
import {
  DEFAULT_STEP_ORDER,
  DEFAULT_STEP_SEED,
  getCountrySteps,
  getStepTypes,
  isGatedStepType,
  isValidConfigJson,
  parseStepConfig,
  readGate,
  saveCountrySteps,
  stepConfigErrorMessage,
  stepConfigErrorStatus,
  stringifyStepConfig,
  validateStepList,
  writeGate,
  type CountryOnboardingStep,
  type CountryOnboardingStepInput,
  type CountryStepConfig,
  type StepTypeOption,
} from "../../../redux/apis/apisCountryStepConfig";

const DEFAULT_COUNTRY = "SAU";

/* ------------------------------------------------------------------ */
/* Local model                                                         */
/* ------------------------------------------------------------------ */

/**
 * A step while it is being edited.
 *
 * `configText` is the source of truth for the wire — the API stores `config` as
 * a JSON *string* and round-trips it as text, so that is what gets sent.
 * `configObj` is the parsed view the gate switches read and write; every write
 * regenerates `configText` from it, so the two never drift.
 */
interface EditableStep extends Omit<CountryOnboardingStep, "config"> {
  /** Stable across reorders — `stepType` is unique per country, so it serves. */
  key: string;
  configText: string;
  configObj: Record<string, unknown>;
}

const toEditable = (step: CountryOnboardingStep): EditableStep => ({
  ...step,
  key: step.stepType,
  configText: step.config || "",
  configObj: parseStepConfig(step.config),
});

/**
 * What `PUT` receives. `mandatory` is deliberately absent: it is derived by the
 * server from the step type and is not a request field.
 */
const toPayload = (steps: EditableStep[]): CountryOnboardingStepInput[] =>
  steps.map((step, index) => ({
    stepType: step.stepType,
    stepOrder: index + 1,
    label: step.label ?? null,
    labelAr: step.labelAr ?? null,
    description: step.description ?? null,
    providerCode: step.providerCode ?? null,
    signalWait: step.signalWait ?? false,
    timeoutMinutes: step.timeoutMinutes ?? 30,
    required: step.required ?? true,
    enabled: step.enabled,
    config: step.configText.trim() ? step.configText : null,
  }));

/** Everything a save would change, so "dirty" means "the payload differs". */
const fingerprint = (steps: EditableStep[]): string => JSON.stringify(toPayload(steps));

/* ------------------------------------------------------------------ */
/* Presentation pieces                                                 */
/* ------------------------------------------------------------------ */

const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) => (
  <div className="mb-3 pb-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
    <div className="min-w-0">
      <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
        <span className="pro-head-badge">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h3>
      {subtitle && <p className="mb-0 mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {children && <div className="d-flex align-items-center gap-2">{children}</div>}
  </div>
);

/** A rule the API enforces, or a consequence the UI must not soften. */
const Notice = ({
  tone = "slate",
  icon: Icon,
  children,
  className,
}: {
  tone?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) => {
  const Glyph = Icon || (tone === "amber" || tone === "red" ? AlertTriangle : Info);
  return (
    <div
      className={cn(
        "mb-2 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ring-1",
        TONES[tone] || TONES.slate,
        className
      )}
    >
      <Glyph className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
};

/** One labelled switch with the consequence written under it. */
const GateSwitch = ({
  id,
  label,
  hint,
  checked,
  onChange,
  disabled,
  tone,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  tone?: "amber";
}) => (
  <div
    className={cn(
      "flex items-start justify-between gap-3",
      tone === "amber"
        ? "rounded-[2px] border border-amber-300 bg-amber-50/60 p-3 dark:border-amber-500/30 dark:bg-amber-500/10"
        : "pro-tile"
    )}
  >
    <div className="min-w-0">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <p className="m-0 mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
  </div>
);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

/**
 * The onboarding journey a country's applicants see: which steps the app shows,
 * in what order, with which labels, and which optional screening gates run.
 *
 * Three properties of the API drive the whole screen and are stated on it
 * rather than left to be discovered:
 *
 * - **Reordering changes the display, not the execution.** The onboarding
 *   workflow is a Temporal workflow whose activity sequence is fixed by replay
 *   determinism and by compliance ordering. Dragging a row changes the progress
 *   display and which screens the app renders — nothing about what the backend
 *   runs.
 * - **Saving is replace-all.** Any step omitted from the payload is deleted, so
 *   the editor always holds and always sends the complete list, and removing a
 *   row is offered as a destructive act with a confirmation.
 * - **Four steps are the SAMA KYC backbone.** Mobile, OTP, Nafath and
 *   Completion carry `mandatory: true` and can never be switched off. The lock
 *   is driven off that server flag, never off a list hardcoded here — a fifth
 *   mandatory step would otherwise become disableable in the UI and 422 on save.
 *
 * Gate changes (`config`) are snapshotted once at workflow start, so a customer
 * already mid-journey finishes on the settings that were in force when they
 * began. The screen says "applies to new applications", never "applies now".
 */
const OnboardingStepConfig = () => {
  const { t } = useTranslation("onboardingSteps");
  const { hasAnyPermission } = useProductPermissions();

  const canRead = hasAnyPermission(COUNTRY_CONFIG_PERMISSIONS.READ);
  const canWrite = hasAnyPermission(COUNTRY_CONFIG_PERMISSIONS.UPDATE);

  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);
  const [catalogue, setCatalogue] = useState<StepTypeOption[]>([]);

  const [steps, setSteps] = useState<EditableStep[]>([]);
  const [baseline, setBaseline] = useState("");
  const [notConfigured, setNotConfigured] = useState(false);
  const [countryMissing, setCountryMissing] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  /** Which row the grip has armed for dragging, and which one is being dragged. */
  const [armed, setArmed] = useState<string | null>(null);
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const [blockOnHitFor, setBlockOnHitFor] = useState<string | null>(null);
  const [removing, setRemoving] = useState<EditableStep | null>(null);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.RESOURCE.NOT_FOUND": t("err.notFound"),
      "COMMON.AUTH.INVALID_CREDENTIALS": t("err.noTenant"),
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
    }),
    [t]
  );

  const dirty = fingerprint(steps) !== baseline;

  /* ---------------------------------------------------------------- */
  /* Loading                                                           */
  /* ---------------------------------------------------------------- */

  /** Adopt a server response as the new truth — including its renumbered order. */
  const adopt = (config: CountryStepConfig | null) => {
    const list = (config?.steps || [])
      .slice()
      .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))
      .map(toEditable);
    setSteps(list);
    setBaseline(fingerprint(list));
    setNotConfigured(list.length === 0);
    setExpanded(null);
  };

  const load = async (code: string) => {
    if (!canRead || !code) return;
    setIsLoading(true);
    setCountryMissing(false);
    try {
      adopt(await getCountrySteps(code));
    } catch (error) {
      // 404 is "this country is not in supported_countries" — a different thing
      // from "configured with no steps", and it has a different remedy.
      if (stepConfigErrorStatus(error) === 404) {
        setCountryMissing(true);
        adopt(null);
        setNotConfigured(false);
      } else {
        toast.error(stepConfigErrorMessage(error, t("toast.loadFailed"), errorsByCode));
        adopt(null);
        setNotConfigured(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!canRead) return;
    getStepTypes()
      .then(setCatalogue)
      .catch((error) =>
        toast.error(stepConfigErrorMessage(error, t("toast.typesFailed"), errorsByCode))
      );
    getOnboardingCountries()
      .then(setCountries)
      .catch(() => toast.error(t("toast.countriesFailed")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  useEffect(() => {
    load(countryCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, canRead]);

  /* ---------------------------------------------------------------- */
  /* Editing                                                           */
  /* ---------------------------------------------------------------- */

  const patch = (key: string, changes: Partial<EditableStep>) =>
    setSteps((current) => current.map((s) => (s.key === key ? { ...s, ...changes } : s)));

  /** Writing a gate regenerates `configText`, which is what actually gets sent. */
  const setGate = (step: EditableStep, path: string[], value: boolean) => {
    const configObj = writeGate(step.configObj, path, value);
    patch(step.key, { configObj, configText: stringifyStepConfig(configObj) });
  };

  const setConfigText = (step: EditableStep, raw: string) =>
    patch(step.key, { configText: raw, configObj: parseStepConfig(raw) });

  const move = (from: number, to: number) => {
    if (to < 0 || to >= steps.length || from === to) return;
    setSteps((current) => {
      const next = current.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const addStep = (option: StepTypeOption) => {
    const seed = DEFAULT_STEP_SEED[option.stepType];
    const step: EditableStep = {
      key: option.stepType,
      stepType: option.stepType,
      stepOrder: steps.length + 1,
      label: seed?.label || humanizeCode(option.stepType),
      labelAr: seed?.labelAr || "",
      description: seed?.description || "",
      providerCode: seed?.providerCode || "INTERNAL",
      signalWait: false,
      timeoutMinutes: 30,
      required: true,
      enabled: true,
      mandatory: option.mandatory,
      configText: seed?.config || "",
      configObj: parseStepConfig(seed?.config),
    };
    setSteps((current) => [...current, step]);
    setExpanded(step.key);
  };

  const removeStep = (step: EditableStep) => {
    setSteps((current) => current.filter((s) => s.key !== step.key));
    setRemoving(null);
  };

  /**
   * Seed the eight defaults. Offered instead of an empty screen: a country with
   * no configuration is not broken — the app falls back to its compiled-in
   * journey — but there is nothing to edit until something exists.
   */
  const seedDefaults = () => {
    const list = DEFAULT_STEP_ORDER.map((stepType, index) => {
      const seed = DEFAULT_STEP_SEED[stepType];
      const known = catalogue.find((c) => c.stepType === stepType);
      return {
        key: stepType,
        stepType,
        stepOrder: index + 1,
        label: seed.label,
        labelAr: seed.labelAr,
        description: seed.description,
        providerCode: seed.providerCode || "INTERNAL",
        signalWait: false,
        timeoutMinutes: 30,
        required: true,
        enabled: true,
        mandatory: known?.mandatory ?? false,
        configText: seed.config || "",
        configObj: parseStepConfig(seed.config),
      } as EditableStep;
    });
    setSteps(list);
    setNotConfigured(false);
  };

  const discard = () => load(countryCode);

  /* ---------------------------------------------------------------- */
  /* Saving                                                            */
  /* ---------------------------------------------------------------- */

  const problems = useMemo(
    () =>
      validateStepList(
        steps.map((s) => ({
          stepType: s.stepType,
          enabled: s.enabled,
          configValid: isValidConfigJson(s.configText),
        })),
        catalogue
      ),
    [steps, catalogue]
  );

  const save = async () => {
    if (problems.length) {
      toast.error(
        t(`valid.${problems[0].code}`, { steps: problems[0].steps.map(humanizeCode).join(", ") })
      );
      return;
    }

    setBusy(true);
    try {
      // Render from the response, not from local state: `stepOrder` is
      // renumbered server-side, so this is the only accurate view of what the
      // app will render.
      adopt(await saveCountrySteps(countryCode, toPayload(steps)));
      toast.success(t("toast.saved"));
    } catch (error) {
      toast.error(stepConfigErrorMessage(error, t("toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  if (!canRead) return <PermissionDenied />;

  const availableTypes = catalogue.filter((c) => !steps.some((s) => s.stepType === c.stepType));
  const countryOptions = countries.some((c) => c.countryCode === countryCode)
    ? countries
    : [...countries, { countryCode, countryName: countryCode } as CountryConfig];
  const enabledCount = steps.filter((s) => s.enabled).length;

  const stepTitle = (step: EditableStep) =>
    step.label || step.labelAr || humanizeCode(step.stepType);

  return (
    <div className="service">
      <PageHeader icon={ListOrdered} title={t("title")} subtitle={t("subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Select value={countryCode} onValueChange={setCountryCode} disabled={isLoading || busy}>
            <SelectTrigger
              className="w-full shrink-0 bg-card sm:w-[220px]"
              aria-label={t("country")}
            >
              <SelectValue placeholder={t("countryPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {/* The selected country stays in the list even before the list
                  arrives, and even if reference data does not carry it — a Select
                  whose value is absent from its options renders blank. */}
              {countryOptions.map((c) => (
                <SelectItem key={c.countryCode} value={c.countryCode}>
                  {c.countryName || c.countryCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => load(countryCode)}
              disabled={isLoading || busy}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              {t("common:refresh")}
            </Button>

            {canWrite && dirty && (
              <Button variant="ghost" className="gap-2" onClick={discard} disabled={busy}>
                <Undo2 className="h-4 w-4" />
                {t("discard")}
              </Button>
            )}

            {canWrite && (
              <Button
                className="wallet-brand-btn gap-2"
                onClick={save}
                disabled={busy || isLoading || !dirty || countryMissing}
              >
                <Save className="h-4 w-4" />
                {t("common:save")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {countryMissing ? (
        <Notice tone="red" icon={AlertTriangle}>
          {t("err.notFound")}
        </Notice>
      ) : (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{t("summary", { enabled: enabledCount, total: steps.length })}</span>
            {dirty && (
              <Badge variant="outline" className={cn("border font-medium", TONES.amber)}>
                {t("unsaved")}
              </Badge>
            )}
          </div>

          {/* Every blocked save, listed while the operator is still looking at
              the rows that caused it. The server stays the real gate. */}
          {problems.length > 0 && (
            <Notice tone="red" icon={AlertTriangle}>
              <ul className="m-0 list-disc ps-4">
                {problems.map((problem) => (
                  <li key={problem.code}>
                    {t(`valid.${problem.code}`, {
                      steps: problem.steps.map(humanizeCode).join(", "),
                    })}
                  </li>
                ))}
              </ul>
            </Notice>
          )}

          <div className="pro-card p-3">
            {!isLoading && steps.length === 0 ? (
              <div className="py-8">
                <EmptyState icon={ListOrdered} text={t("list.empty")} />

                {/* Gated on the catalogue: it is what says which of the eight
                    are mandatory, and seeding without it would leave those
                    rows unlocked until the next load. */}
                {canWrite && notConfigured && catalogue.length > 0 && (
                  <div className="mt-3 flex justify-center">
                    <Button variant="outline" className="gap-2" onClick={seedDefaults}>
                      <Sparkles className="h-4 w-4" />
                      {t("list.seed")}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <ol className="m-0 list-none p-0">
                {steps.map((step, index) => {
                  const isOpen = expanded === step.key;
                  const configInvalid = !isValidConfigJson(step.configText);

                  return (
                    <li
                      key={step.key}
                      draggable={armed === step.key}
                      onDragStart={() => {
                        dragFrom.current = index;
                      }}
                      onDragOver={(event) => {
                        if (dragFrom.current === null) return;
                        event.preventDefault();
                        setDragOver(index);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (dragFrom.current !== null) move(dragFrom.current, index);
                        dragFrom.current = null;
                        setDragOver(null);
                        setArmed(null);
                      }}
                      onDragEnd={() => {
                        dragFrom.current = null;
                        setDragOver(null);
                        setArmed(null);
                      }}
                      className={cn(
                        "pro-tile mb-2 last:mb-0",
                        // The row being dropped onto, in the app's accent
                        // rather than a grey wash that reads as disabled.
                        dragOver === index && "border-red-500 ring-1 ring-red-500/30",
                        !step.enabled && "opacity-60"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {canWrite && (
                          <button
                            type="button"
                            aria-label={t("list.drag")}
                            title={t("list.drag")}
                            className="cursor-grab text-muted-foreground/60 hover:text-muted-foreground"
                            onPointerDown={() => setArmed(step.key)}
                            onPointerUp={() => setArmed(null)}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        )}

                        <span className="flex size-6 shrink-0 items-center justify-center rounded-[2px] bg-muted text-xs font-semibold text-muted-foreground">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-sm font-medium text-foreground">
                            {step.label || step.labelAr ? (
                              stepTitle(step)
                            ) : (
                              <span className="italic text-muted-foreground">
                                {t("list.noLabel")}
                              </span>
                            )}
                          </p>
                          <p className="m-0 font-mono text-xs text-muted-foreground">
                            {step.stepType}
                            {step.providerCode ? ` · ${step.providerCode}` : ""}
                          </p>
                        </div>

                        {step.mandatory && (
                          <Badge
                            variant="outline"
                            className={cn("border gap-1 font-medium", TONES.sky)}
                            title={t("badge.mandatoryHint")}
                          >
                            <Lock className="h-3 w-3" />
                            {t("badge.mandatory")}
                          </Badge>
                        )}

                        {step.signalWait && (
                          <Badge
                            variant="outline"
                            className={cn("border gap-1 font-medium", TONES.slate)}
                            title={t("field.signalWaitHint")}
                          >
                            <PauseCircle className="h-3 w-3" />
                            {t("badge.signalWait")}
                          </Badge>
                        )}

                        {typeof step.timeoutMinutes === "number" && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {t("badge.timeout", { minutes: step.timeoutMinutes })}
                          </span>
                        )}

                        {!step.enabled && (
                          <Badge
                            variant="outline"
                            className={cn("border font-medium", TONES.slate)}
                          >
                            {t("badge.disabled")}
                          </Badge>
                        )}

                        {/* The lock is driven off the server's `mandatory`, not
                            off a list hardcoded here. */}
                        <Switch
                          checked={step.enabled}
                          disabled={!canWrite || step.mandatory}
                          onCheckedChange={(checked) => patch(step.key, { enabled: checked })}
                          aria-label={
                            step.mandatory ? t("badge.mandatoryHint") : t("common:enable")
                          }
                          title={step.mandatory ? t("badge.mandatoryHint") : undefined}
                        />

                        <div className="flex shrink-0 items-center gap-1">
                          {canWrite && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label={t("list.moveUp")}
                                title={t("list.moveUp")}
                                disabled={index === 0}
                                onClick={() => move(index, index - 1)}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label={t("list.moveDown")}
                                title={t("list.moveDown")}
                                disabled={index === steps.length - 1}
                                onClick={() => move(index, index + 1)}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={isOpen ? t("list.collapse") : t("list.expand")}
                            title={isOpen ? t("list.collapse") : t("list.expand")}
                            onClick={() => setExpanded(isOpen ? null : step.key)}
                          >
                            <ChevronDown
                              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                            />
                          </Button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="pro-tile mb-3 flex flex-col gap-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor={`${step.key}-label`}>{t("field.label")}</Label>
                              <Input
                                id={`${step.key}-label`}
                                className="h-10"
                                value={step.label || ""}
                                disabled={!canWrite}
                                onChange={(e) => patch(step.key, { label: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor={`${step.key}-labelAr`}>{t("field.labelAr")}</Label>
                              <Input
                                id={`${step.key}-labelAr`}
                                className="h-10"
                                dir="rtl"
                                value={step.labelAr || ""}
                                disabled={!canWrite}
                                onChange={(e) => patch(step.key, { labelAr: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`${step.key}-description`}>
                              {t("field.description")}
                            </Label>
                            <Input
                              id={`${step.key}-description`}
                              className="h-10"
                              value={step.description || ""}
                              disabled={!canWrite}
                              onChange={(e) => patch(step.key, { description: e.target.value })}
                            />
                          </div>

                          {/* Gates the backend actually reads. Only two step
                              types have any, and the rest are not dressed up as
                              switches — that would promise effects that do not
                              exist. */}
                          {step.stepType === "PEP_SCREENING" && (
                            <div className="flex flex-col gap-2">
                              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t("gate.section")}
                              </p>
                              <GateSwitch
                                id={`${step.key}-pep`}
                                label={t("gate.pep")}
                                hint={t("gate.pepHint")}
                                checked={readGate(step.configObj, ["pep", "enabled"])}
                                disabled={!canWrite}
                                onChange={(v) => setGate(step, ["pep", "enabled"], v)}
                              />
                              <GateSwitch
                                id={`${step.key}-sanctions`}
                                label={t("gate.sanctions")}
                                hint={t("gate.sanctionsHint")}
                                checked={readGate(step.configObj, ["sanctions", "enabled"])}
                                disabled={!canWrite}
                                onChange={(v) => setGate(step, ["sanctions", "enabled"], v)}
                              />
                              {/* Turning this on refuses onboarding to anyone who
                                  matches. It goes through a confirmation. */}
                              <GateSwitch
                                id={`${step.key}-blockOnHit`}
                                label={t("gate.blockOnHit")}
                                hint={t("gate.blockOnHitHint")}
                                tone="amber"
                                checked={readGate(step.configObj, ["sanctions", "blockOnHit"])}
                                disabled={!canWrite}
                                onChange={(v) => {
                                  if (v) setBlockOnHitFor(step.key);
                                  else setGate(step, ["sanctions", "blockOnHit"], false);
                                }}
                              />
                              <GateSwitch
                                id={`${step.key}-aml`}
                                label={t("gate.aml")}
                                hint={t("gate.amlHint")}
                                checked={readGate(step.configObj, ["aml", "enabled"])}
                                disabled={!canWrite}
                                onChange={(v) => setGate(step, ["aml", "enabled"], v)}
                              />
                              <Notice tone="slate" className="mb-0">
                                {t("gate.outcomeNote")}
                              </Notice>
                              <Notice tone="amber" className="mb-0">
                                {t("note.gateLatency")}
                              </Notice>
                            </div>
                          )}

                          {step.stepType === "ADDITIONAL_INFO" && (
                            <div className="flex flex-col gap-2">
                              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {t("gate.section")}
                              </p>
                              <GateSwitch
                                id={`${step.key}-salary`}
                                label={t("gate.fetchSalary")}
                                hint={t("gate.fetchSalaryHint")}
                                checked={step.configObj.fetchSalary === true}
                                disabled={!canWrite}
                                onChange={(v) => setGate(step, ["fetchSalary"], v)}
                              />
                              <GateSwitch
                                id={`${step.key}-bank`}
                                label={t("gate.requireBank")}
                                hint={t("gate.requireBankHint")}
                                checked={step.configObj.requireBank === true}
                                disabled={!canWrite}
                                onChange={(v) => setGate(step, ["requireBank"], v)}
                              />
                              <Notice tone="amber" className="mb-0">
                                {t("note.gateLatency")}
                              </Notice>
                            </div>
                          )}

                          {/* Advanced: safe to leave alone, so it sits below
                              the labels and the gates rather than beside them. */}
                          <details className="pro-tile">
                            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {t("field.advanced")}
                            </summary>

                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="flex flex-col gap-1.5">
                                <Label htmlFor={`${step.key}-provider`}>
                                  {t("field.provider")}
                                </Label>
                                <Input
                                  id={`${step.key}-provider`}
                                  className="h-10 font-mono text-xs"
                                  value={step.providerCode || ""}
                                  disabled={!canWrite}
                                  onChange={(e) =>
                                    patch(step.key, { providerCode: e.target.value })
                                  }
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <Label htmlFor={`${step.key}-timeout`}>{t("field.timeout")}</Label>
                                <Input
                                  id={`${step.key}-timeout`}
                                  type="number"
                                  min={1}
                                  className="h-10"
                                  value={step.timeoutMinutes ?? 30}
                                  disabled={!canWrite}
                                  onChange={(e) =>
                                    patch(step.key, { timeoutMinutes: Number(e.target.value) })
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-3 flex flex-col gap-2">
                              <GateSwitch
                                id={`${step.key}-signalWait`}
                                label={t("field.signalWait")}
                                hint={t("field.signalWaitHint")}
                                checked={step.signalWait === true}
                                disabled={!canWrite}
                                onChange={(v) => patch(step.key, { signalWait: v })}
                              />
                              <GateSwitch
                                id={`${step.key}-required`}
                                label={t("field.required")}
                                hint={t("field.requiredHint")}
                                checked={step.required !== false}
                                disabled={!canWrite}
                                onChange={(v) => patch(step.key, { required: v })}
                              />
                            </div>

                            {/* Descriptive metadata for every other step type —
                                edited as the JSON it is, not as invented toggles. */}
                            {!isGatedStepType(step.stepType) && (
                              <div className="mt-3 flex flex-col gap-1.5">
                                <Label htmlFor={`${step.key}-config`}>{t("config.raw")}</Label>
                                <Textarea
                                  id={`${step.key}-config`}
                                  rows={3}
                                  className="font-mono text-xs"
                                  dir="ltr"
                                  value={step.configText}
                                  disabled={!canWrite}
                                  onChange={(e) => setConfigText(step, e.target.value)}
                                />
                                <p
                                  className={cn(
                                    "m-0 text-xs",
                                    configInvalid ? "text-red-600" : "text-muted-foreground"
                                  )}
                                >
                                  {configInvalid ? t("config.invalid") : t("config.rawHint")}
                                </p>
                              </div>
                            )}
                          </details>

                          {canWrite && !step.mandatory && (
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                className="gap-2 text-red-600 hover:text-red-700"
                                onClick={() => setRemoving(step)}
                              >
                                <Trash2 className="h-4 w-4" />
                                {t("list.remove")}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            {canWrite && steps.length > 0 && (
              <div className="mt-3 border-t border-border/60 pt-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2" disabled={!availableTypes.length}>
                      <Plus className="h-4 w-4" />
                      {availableTypes.length ? t("list.addStep") : t("list.addStepEmpty")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {availableTypes.map((option) => (
                      <DropdownMenuItem
                        key={option.stepType}
                        onSelect={() => addStep(option)}
                        className="flex flex-col items-start gap-0.5"
                      >
                        <span className="text-sm">{humanizeCode(option.stepType)}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {option.stepType}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {steps.length > 0 && (
            <>
              <Notice tone="slate" className="mt-2">
                {t("note.mandatory")}
              </Notice>
              <Notice tone="slate">{t("note.stepLatency")}</Notice>
            </>
          )}
        </>
      )}

      {/* Turning blocking on refuses onboarding to a matched customer outright.
          That is a compliance decision, and the dialog says so. */}
      <Dialog open={!!blockOnHitFor} onOpenChange={(open) => !open && setBlockOnHitFor(null)}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{t("confirm.blockOnHit.title")}</DialogTitle>
            <DialogDescription>{t("confirm.blockOnHit.body")}</DialogDescription>
          </DialogHeader>
          <Notice tone="amber" className="mb-0">
            {t("confirm.blockOnHit.compliance")}
          </Notice>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setBlockOnHitFor(null)}>
              {t("common:cancel")}
            </Button>
            <Button
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => {
                const step = steps.find((s) => s.key === blockOnHitFor);
                if (step) setGate(step, ["sanctions", "blockOnHit"], true);
                setBlockOnHitFor(null);
              }}
            >
              {t("confirm.blockOnHit.action")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removing is a delete on save, because `PUT` is replace-all. */}
      <Dialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>
              {t("confirm.remove.title", {
                step: removing ? stepTitle(removing) : "",
              })}
            </DialogTitle>
            <DialogDescription>{t("confirm.remove.body")}</DialogDescription>
          </DialogHeader>
          <Notice tone="slate" className="mb-0">
            {t("confirm.remove.hint")}
          </Notice>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              {t("common:cancel")}
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => removing && removeStep(removing)}
            >
              {t("confirm.remove.action")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnboardingStepConfig;
