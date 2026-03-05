import { useEffect, useState } from "react";
import { Select } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import toast from "react-hot-toast";
import { getCommodityList } from "../../redux/apis/apisCrudLms";
const CommodityManagement = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const Activity_Loans_Header = [
    {
      name: "NID",
      selector: (row: any) => row.nid || "-",
      sortable: true,
      width: "12%",
    },
    {
      name: "Supplier Name",
      selector: (row: any) => row.supplierName || "-",
      sortable: true,
      width: "12%",
    },
    {
      name: "Product Name",
      selector: (row: any) => row.productName || "-",
      sortable: true,
      width: "12%",
    },
    {
      name: "Application No",
      selector: (row: any) => row.applicatinNo || "-",
      sortable: true,
      width: "12%",
    },
    {
      name: "Channel",
      selector: (row: any) => row.channel || "-",
      sortable: true,
      width: "12%",
    },
    {
      name: "Customer Name",
      selector: (row: any) => row.customerName || "-",
      sortable: true,
      width: "12%",
    },
    {
      name: "Amount",
      selector: (row: any) => row.amount || "0",
      sortable: true,
    },
    {
      name: "Quantity",
      selector: (row: any) => row.quantity || "0",
      sortable: true,
      width: "12%",
    },
    {
      name: "Unit",
      selector: (row: any) => row.unitOfMeasurement || "0",
      sortable: true,

    },
    {
      name: "Commodity",
      selector: (row: any) => row.commodity || "0",
      sortable: true,

    },
    {
      name: "Date",
      selector: (row: any) => row.date ? new Date(row.date).toLocaleString() : "-",
      sortable: true,
       width: "13%",
    },
    {
      name: "Commodity Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor:
              row.commodityStatus === "SaleCommodity"
                ? "var(--color-success)" // Green for Approved
                : row.commodityStatus === "TransferCommodity"
                ? "var(--color-orange)" // Orange for Pending
                : "var(--color-success)", // Red for Rejected/others
            color: "white",
          }}
        >
          {row.commodityStatus || "Unknown"}
        </div>
      ),
      sortable: true,
      width:"12%"
    },
  ];
  const getCommodities = async () => {
    setSkelitonLoading(true);
    try {
      const res = await getCommodityList(page, pageSize);
      if (res?.data?.success) {
        const responseData = res.data;
        // Data is directly in data array
        const commoditiesData = Array.isArray(responseData.data) ? responseData.data : [];
        
        setData(commoditiesData);
        
        // Extract pagination info from pageInfo (similar to CommoditySupplier)
        if (responseData.pageInfo) {
          setTotalRows(responseData.pageInfo.totalItems || 0);
          setPage(responseData.pageInfo.page || page);
          setTotalPage(responseData.pageInfo.totalPages || 1);
          // Calculate from and to
          const currentPage = responseData.pageInfo.page || 1;
          const perPage = responseData.pageInfo.pageSize || pageSize;
          setFrom((currentPage - 1) * perPage + 1);
          setTo(Math.min(currentPage * perPage, responseData.pageInfo.totalItems || 0));
        } else if (responseData.pagination) {
          // Fallback to pagination object
          setTotalRows(responseData.pagination.total || 0);
          setFrom(responseData.pagination.from || 0);
          setTo(responseData.pagination.to || 0);
          setPage(responseData.pagination.current_page || page);
          setTotalPage(responseData.pagination.last_page || 1);
          // Calculate from and to if not provided
          if (!responseData.pagination.from && responseData.pagination.current_page) {
            const currentPage = responseData.pagination.current_page || 1;
            const perPage = responseData.pagination.per_page || pageSize;
            setFrom((currentPage - 1) * perPage + 1);
            setTo(Math.min(currentPage * perPage, responseData.pagination.total || 0));
          }
        } else {
          // Fallback if no pageInfo or pagination
          setTotalRows(commoditiesData.length || 0);
          setFrom(1);
          setTo(commoditiesData.length || 0);
          setPage(1);
          setTotalPage(1);
        }
      } else {
        setData([]);
        setTotalRows(0);
        setFrom(0);
        setTo(0);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      console.error("Error fetching Commodities:", error);
      toast.error(error?.response?.data?.notificationMessage || "Failed to fetch commodities");
      setSkelitonLoading(false);
      setData([]);
    }
  };

  useEffect(() => {
    getCommodities();
  }, [page, pageSize]);

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        nid: item?.nid,
        supplierName: item?.supplierName,
        productName: item?.productName,
        applicatinNo: item?.applicatinNo,
        channel: item?.channel,
        customerName: item?.customerName,
        amount: item?.amount,
        quantity: item?.quantity,
        commodity: item?.commodity,
        unitOfMeasurement: item?.unitOfMeasurement,
        date: item?.date,
        commodityStatus: item?.commodityStatus,
      };
    });

  return (
    <div
      className="service"
      style={{ background: "white", padding: "1rem", borderRadius: "10px" }}
    >
      <div className="d-flex mb-3 col-12 filter-select">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          placeholder="Filter"
          tokenSeparators={[","]}
          suffixIcon={<FaFilter />}
        />

        <div className="d-flex gap-2 w-100">
          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder="Search..."
            />
          </div>

          {/* <button
            className="theme-btn-next"
            onClick={() => {
              // Handle Add Commodity - to be implemented
              toast.success("Add Commodity functionality - to be implemented");
            }}
          >
            Add Commodity
          </button> */}
        </div>
      </div>
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
  );
};

export default CommodityManagement;
