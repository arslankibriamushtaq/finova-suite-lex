import React, { useState } from "react";
import { Button, Tab, Tabs } from "react-bootstrap";
import { Images } from "../Config/Images";

const SimahCheck = () => {
  const [selectTab, setSelectedTab] = useState();
  const tapOptions = [
    {
      title: "Consumer Inquiry",
      key: "ConsumerInquiry",
      folder: "",
    },
    {
      title: "Upload Simah Consumer Document",
      key: "UploadSimahConsumerDocument",
      folder: <DocumentGallery />,
    },
  ];
  return (
    <div className="p-0">
      <div
        className="bordered-section p-3"
        style={{ borderTopLeftRadius: "0px" }}
      >
        <div className="row p-3 nested-tab">
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
    </div>
  );
};
export default SimahCheck;

const DocumentGallery = () => {
  const docs = Array(12).fill({
    name: "Document 1",
    date: "12/05/2024",
  });

  return (
    <div className="p-0">
      <div className="my-2">
        <div className="d-flex justify-content-end mb-3">
          <Button className="theme-btn-next  px-3 py-2 ">
            Upload Document
          </Button>
        </div>
        <div className="d-flex flex-wrap gap-3">
          {docs.map((doc, i) => (
            <div
              key={i}
              className="d-flex flex-column justify-content-between p-3 rounded-3 align-items-start"
              style={{
                width: 176,
                height: 176,
                background: "var(--theme-inactive-tab)",
                color: "var(--foreground)",
              }}
            >
              <div className="fs-4">
                <img src={Images.docIon} />
              </div>
              <div>
                <div className="fw-600 fs-6 mb-2">{doc.name}</div>
                <div className="fs-14">{doc.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
