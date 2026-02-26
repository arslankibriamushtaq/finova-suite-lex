import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  { riskBand: 'Low Risk', amount: 3200000000, percentage: 37.6, color: 'bg-green-500' },
  { riskBand: 'Medium Risk', amount: 3800000000, percentage: 44.7, color: 'bg-yellow-500' },
  { riskBand: 'High Risk', amount: 1500000000, percentage: 17.7, color: 'bg-red-500' }
];

// Mock data for exposure heatmap
const exposureHeatmap = [
  { product: 'POS Loans', lowRisk: 45, mediumRisk: 35, highRisk: 20 },
  { product: 'Auto Loans', lowRisk: 60, mediumRisk: 30, highRisk: 10 },
  { product: 'MSME Loans', lowRisk: 25, mediumRisk: 45, highRisk: 30 },
  { product: 'Real Estate', lowRisk: 40, mediumRisk: 40, highRisk: 20 },
  { product: 'Consumer Loans', lowRisk: 30, mediumRisk: 50, highRisk: 20 }
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
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'manual': return <Users className="w-4 h-4 text-gray-700" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'strategy_executed': return 'Strategy Executed';
      case 'allocation_limit_exceeded': return 'Limit Exceeded';
      case 'simulation_completed': return 'Simulation Complete';
      case 'manual_override': return 'Manual Override';
      default: return 'Unknown Activity';
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 50) return 'bg-red-500';
    if (value >= 30) return 'bg-yellow-500';
    if (value >= 15) return 'bg-gray-700';
    return 'bg-green-500';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Allocation Engine</h1>
            <p className="text-gray-600">Automated investment allocation strategies and monitoring</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <Link
              to="/admin/allocation/audit"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Audit Logs
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Active Strategies</h3>
            <Zap className="w-5 h-5 text-gray-700" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-black">{kpiData.activeStrategies}</p>
            <p className="text-xs text-gray-500">Currently running</p>
            <p className="text-xs text-green-600">+2 this month</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Total Allocated</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(kpiData.totalAllocated)}</p>
            <p className="text-xs text-gray-500">Across all strategies</p>
            <p className="text-xs text-green-600">+12.5% this quarter</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Avg Investor Exposure</h3>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-600">{formatPercentage(kpiData.avgInvestorExposure)}</p>
            <p className="text-xs text-gray-500">Portfolio allocation</p>
            <p className="text-xs text-gray-600">Within target range</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Latest Simulation</h3>
            {kpiData.lastSimulationStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="space-y-2">
            <p className={`text-2xl font-bold ${kpiData.lastSimulationStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {kpiData.lastSimulationStatus === 'success' ? 'Success' : 'Failed'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(kpiData.lastSimulationTime).toLocaleTimeString()}
            </p>
            <p className="text-xs text-black">View details →</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/allocation/strategies/new"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <Plus className="w-5 h-5 text-black mr-3" />
              <span className="text-sm font-medium text-gray-900">Create Strategy</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black" />
          </Link>

          <button
            onClick={() => {/* TODO: Open global simulation modal */}}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <Play className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Run Global Simulation</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
          </button>

          <Link
            to="/admin/allocation/audit"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">View Audit Logs</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Current Allocation by Risk Band */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Allocation by Risk Band</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {allocationByRisk.map((item) => (
              <div key={item.riskBand} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.riskBand}</span>
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
              <span className="font-medium text-gray-900">Total Allocated</span>
              <span className="font-bold text-black">{formatCurrency(kpiData.totalAllocated)}</span>
            </div>
          </div>
        </div>

        {/* Exposure Heatmap */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Exposure Heatmap</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>Product</span>
              <span className="text-center">Low Risk</span>
              <span className="text-center">Med Risk</span>
              <span className="text-center">High Risk</span>
            </div>
            
            {exposureHeatmap.map((row) => (
              <div key={row.product} className="grid grid-cols-4 gap-2 items-center">
                <span className="text-sm font-medium text-gray-900">{row.product}</span>
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
            <span>Exposure levels: Low (0-15%) | Medium (15-30%) | High (30-50%) | Critical (50%+)</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <Link 
            to="/admin/allocation/audit"
            className="text-sm text-black hover:text-gray-800"
          >
            View All
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
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{formatCurrency(activity.amount)}</div>
                <div className={`text-xs ${
                  activity.status === 'success' ? 'text-green-600' :
                  activity.status === 'warning' ? 'text-yellow-600' :
                  activity.status === 'manual' ? 'text-black' :
                  'text-red-600'
                }`}>
                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
