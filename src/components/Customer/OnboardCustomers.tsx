import { useEffect, useRef, useState } from "react";
import { Button, Dropdown, Menu, Select, Tabs, Modal, Input, Form, DatePicker } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  allCustomerStatusChange,
  customersList,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined, MailOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";
import { useNavigate } from "react-router-dom";

import autoTable from "jspdf-autotable";
import MaskedValue from "../MaskedValue";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { usePermissions, ONBOARD_CUSTOMERS_PERMISSIONS } from "../../hooks/useProductPermissions";

const OnboardCustomers = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showDetailsFields, setShowDetailsFields] = useState(false);
  const [status, setStatus] = useState("Active");
  const [rowData, setRowData] = useState<any>({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedValue, setSelectedValue] = useState("today");
  const [search, setSearch] = useState('');
  const [pep, setPep] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Permissions
  const { hasPermission } = usePermissions();
  const canResendEmail = hasPermission(ONBOARD_CUSTOMERS_PERMISSIONS.RESEND_EMAIL);

  const handleOk = () => {
    // Handle save logic here
    if (selectedItem === "details") {
    }
    setIsModalVisible(false);
    setShowDetailsFields(false); // Reset the fields visibility
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setShowDetailsFields(false); // Reset the fields visibility
  };

  const handleStatusChange = async (value: any) => {
    setStatus(value);

    try {
      const body = {
        user_id: value?.user_id,
        status: value?.accountStatus,
      };
      await toast.promise(
        allCustomerStatusChange(body), // The promise to track
        {
          loading: "Changing Status...", // Loading state message
          success: (res) => {
            if (res?.data?.success) {
              setIsModalVisible(false);
              getList();
              return res?.data?.message;
            } else if (res?.data?.errors) {
              throw new Error(res.data.errors[0]); // Force error handling
            }
          },
          error: (err) => {
            console.error("Error occurred:", err);
            return err?.message || "Something went wrong!";
          },
        }
      );
    } catch (error: any) {
      console.error("Error during login:", error);
    }
  };


  const handleMenuClick = (key: string, data: any) => {
    setSelectedItem(key);
    setRowData(data);
    setIsModalVisible(true);
  };



  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        Change Status
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        Delete
      </Menu.Item>
      {canResendEmail && (
        <Menu.Item
          key="resend"
          icon={<MailOutlined />}
          onClick={() => handleMenuClick("resend", row)}
        >
          Resend Login Email
        </Menu.Item>
      )}
    </Menu>
  );
  // Close popup when clicking outside
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      // selector: (row: { Id: any }) => row.Id,
      sortable: true,
      cell: (row: any) => (
        <div
          onClick={() => {
            navigate(`/Customers/CustomerDetails/${row.user_id}`);
          }}
        >
          {row.user_id}
        </div>
      ),
      width: "80px",
    },
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
      sortable: true,
      width: "230px",
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
    },

    {
      name: "Cnic",
      cell: (row: any) => (
        <MaskedValue value={row.cnic} showToggle={false} unmaskedCount={4} />
      ),
      width: "200px",
      sortable: true,
    },
    {
      name: "Total Balance",
      cell: (row: any) => (
        <MaskedValue value={row.accountBalance} showToggle={true} unmaskedCount={0} />
      ),
      width: "200px",
      sortable: true,
    },
    {
      name: "Register Date",
      selector: (row: { UpdatedBy: any }) => row.UpdatedBy,
      sortable: true,
      width: "200px",
    },
    {
      name: "Type",
      selector: (row: { accountType: any }) => row.accountType,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "2px",
            backgroundColor:
              row.accountStatus === "active"
                ? "var(--color-success)"
                : row.accountStatus === "inactive"
                ? "var(--color-error)"
                : "transparent",
            color: "white",
            cursor: row.accountStatus === "active" ? "pointer" : "default",
          }}
        >
          {row.accountStatus == "active" ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Actions",

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
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await customersList(page, pageSize, search, pep, filterStatus);
      if (response) {
        const data = response?.data?.data?.data;
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        setPage(response?.data?.data?.current_page);
        setTotalPage(response?.data?.data?.last_page);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getList();
  }, [page, pageSize, search, pep, filterStatus]);
  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        user_id: item?.aft_detail?.user_id,
        phone: item?.phone || "-",
        cnic: item?.cnic || "-",
        accountBalance: item?.aft_detail?.accountBalance || "-",
        applicationNo: item?.applicationNo || "-",
        accountType: item?.aft_detail?.accountType || "-",
        accountStatus: item?.status || "-",
        UpdatedBy: item?.updated_at || "-",
        name: item?.name || "-",
      };
    });


  return (
    <div className="service">
    

      <Modal
        className="custom-mod"
        title={selectedItem === "edit" ? "Change Status" : "Enter Your Details"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              selectedItem === "edit"
                ? handleStatusChange(rowData)
                : handleOk();
            }}
          >
            {selectedItem === "edit" ? "Save" : "Submit"}
          </Button>,
        ]}
      >
        <div className={selectedItem === "edit" ? "cust-drop" : "Ente-details"}>
          {selectedItem === "edit" ? (
            <>
              <label>Status</label>
              <Select
                defaultValue={rowData?.accountStatus}
                value={rowData?.accountStatus}
                style={{ width: "100%", marginTop: "10px" }}
                onChange={(value: string) => {
                  setRowData({
                    ...rowData,
                    accountStatus: value, // Directly use 'value'
                  });
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </Select>
              <p className="edit-mod">Edit modal content</p>
            </>
          ) : (
            <>
              <Form>
                <Form.Item name="username">
                  <div className="custom-input-container">
                    <label className="input-label">Username</label>
                    <Input placeholder="Enter your username" />
                  </div>
                </Form.Item>
                <Form.Item name="password">
                  <div className="custom-input-container">
                    <label className="input-label">Password</label>
                    <Input.Password placeholder="Enter your password" />
                  </div>
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      </Modal>
      <TableView
        header={Activity_Loans_Header}
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
  );
};

export default OnboardCustomers;
