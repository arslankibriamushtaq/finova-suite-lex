import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Users,
  FileText,
  Mail,
  Eye,
  Send,
  Search,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  User
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useTranslation } from 'react-i18next';

const investorStatements = [
  {
    id: 1,
    investorName: 'John Anderson',
    investorId: 'INV-001',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Delivered',
    deliveryMethod: 'Email + Portal',
    lastAccessed: '2024-01-08T14:30:00Z',
    fileSize: '2.4 MB',
    portfolioValue: 580000,
    monthlyReturn: 2.3,
    ytdReturn: 16.2
  },
  {
    id: 2,
    investorName: 'Sarah Chen',
    investorId: 'INV-002',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Delivered',
    deliveryMethod: 'Email + Portal',
    lastAccessed: '2024-01-06T09:15:00Z',
    fileSize: '2.8 MB',
    portfolioValue: 850000,
    monthlyReturn: 1.8,
    ytdReturn: 6.25
  },
  {
    id: 3,
    investorName: 'Michael Rodriguez',
    investorId: 'INV-003',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Failed',
    deliveryMethod: 'Email',
    lastAccessed: null,
    fileSize: '2.1 MB',
    portfolioValue: 285000,
    monthlyReturn: -0.5,
    ytdReturn: -5.0
  },
  {
    id: 4,
    investorName: 'Goldman Family Office',
    investorId: 'INV-004',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Delivered',
    deliveryMethod: 'Portal Only',
    lastAccessed: '2024-01-05T16:45:00Z',
    fileSize: '3.2 MB',
    portfolioValue: 1440000,
    monthlyReturn: 3.1,
    ytdReturn: 20.0
  },
  {
    id: 5,
    investorName: 'Emma Thompson',
    investorId: 'INV-005',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Pending',
    deliveryMethod: 'Email + Portal',
    lastAccessed: null,
    fileSize: '2.7 MB',
    portfolioValue: 2200000,
    monthlyReturn: 1.2,
    ytdReturn: 10.0
  },
  {
    id: 6,
    investorName: 'Tech Ventures LLC',
    investorId: 'INV-006',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Delivered',
    deliveryMethod: 'Email + Portal',
    lastAccessed: '2024-01-07T11:20:00Z',
    fileSize: '2.9 MB',
    portfolioValue: 750000,
    monthlyReturn: 2.8,
    ytdReturn: 14.5
  }
];

const statementTemplates = [
  {
    id: 1,
    name: 'ist.tmpl.monthly',
    type: 'Monthly',
    lastModified: '2024-01-10',
    usage: 'Active'
  },
  {
    id: 2,
    name: 'ist.tmpl.quarterly',
    type: 'Quarterly',
    lastModified: '2023-12-28',
    usage: 'Active'
  },
  {
    id: 3,
    name: 'ist.tmpl.annual',
    type: 'Annual',
    lastModified: '2023-12-15',
    usage: 'Active'
  }
];

export default function InvestorStatements() {
  const { t } = useTranslation('investor');
  const deliveryKey: Record<string, string> = { 'Email + Portal': 'ist.delivery.emailPortal', 'Email': 'ist.delivery.email', 'Portal Only': 'ist.delivery.portalOnly' };
  const tDelivery = (v: string) => (deliveryKey[v] ? t(deliveryKey[v]) : v);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [periodFilter, setPeriodFilter] = useState('All Periods');
  const [selectedStatement, setSelectedStatement] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Processing': return 'bg-gray-100 text-gray-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return CheckCircle;
      case 'Pending': return Clock;
      case 'Failed': return AlertTriangle;
      case 'Processing': return RefreshCw;
      default: return FileText;
    }
  };

  const filteredStatements = investorStatements.filter(statement => {
    const matchesSearch = statement.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         statement.investorId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || statement.status === statusFilter;
    const matchesPeriod = periodFilter === 'All Periods' || statement.period === periodFilter;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const handleViewStatement = (statement: any) => {
    setSelectedStatement(statement);
    setShowDetailsModal(true);
  };

  const handleResendStatement = (statement: any) => {
    alert(t('ist.resent', { name: statement.investorName }));
  };

  const handleDownloadStatement = (statement: any) => {
    alert(t('ist.downloading', { name: statement.investorName }));
  };

  const handleGenerateStatements = () => {
    alert(t('ist.generating'));
  };

  const handleBulkEmail = () => {
    alert(t('ist.bulkEmailSending'));
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return t('ist.never');
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/reports"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 me-2" />
              {t('pl.backToReports')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('ist.title')}</h1>
              <p className="text-gray-600">{t('ist.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 me-2" />
              {t('common:refresh')}
            </button>
            <button
              onClick={handleBulkEmail}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Mail className="w-4 h-4 me-2" />
              {t('ist.bulkEmail')}
            </button>
            <button
              onClick={handleGenerateStatements}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <FileText className="w-4 h-4 me-2" />
              {t('ist.generateStatements')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('ist.totalStatements')}</p>
              <p className="text-2xl font-bold text-gray-900">{investorStatements.length}</p>
              <p className="text-xs text-gray-500 mt-1">{t('ist.thisPeriod')}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('ist.delivered')}</p>
              <p className="text-2xl font-bold text-gray-900">{investorStatements.filter(s => s.status === 'Delivered').length}</p>
              <p className="text-xs text-green-600 mt-1">{t('ist.successfullySent')}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('ist.failed')}</p>
              <p className="text-2xl font-bold text-gray-900">{investorStatements.filter(s => s.status === 'Failed').length}</p>
              <p className="text-xs text-red-600 mt-1">{t('ist.requireAttention')}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('ist.accessRate')}</p>
              <p className="text-2xl font-bold text-gray-900">78%</p>
              <p className="text-xs text-gray-500 mt-1">{t('ist.investorsViewed')}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('ist.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="All Status">{t('ist.allStatus')}</option>
            <option value="Delivered">{t('ist.status.Delivered')}</option>
            <option value="Pending">{t('ist.status.Pending')}</option>
            <option value="Failed">{t('ist.status.Failed')}</option>
            <option value="Processing">{t('ist.status.Processing')}</option>
          </select>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="All Periods">{t('ist.allPeriods')}</option>
            <option value="December 2023">December 2023</option>
            <option value="November 2023">November 2023</option>
            <option value="October 2023">October 2023</option>
          </select>
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 me-2" />
            {t('ist.moreFilters')}
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {t('ist.countLabel', { shown: filteredStatements.length, total: investorStatements.length })}
        </div>
      </div>

      {/* Statements Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ist.col.investor')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ist.col.period')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ist.col.portfolioValue')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ist.col.performance')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ist.col.delivery')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ist.col.lastAccessed')}
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">{t('common:actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStatements.map((statement) => {
                const StatusIcon = getStatusIcon(statement.status);
                return (
                  <tr key={statement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center me-4">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{statement.investorName}</div>
                          <div className="text-sm text-gray-500">{statement.investorId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{statement.period}</div>
                      <div className="text-sm text-gray-500">{t('ist.generatedLabel', { date: new Date(statement.statementDate).toLocaleDateString() })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(statement.portfolioValue)}
                      </div>
                      <div className="text-sm text-gray-500">{statement.fileSize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {t('ist.monthLabel', { value: `${statement.monthlyReturn > 0 ? '+' : ''}${statement.monthlyReturn}%` })}
                      </div>
                      <div className={`text-sm ${statement.ytdReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t('ist.ytdLabel', { value: `${statement.ytdReturn > 0 ? '+' : ''}${statement.ytdReturn}%` })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="w-4 h-4 me-2 text-gray-400" />
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(statement.status))}>
                          {t(`ist.status.${statement.status}`)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tDelivery(statement.deliveryMethod)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(statement.lastAccessed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewStatement(statement)}
                          className="text-black hover:text-blue-900"
                          title={t('ist.viewStatement')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadStatement(statement)}
                          className="text-gray-600 hover:text-gray-900"
                          title={t('doc.download')}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {statement.status === 'Failed' && (
                          <button
                            onClick={() => handleResendStatement(statement)}
                            className="text-green-600 hover:text-green-900"
                            title={t('ist.resend')}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-500" title={t('common:more')}>
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statement Templates */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t('ist.templatesTitle')}</h3>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-black border border-black rounded-lg hover:bg-gray-50">
            <FileText className="w-4 h-4 me-2" />
            {t('ist.manageTemplates')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ist.col.templateName')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:type')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ist.col.lastModified')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:status')}
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">{t('common:actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statementTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{t(template.name)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{t(`reports.freq.${template.type}`)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(template.lastModified).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {t('ist.usage.active')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-black hover:text-blue-900" title={t('ist.editTemplate')}>
                        <FileText className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900" title={t('ist.preview')}>
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statement Details Modal */}
      {showDetailsModal && selectedStatement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('ist.detailsTitle')}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.col.investor')}</label>
                  <p className="text-sm text-gray-900">{selectedStatement.investorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.investorId')}</label>
                  <p className="text-sm text-gray-900">{selectedStatement.investorId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.col.period')}</label>
                  <p className="text-sm text-gray-900">{selectedStatement.period}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.generatedDate')}</label>
                  <p className="text-sm text-gray-900">{new Date(selectedStatement.statementDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.col.portfolioValue')}</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedStatement.portfolioValue)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.monthlyReturn')}</label>
                  <p className={`text-sm ${selectedStatement.monthlyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedStatement.monthlyReturn > 0 ? '+' : ''}{selectedStatement.monthlyReturn}%
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.ytdReturn')}</label>
                  <p className={`text-sm ${selectedStatement.ytdReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedStatement.ytdReturn > 0 ? '+' : ''}{selectedStatement.ytdReturn}%
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.fileSize')}</label>
                  <p className="text-sm text-gray-900">{selectedStatement.fileSize}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.deliveryMethod')}</label>
                  <p className="text-sm text-gray-900">{tDelivery(selectedStatement.deliveryMethod)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:status')}</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedStatement.status)}`}>
                    {t(`ist.status.${selectedStatement.status}`)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ist.col.lastAccessed')}</label>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedStatement.lastAccessed)}</p>
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
                  handleDownloadStatement(selectedStatement);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                {t('ist.downloadStatement')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
