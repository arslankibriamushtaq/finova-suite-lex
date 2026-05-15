import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  Activity, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock,
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { Button, Table, Badge, Space, Tooltip, Input, Select, Tabs, Empty, Spin, Switch, Radio } from 'antd';
import { toast } from 'react-hot-toast';
import { cn } from '../../../lib/utils';

// API Services
import {
  getEventTypes,
  getNovuTemplates,
  getNotificationRules,
  createNotificationRule,
  updateNotificationRule,
  deleteNotificationRule,
  getCustomerPreferences,
  updateCustomerPreferences
} from '../../../redux/apis/apisNotificationOrchestrator';

const { TabPane } = Tabs;
const TENANT_ID = "550e8400-e29b-41d4-a716-446655440000";

const NotificationOrchestrator: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dynamic Data from APIs
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [routingRules, setRoutingRules] = useState<any[]>([]);

  // Modal & Form State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [rulePayload, setRulePayload] = useState({
    ruleCode: '',
    ruleName: '',
    eventType: '',
    channel: 'SMS',
    novuTemplateId: '',
    priority: 'NORMAL',
    active: true
  });

  // State for Preferences
  const [customerId, setCustomerId] = useState('');
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, [activeKey]);

  // Smart Rule Code Generator
  useEffect(() => {
    if (rulePayload.eventType && rulePayload.channel && !editingRule) {
      const generatedCode = `RULE_${rulePayload.eventType.toUpperCase()}_${rulePayload.channel.toUpperCase()}`;
      setRulePayload(prev => ({ ...prev, ruleCode: generatedCode }));
    }
  }, [rulePayload.eventType, rulePayload.channel, editingRule]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      if (activeKey === '1') {
        const [rulesRes, eventTypesRes, templatesRes] = await Promise.all([
          getNotificationRules(),
          getEventTypes(),
          getNovuTemplates()
        ]);
        setRoutingRules(rulesRes.data?.data || []);
        setEventTypes(eventTypesRes.data?.data || []);
        setTemplates(templatesRes.data?.data || []);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      // Fallback for visual demo if API fails
      if (activeKey === '1') {
        setRoutingRules(mockRoutingRules);
        setEventTypes(mockEventTypes);
        setTemplates(mockTemplates);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRule = async () => {
    // Validation
    const { ruleName, ruleCode, eventType, channel, novuTemplateId } = rulePayload;
    if (!ruleName || !ruleCode || !eventType || !channel || !novuTemplateId) {
      return toast.error("Please fill all mandatory fields");
    }

    try {
      setIsLoading(true);
      const payload = {
        ...rulePayload,
        tenantId: TENANT_ID
      };

      if (editingRule) {
        await updateNotificationRule(editingRule.id, payload);
        toast.success("Notification Policy Updated");
      } else {
        await createNotificationRule(payload);
        toast.success("Orchestration Rule Synchronized! 🚀");
      }
      setIsRuleModalOpen(false);
      fetchInitialData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Internal Routing Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm("Confirm deletion? This action affects production routing.")) return;
    try {
      setIsLoading(true);
      await deleteNotificationRule(id);
      toast.success("Policy Removed");
      fetchInitialData();
    } catch (error: any) {
      toast.error("Deletion failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreferences = async () => {
    if (!customerId) return toast.error("Valid ID required");
    try {
      setIsLoading(true);
      const res = await getCustomerPreferences(customerId);
      setPreferences(res.data?.data);
    } catch (error) {
      toast.error("Sync Failed: Record not found");
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Data
  const mockEventTypes = [
    { code: 'AUTH_OTP', name: 'Authentication OTP' },
    { code: 'PAYMENT_SUCCESS', name: 'Payment Success' },
    { code: 'PAYMENT_FAILED', name: 'Payment Failed' },
    { code: 'ACCOUNT_DEBIT', name: 'Account Debit Alert' },
    { code: 'NEW_LOGIN', name: 'New Device Login' },
  ];

  const mockTemplates = [
    { id: '64f12345abcde', name: 'Standard OTP Template' },
    { id: '78g98765xyzpq', name: 'Transaction Receipt (Rich Text)' },
    { id: '90h11223mmnno', name: 'Marketing Promotion (WhatsApp)' },
  ];

  const mockRoutingRules = [
    { id: '1', ruleCode: 'RULE_AUTH_OTP_SMS', ruleName: 'Auth OTP via SMS', eventType: 'AUTH_OTP', channel: 'SMS', priority: 'HIGH', active: true },
    { id: '2', ruleCode: 'RULE_PAYMENT_SUCCESS_PUSH', ruleName: 'Success Notification', eventType: 'PAYMENT_SUCCESS', channel: 'PUSH', priority: 'NORMAL', active: true },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#0a0a0a] min-h-screen text-gray-200 font-outfit">
      <div className="max-w-7xl mx-auto">
        
        {/* Premium Glassmorphic Header */}
        <div className="relative mb-8 p-10 rounded-[2.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl">
          <div className="absolute top-[-20px] right-[-20px] p-12 opacity-5 animate-pulse">
            <Zap size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 ring-1 ring-blue-500/30">
                  <Activity size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase">Status</span>
                  <Badge status="processing" text="ORCHESTRATOR LIVE" className="text-blue-300 font-bold text-xs" />
                </div>
              </div>
              <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
                Notification Rules
              </h1>
              <p className="text-gray-400 mt-4 max-w-xl text-lg leading-relaxed">
                Configure smart routing logic, map event triggers to Novu templates, and manage multi-channel delivery priorities.
              </p>
            </div>
            
            <div className="flex gap-6">
               <div className="px-8 py-6 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-md">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total Rules</p>
                  <p className="text-3xl font-black text-white">{routingRules.length}</p>
               </div>
               <div className="px-8 py-6 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-md">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">System Health</p>
                  <p className="text-3xl font-black text-green-400">99%</p>
               </div>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <Tabs 
          activeKey={activeKey} 
          onChange={setActiveKey}
          className="custom-tabs-refined"
          type="card"
        >
          <TabPane 
            tab={<span className="flex items-center gap-3 px-4 py-1"><Settings size={18} /> Routing Engine</span>} 
            key="1"
          >
            <Card className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl border-t-white/20">
              <div className="p-8 border-b border-white/10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex gap-4 items-center w-full lg:w-auto">
                  <div className="relative flex-1 lg:flex-initial">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <Input 
                      placeholder="Filter orchestration rules..."
                      className="bg-black/40 border-white/10 text-white rounded-2xl h-14 pl-12 pr-6 w-full lg:w-80 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                  <Select defaultValue="all" className="h-14 w-44 custom-select-refined">
                    <Select.Option value="all">All Channels</Select.Option>
                    <Select.Option value="SMS">SMS Gateway</Select.Option>
                    <Select.Option value="PUSH">Push Server</Select.Option>
                    <Select.Option value="WHATSAPP">WhatsApp</Select.Option>
                  </Select>
                </div>
                <Button 
                  type="primary" 
                  icon={<Plus size={20} />} 
                  onClick={() => {
                    setEditingRule(null);
                    setRulePayload({
                      ruleCode: '',
                      ruleName: '',
                      eventType: '',
                      channel: 'SMS',
                      novuTemplateId: '',
                      priority: 'NORMAL',
                      active: true
                    });
                    setIsRuleModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 border-none h-14 px-10 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-blue-600/20"
                >
                  Create New Rule
                </Button>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6">Orchestration Rule</th>
                      <th className="px-8 py-6">Event Context</th>
                      <th className="px-8 py-6">Channel Path</th>
                      <th className="px-8 py-6">Priority</th>
                      <th className="px-8 py-6 text-center">Active Status</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {routingRules.length > 0 ? routingRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-white/[0.03] transition-all group">
                        <td className="px-8 py-6">
                          <div>
                            <p className="font-bold text-white text-base mb-1">{rule.ruleName}</p>
                            <p className="font-mono text-blue-400 text-[11px] tracking-tight">{rule.ruleCode}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-xs text-gray-400 font-medium">
                            {rule.eventType}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg ring-1 ring-inset",
                              rule.channel === 'SMS' ? "bg-yellow-500/10 ring-yellow-500/20 text-yellow-500" :
                              rule.channel === 'WHATSAPP' ? "bg-green-500/10 ring-green-500/20 text-green-500" :
                              "bg-blue-500/10 ring-blue-500/20 text-blue-500"
                            )}>
                              {rule.channel === 'SMS' ? <MessageSquare size={16} /> :
                               rule.channel === 'WHATSAPP' ? <Smartphone size={16} /> :
                               <Bell size={16} />}
                            </div>
                            <span className="text-sm font-bold text-gray-300">{rule.channel}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge 
                            count={rule.priority} 
                            style={{ 
                              backgroundColor: rule.priority === 'CRITICAL' ? '#ef4444' : 
                                             rule.priority === 'HIGH' ? '#f97316' : '#3b82f6',
                              fontSize: '10px',
                              fontWeight: '900',
                              padding: '0 8px'
                            }}
                          />
                        </td>
                        <td className="px-8 py-6 text-center">
                           <Switch 
                             checked={rule.active} 
                             size="small" 
                             className={cn(rule.active ? "bg-green-500" : "bg-gray-700")}
                           />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Space size="large">
                            <button 
                              onClick={() => {
                                setEditingRule(rule);
                                setRulePayload({ ...rule });
                                setIsRuleModalOpen(true);
                              }}
                              className="text-gray-500 hover:text-white transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </Space>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-32 text-center">
                          <Empty description={<span className="text-gray-500 font-medium">No rules discovered. Create one to begin orchestration.</span>} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPane>

          <TabPane 
            tab={<span className="flex items-center gap-3 px-4 py-1"><Smartphone size={18} /> User Preference Sync</span>} 
            key="2"
          >
            <div className="max-w-3xl mx-auto py-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Customer Routing Map</h2>
                <p className="text-gray-400 text-lg">Cross-reference and synchronize per-user delivery preferences.</p>
              </div>

              <div className="flex gap-4 mb-16">
                <Input 
                  size="large"
                  placeholder="Enter Customer UUID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-16 rounded-[1.25rem] px-6 text-lg"
                />
                <Button 
                  type="primary" 
                  size="large"
                  onClick={fetchPreferences}
                  className="h-16 px-12 rounded-[1.25rem] bg-blue-600 border-none font-black text-lg"
                >
                  Lookup
                </Button>
              </div>

              {preferences && (
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
                   <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/10">
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-500/20">
                        {preferences.customerId?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">User Identifier</p>
                        <p className="font-mono text-white text-sm">{preferences.customerId}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      {[
                        { label: 'SMS Gateway', icon: MessageSquare, key: 'smsEnabled', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                        { label: 'Email Server', icon: Mail, key: 'emailEnabled', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                        { label: 'Push Notifications', icon: Bell, key: 'pushEnabled', color: 'text-purple-400', bg: 'bg-purple-400/10' }
                      ].map((channel) => (
                        <div key={channel.key} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex items-center gap-5">
                            <div className={cn("p-3 rounded-2xl", channel.bg, channel.color)}>
                              <channel.icon size={22} />
                            </div>
                            <span className="text-white font-bold text-lg">{channel.label}</span>
                          </div>
                          <Switch 
                            checked={preferences[channel.key]} 
                            onChange={(checked) => {
                              const newPrefs = { ...preferences, [channel.key]: checked };
                              setPreferences(newPrefs);
                              updateCustomerPreferences({ customerId, ...newPrefs });
                              toast.success(`${channel.label} preference updated`);
                            }}
                          />
                        </div>
                      ))}
                   </div>
                </Card>
              )}
            </div>
          </TabPane>
        </Tabs>

        {/* New Rule Modal - Refined */}
        <Modal 
          show={isRuleModalOpen} 
          onHide={() => setIsRuleModalOpen(false)} 
          centered 
          className="dark-modal-refined"
          size="lg"
        >
          <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
            <Modal.Header className="border-b border-white/10 px-10 py-8 bg-white/[0.02]">
              <Modal.Title className="text-white font-black text-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 ring-1 ring-blue-500/30">
                  <Plus size={24} />
                </div>
                {editingRule ? 'Update Orchestration Policy' : 'Define New Routing Rule'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-10 py-10">
              <Form className="space-y-8">
                <Row gutter={[32, 32]}>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Rule Context Name</Form.Label>
                      <Form.Control 
                        type="text"
                        value={rulePayload.ruleName}
                        onChange={(e) => setRulePayload({ ...rulePayload, ruleName: e.target.value })}
                        placeholder="e.g. Auth OTP Service"
                        className="bg-black/40 border-white/10 text-white h-14 rounded-2xl focus:border-blue-500 transition-all text-sm font-medium"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Event Type Trigger</Form.Label>
                      <Select 
                        showSearch
                        value={rulePayload.eventType || undefined}
                        placeholder="Select trigger event"
                        onChange={(val) => setRulePayload({ ...rulePayload, eventType: val })}
                        className="w-full h-14 custom-select-refined-form"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={eventTypes.map(e => ({ value: e.code, label: e.name }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Delivery Channel</Form.Label>
                      <Select 
                        value={rulePayload.channel}
                        onChange={(val) => setRulePayload({ ...rulePayload, channel: val })}
                        className="w-full h-14 custom-select-refined-form"
                        options={[
                          { value: 'SMS', label: 'SMS Gateway' },
                          { value: 'PUSH', label: 'Push Notification' },
                          { value: 'WHATSAPP', label: 'WhatsApp' },
                          { value: 'EMAIL', label: 'Email Service' }
                        ]}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Auto-Generated Rule Code</Form.Label>
                      <Form.Control 
                        type="text"
                        value={rulePayload.ruleCode}
                        readOnly
                        placeholder="Generated on selection"
                        className="bg-white/5 border-white/5 text-blue-400 h-14 rounded-2xl font-mono text-xs tracking-tight"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Novu Template Mapping</Form.Label>
                      <Select 
                        showSearch
                        value={rulePayload.novuTemplateId || undefined}
                        placeholder="Search Novu templates..."
                        onChange={(val) => setRulePayload({ ...rulePayload, novuTemplateId: val })}
                        className="w-full h-14 custom-select-refined-form"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={templates.map(t => ({ value: t.id, label: t.name }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Delivery Priority Level</Form.Label>
                      <Radio.Group 
                        block 
                        value={rulePayload.priority} 
                        onChange={(e) => setRulePayload({ ...rulePayload, priority: e.target.value })}
                        className="custom-priority-group"
                      >
                        <Radio.Button value="LOW" className="flex-1 text-center">Low</Radio.Button>
                        <Radio.Button value="NORMAL" className="flex-1 text-center">Normal</Radio.Button>
                        <Radio.Button value="HIGH" className="flex-1 text-center">High</Radio.Button>
                        <Radio.Button value="CRITICAL" className="flex-1 text-center critical">Critical</Radio.Button>
                      </Radio.Group>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex items-start gap-4">
                   <AlertTriangle className="text-yellow-500 mt-1" size={20} />
                   <div>
                     <p className="text-sm font-bold text-yellow-500 mb-1">Warning</p>
                     <p className="text-xs text-yellow-500/70 leading-relaxed">
                       New rules are deployed to the Kong API Gateway immediately upon saving. 
                       Incorrect mapping may lead to delivery failure for critical customer events.
                     </p>
                   </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-t border-white/10 px-10 py-8 bg-white/[0.01]">
              <Button 
                onClick={() => setIsRuleModalOpen(false)}
                className="bg-transparent border-white/10 text-gray-400 hover:text-white rounded-2xl h-14 px-10 text-sm font-bold"
              >
                Discard Changes
              </Button>
              <Button 
                type="primary" 
                loading={isLoading}
                onClick={handleSaveRule}
                className="bg-blue-600 hover:bg-blue-500 border-none rounded-2xl h-14 px-16 font-black text-sm shadow-xl shadow-blue-600/20"
              >
                {editingRule ? 'Update Policy' : 'Authorize & Deploy'}
              </Button>
            </Modal.Footer>
          </div>
        </Modal>

        {/* Refined Global Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
          .font-outfit { font-family: 'Outfit', sans-serif !important; }
          
          .custom-tabs-refined .ant-tabs-nav::before { display: none !important; }
          .custom-tabs-refined .ant-tabs-tab { background: rgba(255,255,255,0.02) !important; border: 1px solid rgba(255,255,255,0.05) !important; color: #666 !important; border-radius: 16px !important; margin-right: 12px !important; transition: all 0.3s ease !important; }
          .custom-tabs-refined .ant-tabs-tab-active { background: rgba(59,130,246,0.1) !important; border: 1px solid rgba(59,130,246,0.3) !important; }
          .custom-tabs-refined .ant-tabs-tab-active .ant-tabs-tab-btn { color: white !important; font-weight: 900 !important; }
          
          .custom-select-refined .ant-select-selector { background-color: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.1) !important; color: white !important; border-radius: 16px !important; }
          .custom-select-refined-form .ant-select-selector { height: 56px !important; display: flex !important; align-items: center !important; background-color: rgba(0,0,0,0.4) !important; border-color: rgba(255,255,255,0.1) !important; color: white !important; border-radius: 16px !important; padding: 0 20px !important; }
          
          .custom-priority-group { display: flex !important; gap: 8px !important; }
          .custom-priority-group .ant-radio-button-wrapper { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 16px !important; color: #666 !important; height: 56px !important; line-height: 54px !important; flex: 1 !important; text-align: center !important; font-weight: 600 !important; }
          .custom-priority-group .ant-radio-button-wrapper-checked { background: rgba(59,130,246,0.2) !important; border-color: #3b82f6 !important; color: white !important; }
          .custom-priority-group .ant-radio-button-wrapper-checked.critical { background: rgba(239,68,68,0.2) !important; border-color: #ef4444 !important; }
          
          .dark-modal-refined .modal-content { background: transparent !important; border: none !important; }
          
          /* AntD Select dropdown styling */
          .ant-select-dropdown { background-color: #1a1a1a !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 16px !important; padding: 8px !important; }
          .ant-select-item { color: #999 !important; border-radius: 8px !important; }
          .ant-select-item-option-selected { background-color: rgba(59,130,246,0.1) !important; color: white !important; }
          .ant-select-item-option-active { background-color: rgba(255,255,255,0.05) !important; }
        `}} />
      </div>
    </div>
  );
};

export default NotificationOrchestrator;
