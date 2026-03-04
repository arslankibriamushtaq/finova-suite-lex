import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import FactoringLogo from "../../assets/images/factoring-png.png";
import Loader from "../Loader/Loader";

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSsoLogin = async () => {
      try {
        const ssoBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(
          `${ssoBaseUrl}/identity-service/api/v1/auth/sso/login-url`
        );
        const { authUrl, state } = res.data.data;
        sessionStorage.setItem("sso_state", state);
        window.location.href = authUrl;
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "Failed to initiate SSO login.";
        setError(message);
        toast.error(message);
      }
    };

    initSsoLogin();
  }, []);

  if (error) {
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
            <div className="login-form" style={{ textAlign: "center" }}>
              <h2 className="login-signin-title">SIGN IN</h2>
              <p style={{ color: "#ff4d4f", margin: "24px 0" }}>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                className="login-submit-button"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <Loader />
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
          <div className="login-form" style={{ textAlign: "center" }}>
            <h2 className="login-signin-title">SIGN IN</h2>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "24px" }}>
              Redirecting to SSO login...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
