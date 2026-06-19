import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import BusinessInfoTab from './CompleteApplicationTabs/BusinessInfoTab';
import DetailManagerTab from './CompleteApplicationTabs/DetailManagerTab';
import FactoringInfoTab from './CompleteApplicationTabs/FactoringInfoTab';
import InvoicesTab from './CompleteApplicationTabs/InvoicesTab';
import ThankYouTab from './CompleteApplicationTabs/ThankYouTab';

const CompleteApplication = () => {
  const { id } = useParams();
  const location = useLocation();
  const applicationData = location.state?.application || {};
  
  const [mainTab, setMainTab] = useState("Summary");
  const [subTab, setSubTab] = useState("BusinessInfo");

  // Get application number from params or state
  const applicationNumber = id || applicationData?.applicationNumber || "FVAN-6152142950";
  const status = applicationData?.status || "CREDIT-CHECK-APPROVED";

  return (
    <div className="container-fluid px-4 p-2 mt-2">
      {/* Status Badge and Application Number */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <span
          style={{
            backgroundColor: "var(--color-status-active)",
            color: "var(--primary-foreground)",
            padding: "6px 16px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {status}
        </span>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          {applicationNumber}
        </h1>
      </div>

      {/* Main Tabs */}
      <Tabs
        id="main-tabs"
        activeKey={mainTab}
        onSelect={(key: any) => {
          setMainTab(key);
          if (key === "Summary") {
            setSubTab("BusinessInfo");
          }
        }}
        className="mb-3"
      >
        <Tab eventKey="Summary" title="Summary">
          {mainTab === "Summary" && (
            <div className="mt-3">
              {/* Sub-tabs */}
              <Tabs
                id="sub-tabs"
                activeKey={subTab}
                onSelect={(key: any) => setSubTab(key)}
                className="mb-3"
              >
                <Tab eventKey="BusinessInfo" title="Business Info">
                  {subTab === "BusinessInfo" && (
                    <BusinessInfoTab applicationData={applicationData} />
                  )}
                </Tab>
                <Tab eventKey="DetailManager" title="Detail Manager">
                  {subTab === "DetailManager" && (
                    <DetailManagerTab applicationData={applicationData} />
                  )}
                </Tab>
                <Tab eventKey="FactoringInfo" title="Factoring Info">
                  {subTab === "FactoringInfo" && (
                    <FactoringInfoTab applicationData={applicationData} />
                  )}
                </Tab>
                <Tab eventKey="Invoices" title="Invoices">
                  {subTab === "Invoices" && (
                    <InvoicesTab applicationData={applicationData} />
                  )}
                </Tab>
              </Tabs>
            </div>
          )}
        </Tab>
        <Tab eventKey="ThankYou" title="Thank You">
          {mainTab === "ThankYou" && (
            <ThankYouTab applicationData={applicationData} />
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default CompleteApplication;

