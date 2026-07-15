import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Download,
  Filter,
  Search,
  Calendar,
  Eye,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  User,
  Settings,
  Clock
} from 'lucide-react';

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
    
    return matchesSearch && matchesType && matchesOutcome && matchesActor;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strategy_executed': return <Play className="w-4 h-4 text-green-500" />;
      case 'manual_allocation': return <User className="w-4 h-4 text-gray-700" />;
      case 'simulation_run': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'strategy_modified': return <Settings className="w-4 h-4 text-orange-500" />;
      case 'allocation_failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'exposure_limit_exceeded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => tType(type);

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const handleExport = () => {
    alert(t('aud.exporting'));
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/allocation"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 me-2" />
              {t('sl.backToDashboard')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('aud.title')}</h1>
              <p className="text-gray-600">{t('aud.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 me-2" />
              {t('ts.exportCsv')}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('aud.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {typeOptions.map(type => (
              <option key={type} value={type}>{tType(type)}</option>
            ))}
          </select>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {outcomeOptions.map(outcome => (
              <option key={outcome} value={outcome}>{tOutcome(outcome)}</option>
            ))}
          </select>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {actorOptions.map(actor => (
              <option key={actor} value={actor}>{tActor(actor)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{t('aud.dateRange')}</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          <span className="text-gray-500">{t('common:to')}</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          <div className="text-sm text-gray-500">
            {t('aud.countLabel', { shown: filteredLogs.length, total: auditLogs.length })}
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('aud.col.timestamp')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:type')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('aud.col.actor')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sl.col.strategy')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('aud.col.loanId')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('aud.col.outcome')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:details')}
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">{t('common:actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(log.type)}
                      <span className="ms-2 text-sm text-gray-900">
                        {getTypeLabel(log.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.actorName}</div>
                    <div className="text-sm text-gray-500">{log.actor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.strategyName}</div>
                    <div className="text-sm text-gray-500">{log.strategyId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.loanId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getOutcomeIcon(log.outcome)}
                      <span className={`ms-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.outcome === 'success' ? 'bg-green-100 text-green-800' :
                        log.outcome === 'failure' ? 'bg-red-100 text-red-800' :
                        log.outcome === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tOutcome(log.outcome)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.details.totalAllocated && formatCurrency(log.details.totalAllocated)}
                    {log.details.errorCode && t('aud.errorPrefix', { code: log.details.errorCode })}
                    {log.details.changeType && t('aud.changePrefix', { type: log.details.changeType })}
                    {log.details.simulationType && t('aud.simPrefix', { type: log.details.simulationType })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="text-black hover:text-blue-900"
                      title={t('aud.viewDetails')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {t('aud.countLabel', { shown: filteredLogs.length, total: auditLogs.length })}
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            {t('common:previous')}
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('common:next')}
          </button>
        </div>
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
                    selectedLog.outcome === 'success' ? 'text-green-600' :
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
