import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Wallet as WalletIcon,
  Lock,
  RefreshCw,
  CircleDot,
  FileText,
  Camera,
  ZoomIn,
  X,
  Phone,
  Mail,
  Hash,
  CreditCard,
  CalendarDays,
  Clock,
  User,
  Contact,
  ArrowLeftRight,
  TrendingUp,
  Gauge,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, Tab } from "react-bootstrap";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { cn } from "../../../lib/utils";
import { useLanguage } from "../../../hooks/use-language";
import { getOnboarding360, getOnboardingDocumentImage } from "../../../redux/apis/apisCrud";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatMoney = (value: any, currency?: string) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return `${currency ? currency + " " : ""}0.00`;
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TONES: Record<string, string> = {
  emerald:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  amber:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  sky: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  orange:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
  red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  slate:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
};

const statusTone = (status?: string): string => {
  switch ((status || "").toUpperCase()) {
    case "ACTIVE":
    case "COMPLETED":
    case "APPROVED":
    case "VERIFIED":
    case "SUCCESS":
      return "emerald";
    case "PENDING":
    case "PENDING_ACTIVATION":
    case "IN_PROGRESS":
      return "amber";
    case "FROZEN":
      return "sky";
    case "SUSPENDED":
      return "orange";
    case "FAILED":
    case "REJECTED":
    case "CLOSED":
    case "BLOCKED":
      return "red";
    default:
      return "slate";
  }
};

const riskTone = (level?: string): string => {
  switch ((level || "").toUpperCase()) {
    case "LOW":
      return "emerald";
    case "MEDIUM":
      return "amber";
    case "HIGH":
    case "CRITICAL":
      return "red";
    default:
      return "slate";
  }
};

const TONE_HEX: Record<string, string> = {
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  sky: "#0ea5e9",
  slate: "#94a3b8",
};

const StatusBadge = ({ status, className }: { status?: string; className?: string }) => (
  <Badge variant="outline" className={cn("border font-medium", TONES[statusTone(status)], className)}>
    {status || "—"}
  </Badge>
);

const chartTooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 12,
  boxShadow: "var(--surface-elevation-2, 0 4px 12px rgba(0,0,0,0.12))",
};

/* Label / value row */
const Field = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="-mx-2 flex items-center justify-between gap-4 rounded-md border-b border-border/60 px-2 py-2.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span
      className={cn(
        "min-w-0 break-words text-end font-medium text-foreground",
        mono && "font-mono text-xs"
      )}
    >
      {value ?? "—"}
    </span>
  </div>
);

/* Section title inside a tab */
const Block = ({ title, right, children, className, icon: Icon }: any) => (
  <div
    className={cn(
      "onb-card relative overflow-hidden rounded-xl border p-4 transition-shadow duration-200 hover:shadow-md md:p-5",
      className
    )}
  >
    {/* Soft emerald glow accent — consistent across all cards */}
    <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-emerald-500/[0.07] blur-2xl" />
    <div className="relative mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
            <Icon className="size-4" />
          </span>
        )}
        <h3 className="m-0 text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
      {right}
    </div>
    <div className="relative">{children}</div>
  </div>
);

const CopyButton = ({ text }: { text?: string }) => {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Copy"
    >
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
    </button>
  );
};

const EmptyState = ({ icon: Icon, text }: any) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
    <Icon className="size-8 text-muted-foreground/40" />
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Header band (single, not floating cards)                            */
/* ------------------------------------------------------------------ */

const HeaderBand = ({ customer, countryConfig, isAr }: any) => {
  if (!customer) return null;
  const flag = countryConfig?.flagEmoji || "";
  const nationality = isAr
    ? countryConfig?.nationalityAr || customer.nationality
    : countryConfig?.nationalityEn || customer.nationality || "—";
  const displayName = isAr
    ? `${customer.firstNameAr || ""} ${customer.lastNameAr || ""}`.trim() || customer.fullName
    : customer.fullName || `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
  const initials = (customer.firstName?.[0] || "") + (customer.lastName?.[0] || "");

  const details = [
    { icon: Hash, label: "CIF Number", value: customer.cifNumber },
    {
      icon: CreditCard,
      label: customer.nationalIdType || "National ID",
      value: customer.nationalId,
    },
    { icon: Phone, label: "Mobile", value: customer.mobileNumber },
    { icon: Mail, label: "Email", value: customer.email },
    { icon: CalendarDays, label: "Date of Birth", value: formatDate(customer.dateOfBirth) },
    { icon: Clock, label: "Onboarded", value: formatDate(customer.createdAt) },
  ].filter((d) => d.value && d.value !== "—");

  return (
    <div className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent" />
      <div className="relative flex flex-col gap-6 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        {/* Identity */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-semibold text-white ring-2 ring-emerald-500/25 shadow-md shadow-emerald-500/20 sm:size-14 sm:text-lg">
            {customer.profilePicture ? (
              <img src={customer.profilePicture} alt={displayName} className="size-full object-cover" />
            ) : (
              initials.toUpperCase() || <CircleDot className="size-6" />
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="m-0 max-w-full truncate text-start text-sm font-semibold leading-tight text-foreground">
                {displayName || "—"}
              </h2>
              {flag && <span className="text-base leading-none">{flag}</span>}
              <span className="text-sm text-muted-foreground">{nationality}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 [&_[data-slot=badge]]:text-[10px] [&_[data-slot=badge]]:px-2 [&_[data-slot=badge]]:py-0">
              {customer.lifecycleStage && (
                <Badge variant="outline" className={cn("border font-medium", TONES.sky)}>
                  {customer.lifecycleStage}
                </Badge>
              )}
              {/* {customer.kycStatus && <StatusBadge status={customer.kycStatus} />} */}
              {customer.riskGrade && (
                <Badge variant="outline" className={cn("border font-medium", TONES[riskTone(customer.riskGrade)])}>
                  Risk {customer.riskGrade}
                </Badge>
              )}
              {customer.pepFlag && (
                <Badge variant="outline" className={cn("border font-medium", TONES.amber)}>
                  PEP
                </Badge>
              )}
              {customer.sanctionsFlag && (
                <Badge variant="outline" className={cn("border font-medium", TONES.red)}>
                  Sanctioned
                </Badge>
              )}
              {customer.isBlocked && (
                <Badge variant="outline" className={cn("gap-1 border font-medium", TONES.red)}>
                  <Lock className="size-3" /> Blocked
                  {Array.isArray(customer.blockCodes) && customer.blockCodes.length > 0
                    ? ` · ${customer.blockCodes.join(", ")}`
                    : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Detail grid — fills the right side */}
        <div className="grid w-full grid-cols-1 gap-x-6 gap-y-4 min-[420px]:grid-cols-2 sm:gap-x-8 lg:w-auto lg:flex-1 lg:grid-cols-3 xl:max-w-3xl">
          {details.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.label} className="flex w-full min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {d.label}
                  </div>
                  <div className="truncate text-xs font-semibold text-foreground" title={d.value}>
                    {d.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Onboarding stepper                                                  */
/* ------------------------------------------------------------------ */

const Stepper = ({ onboarding, isAr }: any) => {
  const steps: any[] = onboarding?.steps || [];

  return (
    <div className="px-4 py-3 md:px-5">
      {onboarding?.failureReason && (
        <div className={cn("mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", TONES.red)}>
          <AlertTriangle className="size-4 shrink-0" />
          {onboarding.failureReason}
        </div>
      )}

      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No onboarding steps available.</p>
      ) : (
        /* Each step is an equal-width column so its label is bounded by the
           column (wraps, never overlaps the neighbour) — no horizontal scroll.
           Connectors are absolute lines drawn from each circle's centre to the
           next, sitting behind the circles. */
        <div className="relative flex items-start">
          {steps.map((step: any, idx: number) => {
            const status = (step.status || "PENDING").toUpperCase();
            const isFirst = idx === 0;
            const done = status === "COMPLETED";
            const current = status === "CURRENT";
            const failed = status === "FAILED";
            const prevDone =
              idx > 0 &&
              (steps[idx - 1]?.status || "PENDING").toUpperCase() === "COMPLETED";
            const circle = done
              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
              : failed
              ? "border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/30"
              : current
              ? "border-emerald-500 text-emerald-600 ring-4 ring-emerald-500/15"
              : "border-border text-muted-foreground";
            return (
              <div
                key={step.step ?? idx}
                className="relative flex min-w-0 flex-1 flex-col items-center"
              >
                {/* Connector from the previous circle's centre to this one. */}
                {!isFirst && (
                  <div
                    className={cn(
                      "onb-connector absolute top-5 right-1/2 left-[-50%] z-0 h-0.5 rounded-full transition-colors duration-500",
                      prevDone ? "bg-emerald-500" : "bg-border"
                    )}
                    style={{ animationDelay: `${idx * 0.18 + 0.1}s` }}
                  />
                )}
                <div
                  className={cn(
                    "onb-step-circle relative z-10 flex size-10 items-center justify-center rounded-full border-2 bg-background transition-all duration-300",
                    circle
                  )}
                  style={{ animationDelay: `${idx * 0.18}s` }}
                >
                  {done ? (
                    <Check className="size-5" strokeWidth={3} />
                  ) : failed ? (
                    <AlertTriangle className="size-5" />
                  ) : (
                    <span className="text-sm font-semibold">{idx + 1}</span>
                  )}
                </div>
                <div className="mt-2 w-full px-1 text-center leading-tight">
                  <div className="onb-label" style={{ animationDelay: `${idx * 0.18 + 0.15}s` }}>
                    <span
                      className={cn(
                        "block break-words text-xs",
                        done || current
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground"
                      )}
                    >
                      {isAr ? step.labelAr || step.label : step.label}
                    </span>
                    {step.occurredAt && (
                      <div className="text-[10px] text-muted-foreground">
                        {formatDate(step.occurredAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Risk gauge (reused in overview + risk tab)                          */
/* ------------------------------------------------------------------ */

const RiskGauge = ({ risk }: any) => {
  const score = Number(risk?.riskScore ?? 0);
  const tone = riskTone(risk?.riskLevel);
  const color = TONE_HEX[tone];
  const gaugeData = [{ name: "score", value: Math.min(100, score), fill: color }];
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="72%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "var(--muted)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {risk?.riskScore != null ? score : "—"}
          </span>
          <span className="text-xs text-muted-foreground">Risk Score</span>
        </div>
      </div>
      <Badge variant="outline" className={cn("mt-1 border font-medium", TONES[tone])}>
        {risk?.riskLevel || "Not assessed"}
      </Badge>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {risk?.riskGrade && <span>Grade {risk.riskGrade}</span>}
        {risk?.complianceStatus && <span>{risk.complianceStatus}</span>}
        {risk?.isPep && <span className="font-medium text-amber-500">PEP</span>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Document / selfie image (lazy-loaded via auth'd API client)         */
/* ------------------------------------------------------------------ */

const DocImage = ({
  imagePath,
  label,
  onEnlarge,
}: {
  imagePath?: string;
  label: string;
  onEnlarge?: (src: string, label: string) => void;
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!imagePath) {
      setErr(true);
      return;
    }
    let alive = true;
    setErr(false);
    setSrc(null);
    getOnboardingDocumentImage(imagePath)
      .then((res: any) => {
        const d = res?.data?.data ?? res?.data;
        if (alive && d?.base64Image) {
          setSrc(`data:${d.contentType || "image/jpeg"};base64,${d.base64Image}`);
        } else if (alive) {
          setErr(true);
        }
      })
      .catch(() => alive && setErr(true));
    return () => {
      alive = false;
    };
  }, [imagePath]);

  if (err)
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
        Failed to load {label}
      </div>
    );
  if (!src) return <Skeleton className="h-48 w-full rounded-lg" />;
  return (
    <button
      type="button"
      onClick={() => onEnlarge?.(src, label)}
      className="group relative block w-full overflow-hidden rounded-lg border"
    >
      <img src={src} alt={label} loading="lazy" className="h-48 w-full bg-muted object-cover transition-transform duration-200 group-hover:scale-105" />
      <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/45 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        <ZoomIn className="size-4" /> Click to enlarge
      </span>
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const LoadingState = () => (
  <Card className="gap-0 overflow-hidden py-0">
    <Skeleton className="h-28 w-full rounded-none" />
    <div className="p-5">
      <Skeleton className="mb-4 h-9 w-80" />
      <Skeleton className="h-72 w-full" />
    </div>
  </Card>
);

const Onboarding360 = () => {
  const params = useParams();
  const customerId = params.id || params.customerId;
  const navigate = useNavigate();
  const { isRTL, currentLanguage } = useLanguage();
  const isAr = currentLanguage?.code === "ar";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      if (!customerId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await getOnboarding360(customerId);
        if (!active) return;
        setData(response?.data?.data ?? null);
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.message || err?.message || "Failed to load onboarding data");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [customerId, reloadKey]);

  const customer = data?.customer;
  const wallet = data?.wallet;
  const risk = data?.risk;
  const kyc = data?.kyc;
  const onboarding = data?.onboarding;
  const transactions: any[] = data?.transactions || [];
  const documents: any[] = data?.documents || [];
  const selfie = data?.selfie;
  const hasWallet = wallet && wallet.hasWallet !== false;
  const currency = wallet?.currency || "";
  const limits = wallet?.limits || {};

  const limitChartData = useMemo(
    () => [
      { name: "Today", Spent: Number(limits.todaySpent ?? 0), Limit: Number(limits.dailyLimit ?? 0) },
      { name: "Week", Spent: Number(limits.weekSpent ?? 0), Limit: Number(limits.weeklyLimit ?? 0) },
      { name: "Month", Spent: Number(limits.monthSpent ?? 0), Limit: Number(limits.monthlyLimit ?? 0) },
      { name: "Year", Spent: Number(limits.yearSpent ?? 0), Limit: Number(limits.yearlyLimit ?? 0) },
    ],
    [limits]
  );

  const txnSummary = useMemo(() => {
    let credit = 0;
    let debit = 0;
    transactions.forEach((t) => {
      const amt = Number(t.amount ?? 0);
      if ((t.direction || "").toUpperCase() === "CREDIT") credit += amt;
      else debit += amt;
    });
    return [
      { name: "Money In", value: credit, fill: "#10b981" },
      { name: "Money Out", value: debit, fill: "#ef4444" },
    ];
  }, [transactions]);

  const personalRows = customer
    ? [
        { label: "Full Name", value: customer.fullName },
        { label: "Date of Birth", value: formatDate(customer.dateOfBirth) },
        { label: "Gender", value: customer.gender },
        { label: "Nationality", value: customer.nationality },
        { label: "Residency", value: customer.residencyType },
        { label: "Customer Type", value: customer.customerType },
      ]
    : [];

  const contactRows = customer
    ? [
        { label: "Mobile", value: customer.mobileNumber },
        { label: "Email", value: customer.email },
        { label: customer.nationalIdType || "National ID", value: customer.nationalId },
        { label: "CIF Number", value: customer.cifNumber },
        { label: "Created", value: formatDate(customer.createdAt) },
        { label: "Updated", value: formatDate(customer.updatedAt) },
      ]
    : [];

  const kycRows = kyc
    ? [
        { label: "KYC Status", value: kyc.kycStatus },
        { label: "Document Type", value: kyc.documentType },
        { label: "Face Match Score", value: kyc.faceMatchScore != null ? `${kyc.faceMatchScore}` : "—" },
        { label: "Document Verified", value: kyc.documentVerified ? "Yes" : "No" },
        { label: "Selfie Verified", value: kyc.selfieVerified ? "Yes" : "No" },
        { label: "PIN Set", value: kyc.pinSet ? "Yes" : "No" },
        { label: "Biometrics", value: kyc.biometricsEnabled ? "Enabled" : "Disabled" },
      ]
    : [];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="onb360-page flex flex-col gap-4 p-4 md:p-6">
      {/* Match all cards on this page to the project's theme (surface tokens +
          subtle emerald-tinted border, like the dashboard/table cards). */}
      <style>{`
        .onb360-page [data-slot="card"],
        .onb360-page .onb-card {
          background-color: var(--surface-card) !important;
          background-image: none !important;
          border-color: color-mix(in srgb, #10b981 16%, var(--surface-border)) !important;
          color: var(--foreground) !important;
        }
        .onb360-page [data-slot="card"] {
          box-shadow: 0 1px 2px rgba(16,185,129,0.05),
                      0 8px 20px -16px color-mix(in srgb, #10b981 35%, transparent) !important;
        }
        /* Stepper card: no background / border / shadow — sits flat on the page */
        .onb360-page .stepper-card[data-slot="card"] {
          background-color: transparent !important;
          background-image: none !important;
          border-color: transparent !important;
          box-shadow: none !important;
        }
        /* A global heading rule oversizes h2/h3 — force this page's headings to
           sensible sizes (Tailwind text-base / text-sm get overridden otherwise). */
        .onb360-page h1 { font-size: 1.125rem !important; line-height: 1.3 !important; margin: 0 !important; }
        .onb360-page h2 { font-size: 0.875rem !important; line-height: 1.3 !important; margin: 0 !important; }
        .onb360-page h3 { font-size: 0.875rem !important; line-height: 1.3 !important; margin: 0 !important; }
        .onb360-page h4 { font-size: 0.8125rem !important; line-height: 1.3 !important; margin: 0 !important; }

        /* Stepper entrance animation — staggered, professional reveal */
        @keyframes onbStepPop {
          0%   { opacity: 0; transform: scale(0.4); }
          60%  { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes onbConnGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes onbLabelIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .onb360-page .onb-step-circle {
          animation: onbStepPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          /* Must sit above the connector lines (which also animate a transform,
             creating their own stacking context) so the line never covers the
             tick. Higher than the connector's z-0. */
          z-index: 1;
          }
        .onb360-page .onb-connector {
          transform-origin: left center;
          animation: onbConnGrow 0.45s ease-out both;
        }
        .onb360-page[dir="rtl"] .onb-connector { transform-origin: right center; }
        .onb360-page .onb-label {
          animation: onbLabelIn 0.4s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .onb360-page .onb-step-circle,
          .onb360-page .onb-connector,
          .onb360-page .onb-label { animation: none !important; }
        }
      `}</style>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <AlertTriangle className="size-8 text-red-500" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              Retry
            </Button>
          </div>
        </Card>
      ) : !data ? (
        <Card>
          <div className="py-14 text-center text-sm text-muted-foreground">No data available for this customer.</div>
        </Card>
      ) : (
        <>
          {/* Onboarding progress — its own (transparent) card */}
          <Card className="stepper-card overflow-hidden py-0">
            <Stepper onboarding={onboarding} isAr={isAr} />
          </Card>

          {/* Customer info + tabs — its own card */}
          <Card className="gap-0 overflow-hidden py-0">
            <HeaderBand customer={customer} countryConfig={data.countryConfig} isAr={isAr} />

            <div className="flex flex-col gap-4 p-4 md:p-5">
            {/* Key graphs — always visible, independent of tabs */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Block title="Risk Score" icon={ShieldAlert}>
                <RiskGauge risk={risk} />
              </Block>
              <Block title="Money In vs Money Out" icon={ArrowLeftRight}>
                {transactions.length === 0 ? (
                  <EmptyState icon={ArrowDownLeft} text="No transactions yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={txnSummary} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <ReTooltip contentStyle={chartTooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v: any) => formatMoney(v, currency)} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={90}>
                        {txnSummary.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Block>
            </div>

            <Tabs
              id="onb360-tabs"
              activeKey={activeTab}
              onSelect={(k: any) => setActiveTab(k || "overview")}
              className="mb-4"
            >
              {/* ---------------- Overview ---------------- */}
              <Tab eventKey="overview" title="Overview">
                {activeTab === "overview" && (
                  <div className="flex flex-col gap-4 pt-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Block title="Personal Information" icon={User}>
                  {personalRows.map((r) => (
                    <Field key={r.label} label={r.label} value={r.value || "—"} />
                  ))}
                </Block>
                <Block title="Contact & Identity" icon={Contact}>
                  {contactRows.map((r) => (
                    <Field key={r.label} label={r.label} value={r.value || "—"} />
                  ))}
                </Block>
              </div>
                  </div>
                )}
              </Tab>

              {/* ---------------- Wallet ---------------- */}
              <Tab eventKey="wallet" title="Wallet">
                {activeTab === "wallet" && (
                  <div className="flex flex-col gap-4 pt-4">
              {!hasWallet ? (
                <Block title="Wallet" icon={WalletIcon}>
                  <EmptyState icon={WalletIcon} text="No wallet provisioned for this customer." />
                </Block>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Block title="Balance" icon={WalletIcon} right={<StatusBadge status={wallet.status} />}>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Total Balance
                      </span>
                      <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                        {formatMoney(wallet.totalBalance, currency)}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Available
                          </div>
                          <div className="mt-1 text-sm font-semibold text-foreground">
                            {formatMoney(wallet.availableBalance, currency)}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="size-2 rounded-full bg-amber-500" />
                            Reserved
                          </div>
                          <div className="mt-1 text-sm font-semibold text-foreground">
                            {formatMoney(wallet.reservedBalance, currency)}
                          </div>
                        </div>
                      </div>
                    </Block>
                    <Block title="Account Details" icon={CreditCard} className="lg:col-span-2">
                      <Field label="IBAN" value={<span className="inline-flex items-center gap-1">{wallet.iban || "—"}<CopyButton text={wallet.iban} /></span>} mono />
                      <Field label="Account No." value={<span className="inline-flex items-center gap-1">{wallet.accountNumber || "—"}<CopyButton text={wallet.accountNumber} /></span>} mono />
                      <Field label="Wallet Number" value={wallet.walletNumber || "—"} mono />
                      <Field label="Currency" value={currency || "—"} />
                    </Block>
                  </div>

                  <Block title="Spending Limits (Spent vs Limit)" icon={Gauge}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={limitChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <ReTooltip contentStyle={chartTooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v: any) => formatMoney(v, currency)} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Limit" fill="var(--muted-foreground)" radius={[5, 5, 0, 0]} maxBarSize={28} fillOpacity={0.35} />
                        <Bar dataKey="Spent" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Block>
                </>
              )}
                  </div>
                )}
              </Tab>

              {/* ---------------- Transactions ---------------- */}
              <Tab eventKey="transactions" title="Transactions">
                {activeTab === "transactions" && (
                  <div className="flex flex-col gap-4 pt-4">
              {transactions.length === 0 ? (
                <Block title="Transactions" icon={ArrowLeftRight}>
                  <EmptyState icon={ArrowDownLeft} text="No transactions yet." />
                </Block>
              ) : (
                  <Block title="Recent Transactions" icon={ArrowLeftRight} right={<span className="text-xs text-muted-foreground">{transactions.length} total</span>}>
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader
                          style={{ background: "var(--theme-table-background-color)" }}
                        >
                          <TableRow className="border-0 hover:bg-transparent [&>th]:h-9 [&>th]:px-4 [&>th]:text-[12px] [&>th]:font-semibold [&>th]:tracking-[0.2px] [&>th]:text-white">
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Counterparty</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Note</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((tx, idx) => {
                            const isCredit = (tx.direction || "").toUpperCase() === "CREDIT";
                            return (
                              <TableRow
                                key={tx.id ?? tx.movementId ?? idx}
                                className="border-b border-[var(--surface-border)] odd:bg-[var(--theme-table-row-alt)] hover:bg-[var(--theme-table-row-hover)] [&>td]:px-4 [&>td]:py-2 [&>td]:text-[12px]"
                              >
                                <TableCell className="text-muted-foreground">{formatDateTime(tx.timestamp)}</TableCell>
                                <TableCell className="font-medium">{tx.type || "—"}</TableCell>
                                <TableCell className="text-right">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 font-semibold",
                                      isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                    )}
                                  >
                                    {isCredit ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                                    {formatMoney(tx.amount)}
                                  </span>
                                </TableCell>
                                <TableCell>{tx.counterpartyName || "—"}</TableCell>
                                <TableCell>
                                  <StatusBadge status={tx.status} />
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-muted-foreground">{tx.purposeNote || "—"}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </Block>
              )}
                  </div>
                )}
              </Tab>

              {/* ---------------- Risk & KYC ---------------- */}
              <Tab eventKey="risk" title="Risk & KYC">
                {activeTab === "risk" && (
                  <div className="flex flex-col gap-4 pt-4">
              <Block title="Score Trend" icon={TrendingUp}>
                  {(risk?.history || []).length === 0 ? (
                    <EmptyState icon={ShieldAlert} text="No risk assessment yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={risk.history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => formatDate(v)} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                        <ReTooltip contentStyle={chartTooltipStyle} labelFormatter={(v) => formatDate(v as string)} />
                        <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Block>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Block title="Score Breakdown" icon={BarChart3}>
                  {(risk?.breakdown || []).length === 0 ? (
                    <EmptyState icon={ShieldAlert} text="No breakdown available." />
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={risk.breakdown} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="category" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={0} angle={-15} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                        <ReTooltip contentStyle={chartTooltipStyle} cursor={{ fill: "var(--muted)" }} />
                        <Bar dataKey="scoreContribution" fill="var(--chart-2, #14b8a6)" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Block>

                <Block title="KYC Details" icon={ShieldCheck}>
                  {kycRows.length === 0 ? (
                    <EmptyState icon={ShieldAlert} text="No KYC information." />
                  ) : (
                    kycRows.map((r) => <Field key={r.label} label={r.label} value={r.value} />)
                  )}
                </Block>
              </div>
                  </div>
                )}
              </Tab>

              {/* ---------------- Documents ---------------- */}
              <Tab eventKey="documents" title="Documents">
                {activeTab === "documents" && (
                  <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-3">
                    <Block title="Identity Documents" icon={FileText} className="lg:col-span-2">
                      {documents.length === 0 ? (
                        <EmptyState icon={FileText} text="No documents available." />
                      ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {documents.map((doc, idx) => (
                            <div
                              key={doc.documentId ?? idx}
                              className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="outline" className={cn("border font-medium", TONES.sky)}>
                                  {doc.kind || "DOCUMENT"}
                                </Badge>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <CalendarDays className="size-3" />
                                  {formatDate(doc.createdAt)}
                                </span>
                              </div>
                              <DocImage imagePath={doc.imagePath} label={doc.kind || "Document"} onEnlarge={(s, l) => setLightbox({ src: s, label: l })} />
                              <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
                                <span className="text-muted-foreground">Document No.</span>
                                <span className="font-mono font-medium text-foreground">{doc.documentNumber || "—"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Block>

                    <Block title="Selfie" icon={Camera}>
                      {selfie ? (
                        <div className="w-full">
                          <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md">
                            <DocImage imagePath={selfie.imagePath} label="Selfie" onEnlarge={(s, l) => setLightbox({ src: s, label: l })} />
                            {kyc?.selfieVerified != null && (
                              <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
                                <span className="text-muted-foreground">Verification</span>
                                <Badge
                                  variant="outline"
                                  className={cn("border font-medium", kyc.selfieVerified ? TONES.emerald : TONES.amber)}
                                >
                                  {kyc.selfieVerified ? "Verified" : "Pending"}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <EmptyState icon={Camera} text="Selfie not captured for this customer" />
                      )}
                    </Block>
                  </div>
                )}
              </Tab>
            </Tabs>
          </div>
          </Card>
        </>
      )}

      {/* Lightbox — portaled to body so the overlay also covers the sidebar */}
      {lightbox &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4"
            onClick={() => setLightbox(null)}
          >
            <div className="relative max-h-[90vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute -right-3 -top-3 flex size-8 items-center justify-center rounded-full bg-background text-foreground shadow-md ring-1 ring-border"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
              <img src={lightbox.src} alt={lightbox.label} className="max-h-[90vh] max-w-full rounded-lg object-contain" />
              <div className="mt-2 text-center text-sm font-medium text-white">{lightbox.label}</div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Onboarding360;
