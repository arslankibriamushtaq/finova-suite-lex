import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Switch, Typography } from "antd";
import { ShieldCheck, Layers, AlertTriangle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import Loader from "../Loader/Loader";
import { PermissionDenied } from "../shared/detailKit";
import { getRolePermission } from "../../redux/apis/apisCrudFactoring";
import {
  getDepartment,
  getDepartmentPermissions,
  getDepartmentRoles,
  syncDepartmentPermissions,
} from "../../redux/apis/apisDepartments";
import { usePermissions, DEPARTMENT_PERMISSIONS } from "../../hooks/useProductPermissions";
import { moduleLabel, permissionLabel } from "../../utils/permissionLabels";

const { Text } = Typography;

/**
 * A department's own permission set.
 *
 * Saving here is a cascade: every role in the department is re-flattened, so the
 * blast radius is "every role inside this department", not one role. The role
 * count is shown next to the save button for exactly that reason.
 */
const DepartmentPermissions: React.FC = () => {
  const { t } = useTranslation(["settings", "permissions"]);
  const navigate = useNavigate();
  const { departmentId = "" } = useParams();

  const { hasPermission } = usePermissions();
  const canRead = hasPermission(DEPARTMENT_PERMISSIONS.LIST);
  const canSync = hasPermission(DEPARTMENT_PERMISSIONS.SYNC_PERMISSIONS);

  const [department, setDepartment] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [baseline, setBaseline] = useState<string[]>([]);
  const [roleCount, setRoleCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    if (!departmentId) return;
    setIsLoading(true);
    try {
      const [dept, catalog, held, roles] = await Promise.all([
        getDepartment(departmentId),
        getRolePermission(),
        getDepartmentPermissions(departmentId),
        getDepartmentRoles(departmentId),
      ]);

      setDepartment(dept?.data?.data ?? null);

      const cat = Array.isArray(catalog?.data?.data) ? catalog.data.data : [];
      setModules(
        cat.map((m: any) => ({
          id: m.moduleId,
          code: m.moduleCode,
          name: m.moduleName,
          permissions: Array.isArray(m.permissions) ? m.permissions : [],
        }))
      );

      const heldData = Array.isArray(held?.data?.data) ? held.data.data : [];
      const ids: string[] = [];
      heldData.forEach((m: any) =>
        (m.permissions || m.permissionsList || []).forEach((p: any) => ids.push(p.id))
      );
      setSelected(ids);
      setBaseline(ids);

      const r = Array.isArray(roles?.data?.data) ? roles.data.data : [];
      setRoleCount(r.length);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("departments.toast.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  const isDirty = useMemo(
    () =>
      selected.length !== baseline.length ||
      selected.some((id) => !baseline.includes(id)),
    [selected, baseline]
  );

  const toggle = (permissionId: string) =>
    setSelected((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );

  const toggleModule = (module: any, checked: boolean) => {
    const ids = (module.permissions || []).map((p: any) => p.id);
    setSelected((prev) =>
      checked
        ? [...new Set([...prev, ...ids])]
        : prev.filter((id) => !ids.includes(id))
    );
  };

  const moduleFullySelected = (module: any) =>
    (module.permissions || []).length > 0 &&
    module.permissions.every((p: any) => selected.includes(p.id));

  const save = async () => {
    setIsSaving(true);
    try {
      await syncDepartmentPermissions(departmentId, selected);
      setBaseline(selected);
      toast.success(t("departments.toast.permissionsSynced", { count: roleCount ?? 0 }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("departments.toast.syncFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!canRead) return <PermissionDenied />;
  if (isLoading) return <Loader />;

  return (
    <div className="service" style={{ paddingBottom: 100 }}>
      <div className="mb-3 pb-2 border-bottom d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div className="min-w-0">
          <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
            <span className="pro-head-badge">
              <ShieldCheck className="h-4 w-4" />
            </span>
            {t("departments.permissions.title", {
              name: department?.departmentName || t("departments.title"),
            })}
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">
            {t("departments.permissions.subtitle")}
          </p>
        </div>
        <Button icon={<ArrowLeft className="h-3 w-3" />} onClick={() => navigate("/LOS/Setting/Departments")}>
          {t("common:back")}
        </Button>
      </div>

      {/* The cascade is the whole point of this screen — say how far it reaches
          before anyone presses save, not after. */}
      {roleCount !== null && (
        <div
          className="mb-3 d-flex align-items-start gap-2 px-3 py-2"
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--muted)",
            fontSize: 13,
          }}
        >
          <AlertTriangle className="h-4 w-4" style={{ marginTop: 2, flexShrink: 0 }} />
          <span>
            {roleCount === 0
              ? t("departments.permissions.noRolesYet")
              : t("departments.permissions.cascadeWarning", { count: roleCount })}
          </span>
        </div>
      )}

      {!canSync && (
        <div
          className="mb-3 px-3 py-2 text-muted"
          style={{ border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
        >
          {t("departments.permissions.readOnly")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" style={{ marginBottom: 32 }}>
        {modules.map((module: any) => {
          const total = module.permissions?.length || 0;
          const count = module.permissions?.filter((p: any) => selected.includes(p.id)).length || 0;
          const label = moduleLabel(t, module.code || module.name, module.name);
          return (
            <div key={module.id} className="pro-card" style={{ padding: 18 }}>
              <div
                className="d-flex align-items-center justify-content-between"
                style={{
                  gap: 12,
                  marginBottom: total ? 14 : 0,
                  paddingBottom: total ? 12 : 0,
                  borderBottom: total ? "1px solid var(--surface-border)" : "none",
                }}
              >
                <div className="d-flex align-items-center" style={{ gap: 10, minWidth: 0 }}>
                  <span className="pro-head-badge">
                    <Layers className="h-4 w-4" />
                  </span>
                  <span
                    className="text-truncate"
                    style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}
                  >
                    {label}
                  </span>
                </div>
                <div className="d-flex align-items-center" style={{ gap: 10, flexShrink: 0 }}>
                  {total > 0 && (
                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">
                      {count}/{total}
                    </span>
                  )}
                  <Switch
                    className="red-switch"
                    checked={moduleFullySelected(module)}
                    disabled={!canSync}
                    onChange={(checked: boolean) => toggleModule(module, checked)}
                  />
                </div>
              </div>

              {total > 0 && (
                <div className="d-flex flex-column" style={{ gap: 4 }}>
                  {module.permissions.map((permission: any) => (
                    <label
                      key={permission.id}
                      className="d-flex align-items-center rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
                      style={{ gap: 10, margin: 0, cursor: canSync ? "pointer" : "default" }}
                    >
                      <Switch
                        className="red-switch"
                        size="small"
                        checked={selected.includes(permission.id)}
                        disabled={!canSync}
                        onChange={() => toggle(permission.id)}
                      />
                      <Text style={{ fontSize: 13.5, color: "var(--foreground)", margin: 0 }}>
                        {permissionLabel(
                          t,
                          permission.permissionCode || permission.code || "",
                          permission.permissionName
                        )}
                      </Text>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3 border-top">
        <span className="text-muted small">
          <span className="fw-semibold" style={{ color: "var(--foreground)" }}>
            {selected.length}
          </span>{" "}
          {selected.length === 1
            ? t("assignPermissions.permissionSelected")
            : t("assignPermissions.permissionsSelected")}
        </span>
        {canSync && (
          <Button
            type="primary"
            className="theme-btn-next"
            loading={isSaving}
            disabled={!isDirty || isSaving}
            onClick={save}
          >
            {t("departments.permissions.save")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DepartmentPermissions;
