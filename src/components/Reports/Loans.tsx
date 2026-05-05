import { useNavigate } from "react-router-dom";
import { FileTextOutlined, RightOutlined } from "@ant-design/icons";

function Loans() {
  const navigate = useNavigate();

  const buttonLabels = [
    { label: "Over Due Loans Report", link: "overdue" },
    { label: "Non Performing Loans Report", link: "performingLoans" },
    { label: "Due Loans Reports", link: "due" },
    { label: "Early Settlement Reports", link: "earlySettlement" },
    { label: "Write Off Loans Report", link: "writeOff" },
    { label: "Loan Disbursement Report", link: "disbursement" },
    { label: "Repayment Schedule Report", link: "repaymentScheduleReport" },
    { label: "Loan Balance & Outstanding Report", link: "loanBalanceReport" },
    { label: "Daily Transaction Summary", link: "dailyTransactionSummary" },
  ];

  const handleButtonClick = (link: string) => {
    navigate(link);
  };

  return (
    <div>
      <div
        className="d-flex justify-content-between align-items-center mb-4 pb-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h5
          className="mb-0"
          style={{ fontWeight: 600, color: "var(--foreground)" }}
        >
          Loan Reports
        </h5>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {buttonLabels.map((button) => (
          <button
            key={button.link}
            onClick={() => handleButtonClick(button.link)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "16px 18px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              color: "var(--foreground)",
              fontWeight: 500,
              fontSize: 14,
              transition:
                "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "var(--muted)",
                  color: "var(--primary)",
                  fontSize: 18,
                }}
              >
                <FileTextOutlined />
              </span>
              <span>{button.label}</span>
            </div>
            <RightOutlined
              style={{ color: "var(--muted-foreground)", fontSize: 12 }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default Loans;
