import { Users, Mail, TrendingUp, Eye } from 'lucide-react';

const stats = [
  {
    name: 'Total Subscribers',
    value: '12,345',
    change: '+12%',
    changeType: 'increase',
    icon: Users,
  },
  {
    name: 'Active Campaigns',
    value: '8',
    change: '+2',
    changeType: 'increase',
    icon: Mail,
  },
  {
    name: 'Open Rate',
    value: '24.8%',
    change: '+3.2%',
    changeType: 'increase',
    icon: Eye,
  },
  {
    name: 'Growth Rate',
    value: '8.2%',
    change: '+1.4%',
    changeType: 'increase',
    icon: TrendingUp,
  },
];

const recentCampaigns = [
  {
    id: 1,
    name: 'Weekly Newsletter #47',
    sent: '2,340 subscribers',
    openRate: '28.4%',
    status: 'Delivered',
    date: '2 hours ago',
  },
  {
    id: 2,
    name: 'Product Launch Announcement',
    sent: '5,670 subscribers',
    openRate: '31.2%',
    status: 'Delivered',
    date: '1 day ago',
  },
  {
    id: 3,
    name: 'Monthly Roundup',
    sent: '8,920 subscribers',
    openRate: '22.1%',
    status: 'Delivered',
    date: '3 days ago',
  },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your newsletter performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
              <span className="text-sm text-gray-500 ms-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentCampaigns.map((campaign) => (
            <div key={campaign.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{campaign.name}</h3>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Sent to {campaign.sent}</span>
                    <span>•</span>
                    <span>Open rate: {campaign.openRate}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {campaign.status}
                  </span>
                  <span className="text-sm text-gray-500">{campaign.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
