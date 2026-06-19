import { useNavigate } from "react-router-dom";
import {
  Receipt,
  NotebookText,
  Scale,
  Library,
  HandCoins,
  TrendingUp,
  FileText,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type ReportCard = { label: string; link: string; color: string; Icon: LucideIcon };

function AccountFinancing() {
  const navigate = useNavigate();

  const buttonLabels: ReportCard[] = [
    { label: "Vouchers", link: "vouchers", color: "#10b981", Icon: Receipt },
    { label: "Daybook", link: "daybook", color: "#14b8a6", Icon: NotebookText },
    { label: "Trial Balance", link: "trialbalance", color: "#06b6d4", Icon: Scale },
    { label: "Ledger", link: "ledger", color: "#6366f1", Icon: Library },
    { label: "Collection", link: "collection", color: "#22c55e", Icon: HandCoins },
    { label: "Profit & Revenue", link: "profit-revenue", color: "#8b5cf6", Icon: TrendingUp },
    { label: "Customer Statement", link: "customer-statement", color: "#f59e0b", Icon: FileText },
  ];

  const handleButtonClick = (link: string) => {
    navigate(link);
  };

  // Per-card pastel surface — mixes the card color over theme surfaces so it
  // adapts to light/dark automatically (soft tint in light, tinted glass in dark).
  const cardBg = (c: string) =>
    `linear-gradient(135deg, color-mix(in srgb, ${c} 16%, var(--card)) 0%, color-mix(in srgb, ${c} 4%, var(--card)) 100%)`;
  const cardBorder = (c: string) => `1px solid color-mix(in srgb, ${c} 24%, var(--border))`;
  const cardShadow = (c: string) => `0 6px 18px -12px color-mix(in srgb, ${c} 50%, transparent)`;

  return (
    <div className="service account-financing-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Accounting &amp; Financing Reports</h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {buttonLabels.map((button) => {
          const Icon = button.Icon;
          const c = button.color;
          return (
            <button
              key={button.link}
              onClick={() => handleButtonClick(button.link)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "16px 18px",
                background: cardBg(c),
                border: cardBorder(c),
                borderRadius: 6,
                cursor: "pointer",
                textAlign: "left",
                color: "var(--foreground)",
                fontWeight: 600,
                fontSize: 14,
                boxShadow: cardShadow(c),
                transition:
                  "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${c} 45%, var(--border))`;
                e.currentTarget.style.boxShadow = `0 14px 26px -12px color-mix(in srgb, ${c} 55%, transparent)`;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = cardBorder(c);
                e.currentTarget.style.boxShadow = cardShadow(c);
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
                    borderRadius: 6,
                    flexShrink: 0,
                    background: `color-mix(in srgb, ${c} 22%, var(--card))`,
                    color: `color-mix(in srgb, ${c} 78%, var(--foreground))`,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c} 20%, transparent)`,
                  }}
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                <span>{button.label}</span>
              </div>
              <ChevronRight size={16} style={{ color: c, flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AccountFinancing;
