import { useState } from 'react';
import { Search, Plus, MoreHorizontal, Download, Filter, Eye, Edit, UserCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

const investors = [
  {
    id: 1,
    name: 'John Anderson',
    email: 'john.anderson@wealth.com',
    type: 'Individual',
    status: 'Active',
    totalInvestment: '$2,450,000',
    portfolioValue: '$2,890,000',
    riskProfile: 'Moderate',
    onboardingDate: '2023-01-15',
    lastActivity: '2024-01-20',
    kycStatus: 'Verified'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.com',
    type: 'Corporate',
    status: 'Active',
    totalInvestment: '$5,200,000',
    portfolioValue: '$6,100,000',
    riskProfile: 'Aggressive',
    onboardingDate: '2023-03-22',
    lastActivity: '2024-01-22',
    kycStatus: 'Verified'
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    email: 'michael.r@family.trust',
    type: 'Trust',
    status: 'Pending',
    totalInvestment: '$1,800,000',
    portfolioValue: '$1,950,000',
    riskProfile: 'Conservative',
    onboardingDate: '2023-12-10',
    lastActivity: '2024-01-18',
    kycStatus: 'Under Review'
  },
  {
    id: 4,
    name: 'Goldman Family Office',
    email: 'investments@goldmanfamily.com',
    type: 'Family Office',
    status: 'Active',
    totalInvestment: '$15,600,000',
    portfolioValue: '$18,200,000',
    riskProfile: 'Moderate-Aggressive',
    onboardingDate: '2022-11-08',
    lastActivity: '2024-01-21',
    kycStatus: 'Verified'
  },
  {
    id: 5,
    name: 'Emma Thompson',
    email: 'emma.thompson@retirement.fund',
    type: 'Institutional',
    status: 'Active',
    totalInvestment: '$8,900,000',
    portfolioValue: '$9,800,000',
    riskProfile: 'Conservative',
    onboardingDate: '2023-06-14',
    lastActivity: '2024-01-19',
    kycStatus: 'Verified'
  },
];

const investorTypes = ['All Types', 'Individual', 'Corporate', 'Trust', 'Family Office', 'Institutional'];
const statusOptions = ['All Status', 'Active', 'Pending', 'Suspended', 'Inactive'];

export default function InvestorManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All Types' || investor.type === typeFilter;
    const matchesStatus = statusFilter === 'All Status' || investor.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investor Management</h1>
            <p className="text-gray-600">Manage and oversee all investor accountsss</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 me-2" />
              Export Data
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
              <Plus className="w-4 h-4 me-2" />
              Add Investor
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Investors</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <UserCheck className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Investors</p>
              <p className="text-2xl font-bold text-gray-900">1,189</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total AUM</p>
              <p className="text-2xl font-bold text-gray-900">$2.4B</p>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending KYC</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search investors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {investorTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 me-2" />
            More Filters
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredInvestors.length} of {investors.length} investors
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investor
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investment
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                Portfolio Value
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Profile
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                KYC Status
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvestors.map((investor) => (
              <tr key={investor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{investor.name}</div>
                    <div className="text-sm text-gray-500">{investor.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {investor.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      investor.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : investor.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    )}
                  >
                    {investor.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {investor.totalInvestment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {investor.portfolioValue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {investor.riskProfile}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      investor.kycStatus === 'Verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    )}
                  >
                    {investor.kycStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-black hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
