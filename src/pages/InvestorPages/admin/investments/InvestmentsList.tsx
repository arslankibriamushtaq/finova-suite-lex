import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Download,
  TrendingUp,
  BarChart3,
  Eye,
  Settings,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Edit,
  X,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import TableView from '../../../../components/TableView/TableView';
import { Badge } from '../../../../components/ui/badge';
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
  EmptyState,
} from '../../../../components/shared/detailKit';
import { TONES } from '../../../../components/shared/detailKitUtils';
import {
  LexMetricTile,
  LexNotice,
  LexPageHeader,
  LexSearch,
} from '../../../../components/shared/lexKit';
import { usePermissions } from '../../../../hooks/useProductPermissions';


const investments = [
  {
    id: 1,
    investorName: 'John Anderson',
    investorId: 1,
    productName: 'Large Cap Growth Fund',
    productId: 1,
    investmentAmount: 500000,
    currentValue: 580000,
    unrealizedGain: 80000,
    realizedGain: 15000,
    units: 4545.45,
    entryPrice: 110.00,
    currentPrice: 127.62,
    investmentDate: '2023-01-20',
    lastValuation: '2024-01-22',
    status: 'Active',
    allocationPercentage: 25.5,
    dividendsReceived: 12000,
    performanceYTD: 16.2,
    performanceType: 'positive',
    riskCategory: 'Moderate',
    liquidity: 'Daily'
  },
  {
    id: 2,
    investorName: 'Sarah Chen',
    investorId: 2,
    productName: 'Fixed Income Plus',
    productId: 2,
    investmentAmount: 800000,
    currentValue: 850000,
    unrealizedGain: 50000,
    realizedGain: 25000,
    units: 8500.00,
    entryPrice: 94.12,
    currentPrice: 100.00,
    investmentDate: '2023-02-15',
    lastValuation: '2024-01-22',
    status: 'Active',
    allocationPercentage: 18.7,
    dividendsReceived: 32000,
    performanceYTD: 6.25,
    performanceType: 'positive',
    riskCategory: 'Conservative',
    liquidity: 'Weekly'
  },
  {
    id: 3,
    investorName: 'Michael Rodriguez',
    investorId: 3,
    productName: 'Emerging Markets Equity',
    productId: 3,
    investmentAmount: 300000,
    currentValue: 285000,
    unrealizedGain: -15000,
    realizedGain: 0,
    units: 1250.00,
    entryPrice: 240.00,
    currentPrice: 228.00,
    investmentDate: '2023-06-10',
    lastValuation: '2024-01-22',
    status: 'Under Review',
    allocationPercentage: 12.3,
    dividendsReceived: 0,
    performanceYTD: -5.0,
    performanceType: 'negative',
    riskCategory: 'High',
    liquidity: 'Monthly'
  },
  {
    id: 4,
    investorName: 'Goldman Family Office',
    investorId: 4,
    productName: 'Real Estate Investment Trust',
    productId: 4,
    investmentAmount: 1200000,
    currentValue: 1440000,
    unrealizedGain: 240000,
    realizedGain: 80000,
    units: 4800.00,
    entryPrice: 250.00,
    currentPrice: 300.00,
    investmentDate: '2023-03-05',
    lastValuation: '2024-01-22',
    status: 'Active',
    allocationPercentage: 22.1,
    dividendsReceived: 72000,
    performanceYTD: 20.0,
    performanceType: 'positive',
    riskCategory: 'Moderate-High',
    liquidity: 'Quarterly'
  },
  {
    id: 5,
    investorName: 'Emma Thompson',
    investorId: 5,
    productName: 'Private Equity Fund III',
    productId: 5,
    investmentAmount: 2000000,
    currentValue: 2200000,
    unrealizedGain: 200000,
    realizedGain: 0,
    units: 2000.00,
    entryPrice: 1000.00,
    currentPrice: 1100.00,
    investmentDate: '2023-11-15',
    lastValuation: '2024-01-01',
    status: 'Locked',
    allocationPercentage: 45.2,
    dividendsReceived: 0,
    performanceYTD: 10.0,
    performanceType: 'positive',
    riskCategory: 'High',
    liquidity: 'Illiquid'
  }
];

const allocationLogs = [
  {
    id: 1,
    date: '2024-01-20',
    investorName: 'John Anderson',
    productName: 'Large Cap Growth Fund',
    action: 'invl.action.additional',
    amount: 100000,
    units: 783.12,
    price: 127.62,
    status: 'Completed',
    processedBy: 'reports.generatedBy.systemAuto',
    notes: 'invl.notes.monthlyRecurring'
  },
  {
    id: 2,
    date: '2024-01-18',
    investorName: 'Sarah Chen',
    productName: 'Fixed Income Plus',
    action: 'invl.action.dividendReinvest',
    amount: 8000,
    units: 80.00,
    price: 100.00,
    status: 'Completed',
    processedBy: 'reports.generatedBy.adminUser',
    notes: 'invl.notes.q4Dividend'
  },
  {
    id: 3,
    date: '2024-01-15',
    investorName: 'Michael Rodriguez',
    productName: 'Emerging Markets Equity',
    action: 'invl.action.partialRedemption',
    amount: -50000,
    units: -208.33,
    price: 240.00,
    status: 'Pending',
    processedBy: 'Michael R.',
    notes: 'invl.notes.riskReduction'
  }
];

/** A labelled share bar. Tinted from the brand, not from a raw palette class. */
const Bar = ({ label, count, percent }: { label: string; count: string; percent: number }) => (
  <div>
    <div className="mb-1 flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums text-foreground">{count}</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  </div>
);

export default function InvestmentsList() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_INVESTMENT_MANAGE');
  const { t } = useTranslation('investor');
  const statusKey: Record<string, string> = { 'Active': 'invl.status.active', 'Under Review': 'invl.status.underReview', 'Locked': 'invl.status.locked', 'Pending': 'invl.status.pending', 'Suspended': 'invl.status.suspended', 'Completed': 'invl.status.completed' };
  const tStatus = (v: string) => (statusKey[v] ? t(statusKey[v]) : v);
  const [activeTab, setActiveTab] = useState('investments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [productFilter, setProductFilter] = useState('All Products');
  const [performanceFilter, setPerformanceFilter] = useState('All Performance');
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // SAR, like the rest of the module. This page was the only one formatting
  // in dollars, so the same figure read differently here than on Approve
  // Investment or the ledger.
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  // Active and Suspended were both `bg-red-100 text-red-800` — a running
  // investment and a halted one rendered identically.
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return TONES.emerald;
      case 'Under Review':
      case 'Pending':
        return TONES.amber;
      case 'Suspended':
        return TONES.red;
      case 'Locked':
      default:
        return TONES.slate;
    }
  };

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || investment.status === statusFilter;
    const matchesProduct = productFilter === 'All Products' || investment.productName === productFilter;
    const matchesPerformance = performanceFilter === 'All Performance' ||
      (performanceFilter === 'Positive' && investment.performanceType === 'positive') ||
      (performanceFilter === 'Negative' && investment.performanceType === 'negative');
    return matchesSearch && matchesStatus && matchesProduct && matchesPerformance;
  });

  const totalInvestments = investments.length;
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGains = investments.reduce((sum, inv) => sum + inv.unrealizedGain + inv.realizedGain, 0);
  const avgPerformance = investments.reduce((sum, inv) => sum + inv.performanceYTD, 0) / investments.length;

  const handleViewDetails = (investment: any) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(true);
  };

  const handleEditInvestment = (investment: any) => {
    setSelectedInvestment(investment);
    setShowEditModal(true);
  };

  const handleDeleteInvestment = (investment: any) => {
    setSelectedInvestment(investment);
    setShowDeleteModal(true);
  };

  /**
   * None of these four reach a service.
   *
   * They used to `alert()` "Valuations refreshed", "Data exported", "Updated
   * successfully" and "Deleted successfully" — four claims of success for
   * operations that touch nothing. On a screen of financial records that is
   * worse than a missing feature: it tells an operator a record changed when
   * it did not. Until an endpoint exists they say so.
   */
  const notConnected = () => toast.error(t('invl.notConnected'));

  const handleRefreshValuations = notConnected;

  const handleExportData = notConnected;

  const handleSaveEdit = () => {
    notConnected();
    setShowEditModal(false);
    setSelectedInvestment(null);
  };

  const confirmDelete = () => {
    notConnected();
    setShowDeleteModal(false);
    setSelectedInvestment(null);
  };

  const statusBadge = (status: string) => (
    <Badge variant="outline" className={`border font-medium ${getStatusColor(status)}`}>
      {tStatus(status)}
    </Badge>
  );

  const investmentHeaders = [
    {
      name: t('invl.col.investorProduct'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-medium text-foreground">{row.investorName}</p>
          <p className="m-0 truncate text-xs text-muted-foreground">{row.productName}</p>
          <p className="m-0 text-[11px] text-muted-foreground">
            {t('invl.investedLabel', {
              date: new Date(row.investmentDate).toLocaleDateString(),
            })}
          </p>
        </div>
      ),
      width: '240px',
    },
    {
      name: t('invl.col.investment'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium tabular-nums text-foreground">
            {formatCurrency(row.investmentAmount)}
          </p>
          <p className="m-0 text-xs text-muted-foreground">
            {t('invl.pctPortfolio', { value: row.allocationPercentage })}
          </p>
        </div>
      ),
      width: '160px',
    },
    {
      name: t('invl.col.currentValue'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium tabular-nums text-foreground">
            {formatCurrency(row.currentValue)}
          </p>
          <p className="m-0 text-xs text-muted-foreground">
            {t('invl.lastLabel', { date: new Date(row.lastValuation).toLocaleDateString() })}
          </p>
        </div>
      ),
      width: '170px',
    },
    {
      // Both arrows used to be text-red-500, so a gain and a loss pointed
      // different ways in the same colour and read the same at a glance.
      // Direction is the arrow AND the tone now.
      name: t('invl.col.gainLoss'),
      cell: (row: any) => {
        const positive = row.performanceType === 'positive';
        const Arrow = positive ? ArrowUpRight : ArrowDownLeft;
        return (
          <div className="flex min-w-0 items-start gap-1.5">
            <Arrow
              className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${positive ? 'text-foreground' : 'text-destructive'}`}
            />
            <div className="min-w-0">
              <p
                className={`m-0 text-sm font-medium tabular-nums ${positive ? 'text-foreground' : 'text-destructive'}`}
              >
                {formatCurrency(row.unrealizedGain + row.realizedGain)}
              </p>
              <p className="m-0 text-[11px] text-muted-foreground">
                {t('invl.urLabel', {
                  u: formatCurrency(row.unrealizedGain),
                  r: formatCurrency(row.realizedGain),
                })}
              </p>
            </div>
          </div>
        );
      },
      width: '200px',
    },
    {
      name: t('invl.col.performance'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p
            className={`m-0 text-sm font-medium tabular-nums ${row.performanceType === 'positive' ? 'text-foreground' : 'text-destructive'}`}
          >
            {row.performanceYTD > 0 ? '+' : ''}
            {row.performanceYTD}%
          </p>
          <p className="m-0 text-[11px] text-muted-foreground">{t('invl.ytd')}</p>
        </div>
      ),
      width: '130px',
    },
    {
      name: t('invl.col.unitsPrice'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 text-sm tabular-nums text-foreground">
            {t('invl.unitsLabel', { value: row.units.toLocaleString() })}
          </p>
          <p className="m-0 text-[11px] text-muted-foreground">
            {t('invl.entryCurrent', { entry: row.entryPrice, current: row.currentPrice })}
          </p>
        </div>
      ),
      width: '170px',
    },
    { name: t('common:status'), cell: (row: any) => statusBadge(row.status), width: '140px' },
    {
      name: t('common:actions'),
      cell: (row: any) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleViewDetails(row)}
            title={t('irl.viewDetails')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleEditInvestment(row)}
                title={t('invl.editInvestment')}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                {/* Was /admin/investments/:id/adjust — the route is under
                    /InvestorDashboard, so this link 404'd. */}
                <Link
                  to={`/InvestorDashboard/Investments/${row.id}/adjust`}
                  title={t('invl.adjustInvestment')}
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => handleDeleteInvestment(row)}
                title={t('invl.deleteInvestment')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
      width: '170px',
    },
  ];

  const allocationHeaders = [
    {
      name: t('invl.col.dateAction'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium text-foreground">
            {new Date(row.date).toLocaleDateString()}
          </p>
          <p className="m-0 text-xs text-muted-foreground">{t(row.action)}</p>
        </div>
      ),
      width: '150px',
    },
    {
      name: t('invl.col.investorProduct'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-medium text-foreground">{row.investorName}</p>
          <p className="m-0 truncate text-xs text-muted-foreground">{row.productName}</p>
        </div>
      ),
      width: '220px',
    },
    {
      name: t('invl.col.amountUnits'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p
            className={`m-0 text-sm font-medium tabular-nums ${row.amount > 0 ? 'text-foreground' : 'text-destructive'}`}
          >
            {formatCurrency(Math.abs(row.amount))}
          </p>
          <p className="m-0 text-xs text-muted-foreground">
            {t('invl.unitsLabel', { value: Math.abs(row.units).toLocaleString() })}
          </p>
        </div>
      ),
      width: '170px',
    },
    {
      // Was a bare `${log.price}` — a dollar sign hardcoded into the markup on
      // a page whose other figures are formatted.
      name: t('invl.col.price'),
      cell: (row: any) => (
        <span className="text-sm tabular-nums">{formatCurrency(row.price)}</span>
      ),
      width: '120px',
    },
    { name: t('common:status'), cell: (row: any) => statusBadge(row.status), width: '140px' },
    {
      name: t('invl.col.processedBy'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 text-sm text-foreground">{t(row.processedBy)}</p>
          {row.notes && <p className="m-0 text-xs text-muted-foreground">{t(row.notes)}</p>}
        </div>
      ),
      width: '200px',
    },
  ];

  return (
    <div className="service">
      <LexPageHeader icon={BarChart3} title={t('invl.title')} subtitle={t('invl.subtitle')}>
        <Button variant="outline" size="sm" onClick={handleRefreshValuations} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('invl.refreshValuations')}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2">
          <Download className="h-4 w-4" />
          {t('invl.exportData')}
        </Button>
        {canManage && (
          <Button asChild size="sm" className="gap-2">
            {/* Was /admin/investments/new, which is not a route in this app. */}
            <Link to="/InvestorDashboard/Investments">
              <Plus className="h-4 w-4" />
              {t('invl.newInvestment')}
            </Link>
          </Button>
        )}
      </LexPageHeader>

      {/* Every figure and row on this page is a module-level literal — there is
          no fetch in this file at all. Saying so is not decoration: the names
          and amounts look exactly like records, and an operator has no other
          way to tell. Delete this notice when the endpoint lands. */}
      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.sampleDataNotice')}
      </LexNotice>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t('invl.totalInvestments')}
          icon={BarChart3}
          tone="sky"
          value={totalInvestments}
          footnote={t('invl.acrossProducts')}
        />
        <LexMetricTile
          label={t('invl.totalValue')}
          icon={DollarSign}
          tone="emerald"
          value={formatCurrency(totalValue)}
          footnote={t('invl.overallPlus')}
        />
        <LexMetricTile
          label={t('invl.totalGains')}
          icon={TrendingUp}
          tone="slate"
          value={formatCurrency(totalGains)}
          footnote={t('invl.realizedUnrealized')}
        />
        <LexMetricTile
          label={t('invl.avgPerformance')}
          icon={Users}
          tone="amber"
          value={`${avgPerformance.toFixed(1)}%`}
          footnote={t('invl.ytdWeighted')}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <DetailTabsList className="mb-3">
          <DetailTabsTrigger value="investments" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('invl.tab.investments')}
          </DetailTabsTrigger>
          <DetailTabsTrigger value="allocations" className="gap-2">
            <Calendar className="h-4 w-4" />
            {t('invl.tab.allocations')}
          </DetailTabsTrigger>
          <DetailTabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('invl.tab.analytics')}
          </DetailTabsTrigger>
        </DetailTabsList>

        <TabsContent value="investments">
          <div className="pro-card p-3 mb-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <LexSearch
                id="investments-search"
                className="flex-1"
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t('invl.searchPlaceholder')}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">{t('invl.allStatus')}</SelectItem>
                  <SelectItem value="Active">{t('invl.status.active')}</SelectItem>
                  <SelectItem value="Under Review">{t('invl.status.underReview')}</SelectItem>
                  <SelectItem value="Locked">{t('invl.status.locked')}</SelectItem>
                  <SelectItem value="Suspended">{t('invl.status.suspended')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger className="w-full lg:w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Performance">{t('invl.allPerformance')}</SelectItem>
                  <SelectItem value="Positive">{t('invl.positiveReturns')}</SelectItem>
                  <SelectItem value="Negative">{t('invl.negativeReturns')}</SelectItem>
                </SelectContent>
              </Select>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {t('invl.countLabel', {
                  shown: filteredInvestments.length,
                  total: investments.length,
                })}
              </span>
            </div>
          </div>

          <div className="pro-card p-4">
            {filteredInvestments.length === 0 ? (
              <EmptyState icon={BarChart3} text={t('common:noData')} />
            ) : (
              <TableView
                header={investmentHeaders}
                data={filteredInvestments}
                paginationShow={false}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="allocations">
          <div className="pro-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Calendar className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('invl.recentAllocations')}
              </h4>
            </div>
            <TableView header={allocationHeaders} data={allocationLogs} paginationShow={false} />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="pro-card p-4">
              <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
                {t('invl.performanceDistribution')}
              </h4>
              <div className="space-y-3">
                {/* The split was hardcoded at 80/20 with counts of 4 and 1,
                    unrelated to the rows above. Counted from the data, so the
                    bars move when the data does. */}
                {(() => {
                  const positive = investments.filter(
                    (i) => i.performanceType === 'positive'
                  ).length;
                  const negative = investments.length - positive;
                  const share = (n: number) =>
                    investments.length ? (n / investments.length) * 100 : 0;
                  return (
                    <>
                      <Bar
                        label={t('invl.positivePerformers')}
                        count={t('invl.investmentsPlural', { count: positive })}
                        percent={share(positive)}
                      />
                      <Bar
                        label={t('invl.negativePerformers')}
                        count={t('invl.investmentsPlural', { count: negative })}
                        percent={share(negative)}
                      />
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="pro-card p-4">
              <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
                {t('invl.riskAnalysis')}
              </h4>
              <dl className="space-y-2 text-sm">
                {(
                  [
                    ['Conservative', 'invl.risk.conservative'],
                    ['Moderate', 'invl.risk.moderate'],
                    ['Moderate-High', 'invl.risk.moderateHigh'],
                    ['High Risk', 'invl.risk.highRisk'],
                  ] as const
                ).map(([category, key]) => (
                  <div key={category} className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{t(key)}</dt>
                    <dd className="m-0 font-medium tabular-nums text-foreground">
                      {t('invl.investmentsPlural', {
                        count: investments.filter((i) => i.riskCategory === category).length,
                      })}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="pro-card p-4 lg:col-span-2">
              <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
                {t('invl.recentTrends')}
              </h4>
              <EmptyState icon={BarChart3} text={t('invl.chartsPlaceholder')} />
            </div>
          </div>
        </TabsContent>
      </Tabs>


      {/* Investment Details Modal */}
      {showDetailsModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('invl.detailsTitle')}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invl.investor')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestment.investorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invl.product')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestment.productName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invl.investmentAmount')}</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvestment.investmentAmount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invl.col.currentValue')}</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvestment.currentValue)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:status')}</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvestment.status)}`}>
                    {tStatus(selectedInvestment.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invl.units')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestment.units.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invl.entryPrice')}</label>
                  <p className="text-sm text-gray-900">${selectedInvestment.entryPrice}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invl.currentPrice')}</label>
                  <p className="text-sm text-gray-900">${selectedInvestment.currentPrice}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invl.ytdPerformance')}</label>
                  <p className={`text-sm font-medium ${
                    selectedInvestment.performanceType === 'positive' ? 'text-slate-500' : 'text-red-600'
                  }`}>
                    {selectedInvestment.performanceYTD > 0 ? '+' : ''}{selectedInvestment.performanceYTD}%
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invl.totalGainLoss')}</label>
                  <p className={`text-sm font-medium ${
                    selectedInvestment.performanceType === 'positive' ? 'text-slate-500' : 'text-red-600'
                  }`}>
                    {formatCurrency(selectedInvestment.unrealizedGain + selectedInvestment.realizedGain)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:close')}
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditInvestment(selectedInvestment);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                {t('invl.editInvestment')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Investment Modal */}
      {showEditModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('invl.editTitle')}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('invl.investmentAmount')}</label>
                  <input
                    type="number"
                    defaultValue={selectedInvestment.investmentAmount}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('invl.units')}</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={selectedInvestment.units}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('invl.entryPrice')}</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={selectedInvestment.entryPrice}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common:status')}</label>
                  <select
                    defaultValue={selectedInvestment.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  >
                    <option value="Active">{t('invl.status.active')}</option>
                    <option value="Under Review">{t('invl.status.underReview')}</option>
                    <option value="Locked">{t('invl.status.locked')}</option>
                    <option value="Suspended">{t('invl.status.suspended')}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common:cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  {t('common:saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('invl.deleteTitle')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {t('invl.deleteConfirm', { name: selectedInvestment.investorName, product: selectedInvestment.productName })}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
              >
                {t('invl.deleteInvestment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
