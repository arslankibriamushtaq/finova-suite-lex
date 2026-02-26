import React, { useEffect, useState } from 'react';
import Loader from '../Loader/Loader';
import { getRevenueDetails } from '../../redux/apis/apisCrud';
import toast from 'react-hot-toast';

interface RevenueDetailsProps {
  applicationId: string | number;
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

function formatLabel(raw: string): string {
  if (!raw) return '';
  const cleaned = raw.replace(/_+/g, ' ').replace(/\s*:\s*$/, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function InfoRow({ label, value }: { label: string; value: Primitive }) {
  return (
    <div className="info-row">
      <div className="info-label">{formatLabel(label)}</div>
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

const RevenueDetails: React.FC<RevenueDetailsProps> = ({ applicationId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRevenueDetails(applicationId);
      const payload = (res?.data?.data?.revenueDetails ?? res?.data?.data ?? res?.data) as Record<string, any>;
      if (!payload || typeof payload !== 'object') {
        setData({});
      } else {
        setData(payload);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load revenue details');
      toast.error(err?.message || 'Failed to load revenue details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  if (loading) return <Loader/>;
  if (error) return <div style={{ color: 'crimson' }}>{error}</div>;
  if (!data) return <div>No revenue details found</div>;

  return (
    <div>
      {/* <div className="business-section-title">Revenue Details</div> */}
      {renderObjectContent(data)}
    </div>
  );
};

export default RevenueDetails;


