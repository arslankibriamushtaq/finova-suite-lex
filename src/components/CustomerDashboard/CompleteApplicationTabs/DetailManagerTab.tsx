import React from "react";

interface DetailManagerTabProps {
  applicationData?: any;
}

const DetailManagerTab: React.FC<DetailManagerTabProps> = ({ applicationData }) => {
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
        Detail Manager
      </h2>
      <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
        <p>Detail Manager content will be displayed here.</p>
      </div>
    </div>
  );
};

export default DetailManagerTab;

