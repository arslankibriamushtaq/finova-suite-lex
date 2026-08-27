import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { applicationApprovalChecks, getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";

const ApproveSimahInfo = () => {
  const { t } = useTranslation("dashboard");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams(); // Get application ID from URL
  const [simahHistory, setSimahHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSimahData();
    }
  }, [id]);

  const fetchSimahData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(id, 'approval_checks');
      
      if (response?.data?.data?.simah_history) {
        setSimahHistory(response.data.data.simah_history);
      } else {
        setSimahHistory(null);
      }
    } catch (error) {
      console.error("Error fetching SIMAH data:", error);
      toast.error(t("approveSimah.toast.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Check if we should show the approval form
  const shouldShowApprovalForm = () => {
    if (!simahHistory) return true;
    const status = simahHistory.application_status?.toLowerCase();
    return status === 'pending' || status === 'simah-pending';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = async () => {
    if (!comment.trim()) {
      toast.error(t("approveSimah.toast.enterCommentApprove"));
      return;
    }

    if (!id) {
      toast.error(t("factoringApproval.toast.appIdNotFound"));
      return;
    }

    try {
      setSubmitting(true);

      const body = {
        types: "simah_approval",
        user_id: 1,
        comment: comment.trim(),
        loan_application_number: String(id),
      };

      const response = await applicationApprovalChecks(body);

      if (response?.data?.success) {
        toast.success(response?.data?.message || t("approveSimah.toast.approved"));
        setComment(""); // Clear comment after success
        await fetchSimahData(); // Refresh data to show updated status
      } else {
        toast.error(response?.data?.message || t("approveSimah.toast.approveFailed"));
      }
    } catch (error: any) {
      console.error("Error approving SIMAH:", error);
      toast.error(
        error?.response?.data?.message ||
        t("approveSimah.toast.approveFailed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reject action
  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error(t("approveSimah.toast.enterCommentReject"));
      return;
    }

    if (!id) {
      toast.error(t("factoringApproval.toast.appIdNotFound"));
      return;
    }

    try {
      setSubmitting(true);
      
      const body = {
        types: "simah_rejection",
        user_id: 1,
        comment: comment.trim(),
        loan_application_number: String(id),
      };

      const response = await applicationApprovalChecks(body);

      if (response?.data?.success) {
        toast.success(response?.data?.message || t("approveSimah.toast.rejected"));
        setComment(""); // Clear comment after success
        await fetchSimahData(); // Refresh data to show updated status
      } else {
        toast.error(response?.data?.message || t("approveSimah.toast.rejectFailed"));
      }
    } catch (error: any) {
      console.error("Error rejecting SIMAH:", error);
      toast.error(
        error?.response?.data?.message ||
        t("approveSimah.toast.rejectFailed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="approve-simah-container" style={{ padding: "20px" }}>
      {shouldShowApprovalForm() ? (
        <>
          {/* Comment Box Section */}
          <div
            className="comment-section p-4 mb-4"
            style={{ 
              background: "white", 
              borderRadius: "2px",
              border: "1px solid #e0e0e0"
            }}
          >
            <h6 style={{ marginBottom: "15px", color: "#333", fontWeight: "600" }}>
              {t("approval.commentBox")}
            </h6>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder={t("approval.writeComment")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                style={{
                  fontSize: "14px",
                  borderRadius: "2px",
                  border: "1px solid #d0d0d0",
                  padding: "12px",
                  resize: "vertical",
                }}
              />
              <Form.Text className="text-muted" style={{ fontSize: "12px", marginTop: "10px" }}>
                {t("approveSimah.helper")}
              </Form.Text>
            </Form.Group>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-3">
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={submitting || !comment.trim()}
              style={{
                minWidth: "150px",
                fontWeight: "600",
                padding: "10px 30px",
              }}
            >
              {submitting ? (
                <>
                  <div style={{ display: "inline-block", transform: "scale(0.3)", transformOrigin: "center", marginRight: "8px" }}>
                    <Loader />
                  </div>
                  {t("approval.processing")}
                </>
              ) : (
                t("common:reject")
              )}
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={submitting || !comment.trim()}
              style={{
                minWidth: "150px",
                fontWeight: "600",
                padding: "10px 30px",
              }}
            >
              {submitting ? (
                <>
                  <div style={{ display: "inline-block", transform: "scale(0.3)", transformOrigin: "center", marginRight: "8px" }}>
                    <Loader />
                  </div>
                  {t("approval.processing")}
                </>
              ) : (
                t("common:approve")
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Display SIMAH History Information */}
          <div
            className="simah-history-info p-4"
            style={{ 
              background: "white", 
              borderRadius: "2px",
              border: "1px solid #e0e0e0"
            }}
          >
            {/* Row 1: Processor and Processed Date */}
            <div className="row mb-3" style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "15px" }}>
              <div className="col-md-6 d-flex">
                <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", minWidth: "150px" }}>
                  {t("approval.processor")}
                </div>
                <div style={{ fontSize: "14px", color: "#000", fontWeight: "600", flex: 1, textAlign: "right" }}>
                  {simahHistory?.processor || 'N/A'}
                </div>
              </div>

              <div className="col-md-6 d-flex">
                <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", minWidth: "150px" }}>
                  {t("approval.processedDate")}
                </div>
                <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", flex: 1, textAlign: "right" }}>
                  {formatDate(simahHistory?.processed_date)}
                </div>
              </div>
            </div>

            {/* Row 2: Application Status and Comment */}
            <div className="row">
              <div className="col-md-6 d-flex align-items-center">
                <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", minWidth: "150px" }}>
                  {t("approval.applicationStatus")}
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <span 
                    style={{ 
                      fontSize: "14px",
                      fontWeight: "600",
                      color: simahHistory?.application_status?.toLowerCase().includes('approved') 
                        ? '#AB1920' 
                        : '#000000'
                    }}
                  >
                    {simahHistory?.application_status || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="col-md-6 d-flex">
                <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", minWidth: "150px" }}>
                  {t("approval.comment")}
                </div>
                <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", flex: 1, textAlign: "right" }}>
                  {simahHistory?.app_comment || t("approval.noComment")}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApproveSimahInfo;
