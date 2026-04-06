import React, { useState, useEffect } from "react";
import { Tab, Tabs, Row as BootstrapRow, Col as BootstrapCol } from "react-bootstrap";
import { Row, Col, Card } from "antd";
import StepForms from "./LeadTabs/StepFroms";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomer360 } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import TableView from "../TableView/TableView";
import { Eye } from "lucide-react";

interface Field {
  label: string;
  value: string | number;
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    margin: "0 auto",
    background: "var(--background)",
    borderRadius: 8,
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--border)",
    padding: "12px 0",
    fontSize: 14,
  },
  label: {
    color: "var(--foreground)",
    fontWeight: 400,
  },
  value: {
    fontWeight: 600,
    color: "var(--foreground)",
  },
};

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectTab, setSelectedTab] = useState<string>("Overview");
  const [overviewChildTab, setOverviewChildTab] = useState<string>("Customer Information");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchCustomer360();
    }
  }, [id]);

  const fetchCustomer360 = async () => {
    try {
      setLoading(true);
      const response = await getCustomer360(id!);
      if (response?.data?.success || response?.data?.data) {
        setUserDetails(response.data.data || response.data);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to fetch customer details"
      );
    } finally {
      setLoading(false);
    }
  };

  // Parse nafath callback data
  const nafathData = userDetails?.nafath_callback_data
    ? typeof userDetails.nafath_callback_data === "string"
      ? JSON.parse(userDetails.nafath_callback_data)
      : userDetails.nafath_callback_data
    : null;

  // Parse KYC step data
  const kycStepData = userDetails?.kyc?.step
    ? typeof userDetails.kyc.step === "string"
      ? JSON.parse(userDetails.kyc.step)
      : userDetails.kyc.step
    : null;

  // Parse compliance answers
  const parseQuestion = (questionString: string) => {
    try {
      return JSON.parse(questionString);
    } catch {
      return { en: questionString, ar: "" };
    }
  };

  // Get risk color
  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "highrisk":
      case "high":
        return "var(--color-error)";
      case "medium":
        return "var(--color-warning)";
      case "low":
        return "var(--color-success)";
      default:
        return "var(--color-error)";
    }
  };

  // Dynamic mapping for summary columns
  const leftColumn: Field[] = [
    { label: "Customer Name", value: userDetails?.user?.name || "--" },
    { label: "Phone", value: userDetails?.user?.phone || "--" },
    { label: "ID", value: userDetails?.user?.nid || "--" },
    { label: "Employment Sector Name", value: userDetails?.user?.employment_sector_name || "--" },
  ];

  const rightColumn: Field[] = [
    { label: "Customer Name", value: userDetails?.user?.name || "--" },
    { label: "Email", value: userDetails?.user?.email || "--" },
    { label: "Address", value: nafathData?.full_address_en || nafathData?.full_address || "--" },
  ];

  // ──────────── KYC Information Section ────────────
  const renderKycInformation = () => {
    const kyc = userDetails?.kyc;
    if (!kyc) return null;

    return (
      <Card bordered={false} style={styles.card}>
        <h5 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "18px", color: "var(--foreground)" }}>
          KYC Information
        </h5>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>KYC ID</span>
              <span style={styles.value}>{kyc.kyc_id || kyc.id || "--"}</span>
            </div>
            <div style={styles.fieldRow}>
              <span style={styles.label}>KYC Status</span>
              <span style={styles.value}>{kyc.kyc_status || kyc.status || "--"}</span>
            </div>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Risk Level</span>
              <span style={styles.value}>
                {kyc.risk ? (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: getRiskColor(kyc.risk),
                      color: "white",
                    }}
                  >
                    {kyc.risk}
                  </span>
                ) : "--"}
              </span>
            </div>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Compliance Status</span>
              <span style={styles.value}>{kyc.compliance_status || "--"}</span>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Risk Score</span>
              <span style={styles.value}>{kyc.risk_score || "--"}</span>
            </div>
            <div style={styles.fieldRow}>
              <span style={styles.label}>Is PEP</span>
              <span style={styles.value}>
                {kyc.is_pep !== undefined ? (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: kyc.is_pep ? "var(--color-success)" : "var(--color-success)",
                      color: "white",
                    }}
                  >
                    {kyc.is_pep ? "Yes" : "No"}
                  </span>
                ) : "--"}
              </span>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  // ──────────── KYC Steps Section ────────────
  const renderKycSteps = () => {
    if (!kycStepData) return null;

    const stepItems = [
      { label: "Mobile Verification", key: "mobile_verification" },
      { label: "Otp", key: "otp" },
      { label: "Set Pin", key: "set_pin" },
      { label: "Nafath", key: "nafath" },
      { label: "Scan", key: "scan" },
      { label: "Compliance Question", key: "compliance_question" },
      { label: "Kyc Question", key: "kyc_question" },
      { label: "Compliance Answers", key: "compliance_answers" },
      { label: "Kyc Answers", key: "kyc_answers" },
    ];

    return (
      <Card bordered={false} style={styles.card}>
        <h5 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "18px", color: "var(--foreground)" }}>
          KYC Steps
        </h5>
        <Row gutter={[24, 16]}>
          {stepItems.map((step, index) => {
            const isCompleted = kycStepData[step.key] === true;
            return (
              <Col xs={24} md={12} key={index}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <span style={{ fontSize: "14px", color: "var(--foreground)" }}>{step.label}</span>
                  <span
                    style={{
                      padding: "4px 16px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: isCompleted ? "var(--color-success)" : "var(--color-error)",
                      color: "white",
                    }}
                  >
                    {isCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>
    );
  };

  // ──────────── KYC Data with Weightage ────────────
  const renderKycWeightage = () => {
    const kycData = userDetails?.kyc_data || userDetails?.kyc?.kyc_data || [];
    if (!kycData || kycData.length === 0) return null;

    const formatDate = (dateString: string) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      } catch {
        return dateString;
      }
    };

    const weightageHeader = [
      { name: "Category", selector: (row: any) => row.category || "--" },
      { name: "LOV Type", selector: (row: any) => row.lov_type || "--" },
      { name: "Question ID", selector: (row: any) => row.question_id || "--" },
      { name: "Factor Weight", selector: (row: any) => row.factor_weight || "--" },
      { name: "Category Weight", selector: (row: any) => row.category_weight || "--" },
      { name: "Calculated Score", selector: (row: any) => row.calculated_score || "--" },
      { name: "Calculated At", selector: (row: any) => formatDate(row.calculated_at) },
    ];

    return (
      <Card bordered={false} style={styles.card}>
        <h5 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "18px", color: "var(--foreground)" }}>
          KYC Data with Weightage
        </h5>
        <TableView header={weightageHeader} data={kycData} paginationShow={false} isLoading={false} />
      </Card>
    );
  };

  // ──────────── Customer Information Tab ────────────
  const renderCustomerInformation = () => {
    if (!nafathData) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
          No data available
        </div>
      );
    }

    const renderFieldRows = (
      fields: Array<{ enLabel: string; arLabel: string; enKey?: string; arKey?: string; key?: string }>,
      dataSource: any
    ) => {
      const getValue = (key?: string, altKey?: string) => {
        if (key && dataSource?.[key] !== undefined && dataSource?.[key] !== null) {
          const value = dataSource[key];
          if (typeof value === "object" && value !== null) return JSON.stringify(value);
          return String(value);
        }
        if (altKey && dataSource?.[altKey] !== undefined && dataSource?.[altKey] !== null) {
          const value = dataSource[altKey];
          if (typeof value === "object" && value !== null) return JSON.stringify(value);
          return String(value);
        }
        return "-";
      };

      return fields.map((field, index, array) => {
        const enValue = field.enKey ? getValue(field.enKey) : getValue(field.key);
        const arValue = field.arKey ? getValue(field.arKey) : getValue(field.key);
        return (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: index < array.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ flex: "0 0 20%", fontSize: "14px", color: "var(--foreground)" }}>{field.enLabel}</div>
            <div style={{ flex: "0 0 30%", fontSize: "14px", color: "var(--foreground)", textAlign: "left" }}>{enValue}</div>
            <div style={{ flex: "0 0 30%", fontSize: "14px", color: "var(--foreground)", textAlign: "right", direction: "rtl" }}>{arValue}</div>
            <div style={{ flex: "0 0 20%", fontSize: "14px", color: "var(--foreground)", textAlign: "right", direction: "rtl" }}>{field.arLabel}</div>
          </div>
        );
      });
    };

    const personalFields = [
      { enLabel: "NID", arLabel: "الهوية الوطنية", key: "nid" },
      { enLabel: "First Name", arLabel: "الاسم الأول", key: "first_name" },
      { enLabel: "Second Name", arLabel: "الاسم الثاني", key: "second_name" },
      { enLabel: "Third Name", arLabel: "الاسم الثالث", key: "third_name" },
      { enLabel: "Last Name", arLabel: "اسم العائلة", key: "last_name" },
      { enLabel: "Full Name (English)", arLabel: "الاسم الكامل (إنجليزي)", enKey: "full_name_english", arKey: "full_name_arabic" },
      { enLabel: "Full Name (Arabic)", arLabel: "الاسم الكامل (عربي)", enKey: "full_name_arabic", arKey: "full_name_english" },
      { enLabel: "Date of Birth (Gregorian)", arLabel: "تاريخ الميلاد (ميلادي)", key: "date_of_birth_gregorian" },
      { enLabel: "Date of Birth (Hijri)", arLabel: "تاريخ الميلاد (هجري)", key: "date_of_birth_hijri" },
      { enLabel: "Gender", arLabel: "جنس", key: "gender" },
      { enLabel: "Nationality", arLabel: "جنسية", key: "nationality" },
      { enLabel: "Nationality Code", arLabel: "رمز الجنسية", key: "nationality_code" },
      { enLabel: "Iqama Number", arLabel: "رقم الإقامة", key: "iqama_number" },
      { enLabel: "Iqama Issue Date", arLabel: "تاريخ إصدار الإقامة", key: "iqama_issue_date" },
      { enLabel: "Iqama Expiry Date", arLabel: "تاريخ انتهاء الإقامة", key: "iqama_expiry_date" },
      { enLabel: "Iqama Issue Place", arLabel: "مكان إصدار الإقامة", key: "iqama_issue_place" },
      { enLabel: "Status", arLabel: "الحالة", key: "status" },
      { enLabel: "Verification Date", arLabel: "تاريخ التحقق", key: "verification_date" },
      { enLabel: "Transaction ID", arLabel: "معرف المعاملة", key: "trans_id" },
      { enLabel: "Request ID", arLabel: "معرف الطلب", key: "request_id" },
    ];

    const nationalAddress = nafathData?.national_address || nafathData;
    const addressFields = [
      { enLabel: "City", arLabel: "مدينة", enKey: "city", arKey: "cityL2" },
      { enLabel: "City ID", arLabel: "معرف المدينة", key: "cityId" },
      { enLabel: "Region Name", arLabel: "اسم المنطقة", enKey: "regionName", arKey: "regionNameL2" },
      { enLabel: "Region ID", arLabel: "معرف المنطقة", key: "regionId" },
      { enLabel: "District", arLabel: "الحي", enKey: "district", arKey: "districtL2" },
      { enLabel: "Street Name", arLabel: "اسم الشارع", enKey: "streetName", arKey: "streetL2" },
      { enLabel: "Building Number", arLabel: "رقم المبنى", key: "buildingNumber" },
      { enLabel: "Additional Number", arLabel: "رقم إضافي", key: "additionalNumber" },
      { enLabel: "Post Code", arLabel: "الرمز البريدي", key: "postCode" },
      { enLabel: "Short Address", arLabel: "عنوان قصير", key: "shortAddress" },
      { enLabel: "Location Coordinates", arLabel: "إحداثيات الموقع", key: "locationCoordinates" },
      { enLabel: "Is Primary Address", arLabel: "عنوان رئيسي", key: "isPrimaryAddress" },
    ];

    return (
      <div style={{ padding: "20px", background: "var(--background)" }}>
        {/* Language Headers */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px" }}>English</span>
          <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px" }}>العربية</span>
        </div>

        {/* Personal Information */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>Personal Information</h2>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>معلومات شخصية</h2>
          </div>
          {renderFieldRows(personalFields, nafathData)}
        </div>

        {/* Address Information */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>Address Information</h2>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>معلومات العنوان</h2>
          </div>
          {renderFieldRows(addressFields, nationalAddress)}
        </div>
      </div>
    );
  };

  // ──────────── Compliance Question History Tab ────────────
  const renderComplianceQuestionHistory = () => {
    const complianceAnswerHistory = userDetails?.compliance_answer_history || [];
    const complianceAnswers = userDetails?.compliance_answers || [];

    const allComplianceData = [
      ...complianceAnswers.map((item: any) => ({ ...item, source: "compliance_answers" })),
      ...complianceAnswerHistory.map((item: any) => ({ ...item, source: "compliance_answer_history" })),
    ];

    if (allComplianceData.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
          No compliance question history available
        </div>
      );
    }

    // Group by date
    const groupedByDate = allComplianceData.reduce((acc: any, item: any) => {
      const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown";
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return (
      <div style={{ padding: "20px", background: "var(--background)" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "var(--foreground)" }}>
          Compliance Question History
        </h5>
        {sortedDates.map((date, dateIndex) => (
          <div
            key={dateIndex}
            style={{ marginBottom: "30px", padding: "20px", background: "var(--muted)", borderRadius: "8px" }}
          >
            <h6 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "15px", color: "var(--foreground)" }}>
              {date}
            </h6>
            <BootstrapRow>
              <BootstrapCol md={6}>
                {groupedByDate[date].map((item: any, index: number) => {
                  const question = parseQuestion(item.question);
                  return (
                    <div
                      key={item.id || index}
                      style={{
                        marginBottom: "15px",
                        paddingBottom: "15px",
                        borderBottom: index < groupedByDate[date].length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <p style={{ color: "var(--foreground)", fontSize: "14px", margin: 0, marginBottom: "5px", fontWeight: 500 }}>
                        {question.en || item.question}
                      </p>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "13px", margin: 0 }}>
                        <span style={{ fontWeight: 500 }}>Answer:</span> {item.answer || "--"}
                      </p>
                      {item.category && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "5px 0 0 0" }}>
                          <span style={{ fontWeight: 500 }}>Category:</span> {item.category}
                        </p>
                      )}
                    </div>
                  );
                })}
              </BootstrapCol>
              <BootstrapCol md={6} style={{ direction: "rtl" }}>
                {groupedByDate[date].map((item: any, index: number) => {
                  const question = parseQuestion(item.question);
                  return (
                    <div
                      key={item.id || index}
                      style={{
                        marginBottom: "15px",
                        paddingBottom: "15px",
                        borderBottom: index < groupedByDate[date].length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <p style={{ color: "var(--foreground)", fontSize: "14px", margin: 0, marginBottom: "5px", fontWeight: 500 }}>
                        {question.ar || question.en || item.question}
                      </p>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "13px", margin: 0 }}>
                        <span style={{ fontWeight: 500 }}>الإجابة:</span> {item.answer || "--"}
                      </p>
                      {item.category && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", margin: "5px 0 0 0" }}>
                          <span style={{ fontWeight: 500 }}>الفئة:</span> {item.category}
                        </p>
                      )}
                    </div>
                  );
                })}
              </BootstrapCol>
            </BootstrapRow>
          </div>
        ))}
      </div>
    );
  };

  // ──────────── Risk History Tab ────────────
  const renderRiskHistory = () => {
    const kycHistory = userDetails?.kyc_history || [];

    if (kycHistory.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
          No risk history available
        </div>
      );
    }

    const formatDate = (dateString: string) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return dateString;
      }
    };

    return (
      <div style={{ padding: "20px", background: "var(--background)" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "var(--foreground)" }}>
          Risk History
        </h5>
        {kycHistory.map((kyc: any, index: number) => (
          <div
            key={kyc.id || index}
            style={{ marginBottom: "20px", padding: "20px", background: "var(--muted)", borderRadius: "8px" }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>KYC ID</span>
                  <span style={styles.value}>{kyc.kyc_id || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Risk Level</span>
                  <span style={styles.value}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "32px",
                        fontSize: "12px",
                        backgroundColor: getRiskColor(kyc.risk),
                        color: "white",
                        display: "inline-block",
                        textTransform: "capitalize",
                      }}
                    >
                      {kyc.risk || "--"}
                    </span>
                  </span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Risk Score</span>
                  <span style={styles.value}>{kyc.risk_score || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Is PEP</span>
                  <span style={styles.value}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "32px",
                        fontSize: "12px",
                        backgroundColor: kyc.is_pep ? "var(--color-error)" : "var(--color-success)",
                        color: "white",
                        display: "inline-block",
                      }}
                    >
                      {kyc.is_pep ? "Yes" : "No"}
                    </span>
                  </span>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Status</span>
                  <span style={styles.value}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "32px",
                        fontSize: "12px",
                        backgroundColor: kyc.status === "active" ? "var(--color-success)" : "var(--color-warning)",
                        color: "white",
                        display: "inline-block",
                        textTransform: "capitalize",
                      }}
                    >
                      {kyc.status || "--"}
                    </span>
                  </span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Phone</span>
                  <span style={styles.value}>{kyc.phone || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>NID</span>
                  <span style={styles.value}>{kyc.nid || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Created At</span>
                  <span style={styles.value}>{formatDate(kyc.created_at)}</span>
                </div>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    );
  };

  // ──────────── Block History Tab ────────────
  const renderBlockHistory = () => {
    const blockHistory = userDetails?.block_history || [];

    if (blockHistory.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
          No block history available
        </div>
      );
    }

    const formatDate = (dateString: string) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return dateString;
      }
    };

    return (
      <div style={{ padding: "20px", background: "var(--background)" }}>
        <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "var(--foreground)" }}>
          Block History
        </h5>
        {blockHistory.map((block: any, index: number) => (
          <div
            key={block.id || index}
            style={{ marginBottom: "20px", padding: "20px", background: "var(--muted)", borderRadius: "8px" }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Block Code</span>
                  <span style={styles.value}>{block.block_code?.code || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Description</span>
                  <span style={styles.value}>{block.block_code?.description || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Action</span>
                  <span style={styles.value}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "32px",
                        fontSize: "12px",
                        backgroundColor: block.action === "block" ? "var(--color-error)" : "var(--color-success)",
                        color: "white",
                        display: "inline-block",
                        textTransform: "capitalize",
                      }}
                    >
                      {block.action || "--"}
                    </span>
                  </span>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Action By</span>
                  <span style={styles.value}>{block.action_by?.name || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Email</span>
                  <span style={styles.value}>{block.action_by?.email || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Reason</span>
                  <span style={styles.value}>{block.reason || "--"}</span>
                </div>
                <div style={styles.fieldRow}>
                  <span style={styles.label}>Created At</span>
                  <span style={styles.value}>{formatDate(block.created_at)}</span>
                </div>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    );
  };

  // ──────────── Loan Application Tab ────────────
  const renderLoanApplicationContent = () => {
    const loanApplications = userDetails?.loan_applications || [];

    const formatDate = (dateString: string) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      } catch {
        return dateString;
      }
    };

    const formatAmount = (amount: number | string) => {
      if (!amount) return "--";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "SAR",
        minimumFractionDigits: 0,
      }).format(Number(amount));
    };

    const loanApplicationHeader = [
      { name: "Loan Application Number", selector: (row: any) => row.loan_application_number || "--", width: "200px" },
      { name: "Amount", selector: (row: any) => formatAmount(row.amount) },
      { name: "Duration", selector: (row: any) => (row.duration ? `${row.duration} months` : "--") },
      { name: "Type", selector: (row: any) => row.type || "--" },
      { name: "Status", selector: (row: any) => row.status?.name || "--" },
      { name: "Product", selector: (row: any) => row.product?.name || "--" },
      { name: "Created At", selector: (row: any) => formatDate(row.created_at) },
      { name: "Updated At", selector: (row: any) => formatDate(row.updated_at) },
      {
        name: "Action",
        cell: (row: any) => (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: "var(--color-action)",
              color: "var(--foreground)",
              border: "1px solid white",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => {
              if (row.loan_application_number) {
                navigate(`/FinancingApplications/AllApplications/View/${row.loan_application_number}`);
              }
            }}
          >
            <Eye size={16} />
            View Details
          </button>
        ),
      },
    ];

    const tableData = loanApplications.map((loan: any, index: number) => ({
      id: loan.id || index,
      loan_application_number: loan.loan_application_number,
      amount: loan.amount,
      duration: loan.duration,
      type: loan.type,
      status: loan.status,
      product: loan.product,
      created_at: loan.created_at,
      updated_at: loan.updated_at,
    }));

    return (
      <div style={{ background: "var(--background)" }}>
        <TableView header={loanApplicationHeader} data={tableData} paginationShow={false} isLoading={false} />
      </div>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
          Customer Detail
        </h2>
      </div>

      {/* Onboarding Stepper */}
      <StepForms userDetails={userDetails} />

      {/* Customer Summary Card */}
      <Card bordered={false} style={styles.card}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            {leftColumn.map((item, index) => (
              <div key={index} style={styles.fieldRow}>
                <span style={styles.label}>{item.label}</span>
                <span style={styles.value}>{item.value}</span>
              </div>
            ))}
          </Col>
          <Col xs={24} md={12}>
            {rightColumn.map((item, index) => (
              <div key={index} style={styles.fieldRow}>
                <span style={styles.label}>{item.label}</span>
                <span style={styles.value}>{item.value}</span>
              </div>
            ))}
          </Col>
        </Row>
      </Card>

      {/* KYC Information */}
      {renderKycInformation()}

      {/* KYC Steps */}
      {renderKycSteps()}

      {/* KYC Data with Weightage */}
      {renderKycWeightage()}

      {/* Main Tabs: Overview | Loan Application */}
      <Card bordered={false} style={styles.card}>
        <Tabs
          id="main-tabs"
          activeKey={selectTab}
          onSelect={(tab: any) => setSelectedTab(tab)}
          className="mb-3"
        >
          <Tab eventKey="Overview" title="Overview">
            {selectTab === "Overview" && (
              <Tabs
                id="overview-child-tabs"
                activeKey={overviewChildTab}
                onSelect={(tab: any) => setOverviewChildTab(tab)}
                className="mb-3"
              >
                <Tab eventKey="Customer Information" title="Customer Information">
                  {overviewChildTab === "Customer Information" && renderCustomerInformation()}
                </Tab>
                <Tab eventKey="Compliance Question History" title="Compliance Question History">
                  {overviewChildTab === "Compliance Question History" && renderComplianceQuestionHistory()}
                </Tab>
                <Tab eventKey="Risk History" title="Risk History">
                  {overviewChildTab === "Risk History" && renderRiskHistory()}
                </Tab>
                <Tab eventKey="Block History" title="Block History">
                  {overviewChildTab === "Block History" && renderBlockHistory()}
                </Tab>
              </Tabs>
            )}
          </Tab>
          <Tab eventKey="Loan Application" title="Loan Application">
            {selectTab === "Loan Application" && renderLoanApplicationContent()}
          </Tab>
        </Tabs>
      </Card>
    </>
  );
};

export default CustomerDetail;
