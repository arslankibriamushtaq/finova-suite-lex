import { useState } from "react";
import { Button } from "antd";
import { Row, Col, Form, Modal } from "react-bootstrap";
import { Images } from "./Config/Images";
import {
  deleteEarlySettlementConfig,
  updateEarlySettlement,
  updateEarlySettlementconfig,
} from "../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import Loader from "./Loader/Loader";

const InvoiceRange = (props: any) => {
  const [savedData, setSavedData] = useState(
    props?.customInvoicesData ? props?.customInvoicesData?.ranges : []
  );
  const [loader, setLoader] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [fields, setFields] = useState([
    { Time: "", Days: "", notification: "" },
  ]);
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
  const updateSubmitForm = async () => {
    if (!validateFields()) return;

    setLoader(true);
    const body = {
      delinquencyType: 1,
      isPercentage: props?.discount,
      discountPercentage: 1,
      // discountPercentage: Number(props?.discount ? props?.penalty : 0),
      // discountAmount: Number(!formValues?.discount ? formValues?.penalty : 0),
      // fromDay: Number(formValues?.fromDay),
      // tillDay: Number(formValues?.tillDay),
      penaltyType: 1,
      productId: props?.productId,
      isFixedEarlySettlement: false,
      invoiceRange: true,
      customEarlySettlement: savedData.map((item: any) => ({
        customdiscountPercentage: Number(
          props?.discount
            ? item?.discountPercentage
              ? item?.discountPercentage
              : item?.penalty
            : 0
        ),
        customdiscountAmount: Number(
          !props?.discount
            ? item?.discountAmount
              ? item?.discountAmount
              : item?.penalty
            : 0
        ),
        customFromDay: Number(item?.fromDay),
        customTillDay: Number(item?.tillDay),
        // fromInvoice: Number(item?.fromInvoice),
        // toInvoice: Number(item?.toInvoice),
        invoiceOrder: Array.from(
          { length: Number(item?.toInvoice) - Number(item?.fromInvoice) + 1 },
          (_, i) => Number(item?.fromInvoice) + i
        ),
      })),
    };
    try {
      const res = await updateEarlySettlementconfig(body);
      if (res.data.notificationMessage == "Operation successful.") {
        toast.success(res.data.notificationMessage);
        // localStorage.setItem("tabs", "DueLoan");
        props?.setSelectedTab("DueLoan");
        setLoader(false);
      } else {
        toast.error(res.data.errors[0]);
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error.message || "An error occurred");
    }
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
    setSelectedInvoice({ ...item, index });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const handleUpdate = () => {
    const updatedData = [...savedData];
    updatedData[selectedInvoice?.index as number] = selectedInvoice;
    setSavedData(updatedData);
    handleClose();
  };
  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  /////
  const handleSave = async () => {
    if (!validateFields()) return;
    setLoader(true);
    const body = {
      // delinquencyType: 1,
      isPercentage: props?.discount,
      discountPercentage: Number(props?.discount ? props?.penalty : 0),
      discountAmount: Number(!formValues?.discount ? formValues?.penalty : 0),
      fromDay: Number(formValues?.fromDay),
      tillDay: Number(formValues?.tillDay),
      // penaltyType: 1,
      DelinquencyId: props?.initialValues?.find((obj: any) => obj?.delinquencyType ===1)?.id,
      // isFixedEarlySettlement: false,
      isRange: true,
      invoiceOrder: Array.from(
          { length: Number(formValues?.toInvoice) - Number(formValues?.fromInvoice) + 1 },
          (_, i) => Number(formValues?.fromInvoice) + i
        ),
    };
    try {
      const res = await updateEarlySettlementconfig(body);
      if (res.data.notificationMessage == "Operation successful.") {
        toast.success(res.data.notificationMessage);
            const newCard ={
        minInvoiceOrder: formValues.fromInvoice,
        maxInvoiceOrder: formValues.toInvoice,
        configurations:[
            {
                tillDay: formValues.tillDay,
                fromDay: formValues.fromDay,
                discountAmount:formValues.penalty,
                discountPercentage: null,
                penalty: null,
            }
        ]
        }
       setSavedData([...savedData, { ...newCard }]);
        setLoader(false);
      } else {
        toast.error(res.data.errors[0]);
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error.message || "An error occurred");
    }
   

  };

  const handleRemove = (indexToRemove: any) => {
    setSavedData(savedData.filter((_: any, index: any) => index !== indexToRemove));
  };
  const handleFieldChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const values = [...fields];
    values[index][event.target.name as keyof (typeof values)[number]] = event.target.value;
    setFields(values);
    // calculateSubtotal(values);
  };
  const handleRemoveField = (index: any) => {
    const values = [...fields];
    values.splice(index, 1);
    setFields(values);
    // calculateSubtotal(values);
  };
  const handleAddField = () => {
    setFields([...fields, { Time: "", Days: "", notification: "" }]);
  };
  const DeleteEarlySettlmentCard = async (event: any, index: any, item: any) => {
    event.stopPropagation();
    const payload = {
      rangeNo: item?.rangeNo,
      invoiceNo: 0,
    };
    try {
      const res = await deleteEarlySettlementConfig(payload);
      if (res.data.notificationMessage == "Operation successful.") {
        toast.success(res.data.notificationMessage);
        const updatedData = savedData.filter((_: any, i: any) => i !== index);
        setSavedData(updatedData);
        setLoader(false);
      } else {
        toast.error(res.data.errors[0]);
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
                  onClick={(e) => DeleteEarlySettlmentCard(e, index, item)}
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
                  Amount In Percentage
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
