import { useEffect, useState } from "react";
import { Button, Dropdown, Menu, Select, Modal, Input, Form } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  createIncomeProof,
  deleteIncomeProof,
  deleteVendorCommissionSlab,
  editIncomeProof,
  editVendorCommissionSlab,
  getIncomeProof,
  getIncomeType,
  getVendorCommissionForType,
  getVendorCommissionSlab,
} from "../../redux/apis/apisCrud";
import arrowDown from "../../assets/images/arrow-down.png";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const IncomeProof = () => {
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
    name: "",
    income_type_id: "",
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await toast.promise(
        deleteIncomeProof(rowData?.id), // API call
        {
          loading: "Deleting Income Proof...",
          success: (response) => {
            if (response?.data?.success) {
              getIncomeProofData();

              return response?.data?.message;
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                  response?.data?.notificationMessage ||
                  "Failed to deleting Income Proof"
              );
            }
          },
          error: (err) =>
            err?.message ||
            "Something went wrong while deleting the Income Proof",
        }
      );
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsDeleteModalVisible(false);
      setIsLoading(false);
    }
  };
  const getIncomeProofData = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getIncomeProof(page, pageSize);
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

      const response = await getIncomeType("", "");
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
    getIncomeProofData();
  }, [page, pageSize]);
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      cell: (row: { Sr: any }) => row.Sr,
      sortable: true,
      width: "180px",
    },

    {
      name: "name",
      selector: (row: { name: any }) => row.name,
      sortable: true,
      width: "500px",
    },
    {
      name: "Income Type",
      selector: (row: { income_type_id: any }) => row.income_type_id,
      sortable: true,
      width: "480px",
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
          name: data?.name,
          income_type_id: data?.income_type_id,
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
        income_type_id: getListCommission(item?.income_type_id),
        name: item?.name,
        // vendor_commission: getListCommission(item?.vendor_commission),
      };
    });

  const showModal = () => {
    getVendorCommisionType();
    // getComplaintTypeData();
    setFormValues({
      name: "",
      income_type_id: "",
    });
    setIsModalVisible(true);
    setSelectedItem("");
    setRowData({});
  };
  const handleOk = async () => {
    const { name, income_type_id } = formValues;

    if (!name || !to || !income_type_id) {
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
          editIncomeProof(updateBody), // Pass the body with ID included
          {
            loading: "Updating Vendor Commission Slab...",
            success: (response: any) => {
              if (response?.data?.success) {
                setIsModalVisible(false);
                getIncomeProofData();
                return response?.data?.message;
              } else {
                throw new Error(
                  response?.response?.data?.errors?.[0] ||
                    "Failed to update Income Proof"
                );
              }
            },
            error: (err) =>
              err?.message ||
              "Something went wrong while updating the Income Proof",
          }
        );
      } else {
        await toast.promise(
          createIncomeProof(formValues), // API call
          {
            loading: "Adding Income Proof...",
            success: (response) => {
              if (response?.data?.success) {
                setFormValues({
                  name: "",
                  income_type_id: "",
                });

                setIsModalVisible(false);
                getIncomeProofData();
                return "Income Proof Added Successfully";
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.notificationMessage ||
                    "Failed to add Income Proof."
                );
              }
            },
            error: (err) =>
              err?.message || "Something went wrong while adding Income Proof.",
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
            Add New Income Proof
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
          selectedItem === "edit" ? "Edit Income Proof" : "Add Income Proof"
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
                  <label className="input-label">Select Income Type Name</label>
                  <Select
                    value={formValues.income_type_id}
                    onChange={(value) => handleSubType("income_type_id", value)}
                    style={{ width: "100%", marginTop: "0" }}
                  >
                    <option value="">Select Income Type</option>
                    {vendorList.map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Form.Item>

              <Form.Item className="w-100">
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
            Are you sure want to delete this Income Proof?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default IncomeProof;
