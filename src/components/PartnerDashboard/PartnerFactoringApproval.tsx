import React from "react";
import { useTranslation } from "react-i18next";

function PartnerFactoringApproval({ setActiveTab }: any) {
  const { t } = useTranslation("partner");
  const detailSections = [
    { label: t("factoringApproval.annualRevenue"), value: "2" },
    { label: t("factoringApproval.averageInvoiceValue"), value: "1990-01-01" },
    { label: t("factoringApproval.outstandingInvoicesValue"), value: "Male" },
    { label: t("factoringApproval.approvedInvoicingValue"), value: "Pakistani" },
  ];

  const detailSections2 = [
    { label: t("common:status"), value: "123 Street, City, Country" },
    { label: t("factoringApproval.approvalDate"), value: "+923001234567" },
    { label: t("factoringApproval.approvedBy"), value: "example@example.com" },
    { label: t("factoringApproval.approvedInvoicingValue"), value: "ABC Ltd." },
  ];

  return (
    <div
      className="p-3 mt-3 mb-3"
      style={{ background: "white", borderRadius: "2px" }}
    >
      <div className="row g-3 p-3">
        <h5 className="mt-5 mb-3">{t("factoringApproval.factoringInfo")}</h5>
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
