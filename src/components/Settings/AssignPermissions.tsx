import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Select, Button, Typography, Switch } from "antd";
import { ShieldCheck, Layers } from "lucide-react";
import { getRoles, getRolePermission, getPermissionByRole, syncRolePermissions } from "../../redux/apis/apisCrudFactoring";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import { usePermissions, PERMISSION_PERMISSIONS } from "../../hooks/useProductPermissions";
import { moduleLabel, permissionLabel } from "../../utils/permissionLabels";


const { Option } = Select;
const { Text } = Typography;

const AssignPermissions: React.FC = () => {
  // `permissions` carries the catalog vocabulary: the module and permission
  // names on this page are API data, so they are translated from their codes
  // rather than from page copy.
  const { t } = useTranslation(["settings", "permissions"]);
  const [selectedRole, setSelectedRole] = useState<string | undefined>(
    undefined
  );
  const [modules, setModules] = useState<any[]>([]);
  const [data, setData] = useState<any>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<any>([]);
  const [hasExistingPermissions, setHasExistingPermissions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { hasPermission } = usePermissions();
  // Assigning permissions to a role is a write action — only show the Assign/Update
  // button to users who have PERMISSION_WRITE. View-only users (PERMISSION_READ) see
  // the page read-only.
  const canManagePermissions = hasPermission(PERMISSION_PERMISSIONS.EDIT);
  useEffect(() => {
    getRoleData();
    getModulesAndPermissions();
  }, []);

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    getPermissionDepartmentStatus(value);
  };

  const getRoleData = async () => {
    try {
      const res = await getRoles();
      if (res) {
        const data = res?.data?.data;
        setData(data || []);
      }
    } catch (error: any) {
      console.error("Error fetching role:", error);
    }
  };

  const getPermissionDepartmentStatus = async (id: any) => {
    try {
      setLoading(true);
      const res = await getPermissionByRole(id);
      if (res) {
        const data = res?.data?.data;
        let selected: string[] = [];
        if (Array.isArray(data)) {
          // flat list of permissions
          if (data.length > 0 && data[0]?.permissions) {
            // nested modules structure
            data.forEach((module: any) => {
              module.permissions?.forEach((p: any) => selected.push(p.id));
            });
          } else {
            selected = data.map((item: any) => item?.id);
          }
        }
        setSelectedPermissions(selected);
        setHasExistingPermissions(selected.length > 0);
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error?.message);
      setSelectedPermissions([]);
      setHasExistingPermissions(false);
      setLoading(false);
    }
  };

  const getModulesAndPermissions = async () => {
    try {
      setLoading(true);
      const res = await getRolePermission();
      if (res) {
        const responseData = res?.data?.data;
        const allModules = Array.isArray(responseData)
          ? responseData.map((module: any) => ({
              id: module.moduleId,
              name: module.moduleName,
              // Kept alongside the name so the card title can be localized from
              // the stable code rather than the server's wording.
              code: module.moduleCode,
              permissions: Array.isArray(module.permissions) ? module.permissions : [],
            }))
          : [];
        setModules(allModules);
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error fetching modules:", error);
      setModules([]);
      setLoading(false);
    }
  };

  const handleDepartmentPermissions = async () => {
    if (!selectedRole) {
      return toast.error(t("assignPermissions.toast.selectRole"));
    }
    try {
      setSubmitting(true);
      const response = await syncRolePermissions(selectedRole, selectedPermissions || []);
      if (response) {
        toast.success(response?.data?.message || t("assignPermissions.toast.updated"));
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("assignPermissions.toast.updateFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev: any[]) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Toggle all permissions for a module
  const toggleModulePermissions = (module: any, checked: boolean) => {
    const permissionIds = module.permissions?.map((p: any) => p.id) || [];
    
    if (checked) {
      // Add all permissions
      setSelectedPermissions((prev: any[]) => [
        ...new Set([...prev, ...permissionIds]),
      ]);
    } else {
      // Remove all permissions
      setSelectedPermissions((prev: any[]) =>
        prev.filter((id) => !permissionIds.includes(id))
      );
    }
  };

  // Check if all permissions of a module are selected
  const isModuleFullySelected = (module: any) => {
    if (!module.permissions || module.permissions.length === 0) return false;
    return module.permissions.every((p: any) =>
      selectedPermissions.includes(p.id)
    );
  };

  // Render a single module card
  const renderModuleCard = (module: any) => {
    const hasPermissions = module.permissions && module.permissions.length > 0;
    const isFullySelected = isModuleFullySelected(module);
    const moduleName = moduleLabel(t, module.code || module.name, module.name);
    const total = module.permissions?.length || 0;
    const selectedCount = module.permissions?.filter((p: any) => selectedPermissions.includes(p.id)).length || 0;

    return (
      <div key={module.id} className="pro-card" style={{ padding: 18 }}>
        {/* Module Header with Switch */}
        <div
          className="d-flex align-items-center justify-content-between"
          style={{
            gap: "12px",
            marginBottom: hasPermissions ? "14px" : "0",
            paddingBottom: hasPermissions ? "12px" : "0",
            borderBottom: hasPermissions ? "1px solid var(--surface-border)" : "none",
          }}
        >
          <div className="d-flex align-items-center" style={{ gap: 10, minWidth: 0 }}>
            <span className="pro-head-badge">
              <Layers className="h-4 w-4" />
            </span>
            <span
              className="text-truncate"
              style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)" }}
            >
              {moduleName}
            </span>
          </div>
          <div className="d-flex align-items-center" style={{ gap: 10, flexShrink: 0 }}>
            {total > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                {selectedCount}/{total}
              </span>
            )}
            <Switch
              className="red-switch"
              checked={isFullySelected}
              disabled={!canManagePermissions}
              onChange={(checked: boolean) => toggleModulePermissions(module, checked)}
              style={{ backgroundColor: isFullySelected ? "var(--foreground)" : undefined }}
            />
          </div>
        </div>

        {/* Module Permissions */}
        {hasPermissions && (
          <div className="d-flex flex-column" style={{ gap: "4px" }}>
            {module.permissions.map((permission: any) => {
              const isChecked = selectedPermissions.includes(permission.id);
              const permissionName = permissionLabel(
                t,
                permission.permissionCode || permission.code || "",
                permission.permissionName
              );

              return (
                <label
                  key={permission.id}
                  className="d-flex align-items-center rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
                  style={{ gap: "10px", margin: 0, cursor: "pointer" }}
                >
                  <Switch
                    className="red-switch"
                    checked={isChecked}
                    disabled={!canManagePermissions}
                    onChange={() => togglePermission(permission.id)}
                    size="small"
                  />
                  <Text style={{ fontSize: "13.5px", color: "var(--foreground)", margin: 0 }}>
                    {permissionName}
                  </Text>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
    {loading ? <Loader /> : (
    <div className="service" style={{ paddingBottom: "100px" }}>
      {/* Page header */}
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ShieldCheck className="h-4 w-4" />
          </span>
          {t("assignPermissions.title")}
        </h3>
        <p className="text-muted small mb-0 mt-1">
          {t("assignPermissions.subtitle")}
        </p>
      </div>

      {/* Role selector card */}
      <div className="pro-card p-3 mb-4">
        <Text style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
          {t("assignPermissions.role")}
        </Text>
        <Select
          placeholder={t("assignPermissions.selectRolePlaceholder")}
          style={{ width: "100%", maxWidth: "500px" }}
          onChange={handleRoleChange}
          value={selectedRole}
          size="large"
        >
          {data?.map((dep: any) => (
            <Option key={dep.id} value={dep.id}>
              {dep.roleName}
            </Option>
          ))}
        </Select>
      </div>

      <h4 className="fw-bold text-dark" style={{ marginBottom: "16px", fontSize: "15px" }}>
        {t("assignPermissions.sectionTitle")}
      </h4>

      {/* Render all modules in a responsive grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" style={{ marginBottom: "32px" }}>
        {Array.isArray(modules) && modules.map((module: any) => renderModuleCard(module))}
      </div>

      {/* Footer */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3 border-top">
        <span className="text-muted small">
          <span className="fw-semibold" style={{ color: "var(--foreground)" }}>
            {selectedPermissions.length}
          </span>{" "}
          {selectedPermissions.length === 1
            ? t("assignPermissions.permissionSelected")
            : t("assignPermissions.permissionsSelected")}
        </span>
        {canManagePermissions && (
          <Button
            type="primary"
            className="theme-btn-next"
            loading={submitting}
            disabled={submitting}
            onClick={() => {
              handleDepartmentPermissions();
            }}
          >
            {hasExistingPermissions ? t("common:update") : t("assignPermissions.assign")}
          </Button>
        )}
      </div>
    </div>
    )}
    </>
  );
};

export default AssignPermissions;
