// OrbitSms.tsx
import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Images } from "../Config/Images";
import { verifyOtp } from "../../redux/apis/apisCrudFactoring";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { uploadStepDocuments } from "../../utils/uploadStepDocuments";
import RequiredDocFields from "./RequiredDocFields";

const OrbitSms = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get form data from previous pages
  const businessFormData = (location.state as any)?.businessFormData;

  const applicationNo = useSelector(
    (state: RootState) => state.block.applicationNo
  );
  const businessDetails = useSelector(
    (state: RootState) => state.block.businessDetails
  );
  const requiredDocuments = useSelector(
    (state: RootState) => state.block.requiredDocuments
  );
  const [loading, setLoading] = useState(false);
  const [docFiles, setDocFiles] = useState<Record<number, File | null>>({});

  const handleDocFileChange = (docId: number, file: File | null) => {
    setDocFiles((prev) => ({ ...prev, [docId]: file }));
  };
  const [otp, setOtp] = useState<string>("".padEnd(4, ""));
  const [timer, setTimer] = useState(120); // 2 minutes = 120 seconds
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const code = (otp || "").replace(/\D/g, "");
  const isComplete = /^\d{4}$/.test(code);

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (isNaN(Number(e.target.value))) return;
    const next = otp.split("");
    next[idx] = e.target.value;
    const newVal = next.join("");
    setOtp(newVal);

    if (e.target.value && e.target.nextElementSibling) {
      (e.target.nextElementSibling as HTMLElement).focus();
    }
  };
  
  const handleVerifyOtp = async () => {
    if (!isComplete) {
      toast.error("Please enter the 4-digit code");
      return;
    }

    // Build payload for orbit_sms_verification
    const fd = new FormData();
    fd.append("loan_application_number", applicationNo || "");
    fd.append("otp", code || "");
    fd.append("otp_type", "orbit_sms_verification");
    fd.append("application_step", "5");

    const supplierMobile =
      businessDetails?.supplier_mobile_no ||
      businessFormData?.supplier_mobile_no ||
      "";
    const supplierNid =
      businessDetails?.supplier_national_id ||
      businessFormData?.supplier_national_id ||
      "";

    fd.append(
      "phone_number",
      supplierMobile ? `966${supplierMobile}` : ""
    );
    fd.append("nid", supplierNid || "");

    try {
      setLoading(true);
      const res = await verifyOtp(fd);
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "OTP verification failed.");
        return;
      }

      toast.success(res?.data?.message || "OTP verified successfully.");

      // Upload dynamic required documents for this step
      const docsOk = await uploadStepDocuments(5, requiredDocuments, docFiles);
      if (!docsOk) return;

      // Proceed to compliance info screen
      navigate("/applyloan/ComplianceInfo", {
        state: {
          businessFormData: businessFormData,
        },
      });
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || err?.message || "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center p-4 mt-4">
        <div className="otp-card">
          <h2 className="otp-title">SMS Verification</h2>
          <div className="d-flex justify-content-center">
            <img src={Images.otp} alt="" width={88} height={88} />
          </div>
          {/* <p className="mt-2 otp-desc">Please enter the OTP sent to your mobile number</p> */}

          <div className="otp-inputs">
            {Array(4)
              .fill("")
              .map((_, idx) => (
                <input
                  ref={(el) => (inputsRef.current[idx] = el!)}
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={otp[idx] || ""}
                  onChange={(e) => handleChange(e, idx)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
          </div>
          
          {/* Timer Display */}
          <div className="text-center mt-3">
            <p style={{ color: "#dc3545", fontSize: "18px", fontWeight: 500, margin: 0 }}>
              {formatTime(timer)}
            </p>
          </div>
        </div>
      </div>
      {/* Dynamic Required Documents for Step 5 */}
      <RequiredDocFields
        stepNo={5}
        docFiles={docFiles}
        onFileChange={handleDocFileChange}
      />

      <div
        className="py-4"
        style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}
      >
        <button
          className="step-buttons"
          style={{ background: "#616161", padding: "10px 5px", borderRadius: "0", minWidth: "100px",lineHeight:"24px" }}
          onClick={() => {
            navigate("/applyloan/otpVerification", {
              state: {
                businessFormData: businessFormData
              }
            });
          }}
        >
          Previous
        </button>
        <button
          className="step-buttons"
          disabled={loading}
          style={{
            background: "#1963b9",
            padding: "10px 5px",
            borderRadius: "0",
            minWidth: "100px",
            lineHeight: "24px",
            opacity: loading ? 0.7 : 1,
          }}
          onClick={handleVerifyOtp}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </>
  );
};

export default OrbitSms;

