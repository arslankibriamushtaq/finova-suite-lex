import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getWriteOffLoansReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
const WriteOff = () => {
  const [period, setPeriod] = useState<any>(null);
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [editForm, setEditForm] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [loading, setLoading] = useState(false);
  const id = useParams();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const finalPeriod = period ? period.format("YYYY-MM") : dayjs().format("YYYY-MM");
      const res = await getWriteOffLoansReport(finalPeriod);
      if (res) {
        const data = res.data.data?.items;
        setAllCallActivity(Array.isArray(data) ? data : []);

        const totalItems = Array.isArray(data) ? data.length : 0;
        setTotalRows(totalItems);

        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) {
      console.error("Error fetching write off loans:", error);
      toast.error(error?.message || "Failed to fetch write off loans");
      setAllCallActivity([]);
      setTotalRows(0);
      setFrom(0);
      setTo(0);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const mappedData = useMemo(() => {
    return (Array.isArray(allCallActivity) ? allCallActivity : []).map((item: any) => {
      return {
        loanId: item.loanId || "-",
        customerId: item.customerId || "-",
        facilityType: item.facilityType || "-",
        writeOffAmount: item.writeOffAmount != null ? `${item.writeOffAmount} SAR` : "-",
        paymentStatus: item.paymentStatus || "-",
        writeOffDate: item.writeOffDate ? formatDate(item.writeOffDate) : "-",
      };
    });
  }, [allCallActivity]);

  useEffect(() => {
    handleSubmit();
  }, [id, page, pageSize]);
  const Call_Activity_Header = [
    // {
    //   name: "Loan ID",
    //   selector: (row: any) => row.loanId,
    //   width: "250px"
    // },
    // {
    //   name: "Customer ID",
    //   selector: (row: any) => row.customerId,
    //   width: "250px"
    // },
    {
      name: "Facility Type",
      selector: (row: any) => row.facilityType,
    },
    {
      name: "Write Off Amount",
      selector: (row: any) => row.writeOffAmount,
    },
    {
      name: "Payment Status",
      selector: (row: any) => row.paymentStatus,
    },
    {
      name: "Write Off Date",
      selector: (row: any) => row.writeOffDate,
    },
  ];

  useEffect(() => {
    handleSubmit();
  }, [period]);
  const exportToCSV = (data: any[], fileName: string) => {
    const csvRows = [];
    const headers = Object.keys(data[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    // Create CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob from the CSV string and trigger a download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };
  // handleFromDateChange and handleToDateChange removed as they are no longer needed


  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h5 className="mb-0">Write Off Loan</h5>
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
            <div className="col-md-6">
              <label className="form-label">Period</label>
              <DatePicker
                picker="month"
                value={period}
                onChange={(date) => setPeriod(date)}
                format="YYYY-MM"
              />
            </div>
          </div>
          <div className="col-md-3 mt-3">
            {/* <button
              className="mt-2 theme-btn-next bg-dark"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </button> */}
          </div>
          <div className="col-2 text-end">
            <button
              className="mt-4 invoice-btn bg-dark text-white"
              onClick={() => {
                exportToCSV(allCallActivity, "OverDueLoans");
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            from={from}
            to={to}
            header={Call_Activity_Header}
            data={mappedData}
            isLoading={loading}
          />
        </div>
      </div>

      {/* <TableView /> */}
    </>
  );
};

export default WriteOff;
