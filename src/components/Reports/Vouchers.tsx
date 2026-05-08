import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import * as Yup from "yup";
import { Dropdown, Button, DatePicker, Menu, Select, Input, Row as AntRow, Col as AntCol } from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createVoucher,
  deleteVoucherById,
  getLedgerAccount,
  getVauchers,
  getVoucherById,
  updateVoucher,
  getJournalVouchersReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import Loader from "../Loader/Loader";
import dayjs from "dayjs";
const Vouchers = () => {
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
  const [totalPage, setTotalPage] = useState(1);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [applications, setApplications] = useState<any>();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [formValues, setFormValues] = useState<any>({
    applicationID: "",
  });
  const [applicationNoError, setApplicationNoError] = useState<string>("");
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
      const res = await getLedgerAccount(1, 1000, "");
      if (res) {
        setAllAccounts(res.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const extractVouchers = (root: any): { items: any[]; inner: any } => {
    const inner = root?.data;
    const items: any[] = Array.isArray(inner?.vouchers)
      ? inner.vouchers
      : Array.isArray(inner)
        ? inner
        : Array.isArray(inner?.items)
          ? inner.items
          : Array.isArray(root)
            ? root
            : [];
    return { items, inner };
  };

  const handleSubmit = async () => {
    try {
      setSkelitonLoading(true);
      // Send fromDate/toDate only when the user has picked them; otherwise hit
      // the bare endpoint (matches the curl shape the backend expects).
      const start = fromDate ? fromDate.format("YYYY-MM-DD") : undefined;
      const end = toDate ? toDate.format("YYYY-MM-DD") : undefined;

      // Backend caps each response at ~20 rows even when we ask for more, so
      // walk every page returned in `pagination.totalPages` and concatenate.
      const firstRes = await getJournalVouchersReport(start, end, undefined, undefined, 0, 100);
      const firstRoot = firstRes?.data;
      const firstParsed = extractVouchers(firstRoot);
      let combined: any[] = [...firstParsed.items];

      const pagination = firstRoot?.pagination;
      const totalPagesFromApi = Number(pagination?.totalPages) || 1;

      if (totalPagesFromApi > 1) {
        const remaining = await Promise.all(
          Array.from({ length: totalPagesFromApi - 1 }, (_, i) =>
            getJournalVouchersReport(start, end, undefined, undefined, i + 1, 100)
              .then((r) => extractVouchers(r?.data).items)
              .catch(() => [])
          )
        );
        combined = combined.concat(...remaining);
      }

      setAllCallActivity(combined);
      const inner = firstParsed.inner;
      setSummary(
        inner && typeof inner === "object" && !Array.isArray(inner)
          ? {
              fromDate: inner.fromDate,
              toDate: inner.toDate,
              totalVouchers: inner.totalVouchers ?? combined.length,
              totalDebits: inner.totalDebits,
              totalCredits: inner.totalCredits,
            }
          : null
      );
    } catch (error: any) {
      console.error("Error fetching vouchers:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch vouchers");
      setAllCallActivity([]);
      setSummary(null);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const exportToCSV = (data: any[], fileName: string) => {
      const updatedData = data?.map((item) => {
      return {
        "Voucher No": item?.voucherNumber || item?.voucherNo || "",
        "Date": item?.entryDate || item?.date || "",
        "Reference Type": item?.referenceType || "",
        "Transaction Type": item?.transactionType || item?.voucherType || "",
        "Description": item?.description || "",
        "Debit": item?.totalDebit ?? item?.debitAmount ?? item?.amount ?? 0,
        "Credit": item?.totalCredit ?? item?.creditAmount ?? 0,
        "Currency": item?.currency || "SAR",
        "Status": item?.status || item?.approvalStatus || "",
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
      // Validate Application No separately since it's in formValues
      if (!formValues.applicationID || formValues.applicationID.trim() === "") {
        setApplicationNoError("Application No is required");
        toast.error("Please fill all required fields");
        return;
      }

      const payload = {
        applicationNo: formValues.applicationID,
        date: formFields.date,
        vouchterType: formFields.voucherType == "1" ? 1 : 2,
        debitAccount: formFields.debitAccount,
        creditAccount: formFields.creditAccount,
        description: formFields.description,
        channel: "LMS",
        amount: Number(formFields.amount),
        approvalStatus: Number(formFields.approvalStatus),
      };
      const res = await createVoucher(payload);
      if (res.data.notificationMessage) {
        toast.success(res.data.notificationMessage);
        handleSubmit();
        setModal(false);
        // Reset form values
        setFormValues({ applicationID: "" });
        setApplicationNoError("");
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
    approvalStatus: Yup.string().required("Approval Status is required"),
    voucherType: Yup.string()
      .required("Voucher Type is required")
      .test("not-zero", "Please select a valid Voucher Type", (value) => {
        return value !== "0";
      }),
    date: Yup.string().required("Date is required"),
    description: Yup.string().required("Description is required"),
    debitAccount: Yup.string().required("Debit Account is required"),
    creditAccount: Yup.string().required("Credit Account is required"),
    amount: Yup.string()
      .required("Amount is required")
      .test("not-zero", "Amount must be greater than 0", (value) => {
        if (!value) return false;
        return Number(value) > 0;
      }),
  });
  const mappedData = useMemo(() => {
    const all = (allCallActivity || []).map((item: any) => ({
      // Identifiers
      Id: item.entryId || item.voucherId,
      VoucherNo: item.voucherNumber || item.voucherNo || "-",
      // Dates
      Date: formatDate(item.entryDate || item.date),
      ValueDate: formatDate(item.valueDate),
      // Type / classification
      ReferenceType: item.referenceType || "-",
      TransactionType: item.transactionType || item.voucherType || "-",
      // Amounts
      Debit: item.totalDebit ?? item.debitAmount ?? item.amount ?? 0,
      Credit: item.totalCredit ?? item.creditAmount ?? 0,
      Currency: item.currency || "SAR",
      // Other
      Description: item.description || "-",
      Status: item.status || item.approvalStatus || "-",
      // Legacy aliases retained for the action menu / edit modal
      applicationId: item.applicationId,
      applicationNo: item.applicationNo,
      VoucherType: item.transactionType || item.voucherType,
    }));

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.VoucherNo || "").toLowerCase().includes(term) ||
      String(row.ReferenceType || "").toLowerCase().includes(term) ||
      String(row.TransactionType || "").toLowerCase().includes(term) ||
      String(row.Status || "").toLowerCase().includes(term) ||
      String(row.Description || "").toLowerCase().includes(term) ||
      String(row.Date || "").toLowerCase().includes(term)
    );
  }, [allCallActivity, debouncedSearch]);

  // Client-side pagination on filtered rows so search and the pager stay in sync
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mappedData.slice(start, start + pageSize);
  }, [mappedData, page, pageSize]);

  // Totals derived from the currently-visible (filtered) rows so the summary
  // cards always match what's shown in the table.
  const visibleTotals = useMemo(() => {
    const totalDebits = mappedData.reduce((acc: number, r: any) => acc + Number(r.Debit ?? 0), 0);
    const totalCredits = mappedData.reduce((acc: number, r: any) => acc + Number(r.Credit ?? 0), 0);
    return { totalVouchers: mappedData.length, totalDebits, totalCredits };
  }, [mappedData]);

  // Recompute totals + from/to whenever the filtered set or page changes
  useEffect(() => {
    const total = mappedData.length;
    setTotalRows(total);
    setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [mappedData, page, pageSize]);

  // Debounce search so we don't re-filter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    handleSubmit();
    handleAccounts();
    LedgerDetails();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fromDate, toDate]);
  const handleChange = (key: string, row: any) => {
    if (key === "Edit") {
      handleEditClick(row);
    } else if (key === "Delete") {
      handleDelete(row);
    } else if (key === "Reversal") {
      reversePayment(row);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="Reversal" icon={<EyeOutlined />}>
        Reverse Payment
      </Menu.Item>
      <Menu.Item key="Edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="Delete" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const Call_Activity_Header = [
    {
      name: "Voucher No",
      selector: (row: any) => row.VoucherNo,
      sortable: true,
      width: "180px",
    },
    {
      name: "Date",
      selector: (row: any) => row.Date,
      sortable: true,
      width: "120px",
    },
    {
      name: "Reference Type",
      selector: (row: any) => row.ReferenceType,
      sortable: true,
      width: "140px",
    },
    {
      name: "Transaction Type",
      selector: (row: any) => row.TransactionType,
      sortable: true,
      width: "150px",
    },
    {
      name: "Description",
      selector: (row: any) => row.Description,
      grow: 2,
    },
    {
      name: "Debit",
      cell: (row: any) => (
        <span>{formatNumber(row.Debit)}</span>
      ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Credit",
      cell: (row: any) => (
        <span>{formatNumber(row.Credit)}</span>
      ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Currency",
      selector: (row: any) => row.Currency,
      width: "90px",
    },
    {
      name: "Status",
      width: "150px",
      cell: (row: any) => (
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "0.4rem 1rem",
            borderRadius: "12px",
            backgroundColor:
              row.Status === "POSTED" || row.Status === "Approved"
                ? "#92BC83"
                : row.Status === "DRAFT" || row.Status === "Pending"
                ? "#FAB65E"
                : row.Status === "REJECTED" || row.Status === "Rejected"
                ? "#F85F54"
                : row.Status === "Under_Review"
                ? "#959595"
                : row.Status === "Cancelled"
                ? "#629FFB"
                : "rgba(55, 52, 53, 1)",
            color: "rgba(255, 255, 255, 1)",
            cursor: row.Status === "Active" ? "pointer" : "default",
          }}
        >
          {row.Status}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              border: "none",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const handleInputChange = (event: any) => {
    const { name, value, type } = event.target;

    setFormValues((prevValues: any) => ({
      ...prevValues,
      [name]: value,
    }));
    
    // Clear application no error when user types
    if (name === "applicationID") {
      setApplicationNoError("");
    }
  };
  const handleSelectChange = (value: string) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      applicationID: value, // Set the selected value directly
    }));
  };

  return (
    <>
      {loading && <Loader />}
      <div className="col-12">
        <h5 className="mb-3">Journal Voucher</h5>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <Input
            allowClear
            placeholder="Search by voucher, type, status, description"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
          />
          <div className="d-flex flex-wrap align-items-center gap-2" style={{ flexShrink: 0 }}>
            <DatePicker
              placeholder="From"
              value={fromDate}
              onChange={(d) => { setFromDate(d); setPage(1); }}
              format="YYYY-MM-DD"
              allowClear
              style={{ height: 40, borderRadius: 8 }}
            />
            <DatePicker
              placeholder="To"
              value={toDate}
              onChange={(d) => { setToDate(d); setPage(1); }}
              format="YYYY-MM-DD"
              allowClear
              style={{ height: 40, borderRadius: 8 }}
            />
            <button
              type="button"
              className="theme-btn-next"
              onClick={() => setModal(true)}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Create Voucher
            </button>
            <button
              type="button"
              className="theme-btn-next"
              onClick={() => exportToCSV(allCallActivity, "Voucher")}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Export CSV
            </button>
          </div>
        </div>

        {(allCallActivity?.length > 0 || summary) && (
          <AntRow gutter={[16, 16]} className="mt-3">
            <AntCol xs={24} sm={12} lg={6}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>Total Vouchers</div>
                <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                  {visibleTotals.totalVouchers}
                </div>
              </div>
            </AntCol>
            <AntCol xs={24} sm={12} lg={6}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>Total Debits</div>
                <div
                  className="mt-2"
                  style={{ fontSize: 22, fontWeight: 700 }}
                >
                  {formatNumber(visibleTotals.totalDebits)}
                </div>
              </div>
            </AntCol>
            <AntCol xs={24} sm={12} lg={6}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>Total Credits</div>
                <div
                  className="mt-2"
                  style={{ fontSize: 22, fontWeight: 700 }}
                >
                  {formatNumber(visibleTotals.totalCredits)}
                </div>
              </div>
            </AntCol>
            {(summary.fromDate || summary.toDate) && (
              <AntCol xs={24} sm={12} lg={6}>
                <div className="card-product p-4 text-dark h-100">
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Date Range</div>
                  <div className="mt-2" style={{ fontSize: 14, fontWeight: 600 }}>
                    {summary.fromDate} → {summary.toDate}
                  </div>
                </div>
              </AntCol>
            )}
          </AntRow>
        )}

        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            totalPage={totalPage}
            from={from}
            to={to}
            header={Call_Activity_Header}
            data={paginatedData}
            isLoading={skelitonLoading}
            paginationShow={true}
          />
        </div>
      </div>
      <Modal
        size="lg"
        show={modal}
        onHide={() => {
          setModal(false);
          setApplicationNoError("");
          setFormValues({ applicationID: "" });
        }}
      >
        <ModalHeader closeButton>
          <h3>Add Voucher</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            approvalStatus: "",
            voucherType: "0",
            date: "",
            description: "",
            debitAccount: "",
            creditAccount: "",
            amount: "",
          }}
          enableReinitialize={true}
          onSubmit={handleSubmitForm}
          validationSchema={validationSchema}
        >
          {({ handleChange }) => {
            return (
              <Form className="p-2">
                <Modal.Body>
                  <Row className="mb-2">
                    <Col md={6}>
                      <label
                        htmlFor="approvalStatus"
                        className="mb-1 form-label"
                      >
                        Approval Status
                      </label>

                      <Field
                        as="select"
                        placeholder="Approval Status"
                        id="approvalStatus"
                        name="approvalStatus"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: Number(e.target.value),
                            },
                          })
                        }
                      >
                        <option value="" label="Select Approval status" />
                        {enums.ApprovalStatus.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="approvalStatus"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label
                        htmlFor="applicationNo"
                        className="mb-1 form-label"
                      >
                        Application No
                      </label>
                      <Input
                        name="applicationID"
                        value={formValues.applicationID}
                        onChange={handleInputChange}
                        size="large"
                        placeholder="Application Number"
                        status={applicationNoError ? "error" : ""}
                      />
                      {applicationNoError && (
                        <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                          {applicationNoError}
                        </div>
                      )}
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="voucherType" className="mb-1 form-label">
                        Voucher Type
                      </label>
                      <Field
                        as="select"
                        id="voucherType"
                        name="voucherType"
                        className="form-control"
                      >
                        <option value={0}>Select Voucher Type</option>
                        <option value={1}>Receipt Voucher</option>
                        <option value={2}>Payment Voucher</option>
                      </Field>
                      <ErrorMessage
                        name="voucherType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="date" className="mb-1 form-label">
                        Date
                      </label>
                      <Field
                        type="date"
                        id="date"
                        name="date"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="date"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="description" className="mb-1 form-label">
                        Description
                      </label>
                      <Field
                        type="text"
                        placeholder="Enter Description"
                        id="description"
                        name="description"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="debitAccount" className="mb-1 form-label">
                        Debit Account
                      </label>
                      <Select
                        //name="debitAccount"
                        id="debitAccount"
                        //className="form-control"
                        placeholder="Select Debit Account"
                        onChange={(value) =>
                          handleChange({
                            target: { name: "debitAccount", value },
                          })
                        }
                      >
                        {customerData.map((account: any) => (
                          <Select.Option key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountTitle}
                          </Select.Option>
                        ))}
                      </Select>
                      <ErrorMessage
                        name="debitAccount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label
                        htmlFor="creditAccount"
                        className="mb-1 form-label"
                      >
                        Credit Account
                      </label>
                      <Select
                        //name="creditAccount"
                        id="creditAccount"
                        //className="form-control"
                        placeholder="Select Credit Account"
                        onChange={(value) =>
                          handleChange({
                            target: { name: "creditAccount", value },
                          })
                        }
                      >
                        {allAccounts.map((account: any) => (
                          <Select.Option key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountTitle}
                          </Select.Option>
                        ))}
                      </Select>
                      <ErrorMessage
                        name="creditAccount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="amount" className="mb-1 form-label">
                        Amount
                      </label>
                      <Field
                        type="text"
                        placeholder="Amount"
                        id="amount"
                        name="amount"
                        className="form-control"
                        onInput={(e: any) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          ); // Replaces any non-numeric characters with an empty string
                        }}
                      />
                      <ErrorMessage
                        name="amount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="currency" className="mb-1 form-label">
                        Currency
                      </label>
                      <Field
                        type="text"
                        //placeholder="Currency"
                        id="currency"
                        name="currency"
                        className="form-control"
                        value="SAR"
                        disabled
                      />
                      <ErrorMessage
                        name="currency"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end">
                    <button className="theme-btn-next" type="submit">
                      Create
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      <Modal
        size="lg"
        show={modalUpdate}
        onHide={() => {
          setModalUpdate(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Edit Voucher</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            voucherNo: editForm.voucherNo,
            applicationKey: editForm.applicationKey,
            voucherType: editForm.voucherType == "Receipt_Voucher" ? "1" : "2",
            date: editForm.date,
            description: editForm.description,
            debitAccount: editForm.debitAccount,
            creditAccount: editForm.creditAccount,
            amount: editForm.amount,
            currency: editForm.currency,
            approvalStatus: editForm.approvalStatus == "Pending" ? "1" : "0",
          }}
          enableReinitialize={true}
          onSubmit={updateSubmitForm}
          // validationSchema={validationSchema}
        >
          {({ setFieldValue }) => {
            return (
              <Form className="p-2">
                <Modal.Body>
                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="voucherNo" className="mb-1 form-label">
                        Voucher No.
                      </label>
                      <Field
                        type="text"
                        placeholder="1234567"
                        id="voucherNo"
                        name="voucherNo"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="voucherNo"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label
                        htmlFor="applicationKey"
                        className="mb-1 form-label"
                      >
                        Application Key
                      </label>
                      <Select
                        size="large"
                        value={editForm.applicationKey}
                        onChange={handleSelectChange}
                      >
                        {applications &&
                          applications.map((item: any) => (
                            <Select.Option
                              key={item.applicationId}
                              value={item.applicationId}
                            >
                              <div>{item.applicationKey}</div>
                            </Select.Option>
                          ))}
                      </Select>
                      <ErrorMessage
                        name="applicationKey"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="voucherType" className="mb-1 form-label">
                        Voucher Type
                      </label>
                      <Field
                        as="select"
                        id="voucherType"
                        name="voucherType"
                        className="form-control"
                      >
                        <option value={""}>Select</option>
                        <option value={"1"}>Receipt Voucher</option>
                        <option value={"2"}>Payment Voucher</option>
                      </Field>
                      <ErrorMessage
                        name="voucherType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="date" className="mb-1 form-label">
                        Date
                      </label>
                      <Field
                        type="date"
                        id="date"
                        name="date"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="date"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="description" className="mb-1 form-label">
                        Description
                      </label>
                      <Field
                        type="text"
                        placeholder="Placeholder"
                        id="description"
                        name="description"
                        className="form-control"
                        value={editForm.description}
                        onChange={(value: any) =>
                          setEditForm({
                            description: value,
                          })
                        }
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="debitAccount" className="mb-1 form-label">
                        Debit Account
                      </label>
                      <Select
                        //name="debitAccount"
                        id="debitAccount"
                        value={editForm.debitAccount}
                        placeholder="Select Debit Account"
                        onChange={(value) =>
                          setEditForm({
                            debitAccount: value,
                          })
                        }
                      >
                        {customerData.map((account: any) => (
                          <Select.Option key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountTitle}
                          </Select.Option>
                        ))}
                      </Select>
                      <ErrorMessage
                        name="debitAccount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label
                        htmlFor="creditAccount"
                        className="mb-1 form-label"
                      >
                        Credit Account
                      </label>
                      <Select
                        //name="creditAccount"
                        id="creditAccount"
                        value={editForm.creditAccount}
                        placeholder="Select Credit Account"
                        onChange={(value) =>
                          setEditForm({
                            creditAccount: value,
                          })
                        }
                      >
                        {allAccounts.map((account: any) => (
                          <Select.Option key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountTitle}
                          </Select.Option>
                        ))}
                      </Select>
                      <ErrorMessage
                        name="creditAccount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6}>
                      <label htmlFor="amount" className="mb-1 form-label">
                        Amount
                      </label>
                      <Field
                        type="text"
                        placeholder="Placeholder"
                        id="amount"
                        name="amount"
                        className="form-control"
                        onInput={(e: any) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                        }}
                        // onChange={(value: any) => setFieldValue("amount", value)}
                      />
                      <ErrorMessage
                        name="amount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md={6}>
                      <label htmlFor="currency" className="mb-1 form-label">
                        Currency
                      </label>
                      <Field
                        type="text"
                        placeholder="Placeholder"
                        id="currency"
                        name="currency"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="currency"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label
                        htmlFor="approvalStatus"
                        className="mb-1 form-label"
                      >
                        Approval Status
                      </label>
                      <Field
                        as="select"
                        id="approvalStatus"
                        name="approvalStatus"
                        className="form-control"
                        defaultValue="1"
                      >
                        <option value="">Select</option>
                        <option value="1">Approved</option>
                        <option value="0">Pending</option>
                      </Field>
                      <ErrorMessage
                        name="approvalStatus"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end">
                    <button className="theme-btn-next" type="submit">
                      Update
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      {/* <TableView /> */}
    </>
  );
};

export default Vouchers;
