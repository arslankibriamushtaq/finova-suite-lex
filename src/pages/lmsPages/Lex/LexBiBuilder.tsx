import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Ban, Check, Play, Save, Wand2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { PermissionDenied } from "../../../components/shared/detailKit";
import { LexNotice, LexPageHeader } from "../../../components/shared/lexKit";
import { cn } from "../../../lib/utils";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  getBuilderOptions,
  granularityRequired,
  previewReport,
  saveReport,
  visualizationRefusal,
  type LexBuilderOptions,
  type LexDataSourceOption,
  type LexReportResult,
} from "../../../redux/apis/apisLexBi";
import LexReportRenderer from "./LexReportRenderer";

/**
 * One step's option list. A disabled option keeps its reason on screen rather
 * than vanishing — a silently missing entry is one the user cannot ask about.
 */
const OptionGrid = ({
  options,
  value,
  onSelect,
  reasonFor,
}: {
  options: string[];
  value?: string;
  onSelect: (key: string) => void;
  reasonFor?: (option: string) => string | null;
}) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
    {options.map((option) => {
      const blockedReason = reasonFor?.(option) || null;
      const disabled = !!blockedReason;
      return (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className={cn(
            "pro-tile text-start transition-colors",
            value === option
              ? "border-emerald-500 ring-1 ring-emerald-500/30"
              : "hover:border-emerald-500/40",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            {disabled && <Ban className="h-3.5 w-3.5" />}
            {option}
          </span>
          {blockedReason && (
            <span className="mt-1 block text-xs text-muted-foreground">{blockedReason}</span>
          )}
        </button>
      );
    })}
  </div>
);

/** Data sources are the one list that carries its own availability. */
const DataSourceGrid = ({
  options,
  value,
  onSelect,
}: {
  options: LexDataSourceOption[];
  value?: string;
  onSelect: (key: string) => void;
}) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        disabled={!option.available}
        onClick={() => onSelect(option.value)}
        className={cn(
          "pro-tile text-start transition-colors",
          value === option.value
            ? "border-emerald-500 ring-1 ring-emerald-500/30"
            : "hover:border-emerald-500/40",
          !option.available && "cursor-not-allowed opacity-60"
        )}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          {!option.available && <Ban className="h-3.5 w-3.5" />}
          {option.value}
        </span>
        {/* An empty chart is not the same as an empty population, which is what
            the reason says. */}
        {option.unavailableReason && (
          <span className="mt-1 block text-xs text-muted-foreground">
            {option.unavailableReason}
          </span>
        )}
      </button>
    ))}
  </div>
);

/**
 * The five-step report builder.
 *
 * Every step is driven by `GET /reports/builder/options?dataSource=` — nothing
 * here hardcodes an option list, because the server narrows dimensions and
 * measures to the chosen source and offering a combination it then rejects
 * teaches people not to trust the wizard.
 *
 * The two structural refusals are mirrored in the picker rather than left to
 * the API: LINE needs a DATE breakdown, and PIE cannot show an average or a
 * median. Preview and save validate identically, so a clean preview guarantees
 * a clean save.
 */
const LexBiBuilder = () => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.BI_READ);
  const canWrite = can(LEX_PERMISSIONS.BI_WRITE);

  const [options, setOptions] = useState<LexBuilderOptions>({
    dataSources: [],
    dimensions: [],
    measures: [],
    granularities: [],
    visualizations: [],
  });
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  const [dataSource, setDataSource] = useState("");
  const [dimension, setDimension] = useState("");
  const [granularity, setGranularity] = useState("");
  const [measure, setMeasure] = useState("");
  const [visualization, setVisualization] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [preview, setPreview] = useState<LexReportResult | null>(null);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "LEX.BI.REPORT_NAME_TAKEN": t("bi.err.nameTaken"),
    }),
    [t]
  );

  // Reloaded whenever the source changes: the narrowed lists are the point.
  useEffect(() => {
    if (!canRead) return;
    getBuilderOptions(dataSource || undefined)
      .then(setOptions)
      .catch((error) => toast.error(lexErrorMessage(error, t("bi.toast.optionsFailed"), errorsByCode)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, canRead]);

  const needsGranularity = granularityRequired(dimension);

  const onPreview = async () => {
    if (!dataSource || !dimension || !measure || !visualization) {
      return toast.error(t("bi.valid.incomplete"));
    }
    if (needsGranularity && !granularity) return toast.error(t("bi.valid.granularity"));

    setBusy(true);
    try {
      setPreview(
        await previewReport({
          dataSource,
          dimension,
          measure,
          visualization,
          // Required for a DATE breakdown, refused for a categorical one.
          granularity: needsGranularity ? granularity : null,
        })
      );
      setStep(5);
    } catch (error) {
      logForbidden(error, "POST /bi/preview");
      toast.error(lexErrorMessage(error, t("bi.toast.previewFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    if (!name.trim()) return toast.error(t("bi.valid.name"));
    setBusy(true);
    try {
      const saved = await saveReport({
        name: name.trim(),
        description: description.trim() || undefined,
        dataSource,
        dimension,
        measure,
        visualization,
        granularity: needsGranularity ? granularity : null,
        // Personal until the author shares it from My Reports.
        visibility: "PERSONAL",
      });
      toast.success(t("bi.toast.saved"));
      navigate(`/LOS/Lex/Bi/Report/${saved.id}`);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("bi.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  if (!canRead) return <PermissionDenied />;
  if (!canWrite) return <PermissionDenied message={t("bi.builderNoWrite")} />;

  const STEPS = [
    t("bi.step.source"),
    t("bi.step.dimension"),
    t("bi.step.measure"),
    t("bi.step.visualization"),
    t("bi.step.preview"),
  ];

  return (
    <div className="service">
      <LexPageHeader icon={Wand2} title={t("bi.builderTitle")} subtitle={t("bi.builderSubtitle")}>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/LOS/Lex/Bi")}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("bi.backToGallery")}
        </Button>
      </LexPageHeader>

      <ol className="pro-card mb-3 flex list-none items-center gap-2 p-3">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const done = step > number;
          const current = step === number;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2 last:flex-none">
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => setStep(number)}
                className="flex min-w-0 items-center gap-2 rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    done || current
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground ring-1 ring-border"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : number}
                </span>
                <span
                  className={cn(
                    "truncate text-xs",
                    current ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </button>
              {number < STEPS.length && (
                <span aria-hidden className="h-px min-w-4 flex-1 bg-border" />
              )}
            </li>
          );
        })}
      </ol>

      <div className="pro-card p-4">
        {step === 1 && (
          <DataSourceGrid
            options={options.dataSources}
            value={dataSource}
            onSelect={(k) => {
              setDataSource(k);
              // The server narrows dimensions and measures per source, so the
              // later choices are cleared rather than carried across.
              setDimension("");
              setGranularity("");
              setMeasure("");
              setVisualization("");
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <>
            <OptionGrid
              options={options.dimensions}
              value={dimension}
              onSelect={(k) => {
                setDimension(k);
                if (!granularityRequired(k)) setGranularity("");
              }}
            />
            {/* Granularity appears only for a DATE dimension, and is then required. */}
            {needsGranularity && (
              <div className="mt-4">
                <Label className="mb-2 block">{t("bi.field.granularity")} *</Label>
                <OptionGrid
                  options={options.granularities}
                  value={granularity}
                  onSelect={setGranularity}
                />
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                className="wallet-brand-btn"
                onClick={() => setStep(3)}
                disabled={!dimension || (needsGranularity && !granularity)}
              >
                {t("common:next")}
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <OptionGrid options={options.measures} value={measure} onSelect={setMeasure} />
            <div className="mt-4 flex justify-end">
              <Button className="wallet-brand-btn" onClick={() => setStep(4)} disabled={!measure}>
                {t("common:next")}
              </Button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <OptionGrid
              options={options.visualizations}
              value={visualization}
              onSelect={setVisualization}
              reasonFor={(option) => {
                const refusal = visualizationRefusal(option, dimension, measure);
                if (!refusal) return null;
                return refusal === "line" ? t("bi.rule.lineNeedsDate") : t("bi.rule.pieNeedsWhole");
              }}
            />
            <div className="mt-4 flex justify-end">
              <Button
                className="wallet-brand-btn gap-2"
                onClick={onPreview}
                disabled={!visualization || busy}
              >
                <Play className="h-4 w-4" />
                {t("bi.preview")}
              </Button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <LexNotice tone="slate">{t("bi.previewGuarantee")}</LexNotice>
            {preview && <LexReportRenderer report={preview} />}
            <div className="mt-4 flex flex-wrap items-end justify-end gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bi-name">{t("bi.field.name")}</Label>
                <Input
                  id="bi-name"
                  className="h-10 w-64"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bi-desc">{t("bi.field.description")}</Label>
                <Input
                  id="bi-desc"
                  className="h-10 w-72"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button className="wallet-brand-btn gap-2" onClick={onSave} disabled={busy}>
                <Save className="h-4 w-4" />
                {t("common:save")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LexBiBuilder;
