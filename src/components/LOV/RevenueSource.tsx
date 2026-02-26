import { SetStateAction, useEffect, useState } from "react";

import {
  Button,
  Input,
  Menu,
  Select,
  Modal,
  Form,
  Switch,
  Dropdown,
  Row,
  Col,
} from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  getSourceOfRevenue,
  createSourceOfRevenue,
  updateDepartments,
  deleteDepartment,
  getProductsListing,
  updateSourceOfRevenue,
  deleteSourceOfRevenue,
  updateSourceOfRevenueStatus,
} from "../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined, StopOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { usePermissions, useWorkflowActions, SOURCE_OF_REVENUE_PERMISSIONS, WORKFLOW_MODULE_NAMES } from "../../hooks/useProductPermissions";

const RevenueSource = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [prodData, setProdData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const [currentSourceId, setCurrentSourceId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", product_id: "", status: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  
  // Permissions
  const { canCreate, canUpdate, canRemove, canVerifyModule, canRejectAsChecker, canApproveModule, canRejectAsApprover } = usePermissions();
  const { verifyItem, rejectAsChecker, approveItem, rejectAsApprover } = useWorkflowActions();
  
  const canCreateSOR = canCreate(SOURCE_OF_REVENUE_PERMISSIONS);
  const canEditSOR = canUpdate(SOURCE_OF_REVENUE_PERMISSIONS);
  const canDeleteSOR = canRemove(SOURCE_OF_REVENUE_PERMISSIONS);
  const canVerifySOR = canVerifyModule(SOURCE_OF_REVENUE_PERMISSIONS);
  const canCheckerRejectSOR = canRejectAsChecker(SOURCE_OF_REVENUE_PERMISSIONS);
  const canApproveSOR = canApproveModule(SOURCE_OF_REVENUE_PERMISSIONS);
  const canApproverRejectSOR = canRejectAsApprover(SOURCE_OF_REVENUE_PERMISSIONS);
  
  // Check if any action is available
  const hasAnyAction = canEditSOR || canDeleteSOR || canVerifySOR || canCheckerRejectSOR || canApproveSOR || canApproverRejectSOR;

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      setSelectedItem("edit");
      setCurrentSourceId(row.id);
      setFormData({ 
        title: row.title,
        product_id: row.product_id,
        status: row.status 
      });
      setShowModal(true);
    } else if (key === "delete") {
      setDeleteTargetId(row.id);
      setShowConfirmModal(true);
      setSelectedItem("delete");
    }
  };

  // Workflow action handlers
  const handleVerify = async (row: any) => {
    const result = await verifyItem(WORKFLOW_MODULE_NAMES.SOURCE_OF_REVENUE, row, { source_of_revenue_id: row.id });
    if (result.success) {
      getSources();
    }
  };
  
  const handleCheckerReject = async (row: any) => {
    const result = await rejectAsChecker(WORKFLOW_MODULE_NAMES.SOURCE_OF_REVENUE, row, { source_of_revenue_id: row.id });
    if (result.success) {
      getSources();
    }
  };
  
  const handleApprove = async (row: any) => {
    const result = await approveItem(WORKFLOW_MODULE_NAMES.SOURCE_OF_REVENUE, row, { source_of_revenue_id: row.id });
    if (result.success) {
      getSources();
    }
  };
  
  const handleApproverReject = async (row: any) => {
    const result = await rejectAsApprover(WORKFLOW_MODULE_NAMES.SOURCE_OF_REVENUE, row, { source_of_revenue_id: row.id });
    if (result.success) {
      getSources();
    }
  };
  
  const menu = (row: any) => (
    <Menu>
      {canEditSOR && (
        <Menu.Item
          key="edit"
          icon={<EditOutlined />}
          onClick={() => handleMenuClick("edit", row)}
        >
          Edit
        </Menu.Item>
      )}
      {canVerifySOR && (
        <Menu.Item
          key="verify"
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          onClick={() => handleVerify(row)}
        >
          Verify
        </Menu.Item>
      )}
      {canCheckerRejectSOR && (
        <Menu.Item
          key="checkerReject"
          icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
          onClick={() => handleCheckerReject(row)}
        >
          Reject (Checker)
        </Menu.Item>
      )}
      {canApproveSOR && (
        <Menu.Item
          key="approve"
          icon={<SafetyCertificateOutlined style={{ color: "#1890ff" }} />}
          onClick={() => handleApprove(row)}
        >
          Approve
        </Menu.Item>
      )}
      {canApproverRejectSOR && (
        <Menu.Item
          key="approverReject"
          icon={<StopOutlined style={{ color: "#ff4d4f" }} />}
          onClick={() => handleApproverReject(row)}
        >
          Reject (Approver)
        </Menu.Item>
      )}
      {canDeleteSOR && (
        <Menu.Item
          key="delete"
          icon={<DeleteOutlined />}
          onClick={() => handleMenuClick("delete", row)}
        >
          Delete
        </Menu.Item>
      )}
    </Menu>
  );

  const Activity_Loans_Header = [
    // {
    //   name: "Sr:",
    //   selector: (row: { Sr: any }) => row.Sr,
    //   sortable: true,
    //   // width: "15%",
    // },
    {
      name: "Title",
      selector: (row: { title: any }) => row.title,
      // sortable: true,
      // width: "75%",
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
              row.status === 1
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === 0
                ? "#BC3D3F"
                : "#FF9811",
            color: "white",
            cursor: row.status === 1 ? "pointer" : "default",
          }}
        >
          {row.status == 1 ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Change Status",
      cell: (row: any) => (
        <Switch
          className="red-switch"
          checked={row.status}
          onChange={async (checked) => {
            const newStatus = checked;
            const body = {
              status: newStatus,
            };

            try {
              const res = await updateSourceOfRevenueStatus(row.id, body);
              if (res) {
                toast.success(res?.data?.message);
                 getSources();
                // Update UI locally
                setData((prevData: any) =>
                  prevData.map((item: any) =>
                    item.id === row.id ? { ...item, status: body } : item
                  )
                );
              }
            } catch (error) {
              console.error("Status update failed:", error);
            }
          }}
          className="red-switch"
        />
      ),
    },
    // Only include Action column if user has any action permission
    ...(hasAnyAction ? [{
      name: "Action",
      width: "10%",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              fontSize: "12px",
              borderRadius: "4px",
              padding: "8px",
            }}
          >
            Select 
            <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    }] : []),
  ];

   const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteSourceOfRevenue(deleteTargetId), {
        loading: "Deleting Source...",
        success: (response) => {
          getSources();
          setShowConfirmModal(false);
          return "Source deleted successfully";
        },
        error: (err) => err?.message || "Failed to delete source",
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
    }
  }; 

   const handleSave = async () => {
    const body: any = {
      title: formData.title,
      product_id: formData.product_id,
      status: formData.status
    };
    try {
      if (selectedItem == "edit" && currentSourceId !== null) {
        await toast.promise(updateSourceOfRevenue(currentSourceId, body), {
          loading: "Updating source...",
          success: (response: any) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              title: "",
              product_id: "",
              status: 0 
             });
            getSources();
            return "Source updated successfully";
          },
          error: (err) => err?.message || "Failed to update source",
        });
      } else if (selectedItem == "add") {
        await toast.promise(createSourceOfRevenue(body), {
          loading: "Adding source...",
          success: (response) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
                title: "",
                product_id: "",
                status: 0 
              });
            getSources();
            return "Source added successfully";
          },
          error: (err) => err?.message || "Failed to add new source",
        });
      }
    } catch (error) {
      console.error("Failed to save source:", error);
      setShowConfirmModal(false);
    }
  }; 

  const getSources = async () => {
     setSkelitonLoading(true);
     try {
       const res = await getSourceOfRevenue();
       if (res) {
         const data = res?.data?.data?.data;
         setData(data || []);
         setSkelitonLoading(false);
         setTotalRows(data.length || 0);
         setFrom(1);
         setTo(data.length || 0);
         setPage(1);
         setTotalPage(1);
       }
     } catch (error: any) {
       console.error("Error fetching Sources:", error);
       setSkelitonLoading(false);
     }
  };

  const getProducts = async () => {
    try {
      const response = await getProductsListing();
      if (response) {
        const data = response?.data?.data?.data;
        setProdData(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
     getSources();
     getProducts();
  }, [page, pageSize]);
  
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item?.id,
        Sr: index + 1,
        title: item?.title,
        product_id: item?.product_id,
        status: item?.status,
        actions: item?.actions || [], // Include actions array from API
      };
    });

  const options = [{ label: "Name", value: "name" }];
  const handleChange = (value: SetStateAction<undefined>[]) => {
    setSelectedFilters(value[0]);
    // You can trigger filtering logic here
  };
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
            onChange={handleChange}
            placeholder="Filter"
            tokenSeparators={[","]}
            suffixIcon={<FaFilter />}
            options={options}
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

            {canCreateSOR && (
              <button
                className="theme-btn-next"
                onClick={() => {
                  setShowModal(true);
                  setSelectedItem("add");
                  setFormData({ 
                    title: "",
                    product_id: "",
                    status: 0 
                  });
                }}
              >
                Add New Record
              </button>
            )}
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
          style={{ maxWidth: "640px" }}
          title={
            selectedItem === "edit" ? "Edit Record" : "Add New Record"
          }
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowModal(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => {
                setShowConfirmModal(true);
                setShowModal(false);
              }}
            >
              {selectedItem === "edit" ? "Save" : "Submit"}
            </Button>,
          ]}
        >
          <div className={"Ente-details"}>
            <Form>
              <Row className="">
                <Col className="px-2" md={12}>
                <label className="fw-400">Title</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={(e: any) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                </Col>
                <Col className = "px-2" md={12}>
                <label className="fw-400">Product</label>
                <Select
                  className="fs-6"
                  placeholder="Enter title"
                  value={formData.product_id}
                  onChange={(e: any) =>
                    setFormData({ ...formData, product_id: e})
                  }
                >
                  {prodData.map((prod: any) => (
                      <Select.Option key={prod.id} value={prod.id}>
                        {prod.name_en}
                      </Select.Option>
                  ))}          
                </Select>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal>
        <Modal
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title={
            selectedItem === "edit"
              ? "Edit Record"
              : selectedItem === "edit"
              ? "Add New Record"
              : "Delete Record"
          }
          footer={[
            <Button key="no" onClick={() => setShowConfirmModal(false)}>
              No
            </Button>,
            <Button
              key="yes"
              type="primary"
              onClick={
                selectedItem == "delete" ? handleDeleteConfirmed : handleSave
              }
            >
              Yes
            </Button>,
          ]}
        >
          <Form>
            {`${
              selectedItem == "edit"
                ? "Are you sure you want to update this record?"
                : selectedItem == "add"
                ? "Are you sure you want to add new record?"
                : "Are you sure you want to delete this record?"
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default RevenueSource;
