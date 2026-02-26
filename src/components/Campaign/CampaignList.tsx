import { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Menu,
  Select,
  Modal,
  Input,
  Form,
  DatePicker,
  Upload,
} from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  deleteCampaign,
  editCampaign,
  getCampaign,
} from "../../redux/apis/apisCrud";
import arrowDown from "../../assets/images/arrow-down.png";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import axios from "axios";
import { store } from "../../redux/store";

const token = (store.getState() as any).block.token;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "multipart/form-data",
};

function createCampaign(body: any) {
  return axios.post(
    `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/portal/campaign/create`,
    body,
    { headers: headers }
  );
}
const CampaignList = () => {
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
    entry_fee: "",
    type: "",
    priority_level: "",
    start_date: null,
    end_date: null,
    terms_and_conditions: "",
    banner: null,
    status: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await toast.promise(
        deleteCampaign(rowData?.id), // API call
        {
          loading: "Deleting Campaign...",
          success: (response) => {
            if (response?.data?.success) {
              getList();
              setIsDeleteModalVisible(false);
              return "Campaign deleted successfully";
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                  response?.data?.message ||
                  "Failed to deleting Campaign."
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while deleting the Campaign.",
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

      const response = await getCampaign(page, pageSize);
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
      //   width: "15%",
    },
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
      sortable: true,
      //   width: "75%",
    },
    {
      name: "Type",
      selector: (row: { type: any }) => row.type,
      sortable: true,
    },
    {
      name: "Entry Fee",
      selector: (row: { entry_fee: any }) => row.entry_fee,
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row: { start_date: any }) => row.start_date,
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row: { end_date: any }) => row.end_date,
      sortable: true,
    },
    {
      name: "Priority Level",
      selector: (row: { priority_level: any }) => row.priority_level,
      sortable: true,
    },
    {
      name: "Terms & Conditions",
      selector: (row: { terms_and_conditions: any }) =>
        row.terms_and_conditions,
      sortable: true,
    },
    {
      name: "Banner",
      cell: (row: any) => (
        <div>
          <img src={row.banner} alt="banner" width={30} height={30} />
        </div>
      ),
    },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "12px",
            backgroundColor:
              row.status === "active"
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === "inactive"
                ? "#F84D4D"
                : "#FF9811",
            color: "white",
            cursor: row.status === "active" ? "pointer" : "default",
          }}
        >
          {row.status == "active" ? "Active" : "Inactive"}
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
      //   width: "10%",
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
          entry_fee: data?.entry_fee,
          type: data?.type,
          priority_level: data?.priority_level,
          start_date: data?.start_date ? dayjs(data.start_date) : null,
          end_date: data?.end_date ? dayjs(data.end_date) : null,
          terms_and_conditions: data?.terms_and_conditions,
          banner: data?.banner,
          status: data?.status,
        });
        setErrors({});
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
        Sr: index + from,
        name: item?.name,
        type: item?.type,
        entry_fee: item?.entry_fee,
        start_date: item?.start_date,
        end_date: item?.end_date,
        priority_level: item?.priority_level,
        terms_and_conditions: item?.terms_and_conditions || "N/A",
        banner: item?.banner || "N/A",
        status: item?.status,
      };
    });

  const showModal = () => {
    setFormValues({
      name: "",
      entry_fee: "",
      type: "",
      priority_level: "",
      start_date: null,
      end_date: null,
      terms_and_conditions: "",
      banner: null,
      status: "",
    });
    setIsModalVisible(true);
    setSelectedItem("");
    setRowData({});
    setErrors({});
  };
  const handleOk = async () => {
    const {
      name,
      entry_fee,
      type,
      priority_level,
      start_date,
      end_date,
      terms_and_conditions,
      banner,
      status,
    } = formValues;

    let validationErrors: Record<string, string> = {};

    if (!name) {
      validationErrors.name = "Name is required";
    }
    if (!entry_fee) {
      validationErrors.entry_fee = "Entry Fee is required";
    }
    if (!type) {
      validationErrors.type = "Type is required";
    }
    if (priority_level==="") {
      validationErrors.priority_level = "Priority Level is required";
    }
    if (!start_date) {
      validationErrors.start_date = "Start Date is required";
    }
    if (!end_date) {
      validationErrors.end_date = "End Date is required";
    }
    if (!terms_and_conditions) {
      validationErrors.terms_and_conditions = "Terms & Conditions is required";
    }
    if (!banner) {
      validationErrors.banner = "Banner is required";
    }
    if (!status) {
      validationErrors.status = "Status is required";
    }
    setErrors(validationErrors);

    // if there are errors, stop submission
    if (Object.keys(validationErrors).length > 0) return;
    try {
      setIsLoading(true);

      if (selectedItem === "edit") {
        const updateBody = {
          ...formValues,
          id: rowData?.id,

          start_date: start_date
            ? dayjs(start_date).format("YYYY-MM-DD")
            : null,
          end_date: end_date ? dayjs(end_date).format("YYYY-MM-DD") : null,
        };

        await toast.promise(editCampaign(updateBody), {
          loading: "Updating campaign...",
          success: (response: any) => {
            if (response?.data?.success) {
              getList();
              setIsModalVisible(false);
              return "Campaign updated successfully";
            } else {
              throw new Error(
                response?.response?.data?.errors?.[0] ||
                  "Failed to update campaign."
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while updating the campaign.",
        });
      } else {
        const formData = new FormData();

        formData.append("name", formValues.name);
        formData.append("entry_fee", formValues.entry_fee);
        formData.append("type", formValues.type);
        formData.append("priority_level", formValues.priority_level);
        formData.append(
          "start_date",
          dayjs(formValues.start_date).format("YYYY-MM-DD")
        );
        formData.append(
          "end_date",
          dayjs(formValues.end_date).format("YYYY-MM-DD")
        );
        formData.append(
          "terms_and_conditions",
          formValues.terms_and_conditions
        );
        formData.append("status", formValues.status);

        if (formValues.banner) {
          formData.append("banner", formValues.banner); // must be File type
        }

        await toast.promise(createCampaign(formData), {
          loading: "Adding campaign...",
          success: (response: any) => {
            if (response?.data?.success) {
              // Reset form
              setFormValues({
                name: "",
                entry_fee: "",
                type: "",
                priority_level: "",
                start_date: null,
                end_date: null,
                terms_and_conditions: "",
                banner: null,
                status: "",
              });
              getList();
              setIsModalVisible(false);
              return "New campaign added successfully";
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                  response?.data?.message ||
                  "Failed to add campaign."
              );
            }
          },
          error: (err) =>
            err?.message || "Something went wrong while adding the campaign.",
        });
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Campaign");
    XLSX.writeFile(workbook, "Campaign.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Sr",
      "Name",
      "Type",
      "Entry Fee",
      "Start Date",
      "End Date",
      "Priorty Level",
      "Terms & Condtions",
      "Status",
    ];

    const tableRows = mappedData?.map((item: any) => [
      item.Sr,
      item.name,
      item.type,
      item.entry_fee,
      item.start_date,
      item.end_date,
      item.priority_level,
      item.terms_and_conditions,
      item.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Campaign.pdf");
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
            Add New Campaign
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
        setPageSize={setPageSize}
        pageSize={pageSize}
        to={to}
      />
      <Modal
        className="custom-mod"
        style={{ maxWidth: "732px" }}
        title={selectedItem === "edit" ? "Edit Campaign" : "Add New Campaign"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button key="close" onClick={handleCancel}>
              Close
            </Button>
            <Button
              key="save"
              type="primary"
              className="theme-btn"
              disabled={isLoading}
              onClick={handleOk}
              style={{ width: "fit-content" }}
            >
              {selectedItem === "edit" ? "Edit Campaign" : "Add New Campaign"}
            </Button>
          </div>
        }
      >
        <div className="Ente-details">
          <Form layout="vertical">
            <div className="d-flex flex-wrap gap-3 create-campaign-form">
              <Form.Item className="w-48"  validateStatus={errors.name ? "error" : ""}
                help={errors.name}>
                <div className="custom-input-container">
                  <label className="input-label">Name</label>
                  <Input
                    placeholder="Enter Name"
                    className="fs-6"
                    value={formValues.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
              </Form.Item>

              <Form.Item  className="w-48" validateStatus={errors.entry_fee ? "error" : ""}
                help={errors.entry_fee}>
                  <div className="custom-input-container">
                  <label className="input-label">Entry Fee</label>
                <Input
                  placeholder="Enter Fee"
                    className="fs-6"
                  value={formValues.entry_fee}
                  onChange={(e) => handleChange("entry_fee", e.target.value)}
                />
                </div>
              </Form.Item>

              <Form.Item  className="w-48" validateStatus={errors.type ? "error" : ""}
                help={errors.type}>
                  <div className="custom-input-container">
                  <label className="input-label">Select Type</label>
                <Select
                  placeholder="Placeholder"
                  value={formValues.type}
                  onChange={(val) => handleChange("type", val)}
                >
                  <Select.Option value="Promotion">Promotion</Select.Option>
                  <Select.Option value="Games">Games</Select.Option>
                </Select>
                </div>
              </Form.Item>

              <Form.Item  className="w-48" validateStatus={errors.priority_level ? "error" : ""}
                help={errors.priority_level}>
                  <div className="custom-input-container">
                  <label className="input-label">Priority Level</label>
                <Select
                  placeholder="Placeholder"
                  value={formValues.priority_level}
                  onChange={(val) => handleChange("priority_level", val)}
                >
                  <Select.Option value={0}>0</Select.Option>
                  <Select.Option value={1}>1</Select.Option>
                  <Select.Option value={2}>2</Select.Option>
                </Select>
                </div>
              </Form.Item>

              <Form.Item className="w-48 modal-date-pickr" validateStatus={errors.start_date ? "error" : ""}
                help={errors.start_date}>
                  <div className="custom-input-container">
                  <label className="input-label">Start Date</label>
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Enter Start Date"
                  value={formValues.start_date}
                  onChange={(date) => handleChange("start_date", date)}
                />
                </div>
              </Form.Item>

              <Form.Item className="w-48 modal-date-pickr" validateStatus={errors.end_date ? "error" : ""} help={errors.end_date}>
                <div className="custom-input-container">
                  <label className="input-label">End Date</label>
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Enter End Date"
                  value={formValues.end_date}
                  onChange={(date) => handleChange("end_date", date)}
                />
                </div>
              </Form.Item>

              <Form.Item  className="w-48" validateStatus={errors.terms_and_conditions ? "error" : ""}
                help={errors.terms_and_conditions}>
                  <div className="custom-input-container">
                  <label className="input-label">Terms & Conditions</label>
                <Input
                  placeholder="Placeholder"
                    className="fs-6"
                  value={formValues.terms_and_conditions}
                  onChange={(e) =>
                    handleChange("terms_and_conditions", e.target.value)
                  }
                />
                </div>
              </Form.Item>
              
              <Form.Item className="w-48 file-uploader" validateStatus={errors.banner ? "error" : ""}
                help={errors.banner}>
                  {/* <div className="custom-input-container"> */}
                  {/* <label className="input-label">Upload Banner</label> */}
                <Upload
                  accept="image/*"
                  disabled={selectedItem === "edit"}
                  showUploadList={false}
                  beforeUpload={(file) => {
                  
                    handleChange("banner", file);
                    return false; // prevent auto-upload
                  }}
                >
                  <Button>Upload Banner</Button>
                </Upload>

                {formValues.banner && (
                  <span style={{ marginLeft: "10px", fontSize: "16px" }}>
                    Banner uploaded
                  </span>
                )}
                {/* </div> */}
              </Form.Item>
            

              <Form.Item className="w-100" validateStatus={errors.status ? "error" : ""}
                help={errors.status}>
                  <div className="custom-input-container">
                  <label className="input-label">Status</label>
                <Select
                  placeholder="Placeholder"
                  value={formValues.status}
                  onChange={(val) => handleChange("status", val)}
                >
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
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
            Are you sure you want to delete this Campaign?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default CampaignList;
