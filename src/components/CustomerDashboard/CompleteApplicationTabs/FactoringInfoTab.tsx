import React from "react";

interface FactoringInfoTabProps {
  applicationData?: any;
}

const FactoringInfoTab: React.FC<FactoringInfoTabProps> = ({ applicationData }) => {
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
        Factoring Info
      </h2>
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <p>Factoring Info content will be displayed here.</p>
      </div>
    </div>
  );
};

export default FactoringInfoTab;

