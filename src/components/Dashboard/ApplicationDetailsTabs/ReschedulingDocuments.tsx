import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getReschedulingRequestDetails, updateDocStatus } from "../../../redux/apis/apisCrud";
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
    "pending": { backgroundColor: "#ffc107", color: "#000" }, // Yellow
    "under_review": { backgroundColor: "#fd7e14", color: "white" }, // Orange
    "in_progress": { backgroundColor: "#fd7e14", color: "white" }, // Orange
  };
  return colorMap[statusLower] || { backgroundColor: "#6c757d", color: "white" }; // Default gray
};

function ReschedulingDocuments() {
  const location = useLocation();
  const { id } = useParams();
  const rowData = location.state?.rowData;
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reschedulingData, setReschedulingData] = useState<any>(null);

  const loanApplicationId = rowData?.id || rowData?.loan_application_id;

  useEffect(() => {
    const applicationId = rowData?.id || rowData?.loan_application_id;
        
    if (applicationId && !isNaN(Number(applicationId))) {
      const numericId = Number(applicationId);
      fetchReschedulingRequestDetails(numericId);
    } else {
      console.warn("No valid numeric loan_application_id found. Cannot fetch rescheduling request details.");
      console.warn("Available values - rowData:", rowData, "rowData.id:", rowData?.id, "rowData.loan_application_id:", rowData?.loan_application_id, "id from params:", id);
    }
  }, [rowData?.id, rowData?.loan_application_id]);

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
              borderRadius: "4px",
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
              borderRadius: "8px",
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-3">
      {reschedulingData && (
        <div className="p-3 mb-3" style={{ background: "white" }}>
          <div className="row p-3 g-3 align-items-center account-card">
            <div className="col-12">
              <h5 
                style={{ 
                  fontSize: "16px", 
                  fontWeight: "600", 
                  marginBottom: "24px",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px"
                }}
              >
                Rescheduling Request Details
              </h5>
              <div
                className="d-flex justify-content-between align-items-center mt-2 mb-3"
                style={{ borderBottom: "1px solid #CFCFCF" }}
              >
                <p
                  style={{
                    color: "#0B0B0B",
                    fontSize: "14px",
                    lineHeight: "1.5rem",
                  }}
                >
                  Purpose of Rescheduling
                </p>
                <span
                  style={{
                    fontWeight: "600",
                    color: "#0B0B0B",
                    fontSize: "14px",
                  }}
                >
                  {reschedulingData.purpose_of_rescheduling?.title || "-"}
                </span>
              </div>
              <div
                className="d-flex justify-content-between align-items-center mt-2 mb-3"
                style={{ borderBottom: "1px solid #CFCFCF" }}
              >
                <p
                  style={{
                    color: "#0B0B0B",
                    fontSize: "14px",
                    lineHeight: "1.5rem",
                  }}
                >
                  Type
                </p>
                <span
                  style={{
                    fontWeight: "600",
                    color: "#0B0B0B",
                    fontSize: "14px",
                  }}
                >
                  {reschedulingData.type || "-"}
                </span>
              </div>
              <div
                className="d-flex justify-content-between align-items-center mt-2 mb-3"
                style={{ borderBottom: "1px solid #CFCFCF" }}
              >
                <p
                  style={{
                    color: "#0B0B0B",
                    fontSize: "14px",
                    lineHeight: "1.5rem",
                  }}
                >
                  Status
                </p>
                <span
                  style={{
                    fontWeight: "600",
                    color: "#0B0B0B",
                    fontSize: "14px",
                  }}
                >
                  {reschedulingData.status || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-3">
        <h5 style={{ fontSize: "16px", fontWeight: "600" }}>
          Rescheduling Documents
        </h5>
      </div>
      
      {documents.length > 0 ? (
        <TableView
          header={tableHeaders}
          data={documents}
          paginationShow={false}
        />
      ) : (
        <div className="p-3 text-center" style={{ color: "#6C6C6C" }}>
          No documents available
        </div>
      )}
    </div>
  );
}

export default ReschedulingDocuments;

