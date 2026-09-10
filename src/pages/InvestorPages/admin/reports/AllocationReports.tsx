import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  { category: 'ar2.cat.usEquities', current: 35.2, target: 35.0, drift: 0.2, value: 176000000 },
  { category: 'ar2.cat.intlEquities', current: 25.8, target: 25.0, drift: 0.8, value: 129000000 },
  { category: 'ar2.cat.emergingMarkets', current: 8.5, target: 10.0, drift: -1.5, value: 42500000 },
  { category: 'ar2.cat.fixedIncome', current: 20.1, target: 20.0, drift: 0.1, value: 100500000 },
  { category: 'ar2.cat.realEstate', current: 5.8, target: 5.0, drift: 0.8, value: 29000000 },
  { category: 'ar2.cat.commodities', current: 2.9, target: 3.0, drift: -0.1, value: 14500000 },
  { category: 'ar2.cat.cash', current: 1.7, target: 2.0, drift: -0.3, value: 8500000 }
];

const geographicAllocation = [
  { region: 'ar2.region.northAmerica', allocation: 48.5, value: 242500000, countries: ['USA', 'Canada'] },
  { region: 'ar2.region.europe', allocation: 22.3, value: 111500000, countries: ['UK', 'Germany', 'France', 'Switzerland'] },
  { region: 'ar2.region.asiaPacific', allocation: 18.7, value: 93500000, countries: ['Japan', 'China', 'Australia', 'South Korea'] },
  { region: 'ar2.region.emergingMarkets', allocation: 8.5, value: 42500000, countries: ['Brazil', 'India', 'Mexico', 'Taiwan'] },
  { region: 'ar2.region.other', allocation: 2.0, value: 10000000, countries: ['Global Funds', 'Currency Hedges'] }
];

const sectorAllocation = [
  { sector: 'ar2.sector.technology', allocation: 18.2, value: 91000000, performance: 12.5 },
  { sector: 'ar2.sector.healthcare', allocation: 15.1, value: 75500000, performance: 8.3 },
  { sector: 'ar2.sector.financialServices', allocation: 12.8, value: 64000000, performance: 6.7 },
  { sector: 'ar2.sector.consumerDiscretionary', allocation: 11.3, value: 56500000, performance: 15.2 },
  { sector: 'ar2.sector.industrials', allocation: 9.7, value: 48500000, performance: 9.1 },
  { sector: 'ar2.sector.consumerStaples', allocation: 8.4, value: 42000000, performance: 4.2 },
  { sector: 'ar2.sector.energy', allocation: 6.2, value: 31000000, performance: 22.8 },
  { sector: 'ar2.sector.materials', allocation: 5.8, value: 29000000, performance: 11.4 },
  { sector: 'ar2.sector.utilities', allocation: 4.9, value: 24500000, performance: 3.1 },
  { sector: 'ar2.sector.realEstate', allocation: 4.1, value: 20500000, performance: 7.8 },
  { sector: 'ar2.sector.telecom', allocation: 3.5, value: 17500000, performance: 5.9 }
];

const historicalAllocation = [
  { date: 'Q1 2023', equities: 58.5, fixedIncome: 25.2, alternatives: 14.3, cash: 2.0 },
  { date: 'Q2 2023', equities: 61.2, fixedIncome: 23.8, alternatives: 13.1, cash: 1.9 },
  { date: 'Q3 2023', equities: 63.8, fixedIncome: 22.1, alternatives: 12.4, cash: 1.7 },
  { date: 'Q4 2023', equities: 69.5, fixedIncome: 20.1, alternatives: 8.7, cash: 1.7 }
];

const riskMetrics = [
  { metric: 'ar2.rm.beta', value: 0.95, benchmark: 1.00 },
  { metric: 'ar2.rm.trackingError', value: 2.8, benchmark: 0.0 },
  { metric: 'ar2.rm.sharpe', value: 1.24, benchmark: 1.15 },
  { metric: 'ar2.rm.info', value: 0.67, benchmark: 0.0 },
  { metric: 'ar2.rm.maxDrawdown', value: 8.5, benchmark: 12.3 },
  { metric: 'ar2.rm.volatility', value: 12.3, benchmark: 14.8 }
];

const topHoldings = [
  { holding: 'Apple Inc.', ticker: 'AAPL', allocation: 3.2, value: 16000000, sector: 'ar2.sector.technology' },
  { holding: 'Microsoft Corp.', ticker: 'MSFT', allocation: 2.8, value: 14000000, sector: 'ar2.sector.technology' },
  { holding: 'Amazon.com Inc.', ticker: 'AMZN', allocation: 2.1, value: 10500000, sector: 'ar2.sector.consumerDiscretionary' },
  { holding: 'Alphabet Inc.', ticker: 'GOOGL', allocation: 1.9, value: 9500000, sector: 'ar2.sector.technology' },
  { holding: 'Tesla Inc.', ticker: 'TSLA', allocation: 1.7, value: 8500000, sector: 'ar2.sector.consumerDiscretionary' },
  { holding: 'NVIDIA Corp.', ticker: 'NVDA', allocation: 1.5, value: 7500000, sector: 'ar2.sector.technology' },
  { holding: 'Meta Platforms', ticker: 'META', allocation: 1.4, value: 7000000, sector: 'ar2.sector.technology' },
  { holding: 'Berkshire Hathaway', ticker: 'BRK.B', allocation: 1.3, value: 6500000, sector: 'ar2.sector.financialServices' },
  { holding: 'Johnson & Johnson', ticker: 'JNJ', allocation: 1.2, value: 6000000, sector: 'ar2.sector.healthcare' },
  { holding: 'UnitedHealth Group', ticker: 'UNH', allocation: 1.1, value: 5500000, sector: 'ar2.sector.healthcare' }
];

export default function AllocationReports() {
  const { t } = useTranslation('investor');
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
    return 'text-red-600';
  };

  const getPerformanceColor = (perf: number) => {
    return perf >= 0 ? 'text-slate-500' : 'text-red-600';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/InvestorDashboard/Reports"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 me-2" />
              {t('pl.backToReports')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('ar2.title')}</h1>
              <p className="text-gray-600">{t('ar2.subtitle')}</p>
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
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-purple-600 me-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-purple-900">{t('ar2.infoTitle')}</h3>
            <p className="text-sm text-purple-700 mt-1">
              {t('ar2.infoBody')}
            </p>
            <p className="text-xs text-purple-600 mt-2">
              {t('ar2.dataAsOf', { date: new Date().toLocaleDateString() })}
            </p>
          </div>
        </div>
      </div>

      {/* View Selection */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">{t('ar2.viewLabel')}</span>
          {[
            { key: 'asset', label: 'ar2.view.asset' },
            { key: 'sector', label: 'ar2.view.sector' },
            { key: 'geographic', label: 'ar2.view.geographic' },
            { key: 'holdings', label: 'ar2.view.holdings' }
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
              {t(view.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ar2.totalValue')}</h3>
            <Target className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">$500.0M</p>
            <p className="text-xs text-gray-500">{t('ar2.asOf', { date: new Date().toLocaleDateString() })}</p>
            <p className="text-xs text-red-600">{t('ar2.ytdPlus')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ar2.equityAllocation')}</h3>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600">69.5%</p>
            <p className="text-xs text-gray-500">$347.5M</p>
            <p className="text-xs text-red-600">{t('ar2.vsTargetPlus')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ar2.fixedIncome')}</h3>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">20.1%</p>
            <p className="text-xs text-gray-500">$100.5M</p>
            <p className="text-xs text-red-600">{t('ar2.vsTargetMinus')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ar2.geoDiversity')}</h3>
            <Globe className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-600">5</p>
            <p className="text-xs text-gray-500">{t('ar2.regions')}</p>
            <p className="text-xs text-gray-600">{t('ar2.intlPct')}</p>
          </div>
        </div>
      </div>

      {/* Asset Class Allocation */}
      {selectedView === 'asset' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('ar2.assetClassAllocation')}</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('ar2.col.assetClass')}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.currentPct')}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.targetPct')}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.drift')}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.value')}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('ar2.col.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assetAllocation.map((asset) => (
                  <tr key={asset.category}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{t(asset.category)}</td>
                    <td className="px-4 py-4 text-sm text-end font-medium text-black">
                      {formatPercentage(asset.current)}
                    </td>
                    <td className="px-4 py-4 text-sm text-end text-gray-700">
                      {formatPercentage(asset.target)}
                    </td>
                    <td className={`px-4 py-4 text-sm text-end font-medium ${getDriftColor(asset.drift)}`}>
                      {asset.drift >= 0 ? '+' : ''}{formatPercentage(asset.drift)}
                    </td>
                    <td className="px-4 py-4 text-sm text-end text-gray-900">
                      {formatCurrency(asset.value)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <div 
                          className={`w-full max-w-24 h-2 rounded-full ${
                            Math.abs(asset.drift) >= 2 ? 'bg-red-200' : 
                            Math.abs(asset.drift) >= 1 ? 'bg-yellow-200' : 'bg-red-200'
                          }`}
                        >
                          <div 
                            className={`h-2 rounded-full ${
                              Math.abs(asset.drift) >= 2 ? 'bg-red-500' : 
                              Math.abs(asset.drift) >= 1 ? 'bg-yellow-500' : 'bg-red-500'
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
            <h3 className="text-lg font-semibold text-gray-900">{t('ar2.sectorAllocation')}</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectorAllocation.map((sector) => (
              <div key={sector.sector} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{t(sector.sector)}</h4>
                  <span className="text-lg font-bold text-black">{formatPercentage(sector.allocation)}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">{t('ar2.valueLabel')}</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(sector.value)}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">{t('ar2.ytdPerformance')}</span>
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
            <h3 className="text-lg font-semibold text-gray-900">{t('ar2.geographicAllocation')}</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {geographicAllocation.map((region) => (
              <div key={region.region} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">{t(region.region)}</h4>
                  <span className="text-xl font-bold text-red-600">{formatPercentage(region.allocation)}</span>
                </div>

                <div className="mb-3">
                  <span className="text-xs text-gray-500 block">{t('ar2.valueLabel')}</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(region.value)}</span>
                </div>

                <div className="mb-4">
                  <span className="text-xs text-gray-500 block mb-2">{t('ar2.keyMarkets')}</span>
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
                    className="bg-red-500 h-2 rounded-full"
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
            <h3 className="text-lg font-semibold text-gray-900">{t('ar2.topHoldingsTitle')}</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('ar2.col.security')}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('ar2.col.ticker')}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('ar2.col.sector')}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.allocation')}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.value')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topHoldings.map((holding, index) => (
                  <tr key={holding.ticker}>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 me-3">{index + 1}.</span>
                        <span className="font-medium text-gray-900">{holding.holding}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-black font-medium">{holding.ticker}</td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {t(holding.sector)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-end font-medium text-black">
                      {formatPercentage(holding.allocation)}
                    </td>
                    <td className="px-4 py-4 text-sm text-end text-gray-900">
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
            <h3 className="text-lg font-semibold text-gray-900">{t('ar2.allocationTrends')}</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-start text-xs font-medium text-gray-500 uppercase">{t('ar2.col.period')}</th>
                  <th className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.equities')}</th>
                  <th className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.bonds')}</th>
                  <th className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.alts')}</th>
                  <th className="px-3 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('ar2.col.cash')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historicalAllocation.map((period) => (
                  <tr key={period.date}>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{period.date}</td>
                    <td className="px-3 py-3 text-sm text-end text-black">{formatPercentage(period.equities)}</td>
                    <td className="px-3 py-3 text-sm text-end text-purple-600">{formatPercentage(period.fixedIncome)}</td>
                    <td className="px-3 py-3 text-sm text-end text-orange-600">{formatPercentage(period.alternatives)}</td>
                    <td className="px-3 py-3 text-sm text-end text-gray-600">{formatPercentage(period.cash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('ar2.riskAdjustedMetrics')}</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {riskMetrics.map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{t(metric.metric)}</span>
                <div className="text-end">
                  <span className="text-sm font-bold text-black">{metric.value}</span>
                  {metric.benchmark !== 0 && (
                    <div className="text-xs text-gray-500">
                      {t('ar2.vsBenchmark', { value: metric.benchmark })}
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
            <p>{t('bc.generatedOn', { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })}</p>
            <p>{t('ar2.footerNote')}</p>
          </div>
          <div className="text-end">
            <p>{t('bc.systemVersion')}</p>
            <p>{t('bc.copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
