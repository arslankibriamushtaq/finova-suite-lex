import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Plus,
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
  Dropdown,
  Menu,
  Button as AntButton,
} from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { toast } from "react-hot-toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import TableView from "../../../components/TableView/TableView";
import arrowDown from "../../../assets/images/arrow-down.png";
import "./NotificationOrchestrator.css";

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
  const { t } = useTranslation("notifications");
  const priorityOptionsL = PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: t(`orch.priority.${o.value}`) }));
  const channelOptionsL = CHANNEL_OPTIONS.map((o) => ({ value: o.value, label: t(`orch.channelOpt.${o.value}`) }));
  const [activeTab, setActiveTab] = useState<"rules" | "preferences">("rules");
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [routingRules, setRoutingRules] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      return toast.error(t("orch.toast.fillRequired"));
    }

    try {
      setIsLoading(true);
      const payload = { ...rulePayload, tenantId: TENANT_ID };
      if (editingRule) {
        await updateNotificationRule(editingRule.id, payload);
        toast.success(t("orch.toast.ruleUpdated"));
      } else {
        await createNotificationRule(payload);
        toast.success(t("orch.toast.ruleCreated"));
      }
      setIsRuleModalOpen(false);
      fetchRulesData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("orch.toast.saveFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteNotificationRule(deleteTarget.id);
      toast.success(t("orch.toast.ruleDeleted"));
      setDeleteTarget(null);
      fetchRulesData();
    } catch {
      toast.error(t("orch.toast.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchPreferences = async () => {
    if (!customerId.trim()) return toast.error(t("orch.toast.enterCustomerId"));
    try {
      setIsLoading(true);
      const res = await getCustomerPreferences(customerId.trim());    
      setPreferences(res.data?.data || null);
    } catch {
      toast.error(t("orch.toast.noPreferences"));
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
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const channelIcon = (channel: string) => {
    if (channel === "SMS") return <MessageSquare className="h-4 w-4" />;
    if (channel === "WHATSAPP") return <Smartphone className="h-4 w-4" />;
    if (channel === "EMAIL") return <Mail className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const ruleActionMenu = (rule: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => openEditModal(rule)}
      >
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => setDeleteTarget(rule)}
      >
        {t("common:delete")}
      </Menu.Item>
    </Menu>
  );

  const ruleColumns = [
    {
      name: t("orch.col.rule"),
      selector: (row: any) => row.ruleName,
      cell: (row: any) => (
        <div>
          <div className="fw-semibold" style={{ color: "var(--foreground)" }}>
            {row.ruleName}
          </div>
          <div
            className="font-monospace"
            style={{ fontSize: 11, color: "var(--muted-foreground)" }}
          >
            {row.ruleCode}
          </div>
        </div>
      ),
      sortable: true,
      wrap: true,
    },
    {
      name: t("orch.col.eventContext"),
      cell: (row: any) => (
        <span className="no-context-chip">{row.eventType || "-"}</span>
      ),
    },
    {
      name: t("orch.col.channelPath"),
      cell: (row: any) => (
        <div className="d-flex align-items-center gap-2">
          <span className="no-channel-icon">{channelIcon(row.channel)}</span>
          <span className="fw-medium" style={{ fontSize: 13 }}>
            {row.channel}
          </span>
        </div>
      ),
    },
    {
      name: t("orch.col.priority"),
      cell: (row: any) => (
        <span
          className="no-priority-pill"
          style={{
            backgroundColor: priorityColor(row.priority),
            color: "var(--primary-foreground)",
          }}
        >
          {t(`orch.priority.${(row.priority || "NORMAL")}`)}
        </span>
      ),
    },
    {
      name: t("common:active"),
      center: true,
      cell: (row: any) => <Switch checked={!!row.active} size="small" />,
    },
    {
      name: t("common:actions"),
      cell: (row: any) => (
        <Dropdown overlay={ruleActionMenu(row)} trigger={["click"]}>
          <AntButton
            className="gradient-btn"
            type="primary"
            style={{
              borderRadius: "2px",
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {t("common:select")} <img src={arrowDown} alt="" />
          </AntButton>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="service notification-orchestrator-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="no-head-badge">
            <Activity className="h-4 w-4" />
          </span>
          {t("orch.title")}
        </h3>
        <p className="text-muted small mb-0 mt-1">
          {t("orch.subtitle")}
        </p>
      </div>

      <div className="stat-row mb-3">
        <div className="stat-tile">
          <div className="stat-label">{t("orch.stat.totalRules")}</div>
          <div className="stat-value">{routingRules.length}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">{t("orch.stat.systemHealth")}</div>
          <div className="stat-value" style={{ color: "var(--color-success)" }}>99%</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="no-tabs-row">
          <TabsList className="no-tabs-list">
            <TabsTrigger value="rules" className="no-tabs-trigger">
              <Settings className="h-4 w-4" /> {t("orch.tab.routingEngine")}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="no-tabs-trigger">
              <Smartphone className="h-4 w-4" /> {t("orch.tab.userPrefSync")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Routing Engine */}
        <TabsContent value="rules" className="mt-3">
          {/* Filter card */}
          <div className="no-card p-3 mb-3">
            <div className="d-flex flex-nowrap align-items-center gap-2 w-100" style={{ overflow: "visible" }}>
              <AntInput
                allowClear
                placeholder={t("orch.filterPh")}
                prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ flex: "1 1 auto", minWidth: 0, borderRadius: 2, height: 40 }}
              />
              <AntSelect
                value={channelFilter}
                onChange={(v) => { setChannelFilter(v); setCurrentPage(1); }}
                popupClassName="no-select-popup"
                style={{ width: 180, height: 40, flexShrink: 0 }}
                options={[
                  { value: "ALL", label: t("orch.allChannels") },
                  ...channelOptionsL,
                ]}
              />
              <Button
                className="gap-2 uo-btn-black"
                onClick={openAddModal}
                style={{ height: 40, borderRadius: 2, flexShrink: 0, whiteSpace: "nowrap" }}
              >
                <Plus className="h-4 w-4" />
                {t("orch.createNewRule")}
              </Button>
            </div>
          </div>

          {/* Rules table card */}
          <div className="no-card">
            <TableView
              header={ruleColumns}
              data={pagedRules}
              isLoading={isLoading}
              totalRows={filteredRules.length}
              page={currentPage}
              setPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={(size: number) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              totalPage={Math.max(1, Math.ceil(filteredRules.length / pageSize))}
              from={filteredRules.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              to={Math.min(currentPage * pageSize, filteredRules.length)}
              paginationShow={filteredRules.length > 0}
            />
          </div>
        </TabsContent>

        {/* User Preference Sync */}
        <TabsContent value="preferences" className="mt-3">
          <div className="no-card p-3 mb-3">
            <div className="d-flex flex-wrap align-items-center gap-2 w-100">
              <AntInput
                allowClear
                placeholder={t("orch.customerIdPh")}
                prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={{ flex: "1 1 280px", minWidth: 220, borderRadius: 2, height: 40 }}
              />
              <Button
                className="uo-btn-black"
                onClick={fetchPreferences}
                style={{ height: 40, borderRadius: 2 }}
              >
                {t("orch.lookup")}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="no-card p-5 text-center">
              <Spin />
            </div>
          ) : preferences ? (
            <div className="no-card p-3">
              <div className="d-flex align-items-center gap-3 pb-3 mb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="no-avatar">
                  {preferences.customerId?.charAt(0).toUpperCase() || "C"}
                </div>
                <div>
                  <div className="text-muted small" style={{ letterSpacing: 0.4, textTransform: "uppercase" }}>{t("orch.customerId")}</div>
                  <div className="font-monospace" style={{ fontSize: 13, color: "var(--foreground)" }}>
                    {preferences.customerId}
                  </div>
                </div>
              </div>
              <div className="d-flex flex-column gap-2">
                {[
                  { label: t("orch.pref.smsGateway"), icon: MessageSquare, key: "smsEnabled" },
                  { label: t("orch.pref.emailServer"), icon: Mail, key: "emailEnabled" },
                  { label: t("orch.pref.pushNotifications"), icon: Bell, key: "pushEnabled" },
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
                        toast.success(t("orch.prefUpdated", { label: channel.label }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-card p-5 text-center text-muted">
              {t("orch.hintPre")}<strong>{t("orch.lookup")}</strong>{t("orch.hintPost")}
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
          <Modal.Title>{editingRule ? t("orch.modal.editTitle") : t("orch.modal.addTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("orch.label.ruleName")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={rulePayload.ruleName}
                    onChange={(e) => setRulePayload({ ...rulePayload, ruleName: e.target.value })}
                    placeholder={t("orch.ph.ruleName")}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("orch.label.eventType")}</Form.Label>
                  <AntSelect
                    showSearch
                    value={rulePayload.eventType || undefined}
                    placeholder={t("orch.ph.eventType")}
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
                  <Form.Label>{t("orch.label.channel")}</Form.Label>
                  <AntSelect
                    value={rulePayload.channel}
                    onChange={(v) => setRulePayload({ ...rulePayload, channel: v })}
                    className="no-form-select"
                    popupClassName="no-select-popup"
                    style={{ width: "100%" }}
                    options={channelOptionsL}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("orch.label.ruleCode")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={rulePayload.ruleCode}
                    readOnly
                    placeholder={t("orch.ph.ruleCode")}
                    className="font-monospace"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("orch.label.novuTemplate")}</Form.Label>
                  <AntSelect
                    showSearch
                    value={rulePayload.novuTemplateId || undefined}
                    placeholder={t("orch.ph.novuTemplate")}
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
                  <Form.Label>{t("orch.label.priority")}</Form.Label>
                  <Radio.Group
                    value={rulePayload.priority}
                    onChange={(e) => setRulePayload({ ...rulePayload, priority: e.target.value })}
                    optionType="button"
                    buttonStyle="solid"
                    options={priorityOptionsL}
                    className="no-priority-group"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="no-warning-box">
              <AlertTriangle className="no-warning-icon" />
              <div className="no-warning-text">
                <div className="no-warning-title">{t("orch.warn.title")}</div>
                <div className="no-warning-body">
                  {t("orch.warn.body")}
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
            {t("common:cancel")}
          </Button>
          <Button onClick={handleSaveRule} disabled={isLoading} className="uo-btn-black">
            {isLoading ? t("shared.saving") : editingRule ? t("orch.btn.updateRule") : t("orch.btn.createRule")}
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
          <Modal.Title>{t("orch.delete.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("orch.delete.confirmPre")}
          <strong>{deleteTarget?.ruleName || deleteTarget?.ruleCode}</strong>{t("orch.delete.confirmPost")}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setDeleteTarget(null)} className="no-btn-cancel" disabled={isDeleting}>
            {t("common:cancel")}
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? t("shared.deleting") : t("common:delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NotificationOrchestrator;
