import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Plus,
  MoreHorizontal
} from 'lucide-react';

// Mock data - in real app, this would come from API
const investorData = {
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
  realizedGains: 125000,
  riskProfile: 'Moderate',
  onboardingDate: '2023-01-15',
  lastActivity: '2024-01-20',
  country: 'USA',
  address: {
    street: '123 Wealth Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  accreditedInvestor: true,
  tags: ['idet.tag.highValue', 'idet.tag.vip'],
  portfolioAllocation: {
    equity: 60,
    bonds: 30,
    alternatives: 10
  },
  investments: [
    {
      id: 1,
      productName: 'Large Cap Growth Fund',
      investmentAmount: 500000,
      currentValue: 580000,
      unrealizedGain: 80000,
      units: 4545.45,
      investmentDate: '2023-01-20',
      performanceYTD: '+16.2%'
    },
    {
      id: 2,
      productName: 'Fixed Income Plus',
      investmentAmount: 800000,
      currentValue: 850000,
      unrealizedGain: 50000,
      units: 8500.00,
      investmentDate: '2023-02-15',
      performanceYTD: '+6.25%'
    },
    {
      id: 3,
      productName: 'Real Estate Investment Trust',
      investmentAmount: 600000,
      currentValue: 720000,
      unrealizedGain: 120000,
      units: 2400.00,
      investmentDate: '2023-03-10',
      performanceYTD: '+20.0%'
    },
    {
      id: 4,
      productName: 'Alternative Investment Fund',
      investmentAmount: 550000,
      currentValue: 740000,
      unrealizedGain: 190000,
      units: 550.00,
      investmentDate: '2023-06-01',
      performanceYTD: '+34.5%'
    },
  ],
  transactions: [
    {
      id: 1,
      type: 'Investment',
      product: 'Large Cap Growth Fund',
      amount: 500000,
      date: '2023-01-20',
      status: 'Completed',
      reference: 'INV-2023-001'
    },
    {
      id: 2,
      type: 'Dividend',
      product: 'Fixed Income Plus',
      amount: 15000,
      date: '2023-12-31',
      status: 'Completed',
      reference: 'DIV-2023-Q4-002'
    },
    {
      id: 3,
      type: 'Investment',
      product: 'Alternative Investment Fund',
      amount: 250000,
      date: '2024-01-15',
      status: 'Pending',
      reference: 'INV-2024-003'
    }
  ],
  documents: [
    {
      id: 1,
      name: 'Passport Copy',
      type: 'Identity',
      uploadDate: '2023-01-10',
      status: 'Verified'
    },
    {
      id: 2,
      name: 'Bank Statement',
      type: 'Financial',
      uploadDate: '2023-01-12',
      status: 'Verified'
    },
    {
      id: 3,
      name: 'Proof of Address',
      type: 'Address',
      uploadDate: '2023-01-14',
      status: 'Verified'
    }
  ]
};

export default function InvestorDetail() {
  const { t } = useTranslation('investor');
  const statusKey: Record<string, string> = { 'Active': 'idet.status.active', 'Pending': 'idet.status.pending', 'Suspended': 'idet.status.suspended', 'Inactive': 'idet.status.inactive' };
  const riskKey: Record<string, string> = { 'Conservative': 'idet.risk.conservative', 'Moderate': 'idet.risk.moderate', 'Aggressive': 'idet.risk.aggressive' };
  const tStatus = (v: string) => (statusKey[v] ? t(statusKey[v]) : v);
  const tRisk = (v: string) => (riskKey[v] ? t(riskKey[v]) : v);
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

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
      case 'Active': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', name: t('idet.tab.overview') },
    { id: 'investments', name: t('idet.tab.investments') },
    { id: 'transactions', name: t('idet.tab.transactions') },
    { id: 'documents', name: t('idet.tab.documents') },
    { id: 'activity', name: t('idet.tab.activity') },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            to="/admin/investors"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 me-2" />
            {t('kycd.backToInvestors')}
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-gray-700">
                {investorData.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{investorData.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(investorData.status)}`}>
                  {tStatus(investorData.status)}
                </span>
                <span className="text-sm text-gray-500">{t('idet.typeInvestor', { type: t('ai.type.individual') })}</span>
                <span className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 me-1 text-red-500" />
                  {t('idet.kycVerified')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 me-2" />
              {t('common:export')}
            </button>
            <Link
              to={`/admin/investors/${id}?edit=true`}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Edit className="w-4 h-4 me-2" />
              {t('common:edit')}
            </Link>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('idet.portfolioValue')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(investorData.portfolioValue)}</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 me-1" />
                {t('idet.overallPlus')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('idet.totalInvestment')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(investorData.totalInvestment)}</p>
              <p className="text-sm text-gray-500 mt-1">{t('idet.acrossProducts')}</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-700" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('idet.unrealizedGains')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(investorData.unrealizedGains)}</p>
              <p className="text-sm text-red-600 mt-1">{t('idet.unrealizedPlus')}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('idet.realizedGains')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(investorData.realizedGains)}</p>
              <p className="text-sm text-gray-500 mt-1">{t('idet.lifetimeGains')}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('idet.contactInfo')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">{t('idet.email')}</p>
              <p className="text-sm font-medium text-gray-900">{investorData.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">{t('idet.phone')}</p>
              <p className="text-sm font-medium text-gray-900">{investorData.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">{t('idet.address')}</p>
              <p className="text-sm font-medium text-gray-900">
                {investorData.address.city}, {investorData.address.state} {investorData.address.zipCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-gray-700 text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Allocation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('idet.portfolioAllocation')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{t('idet.equity')}</span>
                <span className="text-sm text-gray-500">{investorData.portfolioAllocation.equity}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full" 
                  style={{ width: `${investorData.portfolioAllocation.equity}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{t('idet.bonds')}</span>
                <span className="text-sm text-gray-500">{investorData.portfolioAllocation.bonds}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${investorData.portfolioAllocation.bonds}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{t('idet.alternatives')}</span>
                <span className="text-sm text-gray-500">{investorData.portfolioAllocation.alternatives}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${investorData.portfolioAllocation.alternatives}%` }}
                />
              </div>
            </div>
          </div>

          {/* Investor Profile */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('idet.investorProfile')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('idet.riskProfileLabel')}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {tRisk(investorData.riskProfile)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('idet.accreditedInvestor')}</span>
                <span className="text-sm font-medium text-red-600">
                  {investorData.accreditedInvestor ? t('common:yes') : t('common:no')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('idet.onboardingDate')}</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(investorData.onboardingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('idet.lastActivity')}</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(investorData.lastActivity).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-2">{t('idet.tags')}</span>
                <div className="flex space-x-2">
                  {investorData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                      {t(tag)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'investments' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('idet.investmentHoldings')}</h3>
            <Link
              to={`/admin/investments/new?investor=${id}`}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 me-2" />
              {t('idet.addInvestment')}
            </Link>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.product')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.investment')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.currentValue')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.gainLoss')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.performance')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.units')}
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">{t('common:actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investorData.investments.map((investment) => (
                <tr key={investment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{investment.productName}</div>
                      <div className="text-sm text-gray-500">
                        {t('idet.investedLabel', { date: new Date(investment.investmentDate).toLocaleDateString() })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(investment.investmentAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(investment.currentValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-red-500 me-1" />
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(investment.unrealizedGain)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-red-600">
                      {investment.performanceYTD}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {investment.units.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <Link 
                      to={`/admin/investments/${investment.id}/adjust`}
                      className="text-black hover:text-blue-900"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('idet.transactionHistory')}</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:type')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.product')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.amount')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.date')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.reference')}
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">{t('common:actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investorData.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'Investment' ? 'bg-gray-100 text-gray-900' :
                      transaction.type === 'Dividend' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`idet.txType.${transaction.type}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'Completed' ? 'bg-red-100 text-red-800' :
                      transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t(`idet.txStatus.${transaction.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <button className="text-black hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('idet.kycDocuments')}</h3>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
              <Plus className="w-4 h-4 me-2" />
              {t('idet.uploadDocument')}
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.document')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:type')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idet.col.uploadDate')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:status')}
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">{t('common:actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investorData.documents.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {document.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {t(`idet.docType.${document.type}`)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(document.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      document.status === 'Verified' ? 'bg-red-100 text-red-800' :
                      document.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t(`idet.docStatus.${document.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-black hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('idet.activityLog')}</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-gray-700 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t('idet.act1')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('idet.act1Date')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t('idet.act2')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('idet.act2Date')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t('idet.act3')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('idet.act3Date')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
