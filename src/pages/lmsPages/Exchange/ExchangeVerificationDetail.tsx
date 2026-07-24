import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
  BadgeCheck,
  FileText,
  ExternalLink,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
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
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();

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
          error?.response?.data?.message || "Failed to load verification"
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
      return toast.error("A rejection reason is required");
    setIsSubmitting(true);
    try {
      if (decision === "approve") {
        await approveExchangeVerification(quoteId, {
          note: note.trim() || undefined,
        });
        toast.success("Verification approved — payment unlocked");
      } else {
        await rejectExchangeVerification(quoteId, { note: note.trim() });
        toast.success("Verification rejected");
      }
      setDecision(null);
      load();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to submit decision"
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
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => navigate("/LOS/Exchange/Verifications")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
              <span className="pro-head-badge">
                <ShieldCheck className="h-4 w-4" />
              </span>
              Verification Review
            </h3>
            <p className="mb-0 mt-1 text-sm text-muted-foreground font-mono">
              {quoteId}
            </p>
          </div>
        </div>
        {data && !isLoading && (
          <div className="d-flex align-items-center gap-3">
            <StatusBadge status={data.approvalStatus} />
            {isPending && (
              <>
                <Button
                  variant="outline"
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => openDecision("reject")}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="gap-2 wallet-brand-btn"
                  onClick={() => openDecision("approve")}
                  disabled={!kycVerified}
                >
                  <Check className="h-4 w-4" />
                  Approve
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
            Verification not found for this tenant.
          </CardContent>
        </Card>
      ) : data ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Customer & identity */}
          <Card className="pro-card-glow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                Identity Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <DetailRow label="Customer" value={data.customerName || "-"} />
              <DetailRow label="Customer ID" value={data.customerId} mono />
              <DetailRow label="Country" value={data.countryCode} />
              <DetailRow
                label="KYC Overall"
                value={<StatusBadge status={data.overallStatus} />}
              />
              <DetailRow
                label="Approval"
                value={<StatusBadge status={data.approvalStatus} />}
              />
              <DetailRow
                label="Selfie"
                value={<StatusBadge status={data.selfieStatus} />}
              />
              <DetailRow
                label="Face Match"
                value={
                  data.faceMatchScore == null
                    ? "-"
                    : `${(data.faceMatchScore * 100).toFixed(1)}%`
                }
              />
              {data.approvedBy && (
                <DetailRow label="Decided By" value={data.approvedBy} mono />
              )}
              {data.approvedAt && (
                <DetailRow
                  label="Decided At"
                  value={formatDate(data.approvedAt)}
                />
              )}
              {data.approvalNote && (
                <DetailRow label="Note" value={data.approvalNote} />
              )}
              {data.declineReason && (
                <DetailRow
                  label="Decline Reason"
                  value={
                    <span className="text-destructive">
                      {data.declineReason}
                    </span>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Quote + selfie */}
          <Card className="pro-card-glow">
            <CardHeader>
              <CardTitle className="text-base">Quote &amp; Selfie</CardTitle>
            </CardHeader>
            <CardContent>
              {quote && (
                <div className="space-y-1">
                  <DetailRow label="Provider" value={quote.providerCode} />
                  <DetailRow
                    label="Status"
                    value={<StatusBadge status={quote.status} />}
                  />
                  <DetailRow
                    label="Receiving"
                    value={formatMoney(
                      quote.receivingAmount,
                      quote.receivingCurrency
                    )}
                  />
                  <DetailRow
                    label="Total Paying"
                    value={formatMoney(quote.totalPaying, quote.payingCurrency)}
                  />
                  <DetailRow
                    label="Effective Rate"
                    value={Number(quote.effectiveRate ?? 0)}
                  />
                </div>
              )}
              {data.selfieUrl && (
                <a
                  href={data.selfieUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-3 block overflow-hidden rounded-lg border border-border"
                >
                  <div className="flex items-center justify-center bg-muted p-2">
                    <img
                      src={data.selfieUrl}
                      alt="Selfie"
                      className="max-h-64 w-auto max-w-full object-contain transition group-hover:opacity-90"
                      loading="lazy"
                    />
                  </div>
                  <span className="flex items-center justify-center gap-1 py-1.5 text-xs text-primary">
                    <ExternalLink className="h-3 w-3" />
                    Open selfie
                  </span>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          {documents && documents.length > 0 && (
            <Card className="pro-card-glow lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/15">
                    <FileText className="h-4 w-4" />
                  </span>
                  Documents
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
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block overflow-hidden rounded-lg border border-border"
                        >
                          <div className="flex items-center justify-center bg-muted p-2">
                            <img
                              src={doc.url}
                              alt={doc.documentName}
                              className="max-h-64 w-auto max-w-full object-contain transition group-hover:opacity-90"
                              loading="lazy"
                            />
                          </div>
                          <span className="flex items-center justify-center gap-1 py-1.5 text-xs text-primary">
                            <ExternalLink className="h-3 w-3" />
                            Open full size
                          </span>
                        </a>
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
        </div>
      ) : null}

      {/* Approve / reject note dialog */}
      <Dialog
        open={decision !== null}
        onOpenChange={(o) => !o && setDecision(null)}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {decision === "approve"
                ? "Approve Verification"
                : "Reject Verification"}
            </DialogTitle>
            <DialogDescription>
              {decision === "approve"
                ? "This unlocks the top-up so the customer can pay."
                : "The note is shown to the customer as the rejection reason."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>
              {decision === "approve" ? "Note (optional)" : "Rejection reason"}
              {decision === "reject" && (
                <span className="text-destructive"> *</span>
              )}
            </Label>
            <Textarea
              rows={3}
              placeholder={
                decision === "approve"
                  ? "Documents verified"
                  : "Document image unclear — please re-submit"
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
              Cancel
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
                ? "Submitting…"
                : decision === "approve"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

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
