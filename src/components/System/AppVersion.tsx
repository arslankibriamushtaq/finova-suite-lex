import { useEffect, useState } from "react";
import { Button, Dropdown, Menu, Select, Modal, Input, Form } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  complaintID,
  createAppVersion,
  createComplaintSubType,
  deleteAppVersion,
  deleteComplaintSubType,
  editAppVersion,
  editComplaintSubType,
  getAppVersion,
  getComplaintsSubType,
} from "../../redux/apis/apisCrud";
import arrowDown from "../../assets/images/arrow-down.png";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
const AppVersion = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
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

  const [formValues, setFormValues] = useState({
    device_type: "",
    version: "",
    description: "",
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await toast.promise(
        deleteAppVersion(rowData?.id), // API call
        {
          loading: "Deleting App Version...",
          success: (response) => {
            if (response?.data?.successfull) {
              return response?.data?.notificationMessage;
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                  response?.data?.notificationMessage ||
                  "Failed to deleting App Version"
              );
            }
          },
          error: (err) =>
            err?.message ||
            "Something went wrong while deleting the App Version",
        }
      );
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsDeleteModalVisible(false);
      setIsLoading(false);
    }
  };
  const getAppVersionData = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getAppVersion(page, pageSize);
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
    getAppVersionData();
  }, [page, pageSize]);
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      cell: (row: { Sr: any }) => row.Sr,
      sortable: true,
      width: "380px",
    },

    {
      name: "Device Type",
      selector: (row: { device_type: any }) => row.device_type,
      sortable: true,
      width: "280px",
    },
    {
      name: "Version",
      selector: (row: { version: any }) => row.version,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row: { description: any }) => row.description,
      sortable: true,
      width: "280px",
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
          device_type: data?.device_type,
          version: data?.version,
          description: data?.description,
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
  //   const getComplaintTypeData = async () => {
  //     try {
  //       const res = await complaintID();
  //       if (res) {
  //         const data = res?.data?.data?.data || [];
  //         setGetComplaintType(data);
  //       }
  //     } catch (error: any) {
  //       toast.error(error?.message);
  //     }
  //   };
  //   const getListComplaint = (id: any) => {
  //     const entry: any = getComplaintType?.find((entry: any) => entry.id === id);
  //     return entry ? entry.name : "ID not found";
  //   };

  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        id: item?.id,
        Sr: item?.id,
        device_type: item?.device_type,
        version: item?.version,
        description: item?.description,
        // complainType: getListComplaint(item?.complain_type_id),
      };
    });

  const showModal = () => {
    // getComplaintTypeData();
    setFormValues({
      description: "",
      version: "",
      device_type: "",
    });
    setIsModalVisible(true);
    setSelectedItem("");
    setRowData({});
  };
  const handleOk = async () => {
    const { device_type, version, description } = formValues;

    if (!device_type || !version || !description) {
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
          editAppVersion(updateBody), // Pass the body with ID included
          {
            loading: "Updating App Version...",
            success: (response: any) => {
              if (response?.data?.success) {
                setIsModalVisible(false);
                getAppVersionData();
                return response?.data?.success;
              } else {
                throw new Error(
                  response?.response?.data?.errors?.[0] ||
                    "Failed to update App Version"
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while updating the App Version.",
          }
        );
      } else {
        await toast.promise(
          createAppVersion(formValues), // API call
          {
            loading: "Adding App Version...",
            success: (response) => {
              if (response?.data?.success) {
                toast.success("App Version Added Successfully");
                setFormValues({
                  device_type: "",
                  version: "",
                  description: "",
                });

                setIsModalVisible(false);
                getAppVersionData();
                return response?.data?.success;
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.notificationMessage ||
                    "Failed to add Version."
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while adding the app version.",
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
  const handleSubType = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
          <button className="invoice-btn">Excel</button>
          <button className="invoice-btn">PDF</button>
          <button className="invoice-btn">Print</button>
          <button onClick={showModal} className="theme-btn">
            Add New App Version
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
        title={
          selectedItem === "edit" ? "Edit App Version" : "Add New App Version"
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
          <Button
            key="save"
            type="primary"
            disabled={isLoading}
            onClick={handleOk}
          >
            {selectedItem === "edit" ? "Save" : "Submit"}
          </Button>,
        ]}
      >
        <div className={"Ente-details"}>
          <Form>
            <div className="d-flex w-100 gap-4 align-items-center">
              {/* Status Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">Device Type</label>
                  <Select
                    value={formValues.device_type}
                    onChange={(value) => handleChange("device_type", value)}
                    style={{ width: "100%", marginTop: "0" }}
                  >
                    <Select.Option value="android">Android</Select.Option>
                    <Select.Option value="ios">IOS</Select.Option>
                  </Select>
                </div>
              </Form.Item>
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">Version</label>
                  <Input
                    placeholder="Enter Version"
                    className="fs-6"
                    value={formValues.version}
                    onChange={(e) => handleChange("version", e.target.value)}
                  />
                </div>
              </Form.Item>
            </div>
            {/* Name Field */}

            <Form.Item className="col-12">
              <div className="custom-input-container">
                <label className="input-label">Description</label>
                <Input
                  placeholder="Enter Version"
                  className="fs-6"
                  value={formValues.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </Form.Item>
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
            Are you sure want to delete this App Version?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default AppVersion;
