import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Form } from "react-bootstrap";
import Loader from "../../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { Modal, Select, Spin, StepProps, Steps } from "antd";
import {
  createApplication,
  createLoan,
  createLoanSchedule,
  getAllProducts,
  getCustomerInformation,
  getNextAccountNumber,
  getProductBusiness,
  getProductIndividual,
} from "../../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { themeStyle } from "../../../components/Config/Theme";
import { RootState } from "../../../redux/rootReducer";
import { useSelector } from "react-redux";
import { channel } from "diagnostics_channel";
import {
  BankOutlined,
  FileDoneOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
const Application = () => {
  const { t } = useTranslation("loanManagement");
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [nextAccNum, setNextAccNum] = useState<any>(null);
  // const [prodId, setProdId] = useState<any>();
  const [businessId, setBusinessId] = useState<any>();
  const [individualId, setIndividualId] = useState<any>();
  const [customer, setCustomer] = useState<any>();
  const [customerId, setCustomerId] = useState<any>();
  const [customerName, setCustomerName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const prodId = useSelector((state: RootState) => state.block.prodId);
  const [customerInfo, setCustomerInfo] = useState<{
    customerType: number;
    value: string;
  } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepProps[]>([
    { title: t("application.stepLoanCreation"), status: "wait" },
  { title: t("application.stepApplicationCreation"), status: "wait" },
  { title: t("application.stepScheduleGeneration"), status: "wait" },
  ]);
const getStepIcon = (step: any, status: any) => {
  const iconsMap = {
    0: <FileTextOutlined />,
    1: <FileDoneOutlined />,
    2: <CalendarOutlined />,
  };

  if (status === "process") return <Spin indicator={<LoadingOutlined />} />;
  if (status === "finish") return <CheckCircleOutlined style={{ color: "var(--color-success)" }} />;
  if (status === "error") return <CloseCircleOutlined style={{ color: "#7a0e0e" }} />;
  return iconsMap[step]; // default for "wait"
};
  const [formValues, setFormValues] = useState<any>({
    accountNo: 0,
    company: "",
    branch: "",
    subUnit: "",
    productId: "",
    productName: "",
    // kycId: "",
    // kybId: "",
    isVariableRateLoan: false,
    loanAmount: 0,
    payableStatus: 0,
    interestRate: 0,
    duration: 0,
    tenureType: 1,
    tenureDuration: 0,
    cr: "",
    nid: "",
  });

  const validateFields = () => {
    const newErrors: any = {};
    Object.keys(formValues).forEach((key) => {
      const value = formValues[key];
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        newErrors[key] = t("fieldRequired");
      }
    });

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  // const getProductId = async () => {
  //   try {
  //     const res = await getAllProducts(1, 1000);
  //     if (res) {
  //       const data = res.data.data;
  //       setProdId(data);
  //     }
  //   } catch (error: any) {
  //     toast.error(error?.message);
  //   }
  // };
  const getProductIndividualDetail = async () => {
    try {
      const res = await getProductIndividual();
      if (res) {
        const data = res.data.data;
        setIndividualId(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const getProductBusinessDetail = async () => {
    try {
      const res = await getProductBusiness();
      if (res) {
        const data = res.data.data;

        setBusinessId(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const getAccountNum = async () => {
    try {
      const res = await getNextAccountNumber();
      if (res) {
        const data = res.data.data;
        setNextAccNum(data);
        setFormValues({
          accountNo: res?.data?.data.accountNumber,
        });
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const getProductById = (id: any) => {
    const entry: any = prodId?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
    const getLosId = (id: any) => {
    const entry: any = prodId?.find((entry: any) => entry.id === id);
    return entry ? entry.losId : null;
  };
  useEffect(() => {
    // getAccountNum();
    // getProductId();
    // getProductIndividualDetail();
    // getProductBusinessDetail();
  }, []);

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    if (name === "loanAmount" && value < 0) {
      setErrors({ ...errors, loanAmount: t("application.errLoanNegative") });
    } else if (name === "interestRate" && value < 0) {
      setErrors({
        ...errors,
        interestRate: t("application.errInterestNegative"),
      });
    } else if (name === "tenureDuration" && value < 0) {
      setErrors({
        ...errors,
        tenureDuration: t("application.errDurationNegative"),
      });
    } else {
      setFormValues((prevValues: any) => ({
        ...prevValues,
        [name]: value,
      }));
      setErrors({ ...errors, loanAmount: null });
    }
    if (name === "cr" || name === "nid") {
      const customerType = name === "cr" ? 2 : 1; // Set customer type: 2 for business, 1 for individual
      setCustomerInfo({ customerType, value });
    }
  };

  useEffect(() => {
    if (customerInfo) {
      const timeoutId = setTimeout(() => {
        getCstInformation(customerInfo.customerType, customerInfo.value);
      }, 5000);

      return () => clearTimeout(timeoutId); // Cleanup timeout
    }
  }, [customerInfo]);

  const getCstInformation = async (
    customerType: number,
    searchString: string
  ) => {
    try {
      //setLoader(true);
      const response = await getCustomerInformation(customerType, searchString);
      if (response?.data?.data?.name) {
        setCustomerName(response.data.data.name);
        setCustomerId(response.data.data.customerId);
      } else {
        //toast.error("Customer not found.");
        setCustomerName("");
        setCustomerId("");
      }
    } catch (error) {
      toast.error(t("application.toastCustomerFetchFailed"));
    } finally {
      //setLoader(false);
    }
  };

  useEffect(() => {
    let val = {};
    if (customer === "business") {
      val = {
        accountNo: 0,
        company: "",
        branch: "",
        subUnit: "",
        productId: "",
        productName: "",
        isVariableRateLoan: false,
        loanAmount: 0,
        payableStatus: 0,
        interestRate: 0,
        duration: 0,
        tenureType: 1,
        tenureDuration: 0,
        cr: "",
      };
    } else {
      val = {
        accountNo: 0,
        productId: "",
        productName: "",
        isVariableRateLoan: false,
        loanAmount: 0,
        payableStatus: 0,
        interestRate: 0,
        duration: 0,
        tenureType: 1,
        tenureDuration: 0,
        nid: "",
      };
    }
    setFormValues(val);
  }, [customer]);

const handleSave = async () => {
  if (!validateFields()) return;

  setIsModalVisible(true);
  setStepStatus([
    { title: t("application.stepLoanCreation"), status: "wait" },
    { title: t("application.stepApplicationCreation"), status: "wait" },
    { title: t("application.stepScheduleGeneration"), status: "wait" },
  ]);

  setLoader(true);

  let loanSuccess = false;
  let appSuccess = false;
  let scheduleSuccess = false;

  let loanData = null;

  try {
    // Step 1: Loan Creation
    setStepStatus((prev) => {
      const updated = [...prev];
      updated[0].status = "process";
      return updated;
    });

    const loanBody = {
      accountNo: formValues.accountNo,
      company: formValues.company || "",
      branch: formValues.branch || "",
      subUnit: formValues.subUnit || "",
      // productId: formValues.productId,
      productName: getProductById(formValues.productId),
      productId: getLosId(formValues.productId),
      isVariableRateLoan: formValues.isVariableRateLoan,
      loanAmount: formValues.loanAmount || 0,
      payableStatus: formValues.payableStatus,
      tenureType: formValues.tenureType,
      intrustRate: formValues.interestRate,
      tenureDuration: formValues.tenureDuration,
      customerId: customerId,
      CustomerType: customer === "business" ? 2 : 1,
      documents: [
        {
          url: "string",
          comments: "string",
          documentExpiry: "2024-10-29T09:49:52.977Z",
          trackingNumber: "string",
        },
      ],
      channel: "LMS"
    };

    const loanResponse = await createLoan(loanBody);
    loanData = loanResponse?.data?.data;

    if (!loanData || !loanData.id) {
      setStepStatus((prev) => {
        const updated = [...prev];
        updated[0].status = "error";
        return updated;
      });
      throw new Error("Failed to create loan or missing loan ID");
    }

    loanSuccess = true;

    // Step 2: Application Creation
    const applicationBody = {
      loanID: loanData.id,
      productName: loanData.productName,
      channel: loanData.channel || "string",
      applicationNo: "string",
    };

    setStepStatus((prev) => {
      const updated = [...prev];
      updated[1].status = "process";
      return updated;
    });

    const appResponse = await createApplication(applicationBody);
    if (appResponse.data.notificationMessage !== "Operation successful.") {
      setStepStatus((prev) => {
        const updated = [...prev];
        updated[1].status = "error";
        return updated;
      });
      toast.error(appResponse.data.notificationMessage);
      throw new Error("Application creation failed");
    }

    appSuccess = true;

    // Step 3: Schedule Generation
    const loanScheduleBody = { loanID: loanData.id };

    setStepStatus((prev) => {
      const updated = [...prev];
      updated[2].status = "process";
      return updated;
    });

    const scheduleResponse = await createLoanSchedule(loanScheduleBody);
    if (
      scheduleResponse.data.notificationMessage !== "Operation successful."
    ) {
      setStepStatus((prev) => {
        const updated = [...prev];
        updated[2].status = "error";
        return updated;
      });
      toast.error(scheduleResponse.data.notificationMessage);
      throw new Error("Schedule generation failed");
    }

    scheduleSuccess = true;

    // All successful: show steps with delay
    const delays = [0, 3000, 3000]; // Customize delay in ms per step
    const statuses: ("finish" | "wait" | "process" | "error")[] = ["finish", "finish", "finish"];

    for (let i = 0; i < statuses.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, delays[i]));
      setStepStatus((prev) => {
        const updated = [...prev];
        updated[i].status = statuses[i];
        if (i < statuses.length - 1) {
          updated[i + 1].status = "process";
        }
        return updated;
      });
    }

    toast.success(t("application.toastProcessed"));
    navigate("/lms/LoanManagement/ApplicationManagement");
  } catch (error) {
    console.error("Error saving data", error);
    setErrors({ api: "Failed to process the loan application." });
  } finally {
    setLoader(false);
  }
};


  const isVariableRateLoanOptions = [
    { label: t("option.true"), value: true },
    { label: t("option.false"), value: false },
  ];

  const tenureTypeOptions = [
    { label: t("option.monthly"), value: 2 },
    { label: t("option.yearly"), value: 1 },
  ];
  const businessOption = [
    { label: t("option.business"), value: "business" },
    { label: t("option.individual"), value: "individual" },
  ];
  const payableStatusOptions = [
    { label: "EARLY SETTLEMENT", value: 0 },
    { label: "DUE", value: 1 },
    { label: "OVER DUE", value: 2 },
    { label: "NON PERFORMING ", value: 3 },
    { label: "WRITE OFF", value: 4 },
    { label: " BROKEN PROMISE ", value: 5 },
  ];

  return (
    <div>
      {/* {loader && <Loader />} */}

      <div className="mt-2">
        <div className="col-12 mt-2">
          {/* <div
            className="d-flex align-items-center justify-content-between mt-1 mb-3"
            style={{ fontSize: "15px", fontWeight: "Bold" }}
          >
            Application
          </div> */}
        </div>

        <div className="px-4 mt-2 mb-4">
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  {t("field.customersType")}
                </Form.Label>
                <Select
                  value={customer}
                  onChange={(e: any) => {
                    setCustomer(e);
                  }}
                  style={{ width: "100%" }}
                  placeholder={t("placeholder.selectCustomer")}
                >
                  {businessOption?.map((option) => (
                    <Select.Option value={option.value}>
                      <div
                        onClick={() => {
                          setCustomerName("");
                        }}
                      >
                        {option?.label}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
                <Form.Control.Feedback type="invalid">
                  {errors.customer}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {customer == "business" && (
              <>
                {/* <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Business
                    </Form.Label>
                    <Select
                      value={customerId}
                      onChange={(value) => {
                        setFormValues((prevValues) => ({
                          ...prevValues,
                          kybId: value,
                        }));
                      }}
                      style={{ width: "100%" }}
                      placeholder="Select Business"
                    >
                      {businessId?.map((option) => (
                        <Select.Option
                          key={option.customerId}
                          value={option.customerId}
                        >
                          {option?.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.kybId}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col> */}
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      {t("field.unn")}
                    </Form.Label>
                    <Form.Control
                      name="cr"
                      type="text"
                      value={formValues.cr}
                      placeholder={t("placeholder.enterUnn")}
                      onChange={handleInputChange}
                      isInvalid={!!errors.cr}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cr}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      {t("field.customerName")}
                    </Form.Label>
                    <Form.Control
                      name="customerName"
                      type="text"
                      value={customerName}
                      readOnly
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.customerName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </>
            )}
            {customer == "individual" && (
              <>
                {/* <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Customer
                    </Form.Label>
                    <Select
                      value={customerId}
                      onChange={(value) => {
                        setFormValues((prevValues) => ({
                          ...prevValues,
                          kycId: value,
                        }));
                      }}
                      style={{ width: "100%" }}
                      placeholder="Select Customer"
                    >
                      {individualId?.map((option) => (
                        <Select.Option value={option.customerId}>
                          {option?.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.kycId}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col> */}
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      {t("field.nid")}
                    </Form.Label>
                    <Form.Control
                      name="nid"
                      type="text"
                      value={formValues.nid}
                      placeholder={t("placeholder.enterNid")}
                      onChange={handleInputChange}
                      isInvalid={!!errors.nid}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.nid}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      {t("field.customerName")}
                    </Form.Label>
                    <Form.Control
                      name="customerName"
                      type="text"
                      value={customerName}
                      readOnly
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.customerName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </>
            )}

            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  {t("field.productName")}
                </Form.Label>
                <Select
                  value={formValues.productName}
                  onChange={(value, option) => {
                    setFormValues((prevValues:any) => ({
                      ...prevValues,
                      productId: value,
                    }));
                  }}
                  style={{ width: "100%" }}
                  placeholder={t("placeholder.selectProductName")}
                >
                  {prodId?.map((option:any) => (
                    <Select.Option value={option?.id}>
                      <div
                        onClick={() => {
                          setFormValues((prevValues:any) => ({
                            ...prevValues,
                            productName: option?.name,
                          }));
                        }}
                      >
                        {option?.name}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
                <Form.Control.Feedback type="invalid">
                  {errors.nameInEnglish}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {customer != "individual" && (
              <>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      {t("field.company")}
                    </Form.Label>
                    <Form.Control
                      name="company"
                      type="text"
                      value={formValues.company}
                      onChange={handleInputChange}
                      isInvalid={!!errors.company}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.company}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </>
            )}
            {customer != "individual" && (
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    {t("field.branch")}
                  </Form.Label>
                  <Form.Control
                    name="branch"
                    type="text"
                    value={formValues.branch}
                    onChange={handleInputChange}
                    isInvalid={!!errors.branch}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.branch}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            {customer != "individual" && (
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    {t("field.subUnit")}
                  </Form.Label>
                  <Form.Control
                    name="subUnit"
                    type="text"
                    value={formValues.subUnit}
                    onChange={handleInputChange}
                    isInvalid={!!errors.subUnit}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.subUnit}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  {t("field.isVariableRateLoan")}
                </Form.Label>
                <Select
                  value={formValues.isVariableRateLoan}
                  onChange={(value) =>
                    setFormValues((prevValues: any) => ({
                      ...prevValues,
                      isVariableRateLoan: value,
                    }))
                  }
                  style={{ width: "100%" }}
                  placeholder={t("placeholder.selectVariableRateLoan")}
                >
                  {isVariableRateLoanOptions?.map((option) => (
                    <Select.Option value={option.value}>
                      {option?.label}
                    </Select.Option>
                  ))}
                </Select>
                <Form.Control.Feedback type="invalid">
                  {errors.isVariableRateLoan}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  {t("field.loanAmount")}
                </Form.Label>
                <Form.Control
                  name="loanAmount"
                  type="number"
                  min="0"
                  value={formValues.loanAmount}
                  onChange={handleInputChange}
                  isInvalid={!!errors.loanAmount}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.loanAmount}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {/* <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  Payable Status
                </Form.Label>
                <Select
                  value={formValues?.payableStatus}
                  onChange={(value) =>
                    setFormValues((prevValues: any) => ({
                      ...prevValues,
                      payableStatus: value,
                    }))
                  }
                  style={{ width: "100%" }}
                  placeholder="Select Payable Status"
                >
                  {payableStatusOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option?.label}
                    </Select.Option>
                  ))}
                </Select>
                <Form.Control.Feedback type="invalid">
                  {errors.payableStatus}
                </Form.Control.Feedback>
              </Form.Group>
            </Col> */}
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  {t("field.tenureType")}
                </Form.Label>
                <Select
                  value={formValues.tenureType}
                  onChange={(value) =>
                    setFormValues((prevValues: any) => ({
                      ...prevValues,
                      tenureType: value,
                    }))
                  }
                  style={{ width: "100%" }}
                  placeholder={t("placeholder.selectTenureType")}
                >
                  {tenureTypeOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option?.label}
                    </Select.Option>
                  ))}
                </Select>
                <Form.Control.Feedback type="invalid">
                  {errors.tenureType}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  {t("field.interestRate")}
                </Form.Label>
                <Form.Control
                  name="interestRate"
                  type="number"
                  min="0"
                  value={formValues.interestRate}
                  onChange={handleInputChange}
                  isInvalid={!!errors.interestRate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.interestRate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  {t("field.tenureDuration")}
                </Form.Label>
                <Form.Control
                  name="tenureDuration"
                  type="number"
                  value={formValues.tenureDuration}
                  onChange={handleInputChange}
                  isInvalid={!!errors.tenureDuration}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.tenureDuration}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="col-12 d-flex justify-content-end mt-4 mb-5 align-items-center">
            <button
              className="invoice-btn mb-4 me-3"
              onClick={() => navigate(-1)}
              style={{
                //background: themeStyle.revertActionColor,
                color: "var(--primary-foreground)",
                borderRadius: "2px",
                borderColor: "white",
                padding: "8px 16px",
              }}
            >
              {t("common:cancel")}
            </button>
            <button
              onClick={() => {
                handleSave();
              }}
              className="theme-btn-next mb-4 me-3"
              style={{
                //background: "#EB0D0D",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "2px",
                padding: "12px",
              }}
            >
              {t("application.saveAndNext")}
            </button>
          </div>
        </div>
      </div>
      <Modal maskClosable={false} keyboard={false}
        title={t("application.processingTitle")}
        open={isModalVisible}
        footer={null}
        centered
         closable={false}
        onCancel={() => setIsModalVisible(false)}
        width={700}
      
      >
      <div style={{height: "200px", display: "flex", justifyContent: "center", alignItems: "center"}}>
          <Steps
          direction="horizontal"
          current={stepStatus.findIndex((s) => s.status === "process")}
          items={stepStatus.map((step, index) => ({
            title: step.title,
            status: step.status,
            icon: getStepIcon(index, step.status),
          }))}
        />
      </div>
      </Modal>
    </div>
  );
};

export default Application;
