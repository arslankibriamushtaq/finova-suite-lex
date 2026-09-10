import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Shield,
  Users,
  Settings,
  Lock,
  Unlock,
  UserPlus,
  Key,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  X,
  Trash2,
  Copy,
  Mail,
  Phone
} from 'lucide-react';
import { cn } from '../../../lib/utils';

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

export default function AdminUsers() {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleCreateUser = () => {
    alert('New user created successfully!');
    setShowCreateUserModal(false);
  };

  const handleUpdateUser = () => {
    alert('User updated successfully!');
    setShowEditUserModal(false);
    setSelectedUser(null);
  };

  const confirmDeleteUser = () => {
    alert(`User ${selectedUser?.name} deleted successfully!`);
    setShowDeleteUserModal(false);
    setSelectedUser(null);
  };

  const handleToggleUserStatus = (user: any) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    alert(`User ${user.name} status changed to ${newStatus}`);
  };

  const handleResetPassword = (user: any) => {
    alert(`Password reset email sent to ${user.email}`);
  };

  const handleToggleMFA = (user: any) => {
    const action = user.mfaEnabled ? 'disabled' : 'enabled';
    alert(`MFA ${action} for ${user.name}`);
  };

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
    alert('New role created successfully!');
    setShowCreateRoleModal(false);
  };

  const handleUpdateRole = () => {
    alert('Role updated successfully!');
    setShowEditRoleModal(false);
    setSelectedRole(null);
  };

  const confirmDeleteRole = () => {
    alert(`Role ${selectedRole?.name} deleted successfully!`);
    setShowDeleteRoleModal(false);
    setSelectedRole(null);
  };

  const handleDuplicateRole = (role: any) => {
    alert(`Role ${role.name} duplicated successfully!`);
  };

  // General Actions
  const handleExportUsers = () => {
    alert('Users exported successfully!');
  };

  const handleSaveSecuritySettings = () => {
    alert('Security settings saved successfully!');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Users & Roles</h1>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportUsers}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 me-2" />
              Export Users
            </button>
            <button 
              onClick={() => setShowCreateUserModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <UserPlus className="w-4 h-4 me-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{adminUsers.length}</p>
              <p className="text-xs text-gray-500 mt-1">Admin accounts</p>
            </div>
            <Users className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{adminUsers.filter(u => u.status === 'Active').length}</p>
              <p className="text-xs text-red-600 mt-1">Online today</p>
            </div>
            <CheckCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              <p className="text-xs text-gray-500 mt-1">Permission sets</p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">MFA Enabled</p>
              <p className="text-2xl font-bold text-gray-900">{adminUsers.filter(u => u.mfaEnabled).length}</p>
              <p className="text-xs text-gray-500 mt-1">Security enhanced</p>
            </div>
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Users className="w-4 h-4 me-2" />
              Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Shield className="w-4 h-4 me-2" />
              Roles & Permissions
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Lock className="w-4 h-4 me-2" />
              Security Settings
            </div>
          </button>
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {/* Filters */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="All Roles">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {filteredUsers.length} of {adminUsers.length} users
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Security
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center me-4">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.role}</div>
                        <div className="text-sm text-gray-500">Since {formatDate(user.createdDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(user.status))}>
                          {user.status}
                        </span>
                        {user.loginAttempts > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {user.loginAttempts} failed attempts
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.mfaEnabled ? (
                            <span className="flex items-center text-xs text-red-600">
                              <Lock className="w-3 h-3 me-1" />
                              MFA On
                            </span>
                          ) : (
                            <span className="flex items-center text-xs text-red-600">
                              <Unlock className="w-3 h-3 me-1" />
                              MFA Off
                            </span>
                          )}
                        </div>
                        {user.ipRestrictions.length > 0 && (
                          <div className="text-xs text-black mt-1">IP Restricted</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.slice(0, 3).map((permission, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                              {permission}
                            </span>
                          ))}
                          {user.permissions.length > 3 && (
                            <span className="text-xs text-gray-500">+{user.permissions.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="text-black hover:text-blue-900" 
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-gray-600 hover:text-gray-900" 
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleResetPassword(user)}
                            className="text-orange-600 hover:text-orange-900" 
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleMFA(user)}
                            className="text-purple-600 hover:text-purple-900" 
                            title="Toggle MFA"
                          >
                            {user.mfaEnabled ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900" 
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Roles & Permissions</h3>
            <button 
              onClick={() => setShowCreateRoleModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 me-2" />
              New Role
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role Name
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-gray-400 me-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{role.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">{role.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 me-1" />
                        <span className="text-sm text-gray-900">{role.userCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {role.permissions.slice(0, 3).map((permission, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="text-xs text-gray-500">+{role.permissions.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(role.lastModified)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewRole(role)}
                          className="text-black hover:text-blue-900" 
                          title="View Role"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditRole(role)}
                          className="text-gray-600 hover:text-gray-900" 
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDuplicateRole(role)}
                          className="text-red-600 hover:text-red-900" 
                          title="Duplicate Role"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRole(role)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Settings Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Password Policy</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Minimum 8 characters</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Require uppercase and lowercase letters</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Require numbers and special characters</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Password expiry (90 days)</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Multi-Factor Authentication</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Enforce MFA for all admin users</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Allow SMS authentication</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Allow authenticator apps</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Session Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    defaultValue="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Failed Login Attempts</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    defaultValue="5"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">IP Restrictions</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" />
                  <span className="text-sm text-gray-700">Enable IP whitelist for admin access</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed IP Ranges</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={3}
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button 
                onClick={handleSaveSecuritySettings}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
              >
                <Settings className="w-4 h-4 me-2" />
                Save Security Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    <option value="">Select role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Send welcome email</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" />
                  <span className="text-sm text-gray-700">Require MFA setup</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" />
                  <span className="text-sm text-gray-700">Force password change on first login</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="text-sm text-gray-900">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedUser.createdDate)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedUser.lastLogin)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MFA Status</label>
                  <p className={`text-sm ${selectedUser.mfaEnabled ? 'text-slate-500' : 'text-red-600'}`}>
                    {selectedUser.mfaEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Failed Login Attempts</label>
                  <p className="text-sm text-gray-900">{selectedUser.loginAttempts}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Restrictions</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.ipRestrictions.length > 0 ? selectedUser.ipRestrictions.join(', ') : 'None'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.permissions.map((permission: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  handleEditUser(selectedUser);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    defaultValue={selectedUser.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    defaultValue={selectedUser.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IP Restrictions</label>
                <textarea
                  defaultValue={selectedUser.ipRestrictions.join(', ')}
                  placeholder="Enter IP addresses or ranges, separated by commas"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={selectedUser.mfaEnabled}
                    className="rounded border-gray-300 text-black focus:ring-gray-500 me-3"
                  />
                  <span className="text-sm text-gray-700">Require Multi-Factor Authentication</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" />
                  <span className="text-sm text-gray-700">Send notification email about changes</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" />
                  <span className="text-sm text-gray-700">Force password reset on next login</span>
                </label>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Account Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ms-2 text-gray-900">{formatDate(selectedUser.createdDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Login:</span>
                    <span className="ms-2 text-gray-900">{formatDateTime(selectedUser.lastLogin)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Login Attempts:</span>
                    <span className="ms-2 text-gray-900">{selectedUser.loginAttempts}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
              <button
                onClick={() => setShowDeleteUserModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone and will revoke all access immediately.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteUserModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Role</h3>
              <button
                onClick={() => setShowCreateRoleModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name *</label>
                <input
                  type="text"
                  placeholder="Enter role name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the role and its purpose"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {allPermissions.map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-black focus:ring-gray-500 me-2"
                      />
                      <span className="text-sm text-gray-700">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Role</h3>
              <button
                onClick={() => setShowEditRoleModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name *</label>
                <input
                  type="text"
                  defaultValue={selectedRole.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  defaultValue={selectedRole.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {allPermissions.map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={selectedRole.permissions.includes(permission)}
                        className="rounded border-gray-300 text-black focus:ring-gray-500 me-2"
                      />
                      <span className="text-sm text-gray-700">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Users with this Role</h4>
                <p className="text-sm text-gray-600">{selectedRole.userCount} users currently assigned to this role</p>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Role Modal */}
      {showRoleModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Role Details</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <p className="text-lg font-semibold text-gray-900">{selectedRole.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900">{selectedRole.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Users with this Role</label>
                <p className="text-sm text-gray-900">{selectedRole.userCount} users</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                <p className="text-sm text-gray-900">{formatDate(selectedRole.createdDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Modified</label>
                <p className="text-sm text-gray-900">{formatDate(selectedRole.lastModified)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedRole.permissions.map((permission: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-900">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  handleEditRole(selectedRole);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                Edit Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Confirmation Modal */}
      {showDeleteRoleModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Role</h3>
              <button
                onClick={() => setShowDeleteRoleModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the role <strong>{selectedRole.name}</strong>?
              </p>
              {selectedRole.userCount > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This role is currently assigned to {selectedRole.userCount} user(s).
                    Deleting this role will remove permissions from these users.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteRoleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRole}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
