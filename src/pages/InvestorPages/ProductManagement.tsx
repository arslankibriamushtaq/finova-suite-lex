import { useState } from 'react';
import { Search, Plus, MoreHorizontal, Download, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { cn } from '../../lib/utils';

const products = [
  {
    id: 1,
    name: 'Large Cap Growth Fund',
    type: 'Equity Fund',
    status: 'Active',
    aum: '$450M',
    investors: 245,
    minInvestment: '$100,000',
    performanceYTD: '+12.3%',
    performanceType: 'positive',
    riskLevel: 'Moderate',
    managementFee: '1.25%',
    inceptionDate: '2020-03-15',
    benchmark: 'S&P 500'
  },
  {
    id: 2,
    name: 'Fixed Income Plus',
    type: 'Bond Fund',
    status: 'Active',
    aum: '$280M',
    investors: 156,
    minInvestment: '$50,000',
    performanceYTD: '+4.7%',
    performanceType: 'positive',
    riskLevel: 'Conservative',
    managementFee: '0.85%',
    inceptionDate: '2019-08-22',
    benchmark: 'Bloomberg Aggregate'
  },
  {
    id: 3,
    name: 'Emerging Markets Equity',
    type: 'Equity Fund',
    status: 'Active',
    aum: '$180M',
    investors: 89,
    minInvestment: '$250,000',
    performanceYTD: '-2.1%',
    performanceType: 'negative',
    riskLevel: 'High',
    managementFee: '1.75%',
    inceptionDate: '2021-01-10',
    benchmark: 'MSCI EM'
  },
  {
    id: 4,
    name: 'Real Estate Investment Trust',
    type: 'REIT',
    status: 'Pending Launch',
    aum: '$0M',
    investors: 0,
    minInvestment: '$500,000',
    performanceYTD: 'N/A',
    performanceType: 'neutral',
    riskLevel: 'Moderate-High',
    managementFee: '2.00%',
    inceptionDate: '2024-03-01',
    benchmark: 'FTSE NAREIT'
  },
  {
    id: 5,
    name: 'Private Equity Fund III',
    type: 'Private Equity',
    status: 'Fundraising',
    aum: '$25M',
    investors: 12,
    minInvestment: '$1,000,000',
    performanceYTD: '+8.9%',
    performanceType: 'positive',
    riskLevel: 'High',
    managementFee: '2.50%',
    inceptionDate: '2023-11-01',
    benchmark: 'Custom'
  },
];

const productTypes = ['All Types', 'Equity Fund', 'Bond Fund', 'REIT', 'Private Equity', 'Hedge Fund'];
const statusOptions = ['All Status', 'Active', 'Pending Launch', 'Fundraising', 'Closed'];

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All Types' || product.type === typeFilter;
    const matchesStatus = statusFilter === 'All Status' || product.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
            <p className="text-gray-600">Manage investment products and fund offerings</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export Products
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
            <Package className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">38</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total AUM</p>
              <p className="text-2xl font-bold text-gray-900">$2.4B</p>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">+8.2%</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AUM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                YTD Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Management Fee
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">Min: {product.minInvestment}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      product.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'Pending Launch'
                        ? 'bg-yellow-100 text-yellow-800'
                        : product.status === 'Fundraising'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.aum}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.investors}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.performanceType === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : product.performanceType === 'negative' ? (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    ) : null}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        product.performanceType === 'positive'
                          ? 'text-green-600'
                          : product.performanceType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      )}
                    >
                      {product.performanceYTD}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      product.riskLevel === 'Conservative'
                        ? 'bg-green-100 text-green-800'
                        : product.riskLevel === 'Moderate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    )}
                  >
                    {product.riskLevel}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.managementFee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
