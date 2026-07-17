import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import {
  Button,
  Input,
  Menu,
  Select,
  Modal,
  Form,
  Dropdown,
  Row,
  Col,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import {
  getEmployees,
  storeEmployee,
  updateEmployee,
  deleteEmployee,
  getRoles,
} from "../../redux/apis/apisCrudFactoring";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";

const EMPLOYEE_STATUS = ["ACTIVE", "INACTIVE", "SUSPENDED", "TERMINATED"];

const MIN_PASSWORD_LENGTH = 8;

function generatePassword(): string {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const pool = lower + upper + numbers;
  let result = "";
  result += lower[Math.floor(Math.random() * lower.length)];
  result += upper[Math.floor(Math.random() * upper.length)];
  result += numbers[Math.floor(Math.random() * numbers.length)];
  for (let i = result.length; i < MIN_PASSWORD_LENGTH; i++) {
    result += pool[Math.floor(Math.random() * pool.length)];
  }
  return result.split("").sort(() => Math.random() - 0.5).join("");
}

const emptyForm: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  roleId: string;
  status: string;
} = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  roleId: "",
  status: "ACTIVE",
};

const Employees = () => {
  const { t } = useTranslation("settings");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      const original = data.find((item: any) => item.id === row.id);
      setSelectedItem("edit");
      setCurrentEmployeeId(row.id);
      setFormData({
        name: original?.name || "",
        email: original?.email || "",
        password: "",
        phone: original?.phone || "",
        address: original?.address || "",
        roleId: original?.roleId || "",
        status: original?.status || "ACTIVE",
      });
      setErrors({});
      setShowModal(true);
    } else if (key === "delete") {
      setDeleteTargetId(row.id);
      setShowConfirmModal(true);
      setSelectedItem("delete");
    }
  };

  const menu = (row: any) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleMenuClick("edit", row)}>
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleMenuClick("delete", row)}>
        {t("common:delete")}
      </Menu.Item>
    </Menu>
  );

  const statusColor: Record<string, string> = {
    ACTIVE: "var(--color-success)",
    INACTIVE: "#8c8c8c",
    SUSPENDED: "#faad14",
    TERMINATED: "var(--color-error)",
  };

  const tableColumns = [
    { name: "#", selector: (row: any) => row.Sr, width: "60px" },
    { name: t("common:name"), selector: (row: any) => row.name },
    { name: t("common:email"), selector: (row: any) => row.email },
    { name: t("common:phone"), selector: (row: any) => row.phone },
    { name: t("employees.col.role"), selector: (row: any) => row.roleName },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor: statusColor[row.status] || "#8c8c8c",
            color: "white",
            display: "inline-block",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: t("employees.col.action"),
      width: "10%",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button className="gradient-btn" type="primary" style={{ fontSize: "12px", borderRadius: "2px", padding: "8px" }}>
            {t("common:select")}
            <img src={arrowDown} alt="" style={{ marginLeft: "5px" }} />
          </Button>
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    getRoleData();
  }, []);

  // Debounce search input so we don't refetch on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    getEmployeesData();
  }, [page, pageSize, debouncedSearch]);

  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteEmployee(deleteTargetId), {
        loading: t("employees.toast.deleting"),
        success: (response: any) => {
          getEmployeesData();
          setShowConfirmModal(false);
          setDeleteTargetId(null);
          setSelectedItem(null);
          return response?.data?.message || t("employees.toast.deleted");
        },
        error: (err: any) => err?.response?.data?.message || err?.message || t("employees.toast.deleteFailed"),
      });
    } catch (error) {
      setShowConfirmModal(false);
      setDeleteTargetId(null);
    }
  };

  // Validate the add/edit form; returns a map of field -> error message (empty = valid)
  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = t("employees.error.name", "Please enter the name");
    if (selectedItem === "add") {
      if (!formData.email.trim()) {
        errs.email = t("employees.error.email", "Please enter the email");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = t("employees.error.emailInvalid", "Please enter a valid email");
      }
      if (!formData.password || formData.password.length < MIN_PASSWORD_LENGTH) {
        errs.password = t("employees.error.password", `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      }
    }
    if (!formData.roleId) errs.roleId = t("employees.error.role", "Please select a role");
    return errs;
  };

  // Save button on the first modal: validate inline, then submit directly (no
  // separate "are you sure?" confirmation step).
  const handleSaveClick = () => {
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      handleSave();
    }
  };

  const handleSave = async () => {
    try {
      if (selectedItem === "edit" && currentEmployeeId !== null) {
        const body = {
          name: formData.name,
          phone: formData.phone,
          roleId: formData.roleId,
          status: formData.status,
        };
        await toast.promise(updateEmployee(currentEmployeeId, body), {
          loading: t("employees.toast.updating"),
          success: (response: any) => {
            setShowModal(false);
            setShowConfirmModal(false);
            setSelectedItem(null);
            setCurrentEmployeeId(null);
            setFormData(emptyForm);
            getEmployeesData();
            return response?.data?.message || t("employees.toast.updated");
          },
          error: (err: any) => err?.response?.data?.message || err?.message || t("employees.toast.updateFailed"),
        });
      } else if (selectedItem === "add") {
        const body = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          roleId: formData.roleId,
          status: formData.status,
        };
        await toast.promise(storeEmployee(body), {
          loading: t("employees.toast.adding"),
          success: (response: any) => {
            setShowModal(false);
            setShowConfirmModal(false);
            setSelectedItem(null);
            setFormData(emptyForm);
            getEmployeesData();
            return response?.data?.message || t("employees.toast.added");
          },
          error: (err: any) => err?.response?.data?.message || err?.message || t("employees.toast.addFailed"),
        });
      }
    } catch (error) {
      setShowConfirmModal(false);
    }
  };

  const getEmployeesData = async () => {
    setSkelitonLoading(true);
    try {
      if (debouncedSearch) {
        // Backend search support is unverified — fetch full set and filter client-side.
        const res = await getEmployees(0, 10000);
        const all: any[] = Array.isArray(res?.data?.data) ? res.data.data : [];
        const term = debouncedSearch.toLowerCase();
        const filtered = all.filter((item: any) =>
          (item?.name || "").toLowerCase().includes(term) ||
          (item?.email || "").toLowerCase().includes(term) ||
          (item?.phone || "").toLowerCase().includes(term) ||
          (item?.status || "").toLowerCase().includes(term)
        );
        const total = filtered.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        setData(filtered.slice(start, end));
        setTotalRows(total);
        setFrom(total > 0 ? start + 1 : 0);
        setTo(Math.min(end, total));
        setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
        return;
      }

      // Backend uses 0-based indexing for page
      const res = await getEmployees(page - 1, pageSize);
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setData(list);

      const pagination = res?.data?.pagination;
      if (pagination) {
        const total = pagination.totalElements || 0;
        setTotalRows(total);
        setTotalPage(pagination.totalPages || 1);
        setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
        setTo(Math.min(page * pageSize, total));
      } else {
        setTotalRows(list.length);
        setFrom(list.length ? 1 : 0);
        setTo(list.length);
        setTotalPage(list.length ? 1 : 0);
      }
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      setData([]);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const getRoleData = async () => {
    try {
      const res = await getRoles();
      if (res) {
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setRoleData(list);
      }
    } catch (error: any) {
      console.error("Error fetching roles:", error);
    }
  };

  const mappedData = data.map((item: any, index: number) => {
    const roleId = item?.roleId || item?.role?.id || "";
    const matchedRole = roleData.find((r: any) => r.id === roleId);
    return {
      id: item?.id,
      Sr: (page - 1) * pageSize + index + 1,
      name: item?.name || "-",
      email: item?.email || "-",
      phone: item?.phone || "-",
      address: item?.address || "-",
      roleName: matchedRole?.roleName || item?.roleName || item?.role?.roleName || "-",
      roleId,
      status: item?.status || "-",
    };
  });

  return (
    <>
      <div className="service employees-page">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
            <span className="pro-head-badge">
              <Users className="h-4 w-4" />
            </span>
            {t("employees.title")}
          </h3>
        </div>

        {/* Filters card */}
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
              placeholder={t("employees.searchPlaceholder")}
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
            />
            <button
              className="theme-btn-next"
              onClick={() => {
                setShowModal(true);
                setSelectedItem("add");
                setFormData({ ...emptyForm, password: generatePassword() });
                setErrors({});
              }}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t("employees.addNew")}
            </button>
          </div>
        </div>

        {/* Table card */}
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
            header={tableColumns}
            data={mappedData}
            totalRows={totalRows}
            isLoading={skelitonLoading}
            from={from}
            page={page}
            totalPage={totalPage}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            to={to}
          />
        </div>

        <Modal
          className="custom-mod"
          style={{ maxWidth: "764px" }}
          title={selectedItem === "edit" ? t("employees.modal.updateTitle") : t("employees.addNew")}
          open={showModal}
          onCancel={() => { setShowModal(false); setErrors({}); }}
          footer={[
            <Button key="close" onClick={() => { setShowModal(false); setErrors({}); }}>{t("common:cancel")}</Button>,
            <Button key="save" type="primary" onClick={handleSaveClick}>
              {t("common:save")}
            </Button>,
          ]}
        >
          <div className="Ente-details">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={t("common:name")} validateStatus={errors.name ? "error" : undefined} help={errors.name}>
                    <Input
                      placeholder={t("employees.ph.fullName")}
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, name: e.target.value }); setErrors((p) => ({ ...p, name: "" })); }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t("common:email")} validateStatus={errors.email ? "error" : undefined} help={errors.email}>
                    <Input
                      placeholder={t("employees.ph.email")}
                      value={formData.email}
                      disabled={selectedItem === "edit"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, email: e.target.value }); setErrors((p) => ({ ...p, email: "" })); }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={t("common:phone")}>
                    <Input
                      placeholder={t("employees.ph.phone")}
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t("employees.field.address")}>
                    <Input
                      placeholder={t("employees.ph.address")}
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {selectedItem === "add" && (
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label={t("employees.field.password")} validateStatus={errors.password ? "error" : undefined} help={errors.password}>
                      <Input.Password
                        placeholder={t("employees.ph.password")}
                        value={formData.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, password: e.target.value }); setErrors((p) => ({ ...p, password: "" })); }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={t("employees.field.assignRole")} validateStatus={errors.roleId ? "error" : undefined} help={errors.roleId}>
                    <Select
                      className="w-100"
                      placeholder={t("employees.ph.selectRole")}
                      value={formData.roleId || undefined}
                      onChange={(value: string) => { setFormData({ ...formData, roleId: value }); setErrors((p) => ({ ...p, roleId: "" })); }}
                      options={roleData.map((item: any) => ({ label: item.roleName, value: item.id }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t("common:status")}>
                    <Select
                      className="w-100"
                      value={formData.status}
                      onChange={(value: string) => setFormData({ ...formData, status: value })}
                      options={EMPLOYEE_STATUS.map((s) => ({ label: s, value: s }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal>

        <Modal
          open={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title={
            selectedItem === "edit" ? t("employees.modal.updateTitle")
            : selectedItem === "add" ? t("employees.addNew")
            : t("employees.modal.deleteTitle")
          }
          footer={[
            <Button key="no" onClick={() => setShowConfirmModal(false)}>{t("common:no")}</Button>,
            <Button key="yes" type="primary" onClick={selectedItem === "delete" ? handleDeleteConfirmed : handleSave}>
              {t("common:yes")}
            </Button>,
          ]}
        >
          <p className="mb-0">
            {selectedItem === "edit" ? t("confirm.update")
              : selectedItem === "add" ? t("confirm.add")
              : t("confirm.delete")}
          </p>
        </Modal>
      </div>
    </>
  );
};

export default Employees;
