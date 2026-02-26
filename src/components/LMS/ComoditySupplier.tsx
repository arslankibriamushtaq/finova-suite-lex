import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input, Select, Modal, Form, Dropdown, Menu } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";

import toast from "react-hot-toast";
import { addCommoditySupplier, deleteCommoditySupplier, getCommoditySupplierList, updateCommoditySupplier } from "../../redux/apis/apisCrudLms";

const CommoditySupplier = () => {
  const navigate = useNavigate();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [currentDeptId, setCurrentDeptId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    apiUrl: "",
    commissionPercentage: "",
  });

  const Activity_Loans_Header = [
    {
      name: "Name",
      selector: (row: any) => row.name || "-",
      sortable: true,
    },
    {
      name: "API URL",
      selector: (row: any) => row.apiUrl || "-",
      sortable: true,
    },
    {
      name: "Channel",
      selector: (row: any) => row.channel || "-",
      sortable: true,
    },
    {
      name: "Commission Percentage",
      selector: (row: any) => row.commissionPercentage || "-",
      sortable: true,
    },
    {
      name: "Record State",
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor:
              row.recordState === 1
                ? "rgba(63, 195, 128, 0.9)" // Green for active (1)
                : "#FF6161", // Red for inactive (0 or other)
            color: "white",
            cursor: row.recordState === 1 ? "pointer" : "default",
          }}
        >
          {row.recordState === 1 ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Actions",
      width: "15%",
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
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  useEffect(() => {
    getSuppliers();
  }, [page, pageSize]);

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

  const handleMenuClick = (key: string, row: any) => {
    switch (key) {
      case "view":
        // Navigate to view page
        if (row.id) {
          navigate(`/Lms/CommodityManagement/CommoditySupplier/View/${row.id}`);
        }
        break;
      case "edit":
        // Handle edit action
        setSelectedItem("edit");
        setCurrentDeptId(row.id);
        setFormData({
          name: row.name || "",
          apiUrl: row.apiUrl || "",
          commissionPercentage: row.commissionPercentage || "",
        });
        setShowModal(true);
        break;
      case "delete":
        // Handle delete action - show confirmation modal
        setDeleteTargetId(row.id);
        setShowConfirmModal(true);
        setSelectedItem("delete");
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteCommoditySupplier(deleteTargetId), {
        loading: "Deleting Supplier...",
        success: (response) => {
          getSuppliers();
          setShowConfirmModal(false);
          setDeleteTargetId(null);
          return response?.data?.notificationMessage || "Supplier deleted successfully";
        },
        error: (err) => err?.response?.data?.notificationMessage || err?.message || "Failed to delete supplier",
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
      setDeleteTargetId(null);
    }
  };

  const handleSave = async () => {
    const body: any = {
      name: formData.name,
      apiUrl: formData.apiUrl,
      commissionPercentage: formData.commissionPercentage,
    };
    try {
      if (selectedItem == "edit" && currentDeptId !== null) {
        // Add id to body for edit operation
        body.id = currentDeptId;
        await toast.promise(updateCommoditySupplier(body), {
          loading: "Updating Supplier...",
          success: () => {
            setShowModal(false);
            setFormData({
              name: "",
              apiUrl: "",
              commissionPercentage: "",
            });
            getSuppliers();
            return "Supplier updated successfully";
          },
          error: (err) => err?.message || "Failed to update Supplier",
        });
      } else if (selectedItem == "add") {
        await toast.promise(addCommoditySupplier(body), {
          loading: "Adding Supplier...",
          success: (response) => {
            setShowModal(false);
            setFormData({
              name: "",
              apiUrl: "",
              commissionPercentage: "",
            });
            getSuppliers();

            return response?.data?.message;
          },
          error: (err) => {
            const errors = err?.data?.errors;

            if (errors) {
              const allMessages = Object.values(errors).flat();
              allMessages.forEach((msg: any) => toast.error(msg));
            } else {
              toast.error("Something went wrong!");
            }
            return "Validation error";
          },
        });
      }
    } catch (error) {
      console.error("Failed to save Supplier:", error);
    }
  };

  const getSuppliers = async () => {
    setSkelitonLoading(true);
    try {
      const res = await getCommoditySupplierList(page, pageSize);
      if (res?.data?.success) {
        const responseData = res.data;
        // Data is directly in data array
        const suppliersData = Array.isArray(responseData.data) ? responseData.data : [];
        
        setData(suppliersData);
        
        // Extract pagination info from pageInfo
        if (responseData.pageInfo) {
          setTotalRows(responseData.pageInfo.totalItems || 0);
          setPage(responseData.pageInfo.page || page);
          setTotalPage(responseData.pageInfo.totalPages || 1);
          // Calculate from and to
          const currentPage = responseData.pageInfo.page || 1;
          const perPage = responseData.pageInfo.pageSize || pageSize;
          setFrom((currentPage - 1) * perPage + 1);
          setTo(Math.min(currentPage * perPage, responseData.pageInfo.totalItems || 0));
        } else {
          // Fallback if no pageInfo
          setTotalRows(suppliersData.length || 0);
          setFrom(1);
          setTo(suppliersData.length || 0);
          setPage(1);
          setTotalPage(1);
        }
      } else {
        setData([]);
        setTotalRows(0);
        setFrom(0);
        setTo(0);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      console.error("Error fetching Suppliers:", error);
      toast.error(error?.response?.data?.notificationMessage || "Failed to fetch suppliers");
      setSkelitonLoading(false);
      setData([]);
    }
  };
  useEffect(() => {
    getSuppliers();
  }, []);

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        name: item?.name || "-",
        apiUrl: item?.apiUrl || "-",
        channel: item?.channel || "-",
        recordState: item?.recordState,
        isDeleted: item?.isDeleted,
        commissionPercentage: item?.commissionPercentage || "-",
      };
    });

  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "10px" }}
      >
        <div className="d-flex mb-3 col-12 filter-select">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                }}
                className="p-2"
                placeholder="Search..."
              />
            </div>

            <button
              className="theme-btn-next"
              onClick={() => {
                setFormData({
                  name: "",
                  apiUrl: "",
                  commissionPercentage: "",
                });
                setShowModal(true);
                setSelectedItem("add");
              }}
            >
              Add Supplier
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
          style={{ maxWidth: "632px" }}
          title={selectedItem === "edit" ? "Edit Supplier" : "Add Supplier"}
          visible={showModal}
          onCancel={() => {
            setShowModal(false);
            setFormData({
              name: "",
              apiUrl: "",
              commissionPercentage: "",
            });
          }}
          footer={[
            <Button key="close" onClick={() => setShowModal(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              //type="primary"
              className="theme-btn-next"
              onClick={() => {
                setShowModal(false);
                handleSave();
              }}
            >
              {selectedItem === "edit" ? "Save" : "Submit"}
            </Button>,
          ]}
        >
          <div className={"Ente-details"}>
            <Form>
              {/* <div className="custom-input-container"> */}
              <label className="fw-400">Supplier Name</label>
              <Input
                type="text"
                className="fs-6"
                placeholder="Enter Supplier name"
                value={formData.name}
                onChange={(e: any) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <label className="fw-400 mt-2">API URL</label>
              <Input
                type="text"
                className="fs-6"
                placeholder="Enter API URL"
                value={formData.apiUrl}
                onChange={(e: any) =>
                  setFormData({ ...formData, apiUrl: e.target.value })
                }
              />
              <label className="fw-400 mt-2">Commission Percentage</label>
              <Input
                type="text"
                className="fs-6"
                placeholder="Enter Commission Percentage"
                value={formData.commissionPercentage}
                onChange={(e: any) =>
                  setFormData({ ...formData, commissionPercentage: e.target.value })
                }
              />
              {/* </div> */}
              {/* <div className="d-flex gap-2 mt-4">
                <Checkbox
                  checked={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.checked,
                    }))
                  }
                />
                <label className="fw-400">Status</label>
                {/* <Checkbox
                  checked={formData.by_default}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      by_default: e.target.checked,
                    }))
                  }
                />
                <label className="fw-400">by default</label> */}
              {/* </div> */} 
            </Form>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showConfirmModal}
          onCancel={() => {
            setShowConfirmModal(false);
            setDeleteTargetId(null);
          }}
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title="Delete Supplier"
          footer={[
            <Button key="no" onClick={() => {
              setShowConfirmModal(false);
              setDeleteTargetId(null);
            }}>
              No
            </Button>,
            <Button
              key="yes"
              type="primary"
              className="theme-btn-next"
              onClick={handleDeleteConfirmed}
            >
              Yes
            </Button>,
          ]}
        >
          <Form>
            Are you sure you want to delete this supplier?
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default CommoditySupplier;
