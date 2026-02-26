import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  Eye,
  Share,
  Target,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

const analyticsData = {
  performanceMetrics: {
    sharpeRatio: 1.42,
    volatility: 12.8,
    maxDrawdown: -8.5,
    beta: 0.95,
    alpha: 2.3,
    informationRatio: 0.68
  },
  assetAllocation: [
    { name: 'Equity', value: 65, amount: 1560000000, color: '#3B82F6' },
    { name: 'Fixed Income', value: 25, amount: 600000000, color: '#10B981' },
    { name: 'Alternative', value: 8, amount: 192000000, color: '#F59E0B' },
    { name: 'Cash', value: 2, amount: 48000000, color: '#6B7280' }
  ],
  geographicAllocation: [
    { name: 'North America', value: 55, amount: 1320000000 },
    { name: 'Europe', value: 25, amount: 600000000 },
    { name: 'Asia Pacific', value: 15, amount: 360000000 },
    { name: 'Emerging Markets', value: 5, amount: 120000000 }
  ],
  sectorBreakdown: [
    { name: 'Technology', value: 22, amount: 528000000 },
    { name: 'Healthcare', value: 18, amount: 432000000 },
    { name: 'Financial Services', value: 15, amount: 360000000 },
    { name: 'Consumer Goods', value: 12, amount: 288000000 },
    { name: 'Industrial', value: 10, amount: 240000000 },
    { name: 'Real Estate', value: 8, amount: 192000000 },
    { name: 'Energy', value: 8, amount: 192000000 },
    { name: 'Others', value: 7, amount: 168000000 }
  ],
  performanceTrends: [
    { month: 'Jan 2024', return: 3.2, benchmark: 2.8, cumulative: 3.2 },
    { month: 'Feb 2024', return: 1.8, benchmark: 1.5, cumulative: 5.1 },
    { month: 'Mar 2024', return: 2.5, benchmark: 2.2, cumulative: 7.7 },
    { month: 'Apr 2024', return: -0.8, benchmark: -1.2, cumulative: 6.9 },
    { month: 'May 2024', return: 2.8, benchmark: 2.1, cumulative: 9.9 },
    { month: 'Jun 2024', return: 1.5, benchmark: 1.8, cumulative: 11.5 }
  ],
  riskMetrics: [
    { metric: 'Value at Risk (95%)', value: '$24.5M', threshold: '$30M', status: 'Normal' },
    { metric: 'Concentration Risk', value: '22%', threshold: '25%', status: 'Warning' },
    { metric: 'Leverage Ratio', value: '1.15x', threshold: '1.5x', status: 'Normal' },
    { metric: 'Liquidity Coverage', value: '85%', threshold: '80%', status: 'Good' }
  ],
  topHoldings: [
    { name: 'Apple Inc.', symbol: 'AAPL', weight: 4.2, value: 100800000, return: 28.5 },
    { name: 'Microsoft Corp.', symbol: 'MSFT', weight: 3.8, value: 91200000, return: 22.1 },
    { name: 'Amazon.com Inc.', symbol: 'AMZN', weight: 3.2, value: 76800000, return: 18.7 },
    { name: 'NVIDIA Corp.', symbol: 'NVDA', weight: 2.9, value: 69600000, return: 45.2 },
    { name: 'Alphabet Inc.', symbol: 'GOOGL', weight: 2.5, value: 60000000, return: 15.3 }
  ]
};

export default function PortfolioAnalytics() {
  const [timeRange, setTimeRange] = useState('6m');
  const [activeChart, setActiveChart] = useState('performance');

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'text-green-600 bg-green-100';
      case 'Normal': return 'text-black bg-gray-100';
      case 'Warning': return 'text-yellow-600 bg-yellow-100';
      case 'Alert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            to="/admin/reports"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Analytics</h1>
            <p className="text-gray-600">Advanced performance metrics and risk analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="3y">3 Years</option>
            </select>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Sharpe Ratio</p>
            <Target className="w-5 h-5 text-gray-700" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.performanceMetrics.sharpeRatio}</p>
          <p className="text-xs text-green-600 mt-1">Above benchmark</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Volatility</p>
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.performanceMetrics.volatility}%</p>
          <p className="text-xs text-gray-500 mt-1">Annualized</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Max Drawdown</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{analyticsData.performanceMetrics.maxDrawdown}%</p>
          <p className="text-xs text-gray-500 mt-1">Worst period</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Beta</p>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.performanceMetrics.beta}</p>
          <p className="text-xs text-gray-500 mt-1">vs S&P 500</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Alpha</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{analyticsData.performanceMetrics.alpha}%</p>
          <p className="text-xs text-green-600 mt-1">Excess return</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Info Ratio</p>
            <Target className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.performanceMetrics.informationRatio}</p>
          <p className="text-xs text-gray-500 mt-1">Risk-adj return</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Asset Allocation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
          <div className="space-y-4">
            {analyticsData.assetAllocation.map((asset, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">{asset.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{asset.value}%</div>
                  <div className="text-xs text-gray-500">{formatCurrency(asset.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Allocation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Allocation</h3>
          <div className="space-y-4">
            {analyticsData.geographicAllocation.map((geo, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{geo.name}</span>
                  <span className="text-sm text-gray-600">{geo.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full"
                    style={{ width: `${geo.value}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{formatCurrency(geo.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
          <div className="space-y-4">
            {analyticsData.riskMetrics.map((risk, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{risk.metric}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(risk.status)}`}>
                    {risk.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{risk.value}</span>
                  <span className="text-xs text-gray-500">Limit: {risk.threshold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sector Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.sectorBreakdown.map((sector, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">{sector.name}</h4>
                <span className="text-sm font-semibold text-black">{sector.value}%</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">{formatCurrency(sector.amount)}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full"
                  style={{ width: `${(sector.value / 25) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Holdings */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Security
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  YTD Return
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.topHoldings.map((holding, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{holding.name}</div>
                      <div className="text-sm text-gray-500">{holding.symbol}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holding.weight}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(holding.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{holding.return}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveChart('performance')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeChart === 'performance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveChart('risk')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeChart === 'risk' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Risk Analysis
            </button>
          </div>
        </div>

        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Interactive Charts</h4>
          <p className="text-gray-600 mb-4">
            {activeChart === 'performance'
              ? 'Performance vs benchmark comparison over time'
              : 'Risk metrics and volatility analysis'
            }
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-2xl mx-auto">
            {analyticsData.performanceTrends.map((trend, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{trend.month.split(' ')[0]}</div>
                <div className="text-sm font-medium text-green-600">+{trend.return}%</div>
                <div className="text-xs text-gray-400">Bench: {trend.benchmark}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
