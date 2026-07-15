import { useState, useEffect } from "react";
import { applicationApprovalChecks, getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";

const ApproveBayaanInfo = () => {
  const { t } = useTranslation("dashboard");
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
        toast.error(t("approveBayaan.toast.loadFailed"));
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || error?.message || t("approveBayaan.toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error(t("compliance.toast.enterComment"));
      return;
    }

    if (!id) {
      toast.error(t("compliance.toast.missingAppNo"));
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
        toast.success(response?.data?.message || t("approveBayaan.toast.rejected"));
        setComment("");
        await fetchBayanData();
      } else {
        toast.error(response?.data?.message || t("approveBayaan.toast.rejectFailed"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t("approveBayaan.toast.rejectFailed"));
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
      toast.error(t("compliance.toast.missingAppNo"));
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
        toast.success(response?.data?.message || t("approveBayaan.toast.approved"));
        setComment("");
        await fetchBayanData();
      } else {
        toast.error(response?.data?.message || t("approveBayaan.toast.approveFailed"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t("approveBayaan.toast.approveFailed"));
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
      style={{ background: "white", borderRadius: "2px" }}
    >
      {bayaanHistory ? (
        // Display Bayan History Information
        <div className="row">
          <div className="col-12">
            <h6 className="mb-3" style={{ fontWeight: "600", color: "#000000" }}>
              {t("approveBayaan.statusTitle")}
            </h6>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                {t("approval.processor")}
              </p>
              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                {bayaanHistory.processor || "--"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                {t("approval.applicationStatus")}
              </p>
              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                {bayaanHistory.application_status || "--"}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                {t("approval.processedDate")}
              </p>
              <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                {bayaanHistory.processed_date ? new Date(bayaanHistory.processed_date).toLocaleString() : "--"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid #CFCFCF" }}>
              <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>
                {t("approval.comment")}
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
            {t("approveBayaan.selectReason")}
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
                borderRadius: "2px"
              }}
            />
            <div className="d-flex gap-2">
              <button 
                className="theme-btn-next"
                onClick={handleReject}
                disabled={rejecting}
                style={{ opacity: rejecting ? 0.6 : 1 }}
              >
                {rejecting ? t("approval.rejecting") : t("common:reject")}
              </button>
              <button 
                className="theme-btn-next"
                onClick={handleApprove}
                disabled={approving}
                style={{ opacity: approving ? 0.6 : 1 }}
              >
                {approving ? t("approval.approving") : t("common:approve")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveBayaanInfo;
