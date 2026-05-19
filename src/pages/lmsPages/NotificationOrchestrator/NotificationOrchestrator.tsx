import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  Activity, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  Zap,
  Cpu,
  Key,
  Database,
  Cloud
} from 'lucide-react';
import { Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { Button, Badge, Space, Input, Select, Tabs, Empty, Switch, Radio } from 'antd';
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
  updateCustomerPreferences,
  getProviderSettings,
  updateProviderSettings
} from '../../../redux/apis/apisNotificationOrchestrator';

const { TabPane } = Tabs;
const { TextArea } = Input;
const TENANT_ID = "550e8400-e29b-41d4-a716-446655440000";

const NotificationOrchestrator: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dynamic Data
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [routingRules, setRoutingRules] = useState<any[]>([]);

  // Provider Settings State
  const [providerSettings, setProviderSettings] = useState({
    serviceAccountJson: '',
    apiKey: '',
    environment: 'development'
  });

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
      } else if (activeKey === '3') {
        const res = await getProviderSettings();
        setProviderSettings(res.data?.data || {
          serviceAccountJson: '',
          apiKey: '',
          environment: 'development'
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      if (activeKey === '1') {
        setRoutingRules(mockRoutingRules);
        setEventTypes(mockEventTypesStrings);
        setTemplates(mockTemplates);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRule = async () => {
    const { ruleName, ruleCode, eventType, channel, novuTemplateId } = rulePayload;
    if (!ruleName || !ruleCode || !eventType || !channel || !novuTemplateId) {
      return toast.error("Please fill all mandatory fields");
    }

    try {
      setIsLoading(true);
      const payload = { ...rulePayload, tenantId: TENANT_ID };
      if (editingRule) {
        await updateNotificationRule(editingRule.id, payload);
        toast.success("Policy Updated");
      } else {
        await createNotificationRule(payload);
        toast.success("Orchestration Rule Synchronized!");
      }
      setIsRuleModalOpen(false);
      fetchInitialData();
    } catch (error: any) {
      toast.error("Internal Routing Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProviderSettings = async () => {
    try {
      setIsLoading(true);
      if (providerSettings.serviceAccountJson) {
        try { JSON.parse(providerSettings.serviceAccountJson); } 
        catch (e) { return toast.error("Invalid Service Account JSON format"); }
      }
      await updateProviderSettings(providerSettings);
      toast.success("Provider Configuration Deployed 🌐");
    } catch (error) {
      toast.error("Failed to update provider settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm("Confirm deletion?")) return;
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
      toast.error("Record not found");
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Data
  const mockEventTypesStrings = ["AUTH_OTP", "PAYMENT_COMPLETED", "LOAN_APPROVED"];
  const mockTemplates = [
    { id: '64f12345abcde', name: 'Standard OTP Template' },
  ];
  const mockRoutingRules = [
    { id: '1', ruleCode: 'RULE_AUTH_OTP_SMS', ruleName: 'Auth OTP via SMS', eventType: 'AUTH_OTP', channel: 'SMS', priority: 'HIGH', active: true },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#0a0a0a] min-h-screen text-gray-200 font-outfit">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
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
                <Badge status="processing" text="SYSTEM LIVE" className="text-blue-300 font-bold text-xs" />
              </div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent text-shadow">Notification Orchestrator</h1>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <Tabs activeKey={activeKey} onChange={setActiveKey} className="custom-tabs-refined" type="card">
          {/* Tab 1: Rules Engine */}
          <TabPane tab={<span className="flex items-center gap-3 px-4 py-1"><Settings size={18} /> Routing Rules</span>} key="1">
             <Card className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl border-t-white/20">
              <div className="p-8 border-b border-white/10 flex justify-between items-center">
                <div className="flex gap-4">
                  <Input prefix={<Search size={18} className="text-gray-500" />} placeholder="Filter rules..." className="bg-black/40 border-white/10 text-white rounded-2xl h-14 w-80" />
                </div>
                <Button type="primary" icon={<Plus size={20} />} onClick={() => { setEditingRule(null); setIsRuleModalOpen(true); }} className="bg-blue-600 border-none h-14 px-10 rounded-2xl font-bold">
                  Create New Rule
                </Button>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6">Orchestration Rule</th>
                      <th className="px-8 py-6">Channel</th>
                      <th className="px-8 py-6">Priority</th>
                      <th className="px-8 py-6 text-center">Status</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {Array.isArray(routingRules) && routingRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-white/[0.03] transition-all">
                        <td className="px-8 py-6">
                          <p className="font-bold text-white mb-1">{rule.ruleName}</p>
                          <p className="font-mono text-blue-400 text-[11px]">{rule.ruleCode}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3 text-white">
                              <div className={cn(
                                "p-2 rounded-lg ring-1 ring-inset",
                                rule.channel === 'SMS' ? "bg-yellow-500/10 ring-yellow-500/20 text-yellow-500" :
                                rule.channel === 'WHATSAPP' ? "bg-green-500/10 ring-green-500/20 text-green-500" :
                                "bg-blue-500/10 ring-blue-500/20 text-blue-500"
                              )}>
                                {rule.channel === 'SMS' ? <MessageSquare size={16} /> :
                                 rule.channel === 'WHATSAPP' ? <Smartphone size={16} /> :
                                 rule.channel === 'EMAIL' ? <Mail size={16} /> :
                                 <Bell size={16} />}
                              </div>
                              <span className="text-xs font-bold">{rule.channel}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge 
                            count={rule.priority} 
                            style={{ 
                              backgroundColor: rule.priority === 'CRITICAL' ? '#ef4444' : 
                                             rule.priority === 'HIGH' ? '#f97316' : '#3b82f6',
                              fontSize: '10px',
                              fontWeight: '900'
                            }} 
                          />
                        </td>
                        <td className="px-8 py-6 text-center">
                           <Switch checked={rule.active} size="small" />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Space size="large">
                            <button className="text-gray-500 hover:text-white" onClick={() => { setEditingRule(rule); setRulePayload({ ...rule }); setIsRuleModalOpen(true); }}><Edit size={18} /></button>
                            <button className="text-gray-500 hover:text-red-400" onClick={() => handleDeleteRule(rule.id)}><Trash2 size={18} /></button>
                          </Space>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPane>

          {/* Tab 2: User Preferences */}
          <TabPane tab={<span className="flex items-center gap-3 px-4 py-1"><Smartphone size={18} /> User Sync</span>} key="2">
            <div className="max-w-3xl mx-auto py-16">
               <div className="flex gap-4 mb-16">
                <Input size="large" placeholder="Enter Customer UUID" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="bg-white/5 border-white/10 text-white h-16 rounded-[1.25rem] px-6 text-lg" />
                <Button type="primary" size="large" onClick={fetchPreferences} className="h-16 px-12 rounded-[1.25rem] bg-blue-600 border-none font-black text-lg">Lookup</Button>
              </div>
              {preferences && (
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
                   <p className="text-white font-bold text-lg mb-4">Channel Preferences for {preferences.customerId}</p>
                   <div className="space-y-4">
                      {['smsEnabled', 'emailEnabled', 'pushEnabled'].map(k => (
                        <div key={k} className="flex justify-between p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                          <span className="text-white font-bold uppercase">{k.replace('Enabled', '')}</span>
                          <Switch checked={preferences[k]} />
                        </div>
                      ))}
                   </div>
                </Card>
              )}
            </div>
          </TabPane>

          {/* Tab 3: Provider Configuration */}
          <TabPane tab={<span className="flex items-center gap-3 px-4 py-1"><Cpu size={18} /> Provider Config</span>} key="3">
            <div className="max-w-5xl mx-auto py-12">
              <div className="mb-10 text-center">
                <div className="inline-flex p-4 bg-purple-500/10 rounded-full text-purple-400 mb-4 ring-1 ring-purple-500/20"><Cloud size={32} /></div>
                <h2 className="text-3xl font-black text-white mb-2">Cloud Provider Integration</h2>
                <p className="text-gray-400">Configure FCM Service Accounts and Novu Secret Keys.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 backdrop-blur-xl border-t-white/20">
                    <div className="flex items-center gap-3 mb-6"><Database className="text-blue-400" size={20} /><h3 className="text-lg font-bold text-white">Service Account (JSON)</h3></div>
                    <TextArea rows={12} value={providerSettings.serviceAccountJson} onChange={(e) => setProviderSettings({...providerSettings, serviceAccountJson: e.target.value})} className="bg-black/60 border-white/10 text-blue-300 font-mono text-xs rounded-2xl p-6" />
                    <div className="mt-8 flex justify-end">
                      <Button type="primary" loading={isLoading} onClick={handleSaveProviderSettings} className="bg-blue-600 border-none h-14 px-12 rounded-2xl font-black">Deploy Configuration</Button>
                    </div>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 backdrop-blur-xl border-t-white/20">
                    <div className="flex items-center gap-3 mb-6"><Key className="text-purple-400" size={20} /><h3 className="text-lg font-bold text-white">Novu Credentials</h3></div>
                    <Form layout="vertical">
                      <Form.Item label={<span className="text-gray-500 text-[10px] font-black uppercase">Secret API Key</span>}>
                        <Input.Password value={providerSettings.apiKey} onChange={(e) => setProviderSettings({...providerSettings, apiKey: e.target.value})} className="bg-black/40 border-white/10 text-white h-12 rounded-xl" />
                      </Form.Item>
                    </Form>
                  </Card>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>

        {/* Create/Edit Rule Modal */}
        <Modal show={isRuleModalOpen} onHide={() => setIsRuleModalOpen(false)} centered className="dark-modal-refined" size="lg">
          <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] overflow-hidden">
            <Modal.Header className="px-10 py-8 bg-white/[0.02] border-b border-white/10">
              <Modal.Title className="text-white font-black text-2xl flex items-center gap-4"><Plus size={24} /> {editingRule ? 'Update Policy' : 'New Routing Rule'}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-10 py-10">
              <Form className="space-y-8">
                <Row gutter={[32, 32]}>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase mb-3 block tracking-widest">Rule Context Name</Form.Label>
                      <Form.Control type="text" value={rulePayload.ruleName} onChange={(e) => setRulePayload({ ...rulePayload, ruleName: e.target.value })} className="bg-black/40 border-white/10 text-white h-14 rounded-2xl" placeholder="e.g. Auth OTP Service" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase mb-3 block tracking-widest">Event Type</Form.Label>
                      <Select showSearch value={rulePayload.eventType || undefined} onChange={(val) => setRulePayload({ ...rulePayload, eventType: val })} className="w-full h-14 custom-select-refined-form" options={(Array.isArray(eventTypes) ? eventTypes : []).map(e => ({ value: typeof e === 'string' ? e : e.code, label: typeof e === 'string' ? e.replace(/_/g, ' ') : e.name }))} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase mb-3 block tracking-widest">Delivery Channel</Form.Label>
                      <Select value={rulePayload.channel} onChange={(val) => setRulePayload({ ...rulePayload, channel: val })} className="w-full h-14 custom-select-refined-form" options={[{ value: 'SMS', label: 'SMS Gateway' }, { value: 'PUSH', label: 'Push Notification' }, { value: 'WHATSAPP', label: 'WhatsApp' }, { value: 'EMAIL', label: 'Email Service' }]} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase mb-3 block tracking-widest">Rule Code</Form.Label>
                      <Form.Control type="text" value={rulePayload.ruleCode} readOnly className="bg-white/5 border-white/5 text-blue-400 h-14 rounded-2xl font-mono text-xs" />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase mb-3 block tracking-widest">Novu Template Mapping</Form.Label>
                      <Select showSearch value={rulePayload.novuTemplateId || undefined} onChange={(val) => setRulePayload({ ...rulePayload, novuTemplateId: val })} className="w-full h-14 custom-select-refined-form" options={(Array.isArray(templates) ? templates : []).map(t => ({ value: t.id, label: t.name }))} />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="text-gray-500 text-[10px] font-black uppercase mb-3 block tracking-widest">Delivery Priority</Form.Label>
                      <Radio.Group block value={rulePayload.priority} onChange={(e) => setRulePayload({ ...rulePayload, priority: e.target.value })} className="custom-priority-group">
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
                   <p className="text-xs text-yellow-500/70">New rules are deployed to the Kong API Gateway immediately upon saving.</p>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer className="px-10 py-8 bg-white/[0.01] border-t border-white/10">
              <Button onClick={() => setIsRuleModalOpen(false)} className="bg-transparent border-white/10 text-gray-400 h-14 px-10 rounded-2xl">Discard</Button>
              <Button type="primary" loading={isLoading} onClick={handleSaveRule} className="bg-blue-600 border-none h-14 px-16 rounded-2xl font-black">Authorize & Deploy</Button>
            </Modal.Footer>
          </div>
        </Modal>

        {/* Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap');
          .font-outfit { font-family: 'Outfit', sans-serif !important; }
          .custom-tabs-refined .ant-tabs-nav::before { display: none !important; }
          .custom-tabs-refined .ant-tabs-tab { background: rgba(255,255,255,0.02) !important; border: 1px solid rgba(255,255,255,0.05) !important; color: #666 !important; border-radius: 16px !important; margin-right: 12px !important; }
          .custom-tabs-refined .ant-tabs-tab-active { background: rgba(59,130,246,0.1) !important; border: 1px solid rgba(59,130,246,0.3) !important; }
          .custom-tabs-refined .ant-tabs-tab-active .ant-tabs-tab-btn { color: white !important; font-weight: 900 !important; }
          .custom-select-refined-form .ant-select-selector { height: 56px !important; display: flex !important; align-items: center !important; background-color: rgba(0,0,0,0.4) !important; border-color: rgba(255,255,255,0.1) !important; color: white !important; border-radius: 16px !important; }
          .dark-modal-refined .modal-content { background: transparent !important; border: none !important; }
          .ant-input-password { background: rgba(0,0,0,0.4) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; }
          .ant-input-password input { background: transparent !important; color: white !important; }
          .ant-form-item-label label { color: #666 !important; font-weight: 900 !important; font-size: 10px !important; text-transform: uppercase !important; }
          .custom-priority-group { display: flex !important; gap: 8px !important; }
          .custom-priority-group .ant-radio-button-wrapper { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 16px !important; color: #666 !important; height: 56px !important; line-height: 54px !important; flex: 1 !important; text-align: center !important; font-weight: 600 !important; }
          .custom-priority-group .ant-radio-button-wrapper-checked { background: rgba(59,130,246,0.2) !important; border-color: #3b82f6 !important; color: white !important; }
          .custom-priority-group .ant-radio-button-wrapper-checked.critical { background: rgba(239,68,68,0.2) !important; border-color: #ef4444 !important; }
          .text-shadow { text-shadow: 0 0 20px rgba(255,255,255,0.1); }
        `}} />
      </div>
    </div>
  );
};

export default NotificationOrchestrator;
