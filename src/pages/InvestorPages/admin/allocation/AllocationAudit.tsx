import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const handleExport = () => {
    alert('Exporting audit logs to CSV...');
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
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Allocation Audit Logs</h1>
              <p className="text-gray-600">Track all allocation activities and system events</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
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
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {typeOptions.map(type => (
              <option key={type} value={type}>{type === 'All Types' ? type : getTypeLabel(type)}</option>
            ))}
          </select>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {outcomeOptions.map(outcome => (
              <option key={outcome} value={outcome}>{outcome.charAt(0).toUpperCase() + outcome.slice(1)}</option>
            ))}
          </select>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {actorOptions.map(actor => (
              <option key={actor} value={actor}>{actor.charAt(0).toUpperCase() + actor.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Date Range:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          <div className="text-sm text-gray-500">
            {filteredLogs.length} of {auditLogs.length} logs
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
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
                      <span className="ml-2 text-sm text-gray-900">
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
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.outcome === 'success' ? 'bg-green-100 text-green-800' :
                        log.outcome === 'failure' ? 'bg-red-100 text-red-800' :
                        log.outcome === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.outcome.charAt(0).toUpperCase() + log.outcome.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.details.totalAllocated && formatCurrency(log.details.totalAllocated)}
                    {log.details.errorCode && `Error: ${log.details.errorCode}`}
                    {log.details.changeType && `Change: ${log.details.changeType}`}
                    {log.details.simulationType && `Simulation: ${log.details.simulationType}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="text-black hover:text-blue-900"
                      title="View Details"
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
          Showing {filteredLogs.length} of {auditLogs.length} logs
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Audit Log Details</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                  <p className="text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-sm text-gray-900">{getTypeLabel(selectedLog.type)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actor</label>
                  <p className="text-sm text-gray-900">{selectedLog.actorName} ({selectedLog.actor})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                  <p className={`text-sm font-medium ${
                    selectedLog.outcome === 'success' ? 'text-green-600' :
                    selectedLog.outcome === 'failure' ? 'text-red-600' :
                    selectedLog.outcome === 'warning' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {selectedLog.outcome.charAt(0).toUpperCase() + selectedLog.outcome.slice(1)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
                  <p className="text-sm text-gray-900">{selectedLog.strategyName}</p>
                  <p className="text-sm text-gray-500">{selectedLog.strategyId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.loanId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <p className="text-sm text-gray-900">{selectedLog.metadata.ipAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.metadata.sessionId}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Event Details</label>
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
