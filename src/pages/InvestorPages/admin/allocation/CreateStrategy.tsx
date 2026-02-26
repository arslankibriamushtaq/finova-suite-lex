import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    name: 'Match by Risk',
    description: 'Map investor risk tolerance to customer risk profiles',
    detailedDescription: 'Ensures alignment between investor risk appetite and customer risk levels. Conservative investors will be matched with low-risk customers, while aggressive investors can accept higher-risk customers.',
    icon: Shield
  },
  {
    id: 'priority_rate',
    name: 'Priority by Rate',
    description: 'Prioritize allocations based on expected returns',
    detailedDescription: 'Determines allocation order based on expected return rates. "Lowest first" optimizes for investor benefits, while "Highest first" maximizes platform revenue.',
    icon: DollarSign
  },
  {
    id: 'capacity_limit',
    name: 'Capacity Limit',
    description: 'Set maximum exposure limits per investor or product',
    detailedDescription: 'Prevents over-concentration by limiting maximum allocation amounts or percentages per investor, product type, or region. Helps maintain portfolio diversification.',
    icon: Target
  },
  {
    id: 'liquidity_reserve',
    name: 'Liquidity Reserve',
    description: 'Maintain minimum liquidity buffer in allocation pool',
    detailedDescription: 'Keeps a percentage of total funds unallocated to handle unexpected redemptions, market volatility, or operational requirements. Recommended: 5-15%.',
    icon: Shield
  },
  {
    id: 'whitelist_blacklist',
    name: 'Whitelist/Blacklist',
    description: 'Include or exclude specific investors from allocations',
    detailedDescription: 'Allows manual control over investor participation. Whitelist prioritizes preferred investors, while blacklist excludes problematic or restricted investors.',
    icon: Users
  },
  {
    id: 'product_eligibility',
    name: 'Product Eligibility',
    description: 'Restrict allocations to specific product models',
    detailedDescription: 'Defines which financing products are eligible for allocation. Useful for creating specialized strategies or complying with investor mandate restrictions.',
    icon: Settings
  },
  {
    id: 'min_balance',
    name: 'Minimum Balance',
    description: 'Set minimum available balance requirement for investors',
    detailedDescription: 'Ensures investors maintain sufficient liquidity before participating in allocations. Prevents over-commitment and maintains healthy cash reserves.',
    icon: DollarSign
  },
  {
    id: 'manual_override',
    name: 'Manual Override',
    description: 'Require manual approval for specific conditions',
    detailedDescription: 'Pauses automatic allocation when certain thresholds or conditions are met, requiring manual review and approval before proceeding. Essential for risk management.',
    icon: AlertTriangle
  }
];

export default function CreateStrategy() {
  const navigate = useNavigate();
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
    alert('Strategy saved as draft');
    navigate('/admin/allocation/strategies');
  };

  const handlePublish = () => {
    if (confirm('Are you sure you want to publish this strategy? It will become active immediately.')) {
      alert('Strategy published successfully');
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
              <h3 className="text-lg font-semibold text-gray-900">Basic Strategy Information</h3>
              <p className="text-sm text-gray-600 mt-1">Configure the fundamental parameters that define your allocation strategy's scope and behavior.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="e.g., Conservative Balanced Allocation Q4 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Choose a descriptive name that reflects the strategy's risk profile and purpose.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Describe the strategy's objectives, target market, and key principles. Include any special considerations or regulatory requirements."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Provide context for operations team and future strategy reviews. This will be visible in audit logs.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => updateFormData({ status: e.target.value as 'Draft' | 'Published' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="Draft">Draft - Save for later editing and testing</option>
                <option value="Published">Published - Activate immediately after creation</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.status === 'Draft'
                  ? 'Draft strategies can be modified and tested without affecting live allocations.'
                  : 'Published strategies become active immediately and will start processing allocations.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Product Models *</label>
              <p className="text-xs text-gray-600 mb-3">Select which financing products this strategy will manage. Each product model has different risk characteristics and investor appeal.</p>
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
                      className="rounded border-gray-300 text-black focus:ring-gray-500 mr-3"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 font-medium">{product}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.includes('POS') && 'Point-of-sale financing, typically short-term with moderate risk'}
                        {product.includes('Auto') && 'Vehicle financing with asset backing, lower risk profile'}
                        {product.includes('MSME') && 'Small business working capital, higher risk but better returns'}
                        {product.includes('Consumer') && 'Personal loans, unsecured with varied risk levels'}
                        {product.includes('Real Estate') && 'Property financing, asset-backed with longer terms'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {formData.productModels.length === 0 && (
                <div className="text-xs text-red-600 mt-2">⚠️ Please select at least one product model to proceed.</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Coverage</label>
              <p className="text-xs text-gray-600 mb-3">Define which regions this strategy will cover. Regional diversification can help manage concentration risk.</p>
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
                      className="rounded border-gray-300 text-black focus:ring-gray-500 mr-2"
                    />
                    <div>
                      <span className="text-sm text-gray-700 font-medium">{region}</span>
                      <div className="text-xs text-gray-500">
                        {region === 'All Regions' && 'Nationwide coverage, maximum diversification'}
                        {region === 'Riyadh' && 'Capital region, largest market'}
                        {region === 'Jeddah' && 'Commercial hub, diverse economy'}
                        {region === 'Dammam' && 'Eastern province, oil & industrial'}
                        {region === 'Mecca' && 'Religious tourism, seasonal patterns'}
                        {region === 'Medina' && 'Religious tourism, stable demand'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {formData.regions.length === 0 && (
                <div className="text-xs text-amber-600 mt-2">💡 No regions selected - strategy will apply to all regions by default.</div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Risk Mapping Configuration</h3>
              <p className="text-sm text-gray-600 mt-1">Define risk profile alignment between customers and investors to ensure optimal allocation matching.</p>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-black mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Risk Mapping Guidelines</h4>
                  <p className="text-sm text-gray-800 mt-1">
                    Customer risk profiles represent creditworthiness and default probability. Investor risk tolerance indicates their appetite for potential losses. Proper alignment ensures sustainable returns and satisfied investors.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Risk Profiles *</label>
              <p className="text-xs text-gray-600 mb-3">Select which customer risk categories this strategy will handle. Risk scores: Low (0-30), Medium (31-70), High (71-100).</p>
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
                      className="rounded border-gray-300 text-black focus:ring-gray-500 mr-2"
                    />
                    <div>
                      <span className="text-sm text-gray-700 font-medium">{profile}</span>
                      <div className="text-xs text-gray-500">
                        {profile.includes('Low') && 'Excellent credit, minimal default risk'}
                        {profile.includes('Medium') && 'Good credit, moderate default risk'}
                        {profile.includes('High') && 'Fair credit, higher default risk'}
                        {profile.includes('Custom') && 'User-defined risk parameters'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Investor Risk Tolerance Mapping *</label>
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
                  Use Recommended Mapping
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-3">Define which customer risk levels each investor tolerance can accept. Conservative investors typically prefer low-risk customers only.</p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="font-medium text-sm text-gray-700">Investor Tolerance</div>
                  <div className="font-medium text-sm text-gray-700 text-center">
                    Low Risk (0-30)
                    <div className="text-xs font-normal text-gray-500">Prime customers</div>
                  </div>
                  <div className="font-medium text-sm text-gray-700 text-center">
                    Medium Risk (31-70)
                    <div className="text-xs font-normal text-gray-500">Standard customers</div>
                  </div>
                  <div className="font-medium text-sm text-gray-700 text-center">
                    High Risk (71-100)
                    <div className="text-xs font-normal text-gray-500">Subprime customers</div>
                  </div>
                </div>

                {investorToleranceLevels.map((tolerance) => (
                  <div key={tolerance} className="grid grid-cols-4 gap-4 mb-3 p-2 bg-white rounded border">
                    <div className="text-sm text-gray-900 flex items-center">
                      <div>
                        <div className="font-medium">{tolerance}</div>
                        <div className="text-xs text-gray-500">
                          {tolerance === 'Conservative' && 'Low risk appetite, stable returns'}
                          {tolerance === 'Balanced' && 'Moderate risk appetite, balanced returns'}
                          {tolerance === 'Aggressive' && 'High risk appetite, higher returns'}
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
                    💡 <strong>Recommended:</strong> Conservative investors should only accept Low risk customers.
                    Balanced investors can accept Low-Medium risk. Aggressive investors can accept all risk levels.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Exposure Limits per Risk Band</label>
              <p className="text-xs text-gray-600 mb-3">Set minimum and maximum exposure percentages for each risk category to maintain portfolio balance and comply with risk management policies.</p>

              <div className="space-y-4">
                {['Low', 'Medium', 'High'].map((risk, index) => {
                  const recommendedMax = [60, 30, 15][index]; // Recommended max exposures
                  const recommendedMin = [20, 5, 0][index]; // Recommended min exposures

                  return (
                    <div key={risk} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 items-start">
                        <div className="text-sm font-medium text-gray-900">
                          <div>{risk} Risk Band</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {risk === 'Low' && 'Prime customers, minimal defaults'}
                            {risk === 'Medium' && 'Standard customers, normal defaults'}
                            {risk === 'High' && 'Subprime customers, higher defaults'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Minimum Exposure (%)</label>
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
                          <div className="text-xs text-gray-400 mt-1">Suggested: {recommendedMin}%</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Maximum Exposure (%)</label>
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
                          <div className="text-xs text-gray-400 mt-1">Suggested: {recommendedMax}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded">
                <div className="text-xs text-gray-900">
                  💡 <strong>Best Practice:</strong> Ensure total exposure limits don't exceed 100%. Consider regulatory requirements and investor mandates when setting these limits.
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Rule Builder</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rule Types */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Available Rules</h4>
                <div className="text-xs text-gray-600 mb-4">Click to add rules to your strategy. Rules are executed in priority order.</div>
                <div className="space-y-2">
                  {ruleTypes.map((ruleType) => {
                    const IconComponent = ruleType.icon;
                    return (
                      <button
                        key={ruleType.id}
                        onClick={() => addRule(ruleType.id)}
                        className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors group"
                      >
                        <div className="flex items-start space-x-3">
                          <IconComponent className="w-4 h-4 text-gray-500 group-hover:text-gray-700 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{ruleType.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{ruleType.description}</div>
                            <div className="text-xs text-gray-400 mt-1 leading-relaxed">{ruleType.detailedDescription}</div>
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
                  <h4 className="text-sm font-medium text-gray-900">Active Rules ({formData.rules.length})</h4>
                  <div className="text-xs text-gray-500">Drag to reorder priority</div>
                </div>
                
                {formData.rules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No rules added yet</p>
                    <p className="text-xs">Add rules from the left panel to build your strategy</p>
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
                                {ruleTypes.find(rt => rt.id === rule.type)?.name}
                              </div>
                              <div className="text-xs text-gray-500">Priority: {index + 1}</div>
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
                          <div className="text-xs text-gray-500 mb-3">Rule Configuration</div>

                          {rule.type === 'risk_match' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                💡 This rule maps investor risk tolerance levels to customer risk profiles for optimal matching.
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Matching Strategy</label>
                                <select
                                  value={rule.config.strategy || 'strict'}
                                  onChange={(e) => updateRuleConfig(rule.id, { strategy: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="strict">Strict Match (Conservative→Low, Balanced→Medium, Aggressive→High)</option>
                                  <option value="flexible">Flexible Match (Allow one level variance)</option>
                                  <option value="custom">Custom Mapping (Define manually)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Mismatch Behavior</label>
                                <select
                                  value={rule.config.mismatchBehavior || 'skip'}
                                  onChange={(e) => updateRuleConfig(rule.id, { mismatchBehavior: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="skip">Skip mismatched allocations</option>
                                  <option value="warn">Proceed with warning</option>
                                  <option value="manual">Require manual approval</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {rule.type === 'priority_rate' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                💡 This rule determines the order of allocation based on expected return rates.
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Rate Priority</label>
                                <select
                                  value={rule.config.priority || 'lowest_first'}
                                  onChange={(e) => updateRuleConfig(rule.id, { priority: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="lowest_first">Lowest Rate First (Better for investors)</option>
                                  <option value="highest_first">Highest Rate First (Better for platform)</option>
                                  <option value="balanced">Balanced Approach (Mix of both)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Rate Threshold (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={rule.config.rateThreshold || ''}
                                  onChange={(e) => updateRuleConfig(rule.id, { rateThreshold: e.target.value })}
                                  placeholder="Optional: Minimum rate to consider"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                              </div>
                            </div>
                          )}

                          {rule.type === 'capacity_limit' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                💡 Set maximum exposure limits to maintain diversification and reduce concentration risk.
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Limit Type</label>
                                <select
                                  value={rule.config.limitType || 'per_investor'}
                                  onChange={(e) => updateRuleConfig(rule.id, { limitType: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="per_investor">Per Investor</option>
                                  <option value="per_product">Per Product Model</option>
                                  <option value="per_region">Per Region</option>
                                  <option value="per_risk_band">Per Risk Band</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Maximum Amount</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={rule.config.maxAmount || ''}
                                    onChange={(e) => updateRuleConfig(rule.id, { maxAmount: e.target.value })}
                                    placeholder="e.g., 10000000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                                  <select
                                    value={rule.config.unit || 'SAR'}
                                    onChange={(e) => updateRuleConfig(rule.id, { unit: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="SAR">SAR (Fixed Amount)</option>
                                    <option value="percentage">Percentage of Pool</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}

                          {rule.type === 'liquidity_reserve' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                💡 Maintain a buffer for unexpected redemptions and market volatility. Recommended: 5-15%.
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Reserve Percentage</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  step="0.5"
                                  value={rule.config.reservePercentage || ''}
                                  onChange={(e) => updateRuleConfig(rule.id, { reservePercentage: e.target.value })}
                                  placeholder="e.g., 10"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                <div className="text-xs text-gray-500 mt-1">Percentage of total pool to keep unallocated</div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Reserve Calculation</label>
                                <select
                                  value={rule.config.calculation || 'total_pool'}
                                  onChange={(e) => updateRuleConfig(rule.id, { calculation: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="total_pool">Based on Total Pool Size</option>
                                  <option value="available_funds">Based on Available Funds</option>
                                  <option value="committed_capital">Based on Committed Capital</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {rule.type === 'whitelist_blacklist' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                💡 Control investor participation by including preferred investors or excluding problematic ones.
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">List Type</label>
                                <select
                                  value={rule.config.listType || 'whitelist'}
                                  onChange={(e) => updateRuleConfig(rule.id, { listType: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="whitelist">Whitelist (Only allow listed investors)</option>
                                  <option value="blacklist">Blacklist (Exclude listed investors)</option>
                                  <option value="priority">Priority List (Prefer listed investors)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Investor Selection</label>
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
                                <div className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple investors</div>
                              </div>
                            </div>
                          )}

                          {rule.type === 'product_eligibility' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                💡 Restrict allocations to specific product models based on investor mandates or strategy focus.
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Eligibility Mode</label>
                                <select
                                  value={rule.config.mode || 'include'}
                                  onChange={(e) => updateRuleConfig(rule.id, { mode: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="include">Include Only (Restrict to selected products)</option>
                                  <option value="exclude">Exclude (Allow all except selected products)</option>
                                  <option value="priority">Priority (Prefer selected products)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Product Models</label>
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
                                        className="rounded border-gray-300 text-black focus:ring-gray-500 mr-2"
                                      />
                                      <span className="text-xs text-gray-700">{product}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {rule.type === 'min_balance' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                💡 Ensure investors maintain sufficient liquidity before participating in new allocations.
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Balance Type</label>
                                <select
                                  value={rule.config.balanceType || 'available'}
                                  onChange={(e) => updateRuleConfig(rule.id, { balanceType: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="available">Available Cash Balance</option>
                                  <option value="committed">Committed but Unallocated</option>
                                  <option value="total">Total Account Balance</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Amount</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={rule.config.minAmount || ''}
                                    onChange={(e) => updateRuleConfig(rule.id, { minAmount: e.target.value })}
                                    placeholder="e.g., 1000000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
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
                                    className="rounded border-gray-300 text-black focus:ring-gray-500 mr-2"
                                  />
                                  <span className="text-xs text-gray-700">Also check balance after allocation</span>
                                </label>
                              </div>
                            </div>
                          )}

                          {rule.type === 'manual_override' && (
                            <div className="space-y-3">
                              <div className="text-xs text-black bg-gray-50 p-2 rounded">
                                💡 Pause automatic allocation when specific conditions are met, requiring manual review.
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Trigger Condition</label>
                                <select
                                  value={rule.config.triggerCondition || 'large_allocation'}
                                  onChange={(e) => updateRuleConfig(rule.id, { triggerCondition: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="large_allocation">Large Allocation (Above threshold)</option>
                                  <option value="risk_threshold">Risk Threshold Exceeded</option>
                                  <option value="new_investor">New Investor Participation</option>
                                  <option value="exposure_limit">Exposure Limit Approaching</option>
                                  <option value="market_hours">Outside Market Hours</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Threshold Value</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={rule.config.thresholdValue || ''}
                                  onChange={(e) => updateRuleConfig(rule.id, { thresholdValue: e.target.value })}
                                  placeholder="e.g., 5000000 for large allocation"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Approval Required From</label>
                                <select
                                  value={rule.config.approverRole || 'ops_manager'}
                                  onChange={(e) => updateRuleConfig(rule.id, { approverRole: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                >
                                  <option value="ops_manager">Operations Manager</option>
                                  <option value="risk_manager">Risk Manager</option>
                                  <option value="senior_manager">Senior Manager</option>
                                  <option value="any_manager">Any Manager</option>
                                </select>
                              </div>
                              <div>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={rule.config.blockAllocation || true}
                                    onChange={(e) => updateRuleConfig(rule.id, { blockAllocation: e.target.checked })}
                                    className="rounded border-gray-300 text-black focus:ring-gray-500 mr-2"
                                  />
                                  <span className="text-xs text-gray-700">Block allocation until approval</span>
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
              <h3 className="text-lg font-semibold text-gray-900">Allocation Weighting & Global Limits</h3>
              <p className="text-sm text-gray-600 mt-1">Configure rule priorities and set portfolio-wide risk management limits to ensure balanced allocations.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rule Group Weights</label>
              <p className="text-xs text-gray-600 mb-4">Assign relative importance to different rule categories. Higher weights mean stronger influence on allocation decisions. Total should equal 100%.</p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="text-sm text-gray-900 font-medium">Risk Matching Rules</span>
                      <div className="text-xs text-gray-500">Investor-customer risk alignment</div>
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
                      <span className="text-sm text-gray-900 font-medium">Rate Priority Rules</span>
                      <div className="text-xs text-gray-500">Return optimization preferences</div>
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
                      <span className="text-sm text-gray-900 font-medium">Capacity Rules</span>
                      <div className="text-xs text-gray-500">Exposure and limit management</div>
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
                      <span className="text-sm text-gray-900 font-medium">Other Rules</span>
                      <div className="text-xs text-gray-500">Eligibility and special conditions</div>
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
                    💡 <strong>Current Total:</strong> {(formData.weights.riskMatching || 40) + (formData.weights.ratePriority || 30) + (formData.weights.capacity || 20) + (formData.weights.other || 10)}%
                    {((formData.weights.riskMatching || 40) + (formData.weights.ratePriority || 30) + (formData.weights.capacity || 20) + (formData.weights.other || 10)) !== 100 && (
                      <span className="text-amber-700 ml-2">(Should equal 100%)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Global Portfolio Caps</label>
              <p className="text-xs text-gray-600 mb-4">Set maximum concentration limits to prevent over-exposure to any single investor or product type. These are hard limits that cannot be exceeded.</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Users className="w-4 h-4 text-gray-500 mr-2" />
                    <label className="block text-sm font-medium text-gray-700">Max Exposure per Investor</label>
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
                    <div className="text-sm text-gray-600 pb-2">% of total pool</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Recommended: 15-30% to maintain diversification</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Settings className="w-4 h-4 text-gray-500 mr-2" />
                    <label className="block text-sm font-medium text-gray-700">Max Product Exposure</label>
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
                    <div className="text-sm text-gray-600 pb-2">% of total pool</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Recommended: 30-50% depending on product count</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Investment Slices</label>
              <p className="text-xs text-gray-600 mb-3">Set the smallest allocation amount to reduce micro-transactions and administrative overhead.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minimum Amount (SAR)</label>
                  <input
                    type="number"
                    min="1000"
                    value={formData.minInvestmentSlice || ''}
                    onChange={(e) => updateFormData({ minInvestmentSlice: Number(e.target.value) })}
                    placeholder="e.g., 50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Rounding Rule</label>
                  <select
                    value={formData.roundingRule || 'nearest'}
                    onChange={(e) => updateFormData({ roundingRule: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="up">Round Up</option>
                    <option value="down">Round Down</option>
                    <option value="nearest">Round to Nearest</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Typical range: 10,000 - 100,000 SAR depending on product type and operational efficiency.</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Scheduling & Notifications</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Execution Mode</label>
              <p className="text-xs text-gray-600 mb-4">Choose how and when this strategy should execute allocations. Real-time is most responsive, batch is most efficient, manual provides maximum control.</p>

              <div className="space-y-3">
                {[
                  {
                    value: 'realtime',
                    label: 'Real-time Execution',
                    description: 'Execute immediately when funds become available',
                    details: 'Best for: High-frequency allocations, urgent funding needs, immediate investor satisfaction',
                    icon: '⚡'
                  },
                  {
                    value: 'batch',
                    label: 'Batch Processing',
                    description: 'Execute allocations on a fixed schedule',
                    details: 'Best for: Operational efficiency, cost reduction, consolidated processing',
                    icon: '📅'
                  },
                  {
                    value: 'manual',
                    label: 'Manual Execution Only',
                    description: 'Require explicit approval for each allocation',
                    details: 'Best for: High-risk strategies, regulatory compliance, testing new approaches',
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
                      className="mt-1 rounded-full border-gray-300 text-black focus:ring-gray-500 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="mr-2">{option.icon}</span>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch Schedule Frequency</label>
                    <select
                      value={formData.scheduleFrequency}
                      onChange={(e) => updateFormData({ scheduleFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="hourly">Every Hour (24 times/day)</option>
                      <option value="every_4h">Every 4 Hours (6 times/day)</option>
                      <option value="daily">Daily (Once per day)</option>
                      <option value="weekly">Weekly (Once per week)</option>
                      <option value="monthly">Monthly (Once per month)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Execution Time</label>
                    <select
                      value={formData.executionTime || '09:00'}
                      onChange={(e) => updateFormData({ executionTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="09:00">9:00 AM (Business hours start)</option>
                      <option value="12:00">12:00 PM (Midday)</option>
                      <option value="15:00">3:00 PM (Afternoon)</option>
                      <option value="18:00">6:00 PM (End of business)</option>
                      <option value="00:00">12:00 AM (Midnight - off hours)</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-800 mt-3">
                  💡 Batch processing reduces system load and allows for better optimization across multiple allocations.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert & Notification Settings</label>
              <p className="text-xs text-gray-600 mb-4">Configure automatic notifications for critical events. Helps ensure quick response to issues and maintains operational oversight.</p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  <label className="flex items-start p-3 bg-white rounded border">
                    <input
                      type="checkbox"
                      checked={formData.notifications.allocationFailure}
                      onChange={(e) => updateFormData({
                        notifications: { ...formData.notifications, allocationFailure: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 mr-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                        <div className="text-sm font-medium text-gray-900">Allocation Failure Alerts</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">Immediate email to operations team when allocation fails</div>
                      <div className="text-xs text-gray-500">Recipients: ops-team@company.com, risk-manager@company.com</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded border">
                    <input
                      type="checkbox"
                      checked={formData.notifications.exposureThreshold}
                      onChange={(e) => updateFormData({
                        notifications: { ...formData.notifications, exposureThreshold: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 mr-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <Shield className="w-4 h-4 text-yellow-500 mr-2" />
                        <div className="text-sm font-medium text-gray-900">Exposure Threshold Alerts</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">Alert when investor or product exposure approaches limits (80% of max)</div>
                      <div className="text-xs text-gray-500">Helps prevent breaches and maintains portfolio balance</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded border">
                    <input
                      type="checkbox"
                      checked={formData.notifications.manualApproval}
                      onChange={(e) => updateFormData({
                        notifications: { ...formData.notifications, manualApproval: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 mr-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <Clock className="w-4 h-4 text-gray-700 mr-2" />
                        <div className="text-sm font-medium text-gray-900">Manual Approval Required</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">Notify when manual override rules are triggered</div>
                      <div className="text-xs text-gray-500">Ensures prompt review of exceptional cases</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 bg-white rounded border">
                    <input
                      type="checkbox"
                      checked={formData.notifications.successSummary || false}
                      onChange={(e) => updateFormData({
                        notifications: { ...formData.notifications, successSummary: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 mr-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        <div className="text-sm font-medium text-gray-900">Daily Success Summary</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">Daily report of successful allocations and performance metrics</div>
                      <div className="text-xs text-gray-500">Sent at 6 PM local time to management team</div>
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
              <h3 className="text-lg font-semibold text-gray-900">Strategy Review & Publication</h3>
              <p className="text-sm text-gray-600 mt-1">Review all configuration details before publishing. Once published, the strategy will become active and start processing allocations.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-black mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Pre-Publication Checklist</h4>
                  <p className="text-sm text-gray-800 mt-1">
                    Ensure all required fields are completed, rules are properly configured, and limits are within acceptable ranges.
                    Published strategies become active immediately and will start processing real allocations.
                  </p>
                  <div className="mt-3 text-xs text-gray-800">
                    ✓ Strategy name and description provided<br/>
                    ✓ Product models and regions selected<br/>
                    ✓ Risk mapping configured<br/>
                    ✓ Allocation rules defined<br/>
                    ✓ Global limits set<br/>
                    ✓ Execution schedule configured
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-gray-700" />
                    Basic Configuration
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium text-gray-900">{formData.name || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${formData.status === 'Published' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {formData.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span className="font-medium text-gray-900">{formData.productModels.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Regions:</span>
                      <span className="font-medium text-gray-900">
                        {formData.regions.length === 0 ? 'All regions' : `${formData.regions.length} selected`}
                      </span>
                    </div>
                    {formData.description && (
                      <div className="pt-2 border-t">
                        <span className="text-xs text-gray-500">Description:</span>
                        <p className="text-xs text-gray-600 mt-1">{formData.description.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-orange-500" />
                    Risk Management
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Customer Profiles:</span>
                      <span className="font-medium text-gray-900">{formData.customerRiskProfiles.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Investor Exposure:</span>
                      <span className="font-medium text-gray-900">{formData.globalCaps.maxExposurePerInvestor}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Product Exposure:</span>
                      <span className="font-medium text-gray-900">{formData.globalCaps.maxProductExposure}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Liquidity Buffer:</span>
                      <span className="font-medium text-gray-900">
                        {formData.rules.find(r => r.type === 'liquidity_reserve')?.config?.reservePercentage || 'Not set'}%
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">Risk Tolerance Mapping:</span>
                      <div className="text-xs text-gray-600 mt-1">
                        {Object.keys(formData.investorRiskMapping).length} tolerance levels configured
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-purple-500" />
                    Allocation Rules
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Total Rules:</span>
                      <span className="font-medium text-gray-900">{formData.rules.length}</span>
                    </div>
                    {formData.rules.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-xs text-gray-500">Active Rules:</span>
                        <div className="space-y-1 mt-1">
                          {formData.rules.slice(0, 3).map((rule, index) => {
                            const ruleInfo = ruleTypes.find(rt => rt.id === rule.type);
                            return (
                              <div key={rule.id} className="text-xs text-gray-600 flex items-center">
                                <span className="w-4 h-4 bg-gray-100 rounded text-center text-xs font-mono mr-2">{index + 1}</span>
                                {ruleInfo?.name}
                              </div>
                            );
                          })}
                          {formData.rules.length > 3 && (
                            <div className="text-xs text-gray-500">...and {formData.rules.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">Rule Weights:</span>
                      <div className="text-xs text-gray-600 mt-1 space-y-1">
                        <div>Risk Matching: {formData.weights.riskMatching || 40}%</div>
                        <div>Rate Priority: {formData.weights.ratePriority || 30}%</div>
                        <div>Capacity: {formData.weights.capacity || 20}%</div>
                        <div>Other: {formData.weights.other || 10}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    Financial Limits
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Min Investment:</span>
                      <span className="font-medium text-gray-900">
                        {formData.minInvestmentSlice ? `${formData.minInvestmentSlice.toLocaleString()} SAR` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rounding:</span>
                      <span className="font-medium text-gray-900">{formData.roundingRule || 'Nearest'}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">Concentration Limits:</span>
                      <div className="text-xs text-gray-600 mt-1">
                        Investor: ≤{formData.globalCaps.maxExposurePerInvestor}% |
                        Product: ≤{formData.globalCaps.maxProductExposure}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                    Execution & Schedule
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Run Behavior:</span>
                      <span className="font-medium text-gray-900 capitalize">{formData.runBehavior}</span>
                    </div>
                    {formData.runBehavior === 'batch' && (
                      <>
                        <div className="flex justify-between">
                          <span>Frequency:</span>
                          <span className="font-medium text-gray-900">{formData.scheduleFrequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Execution Time:</span>
                          <span className="font-medium text-gray-900">{formData.executionTime || '09:00'}</span>
                        </div>
                      </>
                    )}
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">Expected Impact:</span>
                      <div className="text-xs text-gray-600 mt-1">
                        {formData.runBehavior === 'realtime' && 'Immediate allocation upon fund availability'}
                        {formData.runBehavior === 'batch' && 'Scheduled processing with optimized batching'}
                        {formData.runBehavior === 'manual' && 'Manual review required for each allocation'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                    Notifications
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Failure Alerts:</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        formData.notifications.allocationFailure
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formData.notifications.allocationFailure ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Exposure Alerts:</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        formData.notifications.exposureThreshold
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formData.notifications.exposureThreshold ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Manual Approval:</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        formData.notifications.manualApproval
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formData.notifications.manualApproval ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Success Summary:</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        formData.notifications.successSummary
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {formData.notifications.successSummary ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">Recommended Next Steps</h4>
                  <div className="text-sm text-yellow-700 mt-1 space-y-1">
                    <p>• Run a simulation to validate strategy performance with current market data</p>
                    <p>• Review with risk management team if this is a new strategy type</p>
                    <p>• Ensure operations team is aware of new allocation patterns</p>
                    <p>• Consider starting with a limited pilot before full deployment</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-900">Strategy Ready for Publication</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your allocation strategy is properly configured and ready to go live.
                    Once published, it will begin processing allocations according to your specifications.
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
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Strategies
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Allocation Strategy</h1>
              <p className="text-gray-600">Configure automated investment allocation rules</p>
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
          <span className="text-xs text-gray-500">Basic Info</span>
          <span className="text-xs text-gray-500">Risk Mapping</span>
          <span className="text-xs text-gray-500">Rules</span>
          <span className="text-xs text-gray-500">Limits</span>
          <span className="text-xs text-gray-500">Schedule</span>
          <span className="text-xs text-gray-500">Review</span>
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
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Save Draft
          </button>
          
          {currentStep === totalSteps ? (
            <div className="flex items-center space-x-3">
              <Link
                to={`/admin/allocation/strategies/simulate?preview=true`}
                className="px-4 py-2 text-sm font-medium text-black bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Simulate Before Publish
              </Link>
              <button
                onClick={handlePublish}
                disabled={!formData.name}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish Strategy
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
