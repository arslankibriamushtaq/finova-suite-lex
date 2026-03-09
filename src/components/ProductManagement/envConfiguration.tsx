import { Input } from "antd";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { getProductById, saveVerificationMethods } from "../../redux/apis/apisCrud";
import { useSelector } from "react-redux";


function EnvConfig({ readOnly = false }: any) {
const[envData,setEnvData]=useState<any>()
  const location = useLocation();
  const product = useSelector((s: any) => s.block.productData);

  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;
  const sectionDefault = {

    url: "",
    endpoint: "",
    env: "",
    method: "",
    credentials: {},
    parameters: [] as any[],
  } as any;

  // Default structure for all services
  const getDefaultServiceStructure = () => ({
    url: "",
    endpoint: "",
    method: "",
    env: "",
    credentials: {},
    parameters: []
  });

  const [formValues, setFormValues] = useState<any>({
    product_id: productId,
    KYC_CITIZEN_INFO: {
      ...getDefaultServiceStructure(),
      credentials: { request_url: "", user_name: "", password: "" },
      parameters: ["nid", "dob"]
    },
    KYC_CITIZEN_ADDRESS: {
      ...getDefaultServiceStructure(),
      credentials: { request_url: "", user_name: "", password: "" },
      parameters: ["n", "dob", "lang"]
    },
    MOBILE_VERIFICATION: {
      ...getDefaultServiceStructure(),
      credentials: { "APP-ID": "", "APP-KEY": "", "SERVICE_KEY": "", "ORGANIZATION-NUMBER": "" },
      parameters: ["iqama", "mobile"]
    },
    KYB: {
      ...getDefaultServiceStructure(),
      credentials: { apiKey: "" },
      parameters: ["cr_number"]
    },
    GET_MANAGER: {
      ...getDefaultServiceStructure(),
      credentials: { apiKey: "" },
      parameters: ["cr_number"]
    },
    BAYAN_ME_FINANCIAL: {
      ...getDefaultServiceStructure(),
      credentials: { Domain: "", Id: "", Password: "" },
      parameters: ["CommercialRegistrationCode", "Year"]
    },
    BAYAN_CREDIT: {
      ...getDefaultServiceStructure(),
      credentials: { Domain: "", Id: "", Password: "" },
      parameters: ["CommercialRegistrationCode"]
    },
    BAYAN_NAE: {
      ...getDefaultServiceStructure(),
      credentials: { Domain: "", Id: "", Password: "" },
      parameters: [
        "SubjectRefDate", "LegalForm", "OfficialRegisteredNameArabic", "IssueDate",
        "ExpiryDate", "Contact Value", "ContractRequestDate", "MonthlyPaymentAmount", "ProviderContractNo"
      ]
    },
    SIMAH_CONSUMER: {
      ...getDefaultServiceStructure(),
      credentials: { Authorization: "", USER_ID: "" },
      parameters: [
        "ENQUIRY_REFERENCE", "AMOUNT", "NID", "expiryDate", "dob", "gender",
        "family_name", "first_name", "father_name", "address", "postal_code",
        "country_code", "mobile_number", "company_address", "postal_code"
      ]
    },
    ABSHER: {
      ...getDefaultServiceStructure(),
      credentials: { clientId: "", clientAuthorization: "" },
      parameters: ["nid", "otp"]
    }
  });

  useEffect(() => {
    const loadProductData = async () => {
      if (productId) {
        try {
          const response = await getProductById(productId, 'verification_methods');
          if (response?.data?.message === "success") {
            setEnvData(response?.data?.data||[])
  
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Failed to load Request Duration data");
        }
      }
    };
    loadProductData();
  }, [productId]);
  useEffect(() => {
    if (!envData) return;


    // If envData is already in the new object structure, merge it with defaults
    if (envData.product_id || (typeof envData === 'object' && !Array.isArray(envData))) {
      setFormValues((prev: any) => {
        const mergedData = { ...prev };
        
        // Merge each service with API data if available
        Object.keys(prev).forEach(serviceKey => {
          if (serviceKey !== 'product_id' && envData[serviceKey]) {
            mergedData[serviceKey] = {
              ...prev[serviceKey], // Keep default structure
              ...envData[serviceKey] // Override with API data
            };
          }
        });
        
        // Update product_id from API or keep current
        if (envData.product_id) {
          mergedData.product_id = envData.product_id;
        }
        
        return mergedData;
      });
    } else {
      // Handle legacy array structure
      const findTab = (name: string) => envData.find((item:any) => item.name === name) || {};

      setFormValues((prev:any) => ({
        product_id: productId,
        KYC_CITIZEN_INFO: { ...prev.KYC_CITIZEN_INFO, ...findTab("KYC_CITIZEN_INFO") },
        KYC_CITIZEN_ADDRESS: { ...prev.KYC_CITIZEN_ADDRESS, ...findTab("KYC_CITIZEN_ADDRESS") },
        MOBILE_VERIFICATION: { ...prev.MOBILE_VERIFICATION, ...findTab("MOBILE_VERIFICATION") },
        KYB: { ...prev.KYB, ...findTab("KYB") },
        GET_MANAGER: { ...prev.GET_MANAGER, ...findTab("GET_MANAGER") },
        BAYAN_ME_FINANCIAL: { ...prev.BAYAN_ME_FINANCIAL, ...findTab("BAYAN_ME_FINANCIAL") },
        BAYAN_CREDIT: { ...prev.BAYAN_CREDIT, ...findTab("BAYAN_CREDIT") },
        BAYAN_NAE: { ...prev.BAYAN_NAE, ...findTab("BAYAN_NAE") },
        SIMAH_CONSUMER: { ...prev.SIMAH_CONSUMER, ...findTab("SIMAH_CONSUMER") },
        ABSHER: { ...prev.ABSHER, ...findTab("ABSHER") },
      }));
    }
  }, [envData, productId]);

  const setNestedValue = (obj:any, path:string, value:any) => {
    const keys = path.split('.')
    const last = keys.pop() as string;
    let ref = obj;
    for (const key of keys) {
      const nextKey = isNaN(Number(key)) ? key : Number(key);
      if (ref[nextKey] === undefined || ref[nextKey] === null) {
        ref[nextKey] = isNaN(Number(key)) ? {} : [];
      }
      ref = ref[nextKey];
    }
    const finalKey:any = isNaN(Number(last)) ? last : Number(last);
    ref[finalKey] = value;
  }

  const handleSectionChange = (section:string, path:string, value:any) => {
    setFormValues((prev:any) => {
      const copy = { ...prev, [section]: JSON.parse(JSON.stringify(prev[section])) };
      setNestedValue(copy[section], path, value);
      return copy;
    })
  }

  const handleSave = async () => {
    // Ensure product_id is included and convert to number
    const payload = {
      ...formValues,
      product_id: parseInt(productId || '0')
    };
    
    
    // Try sending the payload directly without wrapper
    const body = payload;
    
    try{
      const res = await saveVerificationMethods(body);
      if(res?.data?.success){
        toast.success(res?.data?.message || "Saved successfully");
      }
    }catch(err:any){
      console.error("Save error:", err);
      console.error("Error response:", err?.response?.data);
      if(err?.response?.data?.errors){
        // Handle validation errors
        const errors = err.response.data.errors;
        const errorMessages = Object.keys(errors).map(key => 
          `${key}: ${errors[key].join(', ')}`
        ).join('\n');
        toast.error(`Validation failed:\n${errorMessages}`);
      } else {
        toast.error(err?.response?.data?.message || "Failed to save");
      }
    }
  }
  
  

  // const handleChange = (field: string, value: any) => {
  //   setFormValues((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  // };

  // const handleSubmit = async () => {
  //   const body = {
  //     product_id: Number(productId),
  //     KYC_CITIZEN_INFO: { // dynamic key based on the current tab
  //       url: formValues.url,
  //       endpoint: formValues.endpoint,
  //       env: formValues.env,
  //       credentials: formValues.credentials,
  //       parameters: formValues.parameters
  //     }
  //   };
  
  //   try {
  //     const res = await yourPostFunction(body);
  //     if (res?.data?.success) {
  //       toast.success(res.data.message);
  //     }
  //   } catch (err: any) {
  //     toast.error(err?.response?.data?.message || "Failed to save");
  //   }
  // };
  
  return (
    <><div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Kyc Citizen Info
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
            placeholder=""
            className="fs-6"
            value={formValues.KYC_CITIZEN_INFO?.url}
            onChange={(e) => handleSectionChange("KYC_CITIZEN_INFO", "url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
            placeholder=""
            className="fs-6"
            value={formValues.KYC_CITIZEN_INFO?.endpoint}
            onChange={(e) => handleSectionChange("KYC_CITIZEN_INFO", "endpoint", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
        
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
            className="fs-6"
            value={formValues.KYC_CITIZEN_INFO?.env}
            onChange={(e) => handleSectionChange("KYC_CITIZEN_INFO", "env", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
            className="fs-6"
            value={formValues.KYC_CITIZEN_INFO?.method}
            onChange={(e) => handleSectionChange("KYC_CITIZEN_INFO", "method", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Credentials
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Username
          </label>
          <Input
            className="fs-6"
            value={formValues.KYC_CITIZEN_INFO?.credentials?.user_name}
            onChange={(e) => handleSectionChange("KYC_CITIZEN_INFO", "credentials.user_name", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Password
          </label>
          <Input
            className="fs-6"
            value={formValues.KYC_CITIZEN_INFO?.credentials?.password}
            onChange={(e) => handleSectionChange("KYC_CITIZEN_INFO", "credentials.password", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label>
          <Input
            className="fs-6"
            value={formValues.KYC_CITIZEN_INFO?.credentials?.request_url}
            onChange={(e) => handleSectionChange("KYC_CITIZEN_INFO", "credentials.request_url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <h1
          className="pt-4 pb-3"
          style={{ fontSize: "16px", fontWeight: "bold" }}
        >
          Parameters
        </h1>
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
      Request URL
    </label> */}
          <Input
            className="fs-6"
            value={formValues.KYC_CITIZEN_INFO?.parameters?.[0]}
            onChange={(e) => handleSectionChange("KYC_CITIZEN_INFO", "parameters.0", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>

          <Input
            className="fs-6"
            value={formValues.KYC_CITIZEN_INFO?.parameters?.[1]}
            onChange={(e) => handleSectionChange("KYC_CITIZEN_INFO", "parameters.1", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
    </div><div>
        <h1
          className="pt-2 pb-3"
          style={{ fontSize: "16px", fontWeight: "bold" }}
        >
          Kyc Citizen Address
        </h1>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              Base URL
            </label>
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.url}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "url", e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              End Point
            </label>
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.endpoint}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "endpoint", e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              Environment
            </label>
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.env}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "env", e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              Method
            </label>
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.method}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "method", e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <h1
          className="pt-4 pb-3"
          style={{ fontSize: "16px", fontWeight: "bold" }}
        >
          Credentials
        </h1>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              Username
            </label>
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.credentials?.user_name}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "credentials.user_name", e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              Password
            </label>
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.credentials?.password}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "credentials.password", e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
              Request URL
            </label>
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.credentials?.request_url}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "credentials.request_url", e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <h1
            className="pt-4 pb-3"
            style={{ fontSize: "16px", fontWeight: "bold" }}
          >
            Parameters
          </h1>
          <Col md={6}>
            {/* <label className="mb-1" style={{ fontWeight: 400 }}>
      Request URL
    </label> */}
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.parameters?.[0]}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "parameters.0", e.target.value)}
              disabled={readOnly}
            />
          </Col>
          <Col md={6}>
            {/* <label className="mb-1" style={{ fontWeight: 400 }}>
      Request URL
    </label> */}
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.parameters?.[1]}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "parameters.1", e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            {/* <label className="mb-1" style={{ fontWeight: 400 }}>
      Request URL
    </label> */}
            <Input
              className="fs-6"
              value={formValues.KYC_CITIZEN_ADDRESS?.parameters?.[2]}
              onChange={(e) => handleSectionChange("KYC_CITIZEN_ADDRESS", "parameters.2", e.target.value)}
              disabled={readOnly}
            />
          </Col>
        </Row>
      </div>
      <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Mobile Verification
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.url}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.endpoint}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "endpoint", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.env}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "env", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.method}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "method", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Credentials
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            App Id
          </label>
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.credentials?.["APP-ID"]}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "credentials.APP-ID", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            App Key
          </label>
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.credentials?.["APP-KEY"]}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "credentials.APP-KEY", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Service Key
          </label>
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.credentials?.["SERVICE_KEY"]}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "credentials.SERVICE_KEY", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Organization Number
          </label>
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.credentials?.["ORGANIZATION-NUMBER"]}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "credentials.ORGANIZATION-NUMBER", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Parameters
      </h1>
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label> */}
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.parameters?.[0]}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "parameters.0", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label> */}
          <Input
          
            className="fs-6"
            value={formValues.MOBILE_VERIFICATION?.parameters?.[1]}
            onChange={(e) => handleSectionChange("MOBILE_VERIFICATION", "parameters.1", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
    </div>    <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        KYB
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
          
            className="fs-6"
            value={formValues.KYB?.url}
            onChange={(e) => handleSectionChange("KYB", "url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
          
            className="fs-6"
            value={formValues.KYB?.endpoint}
            onChange={(e) => handleSectionChange("KYB", "endpoint", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
          
            className="fs-6"
            value={formValues.KYB?.env}
            onChange={(e) => handleSectionChange("KYB", "env", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
          
            className="fs-6"
            value={formValues.KYB?.method}
            onChange={(e) => handleSectionChange("KYB", "method", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Credentials
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            API Key
          </label>
          <Input
          
            className="fs-6"
            value={formValues.KYB?.credentials?.apiKey}
            onChange={(e) => handleSectionChange("KYB", "credentials.apiKey", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Parameters
      </h1>
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label> */}
          <Input
          
            className="fs-6"
            value={formValues.KYB?.parameters?.[0]}
            onChange={(e) => handleSectionChange("KYB", "parameters.0", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
    </div>    <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Get Manager
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
          
            className="fs-6"
            value={formValues.GET_MANAGER?.url}
            onChange={(e) => handleSectionChange("GET_MANAGER", "url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
          
            className="fs-6"
            value={formValues.GET_MANAGER?.endpoint}
            onChange={(e) => handleSectionChange("GET_MANAGER", "endpoint", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
          
            className="fs-6"
            value={formValues.GET_MANAGER?.env}
            onChange={(e) => handleSectionChange("GET_MANAGER", "env", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
          
            className="fs-6"
            value={formValues.GET_MANAGER?.method}
            onChange={(e) => handleSectionChange("GET_MANAGER", "method", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Credentials
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            API Key
          </label>
          <Input
          
            className="fs-6"
            value={formValues.GET_MANAGER?.credentials?.apiKey}
            onChange={(e) => handleSectionChange("GET_MANAGER", "credentials.apiKey", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Parameters
      </h1>
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label> */}
          <Input
          
            className="fs-6"
            value={formValues.GET_MANAGER?.parameters?.[0]}
            onChange={(e) => handleSectionChange("GET_MANAGER", "parameters.0", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          {/* <label className="mb-1" style={{ fontWeight: 400 }}>
            Request URL
          </label> */}
          <Input
          
            className="fs-6"
            value={formValues.GET_MANAGER?.parameters?.[1]}
            onChange={(e) => handleSectionChange("GET_MANAGER", "parameters.1", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
    </div>    <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        BAYAN ME Financial
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_ME_FINANCIAL?.url}
            onChange={(e) => handleSectionChange("BAYAN_ME_FINANCIAL", "url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_ME_FINANCIAL?.endpoint}
            onChange={(e) => handleSectionChange("BAYAN_ME_FINANCIAL", "endpoint", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_ME_FINANCIAL?.env}
            onChange={(e) => handleSectionChange("BAYAN_ME_FINANCIAL", "env", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_ME_FINANCIAL?.method}
            onChange={(e) => handleSectionChange("BAYAN_ME_FINANCIAL", "method", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
        >
            Credentials
        </h1>
        <Row className="mb-4">
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                ID
            </label>
            <Input
              
                className="fs-6"
                value={formValues.BAYAN_ME_FINANCIAL?.credentials?.Id}
                onChange={(e) => handleSectionChange("BAYAN_ME_FINANCIAL", "credentials.Id", e.target.value)}
                disabled={readOnly}
            />
            </Col>
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                Domain
            </label>
            <Input
              
                className="fs-6"
                value={formValues.BAYAN_ME_FINANCIAL?.credentials?.Domain}
                onChange={(e) => handleSectionChange("BAYAN_ME_FINANCIAL", "credentials.Domain", e.target.value)}
                disabled={readOnly}
            />
            </Col>
        </Row>
        <Row className="mb-4">
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                Password
            </label>
            <Input
              
                className="fs-6"
                value={formValues.BAYAN_ME_FINANCIAL?.credentials?.Password}
                onChange={(e) => handleSectionChange("BAYAN_ME_FINANCIAL", "credentials.Password", e.target.value)}
                disabled={readOnly}
            />
            </Col>
        </Row>
      <Row className="mb-4">
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Parameters
      </h1>
        <Col md={6}>
          <Input
            className="fs-6"
            value={formValues.BAYAN_ME_FINANCIAL?.parameters?.[0]}
            onChange={(e) => handleSectionChange("BAYAN_ME_FINANCIAL", "parameters.0", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <Input
            className="fs-6"
            value={formValues.BAYAN_ME_FINANCIAL?.parameters?.[1]}
            onChange={(e) => handleSectionChange("BAYAN_ME_FINANCIAL", "parameters.1", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
    </div>  <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        BAYAN Credit
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_CREDIT?.url}
            onChange={(e) => handleSectionChange("BAYAN_CREDIT", "url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_CREDIT?.endpoint}
            onChange={(e) => handleSectionChange("BAYAN_CREDIT", "endpoint", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_CREDIT?.env}
            onChange={(e) => handleSectionChange("BAYAN_CREDIT", "env", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_CREDIT?.method}
            onChange={(e) => handleSectionChange("BAYAN_CREDIT", "method", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
        >
            Credentials
        </h1>
        <Row className="mb-4">
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                ID
            </label>
            <Input
              
                className="fs-6"
                value={formValues.BAYAN_CREDIT?.credentials?.Id}
                onChange={(e) => handleSectionChange("BAYAN_CREDIT", "credentials.Id", e.target.value)}
                disabled={readOnly}
            />
            </Col>
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                Domain
            </label>
            <Input
              
                className="fs-6"
                value={formValues.BAYAN_CREDIT?.credentials?.Domain}
                onChange={(e) => handleSectionChange("BAYAN_CREDIT", "credentials.Domain", e.target.value)}
                disabled={readOnly}
            />
            </Col>
        </Row>
        <Row className="mb-4">
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                Password
            </label>
            <Input
              
                className="fs-6"
                value={formValues.BAYAN_CREDIT?.credentials?.Password}
                onChange={(e) => handleSectionChange("BAYAN_CREDIT", "credentials.Password", e.target.value)}
                disabled={readOnly}
            />
            </Col>
        </Row>
      <Row className="mb-4">
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Parameters
      </h1>
        <Col md={6}>
          <Input
            className="fs-6"
            value={formValues.BAYAN_CREDIT?.parameters?.[0]}
            onChange={(e) => handleSectionChange("BAYAN_CREDIT", "parameters.0", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
    </div>  <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        BAYAN NAE
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_NAE?.url}
            onChange={(e) => handleSectionChange("BAYAN_NAE", "url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_NAE?.endpoint}
            onChange={(e) => handleSectionChange("BAYAN_NAE", "endpoint", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_NAE?.env}
            onChange={(e) => handleSectionChange("BAYAN_NAE", "env", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
          
            className="fs-6"
            value={formValues.BAYAN_NAE?.method}
            onChange={(e) => handleSectionChange("BAYAN_NAE", "method", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
        >
            Credentials
        </h1>
        <Row className="mb-4">
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                ID
            </label>
            <Input
              
                className="fs-6"
                value={formValues.BAYAN_NAE?.credentials?.Id}
                onChange={(e) => handleSectionChange("BAYAN_NAE", "credentials.Id", e.target.value)}
                disabled={readOnly}
            />
            </Col>
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                Domain
            </label>
            <Input
              
                className="fs-6"
                value={formValues.BAYAN_NAE?.credentials?.Domain}
                onChange={(e) => handleSectionChange("BAYAN_NAE", "credentials.Domain", e.target.value)}
                disabled={readOnly}
            />
            </Col>
        </Row>
        <Row className="mb-4">
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                Password
            </label>
            <Input
              
                className="fs-6"
                value={formValues.BAYAN_NAE?.credentials?.Password}
                onChange={(e) => handleSectionChange("BAYAN_NAE", "credentials.Password", e.target.value)}
                disabled={readOnly}
            />
            </Col>
        </Row>
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
        >
        Parameters
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <Input className="fs-6" value={formValues.BAYAN_NAE?.parameters?.[0]} onChange={(e)=>handleSectionChange("BAYAN_NAE","parameters.0",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6}>
          <Input className="fs-6" value={formValues.BAYAN_NAE?.parameters?.[1]} onChange={(e)=>handleSectionChange("BAYAN_NAE","parameters.1",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.BAYAN_NAE?.parameters?.[2]} onChange={(e)=>handleSectionChange("BAYAN_NAE","parameters.2",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.BAYAN_NAE?.parameters?.[3]} onChange={(e)=>handleSectionChange("BAYAN_NAE","parameters.3",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.BAYAN_NAE?.parameters?.[4]} onChange={(e)=>handleSectionChange("BAYAN_NAE","parameters.4",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.BAYAN_NAE?.parameters?.[5]} onChange={(e)=>handleSectionChange("BAYAN_NAE","parameters.5",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.BAYAN_NAE?.parameters?.[6]} onChange={(e)=>handleSectionChange("BAYAN_NAE","parameters.6",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.BAYAN_NAE?.parameters?.[7]} onChange={(e)=>handleSectionChange("BAYAN_NAE","parameters.7",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.BAYAN_NAE?.parameters?.[8]} onChange={(e)=>handleSectionChange("BAYAN_NAE","parameters.8",e.target.value)} disabled={readOnly} />
        </Col>
      </Row>
    </div>  <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        SIMAH CONSUMER
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
          
            className="fs-6"
            value={formValues.SIMAH_CONSUMER?.url}
            onChange={(e) => handleSectionChange("SIMAH_CONSUMER", "url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
          
            className="fs-6"
            value={formValues.SIMAH_CONSUMER?.endpoint}
            onChange={(e) => handleSectionChange("SIMAH_CONSUMER", "endpoint", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
          
            className="fs-6"
            value={formValues.SIMAH_CONSUMER?.env}
            onChange={(e) => handleSectionChange("SIMAH_CONSUMER", "env", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
          
            className="fs-6"
            value={formValues.SIMAH_CONSUMER?.method}
            onChange={(e) => handleSectionChange("SIMAH_CONSUMER", "method", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
        >
            Credentials
        </h1>
        <Row className="mb-4">
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                USER_ID
            </label>
            <Input
              
                className="fs-6"
                value={formValues.SIMAH_CONSUMER?.credentials?.USER_ID}
                onChange={(e) => handleSectionChange("SIMAH_CONSUMER", "credentials.USER_ID", e.target.value)}
                disabled={readOnly}
            />
            </Col>
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                Authorization
            </label>
            <Input
              
                className="fs-6"
                value={formValues.SIMAH_CONSUMER?.credentials?.Authorization}
                onChange={(e) => handleSectionChange("SIMAH_CONSUMER", "credentials.Authorization", e.target.value)}
                disabled={readOnly}
            />
            </Col>
        </Row>
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Parameters
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[0]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.0",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6}>
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[1]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.1",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[2]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.2",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[3]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.3",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[4]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.4",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[5]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.5",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[6]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.6",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[7]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.7",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[8]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.8",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[9]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.9",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[10]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.10",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[11]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.11",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[12]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.12",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[13]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.13",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6} className="mt-3">
          <Input className="fs-6" value={formValues.SIMAH_CONSUMER?.parameters?.[14]} onChange={(e)=>handleSectionChange("SIMAH_CONSUMER","parameters.14",e.target.value)} disabled={readOnly} />
        </Col>

      </Row>
    </div>  <div>
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        ABSHER
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Base URL
          </label>
          <Input
          
            className="fs-6"
            value={formValues.ABSHER?.url}
            onChange={(e) => handleSectionChange("ABSHER", "url", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            End Point
          </label>
          <Input
          
            className="fs-6"
            value={formValues.ABSHER?.endpoint}
            onChange={(e) => handleSectionChange("ABSHER", "endpoint", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Environment
          </label>
          <Input
          
            className="fs-6"
            value={formValues.ABSHER?.env}
            onChange={(e) => handleSectionChange("ABSHER", "env", e.target.value)}
            disabled={readOnly}
          />
        </Col>
        <Col md={6}>
          <label className="mb-1" style={{ fontWeight: 400 }}>
            Method
          </label>
          <Input
          
            className="fs-6"
            value={formValues.ABSHER?.method}
            onChange={(e) => handleSectionChange("ABSHER", "method", e.target.value)}
            disabled={readOnly}
          />
        </Col>
      </Row>
      <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
        >
            Credentials
        </h1>
        <Row className="mb-4">
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                Client ID
            </label>
            <Input
              
                className="fs-6"
                value={formValues.ABSHER?.credentials?.clientId}
                onChange={(e) => handleSectionChange("ABSHER", "credentials.clientId", e.target.value)}
                disabled={readOnly}
            />
            </Col>
            <Col md={6}>
            <label className="mb-1" style={{ fontWeight: 400 }}>
                Client Authorization
            </label>
            <Input
              
                className="fs-6"
                value={formValues.ABSHER?.credentials?.clientAuthorization}
                onChange={(e) => handleSectionChange("ABSHER", "credentials.clientAuthorization", e.target.value)}
                disabled={readOnly}
            />
            </Col>
        </Row>
        <h1
        className="pt-4 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        Parameters
      </h1>
      <Row className="mb-4">
        <Col md={6}>
          <Input className="fs-6" value={formValues.ABSHER?.parameters?.[0]} onChange={(e)=>handleSectionChange("ABSHER","parameters.0",e.target.value)} disabled={readOnly} />
        </Col>
        <Col md={6}>
          <Input className="fs-6" value={formValues.ABSHER?.parameters?.[1]} onChange={(e)=>handleSectionChange("ABSHER","parameters.1",e.target.value)} disabled={readOnly} />
        </Col>
      </Row>

    </div>
    {!readOnly && (
      <div className="d-flex justify-content-end mt-3">
        <button className="theme-btn-next" onClick={handleSave}>Save</button>
      </div>
    )}
    </>
  );
}

export default EnvConfig;
