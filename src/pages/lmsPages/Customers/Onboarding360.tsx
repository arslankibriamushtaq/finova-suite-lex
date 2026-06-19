import { useEffect, useMemo, useState } from "react";
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
import { getOnboarding360 } from "../../../redux/apis/apisCrud";

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
  <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 text-sm last:border-b-0">
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
const Block = ({ title, right, children, className }: any) => (
  <div className={cn("rounded-xl border bg-card p-4 md:p-5", className)}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="m-0 text-sm font-semibold text-foreground">{title}</h3>
      {right}
    </div>
    {children}
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

  return (
    <div className="relative overflow-hidden border-b">
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent" />
      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-xl font-semibold text-muted-foreground ring-2 ring-emerald-500/20 shadow-sm">
          {customer.profilePicture ? (
            <img src={customer.profilePicture} alt={displayName} className="size-full object-cover" />
          ) : (
            initials || <CircleDot className="size-6" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-start text-lg font-semibold leading-tight text-foreground">
              {displayName || "—"}
            </h2>
            {flag && <span className="text-xl leading-none">{flag}</span>}
            <span className="text-sm text-muted-foreground">{nationality}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <span className="text-muted-foreground">
              CIF <span className="font-medium text-foreground">{customer.cifNumber || "—"}</span>
            </span>
            <span className="text-muted-foreground">
              {customer.nationalIdType || "ID"}{" "}
              <span className="font-medium text-foreground">{customer.nationalId || "—"}</span>
            </span>
            {customer.mobileNumber && (
              <span className="font-medium text-foreground">{customer.mobileNumber}</span>
            )}
            {customer.email && <span className="font-medium text-foreground">{customer.email}</span>}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            {customer.lifecycleStage && (
              <Badge variant="outline" className={cn("border font-medium", TONES.sky)}>
                {customer.lifecycleStage}
              </Badge>
            )}
            {customer.kycStatus && <StatusBadge status={customer.kycStatus} />}
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
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Onboarding stepper                                                  */
/* ------------------------------------------------------------------ */

const Stepper = ({ onboarding, isAr }: any) => {
  const steps: any[] = onboarding?.steps || [];

  return (
    <div className="border-b px-4 py-5 md:px-5">
      {onboarding?.failureReason && (
        <div className={cn("mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", TONES.red)}>
          <AlertTriangle className="size-4 shrink-0" />
          {onboarding.failureReason}
        </div>
      )}

      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No onboarding steps available.</p>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max items-start">
            {steps.map((step, idx) => {
              const status = (step.status || "PENDING").toUpperCase();
              const isLast = idx === steps.length - 1;
              const done = status === "COMPLETED";
              const current = status === "CURRENT";
              const failed = status === "FAILED";
              const circle = done
                ? "bg-emerald-500 text-white border-emerald-500"
                : failed
                ? "bg-red-500 text-white border-red-500"
                : current
                ? "bg-sky-500 text-white border-sky-500 ring-4 ring-sky-500/20 animate-pulse"
                : "bg-muted text-muted-foreground border-border";
              return (
                <div key={step.step ?? idx} className="flex items-start">
                  <div className="flex w-24 flex-col items-center gap-2 text-center">
                    <div className={cn("flex size-9 items-center justify-center rounded-full border-2", circle)}>
                      {done ? (
                        <Check className="size-4" />
                      ) : failed ? (
                        <AlertTriangle className="size-4" />
                      ) : (
                        <span className="text-xs font-semibold">{step.step ?? idx + 1}</span>
                      )}
                    </div>
                    <span className="text-xs font-medium leading-tight text-foreground">
                      {isAr ? step.labelAr || step.label : step.label}
                    </span>
                    {step.occurredAt && (
                      <span className="text-[10px] text-muted-foreground">{formatDate(step.occurredAt)}</span>
                    )}
                  </div>
                  {!isLast && (
                    <div className={cn("mt-[18px] h-0.5 w-8 shrink-0 rounded-full", done ? "bg-emerald-500" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
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
          <span className="text-3xl font-bold" style={{ color }}>
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
    <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col gap-4 p-4 md:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className={cn("size-4", isRTL && "rotate-180")} />
        </Button>
        <Button variant="outline" size="sm" className="gap-2" disabled={loading} onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

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
        /* Single panel with header band + tabs */
        <Card className="gap-0 overflow-hidden py-0">
          <Stepper onboarding={onboarding} isAr={isAr} />

          <HeaderBand customer={customer} countryConfig={data.countryConfig} isAr={isAr} />

          <div className="flex flex-col gap-4 p-4 md:p-5">
            {/* Key graphs — always visible, independent of tabs */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Block title="Risk Score">
                <RiskGauge risk={risk} />
              </Block>
              <Block title="Money In vs Money Out">
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
                <Block title="Personal Information">
                  {personalRows.map((r) => (
                    <Field key={r.label} label={r.label} value={r.value || "—"} />
                  ))}
                </Block>
                <Block title="Contact & Identity">
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
                <Block title="Wallet">
                  <EmptyState icon={WalletIcon} text="No wallet provisioned for this customer." />
                </Block>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Block title="Balance" right={<StatusBadge status={wallet.status} />}>
                      <span className="text-xs text-muted-foreground">Total Balance</span>
                      <div className="text-3xl font-semibold tracking-tight text-foreground">
                        {formatMoney(wallet.totalBalance, currency)}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Available</div>
                          <div className="text-sm font-medium">{formatMoney(wallet.availableBalance, currency)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Reserved</div>
                          <div className="text-sm font-medium">{formatMoney(wallet.reservedBalance, currency)}</div>
                        </div>
                      </div>
                    </Block>
                    <Block title="Account Details" className="lg:col-span-2">
                      <Field label="IBAN" value={<span className="inline-flex items-center gap-1">{wallet.iban || "—"}<CopyButton text={wallet.iban} /></span>} mono />
                      <Field label="Account No." value={<span className="inline-flex items-center gap-1">{wallet.accountNumber || "—"}<CopyButton text={wallet.accountNumber} /></span>} mono />
                      <Field label="Wallet Number" value={wallet.walletNumber || "—"} mono />
                      <Field label="Currency" value={currency || "—"} />
                    </Block>
                  </div>

                  <Block title="Spending Limits (Spent vs Limit)">
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
                <Block title="Transactions">
                  <EmptyState icon={ArrowDownLeft} text="No transactions yet." />
                </Block>
              ) : (
                  <Block title="Recent Transactions" right={<span className="text-xs text-muted-foreground">{transactions.length} total</span>}>
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
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
                              <TableRow key={tx.id ?? tx.movementId ?? idx} className="hover:bg-muted/40">
                                <TableCell className="text-xs text-muted-foreground">{formatDateTime(tx.timestamp)}</TableCell>
                                <TableCell className="text-xs font-medium">{tx.type || "—"}</TableCell>
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
                                <TableCell className="text-xs">{tx.counterpartyName || "—"}</TableCell>
                                <TableCell>
                                  <StatusBadge status={tx.status} />
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{tx.purposeNote || "—"}</TableCell>
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
              <Block title="Score Trend">
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
                <Block title="Score Breakdown">
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

                <Block title="KYC Details">
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
            </Tabs>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Onboarding360;
