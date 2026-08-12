import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { CheckCircle2, Info, RefreshCw, Scale, XCircle } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Block, EmptyState, Field, PermissionDenied } from "../../../components/shared/detailKit";
import { FilterField } from "../../../components/shared/filterKit";
import { TONES, humanizeCode } from "../../../components/shared/detailKitUtils";
import { useProductPermissions, LEDGER_GL_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { ledgerErrorMessage } from "../../../utils/ledgerErrors";
import {
  formatGlAmount,
  getGlDailySummary,
  getGlReconciliation,
  type GlDailySummaryCurrency,
  type GlReconciliationCurrency,
} from "../../../redux/apis/apisLedgerGl";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Daily summary and reconciliation, one block per currency.
 *
 * There is no grand total anywhere on this page and there must never be one:
 * adding 100 CAD to 73 USD produces a number that means nothing. Each currency
 * balances, or does not, on its own.
 */
const GlReconciliation = () => {
  const { t } = useTranslation("ledgerGl");
  const { hasPermission } = useProductPermissions();
  const canRead = hasPermission(LEDGER_GL_PERMISSIONS.READ);

  const [date, setDate] = useState(today());
  const [summary, setSummary] = useState<GlDailySummaryCurrency[]>([]);
  const [recon, setRecon] = useState<GlReconciliationCurrency[]>([]);
  const [reconciled, setReconciled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    if (!canRead || !date) return;
    setIsLoading(true);
    try {
      const [summaryRes, reconRes] = await Promise.all([
        getGlDailySummary(date),
        getGlReconciliation(date),
      ]);
      setSummary(summaryRes?.data?.data?.currencies ?? []);
      const reconBody = reconRes?.data?.data;
      setRecon(reconBody?.currencies ?? []);
      setReconciled(reconBody?.reconciled ?? null);
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("recon.toast.loadFailed")));
      setSummary([]);
      setRecon([]);
      setReconciled(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  if (!canRead) return <PermissionDenied />;

  const reconByCurrency = new Map(recon.map((c) => [c.currency, c]));
  // A currency can appear in either response; show every one that appears.
  const currencies = Array.from(
    new Set([...summary.map((c) => c.currency), ...recon.map((c) => c.currency)])
  ).sort();

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <Scale className="h-4 w-4" />
          </span>
          {t("recon.title")}
          {reconciled !== null && (
            <Badge
              variant="outline"
              title={t("recon.reconciledHint")}
              className={`border gap-1 font-medium ${reconciled ? TONES.emerald : TONES.amber}`}
            >
              {reconciled ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {reconciled ? t("recon.reconciled") : t("recon.notReconciled")}
            </Badge>
          )}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("recon.subtitle")}</p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FilterField label={t("recon.date")} htmlFor="recon-date">
            <Input
              id="recon-date"
              className="h-10 sm:w-56"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FilterField>
          <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-start gap-2 rounded-sm border border-dashed p-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{t("recon.reconciledHint")}</span>
          </div>
          {/* Fineract sync has never run, so this figure is expected to equal
              the entry count on every day until it is switched on. */}
          <div className="flex items-start gap-2 rounded-sm border border-dashed p-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{t("recon.syncNote")}</span>
          </div>
        </div>
      </div>

      {currencies.length === 0 ? (
        <div className="pro-card">
          <EmptyState icon={Scale} text={t("recon.empty")} />
        </div>
      ) : (
        <div className="row gy-3">
          {currencies.map((code) => {
            const s = summary.find((c) => c.currency === code);
            const r = reconByCurrency.get(code);
            const balanced = r?.balanced ?? s?.balanced;
            return (
              <div key={code} className="col-12 col-xl-6 d-flex">
                <Block
                  className="w-100"
                  icon={Scale}
                  title={code}
                  right={
                    balanced !== undefined && (
                      <Badge
                        variant="outline"
                        className={`border font-medium ${balanced ? TONES.emerald : TONES.red}`}
                      >
                        {balanced ? t("recon.balanced") : t("recon.unbalanced")}
                      </Badge>
                    )
                  }
                >
                  <div className="grid gap-x-6 md:grid-cols-2">
                    <div className="min-w-0">
                      <Field
                        label={t("recon.entries")}
                        value={r?.totalEntries ?? s?.totalEntries ?? "—"}
                      />
                      <Field
                        label={t("recon.debits")}
                        value={formatGlAmount(r?.totalDebits ?? s?.totalDebits, code)}
                      />
                      <Field
                        label={t("recon.credits")}
                        value={formatGlAmount(r?.totalCredits ?? s?.totalCredits, code)}
                      />
                      {r && (
                        <Field
                          label={t("recon.difference")}
                          value={formatGlAmount(r.difference, code)}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      {r && (
                        <>
                          <Field label={t("recon.synced")} value={r.syncedToFineract} />
                          <Field label={t("recon.pendingSync")} value={r.pendingFineractSync} />
                          <Field label={t("recon.failed")} value={r.failedEntries} />
                        </>
                      )}
                    </div>
                  </div>

                  {!!s?.byStatus?.length && (
                    <div className="mt-3">
                      <div className="mb-1 text-xs font-semibold text-muted-foreground">
                        {t("recon.byStatus")}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {s.byStatus.map((b) => (
                          <Badge
                            key={b.status}
                            variant="outline"
                            className={`border font-medium ${TONES.slate}`}
                          >
                            {humanizeCode(b.status)}: {b.count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {!!s?.byTransactionType?.length && (
                    <div className="mt-3">
                      <div className="mb-1 text-xs font-semibold text-muted-foreground">
                        {t("recon.byType")}
                      </div>
                      <div className="flex flex-col gap-1">
                        {s.byTransactionType.map((b) => (
                          <div
                            key={b.transactionType}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="text-muted-foreground">
                              {humanizeCode(b.transactionType)} · {b.count}
                            </span>
                            <span className="font-medium">
                              {formatGlAmount(b.totalAmount, code)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Block>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GlReconciliation;
