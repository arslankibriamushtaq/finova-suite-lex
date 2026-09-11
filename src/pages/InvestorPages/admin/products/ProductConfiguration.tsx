import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Settings,
  Loader2,
  Info,
  AlertTriangle
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
import { usePermissions } from '../../../../hooks/useProductPermissions';
import {
  PRODUCT_STATUSES,
  PROFIT_FREQUENCIES,
  RISK_LEVELS,
  enumToNumber,
  tenureUnitOf,
} from './productEnums';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Tabs } from '../../../../components/ui/tabs';
import { DetailTabsList, DetailTabsTrigger } from '../../../../components/shared/detailKit';
import { TONES } from '../../../../components/shared/detailKitUtils';
import { LexNotice, LexPageHeader } from '../../../../components/shared/lexKit';
import { cn } from '../../../../lib/utils';

/**
 * One control class for every field on this page.
 *
 * The originals tinted the placeholder the same colour as the value, so an
 * empty field read as a filled-in one.
 */
const FIELD =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
const FIELD_ERROR = 'border-destructive focus:ring-destructive';

/** ProductStatus, in service order. Active and Closed both used to render as
 *  `bg-red-100 text-red-800` — a live product and a closed one looked the same. */
const PRODUCT_STATUS_TONE = [
  TONES.emerald,
  TONES.slate,
  TONES.red,
  TONES.amber,
  TONES.sky,
];

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
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_PRODUCT_MANAGE');
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('investor');

  // Helper function to get product status text
  const getProductStatusText = (status: number | string) => {
    const statusMap = {
      0: 'pln.status.active',
      1: 'pln.status.inactive',
      2: 'pln.status.closed',
      3: 'pln.status.suspended',
      4: 'pln.status.launching'
    };
    const key = statusMap[enumToNumber(status, PRODUCT_STATUSES) as keyof typeof statusMap];
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
  // What the service rejected, verbatim. Only four fields have an inline slot,
  // and a rejection can name any of them — so the list is also shown whole.
  const [serverErrors, setServerErrors] = useState<string[]>([]);
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
        let currencyList: Currency[] = [];
        const currenciesResponse = await getAllCurrencies(1, 100);
        if (currenciesResponse.success) {
          currencyList = currenciesResponse.data;
          setCurrencies(currenciesResponse.data);

          // Set default currency if available
          if (currenciesResponse.data.length > 0) {
            const defaultCurrency = currenciesResponse.data.find(c => c.currencyCode === 'SAR') || currenciesResponse.data[0];
            setConfigData(prev => ({ ...prev, baseCurrency: defaultCurrency.id }));
          }
        } else {
          // Fallback to a basic currency list if API fails
          currencyList = [
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
          ];
          setCurrencies(currencyList);
          setConfigData(prev => ({ ...prev, baseCurrency: 'cc572887-2bed-4b69-5187-08de0ca65c2f' }));
        }

        // Fetch actual product data
        if (productId) {
          try {
            const productResponse = await getProductById(productId);
            if (productResponse.success && productResponse.data) {
              setProduct(productResponse.data);
              // GetById returns the configuration inline when there is one, so
              // the form opens filled instead of waiting for a button press.
              // `currencies` state is not committed yet inside this effect —
              // hand the freshly fetched list over rather than reading stale [].
              const inlineConfig = (productResponse.data as any).configuration;
              if (inlineConfig) applyConfiguration(inlineConfig, currencyList);
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
      // A fresh attempt starts from a clean slate — a stale list of reasons
      // above the tabs reads as though this save failed too.
      setServerErrors([]);

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
      // A rejected save arrives as HTTP 400 with the failing fields listed in
      // the body ("investmentIncrement: must be greater than 0"). It reaches
      // here as an ApiError carrying them; `err.response` is an axios shape
      // this file never produces, so reading it showed nothing at all.
      const reasons: string[] = Array.isArray(err?.errors)
        ? err.errors
        : Array.isArray(err?.response?.errors)
          ? err.response.errors
          : [];
      if (reasons.length) {
        setServerErrors(reasons);
        setValidationErrors((prev) => ({ ...prev, ...fieldErrorsFrom(reasons) }));
        toast.error(err?.notificationMessage || t('pc.toast.validationFailed'));
      } else {
        toast.error(err?.notificationMessage || err?.message || t('pc.toast.saveError'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  /**
   * Fill the form from a configuration record.
   *
   * This used to live inside the Edit button's handler, so a product that was
   * already configured opened with an empty form: the values existed, nothing
   * read them until the operator clicked. `Product/GetById` now returns the
   * configuration inline, so the same mapping runs on load.
   */
  const applyConfiguration = (config: any, currencyList: Currency[] = currencies) => {
    setExistingConfiguration(config);
    setIsEditMode(true);

    // The record names its currency by code; the picker is keyed by id.
    const currencyId =
      config.currencyId ||
      currencyList.find((c) => c.currencyCode === config.currencyCode)?.id ||
      '';

    setConfigData((prev) => ({
      ...prev,
      minimumInvestment: config.minimumInvestmentAmount || 0,
      maximumInvestment: config.maximumInvestmentAmount || 0,
      investmentIncrement: config.investmentIncrement || 0,
      // Was hardcoded to 0, so a saved limit was silently reset on every edit.
      investementLimit: config.investmentLimit || 0,
      baseCurrency: currencyId || prev.baseCurrency,
      minimumTenure: config.minimumInvestmentTenure || 0,
      maximumTenure: config.maximumInvestmentTenure || 0,
      tenureUnit: tenureUnitOf(config.minimumInvestmentTenureUnit),
      earlyWithdrawalAllowed: (config.earlyWithdrawalPenalty || 0) > 0,
      earlyWithdrawalPenalty: config.earlyWithdrawalPenalty || 0,
      principalWithdrawalPercentage: config.withdrawalPercentageAtMaturity || 0,
      withdrawalProcessingDays: config.withdrawalProcessingDays || 0,
      returnType: (config.fixedPercentageAmount || 0) > 0 ? 'fixed' : 'average',
      fixedReturnPercentage: config.fixedPercentageAmount || 0,
      expectedReturnMin: config.minimumExpectedReturnPercentage || 0,
      expectedReturnMax: config.maximumExpectedReturnPercentage || 0,
      profitDistributionFrequency: enumToNumber(
        config.profitDistributionFrequency,
        PROFIT_FREQUENCIES
      ),
      maxInvestors: config.maximumInvestors || 0,
      minInvestorsToActivate: config.minimumInvestors || 0,
      maxInvestmentsPerUser: config.minimumInvestmentsPerUser || 0,
      riskLevel: enumToNumber(config.riskLevel, RISK_LEVELS),
      processingFee: config.processingFee || 0,
      vat: config.vat || 0,
    }));
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
          
          applyConfiguration(response.data);
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

  /**
   * The service names its own fields ("minimumInvestmentTenure"), the form
   * names them differently ("minimumTenure"). Map the ones that have an inline
   * slot so the message lands under the input that caused it; the rest are
   * covered by the list above the tabs.
   */
  const SERVER_FIELD_TO_FORM: Record<string, string> = {
    minimumInvestmentAmount: 'minimumInvestment',
    maximumInvestmentAmount: 'maximumInvestment',
    minimumInvestmentTenure: 'minimumTenure',
    maximumInvestmentTenure: 'maximumTenure',
  };

  const fieldErrorsFrom = (reasons: string[]): { [key: string]: string } => {
    const mapped: { [key: string]: string } = {};
    for (const reason of reasons) {
      const [field, ...rest] = reason.split(':');
      const formField = SERVER_FIELD_TO_FORM[field.trim()];
      if (formField) mapped[formField] = (rest.join(':') || reason).trim();
    }
    return mapped;
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
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.amounts.minLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.minimumInvestment}
                    onChange={(e) => {
                      setConfigData(prev => ({ ...prev, minimumInvestment: Number(e.target.value) }));
                      clearFieldError('minimumInvestment');
                    }}
                    className={cn(FIELD, validationErrors.minimumInvestment && FIELD_ERROR)}
                    placeholder="0"
                  />
                  <select
                    value={configData.baseCurrency}
                    onChange={(e) => setConfigData(prev => ({ ...prev, baseCurrency: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-foreground focus:outline-none"
                  >
                    {currencies.map(currency => (
                      <option key={currency.id} value={currency.id}>
                        {currency.symbol || ''} {currency.name || currency.currencyCode}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.minimumInvestment && (
                  <p className="mt-1 text-xs text-destructive">{validationErrors.minimumInvestment}</p>
                )}
                {!validationErrors.minimumInvestment && (
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.amounts.minHelp')}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.amounts.maxLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.maximumInvestment}
                    onChange={(e) => setConfigData(prev => ({ ...prev, maximumInvestment: Number(e.target.value) }))}
                    className={cn(FIELD, validationErrors.maximumInvestment && FIELD_ERROR)}
                    placeholder="0"
                  />
                  <select
                    value={configData.baseCurrency}
                    onChange={(e) => setConfigData(prev => ({ ...prev, baseCurrency: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-foreground focus:outline-none"
                  >
                    {currencies.map(currency => (
                      <option key={currency.id} value={currency.id}>
                        {currency.symbol || ''} {currency.name || currency.currencyCode}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.maximumInvestment && (
                  <p className="mt-1 text-xs text-destructive">{validationErrors.maximumInvestment}</p>
                )}
                {!validationErrors.maximumInvestment && (
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.amounts.maxHelp')}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.amounts.incrementLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.investmentIncrement}
                    onChange={(e) => setConfigData(prev => ({ ...prev, investmentIncrement: Number(e.target.value) }))}
                    className={FIELD}
                    placeholder="0"
                  />
                  <select
                    value={configData.baseCurrency}
                    onChange={(e) => setConfigData(prev => ({ ...prev, baseCurrency: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-foreground focus:outline-none"
                  >
                    {currencies.map(currency => (
                      <option key={currency.id} value={currency.id}>
                        {currency.symbol || ''} {currency.name || currency.currencyCode}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t('pc.amounts.incrementHelp')}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.amounts.baseCurrencyLabel')}
                </label>
                <select
                  value={configData.baseCurrency}
                  onChange={(e) => setConfigData(prev => ({ ...prev, baseCurrency: e.target.value }))}
                  className={FIELD}
                >
                  {currencies.map(currency => (
                    <option key={currency.id} value={currency.id}>
                      {currency.symbol} {currency.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">{t('pc.amounts.baseCurrencyHelp')}</p>
              </div>
            </div>
          </div>
        );

      case 'tenure':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t('pc.tenure.title')}</h3>
              <p className="text-sm text-foreground mb-6">{t('pc.tenure.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.tenure.minLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.minimumTenure}
                    onChange={(e) => setConfigData(prev => ({ ...prev, minimumTenure: Number(e.target.value) }))}
                    className={cn(FIELD, validationErrors.minimumTenure && FIELD_ERROR)}
                    placeholder="0"
                  />
                  <select
                    value={configData.tenureUnit}
                    onChange={(e) => setConfigData(prev => ({ ...prev, tenureUnit: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-foreground focus:outline-none"
                  >
                    <option value="0">{t('pc.unit.selectUnit')}</option>
                    <option value="Months">{t('pc.unit.months')}</option>
                    <option value="Years">{t('pc.unit.years')}</option>
                    <option value="Days">{t('pc.unit.days')}</option>
                  </select>
                </div>
                {validationErrors.minimumTenure && (
                  <p className="mt-1 text-xs text-destructive">{validationErrors.minimumTenure}</p>
                )}
                {!validationErrors.minimumTenure && (
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.tenure.minHelp')}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.tenure.maxLabel')}
                </label>
                <div className="relative">
                  <input
                    value={configData.maximumTenure}
                    onChange={(e) => setConfigData(prev => ({ ...prev, maximumTenure: Number(e.target.value) }))}
                    className={cn(FIELD, validationErrors.maximumTenure && FIELD_ERROR)}
                    placeholder="0"
                  />
                  <select
                    value={configData.tenureUnit}
                    onChange={(e) => setConfigData(prev => ({ ...prev, tenureUnit: e.target.value }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-foreground focus:outline-none"
                  >
                    <option value="0">{t('pc.unit.selectUnit')}</option>
                    <option value="Months">{t('pc.unit.months')}</option>
                    <option value="Years">{t('pc.unit.years')}</option>
                    <option value="Days">{t('pc.unit.days')}</option>
                  </select>
                </div>
                {validationErrors.maximumTenure && (
                  <p className="mt-1 text-xs text-destructive">{validationErrors.maximumTenure}</p>
                )}
                {!validationErrors.maximumTenure && (
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.tenure.maxHelp')}</p>
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
                  className="rounded border-gray-300 text-foreground focus:ring-gray-500"
                />
                <label htmlFor="earlyWithdrawal" className="ms-2 text-sm font-medium text-foreground">
                  {t('pc.tenure.allowEarly')}
                </label>
              </div>
              <p className="text-xs text-foreground mb-4">{t('pc.tenure.allowEarlyHelp')}</p>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('pc.tenure.penaltyLabel')}
                  </label>
                  <div className="relative">
                    <input
                      step="0.01"
                      value={configData.earlyWithdrawalPenalty}
                      onChange={(e) => setConfigData(prev => ({ ...prev, earlyWithdrawalPenalty: Number(e.target.value) }))}
                      className={FIELD}
                      placeholder="0"
                      disabled={!configData.earlyWithdrawalAllowed}
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground">%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.tenure.penaltyHelp')}</p>
                </div>
              </div>
            </div>

            {/* Tenure Summary */}
            <div className="pro-card p-4">
              <h4 className="text-lg font-medium text-foreground mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.tenure.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">{t('pc.tenure.minTenure')}</span>
                  <span className="ms-2 text-foreground">{configData.minimumTenure} {tenureUnitLabel(configData.tenureUnit)}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('pc.tenure.maxTenure')}</span>
                  <span className="ms-2 text-foreground">{configData.maximumTenure} {tenureUnitLabel(configData.tenureUnit)}</span>
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
                    className="rounded border-gray-300 text-foreground focus:ring-gray-500"
                  />
                  <label htmlFor="autoRenewal" className="ms-2 text-sm font-medium text-foreground">
                    {t('pc.period.autoRenewal')}
                  </label>
                </div>
                <p className="text-xs text-foreground">{t('pc.period.autoRenewalHelp')}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-foreground mb-4">{t('pc.period.principalSettings')}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('pc.period.principalPctLabel')}
                  </label>
                  <div className="relative">
                    <input
                      step="0.01"
                      value={configData.principalWithdrawalPercentage}
                      onChange={(e) => setConfigData(prev => ({ ...prev, principalWithdrawalPercentage: Number(e.target.value) }))}
                      className={FIELD}
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground">%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.period.principalPctHelp')}</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('pc.period.processingLabel')}
                  </label>
                  <input
                    value={configData.withdrawalProcessingDays}
                    onChange={(e) => setConfigData(prev => ({ ...prev, withdrawalProcessingDays: Number(e.target.value) }))}
                    className={FIELD}
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.period.processingHelp')}</p>
                </div>
              </div>

              <div className="mt-6 hidden">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="partialWithdrawal"
                    checked={configData.allowPartialWithdrawal}
                    onChange={(e) => setConfigData(prev => ({ ...prev, allowPartialWithdrawal: e.target.checked }))}
                    className="rounded border-gray-300 text-foreground focus:ring-gray-500"
                  />
                  <label htmlFor="partialWithdrawal" className="ms-2 text-sm font-medium text-foreground">
                    {t('pc.period.partial')}
                  </label>
                </div>
                <p className="text-xs text-foreground">{t('pc.period.partialHelp')}</p>
              </div>
            </div>

            {/* Investment Period Summary */}
            <div className="pro-card p-4">
              <h4 className="text-lg font-medium text-foreground mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.period.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">{t('pc.period.principalWithdrawal')}</span>
                  <span className="ms-2 text-foreground">{t('pc.period.atMaturity', { value: configData.principalWithdrawalPercentage || 0 })}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('pc.period.processingTime')}</span>
                  <span className="ms-2 text-foreground">{t('pc.period.days', { value: configData.withdrawalProcessingDays || 0 })}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'returns':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t('pc.returns.title')}</h3>
              <p className="text-sm text-foreground mb-6">{t('pc.returns.subtitle')}</p>
            </div>

            {/* Return Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">{t('pc.returns.typeLabel')}</label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="returnType"
                    value="fixed"
                    checked={configData.returnType === 'fixed'}
                    onChange={() => setConfigData(prev => ({ ...prev, returnType: 'fixed' as 'fixed' | 'average' }))}
                    className="text-[#C81D25] border-gray-300 me-2"
                    style={{ accentColor: 'var(--foreground)' }}
                  />
                  <span className="text-sm text-foreground ms-2">{t('pc.returns.fixed')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="returnType"
                    value="average"
                    checked={configData.returnType === 'average'}
                    onChange={() => setConfigData(prev => ({ ...prev, returnType: 'average' as 'fixed' | 'average' }))}
                    className="text-[#C81D25] border-gray-300  me-2"
                    style={{ accentColor: 'var(--foreground)' }}
                  />
                  <span className="text-sm  text-foreground ms-2">{t('pc.returns.average')}</span>
                </label>
              </div>
            </div>

            {/* Fixed Return Field */}
            {configData.returnType === 'fixed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
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
                      className={FIELD}
                      placeholder="0"
                      required
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground">%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.returns.fixedPctHelp')}</p>
                </div>
              </div>
            )}

            {/* Average Return Fields */}
            {configData.returnType === 'average' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('pc.returns.minLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={configData.expectedReturnMin}
                      onChange={(e) => setConfigData(prev => ({ ...prev, expectedReturnMin: Number(e.target.value) }))}
                      className={FIELD}
                      placeholder="0"
                      required
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground">%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.returns.minHelp')}</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('pc.returns.maxLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={configData.expectedReturnMax}
                      onChange={(e) => setConfigData(prev => ({ ...prev, expectedReturnMax: Number(e.target.value) }))}
                      className={FIELD}
                      placeholder="0"
                      required
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground">%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.returns.maxHelp')}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.returns.freqLabel')}
                </label>
                <select
                  value={configData.profitDistributionFrequency}
                  onChange={(e) => setConfigData(prev => ({ ...prev, profitDistributionFrequency: Number(e.target.value) }))}
                  className={FIELD}
                  required
                >
                  <option value={0}>{t('pc.freq.quarterly')}</option>
                  <option value={1}>{t('pc.freq.semiAnnually')}</option>
                  <option value={2}>{t('pc.freq.annually')}</option>
                  <option value={3}>{t('pc.freq.onMaturity')}</option>
                </select>
                <p className="mt-1 text-xs text-muted-foreground">{t('pc.returns.freqHelp')}</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4 hidden">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="guaranteedReturn"
                  checked={configData.guaranteedReturn}
                  onChange={(e) => setConfigData(prev => ({ ...prev, guaranteedReturn: e.target.checked }))}
                  className="rounded border-gray-300 text-foreground focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="guaranteedReturn" className="text-sm font-medium text-foreground">
                    {t('pc.returns.guaranteed')}
                  </label>
                  <p className="text-xs text-foreground">{t('pc.returns.guaranteedHelp')}</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableCompounding"
                  checked={configData.enableCompounding}
                  onChange={(e) => setConfigData(prev => ({ ...prev, enableCompounding: e.target.checked }))}
                  className="rounded border-gray-300 text-foreground focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="enableCompounding" className="text-sm font-medium text-foreground">
                    {t('pc.returns.compounding')}
                  </label>
                  <p className="text-xs text-foreground">{t('pc.returns.compoundingHelp')}</p>
                </div>
              </div>
            </div>

            {/* Returns Summary */}
            <div className="pro-card p-4">
              <h4 className="text-lg font-medium text-foreground mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.returns.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">{t('pc.returns.expectedReturn')}</span>
                  <span className="ms-2 text-foreground">
                    {configData.returnType === 'fixed'
                      ? t('pc.returns.summaryFixed', { value: configData.fixedReturnPercentage || 0 })
                      : t('pc.returns.summaryAverage', { min: configData.expectedReturnMin || 0, max: configData.expectedReturnMax || 0 })
                    }
                  </span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('pc.returns.distribution')}</span>
                  <span className="ms-2 text-foreground">{getReturnTermText(configData.profitDistributionFrequency)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'investors':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t('pc.investors.title')}</h3>
              <p className="text-sm text-foreground mb-6">{t('pc.investors.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.investors.maxLabel')}
                </label>
                <input
                  value={configData.maxInvestors}
                  onChange={(e) => setConfigData(prev => ({ ...prev, maxInvestors: Number(e.target.value) }))}
                  className={FIELD}
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-muted-foreground">{t('pc.investors.maxHelp')}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.investors.minLabel')}
                </label>
                <input
                  value={configData.minInvestorsToActivate}
                  onChange={(e) => setConfigData(prev => ({ ...prev, minInvestorsToActivate: Number(e.target.value) }))}
                  className={FIELD}
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-muted-foreground">{t('pc.investors.minHelp')}</p>
              </div>
            </div>

            <div className="border-t pt-6 hidden">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="allowMultipleInvestments"
                  checked={configData.allowMultipleInvestments}
                  onChange={(e) => setConfigData(prev => ({ ...prev, allowMultipleInvestments: e.target.checked }))}
                  className="rounded border-gray-300 text-foreground focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="allowMultipleInvestments" className="text-sm font-medium text-foreground">
                    {t('pc.investors.allowMultiple')}
                  </label>
                  <p className="text-xs text-foreground">{t('pc.investors.allowMultipleHelp')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('pc.investors.maxPerUserLabel')}
                  </label>
                  <input
                    value={configData.maxInvestmentsPerUser}
                    onChange={(e) => setConfigData(prev => ({ ...prev, maxInvestmentsPerUser: Number(e.target.value) }))}
                    className={FIELD}
                    placeholder="0"
                    disabled={!configData.allowMultipleInvestments}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{t('pc.investors.maxPerUserHelp')}</p>
                </div>
              </div>
            </div>

            {/* Investor Settings Summary */}
            <div className="pro-card p-4">
              <h4 className="text-lg font-medium text-foreground mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.investors.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">{t('pc.investors.maxInvestors')}</span>
                  <span className="ms-2 text-foreground">{configData.maxInvestors.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('pc.investors.minToActivate')}</span>
                  <span className="ms-2 text-foreground">{configData.minInvestorsToActivate || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t('pc.advanced.title')}</h3>
              <p className="text-sm text-foreground mb-6">{t('pc.advanced.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.advanced.riskLabel')}
                </label>
                <select
                  value={configData.riskLevel}
                  onChange={(e) => setConfigData(prev => ({ ...prev, riskLevel: Number(e.target.value) }))}
                  className={FIELD}
                >
                  <option value={0}>{t('pc.risk.low')}</option>
                  <option value={1}>{t('pc.risk.medium')}</option>
                  <option value={2}>{t('pc.risk.high')}</option>
                  <option value={3}>{t('pc.risk.veryHigh')}</option>
                  <option value={4}>{t('pc.risk.extreme')}</option>
                </select>
                <p className="mt-1 text-xs text-muted-foreground">{t('pc.advanced.riskHelp')}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.advanced.processingFeeLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configData.processingFee}
                    onChange={(e) => setConfigData(prev => ({ ...prev, processingFee: Number(e.target.value) }))}
                    className={FIELD}
                    placeholder="0"
                    required
                  />
                
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t('pc.advanced.processingFeeHelp')}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                 {t('pc.advanced.collectionLimitLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configData.investementLimit}
                    onChange={(e) => setConfigData(prev => ({ ...prev, investementLimit: Number(e.target.value) }))}
                    className={FIELD}
                    placeholder="0"
                    required
                  />
                 
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t('pc.advanced.processingFeeHelp')}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('pc.advanced.vatLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configData.vat}
                    onChange={(e) => setConfigData(prev => ({ ...prev, vat: Number(e.target.value) }))}
                    className={FIELD}
                    placeholder="0"
                    required
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground">%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t('pc.advanced.vatHelp')}</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4 hidden">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shariahCompliant"
                  checked={configData.shariahCompliant}
                  onChange={(e) => setConfigData(prev => ({ ...prev, shariahCompliant: e.target.checked }))}
                  className="rounded border-gray-300 text-foreground focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="shariahCompliant" className="text-sm font-medium text-foreground">
                    {t('pc.advanced.shariah')}
                  </label>
                  <p className="text-xs text-foreground">{t('pc.advanced.shariahHelp')}</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="kycRequired"
                  checked={configData.kycRequired}
                  onChange={(e) => setConfigData(prev => ({ ...prev, kycRequired: e.target.checked }))}
                  className="rounded border-gray-300 text-foreground focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="kycRequired" className="text-sm font-medium text-foreground">
                    {t('pc.advanced.kyc')}
                  </label>
                  <p className="text-xs text-foreground">{t('pc.advanced.kycHelp')}</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="regulatoryApprovalRequired"
                  checked={configData.regulatoryApprovalRequired}
                  onChange={(e) => setConfigData(prev => ({ ...prev, regulatoryApprovalRequired: e.target.checked }))}
                  className="rounded border-gray-300 text-foreground focus:ring-gray-500"
                />
                <div className="ms-2">
                  <label htmlFor="regulatoryApprovalRequired" className="text-sm font-medium text-foreground">
                    {t('pc.advanced.regApproval')}
                  </label>
                  <p className="text-xs text-foreground">{t('pc.advanced.regApprovalHelp')}</p>
                </div>
              </div>

            </div>


            {/* Advanced Settings Summary */}
            <div className="pro-card p-4">
              <h4 className="text-lg font-medium text-foreground mb-4" style={{ color: 'var(--theme-heading-text-color)' }}>{t('pc.advanced.summary')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">{t('pc.advanced.riskLevel')}</span>
                  <span className="ms-2 text-foreground">{getRiskLevelText(configData.riskLevel)}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('pc.advanced.processingFee')}</span>
                  <span className="ms-2 text-foreground">SAR {configData.processingFee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('pc.advanced.vat')}</span>
                  <span className="ms-2 text-foreground">{configData.vat}%</span>
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
//           onClick={() => navigate('/InvestorDashboard/Products')}
//           className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//         >
//           Back to Products
//         </button>
//       </div>
//     );
//   }

  const statusTone = product
    ? PRODUCT_STATUS_TONE[enumToNumber(product.productStatus, PRODUCT_STATUSES, -1)] ??
      TONES.slate
    : TONES.slate;

  return (
    <div className="service">
      <LexPageHeader
        icon={Settings}
        title={isEditMode ? t('pc.header.editTitle') : t('pc.header.title')}
        subtitle={product?.name}
      >
        <Badge variant="outline" className={cn('border font-medium', statusTone)}>
          {product ? getProductStatusText(product.productStatus) : t('pc.header.loading')}
        </Badge>
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
          {t('common:back')}
        </Button>
        {!isEditMode && canManage && (
          <Button
            size="sm"
            className="gap-2"
            onClick={handleEditConfiguration}
            disabled={loadingConfiguration}
          >
            {loadingConfiguration ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            {t('pc.header.editConfig')}
          </Button>
        )}
      </LexPageHeader>

      <LexNotice tone="sky" icon={Info}>
        <strong>{t('pc.banner.important')}</strong> {t('pc.banner.text')}
      </LexNotice>

      {/* Upstream names the fields the service rejected; it was a raw red
          panel, which is the same job LexNotice already does. */}
      {serverErrors.length > 0 && (
        <LexNotice tone="red" icon={AlertTriangle}>
          <p className="m-0 font-semibold">{t('pc.toast.validationFailed')}</p>
          <ul className="m-0 mt-1 list-disc space-y-0.5 ps-5">
            {serverErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </LexNotice>
      )}

      <LexNotice tone="sky" icon={Info}>
        <strong>{t('pc.banner.important')}</strong> {t('pc.banner.text')}
      </LexNotice>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-3">
        <DetailTabsList>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <DetailTabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </DetailTabsTrigger>
            );
          })}
        </DetailTabsList>
      </Tabs>

      <div className="pro-card p-4 mb-3">{renderTabContent()}</div>

      {/* Configuration Summary - Only show on Amounts tab */}
      {activeTab === 'amounts' && (
        <div className="pro-card p-4 mb-3">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="pro-head-badge">
              <DollarSign className="h-4 w-4" />
            </span>
            <h3 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t('pc.summary.title')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-foreground">{t('pc.summary.minInvestment')}</span>
              <span className="ms-2 text-foreground">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  const currencyDisplay = selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                  return `${configData.minimumInvestment > 0 ? configData.minimumInvestment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'} ${currencyDisplay}`;
                })()}
              </span>
            </div>
            <div>
              <span className="font-medium text-foreground">{t('pc.summary.maxInvestment')}</span>
              <span className="ms-2 text-foreground">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  const currencyDisplay = selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                  return `${configData.maximumInvestment > 0 ? configData.maximumInvestment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'} ${currencyDisplay}`;
                })()}
              </span>
            </div>
            <div>
              <span className="font-medium text-foreground">{t('pc.summary.increment')}</span>
              <span className="ms-2 text-foreground">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  const currencyDisplay = selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                  return `${configData.investmentIncrement > 0 ? configData.investmentIncrement.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'} ${currencyDisplay}`;
                })()}
              </span>
            </div>
            <div>
              <span className="font-medium text-foreground">{t('pc.summary.currency')}</span>
              <span className="ms-2 text-foreground">
                {(() => {
                  const selectedCurrency = currencies.find(c => c.id === configData.baseCurrency);
                  return selectedCurrency ? `${selectedCurrency.symbol || ''} ${selectedCurrency.name || selectedCurrency.currencyCode}` : configData.baseCurrency;
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          {t('common:cancel')}
        </Button>
        {canManage && (
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {activeTab === 'advanced' ? t('pc.action.saving') : t('pc.action.processing')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {activeTab === 'advanced'
                  ? t('pc.action.saveConfig')
                  : (() => {
                      const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
                      const nextTab = tabs[currentTabIndex + 1];
                      return t('pc.action.continueTo', { tab: nextTab.label });
                    })()}
              </>
            )}
          </Button>
        )}
      </div>
   
    </div>
  );
}
