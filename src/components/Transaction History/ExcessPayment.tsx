import React, { useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input, Button, Menu, Dropdown, Select } from "antd";
import {
  createPaymentAdjustment,
  getAccountNumber,
  getAllPaymentAdjustment,
  getLoanByAccountNumber,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import TableHeaderFilter from "../TableHeaderFilter";
import TableView from "../TableView/TableView";
import { DownOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const ExcessPayment = () => {
  const { t } = useTranslation("accountingLoans");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [paymentData, setPaymentData] = useState<any>();
  const [show, setShow] = useState(false);
  const [loanId, setLoanId] = useState<any>();
  const [accountID, setAccountID] = useState("");
  const customerId = localStorage.getItem("selectedCustomerID");

  useEffect(() => {
    getAllPayment();
  }, [page, pageSize]);
  const getLoan = async (number: any) => {
    try {
      const res = await getLoanByAccountNumber(number);
      if (res) {
        const data = res.data.data;
        setLoanId(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleChangess = (e: any, setFieldValue: any) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
    if (name === "accountNumber") {
      getLoan(value); // Fetch loan details based on account number
    }
  };
  const initialValues = {
    accountNumber: "",
    accountId: "",
    laonId: "",
    customerId: customerId,
    customerName: "",
    checnkNo: "",
    reversalAmount: 0,
    date: "",
    payerName: "",
    bankName: "",
    description: "",
    reasonForReversal: "",
    createdBy: "",
    mailingAddress: "",
  };

  const validationSchema = Yup.object().shape({
    accountNumber: Yup.string().required(t("excess.val.accountNumberRequired")),
    loanId: Yup.string().required(t("excess.val.loanIdRequired")),
    customerId: Yup.string().required(t("excess.val.customerIdRequired")),
    customerName: Yup.string().required(t("excess.val.customerNameRequired")),
    checkNo: Yup.string().required(t("excess.val.checkNoRequired")),
    reversalAmount: Yup.number()
      .required(t("excess.val.reversalAmountRequired"))
      .positive(t("excess.val.amountPositive")),
    date: Yup.string().required(t("excess.val.dateRequired")),
    payerName: Yup.string().required(t("excess.val.payerNameRequired")),
    bankName: Yup.string().required(t("excess.val.bankNameRequired")),
    description: Yup.string().required(t("excess.val.descriptionRequired")),
    reasonForReversal: Yup.string().required(t("excess.val.reasonRequired")),
    createdBy: Yup.string().required(t("excess.val.createdByRequired")),
    mailingAddress: Yup.string().required(t("excess.val.mailingAddressRequired")),
  });
  const handleSubmit = async (formField: any) => {
    try {
      const body = {
        accountNumber: formField.accountNumber,
        accountId: accountID,
        loanId: selectedLoanId,
        customerId: customerId,
        customerName: formField.customerName,
        checnkNo: formField.checnkNo,
        reversalAmount: formField.reversalAmount,
        date: formField.date,
        payerName: formField.payerName,
        bankName: formField.bankName,
        description: formField.description,
        reasonForReversal: formField.reasonForReversal,
        createdBy: formField.createdBy,
        mailingAddress: formField.mailingAddress,
      };

      const res = await createPaymentAdjustment(body);
      if (res?.data.notificationMessage) {
        toast.success(res?.data.notificationMessage);
        setShow(false);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleView = (row: any) => {};

  const handleEditClick = (row: any) => {};
  const selectChange = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "view") {
      handleView(row);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => selectChange(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item key="delete" icon={<EyeOutlined />}>
        {t("common:view")}
      </Menu.Item>
    </Menu>
  );
  const Call_Activity_Header = [
    {
      name: t("excess.col.accountNumber"), // LoanID
      selector: "accountNumber",
      cell: (row: any) => row.accountNumber,
    },
    {
      name: t("excess.col.id"), // customerId or id
      selector: "id",
      cell: (row: any) => row.id,
    },
    {
      name: t("excess.col.name"), // customerName
      selector: "customerName",
      cell: (row: any) => row.customerName,
    },
    {
      name: t("excess.col.chequeNo"), // checnkNo (assuming 'checnkNo' is a typo for 'chequeNo')
      selector: "checnkNo",
      cell: (row: any) => row.checnkNo,
    },
    {
      name: t("excess.col.reversalAmount"), // reversalAmount
      selector: "reversalAmount",
      cell: (row: any) => `SAR ${row.reversalAmount}`,
    },
    {
      name: t("excess.col.date"), // date
      selector: "date",
      cell: (row: any) => new Date(row.date).toLocaleDateString(),
    },
    {
      name: t("excess.col.payerName"), // payerName
      selector: "payerName",
      cell: (row: any) => row.payerName,
    },
    {
      name: t("excess.col.bankName"), // bankName
      selector: "bankName",
      cell: (row: any) => row.bankName,
    },
    {
      name: t("excess.col.description"), // description
      selector: "description",
      cell: (row: any) => row.description || "-------",
    },
    {
      name: t("excess.col.reasonForReversal"), // reasonForReversal
      selector: "reasonForReversal",
      cell: (row: any) => row.reasonForReversal,
    },
    {
      name: t("excess.col.createdBy"), // createdBy
      selector: "createdBy",
      cell: (row: any) => row.createdBy,
    },

    {
      name: t("common:actions"),

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button>
            {t("account.select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const getAllPayment = async () => {
    try {
      const res = await getAllPaymentAdjustment(page, pageSize);
      if (res) {
        const data = res.data.data;
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
        setPaymentData(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const mappedData =
    paymentData &&
    paymentData.map((item: any) => {
      return {
        accountNumber: item.accountNumber, // Note: Make sure the typo 'laonId' is intended or correct it to 'loanId'
        id: item.id,
        customerName: item.customerName,
        checnkNo: item.checnkNo, // Typo: 'checnkNo' can be corrected if needed
        reversalAmount: item.reversalAmount,
        date: formatDate(item.date),
        payerName: item.payerName,
        bankName: item.bankName,
        description: item.description || "-------",
        reasonForReversal: item.reasonForReversal || "-------",
        createdBy: item.createdBy,
        status: item.status, // Assuming there's a function to handle status mapping
      };
    });

  return (
    <>
      {!show && (
        <div className="cs-table p-2">
          <div className="d-flex col-12">
            <div className="col-10">
              <TableHeaderFilter />
            </div>
            <div className="col-2 d-flex justify-content-end align-items-center">
              <button
                className="theme-btn-next"
                onClick={() => {
                  setShow(true);
                }}
              >
                {t("excess.refund")}
              </button>
            </div>
          </div>
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Call_Activity_Header}
            data={mappedData}
          />
        </div>
      )}
      {show && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, setFieldValue }) => (
            <Form>
              <div className="col-12 mt-3 border-bottom">
                <h4>{t("excess.paymentReversal")}</h4>
                <div className="col-7 mt-5 d-flex justify-content-start mb-5">
                  <div className="me-2 w-100">
                    <label>{t("excess.accountNumber")}</label>
                    <Field
                      name="accountNumber"
                      as={Input}
                      size="large"
                      className="mt-2"
                      placeholder={t("excess.accountNumberPlaceholder")}
                      onChange={(e: any) => handleChangess(e, setFieldValue)}
                    />
                    <ErrorMessage
                      name="accountNumber"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="me-2 w-100">
                    <label>{t("excess.loanId")}</label>

                    <Select
                      size="large"
                      className="mt-2"
                      placeholder={t("excess.loanId")}
                      // value={formValues.applicationID}
                      // onChange={handleSelectChange}
                      onChange={(value) => {
                        setSelectedLoanId(value);
                        const selectedLoan = loanId.find(
                          (item: any) => item.id === value
                        );
                        if (selectedLoan) {
                          setAccountID(selectedLoan.accountId);
                        }
                      }}
                    >
                      {loanId &&
                        loanId.map((item: any) => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.productName}
                          </Select.Option>
                        ))}
                    </Select>
                    <ErrorMessage
                      name="loanId"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 mt-3 border-bottom">
                <h4>{t("excess.customerDetails")}</h4>
                <div className="col-7 mt-5 d-flex justify-content-start mb-5">
                  <div className="me-2 w-100">
                    <label>{t("excess.id")}</label>
                    <Field
                      name="customerId"
                      size="large"
                      id="customerId"
                      className="mt-2 form-control"
                      placeholder={t("excess.optional")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="customerId"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100 me-2">
                    <label>{t("excess.customerName")}</label>
                    <Field
                      name="customerName"
                      id="customerName"
                      className="form-control mt-2"
                      placeholder={t("excess.customerNamePlaceholder")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="customerName"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 mt-5">
                <div className="col-11 d-flex justify-content-start mb-5">
                  <div className="w-100 me-2">
                    <label>{t("excess.checkNumber")}</label>
                    <Field
                      name="checnkNo"
                      id="checnkNo"
                      as={Input}
                      size="large"
                      className="mt-2"
                      placeholder={t("excess.checkNumber")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="checnkNo"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className=" me-2 w-100">
                    <label>{t("excess.reversalAmount")}</label>
                    <Field
                      name="reversalAmount"
                      id="reversalAmount"
                      type="number"
                      className="mt-2 form-control"
                      placeholder={t("excess.reversalAmount")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="reversalAmount"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100">
                    <label>{t("excess.date")}</label>
                    <Field
                      name="date"
                      id="date"
                      type="date"
                      className="mt-2 form-control"
                      placeholder={t("excess.date")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="date"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 mt-5">
                <div className="col-11 d-flex justify-content-start mb-5">
                  <div className="w-100 me-2">
                    <label>{t("excess.payerName")}</label>
                    <Field
                      name="payerName"
                      id="payerName"
                      className="mt-2 form-control"
                      placeholder={t("excess.payerName")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="payerName"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100 me-2">
                    <label>{t("excess.bankName")}</label>
                    <Field
                      name="bankName"
                      id="bankName"
                      className="mt-2 form-control"
                      placeholder={t("excess.bankNamePlaceholder")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="bankName"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100 ">
                    <label>{t("excess.description")}</label>
                    <Field
                      name="description"
                      id="description"
                      className="mt-2 form-control"
                      placeholder={t("excess.description")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </div>
              </div>
              <div className="col-12 mt-5 ">
                <div className="col-7 d-flex justify-content-between mb-5">
                  <div className="w-100 me-2">
                    <label>{t("excess.reasonForReversal")}</label>
                    <Field
                      name="reasonForReversal"
                      ID="reasonForReversal"
                      className="mt-2 form-control"
                      placeholder={t("excess.reasonForReversal")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="reasonForReversal"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100 ">
                    <label>{t("excess.createdBy")}</label>
                    <Field
                      name="createdBy"
                      className="mt-2 form-control"
                      placeholder={t("excess.createdBy")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="createdBy"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </div>
              </div>
              <div className="col-12 mt-5 border-bottom">
                <div className="col-10 d-flex justify-content-between mb-5">
                  <div className="w-100">
                    <label>{t("excess.mailingAddress")}</label>
                    <Field
                      name="mailingAddress"
                      id="mailingAddress"
                      className="mt-2 form-control"
                      placeholder={t("excess.optional")}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="mailingAddress"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex mt-4 justify-content-end ">
                <button
                  className="theme-btn-next"
                  type="submit"
                  //   onClick={() => {

                  //   }}
                >
                  {t("common:submit")}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};

export default ExcessPayment;
