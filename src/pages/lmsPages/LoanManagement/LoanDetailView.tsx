
import { Button } from "antd";
import { useTranslation } from "react-i18next";


const LoanDetailView = () => {
  const { t } = useTranslation("loanManagement");
  const labelText = (label: string): string => {
    const map: Record<string, string> = {
      Name: t("field.name"),
      Email: t("common:email"),
      "Mobile No.": t("loanDetail.labelMobileNo"),
      Country: t("loanDetail.labelCountry"),
      "Invoice No.": t("loanDetail.labelInvoiceNo"),
      Date: t("common:date"),
      Reference: t("loanDetail.labelReference"),
      Status: t("common:status"),
      "Sub Total": t("loanDetail.subTotal"),
      Discount: t("loanDetail.discount"),
      "Taxable Total": t("loanDetail.taxableTotal"),
      VAT: t("loanDetail.vat"),
    };
    return map[label] ?? label;
  };
  const companyInfo = [
    { label: "Name", value: "FINOVA Financing" },
    { label: "Email", value: "info@email.com" },
    { label: "Mobile No.", value: "9661234657981" },
    { label: "Country", value: "Saudi Arabia" },
  ];
  const invoiceInfo = [
    { label: "Invoice No.", value: "Sale150Inv" },
    { label: "Date", value: "8/28/2024 11:23:04 AM" },
    { label: "Reference", value: "--------------------" },
    { label: "Status", value: "Approved" },
  ];
  const customerInfo = [
    { label: "Name", value: "M Ahmad" },
    { label: "Mobile No.", value: "9661234657981" },
  ];
  const invoiceTotals = [
    { label: "Sub Total", value: "SAR 570.00" },
    { label: "Discount", value: "SAR 0.00" },
    { label: "Taxable Total", value: "SAR 1,500.00" },
    { label: "VAT", value: "SAR 0.00" },
  ];

  return (
    <>
      <h3>{t("loanDetail.title")}</h3>
      <div style={{ border: "1px solid var(--color-border-light)", borderRadius: "2px" }}>
        <div className="col-12 d-flex pb-2 px-3 mt-2">
          <div className="col-6 d-flex align-items-center">
            <div className="col-6">
              <div>
                {t("loanDetail.product")} :{" "}
                <span style={{ fontWeight: "600" }}>Microfinance</span>
              </div>
            </div>
            <div className="col-6">
              <div>
                {t("loanDetail.invoiceNo")} :{" "}
                <span style={{ fontWeight: "600" }}>Sale150Inv</span>
              </div>
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <Button
              style={{
                borderRadius: "2px",
                border: "transparent",
              }}
              className="invoice-btn"
              onClick={() => {
                // setAddCustomerModal(true);
              }}
            >
              {t("loanDetail.exportPdf")}
            </Button>
          </div>
        </div>
        <div
          className="mx-3"
          style={{ borderBottom: "1px solid var(--color-border-light)" }}
        ></div>
        <div className="col-12 d-flex mt-2 px-2">
          <div className="col-md-4 p-2">
            <div className="fw-bold">{t("loanDetail.customerInfo")}</div>
            {customerInfo.map((info, index) => (
              <div
                key={index}
                className="p-3 mt-3 d-flex"
                style={{ backgroundColor: "var(--color-surface-muted)" }}
              >
                <div
                  className="col-6 fw-semibold"
                  style={{ fontWeight: "600" }}
                >
                  {labelText(info.label)}
                </div>
                <div className="col-6 d-flex justify-content-end">
                  {info.value}
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-4 p-2">
            <div className="fw-bold">{t("loanDetail.companyInfo")}</div>
            {companyInfo.map((info, index) => (
              <div
                key={index}
                className="p-3 mt-3 d-flex "
                style={{ backgroundColor: "var(--color-surface-muted)" }} // Optional: Can be removed if using Bootstrap classes
              >
                <div
                  className="col-6 fw-semibold"
                  style={{ fontWeight: "600" }}
                >
                  {labelText(info.label)}
                </div>
                <div className="col-6 d-flex justify-content-end">
                  {info.value}
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-4 p-2">
            <div className="fw-bold">{t("loanDetail.invoiceInfo")}</div>
            {invoiceInfo.map((info, index) => (
              <div
                key={index}
                className="p-3 mt-3 d-flex"
                style={{
                  backgroundColor: "var(--color-surface-muted)",
                  whiteSpace: info.label === "Date" ? "nowrap" : "normal",
                }}
              >
                <div
                  className="col-6 fw-semibold"
                  style={{ fontWeight: "600" }}
                >
                  {labelText(info.label)}
                </div>
                <div className="col-6 d-flex justify-content-end">
                  {info.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="mx-3 mt-2"
          style={{ borderBottom: "1px solid var(--color-border-light)" }}
        ></div>
        <div className="col-12 d-flex mt-2 px-2">
          <div className="col-4 "></div>
          <div className="col-4 "></div>
          <div className="col-4">
            {invoiceTotals.map((item, index) => (
              <div key={index} className="p-2 mt-2 d-flex">
                <div className="col-6" style={{ fontWeight: "600" }}>
                  {labelText(item.label)}
                </div>
                <div className="col-6 d-flex justify-content-end">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="mx-3 mt-2"
          style={{ borderBottom: "1px solid var(--color-border-light)" }}
        ></div>
        <div className="col-12 d-flex mt-2 px-2">
          <div className="col-4 "></div>
          <div className="col-4 "></div>
          <div className="col-4 ">
            {" "}
            <div className="p-2 mt-2 mb-2 d-flex">
              <div className="col-6" style={{ fontWeight: "600" }}>
                {t("loanDetail.grandTotal")}
              </div>
              <div className="col-6 d-flex justify-content-end">SAR570.00</div>
            </div>
          </div>
        </div>
        <div
          className="mx-3 mt-2 mb-5"
          style={{ borderBottom: "1px solid var(--color-border-light)" }}
        ></div>
      </div>
    </>
  );
};

export default LoanDetailView;
