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

  // Helper function to get product status text
  const getProductStatusText = (status: number) => {
    const statusMap = {
      0: 'Active',
      1: 'Inactive', 
      2: 'Closed',
      3: 'Suspended',
      4: 'Launching'
    };
    return statusMap[status as keyof typeof statusMap] || 'Unknown';
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
    { id: 'amounts', label: 'Amounts', icon: DollarSign },
    { id: 'tenure', label: 'Tenure', icon: Clock },
    { id: 'period', label: 'Period', icon: Calendar },
    { id: 'returns', label: 'Returns', icon: TrendingUp },
    { id: 'investors', label: 'Investors', icon: Users },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ];

  // Validation function - only validate when user has entered invalid values
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Only show errors if user has entered values but they are invalid
    if (configData.minimumInvestment < 0) {
      errors.minimumInvestment = 'Enter valid minimum investment amount.';
    }

    if (configData.maximumInvestment < 0) {
      errors.maximumInvestment = 'Enter valid maximum investment amount.';
    }

    if (configData.minimumTenure < 0) {
      errors.minimumTenure = 'Enter valid minimum investment tenure.';
    }

    if (configData.maximumTenure < 0) {
      errors.maximumTenure = 'Enter valid maximum investment tenure.';
    }

    // Validate relationships only if both values are provided
    if (configData.minimumInvestment > 0 && configData.maximumInvestment > 0) {
      if (configData.maximumInvestment <= configData.minimumInvestment) {
        errors.maximumInvestment = 'Maximum investment must be greater than minimum investment';
      }
    }

    if (configData.minimumTenure > 0 && configData.maximumTenure > 0) {
      if (configData.maximumTenure <= configData.minimumTenure) {
        errors.maximumTenure = 'Maximum tenure must be greater than minimum tenure';
      }
    }

    // Validate returns based on return type
    if (configData.returnType === 'fixed') {
      if (configData.fixedReturnPercentage <= 0) {
        errors.fixedReturnPercentage = 'Fixed return percentage is required';
      }
      if (configData.fixedReturnPercentage > 100) {
        errors.fixedReturnPercentage = 'Fixed return percentage cannot exceed 100%';
      }
    } else if (configData.returnType === 'average') {
      if (configData.expectedReturnMin > 0 && configData.expectedReturnMax > 0) {
        if (configData.expectedReturnMax <= configData.expectedReturnMin) {
          errors.expectedReturnMax = 'Maximum return must be greater than minimum return';
        }
      }
    }

    if (configData.maxInvestors > 0 && configData.minInvestorsToActivate > 0) {
      if (configData.minInvestorsToActivate > configData.maxInvestors) {
        errors.minInvestorsToActivate = 'Minimum investors to activate must be less than or equal to maximum investors';
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
            
              toast.error('Failed to load product data');
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
        
            toast.error('Error loading product data');
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
        toast.error('Failed to load currencies');
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
        toast.error('Product ID is required');
        return;
      }
      if (activeTab !== 'advanced') {
        const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (currentTabIndex < tabs.length - 1) {
          const nextTab = tabs[currentTabIndex + 1];

          // Simulate processing time before moving to next tab
          await new Promise(resolve => setTimeout(resolve, 500));

          setActiveTab(nextTab.id);
          toast.success(`Configuration saved! Moving to ${nextTab.label} tab`);
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
          toast.success(response.notificationMessage || 'Configuration updated successfully!');
          navigate('/InvestorDashboard/Products');
        } else {
          if (response.errors && Array.isArray(response.errors)) {
            response.errors.forEach((error: string) => {
              toast.error(error);
            });
          } else {
            toast.error(response?.notificationMessage || 'Failed to update configuration');
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
          toast.success(response.notificationMessage || 'Configuration saved successfully!');
          navigate('/InvestorDashboard/Products');
        } else {
          if (response.errors && Array.isArray(response.errors)) {
            response.errors.forEach((error: string) => {
              toast.error(error);
            });
          } else {
            toast.error(response?.notificationMessage || 'Failed to save configuration');
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
        toast.error(err?.response?.errors || 'An error occurred while saving configuration');
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
      toast.error('Product ID is required');
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
          
          toast.success(response?.notificationMessage || 'Configuration loaded successfully. You can now edit the fields.');
        } else {
          toast.error('Failed to load configuration details');
        }
      } else {
        toast.error('No existing configuration found for this product');
      }
    } catch (error: any) {
      console.error('Error fetching configuration:', error);
      toast.error(error?.message || 'Failed to load existing configuration');
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
    const riskLevels = ['Low', 'Medium', 'High', 'Very High', 'Extreme'];
    return riskLevels[value] || 'Low';
  };

  const getReturnTermText = (value: number) => {
    const returnTerms = ['Quarterly', 'SemiAnnually', 'Annually', 'OnMaturity'];
    return returnTerms[value] || 'Quarterly';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'amounts':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Minimum Investment Amount *
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
                  <p className="text-xs text-black mt-1">The minimum amount an investor can invest</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Maximum Investment Amount *
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
                  <p className="text-xs text-black mt-1">The maximum amount an investor can invest</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Investment Increment
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
                <p className="text-xs text-black mt-1">Investment must be in multiples of this amount</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Base Currency
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
                <p className="text-xs text-black mt-1">Primary currency for this investment product</p>
              </div>
            </div>
          </div>
        );

      case 'tenure':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-2">Investment Tenure Configuration</h3>
              <p className="text-sm text-black mb-6">Set minimum and maximum investment tenure periods</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Minimum Investment Tenure *
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
                    <option value="0">Select Unit</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                    <option value="Days">Days</option>
                  </select>
                </div>
                {validationErrors.minimumTenure && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.minimumTenure}</p>
                )}
                {!validationErrors.minimumTenure && (
                  <p className="text-xs text-black mt-1">Minimum time investment must be held</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Maximum Investment Tenure *
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
                    <option value="0">Select Unit</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                    <option value="Days">Days</option>
                  </select>
                </div>
                {validationErrors.maximumTenure && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.maximumTenure}</p>
                )}
                {!validationErrors.maximumTenure && (
                  <p className="text-xs text-black mt-1">Maximum time investment can be held</p>
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
                <label htmlFor="earlyWithdrawal" className="ml-2 text-sm font-medium text-black">
                  Allow Early Withdrawal
                </label>
              </div>
              <p className="text-xs text-black mb-4">Permit investors to withdraw before tenure completion</p>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Early Withdrawal Penalty (%)
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
                  <p className="text-xs text-black mt-1">Percentage penalty applied on early withdrawal</p>
                </div>
              </div>
            </div>

            {/* Tenure Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>Tenure Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">Min Tenure:</span>
                  <span className="ml-2 text-black">{configData.minimumTenure} {configData.tenureUnit.toLowerCase()}</span>
                </div>
                <div>
                  <span className="font-medium text-black">Max Tenure:</span>
                  <span className="ml-2 text-black">{configData.maximumTenure} {configData.tenureUnit.toLowerCase()}</span>
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
                  <label htmlFor="autoRenewal" className="ml-2 text-sm font-medium text-black">
                    Auto-Renewal
                  </label>
                </div>
                <p className="text-xs text-black">Automatically renew investment at maturity</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-black mb-4">Principal Withdrawal Settings</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Principal Withdrawal Percentage at Maturity (%)
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
                  <p className="text-xs text-black mt-1">Percentage of principal amount investor can withdraw at maturity</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Withdrawal Processing Time (Days)
                  </label>
                  <input
                    value={configData.withdrawalProcessingDays}
                    onChange={(e) => setConfigData(prev => ({ ...prev, withdrawalProcessingDays: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                    placeholder="0"
                  />
                  <p className="text-xs text-black mt-1">Number of days to process withdrawal requests</p>
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
                  <label htmlFor="partialWithdrawal" className="ml-2 text-sm font-medium text-black">
                    Allow Partial Withdrawal
                  </label>
                </div>
                <p className="text-xs text-black">Allow investors to withdraw partial principal amount</p>
              </div>
            </div>

            {/* Investment Period Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>Investment Period Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">Principal Withdrawal:</span>
                  <span className="ml-2 text-black">{configData.principalWithdrawalPercentage || 0}% at maturity</span>
                </div>
                <div>
                  <span className="font-medium text-black">Processing Time:</span>
                  <span className="ml-2 text-black">{configData.withdrawalProcessingDays || 0} days</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'returns':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-2">Returns & Profit Distribution</h3>
              <p className="text-sm text-black mb-6">Configure expected returns and profit distribution settings</p>
            </div>

            {/* Return Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-3">Return Type *</label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="returnType"
                    value="fixed"
                    checked={configData.returnType === 'fixed'}
                    onChange={() => setConfigData(prev => ({ ...prev, returnType: 'fixed' as 'fixed' | 'average' }))}
                    className="text-[#10B981] border-gray-300 mr-2"
                    style={{ accentColor: 'var(--foreground)' }}
                  />
                  <span className="text-sm text-black ml-2">Fixed Return</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="returnType"
                    value="average"
                    checked={configData.returnType === 'average'}
                    onChange={() => setConfigData(prev => ({ ...prev, returnType: 'average' as 'fixed' | 'average' }))}
                    className="text-[#10B981] border-gray-300  mr-2"
                    style={{ accentColor: 'var(--foreground)' }}
                  />
                  <span className="text-sm  text-black ml-2">Average Return</span>
                </label>
              </div>
            </div>

            {/* Fixed Return Field */}
            {configData.returnType === 'fixed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Fixed Return Percentage *
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
                  <p className="text-xs text-black mt-1">Fixed return percentage (cannot exceed 100%)</p>
                </div>
              </div>
            )}

            {/* Average Return Fields */}
            {configData.returnType === 'average' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Expected Return (Min %) *
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
                  <p className="text-xs text-black mt-1">Minimum expected annual return percentage</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Expected Return (Max %) *
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
                  <p className="text-xs text-black mt-1">Maximum expected annual return percentage</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Profit Distribution Frequency *
                </label>
                <select
                  value={configData.profitDistributionFrequency}
                  onChange={(e) => setConfigData(prev => ({ ...prev, profitDistributionFrequency: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  required
                >
                  <option value={0}>Quarterly</option>
                  <option value={1}>SemiAnnually</option>
                  <option value={2}>Annually</option>
                  <option value={3}>OnMaturity</option>
                </select>
                <p className="text-xs text-black mt-1">How often profits are distributed to investors</p>
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
                <div className="ml-2">
                  <label htmlFor="guaranteedReturn" className="text-sm font-medium text-black">
                    Guaranteed Return
                  </label>
                  <p className="text-xs text-black">Return rate is guaranteed regardless of performance</p>
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
                <div className="ml-2">
                  <label htmlFor="enableCompounding" className="text-sm font-medium text-black">
                    Enable Compounding
                  </label>
                  <p className="text-xs text-black">Allow profits to be reinvested automatically</p>
                </div>
              </div>
            </div>

            {/* Returns Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>Returns Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">Expected Return:</span>
                  <span className="ml-2 text-black">
                    {configData.returnType === 'fixed' 
                      ? `${configData.fixedReturnPercentage || 0}% (Fixed)`
                      : `${configData.expectedReturnMin || 0}% - ${configData.expectedReturnMax || 0}% (Average)`
                    }
                  </span>
                </div>
                <div>
                  <span className="font-medium text-black">Distribution:</span>
                  <span className="ml-2 text-black">{getReturnTermText(configData.profitDistributionFrequency)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'investors':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-2">Investor Settings</h3>
              <p className="text-sm text-black mb-6">Configure investor limits and participation rules</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Maximum Number of Investors *
                </label>
                <input
                  value={configData.maxInvestors}
                  onChange={(e) => setConfigData(prev => ({ ...prev, maxInvestors: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                  placeholder="0"
                />
                <p className="text-xs text-black mt-1">Maximum number of investors allowed for this product</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Min Investors to Activate
                </label>
                <input
                  value={configData.minInvestorsToActivate}
                  onChange={(e) => setConfigData(prev => ({ ...prev, minInvestorsToActivate: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                  placeholder="0"
                />
                <p className="text-xs text-black mt-1">Minimum investors required before product activation</p>
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
                <div className="ml-2">
                  <label htmlFor="allowMultipleInvestments" className="text-sm font-medium text-black">
                    Allow Multiple Investments per User
                  </label>
                  <p className="text-xs text-black">User can make multiple investments in this product</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Maximum Investments per User
                  </label>
                  <input
                    value={configData.maxInvestmentsPerUser}
                    onChange={(e) => setConfigData(prev => ({ ...prev, maxInvestmentsPerUser: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black placeholder:text-black"
                    placeholder="0"
                    disabled={!configData.allowMultipleInvestments}
                  />
                  <p className="text-xs text-black mt-1">Maximum number of investments a single user can make</p>
                </div>
              </div>
            </div>

            {/* Investor Settings Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>Investor Settings Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">Max Investors:</span>
                  <span className="ml-2 text-black">{configData.maxInvestors.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-black">Min to Activate:</span>
                  <span className="ml-2 text-black">{configData.minInvestorsToActivate || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-2">Advanced Configuration</h3>
              <p className="text-sm text-black mb-6">Additional settings and compliance requirements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Risk Level
                </label>
                <select
                  value={configData.riskLevel}
                  onChange={(e) => setConfigData(prev => ({ ...prev, riskLevel: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                >
                  <option value={0}>Low</option>
                  <option value={1}>Medium</option>
                  <option value={2}>High</option>
                  <option value={3}>Very High</option>
                  <option value={4}>Extreme</option>
                </select>
                <p className="text-xs text-black mt-1">Risk classification for this investment product</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Processing Fee *
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
                <p className="text-xs text-black mt-1">Processing fee charged for this product</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                 Investment Collection Limit 
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
                <p className="text-xs text-black mt-1">Processing fee charged for this product</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  VAT *
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
                <p className="text-xs text-black mt-1">VAT percentage applied to this product</p>
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
                <div className="ml-2">
                  <label htmlFor="shariahCompliant" className="text-sm font-medium text-black">
                    Shariah Compliant
                  </label>
                  <p className="text-xs text-black">Product follows Shariah compliance principles</p>
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
                <div className="ml-2">
                  <label htmlFor="kycRequired" className="text-sm font-medium text-black">
                    KYC Required
                  </label>
                  <p className="text-xs text-black">Require KYC verification before investment</p>
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
                <div className="ml-2">
                  <label htmlFor="regulatoryApprovalRequired" className="text-sm font-medium text-black">
                    Regulatory Approval Required
                  </label>
                  <p className="text-xs text-black">Require regulatory approval before activation</p>
                </div>
              </div>

            </div>


            {/* Advanced Settings Summary */}
            <div style={{ backgroundColor: 'var(--color-surface-mint)' }} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>Advanced Settings Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black">Risk Level:</span>
                  <span className="ml-2 text-black">{getRiskLevelText(configData.riskLevel)}</span>
                </div>
                <div>
                  <span className="font-medium text-black">Processing Fee:</span>
                  <span className="ml-2 text-black">SAR {configData.processingFee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-black">VAT:</span>
                  <span className="ml-2 text-black">{configData.vat}%</span>
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
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-black mr-2 ml-2">
                {isEditMode ? 'Edit Investment Configuration' : 'Investment Configuration'}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product?.productStatus === 0 ? 'bg-green-100 text-green-800' : // Active
                product?.productStatus === 1 ? 'bg-gray-100 text-gray-800' : // Inactive
                product?.productStatus === 2 ? 'bg-red-100 text-red-800' : // Closed
                product?.productStatus === 3 ? 'bg-yellow-100 text-yellow-800' : // Suspended
                product?.productStatus === 4 ? 'bg-gray-100 text-gray-900' : // Launching
                'bg-gray-100 text-gray-800' // Default
              }`}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {product ? getProductStatusText(product.productStatus) : 'Loading...'}
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
                <Settings className="w-4 h-4 mr-2" />
                Edit Configuration
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
          <div className="ml-3">
            <p className="text-sm text-gray-800">
              <strong>Important:</strong> Changes to investment configuration will only apply to new investments. Existing investments will continue with their original settings.
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
                <Icon className="w-4 h-4 mr-2" />
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
          <h3 className="text-lg font-medium text-black mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>Configuration Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-black">Min Investment:</span>
              <span className="ml-2 text-black">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  const currencyDisplay = selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                  return `${configData.minimumInvestment > 0 ? configData.minimumInvestment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'} ${currencyDisplay}`;
                })()}
              </span>
            </div>
            <div>
              <span className="font-medium text-black">Max Investment:</span>
              <span className="ml-2 text-black">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  const currencyDisplay = selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                  return `${configData.maximumInvestment > 0 ? configData.maximumInvestment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'} ${currencyDisplay}`;
                })()}
              </span>
            </div>
            <div>
              <span className="font-medium text-black">Increment:</span>
              <span className="ml-2 text-black">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  const currencyDisplay = selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                  return `${configData.investmentIncrement > 0 ? configData.investmentIncrement.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'} ${currencyDisplay}`;
                })()}
              </span>
            </div>
            <div>
              <span className="font-medium text-black">Currency:</span>
              <span className="ml-2 text-black">
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
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <Loader />
              {activeTab === 'advanced' ? 'Saving...' : 'Processing...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {activeTab === 'advanced' ? 'Save Configuration' : (() => {
                const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
                const nextTab = tabs[currentTabIndex + 1];
                return `Continue to ${nextTab.label}`;
              })()}
            </>
          )}
        </button>
      </div>
   
    </div>
  );
}
