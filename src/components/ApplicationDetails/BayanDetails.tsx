import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import Loader from '../Loader/Loader';
import { getBayanVerfDetails, getBayanCreditDetails, getBayanNaeDetails } from '../../redux/apis/apisCrud';

interface Props {
  applicationId: string;
}

type AnyRecord = Record<string, any>;

function toLabel(key: string) {
  return key.split('_').join(' ');
}

const NoData: React.FC = () => (
  <div className="fi-group-card" style={{ marginTop: 12 }}>
    <div className="fi-empty">No Data Available</div>
  </div>
);

const KvRowsEnOnly: React.FC<{ data: AnyRecord }> = ({ data }) => (
  <>
    {Object.entries(data ?? {}).map(([k, v]) => {
      const val = v == null || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v);
      return (
        <div className="fi-row" key={k}>
          <div className="fi-cell">
            <div className="fi-cell-label">{toLabel(k)}</div>
          </div>
          <div className="fi-cell">
            <div className="fi-cell-value">{val}</div>
          </div>
        </div>
      );
    })}
  </>
);

const Section: React.FC<{ title: string; data?: AnyRecord }>= ({ title, data }) => (
  <div className="fi-group-card">
    <div className="fi-group-title">{title}</div>
    <div className="fi-two-col">
      {data && Object.keys(data).length ? <KvRowsEnOnly data={data}/> : <NoData/>}
    </div>
  </div>
);

const BayanDetails: React.FC<Props> = ({ applicationId }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verf, setVerf] = useState<AnyRecord>({});
  const [credit, setCredit] = useState<AnyRecord>({});
  const [nae, setNae] = useState<AnyRecord>({});
  const [activeTab, setActiveTab] = useState<'verf' | 'credit' | 'nae'>('verf');

  const fetchVerf = async () => {
    try {
      setLoading(true);
      const res = await getBayanVerfDetails(applicationId);
      setVerf(res?.data?.data ?? {});
    } finally {
      setLoading(false);
    }
  };
  const fetchCredit = async () => {
    try {
      setLoading(true);
      const res = await getBayanCreditDetails(applicationId);
      setCredit(res?.data?.data ?? {});
    } finally {
      setLoading(false);
    }
  };
  const fetchNae = async () => {
    try {
      setLoading(true);
      const res = await getBayanNaeDetails(applicationId);
      setNae(res?.data?.data ?? {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (activeTab === 'verf') fetchVerf();
    if (activeTab === 'credit') fetchCredit();
    if (activeTab === 'nae') fetchNae();
  }, [open, activeTab]);

  useEffect(() => {
    if (open) setActiveTab('verf');
  }, [open]);

  const tabs: TabsProps['items'] = useMemo(() => [
    {
      key: 'verf',
      label: <div className={activeTab === 'verf' ? 'fi-tab-label-active' : 'fi-tab-label'}>Bayan Financial Report</div>,
      children: (
        <div>
          <Section title="Bayan Financial Report" data={verf} />
        </div>
      )
    },
    {
      key: 'credit',
      label: <div className={activeTab === 'credit' ? 'fi-tab-label-active' : 'fi-tab-label'}>Bayan Credit Report</div>,
      children: (
        <div>
          <Section title="Bayan Credit Report" data={credit} />
        </div>
      )
    },
    {
      key: 'nae',
      label: <div className={activeTab === 'nae' ? 'fi-tab-label-active' : 'fi-tab-label'}>New Applicant Enquiry</div>,
      children: (
        <div>
          <Section title="New Applicant Enquiry" data={nae} />
        </div>
      )
    }
  ], [activeTab, verf, credit, nae]);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', borderRadius: 2,
          padding: '6px 10px', fontWeight: 600, cursor: 'pointer'
        }}
      >
        View Bayan Details
      </button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
        title={null}
        centered
        className="fi-modal"
        mask={false}
        styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
      >
        <div className="fi-modal-content">
          <div className="fi-modal-header">
            <div className="fi-modal-title">Bayan Details</div>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as 'verf' | 'credit' | 'nae')}
            items={tabs}
            className="fi-tabs"
          />

          {loading && <Loader />}
        </div>
      </Modal>
    </div>
  );
};

export default BayanDetails;


