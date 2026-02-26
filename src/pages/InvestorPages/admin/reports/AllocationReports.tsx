import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share,
  RefreshCw,
  Calendar,
  PieChart,
  BarChart3,
  TrendingUp,
  Globe,
  Target,
  Info
} from 'lucide-react';

const assetAllocation = [
  { category: 'US Equities', current: 35.2, target: 35.0, drift: 0.2, value: 176000000 },
  { category: 'International Equities', current: 25.8, target: 25.0, drift: 0.8, value: 129000000 },
  { category: 'Emerging Markets', current: 8.5, target: 10.0, drift: -1.5, value: 42500000 },
  { category: 'Fixed Income', current: 20.1, target: 20.0, drift: 0.1, value: 100500000 },
  { category: 'Real Estate', current: 5.8, target: 5.0, drift: 0.8, value: 29000000 },
  { category: 'Commodities', current: 2.9, target: 3.0, drift: -0.1, value: 14500000 },
  { category: 'Cash & Equivalents', current: 1.7, target: 2.0, drift: -0.3, value: 8500000 }
];

const geographicAllocation = [
  { region: 'North America', allocation: 48.5, value: 242500000, countries: ['USA', 'Canada'] },
  { region: 'Europe', allocation: 22.3, value: 111500000, countries: ['UK', 'Germany', 'France', 'Switzerland'] },
  { region: 'Asia Pacific', allocation: 18.7, value: 93500000, countries: ['Japan', 'China', 'Australia', 'South Korea'] },
  { region: 'Emerging Markets', allocation: 8.5, value: 42500000, countries: ['Brazil', 'India', 'Mexico', 'Taiwan'] },
  { region: 'Other', allocation: 2.0, value: 10000000, countries: ['Global Funds', 'Currency Hedges'] }
];

const sectorAllocation = [
  { sector: 'Technology', allocation: 18.2, value: 91000000, performance: 12.5 },
  { sector: 'Healthcare', allocation: 15.1, value: 75500000, performance: 8.3 },
  { sector: 'Financial Services', allocation: 12.8, value: 64000000, performance: 6.7 },
  { sector: 'Consumer Discretionary', allocation: 11.3, value: 56500000, performance: 15.2 },
  { sector: 'Industrials', allocation: 9.7, value: 48500000, performance: 9.1 },
  { sector: 'Consumer Staples', allocation: 8.4, value: 42000000, performance: 4.2 },
  { sector: 'Energy', allocation: 6.2, value: 31000000, performance: 22.8 },
  { sector: 'Materials', allocation: 5.8, value: 29000000, performance: 11.4 },
  { sector: 'Utilities', allocation: 4.9, value: 24500000, performance: 3.1 },
  { sector: 'Real Estate', allocation: 4.1, value: 20500000, performance: 7.8 },
  { sector: 'Telecommunications', allocation: 3.5, value: 17500000, performance: 5.9 }
];

const historicalAllocation = [
  { date: 'Q1 2023', equities: 58.5, fixedIncome: 25.2, alternatives: 14.3, cash: 2.0 },
  { date: 'Q2 2023', equities: 61.2, fixedIncome: 23.8, alternatives: 13.1, cash: 1.9 },
  { date: 'Q3 2023', equities: 63.8, fixedIncome: 22.1, alternatives: 12.4, cash: 1.7 },
  { date: 'Q4 2023', equities: 69.5, fixedIncome: 20.1, alternatives: 8.7, cash: 1.7 }
];

const riskMetrics = [
  { metric: 'Portfolio Beta', value: 0.95, benchmark: 1.00 },
  { metric: 'Tracking Error', value: 2.8, benchmark: 0.0 },
  { metric: 'Sharpe Ratio', value: 1.24, benchmark: 1.15 },
  { metric: 'Information Ratio', value: 0.67, benchmark: 0.0 },
  { metric: 'Maximum Drawdown', value: 8.5, benchmark: 12.3 },
  { metric: 'Volatility (Ann.)', value: 12.3, benchmark: 14.8 }
];

const topHoldings = [
  { holding: 'Apple Inc.', ticker: 'AAPL', allocation: 3.2, value: 16000000, sector: 'Technology' },
  { holding: 'Microsoft Corp.', ticker: 'MSFT', allocation: 2.8, value: 14000000, sector: 'Technology' },
  { holding: 'Amazon.com Inc.', ticker: 'AMZN', allocation: 2.1, value: 10500000, sector: 'Consumer Discretionary' },
  { holding: 'Alphabet Inc.', ticker: 'GOOGL', allocation: 1.9, value: 9500000, sector: 'Technology' },
  { holding: 'Tesla Inc.', ticker: 'TSLA', allocation: 1.7, value: 8500000, sector: 'Consumer Discretionary' },
  { holding: 'NVIDIA Corp.', ticker: 'NVDA', allocation: 1.5, value: 7500000, sector: 'Technology' },
  { holding: 'Meta Platforms', ticker: 'META', allocation: 1.4, value: 7000000, sector: 'Technology' },
  { holding: 'Berkshire Hathaway', ticker: 'BRK.B', allocation: 1.3, value: 6500000, sector: 'Financial Services' },
  { holding: 'Johnson & Johnson', ticker: 'JNJ', allocation: 1.2, value: 6000000, sector: 'Healthcare' },
  { holding: 'UnitedHealth Group', ticker: 'UNH', allocation: 1.1, value: 5500000, sector: 'Healthcare' }
];

export default function AllocationReports() {
  const [selectedView, setSelectedView] = useState('asset');
  const [timeframe, setTimeframe] = useState('current');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getDriftColor = (drift: number) => {
    const absDrift = Math.abs(drift);
    if (absDrift >= 2.0) return 'text-red-600';
    if (absDrift >= 1.0) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPerformanceColor = (perf: number) => {
    return perf >= 0 ? 'text-green-600' : 'text-red-600';
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
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Reports
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Allocation Reports</h1>
              <p className="text-gray-600">Asset allocation breakdown and analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-purple-900">Asset Allocation Report</h3>
            <p className="text-sm text-purple-700 mt-1">
              Comprehensive breakdown of portfolio allocation across asset classes, sectors, and geographic regions. 
              Includes target vs. actual allocation analysis and drift monitoring.
            </p>
            <p className="text-xs text-purple-600 mt-2">
              Data as of: {new Date().toLocaleDateString()} | Portfolio Value: $500M
            </p>
          </div>
        </div>
      </div>

      {/* View Selection */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">View:</span>
          {[
            { key: 'asset', label: 'Asset Classes' },
            { key: 'sector', label: 'Sectors' },
            { key: 'geographic', label: 'Geographic' },
            { key: 'holdings', label: 'Top Holdings' }
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => setSelectedView(view.key)}
              className={`px-3 py-1 text-sm rounded-lg ${
                selectedView === view.key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Total Portfolio Value</h3>
            <Target className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">$500.0M</p>
            <p className="text-xs text-gray-500">As of {new Date().toLocaleDateString()}</p>
            <p className="text-xs text-green-600">+8.5% YTD</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Equity Allocation</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">69.5%</p>
            <p className="text-xs text-gray-500">$347.5M</p>
            <p className="text-xs text-green-600">+5.7% vs target</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Fixed Income</h3>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">20.1%</p>
            <p className="text-xs text-gray-500">$100.5M</p>
            <p className="text-xs text-red-600">-0.1% vs target</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Geographic Diversity</h3>
            <Globe className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-600">5</p>
            <p className="text-xs text-gray-500">Regions</p>
            <p className="text-xs text-gray-600">51.5% international</p>
          </div>
        </div>
      </div>

      {/* Asset Class Allocation */}
      {selectedView === 'asset' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Asset Class Allocation</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Class</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current %</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Target %</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Drift</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assetAllocation.map((asset) => (
                  <tr key={asset.category}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{asset.category}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-black">
                      {formatPercentage(asset.current)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-gray-700">
                      {formatPercentage(asset.target)}
                    </td>
                    <td className={`px-4 py-4 text-sm text-right font-medium ${getDriftColor(asset.drift)}`}>
                      {asset.drift >= 0 ? '+' : ''}{formatPercentage(asset.drift)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-gray-900">
                      {formatCurrency(asset.value)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <div 
                          className={`w-full max-w-24 h-2 rounded-full ${
                            Math.abs(asset.drift) >= 2 ? 'bg-red-200' : 
                            Math.abs(asset.drift) >= 1 ? 'bg-yellow-200' : 'bg-green-200'
                          }`}
                        >
                          <div 
                            className={`h-2 rounded-full ${
                              Math.abs(asset.drift) >= 2 ? 'bg-red-500' : 
                              Math.abs(asset.drift) >= 1 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(asset.current / Math.max(...assetAllocation.map(a => a.current))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sector Allocation */}
      {selectedView === 'sector' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sector Allocation</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectorAllocation.map((sector) => (
              <div key={sector.sector} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{sector.sector}</h4>
                  <span className="text-lg font-bold text-black">{formatPercentage(sector.allocation)}</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">Value</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(sector.value)}</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">YTD Performance</span>
                  <span className={`text-sm font-medium ${getPerformanceColor(sector.performance)}`}>
                    {sector.performance >= 0 ? '+' : ''}{formatPercentage(sector.performance)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-700 h-2 rounded-full"
                    style={{ width: `${(sector.allocation / Math.max(...sectorAllocation.map(s => s.allocation))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geographic Allocation */}
      {selectedView === 'geographic' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Geographic Allocation</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {geographicAllocation.map((region) => (
              <div key={region.region} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">{region.region}</h4>
                  <span className="text-xl font-bold text-green-600">{formatPercentage(region.allocation)}</span>
                </div>
                
                <div className="mb-3">
                  <span className="text-xs text-gray-500 block">Value</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(region.value)}</span>
                </div>
                
                <div className="mb-4">
                  <span className="text-xs text-gray-500 block mb-2">Key Markets</span>
                  <div className="flex flex-wrap gap-1">
                    {region.countries.map((country) => (
                      <span key={country} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(region.allocation / Math.max(...geographicAllocation.map(g => g.allocation))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Holdings */}
      {selectedView === 'holdings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top 10 Holdings</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Security</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ticker</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sector</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Allocation</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topHoldings.map((holding, index) => (
                  <tr key={holding.ticker}>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-3">{index + 1}.</span>
                        <span className="font-medium text-gray-900">{holding.holding}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-black font-medium">{holding.ticker}</td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {holding.sector}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-black">
                      {formatPercentage(holding.allocation)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-gray-900">
                      {formatCurrency(holding.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Allocation Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Allocation Trends</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Equities</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Bonds</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Alts</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historicalAllocation.map((period) => (
                  <tr key={period.date}>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{period.date}</td>
                    <td className="px-3 py-3 text-sm text-right text-black">{formatPercentage(period.equities)}</td>
                    <td className="px-3 py-3 text-sm text-right text-purple-600">{formatPercentage(period.fixedIncome)}</td>
                    <td className="px-3 py-3 text-sm text-right text-orange-600">{formatPercentage(period.alternatives)}</td>
                    <td className="px-3 py-3 text-sm text-right text-gray-600">{formatPercentage(period.cash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Risk-Adjusted Metrics</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {riskMetrics.map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{metric.metric}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-black">{metric.value}</span>
                  {metric.benchmark !== 0 && (
                    <div className="text-xs text-gray-500">
                      vs {metric.benchmark} benchmark
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p>Allocation data updated daily | Target allocations reviewed quarterly</p>
          </div>
          <div className="text-right">
            <p>Portfolio Management System v2.1</p>
            <p>© 2024 Investment Management Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
