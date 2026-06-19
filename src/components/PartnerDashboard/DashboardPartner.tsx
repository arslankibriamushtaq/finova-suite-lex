import { Button, Dropdown, Menu } from "antd";

import TableView from "../TableView/TableView";
import { EyeOutlined, SyncOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";
import { useNavigate } from "react-router-dom";
import { FaFileInvoice } from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getPartnerDashboard } from "../../redux/apis/apisCrud";

const DashboardPartner = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const navigate = useNavigate();
  useEffect(() => {
    getDashboardData();
  }, []);
  const cardsData = [
    {
      title: "Paid Financing Amount",
      value: "1,200",
    },
    {
      title: "Total Comission",
      value: data?.total_application_commission,
    },
  ];

  const producer = [
    {
      title: "Total Applications",
      value: data?.total_applications_count,
    },
    {
      title: "Incomplete Applications",
      value: data?.incomplete_applications_count,
    },
    {
      title: "Pending Applications",
      value: data?.pending_applications_count,
    },
    {
      title: "Approved Applications",
      value: data?.approved_applications_count,
    },
    {
      title: "Total Application Amount",
      value: data?.total_applications_sum,
    },
    {
      title: "Total Financing Amount",
      value: "204",
    },
  ];
  const Activity_Loans_Header = [
    {
      name: "Application Number",
      selector: (row: any) => row.applicationNumber,
    },
    {
      name: "Product",
      selector: (row: any) => row.product,
    },
    {
      name: "Customer Name",
      selector: (row: any) => row.customerName,
    },
    {
      name: "Duration",
      selector: (row: any) => row.duration,
    },
    {
      name: "Type",
      selector: (row: any) => row.type,
    },
    {
      name: "Application Date",
      selector: (row: any) => row.applicationDate,
    },
    {
      name: "Amount",
      selector: (row: any) => row.amount,
    },
    {
      name: "Parent Status",
      cell: (row: any) => (
        <span
          style={{
            backgroundColor:
              row.parentStatus === "Approved"
                ? "#4CAF50"
                : row.parentStatus === "In Progress"
                ? "#ffc107"
                : "#ccc",
            padding: "4px 12px",
            borderRadius: "2px",
            color: "#000",
            fontWeight: 500,
            fontSize: "12px",
          }}
        >
          {row.parentStatus}
        </span>
      ),
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            backgroundColor: "#6c757d",
            padding: "4px 12px",
            borderRadius: "2px",
            color: "#fff",
            fontWeight: 500,
            fontSize: "12px",
          }}
        >
          {row.status}
        </span>
      ),

      width: "350px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            // className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#EB0D0D",
              color: "#ffffff",
              borderRadius: "2px",
              padding: "6px 16px",
              fontSize: "12px",
            }}
          >
            Action <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        View Details
      </Menu.Item>
      <Menu.Item
        key="invoice"
        icon={<FaFileInvoice />}
        onClick={() => handleMenuClick("invoice", row)}
      >
        Invoice
      </Menu.Item>
    </Menu>
  );
  const handleMenuClick = (action: string, row: any) => {
    switch (action) {
      case "view":
        navigate(`/partner/View/${row.applicationNumber}`);

        break;
      case "invoice":
        navigate(`/partner/invoice/${row.applicationNumber}`);
        break;
    }
  };

  // const mappedData =
  //   data &&
  //   data.map((item: any, index: number) => ({
  //     applicationNumber: item.applicationNumber,
  //     product: item.product,
  //     customerName: item.customerName,
  //     duration: item.duration,
  //     type: item.type,
  //     applicationDate: item.applicationDate,
  //     amount: item.amount,
  //     parentStatus: item.parentStatus,
  //     status: item.status,
  //   }));

  const getDashboardData = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getPartnerDashboard();
      if (response) {
        const res = response?.data.data;
        setData(res.application_statistics);
        setSkelitonLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid px-4 p-2 mt-2">
        <div className="row">
          <div className="col-12">
            <div className="row mt-2">
              {producer.map((card, index) => (
                <div className="col-2 p-2" key={index}>
                  <div
                    className={`card-product p-4 ${
                      index === 0 ? "highlight-card-main" : ""
                    }`}
                  >
                    <div className="mt-4">{card.title}</div>
                    <div className="mt-2 mb-2 fw-600">{card.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mt-3">
              {cardsData.map((card, index) => (
                <div className="col-4 p-2" key={index}>
                  <div
                    className={`card-product p-4 ${
                      index === 0
                        ? "highlight-card-main"
                        : "highlight-card-main2"
                    }`}
                  >
                    <div className="mt-4">{card.title}</div>
                    <div className="mt-2 mb-2 fw-600">{card.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mt-4">
              <h3>Recent Applications</h3>
              <div className="col-12 custom-table-wrapper">
                <TableView header={Activity_Loans_Header} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPartner;
