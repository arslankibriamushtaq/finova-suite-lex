import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { getSimahCheckDetails } from "../../redux/apis/apisCrud";
import { FaUpload, FaFilePdf, FaTimes } from "react-icons/fa";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";

function UploadSimahConsumerDocument() {
  const { t } = useTranslation("dashboard");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams(); // Get application ID from URL

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error(t("uploadSimah.toast.pdfOnly"));
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error(t("uploadSimah.toast.maxSize"));
        return;
      }

      setPdfFile(file);

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setPdfUrl(objectUrl);

      toast.success(t("uploadSimah.toast.selected"));
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setPdfFile(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle file upload to API
  const handleUpload = async () => {
    if (!pdfFile) {
      toast.error(t("uploadSimah.toast.selectFirst"));
      return;
    }

    if (!id) {
      toast.error(t("factoringApproval.toast.appIdNotFound"));
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("document", pdfFile);

      // Upload to API using new endpoint with type upload_simah_document
      const response = await getSimahCheckDetails(id, 'upload_simah_document', formData);

      if (response?.data?.success) {
        setUploadedDocument(response.data.data);
        toast.success(response?.data?.message || t("uploadSimah.toast.uploaded"));
        // Optionally switch to another tab after successful upload
        // setActiveTab("ApproveSimahInfo");
      } else {
        toast.error(response?.data?.message || t("uploadSimah.toast.uploadFailed"));
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(
        error?.response?.data?.message ||
        t("uploadSimah.toast.uploadFailed2")
      );
    } finally {
      setUploading(false);
    }
  };

  // Handle browse button click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-simah-document-container" style={{ padding: "20px" }}>
      <div className="upload-section" style={{ marginBottom: "20px" }}>
        <h5 style={{ marginBottom: "20px", color: "#333" }}>
          {t("uploadSimah.title")}
        </h5>
        
        <div 
          className="upload-area" 
          style={{
            border: "2px dashed #d0d0d0",
            borderRadius: "2px",
            padding: "40px 20px",
            textAlign: "center",
            backgroundColor: "#f9f9f9",
            marginBottom: "20px",
          }}
        >
          {!pdfFile ? (
            <div>
              <FaUpload size={50} color="#999" style={{ marginBottom: "15px" }} />
              <p style={{ color: "#666", marginBottom: "15px" }}>
                {t("uploadSimah.dropText")}
              </p>
              <p style={{ color: "#999", fontSize: "12px", marginBottom: "20px" }}>
                {t("uploadSimah.constraints")}
              </p>
              <Button
                variant="primary"
                onClick={handleBrowseClick}
                disabled={loading || uploading}
              >
                <FaUpload style={{ marginRight: "8px" }} />
                {t("uploadSimah.browseFiles")}
              </Button>
            </div>
          ) : (
            <div>
              <FaFilePdf size={50} color="#000000" style={{ marginBottom: "15px" }} />
              <p style={{ color: "#333", fontWeight: "500", marginBottom: "10px" }}>
                {pdfFile.name}
              </p>
              <p style={{ color: "#999", fontSize: "12px", marginBottom: "20px" }}>
                {t("uploadSimah.size")} {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                >
                  <FaTimes style={{ marginRight: "5px" }} />
                  {t("common:remove")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBrowseClick}
                  disabled={uploading}
                >
                  <FaUpload style={{ marginRight: "5px" }} />
                  {t("uploadSimah.changeFile")}
                </Button>
              </div>
            </div>
          )}
          
          <Form.Control
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {pdfFile && (
          <div className="d-flex justify-content-center" style={{ marginBottom: "20px" }}>
            <Button
              variant="success"
              onClick={handleUpload}
              disabled={uploading}
              style={{ minWidth: "200px" }}
            >
              {uploading ? (
                <>
                  <div style={{ display: "inline-block", transform: "scale(0.3)", transformOrigin: "center", marginRight: "8px" }}>
                    <Loader />
                  </div>
                  {t("uploadSimah.uploading")}
                </>
              ) : (
                <>
                  <FaUpload style={{ marginRight: "8px" }} />
                  {t("uploadSimah.uploadDocument")}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Display uploaded document info */}
      {uploadedDocument && (
        <div className="alert alert-success mb-4" role="alert">
          <h5 className="alert-heading">
            <i className="fas fa-check-circle me-2"></i>
            {t("uploadSimah.uploadedTitle")}
          </h5>
          <hr />
          <div className="mb-2">
            <strong>{t("uploadSimah.fileName")}</strong> {uploadedDocument.file_name || uploadedDocument.filename || pdfFile?.name || 'Document'}
          </div>
          {uploadedDocument.file_path && (
            <div className="mb-2">
              <strong>{t("uploadSimah.filePath")}</strong> {uploadedDocument.file_path}
            </div>
          )}
          {uploadedDocument.file_url && (
            <div>
              <a href={uploadedDocument.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                <i className="fas fa-eye me-2"></i>
                {t("uploadSimah.viewDocument")}
              </a>
            </div>
          )}
        </div>
      )}

      {/* PDF Preview */}
      {pdfUrl && (
        <div className="pdf-preview-section">
          <h5 style={{ marginBottom: "15px", color: "#333" }}>
            {t("uploadSimah.previewTitle")}
          </h5>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "2px",
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            {loading ? (
              <Loader />
            ) : (
              <iframe
                src={pdfUrl}
                title={t("uploadSimah.iframeTitle")}
                width="100%"
                height="600px"
                style={{ border: "none" }}
                onLoad={() => {
                }}
                onError={(e) => {
                  console.error("Error loading PDF in iframe:", e);
                  toast.error(t("uploadSimah.toast.previewFailed"));
                }}
              />
            )}
          </div>
        </div>
      )}

     
      
    </div>
  );
}

export default UploadSimahConsumerDocument;
