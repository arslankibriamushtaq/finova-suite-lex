import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Receipt,
  CheckCircle2,
  CreditCard,
  Landmark,
  BadgeCheck,
  FileText,
  ExternalLink,
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCw,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";

import {
  getExchangePayment,
  confirmExchangePayment,
  ExchangePaymentDetail as ExchangePaymentDetailType,
} from "../../../redux/apis/apisWalletAdmin";

const STATUS_BADGE: Record<string, string> = {
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  VERIFIED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  CAPTURED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  CONSUMED: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  EXPIRED: "bg-muted text-muted-foreground",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  DECLINED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const StatusBadge = ({ status }: { status?: string | null }) => (
  <span
    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
      STATUS_BADGE[status || ""] || "bg-muted text-foreground"
    }`}
  >
    {status || "-"}
  </span>
);

const formatMoney = (value: number | null | undefined, currency?: string) => {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${amount} ${currency}` : amount;
};

const formatRate = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? "-"
    : Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const methodLabel = (method?: string) =>
  method === "ONE_BILL" ? "1 Bill" : method === "CARD" ? "Card" : method || "-";

const ExchangePaymentDetail = () => {
  const { paymentId } = useParams<{ paymentId: string }>();

  const [data, setData] = useState<ExchangePaymentDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const loadPayment = async () => {
    if (!paymentId) return;
    setIsLoading(true);
    setNotFound(false);
    try {
      const res = await getExchangePayment(paymentId);
      const body = res?.data ?? {};
      const inner = (body?.data ?? body) as ExchangePaymentDetailType;
      if (inner && inner.payment && inner.payment.paymentId) {
        setData(inner);
      } else {
        setNotFound(true);
      }
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to load payment"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const payment = data?.payment;
  const quote = data?.quote;
  const verification = data?.verification;
  const documents = data?.documents;
  const files = data?.uploadedFiles;

  const canConfirm =
    !!payment &&
    payment.status === "PENDING" &&
    payment.method === "ONE_BILL";

  const confirmPayment = async () => {
    if (!payment) return;
    setIsConfirming(true);
    try {
      await confirmExchangePayment(payment.paymentId);
      toast.success("Payment confirmed — customer wallet credited");
      loadPayment();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to confirm payment"
      );
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="service">
      {/* Title band */}
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <div>
          <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
            <span className="pro-head-badge">
              <Receipt className="h-4 w-4" />
            </span>
            Payment Details
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground font-mono">
            {paymentId}
          </p>
        </div>
        {payment && !isLoading && (
          <div className="d-flex align-items-center gap-3">
            <StatusBadge status={payment.status} />
            {canConfirm && (
              <Button
                className="gap-2 wallet-brand-btn"
                onClick={confirmPayment}
                disabled={isConfirming}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isConfirming ? "Confirming…" : "Confirm 1 Bill Payment"}
              </Button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      ) : notFound ? (
        <Card className="pro-card-glow">
          <CardContent className="py-12 text-center text-muted-foreground">
            Payment not found for this tenant.
          </CardContent>
        </Card>
      ) : payment ? (
        <>
        {/* KPI hero strip */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Receiving (credited)"
            value={formatMoney(
              payment.receivingAmount,
              payment.receivingCurrency
            )}
            hint={payment.customerName ? `to ${payment.customerName}` : undefined}
            icon={<ArrowDownToLine className="h-4 w-4" />}
            accent="emerald"
          />
          <StatTile
            label="Total Paying"
            value={formatMoney(payment.totalPaying, payment.payingCurrency)}
            hint={`incl. fee ${formatMoney(
              payment.feeAmount,
              payment.payingCurrency
            )}`}
            icon={<ArrowUpFromLine className="h-4 w-4" />}
            accent="orange"
          />
          <StatTile
            label="Method"
            value={methodLabel(payment.method)}
            icon={
              payment.method === "CARD" ? (
                <CreditCard className="h-4 w-4" />
              ) : (
                <Landmark className="h-4 w-4" />
              )
            }
            accent="violet"
          />
          <StatTile
            label="Status"
            value={<StatusBadge status={payment.status} />}
            icon={<BadgeCheck className="h-4 w-4" />}
            accent="sky"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Customer & Summary */}
          <Card className="pro-card-glow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/15">
                  {payment.method === "CARD" ? (
                    <CreditCard className="h-4 w-4" />
                  ) : (
                    <Landmark className="h-4 w-4" />
                  )}
                </span>
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <DetailRow label="Customer" value={payment.customerName || "-"} />
              <DetailRow
                label="Customer ID"
                value={payment.customerId || "-"}
                mono
              />
              <DetailRow label="Wallet ID" value={payment.walletId || "-"} mono />
              <DetailRow label="Payment ID" value={payment.paymentId} mono />
              <DetailRow label="Method" value={methodLabel(payment.method)} />
              <DetailRow
                label="Status"
                value={<StatusBadge status={payment.status} />}
              />
              <DetailRow
                label="Created At"
                value={formatDate(payment.createdAt)}
              />
              <DetailRow
                label="Completed At"
                value={formatDate(payment.completedAt)}
              />
              {payment.movementId && (
                <DetailRow
                  label="Movement ID"
                  value={payment.movementId}
                  mono
                />
              )}
              {payment.errorMessage && (
                <DetailRow
                  label="Error"
                  value={
                    <span className="text-destructive">
                      {payment.errorMessage}
                    </span>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Amounts */}
          <Card className="pro-card-glow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/15">
                  <Wallet className="h-4 w-4" />
                </span>
                Amounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <DetailRow
                label="Receiving (credited)"
                value={formatMoney(
                  payment.receivingAmount,
                  payment.receivingCurrency
                )}
              />
              <DetailRow
                label="Paying"
                value={formatMoney(
                  payment.payingAmount,
                  payment.payingCurrency
                )}
              />
              <DetailRow
                label="Fee"
                value={formatMoney(payment.feeAmount, payment.payingCurrency)}
              />
              <div className="flex items-center justify-between gap-4 pt-2 mt-1 border-t border-border">
                <span className="text-sm font-semibold">Total Paying</span>
                <span className="text-base font-bold">
                  {formatMoney(payment.totalPaying, payment.payingCurrency)}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">Card / Bill</p>
                <div className="mt-1 text-sm">
                  {payment.cardBrand || payment.cardLastFour
                    ? `${payment.cardBrand || ""} •••• ${
                        payment.cardLastFour || ""
                      }`.trim()
                    : payment.billId
                    ? `Bill ${payment.billId}`
                    : "-"}
                </div>
                {payment.providerReference && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Ref: {payment.providerReference}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quote */}
          {quote && (
            <Card className="pro-card-glow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/15">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <DetailRow label="Quote ID" value={quote.quoteId} mono />
                <DetailRow label="Provider" value={quote.providerCode} />
                <DetailRow
                  label="Status"
                  value={<StatusBadge status={quote.status} />}
                />
                <DetailRow label="Base Rate" value={formatRate(quote.baseRate)} />
                <DetailRow
                  label="Effective Rate"
                  value={formatRate(quote.effectiveRate)}
                />
                <DetailRow
                  label="FX Margin"
                  value={`${Number(quote.fxMarginPercent ?? 0)}%`}
                />
                <DetailRow
                  label="Fee"
                  value={`${Number(quote.feePercent ?? 0)}%`}
                />
                <DetailRow
                  label="Created At"
                  value={formatDate(quote.createdAt)}
                />
                <DetailRow
                  label="Expires At"
                  value={formatDate(quote.expiresAt)}
                />
              </CardContent>
            </Card>
          )}

          {/* Verification */}
          {verification && (
            <Card className="pro-card-glow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                    <BadgeCheck className="h-4 w-4" />
                  </span>
                  KYC Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <DetailRow
                  label="Overall"
                  value={<StatusBadge status={verification.overallStatus} />}
                />
                <DetailRow
                  label="Document Type"
                  value={verification.documentType || "-"}
                />
                <DetailRow
                  label="Document Number"
                  value={verification.documentNumber || "-"}
                  mono
                />
                <DetailRow
                  label="Document"
                  value={<StatusBadge status={verification.documentStatus} />}
                />
                <DetailRow
                  label="Selfie"
                  value={<StatusBadge status={verification.selfieStatus} />}
                />
                <DetailRow
                  label="Fingerprint"
                  value={
                    <StatusBadge status={verification.fingerprintStatus} />
                  }
                />
                <DetailRow
                  label="Face Match"
                  value={
                    verification.faceMatchScore == null
                      ? "-"
                      : `${(verification.faceMatchScore * 100).toFixed(1)}%`
                  }
                />
                {verification.declineReason && (
                  <DetailRow
                    label="Decline Reason"
                    value={
                      <span className="text-destructive">
                        {verification.declineReason}
                      </span>
                    }
                  />
                )}
                <DetailRow
                  label="Sullis Session"
                  value={verification.sullisSessionId || "-"}
                  mono
                />
              </CardContent>
            </Card>
          )}

          {/* Required documents (country-driven) */}
          {documents && documents.length > 0 && (
            <Card className="pro-card-glow lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/15">
                    <FileText className="h-4 w-4" />
                  </span>
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {documents.map((doc, i) => (
                    <div
                      key={`${doc.documentType}-${i}`}
                      className="space-y-2 rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {doc.documentName}
                        </span>
                        <StatusBadge status={doc.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant={doc.mandatory ? "default" : "secondary"}
                        >
                          {doc.mandatory ? "Mandatory" : "Optional"}
                        </Badge>
                        <Badge variant="outline">
                          {doc.source === "REUSED_PII"
                            ? "Reused (PII)"
                            : "Uploaded"}
                        </Badge>
                      </div>
                      {doc.documentNumber && (
                        <p className="font-mono text-xs text-muted-foreground">
                          #{doc.documentNumber}
                        </p>
                      )}
                      {doc.url ? (
                        <ImagePreview src={doc.url} alt={doc.documentName} />
                      ) : (
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                          {doc.source === "REUSED_PII"
                            ? "Reused from profile — no file"
                            : "Not uploaded"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Biometrics + legacy uploads */}
          {files && (files.selfieUrl || files.fingerprintUrl) && (
            <Card className="pro-card-glow lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/15">
                    <FileText className="h-4 w-4" />
                  </span>
                  Biometrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <DocThumb label="Selfie" url={files.selfieUrl} />
                  <DocThumb label="Fingerprint" url={files.fingerprintUrl} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </>
      ) : null}
    </div>
  );
};

const ImagePreview = ({
  src,
  alt,
  openLabel = "Open full size",
  maxH = "h-64",
}: {
  src: string;
  alt: string;
  openLabel?: string;
  maxH?: string;
}) => {
  const [rotation, setRotation] = useState(0);
  const sideways = rotation % 180 !== 0;
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div
        className={`relative flex ${maxH} items-center justify-center overflow-hidden bg-muted p-2`}
      >
        <img
          src={src}
          alt={alt}
          className={`w-auto object-contain transition-transform duration-200 ${
            sideways ? "max-h-full max-w-[16rem]" : "max-h-full max-w-full"
          }`}
          style={{ transform: `rotate(${rotation}deg)` }}
          loading="lazy"
        />
        <button
          type="button"
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground"
          title="Rotate 90°"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      </div>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1 py-1.5 text-xs text-primary hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        {openLabel}
      </a>
    </div>
  );
};

const ACCENT: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/15",
  orange: "bg-orange-500/10 text-orange-600 ring-orange-500/15",
  violet: "bg-violet-500/10 text-violet-600 ring-violet-500/15",
  sky: "bg-sky-500/10 text-sky-600 ring-sky-500/15",
};

const StatTile = ({
  label,
  value,
  hint,
  icon,
  accent = "sky",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  accent?: keyof typeof ACCENT | string;
}) => (
  <div className="pro-card-glow flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-xl font-bold leading-tight">{value}</p>
      {hint && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
    <span
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${
        ACCENT[accent] || ACCENT.sky
      }`}
    >
      {icon}
    </span>
  </div>
);

const DocThumb = ({
  label,
  url,
}: {
  label: string;
  url: string | null;
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium">{label}</p>
    {url ? (
      <ImagePreview src={url} alt={label} maxH="h-80" />
    ) : (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Not uploaded
      </div>
    )}
  </div>
);

const DetailRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 last:border-b-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span
      className={`text-sm text-right break-all ${
        mono ? "font-mono text-xs" : ""
      }`}
    >
      {value}
    </span>
  </div>
);

export default ExchangePaymentDetail;
