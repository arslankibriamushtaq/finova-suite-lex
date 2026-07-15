import { Checkbox, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { UpdateProductCommodity } from "../../redux/apis/apisCrud";
import { useNavigate } from "react-router-dom";

const CommodityInfo = ({ setSelectedTab }: any) => {
  const { t } = useTranslation("productManagement2");
  const product = useSelector((s: any) => s.block.productData);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    has_commodity: product?.has_commodity ?? false,
    commodity_type_id: product?.commodity_type_id ?? undefined,
    quantity: product?.quantity ?? 0,
    advance_payment: product?.advance_payment ?? 0,
    balloon_payment: product?.balloon_payment ?? 0,
  });

  const handleChange = (field: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const body: any = {
        commodity_details: 1,
        commodity_type_id: formValues.commodity_type_id ?? 0,
        has_commodity: 1,
      };

      if (formValues.has_commodity) {
        body.commodity = {
          quantity: formValues.quantity,
          payment_breakdown: {
            advance_payment: formValues.advance_payment,
            balloon_payment: formValues.balloon_payment,
          },
        };
      }
      const res = await UpdateProductCommodity(body, product?.id);
      if (res?.data?.success) navigate("/ProductManagement/applicationSteps");
      return res?.data?.message;
    } catch (err) {
      toast.error(t("commodityInfo.saveFailed"));
    }
  };

  return (
    <div>
      <Row className="mb-4">
        <Col md={6}>
          <Checkbox
            className="me-2"
            checked={formValues.has_commodity}
            onChange={(e) => handleChange("has_commodity", e.target.checked)}
          />
          <label className="mb-1" style={{ fontWeight: 400 }}>
            {t("commodityInfo.hasCommodity")}
          </label>
        </Col>
      </Row>

      {formValues.has_commodity && (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <label className="mb-1" style={{ fontWeight: 400 }}>
                {t("commodityInfo.commodityType")}
              </label>
              <Select
                placeholder={t("commodityInfo.selectType")}
                className="fs-6 w-100"
                value={formValues.commodity_type_id}
                onChange={(value) => handleChange("commodity_type_id", value)}
                options={[
                  { label: t("commodityInfo.typeGold"), value: 1 },
                  { label: t("commodityInfo.typeSilver"), value: 2 },
                  { label: t("commodityInfo.typeOther"), value: 3 },
                ]}
              />
            </Col>
            <Col md={6}>
              <label className="mb-1" style={{ fontWeight: 400 }}>
                {t("commodityInfo.commodityQuantity")}
              </label>
              <Input
                type="number"
                min={0}
                placeholder={t("commodityInfo.enterQuantity")}
                className="fs-6"
                value={formValues.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
              />
            </Col>
          </Row>

          <h1
            className="pt-4 pb-3"
            style={{ fontSize: "18px", fontWeight: "bold" }}
          >
            {t("commodityInfo.paymentBreakdown")}
          </h1>

          <Row className="mb-4">
            <Col md={6}>
              <label className="mb-1" style={{ fontWeight: 400 }}>
                {t("commodityInfo.advancePayment")}
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder={t("commodityInfo.enterAdvancePayment")}
                className="fs-6"
                value={formValues.advance_payment}
                onChange={(e) =>
                  handleChange("advance_payment", e.target.value)
                }
              />
            </Col>
            <Col md={6}>
              <label className="mb-1" style={{ fontWeight: 400 }}>
                {t("commodityInfo.balloonPayment")}
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder={t("commodityInfo.enterBalloonPayment")}
                className="fs-6"
                value={formValues.balloon_payment}
                onChange={(e) =>
                  handleChange("balloon_payment", e.target.value)
                }
              />
            </Col>
          </Row>
        </>
      )}
      <div className="d-flex justify-content-end">
        <button className="step-buttons me-2" onClick={() => navigate("/ProductManagement/AddProduct")}>{t("common:previous")}</button>
        <button className="step-buttons" onClick={handleSubmit}>
          {t("common:next")}
        </button>
      </div>
    </div>
  );
};

export default CommodityInfo;
