import { Card, Checkbox, Descriptions } from "antd";
import { Col, Modal, Row } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { createNafathRequest, generateUnifonicOtp, getSummary, otpVerification } from "../../redux/apis/apisCrudFactoring";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { Images } from "../Config/Images";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import Loader from "../Loader/Loader";

const Summary = () => {
    const navigate =useNavigate()
    const location = useLocation();
    const [summary, setSummary] = useState<any>([]);
    const [show, setShow] = useState(false)
    const [unifonic, setUnifonic] = useState(false)
    const [modal, setModal] = useState(true);
    const [loading, setLoading] = useState(false)
    const phone_no = useSelector((state: RootState) => state.block.businessDetails?.mobile_num)
    const nid = useSelector((state: RootState) => state.block.nid)
    const applicationNo = useSelector((state: RootState) => state.block.applicationNo)

    // Get saved form data from location state
    const bankingData = (location.state as any)?.bankingData;
    const disclaimerData = (location.state as any)?.disclaimerData;
    const complianceFormData = (location.state as any)?.complianceFormData;
    const factoringFormData = (location.state as any)?.factoringFormData;
    const businessFormData = (location.state as any)?.businessFormData;
    const authorizedFormData = (location.state as any)?.authorizedFormData;
    const [otp, setOtp] = useState<string>("".padEnd(4, ""));
    const inputsRef = useRef<HTMLInputElement[]>([]);
    const code = (otp || "").replace(/\D/g, "");
    const isComplete = /^\d{4}$/.test(code);
      
    type Field = { label: string; value: any };
    type Card = {
    businessInfo: Field[];
    financialDetails: Field[];  
    banking_info: Field[];                    
    };

    const cards: Card[] = [
      {
          businessInfo: [
          { label: "Cr Name", value: summary?.businessInfo_english?.crName },
          { label: "Cr Number", value: summary?.businessInfo_english?.crNumber },
          { label: "Name", value: summary?.businessInfo_english?.parties[0]?.name  },
          { label: "Relation Name", value: summary?.businessInfo_english?.parties[0]?.relationName },
          { label: "Nationality Name", value: summary?.businessInfo_english?.Nationality },
          { label: "Business Type Name", value: summary?.businessInfo_english?.businessTypeName },
          { label: "Calender Type Name", value: summary?.businessInfo_english?.calendarTypeName },
          { label: "Status of CR Name", value: summary?.businessInfo_english?.statusOfCrName },
          { label: "General Address", value: summary?.businessInfo_english?.generalAddress },
          { label: "District Name", value: summary?.businessInfo_english?.districtName },
          { label: "Url Name", value: summary?.businessInfo_english?.urlsName },
          { label: "Location Name", value: summary?.businessInfo_english?.locationName },
          ],
          financialDetails: [
          { label: "Annual Revenue", value: summary?.financial_details?.annual_revenue },
          { label: "Average Invoice Value", value: summary?.financial_details?.average_invoice_value },
          { label: "Outstanding Invoices Value", value: summary?.financial_details?.outstanding_invoices_value },
          ],
          banking_info: [
          { label: "IBAN", value: summary?.banking_info?.iban },
          ],
      },  
    ];

    const applicationSummary = async () =>{
      setLoading(true)
      const body = {
        application_no: applicationNo,
        application_step: "10"
      }
      try{
        const response = await getSummary(body)
        if(response?.data?.success){
          const data = response?.data?.data;
          setSummary(data)
          setLoading(false)
          setShow(true)
        }
        else{
          setLoading(false)
          navigate("/applyloan/bankingInfo", {
            state: {
              bankingData: bankingData,
              disclaimerData: disclaimerData,
              complianceFormData: complianceFormData,
              factoringFormData: factoringFormData,
              businessFormData: businessFormData,
              authorizedFormData: authorizedFormData
            }
          })
          return response?.data?.message
        }
      }catch (err: any) {
        setLoading(false)
        navigate("/applyloan/bankingInfo", {
          state: {
            bankingData: bankingData,
            disclaimerData: disclaimerData,
            complianceFormData: complianceFormData,
            factoringFormData: factoringFormData,
            businessFormData: businessFormData,
            authorizedFormData: authorizedFormData
          }
        })
        toast.error(err?.response?.data?.message || "API call failed.");
      }
    }

   

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        idx: number
      ) => {
        if (isNaN(Number(e.target.value))) return;
        const next = otp.split("");
        next[idx] = e.target.value;
        const newVal = next.join("");
        setOtp(newVal);
        // auto-focus next input
        if (e.target.value && e.target.nextElementSibling) {
          (e.target.nextElementSibling as HTMLElement).focus();
        }
    };

  const handleVerifyOtp = async () => {

    if (!isComplete) {
      toast.error("Please enter the 4-digit code");
      return;
    }
    const body: any = {
      otp_api: "unifonic",
      //application_step: 10,
      otp: otp || "",
      application_no: applicationNo,
    };

    try {
      //setLoading(true);
      await toast.promise(otpVerification(body), {
        loading: "Verifying OTP...",
        success: (res: any) => {
          if (res?.data?.success) {
            setModal(false)
            return res?.data?.message;
          }
          throw new Error(res?.data?.message || "Failed to verify");
        },
        error: (err) => err?.message || "Something went wrong!",
      });
    } finally {
      //setLoading(false);
    }
  };
    const handleSubmit = async () =>{
    try {
      const body = {
        nid: nid,
        application_no: applicationNo,
        application_step: "11",
      };
      await toast.promise(
        createNafathRequest(body), // The promise to track
        {
          loading: "Creating Nafath Request...", // Loading state message
          success: (res) => {
            if (res?.data?.success) {
              navigate("/applyloan/nafathVerification", {
                state: {
                  bankingData: bankingData,
                  disclaimerData: disclaimerData,
                  complianceFormData: complianceFormData,
                  factoringFormData: factoringFormData,
                  businessFormData: businessFormData,
                  authorizedFormData: authorizedFormData
                }
              })
              return res?.data?.message;
            } else if (res?.data?.errors) {
              throw new Error(res.data.errors[0]); // Force error handling
            }
          },
          error: (err) => {
            console.error("Error occurred:", err);
            return err?.message || "Something went wrong!";
          },
        }
      );
    } catch (error: any) {
      console.error("Error during submission:", error);
    }
  }
 const generateUnifonic = async () =>{
      const body = {
        application_no: applicationNo,
        phone_number: phone_no 
      }
      try{
        const response = await generateUnifonicOtp(body)
        if(response?.data?.success){
          setModal(true);
        }
        else{
          return response?.data?.message
        }
      }catch (err: any) {
        toast.error(err?.response?.data?.message || "API call failed.");
      }
    }
  useEffect(() => {
    if (unifonic) {
      generateUnifonic();
      //setModal(true);
    } else {
      setModal(false);
    }
     applicationSummary();
  }, [unifonic]);

return (
    <>
    {loading && <Loader/>}
    {show ? 
    <div>  
     <div className="row p-4">
        {cards.map((card, i) => (
            <div className="col-12 p-4" key={i}>
                <div className= "card-box">
                  <label className="p-2" style={{fontSize: "20px"}}>Business Info</label>
                    <div className="card-fields p-2">
                        {card?.businessInfo?.map((f, j) => (
                            <div className="field-row" key={j}>
                            <span className="field-label">{f.label}</span>
                            <span className="field-value">{f.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className= "card-box mt-4">
                  <label className="p-2" style={{fontSize: "20px"}}>Financial Details</label>
                    <div className="card-fields p-2">
                        {card?.financialDetails?.map((f, j) => (
                            <div className="field-row" key={j}>
                            <span className="field-label">{f.label}</span>
                            <span className="field-value">SAR {f.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className= "card-box mt-4">
                  <label className="p-2" style={{fontSize: "20px"}}>Banking Info</label>
                    <div className="card-fields p-2">
                        {card?.banking_info?.map((f, j) => (
                            <div className="field-row" key={j}>
                            <span className="field-label">{f.label}</span>
                            <span className="field-value">{f.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ))}
    </div> 
    <Row className="mt-4 mb-4 p-4">
        <Col md={6}>
            <label className="mb-2 required-asterisk" style={{fontSize:"14px", fontWeight: 600 }}>
                Upload Contract
            </label>
            <div className = "file-input-wrapper">
                <input 
                    type="file"
                    className="custom-file-input"
                />
            </div>
        </Col>
    </Row>
    <Row className="mt-4 mb-4 px-4">
        <Col md={8}>
            <Checkbox
                  checked={unifonic}
                  onChange={(e) =>
                    setUnifonic(e?.target?.checked)
                  }
            >   
              By Entering the Correct OTP, I Accept the above initial E-Contract Terms and Conditions, 
              I will sign and upload the physical copy of the contract through customer portal.
            </Checkbox> 
        </Col>
      </Row>
      
      {unifonic && <Modal
        show={modal}
        centered
        onHide={() => {
          setUnifonic(false);
          setModal(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title"></Modal.Title>
          {/* <div
            className="cursor-pointer"
            onClick={() => {
              setOtpDialog(false);
            }}
          >
            <img src={Images.closeBtn} alt="" />
          </div> */}
        </Modal.Header>
        <Modal.Body className="p-2">
          <div className="d-flex justify-content-center">
            <img src={Images.otp} alt="" width={88} height={88} />
          </div>
          <div
            style={{ fontSize: "20px", fontWeight: "500", lineHeight: "28px" }}
            className="text-center pt-3"
          >
            <div>
              Please enter the verification code from your authentication
              device.
            </div>
          </div>
          <div
            style={{ fontSize: "16px", fontWeight: "600", lineHeight: "22px" }}
            className="text-center pt-3"
          >
            <div>Verification Code</div>
          </div>
          <div className="otp-inputs">
            {Array(4)
              .fill("")
              .map((_, idx) => (
                <input
                  ref={(el) => (inputsRef.current[idx] = el!)}
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={otp[idx] || ""}
                  onChange={(e) => handleChange(e, idx)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
          </div>
          <div className="d-flex justify-content-center">
            {" "}
            <button
              className="w-50 mt-4"
              type="submit"
              style={{
                backgroundColor: "rgba(226, 36, 46, 1)",
                borderRadius: "16px",
                border: "1px solid rgba(226, 36, 46, 1)",
                padding: "10px 10px 10px 10px",
                color: "#fff",
              }}
              onClick={() => {
                handleVerifyOtp();
              }}
            >
              Verify
            </button>
          </div>
        </Modal.Body>
      </Modal>}
      <div className = "py-4" style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}>
      <button className = "step-buttons" style={{background: "#ccc"}} onClick={()=>{navigate("/applyloan/bankingInfo", {
        state: {
          bankingData: bankingData,
          disclaimerData: disclaimerData,
          complianceFormData: complianceFormData,
          factoringFormData: factoringFormData,
          businessFormData: businessFormData,
          authorizedFormData: authorizedFormData
        }
      })}}>Previous</button>
      <button className = "step-buttons" onClick={()=>{handleSubmit()}}>
        Next Step
      </button>
    </div>
    </div> : 
    <>
      <div className= "d-flex bg-white p-4 mt-2" 
        style={{
          justifyContent: "center",
          borderRadius: "6px", 
          marginBottom: 50,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
          border: "1px solid #cfe3ee",
          }}>
          No Summary Available!
      </div>
      <button className = "step-buttons" style={{background: "#ccc"}} onClick={()=>{navigate("/applyloan/bankingInfo", {
        state: {
          bankingData: bankingData,
          disclaimerData: disclaimerData,
          complianceFormData: complianceFormData,
          factoringFormData: factoringFormData,
          businessFormData: businessFormData,
          authorizedFormData: authorizedFormData
        }
      })}}>Previous</button>
      </>
    }
    </>
  );
}

export default Summary;