import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApplicationDetailsByType, applicationApprovalChecks } from '../../redux/apis/apisCrud';
import Loader from '../Loader/Loader';
import toast from 'react-hot-toast';
import { Modal } from 'antd';

type StatusRow = {
  checks: string;
  status: string;
  processedDate?: string;
  processedBy?: string;
  comment?: string;
};

const EmptyCell = () => <span>--</span>;

const ApplicationApproval = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectedHistory, setRejectedHistory] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getApplicationDetailsByType(id, "approval_checks");

      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;

        // Normalize expected fields
        const list: StatusRow[] = [];

        const pushRow = (checks: string, value: any) => {
          // Handle boolean values directly from API response
          if (typeof value === 'boolean') {
            list.push({
              checks,
              status: value ? 'Approved' : 'Not Approved',
              processedDate: '',
              processedBy: '',
              comment: '',
            });
            return;
          }
          
          // Handle object format (for backward compatibility)
          if (value && typeof value === 'object') {
            const status = value?.application_status || 'Not Approved';
            list.push({
              checks,
              status: String(status),
              processedDate: value?.processed_date || '',
              processedBy: value?.processor || '',
              comment: value?.app_comment || '',
            });
            return;
          }
          
          // Default case
          list.push({ 
            checks, 
            status: 'Not Approved', 
            processedDate: '', 
            processedBy: '', 
            comment: '' 
          });
        };

        // Map API data to the required checks
        pushRow('Financial Statement', data?.financial_statement);
        pushRow('Credit', data?.credit);
        pushRow('Compliance', data?.compliance);
        pushRow('Salary', data?.salary);
        pushRow('Simah', data?.simah);

        setRows(list);

        // Extract rejected_history
        setRejectedHistory(data?.rejected_history || null);

      } else {
        toast.error("Failed to load approval data");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      setError(error?.message || 'Failed to load approval statuses');
      toast.error(error?.response?.data?.message || error?.message || "Failed to load approval data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) {
      toast.error('Application number is required');
      return;
    }

    setApproving(true);
    try {
      const response = await applicationApprovalChecks({
        types: "APPROVED",
        user_id: 1,
        loan_application_number: id,
        comment: "" // Comment is optional for approval
      });

      if (response?.data?.success || response?.status === 200) {
        toast.success('Application approved successfully!');
        await fetchData(); // Refresh data from API first
        setIsApproved(true);
        setApprovalReason(response?.data?.message || 'Application has been approved');
      } else {
        // Handle validation errors
        const apiErrors = response?.data?.errors || {}
        if (Object.keys(apiErrors).length > 0) {
          // Extract first error message
          const firstErrorKey = Object.keys(apiErrors)[0]
          const firstError = Array.isArray(apiErrors[firstErrorKey]) 
            ? apiErrors[firstErrorKey][0] 
            : apiErrors[firstErrorKey]
          toast.error(firstError || response?.data?.message || 'Failed to approve application')
        } else {
          toast.error(response?.data?.message || 'Failed to approve application');
        }
      }
    } catch (error: any) {
      // Handle validation errors from catch block
      const apiErrors = error?.response?.data?.errors || {}
      if (Object.keys(apiErrors).length > 0) {
        const firstErrorKey = Object.keys(apiErrors)[0]
        const firstError = Array.isArray(apiErrors[firstErrorKey]) 
          ? apiErrors[firstErrorKey][0] 
          : apiErrors[firstErrorKey]
        toast.error(firstError || error?.response?.data?.message || error?.message || 'Failed to approve application')
      } else {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to approve application');
      }
    } finally {
      setApproving(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
    setRejectComment('');
  };

  const handleReject = async () => {
    if (!id) {
      toast.error('Application number is required');
      return;
    }

    if (!rejectComment.trim()) {
      toast.error('Please enter a reason for rejection');
      return;
    }

    setRejecting(true);
    try {
      const response = await applicationApprovalChecks({
        types: "reject_application",
        user_id: 1,
        loan_application_number: id,
        comment: rejectComment
      });

      if (response?.data?.success || response?.status === 200) {
        toast.success('Application rejected successfully!');
        setShowRejectModal(false);
        setRejectComment('');
        await fetchData(); // Refresh data from API first
        setIsRejected(true);
        setApprovalReason(rejectComment);
      } else {
        // Handle validation errors
        const apiErrors = response?.data?.errors || {}
        if (Object.keys(apiErrors).length > 0) {
          // Extract first error message
          const firstErrorKey = Object.keys(apiErrors)[0]
          const firstError = Array.isArray(apiErrors[firstErrorKey]) 
            ? apiErrors[firstErrorKey][0] 
            : apiErrors[firstErrorKey]
          toast.error(firstError || response?.data?.message || 'Failed to reject application')
        } else {
          toast.error(response?.data?.message || 'Failed to reject application');
        }
      }
    } catch (error: any) {
      // Handle validation errors from catch block
      const apiErrors = error?.response?.data?.errors || {}
      if (Object.keys(apiErrors).length > 0) {
        const firstErrorKey = Object.keys(apiErrors)[0]
        const firstError = Array.isArray(apiErrors[firstErrorKey]) 
          ? apiErrors[firstErrorKey][0] 
          : apiErrors[firstErrorKey]
        toast.error(firstError || error?.response?.data?.message || error?.message || 'Failed to reject application')
      } else {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to reject application');
      }
    } finally {
      setRejecting(false);
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectComment('');
  };

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'crimson' }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ 
        background: "white", 
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr 1fr 1fr 1fr"
        }}>
          {/* Header Row */}
          <div style={{
            padding: "12px 16px",
            background: " #1963b9",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>Checks</div>
          <div style={{
            padding: "12px 16px",
            background: " #1963b9",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>Status</div>
          <div style={{
            padding: "12px 16px",
            background: " #1963b9",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>Processed Date</div>
          <div style={{
            padding: "12px 16px",
            background: " #1963b9",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>Processed By</div>
          <div style={{
            padding: "12px 16px",
            background: " #1963b9",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>Comment</div>

          {/* Data Rows */}
          {rows.map((r, idx) => (
            <React.Fragment key={`${r.checks}-${idx}`}>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid #E5E7EB",
                fontWeight: "600",
                fontSize: "14px",
                color: "#000"
              }}>{r.checks}</div>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid #E5E7EB",
                fontSize: "14px",
                color: "#000"
              }}>{r.status || <EmptyCell />}</div>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid #E5E7EB",
                fontSize: "14px",
                color: "#000"
              }}>{r.processedDate || <EmptyCell />}</div>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid #E5E7EB",
                fontSize: "14px",
                color: "#000"
              }}>{r.processedBy || <EmptyCell />}</div>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid #E5E7EB",
                fontSize: "14px",
                color: "#000"
              }}>{r.comment || <EmptyCell />}</div>
            </React.Fragment>
          ))}
        </div>

        {/* Show status message if approved or rejected */}
        {/* {(isApproved || isRejected || (rejectedHistory && rejectedHistory.application_status)) ? (
          <div style={{
            backgroundColor: (isApproved || rejectedHistory?.application_status === "APPROVED") ? '#d4edda' : '#f8d7da',
            border: `1px solid ${(isApproved || rejectedHistory?.application_status === "APPROVED") ? '#c3e6cb' : '#f5c6cb'}`,
            color: (isApproved || rejectedHistory?.application_status === "APPROVED") ? '#155724' : '#721c24',
            padding: '20px',
            borderRadius: '4px',
            marginTop: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {(isApproved || rejectedHistory?.application_status === "APPROVED") 
                ? 'This Application has been approved' 
                : 'This Application has been rejected'}
            </div>
            {(isRejected || rejectedHistory?.application_status === "REJECTED") && (
              <div style={{
                fontSize: '12px',
                fontWeight: '500',
                marginTop: '8px'
              }}>
                Reason: {rejectedHistory?.app_comment || approvalReason}
              </div>
            )}
          </div>
        ) : (
          <div className="approval-actions" style={{ padding: "20px" }}>
            <button
              className="approval-btn approval-btn--reject"
              onClick={handleRejectClick}
              disabled={rejecting}
            >
              Reject Application
            </button>
            <button
              className="approval-btn approval-btn--approve"
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? 'Approving...' : 'Approve Application'}
            </button>
          </div>
        )} */}

        {/* Reject Modal */}
        <Modal
          title="Enter Reason of Rejection"
          open={showRejectModal}
          onCancel={handleCancelReject}
          centered
          width={600}
          footer={[
            <button
              key="cancel"
              onClick={handleCancelReject}
              disabled={rejecting}
              style={{
                padding: '8px 12px',
                border: '1px solid #d0d0d0',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500',
                cursor: rejecting ? 'not-allowed' : 'pointer',
                opacity: rejecting ? 0.6 : 1,
                marginRight: '8px'
              }}
            >
              Cancel
            </button>,
            <button
              key="reject"
              onClick={handleReject}
              disabled={rejecting || !rejectComment.trim()}
              style={{
                padding: '9px 14px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: rejecting || !rejectComment.trim() ? '#ccc' : '#000000',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: rejecting || !rejectComment.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {rejecting ? 'Rejecting...' : 'Reject'}
            </button>
          ]}
        >
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Comment Box
            </label>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Write comment here"
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #d0d0d0',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ApplicationApproval;

