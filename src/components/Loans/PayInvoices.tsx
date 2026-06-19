import { Button } from "antd";
import React, { useEffect, useState } from "react";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { payDynamicInvoice } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Images } from "../Config/Images";
import axios from "../../utils/axios";
import { themeStyle } from "../Config/Theme";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { Modal, Row, Col, ModalHeader, ModalBody } from "react-bootstrap";
import * as Yup from "yup";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const PayInvoice = () => {
  const [invoiceData, setInvoiceData] = useState<any>([]);
  const [showModal, setShowModal] = useState(false);
  const payInvoice = useSelector((state: RootState) => state.block.payInvoices);
  const navigate = useNavigate();
  const handleDynamicInvoice = async (values: any) => {
    try {
      const body = {
        applicationId: payInvoice.applicationID,
        dynamicInvoiceNumber: payInvoice.dynamicInvoiceNumber,
        totalDiscountedAmount: 0,
        totalActualAmount: payInvoice.totalAmount || 0,
        tax: payInvoice.tax || 1,
        shipping: payInvoice.shipping,
        discount: payInvoice.discount,
        accountNumber: payInvoice.accountNumber,
        billingTo: payInvoice.billingTo || "",
        shipTo: payInvoice.shipTo || "",
        from: payInvoice.from || "",
        fileToUpload: "test",
        promiseNumber: values.promiseNumber || "",
        payerName: payInvoice.payerName,
        repaymentStatus:
          values.RepaymentStatus === "Pending"
            ? 0
            : values.RepaymentStatus === "Approved"
            ? 1
            : 2,
        repaymentChannel:
          values.paymentMethod === "Cheque"
            ? 0
            : values.paymentMethod === "Credit Card"
            ? 1
            : values.paymentMethod === "Cash"
            ? 2
            : 0,

        chequeDto: {
          chequeNumber: values.chequeNo,
          bankName: values.bankName,
          bankAccNumber: values.bankAccNumber,
          branchCode: values.branchCode,
        },
        onlineTransactionDto: {
          bankName: values.bankName,
          bankAccNumber: values.bankAccNumber,
          transactionId: values.transactionId || "string",
        },
        cashDto: {
          amount: values.totalAmount || 0,
          receiptNumber: values.receiptNumber,
        },
        addInvoiceList: payInvoice?.totalInvoiceList?.map((invoice: any) => ({
          invoiceNumber: invoice.invoiceNumber || "",
        })),
      };
      const response = await payDynamicInvoice(body);
      if (response?.data?.notificationMessage === "Operation successful.") {
        toast.success(response?.data.notificationMessage);
        setShowModal(false);
        navigate(-1);
      } else {
        toast.error(response?.data?.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const validationSchema = Yup.object({
    paymentMethod: Yup.string().required("Payment Method is required."),
    payerName: Yup.string().required("Payer Name is required."),
    chequeNo: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque") {
          return schema
            .required("Cheque Number is required.")
            .matches(/^[0-9]+$/, "Cheque Number must be numeric.");
        }
        return schema.notRequired();
      }
    ),

    branchCode: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque") {
          return schema.required("Branch Code is required.");
        }
        return schema.notRequired();
      }
    ),

    receiptNumber: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cash") {
          return schema.required("Receipt Number is required.");
        }
        return schema.notRequired();
      }
    ),

    bankName: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque" || paymentMethod === "Credit Card") {
          return schema.required("Bank Name is required.");
        }
        return schema.notRequired();
      }
    ),

    bankAccNumber: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque" || paymentMethod === "Credit Card") {
          return schema.required("Bank Account Number is required.");
        }
        return schema.notRequired();
      }
    ),
  });
  const enums = {
    Gender: [
      { value: 1, label: "Male" },
      { value: 2, label: "Female" },
      { value: 3, label: "Non_Binary" },
      { value: 4, label: "Prefer_not_to_say" },
    ],
    RepaymentType: [
      { value: 0, label: "invoice" },
      { value: 1, label: "Promise" },
    ],
    RepaymentStatus: [
      { value: 0, label: "Pending" },
      { value: 1, label: "Approved" },
      { value: 2, label: "Rejected" },
    ],

    RepaymentChannel: [
      { value: 0, label: "Cheque" },
      { value: 1, label: "Online" },
      { value: 2, label: "Cash" },
      { value: 3, label: "Gateway" },
    ],
  };
  const totalInvoiceList = payInvoice?.totalInvoiceList || [];
  return (
    <>
      <div>
        <div className="col-12 d-flex">
          <div className="col-6">
            {" "}
            <h5>Invoice Template </h5>
          </div>
          {/* <div className="col-6 d-flex justify-content-end">
            <Button
              type="primary"
              className="p-2"
              style={{ background: "black" }}
              onClick={downloadPDF}
            >
              Download
            </Button>
          </div> */}
        </div>
        <div id="invoice-content" className="invoice-content mt-3 p-3">
          <div className="col-12 d-flex mt-5 ">
            <div className="col-8">
              <label className="mb-2" style={{ fontSize: "1rem" }}>
                Invoice No.
              </label>

              <div className="col-4">
                {" "}
                <div style={{ fontWeight: 500, fontSize: "2.25rem" }}>
                  {payInvoice.dynamicInvoiceNumber || ""}
                </div>
              </div>
            </div>
            <div className="col-4 d-flex justify-content-end align-items-start">
              <img
                src={Images.FactoringLogo}
                height={80}
                alt=""
                style={{
                  padding: 10,
                  backgroundColor: "transparent",
                  borderRadius: 2,
                }}
              />
            </div>
          </div>

          <div className="col-12 mt-5 d-flex justify-content-between border-top">
            {/* <div className="col-8">
              <Upload
                action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                listType="picture-card"
                fileList={fileList}
                disabled
                onPreview={handlePreview}
                onChange={handleChange}
              >
                {fileList.length >= 8 ? null : uploadButton}
              </Upload>
              {previewImage && (
                <Image
                  wrapperStyle={{ display: "none" }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) =>
                      !visible && setPreviewImage(""),
                  }}
                  src={previewImage}
                />
              )}
            </div> */}
          </div>

          <div className="col-12 mt-5 d-flex justify-content-between gap-2">
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3"
                style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  From
                </label>
                <span className="">{payInvoice?.from}</span>
              </div>
            </div>
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3"
                style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  Billing To
                </label>
                <span className="">{payInvoice?.billingTo}</span>
              </div>
            </div>
          </div>

          <div className="col-12 mt-3 d-flex  gap-2">
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  Payment Term
                </label>
                <span className="">{payInvoice?.paymentTerms}</span>
              </div>
            </div>
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2 "
                style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  Ship To
                </label>
                <span className="">{payInvoice?.shipTo}</span>
              </div>
            </div>
          </div>
          <div className="col-12 mt-3 d-flex gap-2">
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  PO Number
                </label>
                <span className="">{payInvoice?.poNumber}</span>
              </div>
            </div>
            <div className="col-6">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  Due Date
                </label>
                <span className="">{payInvoice?.dueDate}</span>
                {/* <DatePickerComponent givenDate={invoiceData?.dueDate} /> */}
                {/* <span className="">{invoiceData?.dueDate}</span> */}
              </div>
            </div>
          </div>
          <div className="col-12 mt-3 d-flex gap-2 border-bottom">
            <div className="col-6">
              {/* <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
              >
                <label className="m-0" style={{ fontWeight: "bold" }}>
                  PO Number
                </label>
                <span className="">{invoiceData?.poNumber}</span>
              </div> */}
            </div>
            <div className="col-6 mb-3">
              <div
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
              >
                <label style={{ fontWeight: "bold" }}>Date</label>
                <span className="ms-5">
                {new Date().toISOString().slice(0, 10)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="col-12  d-flex ">
              <div
                className=" mb-2 p-3 col-3"
                style={{
                  background: "var(--color-error-bg)",
                  borderTopLeftRadius: "2px",
                  fontWeight: "700",
                  color: "var(--foreground)",
                }}
              >
                Item
              </div>
              <div
                className="mb-2 p-3 col-3"
                style={{
                  background: "var(--color-error-bg)",

                  fontWeight: "700",
                  color: "var(--foreground)",
                }}
              >
                Amount
              </div>
              <div
                className="mb-2 p-3 col-3"
                style={{
                  background: "var(--color-error-bg)",

                  fontWeight: "700",
                  color: "var(--foreground)",
                }}
              >
                Discount
              </div>
              <div
                className="mb-2 p-3 col-3"
                style={{
                  background: "var(--color-error-bg)",
                  borderTopRightRadius: "2px",
                  fontWeight: "700",
                  color: "var(--foreground)",
                }}
              >
                Discounted Amount
              </div>
            </div>

            {totalInvoiceList.length > 0 ? (
              totalInvoiceList.map((field: any, index: any) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "var(--muted)",
                    borderRight: "1px solid var(--border)",
                    fontWeight: "600",
                  }}
                  className="mb-2 d-flex "
                >
                  <div className="col-3 mb-2 p-3 ">
                    <div>
                      <span className="">{field.invoiceNumber}</span>
                    </div>
                  </div>
                  <div className="col-3 mb-2 p-3 ">
                    <div
                      style={{
                        backgroundColor: "var(--muted)",

                        borderRight: "1px solid var(--border)",
                      }}
                    >
                      {field.amount}
                    </div>
                  </div>
                  <div className="col-3 mb-2 p-3">
                    <div
                      style={{
                        backgroundColor: "var(--muted)",

                        borderRight: "1px solid var(--border)",
                      }}
                    >
                      {field.discount}
                    </div>
                  </div>
                  <div className="col-3 mb-2 p-3">
                    <div
                      style={{
                        backgroundColor: "var(--muted)",

                        borderRight: "1px solid var(--border)",
                      }}
                    >
                      {field.discountedAmount}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No invoices found</p>
            )}
          </div>
          <div
            className="col-12 p-3 border-top border-bottom d-flex justify-content-between"
            style={{
              background: themeStyle.gradientBackgroundColor,
            }}
          >
            <div className="col-6" style={{ fontWeight: 600 }}>
              Sub Total
            </div>
            <div
              className="col-6 d-flex justify-content-end font-bold"
              style={{ fontWeight: 600, color: "var(--foreground)" }}
            >
              SAR:{payInvoice?.totalDiscountedAmount || "0.00"}
            </div>
          </div>
          <div className="border-top mt-2">
            <div className="col-12 d-flex justify-content-end mt-3 ">
              <div className="col-6">
                <div
                  className="d-flex justify-content-between align-items-center p-3 mb-2"
                  style={{
                    backgroundColor: "var(--muted)",
                    borderRight: "1px solid var(--border)",
                  }}
                >
                  <label style={{ fontWeight: "bold" }}>Tax(%)</label>
                  <span>{invoiceData?.tax || "0.00"}</span>
                </div>
              </div>
              <div className="col-6">
                <div
                  className="d-flex justify-content-between align-items-center p-3 mb-2"
                  style={{
                    backgroundColor: "var(--muted)",
                    borderRight: "1px solid var(--border)",
                  }}
                >
                  <label className="m-0" style={{ fontWeight: "bold" }}>
                    Shipping
                  </label>
                  <span className="">{invoiceData?.shipping || "0.00"}</span>
                </div>
              </div>
              {/* <div className="col-4">
                <div
                  className="d-flex justify-content-between align-items-center p-3"
                  style={{ backgroundColor: "var(--muted)", borderRadius: "2px" }}
                >
                  <label className="m-0" style={{ fontWeight: "bold" }}>
                    Discount(%)
                  </label>
                  <span className="">{invoiceData?.discount}</span>
                </div>
              </div> */}
            </div>
          </div>

          <div className="col-12 d-flex p-2 mt-4 mb-3">
            <div
              className="col-8 p-5"
              style={{
                background: "var(--muted)",
              }}
            >
              {/* <label style={{ fontWeight: 600 }}>Note</label> */}
              {/* <div className="mt-2">
                <div style={{ lineHeight: "1.5rem" }}>
                  {invoiceData?.notes ||
                    "loremd dslkflsgnjksf fdsjngjksgn nfslkjngjkfsgjk jksdnfkjdsgjkf jkngfk dkfndsjkfbsdjkf kf jkds fjkds fjkds fjkds fjkds gjds fjhds gjhsd gjh "}
                </div>
              </div> */}
            </div>
            <div
              className="col-4 p-5"
              style={{
                background: themeStyle.gradientBackgroundColor,
              }}
            >
              <label style={{ fontWeight: 500 }}>Total</label>
              <div
                className=" font-bold"
                style={{
                  fontWeight: 500,
                  color: "var(--foreground)",
                  fontSize: "2.5rem",
                  lineHeight: "3.5rem",
                }}
              >
                <span className="fs-20">SAR:</span>{payInvoice?.totalActualAmount || "0.00"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 d-flex mt-2 justify-content-end">
        <Button
          className="application-btn"
          style={{
            //backgroundColor: "#EB0D0D",
            color: "var(--primary-foreground)",
            //height: "32px",
            padding: "9px",
            borderRadius: "2px",
            border: "transparent",
          }}
          onClick={() => {
            setShowModal(true);
          }}
        >
          Pay invoice
        </Button>
      </div>
      <Modal show={showModal} size="lg" centered>
        <Modal.Header
          closeButton
          onClick={() => {
            setShowModal(false);
          }}
        >
          <Modal.Title>Pay Invoice Manually</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: "70lvh",
            overflowY: "auto",
            marginBottom: "14px",
          }}
        >
          <Formik
            initialValues={{
              paymentMethod: "Cash",
              bankAccNumber: "",
              chequeNo: "",
              branchCode: "",
              bankName: "",
              receiptNumber: "",
              payerName: "",
              accountNumber: payInvoice?.accountNumber,
              applicationID: payInvoice?.applicationID || "000",
              invoiceLogo: payInvoice?.invoiceLogo,
              invoiceNumber: payInvoice?.dynamicInvoiceNumber,
              from: payInvoice?.from,
              billingTo: payInvoice?.billingTo,
              dueDate: payInvoice?.dueDate,
              invoiceDate: payInvoice?.invoiceDate,
              poNumber: payInvoice?.poNumber,
              subTotalAmount: payInvoice?.subTotalAmount,
              totalAmount: payInvoice?.totalDiscountedAmount,
              shipping: payInvoice?.shipping,
              discount: payInvoice?.discount,
              notes: payInvoice?.notes,
              terms: payInvoice?.terms,
              paymentTerms: payInvoice?.paymentTerms,
              paymentStatus: payInvoice?.paymentStatus,
              id: payInvoice?.id,
              created: payInvoice?.created,
            }}
            onSubmit={handleDynamicInvoice}
            validationSchema={validationSchema}
          >
            {({ setFieldValue, values }) => (
              <Form>
                {/* <Row className="mb-3">
                  <Col>
                    <label
                      htmlFor="accountNumber"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Account ID
                    </label>
                    <Field name="accountNumber" className="form-control" />
                  </Col>
                  <Col>
                    <label
                      htmlFor="applicationID"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Application ID
                    </label>
                    <Field name="applicationID" className="form-control" />
                  </Col>
                </Row> */}
                <Row className="mb-3">
                  <Col>
                    <label
                      htmlFor="invoiceNumber"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Invoice No.
                    </label>
                    <Field name="invoiceNumber" className="form-control" />
                  </Col>
                  <Col>
                    <label
                      htmlFor="totalAmount"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Amount
                    </label>
                    <Field name="totalAmount" className="form-control" />
                  </Col>
                </Row>
                <Row>
                  {" "}
                  <Col className="mb-3">
                    <label
                      htmlFor="paymentMethod"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Payment Method <span className="text-danger">*</span>
                    </label>
                    <Field
                      as="select"
                      name="paymentMethod"
                      className="form-control"
                    >
                      <option label="Select Payment Method" value="" />
                      <option value="Cheque">Cheque</option>
                      <option value="Credit Card">Online</option>
                      <option selected value="Cash">Cash</option>
                    </Field>
                    <ErrorMessage
                      name="paymentMethod"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </Col>
                  <Col>
                    <label
                      htmlFor="dueDate"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Due Date
                    </label>
                    <Field
                      name="dueDate"
                      type="date"
                      className="form-control"
                    />
                  </Col>
                </Row>
                {values.paymentMethod === "Cheque" && (
                  <>
                    <Row className="mb-3">
                      <Col>
                        <label
                          htmlFor="chequeNo"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Cheque Number <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="chequeNo"
                          className="form-control"
                          placeholder="Cheque Num..."
                        />
                        <ErrorMessage
                          name="chequeNo"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                      <Col>
                        <label
                          htmlFor="branchCode"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Branch Code <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="branchCode"
                          className="form-control"
                          placeholder="Branch Code"
                        />
                        <ErrorMessage
                          name="branchCode"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col>
                        <label
                          htmlFor="bankName"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Bank Name <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankName"
                          className="form-control"
                          placeholder="Bank Name"
                        />
                        <ErrorMessage
                          name="bankName"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                      <Col>
                        <label
                          htmlFor="bankName"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Bank Acc Number <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankAccNumber"
                          className="form-control"
                          placeholder="Bank Account Number"
                        />
                        <ErrorMessage
                          name="bankAccNumber"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                    </Row>
                  </>
                )}

                <Row className="mb-3">
                  <Col>
                    <label
                      htmlFor="payerName"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Payer Name <span className=" text-danger">*</span>
                    </label>
                    <Field
                      as="input"
                      name="payerName"
                      className="form-control"
                      placeholder="Payer Name"
                    />
                    <ErrorMessage
                      name="payerName"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </Col>
                  <Col>
                    <label
                      htmlFor="repaymentTypes"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Repayment Types
                    </label>
                    <Field
                      as="select"
                      name="repaymentTypes"
                      className="form-control"
                    >
                      <option label="Select Type" value="" />
                      {enums.RepaymentType.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                  </Col>
                  {/* {values.paymentMethod !== "Cash" && (
                    <>
                  
                    </>
                  )} */}
                </Row>
                {values.paymentMethod === "Credit Card" && (
                  <>
                    <Row className="mb-3">
                      <Col>
                        <label
                          htmlFor="bankName"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Bank Name <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankName"
                          className="form-control"
                          placeholder="Bank Name"
                        />
                        <ErrorMessage
                          name="bankName"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                      <Col>
                        <label
                          htmlFor="bankName"
                          className="mb-2"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Bank Acc Number <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankAccNumber"
                          className="form-control"
                          placeholder="Bank Account Number"
                        />
                        <ErrorMessage
                          name="bankAccNumber"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                    </Row>
                  </>
                )}

                <Row className="mb-3">
                  <Col className="col-6">
                    <label
                      htmlFor="RepaymentStatus"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Status
                    </label>
                    <Field as="select" name="Status" className="form-control">
                      <option label="Set Status" value="" />
                      {enums.RepaymentStatus.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                  </Col>
                  {/* <Col>
                    <label
                      htmlFor="repaymentChannel"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Channel
                    </label>
                    <Field
                      as="select"
                      name="repaymentChannel"
                      className="form-control"
                    >
                      <option label="Select Channel" value="" />
                      {enums.RepaymentChannel.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>
                  </Col> */}
                </Row>

                {values.paymentMethod === "Cash" && (
                  <>
                    <Row className="mb-3">
                      {" "}
                      <Col md={6}>
                        <label
                          htmlFor="receiptNumber"
                          className="mb-2 "
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          Receipt Number <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="receiptNumber"
                          className="form-control"
                          placeholder="Receipt Number"
                        />
                        <ErrorMessage
                          name="receiptNumber"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                    </Row>{" "}
                  </>
                )}
                <Row className="mb-3">
                  <Col className="col-6">
                    <div>
                      <label
                        className="mb-2"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Document
                      </label>
                      <br />
                      {/* {!fileName ? (
                        // Display this when no file is selected
                        <div
                          onClick={() =>
                            document.getElementById("fileToUpload")?.click()
                          }
                          style={{
                            padding: "7px",
                            border: "1px solid #d3d3d3",
                            borderRadius: "2px",
                            cursor: "pointer",
                            width: "220px",
                            textAlign: "center",
                            color: "#555",
                          }}
                        >
                          Click here to upload a file
                        </div>
                      ) : (
                        // Display this when a file is selected
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            backgroundColor: "#a3a3a3",
                            borderRadius: "2px",
                            padding: "5px 10px",
                            color: "#fff",
                          }}
                        >
                          <span>{fileName}</span>
                          <span
                            // onClick={handleRemoveFile}
                            style={{
                              marginLeft: "10px",
                              cursor: "pointer",
                              color: "#fff",
                              padding: "4px",
                            }}
                          >
                            &times;
                          </span>
                        </div> */}
                      {/* )} */}

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        id="fileToUpload"
                        style={{ display: "none" }}
                        // onChange={handleFileChange}
                      />
                    </div>
                  </Col>
                </Row>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    marginTop: "25px",
                  }}
                >
                  <button
                    type="submit"
                    className="application-btn p-2 border-rounded-lg"
                    style={{
                      border: "1px solid transparent",
                      borderRadius: "2px",
                    }}
                  >
                    Submit
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

const DatePickerComponent = (givenDate: any) => {
  // Initial date as ISO string to avoid invalid date errors
  const initialDateString = "2024-11-15T00:00:00";

  // Format the date to "YYYY-MM-DD" for use in the date input
  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure 2 digits
    const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits
    return `${year}-${month}-${day}`;
  };

  // Initialize state with the formatted date
  const [selectedDate, setSelectedDate] = useState(
    formatDate(initialDateString)
  );

  // Handle date change
  const handleDateChange = async (event: any) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);

    // Call the API with Axios whenever the date changes
    try {
      const response = await axios.post("/your-api-endpoint", {
        date: newDate,
      });
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  return (
    <div>
      <input
        id="datePicker"
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        style={{
          border: "none",
          padding: "4px 0px",
          background: "transparent",
          cursor: "pointer",
        }}
      />
    </div>
  );
};

export default PayInvoice;
