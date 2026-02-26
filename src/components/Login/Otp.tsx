// src/OtpInput.js

import { useState } from "react";

const OtpInput = ({ length, onChangeOtp }: any) => {
  const [otp, setOtp] = useState(Array(length).fill(""));

  const handleChange = (element: any, index: any) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    onChangeOtp(newOtp.join(""));

    // Move focus to next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  return (
    <div className="otp-input">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
};

export default OtpInput;
