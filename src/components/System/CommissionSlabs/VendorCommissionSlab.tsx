import { useEffect, useState } from "react";
import { Button, Dropdown, Menu, Select, Modal, Input, Form } from "antd";
import TableView from "../../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../../Config/Images";
import {
  complaintID,
  createAppVersion,
  createComplaintSubType,
  createVendorCommissionSlab,
  deleteAppVersion,
  deleteComplaintSubType,
  deleteVendorCommissionSlab,
  editAppVersion,
  editComplaintSubType,
  editVendorCommissionSlab,
  getAppVersion,
  getComplaintsSubType,
  getVendorCommissionForType,
  getVendorCommissionList,
  getVendorCommissionSlab,
} from "../../../redux/apis/apisCrud";
import arrowDown from "../../../assets/images/arrow-down.png";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { genTypeStyle } from "antd/es/alert/style";
const VendorComissionSlab = () => {
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
  const [vendorList, setVendorList] = useState<any[]>([]);

  const [formValues, setFormValues] = useState({
    from: "",
    to: "",
    commission: "",
    vendor_commission_id: "",
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await toast.promise(
        deleteVendorCommissionSlab(rowData?.id), // API call
        {
          loading: "Deleting Vendor Commission Slab...",
          success: (response) => {
            if (response?.data?.success) {
              setIsDeleteModalVisible(false);
              getVendorCommisionData();
              return response?.data?.message;
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                  response?.data?.notificationMessage ||
                  "Failed to deleting Vendor Commission Slab"
              );
            }
          },
          error: (err) =>
            err?.message ||
            "Something went wrong while deleting the Vendor Commission Slab",
        }
      );
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsDeleteModalVisible(false);
      setIsLoading(false);
    }
  };
  const getVendorCommisionData = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getVendorCommissionSlab(page, pageSize);
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
  const getVendorCommisionType = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getVendorCommissionList("", "");
      if (response) {
        const data = response?.data?.data?.data;
        setVendorList(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const getListCommission = (id: any) => {
    const entry: any = vendorList?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  useEffect(() => {
    getVendorCommisionType();
    getVendorCommisionData();
  }, [page, pageSize]);
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      cell: (row: { Sr: any }) => row.Sr,
      sortable: true,
      width: "180px",
    },

    {
      name: "Vendor Commission",
      selector: (row: { vendor_commission_id: any }) =>
        row.vendor_commission_id,
      sortable: true,
      width: "200px",
    },
    {
      name: "From",
      selector: (row: { from: any }) => row.from,
      sortable: true,
      width: "280px",
    },
    {
      name: "To",
      selector: (row: { to: any }) => row.to,
      sortable: true,
      width: "280px",
    },
    {
      name: "Commission",
      selector: (row: { commission: any }) => row.commission,
      sortable: true,
      width: "200px",
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
          from: data?.data,
          to: data?.to,
          commission: data?.commission,
          vendor_commission_id: data?.commission,
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
        vendor_commission_id: getListCommission(item?.vendor_commission_id),
        from: item?.from,
        to: item?.to,
        commission: item?.commission,
        // vendor_commission: getListCommission(item?.vendor_commission),
      };
    });

  const showModal = () => {
    getVendorCommisionType();
    // getComplaintTypeData();
    setFormValues({
      from: "",
      to: "",
      commission: "",
      vendor_commission_id: "",
    });
    setIsModalVisible(true);
    setSelectedItem("");
    setRowData({});
  };
  const handleOk = async () => {
    const { from, to, commission, vendor_commission_id } = formValues;

    if (!from || !to || !commission || !vendor_commission_id) {
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
          editVendorCommissionSlab(updateBody), // Pass the body with ID included
          {
            loading: "Updating Vendor Commission Slab...",
            success: (response: any) => {
              if (response?.data?.success) {
                setIsModalVisible(false);
                getVendorCommisionData();
                return response?.data?.success;
              } else {
                throw new Error(
                  response?.response?.data?.errors?.[0] ||
                    "Failed to update Vendor Commission Slab"
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while updating theVendor Commission Slab.",
          }
        );
      } else {
        await toast.promise(
          createVendorCommissionSlab(formValues), // API call
          {
            loading: "Adding Vendor Commission Slab...",
            success: (response) => {
              if (response?.data?.success) {
                // toast.success("Vendor Commission Slab Added Successfully");
                setFormValues({
                  from: "",
                  to: "",
                  commission: "",
                  vendor_commission_id: "",
                });

                setIsModalVisible(false);
                getVendorCommisionData();
                return "Vendor Commission Slab Added Successfully";
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.notificationMessage ||
                    "Failed to add Vendor Commission Slab."
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while adding Vendor Commission Slab.",
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
            Add New Vendor Commission Type
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
          selectedItem === "edit"
            ? "Edit Vendor Commission Type"
            : "Add New Vendor Commission Type"
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
                  <label className="input-label">
                    Select Vendor Commission Type
                  </label>
                  <Select
                    value={formValues.vendor_commission_id}
                    onChange={(value) =>
                      handleSubType("vendor_commission_id", value)
                    }
                    style={{ width: "100%", marginTop: "0" }}
                  >
                    {vendorList.map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Form.Item>
            </div>

            <div className="d-flex w-100 gap-4 align-items-center">
              {/* Name Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">From</label>
                  <Input
                    placeholder="Enter From"
                    className="fs-6"
                    value={formValues.from}
                    onChange={(e) => handleChange("from", e.target.value)}
                  />
                </div>
              </Form.Item>
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">To</label>
                  <Input
                    placeholder="Enter To"
                    className="fs-6"
                    value={formValues.to}
                    onChange={(e) => handleChange("to", e.target.value)}
                  />
                </div>
              </Form.Item>
            </div>
            <div className="d-flex w-100 gap-4 align-items-center">
              {/* Status Field */}
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">Commission</label>
                  <Input
                    placeholder="Enter Commission"
                    className="fs-6"
                    value={formValues.commission}
                    onChange={(e) => handleChange("commission", e.target.value)}
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
            Are you sure want to delete this Vendor Commission Slab?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default VendorComissionSlab;
