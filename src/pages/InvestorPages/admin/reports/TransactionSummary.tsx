import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Download,
  Share,
  RefreshCw,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Info
} from 'lucide-react';

const transactions = [
  {
    id: 'TXN-2024-001',
    date: '2024-01-22',
    time: '09:30:15',
    type: 'Buy',
    security: 'Apple Inc.',
    ticker: 'AAPL',
    quantity: 5000,
    price: 195.89,
    value: 979450,
    fees: 150,
    settlementDate: '2024-01-24',
    account: 'Portfolio A',
    trader: 'John Smith'
  },
  {
    id: 'TXN-2024-002',
    date: '2024-01-22',
    time: '10:15:42',
    type: 'Sell',
    security: 'Microsoft Corp.',
    ticker: 'MSFT',
    quantity: 2500,
    price: 415.26,
    value: 1038150,
    fees: 125,
    settlementDate: '2024-01-24',
    account: 'Portfolio B',
    trader: 'Sarah Chen'
  },
  {
    id: 'TXN-2024-003',
    date: '2024-01-22',
    time: '11:22:18',
    type: 'Buy',
    security: 'Amazon.com Inc.',
    ticker: 'AMZN',
    quantity: 1200,
    price: 155.33,
    value: 186396,
    fees: 85,
    settlementDate: '2024-01-24',
    account: 'Portfolio A',
    trader: 'Mike Davis'
  },
  {
    id: 'TXN-2024-004',
    date: '2024-01-22',
    time: '13:45:33',
    type: 'Dividend',
    security: 'Johnson & Johnson',
    ticker: 'JNJ',
    quantity: 8000,
    price: 1.16,
    value: 9280,
    fees: 0,
    settlementDate: '2024-01-22',
    account: 'Portfolio C',
    trader: 'System'
  },
  {
    id: 'TXN-2024-005',
    date: '2024-01-22',
    time: '14:12:07',
    type: 'Sell',
    security: 'Tesla Inc.',
    ticker: 'TSLA',
    quantity: 800,
    price: 219.16,
    value: 175328,
    fees: 75,
    settlementDate: '2024-01-24',
    account: 'Portfolio B',
    trader: 'Lisa Wang'
  }
];

const summary = {
  totalTransactions: 247,
  totalVolume: 125000000,
  totalFees: 18500,
  buyTransactions: 142,
  sellTransactions: 89,
  dividendPayments: 16,
  avgTransactionSize: 506073,
  largestTransaction: 2500000,
  smallestTransaction: 5000
};

const dailyActivity = [
  { date: '2024-01-22', transactions: 18, volume: 8500000, fees: 1250 },
  { date: '2024-01-21', transactions: 12, volume: 5200000, fees: 890 },
  { date: '2024-01-20', transactions: 8, volume: 3100000, fees: 420 },
  { date: '2024-01-19', transactions: 15, volume: 7800000, fees: 1100 },
  { date: '2024-01-18', transactions: 22, volume: 9200000, fees: 1580 }
];

const portfolioBreakdown = [
  { portfolio: 'Portfolio A', transactions: 85, volume: 45000000, percentage: 36.0 },
  { portfolio: 'Portfolio B', transactions: 72, volume: 38000000, percentage: 30.4 },
  { portfolio: 'Portfolio C', transactions: 54, volume: 28000000, percentage: 22.4 },
  { portfolio: 'Portfolio D', transactions: 36, volume: 14000000, percentage: 11.2 }
];

export default function TransactionSummary() {
  const { t } = useTranslation('investor');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-22T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Buy': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'Sell': return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      case 'Dividend': return <TrendingUp className="w-4 h-4 text-gray-700" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'Buy': return 'text-green-600 bg-green-50';
      case 'Sell': return 'text-red-600 bg-red-50';
      case 'Dividend': return 'text-black bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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
              <h1 className="text-3xl font-bold text-gray-900">{t('ts.title')}</h1>
              <p className="text-gray-600">{t('ts.subtitle')}</p>
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
              {t('ts.exportCsv')}
            </button>
          </div>
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-black me-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">{t('ts.infoTitle')}</h3>
            <p className="text-sm text-gray-800 mt-1">
              {t('ts.infoBody')}
            </p>
            <p className="text-xs text-black mt-2">
              {t('ts.dataAsOf', { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{t('ts.filters')}</span>
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="today">{t('ts.period.today')}</option>
            <option value="week">{t('ts.period.week')}</option>
            <option value="month">{t('ts.period.month')}</option>
            <option value="quarter">{t('ts.period.quarter')}</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="all">{t('ts.type.all')}</option>
            <option value="Buy">{t('ts.type.buyOrders')}</option>
            <option value="Sell">{t('ts.type.sellOrders')}</option>
            <option value="Dividend">{t('ts.type.dividends')}</option>
          </select>

          <select
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="all">{t('ts.portfolio.all')}</option>
            <option value="Portfolio A">Portfolio A</option>
            <option value="Portfolio B">Portfolio B</option>
            <option value="Portfolio C">Portfolio C</option>
            <option value="Portfolio D">Portfolio D</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ts.totalTransactions')}</h3>
            <Activity className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">{summary.totalTransactions}</p>
            <p className="text-xs text-gray-500">{t('ts.thisMonth')}</p>
            <p className="text-xs text-black">{t('ts.vsLastMonthPlus15')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ts.totalVolume')}</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalVolume)}</p>
            <p className="text-xs text-gray-500">{t('ts.transactionValue')}</p>
            <p className="text-xs text-green-600">{t('ts.vsLastMonthPlus8')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ts.averageSize')}</h3>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.avgTransactionSize)}</p>
            <p className="text-xs text-gray-500">{t('ts.perTransaction')}</p>
            <p className="text-xs text-purple-600">{t('ts.median')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ts.totalFees')}</h3>
            <TrendingDown className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalFees)}</p>
            <p className="text-xs text-gray-500">{t('ts.transactionCosts')}</p>
            <p className="text-xs text-orange-600">{t('ts.pctOfVolume')}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{t('ts.recentTransactions')}</h3>
          <span className="text-sm text-gray-500">{t('ts.last5')}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('ts.col.transaction')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('ts.col.security')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('ts.col.type')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('ts.col.quantity')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('ts.col.price')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('ts.col.value')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('ts.col.account')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('ts.col.trader')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{transaction.id}</div>
                      <div className="text-gray-500 text-xs">
                        {new Date(transaction.date).toLocaleDateString()} {formatTime(transaction.time)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{transaction.security}</div>
                      <div className="text-black text-xs font-medium">{transaction.ticker}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                      <span className={`ms-2 px-2 py-1 rounded-full text-xs font-medium ${getTransactionColor(transaction.type)}`}>
                        {t(`ts.txType.${transaction.type}`)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-end text-gray-900">
                    {transaction.quantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-end text-gray-900">
                    {formatCurrency(transaction.price)}
                  </td>
                  <td className="px-4 py-4 text-sm text-end font-medium text-gray-900">
                    {formatCurrency(transaction.value)}
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {transaction.account}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">
                    {transaction.trader}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('ts.dailyActivity')}</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {dailyActivity.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500">{t('ts.transactionsCount', { count: day.transactions })}</div>
                </div>
                <div className="text-end">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(day.volume)}</div>
                  <div className="text-xs text-gray-500">{t('ts.feesLabel', { value: formatCurrency(day.fees) })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('ts.portfolioBreakdown')}</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {portfolioBreakdown.map((portfolio) => (
              <div key={portfolio.portfolio} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{portfolio.portfolio}</span>
                  <span className="text-sm font-medium text-black">{portfolio.percentage}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{t('ts.transactionsCount', { count: portfolio.transactions })}</span>
                  <span>{formatCurrency(portfolio.volume)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-700 h-2 rounded-full"
                    style={{ width: `${portfolio.percentage}%` }}
                  ></div>
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
            <p>{t('bc.generatedOn', { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })}</p>
            <p>{t('ts.footerNote')}</p>
          </div>
          <div className="text-end">
            <p>{t('ts.systemVersion')}</p>
            <p>{t('bc.copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
