import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Tabs } from "antd";
import type { TabsProps } from "antd";
import { getFactoringInfoDetails } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";
 
type FinancingApplicationInfo = Record<string, any>;
type FinancingAmountInfo = Record<string, any>;
type ApprovalInfo = Record<string, any>;

interface Props {
  open: boolean;
  onClose: () => void;
  applicationId: string;
}

/** Custom English labels for specific fields */
const enLabel: Record<string, string> = {
  usa_born: "Are you born in the United States of America?",
  resided_31: "Have you resided (31) days during the current year in the United States of America?",
  resided_183: "Have you resided (183) days during the three-years period preceding (today's date) in the United States of America?",
  tax_resident: "Are you a Tax Resident of any country or countries outside of Saudi Arabia?",
  green_card_holder: "Are you a resident, a citizen, or has a green card in the United States of America?",
};

/** en->ar labels (extend as you wish) */
const arLabel: Record<string, string> = {
  application_number: "رقم الطلب",
  product_name: "اسم المنتج",
  financing_tenure: "مدة التمويل",
  financing_type: "نوع التمويل",
  application_date: "تاريخ التقديم",
  email: "البريد الإلكتروني",
  mobile_no: "رقم الجوال",
  purpose_of_financing: "الغرض من التمويل",
  legal_form: "الكيان القانوني",
  national_id: "الهوية الوطنية",
  dob: "تاريخ الميلاد (هجري)",
  iban: "آيبان",
  account_number: "رقم الحساب",
  bank_name: "اسم البنك",
  source_of_income: "مصدر الدخل",
  usa_born: "هل أنت مولود في الولايات المتحدة الأمريكية؟",
  tax_resident: "هل أنت مقيم ضريبي في أي دولة أو دول خارج المملكة العربية السعودية؟",
  resided_31: "هل أقمت (31) يومًا خلال العام الحالي في الولايات المتحدة الأمريكية؟",
  resided_183: "هل أقمت (183) يومًا خلال فترة الثلاث سنوات التي تسبق (تاريخ اليوم) في الولايات المتحدة الأمريكية؟",
  green_card_holder: "هل أنت مقيم أو مواطن أو لديك بطاقة خضراء في الولايات المتحدة الأمريكية؟",
  lei: "معرّف الكيان القانوني",
  cr_number: "رقم السجل التجاري",
  iban_certificate: "شهادة الآيبان",
  zakat_certificate: "شهادة الزكاة",

  annual_revenue: "الإيرادات السنوية",
  average_invoice_value: "متوسط قيمة الفاتورة",
  outstanding_invoices_value: "إجمالي الفواتير المستحقة",
  approved_invoicing_value: "قيمة الفاتورة المعتمدة",
  status: "الحالة",
};

/** If your API returns relative paths (like "/storage/..") prepend your base here */
const DOC_BASE_URL = ""; // e.g. process.env.VITE_API_BASE_URL ?? ''

/** Convert string to title case */
const toTitleCase = (str: string) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/** Safe key→label (spaces) with title case */
const toLabel = (key: string) => {
  const label = enLabel[key] || key.split("_").join(" ");
  return toTitleCase(label);
};

const isDocKey = (k: string) =>
  k.toLowerCase().includes("certificate") || k.toLowerCase().includes("document");

const normalizeDocUrl = (v: string) =>
  v?.startsWith("/") ? `${DOC_BASE_URL}${v}` : v;

const KvRows: React.FC<{ data: Record<string, any> }> = ({ data }) => (
    <>
      {Object.entries(data ?? {}).map(([k, v]) => {
        const val =
          v == null || v === '' ? '—' :
          typeof v === 'object' ? JSON.stringify(v) : String(v);
        const arabic = arLabel[k] ?? k;
        return (
          <div className="fi-row" key={k}>
            {/* EN column */}
            <div className="fi-cell">
              <div className="fi-cell-label">{toLabel(k)}</div>
              <div className="fi-cell-value">
                {isDocKey(k) && val !== "—" ? (
                  <a
                    className="fi-doc-link"
                    href={normalizeDocUrl(val)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview Document
                  </a>
                ) : (
                  val
                )}
              </div>
            </div>

            {/* AR column */}
            <div className="fi-cell fi-cell-rtl">
              <div className="fi-cell-label">{arabic}</div>
              <div className="fi-cell-value">
                {isDocKey(k) && val !== "—" ? (
                  <a
                    className="fi-doc-link"
                    href={normalizeDocUrl(val)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    معاينة المستند
                  </a>
                ) : (
                  val
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
);

// English-only rows: label on the left, value on the right
const KvRowsEnOnly: React.FC<{ data: Record<string, any> }> = ({ data }) => (
    <>
      {Object.entries(data ?? {}).map(([k, v]) => {
        const val =
          v == null || v === '' ? '—' :
          typeof v === 'object' ? JSON.stringify(v) : String(v);
        return (
          <div className="fi-row" key={k}>
            <div className="fi-cell">
              <div className="fi-cell-label">{toLabel(k)}</div>
            </div>
            <div className="fi-cell">
              <div className="fi-cell-value">
                {isDocKey(k) && val !== "—" ? (
                  <a
                    className="fi-doc-link"
                    href={normalizeDocUrl(val)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview Document
                  </a>
                ) : (
                  val
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
);


const FactoringInfoModal: React.FC<Props> = ({ open, onClose, applicationId }) => {
  const [loading, setLoading] = useState(false);
  const [finApp, setFinApp] = useState<FinancingApplicationInfo>({});
  const [finAmt, setFinAmt] = useState<FinancingAmountInfo>({});
  const [approval, setApproval] = useState<ApprovalInfo>({});
  const fetchedForIdRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'approval'>('info');

  const fetchFactoringInfo = async () => {
    if (!applicationId) return;
    try {
      setLoading(true);
      const res = await getFactoringInfoDetails(applicationId);
      const data = res?.data?.data || {};
      const finalStatus = res?.data?.data?.application_history?.final_status;
      setApproval(
        finalStatus && typeof finalStatus === 'object'
          ? finalStatus
          : finalStatus != null
          ? { status: String(finalStatus) }
          : {}
      );
      setFinApp(data?.financing_application_info || {});
      setFinAmt(data?.financing_amount_info || {});
      fetchedForIdRef.current = applicationId;
    } catch {
      setFinApp({});
      setFinAmt({});
    } finally {
      setLoading(false);
    }
};
  // Prefetch when applicationId changes (speeds up first open)
  useEffect(() => {
    if (!applicationId) return;
    if (fetchedForIdRef.current !== applicationId) {
      fetchFactoringInfo();
    }
  }, [applicationId, fetchFactoringInfo]);

  // As a safety, if user opens before prefetch completed, ensure we fetch
  useEffect(() => {
    if (!open || !applicationId) return;
    if (fetchedForIdRef.current !== applicationId) {
      fetchFactoringInfo();
    }
  }, [open, applicationId, fetchFactoringInfo]);

  // Reset active tab to info whenever the modal is opened
  useEffect(() => {
    if (open) setActiveTab('info');
  }, [open]);
  const tabs: TabsProps["items"] = useMemo(
    () => [
      {
        key: "info",
        label: (
          <div className={activeTab === 'info' ? 'fi-tab-label-active' : 'fi-tab-label'}>
            Factoring Information
          </div>
        ),
        children: (
          <div>

            <div className="fi-group-card">
            <div className="fi-language-band">
              <span className="fi-language-en">English</span>
              <span className="fi-language-ar" style={{alignContent: "end"}}>العربية</span>
            </div>
              <div className="fi-group-title"><div className="fi-title-grid"><div>Factoring Application Info</div><div className="fi-group-title-ar">معلومات طلب التمويل:</div></div></div>
              <div className="fi-two-col">
                <KvRows data={finApp} />
              </div>
            </div>

            <div className="fi-spacer" />

            <div className="fi-group-card">
              <div className="fi-group-title"><div className="fi-title-grid"><div>Factoring Amount Info</div><div className="fi-group-title-ar">تفاصيل التمويل:</div></div></div>
              <div className="fi-two-col">
                <KvRows data={finAmt} />
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "approval",
        label: (
          <div className={activeTab === 'approval' ? 'fi-tab-label-active' : 'fi-tab-label'}>
            Factoring Approval
          </div>
        ),
        children: (
          <div>
            <div className="fi-group-card">
              <div className="fi-group-title">Factoring Amount Info</div>
              <div className="fi-two-col">
                <KvRowsEnOnly data={finAmt} />
              </div>
            </div>

            <div className="fi-spacer" />

            <div className="fi-group-card">
              <div className="fi-group-title">Approval Status</div>
              <div className="fi-two-col">
                <KvRowsEnOnly data={approval} />
              </div>
            </div>
          </div>
        ),
      },
    ],
    [finApp, finAmt, approval, activeTab]
  );

  return (
    <>
    {/* {loading && <Loader />} */}
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title={null}
      centered
      className="fi-modal"
      mask={false}
      styles={{
        body: { maxHeight: '70vh', overflow: 'auto' },
      }}  // prevent overflow
    >
      <div className="fi-modal-content">
        <div className="fi-modal-header">
          <div className="fi-modal-title">Factoring Information</div>
        </div>

        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as 'info' | 'approval')} items={tabs} className="fi-tabs" />

        {loading && <Loader />}
      </div>
    </Modal>
    </>
  );
};

export default FactoringInfoModal;
