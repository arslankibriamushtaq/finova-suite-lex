import { SetStateAction, useEffect, useState, useRef } from "react";
import { Select } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { getLOVsByType } from "../../redux/apis/apisCrud";

const MandatoryReasonRescheduling = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);

  const Activity_Loans_Header = [
    {
      name: "Title",
      selector: (row: { title: any }) => row.title || "-",
      width: "400px",
    },
    {
      name: "Type",
      selector: (row: { type: any }) => row.type || "-",
      width: "300px",
    },
    {
      name: "Factor Weight",
      selector: (row: { factor_weight: any }) => row.factor_weight ?? "-",
    },
    {
      name: "Factors",
      selector: (row: { factors: any }) => row.factors ?? "-",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor:
              row.status === true
                ? "var(--color-success)"
                : row.status === false
                ? "var(--color-error)"
                : "var(--color-orange-alt)",
            color: "var(--primary-foreground)",
            cursor: row.status === true ? "pointer" : "default",
          }}
        >
          {row.status === true ? "Active" : "Inactive"}
        </div>
      ),
    },
  ];

  const getList = async (searchQuery?: string) => {
    setSkelitonLoading(true);
    try {
      const res = await getLOVsByType("MandatoryReasonRescheduling", page, pageSize, searchQuery || searchTerm);
      if (res) {
        const responseData = res?.data?.data;
        const data = responseData?.data || [];
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(responseData?.total || 0);
        setFrom(responseData?.from || 0);
        setTo(responseData?.to || 0);
        setTotalPage(responseData?.last_page || 0);
      }
    } catch (error: any) {
      console.error("Error fetching Mandatory Reason Rescheduling:", error);
      setSkelitonLoading(false);
    }
  };

  // Debounce search function
  const debouncedSearch = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear previous timeout
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
    
    // Set new timeout for debounced search
    debouncedSearch.current = setTimeout(() => {
      // Reset to page 1 when searching
      setPage(1);
      getList(value);
    }, 500); // 500ms debounce delay
  };

  useEffect(() => {
    getList();
  }, [page, pageSize]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearch.current) {
        clearTimeout(debouncedSearch.current);
      }
    };
  }, []);

  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item?.id,
        Sr: index + 1,
        title: item?.title || "-",
        type: item?.type || "-",
        factor_weight: item?.factor_weight ?? "-",
        factors: item?.factors ?? "-",
        status: item?.status,
      };
    });

  const options = [{ label: "Name", value: "name" }];
  const handleChange = (value: SetStateAction<undefined>[]) => {
    console.log("Selected:", value);
  };

  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "2px" }}
      >
        <div className="d-flex mb-3 col-12 filter-select">
          <Select
            mode="tags"
            style={{ width: "15%", borderTopRightRadius: "0px" }}
            onChange={handleChange}
            placeholder="Filter"
            tokenSeparators={[","]}
            suffixIcon={<FaFilter />}
            options={options}
          />

          <div className="d-flex gap-2 w-100">
            <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
              <img src={Images.searchIconGray} alt="" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                }}
                className="p-2"
                placeholder="Search..."
              />
            </div>
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
    </>
  );
};

export default MandatoryReasonRescheduling;

