import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  { factor: 'rm.factor.equity', exposure: 65.2, contribution: 78.5, limit: 80.0, status: 'Within Limits' },
  { factor: 'rm.factor.interestRate', exposure: 15.8, contribution: 12.3, limit: 25.0, status: 'Within Limits' },
  { factor: 'rm.factor.credit', exposure: 8.4, contribution: 6.8, limit: 15.0, status: 'Within Limits' },
  { factor: 'rm.factor.currency', exposure: 12.1, contribution: 9.2, limit: 20.0, status: 'Within Limits' },
  { factor: 'rm.factor.commodity', exposure: 3.5, contribution: 2.8, limit: 10.0, status: 'Within Limits' },
  { factor: 'rm.factor.concentration', exposure: 18.7, contribution: 15.4, limit: 25.0, status: 'Monitor' }
];

const stressTests = [
  {
    scenario: 'rm.scenario.crisis2008',
    portfolioImpact: -28.5,
    duration: '12 months',
    recovery: '18 months',
    probability: 'Low (2-5%)'
  },
  {
    scenario: 'rm.scenario.euDebt',
    portfolioImpact: -15.2,
    duration: '8 months',
    recovery: '14 months',
    probability: 'Medium (5-10%)'
  },
  {
    scenario: 'rm.scenario.covid',
    portfolioImpact: -22.1,
    duration: '6 months',
    recovery: '12 months',
    probability: 'Medium (5-10%)'
  },
  {
    scenario: 'rm.scenario.rateShock',
    portfolioImpact: -12.8,
    duration: '3 months',
    recovery: '9 months',
    probability: 'High (10-15%)'
  },
  {
    scenario: 'rm.scenario.oilShock',
    portfolioImpact: -8.4,
    duration: '4 months',
    recovery: '8 months',
    probability: 'Medium (5-10%)'
  }
];

const correlationMatrix = [
  { asset: 'rm.asset.usEquities', usEquities: 1.00, intlEquities: 0.85, bonds: -0.15, commodities: 0.25, reits: 0.75 },
  { asset: 'rm.asset.intlEquities', usEquities: 0.85, intlEquities: 1.00, bonds: -0.08, commodities: 0.32, reits: 0.68 },
  { asset: 'rm.asset.fixedIncome', usEquities: -0.15, intlEquities: -0.08, bonds: 1.00, commodities: -0.05, reits: 0.12 },
  { asset: 'rm.asset.commodities', usEquities: 0.25, intlEquities: 0.32, bonds: -0.05, commodities: 1.00, reits: 0.18 },
  { asset: 'rm.asset.reits', usEquities: 0.75, intlEquities: 0.68, bonds: 0.12, commodities: 0.18, reits: 1.00 }
];

const riskLimits = [
  { metric: 'rm.limit.var', current: 1.96, limit: 3.00, utilization: 65.3, status: 'Green' },
  { metric: 'rm.limit.sectorConc', current: 18.7, limit: 25.0, utilization: 74.8, status: 'Yellow' },
  { metric: 'rm.limit.singleSecurity', current: 4.2, limit: 5.0, utilization: 84.0, status: 'Yellow' },
  { metric: 'rm.limit.leverage', current: 1.15, limit: 1.50, utilization: 76.7, status: 'Green' },
  { metric: 'rm.limit.liquidity', current: 85.2, limit: 80.0, utilization: 106.5, status: 'Green' },
  { metric: 'rm.limit.duration', current: 4.8, limit: 6.0, utilization: 80.0, status: 'Green' }
];

export default function RiskMetrics() {
  const { t } = useTranslation('investor');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [selectedRiskType, setSelectedRiskType] = useState('Market');

  const translateFactorStatus = (status: string) => {
    switch (status) {
      case 'Within Limits': return t('rm.status.withinLimits');
      case 'Monitor': return t('rm.status.monitor');
      case 'Breach': return t('rm.status.breach');
      default: return status;
    }
  };
  const translateProbability = (probability: string) => {
    if (probability.includes('High')) return t('rm.prob.High');
    if (probability.includes('Medium')) return t('rm.prob.Medium');
    return t('rm.prob.Low');
  };
  const translateMonths = (value: string) => t('rm.monthsValue', { count: parseInt(value, 10) });

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
      case 'Green': return 'bg-red-50 text-red-700';
      case 'Yellow': return 'bg-yellow-100 text-yellow-800';
      case 'Red': return 'bg-red-100 text-red-800';
      case 'Within Limits': return 'bg-red-50 text-red-700';
      case 'Monitor': return 'bg-yellow-100 text-yellow-800';
      case 'Breach': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return 'bg-red-100 text-red-800';
    if (absValue >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
              <h1 className="text-3xl font-bold text-gray-900">{t('rm.title')}</h1>
              <p className="text-gray-600">{t('rm.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 me-2" />
              {t('rm.refreshData')}
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
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-orange-600 me-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-orange-900">{t('rm.infoTitle')}</h3>
            <p className="text-sm text-orange-700 mt-1">
              {t('rm.infoBody')}
            </p>
            <p className="text-xs text-orange-600 mt-2">
              {t('rm.lastUpdated', { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('rm.var95Title')}</h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(riskOverview.var95)}</p>
            <p className="text-xs text-gray-500">{t('rm.var95Hint')}</p>
            <p className="text-xs text-gray-600">{t('rm.ofPortfolio', { value: ((riskOverview.var95 / riskOverview.portfolioValue) * 100).toFixed(1) })}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('rm.esTitle')}</h3>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(riskOverview.expectedShortfall)}</p>
            <p className="text-xs text-gray-500">{t('rm.esHint')}</p>
            <p className="text-xs text-gray-600">{t('rm.ofPortfolio', { value: ((riskOverview.expectedShortfall / riskOverview.portfolioValue) * 100).toFixed(1) })}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('rm.volTitle')}</h3>
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-600">{riskOverview.volatility}%</p>
            <p className="text-xs text-gray-500">{t('rm.volHint')}</p>
            <p className="text-xs text-gray-600">{t('rm.volSub')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('rm.mddTitle')}</h3>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">{riskOverview.maxDrawdown}%</p>
            <p className="text-xs text-gray-500">{t('rm.mddHint')}</p>
            <p className="text-xs text-gray-600">{t('rm.mddSub')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Risk Factor Decomposition */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('rm.factorDecomposition')}</h3>
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {riskFactors.map((factor) => (
              <div key={factor.factor} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{t(factor.factor)}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(factor.status)}`}>
                    {translateFactorStatus(factor.status)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">{t('rm.exposure')}</span>
                    <span className="font-medium text-gray-900">{factor.exposure}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('rm.riskContrib')}</span>
                    <span className="font-medium text-gray-900">{factor.contribution}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('rm.limitField')}</span>
                    <span className="font-medium text-gray-900">{factor.limit}%</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        factor.exposure / factor.limit > 0.8 ? 'bg-red-500' :
                        factor.exposure / factor.limit > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((factor.exposure / factor.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('rm.limitUtilized', { value: ((factor.exposure / factor.limit) * 100).toFixed(1) })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Limits Monitoring */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('rm.limitsMonitoring')}</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {riskLimits.map((limit) => (
              <div key={limit.metric} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{t(limit.metric)}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(limit.status)}`}>
                    {t(`rm.limitStatus.${limit.status}`)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500 block">{t('rm.current')}</span>
                    <span className="font-medium text-gray-900">{limit.current}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('rm.limitField')}</span>
                    <span className="font-medium text-gray-900">{limit.limit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('rm.utilization')}</span>
                    <span className="font-medium text-gray-900">{limit.utilization}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      limit.utilization > 90 ? 'bg-red-500' : 
                      limit.utilization > 75 ? 'bg-yellow-500' : 'bg-red-500'
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
          <h3 className="text-lg font-semibold text-gray-900">{t('rm.stressTesting')}</h3>
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('rm.col.scenario')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('rm.col.portfolioImpact')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('rm.col.duration')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('rm.col.recovery')}</th>
                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('rm.col.probability')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stressTests.map((test) => (
                <tr key={test.scenario}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{t(test.scenario)}</td>
                  <td className="px-4 py-4 text-sm text-end">
                    <span className="font-medium text-red-600">{test.portfolioImpact}%</span>
                    <div className="text-xs text-gray-500">
                      {formatCurrency((riskOverview.portfolioValue * Math.abs(test.portfolioImpact)) / 100)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-end text-gray-700">{translateMonths(test.duration)}</td>
                  <td className="px-4 py-4 text-sm text-end text-gray-700">{translateMonths(test.recovery)}</td>
                  <td className="px-4 py-4 text-sm text-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      test.probability.includes('High') ? 'bg-red-100 text-red-800' :
                      test.probability.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {translateProbability(test.probability)}
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
          <h3 className="text-lg font-semibold text-gray-900">{t('rm.correlationMatrix')}</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('rm.col.assetClass')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('rm.corr.us')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('rm.corr.intl')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('rm.corr.fixed')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('rm.corr.commodities')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('rm.corr.reits')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {correlationMatrix.map((row) => (
                <tr key={row.asset}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{t(row.asset)}</td>
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
            <p>{t('bc.generatedOn', { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })}</p>
            <p>{t('rm.riskCalcNote')}</p>
          </div>
          <div className="text-end">
            <p>{t('rm.systemVersion')}</p>
            <p>{t('bc.copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
