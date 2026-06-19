import { useEffect, useRef, useState } from "react";
import { Input, Select } from "antd";
import { Row, Col, Form, FormGroup, Modal } from "react-bootstrap";
import { CloseOutlined } from "@ant-design/icons";
import { Images } from "../../../components/Config/Images";
import toast from "react-hot-toast";
import {
  getAccountNumberForCollectral,
  getAllAccountDetails,
} from "../../../redux/apis/apisCrudLms";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Loader from "../../../components/Loader/Loader";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const CollateralManagementView = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<any>([]);
  const [reportFiles, setReportFiles] = useState<any>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);
  const [radioInputValue, setradioInputValue] = useState("property");
  const [accountId, setAccountId] = useState("");
  const [vehicleType, setVehicleType] = useState(0);
  const [loader, setLoader] = useState(false);
  const [accountData, setAccountData] = useState<any>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<string[]>([]);
  const [errors, setErrors] = useState<any>({});
  type FormValues = {
    accountNumber: string;
    applicationID: string;
    collectrolId: string;
    propertyAddress: string;
    marketValue: string;
    externalAgencyName: string;
    valuationAmount: string;
    valuationDate: string;
    collateralAmount?: string;
    collateralOwnerName?: string;
    mobileNumber?: string;
    nid?: string;
    email?: string;
    bankName?: string;
    branchCode?: string;
    accountNo?: string;
    vehicleRegistrationNo?: string;
  };

  type Errors = Partial<Record<keyof any, string>>;
  const [formValues, setFormValues] = useState<any>({
    accountNumber: "",
    applicationID: "",
    collectrolId: "",
    propertyAddress: "",
    marketValue: "",
    externalAgencyName: "",
    valuationAmount: "",
    valuationDate: "",
    collateralAmount: "",
    collateralOwnerName: "",
    mobileNumber: "",
    nid: "",
    email: "",
    bankName: "",
    branchCode: "",
    accountNo: "",
    vehicleRegistrationNo: "",
  });
  const [applications, setApplications] = useState<any>();
  const CollateralType = [
    {
      label: "Property",
      type: "radio",
      name: "Property",
      value: "property",
    },
    {
      label: "Vehicle",
      type: "radio",
      name: "Property",
      value: "vehicle",
    },
    {
      label: "Cash & Cash equivalents",
      type: "radio",
      name: "Property",
      value: "cash",
    },
  ];
  const CollateralDetails = [
    {
      label: "Property Address",
      type: "text",
      name: "propertyAddress",
      Placeholder: "Placeholder",
    },
    {
      label: "Market Value",
      type: "number",
      name: "marketValue",
      Placeholder: "Placeholder",
    },
  ];
  const cashDetails = [
    {
      label: "Market Value",
      type: "number",
      name: "marketValue",
      Placeholder: "Placeholder",
    },
    {
      label: "Collateral Amount",
      type: "number",
      name: "collateralAmount",
      Placeholder: "Placeholder",
    },
  ];
  const collectrolOwnerDetails = [
    {
      label: "Name",
      type: "text",
      name: "collateralOwnerName",
      Placeholder: "1324567",
    },
    {
      label: "Mobile No",
      type: "number",
      name: "mobileNo",
      Placeholder: "Placeholder",
    },
    {
      label: "Nid",
      type: "text",
      name: "nid",
      Placeholder: "Placeholder",
    },
    {
      label: "Email",
      type: "email",
      name: "email",
      Placeholder: "Placeholder",
      onChange: (e: any) => handleChange(e, "email"),
    },
  ];
  const souceInfoDetails = [
    {
      label: "Bank Name",
      type: "text",
      name: "bankName",
      Placeholder: "1324567",
    },
    {
      label: "Branch Code",
      type: "text",
      name: "branchCode",
      Placeholder: "Placeholder",
    },
    {
      label: "Account No.",
      type: "text",
      name: "accountNo",
      Placeholder: "Placeholder",
    },
  ];
  const enum1 = [
    {
      value: 0,
      label: "Car",
    },
    {
      value: 1,
      label: "Motorcycle",
    },
    {
      value: 2,
      label: "Truck",
    },
    {
      value: 3,
      label: "Bus",
    },
    {
      value: 4,
      label: "Bicycle",
    },
    {
      value: 5,
      label: "Scooter",
    },
    {
      value: 6,
      label: "Van",
    },
    {
      value: 7,
      label: "SUV",
    },
  ];
  const vehicleDetails = [
    {
      label: "Collateral ID",
      type: "text",
      name: "registrationNumber",
      Placeholder: "1324567",
    },
    {
      label: "Vehicle registration",
      type: "text",
      name: "registrationNumber",
      Placeholder: "Placeholder",
    },
    {
      label: "Vehicle Type",
      type: "select",
      name: "vehicleType",
      Placeholder: "Placeholder",
      options: enum1,
      // value: getBussinessTypeById(customerData?.buisnessType),
      onChange: (e: any) => handleChangeType(e),
    },
    {
      label: "Market Value",
      type: "number",
      name: "marketValue",
      Placeholder: "Placeholder",
    },
  ];

  const CollateralValuation = [
    {
      label: "External Agency Name",
      type: "text",
      name: "externalAgencyName",
      Placeholder: "Placeholder",
    },
    {
      label: "Valuation Amount",
      type: "number",
      name: "valuationAmount",
      Placeholder: "Placeholder",
    },
    {
      label: "Valuation Date",
      type: "date",
      name: "valuationDate",
      Placeholder: "Placeholder",
    },
  ];

  const getValidationSchema = (type: any) => {
    switch (type) {
      case "property":
        return Yup.object().shape({
          accountNumber: Yup.string().required("Account Number is required"),
          applicationID: Yup.string().required("Application ID is required"),
          propertyAddress: Yup.string().required(
            "Property Address is required"
          ),
          /* marketValue: Yup.number()
            .typeError("Market Value must be a number")
            .required("Market Value is required"),
          externalAgencyName: Yup.string().required(
            "External Agency Name is required"
          ),
          valuationAmount: Yup.number()
            .typeError("Valuation Amount must be a number")
            .required("Valuation Amount is required"),
          valuationDate: Yup.date()
            .typeError("Valid Valuation Date is required")
            .required("Valuation Date is required"), */
        });

      case "vehicle":
        return Yup.object().shape({
          accountNumber: Yup.string().required("Account Number is required"),
          applicationID: Yup.string().required("Application ID is required"),
          registrationNumber: Yup.string().required(
            "Vehicle Registration Number is required"
          ),
          vehicleType: Yup.number()
            .typeError("Vehicle Type must be selected")
            .required("Vehicle Type is required"),
          /* marketValue: Yup.number()
            .typeError("Market Value must be a number")
            .required("Market Value is required"),
          externalAgencyName: Yup.string().required(
            "External Agency Name is required"
          ),
          valuationAmount: Yup.number()
            .typeError("Valuation Amount must be a number")
            .required("Valuation Amount is required"),
          valuationDate: Yup.date()
            .typeError("Valid Valuation Date is required")
            .required("Valuation Date is required"), */
        });

      case "cash":
        return Yup.object().shape({
          accountNumber: Yup.string().required("Account Number is required"),
          applicationID: Yup.string().required("Application ID is required"),
          /* marketValue: Yup.number()
            .typeError("Market Value must be a number")
            .required("Market Value is required"), */
          collateralAmount: Yup.number()
            .typeError("Collateral Amount must be a number")
            .required("Collateral Amount is required"),
          collateralOwnerName: Yup.string().required(
            "Collateral Owner Name is required"
          ),
          mobileNumber: Yup.string()
            .matches(/^\d{10,15}$/, "Enter a valid Mobile Number")
            .required("Mobile Number is required"),
          nid: Yup.string().required("NID is required"),
          email: Yup.string()
            .email("Enter a valid Email Address")
            .required("Email is required"),
          bankName: Yup.string().required("Bank Name is required"),
          branchCode: Yup.string().required("Branch Code is required"),
          accountNo: Yup.string().required("Account Number is required"),
        });

      default:
        return Yup.object().shape({});
    }
  };
  // handle choose file
  const handleFileDrop = (e: any) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;

    setFiles((prevFiles: any) => [...prevFiles, ...Array.from(droppedFiles)]);
  };

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
  const handleChangeType = (value: any) => {
    setVehicleType(value);
  };
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
    getAccountDetails();
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
  const handleChange = (e: any, key: any) => { };
  const getAccountDetails = async () => {
    try {
      const response = await getAllAccountDetails();
      if (response) {
        const data = response.data.data.map((account: any) => account.accountNumber);

        setAccountData(data);
      }
    } catch (error: any) {
      toast.error("error");
    }
  };

  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;

    setFormValues((prevValues: any) => ({
      ...prevValues,
      [name]: value,
    }));
    if (name === "accountNumber") {
        const filtered = accountData.filter((account: any) => {
        // Ensure account is a string before calling toLowerCase
        return (
          typeof account === "string" &&
          account.toLowerCase().includes(value.toLowerCase())
        );
      });
      setFilteredAccounts(filtered);
    }

    // This handles updating the state of radio buttons
    if (type === "radio") {
      setradioInputValue(value);
    }
  };

  const handleSelect = (value: string) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      accountNumber: value,
    }));
    setFilteredAccounts([]); // Clear suggestions after selection
  };

  const validateForm = async (type: any, formValues: any) => {
    const validationSchema = getValidationSchema(type);
    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      return true; // Validation passed
    } catch (validationErrors: any) {
      const newErrors: any = {};
      validationErrors.inner.forEach((error: any) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors); // Return validation errors
    }
  };

  const submitCollateralData = async () => {
    setLoader(true);
    const validationErrors = await validateForm(radioInputValue, formValues);
    if (validationErrors !== true) {
      console.error("Validation Errors:", errors);
      setLoader(false);
      return;
    }

    const propertyBody = {
      accountId: accountId ? accountId : "",
      applicationId: formValues.applicationID,
      collateralType:
        radioInputValue == "property"
          ? 0
          : radioInputValue == "vehicle"
            ? 1
            : 2,
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
        valuationDate: formValues.valuationDate,
        valuationReports: ["string"],
      },
    };
    const vehicleBody = {
      accountId: accountId ? accountId : "",
      applicationId: formValues.applicationID,
      collateralType:
        radioInputValue == "property"
          ? 0
          : radioInputValue == "vehicle"
            ? 1
            : 2,
      availabilityStatus: 0,
      vehicleRegistrationNo: "test",
      vehicleType: vehicleType,
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
        valuationDate: formValues.valuationDate,
        valuationReports: ["string"],
      },
    };
    const cashBody = {
      accountId: accountId ? accountId : "",
      applicationId: formValues.applicationID,
      marketValue: formValues.marketValue,
      collateralAmount: formValues.collateralAmount,
      propertyAddress: formValues.propertyAddress,
      ownerName: formValues.collateralOwnerName,
      mobileNumber: formValues.mobileNumber,
      nid: formValues.nid,
      email: formValues.email,
      bankName: formValues.bankName,
      branchCode: formValues.branchCode,
      accountNo: formValues.accountNo,
      documents: [
        {
          cashCollateralId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          file: "string",
          trackingNo: "string",
          receivedDate: "2024-10-04T10:01:44.132Z",
          status: true,
        },
      ],
      collateralCashValuation: {
        externalAgencyName: formValues.externalAgencyName,
        valuationAmount: formValues.valuationAmount,
        valuationDate: formValues.valuationDate,
        valuationReports: ["string"],
      },
    };
    try {
      const response = await axios.post(
        radioInputValue == "property"
          ? `${import.meta.env.VITE_REACT_APP_API_BASE_URL
          }/api/PropertyCollateral/Create`
          : radioInputValue == "vichel"
            ? `${import.meta.env.VITE_REACT_APP_API_BASE_URL
            }/api/VehicleCollateral/Create`
            : `${import.meta.env.VITE_REACT_APP_API_BASE_URL
            }/api/CashCollateral/Create`,
        radioInputValue == "property"
          ? propertyBody
          : radioInputValue == "vehicle"
            ? vehicleBody
            : cashBody,
        {
          headers: {
            "Content-Type": "application/json",
            "Request-Id": uuidv4(),
          },
        }
      );
      if (response) {
        setLoader(false);
        toast.success("Collateral submitted successfully");
        navigate("/lms/LoanManagement/CollateralManagement");
      }
    } catch (error) {
      console.error("Error:", error);
      setLoader(false);
      toast.error("Failed to submit collateral");
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
        Collateral Management
      </div>
      <div
        className="p-4"
        style={{ border: "1px solid var(--color-border-light)", borderRadius: "2px" }}
      >
        <div className="col-12 mt-5">
          <div className="col-8 d-flex justify-content-start mb-5">
            <div className="me-2 w-100">
              <label>Account Number</label>
              <span style={{ color: "red" }}> *</span>
              <Input
                name="accountNumber" // Updated to match API key
                value={formValues.accountNumber}
                onChange={handleInputChange}
                size="large"
                className="mt-2"
                placeholder="placeholder"
              />
              {errors.accountNumber && (
                <p className="mt-1" style={{ fontSize: "13px", color: "red" }}>
                  {errors.accountNumber}
                </p>
              )}
              {/* <Select
                showSearch
                value={formValues.accountNumber}
                onChange={handleSelect}
                onSearch={handleInputChange}
                placeholder="Select or type to search for account"
                filterOption={false} // Disable default filtering
                notFoundContent={null}
                size="large"
                className="mt-2"
                dropdownStyle={{ zIndex: 1000 }} // Adjust z-index if needed
              >
                {filteredAccounts.map((account: any, index: any) => (
                  <>
                    <option key={index} value={account}>
                      {account}
                    </option>
                  </>
                ))}
              </Select> */}
            </div>
            <div className="w-100">
              <label>Application ID</label>
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
              {errors.applicationID && (
                <p className="mt-1" style={{ fontSize: "13px", color: "red" }}>
                  {errors.applicationID}
                </p>
              )}
            </div>
          </div>
        </div>
        <hr />

        <Row>
          <Form.Label className="mt-2 fw-bold">Collateral Type</Form.Label>
          {CollateralType.map((field: any, index) => (
            <Col md={3} className="mb-3" key={index}>
              <Form.Group>
                {field.type === "radio" && (
                  <>
                    <Form.Check
                      className={`mt-4 d-flex align-items-center gap-1 ${radioInputValue == field.value ? "accent-red" : ""
                        }`}
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
          <Form.Label className="mt-2 fw-bold">Collateral Details</Form.Label>
          {radioInputValue == "vehicle" ? (
            <>
              {" "}
              {vehicleDetails.map((field: any, index) => (
                <Col md={4} className="mb-3" key={index}>
                  <Form.Group>
                    {field.type === "text" && (
                      <>
                        <Form.Label
                          className="mt-2 "
                          style={{ fontSize: "13px", fontWeight: "600" }}
                        >
                          {field.label}
                        </Form.Label>
                        <Form.Control
                          type={field.type}
                          placeholder={field.Placeholder}
                          onChange={handleInputChange}
                          value={formValues[field.name]}
                          name={field.name}
                        />
                        {errors[field.name] && (
                          <p
                            className="mt-1"
                            style={{
                              fontSize: "12px",
                              color: "red",
                              margin: "5px 0 0 0",
                            }}
                          >
                            {errors[field.name]}
                          </p>
                        )}
                      </>
                    )}
                    {field.type == "select" && (
                      <>
                        <Form.Label
                          className="mt-2 "
                          style={{ fontSize: "13px", fontWeight: "600" }}
                        >
                          {field.label}
                        </Form.Label>
                        <Select
                          onChange={field.onChange}
                          style={{ width: "100%", height: "40px" }}
                        >
                          {field?.options &&
                            field?.options?.map((option: any) => (
                              <Select.Option
                                key={option.value}
                                value={option?.value}
                              >
                                {option?.label}
                              </Select.Option>
                            ))}
                        </Select>
                        {errors[field.name] && (
                          <p
                            className="mt-1"
                            style={{
                              fontSize: "12px",
                              color: "red",
                              margin: "5px 0 0 0",
                            }}
                          >
                            {errors[field.name]}
                          </p>
                        )}
                      </>
                    )}
                    {field.type === "number" && (
                      <>
                        <Form.Label
                          className="mt-2 "
                          style={{ fontSize: "13px", fontWeight: "600" }}
                        >
                          {field.label}
                        </Form.Label>
                        <Form.Control
                          type={field.type}
                          placeholder={field.Placeholder}
                          onChange={handleInputChange}
                          value={formValues[field.name]}
                          name={field.name}
                        />
                        {errors[field.name] && (
                          <p
                            className="mt-1"
                            style={{
                              fontSize: "12px",
                              color: "red",
                              margin: "5px 0 0 0",
                            }}
                          >
                            {errors[field.name]}
                          </p>
                        )}
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
                      <>
                        <Form.Label
                          className="mt-2 "
                          style={{ fontSize: "13px", fontWeight: "600" }}
                        >
                          {field.label}
                        </Form.Label>
                        <Form.Control
                          type={field.type}
                          name={field.name}
                          placeholder={field.Placeholder}
                          onChange={handleInputChange}
                          value={formValues[field.name]}
                        />
                        {errors[field.name] && (
                          <p
                            className="mt-1"
                            style={{
                              fontSize: "12px",
                              color: "red",
                              margin: "5px 0 0 0",
                            }}
                          >
                            {errors[field.name]}
                          </p>
                        )}
                      </>
                    </Form.Group>
                  </Col>
                </>
              ))}
              <div className="mt-2 fw-bold">Collateral Owner</div>
              {collectrolOwnerDetails.map((field: any, index) => (
                <>
                  <Col md={4} className="mb-3" key={index}>
                    <Form.Group>
                      <>
                        <Form.Label
                          className="mt-2 "
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
                        {errors[field.name] && (
                          <p
                            className="mt-1"
                            style={{
                              fontSize: "12px",
                              color: "red",
                              margin: "5px 0 0 0",
                            }}
                          >
                            {errors[field.name]}
                          </p>
                        )}
                      </>
                    </Form.Group>
                  </Col>
                </>
              ))}
              <div className="mt-2 fw-bold">Source Account Information</div>
              {souceInfoDetails.map((field: any, index) => (
                <>
                  <Col md={4} className="mb-3" key={index}>
                    <Form.Group>
                      {field.type === "text" && (
                        <>
                          <Form.Label
                            className="mt-2 "
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
                          {errors[field.name] && (
                            <p
                              className="mt-1"
                              style={{
                                fontSize: "12px",
                                color: "red",
                                margin: "5px 0 0 0",
                              }}
                            >
                              {errors[field.name]}
                            </p>
                          )}
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
                      {errors[field.name] && (
                        <p
                          className="mt-1"
                          style={{
                            fontSize: "12px",
                            color: "red",
                            margin: "5px 0 0 0",
                          }}
                        >
                          {errors[field.name]}
                        </p>
                      )}
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
                  Upload Documents
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
                    {files.length} documents uploaded
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
          <Form.Label className="mt-2 fw-bold">Collateral Valuation</Form.Label>
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
                {errors[field.name] && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: "12px",
                      color: "red",
                      margin: "5px 0 0 0",
                    }}
                  >
                    {errors[field.name]}
                  </p>
                )}
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
                  Upload Valuation Report
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
                    {reportFiles.length} documents uploaded
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
              className="btn btn-danger"
              style={{
                backgroundColor: "var(--color-danger-action)",
                borderRadius: "2px",
                color: "var(--color-near-white)",
                border: "none",
              }}
            >
              Submit
            </button>
          </div>
        </Row>

        <Modal show={false} centered size="lg">
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
              <h3 className="mt-4 fw-bold">Collateral Under Review</h3>
              <p
                className="mt-4 mb-5"
                style={{ lineHeight: "24px", fontSize: "20px" }}
              >
                Collateral is under review. Your application will be <br />{" "}
                processed after the collateral details are verified.
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
                ok
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default CollateralManagementView;
