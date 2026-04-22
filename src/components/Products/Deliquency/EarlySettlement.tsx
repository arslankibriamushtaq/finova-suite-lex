import React, { useEffect, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { getDeliquency } from "../../../redux/apis/apisCrudLms";
import Loader from "../../Loader/Loader";
import EarlySettlementFixedFrequency from "../../EarlySettlementFixedFrequency";
import EarlySettlementCustomFrequency from "../../EarlySettlementCustomFrequency";

const EarlySettlement = ({ productId, setSelectedTab }: any) => {
  const [radioInputValue, setradioInputValue] = useState("FixedFrequency");
  const [customFrequencyData, setCustomFrequencyData] = useState<any>();
  const [customInvoicesData, setCustomInvoicesData] = useState<any>();
  const [loader, setLoader] = useState(true);
  const [formValues, setFormValues] = useState<any>({
    penalty: "",
    days: "",
    fromDay: "",
    tillDay: "",
    isPercentage: false,
  });

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
  };

  const getDeliquencyData = async (prodId?: string | number) => {
    const idToUse = prodId || productId;
    if (!idToUse) return;
    try {
      const res = await getDeliquency(idToUse);
      if (res?.data) {
      
        
        const data = res?.data?.data.find(
          (item: { delinquencyTypeName: string }) => item.delinquencyTypeName === "EARLY_SETTLEMENT"
        );
        setCustomFrequencyData(data);
        setCustomInvoicesData(data?.earlySettlementConfigs);
         setradioInputValue(
          data?.isCustom
            ? "CustomFrequency"
            : "FixedFrequency"
        );
        if (data) {
          setFormValues({
            isPercentage: data.isPercentage,
            penalty: data.isPercentage
              ? data.penaltyPercentage
              : data.penaltyAmount,
            fromDay: data.fromDay,
            tillDay: data.tillDay,
            days: "",
          });
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (productId) getDeliquencyData();
    else setLoader(false);
  }, [productId]);

  return (
    <div>
      {loader && <Loader />}
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
                <Form.Check
                  className={`mt-4 d-flex align-items-center gap-1 ${
                    radioInputValue === field.value ? "accent-green" : ""
                  }`}
                  type={field.type as any}
                  label={field.label}
                  name={field.name}
                  value={field.value}
                  checked={radioInputValue === field.value}
                  onChange={handleInputChange}
                  style={{ fontSize: "14px", fontWeight: "700" }}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>

        {radioInputValue === "FixedFrequency" ? (
          <EarlySettlementFixedFrequency
            productId={productId}
            setSelectedTab={setSelectedTab}
            formValues={formValues}
            radioInputValue={radioInputValue}
          />
        ) : (
          <EarlySettlementCustomFrequency
            productId={productId}
            setSelectedTab={setSelectedTab}
            formValues={customFrequencyData || []}
            customInvoicesData={customInvoicesData}
            radioInputValue={radioInputValue}
          />
        )}
      </div>
    </div>
  );
};

export default EarlySettlement;
