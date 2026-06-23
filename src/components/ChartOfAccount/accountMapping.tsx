import React, { useState, useEffect } from "react";
import { Select } from "antd";
import { SlidersHorizontal } from "lucide-react";
import { Row, Col, Form, Button, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  getChartOfAccounts,
  getLedgerAccount,
  MapLedgerAccount,
  getCoaFields,
  SaveChartOfAccounts,
} from "../../redux/apis/apisCrudLms";
import { getAllProducts } from "../../redux/apis/apisCrudProductManagement";
import toast from "react-hot-toast";

const AccountMapping = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<any>({});
  const [changedFields, setChangedFields] = useState<any>({});
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [assignedFieldsData, setAssignedFieldsData] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  
  // Product related state
  const [prodId, setProdId] = useState<any[]>([]);
  const [formValues, setFormValues] = useState<any>({
    productID: "",
    productName: "",
  });

  // Tab related states
  const [activeTab, setActiveTab] = useState<string>("assign");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const navigate = useNavigate();

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch dynamic fields - only needed for Tab 1
      const coaResponse = await getCoaFields(true);
      const fields = coaResponse?.data?.data || [];
      setDynamicFields(fields);

      // Fetch products
      const productsRes = await getAllProducts();
      if (productsRes?.data?.data) {
        setProdId(productsRes.data.data);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getChartOfAccountsData = async (productId: string) => {
    if (!productId) {
      setSelectedAccounts({});
      setChangedFields({});
      setSelectedFields([]);
      setAssignedFieldsData([]);
      return;
    }
    
    try {
      setLoading(true);
      const res = await getChartOfAccounts(productId);
      if (res) {
        const mappedAccounts = res?.data?.data || res?.data || [];
        
        const assignedFields: string[] = [];
        if (Array.isArray(mappedAccounts)) {
          mappedAccounts.forEach((account: any) => {
            if (account.fieldKey) {
              assignedFields.push(account.fieldKey);
            }
          });
        }
        
        setAssignedFieldsData(mappedAccounts);
        setSelectedFields(assignedFields);
        setSelectedAccounts({}); // Ready for recalculation once customerData exists
        setChangedFields({});
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load mapping data");
      setSelectedAccounts({});
      setSelectedFields([]);
      setAssignedFieldsData([]);
    } finally {
      setLoading(false);
    }
  };

  const accountsDetailsForList = async () => {
    try {
      const response = await getLedgerAccount(1, 1000, searchValue);
      if (response) {
        const valueMain = response?.data?.data || [];
        setCustomerData(valueMain);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Recalculate selected accounts for Tab 2 once data and dictionary is ready
  useEffect(() => {
    if (activeTab === "map" && assignedFieldsData.length > 0 && customerData.length > 0) {
      const initialSelections: any = {};
      assignedFieldsData.forEach((account: any) => {
        const match = customerData?.find(
          (customer: any) => 
            customer.id === account.accountId || 
            customer.id === account.ledgerAccountId || 
            customer.id === account.chartOfAccountId ||
            customer.accountCode === account.accountCode
        );

        if (match) {
          initialSelections[account.coaFieldId] = match.id;
        }
      });
      setSelectedAccounts(initialSelections);
      setChangedFields({});
    }
  }, [assignedFieldsData, customerData, activeTab]);

  const saveSelectedAccounts = async () => {
    if (!formValues.productID) {
      toast.error("Please select a product");
      return;
    }
    
    try {
      setLoading(true);
      const payload = { fieldKeys: selectedFields };
      const res = await SaveChartOfAccounts(formValues.productID, payload);
      if (res) {
        toast.success(res?.data?.notificationMessage || "Accounts saved successfully");
        getChartOfAccountsData(formValues.productID);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to save accounts");
    } finally {
      setLoading(false);
    }
  };

  const mapAccounts = async () => {
    if (!formValues.productID) {
      toast.error("Please select a product");
      return;
    }
    
    if (Object.keys(selectedAccounts).length === 0) return;

    try {
      // Build array of payloads containing all mappings
      const assignments = Object.entries(selectedAccounts)
        .map(([coaFieldId, accountId]) => {
          const field = assignedFieldsData.find((f: any) => f.coaFieldId === coaFieldId);
          const account = customerData.find((a: any) => a.id === accountId);
          
          if (!field?.fieldKey || !account?.accountCode) return null;
          
          return {
            fieldKey: field.fieldKey,
            accountCode: account.accountCode,
          };
        })
        .filter(Boolean); // removes nulls
      
      const payload = { assignments };

      // Call API
      const res = await MapLedgerAccount(formValues.productID, payload);
      if (res) {
        toast.success(res?.data?.notificationMessage || "Mapped successfully");
      }
      
      setChangedFields({});
      // Refresh the data after mapping
      getChartOfAccountsData(formValues.productID);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSelectChange = (name: string, value: any) => {
    setSelectedAccounts((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
    setChangedFields((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only fetch ledger accounts when on Map tab
      if (activeTab === "map") {
        accountsDetailsForList();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchValue, activeTab]);

  return (
    <div className="service coa-config-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          Chart of Account Configuration
        </h3>
      </div>
      <div className="coa-card">
      {loading ? (
        <>
          <Row className="mb-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <Col md={4} key={index} className="pt-3">
                <Skeleton height={40} />
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <>
          <Row>
            <Col md={4} className="mb-3 pt-2">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  Select Product
                </Form.Label>
                <Select
                  showSearch
                  value={formValues.productID || undefined}
                  onChange={(value) => {
                    const selectedProduct = prodId?.find((p: any) => p.id === value);
                    setFormValues((prevValues: any) => ({
                      ...prevValues,
                      productID: value,
                      productName: selectedProduct?.nameEn || "",
                    }));
                    getChartOfAccountsData(value);
                  }}
                  style={{ width: "100%" }}
                  placeholder="Select Product"
                  filterOption={(input, option: any) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {prodId?.map((option: any) => (
                    <Select.Option key={option.id} value={option.id}>
                      {option?.nameEn}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Group>
            </Col>
          </Row>

          <Tabs
            id="account-mapping-tabs"
            activeKey={activeTab}
            onSelect={(k: any) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="assign" title="Assign Accounts">
              <div className="py-2">
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Assign Accounts to Product
                </h4>
                <Row className="mb-3">
                  {dynamicFields.sort((a, b) => a.displayOrder - b.displayOrder).map((field: any) => (
                    <Col md={4} key={field.id} className="pt-3">
                      <Form.Check
                        type="checkbox"
                        id={`checkbox-${field.id}`}
                        label={
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {field.fieldLabelEn} {field.mandatoryDefault && <span className="text-danger">*</span>}
                          </span>
                        }
                        checked={selectedFields.includes(field.fieldKey)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFields((prev) => [...prev, field.fieldKey]);
                          } else {
                            setSelectedFields((prev) => prev.filter((key) => key !== field.fieldKey));
                          }
                        }}
                        disabled={!formValues.productID}
                      />
                    </Col>
                  ))}
                  {dynamicFields.length === 0 && (
                    <Col className="pt-3 text-muted">
                      No active fields available.
                    </Col>
                  )}
                </Row>
                <hr className="my-4" />
                <div className="d-flex justify-content-end">
                  <Button
                    className="theme-btn-next"
                    onClick={saveSelectedAccounts}
                    disabled={!formValues.productID}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Tab>

            <Tab eventKey="map" title="Map Ledger Accounts">
              <div className="py-2">
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Chart of Account Mapping
                </h4>
                <Row className="mb-3">
                  {assignedFieldsData.map((field: any) => (
                    <Col md={4} key={field.id} className="pt-3">
                      <Form.Group>
                        <Form.Label
                          className="mt-2"
                          style={{ fontSize: "12px", fontWeight: "700" }}
                          title={field.fieldKey}
                        >
                          {field.fieldLabelEn} {field.mandatoryOverride && <span className="text-danger">*</span>}
                        </Form.Label>
                        <Select
                          showSearch
                          value={selectedAccounts[field.coaFieldId] || null}
                          onChange={(value) => handleSelectChange(field.coaFieldId, value)}
                          style={{ width: "100%", height: "40px" }}
                          placeholder={field.fieldLabelEn}
                          filterOption={(input, option: any) =>
                            option?.children?.toLowerCase().includes(input.toLowerCase())
                          }
                          allowClear={!field.mandatoryOverride}
                          disabled={!formValues.productID}
                        >
                          {(customerData || []).map((option: any) => (
                            <Select.Option key={option.id} value={option.id}>
                              {option.accountName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Group>
                    </Col>
                  ))}
                  {assignedFieldsData.length === 0 && (
                    <Col className="pt-3 text-muted">
                      No accounts assigned for this product. Please assign them in the first tab.
                    </Col>
                  )}
                </Row>
                <hr className="my-4" />
                <div className="d-flex justify-content-end">
                  <Button
                    className="theme-btn-next"
                    onClick={mapAccounts}
                    disabled={Object.keys(changedFields).length === 0 || !formValues.productID}
                  >
                    Save Mapping
                  </Button>
                </div>
              </div>
            </Tab>
          </Tabs>
        </>
      )}
      </div>
    </div>
  );
};

export default AccountMapping;
