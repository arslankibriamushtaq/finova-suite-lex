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

const ExcessPayment = () => {
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
    accountNumber: Yup.string().required("Account Number is required"),
    loanId: Yup.string().required("Loan ID is required"),
    customerId: Yup.string().required("Customer ID is required"),
    customerName: Yup.string().required("Customer name is required"),
    checkNo: Yup.string().required("Check number is required"),
    reversalAmount: Yup.number()
      .required("Reversal amount is required")
      .positive("Amount must be positive"),
    date: Yup.string().required("Date is required"),
    payerName: Yup.string().required("Payer name is required"),
    bankName: Yup.string().required("Bank name is required"),
    description: Yup.string().required("Description is required"),
    reasonForReversal: Yup.string().required("Reason for reversal is required"),
    createdBy: Yup.string().required("Created by is required"),
    mailingAddress: Yup.string().required("Mailing address is required"),
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
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<EyeOutlined />}>
        View
      </Menu.Item>
    </Menu>
  );
  const Call_Activity_Header = [
    {
      name: "Account Number", // LoanID
      selector: "accountNumber",
      cell: (row: any) => row.accountNumber,
    },
    {
      name: "ID", // customerId or id
      selector: "id",
      cell: (row: any) => row.id,
    },
    {
      name: "Name", // customerName
      selector: "customerName",
      cell: (row: any) => row.customerName,
    },
    {
      name: "Cheque No.", // checnkNo (assuming 'checnkNo' is a typo for 'chequeNo')
      selector: "checnkNo",
      cell: (row: any) => row.checnkNo,
    },
    {
      name: "Reversal Amount", // reversalAmount
      selector: "reversalAmount",
      cell: (row: any) => `SAR ${row.reversalAmount}`,
    },
    {
      name: "Date", // date
      selector: "date",
      cell: (row: any) => new Date(row.date).toLocaleDateString(),
    },
    {
      name: "Payer Name", // payerName
      selector: "payerName",
      cell: (row: any) => row.payerName,
    },
    {
      name: "Bank Name", // bankName
      selector: "bankName",
      cell: (row: any) => row.bankName,
    },
    {
      name: "Description", // description
      selector: "description",
      cell: (row: any) => row.description || "-------",
    },
    {
      name: "Reason for Reversal", // reasonForReversal
      selector: "reasonForReversal",
      cell: (row: any) => row.reasonForReversal,
    },
    {
      name: "Created By", // createdBy
      selector: "createdBy",
      cell: (row: any) => row.createdBy,
    },

    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button>
            Select <DownOutlined />
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
                Refund Excess Payment
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
                <h4>Payment Reversal</h4>
                <div className="col-7 mt-5 d-flex justify-content-start mb-5">
                  <div className="me-2 w-100">
                    <label>accountNumber</label>
                    <Field
                      name="accountNumber"
                      as={Input}
                      size="large"
                      className="mt-2"
                      placeholder="Account Number"
                      onChange={(e: any) => handleChangess(e, setFieldValue)}
                    />
                    <ErrorMessage
                      name="accountNumber"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="me-2 w-100">
                    <label>Loan ID</label>

                    <Select
                      size="large"
                      className="mt-2"
                      placeholder="Loan ID"
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
                <h4>Customer Business/Details</h4>
                <div className="col-7 mt-5 d-flex justify-content-start mb-5">
                  <div className="me-2 w-100">
                    <label>ID</label>
                    <Field
                      name="customerId"
                      size="large"
                      id="customerId"
                      className="mt-2 form-control"
                      placeholder="Optional"
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="customerId"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100 me-2">
                    <label>Customer Name</label>
                    <Field
                      name="customerName"
                      id="customerName"
                      className="form-control mt-2"
                      placeholder="customer Name"
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
                    <label>Check Number</label>
                    <Field
                      name="checnkNo"
                      id="checnkNo"
                      as={Input}
                      size="large"
                      className="mt-2"
                      placeholder="Check Number"
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="checnkNo"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className=" me-2 w-100">
                    <label>Reversal Amount</label>
                    <Field
                      name="reversalAmount"
                      id="reversalAmount"
                      type="number"
                      className="mt-2 form-control"
                      placeholder="Reversal Amount"
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="reversalAmount"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100">
                    <label>Date</label>
                    <Field
                      name="date"
                      id="date"
                      type="date"
                      className="mt-2 form-control"
                      placeholder="Date"
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
                    <label>Payer Name</label>
                    <Field
                      name="payerName"
                      id="payerName"
                      className="mt-2 form-control"
                      placeholder="Payer Name"
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="payerName"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100 me-2">
                    <label>Bank Name</label>
                    <Field
                      name="bankName"
                      id="bankName"
                      className="mt-2 form-control"
                      placeholder="bank Name"
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="bankName"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100 ">
                    <label>Description</label>
                    <Field
                      name="description"
                      id="description"
                      className="mt-2 form-control"
                      placeholder="Description"
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
                    <label>Reason For Reversal</label>
                    <Field
                      name="reasonForReversal"
                      ID="reasonForReversal"
                      className="mt-2 form-control"
                      placeholder="Reason For Reversal"
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="reasonForReversal"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                  <div className="w-100 ">
                    <label>Created By</label>
                    <Field
                      name="createdBy"
                      className="mt-2 form-control"
                      placeholder="Created By"
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
                    <label>Mailing Address</label>
                    <Field
                      name="mailingAddress"
                      id="mailingAddress"
                      className="mt-2 form-control"
                      placeholder="optional"
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
                  Submit
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
