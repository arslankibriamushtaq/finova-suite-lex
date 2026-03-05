import { useState, useEffect } from "react";
import { Button } from "antd";
import toast from "react-hot-toast";
import { exportEnvironmentCsv } from "../../redux/apis/apisThirdParty";

const ExportCsv = () => {
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
        
        toast.success(`CSV file exported successfully. ${response.data.data.total_records || 0} records exported.`);
      } else {
        toast.error("Invalid response format from server");
      }
      
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to export CSV");
      setLoading(false);
    }
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Export CSV</h2>
      </div>
      
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ marginBottom: "20px", color: "var(--color-text-muted)" }}>
          Click the button below to download the environment data as a CSV file.
        </p>
        <Button
          type="primary"
          onClick={handleExport}
          loading={loading}
          style={{ backgroundColor: "var(--foreground)", borderColor: "var(--foreground)" }}
          size="large"
        >
          {loading ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
    </div>
  );
};

export default ExportCsv;
