import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import {
  Button,
  Input,
  Menu,
  Modal,
  Form,
  Switch,
  Dropdown,
  Tooltip,
  Select,
  InputNumber,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  KeyOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";

import TableView from "../TableView/TableView";
import arrowDown from "../../assets/images/arrow-down.png";
import { getRoles } from "../../redux/apis/apisCrudFactoring";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentRoles,
  setRoleDepartment,
  clearRoleDepartment,
  departmentErrorCode,
  DEPARTMENT_ERRORS,
} from "../../redux/apis/apisDepartments";
import { IN_USE_BY_WORKFLOW } from "../../redux/apis/apisApprovalWorkflows";
import { usePermissions, DEPARTMENT_PERMISSIONS } from "../../hooks/useProductPermissions";
import { PermissionDenied } from "../shared/detailKit";

const emptyForm = {
  departmentCode: "",
  departmentName: "",
  departmentNameAr: "",
  description: "",
  displayOrder: 0,
  active: true,
};

const Departments = () => {
  const { t } = useTranslation("settings");
  const navigate = useNavigate();

  const { hasPermission } = usePermissions();
  const canRead = hasPermission(DEPARTMENT_PERMISSIONS.LIST);
  const canCreate = hasPermission(DEPARTMENT_PERMISSIONS.CREATE);
  const canEdit = hasPermission(DEPARTMENT_PERMISSIONS.EDIT);
  const canDelete = hasPermission(DEPARTMENT_PERMISSIONS.DELETE);
  const canRowActions = canEdit || canDelete;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Roles-in-department drawer
  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesDept, setRolesDept] = useState<any>(null);
  const [deptRoles, setDeptRoles] = useState<any[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [attachRoleId, setAttachRoleId] = useState<string | undefined>();
  const [rolesBusy, setRolesBusy] = useState(false);

  const loadDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await getDepartments(page - 1, pageSize, debouncedSearch || undefined);
      const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
      setData(rows);
      const p = res?.data?.pagination;
      const total = p?.totalElements ?? rows.length;
      setTotalRows(total);
      setTotalPage(p?.totalPages ?? (rows.length ? 1 : 0));
      setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
      setTo(Math.min(page * pageSize, total));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("departments.toast.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const h = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(h);
  }, [searchTerm]);

  useEffect(() => {
    if (canRead) loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch, canRead]);

  const openAdd = () => {
    setMode("add");
    setCurrentId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (row: any) => {
    setMode("edit");
    setCurrentId(row.id);
    setFormData({
      departmentCode: row.departmentCode || "",
      departmentName: row.departmentName || "",
      departmentNameAr: row.departmentNameAr || "",
      description: row.description || "",
      displayOrder: row.displayOrder ?? 0,
      active: !!row.active,
    });
    setShowModal(true);
  };

  const validate = (): string | null => {
    if (mode === "add") {
      if (!formData.departmentCode.trim()) return t("departments.valid.code");
      if (formData.departmentCode.length > 50) return t("departments.valid.codeLength");
    }
    if (!formData.departmentName.trim()) return t("departments.valid.name");
    if (formData.departmentName.length > 255) return t("departments.valid.nameLength");
    return null;
  };

  const handleSave = async () => {
    const problem = validate();
    if (problem) return toast.error(problem);
    setIsSaving(true);
    try {
      if (mode === "edit" && currentId) {
        await updateDepartment(currentId, {
          departmentName: formData.departmentName,
          departmentNameAr: formData.departmentNameAr || null,
          description: formData.description || null,
          active: formData.active,
          displayOrder: formData.displayOrder,
        });
        toast.success(t("departments.toast.updated"));
      } else {
        await createDepartment({
          departmentCode: formData.departmentCode.trim(),
          departmentName: formData.departmentName.trim(),
          departmentNameAr: formData.departmentNameAr || undefined,
          description: formData.description || undefined,
          displayOrder: formData.displayOrder,
        });
        toast.success(t("departments.toast.created"));
      }
      setShowModal(false);
      setMode(null);
      setCurrentId(null);
      setFormData(emptyForm);
      loadDepartments();
    } catch (error: any) {
      const code = departmentErrorCode(error);
      if (code === DEPARTMENT_ERRORS.DUPLICATE) {
        toast.error(t("departments.toast.duplicate", { code: formData.departmentCode }));
      } else {
        toast.error(error?.response?.data?.message || t("departments.toast.saveFailed"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDepartment(deleteTarget.id);
      toast.success(t("departments.toast.deleted"));
      setShowDelete(false);
      setDeleteTarget(null);
      loadDepartments();
    } catch (error: any) {
      const code = departmentErrorCode(error);
      if (code === DEPARTMENT_ERRORS.HAS_ROLES) {
        // The backend refuses rather than silently stripping inherited grants
        // from every role in the department — say so, and point at the fix.
        toast.error(error?.response?.data?.message || t("departments.toast.hasRoles"));
      } else if (code === IN_USE_BY_WORKFLOW.DEPARTMENT) {
        // An approval chain still routes a stage here. Deleting the department
        // would leave that stage pointing at nothing, so the chain is edited
        // first — this screen cannot do it, but it can say where to go.
        toast.error(error?.response?.data?.message || t("departments.toast.inUseByWorkflow"));
      } else {
        toast.error(error?.response?.data?.message || t("departments.toast.deleteFailed"));
      }
      setShowDelete(false);
    }
  };

  const openRoles = async (row: any) => {
    setRolesDept(row);
    setRolesOpen(true);
    setAttachRoleId(undefined);
    setRolesBusy(true);
    try {
      const [inDept, all] = await Promise.all([
        getDepartmentRoles(row.id),
        getRoles(0, 1000),
      ]);
      setDeptRoles(Array.isArray(inDept?.data?.data) ? inDept.data.data : []);
      setAllRoles(Array.isArray(all?.data?.data) ? all.data.data : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("departments.toast.rolesFailed"));
    } finally {
      setRolesBusy(false);
    }
  };

  const refreshRoles = async () => {
    if (!rolesDept) return;
    const [inDept, all] = await Promise.all([getDepartmentRoles(rolesDept.id), getRoles(0, 1000)]);
    setDeptRoles(Array.isArray(inDept?.data?.data) ? inDept.data.data : []);
    setAllRoles(Array.isArray(all?.data?.data) ? all.data.data : []);
  };

  const handleAttach = async () => {
    if (!attachRoleId || !rolesDept) return;
    setRolesBusy(true);
    try {
      await setRoleDepartment(attachRoleId, rolesDept.id);
      toast.success(t("departments.toast.roleAttached"));
      setAttachRoleId(undefined);
      await refreshRoles();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("departments.toast.attachFailed"));
    } finally {
      setRolesBusy(false);
    }
  };

  const handleDetach = async (roleId: string) => {
    setRolesBusy(true);
    try {
      await clearRoleDepartment(roleId);
      toast.success(t("departments.toast.roleDetached"));
      await refreshRoles();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("departments.toast.detachFailed"));
    } finally {
      setRolesBusy(false);
    }
  };

  const rowMenu = (row: any) => (
    <Menu>
      {canEdit && (
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => openEdit(row.raw)}>
          {t("common:edit")}
        </Menu.Item>
      )}
      {canRead && (
        <Menu.Item
          key="permissions"
          icon={<KeyOutlined />}
          onClick={() => navigate(`/LOS/Setting/Departments/${row.id}/Permissions`)}
        >
          {t("departments.action.permissions")}
        </Menu.Item>
      )}
      {canEdit && (
        <Menu.Item key="roles" icon={<TeamOutlined />} onClick={() => openRoles(row.raw)}>
          {t("departments.action.roles")}
        </Menu.Item>
      )}
      {canDelete && (
        <Menu.Item
          key="delete"
          icon={<DeleteOutlined />}
          onClick={() => {
            setDeleteTarget(row.raw);
            setShowDelete(true);
          }}
        >
          {t("common:delete")}
        </Menu.Item>
      )}
    </Menu>
  );

  const columns = [
    { name: "#", selector: (row: any) => row.Sr, width: "60px" },
    { name: t("departments.col.code"), selector: (row: any) => row.Code },
    { name: t("common:name"), selector: (row: any) => row.Name },
    { name: t("departments.col.nameAr"), selector: (row: any) => row.NameAr },
    {
      name: t("common:description"),
      grow: 2,
      cell: (row: any) => (
        <Tooltip title={row.Description} placement="topLeft">
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "220px",
              fontSize: "13px",
              cursor: "default",
            }}
          >
            {row.Description || "—"}
          </div>
        </Tooltip>
      ),
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor: row.status ? "var(--color-success)" : "var(--color-error)",
            color: "white",
          }}
        >
          {row.status ? t("common:active") : t("common:inactive")}
        </div>
      ),
    },
    {
      name: t("departments.col.action"),
      width: "10%",
      cell: (row: any) =>
        canRowActions || canRead ? (
          <Dropdown overlay={rowMenu(row)} trigger={["click"]}>
            <Button
              className="gradient-btn"
              type="primary"
              style={{ fontSize: "12px", borderRadius: "2px", padding: "8px" }}
            >
              {t("common:select")}
              <img src={arrowDown} alt="" style={{ marginLeft: "5px" }} />
            </Button>
          </Dropdown>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
  ];

  const mapped = data.map((item: any, index: number) => ({
    id: item?.id,
    Sr: (page - 1) * pageSize + index + 1,
    Code: item?.departmentCode,
    Name: item?.departmentName,
    NameAr: item?.departmentNameAr || "—",
    Description: item?.description,
    status: item?.active,
    raw: item,
  }));

  // Roles not already in this department are the ones that can be attached.
  const attachable = allRoles.filter(
    (r: any) => !deptRoles.some((d: any) => d.id === r.id)
  );

  if (!canRead) return <PermissionDenied />;

  return (
    <div className="service role-list-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Building2 className="h-4 w-4" />
          </span>
          {t("departments.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("departments.subtitle")}</p>
      </div>

      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("departments.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          {canCreate && (
            <button
              className="theme-btn-next"
              onClick={openAdd}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t("departments.addNew")}
            </button>
          )}
        </div>
      </div>

      <div
        className="bg-white"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          header={columns}
          data={mapped}
          totalRows={totalRows}
          isLoading={isLoading}
          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />
      </div>

      {/* Create / edit */}
      <Modal
        maskClosable={false}
        keyboard={false}
        className="custom-mod"
        style={{ maxWidth: "632px" }}
        title={mode === "edit" ? t("departments.modal.editTitle") : t("departments.addNew")}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)} disabled={isSaving}>
            {t("common:cancel")}
          </Button>,
          <Button key="save" type="primary" loading={isSaving} onClick={handleSave}>
            {mode === "edit" ? t("common:save") : t("common:submit")}
          </Button>,
        ]}
      >
        <div className="Ente-details">
          <Form layout="vertical">
            {mode === "add" && (
              <Form.Item label={t("departments.field.code")}>
                <Input
                  placeholder={t("departments.ph.code")}
                  maxLength={50}
                  value={formData.departmentCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((p) => ({ ...p, departmentCode: e.target.value }))
                  }
                />
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {t("departments.hint.code")}
                </span>
              </Form.Item>
            )}
            <Form.Item label={t("departments.field.name")}>
              <Input
                placeholder={t("departments.ph.name")}
                maxLength={255}
                value={formData.departmentName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((p) => ({ ...p, departmentName: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label={t("departments.field.nameAr")}>
              <Input
                placeholder={t("departments.ph.nameAr")}
                dir="rtl"
                value={formData.departmentNameAr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((p) => ({ ...p, departmentNameAr: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label={t("common:description")}>
              <Input.TextArea
                rows={3}
                placeholder={t("departments.ph.description")}
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label={t("departments.field.displayOrder")}>
              <InputNumber
                min={0}
                value={formData.displayOrder}
                onChange={(v: any) => setFormData((p) => ({ ...p, displayOrder: Number(v) || 0 }))}
                style={{ width: "100%" }}
              />
            </Form.Item>
            {mode === "edit" && (
              <Form.Item label={t("common:status")}>
                <div className="d-flex align-items-center gap-2">
                  <Switch
                    checked={formData.active}
                    onChange={(checked: boolean) =>
                      setFormData((p) => ({ ...p, active: checked }))
                    }
                  />
                  <span>{formData.active ? t("common:active") : t("common:inactive")}</span>
                </div>
                {/* Deactivating is display-only on the backend by design: a toggle
                    that stripped every inherited grant would be a one-click
                    multi-role lockout with no confirmation. */}
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {t("departments.hint.inactive")}
                </span>
              </Form.Item>
            )}
          </Form>
        </div>
      </Modal>

      {/* Roles in this department */}
      <Modal
        maskClosable={false}
        className="custom-mod"
        style={{ maxWidth: "632px" }}
        title={t("departments.modal.rolesTitle", { name: rolesDept?.departmentName || "" })}
        visible={rolesOpen}
        onCancel={() => setRolesOpen(false)}
        footer={[
          <Button key="close" onClick={() => setRolesOpen(false)}>
            {t("common:close")}
          </Button>,
        ]}
      >
        <p className="text-muted" style={{ fontSize: 13 }}>
          {t("departments.rolesHint")}
        </p>

        {canEdit && (
          <div className="d-flex align-items-center gap-2 mb-3">
            <Select
              showSearch
              allowClear
              optionFilterProp="children"
              placeholder={t("departments.ph.attachRole")}
              value={attachRoleId}
              onChange={(v: string) => setAttachRoleId(v)}
              style={{ flex: 1 }}
              disabled={rolesBusy}
            >
              {attachable.map((r: any) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.roleName} ({r.roleCode})
                  {r.departmentId ? ` — ${t("departments.movesFrom", { name: r.departmentName })}` : ""}
                </Select.Option>
              ))}
            </Select>
            <Button type="primary" disabled={!attachRoleId || rolesBusy} onClick={handleAttach}>
              {t("departments.action.attach")}
            </Button>
          </div>
        )}

        <div className="d-flex flex-column gap-2">
          {deptRoles.length === 0 && (
            <span className="text-muted" style={{ fontSize: 13 }}>
              {t("departments.noRoles")}
            </span>
          )}
          {deptRoles.map((r: any) => (
            <div
              key={r.id}
              className="d-flex align-items-center justify-content-between px-3 py-2"
              style={{ border: "1px solid var(--border)", borderRadius: 4 }}
            >
              <span>
                <strong>{r.roleName}</strong>{" "}
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {r.roleCode}
                </span>
              </span>
              {canEdit && (
                <Button size="small" danger disabled={rolesBusy} onClick={() => handleDetach(r.id)}>
                  {t("departments.action.detach")}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        maskClosable={false}
        className="custom-mod"
        style={{ maxWidth: "520px" }}
        title={t("departments.modal.deleteTitle")}
        visible={showDelete}
        onCancel={() => setShowDelete(false)}
        footer={[
          <Button key="close" onClick={() => setShowDelete(false)}>
            {t("common:cancel")}
          </Button>,
          <Button key="del" type="primary" danger onClick={handleDelete}>
            {t("common:delete")}
          </Button>,
        ]}
      >
        <p>{t("departments.confirmDelete", { name: deleteTarget?.departmentName || "" })}</p>
        <p className="text-muted" style={{ fontSize: 13 }}>
          {t("departments.hint.deleteBlocked")}
        </p>
      </Modal>
    </div>
  );
};

export default Departments;
