import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { WifiOff } from "lucide-react";
import Loader from "../Loader/Loader";
import { startSsoLogin } from "../../auth/startSsoLogin";

const Login: React.FC = () => {
  const started = useRef(false);
  const { t } = useTranslation("common");
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    isNetwork: boolean;
  } | null>(null);

  useEffect(() => {
    // A second run — StrictMode's double-invoke in dev, or a re-mount — would
    // issue a second `login-url` call whose redirect overwrites the first, so
    // fire once per mount and let startSsoLogin guard the rest.
    if (started.current) return;
    started.current = true;

    startSsoLogin().catch((err: any) => {
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
    });
  }, [t]);

  if (errorInfo) {
    return (
      <div
        className="login-container"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
            padding: "48px 40px",
            textAlign: "center",
          }}
        >
          {errorInfo.isNetwork && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background:
                    "color-mix(in srgb, var(--color-action, #C81D25) 12%, transparent)",
                  color: "var(--color-action, #C81D25)",
                }}
              >
                <WifiOff size={34} />
              </span>
            </div>
          )}
          <h2 className="login-signin-title" style={{ marginBottom: "12px" }}>
            {errorInfo.isNetwork ? t("networkErrorTitle") : t("signIn")}
          </h2>
          <p
            style={{
              color: "#64748b",
              margin: "0 auto 28px",
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
            style={{
              width: "100%",
              background:
                "linear-gradient(135deg, #C81D25 0%, #AB1920 100%)",
              borderColor: "transparent",
              color: "#ffffff",
            }}
          >
            {t("tryAgain")}
          </button>
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
