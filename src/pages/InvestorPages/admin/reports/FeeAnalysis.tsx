import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  { feeType: 'fa.fee.management', rate: '2.0%', basis: 'fa.basis.aum', frequency: 'Quarterly', annual: true },
  { feeType: 'fa.fee.performance', rate: '20.0%', basis: 'fa.basis.netProfits', frequency: 'Annual', hurdle: '8%' },
  { feeType: 'fa.fee.administrative', rate: '0.25%', basis: 'fa.basis.aum', frequency: 'Monthly', annual: true },
  { feeType: 'fa.fee.custody', rate: '0.15%', basis: 'fa.basis.aum', frequency: 'Monthly', annual: true }
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
    investorType: 'fa.itype.institutional',
    investors: 12,
    aum: 285000000,
    managementFeeRate: 1.75,
    performanceFeeRate: 20.0,
    totalFeesQ4: 4125000,
    feeYield: 1.45
  },
  {
    investorType: 'fa.itype.hnw',
    investors: 45,
    aum: 165000000,
    managementFeeRate: 2.0,
    performanceFeeRate: 20.0,
    totalFeesQ4: 2400000,
    feeYield: 1.45
  },
  {
    investorType: 'fa.itype.familyOffice',
    investors: 8,
    aum: 35000000,
    managementFeeRate: 1.5,
    performanceFeeRate: 15.0,
    totalFeesQ4: 525000,
    feeYield: 1.5
  },
  {
    investorType: 'fa.itype.pensionFund',
    investors: 3,
    aum: 15000000,
    managementFeeRate: 1.25,
    performanceFeeRate: 15.0,
    totalFeesQ4: 275000,
    feeYield: 1.83
  }
];

const feeComparison = [
  { metric: 'fa.metric.mgmtFee', industry: 1.85, portfolio: 2.0, variance: 0.15 },
  { metric: 'fa.metric.perfFee', industry: 18.5, portfolio: 20.0, variance: 1.5 },
  { metric: 'fa.metric.ter', industry: 2.15, portfolio: 2.4, variance: 0.25 },
  { metric: 'fa.metric.adminCosts', industry: 0.3, portfolio: 0.25, variance: -0.05 }
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
  const { t } = useTranslation('investor');
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
    return variance >= 0 ? 'text-red-600' : 'text-slate-500';
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
              <ArrowLeft className="w-5 h-5 me-2" />
              {t('pl.backToReports')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('fa.title')}</h1>
              <p className="text-gray-600">{t('fa.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 me-2" />
              {t('bc.refreshData')}
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share className="w-4 h-4 me-2" />
              {t('pl.share')}
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
              <Download className="w-4 h-4 me-2" />
              {t('pl.exportPdf')}
            </button>
          </div>
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-red-600 me-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-900">{t('fa.infoTitle')}</h3>
            <p className="text-sm text-red-700 mt-1">
              {t('fa.infoBody')}
            </p>
            <p className="text-xs text-red-600 mt-2">
              {t('fa.reportingPeriod', { date: new Date().toLocaleDateString() })}
            </p>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">{t('fa.viewLabel')}</span>
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
              {t(`fa.view.${view}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('fa.totalFeesQ4')}</h3>
            <DollarSign className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(quarterlyFees[0].totalFees)}</p>
            <p className="text-xs text-gray-500">{t('fa.vsQ3')}</p>
            <p className="text-xs text-gray-600">{t('fa.annualRate', { value: ((quarterlyFees[0].totalFees / quarterlyFees[0].aum) * 100 * 4).toFixed(2) })}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('fa.managementFees')}</h3>
            <BarChart3 className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">{formatCurrency(quarterlyFees[0].managementFee)}</p>
            <p className="text-xs text-gray-500">{t('fa.mgmtRate')}</p>
            <p className="text-xs text-gray-600">{t('fa.ofTotalFees', { value: ((quarterlyFees[0].managementFee / quarterlyFees[0].totalFees) * 100).toFixed(1) })}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('fa.performanceFees')}</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(quarterlyFees[0].performanceFee)}</p>
            <p className="text-xs text-gray-500">{t('fa.ofProfits')}</p>
            <p className="text-xs text-gray-600">{t('fa.ofTotalFees', { value: ((quarterlyFees[0].performanceFee / quarterlyFees[0].totalFees) * 100).toFixed(1) })}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('fa.avgFeeRate')}</h3>
            <Calculator className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-600">
              {((quarterlyFees[0].totalFees / quarterlyFees[0].aum) * 100 * 4).toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500">{t('fa.annualized')}</p>
            <p className="text-xs text-gray-600">{t('fa.allInRate')}</p>
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('fa.feeStructureTitle')}</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('fa.col.feeType')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('fa.col.rate')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('fa.col.basis')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('fa.col.frequency')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('fa.col.additionalInfo')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feeStructure.map((fee) => (
                <tr key={fee.feeType}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{t(fee.feeType)}</td>
                  <td className="px-4 py-4 text-sm text-center text-black font-medium">{fee.rate}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{t(fee.basis)}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{t(`reports.freq.${fee.frequency}`)}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">
                    {fee.annual && t('fa.annualized')}
                    {fee.hurdle && t('fa.hurdleInfo', { value: fee.hurdle })}
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
            <h3 className="text-lg font-semibold text-gray-900">{t('fa.quarterlyTitle')}</h3>
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
                    <span className="text-gray-500 block">{t('fa.management')}</span>
                    <span className="font-medium text-black">{formatCurrency(quarter.managementFee)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('fa.performance')}</span>
                    <span className="font-medium text-purple-600">{formatCurrency(quarter.performanceFee)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('fa.adminCustody')}</span>
                    <span className="font-medium text-gray-700">{formatCurrency(quarter.adminFee + quarter.custodyFee)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('fa.aum')}</span>
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
            <h3 className="text-lg font-semibold text-gray-900">{t('fa.investorTypeTitle')}</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-start text-xs font-medium text-gray-500 uppercase">{t('fa.col.type')}</th>
                  <th className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('fa.col.count')}</th>
                  <th className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('fa.aum')}</th>
                  <th className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('fa.col.mgmtRate')}</th>
                  <th className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('fa.col.totalFees')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investorFeeAnalysis.map((investor) => (
                  <tr key={investor.investorType}>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{t(investor.investorType)}</td>
                    <td className="px-3 py-3 text-sm text-end text-gray-700">{investor.investors}</td>
                    <td className="px-3 py-3 text-sm text-end text-gray-700">
                      {formatCurrency(investor.aum)}
                    </td>
                    <td className="px-3 py-3 text-sm text-end text-black">
                      {formatPercentage(investor.managementFeeRate)}
                    </td>
                    <td className="px-3 py-3 text-sm text-end font-medium text-red-600">
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
          <h3 className="text-lg font-semibold text-gray-900">{t('fa.industryTitle')}</h3>
          <PieChart className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feeComparison.map((comparison) => (
            <div key={comparison.metric} className="border border-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">{t(comparison.metric)}</h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('fa.industryAvg')}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {formatPercentage(comparison.industry)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('fa.ourPortfolio')}</span>
                  <span className="text-sm font-medium text-black">
                    {formatPercentage(comparison.portfolio)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{t('fa.variance')}</span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('fa.monthlyTitle')}</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('fa.col.month')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('fa.col.management')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('fa.col.performance')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('fa.col.admin')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('fa.col.custody')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('fa.col.total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthlyBreakdown.slice(-6).map((month) => (
                <tr key={month.month}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{month.month}</td>
                  <td className="px-4 py-4 text-sm text-end text-black">{formatCurrency(month.management)}</td>
                  <td className="px-4 py-4 text-sm text-end text-purple-600">{formatCurrency(month.performance)}</td>
                  <td className="px-4 py-4 text-sm text-end text-gray-700">{formatCurrency(month.admin)}</td>
                  <td className="px-4 py-4 text-sm text-end text-gray-700">{formatCurrency(month.custody)}</td>
                  <td className="px-4 py-4 text-sm text-end font-bold text-red-600">{formatCurrency(month.total)}</td>
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
            <p>{t('bc.generatedOn', { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })}</p>
            <p>{t('fa.footerNote')}</p>
          </div>
          <div className="text-end">
            <p>{t('fa.systemVersion')}</p>
            <p>{t('bc.copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
