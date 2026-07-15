import { useNavigate, useLocation } from "react-router-dom";
import { Images } from "../Config/Images";
import toast from "react-hot-toast";
import { nafathRequestStatus, submitApplication } from "../../redux/apis/apisCrudFactoring";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { useTranslation } from "react-i18next";

const NafathVerification = () => {
  const { t } = useTranslation("landingUser");
  const navigate = useNavigate();
  const location = useLocation();
  const nid = useSelector((state: RootState) => state.block.nid)
  const applicationNo = useSelector((state: RootState) => state.block.applicationNo)

  // Get saved form data from location state
  const bankingData = (location.state as any)?.bankingData;
  const disclaimerData = (location.state as any)?.disclaimerData;
  const complianceFormData = (location.state as any)?.complianceFormData;
  const factoringFormData = (location.state as any)?.factoringFormData;
  const businessFormData = (location.state as any)?.businessFormData;
  const authorizedFormData = (location.state as any)?.authorizedFormData;
  
  const handleSubmit = async () => {
   const body = {
        application_no: applicationNo,
        nid: nid,
      };

 try {
  //setLoading(true);

  await toast.promise(
    (async () => {
      const res = await nafathRequestStatus(body);
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || t("nafath.toast.verifyFailed"));
      }
      const response = await submitApplication({
        application_no: applicationNo,
        application_step: "12",
      });
      if(response)
      {
        navigate('/applyloan/finish', {
          state: {
            bankingData: bankingData,
            disclaimerData: disclaimerData,
            complianceFormData: complianceFormData,
            factoringFormData: factoringFormData,
            businessFormData: businessFormData,
            authorizedFormData: authorizedFormData
          }
        })
        return res?.data?.message
      } 
   
      return res;
    })(),
    {
      loading: t("otpCommon.verifyingOtp"),
      success: (res: any) => res?.data?.message || t("nafath.toast.success"),
      error: (err: any) => err?.message || t("common.somethingWentWrong"),
    }
  );
} finally {
  //setLoading(false);
}

  };

  return (
    <>
    <div className="d-flex justify-content-center p-4 mt-4">
      <div className="verification-card">
        <h2>{t("nafath.title")}</h2>
        <div className="d-flex justify-content-center">
            <img src={Images.otp} alt="" width={88} height={88} />
        </div>
        <div className="verification-circle">11</div>
        <div className="d-flex justify-content-center">
            <p className="mt-2">{t("nafath.desc")}</p>
        </div>
      </div>
    </div>
    <div className = "py-4" style={{ display: "flex", justifyContent: "flex-start", gap: 8}}>
        <button className = "step-buttons" style={{background: "#ccc"}} onClick={()=>{navigate("/applyloan/summary", {
          state: {
            bankingData: bankingData,
            disclaimerData: disclaimerData,
            complianceFormData: complianceFormData,
            factoringFormData: factoringFormData,
            businessFormData: businessFormData,
            authorizedFormData: authorizedFormData
          }
        })}}>{t("common:previous")}</button>
        <button className = "step-buttons" onClick={()=>{handleSubmit();}}>
          {t("action.submitApplication")}
        </button>
    </div>
    </>
  );
};

export default NafathVerification;
