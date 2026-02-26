import { useState } from 'react';
import {
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  FileText,
  Settings,
  Shield,
  Database,
  Mail,
  Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';

const auditLogs = [
  {
    id: 1,
    timestamp: '2024-01-22T14:30:25Z',
    user: 'admin@portfolio.com',
    userType: 'Admin',
    action: 'Investment Adjustment',
    category: 'Investment',
    description: 'Manual investment adjustment for John Anderson - Large Cap Growth Fund',
    details: {
      investorId: 1,
      productId: 1,
      amount: 100000,
      previousValue: 500000,
      newValue: 600000,
      reason: 'Client request'
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Success',
    severity: 'Medium',
    module: 'Investments'
  },
  {
    id: 2,
    timestamp: '2024-01-22T14:15:10Z',
    user: 'john.anderson@wealth.com',
    userType: 'Investor',
    action: 'Document Upload',
    category: 'KYC',
    description: 'Uploaded bank statement for KYC verification',
    details: {
      documentType: 'Bank Statement',
      fileName: 'bank_statement_jan_2024.pdf',
      fileSize: '2.4 MB',
      status: 'Pending Review'
    },
    ipAddress: '203.45.67.89',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'Success',
    severity: 'Low',
    module: 'KYC'
  },
  {
    id: 3,
    timestamp: '2024-01-22T13:45:55Z',
    user: 'system@portfolio.com',
    userType: 'System',
    action: 'Price Update',
    category: 'System',
    description: 'Daily NAV price update for all active products',
    details: {
      productsUpdated: 38,
      priceSource: 'Bloomberg API',
      updateType: 'Scheduled',
      totalProcessingTime: '45 seconds'
    },
    ipAddress: 'Internal',
    userAgent: 'System/1.0',
    status: 'Success',
    severity: 'Low',
    module: 'Pricing'
  },
  {
    id: 4,
    timestamp: '2024-01-22T13:20:30Z',
    user: 'compliance@portfolio.com',
    userType: 'Compliance',
    action: 'Risk Alert',
    category: 'Compliance',
    description: 'Risk threshold exceeded for Emerging Markets Equity fund',
    details: {
      productId: 3,
      riskMetric: 'VaR',
      threshold: '5%',
      actualValue: '6.2%',
      alertLevel: 'High'
    },
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Alert',
    severity: 'High',
    module: 'Risk Management'
  },
  {
    id: 5,
    timestamp: '2024-01-22T12:30:15Z',
    user: 'sarah.chen@techcorp.com',
    userType: 'Investor',
    action: 'Login',
    category: 'Authentication',
    description: 'Successful login to investor portal',
    details: {
      sessionId: 'sess_abc123def456',
      authMethod: 'Email + 2FA',
      deviceType: 'Desktop'
    },
    ipAddress: '198.51.100.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Success',
    severity: 'Low',
    module: 'Authentication'
  },
  {
    id: 6,
    timestamp: '2024-01-22T11:45:20Z',
    user: 'admin@portfolio.com',
    userType: 'Admin',
    action: 'User Role Update',
    category: 'User Management',
    description: 'Updated permissions for compliance user',
    details: {
      targetUser: 'compliance@portfolio.com',
      previousRole: 'Compliance Officer',
      newRole: 'Senior Compliance Officer',
      permissionsAdded: ['Advanced Risk Reports', 'Regulatory Filing']
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Success',
    severity: 'Medium',
    module: 'User Management'
  },
  {
    id: 7,
    timestamp: '2024-01-22T10:15:45Z',
    user: 'system@portfolio.com',
    userType: 'System',
    action: 'Report Generation',
    category: 'Reports',
    description: 'Generated monthly P/L summary report',
    details: {
      reportType: 'P/L Summary',
      period: 'December 2023',
      recipients: 45,
      fileSize: '8.2 MB',
      deliveryMethod: 'Email + Portal'
    },
    ipAddress: 'Internal',
    userAgent: 'System/1.0',
    status: 'Success',
    severity: 'Low',
    module: 'Reports'
  },
  {
    id: 8,
    timestamp: '2024-01-22T09:30:12Z',
    user: 'unknown',
    userType: 'Unknown',
    action: 'Failed Login',
    category: 'Security',
    description: 'Multiple failed login attempts detected',
    details: {
      attemptedEmail: 'admin@portfolio.com',
      attempts: 5,
      timeWindow: '10 minutes',
      ipBlocked: true,
      reason: 'Brute force attempt'
    },
    ipAddress: '185.234.56.78',
    userAgent: 'Python/3.9 requests/2.28.1',
    status: 'Failed',
    severity: 'High',
    module: 'Security'
  }
];

const categories = ['All Categories', 'Investment', 'KYC', 'System', 'Compliance', 'Authentication', 'User Management', 'Reports', 'Security'];
const severities = ['All Severities', 'Low', 'Medium', 'High', 'Critical'];
const statuses = ['All Status', 'Success', 'Failed', 'Alert', 'Warning'];
const modules = ['All Modules', 'Investments', 'KYC', 'Pricing', 'Risk Management', 'Authentication', 'User Management', 'Reports', 'Security'];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [dateRange, setDateRange] = useState('today');
  const [selectedLog, setSelectedLog] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Alert': return 'bg-yellow-100 text-yellow-800';
      case 'Warning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-gray-100 text-gray-900';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (category: string) => {
    switch (category) {
      case 'Investment': return Activity;
      case 'KYC': return FileText;
      case 'System': return Settings;
      case 'Compliance': return Shield;
      case 'Authentication': return Lock;
      case 'User Management': return User;
      case 'Reports': return FileText;
      case 'Security': return AlertTriangle;
      default: return Activity;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'All Severities' || log.severity === severityFilter;
    const matchesStatus = statusFilter === 'All Status' || log.status === statusFilter;
    const matchesModule = moduleFilter === 'All Modules' || log.module === moduleFilter;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus && matchesModule;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = () => {
    // Simulate export functionality
    alert('Audit logs exported successfully!');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
            <p className="text-gray-600">Comprehensive audit trail and activity monitoring</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={exportLogs}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
              <Shield className="w-4 h-4 mr-2" />
              Security Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
              <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
            </div>
            <Activity className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Security Events</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Events</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-xs text-green-600 mt-1">All successful</p>
            </div>
            <Database className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">User Actions</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-xs text-gray-500 mt-1">Today</p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {severities.map(severity => (
              <option key={severity} value={severity}>{severity}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {filteredLogs.length} of {auditLogs.length} events
          </div>
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </button>
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
                  User & Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.category);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatTimestamp(log.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ActionIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.user}</div>
                          <div className="text-sm text-gray-500">{log.action}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={log.description}>
                        {log.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{log.module}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(log.status))}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getSeverityColor(log.severity))}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                        className="text-black hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            {(() => {
              const log = auditLogs.find(l => l.id === selectedLog);
              if (!log) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Timestamp:</span>
                      <p className="text-gray-900">{formatTimestamp(log.timestamp)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">User:</span>
                      <p className="text-gray-900">{log.user} ({log.userType})</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Action:</span>
                      <p className="text-gray-900">{log.action}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Category:</span>
                      <p className="text-gray-900">{log.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <p className="text-gray-900">{log.status}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Severity:</span>
                      <p className="text-gray-900">{log.severity}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">IP Address:</span>
                      <p className="text-gray-900">{log.ipAddress}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Module:</span>
                      <p className="text-gray-900">{log.module}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Description:</span>
                    <p className="text-gray-900 mt-1">{log.description}</p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">User Agent:</span>
                    <p className="text-gray-900 mt-1 text-xs">{log.userAgent}</p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Additional Details:</span>
                    <div className="mt-2 bg-gray-50 rounded-lg p-4">
                      <pre className="text-xs text-gray-900 whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing 1 to {filteredLogs.length} of {auditLogs.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
