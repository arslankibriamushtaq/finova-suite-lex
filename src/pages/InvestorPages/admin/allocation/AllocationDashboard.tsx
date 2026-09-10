import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Play,
  FileText,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

// Mock data for KPIs
const kpiData = {
  activeStrategies: 12,
  totalAllocated: 8500000000, // 8.5B SAR
  avgInvestorExposure: 34.2,
  lastSimulationStatus: 'success', // success, failure, running
  lastSimulationTime: '2024-01-22T15:30:00Z'
};

// Mock data for allocation by risk band
const allocationByRisk = [
  { riskBand: 'ad.riskBand.low', amount: 3200000000, percentage: 37.6, color: 'bg-red-500' },
  { riskBand: 'ad.riskBand.medium', amount: 3800000000, percentage: 44.7, color: 'bg-yellow-500' },
  { riskBand: 'ad.riskBand.high', amount: 1500000000, percentage: 17.7, color: 'bg-red-500' }
];

// Mock data for exposure heatmap
const exposureHeatmap = [
  { product: 'ad.product.pos', lowRisk: 45, mediumRisk: 35, highRisk: 20 },
  { product: 'ad.product.auto', lowRisk: 60, mediumRisk: 30, highRisk: 10 },
  { product: 'ad.product.msme', lowRisk: 25, mediumRisk: 45, highRisk: 30 },
  { product: 'ad.product.realEstate', lowRisk: 40, mediumRisk: 40, highRisk: 20 },
  { product: 'ad.product.consumer', lowRisk: 30, mediumRisk: 50, highRisk: 20 }
];

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: 'strategy_executed',
    strategy: 'High Risk Preferred V2',
    amount: 125000000,
    timestamp: '2024-01-22T14:30:00Z',
    status: 'success'
  },
  {
    id: 2,
    type: 'allocation_limit_exceeded',
    strategy: 'Conservative Allocation',
    amount: 250000000,
    timestamp: '2024-01-22T13:15:00Z',
    status: 'warning'
  },
  {
    id: 3,
    type: 'simulation_completed',
    strategy: 'Balanced Growth',
    amount: 180000000,
    timestamp: '2024-01-22T12:45:00Z',
    status: 'success'
  },
  {
    id: 4,
    type: 'manual_override',
    strategy: 'Emergency Allocation',
    amount: 75000000,
    timestamp: '2024-01-22T11:20:00Z',
    status: 'manual'
  }
];

export default function AllocationDashboard() {
  const { t } = useTranslation('investor');
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'manual': return <Users className="w-4 h-4 text-gray-700" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'strategy_executed': return t('ad.activity.strategyExecuted');
      case 'allocation_limit_exceeded': return t('ad.activity.limitExceeded');
      case 'simulation_completed': return t('ad.activity.simulationComplete');
      case 'manual_override': return t('ad.activity.manualOverride');
      default: return t('ad.activity.unknown');
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 50) return 'bg-red-500';
    if (value >= 30) return 'bg-yellow-500';
    if (value >= 15) return 'bg-gray-700';
    return 'bg-red-500';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('ad.title')}</h1>
            <p className="text-gray-600">{t('ad.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 me-2 ${refreshing ? 'animate-spin' : ''}`} />
              {t('dashboard.refreshData')}
            </button>
            <Link
              to="/InvestorDashboard/AllocationEngine/audit"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 me-2" />
              {t('ad.viewAuditLogs')}
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ad.activeStrategies')}</h3>
            <Zap className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">{kpiData.activeStrategies}</p>
            <p className="text-xs text-gray-500">{t('ad.currentlyRunning')}</p>
            <p className="text-xs text-red-600">{t('ad.plus2ThisMonth')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ad.totalAllocated')}</h3>
            <DollarSign className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(kpiData.totalAllocated)}</p>
            <p className="text-xs text-gray-500">{t('ad.acrossStrategies')}</p>
            <p className="text-xs text-red-600">{t('ad.plus12Quarter')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ad.avgExposure')}</h3>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">{formatPercentage(kpiData.avgInvestorExposure)}</p>
            <p className="text-xs text-gray-500">{t('ad.portfolioAllocation')}</p>
            <p className="text-xs text-gray-600">{t('ad.withinTarget')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('ad.latestSimulation')}</h3>
            {kpiData.lastSimulationStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-red-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="space-y-2">
            <p className={`text-2xl font-bold ${kpiData.lastSimulationStatus === 'success' ? 'text-slate-500' : 'text-red-600'}`}>
              {kpiData.lastSimulationStatus === 'success' ? t('ad.success') : t('ad.failed')}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(kpiData.lastSimulationTime).toLocaleTimeString()}
            </p>
            <p className="text-xs text-black">{t('ad.viewDetails')}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('reports.quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/InvestorDashboard/AllocationEngine/strategies/new"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <Plus className="w-5 h-5 text-black me-3" />
              <span className="text-sm font-medium text-gray-900">{t('ad.createStrategy')}</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black" />
          </Link>

          <button
            onClick={() => {/* TODO: Open global simulation modal */}}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <Play className="w-5 h-5 text-red-600 me-3" />
              <span className="text-sm font-medium text-gray-900">{t('ad.runGlobalSim')}</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
          </button>

          <Link
            to="/InvestorDashboard/AllocationEngine/audit"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-purple-600 me-3" />
              <span className="text-sm font-medium text-gray-900">{t('ad.viewAuditLogs')}</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Current Allocation by Risk Band */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('ad.allocationByRisk')}</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {allocationByRisk.map((item) => (
              <div key={item.riskBand} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{t(item.riskBand)}</span>
                  <span className="text-sm font-medium text-gray-900">{formatPercentage(item.percentage)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatCurrency(item.amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">{t('ad.totalAllocated')}</span>
              <span className="font-bold text-black">{formatCurrency(kpiData.totalAllocated)}</span>
            </div>
          </div>
        </div>

        {/* Exposure Heatmap */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('ad.exposureHeatmap')}</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>{t('ad.col.product')}</span>
              <span className="text-center">{t('ad.col.lowRisk')}</span>
              <span className="text-center">{t('ad.col.medRisk')}</span>
              <span className="text-center">{t('ad.col.highRisk')}</span>
            </div>
            
            {exposureHeatmap.map((row) => (
              <div key={row.product} className="grid grid-cols-4 gap-2 items-center">
                <span className="text-sm font-medium text-gray-900">{t(row.product)}</span>
                <div className="text-center">
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getHeatmapColor(row.lowRisk)}`}>
                    {row.lowRisk}%
                  </div>
                </div>
                <div className="text-center">
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getHeatmapColor(row.mediumRisk)}`}>
                    {row.mediumRisk}%
                  </div>
                </div>
                <div className="text-center">
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getHeatmapColor(row.highRisk)}`}>
                    {row.highRisk}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>{t('ad.exposureLegend')}</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{t('ad.recentActivities')}</h3>
          <Link
            to="/InvestorDashboard/AllocationEngine/audit"
            className="text-sm text-black hover:text-gray-800"
          >
            {t('reports.viewAll')}
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-center space-x-4">
                {getStatusIcon(activity.status)}
                <div>
                  <div className="text-sm font-medium text-gray-900">{getActivityTypeLabel(activity.type)}</div>
                  <div className="text-sm text-gray-600">{activity.strategy}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-end">
                <div className="text-sm font-medium text-gray-900">{formatCurrency(activity.amount)}</div>
                <div className={`text-xs ${
                  activity.status === 'success' ? 'text-red-600' :
                  activity.status === 'warning' ? 'text-yellow-600' :
                  activity.status === 'manual' ? 'text-black' :
                  'text-red-600'
                }`}>
                  {t(`ad.status.${activity.status}`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
