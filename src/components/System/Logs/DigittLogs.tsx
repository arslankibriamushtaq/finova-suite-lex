import { useEffect, useState } from "react";
import { Select } from "antd";
import { FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import TableView from "../../TableView/TableView";
import { Images } from "../../Config/Images";
import {
  digittLogsList,
} from "../../../redux/apis/apisCrud";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DigittLogs = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  // const [rowData, setRowData] = useState<any>({});
  const navigate = useNavigate();

  // Close popup when clicking outside
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
    },
    {
      name: "Trace ID",
      selector: (row: { traceID: any }) => row.traceID,
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row: { created_at: any }) => row.created_at,
      sortable: true,
    },
    {
      name: "Level",
      selector: (row: { level: any }) => row.level,
      sortable: true,
    },
    {
      name: "Message",
      selector: (row: { message: any }) => row.message,
      sortable: true,
    },
  
  ];
  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await digittLogsList(page, pageSize);
      if (response) {
        const data = response?.data?.data?.data;
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        setPage(response?.data?.data?.current_page);
        setTotalPage(response?.data?.data?.last_page);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getList();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        Sr: index + from,
        phone: item?.phone || "N/A",
        traceID: item?.traceID || "-",
        created_at: item?.created_at || "-",
        level: item?.level || "-",
        message: item?.message || "-",
      };
    });
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DigittLogs");
      XLSX.writeFile(workbook, "DigittLogs.xlsx");
    };
  
    // Export to PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
  
      const tableColumn = [
        "Sr",
        "Phone",
        "Trace ID",
        "Created At",
        "Level",
        "Message",
      ];
  
      const tableRows = mappedData?.map((item: any) => [
        item.Sr,
        item.phone,
        item.traceID,
        item.created_at,
        item.level,
        item.message,
      ]);
  
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
  
      doc.save("DigittLogs.pdf");
    };
  return (
    <div className="service">
      {/* <DashboardProfile /> */}

      <div className="d-flex justify-content-end  col-12">
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
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder="Search..."
            />
          </div>

          <button className="invoice-btn" onClick={exportToExcel}>
            Excel
          </button>
          <button
            className="invoice-btn"
            onClick={() => {
              exportToPDF();
            }}
          >
            PDF
          </button>
          <button className="invoice-btn">Print</button>
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

export default DigittLogs;
