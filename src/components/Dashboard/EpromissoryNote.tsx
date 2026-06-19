import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";

const EpromissoryNote = ({setActiveTab}: any) => {
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
        toast.success("PDF loaded successfully");
      } else {
        toast.error("Invalid PDF URL");
      }
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to fetch PDF");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Loading PDF...</p>
        </div>
      ) : pdfUrl ? (
        <div style={{ height: "85vh", marginTop: "20px" }}>
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: "none", borderRadius: "6px" }}
            title="ePromissory Note PDF"
            onError={() => {
              console.error("Failed to load PDF in iframe");
              toast.error("Failed to load PDF");
            }}
          />
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#666" }}>
              If the PDF doesn't display properly, try opening it in a new tab:{" "}
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "#000000", textDecoration: "underline" }}
              >
                Open PDF in new tab
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>No PDF available</p>
        </div>
      )}
    </div>
  );
};

export default EpromissoryNote;
