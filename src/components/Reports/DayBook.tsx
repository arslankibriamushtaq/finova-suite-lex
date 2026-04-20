import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import TableView from "../TableView/TableView";
import { getDaybookReport } from "../../redux/apis/apisCrudLms";
import Loader from "../Loader/Loader";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const DayBook = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [dayData, setDayData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<any>(dayjs("2026-04-20"));

  useEffect(() => {
    getDayBookReprtData();
  }, [page, pageSize, date]);

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
      selector: (row: { voucherType: string }) => row.voucherType,
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
      selector: (row: { debit: number }) => row.debit?.toLocaleString() || "0",
    },
    {
      name: "Credit",
      selector: (row: { credit: number }) => row.credit?.toLocaleString() || "0",
    },
  ];

  const mappedData =
    dayData &&
    dayData.map((item: any, index: number) => {
      return {
        id: item.id || index,
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
      const res = await getDaybookReport(date.format("YYYY-MM-DD"));
      if (res?.data) {
        const responseData = res.data.success ? res.data.data : res.data;
        const items = Array.isArray(responseData) ? responseData : (responseData?.items || []);
        setDayData(items);
        
        const totalItems = res?.data?.pageInfo?.totalItems || items.length;
        setTotalRows(totalItems);

        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) { 
      console.error("Error fetching daybook:", error);
      toast.error(error?.message || "Failed to fetch daybook report");
      setDayData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Day Book</h3>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded border">
              <label className="mb-0 fw-bold text-muted small uppercase">Select Date:</label>
              <DatePicker 
                value={date} 
                onChange={(d) => setDate(d)} 
                format="YYYY-MM-DD"
                allowClear={false}
                bordered={false}
                className="p-0"
              />
            </div>
            <button 
              className="theme-btn-next px-4" 
              onClick={getDayBookReprtData} 
              disabled={loading}
              style={{ height: "42px" }}
            >
              {loading ? "Loading..." : "Refresh Report"}
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
