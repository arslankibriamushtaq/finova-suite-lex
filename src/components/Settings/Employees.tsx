import React, { useEffect, useState } from "react";
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
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleMenuClick("delete", row)}>
        Delete
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
    { name: "Name", selector: (row: any) => row.name },
    { name: "Email", selector: (row: any) => row.email },
    { name: "Phone", selector: (row: any) => row.phone },
    { name: "Role", selector: (row: any) => row.roleName },
    {
      name: "Status",
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
      name: "Action",
      width: "10%",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button className="gradient-btn" type="primary" style={{ fontSize: "12px", borderRadius: "4px", padding: "8px" }}>
            Select
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
        loading: "Deleting Employee...",
        success: (response: any) => {
          getEmployeesData();
          setShowConfirmModal(false);
          setDeleteTargetId(null);
          setSelectedItem(null);
          return response?.data?.message || "Employee deleted.";
        },
        error: (err: any) => err?.response?.data?.message || err?.message || "Failed to delete employee",
      });
    } catch (error) {
      setShowConfirmModal(false);
      setDeleteTargetId(null);
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
          loading: "Updating employee...",
          success: (response: any) => {
            setShowModal(false);
            setShowConfirmModal(false);
            setSelectedItem(null);
            setCurrentEmployeeId(null);
            setFormData(emptyForm);
            getEmployeesData();
            return response?.data?.message || "Employee updated.";
          },
          error: (err: any) => err?.response?.data?.message || err?.message || "Failed to update employee",
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
          loading: "Adding employee...",
          success: (response: any) => {
            setShowModal(false);
            setShowConfirmModal(false);
            setSelectedItem(null);
            setFormData(emptyForm);
            getEmployeesData();
            return response?.data?.message || "Employee added.";
          },
          error: (err: any) => err?.response?.data?.message || err?.message || "Failed to add employee",
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
          <h3 className="mb-0 fw-bold text-dark">Employees List</h3>
        </div>

        {/* Filters card */}
        <div
          className="bg-white p-3 mb-3"
          style={{
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="d-flex flex-wrap align-items-center gap-2 w-100">
            <Input
              allowClear
              placeholder="Search by name, email, phone, status"
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
            />
            <button
              className="theme-btn-next"
              onClick={() => {
                setShowModal(true);
                setSelectedItem("add");
                setFormData({ ...emptyForm, password: generatePassword() });
              }}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Add New Employee
            </button>
          </div>
        </div>

        {/* Table card */}
        <div
          className="bg-white"
          style={{
            borderRadius: 12,
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
          title={selectedItem === "edit" ? "Update Employee" : "Add New Employee"}
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowModal(false)}>Cancel</Button>,
            <Button key="save" type="primary" onClick={() => { setShowConfirmModal(true); setShowModal(false); }}>
              Save
            </Button>,
          ]}
        >
          <div className="Ente-details">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Name">
                    <Input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email">
                    <Input
                      placeholder="Email"
                      value={formData.email}
                      disabled={selectedItem === "edit"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Phone">
                    <Input
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Address">
                    <Input
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {selectedItem === "add" && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Password">
                      <Input.Password
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Assign Role">
                    <Select
                      className="w-100"
                      placeholder="Select Role"
                      value={formData.roleId || undefined}
                      onChange={(value: string) => setFormData({ ...formData, roleId: value })}
                      options={roleData.map((item: any) => ({ label: item.roleName, value: item.id }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Status">
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
            selectedItem === "edit" ? "Update Employee"
            : selectedItem === "add" ? "Add New Employee"
            : "Delete Employee"
          }
          footer={[
            <Button key="no" onClick={() => setShowConfirmModal(false)}>No</Button>,
            <Button key="yes" type="primary" onClick={selectedItem === "delete" ? handleDeleteConfirmed : handleSave}>
              Yes
            </Button>,
          ]}
        >
          <p className="mb-0">
            {selectedItem === "edit" ? "Are you sure you want to update this record?"
              : selectedItem === "add" ? "Are you sure you want to add new record?"
              : "Are you sure you want to delete this record?"}
          </p>
        </Modal>
      </div>
    </>
  );
};

export default Employees;
