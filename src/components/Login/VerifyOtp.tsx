import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import FactoringLogo from "../../assets/images/factoring-png.png";
import {
  setPermissions,
  setRefreshToken,
  setToken,
} from "../../redux/apis/apisSlice";
import { useDispatch } from "react-redux";
import axios from "axios";
import Loader from "../Loader/Loader";
import { getAllModulesFromPermissionData } from "../../hooks/useProductPermissions";

// Function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const baseURL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL;

// Function to get permissions by role
const getPermissionsByRole = (token: string) => {
  return axios.get(
    `${baseURL}/api/v2/permissions/get-modules-with-permissions-by-role`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
};

const VerifyOtp: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loginData = location.state as {
    companyUnn?: string;
    password?: string;
    loginMethod?: string;
  };

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      // Focus last input
      if (inputsRef.current[3]) {
        inputsRef.current[3].focus();
      }
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 4) {
      toast.error("Please enter the complete 4-digit OTP");
      return;
    }

    if (!loginData?.companyUnn || !loginData?.password) {
      toast.error("Login data is missing. Please try logging in again.");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual OTP verification API call
      // For now, we'll proceed with login after OTP verification
      // Example API call:
      // const otpResponse = await verifyOtpApi({
      //   companyUnn: loginData.companyUnn,
      //   otp: otpCode,
      // });
      
      // Simulate OTP verification (remove this when API is ready)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // After OTP verification, proceed with login
      const formDataToSend = new URLSearchParams();
      formDataToSend.append("client_id", import.meta.env.VITE_REACT_APP_IDS_CLIENT_ID);
      formDataToSend.append("client_secret", import.meta.env.VITE_REACT_APP_IDS_CLIENT_SECRET);
      formDataToSend.append("grant_type", 'password');
      formDataToSend.append("username", loginData.companyUnn);
      formDataToSend.append("password", loginData.password);

      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_IDS_URL}/connect/token`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (res?.data?.access_token) {
        const accessToken = res.data.access_token;
        localStorage.setItem("token", accessToken);
        const decodedToken = decodeJWT(accessToken);

        const userData = {
          access_token: accessToken,
          token_type: res.data.token_type,
          expires_in: res.data.expires_in,
          refresh_token: res.data.refresh_token,
          user: decodedToken,
          ...res.data,
        };

        dispatch(setToken({ token: accessToken }));
        if (res.data.refresh_token) {
          dispatch(setRefreshToken({ refreshToken: res.data.refresh_token }));
        }

        localStorage.setItem("userData", JSON.stringify(userData));

        const roleValue = decodedToken?.role || decodedToken?.user_role;
        const userName = decodedToken?.userName || decodedToken?.userName;

        // Get permissions
        if (userName) {
          try {
            const permRes = await getPermissionsByRole(accessToken);
            if (permRes?.data?.success) {
              // Both payload shapes — a bare array, or `{ los: [...] }`. Storing
              // only the array left roles served the other with nothing.
              const permissions = getAllModulesFromPermissionData(permRes?.data?.data);
              if (permissions.length > 0) {
                dispatch(setPermissions(permissions));
                localStorage.setItem("permissions", JSON.stringify(permissions));
              }
            } else {
              // No permissions — clear so sidebar shows all items
              dispatch(setPermissions([]));
              localStorage.removeItem("permissions");
            }
          } catch (error) {
            // Permissions fetch failed — clear so sidebar shows all items
            dispatch(setPermissions([]));
            localStorage.removeItem("permissions");
          }
        } else {
          // No username — clear permissions
          dispatch(setPermissions([]));
          localStorage.removeItem("permissions");
        }

        // Navigate based on role
        toast.success("Login Successfully");
        if (roleValue === "partner_admin") {
          navigate("/partner");
        } else if (roleValue === "customer") {
          navigate("/customer");
        } else {
          navigate("/LOS/Wallet/Home");
        }
      }
    } catch (error: any) {
      console.error("Error during OTP verification/login:", error);
      if (error?.response?.status === 400) {
        toast.error("Invalid OTP or credentials");
      } else if (error?.response?.data?.error_description) {
        toast.error(error.response.data.error_description);
      } else {
        toast.error("OTP verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {isLoading && <Loader />}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "2px",
            padding: "40px",
            maxWidth: "450px",
            width: "100%",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <img
              src={FactoringLogo}
              alt="Factoring Valley"
              style={{
                height: "40px",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#000000",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            VERIFY OTP
          </h2>

          {/* Tagline */}
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "32px",
              textAlign: "center",
            }}
          >
            Let's build something great
          </p>

          {/* OTP Input Fields */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "32px",
            }}
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={{
                  width: "60px",
                  height: "60px",
                  border: `2px solid ${digit ? "#1963b9" : "#e0e0e0"}`,
                  borderRadius: "2px",
                  fontSize: "24px",
                  fontWeight: "600",
                  textAlign: "center",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.select();
                  e.target.style.borderColor = "#1963b9";
                }}
                onBlur={(e) => {
                  if (!digit) {
                    e.target.style.borderColor = "#e0e0e0";
                  }
                }}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isLoading || otp.join("").length !== 4}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#1963b9",
              color: "#ffffff",
              borderRadius: "2px",
              border: "none",
              fontSize: "16px",
              fontWeight: "700",
              cursor: isLoading || otp.join("").length !== 4 ? "not-allowed" : "pointer",
              opacity: isLoading || otp.join("").length !== 4 ? 0.6 : 1,
              transition: "background-color 0.3s ease",
              textTransform: "uppercase",
            }}
          >
            {isLoading ? "Verifying..." : "VERIFY OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;

