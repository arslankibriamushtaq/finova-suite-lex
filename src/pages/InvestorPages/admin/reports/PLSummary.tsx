import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  RefreshCw,
  Share2,
  Printer,
  Users,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import TableView from '../../../../components/TableView/TableView';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsContent } from '../../../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import {
  DetailTabsList,
  DetailTabsTrigger,
} from '../../../../components/shared/detailKit';
import {
  LexMetricTile,
  LexNotice,
  LexPageHeader,
} from '../../../../components/shared/lexKit';

const plData = {
  summary: {
    totalInvestment: 32450000,
    currentValue: 38920000,
    unrealizedGains: 5870000,
    realizedGains: 600000,
    totalGains: 6470000,
    totalReturn: 19.93,
    period: '2024 YTD'
  },
  byProduct: [
    {
      id: 1,
      name: 'Large Cap Growth Fund',
      investment: 8500000,
      currentValue: 10370000,
      unrealizedGains: 1620000,
      realizedGains: 250000,
      totalGains: 1870000,
      return: 22.0,
      investors: 245
    },
    {
      id: 2,
      name: 'Fixed Income Plus',
      investment: 6200000,
      currentValue: 6820000,
      unrealizedGains: 520000,
      realizedGains: 100000,
      totalGains: 620000,
      return: 10.0,
      investors: 156
    },
    {
      id: 3,
      name: 'Real Estate Investment Trust',
      investment: 7800000,
      currentValue: 9360000,
      unrealizedGains: 1360000,
      realizedGains: 200000,
      totalGains: 1560000,
      return: 20.0,
      investors: 134
    },
    {
      id: 4,
      name: 'Emerging Markets Equity',
      investment: 4950000,
      currentValue: 4702500,
      unrealizedGains: -247500,
      realizedGains: 0,
      totalGains: -247500,
      return: -5.0,
      investors: 89
    },
    {
      id: 5,
      name: 'Private Equity Fund III',
      investment: 5000000,
      currentValue: 7667500,
      unrealizedGains: 2617500,
      realizedGains: 50000,
      totalGains: 2667500,
      return: 53.35,
      investors: 12
    }
  ],
  byPeriod: [
    { period: 'January 2024', gains: 1200000, return: 3.8 },
    { period: 'February 2024', gains: 950000, return: 2.9 },
    { period: 'March 2024', gains: 1100000, return: 3.3 },
    { period: 'April 2024', gains: 800000, return: 2.4 },
    { period: 'May 2024', gains: 1150000, return: 3.4 },
    { period: 'June 2024', gains: 1270000, return: 3.7 }
  ],
  topPerformers: [
    { investor: 'Goldman Family Office', gains: 2600000, return: 35.2 },
    { investor: 'Sarah Chen', gains: 900000, return: 28.4 },
    { investor: 'John Anderson', gains: 440000, return: 18.0 },
    { investor: 'Emma Thompson', gains: 900000, return: 16.8 },
    { investor: 'Tech Pension Fund', gains: 750000, return: 15.2 }
  ]
};

export default function PLSummary() {
  const { t } = useTranslation('investor');
  const [dateRange, setDateRange] = useState('ytd');
  const [viewBy, setViewBy] = useState('product');

  // SAR, like the rest of the module. `formatCurrencyCompact` went with this
  // pass — it was defined and never called.
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  /** A signed figure: the sign is part of the number, not glued on in markup. */
  const signed = (amount: number) => `${amount > 0 ? '+' : ''}${formatCurrency(amount)}`;

  const toneOf = (value: number) => (value < 0 ? 'text-destructive' : 'text-foreground');

  /**
   * Every figure on this page is a module literal and no endpoint is wired.
   * The old handler waited two seconds and alerted "Report generated" — a
   * progress spinner and a success message for work that never ran.
   */
  const notConnected = () => toast.error(t('invl.notConnected'));

  const productHeaders = [
    {
      name: t('pl.col.product'),
      cell: (row: any) => (
        <span className="truncate text-sm font-medium text-foreground">{row.name}</span>
      ),
      width: '230px',
    },
    {
      name: t('pl.col.investment'),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-sm tabular-nums">
          {formatCurrency(row.investment)}
        </span>
      ),
      width: '150px',
    },
    {
      name: t('pl.col.currentValue'),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-sm tabular-nums">
          {formatCurrency(row.currentValue)}
        </span>
      ),
      width: '150px',
    },
    {
      name: t('pl.col.unrealizedPl'),
      cell: (row: any) => (
        <span
          className={`whitespace-nowrap text-sm font-medium tabular-nums ${toneOf(row.unrealizedGains)}`}
        >
          {signed(row.unrealizedGains)}
        </span>
      ),
      width: '150px',
    },
    {
      // Was hardcoded to a "+" prefix in red, so a product with zero realized
      // gains printed "+SAR 0" as though it had made money.
      name: t('pl.col.realizedPl'),
      cell: (row: any) => (
        <span
          className={`whitespace-nowrap text-sm font-medium tabular-nums ${toneOf(row.realizedGains)}`}
        >
          {signed(row.realizedGains)}
        </span>
      ),
      width: '150px',
    },
    {
      name: t('pl.col.totalPl'),
      cell: (row: any) => (
        <span
          className={`whitespace-nowrap text-sm font-medium tabular-nums ${toneOf(row.totalGains)}`}
        >
          {signed(row.totalGains)}
        </span>
      ),
      width: '150px',
    },
    {
      name: t('pl.col.returnPct'),
      cell: (row: any) => (
        <span
          className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium tabular-nums ${toneOf(row.return)}`}
        >
          {row.return >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {row.return >= 0 ? '+' : ''}
          {row.return.toFixed(2)}%
        </span>
      ),
      width: '130px',
    },
    {
      name: t('pl.col.investors'),
      cell: (row: any) => (
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          {row.investors}
        </span>
      ),
      width: '120px',
    },
  ];

  // The bars used magic divisors — /4 for periods and /40 for investors — so
  // they were only meaningful for the numbers that happened to be in the
  // literal. Scaled against the largest value present instead.
  const maxInvestorReturn = Math.max(...plData.topPerformers.map((i) => i.return), 1);

  const investorHeaders = [
    {
      name: t('pl.col.investor'),
      cell: (row: any, index: number) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold tabular-nums text-foreground">
            {index + 1}
          </span>
          <span className="truncate text-sm font-medium text-foreground">{row.investor}</span>
        </span>
      ),
      width: '260px',
    },
    {
      name: t('pl.col.totalGains'),
      cell: (row: any) => (
        <span
          className={`whitespace-nowrap text-sm font-medium tabular-nums ${toneOf(row.gains)}`}
        >
          {signed(row.gains)}
        </span>
      ),
      width: '170px',
    },
    {
      name: t('pl.col.returnPct'),
      cell: (row: any) => (
        <span
          className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium tabular-nums ${toneOf(row.return)}`}
        >
          {row.return >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {row.return >= 0 ? '+' : ''}
          {row.return.toFixed(1)}%
        </span>
      ),
      width: '140px',
    },
    {
      name: t('pl.col.performance'),
      cell: (row: any) => (
        <span className="block h-2 w-24 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, (row.return / maxInvestorReturn) * 100)}%` }}
          />
        </span>
      ),
      width: '140px',
    },
  ];

  const maxPeriodReturn = Math.max(...plData.byPeriod.map((pd) => Math.abs(pd.return)), 1);

  return (
    <div className="service">
      <LexPageHeader icon={BarChart3} title={t('pl.title')} subtitle={t('pl.subtitle')}>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          {/* Was /admin/reports, which is not a route in this app. */}
          <Link to="/InvestorDashboard/Reports">
            <ArrowLeft className="h-4 w-4" />
            {t('pl.backToReports')}
          </Link>
        </Button>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mtd">{t('pl.range.mtd')}</SelectItem>
            <SelectItem value="qtd">{t('pl.range.qtd')}</SelectItem>
            <SelectItem value="ytd">{t('pl.range.ytd')}</SelectItem>
            <SelectItem value="1y">{t('pl.range.1y')}</SelectItem>
            <SelectItem value="custom">{t('pl.range.custom')}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={notConnected} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('dashboard.refreshData')}
        </Button>
        {/* Share, Print and Export had no onClick at all. */}
        <Button variant="outline" size="sm" onClick={notConnected} className="gap-2">
          <Share2 className="h-4 w-4" />
          {t('pl.share')}
        </Button>
        <Button variant="outline" size="sm" onClick={notConnected} className="gap-2">
          <Printer className="h-4 w-4" />
          {t('pl.print')}
        </Button>
        <Button size="sm" onClick={notConnected} className="gap-2">
          <Download className="h-4 w-4" />
          {t('pl.exportPdf')}
        </Button>
      </LexPageHeader>

      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.sampleDataNotice')}
      </LexNotice>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <LexMetricTile
          label={t('pl.card.totalInvestment')}
          icon={Wallet}
          tone="slate"
          value={formatCurrency(plData.summary.totalInvestment)}
          footnote={plData.summary.period}
        />
        <LexMetricTile
          label={t('pl.card.currentValue')}
          icon={BarChart3}
          tone="sky"
          value={formatCurrency(plData.summary.currentValue)}
          footnote={t('pl.card.marketValue')}
        />
        <LexMetricTile
          label={t('pl.card.unrealizedGains')}
          icon={TrendingUp}
          tone="emerald"
          value={formatCurrency(plData.summary.unrealizedGains)}
          footnote={t('pl.card.paperGains')}
        />
        <LexMetricTile
          label={t('pl.card.realizedGains')}
          icon={DollarSign}
          tone="emerald"
          value={formatCurrency(plData.summary.realizedGains)}
          footnote={t('pl.card.actualGains')}
        />
        <LexMetricTile
          label={t('pl.card.totalReturn')}
          icon={TrendingUp}
          tone="amber"
          value={`${plData.summary.totalReturn.toFixed(2)}%`}
          footnote={t('pl.card.overallPerformance')}
        />
      </div>

      {/* Was a hand-rolled segmented control in bg-gray-100. */}
      <Tabs value={viewBy} onValueChange={setViewBy}>
        <DetailTabsList className="mb-3">
          <DetailTabsTrigger value="product" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('pl.view.byProduct')}
          </DetailTabsTrigger>
          <DetailTabsTrigger value="period" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('pl.view.byPeriod')}
          </DetailTabsTrigger>
          <DetailTabsTrigger value="investor" className="gap-2">
            <Users className="h-4 w-4" />
            {t('pl.view.byInvestor')}
          </DetailTabsTrigger>
        </DetailTabsList>

        <TabsContent value="product">
          <div className="pro-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('pl.plByProduct')}
              </h4>
            </div>
            <TableView header={productHeaders} data={plData.byProduct} paginationShow={false} />
          </div>
        </TabsContent>

        <TabsContent value="period">
          <div className="pro-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <TrendingUp className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('pl.plByPeriod')}
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {plData.byPeriod.map((period) => (
                <div key={period.period} className="rounded-md border p-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <h5 className="m-0 truncate text-sm font-medium text-foreground">
                      {period.period}
                    </h5>
                    {/* TrendingUp was hardcoded, so a negative month would have
                        shown a rising arrow. */}
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium tabular-nums ${toneOf(period.return)}`}
                    >
                      {period.return >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {period.return.toFixed(1)}%
                    </span>
                  </div>
                  <p className={`m-0 text-lg font-semibold tabular-nums ${toneOf(period.gains)}`}>
                    {signed(period.gains)}
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(100, (Math.abs(period.return) / maxPeriodReturn) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="investor">
          <div className="pro-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Users className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('pl.topPerformingInvestors')}
              </h4>
            </div>
            <TableView
              header={investorHeaders}
              data={plData.topPerformers}
              paginationShow={false}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="pro-card mt-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t('pl.portfolioSummary')}
            </h4>
            <p className="m-0 mt-1 text-sm text-muted-foreground">
              {t('pl.summaryText', {
                gains: formatCurrency(plData.summary.totalGains),
                pct: plData.summary.totalReturn.toFixed(2),
                period: plData.summary.period,
              })}
            </p>
          </div>
          <div className="text-end">
            <p className="m-0 text-xs text-muted-foreground">{t('pl.lastUpdated')}</p>
            <p className="m-0 text-sm font-medium text-foreground">
              {t('pl.lastUpdatedAt', {
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
