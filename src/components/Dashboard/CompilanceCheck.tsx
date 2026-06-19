import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType, applicationApprovalChecks } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";
import toast from "react-hot-toast";

function CompilanceCheck({ setActiveTab, fullDetail }: any) {
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [complianceHistory, setComplianceHistory] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (fullDetail?.complianceCheck) {
      const cc = fullDetail.complianceCheck;
      setAnswers(cc.complianceQuestionHistory || []);
      setComplianceHistory(cc.kycInfo || null);
      return;
    }
  }, [fullDetail]);

  useEffect(() => {
    if(id && fullDetail === undefined){
    fetchComplianceData();
    }
  }, [id, fullDetail]);

  const fetchComplianceData = async () => {
    if (!id) {
        return;
      }
      
      setLoading(true);
      try {
        const response = await getApplicationDetailsByType(id, "compliance");
        
        // Handle new response structure with answers array
        if (response?.data?.success && response?.data?.data) {
          const answersData = response.data.data.answers || [];
          setAnswers(answersData);
          setComplianceHistory(response.data.data.compliance_history);
        } else {
          toast.error("Failed to load compliance data");
        }
      } catch (error: any) {
        console.error("API Error:", error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to load compliance data");
      } finally {
        setLoading(false);
      }
    };
    

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    
    if (!id) {
      toast.error("Missing application number");
      return;
    }

    setRejecting(true);
    try {
      const body = {
        types: "compliance_rejection",
        user_id: 1,
        comment: comment,
        loan_application_number: String(id),
      };
      
      const response = await applicationApprovalChecks(body);
      
      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Compliance rejected successfully!");
        setComment("");
        await fetchComplianceData();
      } else {
        toast.error(response?.data?.message || "Failed to reject compliance");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to reject compliance");
    } finally {
      setRejecting(false);
    }
  };

  const handleApprove = async () => {
    /* if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    } */
    
    if (!id) {
      toast.error("Missing application number");
      return;
    }

    setApproving(true);
    try {
      const body = {
        types: "compliance_approval",
        user_id: 1,
        comment: comment,
        loan_application_number: String(id),
      };
      
      const response = await applicationApprovalChecks(body);
      
      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Compliance approved successfully!");
        setComment("");
        await fetchComplianceData();
      } else {
        toast.error(response?.data?.message || "Failed to approve compliance");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to approve compliance");
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <Loader />;

  // Parse question JSON and filter compliance questions
  const parseQuestion = (questionString: string) => {
    try {
      return JSON.parse(questionString);
    } catch {
      return { en: questionString, ar: questionString };
    }
  };

  // Filter compliance answers (category === "compliance")
  // const complianceAnswers = answers.filter((answer) => answer.data?.category === "compliance");

  // Helper function to determine if answer is "Yes"
  const isYesAnswer = (answer: string | boolean) => {
    if (typeof answer === "boolean") {
      return answer === true;
    }
    const answerLower = String(answer).toLowerCase();
    return answerLower === "yes" || answerLower === "نعم" || answerLower === "true";
  };

  // Helper function to format answer display
  const formatAnswer = (answer: string | boolean, isYes: boolean) => {
    if (isYes) {
      return "Yes";
    }
    const answerLower = String(answer).toLowerCase();
    if (answerLower === "no" || answerLower === "لا" || answerLower === "false") {
      return "No";
    }
    return String(answer) || "-";
  };

  const formatAnswerArabic = (answer: string | boolean, isYes: boolean) => {
    if (isYes) {
      return "نعم";
    }
    const answerLower = String(answer).toLowerCase();
    if (answerLower === "no" || answerLower === "لا" || answerLower === "false") {
      return "لا";
    }
    return String(answer) || "-";
  };

  // Group answers by category
  const groupAnswersByCategory = () => {
    const grouped: { [key: string]: any[] } = {};
    answers.forEach((answer) => {
      const category = answer.category || answer.data?.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(answer);
    });
    return grouped;
  };

  const groupedAnswers = groupAnswersByCategory();
  const complianceHistoryEntries = complianceHistory && typeof complianceHistory === "object"
    ? Object.entries(complianceHistory)
    : [];
  const hasComplianceHistory = complianceHistoryEntries.length > 0;

  // Helper function to format category name (capitalize first letter)
  const formatCategoryName = (category: string) => {
    if (!category) return "Other";
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  return (
    <>
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="p-4" style={{ background: "var(--surface-card)", borderRadius: "2px", fontFamily: 'inherit', fontSize: '14px' }}>
              {hasComplianceHistory && (
                <div style={{ marginBottom: "24px", padding: "18px", borderRadius: "2px", background: "var(--surface-card-alt)", border: "1px solid var(--surface-border)" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: 600, color: "var(--foreground)", marginBottom: "12px" }}>
                    KYC / Compliance Summary
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                    {complianceHistoryEntries.map(([key, value]) => (
                      <div key={String(key)} style={{ padding: "12px", background: "var(--surface-card)", borderRadius: "2px", border: "1px solid var(--surface-border)" }}>
                        <div style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "6px" }}>{String(key)}</div>
                        <div style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600 }}>
                          {typeof value === "object" ? JSON.stringify(value) : String(value ?? "-")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Compliance Questions in Two Columns */}
              {answers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--foreground)" }}>
                  No response found
                </div>
              ) : (
                <div className="row">
                  {/* Left Column - English */}
                  <div className="col-6">
                    {Object.keys(groupedAnswers).map((category) => (
                      <div key={category} style={{ marginBottom: "30px" }}>
                        {/* Category Heading */}
                        <h5 
                          style={{ 
                            color: "var(--foreground)", 
                            fontSize: "16px", 
                            fontWeight: "600",
                            marginBottom: "15px",
                            paddingBottom: "8px",
                            borderBottom: "2px solid #10b981"
                          }}
                        >
                          {formatCategoryName(category)}
                        </h5>
                        
                        {/* Questions in this category */}
                        {groupedAnswers[category].map((answer, index) => {
                          const questionObj = parseQuestion(answer.question);
                          const isYes = isYesAnswer(answer.answer);
                          const displayValue = formatAnswer(answer.answer, isYes);
                          
                          return (
                            <div 
                              key={answer.id || index}
                              className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                              style={{ borderBottom: "1px solid var(--surface-border)" }}
                            >
                              <p style={{ color: "var(--foreground)", fontSize: "14px", margin: 0 }}>
                                {questionObj.en || questionObj.question || "-"}
                              </p>
                              <span 
                                style={{ 
                                  fontWeight: "600", 
                                  color: isYes ? "#10b981" : "var(--foreground)",
                                  fontSize: "14px",
                                  minWidth: "40px",
                                  textAlign: "right"
                                }}
                              >
                                {displayValue}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Right Column - Arabic */}
                  <div className="col-6" style={{ direction: "rtl" }}>
                    {Object.keys(groupedAnswers).map((category) => (
                      <div key={category} style={{ marginBottom: "30px" }}>
                        {/* Category Heading */}
                        <h5 
                          style={{ 
                            color: "var(--foreground)", 
                            fontSize: "16px", 
                            fontWeight: "600",
                            marginBottom: "15px",
                            paddingBottom: "8px",
                            borderBottom: "2px solid #10b981"
                          }}
                        >
                          {formatCategoryName(category)}
                        </h5>
                        
                        {/* Questions in this category */}
                        {groupedAnswers[category].map((answer, index) => {
                          const questionObj = parseQuestion(answer.question);
                          const isYes = isYesAnswer(answer.answer);
                          const displayValue = formatAnswerArabic(answer.answer, isYes);
                          
                          return (
                            <div 
                              key={answer.id || index}
                              className="d-flex justify-content-between align-items-center mt-2 mb-3 pb-2"
                              style={{ borderBottom: "1px solid var(--surface-border)" }}
                            >
                              <p style={{ color: "var(--foreground)", fontSize: "14px", margin: 0 }}>
                                {questionObj.ar || questionObj.question || "-"}
                              </p>
                              <span 
                                style={{ 
                                  fontWeight: "600", 
                                  color: isYes ? "#10b981" : "var(--foreground)",
                                  fontSize: "14px",
                                  minWidth: "40px",
                                  textAlign: "left"
                                }}
                              >
                                {displayValue}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompilanceCheck;
