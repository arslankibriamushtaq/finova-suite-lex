import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const ReCAPTCHAComponent = () => {
  const [verified, setVerified] = useState(false);

  const handleRecaptcha = (value: any) => {
    if (value) {
      setVerified(true);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (verified) {
      // Proceed with form submission
    } else {
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Your form fields here */}
        <ReCAPTCHA
          sitekey="6LfwmioqAAAAALGowVAMJb_oGuIvMFQZ9V8pY6E4" // replace with your actual site key
          onChange={handleRecaptcha}
        />
      </form>
    </div>
  );
};

export default ReCAPTCHAComponent;
