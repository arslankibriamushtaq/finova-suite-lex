import { useEffect, useState } from "react";
import {
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
  useFormikContext,
} from "formik";
import { Modal, Row, Col, Tabs, Tab, ModalHeader } from "react-bootstrap";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector, UseSelector } from "react-redux";
import {
  createAdress,
  createBussinessEmployee,
  createPartner,
  GetAllBusinessCategory,
  GetAllBusinessType,
  getLanguage,
  GetTotalEPF,
} from "../../../redux/apis/apisCrudLms";
import { Button, Checkbox } from "antd";
import { RootState } from "../../../redux/rootReducer";

const BuisnessModal = ({ setBusinessForm, buisnessForm }: any) => {
  const navigate = useNavigate();
  const [businessType, setbusinessType] = useState<any>();
  const languageId = useSelector((state: RootState) => state.block.languages);
  const country = useSelector((state: RootState) => state.block.countries);
  const city = useSelector((state: RootState) => state.block.cities);

  const [Category, setCategory] = useState<any>();
  const [epfName, setEpfName] = useState<any>();
  const [currentTab, setCurrentTab] = useState("businessInfo");
  const tabOrder = [
    "businessInfo",
    "optional",
    "partnerDetails",
    "businessAddress",
  ];
  const [businessTypeName, setBusinessTypeName] = useState<any>();
  const [businessCategoryName, setBusinessCategoryName] = useState<any>();
  const [partnerBirthPlace, setPartnerBirthPlace] = useState<any>("");
  const [partnerNationalityName, setPartnerNationalityName] = useState<any>("");
  const [languageName, setLanguageName] = useState<any>("");
  const [countryName, setCountryName] = useState<any>("");
  const [cityName, setCityName] = useState<any>("");
  const [epf, setEpf] = useState<any>();
  const validationSchema = Yup.object().shape({
    registrationNumber: Yup.string()
      .required("Registration number is required")
      .matches(/^\S+$/, "Registration number should not contain spaces"),
    buisnessTypeId: Yup.string()
      .required("Business Type is required")
      .matches(/^\S+$/, "Please select a valid Business Type"),
    buisnessCategoryId: Yup.string()
      .required("Business Category is required")
      .matches(/^\S+$/, "Please select a valid Business Category"),
    legalName: Yup.string()
      .required("Legal Name is required")
      .matches(
        /^[a-zA-Z\s]+$/,
        "Legal Name should not contain numbers or special characters"
      ),
    taxId: Yup.string()
      .required("Tax ID is required")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "Tax ID should only contain alphanumeric characters"
      ),
    startDate: Yup.date().required("Start date is required"),
    totalCurrentEmployees: Yup.number()
      .required("Total current employees is required")
      .min(0, "Total employees must be 0 or more"),
    contactPerson: Yup.string()
      .required("Contact Person name is required")
      .matches(
        /^[a-zA-Z\s]+$/,
        "Contact Person name should contain only letters and spaces"
      ),
    managementSince: Yup.date().required("Management Since date is required"),
    bankruptcy: Yup.string()
      .required("Bankruptcy status is required")
      .oneOf(["1", "2"], "Bankruptcy status is invalid"),
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email format"),
    totalEPFId: Yup.string().required("Total EPF is required"),
    timeZone: Yup.string()
      .required("Time Zone is required")
      .oneOf(
        [
          "UTC",
          "UTC-12:00",
          "UTC-11:00",
          "UTC-10:00",
          "UTC-09:00",
          "UTC-08:00",
          "UTC-07:00",
          "UTC-06:00",
          "UTC-05:00",
          "UTC-04:00",
          "UTC-03:00",
          "UTC-02:00",
          "UTC-01:00",
          "UTC+00:00",
          "UTC+01:00",
          "UTC+02:00",
          "UTC+03:00",
          "UTC+04:00",
          "UTC+05:00",
          "UTC+06:00",
          "UTC+07:00",
          "UTC+08:00",
          "UTC+09:00",
          "UTC+10:00",
          "UTC+11:00",
          "UTC+12:00",
        ],
        "Invalid Time Zone"
      ),
    addrs: Yup.string().required("Address is required"),
    countryId: Yup.string()
      .required("Country is required")
      .matches(/^\S+$/, "Please select a valid country"),
    postalAddressType: Yup.string().required("Postal Address Type is required"),
    buildingNumber: Yup.string().required("Building Number is required"),
    address1: Yup.string().required("Address Line 1 is required"),
    zip: Yup.string()
      .required("ZIP code is required")
      .matches(/^\d{5,9}$/, "ZIP code should be 5 to 9 digits"),
    cityId: Yup.string()
      .required("City is required")
      .matches(/^\S+$/, "Please select a valid city"),
    phone3: Yup.string()
      .required("Phone number is required")
      .matches(
        /^\d{11}$/,
        "Phone number should be 11 digits including the country code"
      ),
  });

  const getBussinessCategoryById = (id: any) => {
    const entry: any = Category?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const getBussinessTypeById = (id: any) => {
    const entry: any = businessType?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const getCityById = (id: any) => {
    let entry: any = "Not found";
    city?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
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
  const MyStepButtons = () => {
    const { values, validateForm, setFieldTouched, setFieldValue } =
      useFormikContext<any>();
    const handleStepSubmit = async () => {
      const errors = await validateForm();

      // If any field in current tab has error, don't proceed
      const currentFields = tabFieldMap[currentTab];
      const hasErrors = currentFields.some((field: any) => errors[field]);

      if (hasErrors) {
        // Touch fields so errors show
        currentFields.forEach((field: any) => setFieldTouched(field, true));
        return;
      }

      // Now you can safely submit step data
      switch (currentTab) {
        case "optional":
          const payload1 = {
            type: 2,
            tenantId: "9a2b9110-bee8-426d-e898-08dc816bf110",
            buisnessDto: {
              // customerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
              // buisnessId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
              unn: values.unn,
              commercialRegistrationNumber:
                values.registrationNumber.toString(),
              name: values.name,
              buisnessCategoryId: values.buisnessCategoryId,
              buisnessCategory: getBussinessCategoryById(
                values.buisnessCategoryId
              ),
              buisnessTypeId: values.buisnessTypeId,
              buisnessType: getBussinessTypeById(values.buisnessTypeId),
              legalName: values.legalName,
              taxId: values.taxId,
              email: values.email,
              contactPerson: values.contactPerson,
              startDate: values.startDate,
              managementSince: values.managementSince,
              bankruptcy: Number(values.bankruptcy),
              skip: values.skip,
              stopCorrespondence: values.stopCorrespondence ? true : false,
              privacyOptOut: values.privacyOptOut,
              insuranceOptOut: values.insuranceOptOut,
              marketingOptOut: values.marketingOptOut,
              sharedCreditOptOut: values.sharedCreditOptOut,
              totalCurrentEmployees: Number(values.totalCurrentEmployees),
              totalEPFId: values.totalEPFId,
              totalEPF: epfName,
              timeZone: values.timeZone,
            },
          };
          await toast.promise(
            createBussinessEmployee(payload1), // API call
            {
              loading: "Creating individual account...", // While request is pending
              success: (response) => {
                if (
                  response?.data?.notificationMessage ===
                  "Operation successful."
                ) {
                  setFieldValue("customerId", response?.data?.data?.customerId);
                  setFieldValue("buisnessId", response?.data?.data?.id);
                  const currentIndex = tabOrder.indexOf(currentTab);
                  if (currentIndex < tabOrder.length - 1) {
                    setCurrentTab(tabOrder[currentIndex + 1]);
                  }

                  return "Individual account created successfully";
                } else {
                  throw new Error(
                    response?.data?.errors?.errors[0] ||
                      "Failed to create account."
                  );
                }
              },
              error: (err) =>
                err?.message ||
                "Something went wrong while creating the individual account.",
            }
          );
          break;
        case "partnerDetails":
          const payload2 = values?.partners.map((partner: any) => ({
            buisnessId: values.buisnessId,
            partnerId: partner.partnerId,
            permissionToCall: partner.permissionToCall,
            permissionToText: partner.permissionToText,
            firstName: partner.firstName,
            middleName: partner.middleName,
            lastName: partner.lastName,
            suffix: partner.suffix,
            nationalId: partner.nationalId,
            dob: partner.dob,
            birthPlaceId: partner.birthPlace,
            birthPlace: getCityById(partner.birthPlace),
            isDirector: partner.isDirector,
            netWorth: partner.netWorth,
            grossIncome: partner.grossIncome,
            languageId: partner.language,
            language: getLanguageById(partner?.language),
            nationalityId: partner.nationalityId,
            nationality: getCountryById(partner?.nationalityId),
            title: partner.title,
            ownershipPercentage: partner.ownershipPercentage,
            email: partner.email2,
            phone: partner.phone,
            extention: partner.extention,
          }));
          await toast.promise(
            createPartner(payload2), // API call
            {
              loading: "Adding partner details...", // While request is pending
              success: (response) => {
                if (
                  response?.data?.notificationMessage ===
                  "Operation successful."
                ) {
                  const currentIndex = tabOrder.indexOf(currentTab);
                  if (currentIndex < tabOrder.length - 1) {
                    setCurrentTab(tabOrder[currentIndex + 1]);
                  }

                  return "Partner details added successfully";
                } else {
                  throw new Error(
                    response?.data?.errors?.errors[0] ||
                      "Failed to add partner details."
                  );
                }
              },
              error: (err) =>
                err?.message ||
                "Something went wrong while creating the adding partner details.",
            }
          );
          break;
        case "businessAddress":
          const payload3 = {
            customerId: values.customerId,
            type: Number(values.type),
            current: values.current,
            confirmed: values.confirmed,
            permissionToCall: values.permissionToCall2,
            mailing: values.mailing,
            addrs: values.addrs,
            permissionToText: values.permissionToText2,
            countryId: values.countryId,
            postalAddressType: values.postalAddressType,
            streetPre: values.streetPre,
            streetName: values.streetName,
            streetType: values.streetType,
            buildingNumber: values.buildingNumber,
            address1: values.address1,
            address2: values.address2,
            address3: values.address3,
            zip: values.zip,
            zipExtention: values.zipExtention,
            cityId: values.cityId,
            city: getCityById(values?.cityId),
            country: getCountryById(values?.countryId),
            phone: values.phone3,
            timeZone: values.timeZone2,
            comment: values.comment,
          };
          await toast.promise(
            createAdress(payload3), // API call
            {
              loading: "Adding address details...", // While request is pending
              success: (response) => {
                if (
                  response?.data?.notificationMessage ===
                  "Operation successful."
                ) {
                  navigate("/lms/Customers/Business");

                  return "Address details added successfully";
                } else {
                  throw new Error(
                    response?.data?.errors?.errors[0] ||
                      "Failed to add address details."
                  );
                }
              },
              error: (err) =>
                err?.message ||
                "Something went wrong while creating the adding address.",
            }
          );
          break;
      }
    };

    return (
      <Button className="application-btn" onClick={handleStepSubmit}>
        Submit Step
      </Button>
    );
  };
  const handleSubmit = async (values: any) => {
    const { partners, ...formField } = values;

    try {
      const body = {
        type: 2,
        tenantId: "9a2b9110-bee8-426d-e898-08dc816bf110",
        buisnessDto: {
          customerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          buisnessId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          unn: formField.unn,
          commercialRegistrationNumber: formField.registrationNumber.toString(),
          name: formField.name,
          buisnessCategoryId: formField.buisnessCategoryId,
          buisnessCategory: getBussinessCategoryById(
            formField.buisnessCategoryId
          ),
          buisnessTypeId: formField.buisnessTypeId,
          buisnessType: getBussinessTypeById(formField.buisnessTypeId),
          legalName: formField.legalName,
          taxId: formField.taxId,
          email: formField.email,
          contactPerson: formField.contactPerson,
          startDate: formField.startDate,
          managementSince: formField.managementSince,
          bankruptcy: Number(formField.bankruptcy),
          skip: formField.skip,
          stopCorrespondence: formField.stopCorrespondence ? true : false,
          privacyOptOut: formField.privacyOptOut,
          insuranceOptOut: formField.insuranceOptOut,
          marketingOptOut: formField.marketingOptOut,
          sharedCreditOptOut: formField.sharedCreditOptOut,
          totalCurrentEmployees: Number(formField.totalCurrentEmployees),
          totalEPFId: formField.totalEPFId,
          totalEPF: epfName,
          timeZone: formField.timeZone,
        },
        partnerDto: partners.map((partner: any) => ({
          partnerId: partner.partnerId,
          permissionToCall: partner.permissionToCall,
          permissionToText: partner.permissionToText,
          firstName: partner.firstName,
          middleName: partner.middleName,
          lastName: partner.lastName,
          suffix: partner.suffix,
          nationalId: partner.nationalId,
          dob: partner.dob,
          birthPlaceId: partner.birthPlace,
          birthPlace: getCityById(partner.birthPlace),
          isDirector: partner.isDirector,
          netWorth: partner.netWorth,
          grossIncome: partner.grossIncome,
          languageId: partner.language,
          language: getLanguageById(partner?.language),
          nationalityId: partner.nationalityId,
          nationality: getCountryById(partner?.nationalityId),
          title: partner.title,
          ownershipPercentage: partner.ownershipPercentage,
          email: partner.email2,
          phone: partner.phone,
          extention: partner.extention,
        })),
        addressDto: {
          type: Number(formField.type),
          current: formField.current,
          confirmed: formField.confirmed,
          permissionToCall: formField.permissionToCall2,
          mailing: formField.mailing,
          addrs: formField.addrs,
          permissionToText: formField.permissionToText2,
          countryId: formField.countryId,
          postalAddressType: formField.postalAddressType,
          streetPre: formField.streetPre,
          streetName: formField.streetName,
          streetType: formField.streetType,
          buildingNumber: formField.buildingNumber,
          address1: formField.address1,
          address2: formField.address2,
          address3: formField.address3,
          zip: formField.zip,
          zipExtention: formField.zipExtention,
          cityId: formField.cityId,
          city: getCityById(formField?.cityId),
          country: getCountryById(formField?.countryId),
          phone: formField.phone3,
          timeZone: formField.timeZone2,
          comment: formField.comment,
        },
      };

      // Use toast.promise for automatic loading, success, and error handling
      await toast.promise(
        createBussinessEmployee(body), // API call
        {
          loading: "Creating business account...", // Loading message
          success: (response) => {
            if (
              response?.data?.notificationMessage === "Operation successful."
            ) {
              navigate("/lms/Customers/Business");
              return "Business account created successfully";
            } else {
              throw new Error(
                response?.data.errors?.[0] || "An unexpected error occurred."
              );
            }
          },
          error: (err) =>
            err?.message ||
            "Something went wrong while creating the business account.",
        }
      );
    } catch (error: any) {
      console.error("Error occurred:", error);
    }
  };

  const getBusinessCategory = async () => {
    try {
      const res = await GetAllBusinessCategory(1, 1000);
      if (res) {
        const data = res.data.data;
        setCategory(data);
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
        setbusinessType(data || []);
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
        setLanguageId(data || []);
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
        setCity(data || []);
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
        setCountry(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */

  const fetchAllEPF = async () => {
    try {
      const res = await GetTotalEPF(1, 1000);
      if (res) {
        const data = res.data.data;
        setEpf(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const handleNext = async (
    validateForm: any,
    setFieldTouched: any,
    currentTabFields: any
  ) => {
    // Mark all fields in the current tab as touched
    currentTabFields.forEach((field: any) => setFieldTouched(field, true));

    // Validate the form
    const errors = await validateForm();

    // Check for errors in the current tab's fields
    const hasErrors = currentTabFields.some((field: any) => errors[field]);

    if (!hasErrors) {
      const currentIndex = tabOrder.indexOf(currentTab);
      if (currentIndex < tabOrder.length - 1) {
        setCurrentTab(tabOrder[currentIndex + 1]);
      }
    } else {
      return;
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabOrder.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabOrder[currentIndex - 1]);
    }
  };

  const handleTabSelect = async (
    selectedTab: any,
    validateForm: any,
    setFieldTouched: any,
    tabFieldMap: any
  ) => {
    // Validate current tab fields
    const currentTabFields = tabFieldMap[currentTab]; // currentTab is the active tab state
    currentTabFields.forEach((field: any) => setFieldTouched(field, true)); // Mark fields as touched
    const errors = await validateForm(); // Get validation errors

    const hasErrors = currentTabFields.some((field: any) => errors[field]);

    if (!hasErrors) {
      // No errors, allow tab change
      setCurrentTab(selectedTab); // Update the current tab state
    } else {
      return;
    }
  };

  const tabFieldMap: any = {
    businessInfo: [
      "registrationNumber",
      "buisnessTypeId",
      "buisnessCategoryId",
      "legalName",
      "taxId",
      "startDate",
      "totalCurrentEmployees",
      "contactPerson",
      "managementSince",
      "bankruptcy",
      "email",
      "totalEPFId",
      "timeZone",
    ],
    optional: [], // No mandatory fields for this tab
    partnerDetails: [
      "partnerId",
      "firstName",
      "middleName",
      "partners.lastName",
      "partners.nationalId",
      "partners[0].dob",
      "partners[0].birthPlace",
      "partners[0].netWorth",
      "partners[0].grossIncome",
      "partners[0].language",
      "partners[0].nationalityId",
      "partners[0].title",
      "partners[0].email2",
      "partners[0].phone",
    ],
    businessAddress: [
      "addrs",
      "countryId",
      "postalAddressType",
      "buildingNumber",
      "address1",
      "zip",
      "cityId",
      "phone3",
    ],
  };

  useEffect(() => {
    getBusinessCategory();
    getBusinessType();
    //getCountryBusiness();
    //getCitiesBusiness();
    //getLanguageBusiness();
    fetchAllEPF();
    return () => {};
  }, []);

  const enums = {
    TimeZone: [
      { value: "UTC", label: "UTC" },
      { value: "UTC-12:00", label: "UTC-12:00" },
      { value: "UTC-11:00", label: "UTC-11:00" },
      { value: "UTC-10:00", label: "UTC-10:00" },
      { value: "UTC-09:00", label: "UTC-09:00" },
      { value: "UTC-08:00", label: "UTC-08:00" },
      { value: "UTC-07:00", label: "UTC-07:00" },
      { value: "UTC-06:00", label: "UTC-06:00" },
      { value: "UTC-05:00", label: "UTC-05:00" },
      { value: "UTC-04:00", label: "UTC-04:00" },
      { value: "UTC-03:00", label: "UTC-03:00" },
      { value: "UTC-02:00", label: "UTC-02:00" },
      { value: "UTC-01:00", label: "UTC-01:00" },
      { value: "UTC+00:00", label: "UTC+00:00" },
      { value: "UTC+01:00", label: "UTC+01:00" },
      { value: "UTC+02:00", label: "UTC+02:00" },
      { value: "UTC+03:00", label: "UTC+03:00" },
      { value: "UTC+04:00", label: "UTC+04:00" },
      { value: "UTC+05:00", label: "UTC+05:00" },
      { value: "UTC+06:00", label: "UTC+06:00" },
      { value: "UTC+07:00", label: "UTC+07:00" },
      { value: "UTC+08:00", label: "UTC+08:00" },
      { value: "UTC+09:00", label: "UTC+09:00" },
      { value: "UTC+10:00", label: "UTC+10:00" },
      { value: "UTC+11:00", label: "UTC+11:00" },
      { value: "UTC+12:00", label: "UTC+12:00" },
    ],
    AddressType: [
      { value: 1, label: "Office" },
      { value: 2, label: "Home" },
      { value: 3, label: "Billing" },
      { value: 4, label: "Shipping" },
    ],
    Bankruptcy: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
  };

  return (
    <>
      <div>
        <Modal
          size="lg"
          show={buisnessForm}
          onHide={() => {
            setBusinessForm(false);
          }}
          backdrop="static"
        >
          <ModalHeader closeButton></ModalHeader>

          <Formik
            initialValues={{
              registrationNumber: "",
              name: "",
              unn: 0,
              buisnessCategoryId: "",
              buisnessTypeId: "",
              legalName: "",
              taxId: "",
              email: "",
              contactPerson: "",
              startDate: new Date(),
              managementSince: new Date(),
              bankruptcy: 0,
              skip: false,
              stopCorrespondence: false,
              privacyOptOut: false,
              insuranceOptOut: false,
              marketingOptOut: false,
              sharedCreditOptOut: false,
              totalCurrentEmployees: 0,
              totalEPFId: "",
              timeZone: "",
              partners: [
                {
                  partnerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                  permissionToCall: false,
                  permissionToText: false,
                  firstName: "",
                  middleName: "",
                  lastName: "",
                  suffix: "",
                  nationalId: "",
                  dob: new Date(),
                  birthPlace: "",
                  isDirector: false,
                  netWorth: 0,
                  grossIncome: 0,
                  language: "",
                  nationalityId: "",
                  title: "",
                  ownershipPercentage: "",
                  email2: "",
                  phone: "",
                  extention: "",
                },
              ],
              type: "",
              current: false,
              confirmed: false,
              permissionToCall2: false,
              mailing: false,
              addrs: "",
              permissionToText2: false,
              countryId: "",
              postalAddressType: "",
              streetPre: "",
              streetName: "",
              streetType: "",
              buildingNumber: "",
              address1: "",
              address2: "",
              address3: "",
              zip: "",
              zipExtention: "",
              cityId: "",
              phone3: "",
              timeZone2: "",
              comment: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              setFieldValue,
              validateForm,
              setFieldTouched,
            }: any) => {
              return (
                <Form className="p-4">
                  <Modal.Body
                    className="modal-body-scroll"
                    style={{
                      maxHeight: "80vh",
                      overflowY: "auto",
                      marginBottom: "14px",
                    }}
                  >
                    <Tabs
                      defaultActiveKey="businessInfo"
                      activeKey={currentTab}
                      onSelect={(selectedTab) =>
                        handleTabSelect(
                          selectedTab,
                          validateForm,
                          setFieldTouched,
                          tabFieldMap
                        )
                      }
                      className="mb-3 py-4"
                    >
                      <Tab
                        eventKey="businessInfo"
                        title="Business Information"
                        style={{ marginRight: "10px" }}
                      >
                        <Row>
                          <Col md={6}>
                            <label
                              htmlFor="registrationNumber"
                              className="mb-1 customer-fs-fw"
                            >
                              Registration No.<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder=" Registration No"
                              id="registrationNumber"
                              type="text"
                              name="registrationNumber"
                              className="form-control"
                              min={5}
                            />

                            <ErrorMessage
                              name="registrationNumber"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="name"
                              className="mb-1 customer-fs-fw"
                            >
                              Name
                            </label>
                            <Field
                              placeholder="Name"
                              id="name"
                              type="text"
                              name="name"
                              className="form-control"
                            />

                            <ErrorMessage
                              name="name"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-3">
                          <Col md={6}>
                            <label
                              htmlFor="buisnessTypeId"
                              className="mb-1 customer-fs-fw"
                            >
                              Business Type<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Business Type"
                              id="buisnessTypeId"
                              as="select"
                              name="buisnessTypeId"
                              className=" form-control"
                              onChange={(e: any) => {
                                setFieldValue("buisnessTypeId", e.target.value);
                              }}
                            >
                              <option label="Select Type" />
                              {businessType &&
                                businessType.map((item: any) => (
                                  <option
                                    key={item.id}
                                    value={item.id}
                                    onClick={() => {
                                      setBusinessTypeName(item?.name);
                                    }}
                                  >
                                    {item.name}
                                  </option>
                                ))}
                            </Field>

                            <ErrorMessage
                              name="buisnessTypeId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="buisnessCategoryId"
                              className="mb-1 customer-fs-fw"
                            >
                              Category<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Category"
                              id="buisnessCategoryId"
                              as="select"
                              name="buisnessCategoryId"
                              className=" form-control"
                              onChange={(e: any) => {
                                setFieldValue(
                                  "buisnessCategoryId",
                                  e.target.value
                                );
                              }}
                            >
                              <option label="Select Category" />
                              {Category &&
                                Category.map((item: any) => (
                                  <option
                                    key={item.id}
                                    value={item.id}
                                    onClick={() => {
                                      setBusinessCategoryName(item.name);
                                    }}
                                  >
                                    {item.name}
                                  </option>
                                ))}
                            </Field>
                            <ErrorMessage
                              name="buisnessCategoryId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-3">
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Legal Name<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder=" Legal Name"
                              id="legalName"
                              type="text"
                              name="legalName"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="legalName"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Tax ID<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder=" Tax ID"
                              id=" taxId"
                              type="text"
                              name="taxId"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="taxId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-3">
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Start Date
                            </label>
                            <Field
                              placeholder="Start Date"
                              id="startDate"
                              type="date"
                              name="startDate"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="startDate"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw "
                            >
                              Total Current Employees
                            </label>
                            <Field
                              placeholder=" Total Current Employees"
                              id=" totalCurrentEmployees"
                              type="text"
                              name="totalCurrentEmployees"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="totalCurrentEmployees"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-3">
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Contact Person<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Contact Person"
                              id="contactPerson"
                              type="text"
                              name="contactPerson"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="contactPerson"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Management Since
                            </label>
                            <Field
                              placeholder="Managment Since"
                              id="managementSince"
                              type="date"
                              name="managementSince"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="managementSince"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>

                          <Col md={6}>
                            <Checkbox
                              className=""
                              type="checkbox"
                              id="stopCorrespondence"
                              name="stopCorrespondence"
                            />
                            <label
                              htmlFor="companyName"
                              className="mt-4 ms-2"
                              style={{ fontSize: "14px" }}
                            >
                              Stop Correspondence
                            </label>
                            <ErrorMessage
                              name="stopCorrespondence"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <Checkbox
                              className=""
                              type="checkbox"
                              id="skip"
                              name="skip"
                            />
                            <label
                              htmlFor="companyName"
                              className="mt-4 ms-2"
                              style={{ fontSize: "14px" }}
                            >
                              Skip
                            </label>
                            <ErrorMessage
                              name="skip"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-3">
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Bankruptucy<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Bankcruptucy"
                              id="bankruptcy"
                              as="select"
                              name="bankruptcy"
                              className=" form-control"
                            >
                              <option
                                value=""
                                label="Select bankruptcy status"
                              />
                              {enums.Bankruptcy.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>

                            <ErrorMessage
                              name="bankruptcy"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Email<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="info@mytm.com"
                              id="email"
                              type="text"
                              name="email"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="email"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-3">
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Time Zone<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Time Zone"
                              id="timeZone"
                              as="select"
                              name="timeZone"
                              className=" form-control"
                            >
                              <option value="" label="Select Time Zone" />
                              {enums.TimeZone.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>

                            <ErrorMessage
                              name="timeZone"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>

                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Total EPF<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Total EPF"
                              id="totalEPFId"
                              as="select"
                              name="totalEPFId"
                              className=" form-control"
                              onChange={(e: any) => {
                                setFieldValue("totalEPFId", e.target.value);
                              }}
                            >
                              <option label="Select Total EPF" />
                              {epf &&
                                epf.map((item: any) => (
                                  <option
                                    key={item.id}
                                    value={item.id}
                                    onClick={() => {
                                      setEpfName(
                                        `${item.minimumEFP}-${item.maximumEFP}`
                                      );
                                    }}
                                  >
                                    {`${item.minimumEFP}-${item.maximumEFP}`}
                                  </option>
                                ))}
                            </Field>

                            <ErrorMessage
                              name="totalEPFId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-3">
                          <Col md={6}>
                            <label
                              htmlFor="unn"
                              className="mb-1 customer-fs-fw"
                            >
                              UNN
                            </label>
                            <Field
                              placeholder="Enter unn"
                              id="unn"
                              type="number"
                              name="unn"
                              className="form-control"
                            />

                            <ErrorMessage
                              name="unn"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                      </Tab>

                      <Tab eventKey="optional" title="Optional">
                        <Row className="pt-3">
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="privacyOptOut"
                                id="privacyOptOut"

                                // checked={isChecked}
                                // onChange={handleCheckboxChange}
                              />
                              <label htmlFor="" className="ms-2 customer-fs-fw">
                                Privacy Opt-in
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="insuranceOptOut"
                                id="insuranceOptOut"

                                // checked={isChecked}
                                // onChange={handleCheckboxChange}
                              />
                              <label htmlFor="" className="ms-2 customer-fs-fw">
                                Insurance Opt-in
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="marketingOptOut"
                                id="marketingOptOut"

                                // checked={isChecked}
                                // onChange={handleCheckboxChange}
                              />
                              <label htmlFor="" className="ms-2 customer-fs-fw">
                                Marketing Opt-in
                              </label>
                            </div>
                          </Col>
                          <Col md={4} className="mt-4 mb-4">
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="sharedCreditOptOut"
                                id="sharedCreditOptOut"

                                // checked={isChecked}
                                // onChange={handleCheckboxChange}
                              />
                              <label htmlFor="" className="ms-2 customer-fs-fw">
                                Share Credit Opt-in
                              </label>
                            </div>
                          </Col>
                        </Row>
                      </Tab>

                      <Tab eventKey="partnerDetails" title="Partner Details">
                        <FieldArray name="partners">
                          {({ push, remove }: any) => (
                            <>
                              {values.partners.map(
                                (partner: any, index: any) => (
                                  <>
                                    <div key={index}>
                                      <Row className="pt-3">
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            First Name
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="First Name"
                                            name={`partners.${index}.firstName`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.firstName`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Middle Name
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="Middle Name"
                                            name={`partners.${index}.middleName`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.middleName`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="pt-3">
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Last Name
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="Last Name"
                                            name={`partners.${index}.lastName`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.lastName`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Suffix
                                          </label>
                                          <Field
                                            placeholder="Suffix"
                                            name={`partners.${index}.suffix`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.suffix`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="pt-3">
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Date of Birth
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="Date of Birth"
                                            name={`partners.${index}.dob`}
                                            type="date"
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.dob`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Birth Place
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            as="select"
                                            placeholder="Birth Place"
                                            id="birthPlace"
                                            name={`partners.${index}.birthPlace`}
                                            className="form-control"
                                          >
                                            <option
                                              value=""
                                              label="Select type"
                                            />
                                            {city &&
                                              city.map((item: any) => (
                                                <option
                                                  key={item.id}
                                                  value={item.id}
                                                  onClick={() => {
                                                    setPartnerBirthPlace(
                                                      item.name
                                                    );
                                                  }}
                                                >
                                                  {item.name}
                                                </option>
                                              ))}
                                          </Field>

                                          <ErrorMessage
                                            name={`partners.${index}.birthPlace`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="pt-3">
                                        <Col
                                          className="d-flex align-items-center"
                                          md={6}
                                        >
                                          <Checkbox
                                            type="checkbox"
                                            name={`partners.${index}.isDirector`}
                                            checked={
                                              values.partners[index].isDirector
                                            }
                                            onChange={(e) =>
                                              setFieldValue(
                                                `partners.${index}.isDirector`,
                                                e.target.checked
                                              )
                                            }
                                          />
                                          <label
                                            className="ms-2"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 700,
                                            }}
                                          >
                                            Is Director
                                          </label>
                                          <ErrorMessage
                                            name={`partners.${index}.isDirector`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Net Worth
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="Net Worth"
                                            name={`partners.${index}.netWorth`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.netWorth`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="pt-3">
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Gross Income
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="Gross Income"
                                            name={`partners.${index}.grossIncome`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.grossIncome`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Language
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            as="select"
                                            name={`partners.${index}.language`}
                                            className="form-control"
                                            onChange={(e: any) =>
                                              setFieldValue(
                                                `partners.${index}.language`,
                                                e.target.value
                                              )
                                            }
                                          >
                                            <option label="Select Language" />

                                            {languageId &&
                                              languageId.map((item: any) => (
                                                <option
                                                  key={item.id}
                                                  value={item.id}
                                                  label={item.name}
                                                  onClick={() => {
                                                    setLanguageName(item.name);
                                                  }}
                                                />
                                              ))}
                                          </Field>
                                          <ErrorMessage
                                            name={`partners.${index}.language`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="pt-3">
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Ownership Percentage
                                          </label>
                                          <Field
                                            placeholder="Ownership Percentage"
                                            name={`partners.${index}.ownershipPercentage`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.ownershipPercentage`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Email
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="Email"
                                            name={`partners.${index}.email2`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.email2`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="pt-3">
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Phone Number
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="Phone Number"
                                            name={`partners.${index}.phone`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.phone`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Extension
                                          </label>
                                          <Field
                                            placeholder="Extension"
                                            name={`partners.${index}.extention`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.extention`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="pt-4 pb-2">
                                        <Col
                                          className="d-flex align-items-center"
                                          md={6}
                                        >
                                          <Checkbox
                                            type="checkbox"
                                            name={`partners.${index}.permissionToCall`}
                                            checked={
                                              values.partners[index]
                                                .permissionToCall
                                            }
                                            onChange={(e) =>
                                              setFieldValue(
                                                `partners.${index}.permissionToCall`,
                                                e.target.checked
                                              )
                                            }
                                          />
                                          <label
                                            className="ms-2"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 700,
                                            }}
                                          >
                                            Permission to Call
                                          </label>
                                          <ErrorMessage
                                            name={`partners.${index}.permissionToCall`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                        <Col
                                          className="d-flex align-items-center"
                                          md={6}
                                        >
                                          <Checkbox
                                            type="checkbox"
                                            name={`partners.${index}.permissionToText`}
                                            checked={
                                              values.partners[index]
                                                .permissionToText
                                            }
                                            onChange={(e) =>
                                              setFieldValue(
                                                `partners.${index}.permissionToText`,
                                                e.target.checked
                                              )
                                            }
                                          />
                                          <label
                                            className="ms-2"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 700,
                                            }}
                                          >
                                            Permission to Text
                                          </label>
                                          <ErrorMessage
                                            name={`partners.${index}.permissionToText`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="pt-3">
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Nationality
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            as="select"
                                            name={`partners.${index}.nationalityId`}
                                            className="form-control"
                                            onChange={(e: any) =>
                                              setFieldValue(
                                                `partners.${index}.nationalityId`,
                                                e.target.value
                                              )
                                            }
                                          >
                                            <option label="Select Nationality" />
                                            {/* Assuming languageId is an array from props */}
                                            {country &&
                                              country.map((item: any) => (
                                                <option
                                                  key={item.id}
                                                  value={item.id}
                                                  onClick={() => {
                                                    setPartnerNationalityName(
                                                      item?.name
                                                    );
                                                  }}
                                                  label={
                                                    item.name ? item.name : "-"
                                                  }
                                                />
                                              ))}
                                          </Field>
                                          <ErrorMessage
                                            name={`partners.${index}.nationalityId`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            National Id
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="National Id"
                                            name={`partners.${index}.nationalId`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.nationalId`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>
                                      <Row className="pt-3">
                                        <Col md={6}>
                                          <label
                                            className="mb-1"
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Title
                                            <span style={{ color: "red" }}>
                                              {" "}
                                              *
                                            </span>
                                          </label>
                                          <Field
                                            placeholder="title"
                                            name={`partners.${index}.title`}
                                            className="form-control"
                                          />
                                          <ErrorMessage
                                            name={`partners.${index}.title`}
                                            component="div"
                                            className="invalid-feedback text-danger"
                                          />
                                        </Col>
                                      </Row>
                                      {values.partners.length > 1 && (
                                        <Row>
                                          <Col className="text-right">
                                            <button
                                              type="button"
                                              className="btn theme-btn-next mt-3"
                                              onClick={() => remove(index)}
                                              disabled={
                                                values.partners.length === 1
                                              }
                                            >
                                              Remove Partner
                                            </button>
                                          </Col>
                                        </Row>
                                      )}
                                    </div>
                                  </>
                                )
                              )}

                              <button
                                type="button"
                                className="btn theme-btn-next mt-4"
                                onClick={() =>
                                  push({
                                    firstName: "",
                                    middleName: "",
                                    lastName: "",
                                    suffix: "",
                                    dob: "",
                                    birthPlace: "",
                                    isDirector: false,
                                    netWorth: "",
                                    grossIncome: "",
                                    language: "",
                                    nationalityId: "",
                                    title: "",
                                    ownershipPercentage: "",
                                    email2: "",
                                    phone: "",
                                    extention: "",
                                    permissionToCall: false,
                                  })
                                }
                              >
                                Add New Partner
                              </button>
                            </>
                          )}
                        </FieldArray>
                      </Tab>

                      <Tab
                        eventKey="businessAddress"
                        title="Business Address Details"
                      >
                        <Row className="pt-2 p=1 col-12">
                          <Col md={6} className="mb-4">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Address<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Address"
                              id="addrs"
                              type="text"
                              name="addrs"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="addrs"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Country<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Country"
                              id="countryId"
                              as="select"
                              name="countryId"
                              className=" form-control"
                              onChange={(e: any) => {
                                setFieldValue("countryId", e.target.value);
                              }}
                            >
                              <option label="Select Country"></option>
                              {country &&
                                country.map((item: any) => (
                                  <option
                                    key={item.id}
                                    value={item.id}
                                    onClick={() => {
                                      setCountryName(
                                        item.name ? item.name : "-"
                                      );
                                    }}
                                    label={item.name ? item.name : "-"}
                                  />
                                ))}
                            </Field>

                            <ErrorMessage
                              name="countryId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-3 p-3">
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="current"
                                id="current"

                                // checked={isChecked}
                                // onChange={handleCheckboxChange}
                              />
                              <label htmlFor="" className="ms-2">
                                Current
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="confirmed"
                                id="confirmed"

                                // checked={isChecked}
                                // onChange={handleCheckboxChange}
                              />
                              <label htmlFor="" className="ms-2">
                                Confirmed
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="mailing"
                                id="mailing"
                              />
                              <label htmlFor="" className="ms-2">
                                Mailing
                              </label>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mt-1">
                          <Col md={6} className="mb-2">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Type
                            </label>
                            <Field
                              placeholder="Type"
                              id="type"
                              as="select"
                              name="type"
                              className=" form-control"
                            >
                              <option
                                value=""
                                label="Select Address Type"
                              ></option>
                              {enums.AddressType.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>

                            <ErrorMessage
                              name="type"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="mb-2">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Postal Address Type
                              <span style={{ color: "red" }}> *</span>
                            </label>
                            <Field
                              placeholder=" Postal Address Type"
                              id=" postalAddressType"
                              type="text"
                              name="postalAddressType"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="postalAddressType"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          {/* <Col md={6} className="mb-2">
                        <label
                          htmlFor="companyName"
                          className="mb-1"
                                    style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          Phone
                        </label>
                        <Field
                          placeholder="Phone"
                          id="phone2"
                          type="text"
                          name="phone2"
                          className=" form-control"
                        />

                        <ErrorMessage
                          name="phone2"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col> */}
                        </Row>
                        <Row className="pt-3 p-2">
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="permissionToCall2"
                                id="permissionToCall2"

                                // checked={isChecked}
                                // onChange={handleCheckboxChange}
                              />
                              <label
                                htmlFor=""
                                className="ms-2"
                                style={{ fontWeight: 500 }}
                              >
                                Permission to Call
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="permissionToText2"
                                id="permissionToText2"

                                // checked={isChecked}
                                // onChange={handleCheckboxChange}
                              />
                              <label
                                htmlFor=""
                                className="ms-2"
                                style={{ fontWeight: 500 }}
                              >
                                Permission to Text
                              </label>
                            </div>
                          </Col>
                        </Row>
                        <Row className="pt-3">
                          <Col md={6}>
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Street Pre
                            </label>
                            <Field
                              placeholder="Street Pre"
                              id="streetPre"
                              type="text"
                              name="streetPre"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="streetPre"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>

                          <Col md={6} className="">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Street Name
                            </label>
                            <Field
                              placeholder="Street Name"
                              id="streetName"
                              type="text"
                              name="streetName"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="streetName"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Street Type
                            </label>
                            <Field
                              placeholder="Street Type"
                              id="streetType"
                              type="text"
                              name="streetType"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="streetType"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Building Number
                              <span style={{ color: "red" }}> *</span>
                            </label>
                            <Field
                              placeholder="Building Number"
                              id="buildingNumber"
                              type="text"
                              name="buildingNumber"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="buildingNumber"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Address1<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Address1"
                              id="address1"
                              type="text"
                              name="address1"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="address1"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Address2
                            </label>
                            <Field
                              placeholder="Address2"
                              id="address2"
                              type="text"
                              name="address2"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="address2"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Address3
                            </label>
                            <Field
                              placeholder="Address3"
                              id="address3"
                              type="text"
                              name="address3"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="address3"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Zip<span style={{ color: "red" }}> *</span>
                            </label>
                            <Field
                              placeholder="Zip"
                              id="zip"
                              type="text"
                              name="zip"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="zip"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Zip Extention
                            </label>
                            <Field
                              placeholder="Zip Extention"
                              id="zipExtention"
                              type="text"
                              name="zipExtention"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="zipExtention"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              City<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="City"
                              id="cityId"
                              as="select"
                              name="cityId"
                              className=" form-control"
                              onChange={(e: any) => {
                                setFieldValue("cityId", e.target.value);
                              }}
                            >
                              <option label="Select City"></option>
                              {city &&
                                city.map((item: any) => (
                                  <option
                                    key={item.id}
                                    value={item.id}
                                    label={item.name}
                                    onClick={() => {
                                      setCityName(item?.name);
                                    }}
                                  />
                                ))}
                            </Field>

                            <ErrorMessage
                              name="cityId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Phone<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Phone"
                              id="phone3"
                              type="text"
                              name="phone3"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="phone3"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="pt-3 mb-4">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Time Zone
                            </label>
                            <Field
                              placeholder="Time Zone"
                              id="timeZone2"
                              as="select"
                              name="timeZone2"
                              className=" form-control"
                            >
                              <option
                                value=""
                                label="Select Time Zone"
                              ></option>
                              {enums.TimeZone.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>

                            <ErrorMessage
                              name="timeZone2"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="">
                            <label
                              htmlFor="companyName"
                              className="mb-1 customer-fs-fw"
                            >
                              Comment
                            </label>
                            <Field
                              placeholder="Comment"
                              id="comment"
                              type="text"
                              name="comment"
                              className=" form-control"
                            />

                            <ErrorMessage
                              name="comment"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                      </Tab>
                    </Tabs>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      className="revert-btn"
                      onClick={handlePrevious}
                      disabled={currentTab === tabOrder[0]}
                    >
                      Previous
                    </Button>
                    {[
                       "optional",
                       "partnerDetails",
                       "businessAddress"
                    ].includes(currentTab) ? (
                      <MyStepButtons />
                    ) : (
                      <Button
                        className="application-btn"
                        onClick={() =>
                          handleNext(
                            validateForm,
                            setFieldTouched,
                            tabFieldMap[currentTab]
                          )
                        }
                      >
                        Next
                      </Button>
                    )}
                  </Modal.Footer>
                </Form>
              );
            }}
          </Formik>
        </Modal>
      </div>
    </>
  );
};

export default BuisnessModal;
