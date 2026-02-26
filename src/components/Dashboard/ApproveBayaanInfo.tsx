import { useState, useEffect } from "react";
import { applicationApprovalChecks, getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Loader from "../Loader/Loader";

const ApproveBayaanInfo = () => {
  const [comment, setComment] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bayaanHistory, setBayaanHistory] = useState<any>(null);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchBayanData();
    }
  }, [id]);

  const fetchBayanData = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const response = await getApplicationDetailsByType(id, "approval_checks");

      if (response?.data?.success && response?.data?.data) {
        const bayaanHistoryData = response.data.data.bayan_history || null;
        setBayaanHistory(bayaanHistoryData);
      } else {
        toast.error("Failed to load Bayan data");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to load Bayan data");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    
    if (!id) {
      toast.error("Missing application number");
      return;
    }

    setRejecting(true);
    try {
      const body = {
        types: "bayan_rejection",
        user_id: 1,
        comment: comment,
        loan_application_number: String(id),
      };
      
      const response = await applicationApprovalChecks(body);
      
      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Bayan rejected successfully!");
        setComment("");
        await fetchBayanData();
      } else {
        toast.error(response?.data?.message || "Failed to reject bayan");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to reject bayan");
    } finally {
      setRejecting(false);
    }
  };

  const handleApprove = async () => {
    /* if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    } */
    if (!id) {
      toast.error("Missing application number");
      return;
    }

    setApproving(true);
    try {
      const body = {
        types: "bayan_approval",
        user_id: 1,
        comment: comment,
        loan_application_number: String(id),
      };
      
      const response = await applicationApprovalChecks(body);
      
      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Bayan approved successfully!");
        setComment("");
        await fetchBayanData();
      } else {
        toast.error(response?.data?.message || "Failed to approve bayan");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to approve bayan");
    } finally {
      setApproving(false);
    }
  };


  if (loading) {
    return <Loader />;
  }

  return (
    <div
      className="p-4 mt-3 mb-3"
      style={{ background: "white", borderRadius: "8px" }}
    >
      {bayaanHistory ? (
        // Display Bayan History Information
        <div className="row">
          <div className="col-12">
            <h6 className="mb-3" style={{ fontWeight: "600", color: "#000000" }}>
              Bayan Approval Status
            </h6>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                Processor
              </p>
              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                {bayaanHistory.processor || "--"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                Application Status
              </p>
              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                {bayaanHistory.application_status || "--"}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                Processed Date
              </p>
              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                {bayaanHistory.processed_date ? new Date(bayaanHistory.processed_date).toLocaleString() : "--"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                Comment
              </p>
              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                {bayaanHistory.app_comment || "--"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Show Comment Box and Approve/Reject Buttons
        <div className="mb-3">
          <label 
            htmlFor="reason" 
            style={{ 
              fontSize: "14px", 
              fontWeight: "500",
              marginBottom: "8px",
              display: "block"
            }}
          >
            Select Reason
          </label>
          <div className="d-flex align-items-center gap-3">
            <input
              id="reason"
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-control"
              style={{
                flex: 1,
                padding: "10px 15px",
                fontSize: "14px",
                border: "1px solid #d0d0d0",
                borderRadius: "4px"
              }}
            />
            <div className="d-flex gap-2">
              <button 
                className="theme-btn-next"
                onClick={handleReject}
                disabled={rejecting}
                style={{ opacity: rejecting ? 0.6 : 1 }}
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
              <button 
                className="theme-btn-next"
                onClick={handleApprove}
                disabled={approving}
                style={{ opacity: approving ? 0.6 : 1 }}
              >
                {approving ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveBayaanInfo;
