import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Form, Tab, Tabs, Button, Badge } from "react-bootstrap";
import toast from "react-hot-toast";
import { createDeliquency, getDeliquency } from "../../../redux/apis/apisCrudLms";
import Loader from "../../Loader/Loader";
import EarlySettlementFixedFrequency from "../../EarlySettlementFixedFrequency";
import EarlySettlementCustomFrequency from "../../EarlySettlementCustomFrequency";

enum ProductDeliquencyType {
  InvoiceBased = 1,
  PrincipleBased = 2
}

const EarlySettlement = ({ productId, setSelectedTab }: any) => {
  const { t } = useTranslation("productManagement2");
  const [activeSubTab, setActiveSubTab] = useState("SetDelinquencyType");
  const [radioInputValue, setradioInputValue] = useState("FixedFrequency");
  const [customFrequencyData, setCustomFrequencyData] = useState<any>();
  const [customInvoicesData, setCustomInvoicesData] = useState<any>();
  const [loader, setLoader] = useState(true);
  const [formValues, setFormValues] = useState<any>({
    penalty: "",
    days: "",
    fromDay: "",
    tillDay: "",
    promisesPerYear: "",
    promisesPerLoan: "",
    isPercentage: false,
  });
  const [errors, setErrors] = useState({});

  // Principle Based state — maps to new API fields
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [settlementMonths, setSettlementMonths] = useState<string>("");
  const [settlementAmountPerMonth, setSettlementAmountPerMonth] = useState<string>("");
  const [principleErrors, setPrincipleErrors] = useState<any>({});
  const [delinquencyId, setDelinquencyId] = useState<string>("");
  const [isInvoiceBasedActive, setIsInvoiceBasedActive] = useState<boolean>(false);
  const [isPrincipleBasedActive, setIsPrincipleBasedActive] = useState<boolean>(false);

  const settleMentType = [
    { label: t("delinquency.fixedFrequency"), type: "radio", name: "FixedFrequency", value: "FixedFrequency" },
    { label: t("delinquency.customFrequency"), type: "radio", name: "CustomFrequency", value: "CustomFrequency" },
  ];

  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));
    if (type === "radio") setradioInputValue(value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const getDeliquencyData = async (prodId?: string | number) => {
    const idToUse = prodId || productId;
    if (!idToUse) return;
    try {
      const res = await getDeliquency(idToUse);
      const delinquencies = res?.data?.data || [];
      setCustomFrequencyData(delinquencies);

      const record = delinquencies.find((d: any) => d.delinquencyType === 1);
      setCustomInvoicesData(record?.earlySettlementConfigs);
      if (record) {
        setradioInputValue(record.isCustom ? "CustomFrequency" : "FixedFrequency");
        setFormValues({
          ...formValues,
          isPercentage: record.isPercentage,
          penalty: record.isPercentage ? record.penaltyPercentage : record.penaltyAmount,
          fromDay: record.fromDay,
          tillDay: record.tillDay,
        });
        if (record.id) setDelinquencyId(record.id);

        if (record.settlementDiscountType) setDiscountType(record.settlementDiscountType);
        if (record.settlementMonths != null) setSettlementMonths(record.settlementMonths.toString());
        if (record.settlementAmountPerMonth != null) setSettlementAmountPerMonth(record.settlementAmountPerMonth.toString());

        if (record.settlementStrategy === ProductDeliquencyType.PrincipleBased) {
          setIsPrincipleBasedActive(true);
          setIsInvoiceBasedActive(false);
          setActiveSubTab("PrincipleBased");
        } else if (record.settlementStrategy === ProductDeliquencyType.InvoiceBased) {
          setIsInvoiceBasedActive(true);
          setIsPrincipleBasedActive(false);
          setActiveSubTab("InvoiceBased");
        }
      }
    } catch (error: any) {
      toast.error(error.message || t("delinquency.errorOccurred"));
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (productId) getDeliquencyData(productId);
    else setLoader(false);
  }, [productId]);

  const handlePrincipleSubmit = async () => {
    const idToUse = productId;
    if (!idToUse) { toast.error(t("delinquency.selectProductFirst")); return; }

    const validationErrors: any = {};
    if (!settlementMonths || Number(settlementMonths) <= 0) validationErrors.settlementMonths = t("delinquency.monthsGreaterThanZero");
    if (!settlementAmountPerMonth || Number(settlementAmountPerMonth) <= 0) validationErrors.settlementAmountPerMonth = t("delinquency.amountGreaterThanZero");

    if (Object.keys(validationErrors).length > 0) {
      setPrincipleErrors(validationErrors);
      toast.error(t("delinquency.fillAllRequired"));
      return;
    }
    setPrincipleErrors({});

    const body = {
      productId: idToUse,
      delinquencyType: 1,
      settlementStrategy: ProductDeliquencyType.PrincipleBased,
      settlementDiscountType: discountType,
      settlementMonths: Number(settlementMonths),
      settlementAmountPerMonth: Number(settlementAmountPerMonth),
      isCustom: false,
      configs: [],
    };

    setLoader(true);
    try {
      const res = await createDeliquency(body);
      toast.success(t("common:savedSuccessfully"));
      setSelectedTab("DueLoan");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t("delinquency.failedToSave"));
    } finally {
      setLoader(false);
    }
  };

  const InvoiceBasedContent = useMemo(() => (
    <div className="border-deliquencies p-4 mt-4">
      <div className="d-flex align-items-center justify-content-between mt-1" style={{ fontSize: "15px", fontWeight: "Bold" }}>
        {t("delinquency.penaltyAmountSettings")}
      </div>
      <Row>
        {settleMentType.map((field, index) => (
          <Col md={3} className="mb-3" key={index}>
            <Form.Group>
              {field.type === "radio" && (
                <Form.Check
                  className={`mt-4 d-flex align-items-center gap-1 ${radioInputValue == field.value ? "accent-green" : ""}`}
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
          productId={productId}
          setSelectedTab={setSelectedTab}
          formValues={formValues}
          radioInputValue={radioInputValue}
          settlementStrategy={ProductDeliquencyType.InvoiceBased}
        />
      ) : (
        <EarlySettlementCustomFrequency
          productId={productId}
          setSelectedTab={setSelectedTab}
          formValues={customFrequencyData || []}
          customInvoicesData={customInvoicesData}
          radioInputValue={radioInputValue}
          settlementStrategy={ProductDeliquencyType.InvoiceBased}
        />
      )}
    </div>
  ), [radioInputValue, productId, formValues, customFrequencyData, customInvoicesData]);

  const PrincipleBasedContent = useMemo(() => (
    <div className="border-deliquencies p-4 mt-4">
      <div className="d-flex align-items-center justify-content-between mt-1" style={{ fontSize: "15px", fontWeight: "Bold" }}>
        {t("delinquency.principleBasedTitle")}
      </div>
      <Row className="mt-3">
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>{t("delinquency.discount")}</Form.Label>
            <Form.Select value={discountType} onChange={(e) => setDiscountType(e.target.value as "FIXED" | "PERCENTAGE")}>
              <option value="FIXED">{t("delinquency.fixed")}</option>
              <option value="PERCENTAGE">{t("delinquency.percentage")}</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>{t("delinquency.numberOfMonths")}</Form.Label>
            <Form.Control
              type="number" min={1} value={settlementMonths}
              onChange={(e) => { setSettlementMonths(e.target.value); setPrincipleErrors((p: any) => ({ ...p, settlementMonths: "" })); }}
              placeholder={t("delinquency.enterNumberOfMonths")}
            />
            {principleErrors?.settlementMonths && <div className="text-danger mt-1" style={{ fontSize: "12px" }}>{principleErrors.settlementMonths}</div>}
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>
              {discountType === "FIXED" ? t("delinquency.fixedAmountPerMonth") : t("delinquency.percentageAmountPerMonth")}
            </Form.Label>
            <Form.Control
              type="number" min={0} value={settlementAmountPerMonth}
              onChange={(e) => { setSettlementAmountPerMonth(e.target.value); setPrincipleErrors((p: any) => ({ ...p, settlementAmountPerMonth: "" })); }}
              placeholder={t("delinquency.enterAmount")}
            />
            {principleErrors?.settlementAmountPerMonth && <div className="text-danger mt-1" style={{ fontSize: "12px" }}>{principleErrors.settlementAmountPerMonth}</div>}
          </Form.Group>
        </Col>
      </Row>
      <div className="mt-3 d-flex justify-content-end">
        <Button variant="primary" onClick={handlePrincipleSubmit}>{t("common:submit")}</Button>
      </div>
    </div>
  ), [discountType, settlementMonths, settlementAmountPerMonth, principleErrors]);

  return (
    <div>
      {loader && <Loader />}
      <Tabs
        id="early-settlement-sub-tabs"
        className="mt-3 position-relative tabs-overflow"
        activeKey={activeSubTab}
        onSelect={(tab: any) => {
          if (tab === "InvoiceBased" && !isInvoiceBasedActive) {
            toast.error(t("delinquency.invoiceTabInactive"));
            return;
          }
          if (tab === "PrincipleBased" && !isPrincipleBasedActive) {
            toast.error(t("delinquency.principleTabInactive"));
            return;
          }
          setActiveSubTab(tab);
        }}
      >
        <Tab eventKey="SetDelinquencyType" title={t("delinquency.setEarlySettlementType")}>
          <div className="border-deliquencies p-4 mt-4">
            <h6 className="mb-4 fw-bold">{t("delinquency.activateDeactivateTabs")}</h6>
            <Row>
              {[
                { key: "InvoiceBased", label: t("delinquency.invoiceBased"), isActive: isInvoiceBasedActive, setIsActive: setIsInvoiceBasedActive },
                { key: "PrincipleBased", label: t("delinquency.principleBased"), isActive: isPrincipleBasedActive, setIsActive: setIsPrincipleBasedActive },
              ].map((tab) => (
                <Col md={6} key={tab.key} className="mb-3">
                  <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                    <div>
                      <h6 className="mb-1 fw-semibold">{tab.label}</h6>
                      <small className="text-muted">{tab.isActive ? t("delinquency.currentlyActive") : t("delinquency.currentlyInactive")}</small>
                    </div>
                    {tab.isActive ? (
                      <Badge bg="success" style={{ fontSize: "14px", padding: "8px 16px" }}>{t("delinquency.activated")}</Badge>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (tab.key === "InvoiceBased") {
                            setIsPrincipleBasedActive(false);
                            setIsInvoiceBasedActive(true);
                          } else {
                            setIsInvoiceBasedActive(false);
                            setIsPrincipleBasedActive(true);
                          }
                          setActiveSubTab(tab.key);
                        }}
                      >
                        {t("delinquency.activate")}
                      </Button>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
            <div className="mt-3 p-3 bg-light rounded">
              <small className="text-muted"><strong>{t("delinquency.noteLabel")}</strong> {t("delinquency.noteOnlyOneActive")}</small>
            </div>
          </div>
        </Tab>
        <Tab eventKey="InvoiceBased" title={t("delinquency.invoiceBased")} disabled={!isInvoiceBasedActive}>
          {activeSubTab === "InvoiceBased" && isInvoiceBasedActive && InvoiceBasedContent}
        </Tab>
        <Tab eventKey="PrincipleBased" title={t("delinquency.principleBased")} disabled={!isPrincipleBasedActive}>
          {activeSubTab === "PrincipleBased" && isPrincipleBasedActive && PrincipleBasedContent}
        </Tab>
      </Tabs>
    </div>
  );
};

export default EarlySettlement;
