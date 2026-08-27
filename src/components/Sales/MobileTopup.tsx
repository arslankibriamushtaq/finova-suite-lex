import { useEffect, useState } from "react";
import { Select } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Images } from "../Config/Images";
import { getIbft, getMobileTopup } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const MobileTopup = () => {
  const { t } = useTranslation("system");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const getIbftData = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getMobileTopup(page);
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
    getIbftData();
  }, []);
  const Activity_Loans_Header = [
    {
      name: t("shared.sr"),
      cell: (row: { Sr: any }) => row.Sr,
      sortable: true,
      width: "80px",
    },

    {
      name: t("sales.tid"),
      selector: (row: { trx_id: any }) => row.trx_id,
      sortable: true,
    },
    {
      name: t("sales.network"),
      selector: (row: { transaction_type: any }) => row.transaction_type,
      sortable: true,
      width: "170px",
    },
    {
      name: t("sales.mobileNumber"),
      selector: (row: { mobileNumber: any }) => row.mobileNumber,
      sortable: true,
      width: "200px",
    },
    // {
    //   name: "Sender Account",
    //   selector: (row: { sender_account_no: any }) => row.sender_account_no,
    //   sortable: true,
    //   width: "170px",
    // },
    // {
    //   name: "Reciever Name",
    //   selector: (row: { receiver_account_name: any }) =>
    //     row.receiver_account_name,
    //   sortable: true,
    //   width: "200px",
    // },
    // {
    //   name: "Reciever Account",
    //   selector: (row: { receiver_account: any }) => row.receiver_account,
    //   sortable: true,
    //   width: "170px",
    // },
    {
      name: t("common:amount"),
      selector: (row: { amount: any }) => row.amount,
      sortable: true,
      width: "280px",
    },

    {
      name: t("common:createdAt"),
      selector: (row: { created_at: any }) => row.created_at,
      sortable: true,
      width: "380px",
    },

    {
      name: t("common:status"),
      cell: (row: { status: any }) => (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor:
              row.status === "completed"
                ? "rgba(200, 29, 37, 0.9)"
                : row.status === "cancelled"
                ? "#6E1418"
                : "transparent",
            color: "white",
            cursor: row.status === "active" ? "pointer" : "default",
          }}
        >
          {row.status === "completed" ? t("sales.paid") : t("sales.unpaid")}
        </div>
      ),
    },
  ];

  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        id: item?.id,
        Sr: index + from,
        trx_id: item?.trx_id || "-",
        mobileNumber: item?.mobileNumber || "-",
        transaction_type: item?.transaction_type || "-",
        amount: item?.amount || "-",
        created_at: item?.created_at || "-",
        status: item?.status || "-",
      };
    });
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "MobileTopup");
      XLSX.writeFile(workbook, "MobileTopup.xlsx");
    };
  
    // Export to PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
  
      const tableColumn = [
        t("shared.sr"),
        t("sales.tid"),
        t("sales.network"),
        t("sales.mobileNumber"),
        t("common:amount"),
        t("common:createdAt"),
        t("common:status"),
      ];
  
      const tableRows = mappedData?.map((item: any) => [
        item.Sr,
        item.trx_id,
        item.transaction_type,
        item.mobileNumber,
        item.amount,
        item.created_at,
        item.status,
      ]);
  
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
  
      doc.save("MobileTopup.pdf");
    };
  return (
    <>
      <div className="service">
        <div className="d-flex justify-content-end  col-12">
          <Select
            mode="tags"
            style={{ width: "15%", borderTopRightRadius: "0px" }}
            // onChange={handleChange}
            placeholder={t("common:filter")}
            tokenSeparators={[","]}
            suffixIcon={<FaFilter />}

            // options={options}
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
          to={to}
        />
      </div>
    </>
  );
};

export default MobileTopup;
