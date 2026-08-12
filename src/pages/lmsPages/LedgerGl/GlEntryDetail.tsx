import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowLeftRight,
  FileText,
  RefreshCw,
  Undo2,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Field } from "../../../components/shared/detailKit";
import { TONES, formatDateTime, humanizeCode } from "../../../components/shared/detailKitUtils";
import { ledgerErrorMessage } from "../../../utils/ledgerErrors";
import {
  formatGlAmount,
  retryGlEntrySync,
  reverseJournalEntry,
  type GlEntry,
} from "../../../redux/apis/apisLedgerGl";

const STATUS_TONE: Record<string, string> = {
  POSTED: TONES.emerald,
  PENDING: TONES.slate,
  REVERSED: TONES.amber,
  FAILED: TONES.red,
};

export const GlStatusBadge = ({ status }: { status?: string }) => (
  <Badge
    variant="outline"
    className={`border font-medium ${STATUS_TONE[(status || "").toUpperCase()] || TONES.slate}`}
  >
    {humanizeCode(status)}
  </Badge>
);

const SectionTitle = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => (
  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
    <Icon className="h-4 w-4 text-emerald-600" />
    {title}
  </div>
);

/**
 * Entry detail, plus the two corrections an operator can make from it.
 *
 * Both actions are permission-gated by the caller — the buttons are simply not
 * rendered for a role that lacks them, rather than letting the call 403.
 */
const GlEntryDetail = ({
  entry,
  canRetry,
  canReverse,
  onClose,
  onChanged,
}: {
  entry: GlEntry | null;
  canRetry: boolean;
  canReverse: boolean;
  onClose: () => void;
  onChanged: () => void;
}) => {
  const { t } = useTranslation("ledgerGl");
  const [reverseOpen, setReverseOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const [correctionDate, setCorrectionDate] = useState("");
  const [busy, setBusy] = useState(false);

  const closeReverse = () => {
    setReverseOpen(false);
    setReason("");
    setReasonTouched(false);
    setCorrectionDate("");
  };

  const onRetry = async () => {
    if (!entry) return;
    setBusy(true);
    try {
      const res = await retryGlEntrySync(entry.id);
      const result = res?.data?.data ?? res?.data;
      if (result?.alreadySynced) {
        // Two operators working the same failed list is normal, not an error.
        toast.success(result?.message || t("gl.retry.already"));
      } else if (result?.synced) {
        toast.success(result?.message || t("gl.retry.done"));
      } else {
        // Fineract refused or is unreachable — its own words are the useful part.
        toast.error(result?.message || t("gl.retry.refused"));
      }
      onChanged();
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("gl.retry.failed")));
    } finally {
      setBusy(false);
    }
  };

  const onReverse = async () => {
    if (!entry) return;
    if (!reason.trim()) {
      setReasonTouched(true);
      return;
    }
    setBusy(true);
    try {
      const res = await reverseJournalEntry(entry.id, reason.trim(), correctionDate || undefined);
      const result = res?.data?.data ?? res?.data;
      const number = result?.reversalEntryNumber ?? "";
      if (result?.alreadyReversed) {
        // Nothing was posted — reversing a reversal would undo the correction.
        toast.success(t("gl.reverse.already", { entryNumber: number }));
      } else {
        toast.success(t("gl.reverse.done", { entryNumber: number }));
      }
      closeReverse();
      onClose();
      onChanged();
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("gl.reverse.failed")));
    } finally {
      setBusy(false);
    }
  };

  const isPosted = (entry?.status || "").toUpperCase() === "POSTED";

  return (
    <>
      <Dialog open={!!entry && !reverseOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="pro-dialog sm:max-w-3xl">
          <DialogHeader className="min-w-0 text-start">
            <DialogTitle className="truncate">
              {t("gl.detail.title", { entryNumber: entry?.entryNumber ?? "" })}
            </DialogTitle>
            <DialogDescription className="truncate">{entry?.description || ""}</DialogDescription>
          </DialogHeader>

          {entry && (
            <div className="flex max-h-[70vh] min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden">
              <SectionTitle icon={ArrowLeftRight} title={t("gl.detail.summary")} />
              <div className="grid min-w-0 gap-x-6 md:grid-cols-2">
                <div className="min-w-0">
                  <Field label={t("gl.detail.entryDate")} value={entry.entryDate} />
                  <Field label={t("gl.detail.valueDate")} value={entry.valueDate || "—"} />
                  <Field label={t("gl.detail.entryType")} value={humanizeCode(entry.entryType)} />
                  <Field
                    label={t("gl.detail.referenceType")}
                    value={humanizeCode(entry.referenceType)}
                  />
                  <Field
                    label={t("gl.detail.referenceNumber")}
                    value={entry.referenceNumber || "—"}
                    mono
                  />
                  <Field label={t("gl.detail.referenceId")} value={entry.referenceId || "—"} mono />
                </div>
                <div className="min-w-0">
                  <Field label={t("gl.detail.currency")} value={entry.currency} />
                  <Field
                    label={t("gl.detail.status")}
                    value={<GlStatusBadge status={entry.status} />}
                  />
                  <Field
                    label={t("gl.col.sync")}
                    value={entry.fineractSynced ? t("gl.sync.synced") : t("gl.sync.pending")}
                  />
                  <Field
                    label={t("gl.detail.fineractId")}
                    value={entry.fineractJournalEntryId ?? "—"}
                    mono
                  />
                  {/* Both legs of a conversion share this id — it is how the
                      other half of the movement is found. */}
                  <Field
                    label={t("gl.detail.fxTransactionId")}
                    value={entry.fxTransactionId || "—"}
                    mono
                  />
                  {entry.originalEntryId && (
                    <Field
                      label={t("gl.detail.originalEntry")}
                      value={entry.originalEntryId}
                      mono
                    />
                  )}
                  <Field label={t("gl.detail.createdAt")} value={formatDateTime(entry.createdAt)} />
                </div>
              </div>

              <SectionTitle icon={FileText} title={t("gl.detail.lines")} />
              {entry.lines?.length ? (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="p-2 text-start font-medium">{t("gl.detail.line")}</th>
                        <th className="p-2 text-start font-medium">{t("gl.detail.account")}</th>
                        <th className="p-2 text-start font-medium">{t("gl.detail.accountType")}</th>
                        {/* A wallet-to-wallet transfer is Dr 110401 / Cr 110401 —
                            without this column the entry says money moved and
                            not between whom. */}
                        <th className="p-2 text-start font-medium">{t("gl.detail.party")}</th>
                        <th className="p-2 text-end font-medium">{t("gl.col.debit")}</th>
                        <th className="p-2 text-end font-medium">{t("gl.col.credit")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lines.map((line) => (
                        <tr key={line.lineNumber} className="border-t">
                          <td className="p-2">{line.lineNumber}</td>
                          <td className="p-2">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs">{line.accountCode}</span>
                              <span>{line.accountName}</span>
                            </div>
                          </td>
                          <td className="p-2">{line.accountType || "—"}</td>
                          <td className="p-2">
                            {line.subLedgerId ? (
                              <div className="flex min-w-0 flex-col">
                                <span className="text-xs text-muted-foreground">
                                  {humanizeCode(line.subLedgerType ?? undefined) ||
                                    t("gl.detail.party")}
                                </span>
                                {/* The name is a convenience the ledger resolves;
                                    the id is the record, so it stays reachable on
                                    hover and shows when no name came back. */}
                                {line.subLedgerName ? (
                                  <span className="truncate" title={line.subLedgerId}>
                                    {line.subLedgerName}
                                  </span>
                                ) : (
                                  <span
                                    className="truncate font-mono text-xs"
                                    title={line.subLedgerId}
                                  >
                                    {line.subLedgerId}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          {/* Raw columns — they carry no direction of their own. */}
                          <td className="p-2 text-end">
                            {line.debitAmount
                              ? formatGlAmount(line.debitAmount, line.currency || entry.currency)
                              : ""}
                          </td>
                          <td className="p-2 text-end">
                            {line.creditAmount
                              ? formatGlAmount(line.creditAmount, line.currency || entry.currency)
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t bg-muted/30 font-medium">
                      <tr>
                        <td className="p-2" colSpan={4}>
                          {t("gl.detail.totals")}
                        </td>
                        <td className="p-2 text-end">
                          {formatGlAmount(entry.totalDebit, entry.currency)}
                        </td>
                        <td className="p-2 text-end">
                          {formatGlAmount(entry.totalCredit, entry.currency)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("gl.detail.noLines")}</p>
              )}

              {/* An untagged entry is not an entry with no party — it is one
                  posted before the party was recorded. Say which. */}
              {!!entry.lines?.length && !entry.lines.some((line) => line.subLedgerId) && (
                <p className="text-xs text-muted-foreground">{t("gl.detail.noParty")}</p>
              )}

              <div>
                <Badge
                  variant="outline"
                  className={`border gap-1 font-medium ${entry.balanced ? TONES.emerald : TONES.red}`}
                >
                  {!entry.balanced && <AlertTriangle className="h-3 w-3" />}
                  {entry.balanced ? t("gl.detail.balanced") : t("gl.detail.notBalanced")}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            {/* Only a posted entry can be retried or reversed; the server says
                so too, but offering a button that always 422s is not a choice. */}
            {canRetry && isPosted && !entry?.fineractSynced && (
              <Button variant="outline" onClick={onRetry} disabled={busy} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
                {t("gl.retry.action")}
              </Button>
            )}
            {canReverse && isPosted && (
              <Button variant="outline" onClick={() => setReverseOpen(true)} className="gap-2">
                <Undo2 className="h-4 w-4" />
                {t("gl.reverse.action")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reversal — a reason is mandatory, and the entry is never edited */}
      <Dialog open={reverseOpen} onOpenChange={(open) => !open && closeReverse()}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>
              {t("gl.reverse.title", { entryNumber: entry?.entryNumber ?? "" })}
            </DialogTitle>
            <DialogDescription>{t("gl.reverse.explain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="gl-reverse-reason" className="text-sm font-medium">
                {t("gl.reverse.reason")}
              </label>
              <Textarea
                id="gl-reverse-reason"
                rows={3}
                value={reason}
                placeholder={t("gl.reverse.reasonPlaceholder")}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setReasonTouched(true)}
              />
              {reasonTouched && !reason.trim() && (
                <span className="text-xs text-red-600">{t("gl.reverse.reasonRequired")}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="gl-reverse-date" className="text-sm font-medium">
                {t("gl.reverse.date")}
              </label>
              <Input
                id="gl-reverse-date"
                type="date"
                className="h-10"
                value={correctionDate}
                onChange={(e) => setCorrectionDate(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">{t("gl.reverse.dateHint")}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={closeReverse} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button onClick={onReverse} disabled={busy || !reason.trim()} className="gap-2">
              <Undo2 className="h-4 w-4" />
              {t("gl.reverse.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlEntryDetail;
