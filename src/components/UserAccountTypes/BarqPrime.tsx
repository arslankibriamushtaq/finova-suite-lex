import { useEffect, useState } from "react";
import { Button, Dropdown, Form, Input, Menu, Modal, Select } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { allCustomerStatusChange, getBarqPrimeAccounts } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EditOutlined, EyeOutlined,  } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const BarqPrime = () => {
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
  const [showDetailsFields, setShowDetailsFields] = useState(false);
  const [status, setStatus] = useState("Active");
  const [rowData, setRowData] = useState<any>({});


  const Activity_Loans_Header = [
    {
      name: "Sr:",
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
      width: "100px"
    },
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
      sortable: true,
      width: "250px"
    },
    {
      name: "Phone Number",
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
      width: "200px"
    },
    {
      name: "Gender",
      selector: (row: { gender: any }) => row.gender,
      sortable: true,
    },
    {
        name: "Age",
        selector: (row: { age: any }) => row.age,
        sortable: true,
    },
    {
      name: "City",
      selector: (row: { city: any }) => row.city,
      sortable: true,
    },
    
    /* {
      name: "Status",
      cell: (row: { status: any }) => (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor:
              row.status === "active"
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === "inactive"
                ? "#F84D4D"
                : "transparent",
            color: "white",
            cursor: row.status === "active" ? "pointer" : "default",
          }}
        >
          {row.status.toUpperCase()}
        </div>
      ),
    }, */
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
        icon={<EyeOutlined/>}
        onClick={() => handleMenuClick("view", row)}
      >
        View Details
      </Menu.Item>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        Change Status
      </Menu.Item>
    </Menu>
  );
  const handleMenuClick = (key: string, data: any) => {
    setSelectedItem(key);
    setRowData(data);
    setIsModalVisible(true);
  };

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

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
  
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
  
    // If birth month/date hasn't occurred yet this year, subtract 1
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  
    return age;
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
              getBarqPrimeList();
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


  const getBarqPrimeList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getBarqPrimeAccounts(page, pageSize);
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
    getBarqPrimeList();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        id:item.id || "-",
        Sr: index + from,
        name: item?.name,
        phone: item?.phone || "-",
        gender: item?.gender,
        city: item?.city || "N/A",
        dob: item?.date_of_birth,
        age: calculateAge(item?.date_of_birth) || "N/A",
        accountStatus: item?.aft_detail?.accountStatus || "-",
      };
    });
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "BarqPrime");
      XLSX.writeFile(workbook, "BarqPrime.xlsx");
    };
  
    // Export to PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
  
      const tableColumn = [
     "Sr:",
      "Name",
      "Phone Number",
      "Gender",
      "Age",
      "City",
      ];
  
      const tableRows = mappedData?.map((item: any) => [
        item.Sr,
        item.name,
        item.phone,
        item.gender,
        item.age,
        item.city,
      ]);
  
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
  
      doc.save("BarqPrime.pdf");
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
        </div>
      </div>

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
        setPageSize={setPageSize}
        pageSize={pageSize}
        to={to}
      />
    </div>
  );
};

export default BarqPrime;
