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
import { useTranslation } from "react-i18next";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const PayInvoice = () => {
  const { t } = useTranslation("accountingLoans");
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
    paymentMethod: Yup.string().required(t("pay.val.paymentMethodRequired")),
    payerName: Yup.string().required(t("pay.val.payerNameRequired")),
    chequeNo: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque") {
          return schema
            .required(t("pay.val.chequeNumberRequired"))
            .matches(/^[0-9]+$/, t("pay.val.chequeNumberNumeric"));
        }
        return schema.notRequired();
      }
    ),

    branchCode: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque") {
          return schema.required(t("pay.val.branchCodeRequired"));
        }
        return schema.notRequired();
      }
    ),

    receiptNumber: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cash") {
          return schema.required(t("pay.val.receiptNumberRequired"));
        }
        return schema.notRequired();
      }
    ),

    bankName: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque" || paymentMethod === "Credit Card") {
          return schema.required(t("pay.val.bankNameRequired"));
        }
        return schema.notRequired();
      }
    ),

    bankAccNumber: Yup.string().when(
      "paymentMethod",
      (paymentMethod: any, schema) => {
        if (paymentMethod[0] === "Cheque" || paymentMethod === "Credit Card") {
          return schema.required(t("pay.val.bankAccNumberRequired"));
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
      { value: 0, label: t("pay.optInvoice") },
      { value: 1, label: t("pay.optPromise") },
    ],
    RepaymentStatus: [
      { value: 0, label: t("pay.optPending") },
      { value: 1, label: t("pay.optApproved") },
      { value: 2, label: t("pay.optRejected") },
    ],

    RepaymentChannel: [
      { value: 0, label: t("pay.cheque") },
      { value: 1, label: t("pay.online") },
      { value: 2, label: t("pay.cash") },
      { value: 3, label: t("txnHistory.mode.gateway") },
    ],
  };
  const totalInvoiceList = payInvoice?.totalInvoiceList || [];
  return (
    <>
      <div>
        <div className="col-12 d-flex">
          <div className="col-6">
            {" "}
            <h5>{t("payInvoice.template")} </h5>
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
                {t("payInvoice.invoiceNo")}
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
                  {t("payInvoice.from")}
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
                  {t("payInvoice.billingTo")}
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
                  {t("payInvoice.paymentTerm")}
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
                  {t("payInvoice.shipTo")}
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
                  {t("payInvoice.poNumber")}
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
                  {t("payInvoice.dueDate")}
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
                <label style={{ fontWeight: "bold" }}>{t("payInvoice.date")}</label>
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
                {t("payInvoice.item")}
              </div>
              <div
                className="mb-2 p-3 col-3"
                style={{
                  background: "var(--color-error-bg)",

                  fontWeight: "700",
                  color: "var(--foreground)",
                }}
              >
                {t("payInvoice.amount")}
              </div>
              <div
                className="mb-2 p-3 col-3"
                style={{
                  background: "var(--color-error-bg)",

                  fontWeight: "700",
                  color: "var(--foreground)",
                }}
              >
                {t("payInvoice.discount")}
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
                {t("payInvoice.discountedAmount")}
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
              <p>{t("payInvoice.noInvoices")}</p>
            )}
          </div>
          <div
            className="col-12 p-3 border-top border-bottom d-flex justify-content-between"
            style={{
              background: themeStyle.gradientBackgroundColor,
            }}
          >
            <div className="col-6" style={{ fontWeight: 600 }}>
              {t("payInvoice.subTotal")}
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
                  <label style={{ fontWeight: "bold" }}>{t("payInvoice.tax")}</label>
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
                    {t("payInvoice.shipping")}
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
              <label style={{ fontWeight: 500 }}>{t("payInvoice.total")}</label>
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
          {t("payInvoice.payInvoice")}
        </Button>
      </div>
      <Modal show={showModal} size="lg" centered>
        <Modal.Header
          closeButton
          onClick={() => {
            setShowModal(false);
          }}
        >
          <Modal.Title>{t("pay.title")}</Modal.Title>
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
                      {t("pay.invoiceNo")}
                    </label>
                    <Field name="invoiceNumber" className="form-control" />
                  </Col>
                  <Col>
                    <label
                      htmlFor="totalAmount"
                      className="mb-2"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      {t("pay.amount")}
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
                      {t("pay.paymentMethod")} <span className="text-danger">*</span>
                    </label>
                    <Field
                      as="select"
                      name="paymentMethod"
                      className="form-control"
                    >
                      <option label={t("pay.selectPaymentMethod")} value="" />
                      <option value="Cheque">{t("pay.cheque")}</option>
                      <option value="Credit Card">{t("pay.online")}</option>
                      <option selected value="Cash">{t("pay.cash")}</option>
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
                      {t("pay.dueDate")}
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
                          {t("pay.chequeNumber")} <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="chequeNo"
                          className="form-control"
                          placeholder={t("pay.chequeNumPlaceholder")}
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
                          {t("pay.branchCode")} <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="branchCode"
                          className="form-control"
                          placeholder={t("pay.branchCode")}
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
                          {t("pay.bankName")} <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankName"
                          className="form-control"
                          placeholder={t("pay.bankName")}
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
                          {t("pay.bankAccNumber")} <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankAccNumber"
                          className="form-control"
                          placeholder={t("pay.bankAccountNumber")}
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
                      {t("pay.payerName")} <span className=" text-danger">*</span>
                    </label>
                    <Field
                      as="input"
                      name="payerName"
                      className="form-control"
                      placeholder={t("pay.payerName")}
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
                      {t("pay.repaymentTypes")}
                    </label>
                    <Field
                      as="select"
                      name="repaymentTypes"
                      className="form-control"
                    >
                      <option label={t("pay.selectType")} value="" />
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
                          {t("pay.bankName")} <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankName"
                          className="form-control"
                          placeholder={t("pay.bankName")}
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
                          {t("pay.bankAccNumber")} <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="bankAccNumber"
                          className="form-control"
                          placeholder={t("pay.bankAccountNumber")}
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
                      {t("pay.status")}
                    </label>
                    <Field as="select" name="Status" className="form-control">
                      <option label={t("pay.setStatus")} value="" />
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
                          {t("pay.receiptNumber")} <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="input"
                          name="receiptNumber"
                          className="form-control"
                          placeholder={t("pay.receiptNumber")}
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
                        {t("pay.document")}
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
                    {t("common:submit")}
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
