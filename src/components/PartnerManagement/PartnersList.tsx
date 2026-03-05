import { useEffect, useState } from "react";
import {
  Button,
  Menu,
  Switch,
  Dropdown,
  DatePicker,
  List,
} from "antd";

import TableView from "../TableView/TableView";
import {
  getPartnersList,
  updatePartnerStatus,
} from "../../redux/apis/apisCrud";
import { EditOutlined, SendOutlined, UnorderedListOutlined, UserOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { useNavigate } from "react-router-dom";
import { usePermissions, useWorkflowActions, PARTNER_PERMISSIONS, WORKFLOW_MODULE_NAMES } from "../../hooks/useProductPermissions";
import { CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined, StopOutlined } from "@ant-design/icons";

const PartnersList = () => {
  // Permissions
  const { hasPermission, canUpdate, canVerifyModule, canRejectAsChecker, canApproveModule, canRejectAsApprover } = usePermissions();
  const { verifyItem, rejectAsChecker, approveItem, rejectAsApprover } = useWorkflowActions();
  
  const canEditPartner = canUpdate(PARTNER_PERMISSIONS);
  const canUpdateStatus = hasPermission(PARTNER_PERMISSIONS.UPDATE_STATUS);
  const canListPartner = hasPermission(PARTNER_PERMISSIONS.LIST);
  const canVerifyPartner = canVerifyModule(PARTNER_PERMISSIONS);
  const canCheckerRejectPartner = canRejectAsChecker(PARTNER_PERMISSIONS);
  const canApprovePartner = canApproveModule(PARTNER_PERMISSIONS);
  const canApproverRejectPartner = canRejectAsApprover(PARTNER_PERMISSIONS);
  
  // Check if any action is available (Admin List is always shown)
  const hasAnyAction = true; // Admin List is always available, so action column is always shown
  const navigate = useNavigate();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const handleStatusToggle = async (partnerId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      
      const body = {
        status: newStatus === "Active" ? "1" : "0", // Send as "1" or "0"
      };

      const response = await updatePartnerStatus(partnerId, body);

      if (response?.data?.success) {
        setData((prevData: any) =>
          prevData.map((item: any) =>
            item.id === partnerId ? { ...item, status: newStatus } : item
          )
        );
        toast.success(response?.data?.message || "Partner status updated successfully");
      } else {
        toast.error(response?.data?.message || "Failed to update partner status");
      }
    } catch (error: any) {
      console.error("Error updating partner status:", error);
      toast.error(error?.response?.data?.message || "Failed to update partner status");
    }
  };

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      navigate(`/LOS/PartnerManagement/UpdatePartner?id=${row.id}`);
    } else if (key === "adminList") {
      navigate(`/LOS/PartnerManagement/PartnerAdminList?id=${row.id}`);
    }
  };

  // Workflow action handlers
  const handleVerify = async (row: any) => {
    const result = await verifyItem(WORKFLOW_MODULE_NAMES.PARTNER, row, { partner_id: row.id });
    if (result.success) {
      getPartnersData();
    }
  };
  
  const handleCheckerReject = async (row: any) => {
    const result = await rejectAsChecker(WORKFLOW_MODULE_NAMES.PARTNER, row, { partner_id: row.id });
    if (result.success) {
      getPartnersData();
    }
  };
  
  const handleApprove = async (row: any) => {
    const result = await approveItem(WORKFLOW_MODULE_NAMES.PARTNER, row, { partner_id: row.id });
    if (result.success) {
      getPartnersData();
    }
  };
  
  const handleApproverReject = async (row: any) => {
    const result = await rejectAsApprover(WORKFLOW_MODULE_NAMES.PARTNER, row, { partner_id: row.id });
    if (result.success) {
      getPartnersData();
    }
  };
  
  const menu = (row: any) => (
    <Menu>
      {canEditPartner && (
        <Menu.Item
          key="edit"
          icon={<EditOutlined />}
          onClick={() => handleMenuClick("edit", row)}
        >
          Edit
        </Menu.Item>
      )}
      <Menu.Item
        key="adminList"
        icon={<UnorderedListOutlined />}
        onClick={() => handleMenuClick("adminList", row)}
      >
        Admin List
      </Menu.Item>
      {canVerifyPartner && (
        <Menu.Item
          key="verify"
          icon={<CheckCircleOutlined style={{ color: "var(--color-success)" }} />}
          onClick={() => handleVerify(row)}
        >
          Verify
        </Menu.Item>
      )}
      {canCheckerRejectPartner && (
        <Menu.Item
          key="checkerReject"
          icon={<CloseCircleOutlined style={{ color: "var(--color-error)" }} />}
          onClick={() => handleCheckerReject(row)}
        >
          Reject (Checker)
        </Menu.Item>
      )}
      {canApprovePartner && (
        <Menu.Item
          key="approve"
          icon={<SafetyCertificateOutlined style={{ color: "var(--color-action)" }} />}
          onClick={() => handleApprove(row)}
        >
          Approve
        </Menu.Item>
      )}
      {canApproverRejectPartner && (
        <Menu.Item
          key="approverReject"
          icon={<StopOutlined style={{ color: "var(--color-error)" }} />}
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
    selector: (row: { name_en: any }) => row.name_en,
    sortable: true,
    width: "150px",
  },
  {
    name: "اسم",
    selector: (row: { name_ar: any }) => row.name_ar,
    sortable: true,
    width: "150px",
  },
  {
    name: "Email",
    selector: (row: { email: any }) => row.email,
    sortable: true,
    width: "250px",
  },
  {
    name: "Logo",
    cell: (row: any) => (
      row.logo ? <img src={row.logo} alt="logo" style={{ width: "30px", height: "30px" }} /> : "-"
    ),
    width: "120px",
  },
  {
    name: "Favicon",
    cell: (row: any) => (
      row.favicon ? <img src={row.favicon} alt="favicon" style={{ width: "20px", height: "20px" }} /> : "-"
    ),
    width: "100px",
  },
  {
    name: "Affiliation URL",
    selector: (row: { affiliation_url: any }) => row.affiliation_url || "-",
    sortable: true,
    width: "320px",
  },
  {
    name: "Commission",
    selector: (row: { commission_value: any }) => row.commission_value ? `${row.commission_value}%` : "0%",
    sortable: true,
    width: "120px",
  },
  {
    name: "Secret Key",
    cell: (row: any) => (
      <div
        style={{
          wordBreak: "break-word",
          whiteSpace: "normal",
          lineHeight: "1.4",
          fontSize: "12px",
        }}
      >
        {row.secret_key || "-"}
      </div>
    ),
    width: "350px",
  },
  {
    name: "Status",
    cell: (row: any) => (
      <Switch
        checked={row.status === "Active"}
        disabled={!canUpdateStatus}
        onChange={() => handleStatusToggle(row.id, row.status)}
        className="red-switch"
      />
    ),
    width: "120px",
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
    getPartnersData();
  }, [page, pageSize]);

  const getPartnersData = async () => {
    setSkelitonLoading(true);
    try {
      const response = await getPartnersList();
      if (response?.data?.success) {
        const partnersData = response?.data?.data?.data || [];
        setData(partnersData);
        setTotalRows(partnersData.length || 0);
        setFrom(1);
        setTo(partnersData.length || 0);
        setPage(1);
        setTotalPage(Math.ceil(partnersData.length / pageSize) || 1);
        toast.success(response?.data?.message || "Partners fetched successfully");
      } else {
        toast.error(response?.data?.message || "Failed to fetch partners");
      }
    } catch (error: any) {
      console.error("Error fetching partners:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch partners");
    } finally {
      setSkelitonLoading(false);
    }
  };

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        name_en: item?.name_en || "-",
        name_ar: item?.name_ar || "-",
        email: item?.email || "-",
        logo: item?.logo,
        favicon: item?.favicon,
        affiliation_url: item?.affiliation_url,
        commission_value: item?.commission_value,
        secret_key: item?.secret_key,
        status: item?.status || "Inactive",
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
          <h4 style={{ margin: 0 }}>Partner List</h4>
          <div className="d-flex gap-2 align-items-center">
            {/* <div className="d-flex flex-column">
              <label style={{ fontSize: "12px", marginBottom: "4px" }}>From</label>
              <DatePicker
                className="date-picker"
                placeholder="mm/dd/yyyy"
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                allowClear
                format="MM/DD/YYYY"
              />
            </div>
            <div className="d-flex flex-column">
              <label style={{ fontSize: "12px", marginBottom: "4px" }}>To</label>
              <DatePicker
                className="date-picker"
                placeholder="mm/dd/yyyy"
                value={toDate}
                onChange={(date) => setToDate(date)}
                allowClear
                format="MM/DD/YYYY"
              />
            </div> */}
            {hasPermission(PARTNER_PERMISSIONS.CREATE) && (
              <button
                className="theme-btn-next"
                style={{ marginTop: "20px", padding: "0.6rem" }}
                onClick={() => navigate("/LOS/PartnerManagement/AddPartner")}
              >
                Add Partner
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

export default PartnersList;
