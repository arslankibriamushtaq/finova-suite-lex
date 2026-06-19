import { useEffect, useState } from "react";
import { Row, Col, Form, Tabs, Tab } from "react-bootstrap";
import {
  GetAllOccupations,
  allState,
  getAllCountries,
  getAllRealations,
  getCities,
  getIndividualByCustomerId,
  getLanguage,
  updateCustomerAddress,
  updateCustomerEmployment,
  updateIndividualCustomer,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Select } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

const PersonalInfoForm = () => {
  const [customerData, setCustomerData] = useState<any>({
    individualDto: {},
    employmentDto: {},
    addressDto: {},
    customerId: "123",
  });
  const [stopC, setStopC] = useState<any>();
  const country = useSelector((state: RootState) => state.block.countries);
  const [occupation, setOccupation] = useState<any>();
  const cities = useSelector((state: RootState) => state.block.cities);
  const languages = useSelector((state: RootState) => state.block.languages);
  const states = useSelector((state: RootState) => state.block.states);
  const allRelations = useSelector((state: RootState) => state.block.relations);
  const [stopCorrespondance, setStopCorrespondance] = useState<any>(false);
  const [activeTab, setActiveTab] = useState("PersonalInformation");
  const { customerId } = useParams();
  localStorage.setItem("customerId", customerId || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (customerId) {
      individualCustomer(customerId);
    }
    //fetchLanguages();
    //fetchCities();
    //getAllStates();
    //handleAllReason();
    //countryApi();
    occupationApi();
  }, [customerId]);

  const individualCustomer = async (customerId: any) => {
    try {
      const res = await getIndividualByCustomerId(customerId);
      if (res) {
        const value = res.data.data || [];
        setCustomerData(value);
        setStopCorrespondance(
          value.individualDto.stopCorrespondance == "false" ? false : true
        );
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getCountryById = (id: any) => {
    let entry: any = "Not found";
    country?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
  };
  const getCityById = (id: any) => {
    let entry: any = "Not found";
    cities?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
  };
  const updateCustomerIndividual = async (customerId: any) => {

    const individualPayload = {
      ...customerData.individualDto,
      skip: customerData.individualDto.skip ? "true" : "false",
      stopCorrespondance: customerData.individualDto.stopCorrespondance ? true : false,
      issueedPowerOfAttorney: customerData.individualDto.issueedPowerOfAttorney ? "true" : "false",
      nationality: getCountryById(customerData.individualDto.nationalityId),
      birthCountry: getCountryById(customerData.individualDto.birthCountryId),
      birthPlace: getCityById(customerData.individualDto.birthPlaceId),
      relation: getReasonDescriptionById(customerData.individualDto.relationId),
      language: getLanguageById(customerData.individualDto.languageId),
    };

    const addressPayload = {
      ...customerData.addressDto,
      country: getCountryById(customerData.addressDto.countryId),
      city: getCityById(customerData.addressDto.cityId),
    };

    const employmentPayload = {
      ...customerData.employmentDto,
      country: getCountryById(customerData.employmentDto.countryId),
      city: getCityById(customerData.employmentDto.cityId),
    };

    try {
      const [individualRes, addressRes, employmentRes] = await Promise.all([
        updateIndividualCustomer(customerId, { customerId, individualDto: individualPayload }),
        updateCustomerAddress(addressPayload),
        updateCustomerEmployment(employmentPayload),
      ]);

      if (
        individualRes?.data?.notificationMessage === "Operation successful." &&
        addressRes?.data?.notificationMessage === "Operation successful." &&
        employmentRes?.data?.notificationMessage === "Operation successful."
      ) {
        toast.success("All customer data updated successfully");
        navigate("/lms/customers/individuals");
      } else {
        toast.error("Some updates may have failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Update failed");
    }
  };


  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const [dto, field] = name.split(".");
    setCustomerData((prevState: any) => ({
      ...prevState,
      [dto]: {
        ...prevState[dto],
        [field]: type === "checkbox" ? checked : value,
      },
    }));
  };
  /* const countryApi = async () => {
    try {
      const res = await getAllCountries();
      if (res) {
        const data = res.data.data;
        setCountry(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */
  const handleSaveCustomer = () => {
    updateCustomerIndividual(customerId);
    // navigate("/lms/customers/individuals");
  };

  /* const fetchLanguages = async () => {
    try {
      const res = await getLanguage();

      if (res) {
        const data = res.data.data;
        setLanguages(data);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }; */
  /* const getAllStates = async () => {
    try {
      const response = await allState();
      if (response) {
        const values = response?.data?.data ?? [];

        setStates(values);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */
  const occupationApi = async () => {
    try {
      const res = await GetAllOccupations(1, 10000);
      if (res) {
        const data = res.data.data;

        setOccupation(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleLanguageChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      individualDto: {
        ...prevState.individualDto,
        languageId: value,
      },
    }));
  };
  // const handleCorrespondance = (value: string) => {
  //   setCustomerData((prevState: any) => ({
  //     ...prevState,
  //     individualDto: {
  //       ...prevState.individualDto,
  //       stopCorrespondance: value,
  //     },
  //   }));
  // };
  const handleCountry = (value: string, field: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      [field]: {
        ...prevState[field],
        countryId: value,
      },
    }));
  };
  const handleOccupation = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      employmentDto: {
        ...prevState.employmentDto,
        occupationId: value,
      },
    }));
  };
  const handleStateId = (value: string, field: any) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      [field]: {
        ...prevState[field],
        stateId: value,
      },
    }));
  };
  /* const fetchCities = async () => {
    try {
      const res = await getCities();
      if (res) {
        setCities(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }; */
  const enums = {
    IsPoliticallyExposed: [
      { id: 1, name: "Yes" },
      { id: 2, name: "No" },
    ],
    Gender: [
      { id: 1, name: "Male" },
      { id: 2, name: "Female" },
      { id: 3, name: "Non_Binary" },
      { id: 4, name: "Prefer_not_to_say" },
    ],
    Type: [
      { id: 1, name: "Regular" },
      { id: 2, name: "SystemGenerated" },
      { id: 3, name: "CustomerInitiated" },
      { id: 4, name: "StaffInitiated" },
      { id: 5, name: "Alert" },
      { id: 6, name: "Inboundfrominterface" },
      { id: 7, name: "OutboundToInterface" },
    ],
    Disability: [
      { id: 1, name: "Yes" },
      { id: 2, name: "No" },
    ],
    bankCruptcy: [
      { id: 1, name: "Yes" },
      { id: 2, name: "No" },
    ],
    Education: [
      { id: 1, name: "Non_Schooling" },
      { id: 2, name: "Primary_Education" },
      { id: 3, name: "Secondary_Education" },
      { id: 4, name: "Accociate_degree" },
      { id: 5, name: "Bechelors_Degree" },
      { id: 6, name: "Master_Degree" },
      { id: 7, name: "Phd_Scholar" },
    ],
    MaritalStatus: [
      { id: 1, name: "Single" },
      { id: 2, name: "Married" },
      { id: 3, name: "Divorce" },
      { id: 4, name: "Widowed" },
      { id: 5, name: "Separated" },
    ],
    TimeZone: [
      { id: "UTC", name: "UTC" },
      { id: "UTC-12:00", name: "UTC-12:00" },
      { id: "UTC-11:00", name: "UTC-11:00" },
      { id: "UTC-10:00", name: "UTC-10:00" },
      { id: "UTC-09:00", name: "UTC-09:00" },
      { id: "UTC-08:00", name: "UTC-08:00" },
      { id: "UTC-07:00", name: "UTC-07:00" },
      { id: "UTC-06:00", name: "UTC-06:00" },
      { id: "UTC-05:00", name: "UTC-05:00" },
      { id: "UTC-04:00", name: "UTC-04:00" },
      { id: "UTC-03:00", name: "UTC-03:00" },
      { id: "UTC-02:00", name: "UTC-02:00" },
      { id: "UTC-01:00", name: "UTC-01:00" },
      { id: "UTC+00:00", name: "UTC+00:00" },
      { id: "UTC+01:00", name: "UTC+01:00" },
      { id: "UTC+02:00", name: "UTC+02:00" },
      { id: "UTC+03:00", name: "UTC+03:00" },
      { id: "UTC+04:00", name: "UTC+04:00" },
      { id: "UTC+05:00", name: "UTC+05:00" },
      { id: "UTC+06:00", name: "UTC+06:00" },
      { id: "UTC+07:00", name: "UTC+07:00" },
      { id: "UTC+08:00", name: "UTC+08:00" },
      { id: "UTC+09:00", name: "UTC+09:00" },
      { id: "UTC+10:00", name: "UTC+10:00" },
      { id: "UTC+11:00", name: "UTC+11:00" },
      { id: "UTC+12:00", name: "UTC+12:00" },
    ],
    Frequency: [
      { id: 1, name: "Daily" },
      { id: 2, name: "Weekly" },
      { id: 3, name: "Bi_Weekly" },
      { id: 4, name: "Semi_Monthly" },
      { id: 5, name: "Monthly" },
      { id: 6, name: "Quarterly" },
      { id: 7, name: "Annually" },
    ],
    payday: [
      { id: "1", name: "1" },
      { id: "2", name: "2" },
      { id: "3", name: "3" },
      { id: "4", name: "4" },
      { id: "5", name: "5" },
      { id: "6", name: "6" },
      { id: "7", name: "7" },
      { id: "8", name: "8" },
      { id: "9", name: "9" },
      { id: "10", name: "10" },
      { id: "11", name: "11" },
      { id: "12", name: "12" },
      { id: "13", name: "13" },
      { id: "14", name: "14" },
      { id: "15", name: "15" },
      { id: "16", name: "16" },
      { id: "17", name: "17" },
      { id: "18", name: "18" },
      { id: "19", name: "19" },
      { id: "20", name: "20" },
      { id: "21", name: "21" },
      { id: "22", name: "22" },
      { id: "23", name: "23" },
      { id: "24", name: "24" },
      { id: "25", name: "25" },
      { id: "26", name: "26" },
      { id: "27", name: "27" },
      { id: "28", name: "28" },
      { id: "29", name: "29" },
      { id: "30", name: "30" },
    ],
  };
  const getFrequency = (value: any) => {
    const gender = enums.Frequency.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const getGenderLabel = (value: any) => {
    const gender = enums.Gender.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const getDisability = (value: any) => {
    const gender = enums.Disability.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const getEducation = (value: any) => {
    const gender = enums.Education.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const getBankCruptcy = (value: any) => {
    const gender = enums.bankCruptcy.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const getType = (value: any) => {
    const gender = enums.Type.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const getMaritalStatus = (value: any) => {
    const gender = enums.MaritalStatus.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const getLanguageById = (id: any) => {
    let entry: any = "Not found";
    languages?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
  };
  const getTimeZone = (value: any) => {
    const gender = enums.TimeZone.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const handleCityChange = (value: string, field: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      [field]: {
        ...prevState[field],
        cityId: value,
      },
    }));
  };
  /* const handleAllReason = async () => {
    try {
      const res = await getAllRealations(1, 10000);
      if (res) {
        const data = res.data.data;
        setAllReason(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */
  const getReasonDescriptionById = (id: any) => {
    const entry: any = allRelations?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const handleMaritalStatus = (value: any) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      individualDto: {
        ...prevState.individualDto,
        maritalStatus: value,
      },
    }));
  };
  const handleGender = (value: any) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      individualDto: {
        ...prevState.individualDto,
        gender: value,
      },
    }));
  };
  const handleRelationChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      individualDto: {
        ...prevState.individualDto,
        relationId: value,
      },
    }));
  };
  const handleCheckboxChange = (isChecked: boolean, fieldName: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      [fieldName]: isChecked,
    }));

  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const correspondence = [
    { name: "Yes", value: true },
    { name: "No", value: false },
  ];

  const personalInfoFields = [
    {
      label: "Name",
      type: "text",
      name: "individualDto.name",
      value: customerData?.individualDto?.name || "",
    },
    {
      label: "Relation",
      type: "select",
      name: "individualDto.relationId",
      options: allRelations,
      value:
        getReasonDescriptionById(customerData?.individualDto?.relationId) || "",
      onChange: handleRelationChange,
    },
    {
      label: "DOB",
      type: "date",
      name: "individualDto.dob",
      value: formatDate(customerData?.individualDto?.dob || ""),
    },
    {
      label: "Marital Status",
      type: "select",
      options: enums.MaritalStatus,
      name: "individualDto.maritalStatus",
      value: getMaritalStatus(customerData?.individualDto?.maritalStatus || ""),
      onChange: (e: any) => handleMaritalStatus(e),
    },
    {
      label: "Language",
      type: "select",
      name: "individualDto.languageId",
      value: getLanguageById(customerData?.individualDto?.languageId),
      // value: customerData?.individualDto?.languageId || "",
      options: languages,
      onChange: handleLanguageChange,
    },
    {
      label: "Mother Maiden Name",
      type: "text",
      name: "individualDto.motherMaidenName",
      value: customerData?.individualDto?.motherMaidenName || "",
    },
    {
      label: "Email",
      type: "email",
      name: "individualDto.email",
      value: customerData?.individualDto?.email || "",
    },
    {
      label: "Stop Correspondance",
      type: "checkbox",
      name: "individualDto.stopCorrespondance",
      checked: customerData?.individualDto?.stopCorrespondance,
      // onChange: handleCorrespondance,
    },
    {
      label: "Skip",
      type: "checkbox",
      name: "individualDto.skip",
      checked: customerData?.individualDto?.skip === "true" ? true : false,
    },
    {
      label: "Disability",
      type: "select",
      options: enums.Disability,
      name: "individualDto.disability",
      value: getDisability(customerData?.individualDto?.disability || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          individualDto: {
            ...prevState.individualDto,
            disability: e,
          },
        })),
    },

    {
      label: "Bankruptcy",
      type: "select",
      options: enums.bankCruptcy,
      name: "individualDto.bankcruptcy",
      value: getBankCruptcy(customerData?.individualDto?.bankcruptcy || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          individualDto: {
            ...prevState.individualDto,
            bankcruptcy: e,
          },
        })),
    },
    {
      label: "Gender",
      type: "select",
      options: enums.Gender,
      name: "individualDto.gender",
      value: getGenderLabel(customerData?.individualDto?.gender || ""),
      onChange: (e: any) => handleGender(e),
    },
    {
      label: "Insurance Opt-in",
      type: "checkbox",
      name: "individualDto.insuranceOptOut",
      checked: customerData?.individualDto?.insuranceOptOut || "",
    },
    {
      label: "Marketing Opt-in",
      type: "checkbox",
      name: "individualDto.marketingOtpOut",
      checked: customerData?.individualDto?.marketingOtpOut || "",
    },
    {
      label: "Share Credit Opt-in",
      type: "checkbox",
      name: "individualDto.sharedCreditOtpOut",
      checked: customerData?.individualDto?.sharedCreditOtpOut || "",
    },

    {
      label: "Privacy Opt-in",
      type: "checkbox",
      name: "individualDto.privacyOptOut",
      checked: customerData?.individualDto?.privacyOptOut,
    },
    {
      label: "Time Zone",
      type: "select",
      options: enums.TimeZone,
      name: "individualDto.timeZone",
      value: getTimeZone(customerData?.individualDto?.timeZone || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          individualDto: {
            ...prevState.individualDto,
            timeZone: e,
          },
        })),
    },
    {
      label: "Education",
      type: "select",
      options: enums.Education,
      name: "individualDto.education",
      value: getEducation(customerData?.individualDto?.education || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          individualDto: {
            ...prevState.individualDto,
            education: e,
          },
        })),
    },
    // {
    //   label: "Decease Date",
    //   type: "date",
    //   name: "individualDto.deceaseDate",
    //   value: formatDate(customerData?.individualDto?.deceaseDate || ""),
    // },
  ];

  const identificationDetailsFields = [
    {
      label: "Passport Number",
      type: "text",
      name: "individualDto.passportNumber",
      value: customerData?.individualDto?.passportNumber || "",
    },
    {
      label: "Passport Issue Date",
      type: "date",
      name: "individualDto.passportIssueDate",
      value: formatDate(customerData?.individualDto?.passportIssueDate || ""),
    },
    {
      label: "Passport Expiry Date",
      type: "date",
      name: "individualDto.passportExpiryDate",
      value: formatDate(customerData?.individualDto?.passportExpiryDate || ""),
    },
    {
      label: "Visa Number",
      type: "text",
      name: "individualDto.visaNumber",
      value: customerData?.individualDto?.visaNumber || "",
    },
    {
      label: "Nationality",
      type: "select",
      options: country,
      name: "individualDto.nationalityId",
      value: getCountryById(customerData?.individualDto?.nationalityId),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          individualDto: {
            ...prevState.individualDto,
            nationalityId: e,
          },
        })),
    },
    {
      label: "National ID",
      type: "text",
      name: "individualDto.nationalId",
      value: customerData?.individualDto?.nationalId || "",
    },
    {
      label: "NID Issue Date",
      type: "date",
      name: "individualDto.nationalIdIssuanceDate",
      value: formatDate(
        customerData?.individualDto?.nationalIdIssuanceDate || ""
      ),
    },
    {
      label: "NID Expiry Date",
      type: "date",
      name: "individualDto.nidExpiryDate",
      value: formatDate(customerData?.individualDto?.nidExpiryDate || ""),
    },
    {
      label: "License Number",
      type: "text",
      name: "individualDto.licenseNumber",
      value: customerData?.individualDto?.licenseNumber || "",
    },
    {
      label: "License Issue Date",
      type: "date",
      name: "individualDto.licenseIssueDate",
      value: formatDate(customerData?.individualDto?.licenseIssueDate || ""),
    },
    {
      label: "License Expiry Date",
      type: "date",
      name: "individualDto.licenseExpiryDate",
      value: formatDate(customerData?.individualDto?.licenseExpiryDate || ""),
    },
    {
      label: "SSN",
      type: "text",
      name: "individualDto.ssn",
      value: customerData?.individualDto?.ssn || "",
    },
    {
      label: "Active Military Duty",
      type: "checkbox",
      name: "individualDto.activeMilitaryDuty",
      checked: customerData?.individualDto?.activeMilitaryDuty || "",
    },
    {
      label: "PR Number",
      type: "text",
      name: "individualDto.prNumber",
      value: customerData?.individualDto?.prNumber || "",
    },
  ];

  const FATCA = [
    {
      label: "Birth Place",
      type: "select",
      options: cities,
      name: "individualDto.birthPlaceId",
      value: getCityById(customerData?.individualDto?.birthPlaceId || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          individualDto: {
            ...prevState.individualDto,
            birthPlaceId: e,
          },
        })),
    },

    {
      label: "Birth Country",
      type: "select",
      options: country,
      name: "individualDto.birthCountryId",
      value: getCountryById(customerData?.individualDto?.birthCountryId || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          individualDto: {
            ...prevState.individualDto,
            birthCountryId: e,
          },
        })),
    },

    {
      label: "Is Politically Exposed",
      type: "select",
      options: enums.IsPoliticallyExposed,
      name: "individualDto.isPoliticallyExposed",
      value: customerData?.individualDto?.isPoliticallyExposed || "",
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          individualDto: {
            ...prevState.individualDto,
            isPoliticallyExposed: e,
          },
        })),
    },
  ];

  const PowerAtarny = [
    {
      label: "Issued Power of Attorney",
      type: "checkbox",
      name: "individualDto.issueedPowerOfAttorney",
      checked:
        customerData?.individualDto?.issueedPowerOfAttorney == "true"
          ? true
          : false,
    },
  ];

  const employmentDetailsFields = [
    {
      label: "Address 1",
      type: "text",
      name: "employmentDto.address1",
      value: customerData?.employmentDto?.address1 || "",
    },

    {
      label: "Phone",
      type: "text",
      name: "employmentDto.phone",
      value: customerData?.employmentDto?.phone || "",
    },
    {
      label: "Type",
      type: "select",
      options: enums.Type,
      name: "employmentDto.type",
      value: getType(customerData?.employmentDto?.type || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          employmentDto: {
            ...prevState.employmentDto,
            type: e,
          },
        })),
    },
    {
      label: "Current",
      type: "checkbox",
      name: "employmentDto.current",
      checked: customerData?.employmentDto?.current || false,
    },
    {
      label: "Permission to Call",
      type: "checkbox",
      name: "employmentDto.permissionToCall",
      checked: customerData?.employmentDto?.permissionToCall || false,
    },
    {
      label: "Permission to Text",
      type: "checkbox",
      name: "employmentDto.permissionToText",
      checked: customerData?.employmentDto?.permissionToText || false,
    },
    {
      label: "Employer",
      type: "text",
      name: "employmentDto.employer",
      value: customerData?.employmentDto?.employer || "",
    },
    {
      label: "Occupation",
      type: "select",
      name: "employmentDto.occupationId",
      value: customerData?.employmentDto?.occupationId || "",
      options: occupation,
      onChange: handleOccupation,
    },
    {
      label: "Title",
      type: "text",
      name: "employmentDto.title",
      value: customerData?.employmentDto?.title || "",
    },
    {
      label: "Department",
      type: "text",
      name: "employmentDto.department",
      value: customerData?.employmentDto?.department || "",
    },
    {
      label: "Country",
      type: "select",
      name: "employmentDto.countryId",
      value: customerData?.employmentDto?.countryId || "",
      options: country,
      onChange: (value: any) => handleCountry(value, "employmentDto"),
    },
    {
      label: "Address 2",
      type: "text",
      name: "employmentDto.address2",
      value: customerData?.employmentDto?.address2 || "",
    },
    {
      label: "Zip",
      type: "text",
      name: "employmentDto.zip",
      value: customerData?.employmentDto?.zip || "",
    },
    {
      label: "Zip Extension",
      type: "text",
      name: "employmentDto.zipExtention",
      value: customerData?.employmentDto?.zipExtention || "",
    },
    {
      label: "City",
      type: "select",
      name: "employmentDto.cityId",
      value: customerData?.employmentDto?.cityId || "",
      options: cities,
      onChange: (value: any) => handleCityChange(value, "employmentDto"),
    },
    {
      label: "State",
      type: "select",
      name: "employmentDto.stateId",
      value: customerData?.employmentDto?.stateId || "",
      options: states,
      onChange: (value: any) => handleStateId(value, "employmentDto"),
    },
    {
      label: "Extension",
      type: "text",
      name: "employmentDto.extention",
      value: customerData?.employmentDto?.extention || "",
    },
    {
      label: "Comment",
      type: "text",
      name: "employmentDto.comment",
      value: customerData?.employmentDto?.comment || "",
    },
    {
      label: "Pay Day",
      type: "select",
      options: enums.payday,
      name: "employmentDto.payDay",
      value: customerData?.employmentDto?.payDay || "",
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          employmentDto: {
            ...prevState.employmentDto,
            payDay: e,
          },
        })),
    },
    {
      label: "Next Pay Day",
      type: "date",
      name: "employmentDto.nextPayDay",
      value: formatDate(customerData?.employmentDto?.nextPayDay || ""),
    },
    {
      label: "Frequency",
      type: "select",
      options: enums.Frequency,
      name: "employmentDto.frequency",
      value: getFrequency(customerData?.employmentDto?.frequency || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          employmentDto: {
            ...prevState.employmentDto,
            frequency: e,
          },
        })),
    },
  ];

  const addressDetailsFields = [
    {
      label: "Address",
      type: "text",
      name: "addressDto.addrs",
      value: customerData?.addressDto?.addrs || "",
    },

    {
      label: "Type",
      type: "select",
      options: enums.Type,
      name: "addressDto.type",
      value: getType(customerData?.addressDto?.type || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          addressDto: {
            ...prevState.addressDto,
            type: e,
          },
        })),
    },
    {
      label: "Postal Address Type",
      type: "text",
      name: "addressDto.postalAddressType",
      value: customerData?.addressDto?.postalAddressType || "",
    },
    {
      label: "Phone",
      type: "text",
      name: "addressDto.phone",
      value: customerData?.addressDto?.phone || "",
    },
    {
      label: "Permission to Call",
      type: "checkbox",
      name: "addressDto.permissionToCall",
      checked: customerData?.addressDto?.permissionToCall || false,
    },
    {
      label: "Permission to Text",
      type: "checkbox",
      name: "addressDto.permissionToText",
      checked: customerData?.addressDto?.permissionToText || false,
    },
    {
      label: "Current",
      type: "checkbox",
      name: "addressDto.current",
      checked: customerData?.addressDto?.current || false,
    },
    {
      label: "Confirmed",
      type: "checkbox",
      name: "addressDto.confirmed",
      checked: customerData?.addressDto?.confirmed || false,
    },
    {
      label: "Mailing",
      type: "checkbox",
      name: "addressDto.mailing",
      checked: customerData?.addressDto?.mailing || false,
    },

    {
      label: "Country",
      type: "select",
      name: "addressDto.countryId",
      value: customerData?.addressDto?.countryId || "",
      options: country,
      onChange: (value: any) => handleCountry(value, "addressDto"),
    },
    {
      label: "Street Pre",
      type: "text",
      name: "addressDto.streetPre",
      value: customerData?.addressDto?.streetPre || "",
    },
    {
      label: "Street Name",
      type: "text",
      name: "addressDto.streetName",
      value: customerData?.addressDto?.streetName || "",
    },
    {
      label: "Street Type",
      type: "text",
      name: "addressDto.streetType",
      value: customerData?.addressDto?.streetType || "",
    },
    {
      label: "Building Number",
      type: "text",
      name: "addressDto.buildingNumber",
      value: customerData?.addressDto?.buildingNumber || "",
    },
    {
      label: "Address 2",
      type: "text",
      name: "addressDto.address2",
      value: customerData?.addressDto?.address2 || "",
    },
    {
      label: "Address 3",
      type: "text",
      name: "addressDto.address3",
      value: customerData?.addressDto?.address3 || "",
    },
    {
      label: "Zip",
      type: "text",
      name: "addressDto.zip",
      value: customerData?.addressDto?.zip || "",
    },
    {
      label: "Zip Extension",
      type: "text",
      name: "addressDto.zipExtention",
      value: customerData?.addressDto?.zipExtention || "",
    },
    {
      label: "City",
      type: "select",
      name: "addressDto.cityId",
      value: customerData?.addressDto?.cityId || "",
      options: cities,
      onChange: (value: any) => handleCityChange(value, "addressDto"),
    },
    {
      label: "Time Zone",
      type: "select",
      options: enums.TimeZone,
      name: "addressDto.timeZone",
      value: getTimeZone(customerData?.addressDto?.timeZone || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          addressDto: {
            ...prevState.addressDto,
            timeZone: e,
          },
        })),
    },
    {
      label: "Comment",
      type: "text",
      name: "addressDto.comment",
      value: customerData?.addressDto?.comment || "",
    },
  ];
  const button = [{ title: "Save and Exit", onClick: handleSaveCustomer }];
  const handleCorrespondance = (value: any) => {
    // Handle your logic here
    setStopCorrespondance(value === "on"); // Assuming checkbox uses 'on' value when checked
  };
  return (
    <>
      <h3>Individual Detail</h3>
      {/* <TableHeaderFilter button={button} /> */}
      <div
        className="p-4"
        style={{ border: "1px solid var(--color-border-light)", borderRadius: "6px" }}
      >
        <Tabs
          defaultActiveKey={activeTab}
          className="mb-3"
          style={{ width: "max-content" }}
        >
          <Tab
            eventKey="PersonalInformation"
            title="Personal Information"
            style={{ marginRight: "10px" }}
          >
            <Row className="mb-3">
              {personalInfoFields &&
                personalInfoFields?.map((field, index) => (
                  <Col md={4} key={index} className="mt-2 mb-2">
                    <Form.Group controlId={`personalInfo${index}`}>
                      <Form.Label className="mt-2">
                        {field.type == "checkbox" ? "" : field.label}
                      </Form.Label>
                      {field.type === "select" ? (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          className="w-100"
                        >
                          {field?.options?.map((option: any) => (
                            <Select.Option key={option.id} value={option.id}>
                              {option.name}
                            </Select.Option>
                          ))}
                        </Select>
                      ) : (
                        <>
                          {field.type == "text" ||
                            field.type == "email" ||
                            field.type == "date" ? (
                            <Form.Control
                              type={field.type}
                              name={field.name}
                              value={field.value}
                              onChange={handleChange}
                            />
                          ) : (
                            field.type === "checkbox" && (
                              <div className="d-flex align-items-center">
                                <>
                                  <Form.Check
                                    className=""
                                    type={field.type}
                                    name={field.name}
                                    checked={field.checked}
                                    onChange={handleChange}
                                  />
                                  <Form.Label className="mt-2 ms-3">
                                    {field.label}
                                  </Form.Label>
                                </>
                              </div>
                            )
                          )}
                        </>
                      )}
                    </Form.Group>
                  </Col>
                ))}
              {/* <div className="d-flex justify-content-end mt-2">
                <button
                  className="theme-btn-next "
                  onClick={() => {
                    setActiveTab("IdentificationDetails");
                  }}
                >
                  Next
                </button>
              </div> */}
            </Row>
          </Tab>

          <Tab
            eventKey="IdentificationDetails"
            title="Identification Details"
            style={{ marginRight: "10px" }}
          >
            <Row className="mb-3">
              {identificationDetailsFields &&
                identificationDetailsFields.map((field, index) => (
                  <Col md={4} key={index} className="mb-2 mt-2">
                    <Form.Group controlId={`identificationDetails${index}`}>
                      <Form.Label className="mt-2">
                        {field.type == "checkbox" ? "" : field.label}
                      </Form.Label>
                      {field.type == "text" ||
                        field.type == "email" ||
                        field.type == "date" ? (
                        <Form.Control
                          type={field.type}
                          name={field.name}
                          value={field.value}
                          onChange={handleChange}
                        />
                      ) : (
                        <>
                          {field.type == "select" ? (
                            <Select
                              value={field.value}
                              onChange={field.onChange}
                              className="w-100"
                            >
                              {field?.options &&
                                field?.options?.map((option: any) => (
                                  <Select.Option
                                    key={option.id}
                                    value={option.id}
                                  >
                                    {option.name}
                                  </Select.Option>
                                ))}
                            </Select>
                          ) : (
                            field.type === "checkbox" && (
                              <div className="d-flex align-items-center">
                                <>
                                  <Form.Check
                                    className=""
                                    type={field.type}
                                    name={field.name}
                                    checked={field.checked}
                                    onChange={handleChange}
                                  />
                                  <Form.Label className="mt-2 ms-3">
                                    {field.label}
                                  </Form.Label>
                                </>
                              </div>
                            )
                          )}
                        </>
                      )}
                    </Form.Group>
                  </Col>
                ))}
            </Row>
            <h3>FATCA Section</h3>
            <Row className="mb-3">
              {FATCA &&
                FATCA.map((field, index) => (
                  <Col md={4} key={index}>
                    <Form.Group controlId={`FATCA${index}`}>
                      <Form.Label className="mt-2">{field.label}</Form.Label>
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-100"
                      >
                        {field?.options &&
                          field?.options?.map((option: any) => (
                            <Select.Option key={option.id} value={option.id}>
                              {option.name}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Group>
                  </Col>
                ))}
            </Row>
            <h3>Power Attorney</h3>
            <Row className="mb-3">
              {PowerAtarny &&
                PowerAtarny?.map((field: any, index) => (
                  <Col md={4} key={index}>
                    <Form.Group controlId={`PowerAtarny${index}`}>
                      <div className="d-flex align-items-center">
                        <>
                          <Form.Check
                            type={field.type}
                            name={field.name}
                            checked={field.checked}
                            onChange={handleChange}
                          />
                          <Form.Label className="mt-2 ms-3">
                            {field.label}
                          </Form.Label>
                        </>
                      </div>
                    </Form.Group>
                  </Col>
                ))}
            </Row>
          </Tab>

          <Tab
            eventKey="CurrentEmploymentDetails"
            title="Current Employment Details"
            style={{ marginRight: "10px" }}
          >
            <Row className="mb-3">
              {employmentDetailsFields &&
                employmentDetailsFields.map((field, index) => (
                  <Col md={4} key={index} className="mt-2 mb-2">
                    <Form.Group controlId={`employmentDetails${index}`}>
                      {field.type === "checkbox" ? (
                        <div className="d-flex align-items-center">
                          <>
                            <Form.Check
                              className=""
                              type={field.type}
                              name={field.name}
                              checked={field.checked}
                              onChange={handleChange}
                            />
                            <Form.Label className="mt-2 ms-3">
                              {field.label}
                            </Form.Label>
                          </>
                        </div>
                      ) : field.type === "select" ? (
                        <>
                          <Form.Label className="mt-2">
                            {field.label}
                          </Form.Label>
                          <Select
                            value={field.value}
                            onChange={field.onChange}
                            className="w-100"
                          >
                            {field?.options &&
                              field?.options?.map((option: any) => (
                                <Select.Option
                                  key={option.id}
                                  value={option.id}
                                >
                                  {option.name}
                                </Select.Option>
                              ))}
                          </Select>
                        </>
                      ) : (
                        <>
                          <Form.Label className="mt-2">
                            {field.label}
                          </Form.Label>
                          <Form.Control
                            type={field.type}
                            name={field.name}
                            value={field.value}
                            onChange={handleChange}
                          />
                        </>
                      )}
                    </Form.Group>
                  </Col>
                ))}
            </Row>
          </Tab>
          <Tab
            eventKey="PersonalAddressDetails"
            title="Personal Address Details"
            style={{ marginRight: "10px" }}
          >
            <Row className="mb-3">
              {addressDetailsFields &&
                addressDetailsFields?.map((field, index) => (
                  <Col md={4} key={index} className="mt-2 mb-2">
                    <Form.Group controlId={`personalInfo${index}`}>
                      {field.type === "select" ? (
                        <>
                          <Form.Label className="mt-2">
                            {field.label}
                          </Form.Label>

                          <Select
                            value={field.value}
                            onChange={field.onChange}
                            className="w-100"
                          >
                            {field?.options &&
                              field?.options?.map((option: any) => (
                                <Select.Option
                                  key={option.id}
                                  value={option.id}
                                >
                                  {option.name}
                                </Select.Option>
                              ))}
                          </Select>
                        </>
                      ) : field.type === "checkbox" ? (
                        <div
                          className="d-flex"
                          style={
                            index >= 6 && index <= 8
                              ? { paddingTop: "16px" }
                              : { paddingTop: "38px" }
                          }
                        >
                          <>
                            <Form.Check
                              type="checkbox"
                              className=""
                              checked={field.checked}
                              onChange={handleChange}
                            />
                            <Form.Label className="ms-3 mt-1">
                              {field.label}
                            </Form.Label>
                          </>
                        </div>
                      ) : (
                        <>
                          <Form.Label className="mt-2">
                            {field.label}
                          </Form.Label>
                          <Form.Control
                            type={field.type}
                            name={field.name}
                            value={field.value}
                            onChange={handleChange}
                          />
                        </>
                      )}
                    </Form.Group>
                  </Col>
                ))}
              <div className="d-flex justify-content-end mt-2">
                <button
                  className="theme-btn-next "
                  onClick={handleSaveCustomer}
                >
                  Save and Exit
                </button>
              </div>
            </Row>
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

export default PersonalInfoForm;
