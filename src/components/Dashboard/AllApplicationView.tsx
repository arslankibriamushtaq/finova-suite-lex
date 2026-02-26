import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";

import SimahCheckTab from "./SimahCheckTab";
import BayaanCheck from "./BayaanCheck";
import CompilanceCheck from "./CompilanceCheck";
import CreditCheck from "./CreditCheck";
import ApplicationApproval from "./ApplicationApproval";
import ApplicationStepper from "./ApplicationStepper";
import { useLocation } from "react-router-dom";
import PersonalInformation from "./ApplicationDetailsTabs/PersonalInfo";
import LoanInformation from "./ApplicationDetailsTabs/LoanInfo";
import SalaryDetails from "./ApplicationDetailsTabs/SalaryDetails";
import Document from "./ApplicationDetailsTabs/Document";
import ReschedulingDocuments from "./ApplicationDetailsTabs/ReschedulingDocuments";
const AllApplicationView = () => {
  localStorage.setItem("tabs", "PersonalInformation");
  const getTabs = localStorage.getItem("tabs");
  const location = useLocation();
  const rowData = location.state?.rowData;
  const [selectTab, setSelectedTab] = useState<any>(getTabs);
  const tapOptions = [
    // {
    //   title: "Business Information ",
    //   key: "BusinessInformation",
    //   folder: <BusinessInformation />,
    // },
    {
      title: "Personal Information",
      key: "PersonalInformation",
      folder: <PersonalInformation/>,
    },
    {
      title: "Loan Information",
      key: "LoanInformation",
      folder: <LoanInformation applicationData={rowData} />,
    },
    {
      title: "Employment & Salary Details",
      key: "SalaryInformation",
      folder: <SalaryDetails/>,
    },
    {
      title: "Document",
      key: "Document",
      folder: <Document/>,
    },
    // {
    //   title: "Manager List ",
    //   key: "ManagerList",
    //   folder: <ManagerList/>,
    // },
    // {
    //   title: "Manager Information",
    //   key: "ManagerInformation",
    //   folder: <ManagerInformation setSelectedTab={setSelectedTab} />,
    // },
    // {
    //   title: "Financing Information",
    //   key: "FinancingInformation",
    //   folder: <FactoringTab setSelectedTab={setSelectedTab} />,
    // },
    // {
    //   title: "Revenue Details",
    //   key: "RevenueDetails",
    //   folder: <RevenueDetails setSelectedTab={setSelectedTab} />,
    // },
    // {
    //   title: "Disclaimer",
    //   key: "Disclaimer",
    //   folder: <Disclaimer setSelectedTab={setSelectedTab} />,
    // },
    // {
    //   title: "E-Promissory Note",
    //   key: "EpromissoryNote",
    //   folder: <EpromissoryNote setSelectedTab={setSelectedTab} />,
    // },
    {
      title: "Simah Check",
      key: "SimahCheckTab",
      folder: <SimahCheckTab/>,
    },
    {
      title: "Open Banking Check",
      key: "BayaanCheck",
      folder: <BayaanCheck/>,
    },
    {
      title: "Compilance Check",
      key: "compilanceCheck",
      folder: <CompilanceCheck setSelectedTab={setSelectedTab} />,
    },
    {
      title: "Credit Check",
      key: "creditCheck",
      folder: <CreditCheck setSelectedTab={setSelectedTab} />,
    },
    {
      title: "Approval",
      key: "approval",
      folder: <ApplicationApproval /* setSelectedTab={setSelectedTab} */ />,
    },
    // {
    //   title: "Payment Status",
    //   key: "paymentStatus",
    //   folder:<PaymentStatus/>,
    // }
    {
      title: "Rescheduling Request",
      key: "reschedulingDocuments",
      folder: <ReschedulingDocuments /* setSelectedTab={setSelectedTab} */ />,
    },
  ];
  return (
    <>
    <ApplicationStepper steps={rowData?.steps} />
      <Tabs
        id="controlled-tab-example"
        className="mt-30 position-relative tabs-overflow"
        activeKey={selectTab}
        style={{ display: "flex", flexWrap: "nowrap" }}
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
    </>
  );
};

export default AllApplicationView;
