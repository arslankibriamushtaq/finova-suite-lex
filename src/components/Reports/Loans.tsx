import { useNavigate } from "react-router-dom";
function Loans() {
  const navigate = useNavigate();

  const buttonLabels = [
    { label: "Over Due Loans Report", link: "overdue" },
    { label: "Non Performing Loans Report", link: "performingLoans" },
    { label: "Due Loans Reports", link: "due" },
    { label: "Early Settlement Reports", link: "earlySettlement" },
    { label: "Write Off Loans Report", link: "writeOff" },
    // { label: "Loan Portfolio Report", link: "brokenPromise" },
    // { label: "Aging Report", link: "aging" },
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

export default Loans;
