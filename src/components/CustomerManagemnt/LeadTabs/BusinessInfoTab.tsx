import React from "react";
import { Row, Col, Card } from "antd";
import "./BusinessInfoTab.css"; // We'll include crisp CSS below

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
    titleEn: "English",
    titleAr: "عربي",
    fields: [
      { labelEn: "CR Name", labelAr: "اسم السجل التجاري", valueEn: "XXX Company Limited", valueAr: "شركة XXX المحدودة" },
      { labelEn: "CR Number", labelAr: "رقم السجل التجاري", valueEn: "1010XXXX4521", valueAr: "1010XXXX4521" },
      { labelEn: "Issue Date", labelAr: "تاريخ الإصدار", valueEn: "25-02-2025", valueAr: "25-02-2025" },
      { labelEn: "Expiry Date", labelAr: "تاريخ انتهاء الصلاحية", valueEn: "24-02-2028", valueAr: "24-02-2028" },
      { labelEn: "isEcommerce", labelAr: "هي التجارة الإلكترونية", valueEn: "1", valueAr: "1" },
      { labelEn: "Unified National Number", labelAr: "الرقم الوطني الموحد", valueEn: "700XXXX660", valueAr: "700XXXX660" },
    ],
  },
  {
    titleEn: "URL 1",
    titleAr: "رابط 1",
    fields: [
      { labelEn: "Website Link", labelAr: "رابط الموقع", valueEn: "www.example.com", valueAr: "www.example.com" },
      { labelEn: "Type", labelAr: "نوع", valueEn: "Documentation Platform", valueAr: "منصة الوثائق" },
      { labelEn: "Type Id", labelAr: "معرف النوع", valueEn: "1", valueAr: "1" },
    ],
  },
  {
    titleEn: "CR Status",
    titleAr: "حالة CR",
    fields: [
      { labelEn: "CR Status", labelAr: "حالة CR", valueEn: "Active", valueAr: "نشط" },
      { labelEn: "CR Status", labelAr: "السجل التجاري نشط", valueEn: "Commercial registry is active", valueAr: "السجل التجاري نشط" },
    ],
  },
  {
    titleEn: "General Address",
    titleAr: "العنوان العام",
    fields: [
      { labelEn: "Fax 1", labelAr: "الفاكس 1", valueEn: "49XXXX0", valueAr: "49XXXX0" },
      { labelEn: "Fax 2", labelAr: "الفاكس 2", valueEn: "49XXXX1", valueAr: "49XXXX1" },
      { labelEn: "Email", labelAr: "البريد الإلكتروني", valueEn: "example@gmail.com", valueAr: "example@gmail.com" },
      { labelEn: "Address", labelAr: "العنوان", valueEn: "Riyadh, Saudi Arabia", valueAr: "الرياض، المملكة العربية السعودية" },
      { labelEn: "Website", labelAr: "الموقع الإلكتروني", valueEn: "www.example.com", valueAr: "www.example.com" },
      { labelEn: "Postal Box 1", labelAr: "صندوق البريد 1", valueEn: "0040XX", valueAr: "0040XX" },
      { labelEn: "Postal Box 2", labelAr: "صندوق البريد 2", valueEn: "0040XX", valueAr: "0040XX" },
      { labelEn: "Telephone 1", labelAr: "الهاتف 1", valueEn: "49XXXX7", valueAr: "49XXXX7" },
      { labelEn: "Telephone 2", labelAr: "الهاتف 2", valueEn: "49XXXX5", valueAr: "49XXXX5" },
    ],
  },
  {
    titleEn: "National Address",
    titleAr: "العنوان الوطني",
    fields: [
      { labelEn: "City", labelAr: "مدينة", valueEn: "Riyad", valueAr: "الرياض" },
      { labelEn: "Zip Code", labelAr: "الرمز البريدي", valueEn: "1XXX5", valueAr: "1XXX5" },
      { labelEn: "Street Name", labelAr: "شارع", valueEn: "Turki Al Sudairy Street", valueAr: "شارع تركي السديري" },
      { labelEn: "Unit Number", labelAr: "رقم الوحدة", valueEn: "2", valueAr: "2" },
      { labelEn: "Building Number", labelAr: "رقم المبنى", valueEn: "1234", valueAr: "1234" },
      { labelEn: "Additional Number", labelAr: "رقم إضافي", valueEn: "1234", valueAr: "1234" },
    ],
  },
  {
    titleEn: "Address National District",
    titleAr: "عنوان المنطقة الوطنية",
    fields: [
      { labelEn: "Id", labelAr: "بطاقة تعريف", valueEn: "101", valueAr: "101" },
      { labelEn: "Name", labelAr: "اسم", valueEn: "Sulamaniyah District", valueAr: "منطقة السليمانية" },
    ],
  },
  {
    titleEn: "Capital",
    titleAr: "عاصمة",
    fields: [
      { labelEn: "Paid Amount", labelAr: "المبلغ المدفوع", valueEn: "900,000.00", valueAr: "900,000.00" },
      { labelEn: "Announced Amount", labelAr: "المبلغ المعلن", valueEn: "90,000,000.00", valueAr: "90,000,000.00" },
      { labelEn: "Subscribed Amount", labelAr: "مبلغ الاشتراك", valueEn: "90,000,000.00", valueAr: "90,000,000.00" },
    ],
  },
  {
    titleEn: "Capital Share",
    titleAr: "حصة رأس المال",
    fields: [
      { labelEn: "Share Price", labelAr: "سعر السهم", valueEn: "900,000.00", valueAr: "900,000.00" },
      { labelEn: "Share Count", labelAr: "عدد الأسهم", valueEn: "10.00", valueAr: "10.00" },
    ],
  },
  {
    titleEn: "Company",
    titleAr: "شركة",
    fields: [
      { labelEn: "Period", labelAr: "فترة", valueEn: "10", valueAr: "10" },
      { labelEn: "Start Date", labelAr: "تاريخ البدء", valueEn: "21-06-2022", valueAr: "21-06-2022" },
      { labelEn: "End Date", labelAr: "تاريخ الانتهاء", valueEn: "18-06-2026", valueAr: "18-06-2026" },
    ],
  },
  {
    titleEn: "Party 1",
    titleAr: "الحفلة 1",
    fields: [
      { labelEn: "Name", labelAr: "اسم", valueEn: "Ali Muhammad XXXX", valueAr: "علي محمد XXXX" },
      { labelEn: "Gross", labelAr: "إجمالي", valueEn: "900,000.00", valueAr: "900,000.00" },
      { labelEn: "Birth Date", labelAr: "تاريخ الميلاد", valueEn: "02-11-1979", valueAr: "02-11-1979" },
      { labelEn: "Share Count", labelAr: "عدد الأسهم", valueEn: "1.00", valueAr: "1.00" },
    ],
  },
  {
    titleEn: "Party 1 Identity",
    titleAr: "هوية الطرف 1",
    fields: [
      { labelEn: "Id", labelAr: "بطاقة تعريف", valueEn: "1006XXXX47", valueAr: "1006XXXX47" },
      { labelEn: "Name", labelAr: "اسم", valueEn: "nid", valueAr: "nid" },
    ],
  },
  {
    titleEn: "Party 1 Relation",
    titleAr: "علاقة الطرف 1",
    fields: [
      { labelEn: "Id", labelAr: "بطاقة تعريف", valueEn: "2", valueAr: "2" },
      { labelEn: "Name", labelAr: "اسم", valueEn: "Partner", valueAr: "شريك" },
    ],
  },
  {
    titleEn: "Party 1 Nationality",
    titleAr: "جنسية الحزب 1",
    fields: [
      { labelEn: "Id", labelAr: "بطاقة تعريف", valueEn: "SA", valueAr: "SA" },
      { labelEn: "Nationality", labelAr: "جنسية", valueEn: "Saudi", valueAr: "سعودي" },
    ],
  },
  {
    titleEn: "Location",
    titleAr: "موقع",
    fields: [
      { labelEn: "Id", labelAr: "بطاقة تعريف", valueEn: "1010", valueAr: "1010" },
      { labelEn: "City", labelAr: "مدينة", valueEn: "Riyad", valueAr: "الرياض" },
    ],
  },
  {
    titleEn: "Activities",
    titleAr: "أنشطة",
    fields: [
      { labelEn: "Description", labelAr: "وصف", valueEn: "Whole sale and retail of grains and seeds", valueAr: "بيع الحبوب والبذور بالجملة والتجزئة" },
    ],
  },
  {
    titleEn: "Activities ISIC 1",
    titleAr: "الأنشطة 1 ISIC",
    fields: [
      { labelEn: "Id", labelAr: "بطاقة تعريف", valueEn: "477211", valueAr: "477211" },
    ],
  },
  {
    titleEn: "Fiscal Year",
    titleAr: "السنة المالية",
    fields: [
      { labelEn: "Day", labelAr: "يوم", valueEn: "1", valueAr: "1" },
      { labelEn: "Month", labelAr: "شهر", valueEn: "2", valueAr: "2" },
    ],
  },
  {
    titleEn: "Fiscal Year Calendar Type",
    titleAr: "نوع تقويم السنة المالية",
    fields: [
      { labelEn: "Id", labelAr: "بطاقة تعريف", valueEn: "1", valueAr: "1" },
      { labelEn: "Name", labelAr: "اسم", valueEn: "Hijri", valueAr: "هجري" },
    ],
  },
  {
    titleEn: "Business Type",
    titleAr: "نوع العمل",
    fields: [
      { labelEn: "Id", labelAr: "بطاقة تعريف", valueEn: "205", valueAr: "205" },
      { labelEn: "Name", labelAr: "اسم", valueEn: "Contribution", valueAr: "مساهمة" },
    ],
  },
  {
    titleEn: "Cancellation",
    titleAr: "إلغاء",
    fields: [
      { labelEn: "Date", labelAr: "تاريخ", valueEn: "25-02-2025", valueAr: "25-02-2025" },
      { labelEn: "Reason", labelAr: "سبب", valueEn: "The record was cancelled due to...", valueAr: "مساهمة" },
    ],
  },
];

const BusinessInfoTab: React.FC = () => {
  return (
    <div className="business-info-container">
      {sections.map((section, idx) => (
        <Card key={idx} bordered={false} className="info-section">
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <div className="section-header">{section.titleEn}</div>
            </Col>
            <Col xs={24} md={12}>
              <div className="section-header rtl">{section.titleAr}</div>
            </Col>

            {section.fields.map((f, i) => (
              <React.Fragment key={i}>
                <Col xs={24} md={12}>
                  <div className="field-row" style={{borderBottom:"1px solid #eee"}}>
                    <span className="label">{f.labelEn}</span>
                    <span className="value">{f.valueEn}</span>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="field-row rtl" style={{borderBottom:"1px solid #eee"}}>
                    <span className="label">{f.labelAr}</span>
                    <span className="value">{f.valueAr}</span>
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

export default BusinessInfoTab;
