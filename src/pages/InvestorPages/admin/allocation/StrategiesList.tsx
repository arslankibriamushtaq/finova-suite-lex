import { useState } from 'react';
import { Link } from 'react-router-dom';
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
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Published': return <CheckCircle className="w-4 h-4 text-green-500" />;
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
    alert(`Enabling ${selectedStrategies.length} strategies`);
    setSelectedStrategies([]);
  };

  const handleBulkDisable = () => {
    alert(`Disabling ${selectedStrategies.length} strategies`);
    setSelectedStrategies([]);
  };

  const handleBulkExport = () => {
    alert(`Exporting ${selectedStrategies.length} strategies`);
  };

  const handleToggleStrategy = (strategyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Paused' : 'Published';
    alert(`Strategy ${strategyId} ${newStatus === 'Published' ? 'enabled' : 'disabled'}`);
  };

  const handleCloneStrategy = (strategyId: string) => {
    alert(`Cloning strategy ${strategyId}`);
  };

  const handleDeleteStrategy = (strategyId: string) => {
    if (confirm('Are you sure you want to delete this strategy?')) {
      alert(`Deleting strategy ${strategyId}`);
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Allocation Strategies</h1>
              <p className="text-gray-600">Manage automated allocation strategies</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button 
              onClick={handleBulkExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <Link
              to="/admin/allocation/strategies/new"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Strategy
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
                placeholder="Search strategies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {filteredStrategies.length} of {strategies.length} strategies
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
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {productOptions.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {riskOptions.map(risk => (
                <option key={risk} value={risk}>{risk}</option>
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
              {selectedStrategies.length} strategies selected
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkEnable}
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                Enable
              </button>
              <button
                onClick={handleBulkDisable}
                className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
              >
                Disable
              </button>
              <button
                onClick={handleBulkExport}
                className="text-sm font-medium text-black hover:text-gray-800"
              >
                Export
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
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStrategies.length === filteredStrategies.length && filteredStrategies.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-black focus:ring-gray-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rules
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
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
                        Created by {strategy.createdBy}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {strategy.riskBands.map((risk) => (
                          <span key={risk} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                            {risk} Risk
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(strategy.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(strategy.status)}`}>
                        {strategy.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{strategy.rulesCount} rules</div>
                    <div className="text-xs text-gray-500">
                      {strategy.productModels.slice(0, 2).join(', ')}
                      {strategy.productModels.length > 2 && ` +${strategy.productModels.length - 2} more`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(strategy.allocatedAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${strategy.performance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {strategy.performance > 0 ? `+${strategy.performance}%` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {strategy.nextRun ? new Date(strategy.nextRun).toLocaleString() : 'Not scheduled'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/admin/allocation/strategies/${strategy.id}`}
                        className="text-black hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/admin/allocation/strategies/${strategy.id}?edit=true`}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Strategy"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/admin/allocation/strategies/${strategy.id}/simulate`}
                        className="text-green-600 hover:text-green-900"
                        title="Run Simulation"
                      >
                        <Play className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleToggleStrategy(strategy.id, strategy.status)}
                        className={`${strategy.status === 'Published' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                        title={strategy.status === 'Published' ? 'Pause Strategy' : 'Enable Strategy'}
                      >
                        {strategy.status === 'Published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleCloneStrategy(strategy.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Clone Strategy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {strategy.status === 'Draft' && (
                        <button 
                          onClick={() => handleDeleteStrategy(strategy.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Strategy"
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
          Showing {filteredStrategies.length} of {strategies.length} strategies
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
    </div>
  );
}
