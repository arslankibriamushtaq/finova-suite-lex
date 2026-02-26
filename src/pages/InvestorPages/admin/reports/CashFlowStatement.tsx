import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Info
} from 'lucide-react';

const operatingActivities = [
  { item: 'Net Income', q4_2023: 8500000, q3_2023: 7200000, q2_2023: 6800000, q1_2023: 7500000 },
  { item: 'Depreciation & Amortization', q4_2023: 450000, q3_2023: 420000, q2_2023: 410000, q1_2023: 390000 },
  { item: 'Unrealized Investment Gains', q4_2023: -2100000, q3_2023: -1800000, q2_2023: -1200000, q1_2023: -1650000 },
  { item: 'Changes in Working Capital', q4_2023: -320000, q3_2023: 180000, q2_2023: -95000, q1_2023: 220000 },
  { item: 'Accounts Receivable Changes', q4_2023: -150000, q3_2023: 80000, q2_2023: -45000, q1_2023: 95000 },
  { item: 'Accounts Payable Changes', q4_2023: 85000, q3_2023: -35000, q2_2023: 75000, q1_2023: -40000 },
  { item: 'Accrued Expenses Changes', q4_2023: 120000, q3_2023: 65000, q2_2023: 35000, q1_2023: 80000 }
];

const investingActivities = [
  { item: 'Purchase of Securities', q4_2023: -45000000, q3_2023: -38000000, q2_2023: -42000000, q1_2023: -35000000 },
  { item: 'Sale of Securities', q4_2023: 42000000, q3_2023: 36000000, q2_2023: 39000000, q1_2023: 33000000 },
  { item: 'Capital Expenditures', q4_2023: -180000, q3_2023: -95000, q2_2023: -120000, q1_2023: -85000 },
  { item: 'Investment in Subsidiaries', q4_2023: -500000, q3_2023: 0, q2_2023: -250000, q1_2023: 0 },
  { item: 'Purchase of Property & Equipment', q4_2023: -75000, q3_2023: -45000, q2_2023: -35000, q1_2023: -60000 }
];

const financingActivities = [
  { item: 'Investor Contributions', q4_2023: 12000000, q3_2023: 8500000, q2_2023: 15000000, q1_2023: 6000000 },
  { item: 'Investor Withdrawals', q4_2023: -8500000, q3_2023: -6200000, q2_2023: -7800000, q1_2023: -4500000 },
  { item: 'Management Fee Payments', q4_2023: -1250000, q3_2023: -1180000, q2_2023: -1220000, q1_2023: -1100000 },
  { item: 'Performance Fee Distributions', q4_2023: -850000, q3_2023: -720000, q2_2023: -680000, q1_2023: -750000 },
  { item: 'Operating Expense Payments', q4_2023: -450000, q3_2023: -420000, q2_2023: -380000, q1_2023: -410000 },
  { item: 'Interest Payments', q4_2023: -35000, q3_2023: -32000, q2_2023: -28000, q1_2023: -30000 }
];

const quarterlyTotals = {
  operating: {
    q4_2023: 6505000,
    q3_2023: 6067000,
    q2_2023: 5878000,
    q1_2023: 6535000
  },
  investing: {
    q4_2023: -3755000,
    q3_2023: -2140000,
    q2_2023: -3405000,
    q1_2023: -2145000
  },
  financing: {
    q4_2023: 915000,
    q3_2023: -52000,
    q2_2023: 4912000,
    q1_2023: -790000
  }
};

const cashPositions = [
  { month: 'Jan 2023', beginning: 15000000, ending: 18250000, change: 3250000 },
  { month: 'Feb 2023', beginning: 18250000, ending: 16800000, change: -1450000 },
  { month: 'Mar 2023', beginning: 16800000, ending: 20100000, change: 3300000 },
  { month: 'Apr 2023', beginning: 20100000, ending: 18950000, change: -1150000 },
  { month: 'May 2023', beginning: 18950000, ending: 21200000, change: 2250000 },
  { month: 'Jun 2023', beginning: 21200000, ending: 22580000, change: 1380000 },
  { month: 'Jul 2023', beginning: 22580000, ending: 24100000, change: 1520000 },
  { month: 'Aug 2023', beginning: 24100000, ending: 22850000, change: -1250000 },
  { month: 'Sep 2023', beginning: 22850000, ending: 25200000, change: 2350000 },
  { month: 'Oct 2023', beginning: 25200000, ending: 24800000, change: -400000 },
  { month: 'Nov 2023', beginning: 24800000, ending: 26500000, change: 1700000 },
  { month: 'Dec 2023', beginning: 26500000, ending: 28180000, change: 1680000 }
];

export default function CashFlowStatement() {
  const [selectedQuarter, setSelectedQuarter] = useState('Q4 2023');
  const [viewType, setViewType] = useState('quarterly');

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absAmount);
    
    return isNegative ? `(${formatted})` : formatted;
  };

  const getCashFlowColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (amount: number) => {
    return amount >= 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-500" />
    );
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
              <h1 className="text-3xl font-bold text-gray-900">Cash Flow Statement</h1>
              <p className="text-gray-600">Operating, investing, and financing cash flows</p>
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
            <h3 className="text-sm font-medium text-blue-900">Cash Flow Statement</h3>
            <p className="text-sm text-gray-800 mt-1">
              Statement of cash flows showing how changes in balance sheet accounts and income affect cash and cash equivalents. 
              Broken down into operating, investing, and financing activities.
            </p>
            <p className="text-xs text-black mt-2">
              Reporting period: Q1 2023 - Q4 2023 | Generated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">View:</span>
          {['quarterly', 'annual'].map((view) => (
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

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Operating Cash Flow</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(quarterlyTotals.operating.q4_2023)}</p>
            <p className="text-xs text-gray-500">Q4 2023</p>
            <p className="text-xs text-green-600">+7.2% vs Q3</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Investing Cash Flow</h3>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(quarterlyTotals.investing.q4_2023)}</p>
            <p className="text-xs text-gray-500">Q4 2023</p>
            <p className="text-xs text-red-600">-75.4% vs Q3</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Financing Cash Flow</h3>
            <DollarSign className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">{formatCurrency(quarterlyTotals.financing.q4_2023)}</p>
            <p className="text-xs text-gray-500">Q4 2023</p>
            <p className="text-xs text-black">Positive inflow</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Net Cash Change</h3>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(quarterlyTotals.operating.q4_2023 + quarterlyTotals.investing.q4_2023 + quarterlyTotals.financing.q4_2023)}
            </p>
            <p className="text-xs text-gray-500">Q4 2023</p>
            <p className="text-xs text-purple-600">Net positive flow</p>
          </div>
        </div>
      </div>

      {/* Operating Activities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Cash Flows from Operating Activities</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q4 2023</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q3 2023</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q2 2023</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q1 2023</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {operatingActivities.map((item) => (
                <tr key={item.item}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.item}</td>
                  <td className={`px-4 py-4 text-sm text-right font-medium ${getCashFlowColor(item.q4_2023)}`}>
                    {formatCurrency(item.q4_2023)}
                  </td>
                  <td className={`px-4 py-4 text-sm text-right ${getCashFlowColor(item.q3_2023)}`}>
                    {formatCurrency(item.q3_2023)}
                  </td>
                  <td className={`px-4 py-4 text-sm text-right ${getCashFlowColor(item.q2_2023)}`}>
                    {formatCurrency(item.q2_2023)}
                  </td>
                  <td className={`px-4 py-4 text-sm text-right ${getCashFlowColor(item.q1_2023)}`}>
                    {formatCurrency(item.q1_2023)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">Net Operating Cash Flow</td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.operating.q4_2023)}`}>
                  {formatCurrency(quarterlyTotals.operating.q4_2023)}
                </td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.operating.q3_2023)}`}>
                  {formatCurrency(quarterlyTotals.operating.q3_2023)}
                </td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.operating.q2_2023)}`}>
                  {formatCurrency(quarterlyTotals.operating.q2_2023)}
                </td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.operating.q1_2023)}`}>
                  {formatCurrency(quarterlyTotals.operating.q1_2023)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Investing Activities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Cash Flows from Investing Activities</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q4 2023</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q3 2023</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q2 2023</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q1 2023</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investingActivities.map((item) => (
                <tr key={item.item}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.item}</td>
                  <td className={`px-4 py-4 text-sm text-right font-medium ${getCashFlowColor(item.q4_2023)}`}>
                    {formatCurrency(item.q4_2023)}
                  </td>
                  <td className={`px-4 py-4 text-sm text-right ${getCashFlowColor(item.q3_2023)}`}>
                    {formatCurrency(item.q3_2023)}
                  </td>
                  <td className={`px-4 py-4 text-sm text-right ${getCashFlowColor(item.q2_2023)}`}>
                    {formatCurrency(item.q2_2023)}
                  </td>
                  <td className={`px-4 py-4 text-sm text-right ${getCashFlowColor(item.q1_2023)}`}>
                    {formatCurrency(item.q1_2023)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">Net Investing Cash Flow</td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.investing.q4_2023)}`}>
                  {formatCurrency(quarterlyTotals.investing.q4_2023)}
                </td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.investing.q3_2023)}`}>
                  {formatCurrency(quarterlyTotals.investing.q3_2023)}
                </td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.investing.q2_2023)}`}>
                  {formatCurrency(quarterlyTotals.investing.q2_2023)}
                </td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.investing.q1_2023)}`}>
                  {formatCurrency(quarterlyTotals.investing.q1_2023)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Financing Activities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Cash Flows from Financing Activities</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q4 2023</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q3 2023</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q2 2023</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Q1 2023</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {financingActivities.map((item) => (
                <tr key={item.item}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.item}</td>
                  <td className={`px-4 py-4 text-sm text-right font-medium ${getCashFlowColor(item.q4_2023)}`}>
                    {formatCurrency(item.q4_2023)}
                  </td>
                  <td className={`px-4 py-4 text-sm text-right ${getCashFlowColor(item.q3_2023)}`}>
                    {formatCurrency(item.q3_2023)}
                  </td>
                  <td className={`px-4 py-4 text-sm text-right ${getCashFlowColor(item.q2_2023)}`}>
                    {formatCurrency(item.q2_2023)}
                  </td>
                  <td className={`px-4 py-4 text-sm text-right ${getCashFlowColor(item.q1_2023)}`}>
                    {formatCurrency(item.q1_2023)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">Net Financing Cash Flow</td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.financing.q4_2023)}`}>
                  {formatCurrency(quarterlyTotals.financing.q4_2023)}
                </td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.financing.q3_2023)}`}>
                  {formatCurrency(quarterlyTotals.financing.q3_2023)}
                </td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.financing.q2_2023)}`}>
                  {formatCurrency(quarterlyTotals.financing.q2_2023)}
                </td>
                <td className={`px-4 py-4 text-sm text-right font-bold ${getCashFlowColor(quarterlyTotals.financing.q1_2023)}`}>
                  {formatCurrency(quarterlyTotals.financing.q1_2023)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Cash Position */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Cash Position Analysis</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Beginning Cash</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ending Cash</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Change</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cashPositions.slice(-6).map((position) => (
                <tr key={position.month}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{position.month}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-700">{formatCurrency(position.beginning)}</td>
                  <td className="px-4 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(position.ending)}</td>
                  <td className={`px-4 py-4 text-sm text-right font-medium ${getCashFlowColor(position.change)}`}>
                    {formatCurrency(position.change)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getChangeIcon(position.change)}
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
            <p>All amounts in USD | Parentheses indicate cash outflows</p>
          </div>
          <div className="text-right">
            <p>Financial Reporting System v2.1</p>
            <p>© 2024 Investment Management Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
