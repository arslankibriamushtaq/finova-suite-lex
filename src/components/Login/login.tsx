import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Input } from "antd";
import { setToken, setPermissions } from "../../redux/apis/apisSlice";
import { useDispatch } from "react-redux";
import FactoringLogo from "../../assets/images/factoring-png.png";
import Loader from "../Loader/Loader";
import { forgetPassword } from "../../redux/apis/apisCrudFactoring";
import { getRolePermission } from "../../redux/apis/apisCrud";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    companyUnn: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    companyUnn: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "companyUnn">("companyUnn");

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccessToken, setForgotPasswordSuccessToken] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", companyUnn: "", password: "" };

    if (loginMethod === "email") {
      if (!formData.email) {
        newErrors.email = "Email is required";
        isValid = false;
      } else {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email.trim())) {
          newErrors.email = "Please enter a valid email address";
          isValid = false;
        }
      }
    } else {
      if (!formData.companyUnn) {
        newErrors.companyUnn = "Company UNN is required";
        isValid = false;
      } else {
        const unnPattern = /^\d+$/;
        if (!unnPattern.test(formData.companyUnn.trim())) {
          newErrors.companyUnn = "Company UNN should contain only numbers";
          isValid = false;
        }
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Hardcoded token for dev/testing — login API not called
  const DEV_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMWUyM2E4ZmU3NzIwOWQ5ZmI5YmYzNDJiOWMwMDMxZjBiN2U3NzQ5ZDA5MTI5MzhjNjM3ZTg3NTAxNGU1MmE2MWYzNzlmNGY1MzMzNjI4NTkiLCJpYXQiOjE3NzI0MzUwMzguNTAwODUyLCJuYmYiOjE3NzI0MzUwMzguNTAwODU1LCJleHAiOjE4MDM5NzEwMzguNDU1MDEzLCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.a_yRHK46f7nZvyPEECa1ASpW0Q0kJTLfKBO64PmFLs7fq5YB8cwHcUhlWg3_dTLuFOa6Mib5DdkBfMEluJWqUX2mjvrtr8JeaZEKJLS8tBO5Tcd447BbLJOyFE7HnnlFemoau9jDB_AYkPLFMqhk-lp-cZI4sWh6-ubNWusi6FRCEgOOgzeVRy_Whcxhx4muL5YbZivYn--XaksEQq8lMwRM7-i9X3MnjpuF6n03K9KJg-l2zlxLonmzh2VXr500W1V3N4jxkM6UqQLGNe9brWNWz3Iwi_76ZeyjCSAG7sNEZOSBkeYfAPJIDz-U-TyTUd9vfVxVxcREjsEPN5aEvQ-MBbNu1LPqo105PIsnW_NAL_AoLIZh2CeXh1XGhG5t9s_aO5_l4kXV3Zups_earKkobp2APE6Xmt_wnsfq9e56njyx2po7xuL_FCYBwZ9mboZ8jI1-W5JEqW5FxS1-D8MfQlhMuaQtntqozKYH0LuuwGt19jYxMVcO7yOeaB9AsfUKzwtR8USRb5c5a6PBHLK6fOKKSntodhiolUWlESRZ7MHXlGjG4cLOr3eWvvQNunK7VncYmKPZLBAcRX5WF1pkL9na7Mi6SJpHojqBIw1yQW4TLwGF-0YKoBTqQWEq7cVdrSvZP5YF-AhJy3hBMO1VV7fb6VW9UjOnY8yUbSk";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Set token without calling login API (dev bypass)
      dispatch(setToken({ token: DEV_TOKEN }));
      localStorage.setItem("token", DEV_TOKEN);
      const minimalUserData = { access_token: DEV_TOKEN, user: { role_id: 1 } };
      localStorage.setItem("userData", JSON.stringify(minimalUserData));

      const permissionRes = await getRolePermission();
      if (permissionRes?.data?.success) {
        const permissions = permissionRes.data.data;
        dispatch(setPermissions(permissions));
        localStorage.setItem("permissions", JSON.stringify(permissions));
      }

      toast.success("Login Successful");
      navigate("/LOS/Dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Original handleSubmit (commented out) ---
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;
  //   setIsLoading(true);
  //   try {
  //     if (loginMethod === "companyUnn") {
  //       navigate("/verify-otp", {
  //         state: {
  //           companyUnn: formData.companyUnn,
  //           password: formData.password,
  //           loginMethod: "companyUnn",
  //         },
  //       });
  //       setIsLoading(false);
  //       return;
  //     }
  //     const body: any = {
  //       password: formData.password,
  //       login_type: loginMethod === "email" ? "email" : "company_unn",
  //     };
  //     if (loginMethod === "email") {
  //       body.email = formData.email;
  //     } else {
  //       body.company_unn = formData.companyUnn;
  //     }
  //     const res = await login(body);
  //     if (res?.data?.success) {
  //       const data = res.data.data;
  //       if (data?.access_token) {
  //         dispatch(setToken({ token: data.access_token }));
  //         localStorage.setItem("token", data.access_token);
  //       }
  //       if (data?.refresh_token) {
  //         dispatch(setRefreshToken({ refreshToken: data.refresh_token }));
  //       }
  //       localStorage.setItem("userData", JSON.stringify(data));
  //       const roleId = data?.user?.role_id;
  //       if (roleId) {
  //         const permissionRes = await getRolePermission();
  //         if (permissionRes?.data?.success) {
  //           const permissions = permissionRes.data.data;
  //           dispatch(setPermissions(permissions));
  //           localStorage.setItem("permissions", JSON.stringify(permissions));
  //         }
  //       }
  //       toast.success(res.data.message || "Login Successful");
  //       navigate("/LOS/Dashboard");
  //     } else {
  //       toast.error(res?.data?.message || "Login failed.");
  //     }
  //   } catch (error: any) {
  //     console.error("Error during login:", error);
  //     if (error?.response?.data?.message) {
  //       toast.error(error.response.data.message);
  //     } else {
  //       toast.error(error?.message || "Login failed. Please try again.");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleForgotPasswordSubmit = async () => {
    const email = forgotPasswordEmail.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setForgotPasswordError("Email is required");
      return;
    }
    if (!emailPattern.test(email)) {
      setForgotPasswordError("Please enter a valid email address");
      return;
    }
    setForgotPasswordError("");
    setForgotPasswordLoading(true);
    try {
      const res = await forgetPassword({ email });
      if (res?.data?.success) {
        const token = res?.data?.data?.token ?? null;
        setForgotPasswordSuccessToken(token);
        toast.success(/* res?.data?.message ||  */"Password reset link sent to your email.");
      } else {
        toast.error(res?.data?.message || "Failed to send reset link.");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to send reset link.";
      setForgotPasswordError(msg);
      toast.error(msg);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    if (!forgotPasswordLoading) {
      setForgotPasswordOpen(false);
      setForgotPasswordEmail("");
      setForgotPasswordError("");
      setForgotPasswordSuccessToken(null);
    }
  };

  const resetPasswordUrl = forgotPasswordSuccessToken && forgotPasswordEmail
    ? `${window.location.origin}/reset-password?token=${encodeURIComponent(forgotPasswordSuccessToken)}&email=${encodeURIComponent(forgotPasswordEmail)}`
    : "";

  return (
    <div className="login-container">
      {isLoading && <Loader />}
      <div className="login-form-wrapper">
        {/* Left Panel - Dark Background */}
        <div className="login-left-panel">
          <div className="login-left-content">
            <img src={FactoringLogo} alt="Factoring Valley Logo" className="login-logo" />
            <h1 className="login-welcome-text">Welcome !</h1>
            <p className="login-instruction-text">
              To keep connected with us please login with your personal info.
            </p>
          </div>
        </div>

        {/* Right Panel - White Background */}
        <div className="login-right-panel">
          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-signin-title">SIGN IN</h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px", textAlign: "center" }}>
              Let's build something great
            </p>
          
            {/* Login Method Selection */}
            <div style={{ marginBottom: "24px", display: "flex", gap: "24px", justifyContent: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="loginMethod"
                  value="email"
                  checked={loginMethod === "email"}
                  onChange={(e) => {
                    setLoginMethod(e.target.value as "email" | "companyUnn");
                    setErrors({ email: "", companyUnn: "", password: "" });
                  }}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#1963b9" }}
                />
                <span style={{ fontSize: "14px", color: "#333" }}>Email</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="loginMethod"
                  value="companyUnn"
                  checked={loginMethod === "companyUnn"}
                  onChange={(e) => {
                    setLoginMethod(e.target.value as "email" | "companyUnn");
                    setErrors({ email: "", companyUnn: "", password: "" });
                  }}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#1963b9" }}
                />
                <span style={{ fontSize: "14px", color: "#333" }}>Company UNN</span>
              </label>
            </div>

            {/* Conditional Input Field */}
            <div className="login-input-wrapper">
              {loginMethod === "email" ? (
                <>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="login-input"
                  />
                  {errors.email && <div className="login-error">{errors.email}</div>}
                </>
              ) : (
                <>
                  <input
                    id="companyUnn"
                    name="companyUnn"
                    type="text"
                    placeholder="Company UNN"
                    value={formData.companyUnn}
                    onChange={handleInputChange}
                    className="login-input"
                  />
                  {errors.companyUnn && <div className="login-error">{errors.companyUnn}</div>}
                </>
              )}
            </div>

            <div className="login-input-wrapper">
              <div className="login-password-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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
              {errors.password && (
                <div className="login-error">{errors.password}</div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="login-submit-button"
            >
              {isLoading ? "Loading..." : "LOGIN"}
            </button>
            
            <div style={{ textAlign: "right", marginTop: "16px" }}>
              <button
                type="button"
                className="login-forgot-password"
                style={{ color: "#ff4d4f", textDecoration: "none", background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        title={forgotPasswordSuccessToken ? "Check your email" : "Forgot Password"}
        open={forgotPasswordOpen}
        onCancel={closeForgotPasswordModal}
        footer={null}
        destroyOnClose={false}
      >
        {forgotPasswordSuccessToken ? (
          <>
            <p style={{ marginBottom: "16px", color: "#333" }}>
              A password reset link has been sent to your email address. Please check your inbox.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
              <Button onClick={closeForgotPasswordModal}>Close</Button>
              <Button
                type="primary"
                onClick={() => {
                  window.location.href = resetPasswordUrl;
                }}
              >
                Reset Password
              </Button>
            </div>
          </>
        ) : (
          <>
            <p style={{ marginBottom: "12px", color: "#666" }}>
              Enter your email address and we will send you a link to reset your password.
            </p>
            <Input
              type="email"
              placeholder="Email"
              value={forgotPasswordEmail}
              onChange={(e) => {
                setForgotPasswordEmail(e.target.value);
                setForgotPasswordError("");
              }}
              status={forgotPasswordError ? "error" : undefined}
              style={{ marginBottom: "8px" }}
              onPressEnter={handleForgotPasswordSubmit}
            />
            {forgotPasswordError && (
              <div style={{ color: "#ff4d4f", fontSize: "12px", marginBottom: "12px" }}>
                {forgotPasswordError}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
              <Button onClick={closeForgotPasswordModal} disabled={forgotPasswordLoading}>
                Cancel
              </Button>
              <Button type="primary" loading={forgotPasswordLoading} onClick={handleForgotPasswordSubmit}>
                Send reset link
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Login;
