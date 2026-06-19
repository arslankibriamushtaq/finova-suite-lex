import { useEffect, useState } from "react";
import { DatePicker, Select } from "antd";
import TableView from "../TableView/TableView";
import { Images } from "../Config/Images";
import { getBlockHistory } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { formatDate } from "../../App";

const BlockHistory = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [action, setAction] = useState('');

  const Block_History_Header = [
    {
      name: "Date",
      cell: (row: any) => (
        <div>
          {row.created_at ? new Date(row.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : "-"}
        </div>
      ),
      sortable: true,
      width: "200px",
    },
    {
      name: "User (Blocked To)",
      cell: (row: any) => (
        <div>
          <div style={{ fontWeight: "600", fontSize: "14px" }}>
            {row.user_name}
          </div>
          {row.user_nid && (
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              | NID: {row.user_nid}
            </div>
          )}
        </div>
      ),
      sortable: true,
      width: "280px",
    },
    {
      name: "Type",
      cell: (row: any) => (
        <span style={{
          backgroundColor: 
            row.block_code_type === 'aml' ? "var(--color-error)" :
            row.block_code_type === 'compliance' ? "var(--color-block-compliance)" :
            row.block_code_type === 'anti_fraud' ? "var(--color-orange)" :
            row.block_code_type === 'sanction' ? "var(--color-pep)" :
            "var(--color-block-fallback)",
          color: "white",
          padding: "6px 12px",
          borderRadius: "2px",
          fontSize: "12px",
          fontWeight: "500",
          textTransform: "uppercase",
          display: "inline-block"
        }}>
          {row.block_code_type?.replace('_', ' ')}
        </span>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <button style={{
          backgroundColor: row.action === 'block' ? "var(--color-error)" : "var(--color-success)",
          color: "white",
          border: "none",
          padding: "6px 16px",
          borderRadius: "2px",
          fontSize: "12px",
          fontWeight: "500",
          cursor: "default",
          textTransform: "capitalize"
        }}>
          {row.action}
        </button>
      ),
      sortable: true,
      width: "120px",
    },
    {
      name: "Block Code",
      selector: (row: { block_code: any }) => row.block_code || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Reason",
      cell: (row: { reason: any }) => (
        <div style={{ 
          maxWidth: "200px", 
          whiteSpace: "normal",
          wordWrap: "break-word"
        }}>
          {row.reason || "-"}
        </div>
      ),
      sortable: true,
      width: "250px",
    },
    {
      name: "Blocked From (User)",
      cell: (row: any) => (
        <div>
          <div style={{ fontWeight: "600", fontSize: "14px" }}>
            {row.action_by_name}
          </div>
          {row.action_by_email && (
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              {row.action_by_email}
            </div>
          )}
        </div>
      ),
      sortable: true,
      width: "220px",
    },
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to first page on search
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  const getBlockHistoryList = async () => {
    try {
      setSkelitonLoading(true);

      const fromDateStr = fromDate ? (formatDate(fromDate) || '') : '';
      const toDateStr = toDate ? (formatDate(toDate) || '') : '';

      const response = await getBlockHistory(page, pageSize, search, action, fromDateStr, toDateStr);
      if (response?.data?.success) {
        const responseData = response?.data?.data;
        setData(responseData?.data || []);
        setTotalRows(responseData?.total || 0);
        setFrom(responseData?.from || 0);
        setTo(responseData?.to || 0);
        setPage(responseData?.current_page || 1);
        setTotalPage(responseData?.last_page || 1);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch block history");
      console.error("Error fetching block history:", error);
    } finally {
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    getBlockHistoryList();
  }, [page, pageSize, search, action, fromDate, toDate]);

  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item.id,
        Sr: index + from,
        created_at: item.created_at,
        user_name: item.user?.name || "-",
        user_nid: item.user?.ids_id || "",
        user_phone: item.user?.phone || "",
        block_code_type: item.block_code?.type || "-",
        action: item.action || "-",
        block_code: item.block_code?.code || "-",
        reason: item.reason || "-",
        action_by_name: item.action_by?.name || "-",
        action_by_email: item.action_by?.email || "",
      };
    });

  return (
    <div className="service">
      <div className="d-flex justify-content-end col-12 filter-select">
        <Select
          style={{ width: "140px", marginRight: "8px" }}
          placeholder="Action"
          allowClear
          value={action || undefined}
          onChange={(value) => {
            setAction(value || '');
            setPage(1); // Reset to first page on filter change
          }}
        >
          <Select.Option value="block">Block</Select.Option>
          <Select.Option value="unblock">Unblock</Select.Option>
        </Select>

        <div className="d-flex gap-2 w-100" style={{ height: 40 }}>
          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder="Search by user name, email, or block code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="d-flex align-items-center">
            <div
              className="d-flex gap-1 p-2"
              style={{ paddingLeft: "0px !important" }}
            >
              <DatePicker
                className="date-picker"
                placeholder="From"
                value={fromDate}
                onChange={(date) => {
                  setFromDate(date);
                  setPage(1); // Reset to first page on date change
                }}
                allowClear
              />
              <DatePicker
                className="date-picker"
                placeholder="To"
                value={toDate}
                onChange={(date) => {
                  setToDate(date);
                  setPage(1); // Reset to first page on date change
                }}
                allowClear
              />
            </div>
          </div>
        </div>
      </div>

      <TableView
        header={Block_History_Header}
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

export default BlockHistory;

