import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { WifiOff } from "lucide-react";
import FactoringLogo from "../../assets/images/factoring-png.png";
import Loader from "../Loader/Loader";

const Login: React.FC = () => {
  const { t } = useTranslation("common");
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    isNetwork: boolean;
  } | null>(null);

  useEffect(() => {
    const initSsoLogin = async () => {
      try {
        const ssoBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(
          `${ssoBaseUrl}/identity-service/api/v1/auth/sso/login-url?redirect_uri=${window.location.origin}/callback`
        );
        const { authUrl, state } = res.data.data;
        sessionStorage.setItem("sso_state", state);
        window.location.href = authUrl;
      } catch (err: any) {
        // A missing HTTP response (server unreachable, DNS/"name resolution"
        // failure, offline, or timeout) is a connectivity problem — surface a
        // friendly, localized message instead of the raw browser/axios error.
        const isNetwork =
          (typeof navigator !== "undefined" && navigator.onLine === false) ||
          err?.code === "ERR_NETWORK" ||
          err?.code === "ECONNABORTED" ||
          !err?.response;
        setErrorInfo({
          isNetwork,
          message: isNetwork
            ? t("networkError")
            : err?.response?.data?.message || t("signInFailed"),
        });
      }
    };

    initSsoLogin();
  }, [t]);

  if (errorInfo) {
    return (
      <div className="login-container">
        <div className="login-form-wrapper">
          <div className="login-left-panel">
            <div className="login-left-content">
              <img
                src={FactoringLogo}
                alt="Factoring Valley Logo"
                className="login-logo"
              />
              <h1 className="login-welcome-text">{t("loginWelcome")}</h1>
              <p className="login-instruction-text">{t("loginSubtitle")}</p>
            </div>
          </div>
          <div className="login-right-panel">
            <div className="login-form" style={{ textAlign: "center" }}>
              {errorInfo.isNetwork ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "#fef2f2",
                        color: "#ef4444",
                      }}
                    >
                      <WifiOff size={30} />
                    </span>
                  </div>
                  <h2 className="login-signin-title">{t("networkErrorTitle")}</h2>
                </>
              ) : (
                <h2 className="login-signin-title">{t("signIn")}</h2>
              )}
              <p
                style={{
                  color: errorInfo.isNetwork ? "#64748b" : "#ff4d4f",
                  margin: "20px auto 28px",
                  maxWidth: "340px",
                  lineHeight: 1.6,
                }}
              >
                {errorInfo.message}
              </p>
              <button
                type="button"
                onClick={() => {
                  setErrorInfo(null);
                  window.location.reload();
                }}
                className="login-submit-button"
              >
                {t("tryAgain")}
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
    </div>
  );
};

export default Login;
