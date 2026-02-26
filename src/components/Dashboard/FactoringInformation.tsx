import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import enTranslations from "../../locales/en.json";
import arTranslations from "../../locales/ar.json";
import Loader from "../Loader/Loader";

function FactoringInformation({ packageDetails }: any) {
  const [factoringData, setFactoringData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const applicationNo = id;

  // Helper function to get translated label
  const getLabel = (key: string, lang: 'en' | 'ar' = 'en'): string => {
    const translations = lang === 'en' ? enTranslations : arTranslations;
    return translations[key as keyof typeof translations] || key;
  };

  // Helper function to format values based on field type
  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (value === true) return "Yes";
    if (value === false) return "No";
    
    // Handle certificate fields - show as clickable links
    if (key.includes('certificate') && value && typeof value === 'string' && value.startsWith('http')) {
      return "Preview Document";
    }
    
    // Format currency fields
    if (key.includes('amount') || key.includes('fee') || key.includes('profit') || key.includes('vat') || key.includes('repayment') || key.includes('receivable') || key.includes('payable')) {
      return `SR ${Number(value).toLocaleString()}`;
    }
    
    // Format percentage fields
    if (key.includes('percentage')) {
      return `${value}%`;
    }
    
    // Format dates
    if (key.includes('date') || key.includes('dob')) {
      return String(value);
    }
    
    return String(value);
  };

  // Helper function to dynamically generate fields from API object
  const generateFields = (obj: any, excludeKeys: string[] = []): Array<{label: string, value: any, arabicLabel: string}> => {
    if (!obj || typeof obj !== 'object') return [];
    
    return Object.keys(obj)
      .filter(key => !excludeKeys.includes(key) && !Array.isArray(obj[key]) && typeof obj[key] !== 'object')
      .map(key => ({
        label: getLabel(key, 'en'),
        value: formatValue(key, obj[key]),
        arabicLabel: getLabel(key, 'ar')
      }));
  };

  // Fetch factoring information when component mounts
  useEffect(() => {
    if (applicationNo) {
      fetchFactoringData();
    }
  }, [applicationNo]);

  const fetchFactoringData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(applicationNo, 'financing');
      setFactoringData(response.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error fetching factoring data:", error);
      toast.error("Failed to fetch factoring information");
    } finally {
      setLoading(false);
    }
  };

  // Dynamically generate Financing Application Info section
  const financingAppInfo = generateFields(factoringData?.data?.financing_application_info, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* Financing Application Info Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>{getLabel('financing_application_info', 'en')}:</h5>
                {financingAppInfo.map((detail, index) => (
                  <div
                    key={index}
                      className="d-flex justify-content-between align-items-center mt-2 mb-3"
                      style={{ borderBottom: "1px solid #CFCFCF" }}
                    >
                      <p
                        style={{
                          color: "#0B0B0B",
                          fontSize: "14px",
                          lineHeight: "1.5rem",
                        maxWidth: "60%",
                        wordBreak: "break-word",
                        }}
                      >
                        {detail.label}
                      </p>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#0B0B0B",
                          fontSize: "14px",
                        maxWidth: "35%",
                        textAlign: "right",
                        wordBreak: "break-word",
                        }}
                      >
                      {detail.value === "Preview Document" ? (
                        <span style={{ color: "#000000", textDecoration: "underline", cursor: "pointer" }}>
                        {detail.value}
                        </span>
                      ) : (
                        detail.value
                      )}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="col-6">
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('financing_application_info', 'ar')}</h5>
                {financingAppInfo.map((detail, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center mt-2 mb-3"
                    style={{ borderBottom: "1px solid #CFCFCF" }}
                  >
                    <p
                      style={{
                        color: "#0B0B0B",
                        fontSize: "14px",
                        fontWeight: "600",
                        lineHeight: "1.5rem",
                        maxWidth: "60%",
                        wordBreak: "break-word",
                      }}
                    >
                      {detail.value === "Preview Document" ? (
                        <span style={{ color: "#000000", textDecoration: "underline", cursor: "pointer" }}>
                          شهادة
                        </span>
                      ) : (
                        detail.value
                      )}
                    </p>
                    <span
                      style={{
                        color: "#0B0B0B",
                        fontSize: "14px",
                        maxWidth: "35%",
                        textAlign: "right",
                        wordBreak: "break-word",
                      }}
                    >
                      {detail.arabicLabel}
                    </span>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

export default FactoringInformation;