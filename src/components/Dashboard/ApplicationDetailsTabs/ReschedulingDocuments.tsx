import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getReschedulingRequestDetails, updateDocStatus } from "../../../redux/apis/apisCrud";
import { getReschedulesByApplication } from "../../../redux/apis/apisLendingService";
import toast from "react-hot-toast";
import Loader from "../../Loader/Loader";
import TableView from "../../TableView/TableView";
import { Button, Dropdown, Menu } from "antd";
import arrowDown from "../../../assets/images/arrow-down.png";

const getDocumentStatusColor = (status: string): { backgroundColor: string; color: string } => {
  const statusLower = status?.toLowerCase() || "";
  const colorMap: { [key: string]: { backgroundColor: string; color: string } } = {
    "uploaded": { backgroundColor: "#17a2b8", color: "white" }, // Blue
    "approved": { backgroundColor: "#28a745", color: "white" }, // Green
    "rejected": { backgroundColor: " #1963b9", color: "white" }, // Red
    "pending": { backgroundColor: "#ffc107", color: "var(--foreground)" }, // Yellow
    "under_review": { backgroundColor: "#fd7e14", color: "white" }, // Orange
    "in_progress": { backgroundColor: "#fd7e14", color: "white" }, // Orange
  };
  return colorMap[statusLower] || { backgroundColor: "#6c757d", color: "white" }; // Default gray
};

function ReschedulingDocuments({ fullDetail }: any) {
  const location = useLocation();
  const { id } = useParams();
  const rowData = location.state?.rowData;
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reschedulingData, setReschedulingData] = useState<any>(null);
  const [rescheduleHistory, setRescheduleHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loanApplicationId = rowData?.id || rowData?.loan_application_id;
  const applicationId = rowData?.id || rowData?.applicationId;

  useEffect(() => {
    if (fullDetail?.reschedulingRequest) {
      const rr = fullDetail.reschedulingRequest;
      setReschedulingData(rr);
      // Use requests array from rescheduling request
      setRescheduleHistory(Array.isArray(rr.requests) ? rr.requests : []);
      setHistoryLoading(false);
      return;
    }
  }, [fullDetail]);

  useEffect(() => {
    if (fullDetail !== undefined) return;
    const applicationId = rowData?.id || rowData?.loan_application_id;

    if (applicationId) {
      fetchRescheduleHistory(applicationId);
    }
  }, [rowData?.id, rowData?.loan_application_id, fullDetail]);

  const fetchRescheduleHistory = async (appId: string) => {
    if (!appId) return;

    setHistoryLoading(true);
    try {
      const response = await getReschedulesByApplication(appId);
      const history = response?.data?.data?.reschedules || [];
      setRescheduleHistory(Array.isArray(history) ? history : []);
    } catch (error: any) {
      console.error("Error fetching reschedule history:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch reschedule history");
      setRescheduleHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchReschedulingRequestDetails = async (loanApplicationId: number) => {
    if (!loanApplicationId) {
      return;
    }

    setLoading(true);
    try {
      const response = await getReschedulingRequestDetails(loanApplicationId);
      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;
        
        const reschedulingRequest = data.rescheduling_request;
        if (reschedulingRequest) {
          setReschedulingData(reschedulingRequest);
          
          const mappedDocuments = (reschedulingRequest.loan_application?.document_loan_applications || []).map((doc: any) => ({
            id: doc.id, 
            reason: doc.reason || "-",
            document: doc.document || "-",
            status: doc.status || "-",
            document_id: doc.document_id,
            loan_application_id: doc.loan_application_id,
          }));
          
          setDocuments(mappedDocuments);
        } else {
          setDocuments([]);
          setReschedulingData(null);
        }
      }
    } catch (error: any) {
      console.error("Error fetching rescheduling request details:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch rescheduling request details");
      setDocuments([]);
      setReschedulingData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "approved" | "rejected", Id: number) => {
    if (!loanApplicationId) {
      toast.error("Missing required information");
      return;
    }

    setLoading(true);
    try {
      const body = {
        loan_application_id: Number(loanApplicationId),
        status: action,
      };

      const response = await updateDocStatus(Id, body);

      if (response?.data?.success || response?.data?.notificationMessage === "Operation successful.") {
        toast.success(`Document ${action === "approved" ? "approved" : "rejected"} successfully`);
        await fetchReschedulingRequestDetails(Number(loanApplicationId));
      } else {
        toast.error(response?.data?.message || `Failed to ${action} document`);
      }
    } catch (error: any) {
      console.error(`Error ${action}ing document:`, error);
      toast.error(error?.response?.data?.message || `Failed to ${action} document`);
    } finally {
      setLoading(false);
    }
  };

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="approve"
        onClick={() => handleAction("approved", row.id)}
      >
        Approve
      </Menu.Item>
      <Menu.Item
        key="reject"
        onClick={() => handleAction("rejected", row.id)}
      >
        Reject
      </Menu.Item>
    </Menu>
  );

  const tableHeaders = [
    {
      name: "Reason",
      selector: (row: any) => row.reason,
      sortable: true,
    },
    {
      name: "Document",
      cell: (row: any) => {
        if (!row.document || row.document === "-") {
          return "-";
        }
        return (
          <a
            href={row.document}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1890ff", textDecoration: "underline" }}
          >
            View Document
          </a>
        );
      },
      sortable: false,
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.status || "-";
        const statusColor = getDocumentStatusColor(status);
        
        return (
          <span 
            className="badge"
            style={{ 
              fontSize: "12px", 
              padding: "6px 12px",
              fontWeight: "500",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              borderRadius: "2px",
              textTransform: "capitalize",
              ...statusColor
            }}
            title={status}
          >
            {status}
          </span>
        );
      },
      sortable: true,
      width: "150px",
    },
    {
      name: "Action",
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
      sortable: false,
      width: "120px",
    },
  ];

  const historyTableHeaders = [
    {
      name: "Reschedule Type",
      selector: (row: any) => row.rescheduleType?.replace(/_/g, " ") || "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.status || "-";
        const statusColor = getDocumentStatusColor(status);
        
        return (
          <span 
            className="badge"
            style={{ 
              fontSize: "12px", 
              padding: "6px 12px",
              fontWeight: "500",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              borderRadius: "2px",
              textTransform: "capitalize",
              ...statusColor
            }}
            title={status}
          >
            {status}
          </span>
        );
      },
      sortable: true,
      width: "100px",
    },
    {
      name: "Extension Months",
      selector: (row: any) => row.extensionMonths != null ? `${row.extensionMonths} months` : "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "Holiday Months",
      selector: (row: any) => row.holidayMonths != null ? `${row.holidayMonths} months` : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "New Tenure Months",
      selector: (row: any) => row.newTenureMonths != null ? `${row.newTenureMonths} months` : "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "Old Installment",
      selector: (row: any) => row.oldInstallment != null ? `SAR ${parseFloat(row.oldInstallment).toFixed(2)}` : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "New Installment",
      selector: (row: any) => row.newInstallment != null ? `SAR ${parseFloat(row.newInstallment).toFixed(2)}` : "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "Old Maturity Date",
      selector: (row: any) => row.oldMaturityDate ? new Date(row.oldMaturityDate).toLocaleDateString() : "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "New Maturity Date",
      selector: (row: any) => row.newMaturityDate ? new Date(row.newMaturityDate).toLocaleDateString() : "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Profit Rate",
      selector: (row: any) => row.newProfitRate || "-",
      sortable: true,
      width: "100px",
    },
    {
      name: "Write Off Amount",
      selector: (row: any) => row.writeOffAmount != null ? `SAR ${parseFloat(row.writeOffAmount).toFixed(2)}` : "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "Justification",
      selector: (row: any) => row.justification || "-",
      sortable: false,
      width: "250px",
    },
    {
      name: "Created At",
      selector: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      sortable: true,
      width: "120px",
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-3">
      {/* Reschedule History Section */}
      <div>
        <h5 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
          Reschedule History
        </h5>
        
        {historyLoading ? (
          <Loader />
        ) : rescheduleHistory.length > 0 ? (
          <TableView
            header={historyTableHeaders}
            data={rescheduleHistory}
            paginationShow={false}
          />
        ) : (
          <div className="p-3 text-center" style={{ color: "#6C6C6C" }}>
            No reschedule history available
          </div>
        )}
      </div>
    </div>
  );
}

export default ReschedulingDocuments;

