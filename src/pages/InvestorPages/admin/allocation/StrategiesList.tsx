import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Play,
  Pause,
  Copy,
  Trash2,
  Download,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

// Mock data for strategies
const strategies = [
  {
    id: 'STR-001',
    name: 'High Risk Preferred V2',
    status: 'Published',
    createdBy: 'Sarah Chen',
    lastModified: '2024-01-20T14:30:00Z',
    nextRun: '2024-01-23T09:00:00Z',
    rulesCount: 8,
    productModels: ['POS Loans', 'MSME Loans'],
    riskBands: ['High'],
    allocatedAmount: 1250000000,
    performance: 12.5
  },
  {
    id: 'STR-002',
    name: 'Conservative Allocation',
    status: 'Published',
    createdBy: 'John Smith',
    lastModified: '2024-01-19T16:45:00Z',
    nextRun: '2024-01-23T10:30:00Z',
    rulesCount: 6,
    productModels: ['Auto Loans', 'Real Estate'],
    riskBands: ['Low', 'Medium'],
    allocatedAmount: 2800000000,
    performance: 8.2
  },
  {
    id: 'STR-003',
    name: 'Balanced Growth Strategy',
    status: 'Draft',
    createdBy: 'Mike Davis',
    lastModified: '2024-01-22T11:20:00Z',
    nextRun: null,
    rulesCount: 12,
    productModels: ['Consumer Loans', 'POS Loans'],
    riskBands: ['Low', 'Medium', 'High'],
    allocatedAmount: 0,
    performance: 0
  },
  {
    id: 'STR-004',
    name: 'Emergency Liquidity Manager',
    status: 'Paused',
    createdBy: 'Lisa Wang',
    lastModified: '2024-01-18T09:15:00Z',
    nextRun: null,
    rulesCount: 4,
    productModels: ['All Products'],
    riskBands: ['Low'],
    allocatedAmount: 500000000,
    performance: 4.1
  },
  {
    id: 'STR-005',
    name: 'Aggressive Tech Lending',
    status: 'Published',
    createdBy: 'Alex Johnson',
    lastModified: '2024-01-21T13:50:00Z',
    nextRun: '2024-01-23T14:00:00Z',
    rulesCount: 10,
    productModels: ['MSME Loans'],
    riskBands: ['High'],
    allocatedAmount: 850000000,
    performance: 18.7
  },
  {
    id: 'STR-006',
    name: 'Retail Customer Focus',
    status: 'Published',
    createdBy: 'Emma Brown',
    lastModified: '2024-01-15T12:30:00Z',
    nextRun: '2024-01-23T11:15:00Z',
    rulesCount: 7,
    productModels: ['Consumer Loans', 'Auto Loans'],
    riskBands: ['Low', 'Medium'],
    allocatedAmount: 1650000000,
    performance: 9.8
  }
];

const statusOptions = ['All Status', 'Published', 'Draft', 'Paused'];
const productOptions = ['All Products', 'POS Loans', 'Auto Loans', 'MSME Loans', 'Consumer Loans', 'Real Estate'];
const riskOptions = ['All Risk Bands', 'Low', 'Medium', 'High'];

export default function StrategiesList() {
  const { t } = useTranslation('investor');
  const statusKey: Record<string, string> = { 'All Status': 'sl.status.allStatus', 'Published': 'sl.status.published', 'Draft': 'sl.status.draft', 'Paused': 'sl.status.paused' };
  const productKey: Record<string, string> = { 'All Products': 'sl.product.allProducts', 'POS Loans': 'sl.product.pos', 'Auto Loans': 'sl.product.auto', 'MSME Loans': 'sl.product.msme', 'Consumer Loans': 'sl.product.consumer', 'Real Estate': 'sl.product.realEstate' };
  const riskKey: Record<string, string> = { 'All Risk Bands': 'sl.risk.allRiskBands', 'Low': 'sl.risk.low', 'Medium': 'sl.risk.medium', 'High': 'sl.risk.high' };
  const tStatus = (s: string) => (statusKey[s] ? t(statusKey[s]) : s);
  const tProduct = (p: string) => (productKey[p] ? t(productKey[p]) : p);
  const tRisk = (r: string) => (riskKey[r] ? t(riskKey[r]) : r);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [productFilter, setProductFilter] = useState('All Products');
  const [riskFilter, setRiskFilter] = useState('All Risk Bands');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Published': return <CheckCircle className="w-4 h-4 text-red-500" />;
      case 'Draft': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'Paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      default: return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || strategy.status === statusFilter;
    const matchesProduct = productFilter === 'All Products' || 
                          strategy.productModels.some(model => model.includes(productFilter)) ||
                          strategy.productModels.includes('All Products');
    const matchesRisk = riskFilter === 'All Risk Bands' || 
                       strategy.riskBands.includes(riskFilter);
    
    return matchesSearch && matchesStatus && matchesProduct && matchesRisk;
  });

  const handleSelectStrategy = (strategyId: string) => {
    setSelectedStrategies(prev => 
      prev.includes(strategyId) 
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStrategies(
      selectedStrategies.length === filteredStrategies.length 
        ? [] 
        : filteredStrategies.map(s => s.id)
    );
  };

  const handleBulkEnable = () => {
    alert(t('sl.bulkEnabling', { count: selectedStrategies.length }));
    setSelectedStrategies([]);
  };

  const handleBulkDisable = () => {
    alert(t('sl.bulkDisabling', { count: selectedStrategies.length }));
    setSelectedStrategies([]);
  };

  const handleBulkExport = () => {
    alert(t('sl.bulkExporting', { count: selectedStrategies.length }));
  };

  const handleToggleStrategy = (strategyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Paused' : 'Published';
    alert(newStatus === 'Published' ? t('sl.toggleEnabled', { id: strategyId }) : t('sl.toggleDisabled', { id: strategyId }));
  };

  const handleCloneStrategy = (strategyId: string) => {
    alert(t('sl.cloning', { id: strategyId }));
  };

  const handleDeleteStrategy = (strategyId: string) => {
    if (confirm(t('sl.deleteConfirm'))) {
      alert(t('sl.deleting', { id: strategyId }));
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/InvestorDashboard/AllocationEngine"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 me-2" />
              {t('sl.backToDashboard')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('sl.title')}</h1>
              <p className="text-gray-600">{t('sl.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 me-2" />
              {t('common:refresh')}
            </button>
            <button
              onClick={handleBulkExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 me-2" />
              {t('common:export')}
            </button>
            <Link
              to="/InvestorDashboard/AllocationEngine/strategies/new"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 me-2" />
              {t('ad.createStrategy')}
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('sl.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 me-2" />
              {t('common:filters')}
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {t('sl.countLabel', { shown: filteredStrategies.length, total: strategies.length })}
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{tStatus(status)}</option>
              ))}
            </select>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {productOptions.map(product => (
                <option key={product} value={product}>{tProduct(product)}</option>
              ))}
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {riskOptions.map(risk => (
                <option key={risk} value={risk}>{tRisk(risk)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedStrategies.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {t('sl.selectedLabel', { count: selectedStrategies.length })}
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkEnable}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                {t('common:enable')}
              </button>
              <button
                onClick={handleBulkDisable}
                className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
              >
                {t('common:disable')}
              </button>
              <button
                onClick={handleBulkExport}
                className="text-sm font-medium text-black hover:text-gray-800"
              >
                {t('common:export')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategies Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start">
                  <input
                    type="checkbox"
                    checked={selectedStrategies.length === filteredStrategies.length && filteredStrategies.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-black focus:ring-gray-500"
                  />
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sl.col.strategy')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sl.col.rules')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sl.col.allocated')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sl.col.performance')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sl.col.nextRun')}
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">{t('common:actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStrategies.map((strategy) => (
                <tr key={strategy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStrategies.includes(strategy.id)}
                      onChange={() => handleSelectStrategy(strategy.id)}
                      className="rounded border-gray-300 text-black focus:ring-gray-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{strategy.name}</div>
                      <div className="text-sm text-gray-500">ID: {strategy.id}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {t('sl.createdBy', { name: strategy.createdBy })}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {strategy.riskBands.map((risk) => (
                          <span key={risk} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                            {t('sl.riskLabel', { risk: tRisk(risk) })}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(strategy.status)}
                      <span className={`ms-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(strategy.status)}`}>
                        {tStatus(strategy.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{t('sl.rulesCount', { count: strategy.rulesCount })}</div>
                    <div className="text-xs text-gray-500">
                      {strategy.productModels.slice(0, 2).map(tProduct).join(', ')}
                      {strategy.productModels.length > 2 && ` ${t('sl.moreCount', { count: strategy.productModels.length - 2 })}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(strategy.allocatedAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${strategy.performance > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {strategy.performance > 0 ? `+${strategy.performance}%` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {strategy.nextRun ? new Date(strategy.nextRun).toLocaleString() : t('sl.notScheduled')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/InvestorDashboard/AllocationEngine/strategies/${strategy.id}`}
                        className="text-black hover:text-blue-900"
                        title={t('sl.viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/InvestorDashboard/AllocationEngine/strategies/${strategy.id}?edit=true`}
                        className="text-gray-600 hover:text-gray-900"
                        title={t('sl.editStrategy')}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/InvestorDashboard/AllocationEngine/strategies/${strategy.id}/simulate`}
                        className="text-red-600 hover:text-red-900"
                        title={t('sl.runSimulation')}
                      >
                        <Play className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleStrategy(strategy.id, strategy.status)}
                        className={`${strategy.status === 'Published' ? 'text-yellow-600 hover:text-yellow-900' : 'text-red-600 hover:text-red-900'}`}
                        title={strategy.status === 'Published' ? t('sl.pauseStrategy') : t('sl.enableStrategy')}
                      >
                        {strategy.status === 'Published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCloneStrategy(strategy.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title={t('sl.cloneStrategy')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {strategy.status === 'Draft' && (
                        <button
                          onClick={() => handleDeleteStrategy(strategy.id)}
                          className="text-red-600 hover:text-red-900"
                          title={t('sl.deleteStrategy')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
          {t('sl.countLabel', { shown: filteredStrategies.length, total: strategies.length })}
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
    </div>
  );
}
