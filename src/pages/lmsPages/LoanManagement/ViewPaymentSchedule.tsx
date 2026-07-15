import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input, Button, Dropdown, Menu } from "antd";
import { CalendarDays } from "lucide-react";
import TableView from "../../../components/TableView/TableView";
import { useNavigate, useParams } from "react-router-dom";
import { DownOutlined, EyeOutlined } from "@ant-design/icons";
import {
  getAllInvoiceList,
  getLoanPaymentSchedule,
} from "../../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

const LoanPaymentSchedule = () => {
  const { t } = useTranslation("loanManagement");
  const [pageSize, setPageSize] = useState(40);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [frozenColumns, setFrozenColumns] = useState<string[]>([]);
  const [allinvoiceList, setAllinvoiceList] = useState([]);

  const navigate = useNavigate();
  const id = useParams();

  const [loader, setLoader] = useState<boolean>(false);
  const individualCustomer = async () => {
    try {
      setLoader(true);
      const res = await getAllInvoiceList(id?.id, page);
      if (res) {
        const value = res.data.data;
        setAllinvoiceList(value || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    individualCustomer();
  }, []);

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

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => {
          navigate(`/lms/loanmanagement/generateInvoice/${row.invoiceId}`);
        }}
      >
        {t("common:viewDetails")}
      </Menu.Item>
    </Menu>
  );

  const Customer_ALL_List_Header = [
    {
      name: t("paymentSchedule.colInvoiceNo"),
      selector: (row: any) => row.invoiceNumber,
      frozen: frozenColumns.includes("Invoice No"),
    },
    {
      name: t("field.customerName"),
      selector: (row: any) => row.billingTo, // Assuming billingTo is the customer name
    },

    {
      name: t("paymentSchedule.colInvoiceDate"),
      selector: (row: any) => new Date(row.invoiceDate).toLocaleDateString(),
      frozen: frozenColumns.includes("Invoice Date"),
    },
    {
      name: t("paymentSchedule.colDueDate"),
      selector: (row: any) => new Date(row.dueDate).toLocaleDateString(),
      frozen: frozenColumns.includes("Due Date"),
    },
    {
      name: t("common:total"),
      selector: (row: any) => row.totalAmount, // Assuming totalAmount is the total
      cell: (row: any) => <div>SAR {row?.totalAmount}</div>,
    },
    {
      name: t("paymentSchedule.colPayableStatus"),
      selector: (row: any) => row.payableStatus, // Assuming payableStatus holds "Early Settlement" or "Due Loans"
      cell: (row: any) => (
        <div
          onClick={() => {
          }}
        >
          {row.payableStatus === 0
            ? t("paymentSchedule.payableEarlySettlement")
            : row.payableStatus === 1
              ? t("paymentSchedule.payableDueLoan")
              : row.payableStatus === 2
                ? t("paymentSchedule.payableOverdue")
                : row.payableStatus === 3
                  ? t("paymentSchedule.payableNonPerforming")
                  : row.payableStatus === 4
                    ? t("paymentSchedule.payableWriteOff")
                    : t("paymentSchedule.payableBrokenPromise")}
        </div>
      ),
    },
    {
      name: t("paymentSchedule.colPaymentStatus"),
      selector: (row: any) => row.paymentStatus, // Assuming 'status' for active/inactive
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "2px",
            backgroundColor: row.paymentStatus === 1 ? "var(--color-status-green)" : "var(--color-status-red-soft)",
            color: "white",
          }}
        >
          {row.paymentStatus === 1 ? t("paymentSchedule.paid") : t("paymentSchedule.unpaid")}
        </div>
      ),
    },
    {
      name: t("common:actions"),

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("applications.select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mappedData =
    allinvoiceList &&
    allinvoiceList.map((item: any) => {
      return {
        accountNumber: item.result.accountNumber,
        applicationID: item.result.applicationID,
        invoiceLogo: item.invoiceLogo,
        invoiceNumber: item.result.invoiceNumber,
        from: item.from,
        billingTo: item.result.billingTo || "-",
        shipTo: item.shipTo,
        dueDate: formatDate(item.result.dueDate),
        invoiceDate: formatDate(item.result.invoiceDate),
        poNumber: item.poNumber,
        subTotalAmount: item.result.subTotalAmount,
        totalAmount: item.result.totalAmount,
        tax: item.result.tax,
        shipping: item.shipping,
        discount: item.discount,
        notes: item.notes,
        terms: item.terms,
        payableStatus: item.result.payableStatus,
        paymentTerms: item.result.paymentTerms,
        paymentStatus: item.result.paymentStatus,
        id: item.id,
        created: item.result.created,
        invoiceId:
          item?.result?.invoiceDiscriptions?.invoiceID || item?.result?.id,
        accountId: item?.result?.accountId,
        // CustomerID: item.customerId,
        // IndividualId: item.individualId,
        // Name: item.name,
        // Relation: getReasonDescriptionById(item.relationId),
        // SSN: item.ssn,
        // NationalId: item.nationalId,
        // NIDIssueDate: formatDate(item.nationalIdIssuanceDate),
        // NIDExpiry: formatDate(item.nidExpiryDate),
        // DOB: formatDate(item.dob),
        // Gender: getGenderLabel(item.gender),
        // Email: item.email,
        // status: item.paymentStatus,
      };
    });

  return (
    <div className="service loan-payment-schedule-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <CalendarDays className="h-4 w-4" />
          </span>
          {t("paymentSchedule.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 w-100">
          <Button
            style={{ borderRadius: 2, border: "transparent", height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            className="application-btn"
            onClick={() => navigate("/lms/LoanManagement/ApplicationManagement")}
          >
            {t("paymentSchedule.backToApplications")}
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="pro-card"
      >
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Customer_ALL_List_Header}
          data={mappedData}
        />
      </div>
    </div>
  );
};

export default LoanPaymentSchedule;
