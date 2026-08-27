import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Form, Row } from "react-bootstrap";
import { Select, Input, Button, Tag, Card } from "antd";
import toast from "react-hot-toast";
import {
  getProducts,
  getLoanFees,
  getProductFeeByProductId,
  DeleteProductFee,
  AddProductFee,
} from "../../redux/apis/apisCrudLms"; // 👈 add `getLoanFees`
import { CloseOutlined } from "@ant-design/icons";
const ProductFee = () => {
  const { t } = useTranslation("settings");
  const [products, setProducts] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [feeData, setFeeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    loanFeeId: "",
    productId: "",
    amount: 0,
    isAppliedToLoan: true,
    invoiceSr: 0,
  });
  // ✅ API Call
  const fetchProductFees = async (id: string) => {
    setLoading(true);
    try {
      const res = await getProductFeeByProductId(id);
      const data = res?.data?.data || [];
      // Flatten all feeDetails and attach feeName to each
      const flatDetails = data.flatMap((feeGroup: any) =>
        feeGroup.feeDetails.map((detail: any) => ({
          ...detail,
          feeName: feeGroup.feeName,
        }))
      );
      setFeeData(flatDetails);
    } catch (error: any) {
      toast.error(error?.message || t("productFee.toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formValues.productId) fetchProductFees(formValues.productId);
  }, [formValues.productId]);
  // ✅ Fetch data
  const getAllData = async () => {
    try {
      const [prodRes, feeRes] = await Promise.all([
        getProducts(),
        getLoanFees(),
      ]);
      const prodData = prodRes?.data?.data || [];
      const feeData = feeRes?.data?.data || [];
      setProducts(prodData);
      setFees(feeData);

      if (prodData.length > 0 && feeData.length > 0) {
        setFormValues((prev) => ({
          ...prev,
          productId: prodData[0].id,
          loanFeeId: feeData[0].id,
        }));
      }
    } catch (error: any) {
      toast.error(error?.message || t("productFee.toast.fetchError"));
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  // ✅ Handle select changes
  const handleSelectChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Handle input changes
  const handleInputChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };
 const handleSubmit = async () => {
  try {
    // ✅ Basic validation
    if (!formValues?.loanFeeId) {
      toast.error(t("productFee.toast.selectFee"));
      return;
    }
    if (!formValues?.productId) {
      toast.error(t("productFee.toast.selectProduct"));
      return;
    }
    if (
      !formValues?.isAppliedToLoan &&
      (formValues?.invoiceSr === undefined)
    ) {
      toast.error(t("productFee.toast.enterInvoiceSr"));
      return;
    }
    if (formValues?.amount === undefined || formValues?.amount === 0) {
      toast.error(t("productFee.toast.enterAmount"));
      return;
    }

    // ✅ Build request body
    const body = {
      loanFeeId: formValues?.loanFeeId,
      productId: formValues?.productId,
      amount: Number(formValues?.amount),
      isAppliedToLoan: formValues?.isAppliedToLoan,
      isPercentage: false,
      isVatInclusive: true,
      invoiceSr: formValues?.isAppliedToLoan ? 0 : Number(formValues?.invoiceSr),
    };


    // ✅ API Call
    const res = await AddProductFee(body); // <-- replace with your actual API function

    if (res?.data?.success) {
      toast.success(t("productFee.toast.added"));
      // Optionally reset or refresh data
    //   setFormValues({
    //     loanFeeId: "",
    //     productId: "",
    //     amount: 0,
    //     isAppliedToLoan: true,
    //     invoiceSr: 0,
    //   });
    //   // Optionally re-fetch fees
      fetchProductFees(formValues?.productId);
    } else {
      toast.error(res?.data?.message || t("productFee.toast.addFailed"));
    }
  } catch (error: any) {
    console.error("Error submitting fee:", error);
    toast.error(error?.message || t("productFee.toast.submitError"));
  }
};

    const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await DeleteProductFee(id); // <-- replace with your actual API function
      if (res?.data?.success) {
        toast.success(t("productFee.toast.deleted"));
        setFeeData((prev) => prev.filter((fee) => fee.id !== id));
      } else {
        toast.error(t("productFee.toast.deleteFailed"));
      }
    } catch (err: any) {
      toast.error(err?.message || t("productFee.toast.deleteError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="col-md-12 pt-2 pb-2 d-flex align-items-center fs-6 fw-bold">
        {t("productFee.title")}
      </h2>

      <Row>
        {/* Product Select */}
        <Col md={4} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
              {t("productFee.field.selectProduct")}
            </Form.Label>
            <Select
              value={formValues.productId}
              style={{ width: "100%" }}
              placeholder={t("productFee.ph.selectProduct")}
              onChange={(value) => handleSelectChange("productId", value)}
            >
              {products.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Group>
        </Col>

        {/* Loan Fee Select */}
        <Col md={4} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
              {t("productFee.field.selectFee")}
            </Form.Label>
            <Select
              value={formValues.loanFeeId}
              style={{ width: "100%" }}
              placeholder={t("productFee.ph.selectFee")}
              onChange={(value) => handleSelectChange("loanFeeId", value)}
            >
              {fees.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Group>
        </Col>

        {/* Amount Input */}
        <Col md={4} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
              {t("common:amount")}
            </Form.Label>
            <Input
              type="number"
              placeholder={t("productFee.ph.amount")}
              value={formValues.amount}
              onChange={(e) =>
                handleInputChange("amount", Number(e.target.value))
              }
            />
          </Form.Group>
        </Col>

        {/* Applied To Select */}
        <Col md={4} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
              {t("productFee.field.applyFeeOn")}
            </Form.Label>
            <Select
              value={formValues.isAppliedToLoan ? "loan" : "invoice"}
              style={{ width: "100%" }}
              onChange={(value) =>
                handleSelectChange("isAppliedToLoan", value === "loan")
              }
            >
              <Select.Option value="loan">{t("productFee.opt.loan")}</Select.Option>
              <Select.Option value="invoice">
                {t("productFee.opt.invoice")}
              </Select.Option>
            </Select>
          </Form.Group>
        </Col>

        {/* Invoice Sr (Only if appliedToLoan = false) */}
        {!formValues.isAppliedToLoan && (
          <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                {t("productFee.field.invoiceSerial")}
              </Form.Label>
              <Input
                type="number"
                placeholder={t("productFee.ph.invoiceSr")}
                value={formValues.invoiceSr}
                onChange={(e) =>
                  handleInputChange("invoiceSr", Number(e.target.value))
                }
              />
            </Form.Group>
          </Col>
        )}
      </Row>
      <div className="d-flex justify-content-end">
        <Button className="application-btn mb-2" onClick={handleSubmit}>
          {t("productFee.create")}
        </Button>
      </div>
      <h2 className="fw-bold text-start my-3 fs-6">{t("productFee.detailsTitle")}</h2>

      <Row style={{ rowGap: 20 }}>
        {[feeData].length > 0 ? (
          feeData.map((detail: any) => (
            <Col key={detail.id} lg={3}>
              <Card 
                bordered 
                className="rounded-xl shadow-sm">
                    <div className="d-flex justify-content-end items-center">
                    {/* <span className="fw-semibold">{detail.feeName}</span> */}
                    <CloseOutlined
                      onClick={() => handleDelete(detail.id)}
                      style={{
                        color: "black",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                <p className="mb-1">
                  <strong>{t("productFee.card.feeName")}</strong> {detail.feeName}{" "}
                </p>
                <p className="mb-1">
                  <strong>{t("productFee.card.amount")}</strong> {detail.amount}{" "}
                  {detail.isPercentage ? "%" : "SAR"}
                </p>

                <p className="mb-1">
                  <strong>{t("productFee.card.appliedOn")}</strong>{" "}
                  {detail.isAppliedToLoan ? (
                    <Tag color="blue">{t("productFee.tag.loan")}</Tag>
                  ) : (
                    <Tag color="red">{t("productFee.tag.invoice", { number: detail.invoiceNumber })}</Tag>
                  )}
                </p>

                <p className="mb-1">
                  <strong>{t("productFee.card.vatInclusive")}</strong>{" "}
                  {detail.isVatInclusive ? t("common:yes") : t("common:no")}
                </p>

                <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                  {t("productFee.card.created")} {new Date(detail.created).toLocaleString()}
                </p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24} className="text-center py-5 text-muted">
            {t("productFee.noDetails")}
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ProductFee;
