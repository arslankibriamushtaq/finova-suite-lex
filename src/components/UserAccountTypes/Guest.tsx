import { useEffect, useState } from "react";
import { Select } from "antd";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { getGuestAccounts } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



const Guests = () => {
  const { t } = useTranslation("walletBlocks");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const Activity_Loans_Header = [
    {
      name: t("accountTypes.col.sr"),
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
    },
    {
      name: t("accountTypes.col.phone"),
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
    },
    {
      name: t("accountTypes.col.network"),
      selector: (row: { network: any }) => row.network,
      sortable: true,
    },
    {
      name: t("accountTypes.col.city"),
      selector: (row: { city: any }) => row.city,
      sortable: true,
    },
    
    /* {
      name: "Status",
      cell: (row: { status: any }) => (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor:
              row.status === "active"
                ? "rgba(200, 29, 37, 0.9)"
                : row.status === "inactive"
                ? "#6E1418"
                : "transparent",
            color: "white",
            cursor: row.status === "active" ? "pointer" : "default",
          }}
        >
          {row.status.toUpperCase()}
        </div>
      ),
    },
    {
      name: "Actions",
  
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#AB1920 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    }, */
  ];
  /* const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined/>}
        onClick={() => handleMenuClick("view", row)}
      >
        View Details
      </Menu.Item>
      <Menu.Item
        key="change"
        icon={<SyncOutlined/>}
        onClick={() => handleMenuClick("change", row)}
      >
        Change Status
      </Menu.Item>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined/>}
        onClick={() => handleMenuClick("logout", row)}
      >
        Force Logout
      </Menu.Item>
    </Menu>
  );
  const handleMenuClick = (action: string, data) => {
  
  };
 */
  const getGuestAccountList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getGuestAccounts(page, pageSize);
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
    getGuestAccountList();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        id:item.id || "-",
        Sr: index + from,
        phone: item?.phone || "-",
        city: item?.city || "-",
        network: item?.network || "-"
      };
    });
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Guest");
      XLSX.writeFile(workbook, "Guest.xlsx");
    };
  
    // Export to PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
  
      const tableColumn = [
        t("accountTypes.col.sr"),
        t("accountTypes.col.phone"),
        t("accountTypes.col.network"),
        t("accountTypes.col.city"),

      ];
  
      const tableRows = mappedData?.map((item: any) => [
        item.Sr,
        item.phone,
        item.network,
        item.city,
      ]);
  
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
  
      doc.save("Guest.pdf");
    };
  return (
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
              placeholder={t("accountTypes.searchPlaceholder")}
            />
          </div>

          <button className="invoice-btn" onClick={exportToExcel}>
            {t("accountTypes.excel")}
          </button>
          <button
            className="invoice-btn"
            onClick={() => {
              exportToPDF();
            }}
          >
            {t("accountTypes.pdf")}
          </button>
          <button className="invoice-btn">{t("accountTypes.print")}</button>
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
        setPageSize={setPageSize}
        pageSize={pageSize}
        to={to}
      />
    </div>
  );
};

export default Guests;
