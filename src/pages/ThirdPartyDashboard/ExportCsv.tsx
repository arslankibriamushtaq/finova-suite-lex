import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import toast from "react-hot-toast";
import { exportEnvironmentCsv } from "../../redux/apis/apisThirdParty";

const ExportCsv = () => {
  const { t } = useTranslation("connector");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await exportEnvironmentCsv();
      
      if (response?.data?.success && response.data.data?.download_url) {
        // The API returns a JSON response with a download_url
        const downloadUrl = response.data.data.download_url;
        const filename = response.data.data.filename || `environment_export_${new Date().toISOString().split('T')[0]}.csv`;
        
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(t("exportCsv.toast.success", { count: response.data.data.total_records || 0 }));
      } else {
        toast.error(t("exportCsv.toast.invalidFormat"));
      }

      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t("exportCsv.toast.exportFailed"));
      setLoading(false);
    }
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("exportCsv.title")}</h2>
      </div>

      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ marginBottom: "20px", color: "var(--color-text-muted)" }}>
          {t("exportCsv.description")}
        </p>
        <Button
          type="primary"
          onClick={handleExport}
          loading={loading}
          style={{ backgroundColor: "var(--foreground)", borderColor: "var(--foreground)" }}
          size="large"
        >
          {loading ? t("exportCsv.exporting") : t("exportCsv.exportButton")}
        </Button>
      </div>
    </div>
  );
};

export default ExportCsv;
