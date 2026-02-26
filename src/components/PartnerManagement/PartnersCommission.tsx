import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { getPartnerCommissions } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";

const PartnersCommission = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);

  const Activity_Loans_Header = [
    {
      name: "Application No.",
      selector: (row: { application_no: any }) => row.application_no || "-",
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: (row: { customer_name: any }) => row.customer_name || "-",
      sortable: true,
    },
    {
      name: "Product",
      selector: (row: { product: any }) => row.product || "-",
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row: { amount: any }) => row.amount || "-",
      sortable: true,
    },
    {
      name: "Commission",
      selector: (row: { commission: any }) => row.commission || "-",
      sortable: true,
    },
    {
      name: "Date",
      selector: (row: { date: any }) => row.date || "-",
      sortable: true,
    },
  ];

  useEffect(() => {
    getCommissionData();
  }, [page, pageSize]);

  const getCommissionData = async () => {
    setLoading(true);
    setSkelitonLoading(true);
    try {
      // Can pass partner_id if needed, otherwise fetches default
      const response = await getPartnerCommissions();
      if (response?.data?.success) {
        const commissionData = response?.data?.data?.disbursed_loan_applications || [];
        setData(commissionData);
        setTotalRows(commissionData.length || 0);
        setFrom(1);
        setTo(commissionData.length || 0);
        setPage(1);
        setTotalPage(Math.ceil(commissionData.length / pageSize) || 1);
        
        // Set metrics
        setTotalApplications(response?.data?.data?.application_count || 0);
        setTotalCommission(response?.data?.data?.commission_sum || 0);
      } else {
        toast.error(response?.data?.message || "Failed to fetch commission data");
      }
    } catch (error: any) {
      console.error("Error fetching commission data:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch commission data");
    } finally {
      setSkelitonLoading(false);
      setLoading(false);
    }
  };

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        application_no: item?.application_no || "-",
        customer_name: item?.customer_name || "-",
        product: item?.product || "-",
        amount: item?.amount || "-",
        commission: item?.commission || "-",
        date: item?.date || "-",
      };
    });

  return (
    <>
      {loading ? <Loader /> : (
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "10px" }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 style={{ margin: 0, fontWeight: 600 }}>All Partners</h4>
        </div>

        {/* Overview Section */}
        <h5 style={{ marginBottom: "1.5rem", fontWeight: 600 }}>Overview</h5>

        {/* Metrics Cards */}
        <div className="row mb-4">
          {/* Total Applied Applications */}
          <div className="col-md-6 mb-3">
            <div
              style={{
                background: "#f8f9fa",
                padding: "1.5rem",
                borderRadius: "8px",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
                Total Applied Applications
              </p>
              <h2 style={{ margin: "0.5rem 0 0 0", fontWeight: 700 }}>
                {totalApplications}
              </h2>
            </div>
          </div>

          {/* Total Commission */}
          <div className="col-md-6 mb-3">
            <div
              style={{
                background: "#5a6268",
                padding: "1.5rem",
                borderRadius: "8px",
                color: "white",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#e9ecef" }}>
                Total Commission
              </p>
              <h2 style={{ margin: "0.5rem 0 0 0", fontWeight: 700 }}>
                {totalCommission.toFixed(2)}
              </h2>
            </div>
          </div>
        </div>

        {/* Table */}
        <TableView
          header={Activity_Loans_Header}
          data={mappedData}
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />
      </div>
      )}
    </>
  );
};

export default PartnersCommission;
