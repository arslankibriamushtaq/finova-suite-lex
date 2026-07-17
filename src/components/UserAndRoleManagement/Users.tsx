import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Menu, Select, Tabs, Modal, Input, Form } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  createUser,
  departmentList,
  getRolesList,
  getUsers,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";
import MaskedValue from "../MaskedValue";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const Users = () => {
  const { t } = useTranslation("adminMisc");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [department, setDepartment] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rowData, setRowData] = useState<any>({});
  const [roleData, setRoleData] = useState<any>([]);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    cnic: "",
    department_id: "",
    role: "",
    designation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      setSkelitonLoading(true);
      departmentList().then((res) => {
        if (res) {
          const data = res.data.data;
          setDepartment(data || []);

          getAllUsers();
        }
      });
    } catch (error: any) {
      console.error("Error fetching  Departments:", error);
      setSkelitonLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      setSkelitonLoading(true);
      getRolesList().then((res) => {
        if (res) {
          const data = res.data.data;
          setRoleData(data || []);

          getAllUsers();
        }
      });
    } catch (error: any) {
      console.error("Error fetching  Departments:", error);
      setSkelitonLoading(false);
    }
  }, []);
  useEffect(() => {
    getAllUsers();
  }, [page, pageSize]);

  const getAllUsers = async () => {
    setSkelitonLoading(true);
    try {
      const res = await getUsers(page, pageSize);
      if (res) {
        if (res?.data?.success) {
          const data = res.data.data?.data;
          setData(data || []);
          setSkelitonLoading(false);
          setTotalRows(res?.data?.data?.total || 0);
          setFrom(res?.data?.data?.from || 0);
          setTo(res?.data?.data?.to || 0);
          setPage(res?.data?.data?.current_page);
          setTotalPage(res?.data?.data?.last_page);
        }
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setSkelitonLoading(false);
    }
  };

  const handleMenuClick = (action: string, data) => {
    setRowData(data);
    switch (action) {
      case "edit":
        setSelectedItem("edit");
        setFormValues({
          name: data?.Name,
          email: data?.email,
          password: data?.password,
          password_confirmation: data?.password_confirmation,
          phone: data?.phone,
          cnic: data?.cnic,
          department_id: data?.department_id,
          role: data?.role,
          designation: data?.designation,
        });
        setErrors({});
        setIsModalVisible(true);
        break;
      case "delete":
        // setIsDeleteModalVisible(true);

        break;
      default:
        break;
    }
  };

  const menu = (row: any) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", "edit")}
      >
        {t("common:delete")}
      </Menu.Item>
    </Menu>
  );
  // Close popup when clicking outside
  const Activity_Loans_Header = [
    {
      name: t("ui.sr"),
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
    },
    {
      name: t("common:name"),
      selector: (row: { name: any }) => row.name,
      sortable: true,
    },
    {
      name: t("common:email"),
      selector: (row: { email: any }) => row.email,
      sortable: true,
    },
    {
      name: t("common:phone"),
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
    },
    {
      name: t("users.col.cnic"),
      cell: (row: any) => (
        <MaskedValue value={row.cnic} showToggle={false} unmaskedCount={4} />
      ),
      width: "200px",
      sortable: true,
    },

    {
      name: t("users.col.designation"),
      selector: (row: { designation: any }) => row.designation,
      sortable: true,
    },
    {
      name: t("users.col.department"),
      selector: (row: { department: any }) => row.department,
      sortable: true,
    },
    {
      name: t("users.col.role"),
      selector: (row: { role: any }) => row.role,
      sortable: true,
    },
    {
      name: t("common:createdAt"),
      selector: (row: { created_at: any }) => row.created_at,
      sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: { status: any }) => (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor:
              row.status === "active"
                ? "var(--color-success)"
                : row.status === "inactive"
                ? "var(--color-error)"
                : "transparent",
            color: "white",
            cursor: row.status === "active" ? "pointer" : "default",
          }}
        >
          {row.status.toUpperCase()}
        </div>
      ),
    },
    {
      name: t("common:actions"),

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "var(--color-action) !important",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("common:select")} <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        Id: item?.id,
        Sr: index + from,
        name: item?.name,
        email: item?.email,
        phone: item?.phone,
        cnic: item?.cnic,
        designation: item?.designation,
        department: getDepartmentName(item?.department_id) || "-",
        role: item?.role || "-",
        created_at: item?.created_at,
        status: item?.status,
      };
    });
  function getDepartmentName(id: any) {
    const data = department.find((data: any) => data.id === id);
    return data ? data.name : "-";
  }
  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };
  const handleOk = async () => {
    let validationErrors: Record<string, string> = {};

    if (!formValues.name) {
      validationErrors.name = t("users.valid.name");
    }
    setErrors(validationErrors);

    // if there are errors, stop submission
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsLoading(true);

      if (selectedItem === "edit") {
        // For update, include the ID in the body
        const updateBody = {
          ...formValues,
          id: rowData?.id, // Include the ID from the selected row
        };

      } else {
        await toast.promise(
          createUser(formValues), // API call
          {
            loading: t("users.toast.adding"),
            success: (response) => {
              if (response?.data?.success) {
                setFormValues({
                  name: "",
                  email: "",
                  password: "",
                  password_confirmation: "",
                  phone: "",
                  cnic: "",
                  department_id: "",
                  role: "",
                  designation: "",
                });
                getUsers(page, pageSize);
                setOpenModal(false);
                return t("users.toast.addSuccess");
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.message ||
                    t("users.toast.addFailed")
                );
              }
            },
            error: (err) =>
              err?.message ||
              t("users.toast.addError"),
          }
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubType = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "Users.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Sr",
      "Name",
      "Email",
      "Phone",
      "Cnic",
      "Designation",
      "Department",
      // "Role",
      // "Created At",
      "Status",
    ];

    const tableRows = mappedData?.map((item: any) => [
      item.Sr,
      item.name,
      item.email,
      item.phone,
      item.cnic,
      item.designation,
      item.department,
      // item.role,
      // item.created_at,
      item.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Users.pdf");
  };
  return (
    <>
      <div className="service">
        <div className="d-flex justify-content-end  col-12">
          <Select
            mode="tags"
            style={{ width: "15%", borderTopRightRadius: "0px" }}
            // onChange={handleChange}
            placeholder={t("common:filter")}
            tokenSeparators={[","]}
            suffixIcon={<FaFilter />}
          />

          <div className="d-flex gap-2 w-100">
            <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
              <img src={Images.searchIconGray} alt="" />
              <input
                type="text"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                }}
                className="p-2"
                placeholder={t("ui.searchPlaceholder")}
              />
            </div>
            <button className="invoice-btn" onClick={exportToExcel}>
            {t("ui.excel")}
          </button>
          <button
            className="invoice-btn"
            onClick={() => {
              exportToPDF();
            }}
          >
            {t("ui.pdf")}
          </button>
            <button className="invoice-btn">{t("common:print")}</button>
            <button
              className="theme-btn"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              {t("users.addBtn")}
            </button>
          </div>
        </div>

        <TableView
          header={Activity_Loans_Header}
          data={mappedData}
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={from}
          page={page}
          pageSize={pageSize}
          totalPage={totalPage}
          setPage={setPage}
          setPageSize={setPageSize}
          to={to}
        />
      </div>
      <Modal maskClosable={false} keyboard={false}
        className="custom-mod"
        style={{ maxWidth: "732px" }}
        title={selectedItem === "edit" ? t("users.modal.editTitle") : t("users.modal.addTitle")}
        visible={openModal}
        // onCancel={handleCancel}
        footer={[
          <div className="w-100">
            <Button
              key="close"
              onClick={() => {
                setOpenModal(false);
              }}
            >
              {t("common:close")}
            </Button>
            ,
            <button
              key="save"
              className="theme-btn"
              // disabled={isLoading}
              onClick={handleOk}
            >
              {selectedItem === "edit" ? t("common:edit") : t("common:add")}
            </button>
            ,
          </div>,
        ]}
      >
        <div className={"Ente-details"}>
          <Form>
            <div className="d-flex gap-4 align-items-center">
              {/* Name Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">{t("common:name")}</label>
                  <Input
                    placeholder={t("users.form.namePlaceholder")}
                    className="fs-6"
                    value={formValues.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
              </Form.Item>

              {/* Status Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">{t("common:email")}</label>
                  <Input
                    placeholder={t("users.form.emailPlaceholder")}
                    className="fs-6"
                    value={formValues.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
              </Form.Item>
            </div>
            <div className="d-flex gap-4 align-items-center">
              {/* Name Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">{t("users.form.password")}</label>
                  <Input
                    placeholder={t("users.form.passwordPlaceholder")}
                    className="fs-6"
                    value={formValues.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </div>
              </Form.Item>

              {/* Status Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">{t("users.form.confirmPassword")}</label>
                  <Input
                    placeholder={t("users.form.confirmPasswordPlaceholder")}
                    className="fs-6"
                    value={formValues.password_confirmation}
                    onChange={(e) =>
                      handleChange("password_confirmation", e.target.value)
                    }
                  />
                </div>
              </Form.Item>
            </div>
            <div className="d-flex gap-4 align-items-center">
              {/* Name Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">{t("users.form.phoneNo")}</label>
                  <Input
                    placeholder={t("users.form.phonePlaceholder")}
                    className="fs-6"
                    value={formValues.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </Form.Item>

              {/* Status Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">{t("users.form.cnic")}</label>
                  <Input
                    placeholder={t("users.form.cnicPlaceholder")}
                    className="fs-6"
                    value={formValues.cnic}
                    onChange={(e) => handleChange("cnic", e.target.value)}
                  />
                </div>
              </Form.Item>
            </div>
            <div className="d-flex gap-4 align-items-center">
              {/* Name Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">{t("users.form.assignDept")}</label>
                  <Select
                    value={formValues.department_id} // will hold the selected ID
                    onChange={(value) => handleSubType("department_id", value)}
                    style={{ width: "100%", marginTop: "0" }}
                    placeholder={t("users.form.selectDeptPlaceholder")}
                  >
                    {department.map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Form.Item>

              {/* Status Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">{t("users.form.assignRole")}</label>
                  <Select
                    value={formValues.role} // will hold the selected ID
                    onChange={(value) => handleSubType("role", value)}
                    style={{ width: "100%", marginTop: "0" }}
                    placeholder={t("users.form.selectRolePlaceholder")}
                  >
                    {roleData.map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Form.Item>
            </div>
            <div className="d-flex align-items-center">
              {/* Name Field */}
              <Form.Item className="w-50">
                <div className="custom-input-container">
                  <label className="input-label">{t("users.form.designation")}</label>
                  <Input
                    placeholder={t("users.form.designationPlaceholder")}
                    className="fs-6"
                    value={formValues.designation}
                    onChange={(e) =>
                      handleChange("designation", e.target.value)
                    }
                  />
                </div>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default Users;
