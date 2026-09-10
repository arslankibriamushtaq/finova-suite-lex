import { useState } from 'react';
import {
  Plus,
  Download,
  Eye,
  Edit,
  Shield,
  ShieldCheck,
  Users,
  Settings,
  Lock,
  Unlock,
  UserPlus,
  Key,
  AlertTriangle,
  Trash2,
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
import { Textarea } from '../../../components/ui/textarea';
import { Tabs, TabsContent } from '../../../components/ui/tabs';
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

const adminUsers = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'admin@portfolio.com',
    role: 'Super Administrator',
    status: 'Active',
    lastLogin: '2024-01-22T14:30:00Z',
    createdDate: '2023-01-01',
    permissions: ['All'],
    mfaEnabled: true,
    loginAttempts: 0,
    ipRestrictions: ['192.168.1.100', '10.0.0.0/8']
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john.smith@portfolio.com',
    role: 'Investment Manager',
    status: 'Active',
    lastLogin: '2024-01-22T13:45:00Z',
    createdDate: '2023-03-15',
    permissions: ['Investments', 'Products', 'Reports'],
    mfaEnabled: true,
    loginAttempts: 0,
    ipRestrictions: []
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@portfolio.com',
    role: 'Compliance Officer',
    status: 'Active',
    lastLogin: '2024-01-22T12:20:00Z',
    createdDate: '2023-02-10',
    permissions: ['Audit Logs', 'KYC', 'Compliance', 'Reports'],
    mfaEnabled: true,
    loginAttempts: 0,
    ipRestrictions: []
  },
  {
    id: 4,
    name: 'Mike Davis',
    email: 'mike.davis@portfolio.com',
    role: 'Operations Analyst',
    status: 'Active',
    lastLogin: '2024-01-22T10:15:00Z',
    createdDate: '2023-06-20',
    permissions: ['Investors', 'Transactions', 'Reports'],
    mfaEnabled: false,
    loginAttempts: 1,
    ipRestrictions: []
  },
  {
    id: 5,
    name: 'Lisa Chen',
    email: 'lisa.chen@portfolio.com',
    role: 'Risk Manager',
    status: 'Suspended',
    lastLogin: '2024-01-15T16:30:00Z',
    createdDate: '2023-08-05',
    permissions: ['Risk Management', 'Analytics', 'Reports'],
    mfaEnabled: true,
    loginAttempts: 5,
    ipRestrictions: []
  }
];

const roles = [
  {
    id: 1,
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: ['All'],
    userCount: 1,
    createdDate: '2023-01-01',
    lastModified: '2023-01-01'
  },
  {
    id: 2,
    name: 'Investment Manager',
    description: 'Manage investments, products, and view reports',
    permissions: ['Investments', 'Products', 'Reports', 'Investor Management'],
    userCount: 3,
    createdDate: '2023-01-15',
    lastModified: '2023-12-10'
  },
  {
    id: 3,
    name: 'Compliance Officer',
    description: 'Audit trails, KYC management, and compliance reporting',
    permissions: ['Audit Logs', 'KYC', 'Compliance', 'Reports', 'User Management'],
    userCount: 2,
    createdDate: '2023-01-15',
    lastModified: '2023-11-20'
  },
  {
    id: 4,
    name: 'Operations Analyst',
    description: 'Investor operations and transaction management',
    permissions: ['Investors', 'Transactions', 'Reports'],
    userCount: 4,
    createdDate: '2023-02-01',
    lastModified: '2023-10-15'
  },
  {
    id: 5,
    name: 'Risk Manager',
    description: 'Risk analysis and monitoring capabilities',
    permissions: ['Risk Management', 'Analytics', 'Reports'],
    userCount: 1,
    createdDate: '2023-03-01',
    lastModified: '2023-09-22'
  },
  {
    id: 6,
    name: 'Read Only',
    description: 'View-only access to reports and analytics',
    permissions: ['Reports (Read)', 'Analytics (Read)'],
    userCount: 0,
    createdDate: '2023-01-15',
    lastModified: '2023-01-15'
  }
];

const allPermissions = [
  'Dashboard',
  'Investor Management',
  'Products',
  'Investments',
  'Reports',
  'Audit Logs',
  'Notifications',
  'User Management',
  'System Settings',
  'KYC',
  'Compliance',
  'Risk Management',
  'Analytics',
  'Transactions'
];

type RowAction = {
  icon: typeof Eye;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

/** A titled group of checkboxes in the security tab. */
const CheckGroup = ({
  title,
  items,
}: {
  title: string;
  items: [string, string, boolean][];
}) => (
  <div>
    <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </h5>
    <div className="space-y-2.5">
      {items.map(([id, label, checked]) => (
        <div key={id} className="flex items-center gap-2.5">
          <Checkbox id={`sec-${id}`} defaultChecked={checked} />
          <Label htmlFor={`sec-${id}`} className="cursor-pointer text-sm font-normal">
            {label}
          </Label>
        </div>
      ))}
    </div>
  </div>
);

/** One label/value pair in a details grid. */
const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="min-w-0">
    <dt className="mb-0.5 text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="m-0 break-words text-sm font-medium text-foreground">{value}</dd>
  </div>
);

export default function AdminUsers() {
  // Third page in this module written with no translation at all.
  const { t } = useTranslation('investor');
  const tStatus = (v: string) => t(`iusr.st.${v}`);

  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);

  // Active and Suspended were both `bg-red-100 text-red-800` — a working
  // admin account and a suspended one looked the same in the list.
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return TONES.emerald;
      case 'Suspended':
        return TONES.red;
      case 'Pending':
        return TONES.amber;
      case 'Inactive':
      default:
        return TONES.slate;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // User Actions
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowDeleteUserModal(true);
  };

  /**
   * Twelve handlers on this page reported success for work that never ran.
   *
   * Two of them are worse than the rest because of what they claim about
   * security: "Password reset email sent to …" and "MFA enabled for …". An
   * administrator told a reset went out has no reason to send another, and one
   * told MFA is on has no reason to check. Neither touched a service — this
   * whole page is a module-level literal.
   */
  const notConnected = () => toast.error(t('invl.notConnected'));

  const handleCreateUser = () => {
    notConnected();
    setShowCreateUserModal(false);
  };

  const handleUpdateUser = () => {
    notConnected();
    setShowEditUserModal(false);
    setSelectedUser(null);
  };

  const confirmDeleteUser = () => {
    notConnected();
    setShowDeleteUserModal(false);
    setSelectedUser(null);
  };

  const handleResetPassword = notConnected;

  const handleToggleMFA = notConnected;

  // Role Actions
  const handleViewRole = (role: any) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setShowEditRoleModal(true);
  };

  const handleDeleteRole = (role: any) => {
    setSelectedRole(role);
    setShowDeleteRoleModal(true);
  };

  const handleCreateRole = () => {
    notConnected();
    setShowCreateRoleModal(false);
  };

  const handleUpdateRole = () => {
    notConnected();
    setShowEditRoleModal(false);
    setSelectedRole(null);
  };

  const confirmDeleteRole = () => {
    notConnected();
    setShowDeleteRoleModal(false);
    setSelectedRole(null);
  };

  const handleDuplicateRole = notConnected;

  const handleExportUsers = notConnected;

  const handleSaveSecuritySettings = notConnected;

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

  const permissionChips = (permissions: string[]) => (
    <div className="flex min-w-0 flex-wrap gap-1">
      {permissions.slice(0, 3).map((permission) => (
        <Badge key={permission} variant="outline" className={`border font-medium ${TONES.slate}`}>
          {permission}
        </Badge>
      ))}
      {permissions.length > 3 && (
        <span className="self-center text-[11px] text-muted-foreground">
          {t('iusr.morePermissions', { count: permissions.length - 3 })}
        </span>
      )}
    </div>
  );

  const userHeaders = [
    {
      name: t('iusr.col.user'),
      cell: (row: any) => (
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-foreground">
            {row.name
              .split(' ')
              .map((part: string) => part[0])
              .join('')}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">{row.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{row.email}</span>
          </span>
        </span>
      ),
      width: '250px',
    },
    {
      name: t('iusr.col.role'),
      cell: (row: any) => (
        <div className="min-w-0">
          <p className="m-0 truncate text-sm text-foreground">{row.role}</p>
          <p className="m-0 truncate text-xs text-muted-foreground">
            {t('iusr.sinceLabel', { date: formatDate(row.createdDate) })}
          </p>
        </div>
      ),
      width: '190px',
    },
    {
      name: t('common:status'),
      cell: (row: any) => (
        <div className="min-w-0">
          <Badge variant="outline" className={`border font-medium ${getStatusColor(row.status)}`}>
            {tStatus(row.status)}
          </Badge>
          {row.loginAttempts > 0 && (
            <p className="m-0 mt-1 text-[11px] text-destructive">
              {t('iusr.failedAttempts', { count: row.loginAttempts })}
            </p>
          )}
        </div>
      ),
      width: '150px',
    },
    {
      name: t('iusr.col.lastLogin'),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(row.lastLogin)}
        </span>
      ),
      width: '170px',
    },
    {
      // MFA On and MFA Off were BOTH text-red-600 — the two opposite states of
      // a security control, in the same colour, on the admin user list.
      name: t('iusr.col.security'),
      cell: (row: any) => (
        <div className="min-w-0 space-y-1">
          <Badge
            variant="outline"
            className={`border gap-1 font-medium ${row.mfaEnabled ? TONES.emerald : TONES.amber}`}
          >
            {row.mfaEnabled ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            {row.mfaEnabled ? t('iusr.mfaOn') : t('iusr.mfaOff')}
          </Badge>
          {row.ipRestrictions.length > 0 && (
            <p className="m-0 text-[11px] text-muted-foreground">{t('iusr.ipRestricted')}</p>
          )}
        </div>
      ),
      width: '150px',
    },
    {
      name: t('iusr.col.permissions'),
      cell: (row: any) => permissionChips(row.permissions),
      width: '230px',
    },
    {
      name: t('common:actions'),
      cell: (row: any) => (
        <RowActions
          items={[
            { icon: Eye, label: t('common:viewDetails'), onSelect: () => handleViewUser(row) },
            { icon: Edit, label: t('common:edit'), onSelect: () => handleEditUser(row) },
            { icon: Key, label: t('iusr.action.resetPassword'), onSelect: () => handleResetPassword() },
            {
              icon: row.mfaEnabled ? Unlock : Lock,
              label: t('iusr.action.toggleMfa'),
              onSelect: () => handleToggleMFA(),
            },
            {
              icon: Trash2,
              label: t('common:delete'),
              onSelect: () => handleDeleteUser(row),
              destructive: true,
            },
          ]}
        />
      ),
      width: '140px',
    },
  ];

  const roleHeaders = [
    {
      name: t('iusr.rcol.name'),
      cell: (row: any) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="pro-head-badge">
            <Shield className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-medium text-foreground">{row.name}</span>
        </span>
      ),
      width: '220px',
    },
    {
      name: t('common:description'),
      cell: (row: any) => (
        <p className="m-0 line-clamp-2 text-sm text-muted-foreground">{row.description}</p>
      ),
      width: '280px',
    },
    {
      name: t('iusr.rcol.users'),
      cell: (row: any) => (
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          {row.userCount}
        </span>
      ),
      width: '110px',
    },
    {
      name: t('iusr.col.permissions'),
      cell: (row: any) => permissionChips(row.permissions),
      width: '230px',
    },
    {
      name: t('iusr.rcol.lastModified'),
      cell: (row: any) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(row.lastModified)}
        </span>
      ),
      width: '150px',
    },
    {
      name: t('common:actions'),
      cell: (row: any) => (
        <RowActions
          items={[
            { icon: Eye, label: t('common:view'), onSelect: () => handleViewRole(row) },
            { icon: Edit, label: t('common:edit'), onSelect: () => handleEditRole(row) },
            {
              icon: Copy,
              label: t('iusr.action.duplicateRole'),
              onSelect: () => handleDuplicateRole(),
            },
            {
              icon: Trash2,
              label: t('common:delete'),
              onSelect: () => handleDeleteRole(row),
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
      <LexPageHeader icon={ShieldCheck} title={t('iusr.title')} subtitle={t('iusr.subtitle')}>
        <Button variant="outline" size="sm" onClick={handleExportUsers} className="gap-2">
          <Download className="h-4 w-4" />
          {t('iusr.exportUsers')}
        </Button>
        <Button size="sm" onClick={() => setShowCreateUserModal(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          {t('iusr.addUser')}
        </Button>
      </LexPageHeader>

      <LexNotice tone="amber" icon={AlertTriangle}>
        {t('invl.sampleDataNotice')}
      </LexNotice>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t('iusr.stat.totalUsers')}
          icon={Users}
          tone="sky"
          value={adminUsers.length}
        />
        <LexMetricTile
          label={t('iusr.stat.activeUsers')}
          icon={ShieldCheck}
          tone="emerald"
          value={adminUsers.filter((u) => u.status === 'Active').length}
          denominator={adminUsers.length}
        />
        <LexMetricTile
          label={t('iusr.stat.roles')}
          icon={Shield}
          tone="slate"
          value={roles.length}
        />
        <LexMetricTile
          label={t('iusr.stat.mfaEnabled')}
          icon={Lock}
          tone="amber"
          value={adminUsers.filter((u) => u.mfaEnabled).length}
          denominator={adminUsers.length}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <DetailTabsList className="mb-3">
          <DetailTabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            {t('iusr.tab.users')}
          </DetailTabsTrigger>
          <DetailTabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            {t('iusr.tab.roles')}
          </DetailTabsTrigger>
          <DetailTabsTrigger value="security" className="gap-2">
            <Settings className="h-4 w-4" />
            {t('iusr.tab.security')}
          </DetailTabsTrigger>
        </DetailTabsList>

        <TabsContent value="users">
          <div className="pro-card p-3 mb-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <LexSearch
                id="admin-users-search"
                className="flex-1"
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t('iusr.searchPlaceholder')}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">{t('iusr.allStatuses')}</SelectItem>
                  {['Active', 'Suspended', 'Inactive'].map((v) => (
                    <SelectItem key={v} value={v}>
                      {tStatus(v)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full lg:w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Roles">{t('iusr.allRoles')}</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {t('iusr.countLabel', { shown: filteredUsers.length, total: adminUsers.length })}
              </span>
            </div>
          </div>

          <div className="pro-card p-4">
            {filteredUsers.length === 0 ? (
              <EmptyState icon={Users} text={t('common:noData')} />
            ) : (
              <TableView header={userHeaders} data={filteredUsers} paginationShow={false} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <div className="pro-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="pro-head-badge">
                  <Shield className="h-4 w-4" />
                </span>
                <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                  {t('iusr.roles.title')}
                </h4>
              </div>
              <Button size="sm" onClick={() => setShowCreateRoleModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('iusr.roles.new')}
              </Button>
            </div>
            <TableView header={roleHeaders} data={roles} paginationShow={false} />
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="pro-card p-4">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Settings className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t('iusr.sec.title')}
              </h4>
            </div>

            <div className="space-y-5">
              <CheckGroup
                title={t('iusr.sec.passwordPolicy')}
                items={[
                  ['pw1', t('iusr.sec.pw1'), true],
                  ['pw2', t('iusr.sec.pw2'), true],
                  ['pw3', t('iusr.sec.pw3'), true],
                  ['pw4', t('iusr.sec.pw4'), true],
                ]}
              />
              <CheckGroup
                title={t('iusr.sec.mfa')}
                items={[
                  ['mfa1', t('iusr.sec.mfa1'), true],
                  ['mfa2', t('iusr.sec.mfa2'), true],
                  ['mfa3', t('iusr.sec.mfa3'), true],
                ]}
              />

              <div>
                <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('iusr.sec.session')}
                </h5>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="sec-timeout">{t('iusr.sec.sessionTimeout')}</Label>
                    <Input id="sec-timeout" type="number" min={1} defaultValue="60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sec-attempts">{t('iusr.sec.maxAttempts')}</Label>
                    <Input id="sec-attempts" type="number" min={1} defaultValue="5" />
                  </div>
                </div>
              </div>

              <div>
                <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('iusr.sec.ip')}
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Checkbox id="sec-ip" />
                    <Label htmlFor="sec-ip" className="cursor-pointer text-sm font-normal">
                      {t('iusr.sec.ipEnable')}
                    </Label>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sec-ranges">{t('iusr.sec.ipRanges')}</Label>
                    <Textarea id="sec-ranges" rows={3} placeholder={'192.168.1.0/24\n10.0.0.0/8'} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button onClick={handleSaveSecuritySettings} className="gap-2">
                  <Settings className="h-4 w-4" />
                  {t('iusr.sec.save')}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>


      {/*
        Eight hand-rolled `fixed inset-0` overlays became eight Dialogs. None of
        the originals trapped focus, closed on Escape or on a click outside, or
        carried a role and a labelled title — a div with a z-index is not a
        dialog, and on a screen that manages admin accounts that matters.
      */}
      <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <UserPlus className="h-4 w-4" />
              </span>
              {t('iusr.user.create')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label={t('iusr.field.fullName')} required>
                <Input placeholder={t('iusr.field.fullNamePlaceholder')} />
              </FormField>
              <FormField label={t('iusr.field.email')} required>
                <Input type="email" placeholder={t('iusr.field.emailPlaceholder')} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label={t('iusr.col.role')} required>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('iusr.field.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label={t('common:status')}>
                <Select defaultValue="Active">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Active', 'Inactive'].map((v) => (
                      <SelectItem key={v} value={v}>
                        {tStatus(v)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label={t('iusr.field.phone')}>
              <Input type="tel" placeholder={t('iusr.field.phonePlaceholder')} />
            </FormField>

            <CheckGroup
              title={t('common:settings')}
              items={[
                ['new-welcome', t('iusr.opt.welcomeEmail'), true],
                ['new-mfa', t('iusr.opt.requireMfa'), false],
                ['new-pw', t('iusr.opt.forcePassword'), false],
              ]}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUserModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleCreateUser} className="gap-2">
              <UserPlus className="h-4 w-4" />
              {t('iusr.addUser')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Users className="h-4 w-4" />
              </span>
              {t('iusr.user.details')}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-3">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-md border bg-muted/40 px-4 py-3 sm:grid-cols-2">
                <Field label={t('common:name')} value={selectedUser.name} />
                <Field label={t('common:email')} value={selectedUser.email} />
                <Field label={t('iusr.col.role')} value={selectedUser.role} />
                <Field
                  label={t('common:status')}
                  value={
                    <Badge
                      variant="outline"
                      className={`border font-medium ${getStatusColor(selectedUser.status)}`}
                    >
                      {tStatus(selectedUser.status)}
                    </Badge>
                  }
                />
                <Field
                  label={t('iusr.field.createdDate')}
                  value={formatDate(selectedUser.createdDate)}
                />
                <Field
                  label={t('iusr.col.lastLogin')}
                  value={formatDateTime(selectedUser.lastLogin)}
                />
                <Field
                  label={t('iusr.field.mfaStatus')}
                  value={
                    <Badge
                      variant="outline"
                      className={`border gap-1 font-medium ${selectedUser.mfaEnabled ? TONES.emerald : TONES.amber}`}
                    >
                      {selectedUser.mfaEnabled ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                      {selectedUser.mfaEnabled ? t('iusr.mfaOn') : t('iusr.mfaOff')}
                    </Badge>
                  }
                />
                <Field label={t('iusr.field.failedLogins')} value={selectedUser.loginAttempts} />
                <Field
                  label={t('iusr.sec.ip')}
                  value={
                    selectedUser.ipRestrictions.length > 0
                      ? selectedUser.ipRestrictions.join(', ')
                      : t('iusr.none')
                  }
                />
              </dl>

              <div className="rounded-md border px-4 py-3">
                <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('iusr.col.permissions')}
                </h5>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.permissions.map((permission: string) => (
                    <Badge
                      key={permission}
                      variant="outline"
                      className={`border font-medium ${TONES.slate}`}
                    >
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              {t('common:close')}
            </Button>
            <Button
              onClick={() => {
                setShowUserModal(false);
                if (selectedUser) handleEditUser(selectedUser);
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('iusr.user.edit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Edit className="h-4 w-4" />
              </span>
              {t('iusr.user.edit')}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label={t('iusr.field.fullName')} required>
                  <Input defaultValue={selectedUser.name} />
                </FormField>
                <FormField label={t('iusr.field.email')} required>
                  <Input type="email" defaultValue={selectedUser.email} />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label={t('iusr.col.role')} required>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t('common:status')}>
                  <Select defaultValue={selectedUser.status}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Active', 'Suspended', 'Inactive'].map((v) => (
                        <SelectItem key={v} value={v}>
                          {tStatus(v)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label={t('iusr.sec.ip')}>
                <Textarea
                  rows={2}
                  defaultValue={selectedUser.ipRestrictions.join(', ')}
                  placeholder={t('iusr.field.ipPlaceholder')}
                />
              </FormField>

              <CheckGroup
                title={t('common:settings')}
                items={[
                  ['edit-notify', t('iusr.opt.notifyChanges'), false],
                  ['edit-reset', t('iusr.opt.forceReset'), false],
                ]}
              />

              <div className="rounded-md border bg-muted/40 px-4 py-3">
                <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('iusr.accountInfo')}
                </h5>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  <Field
                    label={t('iusr.field.createdDate')}
                    value={formatDate(selectedUser.createdDate)}
                  />
                  <Field
                    label={t('iusr.col.lastLogin')}
                    value={formatDateTime(selectedUser.lastLogin)}
                  />
                </dl>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleUpdateUser}>{t('common:saveChanges')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteUserModal} onOpenChange={setShowDeleteUserModal}>
        <DialogContent className="pro-dialog confirm-dialog sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
              <Trash2 className="size-6 text-red-600 dark:text-red-400" />
            </span>
            <DialogTitle className="text-center">{t('iusr.user.delete')}</DialogTitle>
            <DialogDescription className="text-center">
              {t('iusr.user.deleteDescription', { name: selectedUser?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setShowDeleteUserModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              {t('common:delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateRoleModal} onOpenChange={setShowCreateRoleModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Shield className="h-4 w-4" />
              </span>
              {t('iusr.role.create')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <FormField label={t('iusr.rcol.name')} required>
              <Input placeholder={t('iusr.role.namePlaceholder')} />
            </FormField>
            <FormField label={t('common:description')}>
              <Textarea rows={2} placeholder={t('iusr.role.descPlaceholder')} />
            </FormField>
            <PermissionPicker prefix="new-role" permissions={allPermissions} selected={[]} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRoleModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleCreateRole} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('iusr.roles.new')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditRoleModal} onOpenChange={setShowEditRoleModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Edit className="h-4 w-4" />
              </span>
              {t('iusr.role.edit')}
            </DialogTitle>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-3">
              <FormField label={t('iusr.rcol.name')} required>
                <Input defaultValue={selectedRole.name} />
              </FormField>
              <FormField label={t('common:description')}>
                <Textarea rows={2} defaultValue={selectedRole.description} />
              </FormField>
              <PermissionPicker
                prefix="edit-role"
                permissions={allPermissions}
                selected={selectedRole.permissions}
              />
              <div className="rounded-md border bg-muted/40 px-4 py-3">
                <h5 className="m-0 mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('iusr.role.currentUsers')}
                </h5>
                <p className="m-0 text-sm tabular-nums text-foreground">{selectedRole.userCount}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRoleModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleUpdateRole}>{t('common:saveChanges')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Shield className="h-4 w-4" />
              </span>
              {t('iusr.role.details')}
            </DialogTitle>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-3">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-md border bg-muted/40 px-4 py-3 sm:grid-cols-2">
                <Field label={t('iusr.rcol.name')} value={selectedRole.name} />
                <Field
                  label={t('iusr.role.usersWithRole')}
                  value={selectedRole.userCount}
                />
                <Field label={t('common:description')} value={selectedRole.description} />
                <Field
                  label={t('iusr.rcol.lastModified')}
                  value={formatDate(selectedRole.lastModified)}
                />
              </dl>

              <div className="rounded-md border px-4 py-3">
                <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('iusr.col.permissions')}
                </h5>
                <div className="flex flex-wrap gap-1">
                  {selectedRole.permissions.map((permission: string) => (
                    <Badge
                      key={permission}
                      variant="outline"
                      className={`border font-medium ${TONES.slate}`}
                    >
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>
              {t('common:close')}
            </Button>
            <Button
              onClick={() => {
                setShowRoleModal(false);
                if (selectedRole) handleEditRole(selectedRole);
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('iusr.role.edit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteRoleModal} onOpenChange={setShowDeleteRoleModal}>
        <DialogContent className="pro-dialog confirm-dialog sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
              <Trash2 className="size-6 text-red-600 dark:text-red-400" />
            </span>
            <DialogTitle className="text-center">{t('iusr.role.delete')}</DialogTitle>
            <DialogDescription className="text-center">
              {t('iusr.role.deleteDescription', { name: selectedRole?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setShowDeleteRoleModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRole}>
              {t('common:delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** A labelled form control, with the required mark carried by the label. */
const FormField = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label>
      {label}
      {required && <span className="ms-0.5 text-destructive">*</span>}
    </Label>
    {children}
  </div>
);

/** The permission grid shared by the create- and edit-role dialogs. */
const PermissionPicker = ({
  prefix,
  permissions,
  selected,
}: {
  prefix: string;
  permissions: string[];
  selected: string[];
}) => {
  const { t } = useTranslation('investor');
  return (
    <div>
      <Label className="mb-2 block">
        {t('iusr.col.permissions')}
        <span className="ms-0.5 text-destructive">*</span>
      </Label>
      <div className="grid grid-cols-1 gap-2 rounded-md border px-4 py-3 sm:grid-cols-2">
        {permissions.map((permission) => (
          <div key={permission} className="flex items-center gap-2.5">
            <Checkbox
              id={`${prefix}-${permission}`}
              defaultChecked={selected.includes(permission)}
            />
            <Label
              htmlFor={`${prefix}-${permission}`}
              className="cursor-pointer text-sm font-normal"
            >
              {permission}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
