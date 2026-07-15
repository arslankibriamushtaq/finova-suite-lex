import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import enTranslations from "../../locales/en.json";
import arTranslations from "../../locales/ar.json";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";

function ManagerInformation({ packageDetails }: any) {
  const { t } = useTranslation("dashboard");
  const [managerData, setManagerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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

  // Fetch manager information when component mounts
  useEffect(() => {
    if (applicationNo) {
      fetchManagerData();
    }
  }, [applicationNo]);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(applicationNo, 'manager');
      setManagerData(response.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error fetching manager data:", error);
      toast.error(t("managerInfo.toast.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };
  // Dynamically generate Address Info section
  const addressInfoSection = generateFields(managerData?.data?.managerDetails?.english?.addressInfo, ['addressListList']);

  // Dynamically generate Address Info List section
  const addressInfoListSection = generateFields(managerData?.data?.managerDetails?.english?.addressInfo?.addressListList);

  // Dynamically generate Citizen Info section
  const clientInfoSection = generateFields(managerData?.data?.managerDetails?.english?.citizenInfo, ['subtribeName']);

  // Dynamically generate Nafath Verification section
  const nafathVerificationSection = generateFields(managerData?.data?.nafathDetails);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* Address Info Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>{getLabel('addressInfo', 'en')}:</h5>
                {addressInfoSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('addressInfo', 'ar')}</h5>
                {addressInfoSection.map((detail, index) => (
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

      {/* Address Info Address List Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>{getLabel('addressInfo', 'en')} {getLabel('addressListList', 'en')}:</h5>
                {addressInfoListSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('addressListList', 'ar')} {getLabel('addressInfo', 'ar')}</h5>
                {addressInfoListSection.map((detail, index) => (
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

      {/* Client Info Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>{getLabel('citizenInfo', 'en')}:</h5>
                {clientInfoSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('citizenInfo', 'ar')}</h5>
                {clientInfoSection.map((detail, index) => (
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

      {/* Nafath Verification Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>{getLabel('nafath_verification', 'en')}:</h5>
                {nafathVerificationSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('nafath_verification', 'ar')}</h5>
                {nafathVerificationSection.map((detail, index) => (
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
    </>
  );
}

export default ManagerInformation;