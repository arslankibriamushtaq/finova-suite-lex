import { useEffect, useState } from "react";
import {
  Button,
  Menu,
  Switch,
  Dropdown,
} from "antd";

import TableView from "../TableView/TableView";
import {
  getPartnerAdminList,
  updatePartnerAdminStatus,
} from "../../redux/apis/apisCrud";
import { EditOutlined, SendOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePermissions, useWorkflowActions, PARTNER_ADMIN_PERMISSIONS, WORKFLOW_MODULE_NAMES } from "../../hooks/useProductPermissions";
import { CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined, StopOutlined } from "@ant-design/icons";

const PartnerAdminList = () => {
  // Permissions
  const { hasPermission, canUpdate, canCreate, canVerifyModule, canRejectAsChecker, canApproveModule, canRejectAsApprover } = usePermissions();
  const { verifyItem, rejectAsChecker, approveItem, rejectAsApprover } = useWorkflowActions();
  
  const canEditAdmin = canUpdate(PARTNER_ADMIN_PERMISSIONS);
  const canCreateAdmin = canCreate(PARTNER_ADMIN_PERMISSIONS);
  const canResendEmail = hasPermission(PARTNER_ADMIN_PERMISSIONS.RESEND_EMAIL);
  const canUpdateStatus = hasPermission(PARTNER_ADMIN_PERMISSIONS.UPDATE_STATUS);
  const canVerifyAdmin = canVerifyModule(PARTNER_ADMIN_PERMISSIONS);
  const canCheckerRejectAdmin = canRejectAsChecker(PARTNER_ADMIN_PERMISSIONS);
  const canApproveAdmin = canApproveModule(PARTNER_ADMIN_PERMISSIONS);
  const canApproverRejectAdmin = canRejectAsApprover(PARTNER_ADMIN_PERMISSIONS);
  
  // Check if any action is available
  const hasAnyAction = canEditAdmin || canResendEmail || canVerifyAdmin || canCheckerRejectAdmin || canApproveAdmin || canApproverRejectAdmin;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("id");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);

  const handleStatusToggle = async (adminId: number, currentStatus: any) => {
    try {
      // Normalize current status to boolean
      const isActive = currentStatus === "Active" || currentStatus === 1 || currentStatus === "1" || currentStatus === true;
      const newStatus = isActive ? "0" : "1";
      
      const body = {
        status: newStatus, // Send as "1" or "0"
      };

      const response = await updatePartnerAdminStatus(adminId, body);

      if (response?.data?.success) {
        setData((prevData: any) =>
          prevData.map((item: any) =>
            item.id === adminId ? { ...item, status: newStatus === "1" ? 1 : 0 } : item
          )
        );
        toast.success(response?.data?.message || "Partner admin status updated successfully");
      } else {
        toast.error(response?.data?.message || "Failed to update partner admin status");
      }
    } catch (error: any) {
      console.error("Error updating partner admin status:", error);
      toast.error(error?.response?.data?.message || "Failed to update partner admin status");
    }
  };

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      navigate(`/PartnerManagement/UpdatePartnerAdmin?partnerId=${partnerId}&adminId=${row.id}`);
    } else if (key === "resend") {
      // TODO: Implement resend login email
    }
  };

  // Workflow action handlers
  const handleVerify = async (row: any) => {
    const result = await verifyItem(WORKFLOW_MODULE_NAMES.PARTNER_ADMIN, row, { partner_admin_id: row.id });
    if (result.success) {
      getPartnerAdminsData();
    }
  };
  
  const handleCheckerReject = async (row: any) => {
    const result = await rejectAsChecker(WORKFLOW_MODULE_NAMES.PARTNER_ADMIN, row, { partner_admin_id: row.id });
    if (result.success) {
      getPartnerAdminsData();
    }
  };
  
  const handleApprove = async (row: any) => {
    const result = await approveItem(WORKFLOW_MODULE_NAMES.PARTNER_ADMIN, row, { partner_admin_id: row.id });
    if (result.success) {
      getPartnerAdminsData();
    }
  };
  
  const handleApproverReject = async (row: any) => {
    const result = await rejectAsApprover(WORKFLOW_MODULE_NAMES.PARTNER_ADMIN, row, { partner_admin_id: row.id });
    if (result.success) {
      getPartnerAdminsData();
    }
  };
  
  const menu = (row: any) => (
    <Menu>
      {canEditAdmin && (
        <Menu.Item
          key="edit"
          icon={<EditOutlined />}
          onClick={() => handleMenuClick("edit", row)}
        >
          Edit
        </Menu.Item>
      )}
      {canResendEmail && (
        <Menu.Item
          key="resend"
          icon={<SendOutlined />}
          onClick={() => handleMenuClick("resend", row)}
        >
          Resend Login Email
        </Menu.Item>
      )}
      {canVerifyAdmin && (
        <Menu.Item
          key="verify"
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          onClick={() => handleVerify(row)}
        >
          Verify
        </Menu.Item>
      )}
      {canCheckerRejectAdmin && (
        <Menu.Item
          key="checkerReject"
          icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
          onClick={() => handleCheckerReject(row)}
        >
          Reject (Checker)
        </Menu.Item>
      )}
      {canApproveAdmin && (
        <Menu.Item
          key="approve"
          icon={<SafetyCertificateOutlined style={{ color: "#1890ff" }} />}
          onClick={() => handleApprove(row)}
        >
          Approve
        </Menu.Item>
      )}
      {canApproverRejectAdmin && (
        <Menu.Item
          key="approverReject"
          icon={<StopOutlined style={{ color: "#ff4d4f" }} />}
          onClick={() => handleApproverReject(row)}
        >
          Reject (Approver)
        </Menu.Item>
      )}
    </Menu>
  );

  const Activity_Loans_Header = [
    {
      name: "Name",
      selector: (row: { name: any }) => row.name || "-",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: { email: any }) => row.email || "-",
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone || "-",
      sortable: true,
    },
    {
      name: "Address",
      selector: (row: { address: any }) => row.address || "-",
      sortable: true,
    },
    {
      name: "DOB",
      selector: (row: { dob: any }) => row.dob || "-",
      sortable: true,
    },
    {
      name: "Country",
      selector: (row: { country_id: any }) => row.country_id === 1 ? "Saudi Arabia" : "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <Switch
          checked={row.status === "Active" || row.status === true || row.status === 1}
          disabled={!canUpdateStatus}
          onChange={() => handleStatusToggle(row.id, row.status)}
          className="red-switch"
        />
      ),
      width: "100px",
    },
    {
      name: "Registered Date",
      selector: (row: { registered_date: any }) => row.registered_date || "-",
      sortable: true,
    },
    // Only include Action column if user has any action permission
    ...(hasAnyAction ? [{
      name: "Action",
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
            Action
            <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
      width: "120px",
    }] : []),
  ];

  useEffect(() => {
    if (partnerId) {
      getPartnerAdminsData();
    }
  }, [partnerId, page, pageSize]);

  const getPartnerAdminsData = async () => {
    if (!partnerId) {
      toast.error("Partner ID is missing");
      navigate("/PartnerManagement/PartnersList");
      return;
    }

    setSkelitonLoading(true);
    try {
      const response = await getPartnerAdminList(partnerId);
      if (response?.data?.success) {
        const adminsData = response?.data?.data?.data || [];
        setData(adminsData);
        setTotalRows(adminsData.length || 0);
        setFrom(1);
        setTo(adminsData.length || 0);
        setPage(1);
        setTotalPage(Math.ceil(adminsData.length / pageSize) || 1);
      } else {
        toast.error(response?.data?.message || "Failed to fetch partner admins");
      }
    } catch (error: any) {
      console.error("Error fetching partner admins:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch partner admins");
    } finally {
      setSkelitonLoading(false);
    }
  };

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
        country_id: item?.country_id || "-",
        status: item?.status, // Keep status as-is (1/0 or true/false from API)
        registered_date: item?.registered_date || "-",
        actions: item?.actions || [], // Include actions array from API
      };
    });

  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "10px" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 style={{ margin: 0 }}>Partner Admin List</h4>
          <div className="d-flex gap-2 align-items-center">
            {canCreateAdmin && (
              <button
                className="theme-btn-next"
                onClick={() => navigate(`/LOS/PartnerManagement/AddPartnerAdmin?id=${partnerId}`)}
              >
                Add Partner Admin
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
      </div>
    </>
  );
};

export default PartnerAdminList;
