import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import TableView from '../../../components/TableView/TableView';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { EmptyState, Field } from '../../../components/shared/detailKit';
import { TONES } from '../../../components/shared/detailKitUtils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  LexMetricTile,
  LexNotice,
  LexPageHeader,
  LexRowAction,
  LexRowActions,
  LexSearch,
} from '../../../components/shared/lexKit';
import {
  Download,
  Filter,
  User,
  Activity,
  AlertTriangle,
  Eye,
  RefreshCw,
  FileText,
  Settings,
  Shield,
  ShieldCheck,
  Database,
  Lock,
} from 'lucide-react';

const auditLogs = [
  {
    id: 1,
    timestamp: '2024-01-22T14:30:25Z',
    user: 'admin@portfolio.com',
    userType: 'Admin',
    action: 'Investment Adjustment',
    category: 'Investment',
    description: 'Manual investment adjustment for John Anderson - Large Cap Growth Fund',
    details: {
      investorId: 1,
      productId: 1,
      amount: 100000,
      previousValue: 500000,
      newValue: 600000,
      reason: 'Client request'
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Success',
    severity: 'Medium',
    module: 'Investments'
  },
  {
    id: 2,
    timestamp: '2024-01-22T14:15:10Z',
    user: 'john.anderson@wealth.com',
    userType: 'Investor',
    action: 'Document Upload',
    category: 'KYC',
    description: 'Uploaded bank statement for KYC verification',
    details: {
      documentType: 'Bank Statement',
      fileName: 'bank_statement_jan_2024.pdf',
      fileSize: '2.4 MB',
      status: 'Pending Review'
    },
    ipAddress: '203.45.67.89',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'Success',
    severity: 'Low',
    module: 'KYC'
  },
  {
    id: 3,
    timestamp: '2024-01-22T13:45:55Z',
    user: 'system@portfolio.com',
    userType: 'System',
    action: 'Price Update',
    category: 'System',
    description: 'Daily NAV price update for all active products',
    details: {
      productsUpdated: 38,
      priceSource: 'Bloomberg API',
      updateType: 'Scheduled',
      totalProcessingTime: '45 seconds'
    },
    ipAddress: 'Internal',
    userAgent: 'System/1.0',
    status: 'Success',
    severity: 'Low',
    module: 'Pricing'
  },
  {
    id: 4,
    timestamp: '2024-01-22T13:20:30Z',
    user: 'compliance@portfolio.com',
    userType: 'Compliance',
    action: 'Risk Alert',
    category: 'Compliance',
    description: 'Risk threshold exceeded for Emerging Markets Equity fund',
    details: {
      productId: 3,
      riskMetric: 'VaR',
      threshold: '5%',
      actualValue: '6.2%',
      alertLevel: 'High'
    },
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Alert',
    severity: 'High',
    module: 'Risk Management'
  },
  {
    id: 5,
    timestamp: '2024-01-22T12:30:15Z',
    user: 'sarah.chen@techcorp.com',
    userType: 'Investor',
    action: 'Login',
    category: 'Authentication',
    description: 'Successful login to investor portal',
    details: {
      sessionId: 'sess_abc123def456',
      authMethod: 'Email + 2FA',
      deviceType: 'Desktop'
    },
    ipAddress: '198.51.100.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Success',
    severity: 'Low',
    module: 'Authentication'
  },
  {
    id: 6,
    timestamp: '2024-01-22T11:45:20Z',
    user: 'admin@portfolio.com',
    userType: 'Admin',
    action: 'User Role Update',
    category: 'User Management',
    description: 'Updated permissions for compliance user',
    details: {
      targetUser: 'compliance@portfolio.com',
      previousRole: 'Compliance Officer',
      newRole: 'Senior Compliance Officer',
      permissionsAdded: ['Advanced Risk Reports', 'Regulatory Filing']
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Success',
    severity: 'Medium',
    module: 'User Management'
  },
  {
    id: 7,
    timestamp: '2024-01-22T10:15:45Z',
    user: 'system@portfolio.com',
    userType: 'System',
    action: 'Report Generation',
    category: 'Reports',
    description: 'Generated monthly P/L summary report',
    details: {
      reportType: 'P/L Summary',
      period: 'December 2023',
      recipients: 45,
      fileSize: '8.2 MB',
      deliveryMethod: 'Email + Portal'
    },
    ipAddress: 'Internal',
    userAgent: 'System/1.0',
    status: 'Success',
    severity: 'Low',
    module: 'Reports'
  },
  {
    id: 8,
    timestamp: '2024-01-22T09:30:12Z',
    user: 'unknown',
    userType: 'Unknown',
    action: 'Failed Login',
    category: 'Security',
    description: 'Multiple failed login attempts detected',
    details: {
      attemptedEmail: 'admin@portfolio.com',
      attempts: 5,
      timeWindow: '10 minutes',
      ipBlocked: true,
      reason: 'Brute force attempt'
    },
    ipAddress: '185.234.56.78',
    userAgent: 'Python/3.9 requests/2.28.1',
    status: 'Failed',
    severity: 'High',
    module: 'Security'
  }
];

const categories = ['All Categories', 'Investment', 'KYC', 'System', 'Compliance', 'Authentication', 'User Management', 'Reports', 'Security'];
const severities = ['All Severities', 'Low', 'Medium', 'High', 'Critical'];
const statuses = ['All Status', 'Success', 'Failed', 'Alert', 'Warning'];
const modules = ['All Modules', 'Investments', 'KYC', 'Pricing', 'Risk Management', 'Authentication', 'User Management', 'Reports', 'Security'];

/** One labelled select in the filter bar. Five identical blocks became one. */
const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: string[];
  render: (option: string) => string;
}) => (
  <div className="flex flex-col gap-1">
    <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {render(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default function AuditLogs() {
  // This page carried no translation at all — every label, column head, filter
  // option and data value was a hardcoded English string, so an Arabic or
  // French session rendered it in English inside an RTL shell. It is the only
  // page in the module that was written that way.
  const { t } = useTranslation('investor');

  /** Data values are enumerable, so they translate through a key each. */
  const tCategory = (v: string) => t(`iaud.cat.${v.replace(/\s+/g, '')}`);
  const tSeverity = (v: string) => t(`iaud.sev.${v}`);
  const tStatus = (v: string) => t(`iaud.st.${v}`);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [selectedLog, setSelectedLog] = useState<number | null>(null);

  // Success and Failed were BOTH `bg-red-100 text-red-800`. On an audit log
  // that is the distinction the page exists to make.
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return TONES.emerald;
      case 'Failed':
        return TONES.red;
      case 'Alert':
      case 'Warning':
        return TONES.amber;
      default:
        return TONES.slate;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return TONES.slate;
      case 'Medium':
        return TONES.sky;
      case 'High':
        return TONES.amber;
      case 'Critical':
        return TONES.red;
      default:
        return TONES.slate;
    }
  };

  const getActionIcon = (category: string) => {
    switch (category) {
      case 'Investment': return Activity;
      case 'KYC': return FileText;
      case 'System': return Settings;
      case 'Compliance': return Shield;
      case 'Authentication': return Lock;
      case 'User Management': return User;
      case 'Reports': return FileText;
      case 'Security': return AlertTriangle;
      default: return Activity;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'All Severities' || log.severity === severityFilter;
    const matchesStatus = statusFilter === 'All Status' || log.status === statusFilter;
    const matchesModule = moduleFilter === 'All Modules' || log.module === moduleFilter;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus && matchesModule;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * `auditLogs` is a module-level literal and there is no fetch in this file,
   * so there is nothing to export, refresh or report on. The old handler
   * alerted "Audit logs exported successfully!" and wrote no file.
   */
  const notConnected = () => toast.error(t('invl.notConnected'));

  const auditHeaders = [
    {
      name: t('iaud.col.timestamp'),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatTimestamp(row.timestamp)}
        </span>
      ),
      width: '190px',
    },
    {
      name: t('iaud.col.userAction'),
      cell: (row: any) => {
        const ActionIcon = getActionIcon(row.category);
        return (
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="pro-head-badge">
              <ActionIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">{row.user}</span>
              <span className="block truncate text-xs text-muted-foreground">{row.action}</span>
            </span>
          </span>
        );
      },
      width: '230px',
    },
    {
      name: t('common:description'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 line-clamp-2 text-sm text-foreground" title={row.description}>
            {row.description}
          </p>
          <p className="m-0 text-[11px] text-muted-foreground">{row.module}</p>
        </div>
      ),
      width: '280px',
    },
    {
      name: t('common:category'),
      cell: (row: any) => (
        <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
          {tCategory(row.category)}
        </Badge>
      ),
      width: '160px',
    },
    {
      name: t('common:status'),
      cell: (row: any) => (
        <Badge variant="outline" className={`border font-medium ${getStatusColor(row.status)}`}>
          {tStatus(row.status)}
        </Badge>
      ),
      width: '130px',
    },
    {
      name: t('iaud.severity'),
      cell: (row: any) => (
        <Badge
          variant="outline"
          className={`border font-medium ${getSeverityColor(row.severity)}`}
        >
          {tSeverity(row.severity)}
        </Badge>
      ),
      width: '130px',
    },
    {
      name: t('iaud.col.ipAddress'),
      cell: (row: any) => (
        <span className="font-mono text-xs text-muted-foreground">{row.ipAddress}</span>
      ),
      width: '140px',
    },
    {
      name: t('common:actions'),
      cell: (row: any) => (
        <LexRowActions>
          <LexRowAction
            icon={Eye}
            onSelect={() => setSelectedLog(selectedLog === row.id ? null : row.id)}
          >
            {t('common:viewDetails')}
          </LexRowAction>
        </LexRowActions>
      ),
      width: '130px',
    },
  ];

  const securityEvents = auditLogs.filter((log) => log.category === 'Security').length;
  const systemEvents = auditLogs.filter((log) => log.category === 'System').length;
  const userEvents = auditLogs.filter((log) => log.category === 'User Management').length;

  return (
    <div className="service">
      <LexPageHeader icon={ShieldCheck} title={t('iaud.title')} subtitle={t('iaud.subtitle')}>
        {/* Refresh and Security Report had no onClick at all. */}
        <Button variant="outline" size="sm" onClick={notConnected} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('common:refresh')}
        </Button>
        <Button variant="outline" size="sm" onClick={notConnected} className="gap-2">
          <Download className="h-4 w-4" />
          {t('ts.exportCsv')}
        </Button>
        <Button size="sm" onClick={notConnected} className="gap-2">
          <Shield className="h-4 w-4" />
          {t('iaud.securityReport')}
        </Button>
      </LexPageHeader>

      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.sampleDataNotice')}
      </LexNotice>

      {/* The three counts beside Total Events were the literals 1, 2 and 5,
          unrelated to the rows below. Counted from the data. */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t('iaud.stat.totalEvents')}
          icon={Activity}
          tone="sky"
          value={auditLogs.length}
          footnote={t('iaud.stat.last24h')}
        />
        <LexMetricTile
          label={t('iaud.stat.securityEvents')}
          icon={AlertTriangle}
          tone="red"
          value={securityEvents}
          denominator={auditLogs.length}
        />
        <LexMetricTile
          label={t('iaud.stat.systemEvents')}
          icon={Database}
          tone="slate"
          value={systemEvents}
          denominator={auditLogs.length}
        />
        <LexMetricTile
          label={t('iaud.stat.userActions')}
          icon={User}
          tone="emerald"
          value={userEvents}
          denominator={auditLogs.length}
        />
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('common:search')}
            </Label>
            <LexSearch
              id="audit-logs-search"
              className="w-full"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t('iaud.searchPlaceholder')}
            />
          </div>

          <FilterSelect
            label={t('common:category')}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories}
            render={(v) => (v === 'All Categories' ? t('iaud.allCategories') : tCategory(v))}
          />
          <FilterSelect
            label={t('iaud.severity')}
            value={severityFilter}
            onChange={setSeverityFilter}
            options={severities}
            render={(v) => (v === 'All Severities' ? t('iaud.allSeverities') : tSeverity(v))}
          />
          <FilterSelect
            label={t('common:status')}
            value={statusFilter}
            onChange={setStatusFilter}
            options={statuses}
            render={(v) => (v === 'All Status' ? t('iaud.allStatuses') : tStatus(v))}
          />
          {/* `moduleFilter` was already in the filter predicate and `modules`
              was already declared — the select for it was simply never
              rendered, so a third of the filtering was unreachable. */}
          <FilterSelect
            label={t('iaud.module')}
            value={moduleFilter}
            onChange={setModuleFilter}
            options={modules}
            render={(v) => (v === 'All Modules' ? t('iaud.allModules') : v)}
          />
        </div>

        {/* Reads as the card's footer rather than a stray third row. */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
          <span className="text-xs text-muted-foreground">
            {t('iaud.countLabel', { shown: filteredLogs.length, total: auditLogs.length })}
          </span>
          <Button variant="outline" size="sm" onClick={notConnected} className="gap-2">
            <Filter className="h-4 w-4" />
            {t('iaud.advancedFilters')}
          </Button>
        </div>
      </div>

      {/* The pager here was Previous / "1" / Next with no handlers on any of
          the three. Every row is already in memory. */}
      <div className="pro-card p-4">
        {filteredLogs.length === 0 ? (
          <EmptyState icon={Activity} text={t('common:noData')} />
        ) : (
          <TableView header={auditHeaders} data={filteredLogs} paginationShow={false} />
        )}
      </div>


      <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <FileText className="h-4 w-4" />
              </span>
              {t('iaud.detailsTitle')}
            </DialogTitle>
          </DialogHeader>

          {(() => {
            const log = auditLogs.find((l) => l.id === selectedLog);
            if (!log) return null;
            return (
              <div className="max-h-[70vh] overflow-y-auto">
                {/* The panel printed status and severity as plain sentences
                    while the table beside it rendered them as toned badges. */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`border font-medium ${getStatusColor(log.status)}`}
                  >
                    {log.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`border font-medium ${getSeverityColor(log.severity)}`}
                  >
                    {log.severity}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
                  <Field
                    label={t('iaud.col.timestamp')}
                    value={formatTimestamp(log.timestamp)}
                  />
                  <Field label={t('iaud.user')} value={`${log.user} (${log.userType})`} />
                  <Field label={t('iaud.action')} value={log.action} />
                  <Field label={t('iaud.category')} value={log.category} />
                  <Field label={t('iaud.module')} value={log.module} />
                  <Field label={t('iaud.col.ipAddress')} value={log.ipAddress} mono />
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="m-0 mb-1 text-xs text-muted-foreground">
                      {t('iaud.description')}
                    </p>
                    <p className="m-0 text-sm leading-relaxed text-foreground">
                      {log.description}
                    </p>
                  </div>
                  <div>
                    <p className="m-0 mb-1 text-xs text-muted-foreground">
                      {t('iaud.userAgent')}
                    </p>
                    <p className="m-0 break-all font-mono text-xs text-muted-foreground">
                      {log.userAgent}
                    </p>
                  </div>
                  <div>
                    <p className="m-0 mb-1.5 text-xs text-muted-foreground">
                      {t('iaud.additionalDetails')}
                    </p>
                    <pre className="m-0 overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              {t('common:close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Was a hand-rolled pager with hardcoded "1" and "2" buttons, none of
          them wired to anything, over a list the table already shows in full. */}
      <p className="mt-3 text-xs text-muted-foreground">
        {t('iaud.countLabel', { shown: filteredLogs.length, total: auditLogs.length })}
      </p>
    </div>
  );
}
