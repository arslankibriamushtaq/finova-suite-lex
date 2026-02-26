import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Activity,
  Info
} from 'lucide-react';

const benchmarkData = [
  {
    name: 'S&P 500',
    ticker: 'SPX',
    period: 'YTD',
    portfolioReturn: 12.8,
    benchmarkReturn: 11.2,
    outperformance: 1.6,
    trackingError: 2.1,
    correlation: 0.89
  },
  {
    name: 'MSCI World',
    ticker: 'MSCI',
    period: 'YTD',
    portfolioReturn: 12.8,
    benchmarkReturn: 10.5,
    outperformance: 2.3,
    trackingError: 3.2,
    correlation: 0.85
  },
  {
    name: 'Russell 2000',
    ticker: 'RUT',
    period: 'YTD',
    portfolioReturn: 12.8,
    benchmarkReturn: 14.1,
    outperformance: -1.3,
    trackingError: 4.5,
    correlation: 0.72
  },
  {
    name: 'Bloomberg Aggregate',
    ticker: 'AGG',
    period: 'YTD',
    portfolioReturn: 12.8,
    benchmarkReturn: 3.2,
    outperformance: 9.6,
    trackingError: 8.9,
    correlation: 0.35
  }
];

const historicalData = [
  { period: '1 Month', portfolio: 2.1, sp500: 1.8, msci: 1.5, russell: 2.8 },
  { period: '3 Months', portfolio: 6.4, sp500: 5.2, msci: 4.8, russell: 7.1 },
  { period: '6 Months', portfolio: 9.7, sp500: 8.5, msci: 7.9, russell: 11.2 },
  { period: '1 Year', portfolio: 18.3, sp500: 16.7, msci: 15.2, russell: 19.8 },
  { period: '3 Years', portfolio: 11.5, sp500: 10.2, msci: 9.8, russell: 12.3 },
  { period: '5 Years', portfolio: 9.8, sp500: 9.1, msci: 8.7, russell: 10.5 }
];

const riskMetrics = [
  { metric: 'Sharpe Ratio', portfolio: 1.24, sp500: 1.15, msci: 1.08, russell: 1.02 },
  { metric: 'Information Ratio', portfolio: 0.76, sp500: 'N/A', msci: 0.72, russell: -0.29 },
  { metric: 'Beta', portfolio: 0.95, sp500: 1.00, msci: 0.92, russell: 1.15 },
  { metric: 'Alpha (%)', portfolio: 2.1, sp500: 0.0, msci: 1.8, russell: -1.5 }
];

export default function BenchmarkComparison() {
  const [selectedPeriod, setSelectedPeriod] = useState('YTD');
  const [selectedBenchmark, setSelectedBenchmark] = useState('S&P 500');

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
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
              <h1 className="text-3xl font-bold text-gray-900">Benchmark Comparison</h1>
              <p className="text-gray-600">Performance analysis vs. market benchmarks</p>
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
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-black mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Benchmark Comparison Report</h3>
            <p className="text-sm text-gray-800 mt-1">
              This report compares portfolio performance against major market indices and benchmarks. 
              Data is updated daily and includes risk-adjusted performance metrics.
            </p>
            <p className="text-xs text-black mt-2">
              Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Period Selection */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Time Period:</span>
          {['1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm rounded-lg ${
                selectedPeriod === period
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {benchmarkData.map((benchmark) => (
          <div key={benchmark.name} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{benchmark.name}</h3>
                <p className="text-xs text-gray-500">{benchmark.ticker}</p>
              </div>
              <Target className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Portfolio</span>
                  <span className={`text-sm font-medium ${getPerformanceColor(benchmark.portfolioReturn)}`}>
                    {formatPercentage(benchmark.portfolioReturn)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Benchmark</span>
                  <span className={`text-sm font-medium ${getPerformanceColor(benchmark.benchmarkReturn)}`}>
                    {formatPercentage(benchmark.benchmarkReturn)}
                  </span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Outperformance</span>
                  <div className="flex items-center">
                    {benchmark.outperformance >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-semibold ${getPerformanceColor(benchmark.outperformance)}`}>
                      {formatPercentage(benchmark.outperformance)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Tracking Error</span>
                  <span className="text-xs text-gray-700">{benchmark.trackingError}%</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Correlation</span>
                  <span className="text-xs text-gray-700">{benchmark.correlation}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Historical Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Historical Performance</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Portfolio</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">S&P 500</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">MSCI</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Russell</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historicalData.map((row) => (
                  <tr key={row.period}>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{row.period}</td>
                    <td className={`px-3 py-3 text-sm text-right font-medium ${getPerformanceColor(row.portfolio)}`}>
                      {formatPercentage(row.portfolio)}
                    </td>
                    <td className={`px-3 py-3 text-sm text-right ${getPerformanceColor(row.sp500)}`}>
                      {formatPercentage(row.sp500)}
                    </td>
                    <td className={`px-3 py-3 text-sm text-right ${getPerformanceColor(row.msci)}`}>
                      {formatPercentage(row.msci)}
                    </td>
                    <td className={`px-3 py-3 text-sm text-right ${getPerformanceColor(row.russell)}`}>
                      {formatPercentage(row.russell)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk-Adjusted Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Risk-Adjusted Metrics</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Portfolio</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">S&P 500</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">MSCI</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Russell</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {riskMetrics.map((row) => (
                  <tr key={row.metric}>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{row.metric}</td>
                    <td className="px-3 py-3 text-sm text-right font-medium text-black">
                      {typeof row.portfolio === 'number' ? row.portfolio.toFixed(2) : row.portfolio}
                    </td>
                    <td className="px-3 py-3 text-sm text-right text-gray-700">
                      {typeof row.sp500 === 'number' ? row.sp500.toFixed(2) : row.sp500}
                    </td>
                    <td className="px-3 py-3 text-sm text-right text-gray-700">
                      {typeof row.msci === 'number' ? row.msci.toFixed(2) : row.msci}
                    </td>
                    <td className="px-3 py-3 text-sm text-right text-gray-700">
                      {typeof row.russell === 'number' ? row.russell.toFixed(2) : row.russell}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Attribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Attribution Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Security Selection</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Technology</span>
                <span className="text-sm font-medium text-green-600">+1.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Healthcare</span>
                <span className="text-sm font-medium text-green-600">+0.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Energy</span>
                <span className="text-sm font-medium text-red-600">-0.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Financials</span>
                <span className="text-sm font-medium text-green-600">+0.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Asset Allocation</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Overweight Equities</span>
                <span className="text-sm font-medium text-green-600">+0.6%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Underweight Bonds</span>
                <span className="text-sm font-medium text-green-600">+0.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Alternative Investments</span>
                <span className="text-sm font-medium text-green-600">+0.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Cash Position</span>
                <span className="text-sm font-medium text-red-600">-0.1%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Geographic Allocation</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">US Markets</span>
                <span className="text-sm font-medium text-green-600">+0.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">International Developed</span>
                <span className="text-sm font-medium text-green-600">+0.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Emerging Markets</span>
                <span className="text-sm font-medium text-red-600">-0.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Currency Effects</span>
                <span className="text-sm font-medium text-green-600">+0.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p>Data as of market close on {new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
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
