import React from "react";
import { Card } from "antd";

interface Field {
  labelEn: string;
  labelAr: string;
  value: string | number;
}

interface BusinessInfoTabProps {
  applicationData?: any;
}

const BusinessInfoTab: React.FC<BusinessInfoTabProps> = ({ applicationData }) => {
  // Dummy business info data - will be replaced with dynamic data from API
  const businessInfoFields: Field[] = [
    {
      labelEn: "CR Name",
      labelAr: "اسم المنشأة",
      value: applicationData?.crName || "شركة XXX المحدودة",
    },
    {
      labelEn: "CR Number",
      labelAr: "رقم السجل التجاري",
      value: applicationData?.crNumber || "1010XXXX29",
    },
    {
      labelEn: "Issue Date",
      labelAr: "تاريخ اصدار السجل",
      value: applicationData?.issueDate || "1391/10/19",
    },
    {
      labelEn: "Expiry Date",
      labelAr: "تاريخ انتهاء السجل",
      value: applicationData?.expiryDate || "1443/08/10",
    },
    {
      labelEn: "isEcommerce",
      labelAr: "هي تجارة إلكترونية",
      value: applicationData?.isEcommerce || "1",
    },
    {
      labelEn: "Unified National Number",
      labelAr: "الرقم الموحد",
      value: applicationData?.unifiedNationalNumber || "700XXXX660",
    },
  ];

  return (
    <div style={{ padding: "20px 0" }}>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "var(--foreground)",
          marginBottom: "24px",
          textAlign: "start",
        }}
      >
        Business Info
      </h2>
      
      <Card
        style={{
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            backgroundColor: "var(--color-surface-snow)",
            borderBottom: "1px solid var(--color-border-subtle)",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              fontWeight: "600",
              color: "var(--theme-secondary)",
              fontSize: "14px",
            }}
          >
            English
          </div>
          <div
            style={{
              fontWeight: "600",
              color: "var(--theme-secondary)",
              fontSize: "14px",
              textAlign: "right",
              direction: "rtl",
            }}
          >
            العربية
          </div>
        </div>

        {/* Data Rows */}
        {businessInfoFields.map((field, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: index < businessInfoFields.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
            }}
          >
            {/* English Side */}
            <div
              style={{
                padding: "12px 16px",
                borderRight: "1px solid var(--color-border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--foreground)", fontSize: "14px" }}>
                {field.labelEn}
              </span>
              <span style={{ color: "var(--foreground)", fontSize: "14px", fontWeight: "500" }}>
                {field.value}
              </span>
            </div>

            {/* Arabic Side */}
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              <span style={{ color: "var(--foreground)", fontSize: "14px" }}>
                {field.value}
              </span>
              <span style={{ color: "var(--foreground)", fontSize: "14px" }}>
                {field.labelAr}
              </span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default BusinessInfoTab;

