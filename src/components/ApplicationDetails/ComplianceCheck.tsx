import React, { useEffect, useState } from 'react';
import Loader from '../Loader/Loader';
import { getComplianceCheck, applicationApprovalChecks } from '../../redux/apis/apisCrud';
import toast from 'react-hot-toast';

interface ComplianceCheckProps {
  applicationId: string | number;
  applicationNo?: string;
}

type Primitive = string | number | boolean | null | undefined;

function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

/** Custom labels for specific compliance fields */
const customLabels: Record<string, string> = {
  pep: "Is politically exposed person?",
  beneficiary: "Is beneficiary business owner?",
  simah_default: "Is simah default?",
  business_owner: "Are you a business owner or authorized person?",
  usa_born: "Are you born in the United States of America?",
  resided_31: "Have you resided (31) days during the current year in the United States of America?",
  resided_183: `${"Have you resided (183) days during the three-years period preceding "} ${new Date().toLocaleDateString()} ${"in the United States of America?"}`,
  tax_resident: "Are you a Tax Resident of any country or countries outside of Saudi Arabia?",
  green_card_holder: "Are you a resident, a citizen, or has a green card in the United States of America?",
};

function formatLabel(raw: string): string {
  if (!raw) return '';
  // Check if there's a custom label first
  if (customLabels[raw]) return customLabels[raw];
  const cleaned = raw.replace(/_+/g, ' ').replace(/\s*:\s*$/, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function InfoRow({ label, value }: { label: string; value: Primitive }) {
  return (
    <div className="info-row">
      <div className="info-label" style={{fontSize: '12px'}}>{formatLabel(label)}</div>
      <div className="info-value">{String(value ?? '')}</div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <div className="business-section-title">{formatLabel(title)}</div>;
}

function renderObjectContent(obj: Record<string, any>): React.ReactNode {
  const entries = Object.entries(obj);
  return (
    <div className="info-container">
      {entries.map(([key, val]) => {
        if (isPrimitive(val)) {
          return <InfoRow key={key} label={key} value={val} />;
        }
        if (Array.isArray(val)) {
          if (val.every(isPrimitive)) {
            return <InfoRow key={key} label={key} value={val.join(', ')} />;
          }
          return (
            <div key={key} className="info-subsection">
              <SectionTitle title={`${key}:`} />
              {val.map((item, idx) => (
                <div key={idx} className="info-subsection-item">{
                  isPrimitive(item)
                    ? <InfoRow label={`${key} ${idx + 1}`} value={item} />
                    : renderObjectContent(item as Record<string, any>)
                }</div>
              ))}
            </div>
          );
        }

        return (
          <div key={key} className="info-subsection">
            <SectionTitle title={`${key}:`} />
            {renderObjectContent(val as Record<string, any>)}
          </div>
        );
      })}
    </div>
  );
}

const ComplianceCheck: React.FC<ComplianceCheckProps> = ({ applicationId, applicationNo }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [comment, setComment] = useState('');
  const [history, setHistory] = useState<Record<string, any> | null>(null);
  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!applicationNo) {
      toast.error('Missing application number');
      return;
    }
    const types = action === 'approve' ? 'compliance_approval' : 'compliance_rejection';
    const body = {
      types,
      user_id: 1,
      comment,
      loan_application_number: String(applicationNo),
    } as any;
    try {
      const res = await applicationApprovalChecks(body);
      toast.success(res?.data?.message || 'Updated successfully');
      setComment('');
      await fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getComplianceCheck(applicationId);
      const root = res?.data?.data ?? res?.data;
      const payload = (root?.compliance_data ?? root) as Record<string, any>;
      const hist = root?.compliance_history as Record<string, any> | undefined;
      if (!payload || typeof payload !== 'object') {
        setData({});
      } else {
        setData(payload);
      }
      (setHistory as any) && setHistory(hist ?? null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load compliance check');
      toast.error(err?.message || 'Failed to load compliance check');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  if (loading) return <Loader/>;
  if (error) return <div style={{ color: 'crimson' }}>{error}</div>;
  if (!data) return <div>No compliance data found</div>;

  return (
    <div className="credit-check" style={{margin: "2px"}}>
      {history ? (
        <div className="fi-group-card mb-4" style={{ margin: '0px' }}>
          <div className="info-row px-0">
            <div className="info-label">Status</div>
            <div className="info-value">{String(history?.application_status ?? '')}</div>
          </div>
          <div className="info-row px-0">
            <div className="info-label">Approval Date</div>
            <div className="info-value">{history?.processed_date ? new Date(history.processed_date).toLocaleDateString() : ''}</div>
          </div>
          <div className="info-row px-0">
            <div className="info-label">Approved By</div>
            <div className="info-value">{String(history?.processor ?? '')}</div>
          </div>
          <div className="info-row px-0">
            <div className="info-label">Comment</div>
            <div className="info-value">{String(history?.app_comment ?? '')}</div>
          </div>
        </div>
      ) : (
        <>
          <textarea
            placeholder="Write comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="credit-textarea"
          />
          <div className="credit-actions mb-4 mt-2">
            <button className="approval-btn approval-btn--reject" onClick={() => handleApprovalAction('reject')}>Reject</button>
            <button className="approval-btn approval-btn--approve" onClick={() => handleApprovalAction('approve')}>Approve</button>
          </div>
        </>
      )}

      {renderObjectContent(data)}
    </div>
  );
};

export default ComplianceCheck;


