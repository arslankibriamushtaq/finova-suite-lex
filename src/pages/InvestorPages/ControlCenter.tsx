import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock
} from 'lucide-react';

const portfolioStats = [
  {
    name: 'Total Portfolio Value',
    value: '$2.4B',
    change: '+12.3%',
    changeType: 'increase',
    icon: DollarSign,
    period: 'vs last quarter'
  },
  {
    name: 'Active Investors',
    value: '1,247',
    change: '+8.2%',
    changeType: 'increase',
    icon: Users,
    period: 'vs last month'
  },
  {
    name: 'Investment Products',
    value: '45',
    change: '+3',
    changeType: 'increase',
    icon: Activity,
    period: 'new this quarter'
  },
  {
    name: 'Risk Score',
    value: '3.2/10',
    change: '-0.4',
    changeType: 'decrease',
    icon: TrendingDown,
    period: 'improved'
  },
];

const systemStatus = [
  { name: 'Trading System', status: 'operational', uptime: '99.9%' },
  { name: 'Data Analytics', status: 'operational', uptime: '99.8%' },
  { name: 'Reporting Engine', status: 'maintenance', uptime: '98.5%' },
  { name: 'Security Layer', status: 'operational', uptime: '100%' },
];

const recentActivity = [
  {
    id: 1,
    type: 'investment',
    message: 'Large cap equity fund received $50M investment',
    time: '2 minutes ago',
    severity: 'info'
  },
  {
    id: 2,
    type: 'alert',
    message: 'Risk threshold exceeded for emerging markets fund',
    time: '15 minutes ago',
    severity: 'warning'
  },
  {
    id: 3,
    type: 'transaction',
    message: 'Quarterly dividend distribution completed',
    time: '1 hour ago',
    severity: 'success'
  },
  {
    id: 4,
    type: 'compliance',
    message: 'Monthly compliance report generated',
    time: '3 hours ago',
    severity: 'info'
  },
];

export default function ControlCenter() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Control Center</h1>
        <p className="text-gray-600">Super Admin Dashboard for Portfolio Management System</p>
      </div>

      {/* Portfolio Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {portfolioStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-gray-600" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.period}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            {systemStatus.map((system) => (
              <div key={system.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {system.status === 'operational' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : system.status === 'maintenance' ? (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium text-gray-900">{system.name}</span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    system.status === 'operational' ? 'text-green-600' : 
                    system.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500">Uptime: {system.uptime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.severity === 'success' ? 'bg-green-500' :
                  activity.severity === 'warning' ? 'bg-yellow-500' :
                  activity.severity === 'error' ? 'bg-red-500' : 'bg-gray-700'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
            <Users className="w-5 h-5 mr-2" />
            Add Investor
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Activity className="w-5 h-5 mr-2" />
            Create Product
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <TrendingUp className="w-5 h-5 mr-2" />
            Generate Report
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Review Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
