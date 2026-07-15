import { useState } from "react";
import { applicationApprovalChecks } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface Props {
  applicationNo?: string;
  creditHistory?: any;
  onUpdate?: () => void;
}

function ApproveCreditInfo({ applicationNo, creditHistory, onUpdate }: Props) {
  const { t } = useTranslation("dashboard");
  const [comment, setComment] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleApprove = async () => {
    if (!comment.trim()) {
      toast.error(t("compliance.toast.enterComment"));
      return;
    }

    if (!applicationNo) {
      toast.error(t("compliance.toast.missingAppNo"));
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
        toast.success(response?.data?.message || t("approveCredit.toast.approved"));
        setComment("");
        if (onUpdate) onUpdate();
      } else {
        toast.error(response?.data?.message || t("approveCredit.toast.approveFailed"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t("approveCredit.toast.approveFailed"));
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error(t("compliance.toast.enterComment"));
      return;
    }

    if (!applicationNo) {
      toast.error(t("compliance.toast.missingAppNo"));
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
        toast.success(response?.data?.message || t("approveCredit.toast.rejected"));
        setComment("");
        if (onUpdate) onUpdate();
      } else {
        toast.error(response?.data?.message || t("approveCredit.toast.rejectFailed"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t("approveCredit.toast.rejectFailed"));
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="profile-sec mt-3 mb-3">
      <div className="row g-3 align-items-center account-card">
        <div className="col-12">
          <div className="p-4" style={{ background: "white", borderRadius: "2px" }}>
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
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>{t("approval.processor")}</p>
                    <span style={{ fontWeight: "600", color: "#0B0B0B", fontSize: "14px" }}>
                      {creditHistory?.processor || "--"}
                    </span>
                  </div>
                  <div
                    className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                    style={{ borderBottom: "1px solid #CFCFCF" }}
                  >
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>{t("approval.applicationStatus")}</p>
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
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>{t("approval.processedDate")}</p>
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
                    <p style={{ color: "#0B0B0B", fontSize: "14px", margin: 0 }}>{t("approval.comment")}</p>
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
                    {t("approval.commentBox")}
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("approval.writeComment")}
                    className="form-control"
                    style={{
                      minHeight: "100px",
                      padding: "12px",
                      fontSize: "14px",
                      border: "1px solid #d0d0d0",
                      borderRadius: "2px",
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
                    {rejecting ? t("approval.rejecting") : t("common:reject")}
                  </button>
                  <button
                    className="theme-btn-next"
                    onClick={handleApprove}
                    disabled={rejecting || approving}
                    style={{ backgroundColor: "#dc0000" }}
                  >
                    {approving ? t("approval.approving") : t("common:approve")}
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
