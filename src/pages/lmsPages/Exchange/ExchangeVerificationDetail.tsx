import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Check,
  X,
  BadgeCheck,
  FileText,
  ExternalLink,
  ArrowDownToLine,
  ArrowUpFromLine,
  ScanFace,
  TrendingUp,
  RotateCwSquare,
  RotateCcwSquare,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

import {
  getExchangeVerification,
  approveExchangeVerification,
  rejectExchangeVerification,
  ExchangeVerificationDetail as VerificationDetailType,
} from "../../../redux/apis/apisWalletAdmin";
import { usePermissions, EXCHANGE_PERMISSIONS } from "../../../hooks/useProductPermissions";

const STATUS_BADGE: Record<string, string> = {
  APPROVED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  VERIFIED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  QUOTED: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  DECLINED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const StatusBadge = ({ status }: { status?: string | null }) => {
  const { t } = useTranslation("exchange");
  const label = status
    ? t(`status.${status.toLowerCase()}`, { defaultValue: status })
    : "-";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
        STATUS_BADGE[status || ""] || "bg-muted text-foreground"
      }`}
    >
      {label}
    </span>
  );
};

const formatMoney = (value: number | null | undefined, currency?: string) => {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${amount} ${currency}` : amount;
};

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

type DecisionMode = "approve" | "reject" | null;

const ExchangeVerificationDetail = () => {
  const { t } = useTranslation("exchange");
  const { hasPermission } = usePermissions();
  const canReview = hasPermission(EXCHANGE_PERMISSIONS.VERIFICATION_REVIEW);
  const { quoteId } = useParams<{ quoteId: string }>();

  const [data, setData] = useState<VerificationDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [decision, setDecision] = useState<DecisionMode>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    if (!quoteId) return;
    setIsLoading(true);
    setNotFound(false);
    try {
      const res = await getExchangeVerification(quoteId);
      const body = res?.data ?? {};
      const inner = (body?.data ?? body) as VerificationDetailType;
      if (inner && inner.quoteId) {
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
          error?.response?.data?.message || t("vd.toast.loadFailed")
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId]);

  const openDecision = (mode: DecisionMode) => {
    setDecision(mode);
    setNote("");
  };

  const submitDecision = async () => {
    if (!quoteId || !decision) return;
    if (decision === "reject" && !note.trim())
      return toast.error(t("vd.toast.rejectReasonRequired"));
    setIsSubmitting(true);
    try {
      if (decision === "approve") {
        await approveExchangeVerification(quoteId, {
          note: note.trim() || undefined,
        });
        toast.success(t("vd.toast.approved"));
      } else {
        await rejectExchangeVerification(quoteId, { note: note.trim() });
        toast.success(t("vd.toast.rejected"));
      }
      setDecision(null);
      load();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("vd.toast.submitFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const documents = data?.documents;
  const quote = data?.quote;
  const isPending = data?.approvalStatus === "PENDING";
  const kycVerified = data?.overallStatus === "VERIFIED";

  return (
    <div className="service">
      <style>{`
        .exch-dialog [data-slot="dialog-title"] { font-size: 15px; }
        .exch-dialog [data-slot="dialog-description"] { font-size: 12px; }
        .exch-dialog [data-slot="label"],
        .exch-dialog label,
        .exch-dialog label span,
        .exch-dialog .text-sm,
        .exch-dialog input,
        .exch-dialog textarea,
        .exch-dialog [data-slot="button"] {
          font-size: 12px !important;
        }
        .exch-dialog [data-slot="label"] { font-weight: 600; }
      `}</style>
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <div>
          <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
            <span className="pro-head-badge">
              <ShieldCheck className="h-4 w-4" />
            </span>
            {t("vd.title")}
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground font-mono">
            {quoteId}
          </p>
        </div>
        {data && !isLoading && (
          <div className="d-flex align-items-center gap-3">
            <StatusBadge status={data.approvalStatus} />
            {isPending && canReview && (
              <>
                <Button
                  variant="outline"
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => openDecision("reject")}
                >
                  <X className="h-4 w-4" />
                  {t("vd.reject")}
                </Button>
                <Button
                  className="gap-2 wallet-brand-btn"
                  onClick={() => openDecision("approve")}
                  disabled={!kycVerified}
                >
                  <Check className="h-4 w-4" />
                  {t("vd.approve")}
                </Button>
              </>
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
            {t("vd.notFound")}
          </CardContent>
        </Card>
      ) : data ? (
        <>
        {/* KPI hero strip */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={t("vd.tile.receiving")}
            value={formatMoney(
              quote?.receivingAmount,
              quote?.receivingCurrency
            )}
            hint={
              data.customerName
                ? t("vd.tile.toCustomer", { name: data.customerName })
                : undefined
            }
            icon={<ArrowDownToLine className="h-4 w-4" />}
            accent="emerald"
          />
          <StatTile
            label={t("vd.tile.totalPaying")}
            value={formatMoney(quote?.totalPaying, quote?.payingCurrency)}
            icon={<ArrowUpFromLine className="h-4 w-4" />}
            accent="orange"
          />
          <StatTile
            label={t("vd.tile.faceMatch")}
            value={
              data.faceMatchScore == null
                ? "-"
                : `${(data.faceMatchScore * 100).toFixed(1)}%`
            }
            hint={
              kycVerified
                ? t("vd.tile.kycVerified")
                : t("vd.tile.kycNotVerified")
            }
            icon={<ScanFace className="h-4 w-4" />}
            accent="violet"
          />
          <StatTile
            label={t("vd.tile.approval")}
            value={<StatusBadge status={data.approvalStatus} />}
            icon={<BadgeCheck className="h-4 w-4" />}
            accent="sky"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Customer & identity */}
          <Card className="pro-card-glow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                {t("vd.card.identity")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <DetailRow
                label={t("vd.row.customer")}
                value={data.customerName || "-"}
              />
              <DetailRow
                label={t("vd.row.customerId")}
                value={data.customerId}
                mono
              />
              <DetailRow label={t("vd.row.country")} value={data.countryCode} />
              <DetailRow
                label={t("vd.row.kycOverall")}
                value={<StatusBadge status={data.overallStatus} />}
              />
              <DetailRow
                label={t("vd.row.approval")}
                value={<StatusBadge status={data.approvalStatus} />}
              />
              <DetailRow
                label={t("vd.row.selfie")}
                value={<StatusBadge status={data.selfieStatus} />}
              />
              <DetailRow
                label={t("vd.row.faceMatch")}
                value={
                  data.faceMatchScore == null
                    ? "-"
                    : `${(data.faceMatchScore * 100).toFixed(1)}%`
                }
              />
              {data.approvedBy && (
                <DetailRow
                  label={t("vd.row.decidedBy")}
                  value={data.approvedBy}
                  mono
                />
              )}
              {data.approvedAt && (
                <DetailRow
                  label={t("vd.row.decidedAt")}
                  value={formatDate(data.approvedAt)}
                />
              )}
              {data.approvalNote && (
                <DetailRow label={t("vd.row.note")} value={data.approvalNote} />
              )}
              {data.declineReason && (
                <DetailRow
                  label={t("vd.row.declineReason")}
                  value={
                    <span className="text-destructive">
                      {data.declineReason}
                    </span>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Quote */}
          <Card className="pro-card-glow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/15">
                  <TrendingUp className="h-4 w-4" />
                </span>
                {t("vd.card.quote")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quote && (
                <div className="space-y-1">
                  <DetailRow
                    label={t("vd.row.provider")}
                    value={quote.providerCode}
                  />
                  <DetailRow
                    label={t("vd.row.status")}
                    value={<StatusBadge status={quote.status} />}
                  />
                  <DetailRow
                    label={t("vd.row.receiving")}
                    value={formatMoney(
                      quote.receivingAmount,
                      quote.receivingCurrency
                    )}
                  />
                  <DetailRow
                    label={t("vd.row.totalPaying")}
                    value={formatMoney(quote.totalPaying, quote.payingCurrency)}
                  />
                  <DetailRow
                    label={t("vd.row.effectiveRate")}
                    value={Number(quote.effectiveRate ?? 0)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents & selfie */}
          {((documents && documents.length > 0) ||
            data.selfieUrl ||
            data.fingerprintUrl ||
            data.documentUrl) && (
            <Card className="pro-card-glow lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/15">
                    <FileText className="h-4 w-4" />
                  </span>
                  {t("vd.card.docsSelfie")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(documents || []).map((doc, i) => (
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
                            ? t("vd.doc.reusedNoFile")
                            : t("vd.doc.notUploaded")}
                        </div>
                      )}
                    </div>
                  ))}

                  {data.selfieUrl && (
                    <div className="space-y-2 rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {t("vd.selfie")}
                        </span>
                        {data.selfieStatus && (
                          <StatusBadge status={data.selfieStatus} />
                        )}
                      </div>
                      <ImagePreview
                        src={data.selfieUrl}
                        alt={t("vd.selfie")}
                        openLabel={t("vd.openSelfie")}
                      />
                    </div>
                  )}

                  {data.fingerprintUrl && (
                    <div className="space-y-2 rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {t("vd.fingerprint", { defaultValue: "Fingerprint" })}
                        </span>
                      </div>
                      <ImagePreview
                        src={data.fingerprintUrl}
                        alt={t("vd.fingerprint", { defaultValue: "Fingerprint" })}
                        openLabel={t("vd.openFingerprint", {
                          defaultValue: "Open fingerprint",
                        })}
                      />
                    </div>
                  )}

                  {data.documentUrl && (
                    <div className="space-y-2 rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {t("vd.document", { defaultValue: "Document" })}
                        </span>
                      </div>
                      <ImagePreview
                        src={data.documentUrl}
                        alt={t("vd.document", { defaultValue: "Document" })}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </>
      ) : null}

      {/* Approve / reject note dialog */}
      <Dialog
        open={decision !== null}
        onOpenChange={(o) => !o && setDecision(null)}
      >
        <DialogContent className="exch-dialog sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {decision === "approve"
                ? t("vd.dialog.approveTitle")
                : t("vd.dialog.rejectTitle")}
            </DialogTitle>
            <DialogDescription>
              {decision === "approve"
                ? t("vd.dialog.approveDesc")
                : t("vd.dialog.rejectDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>
              {decision === "approve"
                ? t("vd.dialog.noteOptional")
                : t("vd.dialog.rejectionReason")}
              {decision === "reject" && (
                <span className="text-destructive"> *</span>
              )}
            </Label>
            <Textarea
              rows={3}
              placeholder={
                decision === "approve"
                  ? t("vd.dialog.approvePlaceholder")
                  : t("vd.dialog.rejectPlaceholder")
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDecision(null)}
              disabled={isSubmitting}
            >
              {t("common:cancel")}
            </Button>
            <Button
              className={
                decision === "approve"
                  ? "wallet-brand-btn"
                  : "bg-destructive text-white hover:bg-destructive/90"
              }
              onClick={submitDecision}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("vd.form.submitting")
                : decision === "approve"
                ? t("vd.approve")
                : t("vd.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ImagePreview = ({
  src,
  alt,
  openLabel,
}: {
  src: string;
  alt: string;
  openLabel?: string;
}) => {
  const { t } = useTranslation("exchange");
  const [rotation, setRotation] = useState(0);
  const sideways = rotation % 180 !== 0;
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-muted p-2">
        <img
          src={src}
          alt={alt}
          className={`w-auto object-contain transition-transform duration-200 ${
            sideways ? "max-h-full max-w-[16rem]" : "max-h-full max-w-full"
          }`}
          style={{ transform: `rotate(${rotation}deg)` }}
          loading="lazy"
        />
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {rotation !== 0 && (
            <button
              type="button"
              onClick={() => setRotation(0)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground"
              title={t("img.reset", { defaultValue: "Reset to original" })}
            >
              <RotateCcwSquare className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground"
            title={t("img.rotate")}
          >
            <RotateCwSquare className="h-4 w-4" />
          </button>
        </div>
      </div>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1 py-1.5 text-xs text-primary hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        {openLabel || t("img.openFull")}
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

export default ExchangeVerificationDetail;
