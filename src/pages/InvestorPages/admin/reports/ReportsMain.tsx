import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
  Clock,
  RefreshCw,
  Eye,
  Mail,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsContent } from '../../../../components/ui/tabs';
import {
  DetailTabsList,
  DetailTabsTrigger,
} from '../../../../components/shared/detailKit';
import { TONES } from '../../../../components/shared/detailKitUtils';
import {
  LexMetricTile,
  LexNotice,
  LexPageHeader,
} from '../../../../components/shared/lexKit';

const reportCategories = [
  {
    id: 'performance',
    name: 'reports.cat.performance.name',
    description: 'reports.cat.performance.description',
    icon: TrendingUp,
    color: 'red',
    reports: [
      { id: 'pl-summary', name: 'reports.item.plSummary.name', description: 'reports.item.plSummary.desc', frequency: 'Daily', lastGenerated: '2024-01-22' },
      { id: 'portfolio-analytics', name: 'reports.item.portfolioAnalytics.name', description: 'reports.item.portfolioAnalytics.desc', frequency: 'Weekly', lastGenerated: '2024-01-20' },
      { id: 'benchmark-comparison', name: 'reports.item.benchmarkComparison.name', description: 'reports.item.benchmarkComparison.desc', frequency: 'Monthly', lastGenerated: '2024-01-15' },
      { id: 'risk-metrics', name: 'reports.item.riskMetrics.name', description: 'reports.item.riskMetrics.desc', frequency: 'Weekly', lastGenerated: '2024-01-20' }
    ]
  },
  {
    id: 'financial',
    name: 'reports.cat.financial.name',
    description: 'reports.cat.financial.description',
    icon: DollarSign,
    color: 'blue',
    reports: [
      { id: 'balance-sheet', name: 'reports.item.balanceSheet.name', description: 'reports.item.balanceSheet.desc', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'income-statement', name: 'reports.item.incomeStatement.name', description: 'reports.item.incomeStatement.desc', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'cash-flow', name: 'reports.item.cashFlow.name', description: 'reports.item.cashFlow.desc', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'fee-analysis', name: 'reports.item.feeAnalysis.name', description: 'reports.item.feeAnalysis.desc', frequency: 'Monthly', lastGenerated: '2024-01-01' }
    ]
  },
  {
    id: 'investor',
    name: 'reports.cat.investor.name',
    description: 'reports.cat.investor.description',
    icon: Users,
    color: 'purple',
    reports: [
      { id: 'investor-statements', name: 'reports.item.investorStatements.name', description: 'reports.item.investorStatements.desc', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'allocation-reports', name: 'reports.item.allocationReports.name', description: 'reports.item.allocationReports.desc', frequency: 'Quarterly', lastGenerated: '2023-12-31' },
      { id: 'transaction-summary', name: 'reports.item.transactionSummary.name', description: 'reports.item.transactionSummary.desc', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'tax-reports', name: 'reports.item.taxReports.name', description: 'reports.item.taxReports.desc', frequency: 'Annual', lastGenerated: '2023-12-31' }
    ]
  },
  {
    id: 'compliance',
    name: 'reports.cat.compliance.name',
    description: 'reports.cat.compliance.description',
    icon: AlertTriangle,
    color: 'red',
    reports: [
      { id: 'regulatory-filing', name: 'reports.item.regulatoryFiling.name', description: 'reports.item.regulatoryFiling.desc', frequency: 'Quarterly', lastGenerated: '2023-12-31' },
      { id: 'audit-trail', name: 'reports.item.auditTrail.name', description: 'reports.item.auditTrail.desc', frequency: 'Daily', lastGenerated: '2024-01-22' },
      { id: 'compliance-monitoring', name: 'reports.item.complianceMonitoring.name', description: 'reports.item.complianceMonitoring.desc', frequency: 'Weekly', lastGenerated: '2024-01-20' },
      { id: 'risk-compliance', name: 'reports.item.riskCompliance.name', description: 'reports.item.riskCompliance.desc', frequency: 'Daily', lastGenerated: '2024-01-22' }
    ]
  }
];

const recentReports = [
  {
    id: 1,
    name: 'reports.recent.decPl.name',
    type: 'reports.item.plSummary.name',
    generatedDate: '2024-01-02',
    generatedBy: 'reports.generatedBy.systemAuto',
    status: 'Completed',
    size: '2.4 MB',
    downloads: 23
  },
  {
    id: 2,
    name: 'reports.recent.q4Analytics.name',
    type: 'reports.item.portfolioAnalytics.name',
    generatedDate: '2024-01-02',
    generatedBy: 'reports.generatedBy.adminUser',
    status: 'Completed',
    size: '8.7 MB',
    downloads: 15
  },
  {
    id: 3,
    name: 'reports.recent.janStatements.name',
    type: 'reports.item.investorStatements.name',
    generatedDate: '2024-01-22',
    generatedBy: 'reports.generatedBy.systemAuto',
    status: 'Processing',
    size: '-',
    downloads: 0
  },
  {
    id: 4,
    name: 'reports.recent.riskCompliance.name',
    type: 'reports.item.riskCompliance.name',
    generatedDate: '2024-01-22',
    generatedBy: 'reports.generatedBy.riskSystem',
    status: 'Completed',
    size: '1.2 MB',
    downloads: 8
  }
];

export default function ReportsMain() {
  const { t } = useTranslation('investor');
  const [activeCategory, setActiveCategory] = useState('performance');

  // Completed and Failed were both `bg-red-100 text-red-800` — a finished
  // report and a broken one looked the same in the list.
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return TONES.emerald;
      case 'Processing':
        return TONES.amber;
      case 'Failed':
        return TONES.red;
      default:
        return TONES.slate;
    }
  };

  /**
   * Nothing on this page is wired: the categories, the recent list and the four
   * headline figures are all module literals, and generating, scheduling and
   * emailing have no endpoints. Saying so beats an alert that claims the work
   * was done.
   */
  const notConnected = () => toast.error(t('invl.notConnected'));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="service">
      <LexPageHeader icon={FileText} title={t('reports.title')} subtitle={t('reports.subtitle')}>
        <Button variant="outline" size="sm" onClick={notConnected} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('reports.refreshStatus')}
        </Button>
        <Button variant="outline" size="sm" onClick={notConnected} className="gap-2">
          <Calendar className="h-4 w-4" />
          {t('reports.scheduleReport')}
        </Button>
        {/* Was a Link to /admin/reports/generate, which is not a route — there
            is no generate screen at all, so it is a button that says so. */}
        <Button size="sm" onClick={notConnected} className="gap-2">
          <FileText className="h-4 w-4" />
          {t('reports.generateReport')}
        </Button>
      </LexPageHeader>

      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.sampleDataNotice')}
      </LexNotice>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t('reports.stat.reportsGenerated')}
          icon={FileText}
          tone="sky"
          value="1,247"
          footnote={t('reports.stat.thisMonth')}
        />
        <LexMetricTile
          label={t('reports.stat.activeSchedules')}
          icon={Clock}
          tone="emerald"
          value="23"
          footnote={t('reports.stat.automatedReports')}
        />
        <LexMetricTile
          label={t('reports.stat.totalDownloads')}
          icon={Download}
          tone="slate"
          value="5,432"
          footnote={t('reports.stat.allTime')}
        />
        <LexMetricTile
          label={t('reports.stat.processingQueue')}
          icon={RefreshCw}
          tone="amber"
          value="3"
          footnote={t('reports.stat.reportsPending')}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="pro-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('reports.categoriesTitle')}
              </h4>
            </div>

            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <DetailTabsList className="mb-3">
                {reportCategories.map((category) => (
                  <DetailTabsTrigger key={category.id} value={category.id} className="gap-2">
                    <category.icon className="h-4 w-4" />
                    {t(category.name)}
                  </DetailTabsTrigger>
                ))}
              </DetailTabsList>

              {reportCategories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <p className="mb-3 text-xs text-muted-foreground">{t(category.description)}</p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {category.reports.map((report) => (
                      <div
                        key={report.id}
                        className="rounded-md border p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h5 className="m-0 truncate text-sm font-medium text-foreground">
                              {t(report.name)}
                            </h5>
                            <p className="m-0 text-xs leading-snug text-muted-foreground">
                              {t(report.description)}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                              {/* Every id here has a real route under
                                  /InvestorDashboard/Reports — the prefix was
                                  /admin/reports, so all sixteen 404'd. */}
                              <Link
                                to={`/InvestorDashboard/Reports/${report.id}`}
                                title={t('reports.viewReport')}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={notConnected}
                              title={t('reports.generateNow')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          <span>
                            {t('reports.frequencyLabel', {
                              frequency: t(`reports.freq.${report.frequency}`),
                            })}
                          </span>
                          <span>
                            {t('reports.lastLabel', { date: formatDate(report.lastGenerated) })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        <div className="space-y-3">
          <div className="pro-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="pro-head-badge">
                  <Clock className="h-4 w-4" />
                </span>
                <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                  {t('reports.recentReports')}
                </h4>
              </div>
              {/* Was a Link to /admin/reports/history — no such route exists. */}
              <button
                type="button"
                onClick={notConnected}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t('reports.viewAll')}
              </button>
            </div>

            <div className="divide-y">
              {recentReports.map((report) => (
                <div key={report.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h5 className="m-0 truncate text-sm font-medium text-foreground">
                        {t(report.name)}
                      </h5>
                      <p className="m-0 truncate text-xs text-muted-foreground">{t(report.type)}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
                        <span>{formatDate(report.generatedDate)}</span>
                        <span>{t('reports.byLabel', { name: t(report.generatedBy) })}</span>
                        {report.size !== '-' && <span>{report.size}</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`border font-medium ${getStatusColor(report.status)}`}
                      >
                        {t(`reports.reportStatus.${report.status}`)}
                      </Badge>
                      {report.status === 'Completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={notConnected}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {report.downloads > 0 && (
                    <p className="m-0 mt-1 text-[11px] text-muted-foreground">
                      {t('reports.downloadedTimes', { count: report.downloads })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pro-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <TrendingUp className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('reports.quickActions')}
              </h4>
            </div>
            <div className="space-y-2">
              <QuickLink
                to="/InvestorDashboard/Reports/pl"
                icon={TrendingUp}
                label={t('reports.generatePlSummary')}
              />
              <QuickLink
                to="/InvestorDashboard/Reports/analytics"
                icon={BarChart3}
                label={t('reports.item.portfolioAnalytics.name')}
              />
              <QuickLink onClick={notConnected} icon={Mail} label={t('reports.emailReports')} />
              <QuickLink
                onClick={notConnected}
                icon={Calendar}
                label={t('reports.scheduleReport')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A quick action. Two of the four navigate and two do not, and before this all
 * four were styled identically — two Links and two handler-less buttons, with
 * a "→" glyph standing in for an arrow icon.
 */
const QuickLink = ({
  to,
  onClick,
  icon: Icon,
  label,
}: {
  to?: string;
  onClick?: () => void;
  icon: typeof FileText;
  label: string;
}) => {
  const inner = (
    <>
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="pro-head-badge">
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-sm font-medium text-foreground">{label}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </>
  );

  const className =
    'group flex w-full items-center justify-between gap-3 rounded-md border p-3 text-start transition-colors hover:border-primary/40 hover:bg-accent/40';

  return to ? (
    <Link to={to} className={className}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
};
