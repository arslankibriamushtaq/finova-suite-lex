import React, { useState, useEffect } from "react";
import { Tab, Tabs, Row as BootstrapRow, Col as BootstrapCol } from "react-bootstrap";
import { Row, Col, Card, Spin } from "antd";
import StepForms from "./LeadTabs/StepFroms";
import { useParams } from "react-router-dom";
import { getUserDetails } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";

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
    marginBottom: "20px"
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--color-border-faint)",
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
  complianceSection: {
    background: "var(--color-surface-cloud)",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  questionLabel: {
    fontSize: "13px",
    color: "var(--foreground)",
    fontWeight: 400,
    marginBottom: "5px",
  },
  answerLabel: {
    fontSize: "13px",
    color: "#555",
    fontWeight: 400,
    marginTop: "3px",
  },
};

const HighRiskUserDetail = () => {
  const { id } = useParams();
  const [selectTab, setSelectedTab] = useState<string>("Overview");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  const pageType = "High Risk User";

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(id!);
      if (response?.data?.success) {
        setUserDetails(response.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  // Parse compliance answers questions
  const parseQuestion = (questionString: string) => {
    try {
      return JSON.parse(questionString);
    } catch {
      return { en: questionString, ar: "" };
    }
  };

  // Get all compliance answers
  const getAllComplianceAnswers = () => {
    if (!userDetails?.compliance_answers || !Array.isArray(userDetails.compliance_answers)) {
      return [];
    }
    
    // Return all answers with parsed questions
    return userDetails.compliance_answers.map((answer: any) => {
      const question = parseQuestion(answer.question);
      return { ...answer, parsedQuestion: question };
    });
  };

  const complianceAnswers = getAllComplianceAnswers();

  // Parse nafath callback data if available
  const nafathData = userDetails?.nafath_callback_data ? 
    (typeof userDetails.nafath_callback_data === 'string' ? 
      JSON.parse(userDetails.nafath_callback_data) : 
      userDetails.nafath_callback_data) : null;

  // Dynamic mapping for left column
  const leftColumn: Field[] = [
    { label: "Customer Name", value: userDetails?.user?.name || "--" },
    { label: "Phone", value: userDetails?.user?.phone || "--" },
    { label: "ID", value: userDetails?.user?.nid || "--" },
    { label: "Employment Sector Name", value: "Government" },
  ];

  // Dynamic mapping for right column
  const rightColumn: Field[] = [
    { label: "Customer Name", value: userDetails?.user?.name || "--" },
    { label: "Email", value: userDetails?.user?.email || "--" },
    { label: "Address", value: nafathData?.full_address_en || nafathData?.full_address || "--" },
  ];

  // Render Overview content
  const renderOverviewContent = () => {
    if (!nafathData) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
          No data available
        </div>
      );
    }

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
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>
              Personal Information
            </h2>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>
              معلومات شخصية
            </h2>
          </div>
          <div>
            {([
              { enLabel: "Full name", arLabel: "الاسم الكامل", enKey: "full_name_en", arKey: "full_name_ar" },
              { enLabel: "Family Name", arLabel: "اسم العائلة", enKey: "family_name_en", arKey: "family_name_ar" },
              { enLabel: "National ID (NIN)", arLabel: "الهوية الوطنية (NIN)", key: "national_id" },
              { enLabel: "Gender", arLabel: "جنس", enKey: "gender_en", arKey: "gender_ar" },
              { enLabel: "Nationality", arLabel: "جنسية", enKey: "nationality_en", arKey: "nationality_ar" },
              { enLabel: "Nationality Code", arLabel: "قانون الجنسية", key: "nationality_code" },
              { enLabel: "Date of Birth (Gregorian)", arLabel: "تاريخ الميلاد (هجري)", enKey: "date_of_birth_gregorian", arKey: "date_of_birth_hijri" },
              { enLabel: "ID Version", arLabel: "إصدار الهوية", key: "id_version" },
              { enLabel: "ID Issue Date (Gregorian)", arLabel: "تاريخ إصدار الهوية (هجري)", enKey: "id_issue_date_gregorian", arKey: "id_issue_date_hijri" },
              { enLabel: "ID Expiry Date (Gregorian)", arLabel: "تاريخ انتهاء الهوية (هجري)", enKey: "id_expiry_date_gregorian", arKey: "id_expiry_date_hijri" },
            ] as Array<{ enLabel: string; arLabel: string; enKey?: string; arKey?: string; key?: string }>).map((field, index, array) => {
              const getValue = (key?: string, altKey?: string) => {
                if (key && nafathData[key]) {
                  const value = nafathData[key];
                  if (typeof value === 'object' && value !== null) {
                    return JSON.stringify(value);
                  }
                  return String(value);
                }
                if (altKey && nafathData[altKey]) {
                  const value = nafathData[altKey];
                  if (typeof value === 'object' && value !== null) {
                    return JSON.stringify(value);
                  }
                  return String(value);
                }
                return "-";
              };
              const enValue = getValue(field.enKey, field.key);
              const arValue = getValue(field.arKey, field.key);
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < array.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "var(--foreground)" }}>
                    {field.enLabel}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "var(--foreground)", textAlign: "left" }}>
                    {enValue}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "var(--foreground)", textAlign: "right", direction: "rtl" }}>
                    {arValue}
                  </div>
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "var(--foreground)", textAlign: "right", direction: "rtl" }}>
                    {field.arLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Address Information */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>
              Address Information
            </h2>
            <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "18px", margin: 0 }}>
              معلومات العنوان
            </h2>
          </div>
          <div>
            {([
              { enLabel: "Region", arLabel: "منطقة", enKey: "region_en", arKey: "region_ar" },
              { enLabel: "Region ID", arLabel: "معرف المنطقة", key: "region_id" },
              { enLabel: "City", arLabel: "مدينة", enKey: "city_en", arKey: "city_ar" },
              { enLabel: "City ID", arLabel: "معرف المدينة", key: "city_id" },
              { enLabel: "District", arLabel: "يصرف", enKey: "district_en", arKey: "district_ar" },
              { enLabel: "Street Name", arLabel: "اسم الشارع", enKey: "street_name_en", arKey: "street_name_ar" },
              { enLabel: "Building Number", arLabel: "رقم المبنى", key: "building_number" },
              { enLabel: "Additional Number", arLabel: "رقم إضافي", key: "additional_number" },
              { enLabel: "Post Code", arLabel: "شفرة البريد", key: "post_code" },
              { enLabel: "Short Address", arLabel: "عنوان قصير", key: "short_address" },
              { enLabel: "Location Coordinates", arLabel: "إحداثيات الموقع", enKey: "location_coordinates_en", arKey: "location_coordinates_ar" },
              { enLabel: "Full Address", arLabel: "العنوان الكامل", enKey: "full_address_en", arKey: "full_address_ar" },
            ] as Array<{ enLabel: string; arLabel: string; enKey?: string; arKey?: string; key?: string }>).map((field, index, array) => {
              const getValue = (key?: string, altKey?: string) => {
                if (key && nafathData[key]) {
                  const value = nafathData[key];
                  if (typeof value === 'object' && value !== null) {
                    return JSON.stringify(value);
                  }
                  return String(value);
                }
                if (altKey && nafathData[altKey]) {
                  const value = nafathData[altKey];
                  if (typeof value === 'object' && value !== null) {
                    return JSON.stringify(value);
                  }
                  return String(value);
                }
                return "-";
              };
              const enValue = getValue(field.enKey, field.key);
              const arValue = getValue(field.arKey, field.key);
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < array.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "var(--foreground)" }}>
                    {field.enLabel}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "var(--foreground)", textAlign: "left" }}>
                    {enValue}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "var(--foreground)", textAlign: "right", direction: "rtl" }}>
                    {arValue}
                  </div>
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "var(--foreground)", textAlign: "right", direction: "rtl" }}>
                    {field.arLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
     <Loader/>
    );
  }

  return (
    <>
      {/* Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
          {pageType} Detail
        </h2>
      </div>

      <StepForms userDetails={userDetails} />
      
      {/* Customer Information Section */}
     <Card bordered={false} style={styles.card}>
      <Row gutter={24}>
        {/* LEFT COLUMN */}
        <Col xs={24} md={12}>
          {leftColumn.map((item, index) => (
            <div key={index} style={styles.fieldRow}>
              <span style={styles.label}>{item.label}</span>
              <span style={styles.value}>{item.value}</span>
            </div>
          ))}
        </Col>

        {/* RIGHT COLUMN */}
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

      {/* Compliance Questions Section */}
      {complianceAnswers.length > 0 && (
        <Card bordered={false} style={styles.card}>
          <h5 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "var(--foreground)" }}>
            Compliance Questions
          </h5>
          <BootstrapRow>
            {/* English Column */}
            <BootstrapCol md={6}>
              <h6 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "15px", color: "var(--foreground)" }}>
                Compliance Questions (English)
              </h6>
              {complianceAnswers.map((answer: any, index: number) => {
                const questionText = answer.parsedQuestion?.en || String(answer.question || "");
                const answerText = String(answer.answer || "-");
                return (
                  <div key={index} style={styles.complianceSection}>
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ ...styles.questionLabel, fontWeight: 400 }}>Question</div>
                      <div style={{ ...styles.value, fontSize: "13px" }}>{questionText}</div>
                    </div>
                    <div>
                      <div style={{ ...styles.answerLabel }}>Answer</div>
                      <div style={{ ...styles.value, fontSize: "13px" }}>{answerText}</div>
                    </div>
                  </div>
                );
              })}
            </BootstrapCol>

            {/* Arabic Column */}
            <BootstrapCol md={6}>
              <h6 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "15px", color: "var(--foreground)", textAlign: "right", direction: "rtl" }}>
                أسئلة الإلتزام
              </h6>
              {complianceAnswers.map((answer: any, index: number) => {
                const questionText = answer.parsedQuestion?.ar || answer.parsedQuestion?.en || String(answer.question || "");
                const answerText = String(answer.answer || "-");
                return (
                  <div key={index} style={{ ...styles.complianceSection, direction: "rtl", textAlign: "right" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ ...styles.questionLabel, fontWeight: 400 }}>السؤال</div>
                      <div style={{ ...styles.value, fontSize: "13px" }}>{questionText}</div>
                    </div>
                    <div>
                      <div style={{ ...styles.answerLabel }}>الإجابة</div>
                      <div style={{ ...styles.value, fontSize: "13px" }}>{answerText}</div>
                    </div>
                  </div>
                );
              })}
            </BootstrapCol>
          </BootstrapRow>
        </Card>
      )}

      {/* Overview Section with Tabs */}
      <Card bordered={false} style={styles.card}>
        <Tabs
          id="overview-tabs"
        activeKey={selectTab}
        onSelect={(tab: any) => {
          setSelectedTab(tab);
        }}
          className="mb-3"
      >
          <Tab eventKey="Overview" title="Overview">
            {selectTab === "Overview" && renderOverviewContent()}
          </Tab>
        </Tabs>
      </Card>
    </>
  );
};

export default HighRiskUserDetail;
