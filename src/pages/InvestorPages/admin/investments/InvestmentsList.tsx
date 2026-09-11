import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  BarChart3,
  Eye,
  Settings,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import TableView from '../../../../components/TableView/TableView';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { EmptyState, Field } from '../../../../components/shared/detailKit';
import { TONES } from '../../../../components/shared/detailKitUtils';
import {
  LexMetricTile,
  LexPageHeader,
  LexRowAction,
  LexRowActions,
  LexSearch,
} from '../../../../components/shared/lexKit';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { usePermissions } from '../../../../hooks/useProductPermissions';
import {
  getAllInvestments,
  getAllProducts,
  getAllKycInvestors,
  getAllKybInvestors,
  Investment,
} from '../../../../redux/apis/apisInvestor';

/**
 * The page used to render a hardcoded array of holdings — units, entry price,
 * YTD performance, unrealised gain — with a notice admitting as much.
 * `Investment/GetAll` serves none of that. It returns the subscription itself:
 * the amount, the fee and VAT on it, the expected profit and how often it is
 * distributed, what has been received and repaid, and what capital is still
 * outstanding. Those are the columns, and the notice is gone with the mock.
 *
 * The response carries `investorId` and `productId` and no names, so both
 * catalogues are read once and used as lookup tables.
 */
const LOOKUP_PAGE_SIZE = 100;
const PAGE_SIZE = 10;

/** PENDING_APPROVAL -> "Pending Approval", for a status the map below misses. */
const humanise = (value: string): string =>
  value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** A running investment, one awaiting a decision and a rejected one read differently. */
const STATUS_TONES: Record<string, string> = {
  ACTIVE: TONES.emerald,
  APPROVED: TONES.emerald,
  PENDING_APPROVAL: TONES.amber,
  PENDING: TONES.amber,
  REJECTED: TONES.red,
  MATURED: TONES.slate,
  CLOSED: TONES.slate,
  WITHDRAWN: TONES.slate,
};

export default function InvestmentsList() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_INVESTMENT_MANAGE');
  const { t } = useTranslation('investor');

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [investorNames, setInvestorNames] = useState<Record<string, string>>({});
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  const loadInvestments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllInvestments(page, pageSize);
      if (result?.success) {
        const rows = result.data || [];
        const info = (result.pageInfo || {}) as any;
        const total = info.totalItems ?? info.totalCount ?? rows.length;
        setInvestments(rows);
        setTotalRows(total);
        setTotalPage(info.totalPages || 1);
        setFrom(info.page ? (info.page - 1) * info.pageSize + 1 : 1);
        setTo(info.page ? Math.min(info.page * info.pageSize, total) : rows.length);
      } else {
        toast.error(result?.notificationMessage || t('invl.loadError'));
      }
    } catch (error: any) {
      toast.error(error?.message || t('invl.loadError'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, t]);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  // Names for the two ids every investment carries. A failure here is not worth
  // a toast — the table falls back to the id and stays usable.
  useEffect(() => {
    (async () => {
      try {
        const products = await getAllProducts(1, LOOKUP_PAGE_SIZE);
        if (products?.success) {
          setProductNames(
            Object.fromEntries((products.data || []).map((p: any) => [p.id, p.name]))
          );
        }
      } catch {
        /* fall back to the product id */
      }
      try {
        const [kyc, kyb] = await Promise.all([
          getAllKycInvestors(1, LOOKUP_PAGE_SIZE),
          getAllKybInvestors(1, LOOKUP_PAGE_SIZE),
        ]);
        const names: Record<string, string> = {};
        for (const k of kyc?.data || []) {
          if (k.investorId)
            names[k.investorId] =
              `${k.firstNameInEnglish || ''} ${k.lastNameInEnglish || ''}`.trim();
        }
        for (const k of kyb?.data || []) {
          // A business investor is known by its company, not by the signatory.
          if (k.investorId)
            names[k.investorId] =
              k.companyName || `${k.firstNameInEnglish || ''} ${k.lastNameInEnglish || ''}`.trim();
        }
        setInvestorNames(names);
      } catch {
        /* fall back to the investor id */
      }
    })();
  }, []);

  const shortId = (id?: string | null) => (id ? `${id.slice(0, 8)}…` : '—');
  const investorLabel = (inv: Investment) =>
    investorNames[inv.investorId] || shortId(inv.investorId);
  const productLabel = (inv: Investment) => productNames[inv.productId] || shortId(inv.productId);

  // SAR is the module default, but the row states its own currency — an
  // investment booked in another one must not be relabelled on the way out.
  const money = (amount: number | null | undefined, currency?: string | null) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const date = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

  const statusLabel = (status?: string | null) => {
    if (!status) return '—';
    const key = `invl.apiStatus.${status.toUpperCase()}`;
    const translated = t(key);
    return translated === key ? humanise(status) : translated;
  };

  const statusBadge = (status?: string | null) => (
    <Badge
      variant="outline"
      className={`border font-medium ${STATUS_TONES[(status || '').toUpperCase()] || TONES.slate}`}
    >
      {statusLabel(status)}
    </Badge>
  );

  const statuses = useMemo(
    () => Array.from(new Set(investments.map((i) => i.status).filter(Boolean))) as string[],
    [investments]
  );

  const filtered = useMemo(
    () =>
      investments.filter((inv) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !term ||
          investorLabel(inv).toLowerCase().includes(term) ||
          productLabel(inv).toLowerCase().includes(term) ||
          (inv.id || '').toLowerCase().includes(term);
        return matchesSearch && (statusFilter === 'ALL' || inv.status === statusFilter);
      }),
    // investorNames/productNames feed the labels the search reads.
    [investments, searchTerm, statusFilter, investorNames, productNames]
  );

  // The totals describe the page that was fetched: the service pages the data
  // and sends no aggregate, so the footnote says which figures these are.
  const pageCurrency = investments[0]?.currencyCode || 'SAR';
  const totalInvested = investments.reduce((s, i) => s + (Number(i.investmentAmount) || 0), 0);
  const totalOutstanding = investments.reduce((s, i) => s + (Number(i.outstandingCapital) || 0), 0);
  const totalExpected = investments.reduce((s, i) => s + (Number(i.expectedTotalPayment) || 0), 0);

  const headers = [
    {
      name: t('invl.col.investorProduct'),
      cell: (row: Investment) => (
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-medium text-foreground">{investorLabel(row)}</p>
          <p className="m-0 truncate text-xs text-muted-foreground">{productLabel(row)}</p>
          <p className="m-0 text-[11px] text-muted-foreground">
            {t('invl.createdLabel', { date: date(row.createdAt) })}
          </p>
        </div>
      ),
      width: '240px',
    },
    {
      name: t('invl.col.investment'),
      cell: (row: Investment) => (
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium tabular-nums text-foreground">
            {money(row.investmentAmount, row.currencyCode)}
          </p>
          <p className="m-0 text-[11px] text-muted-foreground">
            {t('invl.payableLabel', { value: money(row.totalPayable, row.currencyCode) })}
          </p>
        </div>
      ),
      width: '170px',
    },
    {
      name: t('invl.col.expectedReturn'),
      cell: (row: Investment) => (
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium tabular-nums text-foreground">
            {money(row.expectedTotalPayment, row.currencyCode)}
          </p>
          <p className="m-0 text-[11px] text-muted-foreground">
            {row.profitDistributionFrequency ? humanise(row.profitDistributionFrequency) : '—'}
          </p>
        </div>
      ),
      width: '170px',
    },
    {
      name: t('invl.col.received'),
      cell: (row: Investment) => (
        <div className="min-w-0">
          <p className="m-0 text-sm tabular-nums text-foreground">
            {money(row.totalPaymentReceived, row.currencyCode)}
          </p>
          <p className="m-0 text-[11px] text-muted-foreground">
            {t('invl.returnsLabel', { value: money(row.totalReturn, row.currencyCode) })}
          </p>
        </div>
      ),
      width: '170px',
    },
    {
      name: t('invl.col.outstanding'),
      cell: (row: Investment) => (
        <div className="min-w-0">
          <p className="m-0 text-sm tabular-nums text-foreground">
            {money(row.outstandingCapital, row.currencyCode)}
          </p>
          <p className="m-0 text-[11px] text-muted-foreground">
            {t('invl.repaidLabel', { value: money(row.capitalRepaid, row.currencyCode) })}
          </p>
        </div>
      ),
      width: '170px',
    },
    {
      name: t('invl.col.term'),
      cell: (row: Investment) => (
        <div className="min-w-0">
          <p className="m-0 text-sm text-foreground">
            {date(row.startDate)} — {date(row.maturityDate)}
          </p>
          <p className="m-0 text-[11px] text-muted-foreground">
            {t('invl.nextPayoutLabel', { date: date(row.nextPayout) })}
          </p>
        </div>
      ),
      width: '210px',
    },
    { name: t('common:status'), cell: (row: Investment) => statusBadge(row.status), width: '150px' },
    {
      name: t('common:actions'),
      cell: (row: Investment) => (
        <LexRowActions>
          <LexRowAction icon={Eye} onSelect={() => setSelectedInvestment(row)}>
            {t('irl.viewDetails')}
          </LexRowAction>
          {canManage && (
            <LexRowAction
              icon={Settings}
              to={`/InvestorDashboard/Investments/${row.id}/adjust`}
            >
              {t('invl.adjustInvestment')}
            </LexRowAction>
          )}
        </LexRowActions>
      ),
      width: '130px',
    },
  ];

  const detailRows: [string, string][] = selectedInvestment
    ? [
        [t('invl.investor'), investorLabel(selectedInvestment)],
        [t('invl.product'), productLabel(selectedInvestment)],
        [
          t('invl.investmentAmount'),
          money(selectedInvestment.investmentAmount, selectedInvestment.currencyCode),
        ],
        [
          t('invl.processingFee'),
          money(selectedInvestment.processingFee, selectedInvestment.currencyCode),
        ],
        [t('invl.vat'), money(selectedInvestment.vat, selectedInvestment.currencyCode)],
        [
          t('invl.totalPayable'),
          money(selectedInvestment.totalPayable, selectedInvestment.currencyCode),
        ],
        [
          t('invl.expectedPayment'),
          money(selectedInvestment.expectedTotalPayment, selectedInvestment.currencyCode),
        ],
        [
          t('invl.firstReturn'),
          money(selectedInvestment.firstExpectedReturn, selectedInvestment.currencyCode),
        ],
        [
          t('invl.monthlyReturn'),
          money(selectedInvestment.monthlyReturnAmount, selectedInvestment.currencyCode),
        ],
        [
          t('invl.yearlyReturn'),
          money(selectedInvestment.yearlyReturnAmount, selectedInvestment.currencyCode),
        ],
        [
          t('invl.received'),
          money(selectedInvestment.totalPaymentReceived, selectedInvestment.currencyCode),
        ],
        [
          t('invl.capitalRepaid'),
          money(selectedInvestment.capitalRepaid, selectedInvestment.currencyCode),
        ],
        [
          t('invl.outstandingCapital'),
          money(selectedInvestment.outstandingCapital, selectedInvestment.currencyCode),
        ],
        [
          t('invl.frequency'),
          selectedInvestment.profitDistributionFrequency
            ? humanise(selectedInvestment.profitDistributionFrequency)
            : '—',
        ],
        [t('invl.startDate'), date(selectedInvestment.startDate)],
        [t('invl.maturityDate'), date(selectedInvestment.maturityDate)],
        [t('invl.nextPayout'), date(selectedInvestment.nextPayout)],
        [t('common:status'), statusLabel(selectedInvestment.status)],
      ]
    : [];

  return (
    <div className="service">
      <LexPageHeader icon={BarChart3} title={t('invl.title')} subtitle={t('invl.subtitle')}>
        <Button variant="outline" size="sm" onClick={loadInvestments} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('common:refresh')}
        </Button>
        {canManage && (
          <Button asChild size="sm" className="gap-2">
            {/* Subscriptions are raised for approval, not created here. */}
            <Link to="/InvestorDashboard/ApproveInvestment">
              <Plus className="h-4 w-4" />
              {t('invl.approvalQueue')}
            </Link>
          </Button>
        )}
      </LexPageHeader>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t('invl.totalInvestments')}
          icon={BarChart3}
          tone="sky"
          value={totalRows}
          footnote={t('invl.allInvestors')}
        />
        <LexMetricTile
          label={t('invl.totalInvested')}
          icon={DollarSign}
          tone="emerald"
          value={money(totalInvested, pageCurrency)}
          footnote={t('invl.thisPage')}
        />
        <LexMetricTile
          label={t('invl.outstandingCapital')}
          icon={Wallet}
          tone="amber"
          value={money(totalOutstanding, pageCurrency)}
          footnote={t('invl.thisPage')}
        />
        <LexMetricTile
          label={t('invl.expectedPayment')}
          icon={TrendingUp}
          tone="slate"
          value={money(totalExpected, pageCurrency)}
          footnote={t('invl.thisPage')}
        />
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <LexSearch
            id="investments-search"
            className="flex-1"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('invl.searchPlaceholder')}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* The statuses the service actually returned, not a fixed list. */}
              <SelectItem value="ALL">{t('invl.allStatus')}</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {t('invl.countLabel', { shown: filtered.length, total: totalRows })}
          </span>
        </div>
      </div>

      <div className="pro-card p-4">
        {!loading && filtered.length === 0 ? (
          <EmptyState icon={BarChart3} text={t('common:noData')} />
        ) : (
          <TableView
            header={headers}
            data={filtered}
            isLoading={loading}
            skelitonLength={pageSize}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalRows={totalRows}
            totalPage={totalPage}
            from={from}
            to={to}
          />
        )}
      </div>

      <Dialog
        open={selectedInvestment !== null}
        onOpenChange={(open) => !open && setSelectedInvestment(null)}
      >
        <DialogContent className="pro-dialog max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <BarChart3 className="h-4 w-4" />
              </span>
              {t('invl.detailsTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedInvestment && (
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="mb-3">{statusBadge(selectedInvestment.status)}</div>

              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                {detailRows.map(([label, value]) => (
                  <Field key={label} label={label} value={value} />
                ))}
              </div>

              {selectedInvestment.rejectionReason && (
                <div className="mt-4">
                  <p className="m-0 text-xs text-muted-foreground">{t('invl.rejectionReason')}</p>
                  <p className="m-0 text-sm text-destructive">
                    {selectedInvestment.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInvestment(null)}>
              {t('common:close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
