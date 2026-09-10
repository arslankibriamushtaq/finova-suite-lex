import { useState } from 'react';
import {
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Send,
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Play,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import TableView from '../../../components/TableView/TableView';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent } from '../../../components/ui/tabs';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  DetailTabsList,
  DetailTabsTrigger,
  EmptyState,
} from '../../../components/shared/detailKit';
import { TONES } from '../../../components/shared/detailKitUtils';
import {
  LexMetricTile,
  LexNotice,
  LexPageHeader,
  LexSearch,
} from '../../../components/shared/lexKit';

const notifications = [
  {
    id: 1,
    title: 'Monthly Portfolio Statement Ready',
    type: 'System',
    channel: 'Email + In-App',
    recipients: 1247,
    sent: '2024-01-22T10:00:00Z',
    status: 'Delivered',
    openRate: '85.2%',
    clickRate: '23.4%',
    category: 'Statements'
  },
  {
    id: 2,
    title: 'Risk Alert: Emerging Markets Fund',
    type: 'Alert',
    channel: 'Email + SMS',
    recipients: 89,
    sent: '2024-01-22T13:20:00Z',
    status: 'Delivered',
    openRate: '92.1%',
    clickRate: '67.4%',
    category: 'Risk Management'
  },
  {
    id: 3,
    title: 'Welcome to Our Platform',
    type: 'Onboarding',
    channel: 'Email',
    recipients: 5,
    sent: '2024-01-22T14:30:00Z',
    status: 'Delivered',
    openRate: '100%',
    clickRate: '80.0%',
    category: 'Onboarding'
  },
  {
    id: 4,
    title: 'Quarterly Performance Review',
    type: 'Scheduled',
    channel: 'Email + In-App',
    recipients: 1189,
    sent: null,
    status: 'Scheduled',
    openRate: null,
    clickRate: null,
    category: 'Performance'
  },
  {
    id: 5,
    title: 'KYC Document Approval',
    type: 'System',
    channel: 'Email',
    recipients: 1,
    sent: '2024-01-22T11:15:00Z',
    status: 'Failed',
    openRate: null,
    clickRate: null,
    category: 'KYC'
  }
];

const templates = [
  {
    id: 1,
    name: 'Monthly Statement',
    type: 'Email',
    category: 'Statements',
    lastModified: '2024-01-15',
    usage: 'Monthly',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Risk Alert Template',
    type: 'Email + SMS',
    category: 'Risk Management',
    lastModified: '2024-01-10',
    usage: 'Event-based',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Welcome Sequence',
    type: 'Email',
    category: 'Onboarding',
    lastModified: '2024-01-08',
    usage: 'Trigger-based',
    status: 'Active'
  },
  {
    id: 4,
    name: 'Investment Confirmation',
    type: 'Email + In-App',
    category: 'Transactions',
    lastModified: '2024-01-05',
    usage: 'Transaction-based',
    status: 'Draft'
  }
];

type RowAction = {
  icon: typeof Eye;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

/** A titled pair of settings fields. */
const SettingsGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </h5>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
  </div>
);

const SettingsField = ({ label, defaultValue }: { label: string; defaultValue: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <Input defaultValue={defaultValue} />
  </div>
);

export default function Notifications() {
  // Like the audit log, this page carried no translation at all — every label,
  // column head, filter option, settings field and data value was hardcoded
  // English inside an app that ships EN, FR and AR with RTL.
  const { t } = useTranslation('investor');

  const tStatus = (v: string) => t(`inot.st.${v}`);
  const tType = (v: string) => t(`inot.type.${v}`);

  const [activeTab, setActiveTab] = useState('notifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);

  // Delivered and Failed were both `bg-red-100 text-red-800` — a notification
  // that reached its recipients and one that did not looked the same.
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Active':
        return TONES.emerald;
      case 'Failed':
        return TONES.red;
      case 'Sending':
        return TONES.amber;
      case 'Scheduled':
      case 'Draft':
      default:
        return TONES.slate;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'System': return Settings;
      case 'Alert': return AlertTriangle;
      case 'Scheduled': return Clock;
      case 'Onboarding': return Users;
      default: return Bell;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return t('inot.notSent');
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || notification.status === statusFilter;
    const matchesType = typeFilter === 'All Types' || notification.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Notification Actions
  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
  };

  const handleEditNotification = (notification: any) => {
    setSelectedNotification(notification);
    setShowEditModal(true);
  };

  const handleDeleteNotification = (notification: any) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  /**
   * Fourteen handlers on this page reported success for work that never ran.
   *
   * "deleted successfully", "resent successfully", "settings saved
   * successfully" — every one an `alert()` over a module-level literal, with
   * no service behind any of it. On a screen that sends mail and SMS to real
   * investors, "resent successfully" is the worst of them: an operator would
   * have no reason to try again.
   */
  const notConnected = () => toast.error(t('invl.notConnected'));

  const handleCreateNotification = () => {
    notConnected();
    setShowCreateModal(false);
  };

  const handleSaveEdit = () => {
    notConnected();
    setShowEditModal(false);
    setSelectedNotification(null);
  };

  const confirmDelete = () => {
    notConnected();
    setShowDeleteModal(false);
    setSelectedNotification(null);
  };

  const handleResendNotification = notConnected;

  const handleDuplicateNotification = notConnected;

  // Template Actions
  const handleViewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    notConnected();
  };

  const handleDeleteTemplate = notConnected;

  const handleCreateTemplate = () => {
    notConnected();
    setShowCreateTemplateModal(false);
  };

  const handlePreviewTemplate = notConnected;

  const handleDuplicateTemplate = notConnected;

  const handleRefreshStatus = notConnected;

  const handleExportLogs = notConnected;

  const handleSaveSettings = notConnected;

  /**
   * Row actions on a menu rather than a row of icon buttons.
   *
   * Five bare glyphs per row is a guessing game, and Resend only appears on a
   * failed row — so the column had four icons on most rows and five on one,
   * and nothing lined up. A single trigger keeps the column a fixed width and
   * gives every action a name.
   */
  const RowActions = ({ items }: { items: RowAction[] }) => (
    <div
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {t('common:select')}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="z-[9999]">
          {items.map(({ icon: Icon, label, onSelect, destructive }) => (
            <DropdownMenuItem
              key={label}
              variant={destructive ? 'destructive' : 'default'}
              onSelect={(e) => {
                e.preventDefault();
                onSelect();
              }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const notificationHeaders = [
    {
      name: t('inot.col.notification'),
      cell: (row: any) => {
        const TypeIcon = getTypeIcon(row.type);
        return (
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="pro-head-badge">
              <TypeIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">{row.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{row.category}</span>
            </span>
          </span>
        );
      },
      width: '280px',
    },
    {
      name: t('inot.col.typeChannel'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 truncate text-sm text-foreground">{tType(row.type)}</p>
          <p className="m-0 truncate text-xs text-muted-foreground">{row.channel}</p>
        </div>
      ),
      width: '170px',
    },
    {
      name: t('inot.col.recipients'),
      cell: (row: any) => (
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          {row.recipients.toLocaleString()}
        </span>
      ),
      width: '140px',
    },
    {
      name: t('inot.col.sentDate'),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(row.sent)}
        </span>
      ),
      width: '170px',
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
      name: t('inot.col.performance'),
      cell: (row: any) =>
        row.openRate ? (
          <div className="min-w-0">
            <p className="m-0 text-sm tabular-nums text-foreground">
              {t('inot.openLabel', { value: row.openRate })}
            </p>
            <p className="m-0 text-xs tabular-nums text-muted-foreground">
              {t('inot.clickLabel', { value: row.clickRate })}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      width: '150px',
    },
    {
      name: t('common:actions'),
      cell: (row: any) => (
        <RowActions
          items={[
            { icon: Eye, label: t('common:viewDetails'), onSelect: () => handleViewDetails(row) },
            { icon: Edit, label: t('common:edit'), onSelect: () => handleEditNotification(row) },
            // Resend belongs only on a failure — it is the one row where it
            // means anything.
            ...(row.status === 'Failed'
              ? [
                  {
                    icon: Send,
                    label: t('inot.action.resend'),
                    onSelect: () => handleResendNotification(),
                  },
                ]
              : []),
            // Was a Plus icon, the same glyph as "Create Notification" in the
            // header — duplicating is not creating.
            {
              icon: Copy,
              label: t('inot.action.duplicate'),
              onSelect: () => handleDuplicateNotification(),
            },
            {
              icon: Trash2,
              label: t('common:delete'),
              onSelect: () => handleDeleteNotification(row),
              destructive: true,
            },
          ]}
        />
      ),
      width: '140px',
    },
  ];

  const templateHeaders = [
    {
      name: t('inot.tcol.name'),
      cell: (row: any) => (
        <span className="truncate text-sm font-medium text-foreground">{row.name}</span>
      ),
      width: '240px',
    },
    {
      name: t('common:type'),
      cell: (row: any) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          {row.type.includes('Email') && <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
          {row.type.includes('SMS') && (
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {row.type.includes('In-App') && <Bell className="h-3.5 w-3.5 text-muted-foreground" />}
          {row.type}
        </span>
      ),
      width: '180px',
    },
    {
      name: t('common:category'),
      cell: (row: any) => <span className="text-sm">{row.category}</span>,
      width: '150px',
    },
    {
      name: t('inot.tcol.usage'),
      cell: (row: any) => <span className="text-sm text-muted-foreground">{row.usage}</span>,
      width: '170px',
    },
    {
      name: t('inot.tcol.lastModified'),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {new Date(row.lastModified).toLocaleDateString()}
        </span>
      ),
      width: '150px',
    },
    {
      name: t('common:status'),
      cell: (row: any) => (
        <Badge variant="outline" className={`border font-medium ${getStatusColor(row.status)}`}>
          {tStatus(row.status)}
        </Badge>
      ),
      width: '120px',
    },
    {
      name: t('common:actions'),
      cell: (row: any) => (
        <RowActions
          items={[
            { icon: Eye, label: t('common:view'), onSelect: () => handleViewTemplate(row) },
            { icon: Edit, label: t('common:edit'), onSelect: () => handleEditTemplate(row) },
            { icon: Play, label: t('inot.action.preview'), onSelect: () => handlePreviewTemplate() },
            {
              icon: Copy,
              label: t('inot.action.duplicate'),
              onSelect: () => handleDuplicateTemplate(),
            },
            {
              icon: Trash2,
              label: t('common:delete'),
              onSelect: () => handleDeleteTemplate(),
              destructive: true,
            },
          ]}
        />
      ),
      width: '140px',
    },
  ];

  return (
    <div className="service">
      <LexPageHeader icon={Bell} title={t('inot.title')} subtitle={t('inot.subtitle')}>
        <Button variant="outline" size="sm" onClick={handleRefreshStatus} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('inot.refreshStatus')}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportLogs} className="gap-2">
          <Download className="h-4 w-4" />
          {t('inot.exportLogs')}
        </Button>
        <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('inot.createNotification')}
        </Button>
      </LexPageHeader>

      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.sampleDataNotice')}
      </LexNotice>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t('inot.stat.totalSent')}
          icon={Send}
          tone="sky"
          value="15,247"
          footnote={t('inot.stat.thisMonth')}
        />
        <LexMetricTile
          label={t('inot.stat.deliveryRate')}
          icon={CheckCircle2}
          tone="emerald"
          value="98.5%"
          footnote={t('inot.stat.aboveTarget')}
        />
        <LexMetricTile
          label={t('inot.stat.openRate')}
          icon={Eye}
          tone="slate"
          value="87.2%"
          footnote={t('inot.stat.vsLastMonth')}
        />
        <LexMetricTile
          label={t('inot.stat.activeTemplates')}
          icon={MessageSquare}
          tone="amber"
          value="23"
          footnote={t('inot.stat.inDraft')}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <DetailTabsList className="mb-3">
          <DetailTabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            {t('inot.tab.notifications')}
          </DetailTabsTrigger>
          <DetailTabsTrigger value="templates" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('inot.tab.templates')}
          </DetailTabsTrigger>
          <DetailTabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            {t('inot.tab.settings')}
          </DetailTabsTrigger>
        </DetailTabsList>

        <TabsContent value="notifications">
          <div className="pro-card p-3 mb-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <LexSearch
                id="notifications-search"
                className="flex-1"
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t('inot.searchPlaceholder')}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">{t('inot.allStatuses')}</SelectItem>
                  {['Delivered', 'Scheduled', 'Failed', 'Sending'].map((v) => (
                    <SelectItem key={v} value={v}>
                      {tStatus(v)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">{t('inot.allTypes')}</SelectItem>
                  {['System', 'Alert', 'Scheduled', 'Onboarding'].map((v) => (
                    <SelectItem key={v} value={v}>
                      {tType(v)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={notConnected} className="gap-2">
                <Filter className="h-4 w-4" />
                {t('inot.moreFilters')}
              </Button>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {t('inot.countLabel', {
                  shown: filteredNotifications.length,
                  total: notifications.length,
                })}
              </span>
            </div>
          </div>

          <div className="pro-card p-4">
            {filteredNotifications.length === 0 ? (
              <EmptyState icon={Bell} text={t('common:noData')} />
            ) : (
              <TableView
                header={notificationHeaders}
                data={filteredNotifications}
                paginationShow={false}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="pro-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="pro-head-badge">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                  {t('inot.templates.title')}
                </h4>
              </div>
              <Button size="sm" onClick={() => setShowCreateTemplateModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('inot.templates.new')}
              </Button>
            </div>
            <TableView header={templateHeaders} data={templates} paginationShow={false} />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="pro-card p-4">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Settings className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('inot.settings.title')}
              </h4>
            </div>

            <div className="space-y-5">
              <SettingsGroup title={t('inot.settings.emailConfig')}>
                <SettingsField label={t('inot.settings.smtpServer')} defaultValue="smtp.portfolio.com" />
                <SettingsField label={t('inot.settings.fromName')} defaultValue="Portfolio Admin" />
              </SettingsGroup>

              <SettingsGroup title={t('inot.settings.smsConfig')}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('inot.settings.smsProvider')}
                  </Label>
                  <Select defaultValue="Twilio">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Twilio', 'AWS SNS', 'SendGrid'].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <SettingsField
                  label={t('inot.settings.fromNumber')}
                  defaultValue="+1 (555) 123-4567"
                />
              </SettingsGroup>

              <div>
                <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('inot.settings.defaultPrefs')}
                </h5>
                <div className="space-y-2.5">
                  {[
                    ['welcome', 'inot.settings.prefWelcome', true],
                    ['transaction', 'inot.settings.prefTransaction', true],
                    ['statements', 'inot.settings.prefStatements', true],
                    ['marketing', 'inot.settings.prefMarketing', false],
                  ].map(([id, key, checked]) => (
                    <div key={String(id)} className="flex items-center gap-2.5">
                      <Checkbox id={`pref-${id}`} defaultChecked={Boolean(checked)} />
                      <Label htmlFor={`pref-${id}`} className="cursor-pointer text-sm font-normal">
                        {t(String(key))}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <Button onClick={handleSaveSettings} className="gap-2">
                  <Settings className="h-4 w-4" />
                  {t('inot.settings.save')}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>


      {/*
        Three hand-rolled `fixed inset-0 bg-black/50` overlays became three
        shadcn Dialogs. The difference is not only visual: the old ones trapped
        no focus, closed on nothing but their own X, and had no labelled title
        for a screen reader — a div with a high z-index is not a dialog.
      */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Bell className="h-4 w-4" />
              </span>
              {t('inot.details.title')}
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-3">
              {/* A definition grid on one panel, rather than six loose
                  label/value pairs floating in whitespace. */}
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-md border bg-muted/40 px-4 py-3 sm:grid-cols-2">
                <Field label={t('inot.field.title')} value={selectedNotification.title} />
                <Field label={t('common:type')} value={tType(selectedNotification.type)} />
                <Field label={t('inot.field.channel')} value={selectedNotification.channel} />
                <Field
                  label={t('inot.col.recipients')}
                  value={selectedNotification.recipients.toLocaleString()}
                />
                <Field
                  label={t('common:status')}
                  value={
                    <Badge
                      variant="outline"
                      className={`border font-medium ${getStatusColor(selectedNotification.status)}`}
                    >
                      {tStatus(selectedNotification.status)}
                    </Badge>
                  }
                />
                <Field
                  label={t('inot.col.sentDate')}
                  value={formatDateTime(selectedNotification.sent)}
                />
              </dl>

              {selectedNotification.openRate && (
                <div className="rounded-md border px-4 py-3">
                  <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('inot.details.performance')}
                  </h5>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <Field
                      label={t('inot.field.openRate')}
                      value={selectedNotification.openRate}
                    />
                    <Field
                      label={t('inot.field.clickRate')}
                      value={selectedNotification.clickRate}
                    />
                  </dl>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              {t('common:close')}
            </Button>
            <Button
              onClick={() => {
                setShowDetailsModal(false);
                if (selectedNotification) handleEditNotification(selectedNotification);
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('inot.edit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Plus className="h-4 w-4" />
              </span>
              {t('inot.create.title')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-notif-title">
                {t('inot.field.title')} <span className="text-destructive">*</span>
              </Label>
              <Input id="new-notif-title" placeholder={t('inot.create.titlePlaceholder')} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  {t('common:type')} <span className="text-destructive">*</span>
                </Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('inot.create.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {['System', 'Alert', 'Scheduled', 'Onboarding'].map((v) => (
                      <SelectItem key={v} value={v}>
                        {tType(v)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  {t('inot.field.channel')} <span className="text-destructive">*</span>
                </Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('inot.create.selectChannel')} />
                  </SelectTrigger>
                  <SelectContent>
                    {['Email', 'SMS', 'In-App', 'Email + SMS', 'Email + In-App'].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t('inot.col.recipients')}</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('inot.create.selectRecipients')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-investors">{t('inot.recipients.all')}</SelectItem>
                  <SelectItem value="active-investors">{t('inot.recipients.active')}</SelectItem>
                  <SelectItem value="new-investors">{t('inot.recipients.new')}</SelectItem>
                  <SelectItem value="custom">{t('inot.recipients.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-notif-message">{t('inot.create.message')}</Label>
              <Textarea
                id="new-notif-message"
                rows={4}
                placeholder={t('inot.create.messagePlaceholder')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleCreateNotification} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('inot.createNotification')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="pro-dialog confirm-dialog sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
              <Trash2 className="size-6 text-red-600 dark:text-red-400" />
            </span>
            <DialogTitle className="text-center">{t('inot.delete.title')}</DialogTitle>
            <DialogDescription className="text-center">
              {t('inot.delete.description', { name: selectedNotification?.title ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('common:delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** One label/value pair in a details grid. */
const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="min-w-0">
    <dt className="mb-0.5 text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="m-0 break-words text-sm font-medium text-foreground">{value}</dd>
  </div>
);
