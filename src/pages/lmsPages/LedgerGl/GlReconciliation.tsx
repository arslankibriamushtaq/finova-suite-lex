import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { CheckCircle2, RefreshCw, Scale, XCircle } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { EmptyState, Field, PermissionDenied } from "../../../components/shared/detailKit";
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
 * One currency's block.
 *
 * `.pro-card` + `.pro-head-badge`, the same surface and icon badge as the page
 * header and as the table card on every other ledger screen.
 * Deliberately not the shared `Block`: that one is `rounded-xl` over an
 * `onb-card` class no stylesheet defines, so it landed on the page with 12px
 * corners and the default border against everything else's 2px and emerald.
 */
const CurrencyCard = ({
  icon: Icon,
  title,
  right,
  children,
}: {
  icon: typeof Scale;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  // p-4, not p-3: `.pro-card.p-3` is the compact filter-bar rule and would crush
  // the vertical padding to 8px.
  <div className="pro-card w-100 p-4">
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="pro-head-badge">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="m-0 text-sm font-semibold tracking-tight">{title}</h3>
      </div>
      {right}
    </div>
    {children}
  </div>
);

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
      {/* align-items-center: the controls are one 40px row against a two-line
          title block, so centring them reads level with it. */}
      <div className="mb-3 pb-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="min-w-0">
          <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
            <span className="pro-head-badge">
              <Scale className="h-4 w-4" />
            </span>
            {t("recon.title")}
            {reconciled !== null && (
              <Badge
                variant="outline"
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
        {/* The date is the page's only filter, so it sits in the header beside
            the title rather than alone in a full-width card. `bg-card` because
            the input ships transparent and would vanish into the page. */}
        <div className="d-flex align-items-center gap-2">
          <Input
            id="recon-date"
            aria-label={t("recon.date")}
            className="h-10 w-auto bg-card"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
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
                <CurrencyCard
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
                </CurrencyCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GlReconciliation;
