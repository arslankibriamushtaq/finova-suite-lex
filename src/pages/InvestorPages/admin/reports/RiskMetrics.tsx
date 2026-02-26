import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Shield,
  Activity,
  TrendingDown,
  BarChart3,
  Target,
  Info
} from 'lucide-react';

const riskOverview = {
  portfolioValue: 125000000,
  var95: 2450000,
  var99: 3750000,
  expectedShortfall: 4200000,
  maxDrawdown: 8.5,
  volatility: 12.3,
  beta: 0.95,
  sharpeRatio: 1.24
};

const riskFactors = [
  { factor: 'Equity Risk', exposure: 65.2, contribution: 78.5, limit: 80.0, status: 'Within Limits' },
  { factor: 'Interest Rate Risk', exposure: 15.8, contribution: 12.3, limit: 25.0, status: 'Within Limits' },
  { factor: 'Credit Risk', exposure: 8.4, contribution: 6.8, limit: 15.0, status: 'Within Limits' },
  { factor: 'Currency Risk', exposure: 12.1, contribution: 9.2, limit: 20.0, status: 'Within Limits' },
  { factor: 'Commodity Risk', exposure: 3.5, contribution: 2.8, limit: 10.0, status: 'Within Limits' },
  { factor: 'Concentration Risk', exposure: 18.7, contribution: 15.4, limit: 25.0, status: 'Monitor' }
];

const stressTests = [
  {
    scenario: '2008 Financial Crisis',
    portfolioImpact: -28.5,
    duration: '12 months',
    recovery: '18 months',
    probability: 'Low (2-5%)'
  },
  {
    scenario: 'European Debt Crisis',
    portfolioImpact: -15.2,
    duration: '8 months',
    recovery: '14 months',
    probability: 'Medium (5-10%)'
  },
  {
    scenario: 'COVID-19 Pandemic',
    portfolioImpact: -22.1,
    duration: '6 months',
    recovery: '12 months',
    probability: 'Medium (5-10%)'
  },
  {
    scenario: 'Interest Rate Shock (+300bps)',
    portfolioImpact: -12.8,
    duration: '3 months',
    recovery: '9 months',
    probability: 'High (10-15%)'
  },
  {
    scenario: 'Oil Price Shock (-50%)',
    portfolioImpact: -8.4,
    duration: '4 months',
    recovery: '8 months',
    probability: 'Medium (5-10%)'
  }
];

const correlationMatrix = [
  { asset: 'US Equities', usEquities: 1.00, intlEquities: 0.85, bonds: -0.15, commodities: 0.25, reits: 0.75 },
  { asset: 'International Equities', usEquities: 0.85, intlEquities: 1.00, bonds: -0.08, commodities: 0.32, reits: 0.68 },
  { asset: 'Fixed Income', usEquities: -0.15, intlEquities: -0.08, bonds: 1.00, commodities: -0.05, reits: 0.12 },
  { asset: 'Commodities', usEquities: 0.25, intlEquities: 0.32, bonds: -0.05, commodities: 1.00, reits: 0.18 },
  { asset: 'REITs', usEquities: 0.75, intlEquities: 0.68, bonds: 0.12, commodities: 0.18, reits: 1.00 }
];

const riskLimits = [
  { metric: 'Portfolio VaR (95%)', current: 1.96, limit: 3.00, utilization: 65.3, status: 'Green' },
  { metric: 'Sector Concentration', current: 18.7, limit: 25.0, utilization: 74.8, status: 'Yellow' },
  { metric: 'Single Security Weight', current: 4.2, limit: 5.0, utilization: 84.0, status: 'Yellow' },
  { metric: 'Leverage Ratio', current: 1.15, limit: 1.50, utilization: 76.7, status: 'Green' },
  { metric: 'Liquidity Coverage', current: 85.2, limit: 80.0, utilization: 106.5, status: 'Green' },
  { metric: 'Duration Risk', current: 4.8, limit: 6.0, utilization: 80.0, status: 'Green' }
];

export default function RiskMetrics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [selectedRiskType, setSelectedRiskType] = useState('Market');

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
      case 'Green': return 'bg-green-100 text-green-800';
      case 'Yellow': return 'bg-yellow-100 text-yellow-800';
      case 'Red': return 'bg-red-100 text-red-800';
      case 'Within Limits': return 'bg-green-100 text-green-800';
      case 'Monitor': return 'bg-yellow-100 text-yellow-800';
      case 'Breach': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return 'bg-red-100 text-red-800';
    if (absValue >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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
              <h1 className="text-3xl font-bold text-gray-900">Risk Metrics</h1>
              <p className="text-gray-600">VaR, volatility, and comprehensive risk analysis</p>
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
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-orange-900">Risk Metrics Report</h3>
            <p className="text-sm text-orange-700 mt-1">
              Comprehensive risk analysis including VaR calculations, stress testing, and risk factor decomposition. 
              All metrics are calculated using daily returns and updated in real-time.
            </p>
            <p className="text-xs text-orange-600 mt-2">
              Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Value at Risk (95%)</h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(riskOverview.var95)}</p>
            <p className="text-xs text-gray-500">Daily 95% confidence</p>
            <p className="text-xs text-gray-600">{((riskOverview.var95 / riskOverview.portfolioValue) * 100).toFixed(1)}% of portfolio</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Expected Shortfall</h3>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(riskOverview.expectedShortfall)}</p>
            <p className="text-xs text-gray-500">Conditional VaR (99%)</p>
            <p className="text-xs text-gray-600">{((riskOverview.expectedShortfall / riskOverview.portfolioValue) * 100).toFixed(1)}% of portfolio</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Portfolio Volatility</h3>
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-600">{riskOverview.volatility}%</p>
            <p className="text-xs text-gray-500">Annualized volatility</p>
            <p className="text-xs text-gray-600">Based on 252 trading days</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Maximum Drawdown</h3>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">{riskOverview.maxDrawdown}%</p>
            <p className="text-xs text-gray-500">Peak-to-trough decline</p>
            <p className="text-xs text-gray-600">Over past 12 months</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Risk Factor Decomposition */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Risk Factor Decomposition</h3>
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {riskFactors.map((factor) => (
              <div key={factor.factor} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{factor.factor}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(factor.status)}`}>
                    {factor.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Exposure</span>
                    <span className="font-medium text-gray-900">{factor.exposure}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Risk Contrib.</span>
                    <span className="font-medium text-gray-900">{factor.contribution}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Limit</span>
                    <span className="font-medium text-gray-900">{factor.limit}%</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        factor.exposure / factor.limit > 0.8 ? 'bg-red-500' : 
                        factor.exposure / factor.limit > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((factor.exposure / factor.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((factor.exposure / factor.limit) * 100).toFixed(1)}% of limit utilized
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Limits Monitoring */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Risk Limits Monitoring</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {riskLimits.map((limit) => (
              <div key={limit.metric} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{limit.metric}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(limit.status)}`}>
                    {limit.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500 block">Current</span>
                    <span className="font-medium text-gray-900">{limit.current}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Limit</span>
                    <span className="font-medium text-gray-900">{limit.limit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Utilization</span>
                    <span className="font-medium text-gray-900">{limit.utilization}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      limit.utilization > 90 ? 'bg-red-500' : 
                      limit.utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(limit.utilization, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stress Testing */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Stress Testing Scenarios</h3>
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scenario</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Portfolio Impact</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recovery Time</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stressTests.map((test) => (
                <tr key={test.scenario}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{test.scenario}</td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className="font-medium text-red-600">{test.portfolioImpact}%</span>
                    <div className="text-xs text-gray-500">
                      {formatCurrency((riskOverview.portfolioValue * Math.abs(test.portfolioImpact)) / 100)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-700">{test.duration}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-700">{test.recovery}</td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      test.probability.includes('High') ? 'bg-red-100 text-red-800' :
                      test.probability.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {test.probability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Asset Class Correlation Matrix</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Class</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">US Equities</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Intl Equities</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Fixed Income</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Commodities</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">REITs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {correlationMatrix.map((row) => (
                <tr key={row.asset}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{row.asset}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCorrelationColor(row.usEquities)}`}>
                      {row.usEquities.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCorrelationColor(row.intlEquities)}`}>
                      {row.intlEquities.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCorrelationColor(row.bonds)}`}>
                      {row.bonds.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCorrelationColor(row.commodities)}`}>
                      {row.commodities.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCorrelationColor(row.reits)}`}>
                      {row.reits.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p>Risk calculations based on 252 trading days of historical data</p>
          </div>
          <div className="text-right">
            <p>Risk Management System v3.2</p>
            <p>© 2024 Investment Management Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
