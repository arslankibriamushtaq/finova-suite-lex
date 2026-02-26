import React from "react";
import { Images } from "../../components/Config/Images";
import TableView from "../../components/TableView/TableView";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const data = [
  {
    ApplicationNo: "kajbdsf",
    KastleContractNo: "2235",
    KastleApplicationNo: "1234",
    KastleStatus: "11@gmail.com",
    ContractStatus: "--",
    CustomerName: "---",
    CRNo: "--",
    Product: "11@gmail.com",
    LoanTenure: "--",
    LoanAmount: "11@gmail.com",
    ApplicationDate: "--",
    Status: "11@gmail.com",
    Reason: "--",
    Action: "11@gmail.com",
  },
];

const CommonTable = (props: any) => {
  const navigate = useNavigate();
  const actionSelect = [
    { label: "View", img: Images.listIcon, Link: "detail" },
    {
      label: "Documents",
      img: Images.settingIcon,
      Link: "application-document",
    },
    { label: "Activity Logs", img: Images.settingIcon, Link: "activity-log" },
    { label: "Resend Login Email", img: Images.settingIcon, Link: "edit" },
  ];
  const handleURL = (link: any) => {
    if (link == "View") {
      navigate(`/applications/all/detail`);
    }
    if (link == "Documents") {
      navigate(`/applications/all/application-document`);
    }
    if (link == "Activity Logs") {
      navigate(`/applications/all/activity-log`);
    }
  };
  const InProgress_Loans_Header = [
    {
      name: "Application No",
      selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
    },
    {
      name: "Kastle Contract No",
      selector: (row: { KastleContractNo: any }) => row.KastleContractNo,
    },

    {
      name: "Contract Status",
      selector: (row: { ContractStatus: any }) => row.ContractStatus,
    },
    {
      name: "Customer Name",
      selector: (row: { CustomerName: any }) => row.CustomerName,
    },

    {
      name: "Reason",
      selector: (row: { Reason: any }) => row.Reason,
    },
    {
      name: "Action",
      selector: (row: { Action: any }) => row.Action,
      cell: (row: any) => (
        <div>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Select
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {actionSelect.map((item, index) => (
                <Dropdown.Item>
                  <>
                    <div
                      className="d-flex"
                      onClick={() => {
                        handleURL(item.label);
                      }}
                    >
                      <div className="col-2">
                        <img src={item.img} alt="" />
                      </div>

                      <div className="col-10">{item.label}</div>
                    </div>
                  </>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ),
    },
  ];
  return (
    <>
      <div className="cs-table">
        <div className="col-xl-12 col-12 d-flex align-items-center pb-3">
          <h2 className="col-xl-6 col-12 fs-6 fw-bold">{props.title}</h2>
          <div className="col-xl-6 col-12 d-flex justify-content-end align-items-center">
            {props.search && (
              <div className="d-flex">
                <input
                  type="search"
                  placeholder={props.search}
                  className="search-icon form-control search-bar"
                />
              </div>
            )}
            {props.button && (
              <div className="theme-btn mt-1">{props.button}</div>
            )}
          </div>
        </div>
        <TableView header={InProgress_Loans_Header} data={data} />
      </div>
    </>
  );
};
export default CommonTable;
