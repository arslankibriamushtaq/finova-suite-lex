import React, { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Trash2,
  Pencil,
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  Settings,
  Activity,
} from "lucide-react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import {
  Input as AntInput,
  Select as AntSelect,
  Switch,
  Radio,
  Spin,
  Tooltip,
  Pagination,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { toast } from "react-hot-toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";

import {
  getEventTypes,
  getNovuTemplates,
  getNotificationRules,
  createNotificationRule,
  updateNotificationRule,
  deleteNotificationRule,
  getCustomerPreferences,
  updateCustomerPreferences,
} from "../../../redux/apis/apisNotificationOrchestrator";

const TENANT_ID = "550e8400-e29b-41d4-a716-446655440000";

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const CHANNEL_OPTIONS = [
  { value: "SMS", label: "SMS Gateway" },
  { value: "PUSH", label: "Push Notification" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Email Service" },
];

const priorityColor = (p: string) => {
  switch ((p || "").toUpperCase()) {
    case "CRITICAL":
      return "var(--color-error)";
    case "HIGH":
      return "var(--color-warning)";
    case "LOW":
      return "var(--muted)";
    default:
      return "var(--color-info)";
  }
};

const NotificationOrchestrator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"rules" | "preferences">("rules");
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [routingRules, setRoutingRules] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [rulePayload, setRulePayload] = useState({
    ruleCode: "",
    ruleName: "",
    eventType: "",
    channel: "SMS",
    novuTemplateId: "",
    priority: "NORMAL",
    active: true,
  });

  // Preferences
  const [customerId, setCustomerId] = useState("");
  const [preferences, setPreferences] = useState<any>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeTab === "rules") fetchRulesData();
  }, [activeTab]);

  useEffect(() => {
    if (rulePayload.eventType && rulePayload.channel && !editingRule) {
      const code = `RULE_${rulePayload.eventType.toUpperCase()}_${rulePayload.channel.toUpperCase()}`;
      setRulePayload((prev) => ({ ...prev, ruleCode: code }));
    }
  }, [rulePayload.eventType, rulePayload.channel, editingRule]);

  const toArray = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  };

  const fetchRulesData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, eventTypesRes, templatesRes] = await Promise.all([
        getNotificationRules(),
        getEventTypes(),
        getNovuTemplates(),
      ]);
      setRoutingRules(toArray(rulesRes?.data?.data ?? rulesRes?.data));
      setEventTypes(toArray(eventTypesRes?.data?.data ?? eventTypesRes?.data));
      setTemplates(toArray(templatesRes?.data?.data ?? templatesRes?.data));
    } catch {
      // graceful fallback
      setRoutingRules([]);
      setEventTypes([]);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRule(null);
    setRulePayload({
      ruleCode: "",
      ruleName: "",
      eventType: "",
      channel: "SMS",
      novuTemplateId: "",
      priority: "NORMAL",
      active: true,
    });
    setIsRuleModalOpen(true);
  };

  const openEditModal = (rule: any) => {
    setEditingRule(rule);
    setRulePayload({
      ruleCode: rule.ruleCode || "",
      ruleName: rule.ruleName || "",
      eventType: rule.eventType || "",
      channel: rule.channel || "SMS",
      novuTemplateId: rule.novuTemplateId || "",
      priority: rule.priority || "NORMAL",
      active: rule.active ?? true,
    });
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async () => {
    const { ruleName, ruleCode, eventType, channel, novuTemplateId } = rulePayload;
    if (!ruleName || !ruleCode || !eventType || !channel || !novuTemplateId) {
      return toast.error("Please fill all required fields");
    }

    try {
      setIsLoading(true);
      const payload = { ...rulePayload, tenantId: TENANT_ID };
      if (editingRule) {
        await updateNotificationRule(editingRule.id, payload);
        toast.success("Rule updated");
      } else {
        await createNotificationRule(payload);
        toast.success("Rule created");
      }
      setIsRuleModalOpen(false);
      fetchRulesData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save rule");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteNotificationRule(deleteTarget.id);
      toast.success("Rule deleted");
      setDeleteTarget(null);
      fetchRulesData();
    } catch {
      toast.error("Failed to delete rule");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchPreferences = async () => {
    if (!customerId.trim()) return toast.error("Please enter a customer ID");
    try {
      setIsLoading(true);
      const res = await getCustomerPreferences(customerId.trim());
      setPreferences(res.data?.data || null);
    } catch {
      toast.error("No preferences found for this customer");
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRules = (Array.isArray(routingRules) ? routingRules : []).filter((r) => {
    const matchesSearch = !search
      ? true
      : (r.ruleName || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.ruleCode || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.eventType || "").toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channelFilter === "ALL" || r.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const pagedRules = filteredRules.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const channelIcon = (channel: string) => {
    if (channel === "SMS") return <MessageSquare className="h-4 w-4" />;
    if (channel === "WHATSAPP") return <Smartphone className="h-4 w-4" />;
    if (channel === "EMAIL") return <Mail className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  return (
    <div className="service notification-orchestrator-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          {/* <Activity className="h-5 w-5" style={{ color: "var(--primary)" }} /> */}
          Notification Rules
        </h3>
        <p className="text-muted small mb-0 mt-1">
          Configure smart routing logic, map event triggers to Novu templates, and manage multi-channel delivery priorities.
        </p>
      </div>

      <div className="stat-row mb-3">
        <div className="stat-tile">
          <div className="stat-label">Total Rules</div>
          <div className="stat-value">{routingRules.length}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">System Health</div>
          <div className="stat-value" style={{ color: "var(--color-success)" }}>99%</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="no-tabs-row">
          <TabsList className="no-tabs-list">
            <TabsTrigger value="rules" className="no-tabs-trigger">
              <Settings className="h-4 w-4" /> Routing Engine
            </TabsTrigger>
            <TabsTrigger value="preferences" className="no-tabs-trigger">
              <Smartphone className="h-4 w-4" /> User Preference Sync
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Routing Engine */}
        <TabsContent value="rules" className="mt-3">
          {/* Filter card */}
          <div
            className="bg-white p-3 mb-3"
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="d-flex flex-nowrap align-items-center gap-2 w-100" style={{ overflow: "visible" }}>
              <AntInput
                allowClear
                placeholder="Filter orchestration rules..."
                prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ flex: "1 1 auto", minWidth: 0, borderRadius: 8, height: 40 }}
              />
              <AntSelect
                value={channelFilter}
                onChange={(v) => { setChannelFilter(v); setCurrentPage(1); }}
                popupClassName="no-select-popup"
                style={{ width: 180, height: 40, flexShrink: 0 }}
                options={[
                  { value: "ALL", label: "All Channels" },
                  ...CHANNEL_OPTIONS,
                ]}
              />
              <Button
                className="gap-2 uo-btn-black"
                onClick={openAddModal}
                style={{ height: 40, borderRadius: 8, flexShrink: 0, whiteSpace: "nowrap" }}
              >
                <Plus className="h-4 w-4" />
                Create New Rule
              </Button>
            </div>
          </div>

          {/* Rules table card */}
          <div
            className="bg-white"
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            <table className="no-table">
              <thead>
                <tr>
                  <th>Orchestration Rule</th>
                  <th>Event Context</th>
                  <th>Channel Path</th>
                  <th>Priority</th>
                  <th className="text-center">Active</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ padding: 32 }}>
                      <Spin />
                    </td>
                  </tr>
                ) : pagedRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted" style={{ padding: 36 }}>
                      No rules found. Create one to begin orchestration.
                    </td>
                  </tr>
                ) : (
                  pagedRules.map((rule) => (
                    <tr key={rule.id}>
                      <td>
                        <div className="fw-semibold" style={{ color: "var(--foreground)" }}>
                          {rule.ruleName}
                        </div>
                        <div className="font-monospace" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                          {rule.ruleCode}
                        </div>
                      </td>
                      <td>
                        <span className="no-context-chip">{rule.eventType || "-"}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="no-channel-icon">{channelIcon(rule.channel)}</span>
                          <span className="fw-medium" style={{ fontSize: 13 }}>{rule.channel}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="no-priority-pill"
                          style={{ backgroundColor: priorityColor(rule.priority), color: "var(--primary-foreground)" }}
                        >
                          {rule.priority || "NORMAL"}
                        </span>
                      </td>
                      <td className="text-center">
                        <Switch checked={!!rule.active} size="small" />
                      </td>
                      <td className="text-right">
                        <div className="d-inline-flex gap-2">
                          <Tooltip title="Edit">
                            <button
                              className="no-icon-btn"
                              onClick={() => openEditModal(rule)}
                              type="button"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <button
                              className="no-icon-btn no-icon-btn-danger"
                              onClick={() => setDeleteTarget(rule)}
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {filteredRules.length > PAGE_SIZE && (
              <div className="no-pagination-row">
                <span className="no-pagination-info">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredRules.length)} of{" "}
                  {filteredRules.length} rules
                </span>
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  total={filteredRules.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* User Preference Sync */}
        <TabsContent value="preferences" className="mt-3">
          <div
            className="bg-white p-3 mb-3"
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="d-flex flex-wrap align-items-center gap-2 w-100">
              <AntInput
                allowClear
                placeholder="Enter customer ID..."
                prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={{ flex: "1 1 280px", minWidth: 220, borderRadius: 8, height: 40 }}
              />
              <Button
                className="uo-btn-black"
                onClick={fetchPreferences}
                style={{ height: 40, borderRadius: 8 }}
              >
                Lookup
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white p-5 text-center" style={{ borderRadius: 12, border: "1px solid var(--border)" }}>
              <Spin />
            </div>
          ) : preferences ? (
            <div
              className="bg-white p-3"
              style={{
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="d-flex align-items-center gap-3 pb-3 mb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="no-avatar">
                  {preferences.customerId?.charAt(0).toUpperCase() || "C"}
                </div>
                <div>
                  <div className="text-muted small" style={{ letterSpacing: 0.4, textTransform: "uppercase" }}>Customer ID</div>
                  <div className="font-monospace" style={{ fontSize: 13, color: "var(--foreground)" }}>
                    {preferences.customerId}
                  </div>
                </div>
              </div>
              <div className="d-flex flex-column gap-2">
                {[
                  { label: "SMS Gateway", icon: MessageSquare, key: "smsEnabled" },
                  { label: "Email Server", icon: Mail, key: "emailEnabled" },
                  { label: "Push Notifications", icon: Bell, key: "pushEnabled" },
                ].map((channel) => (
                  <div key={channel.key} className="no-pref-row">
                    <div className="d-flex align-items-center gap-3">
                      <span className="no-channel-icon">
                        <channel.icon className="h-4 w-4" />
                      </span>
                      <span className="fw-semibold" style={{ color: "var(--foreground)" }}>{channel.label}</span>
                    </div>
                    <Switch
                      checked={!!preferences[channel.key]}
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
            </div>
          ) : (
            <div className="bg-white p-5 text-center text-muted" style={{ borderRadius: 12, border: "1px solid var(--border)" }}>
              Enter a customer ID and click <strong>Lookup</strong> to view their preferences.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Rule Modal */}
      <Modal
        show={isRuleModalOpen}
        onHide={() => setIsRuleModalOpen(false)}
        centered
        size="lg"
        className="no-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingRule ? "Update Routing Rule" : "Create New Routing Rule"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Rule Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={rulePayload.ruleName}
                    onChange={(e) => setRulePayload({ ...rulePayload, ruleName: e.target.value })}
                    placeholder="e.g. Auth OTP via SMS"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Event Type *</Form.Label>
                  <AntSelect
                    showSearch
                    value={rulePayload.eventType || undefined}
                    placeholder="Select trigger event"
                    onChange={(v) => setRulePayload({ ...rulePayload, eventType: v })}
                    className="no-form-select"
                    popupClassName="no-select-popup"
                    style={{ width: "100%" }}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                    }
                    options={(Array.isArray(eventTypes) ? eventTypes : []).map((e) => {
                      if (typeof e === "string") return { value: e, label: e };
                      return { value: e.code ?? e.value, label: e.name ?? e.label ?? e.code ?? e.value };
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Delivery Channel *</Form.Label>
                  <AntSelect
                    value={rulePayload.channel}
                    onChange={(v) => setRulePayload({ ...rulePayload, channel: v })}
                    className="no-form-select"
                    popupClassName="no-select-popup"
                    style={{ width: "100%" }}
                    options={CHANNEL_OPTIONS}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Rule Code (auto)</Form.Label>
                  <Form.Control
                    type="text"
                    value={rulePayload.ruleCode}
                    readOnly
                    placeholder="Generated from event + channel"
                    className="font-monospace"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Novu Template *</Form.Label>
                  <AntSelect
                    showSearch
                    value={rulePayload.novuTemplateId || undefined}
                    placeholder="Search Novu templates..."
                    onChange={(v) => setRulePayload({ ...rulePayload, novuTemplateId: v })}
                    className="no-form-select"
                    popupClassName="no-select-popup"
                    style={{ width: "100%" }}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                    }
                    options={(Array.isArray(templates) ? templates : []).map((t) => ({
                      value: t._id ?? t.id ?? t.identifier,
                      label: t.name ?? t.identifier ?? t._id ?? t.id,
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Radio.Group
                    value={rulePayload.priority}
                    onChange={(e) => setRulePayload({ ...rulePayload, priority: e.target.value })}
                    optionType="button"
                    buttonStyle="solid"
                    options={PRIORITY_OPTIONS}
                    className="no-priority-group"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="no-warning-box">
              <AlertTriangle className="no-warning-icon" />
              <div className="no-warning-text">
                <div className="no-warning-title">Heads up</div>
                <div className="no-warning-body">
                  Saved rules go live on the gateway immediately. Double-check the channel and template — wrong mappings can drop critical notifications.
                </div>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline"
            onClick={() => setIsRuleModalOpen(false)}
            className="no-btn-cancel"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveRule} disabled={isLoading} className="uo-btn-black">
            {isLoading ? "Saving..." : editingRule ? "Update Rule" : "Create Rule"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        centered
        className="no-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Routing Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.ruleName || deleteTarget?.ruleCode}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setDeleteTarget(null)} className="no-btn-cancel" disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .notification-orchestrator-page .stat-row {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        @media (max-width: 575.98px) {
          .notification-orchestrator-page .stat-row {
            grid-template-columns: 1fr;
          }
        }
        .notification-orchestrator-page .stat-tile {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          text-align: left;
        }
        .notification-orchestrator-page .stat-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--muted-foreground);
        }
        .notification-orchestrator-page .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--foreground);
          margin-top: 2px;
        }
        .notification-orchestrator-page .no-tabs-row {
          border-bottom: 1px solid var(--border);
          margin-bottom: 4px;
        }
        .notification-orchestrator-page .no-tabs-list {
          background: transparent !important;
          padding: 0;
          border-radius: 0;
          height: auto;
          gap: 0;
          justify-content: flex-start;
          width: auto;
        }
        .notification-orchestrator-page .no-tabs-trigger {
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          color: var(--muted-foreground) !important;
          padding: 10px 16px !important;
          font-weight: 500;
          font-size: 14px;
          box-shadow: none !important;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .notification-orchestrator-page .no-tabs-trigger:hover {
          color: var(--foreground) !important;
        }
        .notification-orchestrator-page .no-tabs-trigger[data-state="active"] {
          background: transparent !important;
          color: var(--primary) !important;
        }
        .notification-orchestrator-page .no-tabs-trigger[data-state="active"]::after {
          content: "";
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: -1px;
          height: 2px;
          background-color: var(--primary);
        }

        .notification-orchestrator-page .no-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .notification-orchestrator-page .no-table thead tr {
          background-color: var(--theme-table-background-color);
        }
        .notification-orchestrator-page .no-table thead th {
          color: #ffffff !important;
          font-weight: 600;
          font-size: 13px;
          padding: 12px 14px;
          text-align: left;
        }
        .notification-orchestrator-page .no-table thead th.text-center { text-align: center; }
        .notification-orchestrator-page .no-table thead th.text-right { text-align: right; }
        .notification-orchestrator-page .no-table tbody tr {
          background: #fff;
          transition: background-color 0.15s ease;
        }
        .notification-orchestrator-page .no-table tbody tr:nth-child(even) {
          background: var(--muted, #f7f7f8);
        }
        .notification-orchestrator-page .no-table tbody tr:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        .notification-orchestrator-page .no-table tbody td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
          font-size: 13px;
          color: var(--foreground);
        }
        .notification-orchestrator-page .no-table tbody tr:last-child td { border-bottom: none; }
        .notification-orchestrator-page .no-table .text-center { text-align: center; }
        .notification-orchestrator-page .no-table .text-right { text-align: right; }

        .notification-orchestrator-page .no-context-chip {
          display: inline-block;
          padding: 3px 8px;
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
          color: var(--foreground);
        }
        .notification-orchestrator-page .no-channel-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--muted);
          color: var(--foreground);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .notification-orchestrator-page .no-priority-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 32px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.4px;
        }
        .notification-orchestrator-page .no-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: #fff;
          color: var(--foreground);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .notification-orchestrator-page .no-icon-btn:hover {
          background: var(--muted);
        }
        .notification-orchestrator-page .no-icon-btn-danger:hover {
          color: var(--color-error);
          border-color: var(--color-error);
          background: #fff;
        }

        .notification-orchestrator-page .no-avatar {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--muted);
          color: var(--foreground);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
        }
        .notification-orchestrator-page .no-pref-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: #fff;
          transition: background 0.15s ease;
        }
        .notification-orchestrator-page .no-pref-row:hover {
          background: var(--muted);
        }

        .notification-orchestrator-page .uo-btn-black,
        .notification-orchestrator-page .uo-btn-black:hover {
          background-color: #000 !important;
          border-color: #000 !important;
          color: #fff !important;
        }
        .notification-orchestrator-page .uo-btn-black svg { color: #fff; }

        /* Modal styling (shared) */
        .no-modal .modal-content {
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }
        .no-modal .modal-header {
          padding: 18px 22px;
          border-bottom: 1px solid var(--border);
          background: #fff;
        }
        .no-modal .modal-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--foreground);
        }
        .no-modal .modal-body {
          padding: 20px 22px;
          background: #fff;
        }
        .no-modal .modal-footer {
          padding: 14px 22px 18px;
          border-top: 1px solid var(--border);
          gap: 8px;
        }
        .no-modal .form-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 6px;
        }
        .no-modal .form-control {
          height: 42px;
          border-radius: 8px !important;
          border: 1px solid var(--border) !important;
          font-size: 14px;
          padding: 8px 12px;
          background: #fff;
        }
        .no-modal .form-control:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06) !important;
        }
        .no-modal .no-form-select .ant-select-selector {
          height: 42px !important;
          border-radius: 8px !important;
          padding: 4px 12px !important;
          border: 1px solid var(--border) !important;
          background-color: #ffffff !important;
        }
        .no-modal .no-form-select .ant-select-selection-item {
          line-height: 32px !important;
          color: var(--foreground, #0f172a) !important;
          font-size: 14px;
        }
        .no-modal .no-form-select .ant-select-selection-search-input {
          height: 32px !important;
          color: var(--foreground, #0f172a) !important;
        }
        .no-modal .no-form-select .ant-select-selection-placeholder {
          color: var(--muted-foreground, #64748b) !important;
          line-height: 32px !important;
        }
        .no-modal .no-warning-box {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-left: 4px solid #f59e0b;
          border-radius: 10px;
        }
        .no-modal .no-warning-icon {
          width: 18px;
          height: 18px;
          color: #b45309;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .no-modal .no-warning-text { line-height: 1.45; }
        .no-modal .no-warning-title {
          font-size: 13px;
          font-weight: 700;
          color: #b45309;
          margin-bottom: 2px;
          letter-spacing: 0.2px;
        }
        .no-modal .no-warning-body {
          font-size: 13px;
          color: #92400e;
        }

        /* Portaled select dropdown (rendered to document.body — must be global) */
        .no-select-popup.ant-select-dropdown {
          background-color: #ffffff !important;
          border: 1px solid var(--border, #e2e8f0) !important;
          border-radius: 10px !important;
          padding: 6px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10) !important;
          z-index: 1200 !important;
        }
        .no-select-popup .ant-select-item {
          color: var(--foreground, #0f172a) !important;
          font-size: 14px !important;
          padding: 8px 12px !important;
          border-radius: 6px !important;
          line-height: 1.4 !important;
        }
        .no-select-popup .ant-select-item-option-active {
          background-color: var(--muted, #f1f5f9) !important;
          color: var(--foreground, #0f172a) !important;
        }
        .no-select-popup .ant-select-item-option-selected {
          background-color: #000000 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        .no-select-popup .ant-select-item-empty {
          color: var(--muted-foreground, #64748b) !important;
        }

        /* Priority radio group — black active state */
        .no-modal .no-priority-group {
          display: flex !important;
          flex-wrap: wrap;
          gap: 8px;
        }
        .no-modal .no-priority-group .ant-radio-button-wrapper {
          height: 38px;
          line-height: 36px;
          padding: 0 18px;
          border-radius: 8px !important;
          border: 1px solid var(--border) !important;
          background: #ffffff !important;
          color: var(--foreground) !important;
          font-weight: 500;
          font-size: 13px;
        }
        .no-modal .no-priority-group .ant-radio-button-wrapper::before {
          display: none;
        }
        .no-modal .no-priority-group .ant-radio-button-wrapper:hover {
          background: var(--muted) !important;
          color: var(--foreground) !important;
        }
        .no-modal .no-priority-group .ant-radio-button-wrapper-checked,
        .no-modal .no-priority-group .ant-radio-button-wrapper-checked:hover {
          background: #000000 !important;
          border-color: #000000 !important;
          color: #ffffff !important;
          box-shadow: none !important;
        }
        .no-modal .no-btn-cancel,
        .no-modal .no-btn-cancel:hover {
          background-color: #fff !important;
          color: var(--foreground) !important;
          border: 1px solid var(--border) !important;
        }

        /* Pagination row */
        .notification-orchestrator-page .no-pagination-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-top: 1px solid var(--border);
          background: #fff;
        }
        .notification-orchestrator-page .no-pagination-info {
          font-size: 13px;
          color: var(--muted-foreground);
        }
        .notification-orchestrator-page .no-pagination-row .ant-pagination-item-active {
          background: #000 !important;
          border-color: #000 !important;
        }
        .notification-orchestrator-page .no-pagination-row .ant-pagination-item-active a {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default NotificationOrchestrator;
