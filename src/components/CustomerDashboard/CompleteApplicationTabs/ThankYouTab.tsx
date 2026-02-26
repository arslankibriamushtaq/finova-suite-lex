import React from "react";

interface ThankYouTabProps {
  applicationData?: any;
}

const ThankYouTab: React.FC<ThankYouTabProps> = ({ applicationData }) => {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#000000",
          marginBottom: "24px",
        }}
      >
        Thank You
      </h2>
      <p style={{ fontSize: "16px", color: "#666" }}>
        Thank you for your application submission.
      </p>
    </div>
  );
};

export default ThankYouTab;

