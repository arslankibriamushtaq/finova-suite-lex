import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Upload,
  Send,
  Search,
  Building,
  Scale,
  Users
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useTranslation } from 'react-i18next';

const regulatoryFilings = [
  {
    id: 1,
    formType: 'Form ADV',
    formName: 'rf.form.adv',
    dueDate: '2024-03-31',
    filingDate: '2024-03-15',
    status: 'Filed',
    regulator: 'SEC',
    submittedBy: 'Sarah Johnson',
    confirmationNumber: 'SEC-2024-001234',
    fileSize: '8.5 MB',
    priority: 'High'
  },
  {
    id: 2,
    formType: 'Form 13F',
    formName: 'rf.form.13f',
    dueDate: '2024-02-14',
    filingDate: '2024-02-10',
    status: 'Filed',
    regulator: 'SEC',
    submittedBy: 'Mike Davis',
    confirmationNumber: 'SEC-2024-001189',
    fileSize: '12.3 MB',
    priority: 'High'
  },
  {
    id: 3,
    formType: 'Form PF',
    formName: 'rf.form.pf',
    dueDate: '2024-04-30',
    filingDate: null,
    status: 'In Progress',
    regulator: 'SEC',
    submittedBy: 'Sarah Johnson',
    confirmationNumber: null,
    fileSize: null,
    priority: 'Medium'
  },
  {
    id: 4,
    formType: 'AIF',
    formName: 'rf.form.aif',
    dueDate: '2024-01-31',
    filingDate: '2024-01-28',
    status: 'Filed',
    regulator: 'ESMA',
    submittedBy: 'Sarah Johnson',
    confirmationNumber: 'ESMA-2024-00567',
    fileSize: '15.7 MB',
    priority: 'High'
  },
  {
    id: 5,
    formType: 'CFTC Form CPO-PQR',
    formName: 'rf.form.cpopqr',
    dueDate: '2024-05-15',
    filingDate: null,
    status: 'Pending Review',
    regulator: 'CFTC',
    submittedBy: 'Mike Davis',
    confirmationNumber: null,
    fileSize: '6.8 MB',
    priority: 'Medium'
  },
  {
    id: 6,
    formType: 'Form D',
    formName: 'rf.form.d',
    dueDate: '2024-03-15',
    filingDate: null,
    status: 'Overdue',
    regulator: 'SEC',
    submittedBy: null,
    confirmationNumber: null,
    fileSize: null,
    priority: 'Critical'
  }
];

const regulators = [
  { code: 'SEC', name: 'rf.reg.sec', country: 'US' },
  { code: 'CFTC', name: 'rf.reg.cftc', country: 'US' },
  { code: 'FINRA', name: 'rf.reg.finra', country: 'US' },
  { code: 'ESMA', name: 'rf.reg.esma', country: 'EU' },
  { code: 'FCA', name: 'rf.reg.fca', country: 'UK' }
];

const upcomingDeadlines = [
  { formType: 'Form D', dueDate: '2024-03-15', daysUntil: 5, priority: 'Critical' },
  { formType: 'Form ADV', dueDate: '2024-03-31', daysUntil: 21, priority: 'High' },
  { formType: 'Form PF', dueDate: '2024-04-30', daysUntil: 51, priority: 'Medium' },
  { formType: 'CFTC Form CPO-PQR', dueDate: '2024-05-15', daysUntil: 66, priority: 'Medium' }
];

export default function RegulatoryFilings() {
  const { t } = useTranslation('investor');
  const statusKey: Record<string, string> = { 'Filed': 'rf.status.filed', 'In Progress': 'rf.status.inProgress', 'Pending Review': 'rf.status.pendingReview', 'Overdue': 'rf.status.overdue', 'Draft': 'rf.status.draft' };
  const priorityKey: Record<string, string> = { 'Critical': 'rf.priority.critical', 'High': 'rf.priority.high', 'Medium': 'rf.priority.medium', 'Low': 'rf.priority.low' };
  const tStatus = (v: string) => (statusKey[v] ? t(statusKey[v]) : v);
  const tPriority = (v: string) => (priorityKey[v] ? t(priorityKey[v]) : v);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [regulatorFilter, setRegulatorFilter] = useState('All Regulators');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [selectedFiling, setSelectedFiling] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Filed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-gray-100 text-gray-900';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Filed': return CheckCircle;
      case 'In Progress': return Clock;
      case 'Pending Review': return Eye;
      case 'Overdue': return AlertTriangle;
      case 'Draft': return FileText;
      default: return FileText;
    }
  };

  const filteredFilings = regulatoryFilings.filter(filing => {
    const matchesSearch = filing.formType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filing.formName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || filing.status === statusFilter;
    const matchesRegulator = regulatorFilter === 'All Regulators' || filing.regulator === regulatorFilter;
    const matchesPriority = priorityFilter === 'All Priorities' || filing.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesRegulator && matchesPriority;
  });

  const handleViewFiling = (filing: any) => {
    setSelectedFiling(filing);
    setShowDetailsModal(true);
  };

  const handleDownloadFiling = (filing: any) => {
    alert(t('rf.downloading', { form: filing.formType }));
  };

  const handleSubmitFiling = (filing: any) => {
    alert(t('rf.submitting', { form: filing.formType, regulator: filing.regulator }));
  };

  const handleNewFiling = () => {
    setShowUploadModal(true);
  };

  const handleUploadFiling = () => {
    alert(t('rf.uploaded'));
    setShowUploadModal(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('rf.notFiled');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
              <h1 className="text-3xl font-bold text-gray-900">{t('rf.title')}</h1>
              <p className="text-gray-600">{t('rf.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 me-2" />
              {t('common:refresh')}
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 me-2" />
              {t('rf.exportCalendar')}
            </button>
            <button
              onClick={handleNewFiling}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Upload className="w-4 h-4 me-2" />
              {t('rf.newFiling')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('rf.totalFilings')}</p>
              <p className="text-2xl font-bold text-gray-900">{regulatoryFilings.length}</p>
              <p className="text-xs text-gray-500 mt-1">{t('rf.thisYear')}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('rf.filed')}</p>
              <p className="text-2xl font-bold text-gray-900">{regulatoryFilings.filter(f => f.status === 'Filed').length}</p>
              <p className="text-xs text-green-600 mt-1">{t('rf.onTime')}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('rf.overdue')}</p>
              <p className="text-2xl font-bold text-gray-900">{regulatoryFilings.filter(f => f.status === 'Overdue').length}</p>
              <p className="text-xs text-red-600 mt-1">{t('rf.requireAttention')}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('rf.inProgress')}</p>
              <p className="text-2xl font-bold text-gray-900">{regulatoryFilings.filter(f => f.status === 'In Progress' || f.status === 'Pending Review').length}</p>
              <p className="text-xs text-black mt-1">{t('rf.activeFilings')}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-700" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Filings Table */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('rf.searchPlaceholder')}
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
                <option value="All Status">{t('rf.allStatus')}</option>
                <option value="Filed">{t('rf.status.filed')}</option>
                <option value="In Progress">{t('rf.status.inProgress')}</option>
                <option value="Pending Review">{t('rf.status.pendingReview')}</option>
                <option value="Overdue">{t('rf.status.overdue')}</option>
                <option value="Draft">{t('rf.status.draft')}</option>
              </select>
              <select
                value={regulatorFilter}
                onChange={(e) => setRegulatorFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="All Regulators">{t('rf.allRegulators')}</option>
                {regulators.map(regulator => (
                  <option key={regulator.code} value={regulator.code}>{regulator.code}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {t('rf.countLabel', { shown: filteredFilings.length, total: regulatoryFilings.length })}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('rf.col.form')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('rf.col.regulator')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('rf.col.dueDate')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common:status')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('rf.col.priority')}
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">{t('common:actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFilings.map((filing) => {
                    const StatusIcon = getStatusIcon(filing.status);
                    const daysUntil = getDaysUntilDue(filing.dueDate);
                    return (
                      <tr key={filing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StatusIcon className="w-5 h-5 text-gray-400 me-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{filing.formType}</div>
                              <div className="text-sm text-gray-500">{t(filing.formName)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 text-gray-400 me-2" />
                            <span className="text-sm text-gray-900">{filing.regulator}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(filing.dueDate)}</div>
                          {daysUntil <= 0 ? (
                            <div className="text-xs text-red-600">{t('rf.overdueLabel')}</div>
                          ) : daysUntil <= 7 ? (
                            <div className="text-xs text-orange-600">{t('rf.daysLeft', { days: daysUntil })}</div>
                          ) : (
                            <div className="text-xs text-gray-500">{t('rf.daysLeft', { days: daysUntil })}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(filing.status))}>
                            {tStatus(filing.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getPriorityColor(filing.priority))}>
                            {tPriority(filing.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewFiling(filing)}
                              className="text-black hover:text-blue-900"
                              title={t('irl.viewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {filing.status === 'Filed' && (
                              <button
                                onClick={() => handleDownloadFiling(filing)}
                                className="text-gray-600 hover:text-gray-900"
                                title={t('doc.download')}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            {(filing.status === 'In Progress' || filing.status === 'Draft') && (
                              <button
                                onClick={() => handleSubmitFiling(filing)}
                                className="text-green-600 hover:text-green-900"
                                title={t('common:submit')}
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('rf.upcomingDeadlines')}</h3>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{deadline.formType}</div>
                    <div className="text-xs text-gray-500">{formatDate(deadline.dueDate)}</div>
                  </div>
                  <div className="text-end">
                    <div className={`text-sm font-medium ${
                      deadline.daysUntil <= 7 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {t('rf.daysLabel', { days: deadline.daysUntil })}
                    </div>
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', getPriorityColor(deadline.priority))}>
                      {tPriority(deadline.priority)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regulators */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('rf.regulators')}</h3>
            <div className="space-y-3">
              {regulators.map((regulator) => (
                <div key={regulator.code} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Scale className="w-4 h-4 text-gray-400 me-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900" title={t(regulator.name)}>{regulator.code}</div>
                      <div className="text-xs text-gray-500">{regulator.country}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {regulatoryFilings.filter(f => f.regulator === regulator.code).length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.quickActions')}</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-black me-3" />
                  <span className="text-sm font-medium text-gray-900">{t('rf.filingCalendar')}</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600 me-3" />
                  <span className="text-sm font-medium text-gray-900">{t('rf.riskAssessment')}</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 me-3" />
                  <span className="text-sm font-medium text-gray-900">{t('rf.complianceCheck')}</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filing Details Modal */}
      {showDetailsModal && selectedFiling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('rf.detailsTitle')}</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('rf.formType')}</label>
                  <p className="text-sm text-gray-900">{selectedFiling.formType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('rf.formName')}</label>
                  <p className="text-sm text-gray-900">{t(selectedFiling.formName)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('rf.col.regulator')}</label>
                  <p className="text-sm text-gray-900">{selectedFiling.regulator}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('rf.col.dueDate')}</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedFiling.dueDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('rf.filingDate')}</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedFiling.filingDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:status')}</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedFiling.status)}`}>
                    {tStatus(selectedFiling.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('rf.col.priority')}</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedFiling.priority)}`}>
                    {tPriority(selectedFiling.priority)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('rf.submittedBy')}</label>
                  <p className="text-sm text-gray-900">{selectedFiling.submittedBy || t('rf.notSubmitted')}</p>
                </div>
                {selectedFiling.confirmationNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('rf.confirmationNumber')}</label>
                    <p className="text-sm text-gray-900">{selectedFiling.confirmationNumber}</p>
                  </div>
                )}
                {selectedFiling.fileSize && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('rf.fileSize')}</label>
                    <p className="text-sm text-gray-900">{selectedFiling.fileSize}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:close')}
              </button>
              {selectedFiling.status === 'Filed' && (
                <button
                  onClick={() => {
                    handleDownloadFiling(selectedFiling);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  {t('rf.downloadFiling')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('rf.newFiling')}</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('rf.formType')}</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                  <option value="">{t('rf.selectFormType')}</option>
                  <option value="Form ADV">Form ADV</option>
                  <option value="Form 13F">Form 13F</option>
                  <option value="Form PF">Form PF</option>
                  <option value="Form D">Form D</option>
                  <option value="AIF">AIF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('rf.col.regulator')}</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                  <option value="">{t('rf.selectRegulator')}</option>
                  {regulators.map(regulator => (
                    <option key={regulator.code} value={regulator.code}>{regulator.code} - {t(regulator.name)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('rf.col.dueDate')}</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('rf.col.priority')}</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                  <option value="Low">{t('rf.priority.low')}</option>
                  <option value="Medium">{t('rf.priority.medium')}</option>
                  <option value="High">{t('rf.priority.high')}</option>
                  <option value="Critical">{t('rf.priority.critical')}</option>
                </select>
              </div>
            </form>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleUploadFiling}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                {t('rf.createFiling')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
