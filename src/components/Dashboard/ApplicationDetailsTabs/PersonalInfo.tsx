import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../../Loader/Loader";

interface FieldConfig {
  key: string;
  enLabel: string;
  arLabel: string;
  enValueKey?: string;
  arValueKey?: string;
  transform?: (data: any) => { en: string; ar: string };
}

function PersonalInformation({ fullDetail }: any) {
  const [personalData, setPersonalData] = useState<any>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  // Personal Information field configuration
  const personalFields: FieldConfig[] = [
    {
      key: "full_name",
      enLabel: "Full name",
      arLabel: "الاسم الكامل",
      enValueKey: "name",
      arValueKey: "name",
      transform: (data: any) => ({
        en: data.name || data.full_name_en || "-",
        ar: data.name_ar || data.name || data.full_name_ar || "-",
      }),
    },
    {
      key: "family_name",
      enLabel: "Family Name",
      arLabel: "اسم العائلة",
      enValueKey: "family_name_en",
      arValueKey: "family_name_ar",
    },
    {
      key: "national_id",
      enLabel: "National ID (NIN)",
      arLabel: "الهوية الوطنية (NIN)",
      enValueKey: "nid",
      arValueKey: "nid",
      transform: (data: any) => ({
        en: data.nid || data.national_id || "-",
        ar: data.nid || data.national_id || "-",
      }),
    },
    {
      key: "gender",
      enLabel: "Gender",
      arLabel: "جنس",
      transform: (data: any) => ({
        en: data.gender_en || data.gender || "-",
        ar: data.gender_ar || (data.gender === "Male" ? "ذكر" : data.gender === "Female" ? "أنثى" : data.gender || "-"),
      }),
    },
    {
      key: "nationality",
      enLabel: "Nationality",
      arLabel: "جنسية",
      enValueKey: "nationality_en",
      arValueKey: "nationality_ar",
    },
    {
      key: "nationality_code",
      enLabel: "Nationality Code",
      arLabel: "قانون الجنسية",
      enValueKey: "nationality_code",
      arValueKey: "nationality_code",
    },
    {
      key: "date_of_birth",
      enLabel: "Date of Birth (Gregorian)",
      arLabel: "تاريخ الميلاد (هجري)",
      transform: (data: any) => ({
        en: data.dob || data.date_of_birth_gregorian || data.date_of_birth_g || "-",
        ar: data.dob_hijri || data.dob_h || data.date_of_birth_hijri || data.date_of_birth_h || "-",
      }),
    },
    {
      key: "id_version",
      enLabel: "ID Version",
      arLabel: "نسخة الهوية",
      enValueKey: "id_version",
      arValueKey: "id_version",
    },
    {
      key: "id_issue_date",
      enLabel: "ID Issue Date (Gregorian)",
      arLabel: "تاريخ إصدار الهوية (هجري)",
      transform: (data: any) => ({
        en: data.id_issue_date_gregorian || data.id_issue_date_g || "-",
        ar: data.id_issue_date_hijri || data.id_issue_date_h || "-",
      }),
    },
    {
      key: "id_expiry_date",
      enLabel: "ID Expiry Date (Gregorian)",
      arLabel: "تاريخ انتهاء صلاحية الهوية (هجري)",
      transform: (data: any) => ({
        en: data.id_expiry_date_gregorian || data.id_expiry_date_g || "-",
        ar: data.id_expiry_date_hijri || data.id_expiry_date_h || "-",
      }),
    },
    {
      key: "mobile",
      enLabel: "Mobile Number",
      arLabel: "رقم الجوال",
      enValueKey: "mobile",
      arValueKey: "mobile",
    },
    {
      key: "email",
      enLabel: "Email",
      arLabel: "البريد الإلكتروني",
      enValueKey: "email",
      arValueKey: "email",
    },
  ];

  // Address Information field configuration
  const addressFields: FieldConfig[] = [
    {
      key: "region",
      enLabel: "Region",
      arLabel: "المنطقة",
      enValueKey: "region_en",
      arValueKey: "region_ar",
    },
    {
      key: "region_id",
      enLabel: "Region ID",
      arLabel: "معرف المنطقة",
      enValueKey: "region_id",
      arValueKey: "region_id",
    },
    {
      key: "city",
      enLabel: "City",
      arLabel: "المدينة",
      enValueKey: "city_en",
      arValueKey: "city_ar",
    },
    {
      key: "city_id",
      enLabel: "City ID",
      arLabel: "معرف المدينة",
      enValueKey: "city_id",
      arValueKey: "city_id",
    },
    {
      key: "district",
      enLabel: "District",
      arLabel: "الحي",
      enValueKey: "district_en",
      arValueKey: "district_ar",
    },
    {
      key: "street_name",
      enLabel: "Street Name",
      arLabel: "اسم الشارع",
      enValueKey: "street_name_en",
      arValueKey: "street_name_ar",
    },
    {
      key: "building_number",
      enLabel: "Building Number",
      arLabel: "رقم المبنى",
      enValueKey: "building_number",
      arValueKey: "building_number",
    },
    {
      key: "additional_number",
      enLabel: "Additional Number",
      arLabel: "الرقم الإضافي",
      enValueKey: "additional_number",
      arValueKey: "additional_number",
    },
    {
      key: "post_code",
      enLabel: "Post Code",
      arLabel: "الرمز البريدي",
      enValueKey: "post_code",
      arValueKey: "post_code",
    },
    {
      key: "short_address",
      enLabel: "Short Address",
      arLabel: "العنوان المختصر",
      enValueKey: "short_address",
      arValueKey: "short_address",
    },
    {
      key: "location_coordinates",
      enLabel: "Location Coordinates",
      arLabel: "إحداثيات الموقع",
      transform: (data: any) => {
        const coords = data.location_coordinates_en || data.location_coordinates_ar || data.location_coordinates || "-";
        if (coords === "-" || !coords) return { en: "-", ar: "-" };
        
        // If coordinates are in "longitude latitude" format, split and rearrange for Arabic
        const parts = coords.toString().split(" ");
        if (parts.length === 2) {
          return {
            en: coords, // Keep as is (longitude latitude)
            ar: `${parts[1]} ${parts[0]}`, // Reverse for Arabic (latitude longitude)
          };
        }
        return { en: coords, ar: coords };
      },
    },
    {
      key: "full_address",
      enLabel: "Full Address",
      arLabel: "العنوان الكامل",
      enValueKey: "full_address_en",
      arValueKey: "full_address_ar",
    },
  ];

  // Helper function to get field value
  const getFieldValue = (field: FieldConfig, data: any): { en: string; ar: string } => {
    if (!data) return { en: "-", ar: "-" };

    if (field.transform) {
      return field.transform(data);
    }

    const enValue = field.enValueKey
      ? data[field.enValueKey] || data[field.key] || "-"
      : data[field.key] || "-";
    const arValue = field.arValueKey
      ? data[field.arValueKey] || data[field.key] || "-"
      : data[field.key] || "-";

    return {
      en: enValue === null || enValue === undefined ? "-" : String(enValue),
      ar: arValue === null || arValue === undefined ? "-" : String(arValue),
    };
  };

  // Use fullDetail data if available
  useEffect(() => {
    if (fullDetail?.personalInformation) {
      const pi = fullDetail.personalInformation.personalInfo || {};
      const addr = fullDetail.personalInformation.addressInfo || {};
      setPersonalData({
        name: pi.fullNameEn || [pi.firstName, pi.lastName].filter(Boolean).join(" ") || "-",
        name_ar: pi.fullNameAr || [pi.firstNameAr, pi.lastNameAr].filter(Boolean).join(" ") || "-",
        family_name_en: pi.lastName || "-",
        family_name_ar: pi.lastNameAr || "-",
        nid: pi.nationalId || pi.iqamaNumber || "-",
        national_id: pi.nationalId || pi.iqamaNumber || "-",
        gender: pi.gender || "-",
        gender_en: pi.gender || "-",
        gender_ar: pi.gender === "Male" ? "ذكر" : pi.gender === "Female" ? "أنثى" : pi.gender || "-",
        nationality_en: pi.nationality || "-",
        nationality_ar: pi.nationality || "-",
        nationality_code: "-",
        dob: pi.dateOfBirthGregorian || "-",
        date_of_birth_gregorian: pi.dateOfBirthGregorian || "-",
        date_of_birth_hijri: pi.dateOfBirthHijri || "-",
        id_version: "-",
        id_issue_date_gregorian: pi.verificationDate || "-",
        id_expiry_date_gregorian: pi.iqamaExpiryDate || "-",
        mobile: pi.mobile || "-",
        email: pi.email || "-",
      });
      setAddressData({
        region_en: addr.regionName || "-",
        region_ar: addr.regionName || "-",
        city_en: addr.city || "-",
        city_ar: addr.city || "-",
        district_en: addr.district || "-",
        district_ar: addr.district || "-",
        street_name_en: addr.streetName || "-",
        street_name_ar: addr.streetName || "-",
        building_number: addr.buildingNumber || "-",
        post_code: addr.postCode || "-",
        short_address: addr.shortAddress || "-",
      });
      return;
    }
  }, [fullDetail]);

  // Fetch personal information when component mounts (fallback only when fullDetail prop not provided)
  useEffect(() => {
    if (id && fullDetail === undefined) {
      fetchData();
    }
  }, [id, fullDetail]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(id, 'manager');
      
      // Extract personal and address data from response
      const data = response.data?.data || response.data || {};
      const nafathDetails = data.nafathDetails || {};
      
      // Map nafathDetails to personal information format
      const personalInfo = {
        // Full name mapping
        name: nafathDetails.englishFirstName && nafathDetails.englishSecondName && nafathDetails.englishThirdName && nafathDetails.englishLastName
          ? `${nafathDetails.englishFirstName} ${nafathDetails.englishSecondName} ${nafathDetails.englishThirdName} ${nafathDetails.englishLastName}`
          : nafathDetails.englishFirstName || nafathDetails.firstName || "-",
        name_ar: nafathDetails.firstName && nafathDetails.secondName && nafathDetails.thirdName && nafathDetails.lastName
          ? `${nafathDetails.firstName} ${nafathDetails.secondName} ${nafathDetails.thirdName} ${nafathDetails.lastName}`
          : nafathDetails.firstName || "-",
        // Family name
        family_name_en: nafathDetails.englishLastName || "-",
        family_name_ar: nafathDetails.lastName || "-",
        // National ID
        nid: nafathDetails.iqamaNumber || nafathDetails.PersonId || nafathDetails.sub || "-",
        national_id: nafathDetails.iqamaNumber || nafathDetails.PersonId || nafathDetails.sub || "-",
        // Gender
        gender: nafathDetails.gender === "M" ? "Male" : nafathDetails.gender === "F" ? "Female" : nafathDetails.gender || "-",
        gender_en: nafathDetails.gender === "M" ? "Male" : nafathDetails.gender === "F" ? "Female" : nafathDetails.gender || "-",
        gender_ar: nafathDetails.gender === "M" ? "ذكر" : nafathDetails.gender === "F" ? "أنثى" : nafathDetails.gender || "-",
        // Nationality
        nationality_en: nafathDetails.nationalityDesc || "-",
        nationality_ar: nafathDetails.nationalityDesc || "-",
        nationality_code: nafathDetails.nationalityCode || "-",
        // Date of Birth
        dob: nafathDetails.dateOfBirthG || "-",
        date_of_birth_gregorian: nafathDetails.dateOfBirthG || "-",
        date_of_birth_g: nafathDetails.dateOfBirthG || "-",
        date_of_birth_hijri: nafathDetails.dateOfBirthH || "-",
        date_of_birth_h: nafathDetails.dateOfBirthH || "-",
        // ID Version
        id_version: nafathDetails.iqamaVersionNumber || "-",
        // ID Issue Date
        id_issue_date_gregorian: nafathDetails.iqamaIssueDateG || "-",
        id_issue_date_g: nafathDetails.iqamaIssueDateG || "-",
        id_issue_date_hijri: nafathDetails.iqamaIssueDateH || "-",
        id_issue_date_h: nafathDetails.iqamaIssueDateH || "-",
        // ID Expiry Date
        id_expiry_date_gregorian: nafathDetails.iqamaExpiryDateG || "-",
        id_expiry_date_g: nafathDetails.iqamaExpiryDateG || "-",
        id_expiry_date_hijri: nafathDetails.iqamaExpiryDateH || "-",
        id_expiry_date_h: nafathDetails.iqamaExpiryDateH || "-",
        // Issue Place
        iqama_issue_place_desc: nafathDetails.iqamaIssuePlaceDesc || "-",
        iqama_issue_place_code: nafathDetails.iqamaIssuePlaceCode || "-",
      };
      
      // Extract address data from nationalAddress array
      const nationalAddress = nafathDetails.nationalAddress || [];
      // Get primary address or first address
      const primaryAddress = nationalAddress.find((addr: any) => addr.isPrimaryAddress === "true") || nationalAddress[0] || {};
      
      const addressInfo = {
        region_en: primaryAddress.regionName || "-",
        region_ar: primaryAddress.regionNameL2 || primaryAddress.regionName || "-",
        region_id: primaryAddress.regionId || "-",
        city_en: primaryAddress.city || "-",
        city_ar: primaryAddress.cityL2 || primaryAddress.city || "-",
        city_id: primaryAddress.cityId || "-",
        district_en: primaryAddress.district || "-",
        district_ar: primaryAddress.districtL2 || primaryAddress.district || "-",
        street_name_en: primaryAddress.streetName || "-",
        street_name_ar: primaryAddress.streetL2 || primaryAddress.streetName || "-",
        building_number: primaryAddress.buildingNumber || "-",
        additional_number: primaryAddress.additionalNumber || "-",
        post_code: primaryAddress.postCode || "-",
        short_address: primaryAddress.shortAddress || "-",
        location_coordinates_en: primaryAddress.locationCoordinates || "-",
        location_coordinates_ar: primaryAddress.locationCoordinates || "-",
        // Full address construction
        full_address_en: primaryAddress.streetName && primaryAddress.district && primaryAddress.city
          ? `${primaryAddress.streetName}, ${primaryAddress.district}, ${primaryAddress.city} ${primaryAddress.postCode || ""} ${primaryAddress.buildingNumber || ""}`
          : "-",
        full_address_ar: primaryAddress.streetL2 && primaryAddress.districtL2 && primaryAddress.cityL2
          ? `${primaryAddress.streetL2}, ${primaryAddress.districtL2}, ${primaryAddress.cityL2} ${primaryAddress.postCode || ""} ${primaryAddress.buildingNumber || ""}`
          : "-",
      };
      
      setPersonalData(personalInfo);
      setAddressData(addressInfo);
      
      if (response.data?.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch personal information");
      setPersonalData(null);
      setAddressData(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if data is empty
  const isPersonalDataEmpty = !personalData || Object.keys(personalData).length === 0;
  const isAddressDataEmpty = !addressData || Object.keys(addressData).length === 0;

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ padding: "20px", background: "#fff", minHeight: "100vh" }}>
      {/* Language Headers */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <span style={{ color: "#000", fontWeight: 600, fontSize: "16px" }}>English</span>
        <span style={{ color: "#000", fontWeight: 600, fontSize: "16px" }}>العربية</span>
      </div>

      {/* Personal Information Section */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ color: "#000", fontWeight: 700, fontSize: "20px", margin: 0 }}>
            Personal Information
          </h2>
          <h2 style={{ color: "#000", fontWeight: 700, fontSize: "20px", margin: 0 }}>
            معلومات شخصية
          </h2>
        </div>

        {isPersonalDataEmpty ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#000" }}>
            No response found
          </div>
        ) : (
          <div>
            {personalFields.map((field, index) => {
              const values = getFieldValue(field, personalData);
              return (
                <div
                  key={field.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < personalFields.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000" }}>
                    {field.enLabel}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "#000", textAlign: "left" }}>
                    {values.en}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "#000", textAlign: "right", direction: "rtl" }}>
                    {values.ar}
                  </div>
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000", textAlign: "right", direction: "rtl" }}>
                    {field.arLabel}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Address Information Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ color: "#000", fontWeight: 700, fontSize: "20px", margin: 0 }}>
            Address Information
          </h2>
          <h2 style={{ color: "#000", fontWeight: 700, fontSize: "20px", margin: 0 }}>
            معلومات العنوان
          </h2>
        </div>

        {isAddressDataEmpty ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#000" }}>
            No response found
          </div>
        ) : (
          <div>
            {addressFields.map((field, index) => {
              const values = getFieldValue(field, addressData);
              return (
                <div
                  key={field.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < addressFields.length - 1 ? "1px solid #E5E7EB" : "none",
                  }}
                >
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000" }}>
                    {field.enLabel}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "#000", textAlign: "left" }}>
                    {values.en}
                  </div>
                  <div style={{ flex: "0 0 25%", fontSize: "14px", color: "#000", textAlign: "right", direction: "rtl" }}>
                    {values.ar}
                  </div>
                  <div style={{ flex: "0 0 20%", fontSize: "14px", color: "#000", textAlign: "right", direction: "rtl" }}>
                    {field.arLabel}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalInformation;