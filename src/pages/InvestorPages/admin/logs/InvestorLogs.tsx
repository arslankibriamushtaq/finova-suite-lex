import { useState, useEffect } from "react";
import TableView from "../../../../components/TableView/TableView";
import Loader from "../../../../components/Loader/Loader";
import { getAllLogs } from "../../../../redux/apis/apisInvestor";
import toast from "react-hot-toast";

const InvestorLogs = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [allLogsData, setAllLogsData] = useState<any>([]);

  useEffect(() => {
    getLogsList();
  }, [page, pageSize]);

  useEffect(() => {
    getAllLogsForSummary();
  }, []);

  // Fetch all logs for summary calculations
  const getAllLogsForSummary = async () => {
    try {
      const response = await getAllLogs(1, 1000); // Fetch large number for summary
      if (response?.success) {
        const hits = response?.data?.hits?.hits || [];
        setAllLogsData(hits);
      }
    } catch (error: any) {
      console.error("Error fetching logs for summary:", error);
    }
  };

  const getLogsList = async () => {
    try {
      setLoading(true);
      const response = await getAllLogs(page, pageSize);
      
      
      if (response?.success) {
        // Handle Elasticsearch response structure
        const hits = response?.data?.hits?.hits || [];
        const totalCount = response?.data?.hits?.total?.value || 0;
        
        
        // Map the Elasticsearch hits to display format
        const mappedData = hits.map((hit: any, index: number) => {
          const source = hit._source || {};
          const context = source.context || {};
          const request = context.request || {};
          const response = context.response || {};
          
          return {
            id: hit._id || `log-${index}`,
            sr: (page - 1) * pageSize + index + 1,
            action: source.message || "-",
            level: source.level || "-",
            channel: source.channel || "-",
            message: source.message || "-",
            timestamp: source.timestamp || source["@timestamp"] || "-",
            traceId: source.trace_id || source.traceId || "-",
            transactionId: source.transaction_id || "-",
            createdAt: source.timestamp || source["@timestamp"] || "-",
            // Request data
            investorId: request.InvestorId || request.investorId || "-",
            investmentId: request.InvesmentId || request.invesmentId || request.investmentId || "-",
            returnAmount: request.ReturnAmount !== undefined ? request.ReturnAmount : (request.returnAmount !== undefined ? request.returnAmount : "-"),
            netReturnAmount: request.NetReturnAmount !== undefined ? request.NetReturnAmount : (request.netReturnAmount !== undefined ? request.netReturnAmount : "-"),
            returnType: request.ReturnType || request.returnType || "-",
            roiRate: request.RoiRate !== undefined ? request.RoiRate : (request.roiRate !== undefined ? request.roiRate : "-"),
            returnStatus: request.ReturnStatus || request.returnStatus || "-",
            returnNotes: request.ReturnNotes || request.returnNotes || "-",
            calculatedDate: request.CalculatedDate || request.calculatedDate || "-",
            approvedDate: request.ApprovedDate || request.approvedDate || "-",
            paidDate: request.PaidDate || request.paidDate || "-",
            taxWithHeld: request.TaxWithHeld !== undefined ? request.TaxWithHeld : (request.taxWithHeld !== undefined ? request.taxWithHeld : "-"),
            taxRate: request.TaxRate !== undefined ? request.TaxRate : (request.taxRate !== undefined ? request.taxRate : "-"),
            // Response data
            responseSuccess: response.success !== undefined ? response.success : "-",
            responseCode: response.responseCode || response.responseCode || "-",
            responseMessage: response.notificationMessage || response.message || "-",
            referenceNo: response.data?.referenceNo || request.referenceNo || "-",
            // Other request fields
            name: request.name || "-",
            code: request.code || "-",
            countryId: request.countryId || "-",
            // Full context for details
            context: context,
            fullSource: source,
          };
        });
        
        setData(mappedData);
        setTotalRows(totalCount);
        setFrom((page - 1) * pageSize + 1);
        setTo(Math.min(page * pageSize, totalCount));
        setTotalPage(Math.ceil(totalCount / pageSize));
      } else {
        const errorMessage = response?.notificationMessage || response?.errors?.[0] || "Failed to fetch logs";
        toast.error(errorMessage);
        setData([]);
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      const errorMessage = error?.notificationMessage || error?.message || "Failed to fetch logs";
      toast.error(errorMessage);
      setLoading(false);
      setData([]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    let totalReturnAmount = 0;
    let totalNetReturnAmount = 0;
    let returnCount = 0;

    allLogsData.forEach((hit: any) => {
      const source = hit._source || {};
      const context = source.context || {};
      const request = context.request || {};
      
      if (request.ReturnAmount !== undefined && request.ReturnAmount !== null) {
        totalReturnAmount += parseFloat(request.ReturnAmount) || 0;
        returnCount++;
      }
      
      if (request.NetReturnAmount !== undefined && request.NetReturnAmount !== null) {
        totalNetReturnAmount += parseFloat(request.NetReturnAmount) || 0;
      }
    });

    return {
      totalLogs: totalRows,
      totalReturnAmount: totalReturnAmount.toFixed(2),
      totalNetReturnAmount: totalNetReturnAmount.toFixed(2),
      returnCount: returnCount,
      averageReturnAmount: returnCount > 0 ? (totalReturnAmount / returnCount).toFixed(2) : 0,
    };
  };

  const summary = calculateSummary();

  const Headers = [
    {
      name: "Sr",
      selector: (row: any) => row.sr || "-",
      sortable: true,
      width: "60px",
    },
    {
      name: "Level",
      selector: (row: any) => row.level || "-",
      sortable: true,
      width: "80px",
    },
    {
      name: "Message",
      selector: (row: any) => row.message || "-",
      sortable: true,
      width: "250px",
    },
    {
      name: "Channel",
      selector: (row: any) => row.channel || "-",
      sortable: true,
      width: "120px",
    },

    {
      name: "Return Amount",
      selector: (row: any) => row.returnAmount !== "-" ? row.returnAmount.toLocaleString() : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Net Return Amount",
      selector: (row: any) => row.netReturnAmount !== "-" ? row.netReturnAmount.toLocaleString() : "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Return Type",
      selector: (row: any) => row.returnType || "-",
      sortable: true,
      width: "100px",
    },
    {
      name: "ROI Rate",
      selector: (row: any) => row.roiRate !== "-" ? `${row.roiRate}%` : "-",
      sortable: true,
      width: "100px",
    },
    {
      name: "Return Status",
      selector: (row: any) => row.returnStatus || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Reference No",
      selector: (row: any) => row.referenceNo || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Calculated Date",
      selector: (row: any) => row.calculatedDate !== "-" ? formatDate(row.calculatedDate) : "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Approved Date",
      selector: (row: any) => row.approvedDate !== "-" ? formatDate(row.approvedDate) : "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Paid Date",
      selector: (row: any) => row.paidDate !== "-" ? formatDate(row.paidDate) : "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Tax Withheld",
      selector: (row: any) => row.taxWithHeld !== "-" ? row.taxWithHeld.toLocaleString() : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Tax Rate",
      selector: (row: any) => row.taxRate !== "-" ? `${row.taxRate}%` : "-",
      sortable: true,
      width: "100px",
    },
    {
      name: "Trace ID",
      selector: (row: any) => row.traceId || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Transaction ID",
      selector: (row: any) => row.transactionId || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Created At",
      selector: (row: any) => formatDate(row.createdAt),
      sortable: true,
      width: "180px",
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="service">
      <h2 className="mb-3 mt-2 d-flex justify-content-start">Logs</h2>
      
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="bg-white border rounded p-4 shadow-sm">
            <h6 className="mb-2 text-black">Total Logs</h6>
            <h3 className="mb-0 text-black">{summary.totalLogs.toLocaleString()}</h3>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="bg-white border rounded p-4 shadow-sm">
            <h6 className="mb-2 text-black">Total Return Amount</h6>
            <h3 className="mb-0 text-black">{summary.totalReturnAmount}</h3>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="bg-white border rounded p-4 shadow-sm">
            <h6 className="mb-2 text-black">Total Net Return Amount</h6>
            <h3 className="mb-0 text-black">{summary.totalNetReturnAmount}</h3>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="bg-white border rounded p-4 shadow-sm">
            <h6 className="mb-2 text-black">Average Return Amount</h6>
            <h3 className="mb-0 text-black">{summary.averageReturnAmount}</h3>
          </div>
        </div>
      </div>

      <TableView
        header={Headers}
        data={data}
        totalRows={totalRows}
        isLoading={loading}
        from={from}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />
    </div>
  );
};

export default InvestorLogs;
