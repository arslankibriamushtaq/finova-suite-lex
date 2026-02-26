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
          color: "#000000",
          marginBottom: "24px",
        }}
      >
        Detail Manager
      </h2>
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <p>Detail Manager content will be displayed here.</p>
      </div>
    </div>
  );
};

export default DetailManagerTab;

