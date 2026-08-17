import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileBarChart } from "lucide-react";

import { Badge } from "../ui/badge";
import { TONES } from "../shared/detailKitUtils";
import { PermissionDenied } from "../shared/detailKit";
import { useProductPermissions, REPORT_PERMISSIONS } from "../../hooks/useProductPermissions";
import { ReportsCenterProvider } from "./ReportHeader";

// Currency-scoped
import TrialBalance from "./TrialBalance";
import CashFlowReport from "./CashFlowReport";
import PortfolioSummaryReport from "./PortfolioSummaryReport";
import ProfitRevenueReport from "./ProfitRevenueReport";
import WriteOffProvisionsReport from "./WriteOffProvisionsReport";
// Ledger & journal
import Ledger from "./Ledger";
import DayBook from "./DayBook";
import Vouchers from "./Vouchers";
import AccountBalancesReport from "./AccountBalancesReport";
import DailyTransactionSummary from "./DailyTransactionSummary";
import ReconciliationDetailReport from "./ReconciliationDetailReport";
// Lending
import LoanDisbursementReport from "./LoanDisbursementReport";
import LoanBalanceReport from "./LoanBalanceReport";
import LoanHistoryReport from "./LoanHistoryReport";
import RepaymentScheduleReport from "./RepaymentScheduleReport";
import EarlySettlement from "./EarlySettlement";
import CustomerStatementReport from "./CustomerStatementReport";
// Collections & risk
import CollectionReport from "./CollectionReport";
import CollectionsDueReport from "./CollectionsDueReport";
import Due from "./Due";
import OverDue from "./OverDue";
import DpdBucketsReport from "./DpdBucketsReport";
import PerformingLoans from "./PerformingLoans";
import WriteOff from "./WriteOff";
// Profitability & regulatory
import ProductWiseProfitLoss from "./ProductWiseProfitLoss";
import CustomerWiseProfitLoss from "./CustomerWiseProfitLoss";
import SimahReport from "./SimahReport";

/**
 * One entry per report endpoint in the ledger's catalogue.
 *
 * `currencyScoped` marks the five reports that total money and therefore run
 * one currency at a time. Everything else still sums across currencies — that
 * is flagged on screen rather than left for a reader to assume otherwise.
 */
interface ReportEntry {
  key: string;
  labelKey: string;
  element: JSX.Element;
  currencyScoped?: boolean;
}

const CATEGORIES: Record<string, { titleKey: string; reports: ReportEntry[] }> = {
  currency: {
    titleKey: "center.cat.currency",
    reports: [
      {
        key: "trial-balance",
        labelKey: "trialBalance.title",
        element: <TrialBalance />,
        currencyScoped: true,
      },
      {
        key: "cash-flow",
        labelKey: "cashFlow.title",
        element: <CashFlowReport />,
        currencyScoped: true,
      },
      {
        key: "portfolio-summary",
        labelKey: "portfolioSummary.title",
        element: <PortfolioSummaryReport />,
        currencyScoped: true,
      },
      {
        key: "profit-revenue",
        labelKey: "profitRevenue.title",
        element: <ProfitRevenueReport />,
        currencyScoped: true,
      },
      {
        key: "write-off-provisions",
        labelKey: "writeOffProvisions.title",
        element: <WriteOffProvisionsReport />,
        currencyScoped: true,
      },
    ],
  },
  ledger: {
    titleKey: "center.cat.ledger",
    reports: [
      { key: "ledger", labelKey: "center.report.ledger", element: <Ledger /> },
      { key: "day-book", labelKey: "dayBook.title", element: <DayBook /> },
      { key: "journal-vouchers", labelKey: "center.report.vouchers", element: <Vouchers /> },
      { key: "account", labelKey: "accountBalances.title", element: <AccountBalancesReport /> },
      {
        key: "daily-transaction-summary",
        labelKey: "center.report.dailyTransactionSummary",
        element: <DailyTransactionSummary />,
      },
      {
        key: "reconciliation-detail",
        labelKey: "reconciliationDetail.title",
        element: <ReconciliationDetailReport />,
      },
    ],
  },
  lending: {
    titleKey: "center.cat.lending",
    reports: [
      {
        key: "loan-disbursement",
        labelKey: "center.report.loanDisbursement",
        element: <LoanDisbursementReport />,
      },
      {
        key: "loan-balance-outstanding",
        labelKey: "center.report.loanBalance",
        element: <LoanBalanceReport />,
      },
      {
        key: "loan-history",
        labelKey: "center.report.loanHistory",
        element: <LoanHistoryReport />,
      },
      {
        key: "repayment-schedule",
        labelKey: "center.report.repaymentSchedule",
        element: <RepaymentScheduleReport />,
      },
      {
        key: "early-settlement",
        labelKey: "center.report.earlySettlement",
        element: <EarlySettlement />,
      },
      {
        key: "customer-statement",
        labelKey: "center.report.customerStatement",
        element: <CustomerStatementReport />,
      },
    ],
  },
  collections: {
    titleKey: "center.cat.collections",
    reports: [
      { key: "collections", labelKey: "center.report.collections", element: <CollectionReport /> },
      {
        key: "collections-due",
        labelKey: "center.report.collectionsDue",
        element: <CollectionsDueReport />,
      },
      { key: "due-loans", labelKey: "center.report.dueLoans", element: <Due /> },
      { key: "overdue-loans", labelKey: "center.report.overdueLoans", element: <OverDue /> },
      { key: "dpd-buckets", labelKey: "dpdBuckets.title", element: <DpdBucketsReport /> },
      { key: "npl", labelKey: "performingLoans.title", element: <PerformingLoans /> },
      { key: "write-off-loans", labelKey: "center.report.writeOffLoans", element: <WriteOff /> },
    ],
  },
  profitability: {
    titleKey: "center.cat.profitability",
    reports: [
      {
        key: "product-wise-pnl",
        labelKey: "center.report.productWisePnl",
        element: <ProductWiseProfitLoss />,
      },
      {
        key: "customer-wise-pnl",
        labelKey: "center.report.customerWisePnl",
        element: <CustomerWiseProfitLoss />,
      },
      { key: "simah", labelKey: "center.report.simah", element: <SimahReport /> },
    ],
  },
};

/**
 * The reports hub: one page per category, with a picker for the reports inside
 * it. Twenty-seven screens in a flat sidebar list would be unusable, so the
 * sidebar carries five categories and the choice of report lives here.
 */
const ReportsCenter = () => {
  const { t } = useTranslation("reports");
  const { category } = useParams();
  // Hiding the menu entry is not access control — this route is reachable by
  // URL, so the page has to make the same decision the sidebar did.
  const { hasPermission } = useProductPermissions();
  const canRead = hasPermission(REPORT_PERMISSIONS.READ);

  const active = CATEGORIES[category || "currency"] ?? CATEGORIES.currency;
  const [selected, setSelected] = useState(active.reports[0].key);

  // Switching category from the sidebar re-opens on that category's first report.
  useEffect(() => {
    setSelected(active.reports[0].key);
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = useMemo(
    () => active.reports.find((r) => r.key === selected) ?? active.reports[0],
    [active, selected]
  );

  if (!canRead) return <PermissionDenied />;

  return (
    <div className="service col-12">
      {/* Category heading, with the scope of the open report called out on the
          right. The report picker used to sit in a `pro-card` under here, which
          read as a second filter bar stacked above the report's real one — the
          page now carries one heading, one switcher and one filter row. */}
      <div className="mb-3 pb-2 border-bottom d-flex flex-wrap align-items-end justify-content-between gap-3">
        <div>
          <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
            <span className="pro-head-badge">
              <FileBarChart className="h-4 w-4" />
            </span>
            {t(active.titleKey)}
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("center.subtitle")}</p>
        </div>

        <Badge
          variant="outline"
          title={current.currencyScoped ? undefined : t("notCurrencyAware")}
          className={`d-inline-flex align-items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            current.currencyScoped ? TONES.emerald : TONES.slate
          }`}
        >
          <span
            className="rounded-full"
            style={{ width: 6, height: 6, background: "currentColor" }}
          />
          {current.currencyScoped ? t("center.perCurrency") : t("center.notPerCurrency")}
        </Badge>
      </div>

      {/* Every report in the category, laid out. The dropdown this replaces
          named only the open report, so the other six were invisible until you
          opened it. */}
      <div className="report-switch" role="tablist" aria-label={t("center.pickReport")}>
        {active.reports.map((r) => (
          <button
            key={r.key}
            type="button"
            role="tab"
            aria-selected={r.key === current.key}
            className="report-switch__item"
            onClick={() => setSelected(r.key)}
          >
            {t(r.labelKey)}
          </button>
        ))}
      </div>

      {/* Remounting on key change resets each report's own filters and state,
          which is what a user switching reports expects. The provider tells the
          report it is inside the hub, so it drops its own title — the heading
          above and the picker already name it. */}
      <div key={current.key}>
        <ReportsCenterProvider>{current.element}</ReportsCenterProvider>
      </div>
    </div>
  );
};

export default ReportsCenter;
