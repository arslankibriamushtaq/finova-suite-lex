import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { getFactors } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

const FactorsList = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const Factors_Header = [
    {
      name: "ID",
      selector: (row: { id: any }) => row.id || "-",
      sortable: true,
      width: "80px",
    },
    {
      name: "Factors",
      selector: (row: { factors: any }) => row.factors || "-",
      sortable: true,
    },
    {
      name: "Factor Weight",
      selector: (row: { factor_weight: any }) => row.factor_weight ?? "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor:
              row.status === true
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === false
                ? "#BC3D3F"
                : "#FF9811",
            color: "white",
            display: "inline-block",
            fontWeight: "500",
          }}
        >
          {row.status === true ? "Active" : "Inactive"}
        </div>
      ),
      width: "120px",
    },
    {
      name: "Created At",
      cell: (row: any) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString()
          : "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Updated At",
      cell: (row: any) =>
        row.updated_at
          ? new Date(row.updated_at).toLocaleDateString()
          : "-",
      sortable: true,
      width: "150px",
    },
  ];

  useEffect(() => {
    getFactorsList();
  }, [page, pageSize]);

  const getFactorsList = async () => {
    setSkelitonLoading(true);
    try {
      const response = await getFactors(page, pageSize);
      if (response?.data?.success) {
        const paginationData = response?.data?.data;
        const factorsData = paginationData?.data || [];
        
        // Extract pagination info from response.data.data
        if (paginationData) {
          setTotalRows(paginationData.total || 0);
          setFrom(paginationData.from || 0);
          setTo(paginationData.to || 0);
          setTotalPage(paginationData.last_page || 1);
        } else {
          // Fallback if no pagination info
          setTotalRows(factorsData.length);
          setFrom(factorsData.length > 0 ? (page - 1) * pageSize + 1 : 0);
          setTo(Math.min(page * pageSize, factorsData.length));
          setTotalPage(Math.ceil(factorsData.length / pageSize) || 1);
        }
        
        setData(factorsData);
      } else {
        toast.error(response?.data?.message || "Failed to fetch factors");
        setData([]);
        setTotalRows(0);
        setFrom(0);
        setTo(0);
        setTotalPage(0);
      }
    } catch (error: any) {
      console.error("Error fetching factors:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch factors");
      setData([]);
      setTotalRows(0);
      setFrom(0);
      setTo(0);
      setTotalPage(0);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const mappedData = data?.map((item: any) => ({
    id: item?.id || "-",
    factors: item?.factors || "-",
    factor_weight: item?.factor_weight ?? "-",
    status: item?.status ?? false,
    created_at: item?.created_at || null,
    updated_at: item?.updated_at || null,
    deleted_at: item?.deleted_at || null,
  }));

  return (
    <div className="service">
      <TableView
        header={Factors_Header}
        data={mappedData || []}
        setPageSize={setPageSize}
        setPage={setPage}
        pageSize={pageSize}
        page={page}
        totalRows={totalRows}
        totalPage={totalPage}
        isLoading={skelitonLoading}
        from={from}
        to={to}
        searchFields={[]}
      />
    </div>
  );
};

export default FactorsList;