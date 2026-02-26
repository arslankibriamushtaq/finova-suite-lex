import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../../Loader/Loader";

interface DocumentItem {
  id: number;
  type: string;
  signed_document: string | null;
  unsigned_document: string | null;
  verification_details?: any;
  created_at: string;
  updated_at: string;
}

function Document() {
  const [documents, setDocuments] = useState<{
    NAFITH?: DocumentItem;
    EmdhaFinancingContract?: DocumentItem;
    EmdhaAuthorizationLetter?: DocumentItem;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  // Base URL for document storage
  const BASE_URL_LOS = "https://uat-v2-api.awn-sa.com/los";
  const BASE_URL_MIDDLEWARE = "https://uat-v2-api.awn-sa.com/middleware";

  // Helper function to normalize document URL
  const normalizeDocumentUrl = (url: string | null | undefined, type?: string): string => {
    if (!url) return "";
    
    // Determine base URL based on document type
    const BASE_URL = type === "NAFITH" ? BASE_URL_MIDDLEWARE : BASE_URL_LOS;
    
    // If URL already contains full URL with IP address, replace it with domain
    if (url.includes("http://10.0.15.11:5004") || url.includes("https://10.0.15.11:5004")) {
      // Extract the path after the domain/IP
      const pathMatch = url.match(/\/storage\/.*/);
      if (pathMatch) {
        return `${BASE_URL}${pathMatch[0]}`;
      }
    }
    
    // If URL already starts with http/https, return as is (but replace IP if present)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      // Replace IP addresses with domain
      return url.replace(/https?:\/\/10\.0\.15\.11:5004/, BASE_URL);
    }
    
    // If URL starts with storage/, prepend base URL
    if (url.startsWith("storage/")) {
      return `${BASE_URL}/${url}`;
    }
    
    // If URL doesn't start with /, add it
    if (!url.startsWith("/")) {
      return `${BASE_URL}/${url}`;
    }
    
    // Otherwise, prepend base URL
    return `${BASE_URL}${url}`;
  };

  // Fetch documents when component mounts
  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(id, 'document');
      
      // Extract documents from response
      const data = response.data?.data || response.data || {};
      const documentsData = data.documents || {};
      
      setDocuments(documentsData);
      
      if (response.data?.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch documents");
      setDocuments(null);
    } finally {
      setLoading(false);
    }
  };

  // Get document URL (signed_document if exists, otherwise unsigned_document)
  const getDocumentUrl = (doc: DocumentItem | undefined, type: string): string => {
    if (!doc) return "";
    const url = doc.signed_document || doc.unsigned_document || "";
    return normalizeDocumentUrl(url, type);
  };

  // Get document title
  const getDocumentTitle = (type: string): string => {
    const titles: { [key: string]: string } = {
      NAFITH: "NAFITH Document",
      EmdhaFinancingContract: "Emdha Financing Contract",
      EmdhaAuthorizationLetter: "Emdha Authorization Letter",
    };
    return titles[type] || type;
  };

  // Check if data is empty
  const isDataEmpty = !documents || Object.keys(documents).length === 0;

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ padding: "20px", background: "#fff", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#000", fontWeight: 700, fontSize: "20px", margin: 0, marginBottom: "10px", textAlign: "left" }}>
          Documents
        </h2>
        <div style={{ borderBottom: "1px solid #E5E7EB", marginBottom: "20px" }}></div>
      </div>

      {isDataEmpty ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#000" }}>
          No response found
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* NAFITH Document */}
          {documents?.NAFITH && (
            <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "20px" }}>
              <h3 style={{ color: "#000", fontWeight: 600, fontSize: "16px", marginBottom: "15px" }}>
                {getDocumentTitle("NAFITH")}
              </h3>
              {getDocumentUrl(documents.NAFITH, "NAFITH") ? (
                <iframe
                  src={getDocumentUrl(documents.NAFITH, "NAFITH")}
                  style={{
                    width: "100%",
                    height: "600px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "4px",
                  }}
                  title="NAFITH Document"
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  Document not available
                </div>
              )}
            </div>
          )}

          {/* Emdha Financing Contract */}
          {documents?.EmdhaFinancingContract && (
            <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "20px" }}>
              <h3 style={{ color: "#000", fontWeight: 600, fontSize: "16px", marginBottom: "15px" }}>
                {getDocumentTitle("EmdhaFinancingContract")}
              </h3>
              {getDocumentUrl(documents.EmdhaFinancingContract, "EmdhaFinancingContract") ? (
                <iframe
                  src={getDocumentUrl(documents.EmdhaFinancingContract, "EmdhaFinancingContract")}
                  style={{
                    width: "100%",
                    height: "600px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "4px",
                  }}
                  title="Emdha Financing Contract"
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  Document not available
                </div>
              )}
            </div>
          )}

          {/* Emdha Authorization Letter */}
          {documents?.EmdhaAuthorizationLetter && (
            <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "20px" }}>
              <h3 style={{ color: "#000", fontWeight: 600, fontSize: "16px", marginBottom: "15px" }}>
                {getDocumentTitle("EmdhaAuthorizationLetter")}
              </h3>
              {getDocumentUrl(documents.EmdhaAuthorizationLetter, "EmdhaAuthorizationLetter") ? (
                <iframe
                  src={getDocumentUrl(documents.EmdhaAuthorizationLetter, "EmdhaAuthorizationLetter")}
                  style={{
                    width: "100%",
                    height: "600px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "4px",
                  }}
                  title="Emdha Authorization Letter"
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  Document not available
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Document;
