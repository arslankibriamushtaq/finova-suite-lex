import { useNavigate, useSearchParams } from "react-router-dom";

const NafathVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationNumber = searchParams.get("applicationNumber") || "FVAN-6152142950";
  const verificationNumber = "11";

  // Simulate verification process - in real app, this would be handled by API
  const handleVerify = () => {
    // After verification, redirect to first-time login
    navigate(`/CustomerVerification/first-time-login?applicationNumber=${applicationNumber}`);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Main Modal Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "40px",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#000000",
            marginBottom: "12px",
          }}
        >
          You have a pending Nafath verification
        </h2>

        {/* Instruction */}
        <p
          style={{
            fontSize: "16px",
            color: "#666666",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          Please verify your Nafath account to proceed with your application.
        </p>

        {/* Application Number */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#000000",
            marginBottom: "32px",
          }}
        >
          Application Number: {applicationNumber}
        </div>

        {/* Inner Verification Box */}
        <div
          style={{
            backgroundColor: "#F5F5F5",
            borderRadius: "8px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          {/* Inner Title */}
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#000000",
              marginBottom: "24px",
            }}
          >
            Nafath Verification
          </h3>

          {/* Graphic Icon */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "24px",
              position: "relative",
            }}
          >
            {/* Smartphone with checkmark icon */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#1963b9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                marginRight: "20px",
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            {/* Arrow */}
            <div
              style={{
                width: "40px",
                height: "2px",
                backgroundColor: "#FF6B35",
                position: "relative",
                marginRight: "20px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "-8px",
                  top: "-6px",
                  width: "0",
                  height: "0",
                  borderLeft: "8px solid #FF6B35",
                  borderTop: "6px solid transparent",
                  borderBottom: "6px solid transparent",
                }}
              />
            </div>

            {/* Number circle */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#1963b9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              {verificationNumber}
            </div>
          </div>

          {/* Inner Instruction */}
          <p
            style={{
              fontSize: "14px",
              color: "#666666",
              lineHeight: "1.5",
              marginBottom: "24px",
            }}
          >
            Please login to your Nafath account and verify this number.
          </p>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            style={{
              backgroundColor: "#1963b9",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 32px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#155a9e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1963b9";
            }}
          >
            Verify with Nafath
          </button>
        </div>
      </div>
    </div>
  );
};

export default NafathVerification;

