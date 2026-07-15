import React, { useState, useEffect } from "react";
import { Select, DatePicker } from "antd";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { getAccountLogs } from "../../redux/apis/apisCrudLms";
import { useTranslation } from "react-i18next";

const { Option } = Select;
const { RangePicker } = DatePicker;

const AccountLogs = () => {
  const { t } = useTranslation("customersB");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [voucherType, setVoucherType] = useState("");
  const [account, setAccount] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [accLogs, setAccLogs] = useState([]);

  const cusId = localStorage.getItem("selectedCustomerID");

  const getLogs = async () => {
    try {
      const res = await getAccountLogs(cusId, page, pageSize);
      const data = res.data.data;
      setAccLogs(data || []);
      setTotalRows(res?.data?.pageInfo?.totalItems || 0);
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  // Dummy Data
  useEffect(() => {
    getLogs();
  }, []);

  const Customer_ALL_List_Header = [
    {
      name: t("customersB:accountLogs.customerId"),
      selector: (row: { CustomerId: any }) => row.CustomerId,
    },
    {
      name: t("customersB:accountLogs.logId"),
      selector: (row: { LogId: any }) => row.LogId,
    },
    {
      name: t("customersB:accountLogs.eventType"),
      selector: (row: { EventType: any }) => row.EventType,
    },
    {
      name: t("customersB:accountLogs.timestamp"),
      selector: (row: { Timestamp: any }) => row.Timestamp,
    },
    {
      name: t("customersB:accountLogs.actionTakenBy"),
      selector: (row: { ActionTakenBy: any }) => row.ActionTakenBy,
    },
    {
      name: t("customersB:accountLogs.reasonRemarks"),
      selector: (row: { ReasonRemarks: any }) => row.ReasonRemarks,
    },
    {
      name: t("customersB:accountLogs.collateralId"),
      selector: (row: { CollateralId: any }) => row.CollateralId,
    },
    {
      name: t("common:amount"),
      selector: (row: { Amount: any }) => row.Amount,
    },
    {
      name: t("customersB:accountLogs.penaltyFee"),
      selector: (row: { PenaltyFee: any }) => row.PenaltyFee,
    },

    {
      name: t("common:status"),
      dataIndex: "Status",
      key: "Status",
      render: (text: any) => (
        <span
          className={
            text === t("common:completed") ? "status-completed" : "status-review"
          }
        >
          {text}
        </span>
      ),
    },
  ];

  const handleClearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setVoucherType("");
    setAccount("");
  };

  const handleExportCSV = () => {
    alert(t("customersB:accountLogs.exportComingSoon"));
  };

  const mappedData = accLogs && accLogs.map((item: any) => {
    return {
      CustomerId: item.CustomerId,
      LogId: item.LogId,
      EventType: item.EventType,
      Timestamp: item.Timestamp,
      ActionTakenBy: item.ActionTakenBy,
      ReasonRemarks: item.ReasonRemarks,
      CollateralId: item.CollateralId,
      Amount: item.Amount,
      PenaltyFee: item.PenaltyFee,
      Status: item.Status ? t("common:completed") : t("customersB:accountLogs.underReview"),
    };
  }) || [];

  return (
    <div>
      <div className="col-11 mb-4">
        <h3 style={{ marginLeft: "10px" }}>{t("customersB:accountLogs.title")}</h3>
      </div>
      <div className="d-flex col-12 align-items-center mb-3">
        {/* Filter Inputs */}
        <div className="col-10 d-flex align-items-center gap-3">
          <div>
            <p style={{ marginBottom: "4px" }}>{t("common:from")}</p>
            <input
              type="date"
              placeholder={t("common:select")}
              style={{
                height: "40px",
                width: "180px",
                padding: "0px 12px",
                borderRadius: "2px",
                border: "1px solid lightgray",
              }}
            />
          </div>
          <div>
            <p style={{ marginBottom: "4px" }}>{t("common:to")}</p>
            <input
              type="date"
              placeholder={t("common:select")}
              style={{
                height: "40px",
                width: "180px",
                padding: "0px 12px",
                borderRadius: "2px",
                border: "1px solid lightgray",
              }}
            />
          </div>
          {/* Voucher Type Select */}
          <div>
            <p style={{ marginBottom: "4px" }}>{t("customersB:accountLogs.voucherType")}</p>
            <Select
              placeholder={t("common:select")}
              value={voucherType}
              onChange={(value) => setVoucherType(value)}
              style={{
                height: "40px",
                width: "180px",
              }}
            >
              <Option value="">{t("common:all")}</Option>
              <Option value="voucher1">{t("customersB:accountLogs.voucher1")}</Option>
              <Option value="voucher2">{t("customersB:accountLogs.voucher2")}</Option>
            </Select>
          </div>
          {/* Account Select */}
          <div>
            <p style={{ marginBottom: "4px" }}>{t("customersB:accountLogs.account")}</p>
            <Select
              placeholder={t("common:select")}
              value={account}
              onChange={(value) => setAccount(value)}
              style={{
                height: "40px",
                width: "180px",
              }}
            >
              <Option value="">{t("common:all")}</Option>
              <Option value="account1">{t("customersB:accountLogs.account1")}</Option>
              <Option value="account2">{t("customersB:accountLogs.account2")}</Option>
            </Select>
          </div>
          {/* Clear Button */}
          <button
            style={{
              backgroundColor: "var(--color-status-dark)",
              color: "var(--primary-foreground)",
              height: "40px",
              padding: "0px 14px",
              borderRadius: "2px",
              border: "transparent",
              marginTop: "22px",
            }}
            onClick={handleClearFilters}
          >
            {t("common:clear")}
          </button>
        </div>
        {/* Export CSV Button */}
        <div className="d-flex justify-content-end col-2">
          <button
            style={{
              backgroundColor: "var(--color-status-dark)",
              color: "var(--primary-foreground)",
              height: "40px",
              padding: "0px 14px",
              borderRadius: "2px",
              border: "transparent",
              marginLeft: "auto",
              marginTop: "22px",
              alignSelf: "flex-end",
            }}
            onClick={handleExportCSV}
          >
            {t("customersB:accountLogs.exportCsv")}
          </button>
        </div>
      </div>
      <div className="cs-table p-2">
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

export default AccountLogs;
