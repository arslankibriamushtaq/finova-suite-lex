import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Settings,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Product,
  createProductConfiguration,
  ProductConfigurationCreateRequest,
  ProductConfigurationUpdateRequest,
  updateProductConfiguration,
  getAllCurrencies,
  getProductById,
  getProductConfigurationByProductId,
  getProductConfigurationById,
  Currency
} from '../../../../redux/apis/apisInvestor';
import type { ProductConfiguration } from '../../../../redux/apis/apisInvestor';
import toast from 'react-hot-toast';
import Loader from '../../../../components/Loader/Loader';

interface ConfigurationData {
  // Amounts tab
  minimumInvestment: number;
  maximumInvestment: number;
  investmentIncrement: number;
  baseCurrency: string;
  investementLimit:number;
  // Tenure tab
  minimumTenure: number;
  maximumTenure: number;
  tenureUnit: string;
  earlyWithdrawalAllowed: boolean;
  earlyWithdrawalPenalty: number;

  // Period tab
  investmentPeriodDuration: number;
  investmentPeriodUnit: string;
  lockInPeriod: number;
  lockInUnit: string;
  autoRenewal: boolean;
  principalWithdrawalPercentage: number;
  withdrawalProcessingDays: number;
  allowPartialWithdrawal: boolean;

  // Returns tab
  returnType: 'fixed' | 'average';
  fixedReturnPercentage: number;
  expectedReturnMin: number;
  expectedReturnMax: number;
  profitDistributionFrequency: number;
  guaranteedReturn: boolean;
  enableCompounding: boolean;

  // Investors tab
  maxInvestors: number;
  minInvestorsToActivate: number;
  allowMultipleInvestments: boolean;
  maxInvestmentsPerUser: number;

  // Advanced tab
  riskLevel: number;
  processingFee: number;
  vat: number;
  shariahCompliant: boolean;
  kycRequired: boolean;
  regulatoryApprovalRequired: boolean;
}

const initialConfigData: ConfigurationData = {
  minimumInvestment: 0,
  maximumInvestment: 0,
  investementLimit:0,
  investmentIncrement: 0,
  baseCurrency: 'SAR',
  minimumTenure: 0,
  maximumTenure: 0,
  tenureUnit: '0',
  earlyWithdrawalAllowed: false,
  earlyWithdrawalPenalty: 0,
  investmentPeriodDuration: 0,
  investmentPeriodUnit: '0',
  lockInPeriod: 0,
  lockInUnit: '0',
  autoRenewal: false,
  principalWithdrawalPercentage: 0,
  withdrawalProcessingDays: 0,
  allowPartialWithdrawal: false,
  returnType: 'average' as 'fixed' | 'average',
  fixedReturnPercentage: 0,
  expectedReturnMin: 0,
  expectedReturnMax: 0,
  profitDistributionFrequency: 0,
  guaranteedReturn: false,
  enableCompounding: false,
  maxInvestors: 0,
  minInvestorsToActivate: 0,
  allowMultipleInvestments: false,
  maxInvestmentsPerUser: 0,
  riskLevel: 0, // Default to Low risk (0)
  processingFee: 0,
  vat: 0,
  shariahCompliant: false,
  kycRequired: false,
  regulatoryApprovalRequired: false
};

export default function ProductConfiguration() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('investor');

  // Helper function to get product status text
  const getProductStatusText = (status: number) => {
    const statusMap = {
      0: 'pln.status.active',
      1: 'pln.status.inactive',
      2: 'pln.status.closed',
      3: 'pln.status.suspended',
      4: 'pln.status.launching'
    };
    const key = statusMap[status as keyof typeof statusMap];
    return key ? t(key) : t('pln.status.unknown');
  };
  const tenureUnitLabel = (v: string) => {
    const m: Record<string, string> = { Months: 'pc.unit.months', Years: 'pc.unit.years', Days: 'pc.unit.days' };
    return m[v] ? t(m[v]) : '';
  };
  const [activeTab, setActiveTab] = useState('amounts');
  const [product, setProduct] = useState<Product | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [configData, setConfigData] = useState<ConfigurationData>(initialConfigData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingConfiguration, setExistingConfiguration] = useState<ProductConfiguration | null>(null);
  const [loadingConfiguration, setLoadingConfiguration] = useState(false);

  const tabs = [
    { id: 'amounts', label: t('pc.tab.amounts'), icon: DollarSign },
    { id: 'tenure', label: t('pc.tab.tenure'), icon: Clock },
    { id: 'period', label: t('pc.tab.period'), icon: Calendar },
    { id: 'returns', label: t('pc.tab.returns'), icon: TrendingUp },
    { id: 'investors', label: t('pc.tab.investors'), icon: Users },
    { id: 'advanced', label: t('pc.tab.advanced'), icon: Settings }
  ];

  // Validation function - only validate when user has entered invalid values
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Only show errors if user has entered values but they are invalid
    if (configData.minimumInvestment < 0) {
      errors.minimumInvestment = t('pc.err.minInvestment');
    }

    if (configData.maximumInvestment < 0) {
      errors.maximumInvestment = t('pc.err.maxInvestment');
    }

    if (configData.minimumTenure < 0) {
      errors.minimumTenure = t('pc.err.minTenure');
    }

    if (configData.maximumTenure < 0) {
      errors.maximumTenure = t('pc.err.maxTenure');
    }

    // Validate relationships only if both values are provided
    if (configData.minimumInvestment > 0 && configData.maximumInvestment > 0) {
      if (configData.maximumInvestment <= configData.minimumInvestment) {
        errors.maximumInvestment = t('pc.err.maxGtMin');
      }
    }

    if (configData.minimumTenure > 0 && configData.maximumTenure > 0) {
      if (configData.maximumTenure <= configData.minimumTenure) {
        errors.maximumTenure = t('pc.err.maxTenureGtMin');
      }
    }

    // Validate returns based on return type
    if (configData.returnType === 'fixed') {
      if (configData.fixedReturnPercentage <= 0) {
        errors.fixedReturnPercentage = t('pc.err.fixedRequired');
      }
      if (configData.fixedReturnPercentage > 100) {
        errors.fixedReturnPercentage = t('pc.err.fixedMax');
      }
    } else if (configData.returnType === 'average') {
      if (configData.expectedReturnMin > 0 && configData.expectedReturnMax > 0) {
        if (configData.expectedReturnMax <= configData.expectedReturnMin) {
          errors.expectedReturnMax = t('pc.err.maxReturnGtMin');
        }
      }
    }

    if (configData.maxInvestors > 0 && configData.minInvestorsToActivate > 0) {
      if (configData.minInvestorsToActivate > configData.maxInvestors) {
        errors.minInvestorsToActivate = t('pc.err.minInvestorsLe');
      }
    }


    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch currencies and set mock product
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch currencies
        const currenciesResponse = await getAllCurrencies(1, 100);
        if (currenciesResponse.success) {
          setCurrencies(currenciesResponse.data);

          // Set default currency if available
          if (currenciesResponse.data.length > 0) {
            const defaultCurrency = currenciesResponse.data.find(c => c.currencyCode === 'SAR') || currenciesResponse.data[0];
            setConfigData(prev => ({ ...prev, baseCurrency: defaultCurrency.id }));
          }
        } else {
          // Fallback to a basic currency list if API fails
          setCurrencies([
            {
              id: 'cc572887-2bed-4b69-5187-08de0ca65c2f',
              name: 'US Dollar',
              currencyCode: 'USD',
              symbol: '$',
              decimalPlaces: 2,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]);
          setConfigData(prev => ({ ...prev, baseCurrency: 'cc572887-2bed-4b69-5187-08de0ca65c2f' }));
        }

        // Fetch actual product data
        if (productId) {
          try {
            const productResponse = await getProductById(productId);
            if (productResponse.success && productResponse.data) {
              setProduct(productResponse.data);
           
            } else {
            
              toast.error(t('pc.toast.loadProductFailed'));
              // Set fallback product data
              setProduct({
                id: productId,
                name: 'Unknown Product',
                code: '',
                type: '',
                expectedReturn: 0,
                minimumInvestment: 0,
                productCategory: 0,
                description: '',
                productStatus: 0,
                launchDate: new Date().toISOString(),
                investmentDuration: 0,
                segmentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          } catch (error) {
        
            toast.error(t('pc.toast.loadProductError'));
            // Set fallback product data
            setProduct({
              id: productId,
              name: 'Unknown Product',
              code: '',
              type: '',
              expectedReturn: 0,
              minimumInvestment: 0,
              productCategory: 0,
              description: '',
              productStatus: 0,
              launchDate: new Date().toISOString(),
              investmentDuration: 0,
              segmentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }

      } catch (err) {
        console.error('Error fetching currencies:', err);
        toast.error(t('pc.toast.loadCurrenciesFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Log the product ID for debugging
  }, [productId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!productId) {
        toast.error(t('pc.toast.productIdRequired'));
        return;
      }
      if (activeTab !== 'advanced') {
        const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (currentTabIndex < tabs.length - 1) {
          const nextTab = tabs[currentTabIndex + 1];

          // Simulate processing time before moving to next tab
          await new Promise(resolve => setTimeout(resolve, 500));

          setActiveTab(nextTab.id);
          toast.success(t('pc.toast.savedMovingTo', { tab: nextTab.label }));
        } else {
          // This shouldn't happen, but just in case
          // toast.info('All tabs completed!');
        }
        setSaving(false);
        return;
      }

      const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
      const currencyId = selectedCurrency?.id || 'cc572887-2bed-4b69-5187-08de0ca65c2f';
     

      // Map tenure unit to number
      const tenureUnitMap: { [key: string]: number } = {
        '0': 0,
        'Months': 1,
        'Years': 2,
        'Days': 3
      };

      if (isEditMode && existingConfiguration) {
        // Update existing configuration
        const updatePayload: ProductConfigurationUpdateRequest = {
          id: existingConfiguration.id, // Include the ID from the existing configuration
          productId,
          segmentId: product?.segmentId || existingConfiguration.segmentId || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          currencyId,
          minimumInvestmentAmount: configData.minimumInvestment,
          maximumInvestmentAmount: configData.maximumInvestment,
          fixedPercentageAmount: configData.returnType === 'fixed' ? configData.fixedReturnPercentage : 0,
          investmentIncrement: configData.investmentIncrement,
          investmentLimit: configData.investementLimit,
          
          availableBalance: existingConfiguration.availableBalance || 0,
          minimumInvestmentTenure: configData.minimumTenure,
          minimumInvestmentTenureUnit: tenureUnitMap[configData.tenureUnit] || 0,
          maximumInvestmentTenure: configData.maximumTenure,
          maximumInvestmentTenureUnit: tenureUnitMap[configData.tenureUnit] || 0,
          earlyWithdrawalPenalty: configData.earlyWithdrawalPenalty,
          withdrawalPercentageAtMaturity: configData.principalWithdrawalPercentage,
          withdrawalProcessingDays: configData.withdrawalProcessingDays,
          minimumExpectedReturnPercentage: configData.returnType === 'average' ? configData.expectedReturnMin : 0,
          maximumExpectedReturnPercentage: configData.returnType === 'average' ? configData.expectedReturnMax : 0,
          profitDistributionFrequency: configData.profitDistributionFrequency,
          maximumInvestors: configData.maxInvestors,
          minimumInvestors: configData.minInvestorsToActivate,
          minimumInvestmentsPerUser: configData.maxInvestmentsPerUser || 1,
          riskLevel: configData.riskLevel,
          processingFee: configData.processingFee,
          vat: configData.vat
        };

    
        const response = await updateProductConfiguration(updatePayload);
      
        
        if (response.success) {
          toast.success(response.notificationMessage || t('pc.toast.updated'));
          navigate('/InvestorDashboard/Products');
        } else {
          if (response.errors && Array.isArray(response.errors)) {
            response.errors.forEach((error: string) => {
              toast.error(error);
            });
          } else {
            toast.error(response?.notificationMessage || t('pc.toast.updateFailed'));
          }
        }
      } else {
        // Create new configuration
        const apiPayload: ProductConfigurationCreateRequest = {
          productId,
          segmentId: product?.segmentId || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          currencyId,
          minimumInvestmentAmount: configData.minimumInvestment,
          maximumInvestmentAmount: configData.maximumInvestment,
          fixedPercentageAmount: configData.returnType === 'fixed' ? configData.fixedReturnPercentage : 0,
          investmentIncrement: configData.investmentIncrement,
          investmentLimit: configData.investementLimit,
          minimumInvestmentTenure: configData.minimumTenure,
          minimumInvestmentTenureUnit: tenureUnitMap[configData.tenureUnit] || 0,
          maximumInvestmentTenure: configData.maximumTenure,
          maximumInvestmentTenureUnit: tenureUnitMap[configData.tenureUnit] || 0,
          earlyWithdrawalPenalty: configData.earlyWithdrawalPenalty,
          withdrawalPercentageAtMaturity: configData.principalWithdrawalPercentage,
          withdrawalProcessingDays: configData.withdrawalProcessingDays,
          minimumExpectedReturnPercentage: configData.returnType === 'average' ? configData.expectedReturnMin : 0,
          maximumExpectedReturnPercentage: configData.returnType === 'average' ? configData.expectedReturnMax : 0,
          profitDistributionFrequency: configData.profitDistributionFrequency,
          maximumInvestors: configData.maxInvestors,
          minimumInvestors: configData.minInvestorsToActivate,
          minimumInvestmentsPerUser: configData.maxInvestmentsPerUser || 1,
          riskLevel: configData.riskLevel,
          processingFee: configData.processingFee,
          vat: configData.vat
        };

      
        const response = await createProductConfiguration(apiPayload);
     
        if (response.data) {
          toast.success(response.notificationMessage || t('pc.toast.saved'));
          navigate('/InvestorDashboard/Products');
        } else {
          if (response.errors && Array.isArray(response.errors)) {
            response.errors.forEach((error: string) => {
              toast.error(error);
            });
          } else {
            toast.error(response?.notificationMessage || t('pc.toast.saveFailed'));
          }
        }
      }
    } catch (err: any) {
      // Handle errors from catch block
      if (err?.response?.errors && Array.isArray(err.response.errors)) {
        err.response.errors.forEach((error: string) => {
          toast.error(error);
        });
      } else {
        toast.error(err?.response?.errors || t('pc.toast.saveError'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Fetch existing configuration and pre-fill fields
  const handleEditConfiguration = async () => {
    if (!productId) {
      toast.error(t('pc.toast.productIdRequired'));
      return;
    }

    try {
      setLoadingConfiguration(true);
      // First, get the list of configurations for this product
      const listResponse = await getProductConfigurationByProductId(productId);
      
      if (listResponse.success && listResponse.data) {
      
        const configId = listResponse?.data?.id; // Get the first configuration's ID
        
        // Then, get the full configuration details by ID
        const response = await getProductConfigurationById(configId);
        
        if (response.success && response.data) {
          
          const config = response.data;
          setExistingConfiguration(config);
          setIsEditMode(true);
          
          // Map API response to component state
          const tenureUnitMap: { [key: number]: string } = {
            0: '0',
            1: 'Months',
            2: 'Years',
            3: 'Days'
          };
          
          setConfigData({
            minimumInvestment: config.minimumInvestmentAmount || 0,
            maximumInvestment: config.maximumInvestmentAmount || 0,
            investmentIncrement: config.investmentIncrement || 0,
            baseCurrency: config.currencyId || '',
            minimumTenure: config.minimumInvestmentTenure || 0,
            maximumTenure: config.maximumInvestmentTenure || 0,
            tenureUnit: tenureUnitMap[config.minimumInvestmentTenureUnit] || '0',
            earlyWithdrawalAllowed: config.earlyWithdrawalPenalty > 0,
            earlyWithdrawalPenalty: config.earlyWithdrawalPenalty || 0,
            investmentPeriodDuration: 0,
            investmentPeriodUnit: '0',
            lockInPeriod: 0,
            investementLimit:0,
            lockInUnit: '0',
            autoRenewal: false,
            principalWithdrawalPercentage: config.withdrawalPercentageAtMaturity || 0,
            withdrawalProcessingDays: config.withdrawalProcessingDays || 0,
            allowPartialWithdrawal: false,
            returnType: config.fixedPercentageAmount > 0 ? 'fixed' : 'average',
            fixedReturnPercentage: config.fixedPercentageAmount || 0,
            expectedReturnMin: config.minimumExpectedReturnPercentage || 0,
            expectedReturnMax: config.maximumExpectedReturnPercentage || 0,
            profitDistributionFrequency: config.profitDistributionFrequency || 0,
            guaranteedReturn: false,
            enableCompounding: false,
            maxInvestors: config.maximumInvestors || 0,
            minInvestorsToActivate: config.minimumInvestors || 0,
            allowMultipleInvestments: false,
            maxInvestmentsPerUser: config.minimumInvestmentsPerUser || 0,
            riskLevel: config.riskLevel || 0,
            processingFee: (config as any).processingFee || 0,
            vat: (config as any).vat || 0,
            shariahCompliant: false,
            kycRequired: false,
            regulatoryApprovalRequired: false
          });
          
          toast.success(response?.notificationMessage || t('pc.toast.loaded'));
        } else {
          toast.error(t('pc.toast.loadDetailsFailed'));
        }
      } else {
        toast.error(t('pc.toast.noConfig'));
      }
    } catch (error: any) {
      console.error('Error fetching configuration:', error);
      toast.error(error?.message || t('pc.toast.loadConfigFailed'));
    } finally {
      setLoadingConfiguration(false);
    }
  };

  // Clear validation error for a specific field
  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Helper function to convert enum values to display text
  const getRiskLevelText = (value: number) => {
    const riskLevels = ['pc.risk.low', 'pc.risk.medium', 'pc.risk.high', 'pc.risk.veryHigh', 'pc.risk.extreme'];
    return t(riskLevels[value] || 'pc.risk.low');
  };

  const getReturnTermText = (value: number) => {
    const returnTerms = ['pc.freq.quarterly', 'pc.freq.semiAnnually', 'pc.freq.annually', 'pc.freq.onMaturity'];
    return t(returnTerms[value] || 'pc.freq.quarterly');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'amounts':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.amounts.minLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.minimumInvestment}
                    onChange={(e) => {
                      setConfigData(prev => ({ ...prev, minimumInvestment: Number(e.target.value) }));
                      clearFieldError('minimumInvestment');
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-black placeholder:text-black ${
                      validationErrors.minimumInvestment 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-gray-500'
                    }`}
                    placeholder="0"
                  />
                  <select
                    value={configData.baseCurrency}
                    onChange={(e) => setConfigData(prev => ({ ...prev, baseCurrency: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-black focus:outline-none"
                  >
                    {currencies.map(currency => (
                      <option key={currency.id} value={currency.id}>
                        {currency.symbol || ''} {currency.name || currency.currencyCode}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.minimumInvestment && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.minimumInvestment}</p>
                )}
                {!validationErrors.minimumInvestment && (
                  <p className="text-xs text-black mt-1">{t('pc.amounts.minHelp')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.amounts.maxLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.maximumInvestment}
                    onChange={(e) => setConfigData(prev => ({ ...prev, maximumInvestment: Number(e.target.value) }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-black placeholder:text-black ${
                      validationErrors.maximumInvestment 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-gray-500'
                    }`}
                    placeholder="0"
                  />
                  <select
                    value={configData.baseCurrency}
                    onChange={(e) => setConfigData(prev => ({ ...prev, baseCurrency: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-black focus:outline-none"
                  >
                    {currencies.map(currency => (
                      <option key={currency.id} value={currency.id}>
                        {currency.symbol || ''} {currency.name || currency.currencyCode}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.maximumInvestment && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.maximumInvestment}</p>
                )}
                {!validationErrors.maximumInvestment && (
                  <p className="text-xs text-black mt-1">{t('pc.amounts.maxHelp')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.amounts.incrementLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.investmentIncrement}
                    onChange={(e) => setConfigData(prev => ({ ...prev, investmentIncrement: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                    placeholder="0"
                  />
                  <select
                    value={configData.baseCurrency}
                    onChange={(e) => setConfigData(prev => ({ ...prev, baseCurrency: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-black focus:outline-none"
                  >
                    {currencies.map(currency => (
                      <option key={currency.id} value={currency.id}>
                        {currency.symbol || ''} {currency.name || currency.currencyCode}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-black mt-1">{t('pc.amounts.incrementHelp')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.amounts.baseCurrencyLabel')}
                </label>
                <select
                  value={configData.baseCurrency}
                  onChange={(e) => setConfigData(prev => ({ ...prev, baseCurrency: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                >
                  {currencies.map(currency => (
                    <option key={currency.id} value={currency.id}>
                      {currency.symbol} {currency.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-black mt-1">{t('pc.amounts.baseCurrencyHelp')}</p>
              </div>
            </div>
          </div>
        );

      case 'tenure':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-2">{t('pc.tenure.title')}</h3>
              <p className="text-sm text-black mb-6">{t('pc.tenure.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.tenure.minLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.minimumTenure}
                    onChange={(e) => setConfigData(prev => ({ ...prev, minimumTenure: Number(e.target.value) }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-black placeholder:text-black ${
                      validationErrors.minimumTenure 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-gray-500'
                    }`}
                    placeholder="0"
                  />
                  <select
                    value={configData.tenureUnit}
                    onChange={(e) => setConfigData(prev => ({ ...prev, tenureUnit: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-black focus:outline-none"
                  >
                    <option value="0">{t('pc.unit.selectUnit')}</option>
                    <option value="Months">{t('pc.unit.months')}</option>
                    <option value="Years">{t('pc.unit.years')}</option>
                    <option value="Days">{t('pc.unit.days')}</option>
                  </select>
                </div>
                {validationErrors.minimumTenure && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.minimumTenure}</p>
                )}
                {!validationErrors.minimumTenure && (
                  <p className="text-xs text-black mt-1">{t('pc.tenure.minHelp')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.tenure.maxLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.maximumTenure}
                    onChange={(e) => setConfigData(prev => ({ ...prev, maximumTenure: Number(e.target.value) }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-black placeholder:text-black ${
                      validationErrors.maximumTenure 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-gray-500'
                    }`}
                    placeholder="0"
                  />
                  <select
                    value={configData.tenureUnit}
                    onChange={(e) => setConfigData(prev => ({ ...prev, tenureUnit: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-black focus:outline-none"
                  >
                    <option value="0">{t('pc.unit.selectUnit')}</option>
                    <option value="Months">{t('pc.unit.months')}</option>
                    <option value="Years">{t('pc.unit.years')}</option>
                    <option value="Days">{t('pc.unit.days')}</option>
                  </select>
                </div>
                {validationErrors.maximumTenure && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.maximumTenure}</p>
                )}
                {!validationErrors.maximumTenure && (
                  <p className="text-xs text-black mt-1">{t('pc.tenure.maxHelp')}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-6 hidden">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="earlyWithdrawal"
                  checked={configData.earlyWithdrawalAllowed}
                  onChange={(e) => setConfigData(prev => ({ ...prev, earlyWithdrawalAllowed: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-gray-500"
                />
                <label htmlFor="earlyWithdrawal" className="ms-2 text-sm font-medium text-black">
                  {t('pc.tenure.allowEarly')}
                </label>
              </div>
              <p className="text-xs text-black mb-4">{t('pc.tenure.allowEarlyHelp')}</p>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('pc.tenure.penaltyLabel')}
                  </label>
                  <div className="relative">
                    <input
                      step="0.01"
                      value={configData.earlyWithdrawalPenalty}
                      onChange={(e) => setConfigData(prev => ({ ...prev, earlyWithdrawalPenalty: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                      placeholder="0"
                      disabled={!configData.earlyWithdrawalAllowed}
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black">%</span>
                  </div>
                  <p className="text-xs text-black mt-1">{t('pc.tenure.penaltyHelp')}</p>
                </div>
              </div>
            </div>

            {/* Tenure Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.tenure.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">{t('pc.tenure.minTenure')}</span>
                  <span className="ms-2 text-black">{configData.minimumTenure} {tenureUnitLabel(configData.tenureUnit)}</span>
                </div>
                <div>
                  <span className="font-medium text-black">{t('pc.tenure.maxTenure')}</span>
                  <span className="ms-2 text-black">{configData.maximumTenure} {tenureUnitLabel(configData.tenureUnit)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'period':
        return (
          <div className="space-y-6">

            <div className="border-t pt-6 hidden">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="autoRenewal"
                    checked={configData.autoRenewal}
                    onChange={(e) => setConfigData(prev => ({ ...prev, autoRenewal: e.target.checked }))}
                    className="rounded border-gray-300 text-black focus:ring-gray-500"
                  />
                  <label htmlFor="autoRenewal" className="ms-2 text-sm font-medium text-black">
                    {t('pc.period.autoRenewal')}
                  </label>
                </div>
                <p className="text-xs text-black">{t('pc.period.autoRenewalHelp')}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-black mb-4">{t('pc.period.principalSettings')}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('pc.period.principalPctLabel')}
                  </label>
                  <div className="relative">
                    <input
                      step="0.01"
                      value={configData.principalWithdrawalPercentage}
                      onChange={(e) => setConfigData(prev => ({ ...prev, principalWithdrawalPercentage: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black">%</span>
                  </div>
                  <p className="text-xs text-black mt-1">{t('pc.period.principalPctHelp')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('pc.period.processingLabel')}
                  </label>
                  <input
                    value={configData.withdrawalProcessingDays}
                    onChange={(e) => setConfigData(prev => ({ ...prev, withdrawalProcessingDays: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                    placeholder="0"
                  />
                  <p className="text-xs text-black mt-1">{t('pc.period.processingHelp')}</p>
                </div>
              </div>

              <div className="mt-6 hidden">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="partialWithdrawal"
                    checked={configData.allowPartialWithdrawal}
                    onChange={(e) => setConfigData(prev => ({ ...prev, allowPartialWithdrawal: e.target.checked }))}
                    className="rounded border-gray-300 text-black focus:ring-gray-500"
                  />
                  <label htmlFor="partialWithdrawal" className="ms-2 text-sm font-medium text-black">
                    {t('pc.period.partial')}
                  </label>
                </div>
                <p className="text-xs text-black">{t('pc.period.partialHelp')}</p>
              </div>
            </div>

            {/* Investment Period Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.period.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">{t('pc.period.principalWithdrawal')}</span>
                  <span className="ms-2 text-black">{t('pc.period.atMaturity', { value: configData.principalWithdrawalPercentage || 0 })}</span>
                </div>
                <div>
                  <span className="font-medium text-black">{t('pc.period.processingTime')}</span>
                  <span className="ms-2 text-black">{t('pc.period.days', { value: configData.withdrawalProcessingDays || 0 })}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'returns':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-2">{t('pc.returns.title')}</h3>
              <p className="text-sm text-black mb-6">{t('pc.returns.subtitle')}</p>
            </div>

            {/* Return Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-3">{t('pc.returns.typeLabel')}</label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="returnType"
                    value="fixed"
                    checked={configData.returnType === 'fixed'}
                    onChange={() => setConfigData(prev => ({ ...prev, returnType: 'fixed' as 'fixed' | 'average' }))}
                    className="text-[#e60000] border-gray-300 me-2"
                    style={{ accentColor: 'var(--foreground)' }}
                  />
                  <span className="text-sm text-black ms-2">{t('pc.returns.fixed')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="returnType"
                    value="average"
                    checked={configData.returnType === 'average'}
                    onChange={() => setConfigData(prev => ({ ...prev, returnType: 'average' as 'fixed' | 'average' }))}
                    className="text-[#e60000] border-gray-300  me-2"
                    style={{ accentColor: 'var(--foreground)' }}
                  />
                  <span className="text-sm  text-black ms-2">{t('pc.returns.average')}</span>
                </label>
              </div>
            </div>

            {/* Fixed Return Field */}
            {configData.returnType === 'fixed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('pc.returns.fixedPctLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={configData.fixedReturnPercentage}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= 100) {
                          setConfigData(prev => ({ ...prev, fixedReturnPercentage: value }));
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                      placeholder="0"
                      required
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black">%</span>
                  </div>
                  <p className="text-xs text-black mt-1">{t('pc.returns.fixedPctHelp')}</p>
                </div>
              </div>
            )}

            {/* Average Return Fields */}
            {configData.returnType === 'average' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('pc.returns.minLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={configData.expectedReturnMin}
                      onChange={(e) => setConfigData(prev => ({ ...prev, expectedReturnMin: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                      placeholder="0"
                      required
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black">%</span>
                  </div>
                  <p className="text-xs text-black mt-1">{t('pc.returns.minHelp')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('pc.returns.maxLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={configData.expectedReturnMax}
                      onChange={(e) => setConfigData(prev => ({ ...prev, expectedReturnMax: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                      placeholder="0"
                      required
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black">%</span>
                  </div>
                  <p className="text-xs text-black mt-1">{t('pc.returns.maxHelp')}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.returns.freqLabel')}
                </label>
                <select
                  value={configData.profitDistributionFrequency}
                  onChange={(e) => setConfigData(prev => ({ ...prev, profitDistributionFrequency: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  required
                >
                  <option value={0}>{t('pc.freq.quarterly')}</option>
                  <option value={1}>{t('pc.freq.semiAnnually')}</option>
                  <option value={2}>{t('pc.freq.annually')}</option>
                  <option value={3}>{t('pc.freq.onMaturity')}</option>
                </select>
                <p className="text-xs text-black mt-1">{t('pc.returns.freqHelp')}</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4 hidden">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="guaranteedReturn"
                  checked={configData.guaranteedReturn}
                  onChange={(e) => setConfigData(prev => ({ ...prev, guaranteedReturn: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="guaranteedReturn" className="text-sm font-medium text-black">
                    {t('pc.returns.guaranteed')}
                  </label>
                  <p className="text-xs text-black">{t('pc.returns.guaranteedHelp')}</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableCompounding"
                  checked={configData.enableCompounding}
                  onChange={(e) => setConfigData(prev => ({ ...prev, enableCompounding: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="enableCompounding" className="text-sm font-medium text-black">
                    {t('pc.returns.compounding')}
                  </label>
                  <p className="text-xs text-black">{t('pc.returns.compoundingHelp')}</p>
                </div>
              </div>
            </div>

            {/* Returns Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.returns.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">{t('pc.returns.expectedReturn')}</span>
                  <span className="ms-2 text-black">
                    {configData.returnType === 'fixed'
                      ? t('pc.returns.summaryFixed', { value: configData.fixedReturnPercentage || 0 })
                      : t('pc.returns.summaryAverage', { min: configData.expectedReturnMin || 0, max: configData.expectedReturnMax || 0 })
                    }
                  </span>
                </div>
                <div>
                  <span className="font-medium text-black">{t('pc.returns.distribution')}</span>
                  <span className="ms-2 text-black">{getReturnTermText(configData.profitDistributionFrequency)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'investors':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-2">{t('pc.investors.title')}</h3>
              <p className="text-sm text-black mb-6">{t('pc.investors.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.investors.maxLabel')}
                </label>
                <input
                  value={configData.maxInvestors}
                  onChange={(e) => setConfigData(prev => ({ ...prev, maxInvestors: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                  placeholder="0"
                />
                <p className="text-xs text-black mt-1">{t('pc.investors.maxHelp')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.investors.minLabel')}
                </label>
                <input
                  value={configData.minInvestorsToActivate}
                  onChange={(e) => setConfigData(prev => ({ ...prev, minInvestorsToActivate: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                  placeholder="0"
                />
                <p className="text-xs text-black mt-1">{t('pc.investors.minHelp')}</p>
              </div>
            </div>

            <div className="border-t pt-6 hidden">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="allowMultipleInvestments"
                  checked={configData.allowMultipleInvestments}
                  onChange={(e) => setConfigData(prev => ({ ...prev, allowMultipleInvestments: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="allowMultipleInvestments" className="text-sm font-medium text-black">
                    {t('pc.investors.allowMultiple')}
                  </label>
                  <p className="text-xs text-black">{t('pc.investors.allowMultipleHelp')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('pc.investors.maxPerUserLabel')}
                  </label>
                  <input
                    value={configData.maxInvestmentsPerUser}
                    onChange={(e) => setConfigData(prev => ({ ...prev, maxInvestmentsPerUser: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                    placeholder="0"
                    disabled={!configData.allowMultipleInvestments}
                  />
                  <p className="text-xs text-black mt-1">{t('pc.investors.maxPerUserHelp')}</p>
                </div>
              </div>
            </div>

            {/* Investor Settings Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.investors.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">{t('pc.investors.maxInvestors')}</span>
                  <span className="ms-2 text-black">{configData.maxInvestors.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-black">{t('pc.investors.minToActivate')}</span>
                  <span className="ms-2 text-black">{configData.minInvestorsToActivate || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-2">{t('pc.advanced.title')}</h3>
              <p className="text-sm text-black mb-6">{t('pc.advanced.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.advanced.riskLabel')}
                </label>
                <select
                  value={configData.riskLevel}
                  onChange={(e) => setConfigData(prev => ({ ...prev, riskLevel: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                >
                  <option value={0}>{t('pc.risk.low')}</option>
                  <option value={1}>{t('pc.risk.medium')}</option>
                  <option value={2}>{t('pc.risk.high')}</option>
                  <option value={3}>{t('pc.risk.veryHigh')}</option>
                  <option value={4}>{t('pc.risk.extreme')}</option>
                </select>
                <p className="text-xs text-black mt-1">{t('pc.advanced.riskHelp')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.advanced.processingFeeLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configData.processingFee}
                    onChange={(e) => setConfigData(prev => ({ ...prev, processingFee: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                    placeholder="0"
                    required
                  />
                
                </div>
                <p className="text-xs text-black mt-1">{t('pc.advanced.processingFeeHelp')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                 {t('pc.advanced.collectionLimitLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configData.investementLimit}
                    onChange={(e) => setConfigData(prev => ({ ...prev, investementLimit: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                    placeholder="0"
                    required
                  />
                 
                </div>
                <p className="text-xs text-black mt-1">{t('pc.advanced.processingFeeHelp')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('pc.advanced.vatLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configData.vat}
                    onChange={(e) => setConfigData(prev => ({ ...prev, vat: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                    placeholder="0"
                    required
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black">%</span>
                </div>
                <p className="text-xs text-black mt-1">{t('pc.advanced.vatHelp')}</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4 hidden">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shariahCompliant"
                  checked={configData.shariahCompliant}
                  onChange={(e) => setConfigData(prev => ({ ...prev, shariahCompliant: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="shariahCompliant" className="text-sm font-medium text-black">
                    {t('pc.advanced.shariah')}
                  </label>
                  <p className="text-xs text-black">{t('pc.advanced.shariahHelp')}</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="kycRequired"
                  checked={configData.kycRequired}
                  onChange={(e) => setConfigData(prev => ({ ...prev, kycRequired: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="kycRequired" className="text-sm font-medium text-black">
                    {t('pc.advanced.kyc')}
                  </label>
                  <p className="text-xs text-black">{t('pc.advanced.kycHelp')}</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="regulatoryApprovalRequired"
                  checked={configData.regulatoryApprovalRequired}
                  onChange={(e) => setConfigData(prev => ({ ...prev, regulatoryApprovalRequired: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="regulatoryApprovalRequired" className="text-sm font-medium text-black">
                    {t('pc.advanced.regApproval')}
                  </label>
                  <p className="text-xs text-black">{t('pc.advanced.regApprovalHelp')}</p>
                </div>
              </div>

            </div>


            {/* Advanced Settings Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.advanced.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">{t('pc.advanced.riskLevel')}</span>
                  <span className="ms-2 text-black">{getRiskLevelText(configData.riskLevel)}</span>
                </div>
                <div>
                  <span className="font-medium text-black">{t('pc.advanced.processingFee')}</span>
                  <span className="ms-2 text-black">SAR {configData.processingFee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-black">{t('pc.advanced.vat')}</span>
                  <span className="ms-2 text-black">{configData.vat}%</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Loader/>
    );
  }

//   if (!product) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//         <p className="text-red-600">Product not found</p>
//         <button
//           onClick={() => navigate('/admin/products')}
//           className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//         >
//           Back to Products
//         </button>
//       </div>
//     );
//   }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="flex items-center text-black hover:text-black"
          >
            <ArrowLeft className="w-5 h-5 me-2" />
            {t('common:back')}
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-black me-2 ms-2">
                {isEditMode ? t('pc.header.editTitle') : t('pc.header.title')}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product?.productStatus === 0 ? 'bg-red-100 text-red-800' : // Active
                product?.productStatus === 1 ? 'bg-gray-100 text-gray-800' : // Inactive
                product?.productStatus === 2 ? 'bg-red-100 text-red-800' : // Closed
                product?.productStatus === 3 ? 'bg-yellow-100 text-yellow-800' : // Suspended
                product?.productStatus === 4 ? 'bg-gray-100 text-gray-900' : // Launching
                'bg-gray-100 text-gray-800' // Default
              }`}>
                <CheckCircle className="w-3 h-3 me-1" />
                {product ? getProductStatusText(product.productStatus) : t('pc.header.loading')}
              </span>
            </div>
          </div>
        </div>
        {!isEditMode && (
          <button
            onClick={handleEditConfiguration}
            disabled={loadingConfiguration}
            className="px-4 py-2 text-sm font-medium  bg-black rounded-lg text-white rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loadingConfiguration ? (
              <>
                <Loader  />

              </>
            ) : (
              <>
                <Settings className="w-4 h-4 me-2" />
                {t('pc.header.editConfig')}
              </>
            )}
          </button>
        )}
      </div>


      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ms-3">
            <p className="text-sm text-gray-800">
              <strong>{t('pc.banner.important')}</strong> {t('pc.banner.text')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border-b border-gray-200 mb-6 rounded-t-lg w-full">
        <nav className="-mb-px flex justify-between w-full px-4 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'border-gray-700 text-black'
                    : 'border-transparent text-black hover:text-black hover:border-gray-300'
                }`}
                style={{ color: 'var(--theme-heading-text-color)' }}
              >
                <Icon className="w-4 h-4 me-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        {renderTabContent()}
      </div>

      {/* Configuration Summary - Only show on Amounts tab */}
      {activeTab === 'amounts' && (
        <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.summary.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-black">{t('pc.summary.minInvestment')}</span>
              <span className="ms-2 text-black">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  const currencyDisplay = selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                  return `${configData.minimumInvestment > 0 ? configData.minimumInvestment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'} ${currencyDisplay}`;
                })()}
              </span>
            </div>
            <div>
              <span className="font-medium text-black">{t('pc.summary.maxInvestment')}</span>
              <span className="ms-2 text-black">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  const currencyDisplay = selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                  return `${configData.maximumInvestment > 0 ? configData.maximumInvestment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'} ${currencyDisplay}`;
                })()}
              </span>
            </div>
            <div>
              <span className="font-medium text-black">{t('pc.summary.increment')}</span>
              <span className="ms-2 text-black">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  const currencyDisplay = selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                  return `${configData.investmentIncrement > 0 ? configData.investmentIncrement.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'} ${currencyDisplay}`;
                })()}
              </span>
            </div>
            <div>
              <span className="font-medium text-black">{t('pc.summary.currency')}</span>
              <span className="ms-2 text-black">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  return selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {t('common:cancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <Loader />
              {activeTab === 'advanced' ? t('pc.action.saving') : t('pc.action.processing')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 me-2" />
              {activeTab === 'advanced' ? t('pc.action.saveConfig') : (() => {
                const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
                const nextTab = tabs[currentTabIndex + 1];
                return t('pc.action.continueTo', { tab: nextTab.label });
              })()}
            </>
          )}
        </button>
      </div>
   
    </div>
  );
}
