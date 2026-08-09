import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Wallet as WalletIcon,
  Lock,
  CircleDot,
  FileText,
  Camera,
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
  Nfc,
  Truck,
  Layers,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  StatusBadge,
  Field,
  Block,
  CopyButton,
  EmptyState,
  DocImage,
  Lightbox,
  OnboardingStepper,
} from "../../../components/shared/detailKit";
import {
  formatMoney,
  formatDate,
  formatDateTime,
  TONES,
  TONE_HEX,
  riskTone,
  chartTooltipStyle,
  humanizeCode,
} from "../../../components/shared/detailKitUtils";

/* ------------------------------------------------------------------ */
/* Payload shapes — only the fields this page reads                    */
/* ------------------------------------------------------------------ */

type Txn = {
  id?: string;
  type?: string;
  direction?: string;
  amount?: number;
  status?: string;
  counterpartyName?: string;
  purposeNote?: string;
  movementId?: string;
  timestamp?: string;
  /* Stamped on when several wallets' transactions are merged into one feed —
     the raw per-wallet rows carry none of these. */
  walletId?: string;
  walletNumber?: string;
  currency?: string;
};

type WalletLimits = {
  singleLimit?: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  yearlyLimit?: number;
  todaySpent?: number;
  weekSpent?: number;
  monthSpent?: number;
  yearSpent?: number;
  currency?: string;
};

type WalletRecord = {
  walletId?: string;
  walletNumber?: string;
  accountNumber?: string;
  iban?: string;
  currency?: string;
  status?: string;
  availableBalance?: number;
  reservedBalance?: number;
  totalBalance?: number;
  limits?: WalletLimits;
  hasWallet?: boolean;
  primary?: boolean;
  createdAt?: string;
  transactions?: Txn[];
};

type CardShipment = {
  deliveryMethod?: string;
  shipmentStatus?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
  address?: string;
  city?: string;
  postalCode?: string;
};

type CardRecord = {
  cardId?: string;
  cardReference?: string;
  walletId?: string;
  cardholderName?: string;
  cardType?: string;
  tier?: string;
  brand?: string;
  status?: string;
  currency?: string;
  maskedPan?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  pinSet?: boolean;
  contactlessEnabled?: boolean;
  requiresActivation?: boolean;
  dailyLimit?: number;
  monthlyLimit?: number;
  shipment?: CardShipment | null;
  issuedAt?: string;
  activatedAt?: string;
  createdAt?: string;
};

/* ------------------------------------------------------------------ */
/* Header band (single, not floating cards)                            */
/* ------------------------------------------------------------------ */

const HeaderBand = ({ customer, countryConfig, isAr }: any) => {
  const { t } = useTranslation("customerManagement");
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
    { icon: Hash, label: t("onboarding360.field.cifNumber"), value: customer.cifNumber },
    {
      icon: CreditCard,
      label: customer.nationalIdType || t("onboarding360.field.nationalId"),
      value: customer.nationalId,
    },
    { icon: Phone, label: t("onboarding360.field.mobile"), value: customer.mobileNumber },
    { icon: Mail, label: t("common:email"), value: customer.email },
    { icon: CalendarDays, label: t("onboarding360.field.dateOfBirth"), value: formatDate(customer.dateOfBirth) },
    { icon: Clock, label: t("onboarding360.field.onboarded"), value: formatDate(customer.createdAt) },
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
              {/* {customer.riskGrade && (
                <Badge variant="outline" className={cn("border font-medium", TONES[riskTone(customer.riskGrade)])}>
                  Risk {customer.riskGrade}
                </Badge>
              )} */}
              {customer.pepFlag && (
                <Badge variant="outline" className={cn("border font-medium", TONES.amber)}>
                  {t("onboarding360.badge.pep")}
                </Badge>
              )}
              {customer.sanctionsFlag && (
                <Badge variant="outline" className={cn("border font-medium", TONES.red)}>
                  {t("onboarding360.badge.sanctioned")}
                </Badge>
              )}
              {customer.isBlocked && (
                <Badge variant="outline" className={cn("gap-1 border font-medium", TONES.red)}>
                  <Lock className="size-3" /> {t("onboarding360.badge.blocked")}
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

/* ------------------------------------------------------------------ */
/* Transactions table (shared by the wallet + transactions tabs)       */
/* ------------------------------------------------------------------ */

const TransactionsTable = ({
  transactions,
  currency,
  showWallet,
}: {
  transactions: Txn[];
  /** Fallback currency for rows that carry none (single-wallet views). */
  currency?: string;
  /** Adds a wallet column — only meaningful for a merged, multi-wallet feed. */
  showWallet?: boolean;
}) => {
  const { t } = useTranslation("customerManagement");
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader style={{ background: "var(--theme-table-background-color)" }}>
          <TableRow className="border-0 hover:bg-transparent [&>th]:h-9 [&>th]:px-4 [&>th]:text-[12px] [&>th]:font-semibold [&>th]:tracking-[0.2px] [&>th]:text-white">
            <TableHead>{t("common:date")}</TableHead>
            {showWallet && <TableHead>{t("onboarding360.txn.wallet")}</TableHead>}
            <TableHead>{t("common:type")}</TableHead>
            <TableHead className="text-end">{t("common:amount")}</TableHead>
            <TableHead>{t("onboarding360.txn.counterparty")}</TableHead>
            <TableHead>{t("common:status")}</TableHead>
            <TableHead>{t("onboarding360.txn.note")}</TableHead>
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
                {showWallet && (
                  <TableCell className="whitespace-nowrap">
                    <span className="font-semibold text-foreground">{tx.currency || "—"}</span>
                    <span className="ms-1.5 font-mono text-[11px] text-muted-foreground">{tx.walletNumber || ""}</span>
                  </TableCell>
                )}
                <TableCell className="font-medium">{humanizeCode(tx.type) || "—"}</TableCell>
                <TableCell className="text-end">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-semibold",
                      isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {isCredit ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                    {formatMoney(tx.amount, tx.currency || currency)}
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
  );
};

/* ------------------------------------------------------------------ */
/* Wallet selector — one tile per wallet, click to inspect             */
/* ------------------------------------------------------------------ */

const WalletSelector = ({
  wallets,
  selectedId,
  onSelect,
}: {
  wallets: WalletRecord[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) => {
  const { t } = useTranslation("customerManagement");
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {wallets.map((w, idx) => {
        const id = w.walletId ?? String(idx);
        const active = id === selectedId;
        return (
          <button
            type="button"
            key={id}
            onClick={() => onSelect(id)}
            aria-pressed={active}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-3 text-start transition-all duration-200 hover:shadow-md",
              active
                ? "border-emerald-500/60 bg-emerald-500/[0.06] ring-1 ring-emerald-500/25"
                : "border-border bg-muted/20 hover:border-emerald-500/30"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    active
                      ? "bg-emerald-500 text-white"
                      : "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15"
                  )}
                >
                  <WalletIcon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold text-foreground">{w.currency || "—"}</span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">
                    {w.walletNumber || "—"}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1 [&_[data-slot=badge]]:px-2 [&_[data-slot=badge]]:py-0 [&_[data-slot=badge]]:text-[10px]">
                <StatusBadge status={w.status} />
                {w.primary && (
                  <Badge variant="outline" className={cn("border font-medium", TONES.sky)}>
                    {t("onboarding360.wallet.primary")}
                  </Badge>
                )}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2 border-t border-border/60 pt-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("onboarding360.wallet.totalBalance")}
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">
                {formatMoney(w.totalBalance, w.currency)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Payment card                                                        */
/* ------------------------------------------------------------------ */

/** Gradient per card tier — falls back to the app's emerald for unknown tiers. */
const CARD_THEME: Record<string, string> = {
  INFINITE: "from-slate-900 via-slate-800 to-emerald-800",
  SIGNATURE: "from-slate-800 via-slate-700 to-sky-800",
  PLATINUM: "from-zinc-700 via-zinc-600 to-zinc-800",
  GOLD: "from-amber-600 via-amber-500 to-yellow-700",
  CLASSIC: "from-emerald-700 via-emerald-600 to-teal-800",
};

/** Credit-card-shaped visual for a single issued card. */
const PaymentCard = ({ card }: { card: CardRecord }) => {
  const { t } = useTranslation("customerManagement");
  const theme = CARD_THEME[String(card.tier || "").toUpperCase()] || CARD_THEME.CLASSIC;
  const last4 = card.last4 || String(card.maskedPan || "").slice(-4);
  const expiry =
    card.expiryMonth != null && card.expiryYear != null
      ? `${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`
      : "—";

  return (
    <div
      className={cn(
        "relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg sm:p-5",
        theme
      )}
    >
      {/* Decorative light */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-40 rounded-full bg-white/[0.06] blur-2xl" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              {humanizeCode(card.tier) || t("onboarding360.card.tier")}
            </span>
            <span className="text-[11px] font-medium text-white/85">{humanizeCode(card.cardType)}</span>
          </div>
          <span className="text-lg font-bold italic tracking-tight text-white/90">{card.brand || ""}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Chip */}
          <span className="flex h-7 w-10 items-center justify-center rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner">
            <span className="h-4 w-6 rounded-sm border border-amber-600/40" />
          </span>
          {card.contactlessEnabled && <Nfc className="size-5 text-white/80" />}
        </div>

        <div className="font-mono text-base font-semibold tracking-[0.14em] text-white sm:text-lg">
          •••• •••• •••• {last4 || "••••"}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-[9px] uppercase tracking-[0.16em] text-white/60">
              {t("onboarding360.card.cardholder")}
            </span>
            <span className="truncate text-xs font-semibold uppercase text-white" title={card.cardholderName}>
              {card.cardholderName || "—"}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-[9px] uppercase tracking-[0.16em] text-white/60">
              {t("onboarding360.card.expires")}
            </span>
            <span className="font-mono text-xs font-semibold text-white">{expiry}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Risk gauge (reused in overview + risk tab)                          */
/* ------------------------------------------------------------------ */

const RiskGauge = ({ risk }: any) => {
  const { t } = useTranslation("customerManagement");
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
          <span className="text-xs text-muted-foreground">{t("onboarding360.risk.score")}</span>
        </div>
      </div>
      <Badge variant="outline" className={cn("mt-1 border font-medium", TONES[tone])}>
        {risk?.riskLevel || t("onboarding360.risk.notAssessed")}
      </Badge>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {risk?.riskGrade && <span>{t("onboarding360.risk.grade", { grade: risk.riskGrade })}</span>}
        {risk?.complianceStatus && <span>{risk.complianceStatus}</span>}
        {risk?.isPep && <span className="font-medium text-amber-500">{t("onboarding360.badge.pep")}</span>}
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

/** Customer 360 detail page. */
const Onboarding360 = () => {
  const { t } = useTranslation("customerManagement");
  const params = useParams();
  const customerId = params.id || params.customerId;
  const { isRTL, currentLanguage } = useLanguage();
  const isAr = currentLanguage?.code === "ar";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>();
  const [txnWalletFilter, setTxnWalletFilter] = useState<string>("all");

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
  const currency = wallet?.currency || "";

  /* A customer can hold several wallets (one per currency). `wallets` is the
     full list; older payloads only carry the single primary `wallet`. */
  const wallets: WalletRecord[] = useMemo(() => {
    const list: WalletRecord[] = Array.isArray(data?.wallets) ? data.wallets.filter(Boolean) : [];
    if (list.length > 0) return list;
    return wallet && wallet.hasWallet !== false ? [wallet] : [];
  }, [data, wallet]);
  const cards: CardRecord[] = data?.cards || [];
  const hasWallet = wallets.length > 0;

  /* Default the wallet tab to the primary wallet, and re-anchor whenever the
     selection no longer exists (customer switch / reload). */
  const selectedWallet = useMemo(
    () => wallets.find((w) => w.walletId === selectedWalletId) || wallets.find((w) => w.primary) || wallets[0],
    [wallets, selectedWalletId]
  );
  useEffect(() => {
    if (selectedWallet && selectedWallet.walletId !== selectedWalletId) {
      setSelectedWalletId(selectedWallet.walletId);
    }
  }, [selectedWallet, selectedWalletId]);

  const selectedCurrency = selectedWallet?.currency || "";
  const selectedTransactions: Txn[] = selectedWallet?.transactions || [];
  const limits = selectedWallet?.limits || {};

  const limitChartData = useMemo(
    () => [
      { name: t("onboarding360.chart.today"), Spent: Number(limits.todaySpent ?? 0), Limit: Number(limits.dailyLimit ?? 0) },
      { name: t("onboarding360.chart.week"), Spent: Number(limits.weekSpent ?? 0), Limit: Number(limits.weeklyLimit ?? 0) },
      { name: t("onboarding360.chart.month"), Spent: Number(limits.monthSpent ?? 0), Limit: Number(limits.monthlyLimit ?? 0) },
      { name: t("onboarding360.chart.year"), Spent: Number(limits.yearSpent ?? 0), Limit: Number(limits.yearlyLimit ?? 0) },
    ],
    [limits, t]
  );

  /* Every wallet's transactions in one feed, newest first, each row stamped
     with the wallet it came from. `data.transactions` only ever carries the
     primary wallet, so it is a fallback rather than the source. */
  const allTransactions: Txn[] = useMemo(() => {
    const merged = wallets.flatMap((w) =>
      (w.transactions || []).map((tx) => ({
        ...tx,
        walletId: w.walletId,
        walletNumber: w.walletNumber,
        currency: w.currency,
      }))
    );
    const feed = merged.length > 0 ? merged : transactions;
    return [...feed].sort(
      (a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
    );
  }, [wallets, transactions]);

  const visibleTransactions = useMemo(
    () =>
      txnWalletFilter === "all"
        ? allTransactions
        : allTransactions.filter((tx) => tx.walletId === txnWalletFilter),
    [allTransactions, txnWalletFilter]
  );

  /* Grouped per currency — wallets are denominated differently, so their
     amounts must never be added together into a single bar. */
  const txnSummary = useMemo(() => {
    const byCurrency = new Map<string, { name: string; in: number; out: number }>();
    allTransactions.forEach((tx) => {
      const key = tx.currency || currency || "—";
      const row = byCurrency.get(key) ?? { name: key, in: 0, out: 0 };
      const amt = Number(tx.amount ?? 0);
      if ((tx.direction || "").toUpperCase() === "CREDIT") row.in += amt;
      else row.out += amt;
      byCurrency.set(key, row);
    });
    return [...byCurrency.values()];
  }, [allTransactions, currency]);

  const personalRows = customer
    ? [
        { label: t("onboarding360.personal.fullName"), value: customer.fullName },
        { label: t("onboarding360.field.dateOfBirth"), value: formatDate(customer.dateOfBirth) },
        { label: t("onboarding360.personal.gender"), value: customer.gender },
        { label: t("onboarding360.personal.nationality"), value: customer.nationality },
        { label: t("onboarding360.personal.residency"), value: customer.residencyType },
        { label: t("onboarding360.personal.customerType"), value: customer.customerType },
      ]
    : [];

  const contactRows = customer
    ? [
        { label: t("onboarding360.field.mobile"), value: customer.mobileNumber },
        { label: t("common:email"), value: customer.email },
        { label: customer.nationalIdType || t("onboarding360.field.nationalId"), value: customer.nationalId },
        { label: t("onboarding360.field.cifNumber"), value: customer.cifNumber },
        { label: t("onboarding360.contact.created"), value: formatDate(customer.createdAt) },
        { label: t("onboarding360.contact.updated"), value: formatDate(customer.updatedAt) },
      ]
    : [];

  const kycRows = kyc
    ? [
        { label: t("onboarding360.kyc.status"), value: kyc.kycStatus },
        { label: t("onboarding360.kyc.documentType"), value: kyc.documentType },
        { label: t("onboarding360.kyc.faceMatchScore"), value: kyc.faceMatchScore != null ? `${kyc.faceMatchScore}` : "—" },
        { label: t("onboarding360.kyc.documentVerified"), value: kyc.documentVerified ? t("common:yes") : t("common:no") },
        { label: t("onboarding360.kyc.selfieVerified"), value: kyc.selfieVerified ? t("common:yes") : t("common:no") },
        { label: t("onboarding360.kyc.pinSet"), value: kyc.pinSet ? t("common:yes") : t("common:no") },
        { label: t("onboarding360.kyc.biometrics"), value: kyc.biometricsEnabled ? t("common:enabled") : t("common:disabled") },
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

      `}</style>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <AlertTriangle className="size-8 text-red-500" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              {t("onboarding360.retry")}
            </Button>
          </div>
        </Card>
      ) : !data ? (
        <Card>
          <div className="py-14 text-center text-sm text-muted-foreground">{t("onboarding360.noData")}</div>
        </Card>
      ) : (
        <>
          {/* Onboarding progress — its own (transparent) card */}
          <Card className="stepper-card overflow-hidden py-0">
            <OnboardingStepper onboarding={onboarding} isAr={isAr} />
          </Card>

          {/* Customer info + tabs — its own card */}
          <Card className="gap-0 overflow-hidden py-0">
            <HeaderBand customer={customer} countryConfig={data.countryConfig} isAr={isAr} />

            <div className="flex flex-col gap-4 p-4 md:p-5">
            {/* Key graphs — always visible, independent of tabs */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Block title={t("onboarding360.risk.score")} icon={ShieldAlert}>
                <RiskGauge risk={risk} />
              </Block>
              <Block title={t("onboarding360.block.moneyInVsOut")} icon={ArrowLeftRight}>
                {allTransactions.length === 0 ? (
                  <EmptyState icon={ArrowDownLeft} text={t("onboarding360.empty.noTransactions")} />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={txnSummary} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      {/* No currency on the value — the tooltip's label is the
                          currency, since that is what the bars group by. */}
                      <ReTooltip
                        contentStyle={chartTooltipStyle}
                        cursor={{ fill: "var(--muted)" }}
                        formatter={(v: any) => formatMoney(v)}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="in" name={t("onboarding360.chart.moneyIn")} fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={60} />
                      <Bar dataKey="out" name={t("onboarding360.chart.moneyOut")} fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={60} />
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
              <Tab eventKey="overview" title={t("onboarding360.tab.overview")}>
                {activeTab === "overview" && (
                  <div className="flex flex-col gap-4 pt-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Block title={t("onboarding360.block.personalInfo")} icon={User}>
                  {personalRows.map((r) => (
                    <Field key={r.label} label={r.label} value={r.value || "—"} />
                  ))}
                </Block>
                <Block title={t("onboarding360.block.contactIdentity")} icon={Contact}>
                  {contactRows.map((r) => (
                    <Field key={r.label} label={r.label} value={r.value || "—"} />
                  ))}
                </Block>
              </div>
                  </div>
                )}
              </Tab>

              {/* ---------------- Wallet ---------------- */}
              <Tab eventKey="wallet" title={t("onboarding360.tab.wallet")}>
                {activeTab === "wallet" && (
                  <div className="flex flex-col gap-4 pt-4">
              {!hasWallet || !selectedWallet ? (
                <Block title={t("onboarding360.block.wallet")} icon={WalletIcon}>
                  <EmptyState icon={WalletIcon} text={t("onboarding360.empty.noWallet")} />
                </Block>
              ) : (
                <>
                  <Block
                    title={t("onboarding360.block.wallets")}
                    icon={Layers}
                    right={
                      <span className="text-xs text-muted-foreground">
                        {t("onboarding360.wallet.total", { count: wallets.length })}
                      </span>
                    }
                  >
                    <WalletSelector
                      wallets={wallets}
                      selectedId={selectedWallet.walletId}
                      onSelect={setSelectedWalletId}
                    />
                  </Block>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Block title={t("onboarding360.block.balance")} icon={WalletIcon} right={<StatusBadge status={selectedWallet.status} />}>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {t("onboarding360.wallet.totalBalance")}
                      </span>
                      <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                        {formatMoney(selectedWallet.totalBalance, selectedCurrency)}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            {t("onboarding360.wallet.available")}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-foreground">
                            {formatMoney(selectedWallet.availableBalance, selectedCurrency)}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="size-2 rounded-full bg-amber-500" />
                            {t("onboarding360.wallet.reserved")}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-foreground">
                            {formatMoney(selectedWallet.reservedBalance, selectedCurrency)}
                          </div>
                        </div>
                      </div>
                    </Block>
                    <Block
                      title={t("onboarding360.block.accountDetails")}
                      icon={CreditCard}
                      className="lg:col-span-2"
                      right={
                        selectedWallet.primary ? (
                          <Badge variant="outline" className={cn("border text-[10px] font-medium", TONES.sky)}>
                            {t("onboarding360.wallet.primary")}
                          </Badge>
                        ) : null
                      }
                    >
                      <Field label={t("onboarding360.wallet.iban")} value={<span className="inline-flex items-center gap-1">{selectedWallet.iban || "—"}<CopyButton text={selectedWallet.iban} /></span>} mono />
                      <Field label={t("onboarding360.wallet.accountNo")} value={<span className="inline-flex items-center gap-1">{selectedWallet.accountNumber || "—"}<CopyButton text={selectedWallet.accountNumber} /></span>} mono />
                      <Field label={t("onboarding360.wallet.walletNumber")} value={selectedWallet.walletNumber || "—"} mono />
                      <Field label={t("onboarding360.wallet.currency")} value={selectedCurrency || "—"} />
                      <Field label={t("onboarding360.wallet.opened")} value={formatDate(selectedWallet.createdAt)} />
                    </Block>
                  </div>

                  <Block title={t("onboarding360.block.spendingLimits")} icon={Gauge}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={limitChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <ReTooltip contentStyle={chartTooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v: any) => formatMoney(v, selectedCurrency)} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Limit" name={t("onboarding360.chart.limit")} fill="var(--muted-foreground)" radius={[5, 5, 0, 0]} maxBarSize={28} fillOpacity={0.35} />
                        <Bar dataKey="Spent" name={t("onboarding360.chart.spent")} fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Block>

                  <Block
                    title={t("onboarding360.block.walletTransactions")}
                    icon={ArrowLeftRight}
                    right={
                      <span className="text-xs text-muted-foreground">
                        {t("onboarding360.txn.total", { count: selectedTransactions.length })}
                      </span>
                    }
                  >
                    {selectedTransactions.length === 0 ? (
                      <EmptyState icon={ArrowDownLeft} text={t("onboarding360.empty.noTransactions")} />
                    ) : (
                      <TransactionsTable transactions={selectedTransactions} currency={selectedCurrency} />
                    )}
                  </Block>
                </>
              )}
                  </div>
                )}
              </Tab>

              {/* ---------------- Transactions ---------------- */}
              <Tab eventKey="transactions" title={t("onboarding360.tab.transactions")}>
                {activeTab === "transactions" && (
                  <div className="flex flex-col gap-4 pt-4">
              {allTransactions.length === 0 ? (
                <Block title={t("onboarding360.block.transactions")} icon={ArrowLeftRight}>
                  <EmptyState icon={ArrowDownLeft} text={t("onboarding360.empty.noTransactions")} />
                </Block>
              ) : (
                  <Block
                    title={t("onboarding360.block.recentTransactions")}
                    icon={ArrowLeftRight}
                    right={
                      <span className="text-xs text-muted-foreground">
                        {t("onboarding360.txn.total", { count: visibleTransactions.length })}
                      </span>
                    }
                  >
                    {wallets.length > 1 && (
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {[
                          { id: "all", label: t("onboarding360.txn.allWallets") },
                          ...wallets.map((w) => ({
                            id: w.walletId ?? "",
                            label: `${w.currency || "—"} · ${w.walletNumber || ""}`,
                          })),
                        ].map((opt) => (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setTxnWalletFilter(opt.id)}
                            aria-pressed={txnWalletFilter === opt.id}
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                              txnWalletFilter === opt.id
                                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "border-border text-muted-foreground hover:border-emerald-500/30 hover:text-foreground"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <TransactionsTable
                      transactions={visibleTransactions}
                      currency={currency}
                      showWallet={wallets.length > 1}
                    />
                  </Block>
              )}
                  </div>
                )}
              </Tab>

              {/* ---------------- Cards ---------------- */}
              <Tab eventKey="cards" title={t("onboarding360.tab.cards")}>
                {activeTab === "cards" && (
                  <div className="flex flex-col gap-4 pt-4">
                    {cards.length === 0 ? (
                      <Block title={t("onboarding360.block.cards")} icon={CreditCard}>
                        <EmptyState icon={CreditCard} text={t("onboarding360.empty.noCards")} />
                      </Block>
                    ) : (
                      cards.map((card, idx) => {
                        const linkedWallet = wallets.find((w) => w.walletId === card.walletId);
                        const shipment = card.shipment;
                        return (
                          <div
                            key={card.cardId ?? idx}
                            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
                          >
                            <div className="flex items-start">
                              <PaymentCard card={card} />
                            </div>

                            <Block
                              title={t("onboarding360.block.cardDetails")}
                              icon={CreditCard}
                              right={<StatusBadge status={card.status} />}
                              className={shipment ? "" : "lg:col-span-2"}
                            >
                              <Field
                                label={t("onboarding360.card.reference")}
                                value={
                                  <span className="inline-flex items-center gap-1">
                                    {card.cardReference || "—"}
                                    <CopyButton text={card.cardReference} />
                                  </span>
                                }
                                mono
                              />
                              <Field label={t("onboarding360.card.maskedPan")} value={card.maskedPan || "—"} mono />
                              <Field label={t("onboarding360.card.type")} value={humanizeCode(card.cardType) || "—"} />
                              <Field label={t("onboarding360.card.brandTier")} value={`${card.brand || "—"} · ${humanizeCode(card.tier) || "—"}`} />
                              <Field label={t("onboarding360.wallet.currency")} value={card.currency || "—"} />
                              <Field
                                label={t("onboarding360.card.linkedWallet")}
                                value={
                                  linkedWallet
                                    ? `${linkedWallet.walletNumber} · ${linkedWallet.currency}`
                                    : card.walletId || "—"
                                }
                                mono={!linkedWallet}
                              />
                              <Field label={t("onboarding360.card.dailyLimit")} value={formatMoney(card.dailyLimit, card.currency)} />
                              <Field label={t("onboarding360.card.monthlyLimit")} value={formatMoney(card.monthlyLimit, card.currency)} />
                              <Field label={t("onboarding360.card.pinSet")} value={card.pinSet ? t("common:yes") : t("common:no")} />
                              <Field
                                label={t("onboarding360.card.contactless")}
                                value={card.contactlessEnabled ? t("common:enabled") : t("common:disabled")}
                              />
                              <Field
                                label={t("onboarding360.card.requiresActivation")}
                                value={card.requiresActivation ? t("common:yes") : t("common:no")}
                              />
                              <Field label={t("onboarding360.card.issued")} value={formatDateTime(card.issuedAt)} />
                              <Field label={t("onboarding360.card.activated")} value={formatDateTime(card.activatedAt)} />
                            </Block>

                            {shipment && (
                              <Block
                                title={t("onboarding360.block.shipment")}
                                icon={Truck}
                                right={<StatusBadge status={shipment.shipmentStatus} />}
                              >
                                <Field
                                  label={t("onboarding360.card.deliveryMethod")}
                                  value={humanizeCode(shipment.deliveryMethod) || "—"}
                                />
                                <Field label={t("onboarding360.card.carrier")} value={shipment.carrier || "—"} />
                                <Field
                                  label={t("onboarding360.card.trackingNumber")}
                                  value={
                                    <span className="inline-flex items-center gap-1">
                                      {shipment.trackingNumber || "—"}
                                      <CopyButton text={shipment.trackingNumber} />
                                    </span>
                                  }
                                  mono
                                />
                                <Field
                                  label={t("onboarding360.card.estimatedDelivery")}
                                  value={formatDate(shipment.estimatedDeliveryDate)}
                                />
                                <Field
                                  label={t("onboarding360.card.address")}
                                  value={
                                    [shipment.address, shipment.city, shipment.postalCode]
                                      .filter(Boolean)
                                      .join(", ") || "—"
                                  }
                                />
                              </Block>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </Tab>

              {/* ---------------- Risk & KYC ---------------- */}
              <Tab eventKey="risk" title={t("onboarding360.tab.riskKyc")}>
                {activeTab === "risk" && (
                  <div className="flex flex-col gap-4 pt-4">
              <Block title={t("onboarding360.block.scoreTrend")} icon={TrendingUp}>
                  {(risk?.history || []).length === 0 ? (
                    <EmptyState icon={ShieldAlert} text={t("onboarding360.empty.noRiskAssessment")} />
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
                <Block title={t("onboarding360.block.scoreBreakdown")} icon={BarChart3}>
                  {(risk?.breakdown || []).length === 0 ? (
                    <EmptyState icon={ShieldAlert} text={t("onboarding360.empty.noBreakdown")} />
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

                <Block title={t("onboarding360.block.kycDetails")} icon={ShieldCheck}>
                  {kycRows.length === 0 ? (
                    <EmptyState icon={ShieldAlert} text={t("onboarding360.empty.noKyc")} />
                  ) : (
                    kycRows.map((r) => <Field key={r.label} label={r.label} value={r.value} />)
                  )}
                </Block>
              </div>

              <Block title={t("onboarding360.block.scoreBreakdownDetails")} icon={BarChart3}>
                {(risk?.breakdown || []).length === 0 ? (
                  <EmptyState icon={ShieldAlert} text={t("onboarding360.empty.noBreakdown")} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-3 py-2 text-start font-medium">{t("common:category")}</th>
                          <th className="px-3 py-2 text-end font-medium">{t("onboarding360.breakdown.categoryWeight")}</th>
                          <th className="px-3 py-2 text-end font-medium">{t("onboarding360.breakdown.factorWeight")}</th>
                          <th className="px-3 py-2 text-end font-medium">{t("onboarding360.breakdown.score")}</th>
                          <th className="px-3 py-2 text-start font-medium">{t("onboarding360.breakdown.calculation")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {risk.breakdown.map((b: any, i: number) => (
                          <tr
                            key={i}
                            className="border-b border-border/60 transition-colors hover:bg-muted/40"
                          >
                            <td className="px-3 py-2.5 font-medium text-foreground">{b.category}</td>
                            <td className="px-3 py-2.5 text-end tabular-nums">{b.categoryWeight}</td>
                            <td className="px-3 py-2.5 text-end tabular-nums">{b.factorWeight}%</td>
                            <td className="px-3 py-2.5 text-end font-semibold tabular-nums text-foreground">
                              {b.scoreContribution}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                              {b.calculationDetail}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border font-semibold">
                          <td className="px-3 py-2.5 text-foreground">{t("common:total")}</td>
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5 text-end tabular-nums text-foreground">
                            {risk?.riskScore ?? risk?.riskCalculation?.totalScore ?? "—"}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">
                            {risk?.riskLevel ? t("onboarding360.breakdown.riskLevel", { level: risk.riskLevel }) : ""}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </Block>

              {(() => {
                const complianceAnswers =
                  risk?.complianceQuestionHistory?.slice(-1)?.[0]?.answers || [];
                if (complianceAnswers.length === 0) return null;
                return (
                  <Block title={t("onboarding360.block.complianceQuestionnaire")} icon={ShieldCheck}>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="px-3 py-2 text-start font-medium">{t("onboarding360.compliance.question")}</th>
                            <th className="px-3 py-2 text-start font-medium">{t("onboarding360.compliance.answer")}</th>
                            <th className="px-3 py-2 text-end font-medium">{t("onboarding360.breakdown.factorWeight")}</th>
                            <th className="px-3 py-2 text-end font-medium">{t("onboarding360.breakdown.score")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {complianceAnswers.map((a: any, i: number) => (
                            <tr
                              key={i}
                              className="border-b border-border/60 transition-colors hover:bg-muted/40"
                            >
                              <td className="px-3 py-2.5 font-medium text-foreground">
                                {isRTL ? a.questionAr || a.questionEn : a.questionEn}
                              </td>
                              <td className="px-3 py-2.5 text-muted-foreground">
                                {a.answer || "—"}
                              </td>
                              <td className="px-3 py-2.5 text-end tabular-nums">
                                {a.factorWeightPct != null ? `${a.factorWeightPct}%` : "—"}
                              </td>
                              <td className="px-3 py-2.5 text-end font-semibold tabular-nums text-foreground">
                                {a.scoreContribution ?? "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Block>
                );
              })()}
                  </div>
                )}
              </Tab>

              {/* ---------------- Documents ---------------- */}
              <Tab eventKey="documents" title={t("onboarding360.tab.documents")}>
                {activeTab === "documents" && (
                  <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-3">
                    <Block title={t("onboarding360.block.identityDocuments")} icon={FileText} className="lg:col-span-2">
                      {documents.length === 0 ? (
                        <EmptyState icon={FileText} text={t("onboarding360.empty.noDocuments")} />
                      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {documents.map((doc, idx) => (
                            <div
                              key={doc.documentId ?? idx}
                              className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="outline" className={cn("border font-medium", TONES.sky)}>
                                  {humanizeCode(doc.kind) || t("onboarding360.doc.documentFallback")}
                                </Badge>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <CalendarDays className="size-3" />
                                  {formatDate(doc.createdAt)}
                                </span>
                              </div>
                              <DocImage
                                cacheKey={`${customerId}:${doc.imagePath}`}
                                label={humanizeCode(doc.kind) || t("onboarding360.doc.documentLabel")}
                                onEnlarge={(s, l) => setLightbox({ src: s, label: l })}
                                fetcher={() =>
                                  getOnboardingDocumentImage(doc.imagePath).then(
                                    (res: any) => res?.data?.data ?? res?.data ?? null
                                  )
                                }
                              />
                              <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
                                <span className="text-muted-foreground">{t("onboarding360.doc.documentNo")}</span>
                                <span className="font-mono font-medium text-foreground">{doc.documentNumber || "—"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Block>

                    <Block title={t("onboarding360.block.selfie")} icon={Camera}>
                      {selfie ? (
                        <div className="w-full">
                          <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md">
                            <DocImage
                              cacheKey={`${customerId}:${selfie.imagePath}`}
                              label={t("onboarding360.doc.selfieLabel")}
                              onEnlarge={(s, l) => setLightbox({ src: s, label: l })}
                              fetcher={() =>
                                getOnboardingDocumentImage(selfie.imagePath).then(
                                  (res: any) => res?.data?.data ?? res?.data ?? null
                                )
                              }
                            />
                            {kyc?.selfieVerified != null && (
                              <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
                                <span className="text-muted-foreground">{t("onboarding360.doc.verification")}</span>
                                <Badge
                                  variant="outline"
                                  className={cn("border font-medium", kyc.selfieVerified ? TONES.emerald : TONES.amber)}
                                >
                                  {kyc.selfieVerified ? t("onboarding360.doc.verified") : t("common:pending")}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <EmptyState icon={Camera} text={t("onboarding360.empty.noSelfie")} />
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

      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
};

export default Onboarding360;
