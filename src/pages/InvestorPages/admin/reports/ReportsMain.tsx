import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  DollarSign,
  Users,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Share,
  Mail,
  AlertTriangle
} from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('last-30-days');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-red-100 text-red-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('reports.title')}</h1>
            <p className="text-gray-600">{t('reports.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 me-2" />
              {t('reports.refreshStatus')}
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar className="w-4 h-4 me-2" />
              {t('reports.scheduleReport')}
            </button>
            <Link
              to="/admin/reports/generate"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <FileText className="w-4 h-4 me-2" />
              {t('reports.generateReport')}
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('reports.stat.reportsGenerated')}</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-xs text-red-600 mt-1">{t('reports.stat.thisMonth')}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('reports.stat.activeSchedules')}</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-xs text-gray-500 mt-1">{t('reports.stat.automatedReports')}</p>
            </div>
            <Clock className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('reports.stat.totalDownloads')}</p>
              <p className="text-2xl font-bold text-gray-900">5,432</p>
              <p className="text-xs text-gray-500 mt-1">{t('reports.stat.allTime')}</p>
            </div>
            <Download className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('reports.stat.processingQueue')}</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-xs text-yellow-600 mt-1">{t('reports.stat.reportsPending')}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Categories */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('reports.categoriesTitle')}</h2>

            {/* Category Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {reportCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeCategory === category.id
                        ? 'border-gray-700 text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <category.icon className="w-4 h-4 me-2" />
                      {t(category.name)}
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Active Category Reports */}
            {reportCategories.map((category) => (
              activeCategory === category.id && (
                <div key={category.id}>
                  <div className="mb-4">
                    <h3 className="text-md font-medium text-gray-900">{t(category.name)}</h3>
                    <p className="text-sm text-gray-600">{t(category.description)}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.reports.map((report) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">{t(report.name)}</h4>
                            <p className="text-xs text-gray-600">{t(report.description)}</p>
                          </div>
                          <div className="flex items-center space-x-2 ms-4">
                            <Link
                              to={`/InvestorDashboard/Reports/${report.id}`}
                              className="text-black hover:text-blue-900"
                              title={t('reports.viewReport')}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => alert(t('reports.generatingAlert', { name: t(report.name) }))}
                              className="text-gray-600 hover:text-gray-900"
                              title={t('reports.generateNow')}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{t('reports.frequencyLabel', { frequency: t(`reports.freq.${report.frequency}`) })}</span>
                          <span>{t('reports.lastLabel', { date: formatDate(report.lastGenerated) })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('reports.recentReports')}</h3>
              <Link
                to="/admin/reports/history"
                className="text-sm text-black hover:text-gray-800"
              >
                {t('reports.viewAll')}
              </Link>
            </div>

            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{t(report.name)}</h4>
                      <p className="text-xs text-gray-600 mt-1">{t(report.type)}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{formatDate(report.generatedDate)}</span>
                        <span>{t('reports.byLabel', { name: t(report.generatedBy) })}</span>
                        {report.size !== '-' && <span>{report.size}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ms-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {t(`reports.reportStatus.${report.status}`)}
                      </span>
                      {report.status === 'Completed' && (
                        <button className="text-black hover:text-blue-900">
                          <Download className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  {report.downloads > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {t('reports.downloadedTimes', { count: report.downloads })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.quickActions')}</h3>
            <div className="space-y-3">
              <Link
                to="/InvestorDashboard/Reports/pl"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-red-600 me-3" />
                  <span className="text-sm font-medium text-gray-900">{t('reports.generatePlSummary')}</span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>

              <Link
                to="/InvestorDashboard/Reports/analytics"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-black me-3" />
                  <span className="text-sm font-medium text-gray-900">{t('reports.item.portfolioAnalytics.name')}</span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>

              <button className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-purple-600 me-3" />
                  <span className="text-sm font-medium text-gray-900">{t('reports.emailReports')}</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-orange-600 me-3" />
                  <span className="text-sm font-medium text-gray-900">{t('reports.scheduleReport')}</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
