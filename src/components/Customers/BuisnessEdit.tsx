import { Container, Row, Col, Form, Tabs, Tab } from "react-bootstrap";
import {
  getBussinessByCustomerId,
  updateBussinessCustomer,
  GetAllBusinessCategory,
  GetAllBusinessType,
  getLanguage,
  getCities,
  getAllCountries,
  GetTotalEPF,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Loader from "../Loader/Loader";
import { Select } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

const BusinessInfoForm = () => {
  const [loading, setLoading] = useState<any>(false);
  const [customerData, setCustomerData] = useState<any>([]);
  const [BusinessName, setBusinessName] = useState<any>("");
  const { customerId } = useParams();
  const [businessType, setbusinessType] = useState<any>([]);
  const [categoryId, setCategoryId] = useState<any[]>();
  const country = useSelector((state: RootState) => state.block.countries);
  const city = useSelector((state: RootState) => state.block.cities);
  const languageId = useSelector((state: RootState) => state.block.languages);
  const navigate = useNavigate();
  const [epf, setEPF] = useState<any>([]);
  const [epfName, setEpfName] = useState<any>("test1");
  localStorage.setItem("customerId", customerId || "");

  const enums = {
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
    AddressType: [
      { id: 1, name: "Office" },
      { id: 2, name: "Home" },
      { id: 3, name: "Billing" },
      { id: 4, name: "Shipping" },
    ],
    Bankruptcy: [
      { id: 1, name: "Yes" },
      { id: 2, name: "No" },
    ],
  };

  const BusinessCustomer = async (customerId: any) => {
    try {
      setLoading(true);
      const res = await getBussinessByCustomerId(customerId);
      if (res) {
        const value = res.data.data;
        setCustomerData(value);
        setBusinessName(value?.name);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const updateCustomerBussiness = async (customerId: any) => {

    const body = {
      customerId: customerId,
      buisnessDto: {
        customerId: customerData?.customerId,
        buisnessId: customerData?.buisnessId,
        unn: customerData?.unn,
        buisnessCategory: getBussinessCategoryById(
          customerData?.buisnessCategoryId
        ),
        buisnessType: getBussinessTypeById(customerData?.buisnessTypeId),
        commercialRegistrationNumber:
          customerData?.commercialRegistrationNumber,
        name: BusinessName,
        buisnessCategoryId:
          customerData?.buisnessCategoryId || customerData?.buisnessCategoryId,
        buisnessTypeId:
          customerData?.buisnessTypeId || customerData?.buisnessTypeId,
        legalName: customerData?.legalName,
        taxId: customerData?.taxId,
        email: customerData?.email,
        contactPerson: customerData?.contactPerson,
        startDate: customerData?.startDate,
        managementSince: customerData?.managementSince,
        bankruptcy: customerData?.bankruptcy,
        skip: customerData?.skip,
        stopCorrespondence: customerData?.stopCorrespondence,
        privacyOptOut: customerData?.privacyOptOut,
        insuranceOptOut: customerData?.insuranceOptOut,
        marketingOptOut: customerData?.marketingOptOut,
        sharedCreditOptOut: customerData?.sharedCreditOptOut,
        totalCurrentEmployees: customerData?.totalCurrentEmployees,
        totalEPFId: customerData?.totalEPFId,
        totalEPF: epfName,
        timeZone: customerData?.buisness_TimeZone,
      },
      partnerDto: [
        {
          birthPlace: getCityById(customerData?.birthPlaceId),
          buisnessId: customerData?.buisnessId,
          partnerId: customerData?.partnerId,
          partner_PermissionToCall: customerData?.partner_PermissionToCall,
          partner_PermissionToText: customerData?.partner_PermissionToText,
          firstName: customerData?.firstName,
          middleName: customerData?.lastName,
          lastName: customerData?.lastName,
          suffix: customerData?.suffix,
          nationalId: customerData?.nationalId,
          dob: customerData?.dob,
          birthPlaceId: customerData?.birthPlaceId,
          language: getLanguageById(customerData?.languageId),
          isDirector: customerData?.isDirector,
          netWorth: customerData?.netWorth,
          grossIncome: customerData?.grossIncome,
          languageId: customerData?.languageId,
          nationalityId: customerData?.nationalityId,
          title: customerData?.title,
          ownershipPercentage: customerData?.ownershipPercentage,
          email: customerData?.partner_Email,
          nationality: getCountryById(customerData?.nationalityId),
          phone: "12345678901",
          extention: customerData?.extention,
        },
      ],
      addressDto: {
        customerId: customerData?.customerId,
        addressId: customerData?.addressId,
        type: customerData?.type,
        current: customerData?.current,
        confirmed: customerData?.confirmed,
        permissionToCall: customerData?.permissionToCall,
        mailing: customerData?.mailing,
        addrs: customerData?.addrs,
        phone: customerData?.phone,
        permissionToText: customerData?.permissionToText,
        countryId: customerData?.countryId,
        postalAddressType: customerData?.postalAddressType,
        streetPre: customerData?.streetPre,
        streetName: customerData?.streetName,
        streetType: customerData?.streetType,
        buildingNumber: customerData?.buildingNumber,
        address1: customerData?.address1,
        address2: customerData?.address2,
        address3: customerData?.address3,
        zip: customerData?.zip,
        zipExtention: customerData?.zipExtention,
        cityId: customerData?.cityId,
        timeZone: customerData?.timeZone,
        city: getCityById(customerData?.cityId),
        country: getCountryById(customerData?.countryId),
        comment: customerData?.comment,
      },
    };

    // Use toast.promise for clean loading, success, and error handling
    await toast.promise(
      updateBussinessCustomer(customerId, body), // API call
      {
        loading: "Updating business customer...", // While request is pending
        success: (res) => {
          if (
            res.data.notificationMessage ===
            "Request initiated for the operation"
          ) {
            navigate("/lms/Customers/Business");
            return res.data.notificationMessage;
          } else if (
            res.data.notificationMessage ===
            "Request already initiated for this operation"
          ) {
            navigate("/lms/Customers/Business");
            return res.data.notificationMessage;
          } else {
            throw new Error(
              res?.data?.errors?.[0] || "Business update failed."
            );
          }
        },
        error: (err) =>
          err?.message || "Something went wrong while updating the business.",
      }
    );
  };

  useEffect(() => {
    BusinessCustomer(customerId);
    getBusinessType();
    getBusinessCategory();
    //getCountryBusiness();
    //getCitiesBusiness();
    //getLanguageBusiness();
    fetchEPF();
    return () => {};
  }, [customerId]);

  const handleChange = (eventOrValue: any) => {
    // For standard inputs
    const { name, value, type, checked } = eventOrValue.target;
    const actualValue = type === "checkbox" ? checked : value;

    setCustomerData((prevState: any) => ({
      ...prevState,
      [name]: actualValue,
    }));
  };

  const handleSaveCustomer = () => {
    updateCustomerBussiness(customerId);
  };

  const getBusinessCategory = async () => {
    try {
      const res = await GetAllBusinessCategory(1, 1000);
      if (res) {
        const data = res.data.data;
        setCategoryId(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const getBusinessType = async () => {
    try {
      const res = await GetAllBusinessType(1, 1000);
      if (res) {
        const data = res.data.data;
        setbusinessType(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  /* const getLanguageBusiness = async () => {
    try {
      const res = await getLanguage();
      if (res) {
        const data = res.data.data;
        setLanguageId(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */

  /* const getCitiesBusiness = async () => {
    try {
      const res = await getCities();
      if (res) {
        const data = res.data.data;
        setCity(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */

  /* const getCountryBusiness = async () => {
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

  const fetchEPF = async () => {
    try {
      const res = await GetTotalEPF(1, 1000);
      if (res) {
        const data = res.data.data;
        setEPF(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const getEPFById = (id: any) => {
    const entry: any = epf?.find((entry: any) => entry.id === id);
    return `${entry?.minimumEFP} - ${entry?.maximumEFP}`;
  };
  const getBankruptcy = (value: any) => {
    const gender = enums.Bankruptcy.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const getBussinessCategoryById = (id: any) => {
    const entry: any = categoryId?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const getBussinessTypeById = (id: any) => {
    const entry: any = businessType?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const getLanguageById = (id: any) => {
    let entry: any = "Not found";
    languageId?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
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
    city?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
  };
  const getTimeZone = (value: any) => {
    const gender = enums.TimeZone.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const getAddressType = (value: any) => {
    const gender = enums.AddressType.find((g) => g.id === value);
    return gender ? gender.name : "";
  };
  const handleCategoryChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      buisnessCategoryId: value,
    }));
  };
  const handleTypeChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      buisnessTypeId: value,
    }));
  };
  const handleLanguageChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      languageId: value,
    }));
  };
  const handleCityChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      cityId: value,
    }));
  };
  const handleBirthPlaceChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      birthPlaceId: value,
    }));
  };
  const handleCountryChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      countryId: value,
    }));
  };
  const handleEPFChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      totalEPFId: value,
    }));
  };
  const businessInformationFields = [
    {
      label: "Registration Number",
      type: "text",
      name: "registrationNumber",
      value: customerData?.commercialRegistrationNumber,
    },
    {
      label: "Type",
      type: "select",
      name: "buisnessTypeId",
      options: businessType,
      value: getBussinessTypeById(customerData?.buisnessTypeId),
      onChange: (e: any) => handleTypeChange(e),
    },
    {
      label: "Category",
      type: "select",
      name: "buisnessCategoryId",
      options: categoryId,
      value: getBussinessCategoryById(customerData?.buisnessCategoryId),
      onChange: (e: any) => handleCategoryChange(e),
    },
    { label: "Name", type: "text", name: "name", value: BusinessName },
    {
      label: "Legal Name",
      type: "text",
      name: "legalName",
      value: customerData?.legalName,
    },
    {
      label: "UNN",
      type: "text",
      name: "unn",
      value: customerData?.unn,
    },
    {
      label: "Tax ID",
      type: "text",
      name: "taxId",
      value: customerData?.taxId,
    },
    {
      label: "Start Date",
      type: "date",
      name: "startDate",
      value: customerData?.startDate,
    },
    {
      label: "Total Current Employees",
      type: "text",
      name: "totalCurrentEmployees",
      value: customerData?.totalCurrentEmployees,
    },
    {
      label: "Contact Person",
      type: "text",
      name: "contactPerson",
      value: customerData?.contactPerson,
    },
    {
      label: "Management Since",
      type: "date",
      name: "managementSince",
      value: customerData?.managementSince,
    },
    {
      label: "Stop Correspondence",
      type: "checkbox",
      name: "stopCorrespondence",
      checked: customerData?.stopCorrespondence || false,
    },
    {
      label: "Skip",
      type: "checkbox",
      name: "skip",
      checked: customerData?.skip || false,
    },
    {
      label: "Bankruptcy",
      type: "select",
      options: enums.Bankruptcy,
      name: "bankruptcy",
      value: getBankruptcy(customerData?.bankruptcy),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          bankruptcy: e,
        })),
    },
    {
      label: "Email",
      type: "email",
      name: "email",
      value: customerData?.email,
    },
    {
      label: "Total Employee Posting Finance",
      type: "select",
      name: "totalEPFId",
      options: epf,
      value: getEPFById(customerData?.totalEPFId),
      onChange: (e: any) => handleEPFChange(e),
    },
    {
      label: "Time Zone",
      type: "select",
      options: enums.TimeZone,
      name: "buisness_TimeZone",
      value: getTimeZone(customerData?.buisness_TimeZone || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          buisness_TimeZone: e,
        })),
    },
    {
      label: "Privacy Opt-in",
      type: "checkbox",
      name: "Optin",
      checked: customerData?.privacyOptOut,
    },
    {
      label: "Insurance Opt-in",
      type: "checkbox",
      name: "Optin",
      checked: customerData?.insuranceOptOut,
    },
    {
      label: "Marketing Opt-in",
      type: "checkbox",
      name: "Optin",
      checked: customerData?.marketingOptOut,
    },
    {
      label: "Share Credit Opt-in",
      type: "checkbox",
      name: "Optin",
      checked: customerData?.sharedCreditOptOut,
    },
  ];

  const partnerDetailsFields = [
    // {
    //   label: "Partner ID",
    //   type: "text",
    //   name: "partnerId",
    //   value: customerData?.partnerId,
    // },
    {
      label: "First Name",
      type: "text",
      name: "firstName",
      value: customerData?.firstName,
    },
    {
      label: "Middle Name",
      type: "text",
      name: "middleName",
      value: customerData?.middleName,
    },
    {
      label: "Last Name",
      type: "text",
      name: "lastName",
      value: customerData?.lastName,
    },
    {
      label: "Suffix",
      type: "text",
      name: "suffix",
      value: customerData?.suffix,
    },
    {
      label: "National ID",
      type: "text",
      name: "nationalId",
      value: customerData?.nationalId,
    },
    { label: "DOB", type: "date", name: "dob", value: customerData?.dob },
    {
      label: "Birth Place",
      type: "select",
      name: "birthPlaceId",
      options: city,
      value: customerData?.birthPlaceId,
      onChange: handleBirthPlaceChange,
    },
    {
      label: "Net worth",
      type: "text",
      name: "netWorth",
      value: customerData?.netWorth,
    },
    {
      label: "Gross Income",
      type: "text",
      name: "grossIncome",
      value: customerData?.grossIncome,
    },
    {
      label: "Language",
      type: "select",
      name: "languageId",
      options: languageId,
      value: getLanguageById(customerData?.languageId),
      onChange: handleLanguageChange,
    },
    {
      label: "Nationality",
      type: "select",
      options: country,
      name: "nationalityId",
      value: getCountryById(customerData?.nationalityId),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          nationalityId: e,
        })),
    },
    {
      label: "Title",
      type: "text",
      name: "title",
      value: customerData?.title,
    },
    {
      label: "Ownership Percentage",
      type: "text",
      name: "ownershipPercentage",
      value: customerData?.ownershipPercentage,
    },
    {
      label: "Email",
      type: "email",
      name: "partner_Email",
      value: customerData?.partner_Email,
    },
    {
      label: "Phone Number",
      type: "text",
      name: "partner_Phone",
      value: customerData?.partner_Phone,
    },
    {
      label: "Extension",
      type: "text",
      name: "extention",
      value: customerData?.extention,
    },
    {
      label: "Is Director",
      type: "checkbox",
      name: "isDirector",
      checked: customerData?.isDirector,
    },
    {
      label: "Permission to Call",
      type: "checkbox",
      name: "partner_PermissionToCall",
      checked: customerData?.partner_PermissionToCall,
    },
    {
      label: "Permission to Text",
      type: "checkbox",
      name: "partner_PermissionToText",
      checked: customerData?.partner_PermissionToText,
    },
  ];
  const addressDetailsFields = [
    {
      label: "Address",
      type: "text",
      name: "addrs",
      value: customerData?.addrs,
    },

    {
      label: "Type",
      type: "select",
      options: enums.AddressType,
      name: "type",
      value: getAddressType(customerData?.type),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          type: e,
        })),
    },
    {
      label: "Postal Address Type",
      type: "text",
      name: "postalAddressType",
      value: customerData?.postalAddressType,
    },
    { label: "Phone", type: "text", name: "phone", value: customerData?.phone },
    {
      label: "Permission to Call",
      type: "checkbox",
      name: "permissionToCall",
      checked: customerData?.permissionToCall,
    },
    {
      label: "Permission to Text",
      type: "checkbox",
      name: "permissionToText",
      checked: customerData?.permissionToText,
    },
    {
      label: "Current",
      type: "checkbox",
      name: "current",
      checked: customerData?.current,
    },
    {
      label: "Confirmed",
      type: "checkbox",
      name: "confirmed",
      checked: customerData?.confirmed,
    },
    {
      label: "Mailing",
      type: "checkbox",
      name: "mailing",
      checked: customerData?.mailing,
    },
    {
      label: "Country",
      type: "select",
      name: "countryId",
      value: customerData?.countryId,
      options: country,
      onChange: (e: any) => handleCountryChange(e),
    },
    {
      label: "Street Pre",
      type: "text",
      name: "streetPre",
      value: customerData?.streetPre,
    },
    {
      label: "Street Name",
      type: "text",
      name: "streetName",
      value: customerData?.streetName,
    },
    {
      label: "Street Type",
      type: "text",
      name: "streetType",
      value: customerData?.streetType,
    },
    {
      label: "Building Number",
      type: "text",
      name: "buildingNumber",
      value: customerData?.buildingNumber,
    },
    {
      label: "Address 1",
      type: "text",
      name: "address1",
      value: customerData?.address1,
    },
    {
      label: "Address 2",
      type: "text",
      name: "address2",
      value: customerData?.address2,
    },
    {
      label: "Address 3",
      type: "text",
      name: "address3",
      value: customerData?.address3,
    },
    { label: "Zip", type: "text", name: "zip", value: customerData?.zip },
    {
      label: "Zip Extension",
      type: "text",
      name: "zipExtention",
      value: customerData?.zipExtention,
    },
    {
      label: "City",
      type: "select",
      name: "cityId",
      value: getCityById(customerData?.cityId),
      options: city,
      onChange: (e: any) => handleCityChange(e),
    },
    { label: "Phone", type: "text", name: "phone", value: customerData?.phone },
    {
      label: "Time Zone",
      type: "select",
      options: enums.TimeZone,
      name: "timeZone",
      value: getTimeZone(customerData?.timeZone || ""),
      onChange: (e: any) =>
        setCustomerData((prevState: any) => ({
          ...prevState,
          timeZone: e,
        })),
    },
    {
      label: "Comment",
      type: "text",
      name: "comment",
      value: customerData?.comment,
    },
  ];

  const button = [{ title: "Save and Exit", onClick: handleSaveCustomer }];

  return (
    <Container>
      <h3>Business Detail</h3>
      {/* <TableHeaderFilter button={button} /> */}
      {!loading ? (
        <>
          <div
            className="p-4"
            style={{ border: "1px solid var(--color-border-light)", borderRadius: "6px" }}
          >
            <Tabs
              defaultActiveKey="BusinessInformation"
              className="mb-3"
              style={{ width: "max-content" }}
            >
              <Tab
                eventKey="BusinessInformation"
                title="Business Information"
                style={{ marginRight: "10px" }}
              >
                <Row className="mb-3 d-flex align-items-center">
                  {businessInformationFields.map((field: any, index) => (
                    <Col md={4} key={index} className="mt-2 mb-2">
                      <Form.Group>
                        {field.type === "checkbox" ? (
                          <>
                            {field.name != "Optin" && (
                              <Form.Check
                                className="d-flex align-items-center pt-4 gap-2"
                                type={field.type}
                                label={field.label}
                                checked={field.checked}
                                onChange={(e) =>
                                  setCustomerData({
                                    ...customerData,
                                    [field.name]: e.target.checked,
                                  })
                                }
                              />
                            )}
                          </>
                        ) : field?.name === "name" ? (
                          <>
                            <Form.Label className="mt-2 fw-600">
                              {field.label}
                            </Form.Label>
                            <Form.Control
                              type={field.type}
                              placeholder={field.label}
                              defaultValue={field.value}
                              onChange={(e) => setBusinessName(e?.target.value)}
                            />
                          </>
                        ) : field.type === "select" ? (
                          <>
                            {field.name === "totalEPFId" ? (
                              <>
                                <Form.Label className="mt-2 fw-600">
                                  {field.label}
                                </Form.Label>
                                <Select
                                  value={field?.value}
                                  size="large"
                                  className="w-100"
                                >
                                  {field?.options &&
                                    field?.options?.map((option: any) => (
                                      <Select.Option
                                        key={option.id}
                                        value={`${option?.minimumEFP}-${option?.maximumEFP}`}
                                      >
                                        {option?.minimumEFP}-
                                        {option?.maximumEFP}
                                      </Select.Option>
                                    ))}
                                </Select>
                              </>
                            ) : (
                              <>
                                <Form.Label className="mt-2 fw-600">
                                  {field.label}
                                </Form.Label>
                                <Select
                                  value={field?.value}
                                  onChange={field?.onChange}
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
                            )}
                          </>
                        ) : (
                          <>
                            <Form.Label className="mt-2 fw-600">
                              {field.label}
                            </Form.Label>
                            <Form.Control
                              type={field.type}
                              name={field.name}
                              placeholder={field.label}
                              defaultValue={field.value}
                              onChange={handleChange}
                            />
                          </>
                        )}
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
                <h3>Opt-in</h3>
                <Row className="mb-3 d-flex align-items-center">
                  {businessInformationFields.map((field, index) => (
                    <>
                      {field.type === "checkbox" && field.name == "Optin" && (
                        <Col md={4} key={index} className="mt-2 mb-2">
                          <Form.Group controlId={`partnerDetails${index}`}>
                            <>
                              {
                                <Form.Check
                                  className="d-flex align-items-center pt-4 gap-2"
                                  type={field.type}
                                  label={field.label}
                                  checked={field.checked}
                                  onChange={(e) =>
                                    setCustomerData({
                                      ...customerData,
                                      [field.name]: e.target.checked,
                                    })
                                  }
                                />
                              }
                            </>
                          </Form.Group>
                        </Col>
                      )}
                    </>
                  ))}
                </Row>
              </Tab>
              <Tab
                eventKey="PartnerDetails"
                title="PartnerDetails"
                style={{ marginRight: "10px" }}
              >
                <Row className="mb-3">
                  {partnerDetailsFields.map((field, index) => (
                    <Col md={4} key={index} className="mt-2 mb-2">
                      <Form.Group controlId={`partnerDetails${index}`}>
                        {field.type === "text" ||
                        field.type === "date" ||
                        field.type === "email" ? (
                          <>
                            <Form.Label className="mt-2 fw-600">
                              {field.label}
                            </Form.Label>
                            <Form.Control
                              type={field.type}
                              name={field.name}
                              placeholder={field.label}
                              defaultValue={field.value}
                              onChange={handleChange}
                            />
                          </>
                        ) : field.type === "select" ? (
                          <>
                            <Form.Label className="mt-2 fw-600">
                              {field.label}
                            </Form.Label>
                            <Select
                              value={field.value}
                              onChange={field.onChange}
                              className="w-100"
                            >
                              {field.options &&
                                field.options.map((option: any) => (
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
                          <Form.Check
                            className="d-flex align-items-center pt-4 mt-3 gap-2"
                            //type={field.type}
                            label={field.label}
                            checked={field.checked}
                            onChange={(e) =>
                              setCustomerData({
                                ...customerData,
                                [field.name]: e.target.checked,
                              })
                            }
                          />
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
                <Row className="mb-3 d-flex align-items-center">
                  {addressDetailsFields.map((field, index) => (
                    <Col md={4} key={index} className="mt-2 mb-2">
                      <Form.Group controlId={`addressDetails${index}`}>
                        {field.type === "checkbox" ? (
                          <>
                            <Form.Check
                              className="d-flex align-items-center mt-2 gap-2"
                              style={{ paddingTop: "16px" }}
                              type={field.type}
                              label={field.label}
                              checked={field.checked}
                              onChange={(e) =>
                                setCustomerData({
                                  ...customerData,
                                  [field.name]: e.target.checked,
                                })
                              }
                            />
                          </>
                        ) : field.type === "select" ? (
                          <>
                            <Form.Label className="mt-2 fw-600">
                              {field.label}
                            </Form.Label>
                            <Select
                              size="large"
                              value={field.value}
                              onChange={field.onChange}
                              className="w-100"
                            >
                              {field.options &&
                                field.options.map((option: any) => (
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
                            <Form.Label className="mt-2 fw-600">
                              {field.label}
                            </Form.Label>
                            <Form.Control
                              type={field.type}
                              name={field.name}
                              placeholder={field.label}
                              defaultValue={field.value}
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
      ) : (
        <Loader />
      )}
    </Container>
  );
};

export default BusinessInfoForm;
