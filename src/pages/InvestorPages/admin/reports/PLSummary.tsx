import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Filter,
  RefreshCw,
  Eye,
  Share,
  Printer
} from 'lucide-react';

const plData = {
  summary: {
    totalInvestment: 32450000,
    currentValue: 38920000,
    unrealizedGains: 5870000,
    realizedGains: 600000,
    totalGains: 6470000,
    totalReturn: 19.93,
    period: '2024 YTD'
  },
  byProduct: [
    {
      id: 1,
      name: 'Large Cap Growth Fund',
      investment: 8500000,
      currentValue: 10370000,
      unrealizedGains: 1620000,
      realizedGains: 250000,
      totalGains: 1870000,
      return: 22.0,
      investors: 245
    },
    {
      id: 2,
      name: 'Fixed Income Plus',
      investment: 6200000,
      currentValue: 6820000,
      unrealizedGains: 520000,
      realizedGains: 100000,
      totalGains: 620000,
      return: 10.0,
      investors: 156
    },
    {
      id: 3,
      name: 'Real Estate Investment Trust',
      investment: 7800000,
      currentValue: 9360000,
      unrealizedGains: 1360000,
      realizedGains: 200000,
      totalGains: 1560000,
      return: 20.0,
      investors: 134
    },
    {
      id: 4,
      name: 'Emerging Markets Equity',
      investment: 4950000,
      currentValue: 4702500,
      unrealizedGains: -247500,
      realizedGains: 0,
      totalGains: -247500,
      return: -5.0,
      investors: 89
    },
    {
      id: 5,
      name: 'Private Equity Fund III',
      investment: 5000000,
      currentValue: 7667500,
      unrealizedGains: 2617500,
      realizedGains: 50000,
      totalGains: 2667500,
      return: 53.35,
      investors: 12
    }
  ],
  byPeriod: [
    { period: 'January 2024', gains: 1200000, return: 3.8 },
    { period: 'February 2024', gains: 950000, return: 2.9 },
    { period: 'March 2024', gains: 1100000, return: 3.3 },
    { period: 'April 2024', gains: 800000, return: 2.4 },
    { period: 'May 2024', gains: 1150000, return: 3.4 },
    { period: 'June 2024', gains: 1270000, return: 3.7 }
  ],
  topPerformers: [
    { investor: 'Goldman Family Office', gains: 2600000, return: 35.2 },
    { investor: 'Sarah Chen', gains: 900000, return: 28.4 },
    { investor: 'John Anderson', gains: 440000, return: 18.0 },
    { investor: 'Emma Thompson', gains: 900000, return: 16.8 },
    { investor: 'Tech Pension Fund', gains: 750000, return: 15.2 }
  ]
};

export default function PLSummary() {
  const [dateRange, setDateRange] = useState('ytd');
  const [viewBy, setViewBy] = useState('product');
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyCompact = (amount: number) => {
    if (Math.abs(amount) >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(amount) >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert('Report generated successfully!');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">P/L Summary</h1>
            <p className="text-gray-600">Profit and loss analysis across all investments</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="mtd">Month to Date</option>
              <option value="qtd">Quarter to Date</option>
              <option value="ytd">Year to Date</option>
              <option value="1y">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Data
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Investment</p>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(plData.summary.totalInvestment)}</p>
          <p className="text-xs text-gray-500 mt-1">{plData.summary.period}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Current Value</p>
            <BarChart3 className="w-5 h-5 text-gray-700" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(plData.summary.currentValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Market value</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Unrealized Gains</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(plData.summary.unrealizedGains)}</p>
          <p className="text-xs text-gray-500 mt-1">Paper gains</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Realized Gains</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(plData.summary.realizedGains)}</p>
          <p className="text-xs text-gray-500 mt-1">Actual gains</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Return</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{plData.summary.totalReturn.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">Overall performance</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <div className="flex items-center bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewBy('product')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewBy === 'product' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            By Product
          </button>
          <button
            onClick={() => setViewBy('period')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewBy === 'period' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            By Period
          </button>
          <button
            onClick={() => setViewBy('investor')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewBy === 'investor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            By Investor
          </button>
        </div>
      </div>

      {/* P/L Breakdown */}
      {viewBy === 'product' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">P/L by Product</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unrealized P/L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Realized P/L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total P/L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investors
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plData.byProduct.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.investment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        product.unrealizedGains >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.unrealizedGains >= 0 ? '+' : ''}{formatCurrency(product.unrealizedGains)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        +{formatCurrency(product.realizedGains)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        product.totalGains >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.totalGains >= 0 ? '+' : ''}{formatCurrency(product.totalGains)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm font-medium ${
                        product.return >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.return >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {product.return >= 0 ? '+' : ''}{product.return.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.investors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewBy === 'period' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">P/L by Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plData.byPeriod.map((period, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{period.period}</h4>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">{period.return.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-600">
                  +{formatCurrency(period.gains)}
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(period.return / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewBy === 'investor' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Investors</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gains
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plData.topPerformers.map((investor, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-700">{index + 1}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{investor.investor}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      +{formatCurrency(investor.gains)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{investor.return.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min((investor.return / 40) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Portfolio Summary</h3>
            <p className="text-sm text-gray-600">
              Total portfolio value increased by {formatCurrency(plData.summary.totalGains)} ({plData.summary.totalReturn.toFixed(2)}%) for the period {plData.summary.period}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Last updated</p>
            <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
