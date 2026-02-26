import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    name: 'Performance Reports',
    description: 'Portfolio performance, returns, and benchmarking',
    icon: TrendingUp,
    color: 'green',
    reports: [
      { id: 'pl-summary', name: 'P/L Summary', description: 'Profit and loss overview', frequency: 'Daily', lastGenerated: '2024-01-22' },
      { id: 'portfolio-analytics', name: 'Portfolio Analytics', description: 'Comprehensive performance analysis', frequency: 'Weekly', lastGenerated: '2024-01-20' },
      { id: 'benchmark-comparison', name: 'Benchmark Comparison', description: 'Performance vs. market benchmarks', frequency: 'Monthly', lastGenerated: '2024-01-15' },
      { id: 'risk-metrics', name: 'Risk Metrics', description: 'VaR, volatility, and risk analysis', frequency: 'Weekly', lastGenerated: '2024-01-20' }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Reports',
    description: 'Financial statements and accounting reports',
    icon: DollarSign,
    color: 'blue',
    reports: [
      { id: 'balance-sheet', name: 'Balance Sheet', description: 'Assets, liabilities, and equity', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'income-statement', name: 'Income Statement', description: 'Revenue, expenses, and net income', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'cash-flow', name: 'Cash Flow Statement', description: 'Operating, investing, financing flows', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'fee-analysis', name: 'Fee Analysis', description: 'Management and performance fees', frequency: 'Monthly', lastGenerated: '2024-01-01' }
    ]
  },
  {
    id: 'investor',
    name: 'Investor Reports',
    description: 'Client-specific reports and statements',
    icon: Users,
    color: 'purple',
    reports: [
      { id: 'investor-statements', name: 'Investor Statements', description: 'Individual account statements', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'allocation-reports', name: 'Allocation Reports', description: 'Asset allocation breakdown', frequency: 'Quarterly', lastGenerated: '2023-12-31' },
      { id: 'transaction-summary', name: 'Transaction Summary', description: 'Investment transactions and activities', frequency: 'Monthly', lastGenerated: '2024-01-01' },
      { id: 'tax-reports', name: 'Tax Reports', description: 'Tax-related investment information', frequency: 'Annual', lastGenerated: '2023-12-31' }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance Reports',
    description: 'Regulatory and compliance documentation',
    icon: AlertTriangle,
    color: 'red',
    reports: [
      { id: 'regulatory-filing', name: 'Regulatory Filings', description: 'SEC and other regulatory reports', frequency: 'Quarterly', lastGenerated: '2023-12-31' },
      { id: 'audit-trail', name: 'Audit Trail', description: 'Transaction and activity logs', frequency: 'Daily', lastGenerated: '2024-01-22' },
      { id: 'compliance-monitoring', name: 'Compliance Monitoring', description: 'Investment guideline adherence', frequency: 'Weekly', lastGenerated: '2024-01-20' },
      { id: 'risk-compliance', name: 'Risk Compliance', description: 'Risk limit and threshold monitoring', frequency: 'Daily', lastGenerated: '2024-01-22' }
    ]
  }
];

const recentReports = [
  {
    id: 1,
    name: 'Monthly P/L Summary - December 2023',
    type: 'P/L Summary',
    generatedDate: '2024-01-02',
    generatedBy: 'System Auto',
    status: 'Completed',
    size: '2.4 MB',
    downloads: 23
  },
  {
    id: 2,
    name: 'Portfolio Analytics Q4 2023',
    type: 'Portfolio Analytics',
    generatedDate: '2024-01-02',
    generatedBy: 'Admin User',
    status: 'Completed',
    size: '8.7 MB',
    downloads: 15
  },
  {
    id: 3,
    name: 'Investor Statements - January 2024',
    type: 'Investor Statements',
    generatedDate: '2024-01-22',
    generatedBy: 'System Auto',
    status: 'Processing',
    size: '-',
    downloads: 0
  },
  {
    id: 4,
    name: 'Risk Compliance Report',
    type: 'Risk Compliance',
    generatedDate: '2024-01-22',
    generatedBy: 'Risk System',
    status: 'Completed',
    size: '1.2 MB',
    downloads: 8
  }
];

export default function ReportsMain() {
  const [activeCategory, setActiveCategory] = useState('performance');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('last-30-days');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-600">Generate and access comprehensive investment reports</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </button>
            <Link
              to="/admin/reports/generate"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reports Generated</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-xs text-green-600 mt-1">This month</p>
            </div>
            <FileText className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Schedules</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-xs text-gray-500 mt-1">Automated reports</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">5,432</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <Download className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing Queue</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-xs text-yellow-600 mt-1">Reports pending</p>
            </div>
            <RefreshCw className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Categories */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Categories</h2>

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
                      <category.icon className="w-4 h-4 mr-2" />
                      {category.name}
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
                    <h3 className="text-md font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.reports.map((report) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">{report.name}</h4>
                            <p className="text-xs text-gray-600">{report.description}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Link
                              to={`/admin/reports/${report.id}`}
                              className="text-black hover:text-blue-900"
                              title="View Report"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => alert(`Generating ${report.name}...`)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Generate Now"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Frequency: {report.frequency}</span>
                          <span>Last: {formatDate(report.lastGenerated)}</span>
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
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <Link
                to="/admin/reports/history"
                className="text-sm text-black hover:text-gray-800"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{report.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{report.type}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{formatDate(report.generatedDate)}</span>
                        <span>by {report.generatedBy}</span>
                        {report.size !== '-' && <span>{report.size}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
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
                      Downloaded {report.downloads} times
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/admin/reports/pl"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Generate P/L Summary</span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>

              <Link
                to="/admin/reports/analytics"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-black mr-3" />
                  <span className="text-sm font-medium text-gray-900">Portfolio Analytics</span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>

              <button className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Email Reports</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-orange-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Schedule Report</span>
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
