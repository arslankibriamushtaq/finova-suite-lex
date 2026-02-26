import { Container, Row, Col, Form, Tab, Tabs } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  getBussinessByCustomerId,
  GetAllBusinessType,
  GetAllBusinessCategory,
  getAllCountries,
  getCities,
  getLanguage,
  GetTotalEPF,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { Select } from "antd";
import Loader from "../Loader/Loader";

const BuisnessView = () => {
  const [customerData, setCustomerData] = useState<any>();
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [businessType, setbusinessType] = useState<any>();
  const [categoryId, setCategoryId] = useState<any[]>();
  const [country, setCountry] = useState<any>([]);
  const [city, setCity] = useState<any>([]);
  const [languageId, setLanguageId] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);
  const [epf, setEPF] = useState<any>();

  const BusinessCustomer = async (customerId: any) => {
    try {
      setLoading(true);
      const res = await getBussinessByCustomerId(customerId);
      if (res) {
        const value = res.data.data;
        setCustomerData(value);
        console.table(value);
      }
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      BusinessCustomer(customerId);
    }
    getBusinessType();
    getBusinessCategory();
    getCountryBusiness();
    getCitiesBusiness();
    getLanguageBusiness();
  }, [customerId]);

  useEffect(() => {
    if (customerData) {
      fetchEPF();
    }
  }, [customerData]);

  const handleSaveCustomer = () => {
    navigate("/lms/buinsess");
  };

  const getBusinessCategory = async () => {
    try {
      const res = await GetAllBusinessCategory(1, 1000);
      if (res) {
        const data = res.data.data || [];
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
        const data = res.data.data || [];
        setbusinessType(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const getLanguageBusiness = async () => {
    try {
      const res = await getLanguage();
      if (res) {
        const data = res.data.data;
        setLanguageId(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const getCitiesBusiness = async () => {
    try {
      const res = await getCities();
      if (res) {
        const data = res.data.data;
        setCity(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const getCountryBusiness = async () => {
    try {
      const res = await getAllCountries();
      if (res) {
        const data = res.data.data;
        setCountry(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const fetchEPF = async () => {
    try {
      const res = await GetTotalEPF(1, 1000);
      if (res) {
        const data = res.data.data;
        const entry = data?.find(
          (entry: any) => entry.id === customerData?.totalEPFId
        );
        setEPF(data);

        // setLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  let check: any = "";
  const [epfVal, setEpfVal] = useState("");
  const getEPFById = async (id: any) => {
    const entry: any = await epf?.find((entry: any) => entry.id === id);
    check = entry;
    setEpfVal(`${entry?.minimumEFP} - ${entry?.maximumEFP}`);
    // console.warn(`${entry?.minimumEFP} - ${entry?.maximumEFP}`);
    return `${entry?.minimumEFP} - ${entry?.maximumEFP}`;
  };
  if (customerData) {
    getEPFById(customerData.totalEPFId);
  }
  useEffect(() => {
    if (epfVal) {
      setLoading(false);
    }
  }, [epfVal]);
  const getBussinessCategoryById = (id: any) => {
    const entry: any = categoryId?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const getBussinessTypeById = (id: any) => {
    const entry: any = businessType?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const getLanguageById = (id: any) => {
    let entry: any = null;
    languageId?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry?.name || "not found";
  };
  const getCountryById = (id: any) => {
    const entry: any = country?.find((entry: any) => entry.id === id);
    return entry?.name;
  };
  const getCityById = (id: any) => {
    let entry: any = null;
    city?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
  };

  const businessInformationFields = [
    {
      label: "Registration Number",
      type: "text",
      name: "registrationNumber",
      value: customerData?.registrationNumber,
    },
    {
      label: "Type",
      type: "select",
      name: "buisnessType",
      options: businessType,
      value: getBussinessTypeById(customerData?.buisnessType),
    },
    {
      label: "Category",
      type: "select",
      name: "buisnessCategory",
      options: categoryId,
      value: getBussinessCategoryById(customerData?.buisnessCategory),
    },
    { label: "Name", type: "text", name: "name", value: customerData?.name },
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
      checked: customerData?.stopCorrespondence || false,
    },
    { label: "Skip", type: "checkbox", checked: customerData?.skip || false },
    {
      label: "Bankruptcy",
      type: "text",
      name: "bankruptcy",
      value: customerData?.bankruptcy,
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
      value: null,
    },
    {
      label: "Time Zone",
      type: "text",
      name: "buisness_TimeZone",
      value: customerData?.buisness_TimeZone,
    },
  ];

  const partnerDetailsFields = [
    {
      label: "Partner ID",
      type: "text",
      name: "partnerId",
      value: customerData?.partnerId,
    },

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
      type: "text",
      name: "birthPlace",
      value: customerData?.birthPlace,
    },
    {
      label: "Is Director",
      type: "text",
      name: "isDirector",
      value: customerData?.isDirector,
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
      name: "language",
      options: languageId,
      value: getLanguageById(customerData?.language),
    },
    {
      label: "Privacy Opt-in",
      type: "checkbox",
      value: customerData?.privacyOptOut || false,
    },
    {
      label: "Insurance Opt-in",
      type: "checkbox",
      value: customerData?.insuranceOptOut || false,
    },
    {
      label: "Marketing Opt-in",
      type: "checkbox",
      value: customerData?.marketingOptOut || false,
    },
    {
      label: "Share Credit Opt-in",
      type: "checkbox",
      value: customerData?.sharedCreditOptOut || false,
    },

    {
      label: "Language",
      type: "text",
      name: "language",
      value: customerData?.language,
    },
    {
      label: "Nationality",
      type: "text",
      name: "nationalityId",
      value: customerData?.nationalityId,
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
      type: "text",
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
      label: "Permission to Call",
      type: "checkbox",
      value: customerData?.partner_PermissionToCall || false,
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
      label: "Current",
      type: "checkbox",
      value: customerData?.current || false,
    },
    {
      label: "Confirmed",
      type: "checkbox",
      value: customerData?.confirmed || false,
    },
    {
      label: "Mailing",
      type: "checkbox",
      value: customerData?.mailing || false,
    },
    {
      label: "Type",
      type: "select",
      name: "type",
      value: customerData?.type,
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
      value: customerData?.permissionToCall || false,
    },
    {
      label: "Permission to Text",
      type: "checkbox",
      value: customerData?.permissionToText || false,
    },
    {
      label: "Country",
      type: "select",
      name: "countryId",
      options: country,
      value: getCountryById(customerData?.countryId),
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
      options: city,
      value: getCityById(customerData?.cityId),
    },
    { label: "Phone", type: "text", name: "phone", value: customerData?.phone },
    {
      label: "Time Zone",
      type: "text",
      name: "timeZone",
      value: customerData?.timeZone,
    },
    {
      label: "Comment",
      type: "text",
      name: "comment",
      value: customerData?.comment,
    },
  ];
  const button = [{ title: "Exit", onClick: handleSaveCustomer }];
  return (
    <Container>
      <h3>Introduction</h3>
      {/*       <TableHeaderFilter button={button} />
       */}{" "}
      {!loading && epfVal ? (
        <>
          <div
            className="p-4"
            style={{ border: "1px solid #DADADA", borderRadius: "10px" }}
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
                <Row className="mb-3">
                  {businessInformationFields.map((field: any, index) => (
                    <Col md={4} key={index}>
                      <Form.Group controlId={`businessInformation${index}`}>
                        {field.type === "checkbox" ? (
                          <>
                            <Form.Check
                              className="mt-2"
                              type={field.type}
                              label={field.label}
                              checked={field.checked}
                              readOnly
                            />
                          </>
                        ) : field.type === "select" ? (
                          <>
                            {field.name === "totalEPFId" ? (
                              <>
                                <Form.Label className="mt-2">
                                  {field.label}
                                </Form.Label>
                                <Select
                                  value={epfVal}
                                  disabled
                                  className="w-100"
                                >
                                  {field?.options &&
                                    field?.options?.map((option: any) => (
                                      <Select.Option
                                        key={option.id}
                                        value={epfVal}
                                      >
                                        {epfVal}
                                      </Select.Option>
                                    ))}
                                </Select>
                              </>
                            ) : (
                              <>
                                <Form.Label className="mt-2">
                                  {field.label}
                                </Form.Label>
                                <Select
                                  value={field.value}
                                  disabled
                                  className="w-100"
                                >
                                  {field.options &&
                                    field.options.map((option: any) => (
                                      <Select.Option
                                        key={option.id}
                                        value={`${option?.id}`}
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
                            <Form.Label className="mt-2">
                              {field.label}
                            </Form.Label>
                            <Form.Control
                              //className="mb-2"
                              type={field.type}
                              placeholder={field.label}
                              defaultValue={field.value}
                              readOnly
                            />
                          </>
                        )}
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
                <h3>Opt-in</h3>
                <Row className="mb-3">
                  {partnerDetailsFields.map((field, index) => (
                    <>
                      {field.type === "checkbox" && (
                        <Col md={4} key={index}>
                          <Form.Group controlId={`partnerDetails${index}`}>
                            <Form.Check
                              className="mt-4"
                              type={field.type}
                              label={field.label}
                              checked={field.value}
                              readOnly
                            />
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
                    <>
                      {(field.type === "text" || field.type === "date") && (
                        <Col md={4} key={index}>
                          <Form.Group controlId={`partnerDetails${index}`}>
                            <>
                              <Form.Label className="mt-2">
                                {field.label}
                              </Form.Label>
                              <Form.Control
                                type={field.type}
                                placeholder={field.label}
                                defaultValue={field.value}
                                readOnly
                              />
                            </>
                          </Form.Group>
                        </Col>
                      )}
                    </>
                  ))}
                </Row>
              </Tab>
              <Tab
                eventKey="PersonalAddressDetails"
                title="Personal Address Details"
                style={{ marginRight: "10px" }}
              >
                <Row className="mb-3">
                  {addressDetailsFields.map((field, index) => (
                    <Col md={4} key={index}>
                      <Form.Group controlId={`addressDetails${index}`}>
                        {field.type === "checkbox" ? (
                          <>
                            <Form.Check
                              className="d-flex align-items-center mt-3 gap-2"
                              style={{ paddingTop: "16px" }}
                              type={field.type}
                              label={field.label}
                              checked={field.value}
                              readOnly
                            />
                          </>
                        ) : (
                          <>
                            <Form.Label className="mt-2">
                              {field.label}
                            </Form.Label>
                            <Form.Control
                              className="mt-2"
                              type={field.type}
                              placeholder={field.label}
                              defaultValue={field.value}
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
        </>
      ) : (
        <Loader />
      )}
    </Container>
  );
};

export default BuisnessView;
