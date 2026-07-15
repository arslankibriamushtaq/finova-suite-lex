import { useEffect, useState } from "react";
import { Select } from "antd";
import { FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import TableView from "../../TableView/TableView";
import { Images } from "../../Config/Images";
import { systemAuditList } from "../../../redux/apis/apisCrud";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { max } from "moment";

const SystemAudit = () => {
  const { t } = useTranslation("system");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  // Close popup when clicking outside
  const Activity_Loans_Header = [
    {
      name: t("shared.sr"),
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
    },
    {
      name: t("logs.userName"),
      selector: (row: { user_agent: any }) => row.user_agent,
      sortable: true,
    },
    {
      name: t("logs.event"),
      selector: (row: { event: any }) => row.event,
      sortable: true,
    },
    {
      name: t("logs.auditableType"),
      selector: (row: { auditable_type: any }) => row.auditable_type,
      sortable: true,
    },
    {
      name: t("logs.url"),
      selector: (row: { url: any }) => row.url,
      sortable: true,
      maxWidth: "200px",
    },
    {
      name: t("logs.ipAddress"),
      selector: (row: { ip_address: any }) => row.ip_address,
      sortable: true,
    },
    {
      name: t("common:createdAt"),
      selector: (row: { created_at: any }) => row.created_at,
      sortable: true,
    },
  ];
  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await systemAuditList(page, pageSize);
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
        user_agent: item?.user_agent || "-",
        event: item?.event || "-",
        auditable_type: item?.auditable_type || "-",
        url: item?.url || "-",
        ip_address: item?.ip_address || "-",
        created_at: item?.created_at || "-",
      };
    });
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SystemAudit");
    XLSX.writeFile(workbook, "SystemAudit.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      t("shared.sr"),
      t("logs.userName"),
      t("logs.event"),
      t("logs.auditableType"),
      t("logs.url"),
      t("logs.ipAddress"),
      t("common:createdAt"),
    ];

    const tableRows = mappedData?.map((item: any) => [
      item.Sr,
      item.user_agent,
      item.event,
      item.auditable_type,
      item.url,
      item.ip_address,
      item.created_at,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("SystemAudit.pdf");
  };
  return (
    <div className="service">
      {/* <DashboardProfile /> */}

      <div className="d-flex justify-content-end  col-12">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          placeholder={t("common:filter")}
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
              placeholder={t("shared.searchPlaceholder")}
            />
          </div>

          <button className="invoice-btn" onClick={exportToExcel}>
            {t("shared.excel")}
          </button>
          <button
            className="invoice-btn"
            onClick={() => {
              exportToPDF();
            }}
          >
            {t("shared.pdf")}
          </button>
          <button className="invoice-btn">{t("common:print")}</button>
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

export default SystemAudit;
