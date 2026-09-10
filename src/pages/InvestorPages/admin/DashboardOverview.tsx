import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Boxes,
  Building2,
  ClipboardCheck,
  Eye,
  LayoutDashboard,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { EmptyState } from "../../../components/shared/detailKit";
import { LexMetricTile, LexPageHeader } from "../../../components/shared/lexKit";
import { TONES } from "../../../components/shared/detailKitUtils";
import { cn } from "../../../lib/utils";
import { getDashboardInfo } from "../../../redux/apis/apisInvestor";

/**
 * The investor portfolio at a glance.
 *
 * Drawn with the same furniture as every other overview in the product — the
 * page header, the KPI tiles and `TableView` — rather than with a private set
 * of white cards in raw Tailwind greys. That page had drifted far enough that
 * it read as a different application: `text-3xl` headings against the app's
 * `LexPageHeader`, `bg-black` buttons against shadcn's, and a hand-rolled
 * `<table>` next to `TableView` everywhere else. None of its colours came from
 * a token, so none of them followed the tenant theme or dark mode.
 */

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatPercentage = (value: number): string =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

/** A movement in the shape `LexMetricTile` renders in its pill. */
const deltaOf = (value: number, text?: string) => ({
  text: text ?? formatPercentage(value),
  direction: (value >= 0 ? "up" : "down") as "up" | "down",
});

export default function DashboardOverview() {
  const { t } = useTranslation("investor");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getDashboardInfo();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.notificationMessage || "Failed to fetch dashboard data");
      }
    } catch {
      setError(t("dashboard.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pending = dashboardData?.pendingActions;
  const products = dashboardData?.performingProducts || [];

  const productHeaders = [
    {
      name: t("dashboard.col.productName"),
      cell: (row: any) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="pro-head-badge">
            <Boxes className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-medium text-foreground">{row.productName}</p>
            {/* The id is a UUID and no cell is wide enough for one; the first
                block is enough to match a row against a support ticket. */}
            <p className="m-0 font-mono text-[11px] text-muted-foreground">
              {String(row.productId || "").slice(0, 8)}
            </p>
          </div>
        </div>
      ),
      width: "240px",
    },
    {
      name: t("dashboard.stat.totalInvestment"),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-sm font-semibold text-foreground">
          {formatCurrency(row.totalInvestment)}
        </span>
      ),
      width: "170px",
    },
    {
      name: t("dashboard.col.launchYear"),
      cell: (row: any) => <span className="text-sm">{row.launchYear ?? "—"}</span>,
      width: "120px",
    },
    {
      name: t("dashboard.col.investors"),
      cell: (row: any) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          {row.totalInvestors ?? 0}
        </span>
      ),
      width: "130px",
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const tone = row.status === 0 ? "emerald" : row.status === 1 ? "amber" : "slate";
        const label =
          row.status === 0
            ? t("dashboard.status.active")
            : row.status === 1
              ? t("dashboard.status.launching")
              : t("dashboard.status.inactive");
        return (
          <Badge variant="outline" className={`border font-medium ${TONES[tone]}`}>
            {label}
          </Badge>
        );
      },
      width: "130px",
    },
    {
      name: t("common:actions"),
      cell: (row: any) => (
        // The old button carried no handler at all — an Eye icon that did
        // nothing on click. The product view is a real route, so it links.
        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link
            to={`/InvestorDashboard/Products/View/${row.productId}`}
            aria-label={t("common:view")}
          >
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
      width: "90px",
    },
  ];

  return (
    <div className="service">
      <LexPageHeader
        icon={LayoutDashboard}
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          {t("dashboard.refreshData")}
        </Button>
      </LexPageHeader>

      {error ? (
        <div className="pro-card p-4">
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="size-8 text-destructive" />
            <p className="m-0 text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchDashboardData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("dashboard.tryAgain")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* The tiles render through the load rather than being replaced by a
              full-page spinner: the labels are the same either way, so keeping
              the shell means the page does not jump when the figures arrive. */}
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <LexMetricTile
              label={t("dashboard.stat.totalInvestment")}
              icon={Wallet}
              tone="emerald"
              loading={loading}
              value={dashboardData ? formatCurrency(dashboardData.totalInvestment) : undefined}
              delta={
                dashboardData
                  ? deltaOf(dashboardData.quarterlyChangeInInvestment)
                  : undefined
              }
              footnote={
                dashboardData
                  ? `${t("dashboard.period.vsLastQuarter")} · ${t("dashboard.subtext.acrossProducts", { count: dashboardData.totalProducts })}`
                  : undefined
              }
            />
            <LexMetricTile
              label={t("dashboard.stat.totalInvestors")}
              icon={Users}
              tone="sky"
              loading={loading}
              value={dashboardData?.totalInvestors}
              delta={
                dashboardData ? deltaOf(dashboardData.monthlyChangeInInvestor) : undefined
              }
              footnote={
                dashboardData
                  ? `${t("dashboard.period.vsLastMonth")} · ${t("dashboard.subtext.pendingVerification", { count: dashboardData.pendingInvestors })}`
                  : undefined
              }
            />
            <LexMetricTile
              label={t("dashboard.stat.investmentProducts")}
              icon={Boxes}
              tone="slate"
              loading={loading}
              value={dashboardData?.totalProducts}
              delta={
                dashboardData ? deltaOf(dashboardData.quarterlyChangeInProduct) : undefined
              }
              footnote={
                dashboardData
                  ? `${t("dashboard.period.newThisQuarter")} · ${t("dashboard.subtext.activeLaunching", { active: dashboardData.activeProducts, launching: dashboardData.launchingProducts })}`
                  : undefined
              }
            />
            <LexMetricTile
              label={t("dashboard.stat.ytdPerformance")}
              icon={TrendingUp}
              tone="amber"
              loading={loading}
              value={
                dashboardData
                  ? `${(dashboardData.ytdPerformance * 100).toFixed(2)}%`
                  : undefined
              }
              delta={
                dashboardData
                  ? deltaOf(
                      dashboardData.ytdPerformance,
                      formatPercentage(dashboardData.ytdPerformance * 100)
                    )
                  : undefined
              }
              footnote={
                dashboardData
                  ? `${t("dashboard.period.yearToDate")} · ${t("dashboard.subtext.portfolioPerformance")}`
                  : undefined
              }
            />
          </div>

          {/* Everything here is a queue someone has to work through, so all
              three carry the same "needs attention" tone. Colouring them apart
              would imply a difference in urgency the data does not carry. */}
          {pending && (
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <LexMetricTile
                label={t("dashboard.kycVerifications")}
                icon={UserCheck}
                tone="amber"
                value={pending.kycVerificationsPending}
                footnote={t("dashboard.kycVerificationsHint")}
              />
              <LexMetricTile
                label={t("dashboard.kybVerifications")}
                icon={Building2}
                tone="amber"
                value={pending.kybVerificationsPending}
                footnote={t("dashboard.kybVerificationsHint")}
              />
              <LexMetricTile
                label={t("dashboard.productApprovals")}
                icon={ClipboardCheck}
                tone="amber"
                value={pending.pendingProducts}
                footnote={t("dashboard.productApprovalsHint")}
              />
            </div>
          )}

          <div className="pro-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="pro-head-badge">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                  {t("dashboard.topPerformingProducts")}
                </h4>
              </div>
              {/* Was /admin/products, which is not a route in this app — the
                  link 404'd. */}
              <Link
                to="/InvestorDashboard/Products"
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("dashboard.viewAllProducts")}
              </Link>
            </div>

            {!loading && products.length === 0 ? (
              <EmptyState icon={Boxes} text={t("common:noData")} />
            ) : (
              <TableView
                header={productHeaders}
                data={products}
                isLoading={loading}
                paginationShow={false}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
