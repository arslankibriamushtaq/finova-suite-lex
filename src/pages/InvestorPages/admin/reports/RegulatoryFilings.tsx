import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  RefreshCw,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Upload,
  Send,
  Building,
  Scale
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import TableView from '../../../../components/TableView/TableView';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
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

const regulatoryFilings = [
  {
    id: 1,
    formType: 'Form ADV',
    formName: 'rf.form.adv',
    dueDate: '2024-03-31',
    filingDate: '2024-03-15',
    status: 'Filed',
    regulator: 'SEC',
    submittedBy: 'Sarah Johnson',
    confirmationNumber: 'SEC-2024-001234',
    fileSize: '8.5 MB',
    priority: 'High'
  },
  {
    id: 2,
    formType: 'Form 13F',
    formName: 'rf.form.13f',
    dueDate: '2024-02-14',
    filingDate: '2024-02-10',
    status: 'Filed',
    regulator: 'SEC',
    submittedBy: 'Mike Davis',
    confirmationNumber: 'SEC-2024-001189',
    fileSize: '12.3 MB',
    priority: 'High'
  },
  {
    id: 3,
    formType: 'Form PF',
    formName: 'rf.form.pf',
    dueDate: '2024-04-30',
    filingDate: null,
    status: 'In Progress',
    regulator: 'SEC',
    submittedBy: 'Sarah Johnson',
    confirmationNumber: null,
    fileSize: null,
    priority: 'Medium'
  },
  {
    id: 4,
    formType: 'AIF',
    formName: 'rf.form.aif',
    dueDate: '2024-01-31',
    filingDate: '2024-01-28',
    status: 'Filed',
    regulator: 'ESMA',
    submittedBy: 'Sarah Johnson',
    confirmationNumber: 'ESMA-2024-00567',
    fileSize: '15.7 MB',
    priority: 'High'
  },
  {
    id: 5,
    formType: 'CFTC Form CPO-PQR',
    formName: 'rf.form.cpopqr',
    dueDate: '2024-05-15',
    filingDate: null,
    status: 'Pending Review',
    regulator: 'CFTC',
    submittedBy: 'Mike Davis',
    confirmationNumber: null,
    fileSize: '6.8 MB',
    priority: 'Medium'
  },
  {
    id: 6,
    formType: 'Form D',
    formName: 'rf.form.d',
    dueDate: '2024-03-15',
    filingDate: null,
    status: 'Overdue',
    regulator: 'SEC',
    submittedBy: null,
    confirmationNumber: null,
    fileSize: null,
    priority: 'Critical'
  }
];

const regulators = [
  { code: 'SEC', name: 'rf.reg.sec', country: 'US' },
  { code: 'CFTC', name: 'rf.reg.cftc', country: 'US' },
  { code: 'FINRA', name: 'rf.reg.finra', country: 'US' },
  { code: 'ESMA', name: 'rf.reg.esma', country: 'EU' },
  { code: 'FCA', name: 'rf.reg.fca', country: 'UK' }
];

const upcomingDeadlines = [
  { formType: 'Form D', dueDate: '2024-03-15', daysUntil: 5, priority: 'Critical' },
  { formType: 'Form ADV', dueDate: '2024-03-31', daysUntil: 21, priority: 'High' },
  { formType: 'Form PF', dueDate: '2024-04-30', daysUntil: 51, priority: 'Medium' },
  { formType: 'CFTC Form CPO-PQR', dueDate: '2024-05-15', daysUntil: 66, priority: 'Medium' }
];

export default function RegulatoryFilings() {
  const { t } = useTranslation('investor');
  const statusKey: Record<string, string> = { 'Filed': 'rf.status.filed', 'In Progress': 'rf.status.inProgress', 'Pending Review': 'rf.status.pendingReview', 'Overdue': 'rf.status.overdue', 'Draft': 'rf.status.draft' };
  const priorityKey: Record<string, string> = { 'Critical': 'rf.priority.critical', 'High': 'rf.priority.high', 'Medium': 'rf.priority.medium', 'Low': 'rf.priority.low' };
  const tStatus = (v: string) => (statusKey[v] ? t(statusKey[v]) : v);
  const tPriority = (v: string) => (priorityKey[v] ? t(priorityKey[v]) : v);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [regulatorFilter, setRegulatorFilter] = useState('All Regulators');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [selectedFiling, setSelectedFiling] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  /**
   * Filed and Overdue resolved to exactly the same pale red. On a regulatory
   * filing screen those are the two states that matter most and they were
   * indistinguishable; In Progress and Draft were two greys a shade apart.
   */
  const getStatusTone = (status: string) => {
    switch (status) {
      case 'Filed':
        return TONES.emerald;
      case 'In Progress':
        return TONES.sky;
      case 'Pending Review':
        return TONES.amber;
      case 'Overdue':
        return TONES.red;
      case 'Draft':
      default:
        return TONES.slate;
    }
  };

  /** Critical and Low resolved to that same pale red as each other. */
  const getPriorityTone = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return TONES.red;
      case 'High':
        return TONES.orange;
      case 'Medium':
        return TONES.amber;
      case 'Low':
      default:
        return TONES.slate;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Filed':
        return CheckCircle;
      case 'In Progress':
        return Clock;
      case 'Pending Review':
        return Eye;
      case 'Overdue':
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const filteredFilings = regulatoryFilings.filter((filing) => {
    const matchesSearch =
      filing.formType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filing.formName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || filing.status === statusFilter;
    const matchesRegulator =
      regulatorFilter === 'All Regulators' || filing.regulator === regulatorFilter;
    const matchesPriority =
      priorityFilter === 'All Priorities' || filing.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesRegulator && matchesPriority;
  });

  const handleViewFiling = (filing: any) => {
    setSelectedFiling(filing);
    setShowDetailsModal(true);
  };

  /**
   * Downloading, submitting and uploading each popped a browser dialog
   * reporting success for work that never ran — on a screen about filings to a
   * regulator, "Submitting Form PF to SEC" is a claim nobody should make on
   * the strength of a literal array.
   */
  const notConnected = () => toast.error(t('invl.notConnected'));

  const handleDownloadFiling = notConnected;
  const handleSubmitFiling = notConnected;
  const handleNewFiling = () => setShowUploadModal(true);
  const handleUploadFiling = () => {
    notConnected();
    setShowUploadModal(false);
  };

  // Was pinned to the US locale, so a French or Arabic operator read "Mar 31".
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('rf.notFiled');
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const statusBadge = (status: string) => (
    <Badge variant="outline" className={cn('border font-medium', getStatusTone(status))}>
      {tStatus(status)}
    </Badge>
  );

  const priorityBadge = (priority: string) => (
    <Badge variant="outline" className={cn('border font-medium', getPriorityTone(priority))}>
      {tPriority(priority)}
    </Badge>
  );

  const filingHeaders = [
    {
      name: t('rf.col.form'),
      cell: (row: any) => {
        const StatusIcon = getStatusIcon(row.status);
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <StatusIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-medium text-foreground">{row.formType}</p>
              <p className="m-0 truncate text-xs text-muted-foreground">{t(row.formName)}</p>
            </div>
          </div>
        );
      },
      width: '230px',
    },
    {
      name: t('rf.col.regulator'),
      cell: (row: any) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
          <Building className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {row.regulator}
        </span>
      ),
      width: '130px',
    },
    {
      name: t('rf.col.dueDate'),
      cell: (row: any) => {
        const daysUntil = getDaysUntilDue(row.dueDate);
        return (
          <div className="min-w-0">
            <p className="m-0 whitespace-nowrap text-sm text-foreground">
              {formatDate(row.dueDate)}
            </p>
            <p
              className={cn(
                'm-0 whitespace-nowrap text-xs',
                daysUntil <= 0
                  ? 'text-destructive'
                  : daysUntil <= 7
                    ? 'text-amber-600'
                    : 'text-muted-foreground'
              )}
            >
              {daysUntil <= 0 ? t('rf.overdueLabel') : t('rf.daysLeft', { days: daysUntil })}
            </p>
          </div>
        );
      },
      width: '160px',
    },
    { name: t('common:status'), cell: (row: any) => statusBadge(row.status), width: '150px' },
    {
      name: t('rf.col.priority'),
      cell: (row: any) => priorityBadge(row.priority),
      width: '130px',
    },
    {
      name: t('common:actions'),
      cell: (row: any) => (
        <LexRowActions>
          <LexRowAction icon={Eye} onSelect={() => handleViewFiling(row)}>
            {t('irl.viewDetails')}
          </LexRowAction>
          {row.status === 'Filed' && (
            <LexRowAction icon={Download} onSelect={handleDownloadFiling}>
              {t('doc.download')}
            </LexRowAction>
          )}
          {(row.status === 'In Progress' || row.status === 'Draft') && (
            <LexRowAction icon={Send} onSelect={handleSubmitFiling}>
              {t('common:submit')}
            </LexRowAction>
          )}
        </LexRowActions>
      ),
      width: '130px',
    },
  ];

  return (
    <div className="service">
      <LexPageHeader icon={Shield} title={t('rf.title')} subtitle={t('rf.subtitle')}>
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
        <Button variant="outline" size="sm" className="gap-2" onClick={notConnected}>
          <Download className="h-4 w-4" />
          {t('rf.exportCalendar')}
        </Button>
        <Button size="sm" className="gap-2" onClick={handleNewFiling}>
          <Upload className="h-4 w-4" />
          {t('rf.newFiling')}
        </Button>
      </LexPageHeader>

      {/* Every filing, deadline and regulator on this page is a module-level
          literal — there is no fetch in this file. On a compliance screen the
          rows look exactly like real submissions, and an operator has no other
          way to tell. Delete this notice when the endpoint lands. */}
      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.notConnected')}
      </LexNotice>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t('rf.totalFilings')}
          icon={FileText}
          tone="slate"
          value={regulatoryFilings.length}
          footnote={t('rf.thisYear')}
        />
        <LexMetricTile
          label={t('rf.filed')}
          icon={CheckCircle}
          tone="emerald"
          value={regulatoryFilings.filter((f) => f.status === 'Filed').length}
          footnote={t('rf.onTime')}
        />
        <LexMetricTile
          label={t('rf.overdue')}
          icon={AlertTriangle}
          tone="red"
          value={regulatoryFilings.filter((f) => f.status === 'Overdue').length}
          footnote={t('rf.requireAttention')}
        />
        <LexMetricTile
          label={t('rf.inProgress')}
          icon={Clock}
          tone="sky"
          value={
            regulatoryFilings.filter(
              (f) => f.status === 'In Progress' || f.status === 'Pending Review'
            ).length
          }
          footnote={t('rf.activeFilings')}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="pro-card p-3 mb-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <LexSearch
                id="filing-search"
                className="flex-1"
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t('rf.searchPlaceholder')}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">{t('rf.allStatus')}</SelectItem>
                  <SelectItem value="Filed">{t('rf.status.filed')}</SelectItem>
                  <SelectItem value="In Progress">{t('rf.status.inProgress')}</SelectItem>
                  <SelectItem value="Pending Review">{t('rf.status.pendingReview')}</SelectItem>
                  <SelectItem value="Overdue">{t('rf.status.overdue')}</SelectItem>
                  <SelectItem value="Draft">{t('rf.status.draft')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={regulatorFilter} onValueChange={setRegulatorFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Regulators">{t('rf.allRegulators')}</SelectItem>
                  {regulators.map((regulator) => (
                    <SelectItem key={regulator.code} value={regulator.code}>
                      {regulator.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* The priority filter had state and a filter clause but no
                  control anywhere on the page, so it could never be set. */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Priorities">{t('rf.allPriorities')}</SelectItem>
                  <SelectItem value="Critical">{t('rf.priority.critical')}</SelectItem>
                  <SelectItem value="High">{t('rf.priority.high')}</SelectItem>
                  <SelectItem value="Medium">{t('rf.priority.medium')}</SelectItem>
                  <SelectItem value="Low">{t('rf.priority.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pro-card p-0">
            {filteredFilings.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={FileText} text={t('rf.noMatch')} />
              </div>
            ) : (
              <TableView
                header={filingHeaders}
                data={filteredFilings}
                totalRows={filteredFilings.length}
                isLoading={false}
                from={1}
                page={1}
                totalPage={1}
                setPage={() => {}}
                pageSize={filteredFilings.length || 10}
                setPageSize={() => {}}
                to={filteredFilings.length}
              />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="pro-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Calendar className="h-4 w-4" />
              </span>
              <h3 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('rf.upcomingDeadlines')}
              </h3>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-medium text-foreground">
                      {deadline.formType}
                    </p>
                    <p className="m-0 text-xs text-muted-foreground">
                      {formatDate(deadline.dueDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={cn(
                        'text-sm font-medium tabular-nums',
                        deadline.daysUntil <= 7 ? 'text-destructive' : 'text-foreground'
                      )}
                    >
                      {t('rf.daysLabel', { days: deadline.daysUntil })}
                    </span>
                    {priorityBadge(deadline.priority)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pro-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Scale className="h-4 w-4" />
              </span>
              <h3 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('rf.regulators')}
              </h3>
            </div>
            <div className="space-y-2.5">
              {regulators.map((regulator) => (
                <div key={regulator.code} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Scale className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p
                        className="m-0 truncate text-sm font-medium text-foreground"
                        title={t(regulator.name)}
                      >
                        {regulator.code}
                      </p>
                      <p className="m-0 truncate text-xs text-muted-foreground">
                        {regulator.country}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {regulatoryFilings.filter((f) => f.regulator === regulator.code).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pro-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Shield className="h-4 w-4" />
              </span>
              <h3 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('reports.quickActions')}
              </h3>
            </div>
            {/* These three were buttons with no handler at all — they looked
                exactly like the ones that do something. */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={notConnected}
              >
                <Calendar className="h-4 w-4" />
                {t('rf.filingCalendar')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={notConnected}
              >
                <AlertTriangle className="h-4 w-4" />
                {t('rf.riskAssessment')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={notConnected}
              >
                <Shield className="h-4 w-4" />
                {t('rf.complianceCheck')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <FileText className="h-4 w-4" />
              </span>
              {t('rf.detailsTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedFiling && (
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {statusBadge(selectedFiling.status)}
                {priorityBadge(selectedFiling.priority)}
              </div>
              <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
                <Field label={t('rf.formType')} value={selectedFiling.formType} />
                <Field label={t('rf.formName')} value={t(selectedFiling.formName)} />
                <Field label={t('rf.col.regulator')} value={selectedFiling.regulator} />
                <Field label={t('rf.col.dueDate')} value={formatDate(selectedFiling.dueDate)} />
                <Field label={t('rf.filingDate')} value={formatDate(selectedFiling.filingDate)} />
                <Field
                  label={t('rf.submittedBy')}
                  value={selectedFiling.submittedBy || t('rf.notSubmitted')}
                />
                {selectedFiling.confirmationNumber && (
                  <Field
                    label={t('rf.confirmationNumber')}
                    value={selectedFiling.confirmationNumber}
                    mono
                  />
                )}
                {selectedFiling.fileSize && (
                  <Field label={t('rf.fileSize')} value={selectedFiling.fileSize} />
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              {t('common:close')}
            </Button>
            {selectedFiling?.status === 'Filed' && (
              <Button
                className="gap-2"
                onClick={() => {
                  handleDownloadFiling();
                  setShowDetailsModal(false);
                }}
              >
                <Download className="h-4 w-4" />
                {t('rf.downloadFiling')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Upload className="h-4 w-4" />
              </span>
              {t('rf.newFiling')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rf-form-type">{t('rf.formType')}</Label>
              <Select>
                <SelectTrigger id="rf-form-type">
                  <SelectValue placeholder={t('rf.selectFormType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Form ADV">Form ADV</SelectItem>
                  <SelectItem value="Form 13F">Form 13F</SelectItem>
                  <SelectItem value="Form PF">Form PF</SelectItem>
                  <SelectItem value="Form D">Form D</SelectItem>
                  <SelectItem value="AIF">AIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rf-regulator">{t('rf.col.regulator')}</Label>
              <Select>
                <SelectTrigger id="rf-regulator">
                  <SelectValue placeholder={t('rf.selectRegulator')} />
                </SelectTrigger>
                <SelectContent>
                  {regulators.map((regulator) => (
                    <SelectItem key={regulator.code} value={regulator.code}>
                      {regulator.code} - {t(regulator.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rf-due">{t('rf.col.dueDate')}</Label>
              <Input id="rf-due" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rf-priority">{t('rf.col.priority')}</Label>
              <Select defaultValue="Medium">
                <SelectTrigger id="rf-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">{t('rf.priority.low')}</SelectItem>
                  <SelectItem value="Medium">{t('rf.priority.medium')}</SelectItem>
                  <SelectItem value="High">{t('rf.priority.high')}</SelectItem>
                  <SelectItem value="Critical">{t('rf.priority.critical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleUploadFiling} className="gap-2">
              <Upload className="h-4 w-4" />
              {t('rf.createFiling')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
