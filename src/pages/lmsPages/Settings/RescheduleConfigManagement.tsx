import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Input, Menu } from "antd";
import { usePermissions, POLICY_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { SearchOutlined } from "@ant-design/icons";
import { CalendarClock } from "lucide-react";
import { Col, Form, Modal, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  DownOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import TableView from "../../../components/TableView/TableView";
import {
  getRescheduleConfigs,
  updateRescheduleConfig,
} from "../../../redux/apis/apisLendingService";

const APPROVER_OPTIONS = [
  { label: "None", value: "" },
  { label: "Operations Head", value: "OPERATIONS_HEAD" },
  { label: "Credit Committee", value: "CREDIT_COMMITTEE" },
  { label: "Risk Committee", value: "RISK_COMMITTEE" },
  { label: "Branch Manager", value: "BRANCH_MANAGER" },
];

const FIELD_TYPE_OPTIONS = [
  "INTEGER",
  "DECIMAL",
  "TEXT",
  "DATE",
  "BOOLEAN",
  "SELECT",
  "ATTACHMENT",
];

const safeParseJson = <T,>(raw: any, fallback: T): T => {
  if (raw == null) return fallback;
  if (typeof raw === "object") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const stringifyForDisplay = (raw: any) => {
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  try {
    return JSON.stringify(raw, null, 2);
  } catch {
    return String(raw);
  }
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-";

interface FieldConfig {
  name: string;
  type: string;
  label?: string;
  labelAr?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  unit?: string;
  validation?: any;
  options?: any[];
  showWhen?: string;
  conditional?: boolean;
}

interface FormState {
  id: string;
  rescheduleType: string;
  labelEn: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
  active: boolean;
  requiresApproval: boolean;
  approverRole: string;
  fields: FieldConfig[];
  rulesConfigText: string;
}

const emptyField: FieldConfig = {
  name: "",
  type: "TEXT",
  label: "",
  labelAr: "",
  required: false,
};

const RescheduleConfigManagement = () => {
  const { t } = useTranslation("settings");
  const { hasPermission } = usePermissions();
  const canEditPolicy = hasPermission(POLICY_PERMISSIONS.EDIT);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search so we don't refilter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getRescheduleConfigs();
      const list = response?.data?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("reschedule.toast.fetchFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (row: any) => {
    setForm({
      id: row.id,
      rescheduleType: row.rescheduleType || "",
      labelEn: row.labelEn || "",
      labelAr: row.labelAr || "",
      descriptionEn: row.descriptionEn || "",
      descriptionAr: row.descriptionAr || "",
      active: !!row.active,
      requiresApproval: !!row.requiresApproval,
      approverRole: row.approverRole || "",
      fields: safeParseJson<FieldConfig[]>(row.fieldsConfig, []),
      rulesConfigText: stringifyForDisplay(
        safeParseJson<any>(row.rulesConfig, {})
      ),
    });
    setErrors({});
    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setForm(null);
    setErrors({});
  };

  const setFormValue = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateField = (index: number, patch: Partial<FieldConfig>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = [...prev.fields];
      next[index] = { ...next[index], ...patch };
      return { ...prev, fields: next };
    });
  };

  const addField = () => {
    setForm((prev) =>
      prev ? { ...prev, fields: [...prev.fields, { ...emptyField }] } : prev
    );
  };

  const removeField = (index: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = prev.fields.filter((_, i) => i !== index);
      return { ...prev, fields: next };
    });
  };

  const handleFieldDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    setForm((prev) => {
      if (!prev) return prev;
      const next = [...prev.fields];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...prev, fields: next };
    });
  };

  const validate = (state: FormState) => {
    const e: Record<string, string> = {};
    if (!state.labelEn.trim()) e.labelEn = t("reschedule.val.labelEn");
    if (!state.rescheduleType.trim())
      e.rescheduleType = t("reschedule.val.rescheduleType");
    state.fields.forEach((f, i) => {
      if (!f.name.trim()) e[`field_${i}_name`] = t("reschedule.val.fieldName");
      if (!f.type.trim()) e[`field_${i}_type`] = t("reschedule.val.fieldType");
    });
    if (state.rulesConfigText.trim()) {
      try {
        JSON.parse(state.rulesConfigText);
      } catch {
        e.rulesConfigText = t("reschedule.val.rulesJson");
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!form) return;
    if (!validate(form)) {
      toast.error(t("reschedule.toast.fixErrors"));
      return;
    }
    const payload = {
      labelEn: form.labelEn,
      labelAr: form.labelAr,
      descriptionEn: form.descriptionEn,
      descriptionAr: form.descriptionAr,
      requiresApproval: form.requiresApproval,
      approverRole: form.requiresApproval ? form.approverRole || null : null,
      fieldsConfig: form.fields,
      rulesConfig: form.rulesConfigText.trim()
        ? JSON.parse(form.rulesConfigText)
        : {},
    };
    try {
      setSaving(true);
      await updateRescheduleConfig(form.rescheduleType, payload);
      toast.success(t("reschedule.toast.updated"));
      closeEdit();
      fetchData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("reschedule.toast.updateFailed")
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      name: t("common:type"),
      selector: (row: any) => row.rescheduleType?.replace(/_/g, " ") || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: t("reschedule.col.labelEn"),
      selector: (row: any) => row.labelEn || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: t("reschedule.col.labelAr"),
      selector: (row: any) => row.labelAr || "-",
      width: "160px",
    },
    {
      name: t("common:description"),
      cell: (row: any) => (
        <span
          title={row.descriptionEn || ""}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: 12,
          }}
        >
          {row.descriptionEn || "-"}
        </span>
      ),
      width: "260px",
    },
    {
      name: t("common:active"),
      cell: (row: any) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 32,
            fontSize: 12,
            fontWeight: 500,
            backgroundColor: row.active
              ? "var(--color-status-green)"
              : "var(--color-status-coral)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.active ? t("common:active") : t("common:inactive")}
        </span>
      ),
      width: "110px",
    },
    {
      name: t("reschedule.col.approval"),
      cell: (row: any) => (
        <span style={{ fontSize: 12 }}>
          {row.requiresApproval
            ? row.approverRole?.replace(/_/g, " ") || t("reschedule.required")
            : t("reschedule.notRequired")}
        </span>
      ),
      width: "180px",
    },
    {
      name: t("reschedule.col.updated"),
      selector: (row: any) => formatDate(row.updatedAt),
      width: "180px",
    },
    {
      name: t("reschedule.col.action"),
      cell: (row: any) =>
        !canEditPolicy ? (
          <span className="text-muted">-</span>
        ) : (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => openEdit(row)}
              >
                {t("common:edit")}
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("common:select")} <DownOutlined />
          </Button>
        </Dropdown>
        ),
      width: "140px",
    },
  ];

  // Client-side pagination
  // Free-text filter applied client-side
  const filteredData = (() => {
    if (!debouncedSearch) return data;
    const term = debouncedSearch.toLowerCase();
    return data.filter((row: any) =>
      String(row.rescheduleType || "").toLowerCase().includes(term) ||
      String(row.labelEn || "").toLowerCase().includes(term) ||
      String(row.labelAr || "").toLowerCase().includes(term) ||
      String(row.descriptionEn || "").toLowerCase().includes(term) ||
      String(row.approverRole || "").toLowerCase().includes(term) ||
      String(row.active ? "active" : "inactive").includes(term)
    );
  })();

  const total = filteredData.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const fromRow = total > 0 ? startIndex + 1 : 0;
  const toRow = Math.min(startIndex + pageSize, total);
  const totalPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="service rescheduling-config-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <CalendarClock className="h-4 w-4" />
          </span>
          {t("reschedule.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("reschedule.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={columns}
          data={paginatedData}
          totalRows={total}
          isLoading={loading}
          from={fromRow}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={toRow}
          paginationShow={true}
        />
      </div>

      <Modal backdrop="static" keyboard={false} show={showEdit} onHide={closeEdit} centered size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{t("reschedule.modal.editTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {form && (
            <Form>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>{t("reschedule.field.rescheduleType")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.rescheduleType}
                      onChange={(e) =>
                        setFormValue("rescheduleType", e.target.value)
                      }
                      isInvalid={!!errors.rescheduleType}
                      placeholder={t("reschedule.ph.rescheduleType")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.rescheduleType}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>{t("reschedule.field.approverRole")}</Form.Label>
                    <Form.Select
                      value={form.approverRole}
                      onChange={(e) =>
                        setFormValue("approverRole", e.target.value)
                      }
                      disabled={!form.requiresApproval}
                    >
                      {APPROVER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>{t("reschedule.field.labelEn")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.labelEn}
                      onChange={(e) => setFormValue("labelEn", e.target.value)}
                      isInvalid={!!errors.labelEn}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.labelEn}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>{t("reschedule.field.labelAr")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.labelAr}
                      onChange={(e) => setFormValue("labelAr", e.target.value)}
                      dir="rtl"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>{t("reschedule.field.descEn")}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={form.descriptionEn}
                      onChange={(e) =>
                        setFormValue("descriptionEn", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>{t("reschedule.field.descAr")}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={form.descriptionAr}
                      onChange={(e) =>
                        setFormValue("descriptionAr", e.target.value)
                      }
                      dir="rtl"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Check
                    type="switch"
                    id="active-switch"
                    label={t("common:active")}
                    checked={form.active}
                    onChange={(e) => setFormValue("active", e.target.checked)}
                  />
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Check
                    type="switch"
                    id="requiresApproval-switch"
                    label={t("reschedule.field.requiresApproval")}
                    checked={form.requiresApproval}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              requiresApproval: checked,
                              approverRole: checked ? prev.approverRole : "",
                            }
                          : prev
                      );
                    }}
                  />
                </Col>
              </Row>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">{t("reschedule.fieldsConfig")}</h6>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addField}
                  size="small"
                >
                  {t("reschedule.addField")}
                </Button>
              </div>

              {form.fields.length === 0 && (
                <div
                  style={{
                    padding: 16,
                    background: "var(--muted)",
                    borderRadius: 2,
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--muted-foreground)",
                  }}
                >
                  {t("reschedule.noFields")}
                </div>
              )}

              <DragDropContext onDragEnd={handleFieldDragEnd}>
                <Droppable droppableId="fields-droppable">
                  {(dropProvided) => (
                    <div
                      ref={dropProvided.innerRef}
                      {...dropProvided.droppableProps}
                    >
                      {form.fields.map((f, i) => (
                        <Draggable
                          key={`field-${i}`}
                          draggableId={`field-${i}`}
                          index={i}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              style={{
                                border: "1px solid var(--border)",
                                borderRadius: 2,
                                padding: 12,
                                marginBottom: 12,
                                background: dragSnapshot.isDragging
                                  ? "var(--muted)"
                                  : "var(--background)",
                                boxShadow: dragSnapshot.isDragging
                                  ? "0 4px 12px rgba(0,0,0,0.12)"
                                  : "none",
                                ...dragProvided.draggableProps.style,
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    {...dragProvided.dragHandleProps}
                                    title={t("reschedule.dragToReorder")}
                                    style={{
                                      cursor: "grab",
                                      color: "var(--muted-foreground)",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      padding: "2px 4px",
                                    }}
                                  >
                                    <HolderOutlined />
                                  </span>
                                  <strong style={{ fontSize: 13 }}>
                                    {t("reschedule.fieldNum", { num: i + 1 })}
                                  </strong>
                                </div>
                                <Button
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => removeField(i)}
                                >
                                  {t("common:remove")}
                                </Button>
                              </div>
                  <Row>
                    <Col md={4} className="mb-2">
                      <Form.Label style={{ fontSize: 12 }}>{t("common:name")} *</Form.Label>
                      <Form.Control
                        size="sm"
                        value={f.name}
                        onChange={(e) =>
                          updateField(i, { name: e.target.value })
                        }
                        isInvalid={!!errors[`field_${i}_name`]}
                      />
                    </Col>
                    <Col md={4} className="mb-2">
                      <Form.Label style={{ fontSize: 12 }}>{t("common:type")} *</Form.Label>
                      <Form.Select
                        size="sm"
                        value={f.type}
                        onChange={(e) =>
                          updateField(i, { type: e.target.value })
                        }
                      >
                        {FIELD_TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={4} className="mb-2 d-flex align-items-end">
                      <Form.Check
                        type="checkbox"
                        label={t("common:required")}
                        checked={!!f.required}
                        onChange={(e) =>
                          updateField(i, { required: e.target.checked })
                        }
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <Form.Label style={{ fontSize: 12 }}>
                        {t("reschedule.field.labelEn")}
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={f.label || ""}
                        onChange={(e) =>
                          updateField(i, { label: e.target.value })
                        }
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <Form.Label style={{ fontSize: 12 }}>
                        {t("reschedule.field.labelAr")}
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={f.labelAr || ""}
                        onChange={(e) =>
                          updateField(i, { labelAr: e.target.value })
                        }
                        dir="rtl"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <Form.Label style={{ fontSize: 12 }}>
                        {t("reschedule.field.placeholder")}
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={f.placeholder || ""}
                        onChange={(e) =>
                          updateField(i, { placeholder: e.target.value })
                        }
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <Form.Label style={{ fontSize: 12 }}>{t("reschedule.field.unit")}</Form.Label>
                      <Form.Control
                        size="sm"
                        value={f.unit || ""}
                        onChange={(e) =>
                          updateField(i, { unit: e.target.value })
                        }
                        placeholder={t("reschedule.ph.unit")}
                      />
                    </Col>
                    <Col md={12} className="mb-2">
                      <Form.Label style={{ fontSize: 12 }}>{t("reschedule.field.hint")}</Form.Label>
                      <Form.Control
                        size="sm"
                        value={f.hint || ""}
                        onChange={(e) =>
                          updateField(i, { hint: e.target.value })
                        }
                      />
                    </Col>
                    <Col md={12} className="mb-2">
                      <Form.Label style={{ fontSize: 12 }}>
                        {t("reschedule.field.validationJson")}
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        size="sm"
                        value={
                          f.validation ? JSON.stringify(f.validation) : ""
                        }
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          if (!v) {
                            updateField(i, { validation: undefined });
                            return;
                          }
                          try {
                            updateField(i, { validation: JSON.parse(v) });
                          } catch {
                            updateField(i, { validation: v as any });
                          }
                        }}
                        placeholder='{"min":1,"max":3}'
                      />
                    </Col>
                    {f.type === "SELECT" && (
                      <Col md={12} className="mb-2">
                        <Form.Label style={{ fontSize: 12 }}>
                          {t("reschedule.field.optionsJson")}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          size="sm"
                          value={f.options ? JSON.stringify(f.options) : ""}
                          onChange={(e) => {
                            const v = e.target.value.trim();
                            if (!v) {
                              updateField(i, { options: undefined });
                              return;
                            }
                            try {
                              updateField(i, { options: JSON.parse(v) });
                            } catch {
                              updateField(i, { options: v as any });
                            }
                          }}
                          placeholder='[{"label":"Option A","value":"A"}]'
                        />
                      </Col>
                              )}
                            </Row>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <hr />

              <Form.Group className="mb-2">
                <Form.Label>{t("reschedule.field.rulesConfigJson")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={form.rulesConfigText}
                  onChange={(e) =>
                    setFormValue("rulesConfigText", e.target.value)
                  }
                  isInvalid={!!errors.rulesConfigText}
                  style={{ fontSize: 12 }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.rulesConfigText}
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeEdit}>{t("common:cancel")}</Button>
          <Button
            className="gradient-btn"
            type="primary"
            loading={saving}
            onClick={handleSave}
            style={{
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("common:save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RescheduleConfigManagement;
