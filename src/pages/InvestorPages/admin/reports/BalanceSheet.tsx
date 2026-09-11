import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Building,
  CreditCard,
  Banknote,
  FileText,
  Mail,
  Printer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { Button } from '../../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { LexNotice, LexPageHeader } from '../../../../components/shared/lexKit';

const balanceSheetData = {
  asOfDate: '2024-01-31',
  currency: 'USD',
  assets: {
    currentAssets: {
      cash: 12500000,
      cashEquivalents: 8750000,
      accountsReceivable: 3200000,
      prepaidExpenses: 450000,
      otherCurrentAssets: 680000,
      total: 25580000
    },
    nonCurrentAssets: {
      investments: 245000000,
      propertyEquipment: 15600000,
      intangibleAssets: 2800000,
      otherAssets: 1200000,
      total: 264600000
    },
    totalAssets: 290180000
  },
  liabilities: {
    currentLiabilities: {
      accountsPayable: 2100000,
      accruedExpenses: 1850000,
      shortTermDebt: 5000000,
      otherCurrentLiabilities: 980000,
      total: 9930000
    },
    nonCurrentLiabilities: {
      longTermDebt: 25000000,
      deferredTax: 3400000,
      otherLiabilities: 1800000,
      total: 30200000
    },
    totalLiabilities: 40130000
  },
  equity: {
    paidInCapital: 150000000,
    retainedEarnings: 95050000,
    accumulatedOCI: 5000000,
    totalEquity: 250050000
  }
};

const previousPeriod = {
  asOfDate: '2023-12-31',
  totalAssets: 275230000,
  totalLiabilities: 38950000,
  totalEquity: 236280000
};

export default function BalanceSheet() {
  const { t } = useTranslation('investor');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [viewMode, setViewMode] = useState('detailed');

  // The locale was pinned and the currency hardcoded, so the statement read
  // the same in every language and ignored the currency its own data declares.
  // Note that data still says USD while the rest of this module is in SAR.
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: balanceSheetData.currency || 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const getChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: change,
      type: change >= 0 ? 'positive' : 'negative'
    };
  };

  // Export, print and email each popped a browser dialog reporting success for
  // work that never ran. The statement is a module-level literal.
  const notConnected = () => toast.error(t('invl.notConnected'));

  const handleExport = notConnected;
  const handlePrint = notConnected;
  const handleEmail = notConnected;

  return (
    <div className="service">
      <LexPageHeader
        icon={Building}
        title={t('bs.title')}
        subtitle={t('bs.subtitle', { date: balanceSheetData.asOfDate })}
      >
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/InvestorDashboard/Reports">
            <ArrowLeft className="h-4 w-4" />
            {t('pl.backToReports')}
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={notConnected}>
          <RefreshCw className="h-4 w-4" />
          {t('common:refresh')}
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          {t('pl.print')}
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleEmail}>
          <Mail className="h-4 w-4" />
          {t('reports.emailReports')}
        </Button>
        <Button size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          {t('common:export')}
        </Button>
      </LexPageHeader>

      {/* Every figure on this page is a module-level literal — there is no
          fetch in this file. A balance sheet that looks authoritative and is
          not is worth saying out loud. Delete this notice when the endpoint
          lands. */}
      <LexNotice tone="amber" icon={FileText}>
        {t('invl.notConnected')}
      </LexNotice>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-md border p-0.5">
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'ghost'}
              size="sm"
              className="h-7"
              onClick={() => setViewMode('detailed')}
            >
              {t('bs.view.detailed')}
            </Button>
            <Button
              variant={viewMode === 'summary' ? 'default' : 'ghost'}
              size="sm"
              className="h-7"
              onClick={() => setViewMode('summary')}
            >
              {t('bs.view.summary')}
            </Button>
          </div>
          {/* The period dropdown had state behind it but was never bound to it,
              so choosing a period did nothing at all. */}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">{t('bs.period.current')}</SelectItem>
              <SelectItem value="comparison">{t('bs.period.comparison')}</SelectItem>
              <SelectItem value="historical">{t('bs.period.historical')}</SelectItem>
            </SelectContent>
          </Select>
          <span className="ms-auto whitespace-nowrap text-xs text-muted-foreground">
            {t('bs.generatedOn', { date: new Date().toLocaleDateString() })}
          </span>
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="pro-card overflow-hidden p-0">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">{t('bs.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('bs.asOf', { date: balanceSheetData.asOfDate })}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('bs.col.account')}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('bs.col.currentPeriod')}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('bs.col.previousPeriod')}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('bs.col.change')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {/* ASSETS */}
              <tr className="bg-muted/40">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-black me-2" />
                    <span className="text-sm font-bold text-foreground">{t('bs.row.assets')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-bold text-foreground">
                  {formatCurrency(balanceSheetData.assets.totalAssets)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                  {formatCurrency(previousPeriod.totalAssets)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm">
                  {(() => {
                    const change = getChange(balanceSheetData.assets.totalAssets, previousPeriod.totalAssets);
                    return (
                      <div className={`flex items-center justify-end ${
                        change.type === 'positive' ? 'text-foreground' : 'text-destructive'
                      }`}>
                        {change.type === 'positive' ? (
                          <TrendingUp className="w-4 h-4 me-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 me-1" />
                        )}
                        {Math.abs(change.value).toFixed(1)}%
                      </div>
                    );
                  })()}
                </td>
              </tr>

              {/* Current Assets */}
              <tr className="bg-muted/40">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-700 ms-4">{t('bs.row.currentAssets')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-semibold text-foreground">
                  {formatCurrency(balanceSheetData.assets.currentAssets.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                  {formatCurrency(24200000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +5.7%
                </td>
              </tr>

              {viewMode === 'detailed' && (
                <>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground ms-8">{t('bs.row.cashEquivalents')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-foreground">
                      {formatCurrency(balanceSheetData.assets.currentAssets.cash + balanceSheetData.assets.currentAssets.cashEquivalents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      {formatCurrency(19800000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +7.3%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground ms-8">{t('bs.row.accountsReceivable')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-foreground">
                      {formatCurrency(balanceSheetData.assets.currentAssets.accountsReceivable)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      {formatCurrency(2950000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +8.5%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground ms-8">{t('bs.row.otherCurrentAssets')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-foreground">
                      {formatCurrency(balanceSheetData.assets.currentAssets.prepaidExpenses + balanceSheetData.assets.currentAssets.otherCurrentAssets)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      {formatCurrency(1450000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      -22.1%
                    </td>
                  </tr>
                </>
              )}

              {/* Non-Current Assets */}
              <tr className="bg-muted/40">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-700 ms-4">{t('bs.row.nonCurrentAssets')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-semibold text-foreground">
                  {formatCurrency(balanceSheetData.assets.nonCurrentAssets.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                  {formatCurrency(251030000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +5.4%
                </td>
              </tr>

              {viewMode === 'detailed' && (
                <>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground ms-8">{t('bs.row.investments')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-foreground">
                      {formatCurrency(balanceSheetData.assets.nonCurrentAssets.investments)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      {formatCurrency(232500000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +5.4%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground ms-8">{t('bs.row.propertyEquipment')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-foreground">
                      {formatCurrency(balanceSheetData.assets.nonCurrentAssets.propertyEquipment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      {formatCurrency(14800000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +5.4%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground ms-8">{t('bs.row.otherAssets')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-foreground">
                      {formatCurrency(balanceSheetData.assets.nonCurrentAssets.intangibleAssets + balanceSheetData.assets.nonCurrentAssets.otherAssets)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      {formatCurrency(3730000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +7.3%
                    </td>
                  </tr>
                </>
              )}

              {/* LIABILITIES */}
              <tr className="bg-red-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-red-600 me-2" />
                    <span className="text-sm font-bold text-red-900">{t('bs.row.liabilities')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-bold text-red-900">
                  {formatCurrency(balanceSheetData.liabilities.totalLiabilities)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                  {formatCurrency(previousPeriod.totalLiabilities)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +3.0%
                </td>
              </tr>

              {/* Current Liabilities */}
              <tr className="bg-muted/40">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-700 ms-4">{t('bs.row.currentLiabilities')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-semibold text-foreground">
                  {formatCurrency(balanceSheetData.liabilities.currentLiabilities.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                  {formatCurrency(9200000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +7.9%
                </td>
              </tr>

              {/* Non-Current Liabilities */}
              <tr className="bg-muted/40">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-700 ms-4">{t('bs.row.nonCurrentLiabilities')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-semibold text-foreground">
                  {formatCurrency(balanceSheetData.liabilities.nonCurrentLiabilities.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                  {formatCurrency(29750000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +1.5%
                </td>
              </tr>

              {/* EQUITY */}
              <tr className="bg-red-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Banknote className="w-5 h-5 text-red-600 me-2" />
                    <span className="text-sm font-bold text-red-900">{t('bs.row.equity')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-bold text-red-900">
                  {formatCurrency(balanceSheetData.equity.totalEquity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                  {formatCurrency(previousPeriod.totalEquity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +5.8%
                </td>
              </tr>

              {viewMode === 'detailed' && (
                <>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground ms-8">{t('bs.row.paidInCapital')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-foreground">
                      {formatCurrency(balanceSheetData.equity.paidInCapital)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      {formatCurrency(150000000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      0.0%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground ms-8">{t('bs.row.retainedEarnings')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-foreground">
                      {formatCurrency(balanceSheetData.equity.retainedEarnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      {formatCurrency(81280000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                      +16.9%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground ms-8">{t('bs.row.accumulatedOCI')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-foreground">
                      {formatCurrency(balanceSheetData.equity.accumulatedOCI)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      {formatCurrency(5000000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                      0.0%
                    </td>
                  </tr>
                </>
              )}

              {/* Verification Row */}
              <tr className="bg-muted border-t-2 border-border">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-foreground">{t('bs.row.liabilitiesEquity')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-bold text-foreground">
                  {formatCurrency(balanceSheetData.liabilities.totalLiabilities + balanceSheetData.equity.totalEquity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-muted-foreground">
                  {formatCurrency(previousPeriod.totalLiabilities + previousPeriod.totalEquity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm text-red-600">
                  +5.4%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="pro-card mt-3 p-4">
        <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
          {t('bs.notes')}
        </h4>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p>• {t('bs.note1')}</p>
          <p>• {t('bs.note2')}</p>
          <p>• {t('bs.note3')}</p>
          <p>• {t('bs.note4')}</p>
        </div>
      </div>
    </div>
  );
}
