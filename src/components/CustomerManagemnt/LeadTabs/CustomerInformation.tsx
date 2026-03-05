import React from "react";
import { Row, Col, Card } from "antd";

interface Field {
  labelEn: string;
  labelAr: string;
  valueEn?: string | number;
  valueAr?: string | number;
}

interface Section {
  titleEn: string;
  titleAr: string;
  fields: Field[];
}

const sections: Section[] = [
  {
    titleEn: "Address Info",
    titleAr: "معلومات العنوان",
    fields: [
      { labelEn: "Login Id", labelAr: "معرف تسجيل الدخول", valueEn: "1743798589", valueAr: "1743798589" },
    ],
  },
  {
    titleEn: "Address Info Address List",
    titleAr: "معلومات العنوان قائمة العناوين",
    fields: [
      { labelEn: "City", labelAr: "مدينة", valueEn: "Riyadh", valueAr: "الرياض" },
      { labelEn: "District", labelAr: "حي", valueEn: "Al Nakheel District", valueAr: "حي النخيل" },
      { labelEn: "Post Code", labelAr: "رمز البريد", valueEn: "12384", valueAr: "12384" },
      { labelEn: "Street Name", labelAr: "اسم الشارع", valueEn: "Wadi Al Malas", valueAr: "وادي الملاص" },
      { labelEn: "Unit Number", labelAr: "رقم الوحدة", valueEn: "2", valueAr: "2" },
      { labelEn: "Building Number", labelAr: "رقم المبنى", valueEn: "4323", valueAr: "4323" },
      { labelEn: "Additional Number", labelAr: "رقم إضافي", valueEn: "7383", valueAr: "7383" },
      {
        labelEn: "Location Coordinates",
        labelAr: "إحداثيات الموقع",
        valueEn: "46.6400666424,74769040",
        valueAr: "46.6400666424,74769040",
      },
    ],
  },
  {
    titleEn: "Client Info",
    titleAr: "معلومات العميل",
    fields: [
      { labelEn: "First Name", labelAr: "الاسم الأول", valueEn: "Firas", valueAr: "فراس" },
      { labelEn: "Father Name", labelAr: "اسم الأب", valueEn: "Ali", valueAr: "علي" },
      { labelEn: "Grand Father Name", labelAr: "اسم الأب الكبير", valueEn: "Ibrahim", valueAr: "إبراهيم" },
      { labelEn: "Family Name", labelAr: "اسم العائلة", valueEn: "Kamel", valueAr: "كامل" },
      { labelEn: "Log Id", labelAr: "معرف السجل", valueEn: "1743727104", valueAr: "1743727104" },
      { labelEn: "Gender", labelAr: "جنس", valueEn: "F", valueAr: "F" },
      { labelEn: "Id Issue Date (H)", labelAr: "تاريخ إصدار المعرف (هـ)", valueEn: "10-20-1439", valueAr: "10-20-1439" },
      { labelEn: "Date of Birth (G)", labelAr: "تاريخ الميلاد (م)", valueEn: "12-10-1996", valueAr: "12-10-1996" },
      { labelEn: "Date of Birth (H)", labelAr: "تاريخ الميلاد (هـ)", valueEn: "05-30-1417", valueAr: "05-30-1417" },
      { labelEn: "Id Expiry Date (H)", labelAr: "تاريخ انتهاء المعرف (هـ)", valueEn: "10-17-1444", valueAr: "10-17-1444" },
      { labelEn: "Id Issue Date (G)", labelAr: "تاريخ إصدار المعرف (م)", valueEn: "04-07-2018", valueAr: "04-07-2018" },
      { labelEn: "Id Issue Place", labelAr: "مكان إصدار الهوية", valueEn: "Riyadh", valueAr: "الرياض" },
      { labelEn: "Place of Birth", labelAr: "مكان الميلاد", valueEn: "Riyadh", valueAr: "الرياض" },
      { labelEn: "Id Expiry Date (G)", labelAr: "تاريخ انتهاء المعرف (م)", valueEn: "07-05-23", valueAr: "07-05-23" },
      { labelEn: "Occupation Code", labelAr: "كود الوظيفة", valueEn: "0", valueAr: "0" },
      { labelEn: "Id Version Number", labelAr: "رقم إصدار المعرف", valueEn: "2", valueAr: "2" },
    ],
  },
];

const CustomerInformation: React.FC = () => {
  return (
    <div>
      {sections.map((section, idx) => (
        <Card key={idx} bordered={false} style={styles.sectionCard}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <div style={styles.header}>{section.titleEn}</div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ ...styles.header, ...styles.rtl }}>{section.titleAr}</div>
            </Col>

            {section.fields.map((f, i) => (
              <React.Fragment key={i}>
                <Col xs={24} md={12}>
                  <div style={styles.fieldRow}>
                    <span style={styles.label}>{f.labelEn}</span>
                    <span style={styles.value}>{f.valueEn}</span>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ ...styles.fieldRow, ...styles.rtl }}>
                    <span style={styles.label}>{f.labelAr}</span>
                    <span style={styles.value}>{f.valueAr}</span>
                  </div>
                </Col>
              </React.Fragment>
            ))}
          </Row>
        </Card>
      ))}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    background: "var(--color-surface-cloud)",
    padding: "16px 0",
    overflowY: "auto",
  },
  sectionCard: {
    background: "var(--background)",
    borderRadius: 8,
    padding: "8px 0px 16px 0px",
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  header: {
    background: "var(--color-surface-subtle)",
    padding: "6px 12px",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 14,
    color: "var(--color-text-dark)",
    marginBottom: 10,
  },
  rtl: {
    direction: "rtl",
    textAlign: "right",
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--color-border-faint)",
    padding: "6px 0",
    fontSize: 13,
  },
  label: {
    color: "var(--color-text-muted)",
  },
  value: {
    fontWeight: 600,
    color: "var(--foreground)",
  },
};

export default CustomerInformation;
