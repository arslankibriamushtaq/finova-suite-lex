import { Customer_List_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";
import { DatePicker, Dropdown, Menu, Button } from "antd";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Images } from "../Config/Images";
import { useState } from "react";
import { DownOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

const data = [
  {
    Customer: "jhdbfs",
    ProductName: "kajbdsf",
    ApplicationNo: "2235",
    CrNumber: "1234",
    Email: "11@gmail.com",
    Phone: "123456",
    Date: "12.34.2044",
    ParentStatus: "---",
    Status: "active",
    Action: "--",
  },
  {
    Customer: "jhdbfs",
    ProductName: "kajbdsf",
    ApplicationNo: "2235",
    CrNumber: "1234",
    Email: "11@gmail.com",
    Phone: "123456",
    Date: "12.34.2044",
    ParentStatus: "---",
    Status: "active",
    Action: "--",
  },
  {
    Customer: "jhdbfs",
    ProductName: "kajbdsf",
    ApplicationNo: "2235",
    CrNumber: "1234",
    Email: "11@gmail.com",
    Phone: "123456",
    Date: "12.34.2044",
    ParentStatus: "---",
    Status: "active",
    Action: "--",
  },
  {
    Customer: "jhdbfs",
    ProductName: "kajbdsf",
    ApplicationNo: "2235",
    CrNumber: "1234",
    Email: "11@gmail.com",
    Phone: "123456",
    Date: "12.34.2044",
    ParentStatus: "---",
    Status: "active",
    Action: "--",
  },
  {
    Customer: "jhdbfs",
    ProductName: "kajbdsf",
    ApplicationNo: "2235",
    CrNumber: "1234",
    Email: "11@gmail.com",
    Phone: "123456",
    Date: "12.34.2044",
    ParentStatus: "---",
    Status: "active",
    Action: "--",
  },
];
const actionSelect = [{ label: "View", img: Images.listIcon, Link: "" }];

const CheckList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("customerManagement");
  const button = [
    { title: t("common:edit") },
    { title: t("common:view") },
    { title: t("checkList.audit") },
  ];
  const buttonSub2 = [{ title: t("checkList.audit") }];
  const buttonSub = [
    { title: t("checkList.saveAndAdd") },
    { title: t("checkList.saveAndStay") },
    { title: t("checkList.saveAndReturn") },
    { title: t("checkList.return") },
  ];
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      navigate(`/view/customerservices`);
    } else if (key === "view") {
      navigate(`/view/customerservices`);
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        {t("common:view")}
      </Menu.Item>
    </Menu>
  );
  const Call_Activity_Header = [
    {
      name: t("common:date"),
      selector: (row: { Customer: any }) => row.Customer,
    },
    {
      name: t("checkList.col.action"),
      selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
    },
    {
      name: t("checkList.col.result"),
      selector: (row: { ProductName: any }) => row.ProductName,
    },
    {
      name: t("checkList.col.contact"),
      selector: (row: { CrNumber: any }) => row.CrNumber,
    },
    {
      name: t("checkList.col.reason"),
      selector: (row: { Email: any }) => row.Email,
    },
    {
      name: t("checkList.col.promiseDate"),
      selector: (row: { Phone: any }) => row.Phone,
    },
    {
      name: t("checkList.col.promiseAmt"),
      selector: (row: { Date: any }) => row.Date,
    },
    {
      name: t("checkList.col.currentAmountDue"),
      selector: (row: { ParentStatus: any }) => row.ParentStatus,
    },
    {
      name: t("checkList.col.condition"),
      selector: (row: { Status: any }) => row.Status,
    },
    {
      name: t("checkList.col.appointment"),
      selector: (row: { Action: any }) => row.Action,
    },
    {
      name: t("common:actions"),

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            type="primary"
            style={{
              background: "linear-gradient(100deg, #DEF5FF, #90CAFF)",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("checkList.select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  return (
    <>
      <div className="cs-table p-3">
        <DynamicHeaderStructure title={t("checkList.title")} button={button} />
        <TableHeaderFilter />
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Call_Activity_Header}
          data={data}
        />
        <DynamicHeaderStructure title={t("checkList.title")} button={buttonSub} />
      </div>
      <div className="border-bottom"></div>
      <div className="d-flex p-3">
        <div className="col-md-2 pt-3">
          <h2 className="col-md-12 pt-4 d-flex align-items-center  fs-6 fw-bold">
            {t("checkList.action.title")}
          </h2>
          <div
            className="theme-btn-checklist-active"
            style={{ marginTop: "2.3rem" }}
          >
            {t("checkList.action.regular")}
          </div>
          <div className="theme-btn-checklist-Inactive mt-1">
            {t("checkList.action.regular")}
          </div>
        </div>
        <div className="col-md-10">
          <div className="cs-table p-3">
            <TableHeaderFilter button={buttonSub2} />
            <TableView
              setPage={setPage}
              setPageSize={setPageSize}
              totalRows={totalRows}
              header={Call_Activity_Header}
              data={data}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default CheckList;
