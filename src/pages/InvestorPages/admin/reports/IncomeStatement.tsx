import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Mail,
  Printer,
  Eye
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const incomeData = {
  period: 'Year Ended December 31, 2023',
  currency: 'USD',
  revenue: {
    managementFees: 28500000,
    performanceFees: 12750000,
    otherIncome: 1250000,
    totalRevenue: 42500000
  },
  expenses: {
    compensation: 18500000,
    generalAdmin: 4800000,
    professionalFees: 2100000,
    technology: 1950000,
    marketing: 850000,
    other: 1200000,
    totalExpenses: 29400000
  },
  netIncome: 13100000,
  ebitda: 15250000
};

const previousYear = {
  period: 'Year Ended December 31, 2022',
  totalRevenue: 38200000,
  totalExpenses: 26800000,
  netIncome: 11400000,
  ebitda: 13650000
};

const quarterlyData = [
  { quarter: 'Q1 2023', revenue: 9800000, expenses: 7200000, netIncome: 2600000 },
  { quarter: 'Q2 2023', revenue: 10200000, expenses: 7100000, netIncome: 3100000 },
  { quarter: 'Q3 2023', revenue: 11100000, expenses: 7500000, netIncome: 3600000 },
  { quarter: 'Q4 2023', revenue: 11400000, expenses: 7600000, netIncome: 3800000 }
];

export default function IncomeStatement() {
  const [selectedPeriod, setSelectedPeriod] = useState('annual');
  const [viewMode, setViewMode] = useState('detailed');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: change,
      type: change >= 0 ? 'positive' : 'negative'
    };
  };

  const handleExport = () => {
    alert('Income statement exported successfully!');
  };

  const handlePrint = () => {
    alert('Income statement sent to printer!');
  };

  const handleEmail = () => {
    alert('Income statement emailed successfully!');
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Income Statement</h1>
              <p className="text-gray-600">Revenue, expenses, and net income for {incomeData.period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button 
              onClick={handleEmail}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod('annual')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                selectedPeriod === 'annual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Annual
            </button>
            <button
              onClick={() => setSelectedPeriod('quarterly')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                selectedPeriod === 'quarterly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Quarterly
            </button>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === 'detailed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === 'summary' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Summary
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Generated on {new Date().toLocaleDateString()}
        </div>
      </div>

      {selectedPeriod === 'annual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Income Statement */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Income Statement</h3>
                <p className="text-sm text-gray-600">{incomeData.period}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        2023
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        2022
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* REVENUE */}
                    <tr className="bg-green-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-bold text-green-900">REVENUE</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-900">
                        {formatCurrency(incomeData.revenue.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatCurrency(previousYear.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {(() => {
                          const change = getChange(incomeData.revenue.totalRevenue, previousYear.totalRevenue);
                          return (
                            <div className={`flex items-center justify-end ${
                              change.type === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {change.type === 'positive' ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                              )}
                              {Math.abs(change.value).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </td>
                    </tr>

                    {viewMode === 'detailed' && (
                      <>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 ml-8">Management Fees</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {formatCurrency(incomeData.revenue.managementFees)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {formatCurrency(25800000)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                            +10.5%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 ml-8">Performance Fees</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {formatCurrency(incomeData.revenue.performanceFees)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {formatCurrency(11200000)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                            +13.8%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 ml-8">Other Income</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {formatCurrency(incomeData.revenue.otherIncome)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {formatCurrency(1200000)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                            +4.2%
                          </td>
                        </tr>
                      </>
                    )}

                    {/* EXPENSES */}
                    <tr className="bg-red-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BarChart3 className="w-5 h-5 text-red-600 mr-2" />
                          <span className="text-sm font-bold text-red-900">EXPENSES</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-900">
                        ({formatCurrency(incomeData.expenses.totalExpenses)})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        ({formatCurrency(previousYear.totalExpenses)})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                        +9.7%
                      </td>
                    </tr>

                    {viewMode === 'detailed' && (
                      <>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 ml-8">Compensation & Benefits</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            ({formatCurrency(incomeData.expenses.compensation)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ({formatCurrency(16800000)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                            +10.1%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 ml-8">General & Administrative</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            ({formatCurrency(incomeData.expenses.generalAdmin)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ({formatCurrency(4300000)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                            +11.6%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 ml-8">Professional Fees</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            ({formatCurrency(incomeData.expenses.professionalFees)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ({formatCurrency(1950000)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                            +7.7%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 ml-8">Technology</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            ({formatCurrency(incomeData.expenses.technology)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ({formatCurrency(1750000)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                            +11.4%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 ml-8">Other Expenses</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            ({formatCurrency(incomeData.expenses.marketing + incomeData.expenses.other)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ({formatCurrency(2000000)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                            +2.5%
                          </td>
                        </tr>
                      </>
                    )}

                    {/* NET INCOME */}
                    <tr className="bg-gray-50 border-t-2 border-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-900">NET INCOME</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-900">
                        {formatCurrency(incomeData.netIncome)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatCurrency(previousYear.netIncome)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {(() => {
                          const change = getChange(incomeData.netIncome, previousYear.netIncome);
                          return (
                            <div className={`flex items-center justify-end ${
                              change.type === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {change.type === 'positive' ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                              )}
                              {Math.abs(change.value).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Net Profit Margin</span>
                    <span className="text-sm font-semibold text-gray-900">30.8%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-black h-2 rounded-full" style={{ width: '30.8%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">EBITDA Margin</span>
                    <span className="text-sm font-semibold text-gray-900">35.9%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '35.9%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue Growth</span>
                    <span className="text-sm font-semibold text-green-600">+11.3%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expense Ratio</span>
                    <span className="text-sm font-semibold text-gray-900">69.2%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Management Fees</span>
                  <span className="text-sm font-semibold text-gray-900">67.1%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full" style={{ width: '67.1%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Performance Fees</span>
                  <span className="text-sm font-semibold text-gray-900">30.0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '30.0%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Other Income</span>
                  <span className="text-sm font-semibold text-gray-900">2.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '2.9%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quarterly Income Statement</h3>
            <p className="text-sm text-gray-600">2023 Quarterly Performance</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  {quarterlyData.map((quarter) => (
                    <th key={quarter.quarter} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {quarter.quarter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Revenue
                  </td>
                  {quarterlyData.map((quarter) => (
                    <td key={quarter.quarter} className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(quarter.revenue)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Expenses
                  </td>
                  {quarterlyData.map((quarter) => (
                    <td key={quarter.quarter} className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      ({formatCurrency(quarter.expenses)})
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                    Net Income
                  </td>
                  {quarterlyData.map((quarter) => (
                    <td key={quarter.quarter} className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-900">
                      {formatCurrency(quarter.netIncome)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes:</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• All amounts are presented in USD and rounded to the nearest thousand.</p>
          <p>• Revenue recognition follows the accrual basis of accounting.</p>
          <p>• Performance fees are recognized when earned and determinable.</p>
          <p>• Year-over-year comparisons show percentage changes from the previous year.</p>
        </div>
      </div>
    </div>
  );
}
