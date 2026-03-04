import React, { useEffect, useState } from 'react';
import { getApplicationStatuses, approveApplication, applicationApprovalChecks } from '../../redux/apis/apisCrud';
import Loader from '../Loader/Loader';
import toast from 'react-hot-toast';
import { Modal } from 'antd';

interface Props {
  applicationNo: string; // API needs application_no
  statusId: string; // Status ID from getDeptWiseApplications
}

type StatusRow = {
  checks: string;
  status: string;
  processedDate?: string;
  processedBy?: string;
  comment?: string;
};

const EmptyCell = () => <span>--</span>;

const ApprovalStatus: React.FC<Props> = ({ applicationNo, statusId }) => {
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getApplicationStatuses(applicationNo);
        const data = res?.data?.data ?? {};

        // Normalize expected fields
        const list: StatusRow[] = [];

        const pushRow = (checks: string, obj: any) => {
          if (!obj || typeof obj !== 'object') {
            list.push({ checks, status: '', processedDate: '', processedBy: '', comment: '' });
            return;
          }
          list.push({
            checks,
            status: String(obj?.application_status || ''),
            processedDate: obj?.processed_date || '',
            processedBy: obj?.processor || '',
            comment: obj?.app_comment || '',
          });
        };

        pushRow('Bayan', data?.bayan_history);
        pushRow('Credit', data?.credit_history);
        pushRow('Compliance', data?.compliance_history );
        pushRow('Factoring Amount', data?.factoring_amount_history);
        pushRow('Revenue', data?.revenue_history);
        pushRow('Simah', data?.simah_history);
        // E-promissory: only show application_status; if null, treat as no application
        if (data?.e_promissory && typeof data?.e_promissory === 'object') {
          list.push({
            checks: 'E-promissory Note',
            status: String(data?.e_promissory?.application_status ?? ''),
            processedDate: data?.e_promissory?.processed_date || '',
            processedBy: data?.e_promissory?.processor || '',
            comment: data?.e_promissory?.app_comment || '',
          });
        } else {
          list.push({ checks: 'E-promissory Note', status: '', processedDate: '', processedBy: '', comment: '' });
        }

        setRows(list);
      } catch (err: any) {
        setError(err?.message || 'Failed to load approval statuses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [applicationNo]);

  const handleApprove = async () => {
    if (!applicationNo) {
      toast.error('Application number is required');
      return;
    }

    setApproving(true);
    try {
      const response = await applicationApprovalChecks({
        types: "APPROVED",
        user_id: 1,
        loan_application_number: applicationNo,
        comment: "" // Comment is optional for approval
      });

      if (response?.data?.success || response?.status === 200) {
        toast.success('Application approved successfully!');
        //await fetchData(); // Refresh data from API first
        setIsApproved(true);
        setApprovalReason(response?.data?.message || 'Application has been approved');
      } else {
        toast.error(response?.data?.message || 'Failed to approve application');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to approve application');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
    setRejectComment('');
  };

  const handleReject = async () => {
    if (!applicationNo) {
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
        loan_application_number: applicationNo,
        comment: rejectComment
      });

      if (response?.data?.success || response?.status === 200) {
        toast.success('Application rejected successfully!');
        setShowRejectModal(false);
        setIsRejected(true);
        setApprovalReason(rejectComment);
        setRejectComment('');
      } else {
        toast.error(response?.data?.message || 'Failed to reject application');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to reject application');
    } finally {
      setRejecting(false);
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectComment('');
  };

  if (loading) return <Loader/>;
  if (error) return <div style={{ color: 'var(--destructive)' }}>{error}</div>;

  return (
    <div className="approval-table">
      <div className="approval-grid">
        <div className="approval-row approval-row--head">
          <div className="approval-cell approval-cell--head">Checks</div>
          <div className="approval-cell approval-cell--head">Status</div>
          <div className="approval-cell approval-cell--head">Processed Date</div>
          <div className="approval-cell approval-cell--head">Processed By</div>
          <div className="approval-cell approval-cell--head">Comment</div>
        </div>
        {rows.map((r, idx) => (
          <div key={`${r.checks}-${idx}`} className="approval-row">
            <div className="approval-cell approval-cell--checks">{r.checks}</div>
            <div className="approval-cell">{r.status || <EmptyCell/>}</div>
            <div className="approval-cell">{r.processedDate || <EmptyCell/>}</div>
            <div className="approval-cell">{r.processedBy || <EmptyCell/>}</div>
            <div className="approval-cell">{r.comment || <EmptyCell/>}</div>
          </div>
        ))}
      </div>
      
      {/* Show status message if approved or rejected */}
      {(isApproved || isRejected) ? (
        <div style={{
          backgroundColor: isApproved ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
          border: `1px solid ${isApproved ? 'var(--color-success-border)' : 'var(--color-error-border)'}`,
          color: isApproved ? 'var(--color-success-text)' : 'var(--color-error-text)',
          padding: '20px',
          borderRadius: '4px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600'
          }}>
            {isApproved ? 'This Application has been approved' : 'This Application has been rejected'}
          </div>
          {isRejected && (
            <div style={{ 
              fontSize: '12px',
              fontWeight: '500',
              marginTop: '8px'
            }}>
              Reason: {approvalReason}
            </div>
          )}
        </div>
      ) : (
        <div className="approval-actions">
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
            disabled={approving || !statusId}
          >
            {approving ? 'Approving...' : 'Approve Application'}
          </button>
        </div>
      )}

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
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
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
              backgroundColor: rejecting || !rejectComment.trim() ? 'var(--color-disabled)' : 'var(--primary)',
              color: 'var(--primary-foreground)',
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
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ApprovalStatus;


