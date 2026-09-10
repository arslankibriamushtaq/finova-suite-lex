import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Play,
  Download,
  Share,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText,
  Settings
} from 'lucide-react';

// Mock simulation data
const simulationResults = {
  id: 'SIM-2024-001',
  strategyId: 'STR-001',
  strategyName: 'High Risk Preferred V2',
  executedAt: '2024-01-22T15:30:00Z',
  status: 'completed',
  inputParams: {
    useLivePools: true,
    selectedLoans: ['LOAN-001', 'LOAN-002', 'LOAN-003'],
    totalLoanAmount: 15000000,
    simulationDate: '2024-01-22'
  },
  summary: {
    totalAllocated: 14250000,
    allocationSuccess: 95,
    investorsUsed: 12,
    avgAllocationSize: 1187500,
    expectedReturn: 13.2,
    riskScore: 'sr2.score.mediumHigh'
  },
  allocations: [
    {
      loanId: 'LOAN-001',
      loanAmount: 5000000,
      customerRisk: 'High',
      productType: 'sr2.product.msmeWC',
      allocations: [
        { investorId: 'INV-001', investorName: 'Al-Rajhi Capital', amount: 2000000, percentage: 40, riskTolerance: 'Aggressive', expectedReturn: 14.5 },
        { investorId: 'INV-007', investorName: 'Jadwa Investment', amount: 1500000, percentage: 30, riskTolerance: 'Aggressive', expectedReturn: 14.2 },
        { investorId: 'INV-012', investorName: 'SNB Capital', amount: 1500000, percentage: 30, riskTolerance: 'Balanced', expectedReturn: 13.8 }
      ],
      fallbackUsed: false,
      warnings: []
    },
    {
      loanId: 'LOAN-002',
      loanAmount: 7500000,
      customerRisk: 'Medium',
      productType: 'sr2.product.autoV2',
      allocations: [
        { investorId: 'INV-003', investorName: 'Saudi Fransi Capital', amount: 3000000, percentage: 40, riskTolerance: 'Balanced', expectedReturn: 11.2 },
        { investorId: 'INV-008', investorName: 'Riyad Capital', amount: 2250000, percentage: 30, riskTolerance: 'Balanced', expectedReturn: 11.5 },
        { investorId: 'INV-015', investorName: 'Alinma Investment', amount: 2250000, percentage: 30, riskTolerance: 'Conservative', expectedReturn: 10.8 }
      ],
      fallbackUsed: false,
      warnings: ['sr2.warn.approachingLimit']
    },
    {
      loanId: 'LOAN-003',
      loanAmount: 2500000,
      customerRisk: 'Low',
      productType: 'sr2.product.posV1',
      allocations: [
        { investorId: 'INV-005', investorName: 'Gulf Capital', amount: 1250000, percentage: 50, riskTolerance: 'Conservative', expectedReturn: 8.5 },
        { investorId: 'INV-011', investorName: 'Alkhabeer Capital', amount: 1000000, percentage: 40, riskTolerance: 'Conservative', expectedReturn: 8.2 }
      ],
      fallbackUsed: true,
      fallbackReason: 'sr2.fallback.loan003',
      warnings: ['sr2.warn.manualAlloc']
    }
  ],
  riskAnalysis: {
    portfolioRisk: 'Medium-High',
    diversificationScore: 85,
    concentrationRisk: 'Low',
    liquidityRisk: 'Medium'
  },
  warnings: [
    'sr2.warn.1',
    'sr2.warn.2',
    'sr2.warn.3'
  ]
};

const investorExposureData = [
  { investor: 'Al-Rajhi Capital', currentExposure: 45, newExposure: 52, limit: 60, status: 'safe' },
  { investor: 'Jadwa Investment', currentExposure: 32, newExposure: 38, limit: 50, status: 'safe' },
  { investor: 'Saudi Fransi Capital', currentExposure: 28, newExposure: 35, limit: 45, status: 'safe' },
  { investor: 'Alinma Investment', currentExposure: 68, newExposure: 78, limit: 80, status: 'warning' },
  { investor: 'Gulf Capital', currentExposure: 22, newExposure: 28, limit: 40, status: 'safe' }
];

export default function SimulationResults() {
  const { t } = useTranslation('investor');
  const riskKey: Record<string, string> = { 'Low': 'sr2.risk.low', 'Medium': 'sr2.risk.medium', 'High': 'sr2.risk.high' };
  const tolKey: Record<string, string> = { 'Aggressive': 'sr2.tolerance.aggressive', 'Balanced': 'sr2.tolerance.balanced', 'Conservative': 'sr2.tolerance.conservative' };
  const statusKey: Record<string, string> = { 'safe': 'sr2.status.safe', 'warning': 'sr2.status.warning', 'danger': 'sr2.status.danger' };
  const tRisk = (r: string) => (riskKey[r] ? t(riskKey[r]) : r);
  const tTol = (r: string) => (tolKey[r] ? t(tolKey[r]) : r);
  const tSimStatus = (s: string) => (statusKey[s] ? t(statusKey[s]) : s);
  const { strategyId } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const isGlobal = searchParams.get('global') === 'true';

  const [selectedView, setSelectedView] = useState('summary');
  const [committing, setCommitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleCommitAllocation = async () => {
    if (confirm(t('sr2.commitConfirm'))) {
      setCommitting(true);
      // Simulate API call
      setTimeout(() => {
        alert(t('sr2.committed'));
        setCommitting(false);
      }, 2000);
    }
  };

  const handleExportResults = () => {
    alert(t('sr2.exporting'));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to={isGlobal ? "/InvestorDashboard/AllocationEngine" : `/InvestorDashboard/AllocationEngine/strategies/${strategyId}`}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 me-2" />
              {isGlobal ? t('sl.backToDashboard') : t('sr2.backToStrategy')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('sr2.title')}</h1>
              <p className="text-gray-600">
                {isPreview ? t('sr2.strategyPreview') : isGlobal ? t('sr2.globalSimulation') : simulationResults.strategyName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportResults}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 me-2" />
              {t('sr2.exportResults')}
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share className="w-4 h-4 me-2" />
              {t('pl.share')}
            </button>
            {!isPreview && (
              <button
                onClick={handleCommitAllocation}
                disabled={committing}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {committing ? (
                  <RefreshCw className="w-4 h-4 me-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 me-2" />
                )}
                {committing ? t('sr2.committing') : t('sr2.commitAllocation')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simulation Info */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-black me-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                {isPreview ? t('sr2.simPreview') : t('sr2.simCompleted')}
              </h3>
              <p className="text-sm text-gray-800">
                {isPreview ? t('sr2.previewDesc') :
                 t('sr2.executedOn', { date: new Date(simulationResults.executedAt).toLocaleString() })}
              </p>
            </div>
          </div>
          <div className="text-end">
            <div className="text-sm font-medium text-blue-900">{t('sr2.simulationId')}</div>
            <div className="text-sm text-gray-800">{simulationResults.id}</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ad.totalAllocated')}</h3>
            <DollarSign className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(simulationResults.summary.totalAllocated)}</p>
            <p className="text-xs text-gray-500">
              {t('sr2.allocationSuccess', { value: simulationResults.summary.allocationSuccess })}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('sr2.investorsUsed')}</h3>
            <Users className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">{simulationResults.summary.investorsUsed}</p>
            <p className="text-xs text-gray-500">
              {t('sr2.avgLabel', { value: formatCurrency(simulationResults.summary.avgAllocationSize) })}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('sr2.expectedReturn')}</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">{simulationResults.summary.expectedReturn}%</p>
            <p className="text-xs text-gray-500">{t('sr2.weightedAvg')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('sr2.riskScore')}</h3>
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-600">{t(simulationResults.summary.riskScore)}</p>
            <p className="text-xs text-gray-500">{t('sr2.portfolioRiskLevel')}</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'summary', label: 'sr2.tab.summary', icon: BarChart3 },
              { key: 'details', label: 'sr2.tab.details', icon: FileText },
              { key: 'exposure', label: 'sr2.tab.exposure', icon: Users },
              { key: 'warnings', label: 'sr2.tab.warnings', icon: AlertTriangle }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedView(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  selectedView === tab.key
                    ? 'border-gray-700 text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 me-2" />
                {t(tab.label)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {selectedView === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Allocation Pie Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('sr2.allocationByRiskLevel')}</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {[
                { risk: 'sr2.riskBand.high', amount: 5000000, percentage: 35.1, color: 'bg-red-500' },
                { risk: 'sr2.riskBand.medium', amount: 7500000, percentage: 52.6, color: 'bg-yellow-500' },
                { risk: 'sr2.riskBand.low', amount: 1750000, percentage: 12.3, color: 'bg-red-500' }
              ].map((item) => (
                <div key={item.risk} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{t(item.risk)}</span>
                    <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Allocations */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('sr2.topAllocations')}</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {simulationResults.allocations
                .flatMap(loan => loan.allocations)
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((allocation, index) => (
                  <div key={`${allocation.investorId}-${index}`} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{allocation.investorName}</div>
                      <div className="text-xs text-gray-500">{t('sr2.returnLabel', { tolerance: tTol(allocation.riskTolerance), value: allocation.expectedReturn })}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(allocation.amount)}</div>
                      <div className="text-xs text-gray-500">{allocation.percentage}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'details' && (
        <div className="space-y-6">
          {simulationResults.allocations.map((loan) => (
            <div key={loan.loanId} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{loan.loanId}</h3>
                  <p className="text-sm text-gray-600">{t('sr2.loanSubtitle', { product: t(loan.productType), risk: tRisk(loan.customerRisk), amount: formatCurrency(loan.loanAmount) })}</p>
                </div>
                <div className="text-end">
                  {loan.fallbackUsed && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
                      {t('sr2.fallbackUsed')}
                    </div>
                  )}
                  {loan.warnings.length > 0 && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {t('sr2.warningsCount', { count: loan.warnings.length })}
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-start text-xs font-medium text-gray-500 uppercase">{t('sr2.col.investor')}</th>
                      <th className="px-4 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('common:amount')}</th>
                      <th className="px-4 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('sr2.col.percentage')}</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{t('sr2.col.riskTolerance')}</th>
                      <th className="px-4 py-2 text-end text-xs font-medium text-gray-500 uppercase">{t('sr2.col.expectedReturn')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loan.allocations.map((allocation) => (
                      <tr key={allocation.investorId}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{allocation.investorName}</td>
                        <td className="px-4 py-3 text-sm text-end text-gray-900">{formatCurrency(allocation.amount)}</td>
                        <td className="px-4 py-3 text-sm text-end text-gray-600">{allocation.percentage}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            allocation.riskTolerance === 'Aggressive' ? 'bg-red-100 text-red-800' :
                            allocation.riskTolerance === 'Balanced' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tTol(allocation.riskTolerance)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-end text-red-600 font-medium">{allocation.expectedReturn}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {loan.fallbackUsed && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>{t('sr2.fallbackLabel')}</strong> {t(loan.fallbackReason)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedView === 'exposure' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('sr2.exposureTitle')}</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('sr2.col.investor')}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('sr2.col.currentExposure')}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('sr2.col.newExposure')}</th>
                  <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('sr2.col.limit')}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('sr2.col.utilization')}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('common:status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investorExposureData.map((investor) => (
                  <tr key={investor.investor}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{investor.investor}</td>
                    <td className="px-4 py-4 text-sm text-end text-gray-600">{investor.currentExposure}%</td>
                    <td className="px-4 py-4 text-sm text-end font-medium text-gray-900">{investor.newExposure}%</td>
                    <td className="px-4 py-4 text-sm text-end text-gray-600">{investor.limit}%</td>
                    <td className="px-4 py-4 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            investor.newExposure / investor.limit > 0.9 ? 'bg-red-500' :
                            investor.newExposure / investor.limit > 0.75 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(investor.newExposure / investor.limit) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((investor.newExposure / investor.limit) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        investor.status === 'safe' ? 'bg-red-100 text-red-800' :
                        investor.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tSimStatus(investor.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedView === 'warnings' && (
        <div className="space-y-4">
          {simulationResults.warnings.map((warning, index) => (
            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 me-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">{t('sr2.warningN', { n: index + 1 })}</h4>
                  <p className="text-sm text-yellow-700 mt-1">{t(warning)}</p>
                </div>
              </div>
            </div>
          ))}
          
          {simulationResults.warnings.length === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <CheckCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h4 className="text-sm font-medium text-red-900">{t('sr2.noWarnings')}</h4>
              <p className="text-sm text-red-700 mt-1">{t('sr2.noWarningsDesc')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
