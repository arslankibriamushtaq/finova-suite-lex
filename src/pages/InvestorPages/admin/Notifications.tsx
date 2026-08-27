import { useState } from 'react';
import {
  Plus,
  Search,
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
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  MoreHorizontal,
  X,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '../../lib/utils';

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

export default function Notifications() {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-red-100 text-red-800';
      case 'Scheduled': return 'bg-gray-100 text-gray-900';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Sending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
    if (!dateString) return 'Not sent';
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

  const handleCreateNotification = () => {
    alert('New notification created successfully!');
    setShowCreateModal(false);
  };

  const handleSaveEdit = () => {
    alert('Notification updated successfully!');
    setShowEditModal(false);
    setSelectedNotification(null);
  };

  const confirmDelete = () => {
    alert(`Notification "${selectedNotification?.title}" deleted successfully!`);
    setShowDeleteModal(false);
    setSelectedNotification(null);
  };

  const handleResendNotification = (notification: any) => {
    alert(`Notification "${notification.title}" resent successfully!`);
  };

  const handleDuplicateNotification = (notification: any) => {
    alert(`Notification "${notification.title}" duplicated successfully!`);
  };

  // Template Actions
  const handleViewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    alert(`Edit template: ${template.name}`);
  };

  const handleDeleteTemplate = (template: any) => {
    alert(`Template "${template.name}" deleted successfully!`);
  };

  const handleCreateTemplate = () => {
    alert('New template created successfully!');
    setShowCreateTemplateModal(false);
  };

  const handlePreviewTemplate = (template: any) => {
    alert(`Preview template: ${template.name}`);
  };

  const handleDuplicateTemplate = (template: any) => {
    alert(`Template "${template.name}" duplicated successfully!`);
  };

  // General Actions
  const handleRefreshStatus = () => {
    alert('Notification status refreshed successfully!');
  };

  const handleExportLogs = () => {
    alert('Notification logs exported successfully!');
  };

  const handleSaveSettings = () => {
    alert('Notification settings saved successfully!');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Manage notifications, templates, and communication settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRefreshStatus}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 me-2" />
              Refresh Status
            </button>
            <button 
              onClick={handleExportLogs}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 me-2" />
              Export Logs
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 me-2" />
              Create Notification
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">15,247</p>
              <p className="text-xs text-red-600 mt-1">This month</p>
            </div>
            <Send className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900">98.5%</p>
              <p className="text-xs text-red-600 mt-1">Above target</p>
            </div>
            <CheckCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">87.2%</p>
              <p className="text-xs text-red-600 mt-1">+2.3% vs last month</p>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Templates</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-xs text-gray-500 mt-1">3 in draft</p>
            </div>
            <MessageSquare className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Bell className="w-4 h-4 me-2" />
              Notifications
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 me-2" />
              Templates
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-gray-700 text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Settings className="w-4 h-4 me-2" />
              Settings
            </div>
          </button>
        </nav>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <>
          {/* Filters */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
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
                <option value="Delivered">Delivered</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Failed">Failed</option>
                <option value="Sending">Sending</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="All Types">All Types</option>
                <option value="System">System</option>
                <option value="Alert">Alert</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Onboarding">Onboarding</option>
              </select>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 me-2" />
                More Filters
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </div>

          {/* Notifications Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notification
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Channel
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent Date
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => {
                    const TypeIcon = getTypeIcon(notification.type);
                    return (
                      <tr key={notification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <TypeIcon className="w-5 h-5 text-gray-400 me-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                              <div className="text-sm text-gray-500">{notification.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{notification.type}</div>
                            <div className="text-sm text-gray-500">{notification.channel}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 me-1" />
                            <span className="text-sm text-gray-900">{notification.recipients.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(notification.sent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(notification.status))}>
                            {notification.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {notification.openRate ? (
                            <div className="text-sm">
                              <div className="text-gray-900">Open: {notification.openRate}</div>
                              <div className="text-gray-500">Click: {notification.clickRate}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewDetails(notification)}
                              className="text-black hover:text-blue-900" 
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditNotification(notification)}
                              className="text-gray-600 hover:text-gray-900" 
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {notification.status === 'Failed' && (
                              <button 
                                onClick={() => handleResendNotification(notification)}
                                className="text-red-600 hover:text-red-900" 
                                title="Resend"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDuplicateNotification(notification)}
                              className="text-purple-600 hover:text-purple-900" 
                              title="Duplicate"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteNotification(notification)}
                              className="text-red-600 hover:text-red-900" 
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notification Templates</h3>
            <button 
              onClick={() => setShowCreateTemplateModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 me-2" />
              New Template
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template Name
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {template.type.includes('Email') && <Mail className="w-4 h-4 me-1" />}
                        {template.type.includes('SMS') && <MessageSquare className="w-4 h-4 me-1" />}
                        {template.type.includes('In-App') && <Bell className="w-4 h-4 me-1" />}
                        {template.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {template.usage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.lastModified).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        template.status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      )}>
                        {template.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewTemplate(template)}
                          className="text-black hover:text-blue-900" 
                          title="View Template"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditTemplate(template)}
                          className="text-gray-600 hover:text-gray-900" 
                          title="Edit Template"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handlePreviewTemplate(template)}
                          className="text-red-600 hover:text-red-900" 
                          title="Preview"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDuplicateTemplate(template)}
                          className="text-purple-600 hover:text-purple-900" 
                          title="Duplicate"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(template)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete"
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

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Email Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    defaultValue="smtp.portfolio.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    defaultValue="Portfolio Admin"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">SMS Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMS Provider</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    <option>Twilio</option>
                    <option>AWS SNS</option>
                    <option>SendGrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    defaultValue="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Default Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Send welcome emails to new investors</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Send transaction confirmations</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" defaultChecked />
                  <span className="text-sm text-gray-700">Send monthly statements</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" />
                  <span className="text-sm text-gray-700">Send marketing communications</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button 
                onClick={handleSaveSettings}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
              >
                <Settings className="w-4 h-4 me-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {showDetailsModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Notification Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-sm text-gray-900">{selectedNotification.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-sm text-gray-900">{selectedNotification.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <p className="text-sm text-gray-900">{selectedNotification.channel}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                  <p className="text-sm text-gray-900">{selectedNotification.recipients.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedNotification.status)}`}>
                    {selectedNotification.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sent Date</label>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedNotification.sent)}</p>
                </div>
              </div>

              {selectedNotification.openRate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Open Rate</label>
                    <p className="text-sm text-gray-900">{selectedNotification.openRate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Click Rate</label>
                    <p className="text-sm text-gray-900">{selectedNotification.clickRate}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditNotification(selectedNotification);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                Edit Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Notification</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  placeholder="Enter notification title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    <option value="">Select type</option>
                    <option value="System">System</option>
                    <option value="Alert">Alert</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Onboarding">Onboarding</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Channel *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    <option value="">Select channel</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="In-App">In-App</option>
                    <option value="Email + SMS">Email + SMS</option>
                    <option value="Email + In-App">Email + In-App</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                  <option value="">Select recipients</option>
                  <option value="all-investors">All Investors</option>
                  <option value="active-investors">Active Investors</option>
                  <option value="new-investors">New Investors</option>
                  <option value="custom">Custom List</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  placeholder="Enter notification message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNotification}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
                >
                  Create Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Notification</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the notification <strong>"{selectedNotification.title}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
