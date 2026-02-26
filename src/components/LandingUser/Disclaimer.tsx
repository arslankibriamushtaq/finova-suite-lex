import {
  Form,
} from "antd";
import { Row, Col} from "react-bootstrap"
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { disclaimerTextStep } from "../../redux/apis/apisCrudFactoring";
import toast from "react-hot-toast";


const Disclaimer = () => {
  const navigate =useNavigate()
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const disclaimerText =  useSelector((state: RootState) => state.block.productDetails?.product?.disclaimer_text?.en);
  const applicationNo = useSelector((state: RootState) => state.block.applicationNo);

  // Get saved form data from location state
  const savedDisclaimerData = (location.state as any)?.disclaimerData;
  const complianceFormData = (location.state as any)?.complianceFormData;
  const factoringFormData = (location.state as any)?.factoringFormData;
  const businessFormData = (location.state as any)?.businessFormData;
  const authorizedFormData = (location.state as any)?.authorizedFormData;
  
  const [answers, setAnswers] = useState<{ [key: string]: string }>(savedDisclaimerData || {});

  const handleSubmit = async () => {
    const body: any = {
      application_step: "8",
      application_no: applicationNo,
    };

    try {
      setLoading(true);
      await toast.promise(disclaimerTextStep(body), {
        loading: "Confirmation...",
        success: (res: any) => {
          if (res?.data?.success) {
            navigate("/applyloan/bankingInfo", {
              state: {
                disclaimerData: answers,
                complianceFormData: complianceFormData,
                factoringFormData: factoringFormData,
                businessFormData: businessFormData,
                authorizedFormData: authorizedFormData
              }
            });
            return res?.data?.message;
          }
          throw new Error(res?.data?.message || "Failed to Authorize");
        },
        error: (err) => err?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const Confirmation = {
    question:[
      { key: "submission", label: "Are you sure you want to submit this request?" }
    ]
  }
    // Handle change
    const handleChange = (key: string, value: string) => {
      setAnswers((prev: any) => ({ ...prev, [key]: value }));
    };
  
    // Reusable question row
    const renderQuestion = (q: { key: string; label: string }) => (
      <div className="d-flex mb-3 mt-2" key={q.key}>
        {/* Label */}
        <div className="col-8 d-flex align-items-center mb-2">
          <span style={{ fontSize: "17px", fontWeight: "400", lineHeight:"20px" }}>
            {q.label}
          </span>
        </div>
  
        {/* Radio buttons */}
        <div className="d-flex justify-content-start col-4 align-items-center mb-2">
          <div className="d-flex me-3">
            <input
              type="radio"
              name={q.key}
              value="yes"
              checked={answers[q.key] === "yes"}
              onChange={() => handleChange(q.key, "yes")}
            />
            <span className="ms-1" style={{fontSize: "17px"}}>Yes</span>
          </div>
  
          <div className="d-flex">
            <input
              type="radio"
              name={q.key}
              value="no"
              checked={answers[q.key] === "no"}
              onChange={() => handleChange(q.key, "no")}
            />
            <span className="ms-1" style={{fontSize: "17px"}}>No</span>
          </div>
        </div>
      </div>
    );
  
  return (
    <>
    <label className="mt-4 mb-3" style={{fontWeight: 600, fontSize: "20px"}}>
        Disclaimer for Partners:
    </label>
    <div 
      className="prose" 
      style={{lineHeight: 2}}  
      dangerouslySetInnerHTML={{
              __html: disclaimerText
      }}
    />
    <Form>
      <Row className="mt-4 mb-2">
              <Col md={6}>{Confirmation.question.map(renderQuestion)}</Col>
      </Row>
    </Form>
    <div className = "py-4" style={{ display: "flex", justifyContent: "flex-start", gap: 8}}>
        <button className = "step-buttons" style={{background: "#ccc"}} onClick={()=>{navigate("/applyloan/ComplianceInfo", {
          state: {
            disclaimerData: answers,
            complianceFormData: complianceFormData,
            factoringFormData: factoringFormData,
            businessFormData: businessFormData,
            authorizedFormData: authorizedFormData
          }
        })}}>Previous</button>
        <button className = "step-buttons" disabled={answers["submission"] !== "yes"} onClick={()=>{handleSubmit()}}>
          Next Step
        </button>
      </div>
    </>
  );
};

export default Disclaimer;
