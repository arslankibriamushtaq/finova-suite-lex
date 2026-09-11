import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Users,
  FileText,
  Mail,
  Eye,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  User
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import TableView from '../../../../components/TableView/TableView';
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
  LexNotice,
  LexPageHeader,
  LexRowAction,
  LexRowActions,
  LexSearch,
} from '../../../../components/shared/lexKit';

const investorStatements = [
  {
    id: 1,
    investorName: 'John Anderson',
    investorId: 'INV-001',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Delivered',
    deliveryMethod: 'Email + Portal',
    lastAccessed: '2024-01-08T14:30:00Z',
    fileSize: '2.4 MB',
    portfolioValue: 580000,
    monthlyReturn: 2.3,
    ytdReturn: 16.2
  },
  {
    id: 2,
    investorName: 'Sarah Chen',
    investorId: 'INV-002',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Delivered',
    deliveryMethod: 'Email + Portal',
    lastAccessed: '2024-01-06T09:15:00Z',
    fileSize: '2.8 MB',
    portfolioValue: 850000,
    monthlyReturn: 1.8,
    ytdReturn: 6.25
  },
  {
    id: 3,
    investorName: 'Michael Rodriguez',
    investorId: 'INV-003',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Failed',
    deliveryMethod: 'Email',
    lastAccessed: null,
    fileSize: '2.1 MB',
    portfolioValue: 285000,
    monthlyReturn: -0.5,
    ytdReturn: -5.0
  },
  {
    id: 4,
    investorName: 'Goldman Family Office',
    investorId: 'INV-004',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Delivered',
    deliveryMethod: 'Portal Only',
    lastAccessed: '2024-01-05T16:45:00Z',
    fileSize: '3.2 MB',
    portfolioValue: 1440000,
    monthlyReturn: 3.1,
    ytdReturn: 20.0
  },
  {
    id: 5,
    investorName: 'Emma Thompson',
    investorId: 'INV-005',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Pending',
    deliveryMethod: 'Email + Portal',
    lastAccessed: null,
    fileSize: '2.7 MB',
    portfolioValue: 2200000,
    monthlyReturn: 1.2,
    ytdReturn: 10.0
  },
  {
    id: 6,
    investorName: 'Tech Ventures LLC',
    investorId: 'INV-006',
    period: 'December 2023',
    statementDate: '2024-01-05',
    status: 'Delivered',
    deliveryMethod: 'Email + Portal',
    lastAccessed: '2024-01-07T11:20:00Z',
    fileSize: '2.9 MB',
    portfolioValue: 750000,
    monthlyReturn: 2.8,
    ytdReturn: 14.5
  }
];

const statementTemplates = [
  {
    id: 1,
    name: 'ist.tmpl.monthly',
    type: 'Monthly',
    lastModified: '2024-01-10',
    usage: 'Active'
  },
  {
    id: 2,
    name: 'ist.tmpl.quarterly',
    type: 'Quarterly',
    lastModified: '2023-12-28',
    usage: 'Active'
  },
  {
    id: 3,
    name: 'ist.tmpl.annual',
    type: 'Annual',
    lastModified: '2023-12-15',
    usage: 'Active'
  }
];

export default function InvestorStatements() {
  const { t } = useTranslation('investor');
  const deliveryKey: Record<string, string> = { 'Email + Portal': 'ist.delivery.emailPortal', 'Email': 'ist.delivery.email', 'Portal Only': 'ist.delivery.portalOnly' };
  const tDelivery = (v: string) => (deliveryKey[v] ? t(deliveryKey[v]) : v);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [periodFilter, setPeriodFilter] = useState('All Periods');
  const [selectedStatement, setSelectedStatement] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // The locale was pinned and the currency hardcoded to dollars, on a platform
  // whose every other figure is in SAR.
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  /**
   * Delivered and Failed resolved to exactly the same pale red — a statement
   * that reached an investor and one that did not looked identical.
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return TONES.emerald;
      case 'Pending':
        return TONES.amber;
      case 'Failed':
        return TONES.red;
      case 'Processing':
        return TONES.sky;
      default:
        return TONES.slate;
    }
  };

  const statusBadge = (status: string) => (
    <Badge variant="outline" className={cn('border font-medium', getStatusColor(status))}>
      {t(`ist.status.${status}`)}
    </Badge>
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return CheckCircle;
      case 'Pending': return Clock;
      case 'Failed': return AlertTriangle;
      case 'Processing': return RefreshCw;
      default: return FileText;
    }
  };

  const filteredStatements = investorStatements.filter(statement => {
    const matchesSearch = statement.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         statement.investorId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || statement.status === statusFilter;
    const matchesPeriod = periodFilter === 'All Periods' || statement.period === periodFilter;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const handleViewStatement = (statement: any) => {
    setSelectedStatement(statement);
    setShowDetailsModal(true);
  };

  /**
   * Resending, downloading, generating and bulk-emailing each popped a browser
   * dialog reporting success for work that never ran. "Statement resent to John
   * Anderson" is a claim about a message to a client; nothing was sent.
   */
  const notConnected = () => toast.error(t('invl.notConnected'));

  const handleResendStatement = notConnected;
  const handleDownloadStatement = notConnected;
  const handleGenerateStatements = notConnected;
  const handleBulkEmail = notConnected;

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return t('ist.never');
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statementHeaders = [
    {
      name: t('ist.col.investor'),
      cell: (row: any) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-medium text-foreground">{row.investorName}</p>
            <p className="m-0 truncate font-mono text-xs text-muted-foreground">
              {row.investorId}
            </p>
          </div>
        </div>
      ),
      width: '230px',
    },
    {
      name: t('ist.col.period'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 truncate text-sm text-foreground">{row.period}</p>
          <p className="m-0 truncate text-xs text-muted-foreground">
            {t('ist.generatedLabel', {
              date: new Date(row.statementDate).toLocaleDateString(),
            })}
          </p>
        </div>
      ),
      width: '190px',
    },
    {
      name: t('ist.col.portfolioValue'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium tabular-nums text-foreground">
            {formatCurrency(row.portfolioValue)}
          </p>
          <p className="m-0 text-xs text-muted-foreground">{row.fileSize}</p>
        </div>
      ),
      width: '160px',
    },
    {
      name: t('ist.col.performance'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 text-sm tabular-nums text-foreground">
            {t('ist.monthLabel', {
              value: `${row.monthlyReturn > 0 ? '+' : ''}${row.monthlyReturn}%`,
            })}
          </p>
          <p
            className={cn(
              'm-0 text-xs tabular-nums',
              row.ytdReturn >= 0 ? 'text-muted-foreground' : 'text-destructive'
            )}
          >
            {t('ist.ytdLabel', {
              value: `${row.ytdReturn > 0 ? '+' : ''}${row.ytdReturn}%`,
            })}
          </p>
        </div>
      ),
      width: '160px',
    },
    {
      name: t('common:status'),
      cell: (row: any) => {
        const StatusIcon = getStatusIcon(row.status);
        return (
          <span className="inline-flex items-center gap-1.5">
            <StatusIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {statusBadge(row.status)}
          </span>
        );
      },
      width: '170px',
    },
    {
      name: t('ist.col.delivery'),
      cell: (row: any) => (
        <span className="text-sm text-foreground">{tDelivery(row.deliveryMethod)}</span>
      ),
      width: '160px',
    },
    {
      name: t('ist.col.lastAccessed'),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDateTime(row.lastAccessed)}
        </span>
      ),
      width: '180px',
    },
    {
      name: t('common:actions'),
      cell: (row: any) => (
        <LexRowActions>
          <LexRowAction icon={Eye} onSelect={() => handleViewStatement(row)}>
            {t('ist.viewStatement')}
          </LexRowAction>
          <LexRowAction icon={Download} onSelect={handleDownloadStatement}>
            {t('doc.download')}
          </LexRowAction>
          {row.status === 'Failed' && (
            <LexRowAction icon={Send} onSelect={handleResendStatement}>
              {t('ist.resend')}
            </LexRowAction>
          )}
        </LexRowActions>
      ),
      width: '130px',
    },
  ];

  const templateHeaders = [
    {
      name: t('ist.col.templateName'),
      cell: (row: any) => (
        <span className="truncate text-sm font-medium text-foreground">{t(row.name)}</span>
      ),
      width: '260px',
    },
    {
      name: t('common:type'),
      cell: (row: any) => (
        <span className="text-sm text-foreground">{t(`reports.freq.${row.type}`)}</span>
      ),
      width: '160px',
    },
    {
      name: t('ist.col.lastModified'),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {new Date(row.lastModified).toLocaleDateString()}
        </span>
      ),
      width: '170px',
    },
    {
      name: t('common:status'),
      // Being in use was a red pill, the same red the failed statements above
      // it use. It is a neutral fact, not a problem.
      cell: () => (
        <Badge variant="outline" className={cn('border font-medium', TONES.emerald)}>
          {t('ist.usage.active')}
        </Badge>
      ),
      width: '140px',
    },
    {
      name: t('common:actions'),
      cell: () => (
        <LexRowActions>
          <LexRowAction icon={FileText} onSelect={notConnected}>
            {t('ist.editTemplate')}
          </LexRowAction>
          <LexRowAction icon={Eye} onSelect={notConnected}>
            {t('ist.preview')}
          </LexRowAction>
        </LexRowActions>
      ),
      width: '130px',
    },
  ];

  return (
    <div className="service">
      <LexPageHeader icon={Users} title={t('ist.title')} subtitle={t('ist.subtitle')}>
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
        <Button variant="outline" size="sm" className="gap-2" onClick={handleBulkEmail}>
          <Mail className="h-4 w-4" />
          {t('ist.bulkEmail')}
        </Button>
        <Button size="sm" className="gap-2" onClick={handleGenerateStatements}>
          <FileText className="h-4 w-4" />
          {t('ist.generateStatements')}
        </Button>
      </LexPageHeader>

      {/* Every statement on this page is a module-level literal — there is no
          fetch in this file. The rows carry investor names and portfolio values,
          so they read as records. Delete this notice when the endpoint lands. */}
      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.notConnected')}
      </LexNotice>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t('ist.totalStatements')}
          icon={FileText}
          tone="slate"
          value={investorStatements.length}
          footnote={t('ist.thisPeriod')}
        />
        <LexMetricTile
          label={t('ist.delivered')}
          icon={CheckCircle}
          tone="emerald"
          value={investorStatements.filter((s) => s.status === 'Delivered').length}
          footnote={t('ist.successfullySent')}
        />
        <LexMetricTile
          label={t('ist.failed')}
          icon={AlertTriangle}
          tone="red"
          value={investorStatements.filter((s) => s.status === 'Failed').length}
          footnote={t('ist.requireAttention')}
        />
        {/* 78% is a literal in the markup, not a figure derived from anything. */}
        <LexMetricTile
          label={t('ist.accessRate')}
          icon={Eye}
          tone="sky"
          value="78%"
          footnote={t('ist.investorsViewed')}
        />
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <LexSearch
            id="statement-search"
            className="flex-1"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('ist.searchPlaceholder')}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">{t('ist.allStatus')}</SelectItem>
              <SelectItem value="Delivered">{t('ist.status.Delivered')}</SelectItem>
              <SelectItem value="Pending">{t('ist.status.Pending')}</SelectItem>
              <SelectItem value="Failed">{t('ist.status.Failed')}</SelectItem>
              <SelectItem value="Processing">{t('ist.status.Processing')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Periods">{t('ist.allPeriods')}</SelectItem>
              <SelectItem value="December 2023">December 2023</SelectItem>
              <SelectItem value="November 2023">November 2023</SelectItem>
              <SelectItem value="October 2023">October 2023</SelectItem>
            </SelectContent>
          </Select>
          {/* "More Filters" was a button with no handler, sitting beside two
              that work. */}
          <span className="whitespace-nowrap text-xs text-muted-foreground lg:ms-auto">
            {t('ist.countLabel', {
              shown: filteredStatements.length,
              total: investorStatements.length,
            })}
          </span>
        </div>
      </div>

      <div className="pro-card p-0">
        {filteredStatements.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={FileText} text={t('ist.noMatch')} />
          </div>
        ) : (
          <TableView
            header={statementHeaders}
            data={filteredStatements}
            totalRows={filteredStatements.length}
            isLoading={false}
            from={1}
            page={1}
            totalPage={1}
            setPage={() => {}}
            pageSize={filteredStatements.length || 10}
            setPageSize={() => {}}
            to={filteredStatements.length}
          />
        )}
      </div>

      <div className="pro-card mt-3 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="pro-head-badge">
              <FileText className="h-4 w-4" />
            </span>
            <h3 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t('ist.templatesTitle')}
            </h3>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={notConnected}>
            <FileText className="h-4 w-4" />
            {t('ist.manageTemplates')}
          </Button>
        </div>
        <TableView
          header={templateHeaders}
          data={statementTemplates}
          totalRows={statementTemplates.length}
          isLoading={false}
          from={1}
          page={1}
          totalPage={1}
          setPage={() => {}}
          pageSize={statementTemplates.length || 10}
          setPageSize={() => {}}
          to={statementTemplates.length}
        />
      </div>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <FileText className="h-4 w-4" />
              </span>
              {t('ist.detailsTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedStatement && (
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {statusBadge(selectedStatement.status)}
                <span className="text-sm text-muted-foreground">
                  {selectedStatement.investorName} &middot; {selectedStatement.period}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
                <Field label={t('ist.col.investor')} value={selectedStatement.investorName} />
                <Field label={t('ist.investorId')} value={selectedStatement.investorId} mono />
                <Field label={t('ist.col.period')} value={selectedStatement.period} />
                <Field
                  label={t('ist.statementDate')}
                  value={new Date(selectedStatement.statementDate).toLocaleDateString()}
                />
                <Field
                  label={t('ist.col.delivery')}
                  value={selectedStatement.deliveryMethod}
                />
                <Field
                  label={t('ist.lastAccessed')}
                  value={formatDateTime(selectedStatement.lastAccessed)}
                />
                <Field
                  label={t('ist.portfolioValue')}
                  value={formatCurrency(selectedStatement.portfolioValue)}
                />
                <Field label={t('ist.fileSize')} value={selectedStatement.fileSize} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              {t('common:close')}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleResendStatement}>
              <Send className="h-4 w-4" />
              {t('ist.resend')}
            </Button>
            <Button className="gap-2" onClick={handleDownloadStatement}>
              <Download className="h-4 w-4" />
              {t('doc.download')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
