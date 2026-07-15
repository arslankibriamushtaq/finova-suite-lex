import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Target,
  Users,
  DollarSign,
  Shield,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';

interface StrategyFormData {
  name: string;
  description: string;
  status: 'Draft' | 'Published';
  productModels: string[];
  regions: string[];
  customerRiskProfiles: string[];
  investorRiskMapping: Record<string, string[]>;
  minMaxExposure: Record<string, { min: number; max: number }>;
  rules: any[];
  weights: Record<string, number>;
  globalCaps: {
    maxExposurePerInvestor: number;
    maxProductExposure: number;
  };
  runBehavior: 'realtime' | 'batch' | 'manual';
  scheduleFrequency: string;
  notifications: {
    allocationFailure: boolean;
    exposureThreshold: boolean;
    manualApproval: boolean;
  };
}

const productModels = ['POS Loans V1', 'Auto Loans V2', 'MSME Working Capital', 'Consumer Loans', 'Real Estate Financing'];
const regions = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'All Regions'];
const customerRiskProfiles = ['Low (0-30)', 'Medium (31-70)', 'High (71-100)', 'Custom'];
const investorToleranceLevels = ['Conservative', 'Balanced', 'Aggressive'];

const ruleTypes = [
  {
    id: 'risk_match',
    name: 'cs.rule.riskMatch.name',
    description: 'cs.rule.riskMatch.desc',
    detailedDescription: 'cs.rule.riskMatch.detail',
    icon: Shield
  },
  {
    id: 'priority_rate',
    name: 'cs.rule.priorityRate.name',
    description: 'cs.rule.priorityRate.desc',
    detailedDescription: 'cs.rule.priorityRate.detail',
    icon: DollarSign
  },
  {
    id: 'capacity_limit',
    name: 'cs.rule.capacityLimit.name',
    description: 'cs.rule.capacityLimit.desc',
    detailedDescription: 'cs.rule.capacityLimit.detail',
    icon: Target
  },
  {
    id: 'liquidity_reserve',
    name: 'cs.rule.liquidityReserve.name',
    description: 'cs.rule.liquidityReserve.desc',
    detailedDescription: 'cs.rule.liquidityReserve.detail',
    icon: Shield
  },
  {
    id: 'whitelist_blacklist',
    name: 'cs.rule.whitelistBlacklist.name',
    description: 'cs.rule.whitelistBlacklist.desc',
    detailedDescription: 'cs.rule.whitelistBlacklist.detail',
    icon: Users
  },
  {
    id: 'product_eligibility',
    name: 'cs.rule.productEligibility.name',
    description: 'cs.rule.productEligibility.desc',
    detailedDescription: 'cs.rule.productEligibility.detail',
    icon: Settings
  },
  {
    id: 'min_balance',
    name: 'cs.rule.minBalance.name',
    description: 'cs.rule.minBalance.desc',
    detailedDescription: 'cs.rule.minBalance.detail',
    icon: DollarSign
  },
  {
    id: 'manual_override',
    name: 'cs.rule.manualOverride.name',
    description: 'cs.rule.manualOverride.desc',
    detailedDescription: 'cs.rule.manualOverride.detail',
    icon: AlertTriangle
  }
];

export default function CreateStrategy() {
  const navigate = useNavigate();
  const { t } = useTranslation('investor');
  const productNameKey: Record<string, string> = { 'POS Loans V1': 'cs.product.pos', 'Auto Loans V2': 'cs.product.auto', 'MSME Working Capital': 'cs.product.msme', 'Consumer Loans': 'cs.product.consumer', 'Real Estate Financing': 'cs.product.realEstate' };
  const tProduct = (v: string) => (productNameKey[v] ? t(productNameKey[v]) : v);
  const tProductDesc = (v: string) => {
    if (v.includes('POS')) return t('cs.productDesc.pos');
    if (v.includes('Auto')) return t('cs.productDesc.auto');
    if (v.includes('MSME')) return t('cs.productDesc.msme');
    if (v.includes('Consumer')) return t('cs.productDesc.consumer');
    if (v.includes('Real Estate')) return t('cs.productDesc.realEstate');
    return '';
  };
  const regionNameKey: Record<string, string> = { 'Riyadh': 'cs.region.riyadh', 'Jeddah': 'cs.region.jeddah', 'Dammam': 'cs.region.dammam', 'Mecca': 'cs.region.mecca', 'Medina': 'cs.region.medina', 'All Regions': 'cs.region.all' };
  const tRegion = (v: string) => (regionNameKey[v] ? t(regionNameKey[v]) : v);
  const regionDescKey: Record<string, string> = { 'All Regions': 'cs.regionDesc.all', 'Riyadh': 'cs.regionDesc.riyadh', 'Jeddah': 'cs.regionDesc.jeddah', 'Dammam': 'cs.regionDesc.dammam', 'Mecca': 'cs.regionDesc.mecca', 'Medina': 'cs.regionDesc.medina' };
  const tRegionDesc = (v: string) => (regionDescKey[v] ? t(regionDescKey[v]) : '');
  const profileNameKey: Record<string, string> = { 'Low (0-30)': 'cs.profile.low', 'Medium (31-70)': 'cs.profile.medium', 'High (71-100)': 'cs.profile.high', 'Custom': 'cs.profile.custom' };
  const tProfile = (v: string) => (profileNameKey[v] ? t(profileNameKey[v]) : v);
  const tProfileDesc = (v: string) => {
    if (v.includes('Low')) return t('cs.profileDesc.low');
    if (v.includes('Medium')) return t('cs.profileDesc.medium');
    if (v.includes('High')) return t('cs.profileDesc.high');
    if (v.includes('Custom')) return t('cs.profileDesc.custom');
    return '';
  };
  const toleranceNameKey: Record<string, string> = { 'Conservative': 'cs.tolerance.conservative', 'Balanced': 'cs.tolerance.balanced', 'Aggressive': 'cs.tolerance.aggressive' };
  const tTolerance = (v: string) => (toleranceNameKey[v] ? t(toleranceNameKey[v]) : v);
  const toleranceDescKey: Record<string, string> = { 'Conservative': 'cs.toleranceDesc.conservative', 'Balanced': 'cs.toleranceDesc.balanced', 'Aggressive': 'cs.toleranceDesc.aggressive' };
  const tToleranceDesc = (v: string) => (toleranceDescKey[v] ? t(toleranceDescKey[v]) : '');
  const bandNameKey: Record<string, string> = { 'Low': 'cs.band.low', 'Medium': 'cs.band.medium', 'High': 'cs.band.high' };
  const tBand = (v: string) => (bandNameKey[v] ? t(bandNameKey[v]) : v);
  const bandDescKey: Record<string, string> = { 'Low': 'cs.bandDesc.low', 'Medium': 'cs.bandDesc.medium', 'High': 'cs.bandDesc.high' };
  const tBandDesc = (v: string) => (bandDescKey[v] ? t(bandDescKey[v]) : '');
  const tRuleName = (type: string) => { const rt = ruleTypes.find(r => r.id === type); return rt ? t(rt.name) : ''; };
  const tStatusReview = (v: string) => t(v === 'Published' ? 'cs.status.published' : 'cs.status.draft');
  const tRunBehaviorShort = (v: string) => t(v === 'realtime' ? 'cs.runBehaviorShort.realtime' : v === 'batch' ? 'cs.runBehaviorShort.batch' : 'cs.runBehaviorShort.manual');
  const tFreqShort = (v: string) => { const m: Record<string, string> = { immediate: 'cs.freqShort.immediate', hourly: 'cs.freqShort.hourly', every_4h: 'cs.freqShort.every_4h', daily: 'cs.freqShort.daily', weekly: 'cs.freqShort.weekly', monthly: 'cs.freqShort.monthly' }; return m[v] ? t(m[v]) : v; };
  const tRounding = (v: string) => { const m: Record<string, string> = { up: 'cs.s4.roundUp', down: 'cs.s4.roundDown', nearest: 'cs.s4.roundNearest' }; return m[v] ? t(m[v]) : t('cs.s4.roundNearest'); };
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StrategyFormData>({
    name: '',
    description: '',
    status: 'Draft',
    productModels: [],
    regions: [],
    customerRiskProfiles: [],
    investorRiskMapping: {},
    minMaxExposure: {},
    rules: [],
    weights: {},
    globalCaps: {
      maxExposurePerInvestor: 25,
      maxProductExposure: 40
    },
    runBehavior: 'realtime',
    scheduleFrequency: 'immediate',
    notifications: {
      allocationFailure: true,
      exposureThreshold: true,
      manualApproval: true
    }
  });

  const totalSteps = 6;

  const updateFormData = (updates: Partial<StrategyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateRuleConfig = (ruleId: string, config: any) => {
    const updatedRules = formData.rules.map(rule =>
      rule.id === ruleId ? { ...rule, config: { ...rule.config, ...config } } : rule
    );
    updateFormData({ rules: updatedRules });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    alert(t('cs.toast.draftSaved'));
    navigate('/admin/allocation/strategies');
  };

  const handlePublish = () => {
    if (confirm(t('cs.confirm.publish'))) {
      alert(t('cs.toast.published'));
      navigate('/admin/allocation/strategies');
    }
  };

  const addRule = (ruleType: string) => {
    const newRule = {
      id: Date.now().toString(),
      type: ruleType,
      config: {},
      priority: formData.rules.length + 1
    };
    updateFormData({ rules: [...formData.rules, newRule] });
  };

  const removeRule = (ruleId: string) => {
    updateFormData({ 
      rules: formData.rules.filter(rule => rule.id !== ruleId) 
    });
  };

  const moveRule = (ruleId: string, direction: 'up' | 'down') => {
    const rules = [...formData.rules];
    const index = rules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;

    [rules[index], rules[newIndex]] = [rules[newIndex], rules[index]];
    updateFormData({ rules });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('cs.s1.title')}</h3>
              <p className="text-sm text-gray-600 mt-1">{t('cs.s1.subtitle')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s1.nameLabel')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder={t('cs.s1.namePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{t('cs.s1.nameHelp')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s1.descLabel')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder={t('cs.s1.descPlaceholder')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{t('cs.s1.descHelp')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s1.statusLabel')}</label>
              <select
                value={formData.status}
                onChange={(e) => updateFormData({ status: e.target.value as 'Draft' | 'Published' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="Draft">{t('cs.s1.statusDraftOpt')}</option>
                <option value="Published">{t('cs.s1.statusPublishedOpt')}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.status === 'Draft'
                  ? t('cs.s1.statusDraftHelp')
                  : t('cs.s1.statusPublishedHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s1.productsLabel')}</label>
              <p className="text-xs text-gray-600 mb-3">{t('cs.s1.productsHelp')}</p>
              <div className="grid grid-cols-1 gap-3">
                {productModels.map((product) => (
                  <label key={product} className="flex items-center p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.productModels.includes(product)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ productModels: [...formData.productModels, product] });
                        } else {
                          updateFormData({ productModels: formData.productModels.filter(p => p !== product) });
                        }
                      }}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 me-3"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 font-medium">{tProduct(product)}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {tProductDesc(product)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {formData.productModels.length === 0 && (
                <div className="text-xs text-red-600 mt-2">{t('cs.s1.productsWarn')}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s1.geoLabel')}</label>
              <p className="text-xs text-gray-600 mb-3">{t('cs.s1.geoHelp')}</p>
              <div className="grid grid-cols-2 gap-3">
                {regions.map((region) => (
                  <label key={region} className="flex items-center p-2 bg-gray-50 rounded border hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.regions.includes(region)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ regions: [...formData.regions, region] });
                        } else {
                          updateFormData({ regions: formData.regions.filter(r => r !== region) });
                        }
                      }}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 me-2"
                    />
                    <div>
                      <span className="text-sm text-gray-700 font-medium">{tRegion(region)}</span>
                      <div className="text-xs text-gray-500">
                        {tRegionDesc(region)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {formData.regions.length === 0 && (
                <div className="text-xs text-amber-600 mt-2">{t('cs.s1.geoInfo')}</div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('cs.s2.title')}</h3>
              <p className="text-sm text-gray-600 mt-1">{t('cs.s2.subtitle')}</p>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-black me-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">{t('cs.s2.guidelinesTitle')}</h4>
                  <p className="text-sm text-gray-800 mt-1">
                    {t('cs.s2.guidelinesText')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s2.customerProfilesLabel')}</label>
              <p className="text-xs text-gray-600 mb-3">{t('cs.s2.customerProfilesHelp')}</p>
              <div className="grid grid-cols-2 gap-3">
                {customerRiskProfiles.map((profile) => (
                  <label key={profile} className="flex items-center p-2 bg-gray-50 rounded border hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.customerRiskProfiles.includes(profile)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ customerRiskProfiles: [...formData.customerRiskProfiles, profile] });
                        } else {
                          updateFormData({ customerRiskProfiles: formData.customerRiskProfiles.filter(p => p !== profile) });
                        }
                      }}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 me-2"
                    />
                    <div>
                      <span className="text-sm text-gray-700 font-medium">{tProfile(profile)}</span>
                      <div className="text-xs text-gray-500">
                        {tProfileDesc(profile)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">{t('cs.s2.toleranceMappingLabel')}</label>
                <button
                  type="button"
                  onClick={() => {
                    // Auto-fill with recommended mappings
                    const recommendedMapping = {
                      Conservative: ['Low'],
                      Balanced: ['Low', 'Medium'],
                      Aggressive: ['Low', 'Medium', 'High']
                    };
                    updateFormData({ investorRiskMapping: recommendedMapping });
                  }}
                  className="text-xs text-black hover:text-gray-800 underline"
                >
                  {t('cs.s2.useRecommended')}
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-3">{t('cs.s2.toleranceMappingHelp')}</p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="font-medium text-sm text-gray-700">{t('cs.s2.investorToleranceCol')}</div>
                  <div className="font-medium text-sm text-gray-700 text-center">
                    {t('cs.col.lowRisk')}
                    <div className="text-xs font-normal text-gray-500">{t('cs.col.lowRiskSub')}</div>
                  </div>
                  <div className="font-medium text-sm text-gray-700 text-center">
                    {t('cs.col.mediumRisk')}
                    <div className="text-xs font-normal text-gray-500">{t('cs.col.mediumRiskSub')}</div>
                  </div>
                  <div className="font-medium text-sm text-gray-700 text-center">
                    {t('cs.col.highRisk')}
                    <div className="text-xs font-normal text-gray-500">{t('cs.col.highRiskSub')}</div>
                  </div>
                </div>

                {investorToleranceLevels.map((tolerance) => (
                  <div key={tolerance} className="grid grid-cols-4 gap-4 mb-3 p-2 bg-white rounded border">
                    <div className="text-sm text-gray-900 flex items-center">
                      <div>
                        <div className="font-medium">{tTolerance(tolerance)}</div>
                        <div className="text-xs text-gray-500">
                          {tToleranceDesc(tolerance)}
                        </div>
                      </div>
                    </div>
                    {['Low', 'Medium', 'High'].map((risk) => (
                      <div key={risk} className="text-center">
                        <input
                          type="checkbox"
                          checked={(formData.investorRiskMapping[tolerance] || []).includes(risk)}
                          onChange={(e) => {
                            const currentMapping = formData.investorRiskMapping[tolerance] || [];
                            const newMapping = e.target.checked
                              ? [...currentMapping, risk]
                              : currentMapping.filter(r => r !== risk);
                            updateFormData({
                              investorRiskMapping: {
                                ...formData.investorRiskMapping,
                                [tolerance]: newMapping
                              }
                            });
                          }}
                          className="rounded border-gray-300 text-black focus:ring-gray-500"
                        />
                      </div>
                    ))}
                  </div>
                ))}

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-xs text-yellow-800">
                    💡 <strong>{t('cs.recommendedLabel')}</strong> {t('cs.s2.recommendedText')}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s2.exposureLimitsLabel')}</label>
              <p className="text-xs text-gray-600 mb-3">{t('cs.s2.exposureLimitsHelp')}</p>

              <div className="space-y-4">
                {['Low', 'Medium', 'High'].map((risk, index) => {
                  const recommendedMax = [60, 30, 15][index]; // Recommended max exposures
                  const recommendedMin = [20, 5, 0][index]; // Recommended min exposures

                  return (
                    <div key={risk} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 items-start">
                        <div className="text-sm font-medium text-gray-900">
                          <div>{t('cs.riskBand', { risk: tBand(risk) })}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {tBandDesc(risk)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t('cs.s2.minExposure')}</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.minMaxExposure[risk]?.min || ''}
                            onChange={(e) => updateFormData({
                              minMaxExposure: {
                                ...formData.minMaxExposure,
                                [risk]: {
                                  ...formData.minMaxExposure[risk],
                                  min: Number(e.target.value)
                                }
                              }
                            })}
                            placeholder={recommendedMin.toString()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                          <div className="text-xs text-gray-400 mt-1">{t('cs.suggested', { value: recommendedMin })}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t('cs.s2.maxExposure')}</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.minMaxExposure[risk]?.max || ''}
                            onChange={(e) => updateFormData({
                              minMaxExposure: {
                                ...formData.minMaxExposure,
                                [risk]: {
                                  ...formData.minMaxExposure[risk],
                                  max: Number(e.target.value)
                                }
                              }
                            })}
                            placeholder={recommendedMax.toString()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                          <div className="text-xs text-gray-400 mt-1">{t('cs.suggested', { value: recommendedMax })}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded">
                <div className="text-xs text-gray-900">
                  💡 <strong>{t('cs.bestPracticeLabel')}</strong> {t('cs.s2.bestPracticeText')}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('cs.s3.title')}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rule Types */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">{t('cs.s3.availableRules')}</h4>
                <div className="text-xs text-gray-600 mb-4">{t('cs.s3.availableRulesHelp')}</div>
                <div className="space-y-2">
                  {ruleTypes.map((ruleType) => {
                    const IconComponent = ruleType.icon;
                    return (
                      <button
                        key={ruleType.id}
                        onClick={() => addRule(ruleType.id)}
                        className="w-full text-start p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors group"
                      >
                        <div className="flex items-start space-x-3">
                          <IconComponent className="w-4 h-4 text-gray-500 group-hover:text-gray-700 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{t(ruleType.name)}</div>
                            <div className="text-xs text-gray-500 mt-1">{t(ruleType.description)}</div>
                            <div className="text-xs text-gray-400 mt-1 leading-relaxed">{t(ruleType.detailedDescription)}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Rules */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">{t('cs.s3.activeRules', { count: formData.rules.length })}</h4>
                  <div className="text-xs text-gray-500">{t('cs.s3.dragReorder')}</div>
                </div>
                
                {formData.rules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">{t('cs.s3.noRules')}</p>
                    <p className="text-xs">{t('cs.s3.noRulesHelp')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.rules.map((rule, index) => (
                      <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {tRuleName(rule.type)}
                              </div>
                              <div className="text-xs text-gray-500">{t('cs.s3.priority', { n: index + 1 })}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveRule(rule.id, 'up')}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveRule(rule.id, 'down')}
                              disabled={index === formData.rules.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removeRule(rule.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Rule Configuration */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500 mb-3">{t('cs.s3.ruleConfig')}</div>

                          {rule.type === 'risk_match' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                {t('cs.rc.riskMatch.tip')}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.riskMatch.matchingStrategy')}</label>
                                <select
                                  value={rule.config.strategy || 'strict'}
                                  onChange={(e) => updateRuleConfig(rule.id, { strategy: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="strict">{t('cs.rc.riskMatch.strict')}</option>
                                  <option value="flexible">{t('cs.rc.riskMatch.flexible')}</option>
                                  <option value="custom">{t('cs.rc.riskMatch.custom')}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.riskMatch.mismatchBehavior')}</label>
                                <select
                                  value={rule.config.mismatchBehavior || 'skip'}
                                  onChange={(e) => updateRuleConfig(rule.id, { mismatchBehavior: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="skip">{t('cs.rc.riskMatch.skip')}</option>
                                  <option value="warn">{t('cs.rc.riskMatch.warn')}</option>
                                  <option value="manual">{t('cs.rc.riskMatch.manual')}</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {rule.type === 'priority_rate' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                {t('cs.rc.priorityRate.tip')}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.priorityRate.ratePriority')}</label>
                                <select
                                  value={rule.config.priority || 'lowest_first'}
                                  onChange={(e) => updateRuleConfig(rule.id, { priority: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="lowest_first">{t('cs.rc.priorityRate.lowestFirst')}</option>
                                  <option value="highest_first">{t('cs.rc.priorityRate.highestFirst')}</option>
                                  <option value="balanced">{t('cs.rc.priorityRate.balanced')}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.priorityRate.rateThreshold')}</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={rule.config.rateThreshold || ''}
                                  onChange={(e) => updateRuleConfig(rule.id, { rateThreshold: e.target.value })}
                                  placeholder={t('cs.rc.priorityRate.rateThresholdPlaceholder')}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                              </div>
                            </div>
                          )}

                          {rule.type === 'capacity_limit' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                {t('cs.rc.capacity.tip')}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.capacity.limitType')}</label>
                                <select
                                  value={rule.config.limitType || 'per_investor'}
                                  onChange={(e) => updateRuleConfig(rule.id, { limitType: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="per_investor">{t('cs.rc.capacity.perInvestor')}</option>
                                  <option value="per_product">{t('cs.rc.capacity.perProduct')}</option>
                                  <option value="per_region">{t('cs.rc.capacity.perRegion')}</option>
                                  <option value="per_risk_band">{t('cs.rc.capacity.perRiskBand')}</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.capacity.maxAmount')}</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={rule.config.maxAmount || ''}
                                    onChange={(e) => updateRuleConfig(rule.id, { maxAmount: e.target.value })}
                                    placeholder={t('cs.rc.capacity.maxAmountPlaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.capacity.unit')}</label>
                                  <select
                                    value={rule.config.unit || 'SAR'}
                                    onChange={(e) => updateRuleConfig(rule.id, { unit: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="SAR">{t('cs.rc.capacity.unitSar')}</option>
                                    <option value="percentage">{t('cs.rc.capacity.unitPercentage')}</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}

                          {rule.type === 'liquidity_reserve' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                {t('cs.rc.liquidity.tip')}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.liquidity.reservePercentage')}</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  step="0.5"
                                  value={rule.config.reservePercentage || ''}
                                  onChange={(e) => updateRuleConfig(rule.id, { reservePercentage: e.target.value })}
                                  placeholder={t('cs.rc.liquidity.reservePlaceholder')}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                <div className="text-xs text-gray-500 mt-1">{t('cs.rc.liquidity.reserveHelp')}</div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.liquidity.reserveCalc')}</label>
                                <select
                                  value={rule.config.calculation || 'total_pool'}
                                  onChange={(e) => updateRuleConfig(rule.id, { calculation: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="total_pool">{t('cs.rc.liquidity.calcTotalPool')}</option>
                                  <option value="available_funds">{t('cs.rc.liquidity.calcAvailable')}</option>
                                  <option value="committed_capital">{t('cs.rc.liquidity.calcCommitted')}</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {rule.type === 'whitelist_blacklist' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                {t('cs.rc.whitelist.tip')}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.whitelist.listType')}</label>
                                <select
                                  value={rule.config.listType || 'whitelist'}
                                  onChange={(e) => updateRuleConfig(rule.id, { listType: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="whitelist">{t('cs.rc.whitelist.whitelist')}</option>
                                  <option value="blacklist">{t('cs.rc.whitelist.blacklist')}</option>
                                  <option value="priority">{t('cs.rc.whitelist.priorityList')}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.whitelist.investorSelection')}</label>
                                <select
                                  multiple
                                  value={rule.config.investors || []}
                                  onChange={(e) => updateRuleConfig(rule.id, {
                                    investors: Array.from(e.target.selectedOptions, option => option.value)
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20"
                                >
                                  <option value="inv_001">Alrajhi Capital</option>
                                  <option value="inv_002">SABB Capital</option>
                                  <option value="inv_003">SNB Capital</option>
                                  <option value="inv_004">Riyad Capital</option>
                                  <option value="inv_005">Jadwa Investment</option>
                                </select>
                                <div className="text-xs text-gray-500 mt-1">{t('cs.rc.whitelist.holdCtrl')}</div>
                              </div>
                            </div>
                          )}

                          {rule.type === 'product_eligibility' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                {t('cs.rc.product.tip')}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.product.eligibilityMode')}</label>
                                <select
                                  value={rule.config.mode || 'include'}
                                  onChange={(e) => updateRuleConfig(rule.id, { mode: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="include">{t('cs.rc.product.includeOnly')}</option>
                                  <option value="exclude">{t('cs.rc.product.exclude')}</option>
                                  <option value="priority">{t('cs.rc.product.priority')}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.product.productModels')}</label>
                                <div className="space-y-2">
                                  {productModels.map(product => (
                                    <label key={product} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={(rule.config.products || []).includes(product)}
                                        onChange={(e) => {
                                          const currentProducts = rule.config.products || [];
                                          const newProducts = e.target.checked
                                            ? [...currentProducts, product]
                                            : currentProducts.filter(p => p !== product);
                                          updateRuleConfig(rule.id, { products: newProducts });
                                        }}
                                        className="rounded border-gray-300 text-black focus:ring-gray-500 me-2"
                                      />
                                      <span className="text-xs text-gray-700">{tProduct(product)}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {rule.type === 'min_balance' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                {t('cs.rc.minBalance.tip')}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.minBalance.balanceType')}</label>
                                <select
                                  value={rule.config.balanceType || 'available'}
                                  onChange={(e) => updateRuleConfig(rule.id, { balanceType: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="available">{t('cs.rc.minBalance.available')}</option>
                                  <option value="committed">{t('cs.rc.minBalance.committed')}</option>
                                  <option value="total">{t('cs.rc.minBalance.total')}</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.minBalance.minAmount')}</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={rule.config.minAmount || ''}
                                    onChange={(e) => updateRuleConfig(rule.id, { minAmount: e.target.value })}
                                    placeholder={t('cs.rc.minBalance.minAmountPlaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.minBalance.currency')}</label>
                                  <select
                                    value={rule.config.currency || 'SAR'}
                                    onChange={(e) => updateRuleConfig(rule.id, { currency: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="SAR">SAR</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={rule.config.postAllocationCheck || false}
                                    onChange={(e) => updateRuleConfig(rule.id, { postAllocationCheck: e.target.checked })}
                                    className="rounded border-gray-300 text-black focus:ring-gray-500 me-2"
                                  />
                                  <span className="text-xs text-gray-700">{t('cs.rc.minBalance.alsoCheck')}</span>
                                </label>
                              </div>
                            </div>
                          )}

                          {rule.type === 'manual_override' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                {t('cs.rc.manual.tip')}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.manual.triggerCondition')}</label>
                                <select
                                  value={rule.config.triggerCondition || 'large_allocation'}
                                  onChange={(e) => updateRuleConfig(rule.id, { triggerCondition: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="large_allocation">{t('cs.rc.manual.largeAllocation')}</option>
                                  <option value="risk_threshold">{t('cs.rc.manual.riskThreshold')}</option>
                                  <option value="new_investor">{t('cs.rc.manual.newInvestor')}</option>
                                  <option value="exposure_limit">{t('cs.rc.manual.exposureLimit')}</option>
                                  <option value="market_hours">{t('cs.rc.manual.marketHours')}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.manual.thresholdValue')}</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={rule.config.thresholdValue || ''}
                                  onChange={(e) => updateRuleConfig(rule.id, { thresholdValue: e.target.value })}
                                  placeholder={t('cs.rc.manual.thresholdPlaceholder')}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('cs.rc.manual.approvalFrom')}</label>
                                <select
                                  value={rule.config.approverRole || 'ops_manager'}
                                  onChange={(e) => updateRuleConfig(rule.id, { approverRole: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="ops_manager">{t('cs.rc.manual.opsManager')}</option>
                                  <option value="risk_manager">{t('cs.rc.manual.riskManager')}</option>
                                  <option value="senior_manager">{t('cs.rc.manual.seniorManager')}</option>
                                  <option value="any_manager">{t('cs.rc.manual.anyManager')}</option>
                                </select>
                              </div>
                              <div>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={rule.config.blockAllocation || true}
                                    onChange={(e) => updateRuleConfig(rule.id, { blockAllocation: e.target.checked })}
                                    className="rounded border-gray-300 text-black focus:ring-gray-500 me-2"
                                  />
                                  <span className="text-xs text-gray-700">{t('cs.rc.manual.blockUntil')}</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('cs.s4.title')}</h3>
              <p className="text-sm text-gray-600 mt-1">{t('cs.s4.subtitle')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s4.weightsLabel')}</label>
              <p className="text-xs text-gray-600 mb-4">{t('cs.s4.weightsHelp')}</p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{t('cs.s4.riskMatchingRules')}</span>
                      <div className="text-xs text-gray-500">{t('cs.s4.riskMatchingRulesSub')}</div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.weights.riskMatching || 40}
                      onChange={(e) => updateFormData({
                        weights: { ...formData.weights, riskMatching: Number(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600 font-medium">{formData.weights.riskMatching || 40}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{t('cs.s4.ratePriorityRules')}</span>
                      <div className="text-xs text-gray-500">{t('cs.s4.ratePriorityRulesSub')}</div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.weights.ratePriority || 30}
                      onChange={(e) => updateFormData({
                        weights: { ...formData.weights, ratePriority: Number(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600 font-medium">{formData.weights.ratePriority || 30}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{t('cs.s4.capacityRules')}</span>
                      <div className="text-xs text-gray-500">{t('cs.s4.capacityRulesSub')}</div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.weights.capacity || 20}
                      onChange={(e) => updateFormData({
                        weights: { ...formData.weights, capacity: Number(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600 font-medium">{formData.weights.capacity || 20}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{t('cs.s4.otherRules')}</span>
                      <div className="text-xs text-gray-500">{t('cs.s4.otherRulesSub')}</div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.weights.other || 10}
                      onChange={(e) => updateFormData({
                        weights: { ...formData.weights, other: Number(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600 font-medium">{formData.weights.other || 10}%</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded">
                  <div className="text-xs text-gray-900">
                    💡 <strong>{t('cs.s4.currentTotal')}</strong> {(formData.weights.riskMatching || 40) + (formData.weights.ratePriority || 30) + (formData.weights.capacity || 20) + (formData.weights.other || 10)}%
                    {((formData.weights.riskMatching || 40) + (formData.weights.ratePriority || 30) + (formData.weights.capacity || 20) + (formData.weights.other || 10)) !== 100 && (
                      <span className="text-amber-700 ms-2">{t('cs.s4.shouldEqual100')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s4.globalCapsLabel')}</label>
              <p className="text-xs text-gray-600 mb-4">{t('cs.s4.globalCapsHelp')}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Users className="w-4 h-4 text-gray-500 me-2" />
                    <label className="block text-sm font-medium text-gray-700">{t('cs.s4.maxExposureInvestor')}</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.globalCaps.maxExposurePerInvestor}
                        onChange={(e) => updateFormData({
                          globalCaps: { ...formData.globalCaps, maxExposurePerInvestor: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    </div>
                    <div className="text-sm text-gray-600 pb-2">{t('cs.s4.pctOfTotalPool')}</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t('cs.s4.recommendedInvestor')}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Settings className="w-4 h-4 text-gray-500 me-2" />
                    <label className="block text-sm font-medium text-gray-700">{t('cs.s4.maxProductExposure')}</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.globalCaps.maxProductExposure}
                        onChange={(e) => updateFormData({
                          globalCaps: { ...formData.globalCaps, maxProductExposure: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    </div>
                    <div className="text-sm text-gray-600 pb-2">{t('cs.s4.pctOfTotalPool')}</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t('cs.s4.recommendedProduct')}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s4.minSlicesLabel')}</label>
              <p className="text-xs text-gray-600 mb-3">{t('cs.s4.minSlicesHelp')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('cs.s4.minAmountSar')}</label>
                  <input
                    type="number"
                    min="1000"
                    value={formData.minInvestmentSlice || ''}
                    onChange={(e) => updateFormData({ minInvestmentSlice: Number(e.target.value) })}
                    placeholder={t('cs.s4.minAmountPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('cs.s4.roundingRule')}</label>
                  <select
                    value={formData.roundingRule || 'nearest'}
                    onChange={(e) => updateFormData({ roundingRule: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="up">{t('cs.s4.roundUp')}</option>
                    <option value="down">{t('cs.s4.roundDown')}</option>
                    <option value="nearest">{t('cs.s4.roundNearest')}</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('cs.s4.typicalRange')}</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('cs.s5.title')}</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s5.executionModeLabel')}</label>
              <p className="text-xs text-gray-600 mb-4">{t('cs.s5.executionModeHelp')}</p>

              <div className="space-y-3">
                {[
                  {
                    value: 'realtime',
                    label: t('cs.runBehavior.realtime.label'),
                    description: t('cs.runBehavior.realtime.desc'),
                    details: t('cs.runBehavior.realtime.details'),
                    icon: '⚡'
                  },
                  {
                    value: 'batch',
                    label: t('cs.runBehavior.batch.label'),
                    description: t('cs.runBehavior.batch.desc'),
                    details: t('cs.runBehavior.batch.details'),
                    icon: '📅'
                  },
                  {
                    value: 'manual',
                    label: t('cs.runBehavior.manual.label'),
                    description: t('cs.runBehavior.manual.desc'),
                    details: t('cs.runBehavior.manual.details'),
                    icon: '👤'
                  }
                ].map((option) => (
                  <label key={option.value} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.runBehavior === option.value
                      ? 'border-gray-700 bg-gray-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="runBehavior"
                      value={option.value}
                      checked={formData.runBehavior === option.value}
                      onChange={(e) => updateFormData({ runBehavior: e.target.value as any })}
                      className="mt-1 rounded-full border-gray-300 text-black focus:ring-gray-500 me-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="me-2">{option.icon}</span>
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{option.description}</div>
                      <div className="text-xs text-gray-500 italic">{option.details}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {formData.runBehavior === 'batch' && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s5.batchFreqLabel')}</label>
                    <select
                      value={formData.scheduleFrequency}
                      onChange={(e) => updateFormData({ scheduleFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="hourly">{t('cs.s5.freqHourly')}</option>
                      <option value="every_4h">{t('cs.s5.freqEvery4h')}</option>
                      <option value="daily">{t('cs.s5.freqDaily')}</option>
                      <option value="weekly">{t('cs.s5.freqWeekly')}</option>
                      <option value="monthly">{t('cs.s5.freqMonthly')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s5.execTimeLabel')}</label>
                    <select
                      value={formData.executionTime || '09:00'}
                      onChange={(e) => updateFormData({ executionTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="09:00">{t('cs.s5.time9am')}</option>
                      <option value="12:00">{t('cs.s5.time12pm')}</option>
                      <option value="15:00">{t('cs.s5.time3pm')}</option>
                      <option value="18:00">{t('cs.s5.time6pm')}</option>
                      <option value="00:00">{t('cs.s5.time12am')}</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-800 mt-3">
                  {t('cs.s5.batchTip')}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cs.s5.alertsLabel')}</label>
              <p className="text-xs text-gray-600 mb-4">{t('cs.s5.alertsHelp')}</p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  <label className="flex items-start p-3 bg-white rounded border">
                    <input
                      type="checkbox"
                      checked={formData.notifications.allocationFailure}
                      onChange={(e) => updateFormData({
                        notifications: { ...formData.notifications, allocationFailure: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 me-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500 me-2" />
                        <div className="text-sm font-medium text-gray-900">{t('cs.notif.failure.title')}</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{t('cs.notif.failure.desc')}</div>
                      <div className="text-xs text-gray-500">{t('cs.notif.failure.recipients')}</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded border">
                    <input
                      type="checkbox"
                      checked={formData.notifications.exposureThreshold}
                      onChange={(e) => updateFormData({
                        notifications: { ...formData.notifications, exposureThreshold: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 me-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <Shield className="w-4 h-4 text-yellow-500 me-2" />
                        <div className="text-sm font-medium text-gray-900">{t('cs.notif.exposure.title')}</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{t('cs.notif.exposure.desc')}</div>
                      <div className="text-xs text-gray-500">{t('cs.notif.exposure.help')}</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded border">
                    <input
                      type="checkbox"
                      checked={formData.notifications.manualApproval}
                      onChange={(e) => updateFormData({
                        notifications: { ...formData.notifications, manualApproval: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 me-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <Clock className="w-4 h-4 text-gray-700 me-2" />
                        <div className="text-sm font-medium text-gray-900">{t('cs.notif.manual.title')}</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{t('cs.notif.manual.desc')}</div>
                      <div className="text-xs text-gray-500">{t('cs.notif.manual.help')}</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded border">
                    <input
                      type="checkbox"
                      checked={formData.notifications.successSummary || false}
                      onChange={(e) => updateFormData({
                        notifications: { ...formData.notifications, successSummary: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 me-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <Check className="w-4 h-4 text-green-500 me-2" />
                        <div className="text-sm font-medium text-gray-900">{t('cs.notif.success.title')}</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{t('cs.notif.success.desc')}</div>
                      <div className="text-xs text-gray-500">{t('cs.notif.success.help')}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('cs.s6.title')}</h3>
              <p className="text-sm text-gray-600 mt-1">{t('cs.s6.subtitle')}</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-black me-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">{t('cs.s6.checklistTitle')}</h4>
                  <p className="text-sm text-gray-800 mt-1">
                    {t('cs.s6.checklistText')}
                  </p>
                  <div className="mt-3 text-xs text-gray-800">
                    {t('cs.s6.check1')}<br/>
                    {t('cs.s6.check2')}<br/>
                    {t('cs.s6.check3')}<br/>
                    {t('cs.s6.check4')}<br/>
                    {t('cs.s6.check5')}<br/>
                    {t('cs.s6.check6')}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Settings className="w-4 h-4 me-2 text-gray-700" />
                    {t('cs.s6.basicConfig')}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>{t('cs.s6.name')}</span>
                      <span className="font-medium text-gray-900">{formData.name || t('cs.s6.notSpecified')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('cs.s6.status')}</span>
                      <span className={`font-medium ${formData.status === 'Published' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {tStatusReview(formData.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('cs.s6.products')}</span>
                      <span className="font-medium text-gray-900">{t('cs.nSelected', { count: formData.productModels.length })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('cs.s6.regions')}</span>
                      <span className="font-medium text-gray-900">
                        {formData.regions.length === 0 ? t('cs.s6.allRegions') : t('cs.nSelected', { count: formData.regions.length })}
                      </span>
                    </div>
                    {formData.description && (
                      <div className="pt-2 border-t">
                        <span className="text-xs text-gray-500">{t('cs.s6.description')}</span>
                        <p className="text-xs text-gray-600 mt-1">{formData.description.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Shield className="w-4 h-4 me-2 text-orange-500" />
                    {t('cs.s6.riskMgmt')}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>{t('cs.s6.customerProfiles')}</span>
                      <span className="font-medium text-gray-900">{t('cs.nSelected', { count: formData.customerRiskProfiles.length })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('cs.s6.maxInvestorExposure')}</span>
                      <span className="font-medium text-gray-900">{formData.globalCaps.maxExposurePerInvestor}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('cs.s6.maxProductExposure')}</span>
                      <span className="font-medium text-gray-900">{formData.globalCaps.maxProductExposure}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('cs.s6.liquidityBuffer')}</span>
                      <span className="font-medium text-gray-900">
                        {formData.rules.find(r => r.type === 'liquidity_reserve')?.config?.reservePercentage || t('cs.s6.notSet')}%
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">{t('cs.s6.riskToleranceMapping')}</span>
                      <div className="text-xs text-gray-600 mt-1">
                        {t('cs.toleranceLevelsConfigured', { count: Object.keys(formData.investorRiskMapping).length })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 me-2 text-purple-500" />
                    {t('cs.s6.allocationRules')}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>{t('cs.s6.totalRules')}</span>
                      <span className="font-medium text-gray-900">{formData.rules.length}</span>
                    </div>
                    {formData.rules.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-xs text-gray-500">{t('cs.s6.activeRulesLabel')}</span>
                        <div className="space-y-1 mt-1">
                          {formData.rules.slice(0, 3).map((rule, index) => {
                            return (
                              <div key={rule.id} className="text-xs text-gray-600 flex items-center">
                                <span className="w-4 h-4 bg-gray-100 rounded text-center text-xs me-2">{index + 1}</span>
                                {tRuleName(rule.type)}
                              </div>
                            );
                          })}
                          {formData.rules.length > 3 && (
                            <div className="text-xs text-gray-500">{t('cs.andMore', { count: formData.rules.length - 3 })}</div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">{t('cs.s6.ruleWeights')}</span>
                      <div className="text-xs text-gray-600 mt-1 space-y-1">
                        <div>{t('cs.weightRiskMatching', { value: formData.weights.riskMatching || 40 })}</div>
                        <div>{t('cs.weightRatePriority', { value: formData.weights.ratePriority || 30 })}</div>
                        <div>{t('cs.weightCapacity', { value: formData.weights.capacity || 20 })}</div>
                        <div>{t('cs.weightOther', { value: formData.weights.other || 10 })}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 me-2 text-green-500" />
                    {t('cs.s6.financialLimits')}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>{t('cs.s6.minInvestment')}</span>
                      <span className="font-medium text-gray-900">
                        {formData.minInvestmentSlice ? t('cs.amountSar', { amount: formData.minInvestmentSlice.toLocaleString() }) : t('cs.s6.notSet')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('cs.s6.rounding')}</span>
                      <span className="font-medium text-gray-900">{tRounding(formData.roundingRule || 'nearest')}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">{t('cs.s6.concentrationLimits')}</span>
                      <div className="text-xs text-gray-600 mt-1">
                        {t('cs.concentrationLimitsValue', { investor: formData.globalCaps.maxExposurePerInvestor, product: formData.globalCaps.maxProductExposure })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 me-2 text-indigo-500" />
                    {t('cs.s6.execSchedule')}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>{t('cs.s6.runBehavior')}</span>
                      <span className="font-medium text-gray-900">{tRunBehaviorShort(formData.runBehavior)}</span>
                    </div>
                    {formData.runBehavior === 'batch' && (
                      <>
                        <div className="flex justify-between">
                          <span>{t('cs.s6.frequency')}</span>
                          <span className="font-medium text-gray-900">{tFreqShort(formData.scheduleFrequency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('cs.s6.executionTime')}</span>
                          <span className="font-medium text-gray-900">{formData.executionTime || '09:00'}</span>
                        </div>
                      </>
                    )}
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">{t('cs.s6.expectedImpact')}</span>
                      <div className="text-xs text-gray-600 mt-1">
                        {formData.runBehavior === 'realtime' && t('cs.s6.impactRealtime')}
                        {formData.runBehavior === 'batch' && t('cs.s6.impactBatch')}
                        {formData.runBehavior === 'manual' && t('cs.s6.impactManual')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 me-2 text-yellow-500" />
                    {t('cs.s6.notifications')}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{t('cs.s6.failureAlerts')}</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        formData.notifications.allocationFailure
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formData.notifications.allocationFailure ? t('cs.enabled') : t('cs.disabled')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('cs.s6.exposureAlerts')}</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        formData.notifications.exposureThreshold
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formData.notifications.exposureThreshold ? t('cs.enabled') : t('cs.disabled')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('cs.s6.manualApproval')}</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        formData.notifications.manualApproval
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formData.notifications.manualApproval ? t('cs.enabled') : t('cs.disabled')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('cs.s6.successSummary')}</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        formData.notifications.successSummary
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formData.notifications.successSummary ? t('cs.enabled') : t('cs.disabled')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 me-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">{t('cs.s6.nextStepsTitle')}</h4>
                  <div className="text-sm text-yellow-700 mt-1 space-y-1">
                    <p>• {t('cs.s6.nextStep1')}</p>
                    <p>• {t('cs.s6.nextStep2')}</p>
                    <p>• {t('cs.s6.nextStep3')}</p>
                    <p>• {t('cs.s6.nextStep4')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Check className="w-5 h-5 text-green-600 me-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-900">{t('cs.s6.readyTitle')}</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {t('cs.s6.readyText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/allocation/strategies"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 me-2" />
              {t('cs.backToStrategies')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('cs.title')}</h1>
              <p className="text-gray-600">{t('cs.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step < currentStep ? 'bg-black text-white' :
                step === currentStep ? 'bg-gray-100 text-black border-2 border-black' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < totalSteps && (
                <div className={`w-16 h-1 ${step < currentStep ? 'bg-black' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">{t('cs.step.basicInfo')}</span>
          <span className="text-xs text-gray-500">{t('cs.step.riskMapping')}</span>
          <span className="text-xs text-gray-500">{t('cs.step.rules')}</span>
          <span className="text-xs text-gray-500">{t('cs.step.limits')}</span>
          <span className="text-xs text-gray-500">{t('cs.step.schedule')}</span>
          <span className="text-xs text-gray-500">{t('cs.step.review')}</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 me-2" />
          {t('common:previous')}
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('cs.saveDraft')}
          </button>
          
          {currentStep === totalSteps ? (
            <div className="flex items-center space-x-3">
              <Link
                to={`/admin/allocation/strategies/simulate?preview=true`}
                className="px-4 py-2 text-sm font-medium text-black bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {t('cs.simulateBeforePublish')}
              </Link>
              <button
                onClick={handlePublish}
                disabled={!formData.name}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('cs.publishStrategy')}
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              {t('common:next')}
              <ArrowRight className="w-4 h-4 ms-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
