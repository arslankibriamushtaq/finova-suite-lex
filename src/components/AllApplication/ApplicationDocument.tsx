import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import ApplicationDocumentRequest from "./ApplicationDocumentRequest";
import ApplicationDocumentView from "./ApplicationDocumentView";

const ApplicationDocument = () => {
  const [selectTab, setSelectedTab] = useState("RequestDocuments");
  const tapOptions = [
    {
      title: "Request Documents",
      key: "RequestDocuments",
      folder: <ApplicationDocumentRequest />,
    },
    {
      title: "View Documents",
      key: "ViewDocuments",
      folder: <ApplicationDocumentView />,
    },
  ];

  return (
    <>
      <div className="cs-table">
        <div className="col-lg-12 search-bar col-12 d-flex align-items-center">
          <h2 className="col-lg-6 col-12">View Application</h2>
        </div>

        <div>
          <Tabs
            id="controlled-tab-example"
            className="mt-30 position-relative tabs-overflow mt-3"
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
export default ApplicationDocument;
