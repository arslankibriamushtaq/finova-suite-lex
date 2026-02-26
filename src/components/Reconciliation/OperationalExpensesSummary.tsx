import React, { useEffect, useState } from "react";
import TableView from "../TableView/TableView";

import * as Yup from "yup";
import { Dropdown, Button, Menu, } from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createVoucher,
  deleteVoucherById,
  getAccountNumberForCollectral,
  getAllAccountDetails,
  getLedgerAccount,
  getVauchers,
  getVoucherById,
  updateVoucher,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import Loader from "../Loader/Loader";
const OperationalExpensesSummary = () => {
  const [modal, setModal] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [callAction, setCallAction] = useState<any>();
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);
  const [customerData, setCustomerData] = useState<any>([]);
  const [allAccounts, setAllAccounts] = useState<any>([]);
  const [editForm, setEditForm] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0)
  const [applications, setApplications] = useState<any>();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    accountNumber: "",
    applicationID: "",
    collectrolId: "",
    propertyAddress: "",
    marketValue: "",
    externalAgencyName: "",
    valuationAmount: "",
    valuationDate: "",
  });
  const id = useParams();

  const handleEditClick = (row: any) => {
    setEditRowId(row.Id);
    // navigate(`${row.id}`);
    setModalUpdate(true);
    acitivityCallId(row.Id);
  };
  const handleDelete = async (row: any) => {
    try {
      const res = await deleteVoucherById(row.Id);
      if (res) {
        toast.success(res.data.notificationMessage);
        handleSubmit(); // Refresh the data
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAccounts = async () => {
    try {
      const res = await getAllAccountDetails();
      if (res) {
        setAllAccounts(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setSkelitonLoading(true);
      const data = {
        pageNo: page,
        pageSize: pageSize,
        from: null,
        to: null,
      };
      const res = await getVauchers(data);
      if (res?.data?.success) {
        const data = res.data.data;
        setAllCallActivity(data || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
        setPage(res?.data?.pageInfo?.page || 0)
        setPageSize(res?.data?.pageInfo?.pageSize || 0)
        setTo(res?.data?.pageInfo?.to || 0)
        setFrom(res?.data?.pageInfo?.from || 0)
      } else {
        toast.error(res?.data?.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const exportToCSV = (data: any[], fileName: string) => {
      const updatedData = data?.map((item) => {
      return {
        "Voucher No": item?.voucherNo,
        "Application No": item?.applicationNo,
        "Date": item?.date,
        "Voucher Type": item?.voucherType,
        "Amount": item?.amount,
        "Currency": "SAR",
        "Status": "Approved",
      };
    });
    const csvRows = [];
    const headers = Object.keys(updatedData[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
  
    updatedData.forEach((row: any) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    // Create CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob from the CSV string and trigger a download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };
  const handleSubmitForm = async (formFields: any) => {
    try {
      formFields.voucherType = formFields.voucherType == "1" ? 1 : 2;
      formFields.approvalStatus = Number(formFields.approvalStatus);
      formFields.applicationId = formValues.applicationID;
      formFields.currency = 1;
      // formFields.creditAccount = Number(formFields.creditAccount);
      const res = await createVoucher(formFields);
      if (res.data.notificationMessage) {
        toast.success(res.data.notificationMessage);
        handleSubmit();
        setModal(false);

      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const updateSubmitForm = async (formFields: any) => {
    try {
      let payload = {
        voucherNo: editForm.voucherNo,
        applicationKey: editForm.applicationKey,
        voucherId: editForm.voucherId,
        voucherType: formFields.voucherType == "1" ? 1 : 2,
        approvalStatus: Number(formFields.approvalStatus),
        currency: 1,
        description: editForm.description,
        debitAccount: editForm.debitAccount,
        creditAccount: editForm.creditAccount,
        amount: formFields.amount,
      };
      await updateVoucher(payload).then((res) => {
        if (res.data.notificationMessage) {
          toast.success(res.data.notificationMessage);
          handleSubmit();
          setModalUpdate(false);

        }
      });
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const reversePayment = async (row: any) => {
    setModalUpdate(true);
    try {
      let payload = {
        voucherNo: "row.VoucherNo",
        applicationId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        voucherId: row.Id,
        voucherType: row.VoucherType == "Payment_Voucher" ? 1 : 0,
        approvalStatus: Number(row.Status),
        currency: row.Currency == "SAR" ? 0 : 1,
        description: row.Description,
        debitAccount: row.CreditAccount,
        creditAccount: row.DebitAccount,
        amount: row.Amount,
        date: new Date(),
      };

      await updateVoucher(payload).then((res) => {
        if (res?.data?.notificationMessage) {
          toast.success(res?.data?.notificationMessage);
          handleSubmit();
          setModalUpdate(false);
        }
      });
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const acitivityCallId = async (id: any) => {
    try {
      const res = await getVoucherById(id);
      if (res) {
        setEditForm(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const LedgerDetails = async () => {
    try {
      //setLoading(true);
      const res = await getLedgerAccount(1, 1000, "");
      if (res) {
        const value = res.data.data || [];
        setCustomerData(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };
  const enums = {
    ApprovalStatus: [
      { value: 0, label: "Draft" },
      { value: 1, label: "Pending" },
      { value: 2, label: "Approved" },
      { value: 3, label: "Rejected" },
      { value: 4, label: "Under_Review" },
      { value: 5, label: "Cancelled" },
      { value: 6, label: "Completed" },
    ],
  };
  const getApprovalStatus = (value: any) => {
    const status = enums.ApprovalStatus.find((g) => g.value === Number(value));
    return status ? status.label : "Unknown";
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const validationSchema = Yup.object({
    voucherNo: Yup.string().required("Voucher Number is required"),
    applicationId: Yup.string().required("Application ID is required"),
    voucherType: Yup.string().required("Voucher Type is required"),
    date: Yup.string().required("Date is required"),
    description: Yup.string().required("Description is required"),
    debitAccount: Yup.string().required("Debit Account is required"),
    creditAccount: Yup.string().required("Credit Account is required"),
    amount: Yup.number().required("Amount is required"),
    currency: Yup.string().required("Currency is required"),
    approvalStatus: Yup.string().required("Approval Status is required"),
  });
  const mappedData =
    allCallActivity &&
    allCallActivity.map((item: any) => {
      return {
        VoucherNo: item.voucherNo,
        applicationId: item.applicationId,
        applicationKey: item.applicationKey,
        applicationNo: item.applicationNo,
        Id: item.voucherId,
        Date: formatDate(item.date),
        Description: item.description,
        DebitAccount: item.debitAccount,
        CreditAccount: item.creditAccount,
        Amount: item.amount,
        Currency: item.currency,
        // Status: getApprovalStatus(item.approvalStatus),
        Status: item?.approvalStatus,
        VoucherType: item.voucherType,
      };
    });

  useEffect(() => {
    handleSubmit();
    handleAccounts();
    LedgerDetails();
    return () => {};
  }, [id, page, pageSize]);
  const handleChange = (key: string, row: any) => {
    if (key === "Edit") {
      handleEditClick(row);
    } else if (key === "Delete") {
      handleDelete(row);
    } else if (key === "Reversal") {
      reversePayment(row);
    }
  };

  const Call_Activity_Header = [
    {
      name: "Service Type",
      cell: (row: any) => "-",
    },
   
 
    {
      name: "Transaction Count",
            selector: (row: { Amount: any }) => "-",
    },
    {
      name: "Total Amount",
      selector: (row: { VoucherType: any }) => "-",
    },
 
    {
      name: "Avarage Cost",
      selector: (row: { Amount: any }) => "-",
    },
    

  ];
  const getAccountNumberByApplication = async (number: any) => {
    try {
      const res = await getAccountNumberForCollectral(number);
      if (res) {
        const data = res.data.data;
        setApplications(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    if (formValues.accountNumber) {
      getAccountNumberByApplication(formValues.accountNumber);
    }
  }, [formValues.accountNumber]);

  return (
    <>
      {loading && <Loader />}
      <div className="col-12">
        
      
        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            to={to}
            from={from}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            header={Call_Activity_Header}
            data={mappedData}
            isLoading={skelitonLoading}
          />
        </div>
      </div>
      
    </>
  );
};

export default OperationalExpensesSummary;
