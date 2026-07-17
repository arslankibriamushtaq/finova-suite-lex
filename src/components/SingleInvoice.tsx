import { useEffect, useState } from "react";
import { Button } from "antd";
import { Row, Col, Form, Modal } from "react-bootstrap";
import { Images } from "./Config/Images";
import { createDeliquency } from "../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import Loader from "./Loader/Loader";

const parseSingleConfigs = (configs: any[]): any[] => {
  if (!configs?.length) return [];
  return configs
    .filter((c: any) => !c.isRange)
    .map((c: any) => ({
      invoiceOrder: c.invoiceOrder,
      fromDay: c.fromDay,
      tillDay: c.tillDay,
      discountAmount: c.discountAmount,
      discountPercentage: c.discountPercentage,
      penalty: null,
    }));
};

const SingleInvoice = (props: any) => {
  const [savedData, setSavedData] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState<any>({
    penalty: "",
    invoiceNo: "",
    fromDay: "",
    tillDay: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const configs =
      props?.customInvoicesData ??
      props?.initialValues?.earlySettlementConfigs;
    setSavedData(parseSingleConfigs(configs));
  }, [props?.customInvoicesData, props?.initialValues]);

  const PercentageDetail = [
    { label: "From Day", type: "number", name: "fromDay", placeholder: "From Day" },
    { label: "Till Day", type: "number", name: "tillDay", placeholder: "Till Day" },
    {
      label: props?.discount ? "Amount in Percentage" : "Amount",
      type: "number",
      name: "penalty",
      placeholder: "Penalty",
    },
    { label: "Invoice No", type: "number", name: "invoiceNo", placeholder: "Invoice No" },
  ];

  const validateFields = () => {
    const tempErrors: any = {};
    Object.keys(formValues).forEach((key) => {
      if (!formValues[key]) tempErrors[key] = "This field is required";
    });
    if (props?.discount && formValues.penalty > 100)
      tempErrors.penalty = "Percentage cannot exceed 100";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormValues((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const buildConfigs = (existingCards: any[], newEntry?: any) => {
    const isPercentage = !!props?.discount;
    const existing = existingCards.map((card: any) => ({
      kind: "SINGLE",
      invoiceOrder: Number(card.invoiceOrder),
      fromDay: Number(card.fromDay),
      tillDay: Number(card.tillDay),
      isPercentage,
      discountPercentage: isPercentage ? Number(card.discountPercentage ?? card.penalty ?? 0) : 0,
      discountAmount: !isPercentage ? Number(card.discountAmount ?? card.penalty ?? 0) : 0,
    }));
    if (!newEntry) return existing;
    return [
      ...existing,
      {
        kind: "SINGLE",
        invoiceOrder: Number(newEntry.invoiceNo),
        fromDay: Number(newEntry.fromDay),
        tillDay: Number(newEntry.tillDay),
        isPercentage,
        discountPercentage: isPercentage ? Number(newEntry.penalty) : 0,
        discountAmount: !isPercentage ? Number(newEntry.penalty) : 0,
      },
    ];
  };

  const callApi = async (configs: any[]) => {
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
      configs,
    };
    return createDeliquency(body);
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    setLoader(true);
    try {
      const res = await callApi(buildConfigs(savedData, formValues));
      if (res?.data) {
        toast.success("Saved successfully");
        const newCard = {
          invoiceOrder: formValues.invoiceNo,
          fromDay: formValues.fromDay,
          tillDay: formValues.tillDay,
          discountAmount: !props?.discount ? formValues.penalty : null,
          discountPercentage: props?.discount ? formValues.penalty : null,
          penalty: null,
        };
        setSavedData([...savedData, newCard]);
        setFormValues({ penalty: "", invoiceNo: "", fromDay: "", tillDay: "" });
      } else {
        toast.error(res.data.errors?.[0]);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoader(false);
    }
  };

  const DeleteEarlySettlmentCard = async (event: any, index: any) => {
    event.stopPropagation();
    const remaining = savedData.filter((_: any, i: any) => i !== index);
    setLoader(true);
    try {
      const res = await callApi(buildConfigs(remaining));
      if (res?.data) {
        toast.success("Deleted successfully");
        setSavedData(remaining);
      } else {
        toast.error(res.data.errors?.[0]);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoader(false);
    }
  };

  const handleCardClick = (item: any, index: any) => {
    setSelectedInvoice({ ...item, index });
    setShowModal(true);
  };
  const handleClose = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };
  const handleUpdate = async () => {
    const updatedData = [...savedData];
    updatedData[selectedInvoice?.index as number] = selectedInvoice;

    setLoader(true);
    try {
      const res = await callApi(buildConfigs(updatedData));
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

  return (
    <div>
      {loader && <Loader />}
      <div className="mt-3 mb-4" style={{ borderBottom: "1px solid #D1D1D1" }}></div>
      <Row>
        <div style={{ flex: 11.5 }} className="gap-2 d-flex">
          {PercentageDetail.map((field: any, index: any) => (
            <Col md={3} className="mb-3" key={index}>
              <Form.Group>
                <Form.Label className="mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
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
          ))}
        </div>
        <div style={{ flex: 0.5, paddingTop: "10px" }} className="d-flex align-items-center">
          <Button style={{ height: "40px" }} className="application-btn" onClick={handleSave}>
            Add
          </Button>
        </div>
      </Row>

      <Row className="gap-2 ps-3">
        {savedData.map((item: any, index: any) => (
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
              <div className="col-6 invoice-label">Invoice {item?.invoiceOrder}</div>
              <div className="col-6 invoice-value d-flex justify-content-end pe-2">
                Day{item.fromDay}-Day{item.tillDay}
              </div>
            </div>
            <div className="col-12 d-flex align-items-center mt-2">
              {props?.discount ? (
                <div className="col-8 invoice-label">
                  {item.discountPercentage ?? item?.penalty} %
                </div>
              ) : (
                <div className="col-8 invoice-label">
                  SAR {item.discountAmount ?? item?.penalty}
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

      <Modal backdrop="static" keyboard={false} show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label className="invoice-popup-label">From Day</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedInvoice.fromDay}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, fromDay: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="invoice-popup-label">Till Day</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedInvoice.tillDay}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, tillDay: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="invoice-popup-label">Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedInvoice.penalty ?? selectedInvoice.discountAmount ?? selectedInvoice.discountPercentage}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, penalty: e.target.value })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="application-btn" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SingleInvoice;
