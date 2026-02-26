import React, { useState } from "react";

interface MaskedValueProps {
  value: string | number;
  showToggle?: boolean;
  unmaskedCount?: number;
}

const MaskedValue: React.FC<MaskedValueProps> = ({
  value,
  showToggle = false,
  unmaskedCount = 4,
}) => {
  const [visible, setVisible] = useState(false);

  const getMaskedValue = () => {
    const strValue = String(value); // ✅ always convert to string

    if (visible) return strValue;
if(unmaskedCount>0){

    const unmaskedLength = Math.max(0, Math.min(unmaskedCount, strValue.length));
    const visiblePart = strValue.slice(-unmaskedLength);
    const maskedPart = "*".repeat(strValue.length - unmaskedLength);

    return (
        <>
          <span style={{ fontFamily: "monospace" }}>{maskedPart}</span>
          {visiblePart}
        </>
      );
}
else{
    return (
        <>
          <span style={{ fontFamily: "monospace" }}>******</span>
          
        </>
      );
}
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span>{getMaskedValue()}</span>
      {showToggle && (
        <span
          onClick={() => setVisible((prev) => !prev)}
          style={{
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "14px",
            color: "#000",
          }}
        >
          {visible ? "hide" : "view"}
        </span>
      )}
    </div>
  );
};

export default MaskedValue;
