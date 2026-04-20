import React, { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import toast from "react-hot-toast";
import { getNplReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";

import { FaMoneyBillWave, FaChartBar, FaPercentage } from "react-icons/fa";

const PerformingLoans = () => {
  const [asOfDate, setAsOfDate] = useState<any>(dayjs("2026-03-30"));
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await getNplReport(asOfDate.format("YYYY-MM-DD"));
      if (res && res.data) {
        setReportData(res.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching NPL report:", error);
      toast.error(error?.message || "Failed to fetch NPL report");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const buckets = useMemo(() => {
    return reportData?.buckets || [];
  }, [reportData]);

  useEffect(() => {
    if (asOfDate) {
      handleSubmit();
    }
  }, [asOfDate]);

  const columns = [
    {
      name: "Aging Bucket (Days)",
      selector: (row: any) => row.bucket,
      sortable: true,
    },
    {
      name: "Outstanding Amount (SAR)",
      selector: (row: any) => row.outstanding?.toLocaleString() || "0",
      sortable: true,
    },
  ];

  return (
    <div className="p-3">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Non-performing Loan Summary</h3>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded border">
              <label className="mb-0 fw-bold text-muted small uppercase">As Of Date:</label>
              <DatePicker
                value={asOfDate}
                onChange={(date) => setAsOfDate(date)}
                format="YYYY-MM-DD"
                allowClear={false}
                bordered={false}
                className="p-0"
              />
            </div>
            <button
              className="theme-btn-next px-4"
              onClick={handleSubmit}
              disabled={loading}
              style={{ height: "42px" }}
            >
              {loading ? "Loading..." : "Refresh Report"}
            </button>
          </div>
        </div>

        {reportData && (
          <div className="row mb-4 g-3">
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small fw-bold mb-1">Total Outstanding</div>
                    <div className="h3 mb-0 fw-bold text-black">{reportData.totalOutstanding?.toLocaleString()} <span className="small text-muted">SAR</span></div>
                  </div>
                  <div className="h3 text-muted opacity-50 mb-0">
                    <FaMoneyBillWave />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small fw-bold mb-1">NPL Outstanding</div>
                    <div className="h3 mb-0 fw-bold text-black">{reportData.nplOutstanding?.toLocaleString()} <span className="small text-muted">SAR</span></div>
                  </div>
                  <div className="h3 text-muted opacity-50 mb-0">
                    <FaChartBar />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small fw-bold mb-1">NPL Ratio</div>
                    <div className="h3 mb-0 fw-bold text-black">{reportData.nplRatio}%</div>
                  </div>
                  <div className="h3 text-muted opacity-50 mb-0">
                    <FaPercentage />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="cs-table p-0 bg-white rounded shadow-sm overflow-hidden">
          <TableView
            header={columns}
            data={buckets}
            isLoading={loading}
            totalRows={buckets.length}
            pageSize={buckets.length || 10}
            page={1}
            setPage={() => { }}
            setPageSize={() => { }}
            from={buckets.length > 0 ? 1 : 0}
            to={buckets.length}
          />
        </div>
      </div>
    </div>
  );
};


export default PerformingLoans;
