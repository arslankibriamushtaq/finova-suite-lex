import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { applicationApprovalChecks, getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import enTranslations from "../../locales/en.json";
import arTranslations from "../../locales/ar.json";
import Loader from "../Loader/Loader";

function FactoringApproval({ packageDetails }: any) {
  const [factoringData, setFactoringData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [factoringHistory, setFactoringHistory] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const applicationNo = id;

  // Helper function to get translated label
  const getLabel = (key: string, lang: 'en' | 'ar' = 'en'): string => {
    const translations = lang === 'en' ? enTranslations : arTranslations;
    return translations[key as keyof typeof translations] || key;
  };

  // Helper function to dynamically generate fields from API object
  const generateFields = (obj: any, excludeKeys: string[] = []): Array<{label: string, value: any, arabicLabel: string}> => {
    if (!obj || typeof obj !== 'object') return [];
    
    return Object.keys(obj)
      .filter(key => !excludeKeys.includes(key) && !Array.isArray(obj[key]) && typeof obj[key] !== 'object')
      .map(key => ({
        label: getLabel(key, 'en'),
        value: obj[key] === true ? "Yes" : obj[key] === false ? "No" : String(obj[key] || "NA"),
        arabicLabel: getLabel(key, 'ar')
      }));
  };

  useEffect(() => {
    if (id) {
      fetchFactoringData();
      //fetchFactoringHistory();
    }
  }, [id]);

  const fetchFactoringData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(id, 'financing');
      setFactoringData(response.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error fetching factoring data:", error);
      toast.error("Failed to fetch factoring information");
    } finally {
      setLoading(false);
    }
  };

  /* const fetchFactoringHistory = async () => {
    try {
      const response = await getApplicationDetailsByType(id, 'approval_checks');
      
      if (response?.data?.data?.factoring_amount_history) {
        setFactoringHistory(response.data.data.factoring_amount_history);
      } else {
        setFactoringHistory(null);
      }
    } catch (error) {
      console.error("Error fetching factoring history:", error);
    }
  }; */

  // Check if we should show the approval form
  const shouldShowApprovalForm = () => {
    if (!factoringHistory) return true;
    const status = factoringHistory.application_status?.toLowerCase();
    return status === 'pending' || status === 'factoring-pending';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Dynamically generate Financing Amount Info section
  const factoringInfo = generateFields(factoringData?.data?.financing_amount_info);

  if (loading) {
    return <Loader />;
  }

  const handleApproveFactoring = async () => {
    if (!id) {
      toast.error("Application ID not found");
      return;
    }

    try {
      setSubmitting(true);
      
      const body = {
        types: "loan_amount_approval",
        user_id: 1,
        comment: "test",
        loan_application_number: String(id),
      };

      const response = await applicationApprovalChecks(body);

      if (response?.data?.success) {
        toast.success(response?.data?.message || "Factoring amount approved successfully");
        //await fetchFactoringHistory(); // Refresh data to show updated status
      } else {
        toast.error(response?.data?.message || "Failed to approve factoring amount");
      }
    } catch (error: any) {
      console.error("Error approving factoring:", error);
      toast.error(
        error?.response?.data?.message || 
        "Failed to approve factoring amount"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectFactoring = async () => {
    if (!id) {
      toast.error("Application ID not found");
      return;
    }

    try {
      setSubmitting(true);
      
      const body = {
        types: "loan_amount_rejection",
        user_id: 1,
        comment: "test",
        loan_application_number: String(id),
      };

      const response = await applicationApprovalChecks(body);

      if (response?.data?.success) {
        toast.success(response?.data?.message || "Factoring amount rejected");
        //await fetchFactoringHistory(); // Refresh data to show updated status
      } else {
        toast.error(response?.data?.message || "Failed to reject factoring amount");
      }
    } catch (error: any) {
      console.error("Error rejecting factoring:", error);
      toast.error(
        error?.response?.data?.message || 
        "Failed to reject factoring amount"
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <>
      {/* Factoring Info Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>{getLabel('financing_amount_info', 'en')}:</h5>
                {factoringInfo.map((detail, index) => (
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
                      }}
                    >
                      {detail.label}
                    </p>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "#0B0B0B",
                        fontSize: "14px",
                      }}
                    >
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="col-6">
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('financing_amount_info', 'ar')}</h5>
                {factoringInfo.map((detail, index) => (
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
                      }}
                    >
                      {detail.value}
                    </p>
                    <span
                      style={{
                        color: "#0B0B0B",
                        fontSize: "14px",
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

      {/* Conditional Section: Show either approval form or history */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-12">
                {shouldShowApprovalForm() ? (
                  <>
                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end gap-3">
                    <button
                        className="btn px-4 py-2"
                        onClick={handleApproveFactoring}
                        disabled={submitting}
                        style={{
                          backgroundColor: "#198754",
                          borderColor: "#198754",
                          color: "white",
                          fontWeight: "600",
                          borderRadius: "4px",
                          minWidth: "200px",
                        }}
                      >
                        {submitting ? (
                          <>
                            <div style={{ display: "inline-block", transform: "scale(0.3)", transformOrigin: "center", marginRight: "8px" }}>
                              <Loader />
                            </div>
                            Processing...
                          </>
                        ) : (
                          "Approve Factoring Amount"
                        )}
                      </button>
                      <button
                        className="btn btn-danger px-4 py-2"
                        onClick={handleRejectFactoring}
                        disabled={submitting}
                        style={{
                          backgroundColor: "#000000",
                          borderColor: "#000000",
                          color: "white",
                          fontWeight: "600",
                          borderRadius: "4px",
                          minWidth: "200px",
                        }}
                      >
                        {submitting ? (
                          <>
                            <div style={{ display: "inline-block", transform: "scale(0.3)", transformOrigin: "center", marginRight: "8px" }}>
                              <Loader />
                            </div>
                            Processing...
                          </>
                        ) : (
                          "Reject Factoring Amount"
                        )}
                      </button>
                      
                    </div>
                  </>
                ) : (
                  <>
                    {/* Display Factoring Amount History Information */}
                    <div
                      className="factoring-history-info p-4"
                      style={{ 
                        background: "white", 
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}
                    >
                      {/* Row 1: Processor and Processed Date */}
                      <div className="row mb-3" style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "15px" }}>
                        <div className="col-md-6 d-flex">
                          <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", minWidth: "150px" }}>
                            Processor
                          </div>
                          <div style={{ fontSize: "14px", color: "#000", fontWeight: "600", flex: 1, textAlign: "right" }}>
                            {factoringHistory?.processor || 'N/A'}
                          </div>
                        </div>

                        <div className="col-md-6 d-flex">
                          <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", minWidth: "150px" }}>
                            Processed Date
                          </div>
                          <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", flex: 1, textAlign: "right" }}>
                            {formatDate(factoringHistory?.processed_date)}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Application Status and Comment */}
                      <div className="row">
                        <div className="col-md-6 d-flex align-items-center">
                          <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", minWidth: "150px" }}>
                            Application Status
                          </div>
                          <div style={{ flex: 1, textAlign: "right" }}>
                            <span 
                              style={{ 
                                fontSize: "14px",
                                fontWeight: "600",
                                color: factoringHistory?.application_status?.toLowerCase().includes('approved') 
                                  ? '#28a745' 
                                  : '#000000'
                              }}
                            >
                              {factoringHistory?.application_status || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="col-md-6 d-flex">
                          <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", minWidth: "150px" }}>
                            Comment
                          </div>
                          <div style={{ fontSize: "14px", color: "#000", fontWeight: "400", flex: 1, textAlign: "right" }}>
                            {factoringHistory?.app_comment || 'No comment provided'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FactoringApproval;