import React, { useEffect, useMemo, useState } from 'react';
import { Select } from 'antd';
import Loader from '../Loader/Loader';
import { getCreditCheck, calculateApplicationWeight, applicationApprovalChecks } from '../../redux/apis/apisCrud';
import toast from 'react-hot-toast';

interface Props {
  applicationId: string | number;
  applicationNo?: string;
}

type WeightOption = { label: string; value: string };
type Definition = { id: number; parameter: string; weightages: Record<string, any>; selected?: any; readonly?: boolean };

const CreditCheck: React.FC<Props> = ({ applicationId, applicationNo }) => {
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [selected, setSelected] = useState<Record<number, { label: string; value: string }>>({});
  const [history, setHistory] = useState<Record<string, any> | null>(null);

  const formatLabel = (s: string) =>
    (s || '')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getCreditCheck(applicationId);
        const data = res?.data?.data;
        // API may return either `loan_weight_definitions` (array) or a nested misspelled path
        const defsRaw =
          (data?.loan_weight_definitions as Definition[] | undefined) ??
          (data?.loan_weightage_definitions?.loan_wieght_definition as Definition[] | undefined) ??
          [];
        const defs: Definition[] = Array.isArray(defsRaw) ? defsRaw : [];
        setDefinitions(defs);
        // history support if backend returns approval summary for credit
        const hist = (data?.credit_history || data?.application_history || null) as Record<string, any> | null;
        setHistory(hist);
        // Pre-seed selected values as the FIRST option of each weightages list
        const preSel: Record<number, { label: string; value: string }> = {};
        defs.forEach(d => {
          const firstEntry = Object.entries(d?.weightages ?? {})[0] as [string, any] | undefined;
          if (firstEntry) preSel[d.id] = { label: String(firstEntry[0]), value: String(firstEntry[1]) };
        });
        setSelected(preSel);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [applicationId]);

  const grid = useMemo(() => {
    return definitions.map((def) => {
      const opts: WeightOption[] = Object.entries(def?.weightages ?? {}).map(([k, v]) => ({
        label: String(k),
        value: String(v),
      }));
      return { def, opts };
    });
  }, [definitions]);

  // Build payload exactly as API expects
  const buildPayload = (): Record<string, any> => {
    const body: Record<string, any> = { app_id: String(applicationId) };
    if (applicationNo) body.loan_application_number = String(applicationNo);
    definitions.forEach((def) => {
      const entries = Object.entries(def.weightages ?? {});
      const fallback = entries[0] as [string, any] | undefined;
      const chosen = selected[def.id];
      const key = chosen?.label ?? (fallback ? String(fallback[0]) : "");
      const weight = chosen?.value ?? (fallback ? String(fallback[1]) : "0");
      body[def.parameter] = {
        key,
        weight: Number(weight),
        percentage: (def as any)?.percentage ?? 0,
      };
    });
    return body;
  };

  const handleSubmit = async () => {
    try {
      const body = buildPayload();
      await calculateApplicationWeight(body);
      toast.success('Weights saved');
    } catch (err) {
      toast.error('Failed to save weights');
    }
  };

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!applicationNo) {
      toast.error('Missing application number');
      return;
    }
    const types = action === 'approve' ? 'credit_approval' : 'credit_rejection';
    const body = {
      types,
      user_id: 1,
      comment: comment,
      loan_application_number: String(applicationNo),
    };
    try {
      const res = await applicationApprovalChecks(body);
      toast.success(res?.data?.message || 'Updated successfully');
      setComment('');
      // refresh to show summary
      const re = await getCreditCheck(applicationId);
      const data = re?.data?.data;
      const histUpdate = (data?.credit_history || data?.application_history || null) as Record<string, any> | null;
      setHistory(histUpdate);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="credit-check">
      {!history ? (
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
      ) : null}

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
      ) : null}

      <div className="credit-grid">
        {grid.map(({ def, opts }) => (
          <div key={def.id} className="credit-field">
            <div className="credit-label">{formatLabel(def.parameter)}</div>
            <Select
              value={selected[def.id]?.value ?? (opts[0]?.value as string | undefined)}
              onChange={(val, option) => setSelected((s) => ({ ...s, [def.id]: { value: String(val), label: (option as any)?.label } }))}
              options={opts}
              className="credit-select"
              disabled={!!def.readonly}
              suffixIcon={<span>▾</span>}
            />
          </div>
        ))}
      </div>

      <div className="credit-save">
        <button className="theme-btn-next" onClick={handleSubmit}>Save</button>
      </div>

      {loading && <Loader />}
    </div>
  );
};

export default CreditCheck;


