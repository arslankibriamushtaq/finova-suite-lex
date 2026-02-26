import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import enTranslations from "../../locales/en.json";
import arTranslations from "../../locales/ar.json";
import Loader from "../Loader/Loader";

function BusinessInformation() {
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  
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
  
  // Fetch business information when component mounts
  useEffect(() => {
    if (id) {
      fetchBusinessData();
    }
  }, [id]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(id, 'business');
      setBusinessData(response.data);
      toast.success(response.data.message);
      // dispatch(setCRNumber({crNumber: response.data.data.businessInfo_english.crNumber}));
    } catch (error) {
      console.error("Error fetching business data:", error);
      toast.error("Failed to fetch business information");
    } finally {
      setLoading(false);
    }
  };
  

  const mainDetails = generateFields(businessData?.data?.businessInfo_english, ['urls', 'status', 'address', 'capital', 'company', 'parties', 'location', 'activities', 'fiscalYear', 'businessType', 'cancellation']);

  // Dynamically generate URL section
  const urlSection = generateFields(businessData?.data?.businessInfo_english?.urls?.[0]);

  // Dynamically generate CR Status section
  const crStatusSection = generateFields(businessData?.data?.businessInfo_english?.status);

  // Dynamically generate Address General section
  const addressGeneralSection = generateFields(businessData?.data?.businessInfo_english?.address?.general);

  // Dynamically generate Address National section
  const addressNationalSection = generateFields(businessData?.data?.businessInfo_english?.address?.national, ['district']);

  // Dynamically generate District section
  const addressNationalDistrictSection = generateFields(businessData?.data?.businessInfo_english?.address?.national?.district);

  // Dynamically generate Capital section
  const capitalSection = generateFields(businessData?.data?.businessInfo_english?.capital, ['share']);

  // Dynamically generate Capital Share section
  const capitalShareSection = generateFields(businessData?.data?.businessInfo_english?.capital?.share);

  // Dynamically generate Company section
  const companySection = generateFields(businessData?.data?.businessInfo_english?.company);

  // Dynamically generate Party section
  const party1Section = generateFields(businessData?.data?.businessInfo_english?.parties?.[0], ['identity', 'relation', 'nationality']);

  // Dynamically generate Party Nationality section
  const partyNationalitySection = generateFields(businessData?.data?.businessInfo_english?.parties?.[0]?.nationality);

  // Dynamically generate Party Relation section
  const partyRelationSection = generateFields(businessData?.data?.businessInfo_english?.parties?.[0]?.relation);

  // Dynamically generate Party Identity section
  const partyIdentitySection = generateFields(businessData?.data?.businessInfo_english?.parties?.[0]?.identity);

  // Dynamically generate Location section
  const locationSection = generateFields(businessData?.data?.businessInfo_english?.location);

  // Dynamically generate Activities section
  const activitiesSection = generateFields(businessData?.data?.businessInfo_english?.activities, ['isic']);

  // Dynamically generate Activities ISIC section
  const activitiesIsic1Section = generateFields(businessData?.data?.businessInfo_english?.activities?.isic?.[0]);

  // Dynamically generate Fiscal Year section
  const fiscalYearSection = generateFields(businessData?.data?.businessInfo_english?.fiscalYear, ['calendarType']);

  // Dynamically generate Fiscal Year Calendar Type section
  const fiscalYearCalendarTypeSection = generateFields(businessData?.data?.businessInfo_english?.fiscalYear?.calendarType);

  // Dynamically generate Business Type section
  const businessTypeSection = generateFields(businessData?.data?.businessInfo_english?.businessType);

  // Dynamically generate Cancellation section
  const cancellationSection = generateFields(businessData?.data?.businessInfo_english?.cancellation);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* Main Section - English and Arabic */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>English</h5>
                {mainDetails.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>العربية</h5>
                {mainDetails.map((detail, index) => (
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

      {/* URL 1 Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>URL 1:</h5>
                {urlSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:1 رابط الموقع الالكتروني</h5>
                {urlSection.map((detail, index) => (
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

      {/* Status of CR Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Status of CR:</h5>
                {crStatusSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:حالة السجل التجاري</h5>
                {crStatusSection.map((detail, index) => (
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

      {/* Address General Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Address General:</h5>
                {addressGeneralSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:العنوان العام</h5>
                {addressGeneralSection.map((detail, index) => (
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

      {/* Address National Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Address National:</h5>
                {addressNationalSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:العنوان الوطني</h5>
                {addressNationalSection.map((detail, index) => (
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

      {/* Address National District Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Address National District:</h5>
                {addressNationalDistrictSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:العنوان الوطني اسم الحي للعنوان الوطني</h5>
                {addressNationalDistrictSection.map((detail, index) => (
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

      {/* Capital Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Capital:</h5>
                {capitalSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:رأس المال</h5>
                {capitalSection.map((detail, index) => (
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

      {/* Capital Share Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Capital Share:</h5>
                {capitalShareSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:رأس المال مجموع الحصص</h5>
                {capitalShareSection.map((detail, index) => (
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

      {/* Company Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Company:</h5>
                {companySection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:شركة</h5>
                {companySection.map((detail, index) => (
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

      {/* Party 1 Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Party 1:</h5>
                {party1Section.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:الشريك 1</h5>
                {party1Section.map((detail, index) => (
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

      {/* Party 1 Nationality Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Party 1 {getLabel('nationality', 'en')}:</h5>
                {partyNationalitySection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('nationality', 'ar')} الشريك 1</h5>
                {partyNationalitySection.map((detail, index) => (
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

      {/* Party 1 Relation Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Party 1 {getLabel('relation', 'en')}:</h5>
                {partyRelationSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('relation', 'ar')} الشريك 1</h5>
                {partyRelationSection.map((detail, index) => (
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

      {/* Party 1 Identity Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Party 1 {getLabel('identity', 'en')}:</h5>
                {partyIdentitySection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('identity', 'ar')} الشريك 1</h5>
                {partyIdentitySection.map((detail, index) => (
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

      {/* Location Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Location:</h5>
                {locationSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:موقع</h5>
                {locationSection.map((detail, index) => (
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

      {/* Activities Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Activities:</h5>
                {activitiesSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:الأنشطة</h5>
                {activitiesSection.map((detail, index) => (
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

      {/* Activities ISIC 1 Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Activities ISIC 1:</h5>
                {activitiesIsic1Section.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:الأنشطة تصنيف 1</h5>
                {activitiesIsic1Section.map((detail, index) => (
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

      {/* Fiscal Year Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Fiscal Year:</h5>
                {fiscalYearSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:السنة المالية</h5>
                {fiscalYearSection.map((detail, index) => (
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

      {/* Fiscal Year Calendar Type Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Fiscal Year Calendar Type:</h5>
                {fiscalYearCalendarTypeSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:السنة المالية نوع التقويم</h5>
                {fiscalYearCalendarTypeSection.map((detail, index) => (
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

      {/* Business Type Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>Business Type:</h5>
                {businessTypeSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:نوع الشركة/المؤسسة</h5>
                {businessTypeSection.map((detail, index) => (
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

      {/* Cancellation Section */}
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4" style={{ color: "#000000" }}>{getLabel('cancellation', 'en')}:</h5>
                {cancellationSection.map((detail, index) => (
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
                <h5 className="d-flex justify-content-end mb-4" style={{ color: "#000000" }}>:{getLabel('cancellation', 'ar')}</h5>
                {cancellationSection.map((detail, index) => (
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

export default BusinessInformation;