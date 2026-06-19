import { useState, useEffect } from "react";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getAllApis } from "../../redux/apis/apisThirdParty";

const AllEnvironment = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const AllEnvironment_Headers = [
    {
      name: "ID",
      selector: (row: { id: any }) => row.id,
      sortable: true,
      width: "100px",
    },
    {
      name: "API Name",
      selector: (row: { apiName: any }) => row.apiName,
      sortable: true,
    },
    {
      name: "Service Name",
      selector: (row: { serviceName: any }) => row.serviceName,
      sortable: true,
    },
    /* {
      name: "Environment",
      selector: (row: { environment: any }) => row.environment || "-",
      sortable: true,
    },
    {
      name: "URL",
      selector: (row: { url: any }) => row.url,
      sortable: true,
      width: "300px",
    },
    {
      name: "Method",
      selector: (row: { method: any }) => row.method,
      sortable: true,
      width: "120px",
    }, */
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "2px",
            backgroundColor: row.status === "Active" || row.status === 1 ? "var(--color-success)" : "var(--color-error)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status === "Active" || row.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
    },
  ];

  useEffect(() => {
    fetchAllApis();
  }, [page, pageSize]);

  const fetchAllApis = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getAllApis();
      
      if (response?.data?.success) {
        const responseData = response.data.data;
        
        // Handle different response structures
        let apisArray: any[] = [];
        if (Array.isArray(responseData)) {
          apisArray = responseData;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          apisArray = responseData.data;
        } else if (responseData?.apis && Array.isArray(responseData.apis)) {
          apisArray = responseData.apis;
        } else {
          apisArray = [];
        }

        setData(apisArray);
        setTotalRows(apisArray.length || 0);
        setFrom(apisArray.length > 0 ? 1 : 0);
        setTo(apisArray.length || 0);
        setPage(1);
        setTotalPage(1);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch APIs");
      setSkelitonLoading(false);
    }
  };

  const mappedData = data?.map((item: any) => ({
    id: item?.id || "-",
    apiName: item?.name || item?.api_name || "-",
    serviceName: item?.service?.name || item?.service_name || "-",
    environment: item?.env || item?.environment || "-",
    url: item?.url || "-",
    method: item?.method || "-",
    status: item?.status || "Inactive",
  }));

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>All Environment</h2>
      </div>
      <TableView
        header={AllEnvironment_Headers}
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
  );
};

export default AllEnvironment;
