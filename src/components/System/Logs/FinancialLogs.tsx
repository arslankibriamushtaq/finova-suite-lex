import { useEffect, useState } from "react";
import { Select } from "antd";
import { FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";
import TableView from "../../TableView/TableView";
import { Images } from "../../Config/Images";
import { financialLogsList } from "../../../redux/apis/apisCrud";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const FinancialLogs = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  // Close popup when clicking outside
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
    },
    {
      name: "User ID",
      selector: (row: { user_id: any }) => row.user_id,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
    },
    {
      name: "IP",
      selector: (row: { ip: any }) => row.ip,
      sortable: true,
    },
    {
      name: "Latitude/Longitude",
      selector: (row: { lat_long: any }) => row.lat_long,
      sortable: true,
    },
    {
      name: "Activity Name",
      selector: (row: { activity_type_name: any }) => row.activity_type_name,
      sortable: true,
    },
    {
      name: "Trace ID",
      selector: (row: { trace_id: any }) => row.trace_id,
      sortable: true,
    },
    {
      name: "Activity Description",
      selector: (row: { activity_type_description: any }) =>
        row.activity_type_description,
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row: { created_at: any }) => row.created_at,
      sortable: true,
    },
  ];
  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await financialLogsList(page, pageSize);
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
        user_id: item?.id,
        phone: item?.phone || "-",
        name: item?.name || "-",
        ip: item?.IP || "-",
        lat_long: item?.lat_long || "N/A",
        activity_type_name: item?.activity_type_name || "-",
        trace_id: item?.trace_id || "-",
        activity_type_description: item?.activity_type_description || "-",
        created_at: item?.created_at || "-",
      };
    });
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FinancialLogs");
    XLSX.writeFile(workbook, "FinancialLogs.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "User ID",
      "Name",
      "Phone",
      "IP",
      "Latitude/Longitude",
      "Activity Name",
      "Trace ID",
      "Activity Description",
      "Created At",
    ];

    const tableRows = mappedData?.map((item: any) => [
      item.user_id,
      item.name,
      item.phone,
      item.ip,
      item.lat_long,
      item.activity_type_name,
      item.trace_id,
      item.activity_type_description,
      item.created_at,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("FinancialLogs.pdf");
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

export default FinancialLogs;
