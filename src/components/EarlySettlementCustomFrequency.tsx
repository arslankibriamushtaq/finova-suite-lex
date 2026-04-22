import React, { useState } from "react";
import { Button, Select } from "antd";
import { Row, Col, Form, Modal } from "react-bootstrap";
import Loader from "./Loader/Loader";
import SingleInvoice from "./SingleInvoice";
import InvoiceRange from "./InvoiceRange";

const EarlySettlementCustomFrequency = (props: any) => {
  const [loader, setLoader] = useState(false);
  const [fields, setFields] = useState([
    { Time: "", Days: "", notification: "" },
  ]);
  const firstConfig = props?.formValues?.earlySettlementConfigs?.[0];
  const [radioInputValue, setradioInputValue] = useState(
    firstConfig ? (firstConfig.isRange ? "InvoiceRange" : "SingleInvoice") : "InvoiceRange"
  );

  const [formValues, setFormValues] = useState<any>({
    penalty:
      props?.radioInputValue === "CustomFrequency"
        ? props?.formValues?.[0]?.penalty
        : "",
    days:
      props?.radioInputValue === "CustomFrequency"
        ? props?.formValues?.[0]?.days
        : "",
    fromDay:
      props?.radioInputValue === "CustomFrequency"
        ? props?.formValues?.[0]?.fromDay
        : "",
    tillDay:
      props?.radioInputValue === "CustomFrequency"
        ? props?.formValues?.[0]?.tillDay
        : "",
    discount: props?.formValues[0]?.isPercentage,
    promisesPerYear: "",
    promisesPerLoan: "",
  });

  const settleMentType = [
    {
      label: "Invoice Range",
      type: "radio",
      name: "InvoiceRange",
      value: "InvoiceRange",
    },
    {
      label: "Single Invoice",
      type: "radio",
      name: "SingleInvoice",
      value: "SingleInvoice",
    },
  ];
  const [errors, setErrors] = useState({}); // Track validation errors
  const PercentageDetail = [
    // {
    //   label:
    //     radioInputValue == "Percentage"
    //       ? "Penalty Amount in %"
    //       : "Penalty Amount",
    //   type: "number",
    //   name: "penalty",
    //   placeholder: "Penalty",
    // },

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
      label: "Penalty Amount",
      type: "number",
      name: "penalty",
      placeholder: "Penalty",
    },
    /* {
      label: "Promises Per Year",
      type: "number",
      name: "promisesPerYear",
      placeholder: "Promises Per Year",
    },
    {
      label: "Promises Per Loan",
      type: "number",
      name: "promisesPerLoan",
      placeholder: "Promises Per Loan",
    }, */
  ];

//   const validateFields = () => {
//     const newErrors: any = {};
//     if (!formValues.fromDay) newErrors.fromDay = "From Day is required";
//     if (!formValues.tillDay) newErrors.tillDay = "Till Day is required";
//     /* if (!formValues.promisesPerYear)
//       newErrors.promisesPerYear = "Promises Per Year is required";
//     if (!formValues.promisesPerLoan)
//       newErrors.promisesPerLoan = "Promises Per Loan is required";
//  */
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));
    if (type === "radio") {
      setradioInputValue(value);
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };



  /////
  const discountEnum = [
    { label: "Fixed", value: false },
    { label: "Percentage", value: true },
  ];

  return (
    <div>
      {loader && <Loader />}

      <div className="" style={{ borderBottom: "1px solid #D1D1D1" }}></div>
      <div
        className="d-flex align-items-center justify-content-between mt-4"
        style={{ fontSize: "14px", fontWeight: "Bold" }}
      >
        Select 1 Option
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
      <Row>
        <Col md={4} className="mb-3">
          <>
            <Form.Label className="mt-2 fs-fw">Discount</Form.Label>
            <Select
              value={formValues.discount}
              onChange={(value, option) => {
                setFormValues((prevValues: any) => ({
                  ...prevValues,
                  discount: value,
                }));
              }}
              defaultValue={formValues?.discount}
              style={{ width: "100%" }}
              placeholder="Select Product"
            >
              {discountEnum?.map((option, index) => (
                <Select.Option key={index} value={option.value}>
                  <div>{option?.label}</div>
                </Select.Option>
              ))}
            </Select>
          </>
        </Col>
      </Row>
      {radioInputValue == "SingleInvoice" ? (
        <SingleInvoice
          discount={formValues?.discount}
          productId={props?.productId}
          setSelectedTab={props?.setSelectedTab}
          initialValues={props.formValues}
          radioInputValue={props?.formValues[0]?.invoiceRange}
          customInvoicesData={props.customInvoicesData}
        />
      ) : (
        <InvoiceRange
          discount={formValues?.discount}
          productId={props?.productId}
          setSelectedTab={props?.setSelectedTab}
          initialValues={props.formValues}
          radioInputValue={props?.formValues[0]?.invoiceRange}
          customInvoicesData={props.customInvoicesData}
        />
      )}

      {/* <div className="mt-4" style={{ borderBottom: "1px solid #D1D1D1" }}></div>
      {fields.map((field, index) => (
        <div key={index} className="mb-2 mt-2 d-flex gap-1">
          <div className="row" style={{ flex: 11.5 }}>
            <Col md={4} className="mb-3" key={index}>
              <Form.Group>
                <Form.Label className="mt-2 fs-fw">
                  Notification {`${index + 1}`}
                </Form.Label>
                <Form.Control
                  name="notification"
                  type="text"
                  value={field.notification}
                  placeholder="Notification"
                  onChange={(event: any) => handleFieldChange(index, event)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3" key={index}>
              <Form.Group>
                <Form.Label className="mt-2 fs-fw">Time</Form.Label>
                <Form.Control
                  name="Time"
                  type="text"
                  value={field.notification}
                  placeholder="Time"
                  onChange={(event: any) => handleFieldChange(index, event)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3" key={index}>
              <Form.Group>
                <Form.Label className="mt-2 fs-fw">No. Of Days</Form.Label>
                <Form.Control
                  name="Days"
                  type="text"
                  value={field.notification}
                  placeholder="Days"
                  onChange={(event: any) => handleFieldChange(index, event)}
                />
              </Form.Group>
            </Col>
          </div>
          {fields.length > 1 && (
            <div
              style={{ flex: 0.5 }}
              className="align-items-center d-flex justify-content-center pt-2"
            >
              <img
                className="cursor-pointer"
                src={Images.crossIcon}
                onClick={() => handleRemoveField(index)}
              />
            </div>
          )}
        </div>
      ))}
      <div className="mt-4" style={{ borderBottom: "1px solid #D1D1D1" }}></div>
      <div className="d-flex justify-content-end mt-4">
        <Button
          className="theme-btn-next"
          onClick={handleAddField}
          style={{ fontSize: "14px" }}
        >
          Add New
        </Button>
      </div> */}

      {/* <div className="col-12 d-flex justify-content-end mt-4 mb-5 align-items-center">
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
    </div>
  );
};

export default EarlySettlementCustomFrequency;
