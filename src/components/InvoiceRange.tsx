import { useState, useEffect } from "react";
import { Button } from "antd";
import { Row, Col, Form, Modal } from "react-bootstrap";
import { Images } from "./Config/Images";
import { createDeliquency } from "../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import Loader from "./Loader/Loader";

const groupByRangeNo = (configs: any[]): any[] => {
  if (!configs?.length) return [];
  const seen = new Map();
  configs.filter((c: any) => c.isRange).forEach((c: any) => {
    const key = `${c.minInvoiceOrder}_${c.maxInvoiceOrder}`;
    if (!seen.has(key)) {
      seen.set(key, {
        rangeNo: c.rangeNo,
        minInvoiceOrder: c.minInvoiceOrder,
        maxInvoiceOrder: c.maxInvoiceOrder,
        configurations: [{
          fromDay: c.fromDay,
          tillDay: c.tillDay,
          discountAmount: c.discountAmount,
          discountPercentage: c.discountPercentage,
          penalty: null,
        }],
      });
    }
  });
  return Array.from(seen.values());
  
};

const InvoiceRange = (props: any) => {
  const [savedData, setSavedData] = useState<any[]>([]);

  useEffect(() => {
    const configs = props?.customInvoicesData ?? props?.initialValues?.earlySettlementConfigs;
    setSavedData(groupByRangeNo(configs));
  }, [props?.customInvoicesData, props?.initialValues]);

  const [loader, setLoader] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState<any>({
    penalty: "",
    fromDay: "",
    tillDay: "",
    fromInvoice: "",
    toInvoice: "",
  });
  const validateFields = () => {
    let tempErrors: any = {};
    let isValid = true;

    Object.keys(formValues).forEach((key) => {
      if (!formValues[key]) {
        tempErrors[key] = "This field is required";
        isValid = false;
      }
    });

    if (props?.discount && formValues.penalty > 100) {
      tempErrors.penalty = "Percentage cannot exceed 100";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };
  const [errors, setErrors] = useState({});
  const PercentageDetail = [
    {
      label: "From Invoice",
      type: "number",
      name: "fromInvoice",
      placeholder: "From Invoice",
    },
    {
      label: "To Invoice",
      type: "number",
      name: "toInvoice",
      placeholder: "To Invoice",
    },
    {},
    {
      label: "From Day",
      type: "number",
      name: "fromDay",
      placeholder: "From Day",
    },
    {
      label: "Till Day",
      type: "number",
      name: "tillDay",
      placeholder: "Till Day",
    },
    {
      label: `${props?.discount ? "Amount in Percentage" : "Amount"}`,
      type: "number",
      name: "penalty",
      placeholder: "Penalty",
    },
  ];
  const handleCardClick = (item: any, index: any) => {
    setSelectedInvoice({
      ...item,
      index,
      fromInvoice: item.minInvoiceOrder,
      toInvoice: item.maxInvoiceOrder,
      fromDay: item.configurations[0].fromDay,
      tillDay: item.configurations[0].tillDay,
      penalty: props?.discount
        ? item.configurations[0].discountPercentage
        : item.configurations[0].discountAmount,
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const handleUpdate = async () => {
    const isPercentage = !!props?.discount;
    const updatedItem = {
      ...selectedInvoice,
      minInvoiceOrder: selectedInvoice.fromInvoice,
      maxInvoiceOrder: selectedInvoice.toInvoice,
      configurations: [
        {
          fromDay: selectedInvoice.fromDay,
          tillDay: selectedInvoice.tillDay,
          discountPercentage: isPercentage ? selectedInvoice.penalty : null,
          discountAmount: !isPercentage ? selectedInvoice.penalty : null,
          penalty: null,
        },
      ],
    };

    const updatedData = [...savedData];
    updatedData[selectedInvoice?.index as number] = updatedItem;

    setLoader(true);
    const body = {
      productId: props?.productId,
      delinquencyType: 1,
      settlementStrategy: props?.settlementStrategy ?? 1,
      isPercentage,
      penaltyPercentage: 0,
      penaltyAmount: 0,
      fromDay: 0,
      tillDay: 0,
      penaltyType: 1,
      isCustom: true,
      charityFundAccount: "CHARITY_FUND_001",
      configs: buildConfigs(updatedData),
    };

    try {
      const res = await createDeliquency(body);
      if (res?.data) {
        toast.success("Updated successfully");
        setSavedData(updatedData);
        handleClose();
      } else {
        toast.error(res.data.errors?.[0]);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoader(false);
    }
  };
  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  /////
  const buildConfigs = (existingCards: any[], newEntry?: any) => {
    const isPercentage = !!props?.discount;
    const existing = existingCards.map((card: any, index: number) => ({
      kind: "RANGE",
      rangeNo: card.rangeNo || index + 1,
      minInvoiceOrder: Number(card.minInvoiceOrder),
      maxInvoiceOrder: Number(card.maxInvoiceOrder),
      fromDay: Number(card.configurations[0].fromDay),
      tillDay: Number(card.configurations[0].tillDay),
      isPercentage,
      discountPercentage: isPercentage ? Number(card.configurations[0].discountPercentage ?? 0) : 0,
      discountAmount: !isPercentage ? Number(card.configurations[0].discountAmount ?? 0) : 0,
    }));
    if (!newEntry) return existing;
    return [
      ...existing,
      {
        kind: "RANGE",
        rangeNo: existingCards.length + 1,
        minInvoiceOrder: Number(newEntry.fromInvoice),
        maxInvoiceOrder: Number(newEntry.toInvoice),
        fromDay: Number(newEntry.fromDay),
        tillDay: Number(newEntry.tillDay),
        isPercentage,
        discountPercentage: isPercentage ? Number(newEntry.penalty) : 0,
        discountAmount: !isPercentage ? Number(newEntry.penalty) : 0,
      },
    ];
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    setLoader(true);
    const isPercentage = !!props?.discount;
    const body = {
      productId: props?.productId,
      delinquencyType: 1,
      settlementStrategy: props?.settlementStrategy ?? 1,
      isPercentage,
      penaltyPercentage: 0,
      penaltyAmount: 0,
      fromDay: 0,
      tillDay: 0,
      penaltyType: 1,
      isCustom: true,
      charityFundAccount: "CHARITY_FUND_001",
      configs: buildConfigs(savedData, formValues),
    };
    try {
      const res = await createDeliquency(body);
      if (res?.data) {
        toast.success("Saved successfully");
        const newCard = {
          minInvoiceOrder: formValues.fromInvoice,
          maxInvoiceOrder: formValues.toInvoice,
          configurations: [
            {
              tillDay: formValues.tillDay,
              fromDay: formValues.fromDay,
              discountAmount: !isPercentage ? formValues.penalty : null,
              discountPercentage: isPercentage ? formValues.penalty : null,
              penalty: null,
            },
          ],
        };
        setSavedData([...savedData, { ...newCard }]);
        setFormValues({ penalty: "", fromDay: "", tillDay: "", fromInvoice: "", toInvoice: "" });
        setLoader(false);
      } else {
        toast.error(res.data.errors?.[0]);
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error.message || "An error occurred");
    }
  };

  const DeleteEarlySettlmentCard = async (event: any, index: any) => {
    event.stopPropagation();
    const remaining = savedData.filter((_: any, i: any) => i !== index);
    setLoader(true);
    const isPercentage = !!props?.discount;
    const body = {
      productId: props?.productId,
      delinquencyType: 1,
      settlementStrategy: props?.settlementStrategy ?? 1,
      isPercentage,
      penaltyPercentage: 0,
      penaltyAmount: 0,
      fromDay: 0,
      tillDay: 0,
      penaltyType: 1,
      isCustom: true,
      charityFundAccount: "CHARITY_FUND_001",
      configs: buildConfigs(remaining),
    };
    try {
      const res = await createDeliquency(body);
      if (res?.data) {
        toast.success("Deleted successfully");
        setSavedData(remaining);
        setLoader(false);
      } else {
        toast.error(res.data.errors?.[0]);
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error.message || "An error occurred");
    }
  };
  return (
    <div>
      {loader && <Loader />}
      <div
        className="mt-3 mb-4"
        style={{ borderBottom: "1px solid var(--color-border-light)" }}
      ></div>
      <Row>
        <div style={{ flex: 11.5 }} className="d-flex flex-wrap">
          {PercentageDetail.map((field: any, index: any ) => (
            <>
              {Object.keys(field).length > 0 ? (
                <>
                  <Col
                    onClick={() => {
                    }}
                    md={4}
                    className="mb-3 px-2"
                    key={index}
                  >
                    <Form.Group>
                      <Form.Label
                        className="mt-2"
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        {field.label}
                        <span className="required-indicator ps-1">*</span>
                      </Form.Label>
                      <Form.Control
                        name={field.name}
                        type={field.type}
                        value={formValues[field.name]}
                        placeholder={field.placeholder}
                        onChange={handleInputChange}
                      />

                      {errors[field.name as keyof typeof errors] && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {errors[field.name as keyof typeof errors]}
                        </span>
                      )}
                    </Form.Group>
                  </Col>
                </>
              ) : (
                <Col md={4} className="mb-3 px-2" key={index}></Col>
              )}
            </>
          ))}
        </div>
        <div
          style={{ flex: 0.5, paddingTop: "10px" }}
          className="d-flex align-items-end pb-3"
        >
          <Button
            style={{ height: "40px" }}
            className="application-btn"
            onClick={handleSave}
          >
            Add
          </Button>
        </div>
      </Row>
      <Row className="gap-2 ps-3">
        {savedData &&
          savedData.map((item: any, index: any) => (
            <div
              key={index}
              onClick={() => handleCardClick(item, index)}
              className="col-3 invoice-card"
            >
              <div className="d-flex justify-content-end">
                <img
                  onClick={(e) => DeleteEarlySettlmentCard(e, index)}
                  style={{ cursor: "pointer" }}
                  src={Images.closeBtn}
                  height={10}
                  width={10}
                  alt="Close"
                />
              </div>
              <div className="col-12 d-flex align-items-center">
                <div className="col-6 invoice-label">
                  Invoice {item.minInvoiceOrder} to {item.maxInvoiceOrder}
                </div>
                <div className="col-6 invoice-value d-flex justify-content-end pe-2">
                  Day{item?.configurations[0].fromDay}-Day
                  {item?.configurations[0].tillDay}
                </div>
              </div>
              <div className="col-12 d-flex align-items-center mt-2">
                {props?.discount ? (
                  <div className="col-8 invoice-label">
                    {item?.configurations[0].discountPercentage
                      ? item?.configurations[0].discountPercentage
                      : item?.configurations[0]?.penalty}{" "}
                    %
                  </div>
                ) : (
                  <div className="col-8 invoice-label">
                    SAR{" "}
                    {item.configurations[0].discountAmount
                      ? item.configurations[0].discountAmount
                      : item.configurations[0]?.penalty}
                  </div>
                )}

                <div className="col-4 invoice-value d-flex justify-content-end">
                  <div className="invoice-button">
                    {props?.discount ? "Percentage" : "Fixed"}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </Row>

      {/* <div className="mt-4" style={{ borderBottom: "1px solid #D1D1D1" }}></div>
      <div className="col-12 d-flex justify-content-end mt-4 mb-5 align-items-center">
        <Button
          className="application-btn mb-2"
          style={{ fontSize: "14px" }}
          onClick={() => {
            updateSubmitForm();
          }}
        >
          Save & Next
        </Button>
      </div> */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Invoice Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label className="invoice-popup-label">
                  From Invoice
                </Form.Label>
                <Form.Control
                  type="text"
                  value={selectedInvoice.fromInvoice}
                  onChange={(e) =>
                    setSelectedInvoice({
                      ...selectedInvoice,
                      fromInvoice: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="invoice-popup-label">
                  To Invoice
                </Form.Label>
                <Form.Control
                  type="text"
                  value={selectedInvoice.toInvoice}
                  onChange={(e) =>
                    setSelectedInvoice({
                      ...selectedInvoice,
                      toInvoice: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="invoice-popup-label">
                  From Day
                </Form.Label>
                <Form.Control
                  type="number"
                  value={selectedInvoice.fromDay}
                  onChange={(e) =>
                    setSelectedInvoice({
                      ...selectedInvoice,
                      fromDay: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="invoice-popup-label">
                  Till Day
                </Form.Label>
                <Form.Control
                  type="number"
                  value={selectedInvoice.tillDay}
                  onChange={(e) =>
                    setSelectedInvoice({
                      ...selectedInvoice,
                      tillDay: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="invoice-popup-label">
                  {props?.discount ? "Amount In Percentage" : "Amount"}
                </Form.Label>
                <Form.Control
                  type="number"
                  value={selectedInvoice.penalty}
                  onChange={(e) =>
                    setSelectedInvoice({
                      ...selectedInvoice,
                      penalty: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* <Button className="invoice-btn" onClick={handleClose}>
            Close
          </Button> */}
          <Button className="application-btn" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InvoiceRange;
