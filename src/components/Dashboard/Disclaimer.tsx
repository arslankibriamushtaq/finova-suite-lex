import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

function Disclaimer({ setSelectedTab }: any) {
  const [disclaimerData, setDisclaimerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { id } = useParams();

  

  // Fetch disclaimer information when component mounts
  useEffect(() => {
    if (id) {
      fetchDisclaimerData();
    }
  }, [id]);

  const fetchDisclaimerData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(id, 'disclaimer');
      setDisclaimerData(response.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error fetching disclaimer data:", error);
      toast.error("Failed to fetch disclaimer information");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="col-12">
        <div className="" style={{ borderRadius: "6px", padding: "20px", margin: "20px 0", backgroundColor: "white" }}>
          {/* Header with Toggle */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <span className="me-3">I agreed and accepted the following disclaimer:</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="form-check form-check-inline">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="disclaimerAgreement" 
                  id="disclaimerYes" 
                  checked={agreed}
                  onChange={() => setAgreed(true)}
                  style={{ accentColor: "#000000" }}
                />
                <label className="form-check-label ms-1" htmlFor="disclaimerYes">
                  Yes
                </label>
              </div>
              <div className="form-check form-check-inline ms-3">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="disclaimerAgreement" 
                  id="disclaimerNo" 
                  checked={!agreed}
                  onChange={() => setAgreed(false)}
                  style={{ accentColor: "#000000" }}
                />
                <label className="form-check-label ms-1" htmlFor="disclaimerNo">
                  No
                </label>
              </div>
            </div>
          </div>

          {/* Disclaimer Content - Two Columns */}
          <div className="row">
            {/* English Column */}
            <div className="col-md-6">
              <h6 className="mb-3" style={{ color: "#000000" }}>English</h6>
              <p className="text-dark" style={{ lineHeight: "1.6" }}>
                {disclaimerData?.data?.disclaimer?.english || 
                  "This Privacy Notice is not intended to, nor does it, create any contractual rights whatsoever or any other legal rights, nor does it create any obligations on us in respect of any other party or on behalf of any party. When you log in to third parties' websites, you will not be subject or under this Privacy Notice. Moreover, we are not responsible for their websites' content, and we do not represent third parties. Therefore, we recommend you review the privacy and security policy of each link you log in to."
                }
              </p>
            </div>

            {/* Arabic Column */}
            <div className="col-md-6">
              <h6 dir="rtl" className="mb-3" style={{ color: "#000000" }}>العربية</h6>
              <p className="text-dark" style={{ lineHeight: "1.6", direction: "rtl", textAlign: "right" }}>
                {disclaimerData?.data?.disclaimer?.arabic || 
                  "لا يهدف إشعار الخصوصية هذا إلى إنشاء أي حقوق تعاقدية من أي نوع أو أي حقوق قانونية أخرى، أو ينشئ أي التزامات علينا فيما يتعلق بأي طرف آخر أو نيابة عن أي طرف. عندما تقوم بتسجيل الدخول إلى مواقع الانترنت الخاصة بأطراف ثالثة، لن تسري إشعار الخصوصية هذا، إضافة إلى ذلك، نحن لسنا مسؤولين عن محتوى مواقع الويب الخاصة بهم، ولا نمثل أي طرف ثالث. لذلك، نوصيك بمراجعة سياسة الخصوصية والأمان لكل رابط تقوم بتسجيل الدخول إليه."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Disclaimer;
