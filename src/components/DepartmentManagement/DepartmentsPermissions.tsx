import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Select, Switch, Button, Row, Col, Typography } from "antd";
import {
  getDepartments,
  getDepartmentPermissions,
  getPermissionByDepartment,
  storeDepartmentPermissions,
} from "../../redux/apis/apisCrudFactoring";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import { usePermissions, DEPARTMENT_PERMISSIONS_MODULE } from "../../hooks/useProductPermissions";

const { Option } = Select;
const { Text } = Typography;

const DepartmentsPermissions: React.FC = () => {
  const { t } = useTranslation("adminMisc");
  // Permissions
  const { hasPermission } = usePermissions();
  const canUpdateDeptPermissions = hasPermission(DEPARTMENT_PERMISSIONS_MODULE.UPDATE);
  const [selectedDepartment, setSelectedDepartment] = useState<
    string | undefined
  >(undefined);
  const [permissions, setPermissions] = useState<any>();
  const [data, setData] = useState<any>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedPermissions([]);
    getPermssionDepartmentStatus(value);
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments(1, 500);
      if (res?.data?.success) {
        const apiData = res.data.data;
        const list = Array.isArray(apiData?.data) ? apiData.data : Array.isArray(apiData) ? apiData : [];
        setData(list);
      }
    } catch (error: any) {
      console.error("Error fetching departments:", error);
    }
  };

  const getPermssionDepartmentStatus = async (id: any) => {
    try {
      setSkelitonLoading(true);
      const res = await getPermissionByDepartment(id);
      if (res?.data?.success) {
        const raw = res?.data?.data;
        const selected = Array.isArray(raw)
          ? raw.map((item: any) => (typeof item === "string" ? item : item?.type ?? item?.name ?? item?.id))
          : [];
        setSelectedPermissions(selected.filter(Boolean));
      }
    } catch (error: any) {
      console.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const fetchPermissionsList = async () => {
    try {
      setSkelitonLoading(true);
      const res = await getDepartmentPermissions();
      if (res?.data?.success) {
        const apiData = res.data.data;
        const list = Array.isArray(apiData?.tab_permissions)
          ? apiData.tab_permissions
          : Array.isArray(apiData)
          ? apiData
          : [];
        setPermissions(list);
      }
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const handleDepartmentPermissions = async () => {
    try {
      setSkelitonLoading(true);
      if (!selectedDepartment) {
        return toast.error(t("deptPerm.selectDeptError"));
      }

      const body = {
        department_id: selectedDepartment,
        tab_permissions: selectedPermissions, // array of strings
      };

      const response = await storeDepartmentPermissions(body);
      if (response) {
        const data = response?.data;

        toast.success(data?.message);
      }
    } catch (e: any) {
      toast.error(t("deptPerm.updateFailed"));
    } finally {
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchPermissionsList();
  }, []);

  return (
    <div className="pt-3">

      {skelitonLoading ? <Loader /> : (
      <>
        <div className="d-flex flex-column">
          <Text>{t("deptPerm.departmentsLabel")}</Text>
          <Select
            placeholder={t("deptPerm.selectPlaceholder")}
            style={{ width: "100%", maxWidth: "562px", marginBottom: "56px" }}
            onChange={handleDepartmentChange}
            value={selectedDepartment}
          >
            {data?.map((dep: any) => (
              <Option key={dep.id} value={dep.id}>
                {dep.name}
              </Option>
            ))}
          </Select>
        </div>

      <Row style={{ width: "100%" }} wrap justify="start">
        {permissions &&
          permissions.map((permission: string) => {
            const isChecked = selectedPermissions.includes(permission);

            return (
              <div key={permission} style={{ marginBottom: "12px" }}>
                <Col flex="1 1 25%" style={{ minWidth: "200px" }}>
                  <Switch
                    size="small"
                    className="red-switch"
                    style={{ marginRight: "8px" }}
                    checked={isChecked}
                    //disabled={!canUpdateDeptPermissions}
                    onChange={(checked) => {
                      setSelectedPermissions(
                        (prev) =>
                          checked
                            ? [...prev, permission]
                            : prev.filter((p) => p !== permission) // remove from list
                      );
                    }}
                  />
                  <Text>{permission}</Text>
                </Col>
              </div>
            );
          })}
      </Row>

      {/* {canUpdateDeptPermissions && ( */}
        <div style={{ textAlign: "right", marginTop: "30px", marginRight: "80px" }}>
          <Button
            type="primary"
            className="theme-btn-next"
            onClick={() => {
              handleDepartmentPermissions();
            }}
          >
            {t("common:update")}
          </Button>
        </div>
      {/* )} */}
      </>
   )}
  </div>
  );
};

export default DepartmentsPermissions;
