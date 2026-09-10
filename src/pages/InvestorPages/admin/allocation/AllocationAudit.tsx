import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  User,
  Settings,
  Clock,
  ScrollText,
} from 'lucide-react';
import toast from 'react-hot-toast';

import TableView from '../../../../components/TableView/TableView';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { EmptyState } from '../../../../components/shared/detailKit';
import { TONES } from '../../../../components/shared/detailKitUtils';
import {
  LexNotice,
  LexPageHeader,
  LexSearch,
} from '../../../../components/shared/lexKit';

// Mock audit log data
const auditLogs = [
  {
    id: 'AUDIT-2024-001',
    timestamp: '2024-01-22T15:30:45Z',
    type: 'strategy_executed',
    actor: 'system',
    actorName: 'Allocation Engine',
    strategyId: 'STR-001',
    strategyName: 'High Risk Preferred V2',
    loanId: 'LOAN-001',
    outcome: 'success',
    details: {
      totalAllocated: 5000000,
      investorsUsed: 3,
      executionTime: 2.3,
      ruleMatches: 8
    },
    metadata: {
      ipAddress: '10.0.0.1',
      userAgent: 'AllocationEngine/2.1',
      sessionId: 'SES-789123'
    }
  },
  {
    id: 'AUDIT-2024-002',
    timestamp: '2024-01-22T14:45:22Z',
    type: 'manual_allocation',
    actor: 'user',
    actorName: 'Sarah Chen',
    strategyId: 'STR-002',
    strategyName: 'Conservative Allocation',
    loanId: 'LOAN-002',
    outcome: 'success',
    details: {
      totalAllocated: 2500000,
      investorsUsed: 2,
      overrideReason: 'Customer request for specific investor',
      approvedBy: 'Mike Davis'
    },
    metadata: {
      ipAddress: '192.168.1.45',
      userAgent: 'Mozilla/5.0...',
      sessionId: 'SES-456789'
    }
  },
  {
    id: 'AUDIT-2024-003',
    timestamp: '2024-01-22T13:20:15Z',
    type: 'simulation_run',
    actor: 'user',
    actorName: 'John Smith',
    strategyId: 'STR-003',
    strategyName: 'Balanced Growth Strategy',
    loanId: null,
    outcome: 'success',
    details: {
      simulationType: 'preview',
      loansSimulated: 3,
      totalAmount: 10000000,
      allocationSuccess: 95
    },
    metadata: {
      ipAddress: '192.168.1.67',
      userAgent: 'Mozilla/5.0...',
      sessionId: 'SES-123456'
    }
  },
  {
    id: 'AUDIT-2024-004',
    timestamp: '2024-01-22T12:15:30Z',
    type: 'strategy_modified',
    actor: 'user',
    actorName: 'Lisa Wang',
    strategyId: 'STR-001',
    strategyName: 'High Risk Preferred V2',
    loanId: null,
    outcome: 'success',
    details: {
      changeType: 'rule_updated',
      changedFields: ['capacity_limit', 'risk_mapping'],
      previousVersion: 'v1.2',
      newVersion: 'v1.3'
    },
    metadata: {
      ipAddress: '192.168.1.89',
      userAgent: 'Mozilla/5.0...',
      sessionId: 'SES-234567'
    }
  },
  {
    id: 'AUDIT-2024-005',
    timestamp: '2024-01-22T11:45:18Z',
    type: 'allocation_failed',
    actor: 'system',
    actorName: 'Allocation Engine',
    strategyId: 'STR-004',
    strategyName: 'Emergency Liquidity Manager',
    loanId: 'LOAN-004',
    outcome: 'failure',
    details: {
      errorCode: 'INSUFFICIENT_LIQUIDITY',
      errorMessage: 'No eligible investors with sufficient balance',
      attemptedAmount: 1500000,
      availableLiquidity: 800000
    },
    metadata: {
      ipAddress: '10.0.0.1',
      userAgent: 'AllocationEngine/2.1',
      sessionId: 'SES-345678'
    }
  },
  {
    id: 'AUDIT-2024-006',
    timestamp: '2024-01-22T10:30:42Z',
    type: 'exposure_limit_exceeded',
    actor: 'system',
    actorName: 'Risk Monitor',
    strategyId: 'STR-002',
    strategyName: 'Conservative Allocation',
    loanId: 'LOAN-003',
    outcome: 'warning',
    details: {
      investorId: 'INV-015',
      investorName: 'Alinma Investment',
      currentExposure: 78,
      limit: 80,
      proposedExposure: 85,
      actionTaken: 'allocation_paused'
    },
    metadata: {
      ipAddress: '10.0.0.2',
      userAgent: 'RiskMonitor/1.5',
      sessionId: 'SES-567890'
    }
  }
];

const typeOptions = ['All Types', 'strategy_executed', 'manual_allocation', 'simulation_run', 'strategy_modified', 'allocation_failed', 'exposure_limit_exceeded'];
const outcomeOptions = ['All Outcomes', 'success', 'failure', 'warning'];
const actorOptions = ['All Actors', 'system', 'user'];

export default function AllocationAudit() {
  const { t } = useTranslation('investor');
  const typeKey: Record<string, string> = { 'All Types': 'aud.type.allTypes', 'strategy_executed': 'aud.type.strategyExecuted', 'manual_allocation': 'aud.type.manualAllocation', 'simulation_run': 'aud.type.simulationRun', 'strategy_modified': 'aud.type.strategyModified', 'allocation_failed': 'aud.type.allocationFailed', 'exposure_limit_exceeded': 'aud.type.exposureLimitExceeded' };
  const outcomeKey: Record<string, string> = { 'All Outcomes': 'aud.outcome.allOutcomes', 'success': 'aud.outcome.success', 'failure': 'aud.outcome.failure', 'warning': 'aud.outcome.warning' };
  const actorKey: Record<string, string> = { 'All Actors': 'aud.actor.allActors', 'system': 'aud.actor.system', 'user': 'aud.actor.user' };
  const tType = (v: string) => (typeKey[v] ? t(typeKey[v]) : v);
  const tOutcome = (v: string) => (outcomeKey[v] ? t(outcomeKey[v]) : v);
  const tActor = (v: string) => (actorKey[v] ? t(actorKey[v]) : v);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [outcomeFilter, setOutcomeFilter] = useState('All Outcomes');
  const [actorFilter, setActorFilter] = useState('All Actors');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.strategyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All Types' || log.type === typeFilter;
    const matchesOutcome = outcomeFilter === 'All Outcomes' || log.outcome === outcomeFilter;
    const matchesActor = actorFilter === 'All Actors' || log.actor === actorFilter;

    // dateFrom / dateTo were captured into state and then never read — two
    // date inputs sat on the filter bar changing nothing. `toDate` is pushed
    // to the end of its day so an entry made at 14:00 is not excluded by a
    // "to" of the same date.
    const stamp = new Date(log.timestamp).getTime();
    const afterFrom = !dateFrom || stamp >= new Date(`${dateFrom}T00:00:00`).getTime();
    const beforeTo = !dateTo || stamp <= new Date(`${dateTo}T23:59:59.999`).getTime();

    return matchesSearch && matchesType && matchesOutcome && matchesActor && afterFrom && beforeTo;
  });

  // `strategy_executed` and `allocation_failed` were both text-red-500 — an
  // execution and a failure marked with the same colour, on the log whose
  // whole job is telling them apart.
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strategy_executed':
        return <Play className="h-4 w-4 text-primary" />;
      case 'manual_allocation':
        return <User className="h-4 w-4 text-muted-foreground" />;
      case 'simulation_run':
        return <Activity className="h-4 w-4 text-sky-600" />;
      case 'strategy_modified':
        return <Settings className="h-4 w-4 text-muted-foreground" />;
      case 'allocation_failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'exposure_limit_exceeded':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Same again: the success tick and the failure cross were both red.
  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  /**
   * The outcome badge.
   *
   * success and failure were BOTH `bg-red-100 text-red-800`. On an audit log
   * that is the single distinction the screen exists to make, and it was not
   * being made.
   */
  const outcomeTone = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return TONES.emerald;
      case 'failure':
        return TONES.red;
      case 'warning':
        return TONES.amber;
      default:
        return TONES.slate;
    }
  };

  const getTypeLabel = (type: string) => tType(type);

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  // Nothing on this page comes from a service, so there is nothing to export.
  // It used to alert "Exporting…" and stop there.
  const handleExport = () => {
    toast.error(t('invl.notConnected'));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const auditHeaders = [
    {
      name: t('aud.col.timestamp'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 whitespace-nowrap text-sm text-foreground">
            {new Date(row.timestamp).toLocaleDateString()}
          </p>
          <p className="m-0 whitespace-nowrap text-xs text-muted-foreground">
            {new Date(row.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ),
      width: '140px',
    },
    {
      name: t('common:type'),
      cell: (row: any) => (
        <span className="flex min-w-0 items-center gap-2">
          {getTypeIcon(row.type)}
          <span className="truncate text-sm text-foreground">{getTypeLabel(row.type)}</span>
        </span>
      ),
      width: '210px',
    },
    {
      name: t('aud.col.actor'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 truncate text-sm text-foreground">{row.actorName}</p>
          <p className="m-0 truncate text-xs text-muted-foreground">{tActor(row.actor)}</p>
        </div>
      ),
      width: '170px',
    },
    {
      name: t('sl.col.strategy'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 truncate text-sm text-foreground">{row.strategyName}</p>
          <p className="m-0 truncate font-mono text-[11px] text-muted-foreground">
            {row.strategyId}
          </p>
        </div>
      ),
      width: '200px',
    },
    {
      name: t('aud.col.loanId'),
      cell: (row: any) => (
        <span className="font-mono text-xs text-foreground">{row.loanId || '—'}</span>
      ),
      width: '140px',
    },
    {
      name: t('aud.col.outcome'),
      cell: (row: any) => (
        <span className="flex items-center gap-2">
          {getOutcomeIcon(row.outcome)}
          <Badge variant="outline" className={`border font-medium ${outcomeTone(row.outcome)}`}>
            {tOutcome(row.outcome)}
          </Badge>
        </span>
      ),
      width: '160px',
    },
    {
      name: t('common:details'),
      cell: (row: any) => (
        <span className="text-sm text-muted-foreground">
          {row.details?.totalAllocated ? formatCurrency(row.details.totalAllocated) : null}
          {row.details?.errorCode ? t('aud.errorPrefix', { code: row.details.errorCode }) : null}
          {row.details?.changeType ? t('aud.changePrefix', { type: row.details.changeType }) : null}
          {row.details?.simulationType
            ? t('aud.simPrefix', { type: row.details.simulationType })
            : null}
        </span>
      ),
      width: '200px',
    },
    {
      name: t('common:actions'),
      cell: (row: any) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleViewDetails(row)}
          title={t('aud.viewDetails')}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      width: '90px',
    },
  ];

  return (
    <div className="service">
      <LexPageHeader icon={ScrollText} title={t('aud.title')} subtitle={t('aud.subtitle')}>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          {/* Was /admin/allocation — not a route in this app. */}
          <Link to="/InvestorDashboard/AllocationEngine">
            <ArrowLeft className="h-4 w-4" />
            {t('sl.backToDashboard')}
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          {t('ts.exportCsv')}
        </Button>
      </LexPageHeader>

      {/* `auditLogs` is a module-level literal; there is no fetch in this file. */}
      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.sampleDataNotice')}
      </LexNotice>

      <div className="pro-card p-3 mb-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="flex flex-col gap-1 sm:col-span-2 xl:col-span-2">
            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('common:search')}
            </Label>
            <LexSearch
              id="audit-search"
              className="w-full"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t('aud.searchPlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('common:type')}
            </Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {tType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('aud.col.outcome')}
            </Label>
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outcomeOptions.map((outcome) => (
                  <SelectItem key={outcome} value={outcome}>
                    {tOutcome(outcome)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('aud.col.actor')}
            </Label>
            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actorOptions.map((actor) => (
                  <SelectItem key={actor} value={actor}>
                    {tActor(actor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label
              htmlFor="audit-from"
              className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {t('common:from')}
            </Label>
            <input
              id="audit-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs outline-none focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label
              htmlFor="audit-to"
              className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {t('common:to')}
            </Label>
            <input
              id="audit-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs outline-none focus:border-ring"
            />
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {t('aud.countLabel', { shown: filteredLogs.length, total: auditLogs.length })}
        </p>
      </div>

      {/* The pager under this table was three buttons with no handlers at all —
          Previous, "1" and Next, none of them wired. Every row is already in
          memory, so there is nothing to page through. */}
      <div className="pro-card p-4">
        {filteredLogs.length === 0 ? (
          <EmptyState icon={ScrollText} text={t('common:noData')} />
        ) : (
          <TableView header={auditHeaders} data={filteredLogs} paginationShow={false} />
        )}
      </div>


      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('aud.detailsTitle')}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('aud.eventId')}</label>
                  <p className="text-sm text-gray-900">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('aud.col.timestamp')}</label>
                  <p className="text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:type')}</label>
                  <p className="text-sm text-gray-900">{getTypeLabel(selectedLog.type)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('aud.col.actor')}</label>
                  <p className="text-sm text-gray-900">{selectedLog.actorName} ({tActor(selectedLog.actor)})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('aud.col.outcome')}</label>
                  <p className={`text-sm font-medium ${
                    selectedLog.outcome === 'success' ? 'text-red-600' :
                    selectedLog.outcome === 'failure' ? 'text-red-600' :
                    selectedLog.outcome === 'warning' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {tOutcome(selectedLog.outcome)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('sl.col.strategy')}</label>
                  <p className="text-sm text-gray-900">{selectedLog.strategyName}</p>
                  <p className="text-sm text-gray-500">{selectedLog.strategyId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('aud.col.loanId')}</label>
                  <p className="text-sm text-gray-900">{selectedLog.loanId || t('aud.na')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('aud.ipAddress')}</label>
                  <p className="text-sm text-gray-900">{selectedLog.metadata.ipAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('aud.sessionId')}</label>
                  <p className="text-sm text-gray-900">{selectedLog.metadata.sessionId}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">{t('aud.eventDetails')}</label>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
