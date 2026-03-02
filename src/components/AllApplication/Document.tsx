import React from "react";
import { Button, Container } from "react-bootstrap";
import { Images } from "../Config/Images";

const DocumentGallery = () => {
  const docs = Array(12).fill({
    name: "Document 1",
    date: "12/05/2024",
  });

  return (
    <div className="p-0">
      <div
        className="bordered-section p-3"
        style={{ borderTopLeftRadius: "0px" }}
      >
        <div className="my-4 p-3">
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
    </div>
  );
};

export default DocumentGallery;
