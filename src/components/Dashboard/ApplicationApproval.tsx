import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApplicationDetailsByType, applicationApprovalChecks } from '../../redux/apis/apisCrud';
import Loader from '../Loader/Loader';
import toast from 'react-hot-toast';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

type StatusRow = {
  checks: string;
  status: string;
  processedDate?: string;
  processedBy?: string;
  comment?: string;
};

const EmptyCell = () => <span>--</span>;

const ApplicationApproval = ({ fullDetail }: any) => {
  const { t } = useTranslation('dashboard');
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
    if (fullDetail?.approval) {
      const a = fullDetail.approval;
      const list: StatusRow[] = [];
      list.push({ checks: t('approval.applicationStatus'), status: a.applicationStatus || '--', processedDate: '', processedBy: '', comment: '' });
      list.push({ checks: t('appApproval.check.loanStatus'), status: a.loanStatus || '--', processedDate: a.disbursementDate || '', processedBy: '', comment: '' });
      list.push({ checks: t('appApproval.check.otpVerified'), status: a.otpVerified ? t('common:approved') : t('appApproval.notApproved'), processedDate: '', processedBy: '', comment: '' });
      list.push({ checks: t('appApproval.check.ivrVerified'), status: a.ivrVerified ? t('common:approved') : t('appApproval.notApproved'), processedDate: '', processedBy: '', comment: '' });
      setRows(list);
      if (a.applicationStatus === 'APPROVED') setIsApproved(true);
      if (a.applicationStatus === 'REJECTED') setIsRejected(true);
      return;
    }
  }, [fullDetail]);

  useEffect(() => {
    if (id && fullDetail === undefined) {
      fetchData();
    }
  }, [id, fullDetail]);

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
              status: value ? t('common:approved') : t('appApproval.notApproved'),
              processedDate: '',
              processedBy: '',
              comment: '',
            });
            return;
          }
          
          // Handle object format (for backward compatibility)
          if (value && typeof value === 'object') {
            const status = value?.application_status || t('appApproval.notApproved');
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
            status: t('appApproval.notApproved'),
            processedDate: '', 
            processedBy: '', 
            comment: '' 
          });
        };

        // Map API data to the required checks
        pushRow(t('appApproval.check.financialStatement'), data?.financial_statement);
        pushRow(t('appApproval.check.credit'), data?.credit);
        pushRow(t('appApproval.check.compliance'), data?.compliance);
        pushRow(t('appApproval.check.salary'), data?.salary);
        pushRow(t('appApproval.check.simah'), data?.simah);

        setRows(list);

        // Extract rejected_history
        setRejectedHistory(data?.rejected_history || null);

      } else {
        toast.error(t('appApproval.toast.loadFailed'));
      }
    } catch (error: any) {
      console.error("API Error:", error);
      setError(error?.message || t('appApproval.error.loadFailed'));
      toast.error(error?.response?.data?.message || error?.message || t('appApproval.toast.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) {
      toast.error(t('appApproval.toast.appNoRequired'));
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
        toast.success(t('appApproval.toast.approved'));
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
          toast.error(firstError || response?.data?.message || t('appApproval.toast.approveFailed'))
        } else {
          toast.error(response?.data?.message || t('appApproval.toast.approveFailed'));
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
        toast.error(firstError || error?.response?.data?.message || error?.message || t('appApproval.toast.approveFailed'))
      } else {
        toast.error(error?.response?.data?.message || error?.message || t('appApproval.toast.approveFailed'));
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
      toast.error(t('appApproval.toast.appNoRequired'));
      return;
    }

    if (!rejectComment.trim()) {
      toast.error(t('appApproval.toast.enterReason'));
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
        toast.success(t('appApproval.toast.rejected'));
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
          toast.error(firstError || response?.data?.message || t('appApproval.toast.rejectFailed'))
        } else {
          toast.error(response?.data?.message || t('appApproval.toast.rejectFailed'));
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
        toast.error(firstError || error?.response?.data?.message || error?.message || t('appApproval.toast.rejectFailed'))
      } else {
        toast.error(error?.response?.data?.message || error?.message || t('appApproval.toast.rejectFailed'));
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
    <div style={{ padding: "20px", fontFamily: 'inherit', fontSize: '14px' }}>
      <div style={{ 
        background: "var(--surface-card)", 
        borderRadius: "2px",
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
            background: "#AB1920",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>{t('appApproval.col.checks')}</div>
          <div style={{
            padding: "12px 16px",
            background: "#AB1920",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>{t('common:status')}</div>
          <div style={{
            padding: "12px 16px",
            background: "#AB1920",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>{t('approval.processedDate')}</div>
          <div style={{
            padding: "12px 16px",
            background: "#AB1920",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>{t('appApproval.col.processedBy')}</div>
          <div style={{
            padding: "12px 16px",
            background: "#AB1920",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px"
          }}>{t('approval.comment')}</div>

          {/* Data Rows */}
          {rows.map((r, idx) => (
            <React.Fragment key={`${r.checks}-${idx}`}>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid var(--surface-border)",
                fontWeight: "600",
                fontSize: "14px",
                color: "var(--foreground)"
              }}>{r.checks}</div>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid var(--surface-border)",
                fontSize: "14px",
                color: "var(--foreground)"
              }}>{r.status || <EmptyCell />}</div>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid var(--surface-border)",
                fontSize: "14px",
                color: "var(--foreground)"
              }}>{r.processedDate || <EmptyCell />}</div>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid var(--surface-border)",
                fontSize: "14px",
                color: "var(--foreground)"
              }}>{r.processedBy || <EmptyCell />}</div>
              <div style={{
                padding: "12px 16px",
                borderTop: idx === 0 ? "none" : "1px solid var(--surface-border)",
                fontSize: "14px",
                color: "var(--foreground)"
              }}>{r.comment || <EmptyCell />}</div>
            </React.Fragment>
          ))}
        </div>

        {/* Show status message if approved or rejected */}
        {/* {(isApproved || isRejected || (rejectedHistory && rejectedHistory.application_status)) ? (
          <div style={{
            backgroundColor: (isApproved || rejectedHistory?.application_status === "APPROVED") ? '#F5E3E4' : '#f8d7da',
            border: `1px solid ${(isApproved || rejectedHistory?.application_status === "APPROVED") ? '#EDC7C9' : '#f5c6cb'}`,
            color: (isApproved || rejectedHistory?.application_status === "APPROVED") ? '#6E1418' : '#721c24',
            padding: '20px',
            borderRadius: '2px',
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
        <Modal maskClosable={false} keyboard={false}
          title={t('appApproval.rejectModalTitle')}
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
                borderRadius: '2px',
                backgroundColor: 'white',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500',
                cursor: rejecting ? 'not-allowed' : 'pointer',
                opacity: rejecting ? 0.6 : 1,
                marginRight: '8px'
              }}
            >
              {t('common:cancel')}
            </button>,
            <button
              key="reject"
              onClick={handleReject}
              disabled={rejecting || !rejectComment.trim()}
              style={{
                padding: '9px 14px',
                border: 'none',
                borderRadius: '2px',
                backgroundColor: rejecting || !rejectComment.trim() ? '#ccc' : '#000000',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: rejecting || !rejectComment.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {rejecting ? t('approval.rejecting') : t('common:reject')}
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
              {t('approval.commentBox')}
            </label>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder={t('approval.writeComment')}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #d0d0d0',
                borderRadius: '2px',
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

