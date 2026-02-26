import React, { useState, useEffect } from "react";
import { Select, DatePicker } from "antd";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { getAccountLogs } from "../../redux/apis/apisCrudLms";

const { Option } = Select;
const { RangePicker } = DatePicker;

const AccountLogs = () => {
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
      name: "Customer ID",
      selector: (row: { CustomerId: any }) => row.CustomerId,
    },
    {
      name: "Log ID",
      selector: (row: { LogId: any }) => row.LogId,
    },
    {
      name: "Event Type",
      selector: (row: { EventType: any }) => row.EventType,
    },
    {
      name: "Timestamp",
      selector: (row: { Timestamp: any }) => row.Timestamp,
    },
    {
      name: "Action TakenBy",
      selector: (row: { ActionTakenBy: any }) => row.ActionTakenBy,
    },
    {
      name: "Reason/Remarks",
      selector: (row: { ReasonRemarks: any }) => row.ReasonRemarks,
    },
    {
      name: "Collateral ID",
      selector: (row: { CollateralId: any }) => row.CollateralId,
    },
    {
      name: "Amount",
      selector: (row: { Amount: any }) => row.Amount,
    },
    {
      name: "Penalty Fee",
      selector: (row: { PenaltyFee: any }) => row.PenaltyFee,
    },

    {
      name: "Status",
      dataIndex: "Status",
      key: "Status",
      render: (text: any) => (
        <span
          className={
            text === "Completed" ? "status-completed" : "status-review"
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
    alert("Export CSV Functionality Coming Soon!");
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
      Status: item.Status ? "Completed" : "Under Review",
    };
  }) || [];

  return (
    <div>
      <div className="col-11 mb-4">
        <h3 style={{ marginLeft: "10px" }}>Account Logs</h3>
      </div>
      <div className="d-flex col-12 align-items-center mb-3">
        {/* Filter Inputs */}
        <div className="col-10 d-flex align-items-center gap-3">
          <div>
            <p style={{ marginBottom: "4px" }}>From</p>
            <input
              type="date"
              placeholder="Select"
              style={{
                height: "40px",
                width: "180px",
                padding: "0px 12px",
                borderRadius: "4px",
                border: "1px solid lightgray",
              }}
            />
          </div>
          <div>
            <p style={{ marginBottom: "4px" }}>To</p>
            <input
              type="date"
              placeholder="Select"
              style={{
                height: "40px",
                width: "180px",
                padding: "0px 12px",
                borderRadius: "4px",
                border: "1px solid lightgray",
              }}
            />
          </div>
          {/* Voucher Type Select */}
          <div>
            <p style={{ marginBottom: "4px" }}>Voucher Type</p>
            <Select
              placeholder="Select"
              value={voucherType}
              onChange={(value) => setVoucherType(value)}
              style={{
                height: "40px",
                width: "180px",
              }}
            >
              <Option value="">All</Option>
              <Option value="voucher1">Voucher 1</Option>
              <Option value="voucher2">Voucher 2</Option>
            </Select>
          </div>
          {/* Account Select */}
          <div>
            <p style={{ marginBottom: "4px" }}>Account</p>
            <Select
              placeholder="Select"
              value={account}
              onChange={(value) => setAccount(value)}
              style={{
                height: "40px",
                width: "180px",
              }}
            >
              <Option value="">All</Option>
              <Option value="account1">Account 1</Option>
              <Option value="account2">Account 2</Option>
            </Select>
          </div>
          {/* Clear Button */}
          <button
            style={{
              backgroundColor: "#363435",
              color: "#ffffff",
              height: "40px",
              padding: "0px 14px",
              borderRadius: "4px",
              border: "transparent",
              marginTop: "22px",
            }}
            onClick={handleClearFilters}
          >
            Clear
          </button>
        </div>
        {/* Export CSV Button */}
        <div className="d-flex justify-content-end col-2">
          <button
            style={{
              backgroundColor: "#363435",
              color: "#ffffff",
              height: "40px",
              padding: "0px 14px",
              borderRadius: "4px",
              border: "transparent",
              marginLeft: "auto",
              marginTop: "22px",
              alignSelf: "flex-end",
            }}
            onClick={handleExportCSV}
          >
            Export CSV
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
