import React from "react";

interface InvoicesTabProps {
  applicationData?: any;
}

const InvoicesTab: React.FC<InvoicesTabProps> = ({ applicationData }) => {
  return (
    <div style={{ padding: "20px 0" }}>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "var(--foreground)",
          marginBottom: "24px",
        }}
      >
        Invoices
      </h2>
      <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
        <p>Invoices content will be displayed here.</p>
      </div>
    </div>
  );
};

export default InvoicesTab;

