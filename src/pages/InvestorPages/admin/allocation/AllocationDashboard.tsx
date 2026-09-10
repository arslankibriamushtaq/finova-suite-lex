import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Play,
  FileText,
  Zap,
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { TONES, TONE_HEX } from '../../../../components/shared/detailKitUtils';
import {
  LexMetricTile,
  LexNotice,
  LexPageHeader,
} from '../../../../components/shared/lexKit';
import { usePermissions } from '../../../../hooks/useProductPermissions';

// Mock data for KPIs
const kpiData = {
  activeStrategies: 12,
  totalAllocated: 8500000000, // 8.5B SAR
  avgInvestorExposure: 34.2,
  lastSimulationStatus: 'success', // success, failure, running
  lastSimulationTime: '2024-01-22T15:30:00Z'
};

// Mock data for allocation by risk band
// Low and high used to be the same `bg-red-500`, so the safest band and the
// riskiest one drew identical bars. `tone` is the shared vocabulary now.
const allocationByRisk = [
  { riskBand: 'ad.riskBand.low', amount: 3200000000, percentage: 37.6, tone: 'emerald' },
  { riskBand: 'ad.riskBand.medium', amount: 3800000000, percentage: 44.7, tone: 'amber' },
  { riskBand: 'ad.riskBand.high', amount: 1500000000, percentage: 17.7, tone: 'red' },
];

// Mock data for exposure heatmap
const exposureHeatmap = [
  { product: 'ad.product.pos', lowRisk: 45, mediumRisk: 35, highRisk: 20 },
  { product: 'ad.product.auto', lowRisk: 60, mediumRisk: 30, highRisk: 10 },
  { product: 'ad.product.msme', lowRisk: 25, mediumRisk: 45, highRisk: 30 },
  { product: 'ad.product.realEstate', lowRisk: 40, mediumRisk: 40, highRisk: 20 },
  { product: 'ad.product.consumer', lowRisk: 30, mediumRisk: 50, highRisk: 20 }
];

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: 'strategy_executed',
    strategy: 'High Risk Preferred V2',
    amount: 125000000,
    timestamp: '2024-01-22T14:30:00Z',
    status: 'success'
  },
  {
    id: 2,
    type: 'allocation_limit_exceeded',
    strategy: 'Conservative Allocation',
    amount: 250000000,
    timestamp: '2024-01-22T13:15:00Z',
    status: 'warning'
  },
  {
    id: 3,
    type: 'simulation_completed',
    strategy: 'Balanced Growth',
    amount: 180000000,
    timestamp: '2024-01-22T12:45:00Z',
    status: 'success'
  },
  {
    id: 4,
    type: 'manual_override',
    strategy: 'Emergency Allocation',
    amount: 75000000,
    timestamp: '2024-01-22T11:20:00Z',
    status: 'manual'
  }
];

export default function AllocationDashboard() {
  // Strategies are readable on PORTFOLIO_ALLOCATION_READ; authoring, cloning,
  // enabling and deleting them is _ALLOCATION_MANAGE.
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_ALLOCATION_MANAGE');
  const { t } = useTranslation('investor');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  /**
   * Nothing on this page comes from a service, so refreshing cannot fetch.
   * It used to spin for two seconds and stop — a progress indicator for work
   * that never happened, which reads as "the figures are now current".
   */
  const handleRefresh = () => {
    toast.error(t('invl.notConnected'));
  };

  // A success tick and an error triangle were both text-red-500, which is the
  // one pair on this page that must not look alike.
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'manual':
        return <Users className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusTone = (status: string) => {
    switch (status) {
      case 'success':
        return TONES.emerald;
      case 'warning':
        return TONES.amber;
      case 'error':
        return TONES.red;
      default:
        return TONES.slate;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'strategy_executed': return t('ad.activity.strategyExecuted');
      case 'allocation_limit_exceeded': return t('ad.activity.limitExceeded');
      case 'simulation_completed': return t('ad.activity.simulationComplete');
      case 'manual_override': return t('ad.activity.manualOverride');
      default: return t('ad.activity.unknown');
    }
  };

  /**
   * A heat scale has to be monotonic. The old one ran red → yellow → grey →
   * RED again, so a 10% cell and a 60% cell were the same colour: the two ends
   * of the range read identically and the map said nothing.
   */
  const getHeatmapTone = (value: number) => {
    if (value >= 50) return TONES.red;
    if (value >= 30) return TONES.amber;
    if (value >= 15) return TONES.sky;
    return TONES.slate;
  };

  return (
    <div className="service">
      <LexPageHeader icon={Zap} title={t('ad.title')} subtitle={t('ad.subtitle')}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('dashboard.refreshData')}
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          {/* Was /admin/allocation/audit, which is not a route here. */}
          <Link to="/InvestorDashboard/AllocationEngine/audit">
            <FileText className="h-4 w-4" />
            {t('ad.viewAuditLogs')}
          </Link>
        </Button>
      </LexPageHeader>

      {/* Every figure below is a module-level literal — kpiData, allocationByRisk,
          exposureHeatmap and recentActivities are all hardcoded and there is no
          fetch in this file. Delete this notice when the engine is wired. */}
      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.sampleDataNotice')}
      </LexNotice>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t('ad.activeStrategies')}
          icon={Zap}
          tone="sky"
          value={kpiData.activeStrategies}
          footnote={t('ad.currentlyRunning')}
        />
        <LexMetricTile
          label={t('ad.totalAllocated')}
          icon={DollarSign}
          tone="emerald"
          value={formatCurrency(kpiData.totalAllocated)}
          footnote={t('ad.acrossStrategies')}
        />
        <LexMetricTile
          label={t('ad.avgExposure')}
          icon={Target}
          tone="slate"
          value={formatPercentage(kpiData.avgInvestorExposure)}
          footnote={t('ad.portfolioAllocation')}
        />
        <LexMetricTile
          label={t('ad.latestSimulation')}
          icon={kpiData.lastSimulationStatus === 'success' ? CheckCircle : AlertTriangle}
          tone={kpiData.lastSimulationStatus === 'success' ? 'emerald' : 'red'}
          value={kpiData.lastSimulationStatus === 'success' ? t('ad.success') : t('ad.failed')}
          footnote={new Date(kpiData.lastSimulationTime).toLocaleString()}
        />
      </div>

      <div className="pro-card p-4 mb-3">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="pro-head-badge">
            <Activity className="h-4 w-4" />
          </span>
          <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t('reports.quickActions')}
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {canManage && (
            <QuickAction
              to="/InvestorDashboard/AllocationEngine/strategies/new"
              icon={Plus}
              label={t('ad.createStrategy')}
            />
          )}
          {/* The middle tile was a button with an empty handler and a TODO —
              it looked identical to the two that navigate. It says what it is
              until a simulation modal exists. */}
          <QuickAction
            onClick={handleRefresh}
            icon={Play}
            label={t('ad.runGlobalSim')}
          />
          <QuickAction
            to="/InvestorDashboard/AllocationEngine/audit"
            icon={FileText}
            label={t('ad.viewAuditLogs')}
          />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="pro-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <PieChart className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('ad.allocationByRisk')}
              </h4>
            </div>
          </div>

          <div className="space-y-3">
            {allocationByRisk.map((item) => (
              <div key={item.riskBand}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{t(item.riskBand)}</span>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatPercentage(item.percentage)}
                  </span>
                </div>
                <div className="mb-1.5 text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(item.amount)}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      background: TONE_HEX[item.tone],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
            <span className="font-medium text-muted-foreground">{t('ad.totalAllocated')}</span>
            <span className="font-semibold tabular-nums text-foreground">
              {formatCurrency(kpiData.totalAllocated)}
            </span>
          </div>
        </div>

        <div className="pro-card p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="pro-head-badge">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t('ad.exposureHeatmap')}
            </h4>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[420px] space-y-2">
              <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>{t('ad.col.product')}</span>
                <span className="text-center">{t('ad.col.lowRisk')}</span>
                <span className="text-center">{t('ad.col.medRisk')}</span>
                <span className="text-center">{t('ad.col.highRisk')}</span>
              </div>

              {exposureHeatmap.map((row) => (
                <div key={row.product} className="grid grid-cols-4 items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {t(row.product)}
                  </span>
                  {[row.lowRisk, row.mediumRisk, row.highRisk].map((value, i) => (
                    <span key={i} className="flex justify-center">
                      <Badge
                        variant="outline"
                        className={`border w-full justify-center font-medium tabular-nums ${getHeatmapTone(value)}`}
                      >
                        {value}%
                      </Badge>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">{t('ad.exposureLegend')}</p>
        </div>
      </div>

      <div className="pro-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="pro-head-badge">
              <Activity className="h-4 w-4" />
            </span>
            <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t('ad.recentActivities')}
            </h4>
          </div>
          <Link
            to="/InvestorDashboard/AllocationEngine/audit"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t('reports.viewAll')}
          </Link>
        </div>

        <div className="space-y-2">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 shrink-0">{getStatusIcon(activity.status)}</span>
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-medium text-foreground">
                    {getActivityTypeLabel(activity.type)}
                  </p>
                  <p className="m-0 truncate text-xs text-muted-foreground">{activity.strategy}</p>
                  <p className="m-0 text-[11px] text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {formatCurrency(activity.amount)}
                </span>
                {/* Success and error both used to be text-red-600 here too. */}
                <Badge
                  variant="outline"
                  className={`border font-medium ${statusTone(activity.status)}`}
                >
                  {t(`ad.status.${activity.status}`)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * One of the three quick actions. Two navigate and one does not, and before
 * this they were a Link, a Link and a bare <button> styled to look the same —
 * so the one that did nothing was indistinguishable from the two that worked.
 */
const QuickAction = ({
  to,
  onClick,
  icon: Icon,
  label,
}: {
  to?: string;
  onClick?: () => void;
  icon: typeof Plus;
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
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </>
  );

  const className =
    'group flex items-center justify-between gap-3 rounded-md border p-3 text-start transition-colors hover:border-primary/40 hover:bg-accent/40';

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
