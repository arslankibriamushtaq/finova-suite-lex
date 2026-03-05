import { useEffect, useState } from "react";
import { Row, Col, Form, Tab, Tabs } from "react-bootstrap";
import {
  allState,
  getAllRealations,
  getCities,
  getIndividualByCustomerId,
  getLanguage,
  updateIndividualCustomer,
} from "../../redux/apis/apisCrud";
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
    customerId: "",
  });
  const cities = useSelector((state: RootState) => state.block.cities);
  const languages = useSelector((state: RootState) => state.block.languages);
  const states = useSelector((state: RootState) => state.block.states);
  const allRelations = useSelector((state: RootState) => state.block.relations);
  const { customerId } = useParams();
  const [activeTab, setActiveTab] = useState("PersonalInformation");
  const [heading, setHeading] = useState("Personal Information");

  const navigate = useNavigate();

  useEffect(() => {
    if (customerId) {
      individualCustomer(customerId);
    }
    //fetchLanguages();
    //fetchCities();
    //getAllStates();
    //handleAllReason();
  }, [customerId]);

  const individualCustomer = async (customerId: any) => {
    try {
      const res = await getIndividualByCustomerId(customerId);
      if (res) {
        const value = res.data.data;
        setCustomerData(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateCustomerIndividual = async (customerId: any) => {
    setCustomerData({
      customerId: customerId,
    });
    try {
      const res = await updateIndividualCustomer(customerId, customerData);
      if (res) {
        toast.success(res?.data.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error.message);
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
  const handleLanguageChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      individualDto: {
        ...prevState.individualDto,
        languageId: value,
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

  const handleSelect = (key: any) => {
    setActiveTab(key);
    switch (key) {
      case "PersonalInformation":
        setHeading("Personal Information");
        break;
      case "IdentificationDetails":
        setHeading("Identification Details");
        break;
      case "CurrentEmploymentDetails":
        setHeading("Current Employment Details");
        break;
      case "PersonalAddressDetails":
        setHeading("Personal Address Details");
        break;
    }
  };
  const enums = {
    Gender: [
      { value: 1, label: "Male" },
      { value: 2, label: "Female" },
      { value: 3, label: "Non_Binary" },
      { value: 4, label: "Prefer_not_to_say" },
    ],
    Disability: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
    bankCruptcy: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
    Education: [
      { value: 1, label: "Non_Schooling" },
      { value: 2, label: "Primary_Education" },
      { value: 3, label: "Secondary_Education" },
      { value: 4, label: "Accociate_degree" },
      { value: 5, label: "Bechelors_Degree" },
      { value: 6, label: "Master_Degree" },
      { value: 7, label: "Phd_Scholar" },
    ],
    MaritalStatus: [
      { value: 1, label: "Single" },
      { value: 2, label: "Married" },
      { value: 3, label: "Divorce" },
      { value: 4, label: "Widowed" },
      { value: 5, label: "Separated" },
    ],
  };

  const getGenderLabel = (value: any) => {
    const gender = enums.Gender.find((g) => g.value === value);
    return gender ? gender.label : "";
  };
  const getDisability = (value: any) => {
    const gender = enums.Disability.find((g) => g.value === value);
    return gender ? gender.label : "";
  };
  const getEducation = (value: any) => {
    const gender = enums.Education.find((g) => g.value === value);
    return gender ? gender.label : "";
  };
  const getBankCruptcy = (value: any) => {
    const gender = enums.bankCruptcy.find((g) => g.value === value);
    return gender ? gender.label : "";
  };
  const getMaritalStatus = (value: any) => {
    const gender = enums.MaritalStatus.find((g) => g.value === value);
    return gender ? gender.label : "";
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
  const handleRelationChange = (value: string) => {
    setCustomerData((prevState: any) => ({
      ...prevState,
      individualDto: {
        ...prevState.individualDto,
        relationId: value,
      },
    }));
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
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
      type: "text",
      name: "individualDto.maritalStatus",
      value: getMaritalStatus(customerData?.individualDto?.maritalStatus || ""),
    },
    {
      label: "Language",
      type: "select",
      name: "individualDto.languageId",
      value: customerData?.individualDto?.languageId || "",
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
      label: "Stop Correspondence",
      type: "text",
      name: "individualDto.stopCorrespondance",
      value: customerData?.individualDto?.stopCorrespondance || "",
    },
    {
      label: "Disability",
      type: "text",
      name: "individualDto.disability",
      value: getDisability(customerData?.individualDto?.disability || ""),
    },
    {
      label: "Skip",
      type: "text",
      name: "individualDto.skip",
      value: customerData?.individualDto?.skip || "",
    },
    {
      label: "Bankruptcy",
      type: "text",
      name: "individualDto.bankcruptcy",
      value: getBankCruptcy(customerData?.individualDto?.bankcruptcy || ""),
    },
    {
      label: "Insurance Opt-in",
      type: "text",
      name: "individualDto.insuranceOptOut",
      value: customerData?.individualDto?.insuranceOptOut || "",
    },
    {
      label: "Marketing Opt-in",
      type: "text",
      name: "individualDto.marketingOtpOut",
      value: customerData?.individualDto?.marketingOtpOut || "",
    },
    {
      label: "Share Credit Opt-in",
      type: "text",
      name: "individualDto.sharedCreditOtpOut",
      value: customerData?.individualDto?.sharedCreditOtpOut || "",
    },
    {
      label: "Gender",
      type: "text",
      name: "individualDto.gender",
      value: getGenderLabel(customerData?.individualDto?.gender || ""),
    },
    {
      label: "Privacy",
      type: "text",
      name: "individualDto.privacyOptOut",
      value: customerData?.individualDto?.privacyOptOut || "",
    },
    {
      label: "Time Zone",
      type: "text",
      name: "individualDto.timeZone",
      value: customerData?.individualDto?.timeZone || "",
    },
    {
      label: "Education",
      type: "text",
      name: "individualDto.education",
      value: getEducation(customerData?.individualDto?.education || ""),
    },
    // {
    //   label: "Decease Date",
    //   type: "text",
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
      type: "text",
      name: "individualDto.nationality",
      value: customerData?.individualDto?.nationality || "",
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
      type: "text",
      name: "individualDto.activeMilitaryDuty",
      value: customerData?.individualDto?.activeMilitaryDuty || "",
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
      label: "Passport Number",
      type: "text",
      name: "individualDto.fatcaPassportNumber",
      value: customerData?.individualDto?.passportNumber || "",
    },
    {
      label: "Relation",
      type: "select",
      name: "individualDto.fatcaRelation",
      options: allRelations,
      value:
        getReasonDescriptionById(customerData?.individualDto?.relationId) || "",
      onChange: handleRelationChange,
    },
    {
      label: "DOB",
      type: "date",
      name: "individualDto.fatcaDob",
      value: customerData?.individualDto?.dob || "",
    },
  ];

  const PowerAtarny = [
    {
      label: "Comment",
      type: "text",
      name: "individualDto.powerAtarnyComment",
      value: customerData?.individualDto?.issueedPowerOfAttorney || "",
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
      label: "Current",
      type: "checkbox",
      name: "employmentDto.current",
      checked: customerData?.employmentDto?.current || false,
    },
    {},
    {
      label: "phone",
      type: "text",
      name: "employmentDto.phone",
      value: customerData?.employmentDto?.phone || "",
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
      label: "Type",
      type: "text",
      name: "employmentDto.type",
      value: customerData?.employmentDto?.type || "",
    },

    {
      label: "Employer",
      type: "text",
      name: "employmentDto.employer",
      value: customerData?.employmentDto?.employer || "",
    },
    {
      label: "Occupation",
      type: "text",
      name: "employmentDto.occupationId",
      value: customerData?.employmentDto?.occupationId || "",
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
      type: "text",
      name: "employmentDto.countryId",
      value: customerData?.employmentDto?.countryId || "",
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
      type: "text",
      name: "employmentDto.payDay",
      value: customerData?.employmentDto?.payDay || "",
    },
    {
      label: "Next Pay Day",
      type: "text",
      name: "employmentDto.nextPayDay",
      value: customerData?.employmentDto?.nextPayDay || "",
    },
    {
      label: "Frequency",
      type: "text",
      name: "employmentDto.frequency",
      value: customerData?.employmentDto?.frequency || "",
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
      label: "Type",
      type: "text",
      name: "addressDto.type",
      value: customerData?.addressDto?.type || "",
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
      label: "City",
      type: "select",
      name: "addressDto.cityId",
      value: customerData?.addressDto?.cityId || "",
      options: cities,
      onChange: (value: any) => handleCityChange(value, "employmentDto"),
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
      label: "Time Zone",
      type: "text",
      name: "addressDto.timeZone",
      value: customerData?.addressDto?.timeZone || "",
    },
    {
      label: "Comment",
      type: "text",
      name: "addressDto.comment",
      value: customerData?.addressDto?.comment || "",
    },
  ];

  const button = [{ title: "Save and Exit", onClick: handleSaveCustomer }];

  return (
    <>
      <div>
        <h3>{heading}</h3>
        {/*       <TableHeaderFilter button={button} />
         */}{" "}
        <div
          className="p-4"
          style={{ border: "1px solid var(--color-border-light)", borderRadius: "10px" }}
        >
          <Tabs
            defaultActiveKey={activeTab}
            className="mb-3"
            style={{ width: "max-content" }}
            onSelect={handleSelect}
          >
            <Tab
              eventKey="PersonalInformation"
              title="Personal Information"
              style={{ marginRight: "10px" }}
              onSelect={handleSelect}
            >
              <Row className="mb-3">
                {personalInfoFields?.map((field, index) => (
                  <Col md={4} key={index}>
                    <Form.Group controlId={`personalInfo${index}`}>
                      <Form.Label className="mt-2">{field.label}</Form.Label>
                      {field.type === "select" ? (
                        <Select
                          value={field.value}
                          disabled
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
                        <Form.Control
                          type={field.type}
                          name={field.name}
                          value={field.value}
                          readOnly
                        />
                      )}
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Tab>

            <Tab
              eventKey="IdentificationDetails"
              title="Identification Details"
              style={{ marginRight: "10px" }}
              onSelect={handleSelect}
            >
              <Row className="mb-3">
                {identificationDetailsFields?.map((field, index) => (
                  <Col md={4} key={index}>
                    <Form.Group controlId={`identificationDetails${index}`}>
                      <Form.Label className="mt-2">{field.label}</Form.Label>
                      <Form.Control
                        type={field.type}
                        name={field.name}
                        value={field.value}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>

              <h3>FATCA Section</h3>
              <Row className="mb-3">
                {FATCA?.map((field, index) => (
                  <Col md={4} key={index}>
                    <Form.Group controlId={`FATCA${index}`}>
                      <Form.Label className="mt-2">{field.label}</Form.Label>
                      <Form.Control
                        type={field.type}
                        name={field.name}
                        value={field.value}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>

              <h3>Power Atarny</h3>
              <Row className="mb-3">
                {PowerAtarny?.map((field, index) => (
                  <Col md={4} key={index}>
                    <Form.Group controlId={`PowerAtarny${index}`}>
                      <Form.Label className="mt-2">{field.label}</Form.Label>
                      <Form.Control
                        type={field.type}
                        name={field.name}
                        value={field.value}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Tab>

            <Tab
              eventKey="CurrentEmploymentDetails"
              title="Current Employment Details"
              style={{ marginRight: "10px" }}
              onSelect={handleSelect}
            >
              <Row className="mb-3">
                {employmentDetailsFields?.map((field, index) => (
                  <Col md={4} key={index}>
                    <Form.Group controlId={`employmentDetails${index}`}>
                      {field.type === "checkbox" ? (
                        <div className="d-flex">
                          <>
                            <Form.Check
                              className="mt-4"
                              type={field.type}
                              name={field.name}
                              checked={field.checked}
                              readOnly
                            />
                            <Form.Label className="mt-4 ms-3">
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
                            disabled
                            value={field.value}
                            className="w-100"
                          >
                            {field?.options?.map((option: any) => (
                              <Select.Option key={option.id} value={option.id}>
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
                            readOnly
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
              onSelect={handleSelect}
            >
              <Row className="mb-3">
                {addressDetailsFields?.map((field, index) => (
                  <Col md={4} key={index}>
                    <Form.Group controlId={`personalInfo${index}`}>
                      {field.type === "select" ? (
                        <>
                          <Form.Label className="mt-2">
                            {field.label}
                          </Form.Label>

                          <Select
                            disabled
                            value={field.value}
                            onChange={field.onChange}
                            className="mt-2 w-100"
                          >
                            {field?.options?.map((option: any) => (
                              <Select.Option key={option.id} value={option.id}>
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
                              readOnly
                            />
                            <Form.Label className="mt-1 ms-3">
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
                            readOnly
                          />
                        </>
                      )}
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default PersonalInfoForm;
