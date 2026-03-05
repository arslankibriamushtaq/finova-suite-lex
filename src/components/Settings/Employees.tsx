import { useEffect, useState } from "react";
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
  Switch,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import TableView from "../TableView/TableView";
// import { FaFilter } from "react-icons/fa";
// import { Images } from "../Config/Images";
// import { getRoles, getEmployess, addEmployee, updateEmployee, deleteEmployess, resendLoginEmail, getDepartmentsList } from "../../redux/apis/apisCrud";
import {
  getEmployees,
  storeEmployee,
  updateEmployee,
  deleteEmployee,
  getRoles,
  getDepartments,
} from "../../redux/apis/apisCrudFactoring";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
// import { RedditCircleFilled, RedditOutlined, RocketFilled, SendOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { usePermissions, EMPLOYEE_PERMISSIONS } from "../../hooks/useProductPermissions";
// import { useWorkflowActions, WORKFLOW_MODULE_NAMES } from "../../hooks/useProductPermissions";
// import { CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined, StopOutlined } from "@ant-design/icons";

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
  return result
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

const Employees = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [searchByName, setSearchByName] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    dob: dayjs.Dayjs | null;
    role_id: string;
    department_id: string;
    status: boolean;
    send_mail: boolean;
  }>({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    dob: null,
    role_id: "",
    department_id: "",
    status: false,
    send_mail: false,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { canCreate, canUpdate, canRemove } = usePermissions();
  const canCreateEmployee = canCreate(EMPLOYEE_PERMISSIONS);
  const canEditEmployee = canUpdate(EMPLOYEE_PERMISSIONS);
  const canDeleteEmployee = canRemove(EMPLOYEE_PERMISSIONS);
  const hasAnyAction = canEditEmployee || canDeleteEmployee;

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      const originalData = data.find((item: any) => item.id === row.id);
      setSelectedItem("edit");
      setCurrentEmployeeId(row.id);
      const rawPhone = originalData?.phone || "";
      const displayPhone = rawPhone.replace(/^(\+?966)?\s*/, "");
      setFormData({
        name: originalData?.name || "",
        email: originalData?.email || "",
        password: "",
        phone: displayPhone,
        address: originalData?.address || "",
        dob: originalData?.dob ? dayjs(originalData.dob) : null,
        role_id: originalData?.roles?.[0]?.id ?? "",
        department_id: originalData?.department?.id ?? "",
        status: !!originalData?.status,
        send_mail: !!originalData?.send_mail,
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
      {/* {canEditEmployee && ( */}
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleMenuClick("edit", row)}>
          Edit
        </Menu.Item>
      {/* )} */}
      {/* {canDeleteEmployee && ( */}
        <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleMenuClick("delete", row)}>
          Delete
        </Menu.Item>
      {/* )} */}
    </Menu>
  );
  const tableColumns = [
    { name: "User Name", selector: (row: any) => row.name, width: "15%" },
    { name: "Email", selector: (row: any) => row.email, width: "30%" },
    { name: "Department", selector: (row: any) => row.department, width: "20%" },
    { name: "Employee Role", selector: (row: any) => row.employeeRole, width: "15%" },
    {
      name: "Status",
      width: "10%",
      cell: (row: any) => {
        const isActive =
          row.status === "active" || row.status === 1 || row.status === true;
        return (
          <span
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              borderRadius: "32px",
              backgroundColor: isActive ? "var(--color-success)" : "var(--color-error)",
              color: "white",
              display: "inline-block",
            }}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    /* ...(hasAnyAction
      ? [ */
          {
            name: "Action",
            width: "10%",
            cell: (row: any) => (
              <Dropdown overlay={menu(row)} trigger={["click"]}>
                <Button
                  className="gradient-btn"
                  type="primary"
                  style={{ fontSize: "12px", borderRadius: "4px", padding: "8px" }}
                >
                  Select
                  <img src={arrowDown} alt="" />
                </Button>
              </Dropdown>
            ),
          },
       /*  ]
      : []), */
  ];

  useEffect(() => {
    getRoleData();
    getDepartmentsData();
  }, []);

  useEffect(() => {
    getEmployeesData();
  }, [page, pageSize]);

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
          return response?.data?.message;
        },
        error: (err: any) => err?.response?.data?.message || err?.message || "Failed to delete employee",
      });
    } catch (error) {
      setShowConfirmModal(false);
      setDeleteTargetId(null);
    }
  };

  const buildFormBody = (): FormData => {
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("email", formData.email);
    fd.append("phone", formData.phone || "");
    fd.append("address", formData.address || "");
    fd.append("dob", formData.dob ? formData.dob.format("YYYY/MM/DD") : "");
    fd.append("role_id", String(formData.role_id));
    fd.append("department_id", String(formData.department_id));
    fd.append("status", formData.status ? "1" : "0");
    fd.append("send_mail", formData.send_mail ? "1" : "0");
    /* if (selectedItem === "add" && formData.password) {
      fd.append("password", formData.password);
    } */
    return fd;
  };

  const handleSave = async () => {
    const body = buildFormBody();
    try {
      if (selectedItem === "edit" && currentEmployeeId !== null) {
        await toast.promise(updateEmployee(currentEmployeeId, body), {
          loading: "Updating employee...",
          success: (response: any) => {
            setShowModal(false);
            setShowConfirmModal(false);
            setSelectedItem(null);
            setCurrentEmployeeId(null);
            resetForm();
            getEmployeesData();
            return response?.data?.message;
          },
          error: (err: any) => {
            const msg = err?.response?.data?.message;
            if (err?.response?.data?.errors && typeof err.response.data.errors === "object") {
              const firstKey = Object.keys(err.response.data.errors)[0];
              return err.response.data.errors[firstKey]?.[0] || msg || "Validation failed.";
            }
            return msg || err?.message || "Failed to update employee";
          },
        });
      } else if (selectedItem === "add") {
        await toast.promise(storeEmployee(body), {
          loading: "Adding employee...",
          success: (response: any) => {
            setShowModal(false);
            setShowConfirmModal(false);
            setSelectedItem(null);
            setCurrentEmployeeId(null);
            resetForm();
            getEmployeesData();
            return response?.data?.message;
          },
          error: (err: any) => {
            const msg = err?.response?.data?.message;
            if (err?.response?.data?.errors && typeof err.response.data.errors === "object") {
              const firstKey = Object.keys(err.response.data.errors)[0];
              return err.response.data.errors[firstKey]?.[0] || msg || "Validation failed.";
            }
            return msg || err?.message || "Failed to add employee";
          },
        });
      }
    } catch (error) {
      setShowConfirmModal(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      dob: null,
      role_id: "",
      department_id: "",
      status: false,
      send_mail: false,
    });
  };

  const openAddModal = () => {
    setShowModal(true);
    setSelectedItem("add");
    setFormData({
      name: "",
      email: "",
      password: generatePassword(),
      phone: "",
      address: "",
      dob: null,
      role_id: "",
      department_id: "",
      status: false,
      send_mail: false,
    });
  };

  const getEmployeesData = async () => {
    setSkelitonLoading(true);
    try {
      const res = await getEmployees(page, pageSize);
      if (res?.data?.success && res?.data?.data) {
        const payload = res.data.data;
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setData(list);
        const total = payload?.total ?? list.length;
        setTotalRows(total);
        setTotalPage(payload?.last_page ?? 1);
        setFrom(((payload?.current_page ?? 1) - 1) * pageSize + 1);
        setTo(Math.min((payload?.current_page ?? 1) * pageSize, total));
      }
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      setData([]);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const getDepartmentsData = async () => {
    try {
      const res = await getDepartments(1, 500);
      if (res?.data?.success && res?.data?.data) {
        const payload = res.data.data;
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setDepartmentData(list);
      }
    } catch (error: any) {
      console.error("Error fetching departments:", error);
    }
  };

  const mappedData =
    data?.map((item: any) => ({
      id: item?.id,
      name: item?.name || "-",
      email: item?.email || "-",
      department: item?.department?.name || "-",
      employeeRole: item?.roles?.[0]?.name || "-",
      status: item?.status,
    })) ?? [];
  const getRoleData = async () => {
    try {
      const res = await getRoles(1, 500);
      if (res?.data?.success && res?.data?.data) {
        const payload = res.data.data;
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setRoleData(list);
      }
    } catch (error: any) {
      console.error("Error fetching roles:", error);
    }
  };
  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "10px" }}
      >
        <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-nowrap">
          <h5 className="mb-0 fw-600" style={{ whiteSpace: "nowrap" }}>
            Employees List
          </h5>
          <Select
            style={{marginLeft: "auto", maxWidth: 250 }}
            placeholder="All Departments"
            value={departmentFilter || undefined}
            onChange={(v) => setDepartmentFilter(v ?? "")}
            allowClear
            options={departmentData.map((d: any) => ({ label: d.name, value: String(d.id) }))}
          />
          {/* <Input
            placeholder="Search By Name"
            value={searchByName}
            onChange={(e) => setSearchByName(e.target.value)}
            style={{ width: 200, flexShrink: 0 }}
            allowClear
          /> */}
          <button
            className="theme-btn-next"
            onClick={openAddModal}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Add New Employee
          </button>
        </div>
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

        <Modal
          className="custom-mod"
          style={{ maxWidth: "764px" }}
          title={selectedItem === "edit" ? "Update User" : "Add New User"}
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowModal(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => {
                setShowConfirmModal(true);
                setShowModal(false);
              }}
            >
              Save
            </Button>,
          ]}
        >
          <div className="Ente-details">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="User Name">
                    <Input
                      className="fs-6"
                      placeholder="User Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="User Email">
                    <Input
                      className="fs-6"
                      placeholder="User Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={selectedItem === "edit"}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {selectedItem === "add" && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="User Password"
                      
                    >
                      <Input
                        className="fs-6"
                        placeholder=""
                        value={formData.password}
                        style={{color: "black", cursor: "not-allowed" }}
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Phone">
                    <Input
                      className="fs-6"
                      placeholder="Contact No"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      addonBefore="+966"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Address">
                    <Input
                      className="fs-6"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="DOB (Date of Birth)">
                    <DatePicker
                      className="w-100 fs-6"
                      placeholder="yyyy/mm/dd"
                      format="YYYY/MM/DD"
                      value={formData.dob}
                      onChange={(date) => setFormData({ ...formData, dob: date })}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Assign Role">
                    <Select
                      className="w-100 fs-6"
                      placeholder="Assign Role"
                      value={formData.role_id || undefined}
                      onChange={(value) => setFormData({ ...formData, role_id: value })}
                      options={roleData.map((item: any) => ({ label: item.name, value: item.id }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Assign Department">
                    <Select
                      className="w-100 fs-6"
                      placeholder="Assign Department"
                      value={formData.department_id || undefined}
                      onChange={(value) => setFormData({ ...formData, department_id: value })}
                      options={departmentData.map((item: any) => ({ label: item.name, value: item.id }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} className="mt-2">
                <Col span={12}>
                  <Form.Item label="Status">
                    <Switch
                      checked={formData.status}
                      onChange={(checked) => setFormData({ ...formData, status: checked })}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Send Details Via Mail">
                    <Switch
                      checked={formData.send_mail}
                      onChange={(checked) => setFormData({ ...formData, send_mail: checked })}
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
            selectedItem === "edit"
              ? "Edit Record"
              : selectedItem === "add"
                ? "Add New Record"
                : "Delete Record"
          }
          footer={[
            <Button key="no" onClick={() => setShowConfirmModal(false)}>
              No
            </Button>,
            <Button
              key="yes"
              type="primary"
              onClick={
                selectedItem === "delete" ? handleDeleteConfirmed : handleSave
              }
            >
              Yes
            </Button>,
          ]}
        >
          <p className="mb-0">
            {selectedItem === "edit"
              ? "Are you sure you want to update this record?"
              : selectedItem === "add"
                ? "Are you sure you want to add new record?"
                : "Are you sure you want to delete this record?"}
          </p>
        </Modal>
      </div>
    </>
  );
};

export default Employees;
