import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import PersonalInformation from "./PersonalInformation";
import LoanInformation from "./LoanInformation";
import LoanApproval from "./LoanApproval";
import SalaryDetails from "./SalaryDetails";
import Disclaimer from "./Disclaimer";
import OpneBankingCheck from "./OpenBankingCheck";
import SimahCheck from "./SimahCheck";
import ComplianceCheck from "./ComplianceCheck";
import CreditCheck from "./CreditCheck";
import Approval from "./Approval";
import { useLocation } from "react-router-dom";
import DocumentGallery from "./Document";
const ViewApplication = () => {
  const [selectTab, setSelectedTab] = useState("PersonalInformation");
   const location = useLocation();
    const data = location.state; // Access passed data
  const tapOptions = [
    {
      title: "Personal Information",
      key: "PersonalInformation",
      folder: <PersonalInformation />,
    },
    {
      title: "Loan Application",
      key: "LoanApplication",
      folder: <LoanInformation />,
    },
    // {
    //   title: "Loan Approval",
    //   key: "LoanApproval",
    //   folder: <LoanApproval />,
    // },
    {
      title: "Salary Details",
      key: "SalaryDetails",
      folder: <SalaryDetails />,
    },
    {
      title: "Documents",
      key: "Documents",
      folder: <DocumentGallery/>,
    },
    // { title: "Disclaimer", key: "Disclaimer", folder: <Disclaimer /> },
    { title: "Simah Check", key: "SimahCheck", folder: <SimahCheck /> },
    {
      title: "Opne Banking Check",
      key: "OpneBankingCheck",
      folder: <OpneBankingCheck />,
    },
    {
      title: "Compliance Check",
      key: "ComplianceCheck",
      folder: <ComplianceCheck />,
    },
    { title: "Credit Check", key: "CreditCheck", folder: <CreditCheck /> },
    { title: "Approval", key: "Approval", folder: <Approval /> },
    // { title: "Disbursement", key: "Disbursement", folder: "" },
  ];

  return (
    <>
      <div className="cs-table">
        <div className="col-lg-12 search-bar col-12 d-flex align-items-center">
          <h2 className="mb-4 mt-3 fs-6 fw-600">View Application</h2>
        </div>
        {/* <div className="col-12 mt-3 myTab">
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  {firstHalf.map((item: any) => (
                    <>
                      <div className="flex-mode">
                        <div className="flex-heading">{item.label}</div>
                        <div className="flex-text">{item.value}</div>
                      </div>
                    </>
                  ))}
                </div>
                <div className="col-md-6">
                  {secondHalf.map((item: any) => (
                    <>
                      <div className="flex-mode">
                        <div className="flex-heading">{item.label}</div>
                        <div className="flex-text">{item.value}</div>
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <div>
          <Tabs
            id="controlled-tab-example"
            className="position-relative tabs-overflow border-0"
            activeKey={selectTab}
            onSelect={(tab: any) => {
              setSelectedTab(tab);
            }}
          >
            {tapOptions.map((item: any) => (
              <Tab eventKey={item.key} title={item.title}>
                {selectTab === item.key && item.folder}
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </>
  );
};
export default ViewApplication;
