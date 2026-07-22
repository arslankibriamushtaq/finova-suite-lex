import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";

/**
 * Shown when the logged-in user has no permission for any module — i.e. the sidebar
 * has nothing to display. Used as the post-login landing target for a role with all
 * permissions unassigned, instead of dropping them on a page that 403s.
 */
const NoAccess = () => {
  const { t } = useTranslation("common");
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        gap: "16px",
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
          background: "color-mix(in srgb, var(--color-error, #ef4444) 12%, transparent)",
          color: "var(--color-error, #ef4444)",
        }}
      >
        <ShieldAlert size={34} />
      </span>
      <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--foreground)" }}>
        {t("noAccess.title", "No access")}
      </h2>
      <p style={{ margin: 0, maxWidth: "420px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
        {t(
          "noAccess.message",
          "You do not have permission to access any module. Please contact your administrator to be assigned the required permissions."
        )}
      </p>
    </div>
  );
};

export default NoAccess;
