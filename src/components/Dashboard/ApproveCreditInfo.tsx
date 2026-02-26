import { useState } from "react";
import { applicationApprovalChecks } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

interface Props {
  applicationNo?: string;
  creditHistory?: any;
  onUpdate?: () => void;
}

function ApproveCreditInfo({ applicationNo, creditHistory, onUpdate }: Props) {
  const [comment, setComment] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleApprove = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!applicationNo) {
      toast.error("Missing application number");
      return;
    }

    setApproving(true);
    try {
      const body = {
        types: "credit_approval",
        user_id: 1,
        comment: comment,
        loan_application_number: String(applicationNo),
      };

      const response = await applicationApprovalChecks(body);

      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Credit approved successfully!");
        setComment("");
        if (onUpdate) onUpdate();
      } else {
        toast.error(response?.data?.message || "Failed to approve credit");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to approve credit");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!applicationNo) {
      toast.error("Missing application number");
      return;
    }

    setRejecting(true);
    try {
      const body = {
        types: "credit_rejection",
        user_id: 1,
        comment: comment,
        loan_application_number: String(applicationNo),
      };

      const response = await applicationApprovalChecks(body);

      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Credit rejected successfully!");
        setComment("");
        if (onUpdate) onUpdate();
      } else {
        toast.error(response?.data?.message || "Failed to reject credit");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to reject credit");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="profile-sec mt-3 mb-3">
      <div className="row g-3 align-items-center account-card">
        <div className="col-12">
          <div className="p-4" style={{ background: "white", borderRadius: "8px" }}>
            {/* Check if already approved/rejected */}
            {creditHistory?.application_status &&
            creditHistory?.application_status?.toLowerCase() !== "pending" ? (
              /* Display credit history status */
              <div className="row">
                <div className="col-6">
                  <div
                    className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                    style={{ borderBottom: "1px solid #CFCFCF" }}
                  >
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>Processor</p>
                    <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                      {creditHistory?.processor || "--"}
                    </span>
                  </div>
                  <div
                    className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                    style={{ borderBottom: "1px solid #CFCFCF" }}
                  >
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>Application Status</p>
                    <span
                      style={{
                        fontWeight: "600",
                        color: creditHistory?.application_status?.toLowerCase().includes("approved")
                          ? "#28a745"
                          : "#000000",
                        fontSize: "14px",
                      }}
                    >
                      {creditHistory?.application_status || "--"}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                    style={{ borderBottom: "1px solid #CFCFCF" }}
                  >
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>Processed Date</p>
                    <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                      {creditHistory?.processed_date
                        ? new Date(creditHistory.processed_date).toLocaleString()
                        : "--"}
                    </span>
                  </div>
                  <div
                    className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                    style={{ borderBottom: "1px solid #CFCFCF" }}
                  >
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>Comment</p>
                    <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                      {creditHistory?.app_comment || "--"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Show comment box and buttons */
              <>
                <div className="mb-3">
                  <label
                    htmlFor="comment"
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Comment Box
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write comment here"
                    className="form-control"
                    style={{
                      minHeight: "100px",
                      padding: "12px",
                      fontSize: "14px",
                      border: "1px solid #d0d0d0",
                      borderRadius: "4px",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="theme-btn-next"
                    onClick={handleReject}
                    disabled={rejecting || approving}
                    style={{ backgroundColor: "#000000" }}
                  >
                    {rejecting ? "Rejecting..." : "Reject"}
                  </button>
                  <button
                    className="theme-btn-next"
                    onClick={handleApprove}
                    disabled={rejecting || approving}
                    style={{ backgroundColor: "#dc0000" }}
                  >
                    {approving ? "Approving..." : "Approve"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApproveCreditInfo;
