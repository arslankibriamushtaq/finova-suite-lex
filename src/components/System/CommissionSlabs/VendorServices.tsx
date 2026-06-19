import { useEffect, useState } from "react";
import { Button, Dropdown, Form, Input, Menu, Modal, Select } from "antd";
import { FaFilter } from "react-icons/fa";
import TableView from "../../TableView/TableView";
import { Images } from "../../Config/Images";
import {
    createVendorService,
    deleteVendorService,
  editVendorService,
  getAllVendors,
  getAllVendorServices,
} from "../../../redux/apis/apisCrud";
import arrowDown from "../../../assets/images/arrow-down.png";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const VendorServices = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [vendors, setVendors] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [rowData, setRowData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    vendor_id:null,
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleDeleteConfirm = async () => {
   
    try {
        setIsLoading(true);
          await toast.promise(
            deleteVendorService(rowData?.id), // API call
            {
              loading: "Deleting vendor service...",
              success: (response) => {
                if (response?.data?.success) {
                    setRefresh(!refresh);
                  return response?.data?.message;
                } else {
                  throw new Error(
                    response?.data?.errors?.[0] ||
                      response?.data?.message ||
                      "Failed to deleting vendor service."
                  );
                }
              },
              error: (err) =>
                err?.message ||
                "Something went wrong while deleting the vendor service.",
            }
          );
        
      } catch (error: any) {
        console.error("Error:", error);
      } finally {
        setIsDeleteModalVisible(false);
        setIsLoading(false);
      }
    
  };
  // Close popup when clicking outside
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
    },
    {
      name: "Vendor Name",
      selector: (row: { vendor_name: any }) => row.vendor_name,
      sortable: true,
    },
    {
      name: "Service Name",
      selector: (row: { name: any }) => row.name,
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
              borderRadius: "6px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
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
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );
  const handleMenuClick = (action: string, data) => {
    setRowData(data);
    switch (action) {
      case "edit":
        // Handle edit action
        setSelectedItem("edit");
        setFormValues({
          name: data?.name,
          vendor_id: data?.vendor_id,
        });
        setIsModalVisible(true);
        break;
      case "delete":
        // Handle delete action
        setIsDeleteModalVisible(true);

        break;
      default:
        break;
    }
  };
  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getAllVendorServices(page, pageSize);
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
    try {
      setSkelitonLoading(true);
      getAllVendors().then((res) => {
        if (res) {
          setVendors(res?.data?.data?.data || []);
          getList();
        }
      });
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    }
  }, [page,refresh, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        id: item?.id,
        Sr: index + from,
        vendor_name: getVendorName(item?.vendor_id) || "-",
        vendor_id: item?.vendor_id || null,
        name: item?.name || "-",
      };
    });

  function getVendorName(id: any) {
    const vendor = vendors.find((vendor: any) => vendor.id === id);
    return vendor ? vendor.name : "-";
  }
  const showModal = () => {
    setFormValues({
      name: "",
      vendor_id: null,
    });
    setIsModalVisible(true);
    setSelectedItem("");
    setRowData({});
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleOk = async () => {
    const { name } = formValues;

    if (!name) {
      return;
    }

    try {
     setIsLoading(true);

      if (selectedItem === "edit") {
        // For update, include the ID in the body
        const updateBody = {
          ...formValues,
          id: rowData?.id, // Include the ID from the selected row
        };

        await toast.promise(
          editVendorService(updateBody), // Pass the body with ID included
          {
            loading: "Updating vendor service...",
            success: (response:any) => {
                if (response?.data?.success){
                    setIsModalVisible(false);
                    setFormValues({
                        name: "",
                        vendor_id: null,
                      });
                    setRefresh(!refresh);
                    return response?.data?.message;
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    "Failed to update vendor service."
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while updating the vendor service.",
          }
        );
      } else {
        await toast.promise(
            createVendorService(formValues), // API call
          {
            loading: "Adding vendor service...",
            success: (response) => {
              if (response?.data?.success) {
                setIsModalVisible(false);
                setFormValues({
                    name: "",
                    vendor_id: null,
                  });
                  setRefresh(!refresh);
                return response?.data?.message;
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.message ||
                    "Failed to add vendor service."
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while adding the vendor service.",
          }
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
    
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };
   const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "VendorServices");
      XLSX.writeFile(workbook, "VendorServices.xlsx");
    };
  
    // Export to PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
  
      const tableColumn = [
        "ID",
        "Vendor Name",
        "Service Name",
      ];
  
      const tableRows = mappedData?.map((item: any) => [
        item.id,
        item.vendor_name,
        item.name,
      ]);
  
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
  
      doc.save("VendorServices.pdf");
    };
  return (
    <div className="service">
      {/* <DashboardProfile /> */}

      <div className="d-flex justify-content-end  col-12">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          placeholder="Filter"
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
              placeholder="Search..."
            />
          </div>

          <button className="invoice-btn" onClick={exportToExcel}>
            Excel
          </button>
          <button
            className="invoice-btn"
            onClick={() => {
              exportToPDF();
            }}
          >
            PDF
          </button>
          <button className="invoice-btn">Print</button>
          <button onClick={showModal} className="theme-btn">
            Add New Vendor Service
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
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />
         <Modal
        className="custom-mod"
        style={{ maxWidth: "732px" }}
        title={
          selectedItem === "edit"
            ? "Edit vendor service"
            : "Add New vendor service"
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="save" type="primary" disabled={isLoading} onClick={handleOk}>
            {selectedItem === "edit" ? "Save" : "Submit"}
          </Button>,
        ]}
      >
        <div className={"Ente-details"}>
          <Form>
            <div className="d-flex flex-column w-100 gap-4 align-items-center">
            <Form.Item className="w-100 mb-0">
                <div className="custom-input-container mb-0">
                  <label className="input-label">Vendor Name</label>
                  <Select
                    value={formValues.vendor_id}
                    onChange={(value) => handleChange("vendor_id", value)}
                    style={{ width: "100%", marginTop: "0" }}
                  >
                    {vendors?.map((vendor: any) => (   
                        <Select.Option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                        </Select.Option>
                     ))}
                    
                     {/* <Select.Option value="active">Active</Select.Option> */}
                     {/* <Select.Option value="inactive">Inactive</Select.Option> */}
                     {/* <Select.Option value="pending">Pending</Select.Option> */}
                  </Select>
                </div>
              </Form.Item>
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">Service Name</label>
                  <Input
                    placeholder="Enter service name"
                    className="fs-6"
                    value={formValues.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
              </Form.Item>

              
            
            </div>
          </Form>
        </div>
      </Modal>
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
              borderRadius: "6px",
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
              borderRadius: "6px",
              padding: "4px 20px",
              fontWeight: "500",
            }}
          >
            Yes
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
            Are you sure want to delete this service?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default VendorServices;
