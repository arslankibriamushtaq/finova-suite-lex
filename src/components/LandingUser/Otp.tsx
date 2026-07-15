// OtpVerification.tsx
import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Images } from "../Config/Images";
import { verifyOtp, orbitSmsOtp } from "../../redux/apis/apisCrudFactoring";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { setBusinessDetails } from "../../redux/apis/apisSlice";
import { uploadStepDocuments } from "../../utils/uploadStepDocuments";
import RequiredDocFields from "./RequiredDocFields";
import { useTranslation } from "react-i18next";

const OtpVerification = () => {
  const { t } = useTranslation("landingUser");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const otpNumber = location?.state?.data;

  // Get form data from previous pages
  const businessFormData = (location.state as any)?.businessFormData;
  const authorizedFormData = (location.state as any)?.authorizedFormData;

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
      toast.error(t("otpCommon.enterCode"));
      return;
    }

    const fd = new FormData();
    fd.append("loan_application_number", applicationNo || "");
    fd.append("otp", code || "");
    fd.append("otp_type", "email_verification");
    fd.append("application_step", "4");

    // Resolve supplier phone and nid from redux businessDetails (with fallbacks),
    // always using supplier fields unless specified otherwise.
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
        toast.error(res?.data?.message || t("otpCommon.verifyFailed"));
        return;
      }

      // Store verified business info in redux
      if (businessFormData) {
        dispatch(setBusinessDetails(businessFormData));
      }

      toast.success(res?.data?.message || t("otpCommon.verifiedSuccess"));

      // Upload dynamic required documents for this step
      const docsOk = await uploadStepDocuments(4, requiredDocuments, docFiles);
      if (!docsOk) return;

      // After email OTP success, send Orbit SMS OTP
      const smsBody = {
        supplier_mobile_number: supplierMobile
          ? `966${supplierMobile}`
          : "",
      };
      const smsRes = await orbitSmsOtp(smsBody);
      if (!smsRes?.data?.success) {
        toast.error(smsRes?.data?.message || t("otp.smsFailed"));
        return;
      }

      // Move to next step (Orbit SMS verification screen)
      navigate("/applyloan/orbitSms", {
        state: {
          businessFormData: businessFormData,
          authorizedFormData: authorizedFormData,
        },
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || t("common.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center p-4 mt-4">
        <div className="otp-card">
          <h2 className="otp-title">{t("otp.title")}</h2>
          <div className="d-flex justify-content-center">
            <img src={Images.otp} alt="" width={88} height={88} />
          </div>
          <p className="mt-2 otp-desc">{otpNumber}</p>

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
      {/* Dynamic Required Documents for Step 4 */}
      <RequiredDocFields
        stepNo={4}
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
            navigate("/applyloan/businessdetails", {
              state: {
                businessFormData: businessFormData
              }
            });
          }}
        >
          {t("common:previous")}
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
          {loading ? t("action.verifying") : t("action.verify")}
        </button>
      </div>
    </>
  );
};

export default OtpVerification;
