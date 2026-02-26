import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Images } from "../Config/Images";

const FirstTimeLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Password requirements validation
  const passwordRequirements = [
    { label: "8-16 characters", met: formData.newPassword.length >= 8 && formData.newPassword.length <= 16 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(formData.newPassword) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(formData.newPassword) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(formData.newPassword) },
    { label: "At least one special character (-_!@#$%^&*())", met: /[-_!@#$%^&*()]/.test(formData.newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when user starts typing
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {
      newPassword: "",
      confirmPassword: "",
    };

    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (!allRequirementsMet) {
      newErrors.newPassword = "Password does not meet all requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // await setSupplierPassword(formData.newPassword, applicationNumber);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // After successful password setup, redirect to customer dashboard
      navigate("/customer");
    } catch (error) {
      console.error("Error setting password:", error);
      setErrors({
        ...errors,
        newPassword: "Failed to set password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
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
      {/* Main Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "40px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Logo and Title */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <img
              src={Images.FactoringLogo}
              alt="Factoring Valley"
              style={{
                height: "40px",
                objectFit: "contain",
              }}
            />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#000000",
              marginBottom: "8px",
            }}
          >
            FIRST TIME LOGIN
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#666666",
            }}
          >
            Create your new password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#000000",
                marginBottom: "8px",
              }}
            >
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 16px",
                  border: errors.newPassword ? "1px solid #dc3545" : "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {showPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <line x1="23" y1="1" x2="1" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {errors.newPassword && (
              <p style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div
            style={{
              backgroundColor: "#F8F9FA",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#000000",
                marginBottom: "12px",
              }}
            >
              Password Requirements:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {passwordRequirements.map((requirement, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: requirement.met ? "#28a745" : "#666666",
                  }}
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: requirement.met ? "#28a745" : "#E0E0E0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px",
                      fontSize: "12px",
                      color: "#ffffff",
                      fontWeight: "700",
                    }}
                  >
                    {requirement.met ? "✓" : ""}
                  </span>
                  {requirement.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#000000",
                marginBottom: "8px",
              }}
            >
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 16px",
                  border: errors.confirmPassword ? "1px solid #dc3545" : "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {showConfirmPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <line x1="23" y1="1" x2="1" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !allRequirementsMet}
            style={{
              width: "100%",
              backgroundColor: allRequirementsMet && !isLoading ? "#1963b9" : "#cccccc",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "14px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: allRequirementsMet && !isLoading ? "pointer" : "not-allowed",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (allRequirementsMet && !isLoading) {
                e.currentTarget.style.backgroundColor = "#155a9e";
              }
            }}
            onMouseLeave={(e) => {
              if (allRequirementsMet && !isLoading) {
                e.currentTarget.style.backgroundColor = "#1963b9";
              }
            }}
          >
            {isLoading ? "Setting Password..." : "SET PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstTimeLogin;

