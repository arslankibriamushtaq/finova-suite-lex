import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Form, Input, Select, Switch, Modal, Dropdown, Menu } from "antd";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { deleteAdmin, getProductAdminList, createAdmin, updateAdmin, getCountries } from "../../redux/apis/apisCrud";
import { EditFilled, DeleteFilled, EyeOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";

const AdminList = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [updateId, setUpdateId] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [countries, setCountries] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("id");

  // Function to get country ID by name
  const getCountryIdByName = (countryName: string) => {
    const country = countries.find((country: any) => country.country_name === countryName);
    return country ? country.id : null;
  };

  const AdminList_Header = [
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
      width: "200px",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: { email: any }) => row.email,
      width: "250px",
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone,
      width: "150px",
      sortable: true,
    },
    {
      name: "Address",
      selector: (row: { address: any }) => row.address,
      width: "200px",
      sortable: true,
    },
    {
      name: "DOB",
      selector: (row: { dob: any }) => row.dob,
      width: "120px",
      sortable: true,
    },
    {
      name: "Country",
      selector: (row: { country: any }) => row.country,
      width: "150px",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor:
              row.status === "Active" || row.status === 1 || row.status === true
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === "Inactive" || row.status === 0 || row.status === false
                ? "#BC3D3F"
                : "#FF9811",
            color: "white",
            cursor: row.status === "Active" || row.status === 1 || row.status === true ? "pointer" : "default",
          }}
        >
          {row.status === "Active" || row.status === 1 || row.status === true ? "Active" : "Inactive"}
        </div>
      ),
      width: "120px",
    },
    {
      name: "Registered Date",
      selector: (row: { registered_date: any }) => row.registered_date,
      width: "180px",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#0B8085 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
      width: "150px",
    },
  ];

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        View Details
      </Menu.Item>
      <Menu.Item
        key="edit"
        icon={<EditFilled />}
        onClick={() => handleMenuClick("edit", row)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteFilled />}
        onClick={() => handleMenuClick("delete", row)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = (key: string, row: any) => {
    setSelectedItem(key);

    switch (key) {
      case "view":
        setShowModal(true);
        setIsViewOnly(true);
        // Remove 966 prefix if it exists for display
        const displayRow = {
          ...row,
          phone: row.phone?.startsWith('966') ? row.phone.substring(3) : row.phone,
          country: row.country_id || row.country,
          status: row.status === 1 || row.status === true || row.status === "Active"
        };
        form.setFieldsValue(displayRow);
        break;

      case "edit":
        setShowModal(true);
        setIsViewOnly(false);
        // Remove 966 prefix if it exists for editing and ensure country_id is a number
        const editRow = {
          ...row,
          phone: row.phone?.startsWith('966') ? row.phone.substring(3) : row.phone,
          country: getCountryIdByName(row.country) || row.country_id || row.country, // Get country ID by name
          status: row.status === "Active" // Convert status to boolean
        };
        
        form.setFieldsValue(editRow);
        setUpdateId(row?.id);
        break;

      case "delete":
        handleDelete(row);
        break;

      default:
        break;
    }
  };

  const handleDelete = (row: any) => {
    setDeleteItem(row);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    
    setIsLoading(true);
    try {
      
      const response = await deleteAdmin(deleteItem.id, productId);
      
      toast.success(response?.data?.message || "Admin deleted successfully");
      fetchAdminList(); // Refresh the list
      setIsDeleteModalVisible(false);
      setDeleteItem(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      console.error("Error response:", error?.response?.data);
      
      // Check for specific error messages
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          "Failed to delete admin";
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchAdminList = async () => {
    try {
      setSkelitonLoading(true);
      
      const response = await getProductAdminList(productId);
      
      if (response?.data?.success) {
        const adminData = response?.data?.data?.data || [];
        setData(adminData);
        setSkelitonLoading(false);
        setTotalRows(adminData.length);
        setFrom(1);
        setTo(adminData.length);
        setPage(1);
        setTotalPage(1);
        toast.success(response?.data?.message || "Admin list fetched successfully");
      } else {
        toast.error(response?.data?.message || "Failed to fetch admin list");
        setSkelitonLoading(false);
      }
      
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch admin list");
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await getCountries();
      if (response?.data?.success) {
        setCountries(response?.data?.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching countries:", error);
    }
  };

  const addAdmin = async () => {
    try {
      const values = await form.validateFields();
      const adminData = {
        name: values.name,
        phone: values.phone, // Send exactly as entered (without 966)
        email: values.email,
        dob: values.dob,
        address: values.address,
        country_id: parseInt(values.country), // Ensure it's a number
        password: values.password,
        status: values.status ? 1 : 0
      };

     
    

      await createAdmin(productId, adminData);
      toast.success("Admin created successfully");
      setShowModal(false);
      form.resetFields();
      fetchAdminList();
    } catch (error: any) {
      console.error("Add Admin Error:", error);
      toast.error(error?.message || "Failed to create admin");
    }
  };

  const editAdmin = async () => {
    try {
      const values = await form.validateFields();
      const adminData = {
        name: values.name,
        phone: values.phone, // Send exactly as entered (without 966)
        email: values.email,
        dob: values.dob,
        address: values.address,
        country_id: parseInt(values.country), // Ensure it's a number
        password: values.password,
        status: values.status
      };

  

     const response = await updateAdmin(updateId, adminData);
      toast.success(response?.data?.message || "Admin updated successfully");
      setShowModal(false);
      form.resetFields();
      fetchAdminList();
    } catch (error: any) {
      console.error("Edit Admin Error:", error);
      toast.error(error?.message || "Failed to update admin");
    }
  };

  useEffect(() => {
    if (productId) {
      fetchAdminList();
      fetchCountries();
    }
  }, [productId, page, pageSize]);

  // Reset form when modal opens for add
  useEffect(() => {
    if (showModal && selectedItem === "add") {
      form.resetFields();
    }
  }, [showModal, selectedItem, form]);

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        name: item?.name || "-",
        email: item?.email || "-",
        phone: item?.phone || "-",
        address: item?.address || "-",
        dob: item?.dob || "-",
        country: item?.country || "-",
        status: item?.status === 1 || item?.status === true || item?.status === "Active" ? "Active" : "Inactive",
        registered_date: item?.registered_date || item?.created_at || "-",
      };
    });
    
  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Admin List</h4>
        <button 
          className="theme-btn-next"
          onClick={() => {
            setShowModal(true);
            setSelectedItem("add");
            setIsViewOnly(false);
            form.resetFields();
          }}
        >
          Add Admin
        </button>
      </div>
      <TableView
        header={AdminList_Header}
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
        style={{ maxWidth: "732px" }}
        title={selectedItem === "edit" ? "Edit Admin" : selectedItem === "view" ? "View Admin" : "Add Admin"}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)}>
            Cancel
          </Button>,
          !isViewOnly && (
            <Button
              key="save"
              type="primary"
              onClick={() => {
                if (selectedItem === "edit") {
                  editAdmin();
                } else {
                  addAdmin();
                }
              }}
            >
              {selectedItem === "edit" ? "Update" : "Add"}
            </Button>
          ),
        ]}
      >
        <div className={"Ente-details"}>
          <Form form={form} layout="vertical">
            <div className="d-flex col-12 gap-2 mb-2">
              <div className="col-6">
                <Form.Item label="Admin Name" name="name" rules={[{ required: true, message: "Please enter admin name" }]}>
                  <Input placeholder="Enter Admin Name" disabled={isViewOnly} />
                </Form.Item>
              </div>
              <div className="col-6">
                <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter email" }]}>
                  <Input placeholder="Enter Email" disabled={isViewOnly} />
                </Form.Item>
              </div>
            </div>

            <div className="d-flex col-12 gap-2 mb-2">
              <div className="col-6">
                <Form.Item 
                  label="Phone" 
                  name="phone" 
                  rules={[
                    { required: true, message: "Please enter phone" },
                    { 
                      pattern: /^\d{9}$/, 
                      message: "Phone number must contain exactly 9 digits (without country code)" 
                    }
                  ]}
                >
                  <Input 
                    placeholder="Enter 9-digit phone number (without 966)" 
                    disabled={isViewOnly}
                    maxLength={9}
                    onChange={(e) => {
                      // Only allow digits
                      const value = e.target.value.replace(/\D/g, '');
                      e.target.value = value;
                    }}
                  />
                </Form.Item>
              </div>
              <div className="col-6">
                <Form.Item label="Address" name="address" rules={[{ required: true, message: "Please enter address" }]}>
                  <Input placeholder="Enter Address" disabled={isViewOnly} />
                </Form.Item>
              </div>
            </div>

            <div className="d-flex col-12 gap-2 mb-2">
              <div className="col-6">
                <Form.Item label="Date of Birth" name="dob" rules={[{ required: true, message: "Please enter DOB" }]}>
                  <Input type="date" disabled={isViewOnly} />
                </Form.Item>
              </div>
              <div className="col-6">
                <Form.Item 
                  label="Country" 
                  name="country" 
                  rules={[{ required: true, message: "Please select country" }]}
                >
                  <Select 
                    placeholder="Select Country" 
                    disabled={isViewOnly}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {countries.map((country: any) => (
                      <Select.Option key={country.id} value={country.id}>
                        {country.country_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className="d-flex col-12 gap-2 mb-2">
              <div className="col-6">
                <Form.Item 
                  label="Password" 
                  name="password" 
                  rules={[{ required: true, message: "Please enter password" }]}
                >
                  <Input 
                    type="password" 
                    placeholder="Enter Password" 
                    disabled={isViewOnly} 
                  />
                </Form.Item>
              </div>
              <div className="col-6 d-flex align-items-end  ">
                <Form.Item name="status" valuePropName="checked" >
                   <label className="fw-400 ms-3">Status</label>
                </Form.Item>
               
              </div>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        className="custom-mod center-footer"
        style={{ maxWidth: "378px" }}
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button
            key="no"
            onClick={() => setIsDeleteModalVisible(false)}
            style={{
              border: "1px solid #ccc",
              color: "black",
              background: "white",
              borderRadius: "8px",
              padding: "4px 20px",
              fontWeight: "500",
            }}
          >
            No
          </Button>,
          <Button
            key="yes"
            onClick={handleDeleteConfirm}
            disabled={isLoading}
            style={{
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "4px 20px",
              fontWeight: "500",
            }}
          >
            {isLoading ? "Deleting..." : "Yes"}
          </Button>,
        ]}
        centered
        closable={false}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "0",
            }}
          >
            Are you sure you want to delete this Admin?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default AdminList;