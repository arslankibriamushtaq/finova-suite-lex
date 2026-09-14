import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowLeftRight,
  Save,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  RefreshCw,
  CheckCircle,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { usePermissions } from '../../../../hooks/useProductPermissions';

import { Button } from '../../../../components/ui/button';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import {
  LexAmountInput,
  LexNotice,
  LexPageHeader,
} from '../../../../components/shared/lexKit';
import { TONES } from '../../../../components/shared/detailKitUtils';
import { cn } from '../../../../lib/utils';

/**
 * The four kinds of adjustment.
 *
 * The tone used to be assembled from a colour name inside a template literal,
 * which Tailwind never sees: it scans source text and cannot resolve an
 * interpolation. None of those classes were ever generated, so the selected
 * card carried no highlight at all. Written out here, and on the app's own
 * tones rather than the blue and purple that were reached for.
 */
const ADJUSTMENT_TYPES = [
  { value: 'add', label: 'iadj.type.add', icon: TrendingUp, tone: TONES.emerald },
  { value: 'redeem', label: 'iadj.type.redeem', icon: TrendingDown, tone: TONES.red },
  { value: 'rebalance', label: 'iadj.type.rebalance', icon: RefreshCw, tone: TONES.amber },
  { value: 'transfer', label: 'iadj.type.transfer', icon: ArrowLeftRight, tone: TONES.sky },
] as const;

const REASONS = [
  'client_request',
  'rebalancing',
  'risk_management',
  'market_opportunity',
  'liquidity_needs',
  'compliance',
  'error_correction',
  'other',
] as const;

const REASON_KEYS: Record<string, string> = {
  client_request: 'iadj.reason.clientRequest',
  rebalancing: 'iadj.reason.rebalancing',
  risk_management: 'iadj.reason.riskManagement',
  market_opportunity: 'iadj.reason.marketOpportunity',
  liquidity_needs: 'iadj.reason.liquidityNeeds',
  compliance: 'iadj.reason.compliance',
  error_correction: 'iadj.reason.errorCorrection',
  other: 'iadj.reason.other',
};
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';

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
  // Previewing the maths is a read; committing the adjustment is not.
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_INVESTMENT_MANAGE');
  const { t } = useTranslation('investor');
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
      newErrors.amount = t('iadj.err.amount');
    }

    if (!formData.units || parseFloat(formData.units) <= 0) {
      newErrors.units = t('iadj.err.units');
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = t('iadj.err.price');
    }

    if (!formData.reason) {
      newErrors.reason = t('iadj.err.reason');
    }

    if (!formData.confirmRisks) {
      newErrors.confirmRisks = t('iadj.err.confirmRisks');
    }

    // Validation for redemption
    if (formData.adjustmentType === 'redeem') {
      const redeemUnits = parseFloat(formData.units);
      if (redeemUnits > investmentData.currentUnits) {
        newErrors.units = t('iadj.err.cannotRedeem', { units: investmentData.currentUnits });
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
      alert(t('iadj.submitSuccess'));
    } catch (error) {
      console.error('Error submitting adjustment:', error);
    } finally {
      setIsSubmitting(false);
      setShowPreview(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);

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
          impact: t('iadj.noChange')
        };
    }
  };

  const newValues = calculateNewValues();

  const errorText = (field: string) =>
    errors[field] ? (
      <p className="m-0 mt-1 flex items-center gap-1 text-xs text-destructive">
        <AlertTriangle className="h-3 w-3 shrink-0" />
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="service">
      <LexPageHeader
        icon={SlidersHorizontal}
        title={t('iadj.title')}
        subtitle={t('iadj.subtitle')}
      >
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/InvestorDashboard/Investments">
            <ArrowLeft className="h-4 w-4" />
            {t('iadj.backToInvestments')}
          </Link>
        </Button>
      </LexPageHeader>

      {/* Every figure on this page is a module-level literal — there is no
          fetch in this file, and nothing it submits reaches a service. */}
      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.notConnected')}
      </LexNotice>

      <div className="pro-card p-4 mb-3">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="pro-head-badge">
            <DollarSign className="h-4 w-4" />
          </span>
          <h2 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t('iadj.currentDetails')}
          </h2>
        </div>
        <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [t('iadj.investor'), investmentData.investorName],
            [t('iadj.product'), investmentData.productName],
            [t('iadj.currentValue'), formatCurrency(investmentData.currentValue)],
            [t('iadj.unitsHeld'), investmentData.currentUnits.toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="m-0 truncate text-xs text-muted-foreground">{label}</dt>
              <dd className="m-0 truncate text-sm font-semibold tabular-nums text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="pro-card p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="pro-head-badge">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <h2 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t('iadj.adjustmentDetails')}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">{t('iadj.adjustmentType')}</Label>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {ADJUSTMENT_TYPES.map((type) => {
                const selected = formData.adjustmentType === type.value;
                return (
                  <label
                    key={type.value}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors',
                      selected ? `${type.tone} border` : 'hover:bg-muted/50'
                    )}
                  >
                    <input
                      type="radio"
                      name="adjustmentType"
                      value={type.value}
                      checked={selected}
                      onChange={(e) => handleInputChange('adjustmentType', e.target.value)}
                      className="sr-only"
                    />
                    <type.icon
                      className={cn('h-5 w-5', selected ? '' : 'text-muted-foreground')}
                    />
                    <span className="text-xs font-medium">{t(type.label)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="adj-amount">
                {t('iadj.amountLabel', {
                  ctx:
                    formData.adjustmentType === 'redeem'
                      ? t('iadj.toRedeem')
                      : t('iadj.toInvest'),
                })}
              </Label>
              <LexAmountInput
                id="adj-amount"
                unitPosition="start"
                invalid={Boolean(errors.amount)}
                value={formData.amount}
                onChange={(next) => handleInputChange('amount', next)}
                placeholder="0.00"
              />
              {errorText('amount')}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adj-units">{t('iadj.units')}</Label>
              <Input
                id="adj-units"
                type="number"
                step="0.0001"
                className={cn(errors.units && 'border-destructive')}
                value={formData.units}
                onChange={(e) => handleInputChange('units', e.target.value)}
                placeholder="0.0000"
              />
              {errorText('units')}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adj-price">{t('iadj.pricePerUnit')}</Label>
              <Input
                id="adj-price"
                type="number"
                step="0.01"
                disabled={formData.useCurrentPrice}
                className={cn(errors.price && 'border-destructive')}
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={formData.useCurrentPrice}
                  onCheckedChange={(checked) =>
                    handleInputChange('useCurrentPrice', checked === true)
                  }
                />
                {t('iadj.useCurrentPrice')}
              </label>
              {errorText('price')}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="adj-reason">{t('iadj.reasonLabel')}</Label>
              <Select
                value={formData.reason}
                onValueChange={(value) => handleInputChange('reason', value)}
              >
                <SelectTrigger
                  id="adj-reason"
                  className={cn(errors.reason && 'border-destructive')}
                >
                  <SelectValue placeholder={t('iadj.selectReason')} />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {t(REASON_KEYS[reason])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorText('reason')}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adj-date">{t('iadj.effectiveDate')}</Label>
              <Input
                id="adj-date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.effectiveDate}
                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adj-notes">{t('iadj.additionalNotes')}</Label>
            <Textarea
              id="adj-notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('iadj.notesPlaceholder')}
            />
          </div>

          {/* The acknowledgement is the gate on the submit button, so it keeps
              a tone of its own rather than reading as another form row. */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="min-w-0 flex-1">
                <h4 className="m-0 mb-1 text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {t('iadj.riskAck')}
                </h4>
                <p className="m-0 mb-2 text-sm text-amber-800 dark:text-amber-300">
                  {t('iadj.riskText')}
                </p>
                <label className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-200">
                  <Checkbox
                    checked={formData.confirmRisks}
                    onCheckedChange={(checked) =>
                      handleInputChange('confirmRisks', checked === true)
                    }
                  />
                  {t('iadj.riskConfirm')}
                </label>
                {errorText('confirmRisks')}
              </div>
            </div>
          </div>

          {(formData.amount || formData.units) && (
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <h4 className="m-0 text-sm font-semibold text-foreground">
                  {t('iadj.impactPreview')}
                </h4>
              </div>
              <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                {[
                  [t('iadj.currentValueLabel'), formatCurrency(investmentData.currentValue)],
                  [t('iadj.projectedValue'), formatCurrency(newValues.newValue)],
                  [t('iadj.impactLabel'), newValues.impact],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="m-0 truncate text-xs text-muted-foreground">{label}</dt>
                    {/* Was a dark blue, a colour this app uses nowhere else. */}
                    <dd className="m-0 truncate text-sm font-semibold tabular-nums text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/InvestorDashboard/Investments">{t('common:cancel')}</Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePreview}>
                <Calculator className="h-4 w-4" />
                {t('iadj.previewChanges')}
              </Button>
              {canManage && (
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.confirmRisks}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSubmitting ? t('iadj.processing') : t('iadj.submitAdjustment')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Calculator className="h-4 w-4" />
              </span>
              {t('iadj.previewTitle')}
            </DialogTitle>
          </DialogHeader>

          <dl className="m-0 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{t('iadj.typeColon')}</dt>
              <dd className="m-0 font-medium text-foreground">
                {t(`iadj.type.${formData.adjustmentType}`)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{t('iadj.amountColon')}</dt>
              <dd className="m-0 font-medium tabular-nums text-foreground">
                {formatCurrency(parseFloat(formData.amount))}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{t('iadj.unitsColon')}</dt>
              <dd className="m-0 font-medium tabular-nums text-foreground">
                {parseFloat(formData.units).toLocaleString()}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{t('iadj.priceColon')}</dt>
              {/* Was a literal "$" in front of the number, on a platform whose
                  every other figure goes through formatCurrency. */}
              <dd className="m-0 font-medium tabular-nums text-foreground">
                {formatCurrency(parseFloat(formData.price))}
              </dd>
            </div>
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{t('iadj.newTotalValue')}</dt>
                <dd className="m-0 font-medium tabular-nums text-foreground">
                  {formatCurrency(newValues.newValue)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{t('iadj.newTotalUnits')}</dt>
                <dd className="m-0 font-medium tabular-nums text-foreground">
                  {newValues.newUnits.toLocaleString()}
                </dd>
              </div>
            </div>
          </dl>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              {t('common:cancel')}
            </Button>
            {canManage && (
              <Button onClick={handleSubmit} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('iadj.confirm')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
