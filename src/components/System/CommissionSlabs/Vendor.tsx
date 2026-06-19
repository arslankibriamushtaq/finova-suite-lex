import { useEffect, useState } from "react";
import { Button, Dropdown, Menu, Select, Modal, Input, Form } from "antd";
import { FaFilter } from "react-icons/fa";
import arrowDown from "../../../assets/images/arrow-down.png";
import toast from "react-hot-toast";
import { DeleteOutlined,  EditOutlined } from "@ant-design/icons";
import TableView from "../../TableView/TableView";
import {  createVendor, deleteVendor, editVendor, vendorList } from "../../../redux/apis/apisCrud";
import { Images } from "../../Config/Images";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Vendor = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [rowData, setRowData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    status: "",
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleDeleteConfirm = async () => {
   
    try {
        setIsLoading(true);
          await toast.promise(
            deleteVendor(rowData?.id), // API call
            {
              loading: "Deleting Vendor...",
              success: (response) => {
                if (response?.data?.success) {
                    getList()
                  setIsDeleteModalVisible(false)
                  return "Vendor deleted successfully";
                  
                } else {
                  throw new Error(
                    response?.data?.errors?.[0] ||
                      response?.data?.message ||
                      "Failed to deleting Vendor."
                  );
                }
              },
              error: (err) =>
                err?.message ||
                "Something went wrong while deleting the Vendor.",
            }
          );
        
      } catch (error: any) {
        console.error("Error:", error);
      } finally {
        setIsDeleteModalVisible(false);
        setIsLoading(false);
      }
    
  };
  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await vendorList(page, pageSize);
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
  }, [page, pageSize]);
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
      width:"15%",
    },
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
      sortable: true,
      width:"75%",
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
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
      width:"10%",
    },
  ];
  const menu = (row: any) => (
    <Menu>
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
          status: data?.status,
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
  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        id: item?.id,
        Sr: item?.id,
        name: item?.name,
        // status: item?.status,
      };
    });

  const showModal = () => {
    setFormValues({
      name: "",
      status: "",
    });
    setIsModalVisible(true);
    setSelectedItem("")
    setRowData({});
  };
  const handleOk = async () => {
    const { name, status } = formValues;

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
            editVendor(updateBody), // Pass the body with ID included
          {
            loading: "Updating Vendor...",
            success: (response:any) => {
                if (response?.data?.success) {
                  getList()
                  setIsModalVisible(false)
                return "Vendor updated successfully";
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    "Failed to update vendor."
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while updating the vendor.",
          }
        );
      } else {
        await toast.promise(
            createVendor(formValues), // API call
          {
            loading: "Adding Vendor...",
            success: (response) => {
                if (response?.data?.success) {
                setFormValues({
                    name: "",
                    status: "",
                  });
                  getList()
                  setIsModalVisible(false)
                return "New Vendor added successfully"
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.message ||
                    "Failed to Vendor."
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while adding the Vendor.",
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

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "vendor");
    XLSX.writeFile(workbook, "vendor.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "ID",
      "Name",
    ];

    const tableRows = mappedData?.map((item: any) => [
      item.id,
      item.name,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("vendor.pdf");
  };
  return (
    <div className="service">
      <div className="d-flex justify-content-end  col-12">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          // onChange={handleChange}
          placeholder="Filter"
          tokenSeparators={[","]}
          suffixIcon={<FaFilter />}

          // options={options}
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
            Add New Vendor
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
            ? "Edit Vendor"
            : "Add New Vendor"
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
            <div className="w-100"> 
    <Button key="close" onClick={handleCancel}>
            Close
          </Button>
          <button key="save" className="theme-btn ms-2" disabled={isLoading} onClick={handleOk}>
            {selectedItem === "edit" ? "Edit" : "Add"}
          </button>
            </div>
            
      
        ]}
      >
        <div className={"Ente-details"}>
          <Form>
            <div className="d-flex w-100 gap-4 align-items-center">
              {/* Name Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">Name</label>
                  <Input
                    placeholder="Enter complaint type"
                    className="fs-6"
                    value={formValues?.name}
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
              borderRadius: "2px",
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
              borderRadius: "2px",
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
            Are you sure you want to delete this Vendor?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Vendor;
