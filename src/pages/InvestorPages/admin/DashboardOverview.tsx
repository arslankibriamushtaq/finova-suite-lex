import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Eye,
  RefreshCw
} from 'lucide-react';
// import { DashboardData } from '@shared/api';
import { getDashboardInfo } from '../../../redux/apis/apisInvestor';
import Loader from '../../../components/Loader/Loader';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format percentage
const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const recentActivity = [
  {
    id: 1,
    type: 'investment',
    message: 'Large cap equity fund received $50M investment from Goldman Family Office',
    time: '2 minutes ago',
    severity: 'info',
    amount: '$50,000,000'
  },
  {
    id: 2,
    type: 'alert',
    message: 'Risk threshold exceeded for emerging markets fund - requires attention',
    time: '15 minutes ago',
    severity: 'warning',
    amount: null
  },
  {
    id: 3,
    type: 'transaction',
    message: 'Quarterly dividend distribution completed for 1,247 investors',
    time: '1 hour ago',
    severity: 'success',
    amount: '$12,450,000'
  },
  {
    id: 4,
    type: 'compliance',
    message: 'Monthly compliance report generated and submitted to regulators',
    time: '3 hours ago',
    severity: 'info',
    amount: null
  },
  {
    id: 5,
    type: 'user',
    message: 'New institutional investor account created - pending KYC verification',
    time: '4 hours ago',
    severity: 'info',
    amount: null
  },
];

export default function DashboardOverview() {
  const { t } = useTranslation('investor');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getDashboardInfo();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.notificationMessage || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(t('dashboard.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
     <Loader />
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            {t('dashboard.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">{t('common:noData')}</p>
        </div>
      </div>
    );
  }

  // Create dynamic portfolio stats from API data
  const portfolioStats = [
    {
      name: t('dashboard.stat.totalInvestment'),
      value: formatCurrency(dashboardData.totalInvestment),
      change: formatPercentage(dashboardData.quarterlyChangeInInvestment),
      changeType: dashboardData.quarterlyChangeInInvestment >= 0 ? 'increase' : 'decrease',
      icon: "SAR",
      period: t('dashboard.period.vsLastQuarter'),
      subtext: t('dashboard.subtext.acrossProducts', { count: dashboardData.totalProducts })
    },
    {
      name: t('dashboard.stat.totalInvestors'),
      value: dashboardData.totalInvestors.toString(),
      change: formatPercentage(dashboardData.monthlyChangeInInvestor),
      changeType: dashboardData.monthlyChangeInInvestor >= 0 ? 'increase' : 'decrease',
      icon: Users,
      period: t('dashboard.period.vsLastMonth'),
      subtext: t('dashboard.subtext.pendingVerification', { count: dashboardData.pendingInvestors })
    },
    {
      name: t('dashboard.stat.investmentProducts'),
      value: dashboardData.totalProducts.toString(),
      change: formatPercentage(dashboardData.quarterlyChangeInProduct),
      changeType: dashboardData.quarterlyChangeInProduct >= 0 ? 'increase' : 'decrease',
      icon: Activity,
      period: t('dashboard.period.newThisQuarter'),
      subtext: t('dashboard.subtext.activeLaunching', { active: dashboardData.activeProducts, launching: dashboardData.launchingProducts })
    },
    {
      name: t('dashboard.stat.ytdPerformance'),
      value: `${(dashboardData.ytdPerformance * 100).toFixed(2)}%`,
      change: dashboardData.ytdPerformance >= 0 ? `+${(dashboardData.ytdPerformance * 100).toFixed(2)}%` : `${(dashboardData.ytdPerformance * 100).toFixed(2)}%`,
      changeType: dashboardData.ytdPerformance >= 0 ? 'increase' : 'decrease',
      icon: TrendingUp,
      period: t('dashboard.period.yearToDate'),
      subtext: t('dashboard.subtext.portfolioPerformance')
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 me-2 ${loading ? 'animate-spin' : ''}`} />
            {t('dashboard.refreshData')}
          </button>
          {/* <Link 
            to="/InvestorDashboard/Reports"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
          >
            <Eye className="w-4 h-4 me-2" />
            View Reports
          </Link> */}
        </div>
      </div>

      {/* Portfolio Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-gray-600" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-slate-500' : 'text-red-600'
              }`}>
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 me-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 me-1" />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 mb-1">{stat.period}</p>
              <p className="text-xs text-gray-400">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Actions Grid */}
      {dashboardData.pendingActions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                {t('dashboard.pending')}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {dashboardData.pendingActions.kycVerificationsPending}
              </p>
              <p className="text-sm text-gray-600 font-medium">{t('dashboard.kycVerifications')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('dashboard.kycVerificationsHint')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {t('dashboard.pending')}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {dashboardData.pendingActions.kybVerificationsPending}
              </p>
              <p className="text-sm text-gray-600 font-medium">{t('dashboard.kybVerifications')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('dashboard.kybVerificationsHint')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                {t('dashboard.pending')}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {dashboardData.pendingActions.pendingProducts}
              </p>
              <p className="text-sm text-gray-600 font-medium">{t('dashboard.productApprovals')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('dashboard.productApprovalsHint')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Performing Products Table */}
      {dashboardData.performingProducts && dashboardData.performingProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.topPerformingProducts')}</h2>
            <Link
              to="/InvestorDashboard/Products"
              className="text-sm text-black hover:text-gray-800 font-medium"
            >
              {t('dashboard.viewAllProducts')}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-start py-3 px-4 text-sm font-semibold text-gray-700">{t('dashboard.col.productName')}</th>
                  <th className="text-start py-3 px-4 text-sm font-semibold text-gray-700">{t('dashboard.stat.totalInvestment')}</th>
                  <th className="text-start py-3 px-4 text-sm font-semibold text-gray-700">{t('dashboard.col.launchYear')}</th>
                  <th className="text-start py-3 px-4 text-sm font-semibold text-gray-700">{t('dashboard.col.investors')}</th>
                  <th className="text-start py-3 px-4 text-sm font-semibold text-gray-700">{t('common:status')}</th>
                  <th className="text-start py-3 px-4 text-sm font-semibold text-gray-700">{t('common:actions')}</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.performingProducts.map((product: any, index: number) => (
                  <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-red-100' : index === 1 ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                          <Activity className={`w-5 h-5 ${
                            index === 0 ? 'text-red-600' : index === 1 ? 'text-blue-600' : 'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                          <p className="text-xs text-gray-500">ID: {product.productId.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.totalInvestment)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-700">{product.launchYear}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{product.totalInvestors}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === 0 ? 'bg-red-100 text-red-800' : 
                        product.status === 1 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status === 0 ? t('dashboard.status.active') : product.status === 1 ? t('dashboard.status.launching') : t('dashboard.status.inactive')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
   
      {/* Recent Activity */}
      {/* <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link 
            to="/InvestorDashboard/Logs"
            className="text-sm text-black hover:text-gray-800 font-medium"
          >
            View All Logs
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.severity === 'success' ? 'bg-red-500' :
                activity.severity === 'warning' ? 'bg-yellow-500' :
                activity.severity === 'error' ? 'bg-red-500' : 'bg-gray-700'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">{activity.time}</span>
                  {activity.amount && (
                    <span className="text-xs font-medium text-gray-700">{activity.amount}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}

 
    </div>
  );
}
