import { useEffect, useState } from "react";

import { DatePicker } from "antd";
import TableView from "../TableView/TableView";
import { getDayBookReport } from "../../redux/apis/apisCrudLms";
import Loader from "../Loader/Loader";
const DayBook = () => {
  const [modal, setModal] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [dayData, setDayData] = useState<any>("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getDayBookReprtData();
  }, [page, pageSize]);

  const getAllDaybookReport = [
    {
      name: "Transaction Date",
      selector: (row: { transactionDate: string }) => row.transactionDate,
    },
    {
      name: "Voucher No",
      selector: (row: { voucherNo: string }) => row.voucherNo,
    },
    {
      name: "Voucher Type",
      selector: (row: { voucherType: number }) => row.voucherType,
    },
    {
      name: "Account",
      selector: (row: { account: string }) => row.account,
    },
    {
      name: "Application No",
      selector: (row: { applicationNo: string }) => row.applicationNo,
    },
    {
      name: "Ledger Name",
      selector: (row: { ledgerName: string }) => row.ledgerName,
    },
    {
      name: "Debit",
      selector: (row: { debit: number }) => row.debit,
    },
    {
      name: "Credit",
      selector: (row: { credit: number }) => row.credit,
    },
  ];

  const mappedData =
    dayData &&
    dayData.map((item: any) => {
      return {
        id: item.id,
        transactionDate: item.transactionDate,
        voucherNo: item.voucherNo,
        voucherType: item.voucherType,
        account: item.account,
        applicationId: item.applicationId,
        applicationNo: item.applicationNo,
        ledgerName: item.ledgerName,
        debit: item.debit,
        credit: item.credit,
      };
    });

  const getDayBookReprtData = async () => {
    try {
      setLoading(true);
      const resposne = await getDayBookReport(page, pageSize);
      if (resposne) {
        const data = resposne.data.data;
        const totalItems = resposne?.data?.pageInfo?.totalItems || 0;
        setTotalRows(totalItems);

        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);

        setDayData(data);
      }
    } catch (error: any) { 
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h5 className="mb-0">Day Book</h5>
          </div>
          {/* <div className="col-2 text-end">
            <button
              className="theme-btn-next"
              onClick={() => {
                setModal(true);
              }}
            >
              Create Voucher
            </button>
          </div> */}
        </div>
        <div className="d-flex mt-3 justify-content-between align-items-center">
          <div className="row align-items-center">
            {/* From Date */}
            <div className="col-md-4">
              <label htmlFor="fromDate" className="form-label">
                From
              </label>
              <DatePicker />
            </div>

            {/* To Date */}
            <div className="col-md-4">
              <label htmlFor="toDate" className="form-label">
                To
              </label>
              <DatePicker />
            </div>

            {/* Voucher Type Select */}
            <div className="col-md-3">
              {/* <label htmlFor="voucherType" className="form-label">
                Voucher Type
              </label>
              <Select id="voucherType" /> */}
            </div>

            {/* Account Select */}
            <div className="col-md-3">
              {/* <label htmlFor="account" className="form-label">
                Account
              </label>
              <Select id="account" /> */}
            </div>
          </div>

          <div className="col-2 text-end">
            <button
              className="invoice-btn bg-dark text-white"
              onClick={() => {
                setModal(true);
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
      <div className="cs-table p-2">
        <TableView
          header={getAllDaybookReport}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          data={mappedData}
          isLoading={loading}
        />
      </div>
    </>
  );
};

export default DayBook;
