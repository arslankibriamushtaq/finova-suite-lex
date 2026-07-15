import { Button, Dropdown, Menu } from "antd";
import MaskedValue from "../MaskedValue";
import TableView from "../TableView/TableView";
import { EyeOutlined, LogoutOutlined, SyncOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";
import ApplicationsTabs from "./ApplicationTabs";
import { getCustomerDashboard, getCustomerInvoices } from "../../redux/apis/apisCrud";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const DashboardCustomer = () => {
  const { t } = useTranslation("customersB");
  const [dashboardData, setDashboardData] = useState<any>({});
  const [invoices, setInvoices] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  useEffect(() => {
    getDashboardData();
  }, []);
  const getDashboardData = async () => {
    const response = await getCustomerDashboard();
    setDashboardData(response?.data?.data);
  }
  const producer = [
    {
      title: t("customersB:dashboard.invoices"),
      value: dashboardData?.invoice_count,
      data: t("customersB:dashboard.invoicesAddedMsg", { count: dashboardData?.invoice_count })
    },
    {
      title: t("customersB:dashboard.funding"),
      value: dashboardData?.invoices_sum,
      data: t("customersB:dashboard.fundingReceivedMsg", { amount: dashboardData?.invoices_sum })
    },
    {
      title: t("customersB:dashboard.accountStatus"),
      value: t("customersB:dashboard.verified"),
      data: t("customersB:dashboard.accountVerifiedMsg")
    },
  ];
  useEffect(() => {
    getInvoices();
  }, [page, pageSize]);
  const getInvoices = async () => {
    setSkelitonLoading(true);
    const response = await getCustomerInvoices(page, pageSize);
    setSkelitonLoading(false);
    setTotalRows(response?.data?.data?.total || 0);
    setFrom(response?.data?.data?.from || 0);
    setTo(response?.data?.data?.to || 0);
    setPage(response?.data?.data?.current_page);
    setTotalPage(response?.data?.data?.last_page);
  }
  const Activity_Loans_Header = [
    {
      name: t("customersB:dashboard.debtor"),
      selector: (row: any) => row.Sr,
    },
    {
      name: t("customersB:dashboard.invoiceNo"),
      selector: (row: any) => row.applicationNumber,
    },
    {
      name: t("customersB:dashboard.invoiceDate"),
      selector: (row: any) => row.product,
    },
    {
      name: t("customersB:dashboard.dueDate"),
      selector: (row: any) => row.customerName,
    },
    {
      name: t("common:amount"),
      selector: (row: any) => row.duration,
    },
  ];
  const mappedInvoices = invoices && invoices.map((item: any, index: any) => ({
    Sr: index + from, // dynamic serial number
    applicationNumber: item.applicationNumber,
    product: item.product,
    customerName: item.customer_name,
    duration: item.duration,
    type: item.type,
    applicationDate: item.created_at,
    amount: item.amount,
    parentStatus: item.parentStatus,
    status: item.status,
  }));
  /*  const menu = (row: any) => (
     <Menu>
       <Menu.Item
         key="view"
         icon={<EyeOutlined />}
         onClick={() => handleMenuClick("view", row)}
       >
         View Details
       </Menu.Item>
       <Menu.Item
         key="change"
         icon={<SyncOutlined />}
         onClick={() => handleMenuClick("change", row)}
       >
         Change Status
       </Menu.Item>
     </Menu>
   );
   const handleMenuClick = (action: string, data: any) => {
     switch (action) {
       case "view":
         break;
       case "change":
         break;
 
       default:
         break;
     }
   }; */


  // const data = [
  //   {
  //     id: 1,
  //     applicationNumber: "FVAN-4388866041",
  //     product: "Invoice Factoring",
  //     customerName: "شركة XXX المحدودة",
  //     duration: "1 Month",
  //     type: "SME",
  //     applicationDate: "22 October, 2024 10:21 AM",
  //     amount: "SR 0.00",
  //     parentStatus: "In Progress",
  //     status: "FACTORING-AMOUNT-APPROVED",
  //   },
  // ];

  return (
    <>
      <div className="container-fluid px-4 p-2 mt-2">

        <div className="">
          <div className="col-12 d-flex mt-2">
            {producer.map((card, index) => (
              <div className="col-4 p-2" key={index}>
                <div
                  className={`p-4 ${(index === 0 || index === 1 ? "card-customer" : "card-customer2")
                    }`}
                >
                  <div className="" style={{ fontSize: "18px" }}>{card.title}</div>
                  <div className="mt-4 mb-2 fw-600" style={{ fontSize: "22px" }}>{card.value}</div>
                  <div className="mt-4" style={{ fontSize: "12px" }}>{card.data}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex px-2 mt-4 w-100">
            <div className="col-6 p-2 custom-table-wrapper border">
              <div className="d-flex align-items-center justify-content-between mb-2 mt-1">
                <label className="mb-0">{t("customersB:dashboard.invoices")}</label>
                <button className="see-more" style={{ marginTop: "0px" }}>
                  {t("customersB:dashboard.viewAll")}
                </button>
              </div>
              <TableView header={Activity_Loans_Header} data={mappedInvoices}
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

            <div className="col-6 p-2 custom-table-wrapper border">
              <div className="d-flex align-items-center justify-content-between mb-2 mt-1">
                <label className="mb-0">{t("customersB:dashboard.applications")}</label>
                <button className="see-more" style={{ marginTop: "0px" }}>
                  {t("customersB:dashboard.viewAll")}
                </button>
              </div>
              <ApplicationsTabs
                inProgress={[
                  {
                    ref: "FVAN-4336041914",
                    amount: "SR 15,000.00",
                    invoices: 1,
                    submittedAt: "01 January, 2025 03:52 PM",
                    status: "FACTORING-AMOUNT-APPROVED",
                  },
                ]}
                accepted={[]}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardCustomer;
