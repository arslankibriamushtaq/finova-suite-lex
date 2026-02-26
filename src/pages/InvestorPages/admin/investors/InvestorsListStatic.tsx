import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Download, 
  Filter, 
  Eye, 
  Edit, 
  UserCheck, 
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  X,
  Trash2,
  Upload,
  FileText,
  Send,
  Shield,
  Settings,
  User,
  Building,
  MapPin,
  Clock
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const investors = [
  {
    id: 1,
    name: 'John Anderson',
    email: 'john.anderson@wealth.com',
    phone: '+1 (555) 123-4567',
    type: 'Individual',
    status: 'Active',
    kycStatus: 'Verified',
    totalInvestment: 2450000,
    portfolioValue: 2890000,
    unrealizedGains: 440000,
    riskProfile: 'Moderate',
    onboardingDate: '2023-01-15',
    lastActivity: '2024-01-20',
    country: 'USA',
    accreditedInvestor: true,
    tags: ['High Value', 'VIP'],
    portfolioAllocation: {
      equity: 60,
      bonds: 30,
      alternatives: 10
    },
    documents: ['KYC Documents', 'Investment Agreement', 'Tax Forms'],
    notes: 'Prefers conservative investments with steady returns'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.com',
    phone: '+1 (555) 234-5678',
    type: 'Corporate',
    status: 'Active',
    kycStatus: 'Verified',
    totalInvestment: 5200000,
    portfolioValue: 6100000,
    unrealizedGains: 900000,
    riskProfile: 'Aggressive',
    onboardingDate: '2023-03-22',
    lastActivity: '2024-01-22',
    country: 'USA',
    accreditedInvestor: true,
    tags: ['Tech Sector', 'Growth Focused'],
    portfolioAllocation: {
      equity: 80,
      bonds: 10,
      alternatives: 10
    },
    documents: ['Corporate Documents', 'Board Resolution', 'Investment Policy'],
    notes: 'Tech executive looking for high-growth opportunities'
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    email: 'michael.r@family.trust',
    phone: '+1 (555) 345-6789',
    type: 'Trust',
    status: 'Pending',
    kycStatus: 'Under Review',
    totalInvestment: 1800000,
    portfolioValue: 1950000,
    unrealizedGains: 150000,
    riskProfile: 'Conservative',
    onboardingDate: '2023-12-10',
    lastActivity: '2024-01-18',
    country: 'USA',
    accreditedInvestor: true,
    tags: ['Family Trust'],
    portfolioAllocation: {
      equity: 40,
      bonds: 50,
      alternatives: 10
    },
    documents: ['Trust Agreement', 'Trustee Authorization'],
    notes: 'Family trust requiring conservative approach'
  },
  {
    id: 4,
    name: 'Goldman Family Office',
    email: 'investments@goldmanfamily.com',
    phone: '+1 (555) 456-7890',
    type: 'Family Office',
    status: 'Active',
    kycStatus: 'Verified',
    totalInvestment: 15600000,
    portfolioValue: 18200000,
    unrealizedGains: 2600000,
    riskProfile: 'Moderate-Aggressive',
    onboardingDate: '2022-11-08',
    lastActivity: '2024-01-21',
    country: 'USA',
    accreditedInvestor: true,
    tags: ['Ultra High Net Worth', 'Family Office'],
    portfolioAllocation: {
      equity: 65,
      bonds: 20,
      alternatives: 15
    },
    documents: ['Family Office Agreement', 'Investment Committee Resolution'],
    notes: 'Sophisticated investor with diverse portfolio needs'
  },
  {
    id: 5,
    name: 'Emma Thompson',
    email: 'emma.thompson@retirement.fund',
    phone: '+1 (555) 567-8901',
    type: 'Institutional',
    status: 'Active',
    kycStatus: 'Verified',
    totalInvestment: 8900000,
    portfolioValue: 9800000,
    unrealizedGains: 900000,
    riskProfile: 'Conservative',
    onboardingDate: '2023-06-14',
    lastActivity: '2024-01-19',
    country: 'USA',
    accreditedInvestor: true,
    tags: ['Pension Fund', 'ESG Focused'],
    portfolioAllocation: {
      equity: 45,
      bonds: 45,
      alternatives: 10
    },
    documents: ['Fund Documents', 'ESG Policy', 'Investment Guidelines'],
    notes: 'Pension fund with strong ESG requirements'
  },
];

const investorTypes = ['All Types', 'Individual', 'Corporate', 'Trust', 'Family Office', 'Institutional'];
const statusOptions = ['All Status', 'Active', 'Pending', 'Suspended', 'Inactive'];
const kycStatusOptions = ['All KYC', 'Verified', 'Under Review', 'Pending', 'Rejected'];

export default function InvestorsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [kycFilter, setKycFilter] = useState('All KYC');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All Types' || investor.type === typeFilter;
    const matchesStatus = statusFilter === 'All Status' || investor.status === statusFilter;
    const matchesKyc = kycFilter === 'All KYC' || investor.kycStatus === kycFilter;
    return matchesSearch && matchesType && matchesStatus && matchesKyc;
  });

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
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-gray-100 text-gray-900';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Action Handlers
  const handleViewInvestor = (investor: any) => {
    setSelectedInvestor(investor);
    setShowViewModal(true);
  };

  const handleEditInvestor = (investor: any) => {
    setSelectedInvestor(investor);
    setShowEditModal(true);
  };

  const handleDeleteInvestor = (investor: any) => {
    setSelectedInvestor(investor);
    setShowDeleteModal(true);
  };

  const handleViewDocuments = (investor: any) => {
    setSelectedInvestor(investor);
    setShowDocumentsModal(true);
  };

  const handleViewNotes = (investor: any) => {
    setSelectedInvestor(investor);
    setShowNotesModal(true);
  };

  const handleKycReview = (investor: any) => {
    setSelectedInvestor(investor);
    setShowKycModal(true);
  };

  const handleViewPortfolio = (investor: any) => {
    setSelectedInvestor(investor);
    setShowPortfolioModal(true);
  };

  const handleCreateInvestor = () => {
    alert('New investor created successfully!');
    setShowCreateModal(false);
  };

  const handleUpdateInvestor = () => {
    alert('Investor updated successfully!');
    setShowEditModal(false);
    setSelectedInvestor(null);
  };

  const confirmDeleteInvestor = () => {
    alert(`Investor ${selectedInvestor?.name} deleted successfully!`);
    setShowDeleteModal(false);
    setSelectedInvestor(null);
  };

  const handleSendStatement = (investor: any) => {
    alert(`Statement sent to ${investor.email}`);
  };

  const handleExportData = () => {
    alert('Investor data exported successfully!');
  };

  const handleImportData = () => {
    alert('Import data functionality initiated');
  };

  const handleBulkAction = (action: string) => {
    alert(`Bulk ${action} action performed`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investors</h1>
            <p className="text-gray-600">Manage and oversee all investor accounts</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleImportData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
            <button 
              onClick={handleExportData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
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
              <p className="text-xs text-green-600 mt-1">+8.2% this month</p>
            </div>
            <UserCheck className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Investors</p>
              <p className="text-2xl font-bold text-gray-900">1,189</p>
              <p className="text-xs text-gray-500 mt-1">95.3% of total</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total AUM</p>
              <p className="text-2xl font-bold text-gray-900">$2.4B</p>
              <p className="text-xs text-green-600 mt-1">+12.3% this quarter</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending KYC</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-xs text-yellow-600 mt-1">Requires review</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64"
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
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {kycStatusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredInvestors.length} of {investors.length} investors
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portfolio Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unrealized Gains
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
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
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                        <span className="text-sm font-medium text-gray-700">
                          {investor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{investor.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {investor.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {investor.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{investor.type}</span>
                      <div className="mt-1">
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(investor.status))}>
                          {investor.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(investor.portfolioValue)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Invested: {formatCurrency(investor.totalInvestment)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(investor.unrealizedGains)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {(((investor.portfolioValue - investor.totalInvestment) / investor.totalInvestment) * 100).toFixed(1)}% return
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      investor.riskProfile.includes('Conservative') ? 'bg-green-100 text-green-800' :
                      investor.riskProfile.includes('Moderate') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {investor.riskProfile}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getKycStatusColor(investor.kycStatus))}>
                      {investor.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(investor.lastActivity).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewInvestor(investor)}
                        className="text-black hover:text-blue-900" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditInvestor(investor)}
                        className="text-gray-600 hover:text-gray-900" 
                        title="Edit Investor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleViewDocuments(investor)}
                        className="text-purple-600 hover:text-purple-900" 
                        title="View Documents"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSendStatement(investor)}
                        className="text-green-600 hover:text-green-900" 
                        title="Send Statement"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteInvestor(investor)}
                        className="text-red-600 hover:text-red-900" 
                        title="Delete Investor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing 1 to {filteredInvestors.length} of {investors.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>

      {/* Create Investor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Investor</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investor Type *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    <option value="">Select type</option>
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Trust">Trust</option>
                    <option value="Family Office">Family Office</option>
                    <option value="Institutional">Institutional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Profile</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    <option value="Conservative">Conservative</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Moderate-Aggressive">Moderate-Aggressive</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    placeholder="Enter country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Investment Amount</label>
                <input
                  type="number"
                  placeholder="Enter initial investment amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  placeholder="Add any notes about the investor"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 mr-3" />
                  <span className="text-sm text-gray-700">Accredited Investor</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 mr-3" defaultChecked />
                  <span className="text-sm text-gray-700">Send welcome email</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 mr-3" />
                  <span className="text-sm text-gray-700">Require KYC completion</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateInvestor}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  Create Investor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Investor Modal */}
      {showViewModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Investor Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvestor.status)}`}>
                    {selectedInvestor.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKycStatusColor(selectedInvestor.kycStatus)}`}>
                    {selectedInvestor.kycStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Profile</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.riskProfile}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Investment</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvestor.totalInvestment)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Value</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvestor.portfolioValue)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unrealized Gains</label>
                  <p className="text-sm text-green-600">{formatCurrency(selectedInvestor.unrealizedGains)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedInvestor.onboardingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Activity</label>
                  <p className="text-sm text-gray-900">{new Date(selectedInvestor.lastActivity).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accredited Investor</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.accreditedInvestor ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {selectedInvestor.tags.map((tag: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Allocation</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedInvestor.portfolioAllocation.equity}%</div>
                    <div className="text-sm text-gray-500">Equity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedInvestor.portfolioAllocation.bonds}%</div>
                    <div className="text-sm text-gray-500">Bonds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedInvestor.portfolioAllocation.alternatives}%</div>
                    <div className="text-sm text-gray-500">Alternatives</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-sm text-gray-900">{selectedInvestor.notes}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditInvestor(selectedInvestor);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                Edit Investor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Investor</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>{selectedInvestor.name}</strong>? This action cannot be undone and will remove all associated data.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteInvestor}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Investor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
