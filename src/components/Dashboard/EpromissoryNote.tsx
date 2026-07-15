import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import { useTranslation } from "react-i18next";

const EpromissoryNote = ({setActiveTab}: any) => {
  const { t } = useTranslation("dashboard");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (id) fetchDisclaimerData();
  }, [id]);

  const fetchDisclaimerData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(id, "e-promissory");

      const directUrl = response.data?.data;

      if (directUrl) {
        setPdfUrl(directUrl);
        toast.success(t("epromissory.toast.loaded"));
      } else {
        toast.error(t("epromissory.toast.invalidUrl"));
      }
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error(t("epromissory.toast.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>{t("epromissory.loading")}</p>
        </div>
      ) : pdfUrl ? (
        <div style={{ height: "85vh", marginTop: "20px" }}>
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: "none", borderRadius: "2px" }}
            title={t("epromissory.iframeTitle")}
            onError={() => {
              console.error("Failed to load PDF in iframe");
              toast.error(t("epromissory.toast.loadFailed"));
            }}
          />
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#666" }}>
              {t("epromissory.helpText")}{" "}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#000000", textDecoration: "underline" }}
              >
                {t("epromissory.openNewTab")}
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>{t("epromissory.noPdf")}</p>
        </div>
      )}
    </div>
  );
};

export default EpromissoryNote;
