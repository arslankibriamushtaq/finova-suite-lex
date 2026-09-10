import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// Mock data for risk profiles
const customerRiskProfiles = [
  {
    id: 'CRP-001',
    name: 'rp.crp.low.name',
    description: 'rp.crp.low.desc',
    creditScoreMin: 700,
    creditScoreMax: 850,
    defaultRate: 0.5,
    volatility: 2.1,
    suggestedRateUplift: 0.5,
    parameters: {
      maxLoanAmount: 500000,
      maxTenure: 36,
      collateralRequired: false
    }
  },
  {
    id: 'CRP-002',
    name: 'rp.crp.medium.name',
    description: 'rp.crp.medium.desc',
    creditScoreMin: 600,
    creditScoreMax: 699,
    defaultRate: 2.8,
    volatility: 5.2,
    suggestedRateUplift: 1.5,
    parameters: {
      maxLoanAmount: 300000,
      maxTenure: 24,
      collateralRequired: true
    }
  },
  {
    id: 'CRP-003',
    name: 'rp.crp.high.name',
    description: 'rp.crp.high.desc',
    creditScoreMin: 500,
    creditScoreMax: 599,
    defaultRate: 5.5,
    volatility: 8.9,
    suggestedRateUplift: 3.0,
    parameters: {
      maxLoanAmount: 150000,
      maxTenure: 12,
      collateralRequired: true
    }
  }
];

const investorRiskProfiles = [
  {
    id: 'IRP-001',
    name: 'rp.irp.conservative.name',
    description: 'rp.irp.conservative.desc',
    riskTolerance: 'Low',
    expectedReturn: 8.5,
    maxExposure: 15,
    preferredCustomerRisks: ['Low Risk (0-30)'],
    parameters: {
      minInvestment: 1000000,
      maxSingleLoanExposure: 5,
      liquidityRequirement: 20
    }
  },
  {
    id: 'IRP-002',
    name: 'rp.irp.balanced.name',
    description: 'rp.irp.balanced.desc',
    riskTolerance: 'Medium',
    expectedReturn: 12.2,
    maxExposure: 25,
    preferredCustomerRisks: ['Low Risk (0-30)', 'Medium Risk (31-70)'],
    parameters: {
      minInvestment: 500000,
      maxSingleLoanExposure: 8,
      liquidityRequirement: 15
    }
  },
  {
    id: 'IRP-003',
    name: 'rp.irp.aggressive.name',
    description: 'rp.irp.aggressive.desc',
    riskTolerance: 'High',
    expectedReturn: 18.7,
    maxExposure: 40,
    preferredCustomerRisks: ['Medium Risk (31-70)', 'High Risk (71-100)'],
    parameters: {
      minInvestment: 250000,
      maxSingleLoanExposure: 12,
      liquidityRequirement: 10
    }
  }
];

export default function RiskProfiles() {
  const { t } = useTranslation('investor');
  const tolKey: Record<string, string> = { 'Low': 'rp.risk.low', 'Medium': 'rp.risk.medium', 'High': 'rp.risk.high' };
  const tTol = (v: string) => (tolKey[v] ? t(tolKey[v]) : v);
  const [activeTab, setActiveTab] = useState('customer');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleCreateProfile = () => {
    alert(t('rp.createdSuccess'));
    setShowCreateModal(false);
  };

  const handleEditProfile = (profile: any) => {
    setSelectedProfile(profile);
    setShowEditModal(true);
  };

  const handleUpdateProfile = () => {
    alert(t('rp.updatedSuccess'));
    setShowEditModal(false);
    setSelectedProfile(null);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm(t('rp.deleteConfirm'))) {
      alert(t('rp.deletedSuccess', { id: profileId }));
    }
  };

  const handleImportProfiles = () => {
    alert(t('rp.importedSuccess'));
    setShowImportModal(false);
  };

  const handleExportProfiles = () => {
    alert(t('rp.exporting'));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/InvestorDashboard/AllocationEngine"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 me-2" />
              {t('sl.backToDashboard')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('rp.title')}</h1>
              <p className="text-gray-600">{t('rp.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 me-2" />
              {t('rp.importCsv')}
            </button>
            <button
              onClick={handleExportProfiles}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 me-2" />
              {t('common:export')}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 me-2" />
              {t('rp.createProfile')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('customer')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customer'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Shield className="w-4 h-4 me-2" />
              {t('rp.tab.customer')}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('investor')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'investor'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Target className="w-4 h-4 me-2" />
              {t('rp.tab.investor')}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mapping'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 me-2" />
              {t('rp.tab.mapping')}
            </div>
          </button>
        </nav>
      </div>

      {/* Customer Risk Profiles Tab */}
      {activeTab === 'customer' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('rp.customerTitle')}</h3>
            <p className="text-sm text-gray-600">{t('rp.customerSubtitle')}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.profile')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.creditRange')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.defaultRate')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.volatility')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.rateUplift')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.maxLoan')}</th>
                  <th className="relative px-6 py-3"><span className="sr-only">{t('common:actions')}</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerRiskProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{t(profile.name)}</div>
                        <div className="text-sm text-gray-500">{t(profile.description)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profile.creditScoreMin} - {profile.creditScoreMax}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        profile.defaultRate <= 1 ? 'text-red-600' :
                        profile.defaultRate <= 3 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {profile.defaultRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profile.volatility}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      +{profile.suggestedRateUplift}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                        notation: 'compact'
                      }).format(profile.parameters.maxLoanAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditProfile(profile)}
                          className="text-black hover:text-blue-900"
                          title={t('rp.editProfile')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="text-red-600 hover:text-red-900"
                          title={t('rp.deleteProfile')}
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
      )}

      {/* Investor Risk Profiles Tab */}
      {activeTab === 'investor' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('rp.investorTitle')}</h3>
            <p className="text-sm text-gray-600">{t('rp.investorSubtitle')}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.profile')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.riskTolerance')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.expectedReturn')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.maxExposure')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.minInvestment')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rp.col.preferredRisks')}</th>
                  <th className="relative px-6 py-3"><span className="sr-only">{t('common:actions')}</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investorRiskProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{t(profile.name)}</div>
                        <div className="text-sm text-gray-500">{t(profile.description)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.riskTolerance === 'Low' ? 'bg-red-100 text-red-800' :
                        profile.riskTolerance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tTol(profile.riskTolerance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {profile.expectedReturn}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profile.maxExposure}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                        notation: 'compact'
                      }).format(profile.parameters.minInvestment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {profile.preferredCustomerRisks.map((risk, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                            {tTol(risk.split(' ')[0])}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditProfile(profile)}
                          className="text-black hover:text-blue-900"
                          title={t('rp.editProfile')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="text-red-600 hover:text-red-900"
                          title={t('rp.deleteProfile')}
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
      )}

      {/* Risk Mapping Tab */}
      {activeTab === 'mapping' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('rp.mappingTitle')}</h3>
            <p className="text-sm text-gray-600">{t('rp.mappingSubtitle')}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-start text-sm font-medium text-gray-900">{t('rp.map.investorTolerance')}</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">{t('rp.map.lowCustomers')}</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">{t('rp.map.mediumCustomers')}</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">{t('rp.map.highCustomers')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investorRiskProfiles.map((investor) => (
                  <tr key={investor.id}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      <div>
                        <div>{t(investor.name)}</div>
                        <div className="text-xs text-gray-500">{t('rp.toleranceLabel', { tolerance: tTol(investor.riskTolerance) })}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        defaultChecked={investor.preferredCustomerRisks.some(risk => risk.includes('Low'))}
                        className="rounded border-gray-300 text-black focus:ring-gray-500"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        defaultChecked={investor.preferredCustomerRisks.some(risk => risk.includes('Medium'))}
                        className="rounded border-gray-300 text-black focus:ring-gray-500"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        defaultChecked={investor.preferredCustomerRisks.some(risk => risk.includes('High'))}
                        className="rounded border-gray-300 text-black focus:ring-gray-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => alert(t('rp.mappingSaved'))}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Save className="w-4 h-4 me-2" />
              {t('rp.saveMapping')}
            </button>
          </div>
        </div>
      )}

      {/* Create Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('rp.createModalTitle')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('rp.profileType')}</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                  <option value="customer">{t('rp.customerProfileOpt')}</option>
                  <option value="investor">{t('rp.investorProfileOpt')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('rp.profileName')}</label>
                <input
                  type="text"
                  placeholder={t('rp.enterName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('rp.description')}</label>
                <textarea
                  placeholder={t('rp.describeProfile')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('rp.defaultRatePct')}</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('rp.volatilityPct')}</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common:cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleCreateProfile}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  {t('rp.createProfile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('rp.importModalTitle')}</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('rp.uploadCsv')}</label>
                <input
                  type="file"
                  accept=".csv"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  {t('rp.csvHint')}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common:cancel')}
                </button>
                <button
                  onClick={handleImportProfiles}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  {t('rp.import')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
