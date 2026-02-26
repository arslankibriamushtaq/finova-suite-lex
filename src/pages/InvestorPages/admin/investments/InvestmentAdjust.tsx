import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calculator,
  RefreshCw,
  CheckCircle,
  Info
} from 'lucide-react';

// Mock data - in real app, this would come from API based on investment ID
const investmentData = {
  id: 1,
  investorName: 'John Anderson',
  investorId: 1,
  productName: 'Large Cap Growth Fund',
  productId: 1,
  currentInvestment: 500000,
  currentValue: 580000,
  currentUnits: 4545.45,
  currentPrice: 127.62,
  entryPrice: 110.00,
  unrealizedGain: 80000,
  allocationPercentage: 25.5,
  lastValuation: '2024-01-22',
  status: 'Active',
  liquidity: 'Daily'
};

interface AdjustmentForm {
  adjustmentType: 'add' | 'redeem' | 'rebalance' | 'transfer';
  amount: string;
  units: string;
  price: string;
  useCurrentPrice: boolean;
  reason: string;
  notes: string;
  effectiveDate: string;
  confirmRisks: boolean;
}

export default function InvestmentAdjust() {
  const { id } = useParams();
  const [formData, setFormData] = useState<AdjustmentForm>({
    adjustmentType: 'add',
    amount: '',
    units: '',
    price: investmentData.currentPrice.toString(),
    useCurrentPrice: true,
    reason: '',
    notes: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    confirmRisks: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field: keyof AdjustmentForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-calculate units when amount changes
    if (field === 'amount' && formData.useCurrentPrice) {
      const amount = parseFloat(value as string);
      const price = parseFloat(formData.price);
      if (!isNaN(amount) && !isNaN(price) && price > 0) {
        setFormData(prev => ({
          ...prev,
          units: (amount / price).toFixed(4)
        }));
      }
    }

    // Auto-calculate amount when units change
    if (field === 'units' && formData.useCurrentPrice) {
      const units = parseFloat(value as string);
      const price = parseFloat(formData.price);
      if (!isNaN(units) && !isNaN(price)) {
        setFormData(prev => ({
          ...prev,
          amount: (units * price).toFixed(2)
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount is required and must be positive';
    }

    if (!formData.units || parseFloat(formData.units) <= 0) {
      newErrors.units = 'Units is required and must be positive';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price is required and must be positive';
    }

    if (!formData.reason) {
      newErrors.reason = 'Reason for adjustment is required';
    }

    if (!formData.confirmRisks) {
      newErrors.confirmRisks = 'You must acknowledge the risks';
    }

    // Validation for redemption
    if (formData.adjustmentType === 'redeem') {
      const redeemUnits = parseFloat(formData.units);
      if (redeemUnits > investmentData.currentUnits) {
        newErrors.units = `Cannot redeem more than ${investmentData.currentUnits} units`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real app, would redirect to investment detail or list
      alert('Investment adjustment submitted successfully!');
    } catch (error) {
      console.error('Error submitting adjustment:', error);
    } finally {
      setIsSubmitting(false);
      setShowPreview(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateNewValues = () => {
    const currentValue = investmentData.currentValue;
    const currentUnits = investmentData.currentUnits;
    const adjustmentAmount = parseFloat(formData.amount) || 0;
    const adjustmentUnits = parseFloat(formData.units) || 0;

    switch (formData.adjustmentType) {
      case 'add':
        return {
          newValue: currentValue + adjustmentAmount,
          newUnits: currentUnits + adjustmentUnits,
          impact: `+${formatCurrency(adjustmentAmount)}`
        };
      case 'redeem':
        return {
          newValue: currentValue - adjustmentAmount,
          newUnits: currentUnits - adjustmentUnits,
          impact: `-${formatCurrency(adjustmentAmount)}`
        };
      default:
        return {
          newValue: currentValue,
          newUnits: currentUnits,
          impact: 'No change'
        };
    }
  };

  const newValues = calculateNewValues();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            to="/admin/investments"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Investments
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Adjustment</h1>
        <p className="text-gray-600">Make manual adjustments to investment allocations</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Investment Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Investment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Investor</p>
              <p className="text-lg font-medium text-gray-900">{investmentData.investorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Product</p>
              <p className="text-lg font-medium text-gray-900">{investmentData.productName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Value</p>
              <p className="text-lg font-medium text-gray-900">{formatCurrency(investmentData.currentValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Units Held</p>
              <p className="text-lg font-medium text-gray-900">{investmentData.currentUnits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Adjustment Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Adjustment Details</h2>

          <div className="space-y-6">
            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Adjustment Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { value: 'add', label: 'Additional Investment', icon: TrendingUp, color: 'green' },
                  { value: 'redeem', label: 'Partial Redemption', icon: TrendingUp, color: 'red' },
                  { value: 'rebalance', label: 'Rebalance Portfolio', icon: RefreshCw, color: 'blue' },
                  { value: 'transfer', label: 'Transfer Between Products', icon: RefreshCw, color: 'purple' }
                ].map((type) => (
                  <label key={type.value} className="relative">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value={type.value}
                      checked={formData.adjustmentType === type.value}
                      onChange={(e) => handleInputChange('adjustmentType', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.adjustmentType === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                        formData.adjustmentType === type.value ? `text-${type.color}-600` : 'text-gray-400'
                      }`} />
                      <p className={`text-sm font-medium text-center ${
                        formData.adjustmentType === type.value ? `text-${type.color}-900` : 'text-gray-900'
                      }`}>
                        {type.label}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Amount and Units */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({formData.adjustmentType === 'redeem' ? 'to redeem' : 'to invest'})
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.units}
                  onChange={(e) => handleInputChange('units', e.target.value)}
                  className={`px-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                    errors.units ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.0000"
                />
                {errors.units && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {errors.units}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Unit
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    disabled={formData.useCurrentPrice}
                    className={`px-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      formData.useCurrentPrice ? 'bg-gray-50' : ''
                    } ${errors.price ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={formData.useCurrentPrice}
                      onChange={(e) => handleInputChange('useCurrentPrice', e.target.checked)}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 mr-2"
                    />
                    Use current market price
                  </label>
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            {/* Reason and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Adjustment *
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                    errors.reason ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a reason</option>
                  <option value="client_request">Client Request</option>
                  <option value="rebalancing">Portfolio Rebalancing</option>
                  <option value="risk_management">Risk Management</option>
                  <option value="market_opportunity">Market Opportunity</option>
                  <option value="liquidity_needs">Liquidity Needs</option>
                  <option value="compliance">Compliance Requirement</option>
                  <option value="error_correction">Error Correction</option>
                  <option value="other">Other</option>
                </select>
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {errors.reason}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Any additional notes or instructions..."
              />
            </div>

            {/* Risk Acknowledgment */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Risk Acknowledgment</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Investment adjustments may impact portfolio performance and risk profile.
                    Please ensure all adjustments are authorized by the investor and comply with investment guidelines.
                  </p>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={formData.confirmRisks}
                      onChange={(e) => handleInputChange('confirmRisks', e.target.checked)}
                      className="rounded border-gray-300 text-black focus:ring-gray-500 mr-2"
                    />
                    I acknowledge the risks and confirm this adjustment is authorized
                  </label>
                  {errors.confirmRisks && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {errors.confirmRisks}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Impact */}
            {(formData.amount || formData.units) && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="flex items-start">
                  <Calculator className="w-5 h-5 text-black mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Impact Preview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-800">Current Value:</p>
                        <p className="font-medium text-blue-900">{formatCurrency(investmentData.currentValue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-800">Projected Value:</p>
                        <p className="font-medium text-blue-900">{formatCurrency(newValues.newValue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-800">Impact:</p>
                        <p className="font-medium text-blue-900">{newValues.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                to="/admin/investments"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Link>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePreview}
                  className="flex items-center px-6 py-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-lg hover:bg-blue-200"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Preview Changes
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.confirmRisks}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit Adjustment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjustment Preview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{formData.adjustmentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{formatCurrency(parseFloat(formData.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Units:</span>
                <span className="font-medium">{parseFloat(formData.units).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">${parseFloat(formData.price)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">New Total Value:</span>
                  <span className="font-medium">{formatCurrency(newValues.newValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Total Units:</span>
                  <span className="font-medium">{newValues.newUnits.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
