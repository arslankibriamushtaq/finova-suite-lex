import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Form, Modal, Tab, Tabs, Button, Badge } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  createDeliquency,
  getDeliquency,
  principleEarlySettlement,
  getEarlySettlement,
  updateProductDelinquency,
  getProductById,
  getProducts,
} from "../../../redux/apis/apisCrudLms";
import Loader from "../../Loader/Loader";
import { useNavigate } from "react-router-dom";
import EarlySettlementFixedFrequency from "../../EarlySettlementFixedFrequency";
import EarlySettlementCustomFrequency from "../../EarlySettlementCustomFrequency";

// Enum matching backend ProductDeliquencyType
enum ProductDeliquencyType {
  InvoiceBased = 1,
  PrincipleBased = 2
}

const EarlySettlement = ({ productId, setSelectedTab }: any) => {
  const navigate = useNavigate();
  // const [files, setFiles] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("SetDelinquencyType");
  const [radioInputValue, setradioInputValue] = useState("FixedFrequency");
  const [customFrequencyData, setCustomFrequencyData] = useState<any>();
   const [customInvoicesData, setCustomInvoicesData] = useState<any>();
  const [loader, setLoader] = useState(true);
  const [fields, setFields] = useState([
    { Time: "", Days: "", notification: "" },
  ]);
  const [formValues, setFormValues] = useState<any>({
    penalty: "",
    days: "",
    fromDay: "",
    tillDay: "",
    promisesPerYear: "",
    promisesPerLoan: "",
    isPercentage: false,
  });
  const [errors, setErrors] = useState({}); // Track validation errors

  // Principle Based state
  const [discountType, setDiscountType] = useState<"Fixed" | "Percentage">(
    "Fixed"
  );
  const [noOfMonths, setNoOfMonths] = useState<string>("");
  const [profitAmount, setProfitAmount] = useState<string>("");
  const [principleErrors, setPrincipleErrors] = useState<any>({});
  const [delinquencyId, setDelinquencyId] = useState<string>("");
  const [isInvoiceBasedActive, setIsInvoiceBasedActive] = useState<boolean>(false);
  const [isPrincipleBasedActive, setIsPrincipleBasedActive] = useState<boolean>(false);
  const [currentProductId, setCurrentProductId] = useState<string | number | undefined>(productId);

  const settleMentType = [
    {
      label: "Fixed Frequency",
      type: "radio",
      name: "FixedFrequency",
      value: "FixedFrequency",
    },
    {
      label: "Custom Frequency",
      type: "radio",
      name: "CustomFrequency",
      value: "CustomFrequency",
    },
  ];



  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));
    if (type === "radio") {
      setradioInputValue(value);
    }

    // Clear error for the field being changed
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const getDeliquencyData = async (prodId?: string | number) => {
    const idToUse = prodId || currentProductId || productId;
    if (!idToUse) return;
    //setLoader(true);
    try {
      const res = await getDeliquency(idToUse);
      if (res.data.notificationMessage == "Operation successful.") {
        setradioInputValue(
          res?.data?.data?.delinquencies[0]?.isCustom
            ? "CustomFrequency"
            : "FixedFrequency"
        );
        setCustomFrequencyData(res?.data?.data?.delinquencies);
        setCustomInvoicesData(res?.data?.data?.earlySettlementsConfigs)
        const data = res?.data?.data?.delinquencies.find((item: { delinquencyType: number; })=>item.delinquencyType === 1);
        setFormValues({
          ...formValues,
          isPercentage: data?.isPercentage,
          penalty: data?.isPercentage
            ? data?.penaltyPercentage
            : data?.penaltyAmount,
          fromDay: data?.fromDay,
          tillDay: data?.tillDay,
        });
        
        // Store delinquencyId for later use
        if (data?.id) {
          setDelinquencyId(data.id);
        }
        
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      // setLoading(false);
      toast.error(error.message || "An error occurred");
    }
  };

  const fetchEarlySettlementData = async (delinquencyId: string) => {
    const idToUse = currentProductId || productId;
    if (!idToUse) return;
    setLoader(true);
    try {
      const res = await getEarlySettlement(idToUse, delinquencyId);
      if (res?.data?.success && res?.data?.data) {
        const data = res.data.data;
        
        // Populate the form fields
        setNoOfMonths(data.numberOfMonth?.toString() || "");
        
        // Set discount type based on isPercentage
        if (data.isPercentage) {
          setDiscountType("Percentage");
          setProfitAmount(data.discountPercentage?.toString() || "");
        } else {
          setDiscountType("Fixed");
          setProfitAmount(data.discountAmount?.toString() || "");
        }
      } else {
        // Reset to default when no data is found
        setDiscountType("Fixed");
        setNoOfMonths("");
        setProfitAmount("");
      }
    } catch (error: any) {
      // Reset to default when error occurs or no data exists
      console.log("No existing early settlement data found");
      setDiscountType("Fixed");
      setNoOfMonths("");
      setProfitAmount("");
    } finally {
      setLoader(false);
    }
  };

  // First, get all products to get the productId
  const getAllProductsData = async () => {
    setLoader(true);
    try {
      const res = await getProducts();
      if (res?.data?.notificationMessage === "Operation successful." || res?.data?.success || res?.data?.data) {
        const products = res?.data?.data || res?.data || [];
        // Use the passed productId if available, otherwise use the first product's ID
        const selectedProductId = productId || (products.length > 0 ? products[0]?.id : null);
        
        if (selectedProductId) {
          setCurrentProductId(selectedProductId);
          // Now fetch the product details to get delinquencyType (this will set the active/inactive states)
          await fetchProductData(selectedProductId, true);
          // Also fetch delinquency data
          await getDeliquencyData(selectedProductId);
        } else {
          setLoader(false);
          toast.error("No products found");
        }
      } else {
        setLoader(false);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error(error?.message || "Failed to fetch products");
      setLoader(false);
    }
  };

  // Fetch product data to determine delinquency type
  const fetchProductData = async (prodId?: string | number, shouldSetActiveTab: boolean = true) => {
    const idToUse = prodId || currentProductId || productId;
    if (!idToUse) return;
    
    try {
      const res = await getProductById(idToUse);
      if (res?.data?.notificationMessage === "Operation successful." || res?.data?.success) {
        // Check for deliquencyType at different possible paths in the response
        // User mentioned deliquencyType is the key (with lowercase 'q')
        const delinquencyType = res?.data?.data?.deliquencyType 
          || res?.data?.data?.delinquencyType 
          || res?.data?.deliquencyType;
        
        console.log("Fetched delinquencyType:", delinquencyType, "from response:", res?.data);
        console.log("Full response data structure:", {
          hasData: !!res?.data?.data,
          dataKeys: res?.data?.data ? Object.keys(res?.data?.data) : [],
          directKeys: Object.keys(res?.data || {})
        });
        
        if (delinquencyType === ProductDeliquencyType.InvoiceBased || delinquencyType === 1) {
          // Invoice Based is active
          console.log("Setting Invoice Based as active");
          setIsInvoiceBasedActive(true);
          setIsPrincipleBasedActive(false);
          if (shouldSetActiveTab) {
            setActiveSubTab("InvoiceBased");
          }
        } else if (delinquencyType === ProductDeliquencyType.PrincipleBased || delinquencyType === 2) {
          // Principle Based is active
          console.log("Setting Principle Based as active");
          setIsInvoiceBasedActive(false);
          setIsPrincipleBasedActive(true);
          if (shouldSetActiveTab) {
            setActiveSubTab("PrincipleBased");
          }
        } else {
          // No delinquency type set, default to Set Delinquency Type tab
          console.log("No delinquency type found, setting both as inactive");
          setIsInvoiceBasedActive(false);
          setIsPrincipleBasedActive(false);
          if (shouldSetActiveTab) {
            setActiveSubTab("SetDelinquencyType");
          }
        }
      } else {
        console.log("API response not successful:", res?.data);
      }
      setLoader(false);
    } catch (error: any) {
      console.error("Error fetching product data:", error);
      toast.error(error?.message || "Failed to fetch product data");
      setLoader(false);
    }
  };

  useEffect(() => {
    getAllProductsData();
  }, []);

  // Update when productId prop changes
  useEffect(() => {
    if (productId && productId !== currentProductId) {
      setCurrentProductId(productId);
      fetchProductData(productId);
      getDeliquencyData(productId);
    }
  }, [productId, currentProductId]);

  // Fetch early settlement data when productId or delinquencyId changes and on PrincipleBased tab
  useEffect(() => {
    const idToUse = currentProductId || productId;
    if (idToUse && delinquencyId && activeSubTab === "PrincipleBased") {
      fetchEarlySettlementData(delinquencyId);
    }
  }, [currentProductId, productId, delinquencyId, activeSubTab]);

  const handlePrincipleSubmit = async () => {
    const idToUse = currentProductId || productId;
    try {
      if (!idToUse) {
        toast.error("Please select a product first");
        return;
      }

      // Validation
      const validationErrors: any = {};

      if (!noOfMonths) {
        validationErrors.noOfMonths = "Number of months is required";
      } else if (Number(noOfMonths) <= 0) {
        validationErrors.noOfMonths = "Number of months must be greater than 0";
      }

      if (!profitAmount) {
        validationErrors.profitAmount = "Amount is required";
      } else if (Number(profitAmount) <= 0) {
        validationErrors.profitAmount = "Amount must be greater than 0";
      }

      if (Object.keys(validationErrors).length > 0) {
        setPrincipleErrors(validationErrors);
        toast.error("Please fill all required fields");
        return;
      } else {
        setPrincipleErrors({});
      }

      const payload = {
        productId: idToUse,
        delinquencyId: customFrequencyData?.find((item: { delinquencyType: number; })=>item.delinquencyType === 1)?.id,
        noOfMonths: Number(noOfMonths) || 0,
        discount: Number(profitAmount) || 0,
        discountType: discountType === "Fixed" ? 0 : 1,
      };

      setLoader(true);
      const res = await principleEarlySettlement(payload);
      if (res?.data?.notificationMessage) {
        toast.success(res.data.notificationMessage);
      } else {
        toast.success("Principle based early settlement saved successfully");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save principle based early settlement"
      );
    } finally {
      setLoader(false);
    }
  };

  const InvoiceBasedContent = useMemo(() => (
    <div className="border-deliquencies p-4 mt-4">
      <div
        className="d-flex align-items-center justify-content-between mt-1"
        style={{ fontSize: "15px", fontWeight: "Bold" }}
      >
        Penalty Amount Settings
      </div>
      <Row>
        {settleMentType.map((field, index) => (
          <Col md={3} className="mb-3" key={index}>
            <Form.Group>
              {field.type === "radio" && (
                <Form.Check
                  className={`mt-4 d-flex align-items-center gap-1 ${
                    radioInputValue == field.value ? "accent-green" : ""
                  }`}
                  type={field.type}
                  label={field.label}
                  name={field.name}
                  value={field.value}
                  checked={radioInputValue === field.value}
                  onChange={handleInputChange}
                  style={{ fontSize: "14px", fontWeight: "700" }}
                />
              )}
            </Form.Group>
          </Col>
        ))}
      </Row>

      {radioInputValue == "FixedFrequency" ? (
        <EarlySettlementFixedFrequency
          productId={currentProductId || productId}
          setSelectedTab={setSelectedTab}
          formValues={formValues}
          radioInputValue={radioInputValue}
        />
      ) : (
        <EarlySettlementCustomFrequency
          productId={currentProductId || productId}
          setSelectedTab={setSelectedTab}
          formValues={customFrequencyData || []}
          customInvoicesData={customInvoicesData}
          radioInputValue={radioInputValue}
        />
      )}
    </div>
  ), [radioInputValue, productId, formValues, customFrequencyData, customInvoicesData]);

  const PrincipleBasedContent = useMemo(() => (
    <div className="border-deliquencies p-4 mt-4">
      <div
        className="d-flex align-items-center justify-content-between mt-1"
        style={{ fontSize: "15px", fontWeight: "Bold" }}
      >
        Principle Based Early Settlement
      </div>

      {/* Discount Type and No. of Months */}
      <Row className="mt-3">
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>
              Discount
            </Form.Label>
            <Form.Select
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as "Fixed" | "Percentage")
              }
            >
              <option value="Fixed">Fixed</option>
              <option value="Percentage">Percentage</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>
              Number of Months
            </Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={noOfMonths}
              onChange={(e) => {
                setNoOfMonths(e.target.value);
                setPrincipleErrors((prev: any) => ({ ...prev, noOfMonths: "" }));
              }}
              placeholder="Enter number of months"
            />
            {principleErrors?.noOfMonths && (
              <div className="text-danger mt-1" style={{ fontSize: "12px" }}>
                {principleErrors.noOfMonths}
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      {/* Amount field */}
      <Row className="mt-3">
        <Col md={6} className="mb-3">
          <Form.Group>
            {discountType === "Fixed" && (
            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>
              Fixed Amount per month
            </Form.Label>)}
            {discountType === "Percentage" && (
              <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>
                Percentage  Amount per month
              </Form.Label>
            )}
            <Form.Control
              type="number"
              min={0}
              value={profitAmount}
              onChange={(e) => {
                setProfitAmount(e.target.value);
                setPrincipleErrors((prev: any) => ({ ...prev, profitAmount: "" }));
              }}
              placeholder="Enter amount"
            />
            {principleErrors?.profitAmount && (
              <div className="text-danger mt-1" style={{ fontSize: "12px" }}>
                {principleErrors.profitAmount}
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      <div className="mt-3 d-flex justify-content-end">
        <Button variant="primary" onClick={handlePrincipleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  ), [discountType, noOfMonths, profitAmount, principleErrors]);

  return (
    <div>
      {loader && <Loader />}
      <Tabs
        id="early-settlement-sub-tabs"
        className="mt-3 position-relative tabs-overflow"
        activeKey={activeSubTab}
        onSelect={async (tab: any) => {
          // Only allow switching to InvoiceBased or PrincipleBased if they are active
          if (tab === "InvoiceBased" && !isInvoiceBasedActive) {
            toast.error("Invoice Based tab is inactive. Please activate it from the Set Delinquency Type tab.");
            return;
          }
          if (tab === "PrincipleBased" && !isPrincipleBasedActive) {
            toast.error("Principle Based tab is inactive. Please activate it from the Set Delinquency Type tab.");
            return;
          }
          
          const idToUse = currentProductId || productId;
          // Call API when selecting InvoiceBased or PrincipleBased tabs
          if (tab === "InvoiceBased" && isInvoiceBasedActive) {
            setLoader(true);
            try {
              const res = await updateProductDelinquency({
                productId: idToUse,
                deliquencyType: ProductDeliquencyType.InvoiceBased
              });
              if (res?.data?.notificationMessage) {
                toast.success(res.data.notificationMessage);
              }
              setLoader(false);
            } catch (error: any) {
              setLoader(false);
              toast.error(error?.response?.data?.message || error?.message || "Failed to update product delinquency");
            }
          } else if (tab === "PrincipleBased" && isPrincipleBasedActive) {
            setLoader(true);
            try {
              const res = await updateProductDelinquency({
                productId: idToUse,
                deliquencyType: ProductDeliquencyType.PrincipleBased
              });
              if (res?.data?.notificationMessage) {
                toast.success(res.data.notificationMessage);
              }
              // Fetch early settlement data when Principle Based tab is clicked (it manages its own loader)
              if (delinquencyId) {
                await fetchEarlySettlementData(delinquencyId);
              } else {
                setLoader(false);
              }
            } catch (error: any) {
              setLoader(false);
              toast.error(error?.response?.data?.message || error?.message || "Failed to update product delinquency");
            }
          }
          
          setActiveSubTab(tab);
        }}
      >
        <Tab eventKey="SetDelinquencyType" title="Set Early Settlement Type">
          <div className="border-deliquencies p-4 mt-4">
            <h6 className="mb-4 fw-bold">Activate/Deactivate Tabs</h6>
            <Row>
              {[
                { key: "InvoiceBased", label: "Invoice Based", isActive: isInvoiceBasedActive, setIsActive: setIsInvoiceBasedActive, delinquencyType: ProductDeliquencyType.InvoiceBased },
                { key: "PrincipleBased", label: "Principle Based", isActive: isPrincipleBasedActive, setIsActive: setIsPrincipleBasedActive, delinquencyType: ProductDeliquencyType.PrincipleBased }
              ].map((tab) => (
                <Col md={6} key={tab.key} className="mb-3">
                  <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                    <div>
                      <h6 className="mb-1 fw-semibold">{tab.label}</h6>
                      <small className="text-muted">{tab.isActive ? "Currently Active" : "Currently Inactive"}</small>
                    </div>
                    {tab.isActive ? (
                      <Badge bg="success" style={{ fontSize: "14px", padding: "8px 16px" }}>
                        Activated
                      </Badge>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          // Activating - deactivate the other tab first
                          const idToUse = currentProductId || productId;
                          setLoader(true);
                          // Update state first
                          if (tab.key === "InvoiceBased") {
                            setIsPrincipleBasedActive(false);
                            setIsInvoiceBasedActive(true);
                          } else {
                            setIsInvoiceBasedActive(false);
                            setIsPrincipleBasedActive(true);
                          }
                          setActiveSubTab(tab.key);
                          // API call to update product delinquency (activate)
                          try {
                            const res = await updateProductDelinquency({
                              productId: idToUse,
                              deliquencyType: tab.delinquencyType
                            });
                            if (res?.data?.notificationMessage) {
                              toast.success(res.data.notificationMessage);
                            } else {
                              toast.success(`${tab.label} tab activated successfully`);
                            }
                            // Fetch early settlement data if needed (it manages its own loader)
                            if (tab.key === "PrincipleBased" && delinquencyId) {
                              await fetchEarlySettlementData(delinquencyId);
                            } else {
                              setLoader(false);
                            }
                            // Don't refresh product data immediately - keep the state we just set
                            // The state is already updated above, so we don't need to fetch again
                          } catch (error: any) {
                            setLoader(false);
                            toast.error(error?.response?.data?.message || error?.message || "Failed to activate tab");
                            // Revert state on error
                            setIsInvoiceBasedActive(false);
                            setIsPrincipleBasedActive(false);
                            setActiveSubTab("SetDelinquencyType");
                          }
                        }}
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
            <div className="mt-3 p-3 bg-light rounded">
              <small className="text-muted">
                <strong>Note:</strong> Only one tab can be active at a time.
              </small>
            </div>
          </div>
        </Tab>
        <Tab eventKey="InvoiceBased" title="Invoice Based" disabled={!isInvoiceBasedActive}>
          {activeSubTab === "InvoiceBased" && isInvoiceBasedActive && InvoiceBasedContent}
          {activeSubTab === "InvoiceBased" && !isInvoiceBasedActive && (
            <div className="text-center p-4 text-muted">
              This tab is currently inactive. Please activate it from the Set Delinquency Type tab.
            </div>
          )}
        </Tab>
        <Tab eventKey="PrincipleBased" title="Principle Based" disabled={!isPrincipleBasedActive}>
          {activeSubTab === "PrincipleBased" && isPrincipleBasedActive && PrincipleBasedContent}
          {activeSubTab === "PrincipleBased" && !isPrincipleBasedActive && (
            <div className="text-center p-4 text-muted">
              This tab is currently inactive. Please activate it from the Set Delinquency Type tab.
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default EarlySettlement;
