import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Edit,
  X,
  Trash2
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useTranslation } from 'react-i18next';


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

export default function InvestmentsList() {
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
      case 'Active': return 'bg-red-100 text-red-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Locked': return 'bg-gray-100 text-gray-900';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleRefreshValuations = () => {
    alert(t('invl.valuationsRefreshed'));
  };

  const handleExportData = () => {
    alert(t('invl.dataExported'));
  };

  const handleSaveEdit = () => {
    alert(t('invl.updatedSuccess'));
    setShowEditModal(false);
    setSelectedInvestment(null);
  };

  const confirmDelete = () => {
    alert(t('invl.deletedSuccess', { name: selectedInvestment?.investorName }));
    setShowDeleteModal(false);
    setSelectedInvestment(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('invl.title')}</h1>
            <p className="text-gray-600">{t('invl.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRefreshValuations}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 me-2" />
              {t('invl.refreshValuations')}
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 me-2" />
              {t('invl.exportData')}
            </button>
            <Link
              to="/admin/investments/new"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 me-2" />
              {t('invl.newInvestment')}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('invl.totalInvestments')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalInvestments}</p>
              <p className="text-xs text-red-600 mt-1">{t('invl.acrossProducts')}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('invl.totalValue')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-red-600 mt-1">{t('invl.overallPlus')}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('invl.totalGains')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGains)}</p>
              <p className="text-xs text-red-600 mt-1">{t('invl.realizedUnrealized')}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('invl.avgPerformance')}</p>
              <p className="text-2xl font-bold text-gray-900">{avgPerformance.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{t('invl.ytdWeighted')}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('investments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'investments'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('invl.tab.investments')}
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'allocations'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('invl.tab.allocations')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('invl.tab.analytics')}
          </button>
        </nav>
      </div>

      {activeTab === 'investments' && (
        <>
          {/* Filters */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('invl.searchPlaceholder')}
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
                <option value="All Status">{t('invl.allStatus')}</option>
                <option value="Active">{t('invl.status.active')}</option>
                <option value="Under Review">{t('invl.status.underReview')}</option>
                <option value="Locked">{t('invl.status.locked')}</option>
                <option value="Suspended">{t('invl.status.suspended')}</option>
              </select>
              <select
                value={performanceFilter}
                onChange={(e) => setPerformanceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="All Performance">{t('invl.allPerformance')}</option>
                <option value="Positive">{t('invl.positiveReturns')}</option>
                <option value="Negative">{t('invl.negativeReturns')}</option>
              </select>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 me-2" />
                {t('invl.moreFilters')}
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {t('invl.countLabel', { shown: filteredInvestments.length, total: investments.length })}
            </div>
          </div>

          {/* Investment Holdings Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invl.col.investorProduct')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invl.col.investment')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invl.col.currentValue')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invl.col.gainLoss')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invl.col.performance')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invl.col.unitsPrice')}
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
                  {filteredInvestments.map((investment) => (
                    <tr key={investment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{investment.investorName}</div>
                          <div className="text-sm text-gray-500">{investment.productName}</div>
                          <div className="text-xs text-gray-400">
                            {t('invl.investedLabel', { date: new Date(investment.investmentDate).toLocaleDateString() })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(investment.investmentAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('invl.pctPortfolio', { value: investment.allocationPercentage })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(investment.currentValue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('invl.lastLabel', { date: new Date(investment.lastValuation).toLocaleDateString() })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {investment.performanceType === 'positive' ? (
                            <ArrowUpRight className="w-4 h-4 text-red-500 me-1" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-red-500 me-1" />
                          )}
                          <div>
                            <div className={`text-sm font-medium ${
                              investment.performanceType === 'positive' ? 'text-slate-500' : 'text-red-600'
                            }`}>
                              {formatCurrency(investment.unrealizedGain + investment.realizedGain)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {t('invl.urLabel', { u: formatCurrency(investment.unrealizedGain), r: formatCurrency(investment.realizedGain) })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          investment.performanceType === 'positive' ? 'text-slate-500' : 'text-red-600'
                        }`}>
                          {investment.performanceYTD > 0 ? '+' : ''}{investment.performanceYTD}%
                        </div>
                        <div className="text-xs text-gray-500">{t('invl.ytd')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{t('invl.unitsLabel', { value: investment.units.toLocaleString() })}</div>
                          <div className="text-xs text-gray-500">
                            {t('invl.entryCurrent', { entry: investment.entryPrice, current: investment.currentPrice })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(investment.status))}>
                          {tStatus(investment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(investment)}
                            className="text-black hover:text-blue-900"
                            title={t('irl.viewDetails')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditInvestment(investment)}
                            className="text-gray-600 hover:text-gray-900"
                            title={t('invl.editInvestment')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/investments/${investment.id}/adjust`}
                            className="text-orange-600 hover:text-orange-900"
                            title={t('invl.adjustInvestment')}
                          >
                            <Settings className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteInvestment(investment)}
                            className="text-red-600 hover:text-red-900"
                            title={t('invl.deleteInvestment')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'allocations' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('invl.recentAllocations')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('invl.col.dateAction')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('invl.col.investorProduct')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('invl.col.amountUnits')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('invl.col.price')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common:status')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('invl.col.processedBy')}
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">{t('common:actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocationLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(log.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{t(log.action)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.investorName}</div>
                        <div className="text-sm text-gray-500">{log.productName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${log.amount > 0 ? 'text-slate-500' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(log.amount))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t('invl.unitsLabel', { value: Math.abs(log.units).toLocaleString() })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${log.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(log.status))}>
                        {tStatus(log.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{t(log.processedBy)}</div>
                        {log.notes && (
                          <div className="text-xs text-gray-500">{t(log.notes)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <button className="text-black hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('invl.performanceDistribution')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('invl.positivePerformers')}</span>
                <span className="text-sm font-medium text-red-600">{t('invl.investmentsPlural', { count: 4 })}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-600 h-3 rounded-full" style={{ width: '80%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('invl.negativePerformers')}</span>
                <span className="text-sm font-medium text-red-600">{t('invl.investmentSingular')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-600 h-3 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('invl.riskAnalysis')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('invl.risk.conservative')}</span>
                <span className="text-sm font-medium text-red-600">{t('invl.investmentSingular')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('invl.risk.moderate')}</span>
                <span className="text-sm font-medium text-yellow-600">{t('invl.investmentSingular')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('invl.risk.moderateHigh')}</span>
                <span className="text-sm font-medium text-orange-600">{t('invl.investmentSingular')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('invl.risk.highRisk')}</span>
                <span className="text-sm font-medium text-red-600">{t('invl.investmentsPlural', { count: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('invl.recentTrends')}</h3>
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('invl.chartsPlaceholder')}</p>
              <p className="text-sm">{t('invl.chartsSubtext')}</p>
            </div>
          </div>
        </div>
      )}

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
