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
  Building,
  CreditCard,
  Banknote,
  FileText,
  Eye,
  Mail,
  Printer
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useTranslation } from 'react-i18next';

const balanceSheetData = {
  asOfDate: '2024-01-31',
  currency: 'USD',
  assets: {
    currentAssets: {
      cash: 12500000,
      cashEquivalents: 8750000,
      accountsReceivable: 3200000,
      prepaidExpenses: 450000,
      otherCurrentAssets: 680000,
      total: 25580000
    },
    nonCurrentAssets: {
      investments: 245000000,
      propertyEquipment: 15600000,
      intangibleAssets: 2800000,
      otherAssets: 1200000,
      total: 264600000
    },
    totalAssets: 290180000
  },
  liabilities: {
    currentLiabilities: {
      accountsPayable: 2100000,
      accruedExpenses: 1850000,
      shortTermDebt: 5000000,
      otherCurrentLiabilities: 980000,
      total: 9930000
    },
    nonCurrentLiabilities: {
      longTermDebt: 25000000,
      deferredTax: 3400000,
      otherLiabilities: 1800000,
      total: 30200000
    },
    totalLiabilities: 40130000
  },
  equity: {
    paidInCapital: 150000000,
    retainedEarnings: 95050000,
    accumulatedOCI: 5000000,
    totalEquity: 250050000
  }
};

const previousPeriod = {
  asOfDate: '2023-12-31',
  totalAssets: 275230000,
  totalLiabilities: 38950000,
  totalEquity: 236280000
};

export default function BalanceSheet() {
  const { t } = useTranslation('investor');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
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
    alert(t('bs.exportSuccess'));
  };

  const handlePrint = () => {
    alert(t('bs.printSuccess'));
  };

  const handleEmail = () => {
    alert(t('bs.emailSuccess'));
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
              <ArrowLeft className="w-4 h-4 me-2" />
              {t('pl.backToReports')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('bs.title')}</h1>
              <p className="text-gray-600">{t('bs.subtitle', { date: balanceSheetData.asOfDate })}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 me-2" />
              {t('common:refresh')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 me-2" />
              {t('pl.print')}
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Mail className="w-4 h-4 me-2" />
              {t('reports.emailReports')}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Download className="w-4 h-4 me-2" />
              {t('common:export')}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === 'detailed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t('bs.view.detailed')}
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === 'summary' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t('bs.view.summary')}
            </button>
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
            <option value="current">{t('bs.period.current')}</option>
            <option value="comparison">{t('bs.period.comparison')}</option>
            <option value="historical">{t('bs.period.historical')}</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {t('bs.generatedOn', { date: new Date().toLocaleDateString() })}
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('bs.title')}</h3>
          <p className="text-sm text-gray-600">{t('bs.asOf', { date: balanceSheetData.asOfDate })}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bs.col.account')}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bs.col.currentPeriod')}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bs.col.previousPeriod')}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bs.col.change')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* ASSETS */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-black me-2" />
                    <span className="text-sm font-bold text-blue-900">{t('bs.row.assets')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-bold text-blue-900">
                  {formatCurrency(balanceSheetData.assets.totalAssets)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                  {formatCurrency(previousPeriod.totalAssets)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm">
                  {(() => {
                    const change = getChange(balanceSheetData.assets.totalAssets, previousPeriod.totalAssets);
                    return (
                      <div className={`flex items-center justify-end ${
                        change.type === 'positive' ? 'text-slate-500' : 'text-red-600'
                      }`}>
                        {change.type === 'positive' ? (
                          <TrendingUp className="w-4 h-4 me-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 me-1" />
                        )}
                        {Math.abs(change.value).toFixed(1)}%
                      </div>
                    );
                  })()}
                </td>
              </tr>

              {/* Current Assets */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-700 ms-4">{t('bs.row.currentAssets')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-semibold text-gray-900">
                  {formatCurrency(balanceSheetData.assets.currentAssets.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                  {formatCurrency(24200000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +5.7%
                </td>
              </tr>

              {viewMode === 'detailed' && (
                <>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 ms-8">{t('bs.row.cashEquivalents')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-900">
                      {formatCurrency(balanceSheetData.assets.currentAssets.cash + balanceSheetData.assets.currentAssets.cashEquivalents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      {formatCurrency(19800000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +7.3%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 ms-8">{t('bs.row.accountsReceivable')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-900">
                      {formatCurrency(balanceSheetData.assets.currentAssets.accountsReceivable)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      {formatCurrency(2950000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +8.5%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 ms-8">{t('bs.row.otherCurrentAssets')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-900">
                      {formatCurrency(balanceSheetData.assets.currentAssets.prepaidExpenses + balanceSheetData.assets.currentAssets.otherCurrentAssets)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      {formatCurrency(1450000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      -22.1%
                    </td>
                  </tr>
                </>
              )}

              {/* Non-Current Assets */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-700 ms-4">{t('bs.row.nonCurrentAssets')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-semibold text-gray-900">
                  {formatCurrency(balanceSheetData.assets.nonCurrentAssets.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                  {formatCurrency(251030000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +5.4%
                </td>
              </tr>

              {viewMode === 'detailed' && (
                <>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 ms-8">{t('bs.row.investments')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-900">
                      {formatCurrency(balanceSheetData.assets.nonCurrentAssets.investments)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      {formatCurrency(232500000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +5.4%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 ms-8">{t('bs.row.propertyEquipment')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-900">
                      {formatCurrency(balanceSheetData.assets.nonCurrentAssets.propertyEquipment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      {formatCurrency(14800000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +5.4%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 ms-8">{t('bs.row.otherAssets')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-900">
                      {formatCurrency(balanceSheetData.assets.nonCurrentAssets.intangibleAssets + balanceSheetData.assets.nonCurrentAssets.otherAssets)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      {formatCurrency(3730000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +7.3%
                    </td>
                  </tr>
                </>
              )}

              {/* LIABILITIES */}
              <tr className="bg-red-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-red-600 me-2" />
                    <span className="text-sm font-bold text-red-900">{t('bs.row.liabilities')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-bold text-red-900">
                  {formatCurrency(balanceSheetData.liabilities.totalLiabilities)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                  {formatCurrency(previousPeriod.totalLiabilities)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +3.0%
                </td>
              </tr>

              {/* Current Liabilities */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-700 ms-4">{t('bs.row.currentLiabilities')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-semibold text-gray-900">
                  {formatCurrency(balanceSheetData.liabilities.currentLiabilities.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                  {formatCurrency(9200000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +7.9%
                </td>
              </tr>

              {/* Non-Current Liabilities */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-700 ms-4">{t('bs.row.nonCurrentLiabilities')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-semibold text-gray-900">
                  {formatCurrency(balanceSheetData.liabilities.nonCurrentLiabilities.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                  {formatCurrency(29750000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +1.5%
                </td>
              </tr>

              {/* EQUITY */}
              <tr className="bg-red-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Banknote className="w-5 h-5 text-red-600 me-2" />
                    <span className="text-sm font-bold text-red-900">{t('bs.row.equity')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-bold text-red-900">
                  {formatCurrency(balanceSheetData.equity.totalEquity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                  {formatCurrency(previousPeriod.totalEquity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +5.8%
                </td>
              </tr>

              {viewMode === 'detailed' && (
                <>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 ms-8">{t('bs.row.paidInCapital')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-900">
                      {formatCurrency(balanceSheetData.equity.paidInCapital)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      {formatCurrency(150000000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      0.0%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 ms-8">{t('bs.row.retainedEarnings')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-900">
                      {formatCurrency(balanceSheetData.equity.retainedEarnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      {formatCurrency(81280000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +16.9%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 ms-8">{t('bs.row.accumulatedOCI')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-900">
                      {formatCurrency(balanceSheetData.equity.accumulatedOCI)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      {formatCurrency(5000000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                      0.0%
                    </td>
                  </tr>
                </>
              )}

              {/* Verification Row */}
              <tr className="bg-gray-100 border-t-2 border-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-blue-900">{t('bs.row.liabilitiesEquity')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-bold text-blue-900">
                  {formatCurrency(balanceSheetData.liabilities.totalLiabilities + balanceSheetData.equity.totalEquity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-gray-500">
                  {formatCurrency(previousPeriod.totalLiabilities + previousPeriod.totalEquity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +5.4%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('bs.notes')}</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• {t('bs.note1')}</p>
          <p>• {t('bs.note2')}</p>
          <p>• {t('bs.note3')}</p>
          <p>• {t('bs.note4')}</p>
        </div>
      </div>
    </div>
  );
}
