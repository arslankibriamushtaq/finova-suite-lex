import React from "react";

function PartnerFactoringApproval({ setActiveTab }: any) {
  const detailSections = [
    { label: "Annual Revenue", value: "2" },
    { label: "Average Invoice Value", value: "1990-01-01" },
    { label: "Outstanding Invoices Value", value: "Male" },
    { label: "Approved Invoicing Value", value: "Pakistani" },
  ];

  const detailSections2 = [
    { label: "Status", value: "123 Street, City, Country" },
    { label: "Approval Date", value: "+923001234567" },
    { label: "Approved By", value: "example@example.com" },
    { label: "Approved Invoicing Value", value: "ABC Ltd." },
  ];

  return (
    <div
      className="p-3 mt-3 mb-3"
      style={{ background: "white", borderRadius: "6px" }}
    >
      <div className="row g-3 p-3">
        <h5 className="mt-5 mb-3">Factoring Info:</h5>
        {detailSections.map((section, index) => (
          <div
            key={index}
            className="col-12 d-flex justify-content-between border-bottom p-2"
          >
            <div>{section.label}</div>
            <div className="fw-bold">{section.value}</div>
          </div>
        ))}

        <h5 className="mt-5 mb-3">FACTORING-AMOUNT-APPROVED</h5>
        {detailSections2.map((section, index) => (
          <div
            key={index}
            className="col-12 d-flex justify-content-between border-bottom p-2"
          >
            <div>{section.label}</div>
            <div className="fw-bold">{section.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PartnerFactoringApproval;
