import { useNavigate } from "react-router-dom";
function AccountFinancing() {
  const navigate = useNavigate();

  const buttonLabels = [
    { label: "Vouchers", link: "vouchers" },
    { label: "Daybook", link: "daybook" },
    { label: "Trial Balance", link: "trialbalance" },
    { label: "Ledger", link: "ledger" },
    { label: "Collection", link: "collection" },
    { label: "Profit & Revenue", link: "profit-revenue" },
    // { label: "Cash Flow", link: "cash-flow" },
    { label: "Customer Statement", link: "customer-statement" },
    // { label: "Balance Sheet", link: "/balance-sheet" },
    // { label: "Profit & Loss", link: "/profit-loss" },
    // { label: "Cash Flow", link: "/cash-flow" },
    // { label: "Income Statement", link: "/income-statement" },
  ];
  const handleButtonClick = (link: any) => {
    navigate(link);
  };
  return (
    <>
      <div className="reports-container">
        <div className="button-grid">
          {buttonLabels.map((button, index) => (
            <button
              key={index}
              className="report-button"
              onClick={() => handleButtonClick(button.link)} // Handle navigation on click
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default AccountFinancing;
