import React, { useEffect, useState } from "react";
import { Select, Button, Typography, Switch } from "antd";
import { getRoles, getRolePermission, getPermissionByRole, syncRolePermissions } from "../../redux/apis/apisCrudFactoring";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";


const { Option } = Select;
const { Text, Title } = Typography;

const AssignPermissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string | undefined>(
    undefined
  );
  const [modules, setModules] = useState<any[]>([]);
  const [data, setData] = useState<any>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<any>([]);
  const [hasExistingPermissions, setHasExistingPermissions] = useState(false);
  const [loading, setLoading] = useState(false);
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
    try {
      if (!selectedRole) {
        return toast.error("Please select a role.");
      }
      const response = await syncRolePermissions(selectedRole, selectedPermissions || []);
      if (response) {
        toast.success(response?.data?.message || "Permissions updated successfully.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update permissions.");
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
    const moduleName = (module.name || "").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

    return (
      <div
        key={module.id}
        style={{
          backgroundColor: "var(--color-surface-snow)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "2px",
          padding: "20px",
          width: "100%",
        }}
      >
        {loading && <Loader/>}
        {/* Module Header with Switch */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: hasPermissions ? "15px" : "0",
            paddingBottom: hasPermissions ? "12px" : "0",
            borderBottom: hasPermissions ? "1px solid var(--color-border-subtle)" : "none",
          }}
        >
          <Switch
            className="red-switch"
            checked={isFullySelected}
            onChange={(checked: boolean) => toggleModulePermissions(module, checked)}
            style={{
              backgroundColor: isFullySelected ? "var(--foreground)" : undefined,
            }}
          />
          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {moduleName}
          </Text>
        </div>

        {/* Module Permissions */}
        {hasPermissions && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {module.permissions.map((permission: any) => {
              const isChecked = selectedPermissions.includes(permission.id);
              const permissionName = (permission.permissionName || permission.permissionCode || "").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
              
              return (
                <div
                  key={permission.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Switch
                    className="red-switch"
                    checked={isChecked}
                    onChange={() => togglePermission(permission.id)}
                    size="small"
                  />
                  <Text style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: 0 }}>
                    {permissionName}
                  </Text>
                </div>
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
    <div className="pt-3" style={{ padding: "20px", paddingBottom: "100px" }}>
      <div className="d-flex flex-column" style={{ marginBottom: "40px" }}>
        <Text style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
          Roles
        </Text>
        <Select
          placeholder="Roles"
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

      <Title level={4} style={{ marginBottom: "30px", fontWeight: "600" }}>
        Assign Permission to the Role
      </Title>

      {/* Render all modules in a 3-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "60px",
        }}
      >
        {Array.isArray(modules) && modules.map((module: any) => renderModuleCard(module))}
      </div>

      <div className="d-flex justify-content-end">
        <Button
          type="primary"
         className="theme-btn-next"
          onClick={() => {
            handleDepartmentPermissions();
          }}
        >
          {hasExistingPermissions ? "Update" : "Assign"}
        </Button>
      </div>
    </div>
    )}
    </>
  );
};

export default AssignPermissions;
