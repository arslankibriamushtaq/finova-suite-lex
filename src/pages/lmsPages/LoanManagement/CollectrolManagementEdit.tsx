import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, Select } from "antd";

import { Row, Col, Form, FormGroup, Modal } from "react-bootstrap";
import { CloseOutlined } from "@ant-design/icons";
// import { Images } from "../Config/Images";
import toast from "react-hot-toast";
import {
  getAccountNumberForCollectral,
  getCollectrolDataByID,
} from "../../../redux/apis/apisCrudLms";
import axios from "axios";
import { useParams } from "react-router-dom";
import Loader from "../../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";
const CollateralManagementEdit = () => {
  const { t } = useTranslation("loanManagement");
  const id = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState<any>([]);
  const [reportFiles, setReportFiles] = useState<any>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);

  const [radioInputValue, setradioInputValue] = useState("property");
  const [accountId, setAccountId] = useState("");
  const [loader, setLoader] = useState(false);
  const [formValues, setFormValues] = useState<any>({
    accountNumber: "",
    applicationID: "",
    collectrolId: "",
    propertyAddress: "",
    marketValue: "",
    externalAgencyName: "",
    valuationAmount: 0,
    valuationDate: "",
    vehicleRegistrationNo: "",
    name: "",
  });

  const [applications, setApplications] = useState<any>();
  const fetchCollateralData = async () => {
    try {
      const response = await getCollectrolDataByID(id?.id);
      if (response) {
        const collateralData = response.data.data;
        setradioInputValue(
          collateralData.collateralType == 1
            ? "vehicle"
            : collateralData.collateralType == 2
            ? "cash"
            : "property"
        );
        setFormValues({
          accountNumber: collateralData.accountNumber || "",
          vehicleRegistrationNo: collateralData.vehicleRegistrationNo || "",
          applicationID: collateralData.applicationID || "",
          collectrolId: collateralData.collectrolId || "",
          propertyAddress: collateralData.propertyAddress || "",
          marketValue: collateralData.marketValue || "",
          externalAgencyName:
            collateralData.collateralValuation.externalAgencyName || "",
          valuationAmount:
            collateralData.collateralValuation.valuationAmount || "",
          valuationDate: collateralData.collateralValuation.valuationDate || "",
          name: collateralData.name || "",
        });
      }
    } catch (error) {
      console.error("Error fetching collateral data:", error);
    }
  };

  // Use effect to fetch collateral data when the component mounts
  useEffect(() => {
    fetchCollateralData();
  }, []);
  const CollateralType = [
    {
      label: t("collateralForm.typeProperty"),
      type: "radio",
      name: "Property",
      value: "property",
    },
    {
      label: t("collateralForm.typeVehicle"),
      type: "radio",
      name: "Property",
      value: "vehicle",
    },
    {
      label: t("collateralForm.typeCash"),
      type: "radio",
      name: "Property",
      value: "cash",
    },
  ];
  const CollateralDetails = [
    // {
    //   label: "Collateral ID",
    //   name: "collectrolId",
    //   type: "text",
    //   Placeholder: "1324567",
    // },
    {
      label: t("field.propertyAddress"),
      type: "text",
      name: "propertyAddress",
      Placeholder: "Placeholder",
    },
    {
      label: t("field.marketValue"),
      type: "number",
      name: "marketValue",
      value: formValues.marketValue,
      Placeholder: "Placeholder",
    },
  ];
  const cashDetails = [
    // {
    //   label: "Collateral ID",
    //   type: "text",
    //   name: "collectrolId",
    //   Placeholder: "1324567",
    // },
    {
      label: t("field.propertyAddress"),
      type: "text",
      name: "propertyAddress",
      Placeholder: "Placeholder",
    },
    {
      label: t("field.marketValue"),
      type: "number",
      name: "marketValue",
      Placeholder: "Placeholder",
    },
  ];
  const collectrolOwnerDetails = [
    {
      label: t("field.name"),
      type: "text",
      name: "name",
      value: formValues.name,
      Placeholder: "1324567",
    },
    {
      label: t("field.mobileNo"),
      type: "text",
      name: "mobileNo",
      Placeholder: "Placeholder",
    },
    {
      label: t("field.nidLabel"),
      type: "text",
      name: "nid",
      Placeholder: "Placeholder",
    },
    {
      label: t("common:email"),
      type: "text",
      name: "email",
      Placeholder: "Placeholder",
    },
  ];
  const souceInfoDetails = [
    {
      label: t("field.bankName"),
      type: "text",
      name: "name",
      Placeholder: "1324567",
    },
    {
      label: t("field.branchCode"),
      type: "text",
      name: "code",
      Placeholder: "Placeholder",
    },
    {
      label: t("field.accountNoDot"),
      type: "text",
      name: "no",
      Placeholder: "Placeholder",
    },
  ];
  const vehicleDetails = [
    // {
    //   label: "Collateral ID",
    //   type: "text",
    //   name: "registrationNumber",
    //   Placeholder: "1324567",
    // },
    {
      label: t("field.vehicleRegistration"),
      type: "text",
      name: "registrationNumber",
      Placeholder: "Placeholder",
      value: formValues.vehicleRegistrationNo,
    },
    {
      label: t("field.vehicleType"),
      type: "text",
      name: "type",
      Placeholder: "Placeholder",
    },
    {
      label: t("field.marketValue"),
      type: "text",
      name: "value",
      value: formValues.marketValue,
      Placeholder: "Placeholder",
    },
  ];

  const CollateralValuation = [
    {
      label: t("field.externalAgencyName"),
      type: "text",
      name: "externalAgencyName",
      value: formValues.externalAgencyName,
      Placeholder: "Placeholder",
    },
    {
      label: t("field.valuationAmount"),
      type: "number",
      name: "valuationAmount",
      value: formValues.valuationAmount,
      Placeholder: "Placeholder",
    },
    {
      label: t("field.valuationDate"),
      type: "date",
      name: "valuationDate",
      Placeholder: "Placeholder",
      value: formValues.valuationDate,
    },
  ];

  // handle choose file
  // const handleFileDrop = (e: any) => {
  //   e.preventDefault();
  //   const droppedFiles = e.dataTransfer.files;
  //   if (!droppedFiles) return;

  //   setFiles((prevFiles) => [...prevFiles, ...Array.from(droppedFiles)]);
  // };

  const handleFileInput = (e: any) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setFiles((prevFiles: any) => [...prevFiles, ...Array.from(selectedFiles)]);
  };
  const handleFileInput2 = (e: any) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setReportFiles((prevFiles: any) => [...prevFiles, ...Array.from(selectedFiles)]);
  }
  const getAccountNumberByApplication = async (number: any) => {
    try {
      const res = await getAccountNumberForCollectral(number);
      if (res) {
        const data = res.data.data;
        setApplications(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    if (formValues.accountNumber) {
      getAccountNumberByApplication(formValues.accountNumber);
    }
  }, [formValues.accountNumber]);
  const removeFile = (fileKey: any) => {
    setFiles((prevFiles: any) => prevFiles.filter((_: any, index: any) => index !== fileKey));
    if (fileInputRef.current && files.length === 1) {
      fileInputRef.current.value = ""; // Clears selected files
    }
  };
  const removeFile2 = (fileKey: any) => {
    setReportFiles((prevFiles: any) => prevFiles.filter((_: any, index: any) => index !== fileKey));
    if (fileInputRef2.current && reportFiles.length === 1) {
      fileInputRef2.current.value = ""; // Clears selected files
    }
  };
  // handle choose file
  // const handleInputChange = (event: any) => {
  //   const { name, value } = event.target;

  //   setradioInputValue(event.target.value);
  //   setFormValues((prevValues) => ({
  //     ...prevValues,
  //     [name]: value,
  //   }));
  // };
  const handleSelectChange = (value: string) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      applicationID: value, // Set the selected value directly
    }));
  };
  const handleChange = (e: any, key: any) => {
  };

  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;

    setFormValues((prevValues: any) => ({
      ...prevValues,
      [name]: value,
    }));

    // This handles updating the state of radio buttons
    if (type === "radio") {
      setradioInputValue(value);
    }
  };

  // handle api

  const submitCollateralData = async () => {
    setLoader(true);
    const propertyBody = {
      id: id.id,
      accountId: accountId ? accountId : "",
      applicationId: formValues.applicationID,
      collateralType: 0,
      availabilityStatus: 0,
      propertyAddress: formValues.propertyAddress,
      marketValue: formValues.marketValue,
      status: true,
      collateralDoc: [
        {
          file: "string",
          trackingNo: "string",
          receivedDate: "2024-09-30T09:30:21.595Z",
          status: true,
        },
      ],
      collateralValuation: {
        externalAgencyName: formValues.externalAgencyName,
        valuationAmount: formValues.valuationAmount,
        valuationDate: "2024-10-01T10:48:05.384Z",
        valuationReports: ["string"],
      },
    };
    const vehicleBody = {
      id: id.id,
      accountId: accountId ? accountId : "",
      applicationId: formValues.applicationID,
      collateralType: 0,
      availabilityStatus: 0,
      vehicleRegistrationNo: formValues.vehicleRegistrationNo,
      vehicleType: 0,
      marketValue: formValues.marketValue,
      status: true,
      collateralDoc: [
        {
          file: "string",
          trackingNo: "string",
          receivedDate: "2024-09-30T09:30:21.595Z",
          status: true,
        },
      ],
      collateralValuation: {
        externalAgencyName: formValues.externalAgencyName,
        valuationAmount: formValues.valuationAmount,
        valuationDate: "2024-10-01T10:48:05.384Z",
        valuationReports: ["string"],
      },
    };
    try {
      const response = await axios.put(
        radioInputValue == "property"
          ? `${
              import.meta.env.VITE_REACT_APP_API_BASE_URL
            }/api/PropertyCollateral/Update`
          : `${
              import.meta.env.VITE_REACT_APP_API_BASE_URL
            }/api/VehicleCollateral/Update`,
        radioInputValue == "property" ? propertyBody : vehicleBody,
        {
          headers: {
            "Content-Type": "application/json",
            "Request-Id": "94a2aca6-ab1e-4ba9-8bd8-ba3b82b5f9c1",
          },
        }
      );

      if (response) {
        setLoader(false);
        toast.success(t("collateralForm.toastSubmitted"));
        navigate("/lms/LoanManagement/CollectrolManagement");
      }
    } catch (error) {
      console.error("Error:", error);
      setLoader(false);
      toast.error(t("collateralForm.toastFailed"));
    }
  };

  // handle api

  return (
    <div>
      {loader && <Loader />}
      <div
        className="d-flex align-items-center justify-content-between mt-1 mb-3"
        style={{ fontSize: "15px", fontWeight: "Bold" }}
      >
        {t("collateralForm.heading")}
      </div>
      <div
        className="p-4"
        style={{ border: "1px solid var(--color-border-light)", borderRadius: "2px" }}
      >
        <div className="col-12 mt-5 border-bottom">
          <div className="col-8 d-flex justify-content-start mb-5">
            <div className="me-2 w-100">
              <label>{t("field.accountNumber")}</label>
              <Input
                name="accountNumber" // Updated to match API key
                value={formValues.accountNumber}
                onChange={handleInputChange}
                size="large"
                className="mt-2"
                placeholder="placeholder"
              />
            </div>
            <div className="w-100">
              <label>{t("field.applicationId")}</label>
              <Select
                size="large"
                className="mt-2"
                placeholder="placeholder"
                value={formValues.applicationID}
                onChange={handleSelectChange}
              >
                {applications &&
                  applications.map((item: any) => (
                    <Select.Option
                      key={item.applicationId}
                      value={item.applicationId}
                    >
                      <div
                        onClick={() => {
                          setAccountId(item.accountID);
                        }}
                      >
                        {item.applicationKey}
                      </div>
                    </Select.Option>
                  ))}
              </Select>
            </div>
          </div>
        </div>
        <hr />

        <Row>
          <Form.Label className="mt-2 fw-bold">{t("collateralForm.sectionCollateralType")}</Form.Label>
          {CollateralType.map((field: any, index) => (
            <Col md={3} className="mb-3" key={index}>
              <Form.Group>
                {field.type === "radio" && (
                  <>
                    <Form.Check
                      className="mt-4 d-flex align-items-center gap-1"
                      type={field.type}
                      label={field.label}
                      name={field.name}
                      value={field.value}
                      checked={radioInputValue == field.value}
                      onChange={handleInputChange}
                      style={{ fontSize: "14px", fontWeight: "700" }}
                    />
                  </>
                )}
              </Form.Group>
            </Col>
          ))}
        </Row>

        <hr />

        <Row>
          <Form.Label className="mt-2 fw-bold">{t("collateralForm.sectionCollateralDetails")}</Form.Label>
          {radioInputValue == "vehicle" ? (
            <>
              {" "}
              {vehicleDetails.map((field: any, index) => (
                <Col md={4} className="mb-3" key={index}>
                  <Form.Group>
                    {field.type === "text" && (
                      <>
                        <Form.Label className="mt-2 fw-bold fs-6">
                          {field.label}
                        </Form.Label>
                        <Form.Control
                          type={field.type}
                          placeholder={field.Placeholder}
                          onChange={handleInputChange}
                          value={formValues[field.name]}
                        />
                      </>
                    )}
                  </Form.Group>
                </Col>
              ))}
            </>
          ) : radioInputValue == "cash" ? (
            <>
              {cashDetails.map((field: any, index) => (
                <>
                  <Col md={4} className="mb-3" key={index}>
                    <Form.Group>
                      {field.type === "text" && (
                        <>
                          <Form.Label className="mt-2 fw-bold fs-6">
                            {field.label}
                          </Form.Label>
                          <Form.Control
                            type={field.type}
                            placeholder={field.Placeholder}
                            onChange={(e) => handleChange(e, field.name)}
                            value={formValues[field.name]}
                          />
                        </>
                      )}
                    </Form.Group>
                  </Col>
                </>
              ))}
              <div className="mt-2 fw-bold">{t("collateralForm.collateralOwner")}</div>
              {collectrolOwnerDetails.map((field: any, index) => (
                <>
                  <Col md={4} className="mb-3" key={index}>
                    <Form.Group>
                      {field.type === "text" && (
                        <>
                          <Form.Label className="mt-2 fw-bold fs-6">
                            {field.label}
                          </Form.Label>
                          <Form.Control
                            type={field.type}
                            placeholder={field.Placeholder}
                            onChange={handleInputChange}
                            value={formValues[field.name]}
                          />
                        </>
                      )}
                    </Form.Group>
                  </Col>
                </>
              ))}
              <div className="mt-2 fw-bold">{t("collateralForm.sourceAccountInfo")}</div>
              {souceInfoDetails.map((field: any, index) => (
                <>
                  <Col md={4} className="mb-3" key={index}>
                    <Form.Group>
                      {field.type === "text" && (
                        <>
                          <Form.Label className="mt-2 fw-bold fs-6">
                            {field.label}
                          </Form.Label>
                          <Form.Control
                            type={field.type}
                            placeholder={field.Placeholder}
                            onChange={handleInputChange}
                            value={formValues[field.name]}
                          />
                        </>
                      )}
                    </Form.Group>
                  </Col>
                </>
              ))}
            </>
          ) : (
            <>
              {CollateralDetails.map((field: any, index) => (
                <Col md={4} className="mb-3" key={index}>
                  <Form.Group>
                    <>
                      <Form.Label
                        className="mt-2"
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        {field.label}
                      </Form.Label>
                      <Form.Control
                        name={field.name}
                        type={field.type}
                        value={formValues[field.name]}
                        placeholder={field.Placeholder}
                        onChange={handleInputChange}
                      />
                    </>
                  </Form.Group>
                </Col>
              ))}
            </>
          )}

          <Col md={12} className="mb-3 d-flex align-items-end">
            <div className="col-4 pe-3">
              <FormGroup>
                <Form.Label
                  className="mt-2 "
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  {t("collateralForm.uploadDocuments")}
                </Form.Label>
                <Form.Control
                  type="file"
                  className="h-100 p-2"
                  onChange={handleFileInput}
                  ref={fileInputRef} 
                />
              </FormGroup>
            </div>
            <div className="col-4 d-flex align-items-center" style={{height:'40px'}}>
              {files.length > 0 && (
                <>
                  {" "}
                  <span style={{ color: "var(--color-danger-action)" }}>
                    {t("collateralForm.documentsUploaded", { count: files.length })}
                  </span>
                </>
              )}
            </div>
          </Col>
          <div
            className="d-flex col-12 gap-3 pt-3"
            style={{ listStyle: "none" }}
          >
            {files.map((file: any, index: any) => (
              <span
                key={index}
                className="d-flex me-3"
                style={{
                  border: "1px solid var(--color-surface-frost)",
                  borderRadius: "2px",
                  padding: "4px",
                  background: "var(--color-surface-frost)",
                }}
              >
                <span className="col-11 px-3 d-flex align-items-center">
                  {file.name}{" "}
                </span>
                <span
                  className="col-1 px-2 justify-content-center d-flex align-items-center cursor-pointer"
                  onClick={() => removeFile(index)}
                >
                  <CloseOutlined />
                </span>
              </span>
            ))}
          </div>
        </Row>
        <hr />

        <Row>
          <Form.Label className="mt-2 fw-bold">{t("collateralForm.sectionCollateralValuation")}</Form.Label>
          {CollateralValuation.map((field: any, index) => (
            <Col md={4} className="mb-3" key={index}>
              <Form.Group>
                <Form.Label
                  className="mt-2"
                  style={{ fontSize: "13px", fontWeight: "600" }}
                >
                  {field.label}
                </Form.Label>
                <Form.Control
                  name={field.name}
                  type={field.type}
                  placeholder={field.Placeholder}
                  onChange={handleInputChange}
                  value={formValues[field.name]}
                />
              </Form.Group>
            </Col>
          ))}

          <Col md={12} className="mb-3 d-flex align-items-end">
            <div className="col-4 pe-3">
              <FormGroup>
                <Form.Label
                  className="mt-2"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  {t("collateralForm.uploadValuationReport")}
                </Form.Label>
                <Form.Control
                  type="file"
                  className="h-100 p-2"
                  onChange={handleFileInput2}
                  ref={fileInputRef2} 
                />
              </FormGroup>
            </div>
            <div className="col-4 d-flex align-items-center" style={{height:'40px'}}>
              {reportFiles.length > 0 && (
                <>
                  {" "}
                  <span style={{ color: "var(--color-danger-action)" }}>
                    {t("collateralForm.documentsUploaded", { count: reportFiles.length })}
                  </span>
                </>
              )}
            </div>
          </Col>
          <div
            className="d-flex col-12 gap-3 pt-3"
            style={{ listStyle: "none" }}
          >
            {reportFiles.map((file: any, index: any) => (
              <span
                key={index}
                className="d-flex me-3"
                style={{
                  border: "1px solid var(--color-surface-frost)",
                  borderRadius: "2px",
                  padding: "4px",
                  background: "var(--color-surface-frost)",
                }}
              >
                <span className="col-11 px-3 d-flex align-items-center">
                  {file.name}{" "}
                </span>
                <span
                  className="col-1 px-2 justify-content-center d-flex align-items-center cursor-pointer"
                  onClick={() => removeFile2(index)}
                >
                  <CloseOutlined />
                </span>
              </span>
            ))}
          </div>
          <div className="text-end">
            <button
              onClick={submitCollateralData}
              className="application-btn"
              style={{
                //backgroundColor: "#EB0D0D",
                borderRadius: "2px",
                color: "var(--color-near-white)",
                border: "none",
                padding: "10px",
              }}
            >
              {t("common:submit")}
            </button>
          </div>
        </Row>

        <Modal backdrop="static" keyboard={false} show={false} centered size="lg">
          <Modal.Header closeButton>
            <div
              className="cursor-pointer text-end w-100"
              // onClick={() => setTermDialogBox(false)}
            >
              <img /* src={Images.closeBtn} */ alt="" />
            </div>
          </Modal.Header>
          <Modal.Body className="">
            <div className="d-flex justify-content-center">
              <img /* src={Images.blueWarning} */ alt="" />
            </div>

            <div className="text-center">
              <h3 className="mt-4 fw-bold">{t("collateralForm.underReviewTitle")}</h3>
              <p
                className="mt-4 mb-5"
                style={{ lineHeight: "24px", fontSize: "20px" }}
              >
                {t("collateralForm.underReviewBody1")} <br />{" "}
                {t("collateralForm.underReviewBody2")}
              </p>
            </div>
            <div className="text-center">
              <button
                className="btn btn-danger py-3 px-4"
                style={{
                  backgroundColor: "var(--color-danger-action)",
                  color: "var(--color-near-white)",
                  borderRadius: "2px",
                }}
              >
                {t("common:ok")}
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default CollateralManagementEdit;
