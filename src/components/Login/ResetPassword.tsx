import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import FactoringLogo from "../../assets/images/factoring-png.png";
import Loader from "../Loader/Loader";
import { resetPassword } from "../../redux/apis/apisCrudFactoring";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email") ?? "";

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [apiValidationError, setApiValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") return; // email is read-only
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiValidationError("");
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "", password_confirmation: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }
    }

    if (!formData.password) {
      newErrors.password = "New password is required";
      isValid = false;
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
      isValid = false;
    } else if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset link.");
      return;
    }
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const body = new FormData();
      body.append("token", token);
      body.append("email", formData.email.trim());
      body.append("password", formData.password);
      body.append("password_confirmation", formData.password_confirmation);

      const res = await resetPassword(body);
      if (res?.data?.success) {
        toast.success("Password has been reset successfully.");
        navigate("/login");
      } else {
        toast.error(res?.data?.message || "Failed to reset password.");
      }
    } catch (error: any) {
      const data = error?.response?.data;
      const errorObj = data?.error ?? data?.errors ?? {};
      const passwordMessages = errorObj?.password;
      const apiMessage = Array.isArray(passwordMessages)
        ? passwordMessages[0]
        : typeof passwordMessages === "string"
          ? passwordMessages
          : null;
      if (apiMessage) {
        setApiValidationError(apiMessage);
      }
      const msg =
        data?.message ||
        error?.message ||
        "Failed to reset password. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-form-wrapper">
          <div className="login-left-panel">
            <div className="login-left-content">
              <img src={FactoringLogo} alt="Factoring Valley Logo" className="login-logo" />
              <h1 className="login-welcome-text">Welcome !</h1>
              <p className="login-instruction-text">
                To keep connected with us please login with your personal info.
              </p>
            </div>
          </div>
          <div className="login-right-panel">
            <div className="login-form">
              <h2 className="login-signin-title">Invalid reset link</h2>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px", textAlign: "center" }}>
                This reset link is invalid or has expired. Please request a new one from the login page.
              </p>
              <button
                type="button"
                className="login-submit-button"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      {isLoading && <Loader />}
      <div className="login-form-wrapper">
        <div className="login-left-panel">
          <div className="login-left-content">
            <img src={FactoringLogo} alt="Factoring Valley Logo" className="login-logo" />
            <h1 className="login-welcome-text">Welcome !</h1>
            <p className="login-instruction-text">
              Enter a new password to regain access to your account.
            </p>
          </div>
        </div>

        <div className="login-right-panel">
          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-signin-title">RESET PASSWORD</h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px", textAlign: "center" }}>
              Enter new password
            </p>

            <div className="login-input-wrapper">
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Email"
                value={formData.email}
                readOnly
                className="login-input"
                style={{ cursor: "not-allowed", backgroundColor: "var(--input-readonly-bg, #f5f5f5)" }}
              />
              {errors.email && <div className="login-error">{errors.email}</div>}
            </div>

            <div className="login-input-wrapper">
              <div className="login-password-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <line x1="23" y1="1" x2="1" y2="23"></line>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && <div className="login-error">{errors.password}</div>}
            </div>

            <div className="login-input-wrapper">
              <div className="login-password-container">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="login-password-toggle"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showConfirmPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <line x1="23" y1="1" x2="1" y2="23"></line>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password_confirmation && (
                <div className="login-error">{errors.password_confirmation}</div>
              )}
              {apiValidationError && (
                <div className="login-error">{apiValidationError}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-submit-button"
            >
              {isLoading ? "Saving..." : "SAVE"}
            </button>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button
                type="button"
                style={{
                  color: "#1963b9",
                  textDecoration: "none",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  font: "inherit",
                }}
                onClick={() => navigate("/login")}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
