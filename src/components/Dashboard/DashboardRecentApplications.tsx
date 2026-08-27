import React, { useState } from "react";
import { Button, Dropdown, Menu } from "antd";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import { EyeOutlined, LogoutOutlined, SyncOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DashboardRecentApplications: React.FC<{ recentApplications?: any[]; loading?: boolean }> = ({ recentApplications, loading }) => {
  const { t } = useTranslation("dashboard");
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const data = recentApplications;
  const skelitonLoading = loading || false;

  const getStatusColor = (status: string) => {
    const statusColors: any = {
      "DISBURSED":   "var(--color-success)",
      "APPROVED":    "var(--color-info)",
      "PENDING":     "var(--color-warning)",
      "REJECTED":    "var(--theme-secondary)",
      "IN_PROGRESS": "var(--color-info)",
      "CANCELLED":   "var(--color-disabled)",
    };
    return statusColors[status] || "var(--color-disabled)";
  };

  const Activity_Loans_Header = [
    {
      name: t("recent.col.applicationNumber"),
      selector: (row: { applicationNumber: any }) => row.applicationNumber || "--",
      sortable: true,
      width: "180px",
    },
    {
      name: t("recent.col.nationalId"),
      selector: (row: { nationalId: any }) => row.nationalId || "--",
      sortable: true,
    },
    {
      name: t("recent.col.productName"),
      selector: (row: { productName: any }) => row.productName || "--",
      sortable: true,
    },
    {
      name: t("recent.col.requestedAmount"),
      selector: (row: { requestedAmount: any }) => {
        return row.requestedAmount ? `SAR ${row.requestedAmount.toLocaleString()}` : "--";
      },
      sortable: true,
    },
    {
      name: t("recent.col.createdDate"),
      selector: (row: { createdAt: any }) => {
        if (!row.createdAt) return "--";
        const date = new Date(row.createdAt);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },
      sortable: true,
      width: "150px",
    },
    {
      name: t("common:status"),
      cell: (row: { status: any }) => (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor: getStatusColor(row.status),
            color: "var(--primary-foreground)",
            fontWeight: 500,
            textAlign: "center",
           width: "150px",
          }}
        >
          {row.status || "PENDING"}
        </div>
      ),
      width: "200px",
    },
    // {
    //   name: "Actions",
    //   cell: (row: any) => (
    //     <Dropdown overlay={menu(row)} trigger={["click"]}>
    //       <Button
    //         className="gradient-btn"
    //         type="primary"
    //         style={{
    //           backgroundColor: "#c00000 !important",
    //           color: "#000000",
    //           borderColor: "white",
    //           borderRadius: "2px",
    //           padding: "10px 20px",
    //         }}
    //       >
    //         Select <img src={arrowDown} alt="" />
    //       </Button>
    //     </Dropdown>
    //   ),
    // },
  ];
  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        {t("common:viewDetails")}
      </Menu.Item>
      <Menu.Item
        key="change"
        icon={<SyncOutlined />}
        onClick={() => handleMenuClick("change", row)}
      >
        {t("recent.menu.changeStatus")}
      </Menu.Item>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={() => handleMenuClick("logout", row)}
      >
        {t("recent.menu.forceLogout")}
      </Menu.Item>
    </Menu>
  );
  const handleMenuClick = (action: string, data: any) => {
    switch (action) {
      case "view":
        break;
      case "change":
        break;
      case "logout":
        break;
      default:
        break;
    }
  };

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item.applicationId,
        applicationNumber: item?.applicationNumber || "--",
        nationalId: item?.nationalId || "--",
        productName: item?.productName || "--",
        createdAt: item?.createdAt,
        requestedAmount: item?.requestedAmount || 0,
        status: item?.status || "PENDING",
      };
    });
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recent Applications");
    XLSX.writeFile(workbook, "Recent_Applications.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      t("recent.col.applicationNumber"),
      t("recent.col.nationalId"),
      t("recent.col.productName"),
      t("recent.col.requestedAmount"),
      t("common:status"),
    ];

    const tableRows = mappedData?.map((item: any) => [
      item.applicationNumber,
      item.nationalId,
      item.productName,
      item.requestedAmount ? `SAR ${item.requestedAmount.toLocaleString()}` : "--",
      item.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Recent_Applications.pdf");
  };
  return (
    <div className="service">
    
    <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h5 className="mt-4" style={{ fontWeight: 600, fontSize: "20px", margin: 0 }}>{t("recent.title")}</h5>
       
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
        paginationShow={false}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />
    </div>
  );
};

export default DashboardRecentApplications;
