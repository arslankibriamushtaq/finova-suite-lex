import React, { useState } from "react";

const PartnerFinancingInfo = ({ setSelectedTab }: any) => {
  const detailSections = [
    {
      heading: "Financing Amount Info:",
      align: "start",
      details: [
        { label: "Application Number", value: "FVAN-2560297671" },
        { label: "Product Name", value: "Invoice Factoring" },
        { label: "Factoring Tenure", value: "01 Month" },
        { label: "Factoring Type", value: "SME" },
        { label: "Application Date", value: "26 February, 2025 01:06 PM" },
        { label: "Date of Birth", value: "10 May, 2000" },
        { label: "LEI", value: "32432" },
        { label: "IBAN", value: "SA12344444" },
        { label: "Email", value: "tuba.khan+98721@xintsolutions.com" },
        { label: "Are you born in the United States of America?", value: "No" },
        { label: "Bank Name", value: "undefined" },
        { label: "CR Number", value: "1010455911" },
        { label: "Legal Form", value: "Null" },
      ],
    },
    {
      heading: "العربية",
      align: "end",
      details: [
        { label: "رقم الطلب", value: "FVAN-2560297671" },
        { label: "اسم المنتج", value: "خصم الفواتير" },
        { label: "مدة التمويل", value: "01 شهر" },
        { label: "نوع التمويل", value: "المؤسسات الصغيرة والمتوسطة" },
        { label: "تاريخ التقديم", value: "26 فبراير 2025 01:06 م" },
        { label: "تاريخ الميلاد", value: "10 مايو 2000" },
        { label: "LEI", value: "32432" },
        { label: "رقم IBAN", value: "SA12344444" },
        {
          label: "البريد الإلكتروني",
          value: "tuba.khan+98721@xintsolutions.com",
        },
        { label: "هل ولدت في الولايات المتحدة الأمريكية؟", value: "لا" },
        { label: "اسم البنك", value: "غير محدد" },
        { label: "رقم السجل التجاري", value: "1010455911" },
        { label: "الصيغة القانونية", value: "باطل" },
      ],
    },
    {
      heading: "English",
      align: "start",
      details: [
        { label: "Application Number", value: "FVAN-2560297671" },
        { label: "Product Name", value: "Invoice Factoring" },
        { label: "Factoring Tenure", value: "01 Month" },
        { label: "Factoring Type", value: "SME" },
        { label: "Application Date", value: "26 February, 2025 01:06 PM" },
        { label: "Date of Birth", value: "10 May, 2000" },
        { label: "LEI", value: "32432" },
        { label: "IBAN", value: "SA12344444" },
        { label: "Email", value: "tuba.khan+98721@xintsolutions.com" },
        { label: "Are you born in the United States of America?", value: "No" },
        { label: "Bank Name", value: "undefined" },
        { label: "CR Number", value: "1010455911" },
        { label: "Legal Form", value: "Null" },
        {
          label: "Have you stayed in the U.S. for 31 days this year?",
          value: "No",
        },
        {
          label:
            "Have you resided in the U.S. for 183 days in the past three years?",
          value: "No",
        },
        {
          label:
            "Are you a tax resident of any country other than Saudi Arabia?",
          value: "No",
        },
        { label: "Account Number", value: "undefined" },
        { label: "Account Revenue", value: "2000000" },
        { label: "Upload Contract", value: "Preview Document" },
        { label: "IBAN Certificate", value: "Preview Document" },
        { label: "Source of Income", value: "Source 1" },
        {
          label: "Are you a U.S. resident, citizen, or green card holder?",
          value: "No",
        },
        { label: "Financial Statements", value: "Preview Document" },
        { label: "Purpose of Factoring", value: "Purpose 1" },
        { label: "Average Invoice Value", value: "15000" },
        { label: "Outstanding Invoices Value", value: "0" },
        {
          label: "Business Registration Certificate",
          value: "Preview Document",
        },
      ],
    },
    {
      heading: "عربي",
      align: "end",
      details: [
        { label: "رقم الطلب", value: "FVAN-2560297671" },
        { label: "اسم المنتج", value: "خصم الفواتير" },
        { label: "مدة التمويل", value: "01 شهر" },
        { label: "نوع التمويل", value: "المؤسسات الصغيرة والمتوسطة" },
        { label: "تاريخ التقديم", value: "26 فبراير 2025 01:06 م" },
        { label: "تاريخ الميلاد", value: "10 مايو 2000" },
        { label: "LEI", value: "32432" },
        { label: "رقم IBAN", value: "SA12344444" },
        {
          label: "البريد الإلكتروني",
          value: "tuba.khan+98721@xintsolutions.com",
        },
        { label: "هل ولدت في الولايات المتحدة الأمريكية؟", value: "لا" },
        { label: "اسم البنك", value: "غير محدد" },
        { label: "رقم السجل التجاري", value: "1010455911" },
        { label: "الصيغة القانونية", value: "باطل" },
        {
          label: "هل بقيت في الولايات المتحدة لمدة 31 يومًا هذا العام؟",
          value: "لا",
        },
        {
          label:
            "هل عشت في الولايات المتحدة لمدة 183 يومًا خلال السنوات الثلاث الماضية؟",
          value: "لا",
        },
        {
          label: "هل أنت مقيم ضريبي في أي بلد غير المملكة العربية السعودية؟",
          value: "لا",
        },
        { label: "رقم الحساب", value: "غير محدد" },
        { label: "إيرادات الحساب", value: "2000000" },
        { label: "تحميل العقد", value: "مستند المعاينة" },
        { label: "شهادة IBAN", value: "مستند المعاينة" },
        { label: "مصدر الدخل", value: "المصدر 1" },
        {
          label:
            "هل أنت مقيم أو مواطن أو حامل بطاقة خضراء في الولايات المتحدة؟",
          value: "لا",
        },
        { label: "البيانات المالية", value: "مستند المعاينة" },
        { label: "الغرض من التمويل", value: "الغرض 1" },
        { label: "متوسط قيمة الفاتورة", value: "15000" },
        { label: "قيمة الفواتير المستحقة", value: "0" },
        { label: "شهادة تسجيل الأعمال", value: "مستند المعاينة" },
      ],
    },
  ];

  return (
    <>
      <div className=" p-3 mb-3" style={{ background: "white" }}>
        <div className="row p-3 g-3 align-items-center account-card">
          <div className="col-12">
            <div
              className="d-flex justify-content-between p-2 mt-2"
              style={{ color: "red", fontSize: "1.5rem" }}
            >
              <div>English</div>
              <div>العربية</div>
            </div>
            <div className="row">
              {detailSections.map((section, index) => (
                <div className="col-6" key={index}>
                  <h5
                    style={{
                      color: "red",
                      background: "#f8f9fa",
                      height: "3.5rem ",
                    }}
                    className={`d-flex justify-content-${section.align} mb-4 heading-cover`}
                  >
                    {section.heading}
                  </h5>
                  {section.details.map((detail, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center mt-2 mb-3"
                      style={{ borderBottom: "1px solid #CFCFCF" }}
                    >
                      <p
                        style={{
                          color: "#0B0B0B",
                          fontSize: "14px",
                          lineHeight: "1.5rem",
                        }}
                      >
                        {detail.label}
                      </p>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#0B0B0B",
                          fontSize: "14px",
                        }}
                      >
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerFinancingInfo;
