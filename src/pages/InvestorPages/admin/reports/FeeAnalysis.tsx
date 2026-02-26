import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share,
  RefreshCw,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  Calculator,
  Info
} from 'lucide-react';

const feeStructure = [
  { feeType: 'Management Fee', rate: '2.0%', basis: 'AUM', frequency: 'Quarterly', annual: true },
  { feeType: 'Performance Fee', rate: '20.0%', basis: 'Net Profits', frequency: 'Annual', hurdle: '8%' },
  { feeType: 'Administrative Fee', rate: '0.25%', basis: 'AUM', frequency: 'Monthly', annual: true },
  { feeType: 'Custody Fee', rate: '0.15%', basis: 'AUM', frequency: 'Monthly', annual: true }
];

const quarterlyFees = [
  {
    quarter: 'Q4 2023',
    managementFee: 2500000,
    performanceFee: 4200000,
    adminFee: 312500,
    custodyFee: 187500,
    otherFees: 125000,
    totalFees: 7325000,
    aum: 500000000
  },
  {
    quarter: 'Q3 2023',
    managementFee: 2400000,
    performanceFee: 3800000,
    adminFee: 300000,
    custodyFee: 180000,
    otherFees: 95000,
    totalFees: 6775000,
    aum: 480000000
  },
  {
    quarter: 'Q2 2023',
    managementFee: 2300000,
    performanceFee: 3200000,
    adminFee: 287500,
    custodyFee: 172500,
    otherFees: 110000,
    totalFees: 6070000,
    aum: 460000000
  },
  {
    quarter: 'Q1 2023',
    managementFee: 2200000,
    performanceFee: 2900000,
    adminFee: 275000,
    custodyFee: 165000,
    otherFees: 85000,
    totalFees: 5625000,
    aum: 440000000
  }
];

const investorFeeAnalysis = [
  {
    investorType: 'Institutional',
    investors: 12,
    aum: 285000000,
    managementFeeRate: 1.75,
    performanceFeeRate: 20.0,
    totalFeesQ4: 4125000,
    feeYield: 1.45
  },
  {
    investorType: 'High Net Worth',
    investors: 45,
    aum: 165000000,
    managementFeeRate: 2.0,
    performanceFeeRate: 20.0,
    totalFeesQ4: 2400000,
    feeYield: 1.45
  },
  {
    investorType: 'Family Office',
    investors: 8,
    aum: 35000000,
    managementFeeRate: 1.5,
    performanceFeeRate: 15.0,
    totalFeesQ4: 525000,
    feeYield: 1.5
  },
  {
    investorType: 'Pension Fund',
    investors: 3,
    aum: 15000000,
    managementFeeRate: 1.25,
    performanceFeeRate: 15.0,
    totalFeesQ4: 275000,
    feeYield: 1.83
  }
];

const feeComparison = [
  { metric: 'Management Fee', industry: 1.85, portfolio: 2.0, variance: 0.15 },
  { metric: 'Performance Fee', industry: 18.5, portfolio: 20.0, variance: 1.5 },
  { metric: 'Total Expense Ratio', industry: 2.15, portfolio: 2.4, variance: 0.25 },
  { metric: 'Administrative Costs', industry: 0.3, portfolio: 0.25, variance: -0.05 }
];

const monthlyBreakdown = [
  { month: 'Jan 2023', management: 733333, performance: 0, admin: 104167, custody: 62500, total: 900000 },
  { month: 'Feb 2023', management: 733333, performance: 0, admin: 104167, custody: 62500, total: 900000 },
  { month: 'Mar 2023', management: 733333, performance: 2900000, admin: 104167, custody: 62500, total: 3800000 },
  { month: 'Apr 2023', management: 766667, performance: 0, admin: 108333, custody: 65000, total: 940000 },
  { month: 'May 2023', management: 766667, performance: 0, admin: 108333, custody: 65000, total: 940000 },
  { month: 'Jun 2023', management: 766667, performance: 3200000, admin: 108333, custody: 65000, total: 4140000 },
  { month: 'Jul 2023', management: 800000, performance: 0, admin: 112500, custody: 67500, total: 980000 },
  { month: 'Aug 2023', management: 800000, performance: 0, admin: 112500, custody: 67500, total: 980000 },
  { month: 'Sep 2023', management: 800000, performance: 3800000, admin: 112500, custody: 67500, total: 4780000 },
  { month: 'Oct 2023', management: 833333, performance: 0, admin: 116667, custody: 70000, total: 1020000 },
  { month: 'Nov 2023', management: 833333, performance: 0, admin: 116667, custody: 70000, total: 1020000 },
  { month: 'Dec 2023', management: 833333, performance: 4200000, admin: 116667, custody: 70000, total: 5220000 }
];

export default function FeeAnalysis() {
  const [selectedQuarter, setSelectedQuarter] = useState('Q4 2023');
  const [viewType, setViewType] = useState('summary');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const getVarianceColor = (variance: number) => {
    return variance >= 0 ? 'text-red-600' : 'text-green-600';
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
              <h1 className="text-3xl font-bold text-gray-900">Fee Analysis</h1>
              <p className="text-gray-600">Management and performance fee breakdown</p>
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-green-900">Fee Analysis Report</h3>
            <p className="text-sm text-green-700 mt-1">
              Comprehensive analysis of management fees, performance fees, and administrative costs. 
              Includes benchmarking against industry standards and investor-specific fee structures.
            </p>
            <p className="text-xs text-green-600 mt-2">
              Reporting period: 2023 Annual | Generated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">View:</span>
          {['summary', 'detailed', 'trends'].map((view) => (
            <button
              key={view}
              onClick={() => setViewType(view)}
              className={`px-3 py-1 text-sm rounded-lg ${
                viewType === view
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Total Fees Q4 2023</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(quarterlyFees[0].totalFees)}</p>
            <p className="text-xs text-gray-500">+8.1% vs Q3</p>
            <p className="text-xs text-gray-600">{((quarterlyFees[0].totalFees / quarterlyFees[0].aum) * 100 * 4).toFixed(2)}% annual rate</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Management Fees</h3>
            <BarChart3 className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">{formatCurrency(quarterlyFees[0].managementFee)}</p>
            <p className="text-xs text-gray-500">2.0% annual rate</p>
            <p className="text-xs text-gray-600">{((quarterlyFees[0].managementFee / quarterlyFees[0].totalFees) * 100).toFixed(1)}% of total fees</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Performance Fees</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(quarterlyFees[0].performanceFee)}</p>
            <p className="text-xs text-gray-500">20% of profits</p>
            <p className="text-xs text-gray-600">{((quarterlyFees[0].performanceFee / quarterlyFees[0].totalFees) * 100).toFixed(1)}% of total fees</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Average Fee Rate</h3>
            <Calculator className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-600">
              {((quarterlyFees[0].totalFees / quarterlyFees[0].aum) * 100 * 4).toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500">Annualized</p>
            <p className="text-xs text-gray-600">All-in fee rate</p>
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Fee Structure</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Basis</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Additional Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feeStructure.map((fee) => (
                <tr key={fee.feeType}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{fee.feeType}</td>
                  <td className="px-4 py-4 text-sm text-center text-black font-medium">{fee.rate}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{fee.basis}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{fee.frequency}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">
                    {fee.annual && 'Annualized'}
                    {fee.hurdle && `Hurdle: ${fee.hurdle}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Quarterly Fee Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quarterly Fee Analysis</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {quarterlyFees.map((quarter) => (
              <div key={quarter.quarter} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">{quarter.quarter}</h4>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(quarter.totalFees)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block">Management</span>
                    <span className="font-medium text-black">{formatCurrency(quarter.managementFee)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Performance</span>
                    <span className="font-medium text-purple-600">{formatCurrency(quarter.performanceFee)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Admin + Custody</span>
                    <span className="font-medium text-gray-700">{formatCurrency(quarter.adminFee + quarter.custodyFee)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">AUM</span>
                    <span className="font-medium text-gray-700">{formatCurrency(quarter.aum)}</span>
                  </div>
                </div>
                
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div 
                      className="bg-gray-700" 
                      style={{ width: `${(quarter.managementFee / quarter.totalFees) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-purple-500" 
                      style={{ width: `${(quarter.performanceFee / quarter.totalFees) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-gray-400" 
                      style={{ width: `${((quarter.adminFee + quarter.custodyFee + quarter.otherFees) / quarter.totalFees) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investor Type Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Fee Analysis by Investor Type</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">AUM</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Mgmt Rate</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Fees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investorFeeAnalysis.map((investor) => (
                  <tr key={investor.investorType}>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{investor.investorType}</td>
                    <td className="px-3 py-3 text-sm text-right text-gray-700">{investor.investors}</td>
                    <td className="px-3 py-3 text-sm text-right text-gray-700">
                      {formatCurrency(investor.aum)}
                    </td>
                    <td className="px-3 py-3 text-sm text-right text-black">
                      {formatPercentage(investor.managementFeeRate)}
                    </td>
                    <td className="px-3 py-3 text-sm text-right font-medium text-green-600">
                      {formatCurrency(investor.totalFeesQ4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Industry Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Industry Benchmark Comparison</h3>
          <PieChart className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feeComparison.map((comparison) => (
            <div key={comparison.metric} className="border border-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">{comparison.metric}</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Industry Avg</span>
                  <span className="text-sm font-medium text-gray-700">
                    {formatPercentage(comparison.industry)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Our Portfolio</span>
                  <span className="text-sm font-medium text-black">
                    {formatPercentage(comparison.portfolio)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Variance</span>
                  <span className={`text-sm font-medium ${getVarianceColor(comparison.variance)}`}>
                    {comparison.variance >= 0 ? '+' : ''}{formatPercentage(comparison.variance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Fee Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Fee Breakdown (2023)</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Management</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Custody</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthlyBreakdown.slice(-6).map((month) => (
                <tr key={month.month}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{month.month}</td>
                  <td className="px-4 py-4 text-sm text-right text-black">{formatCurrency(month.management)}</td>
                  <td className="px-4 py-4 text-sm text-right text-purple-600">{formatCurrency(month.performance)}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-700">{formatCurrency(month.admin)}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-700">{formatCurrency(month.custody)}</td>
                  <td className="px-4 py-4 text-sm text-right font-bold text-green-600">{formatCurrency(month.total)}</td>
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
            <p>Performance fees calculated based on high water mark methodology</p>
          </div>
          <div className="text-right">
            <p>Fee Management System v2.0</p>
            <p>© 2024 Investment Management Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
