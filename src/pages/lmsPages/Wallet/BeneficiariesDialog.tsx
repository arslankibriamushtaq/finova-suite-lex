import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Users, Landmark, Globe, RefreshCw, Inbox, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  getCustomerBeneficiaries,
  CustomerBeneficiariesResponse,
} from "../../../redux/apis/apisWalletAdmin";

interface Props {
  /** When non-null the dialog opens and loads this customer's beneficiaries. */
  customerId: string | null;
  onClose: () => void;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const ActiveBadge = ({ active }: { active?: boolean }) => {
  const { t } = useTranslation("walletBlocks");
  return (
  <span
    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
    style={{
      backgroundColor: active ? "rgba(200, 29, 37,0.12)" : "rgba(100,116,139,0.12)",
      color: active ? "rgb(21,128,61)" : "rgb(71,85,105)",
    }}
  >
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: active ? "rgb(34,197,94)" : "rgb(148,163,184)" }}
    />
    {active ? t("beneficiaries.active") : t("beneficiaries.inactive")}
  </span>
  );
};

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) => (
  <div
    className="flex-1 rounded-lg border px-4 py-3"
    style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}
  >
    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div
      className="mt-1 font-bold"
      style={{ fontSize: "1.5rem", lineHeight: 1.1, color: accent || "var(--foreground)" }}
    >
      {value}
    </div>
  </div>
);

const SectionTitle = ({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) => (
  <div className="mb-3 flex items-center gap-2">
    <span className="text-muted-foreground">{icon}</span>
    <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{label}</span>
    <span
      className="ms-1 inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold"
      style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
    >
      {count}
    </span>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div
    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-sm text-muted-foreground"
    style={{ borderColor: "var(--border)" }}
  >
    <Inbox className="h-5 w-5 opacity-60" />
    {text}
  </div>
);

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--muted-foreground)",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: "13px",
  color: "var(--foreground)",
  verticalAlign: "middle",
};

const BeneficiaryTable = ({
  columns,
  rows,
}: {
  columns: { key: string; label: string }[];
  rows: React.ReactNode[][];
}) => (
  <div
    className="overflow-x-auto rounded-lg border"
    style={{ borderColor: "var(--border)" }}
  >
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
      <thead>
        <tr style={{ backgroundColor: "var(--muted)" }}>
          {columns.map((c) => (
            <th key={c.key} style={thStyle}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, i) => (
          <tr
            key={i}
            style={{
              borderTop: "1px solid var(--border)",
              backgroundColor: i % 2 ? "var(--muted)" : "transparent",
            }}
          >
            {cells.map((cell, j) => (
              <td key={j} style={tdStyle}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const mono = (v: React.ReactNode) => (
  <span className="font-mono" style={{ fontSize: "12px" }}>
    {v}
  </span>
);

const BeneficiariesDialog = ({ customerId, onClose }: Props) => {
  const { t } = useTranslation("walletBlocks");
  const [data, setData] = useState<CustomerBeneficiariesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!customerId) {
      setData(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await getCustomerBeneficiaries(customerId);
        const payload = res?.data?.data || res?.data;
        if (!cancelled) setData(payload || null);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast.error(t("beneficiaries.toast.loadFailed"));
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const iban = data?.ibanBeneficiaries || [];
  const ibft = data?.ibftBeneficiaries || [];

  return (
    <Dialog open={!!customerId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-4xl gap-0"
        style={{ maxHeight: "88vh", overflowY: "auto", padding: 0 }}
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader
          className="relative border-b px-6 pt-6 pb-4"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common:close")}
            className="absolute flex items-center justify-center rounded-full transition-colors"
            style={{
              top: 16,
              right: 16,
              height: 32,
              width: 32,
              border: "none",
              background: "transparent",
              color: "var(--muted-foreground)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--muted)";
              e.currentTarget.style.color = "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--muted-foreground)";
            }}
          >
            <X className="h-[18px] w-[18px]" />
          </button>
          <DialogTitle
            className="flex items-center gap-3"
            style={{ fontSize: "1.125rem", fontWeight: 600 }}
          >
            <span className="wallet-brand-bg inline-flex h-9 w-9 items-center justify-center rounded-lg">
              <Users className="h-5 w-5" />
            </span>
            {t("beneficiaries.title")}
          </DialogTitle>
          <DialogDescription style={{ marginTop: 2 }}>
            {t("beneficiaries.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              {t("beneficiaries.loading")}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Stat cards */}
              <div className="flex gap-3">
                <StatCard label={t("beneficiaries.stat.total")} value={data?.totalCount ?? 0} />
                <StatCard
                  label={t("beneficiaries.stat.iban")}
                  value={data?.ibanCount ?? 0}
                  accent="rgb(37,99,235)"
                />
                <StatCard
                  label={t("beneficiaries.stat.ibft")}
                  value={data?.ibftCount ?? 0}
                  accent="rgb(124,58,237)"
                />
              </div>

              {/* IBAN Beneficiaries */}
              <section>
                <SectionTitle
                  icon={<Landmark className="h-4 w-4" />}
                  label={t("beneficiaries.ibanSection")}
                  count={iban.length}
                />
                {iban.length === 0 ? (
                  <EmptyState text={t("beneficiaries.emptyIban")} />
                ) : (
                  <BeneficiaryTable
                    columns={[
                      { key: "nickname", label: t("beneficiaries.col.nickname") },
                      { key: "beneficiary", label: t("beneficiaries.col.beneficiary") },
                      { key: "iban", label: t("beneficiaries.col.iban") },
                      { key: "bank", label: t("beneficiaries.col.bank") },
                      { key: "status", label: t("beneficiaries.col.status") },
                      { key: "created", label: t("beneficiaries.col.created") },
                    ]}
                    rows={iban.map((b) => [
                      b.nickname || "-",
                      <span className="font-medium">{b.beneficiaryName}</span>,
                      mono(b.iban),
                      b.bankName || b.bankCode || "-",
                      <ActiveBadge active={b.active} />,
                      <span className="text-muted-foreground">
                        {formatDate(b.createdAt)}
                      </span>,
                    ])}
                  />
                )}
              </section>

              {/* IBFT Beneficiaries */}
              <section>
                <SectionTitle
                  icon={<Globe className="h-4 w-4" />}
                  label={t("beneficiaries.ibftSection")}
                  count={ibft.length}
                />
                {ibft.length === 0 ? (
                  <EmptyState text={t("beneficiaries.emptyIbft")} />
                ) : (
                  <BeneficiaryTable
                    columns={[
                      { key: "nickname", label: t("beneficiaries.col.nickname") },
                      { key: "beneficiary", label: t("beneficiaries.col.beneficiary") },
                      { key: "institution", label: t("beneficiaries.col.institution") },
                      { key: "account", label: t("beneficiaries.col.account") },
                      { key: "bank", label: t("beneficiaries.col.bank") },
                      { key: "currency", label: t("beneficiaries.col.currency") },
                      { key: "status", label: t("beneficiaries.col.status") },
                    ]}
                    rows={ibft.map((b) => [
                      b.nickname || "-",
                      <span className="font-medium">{b.beneficiaryName}</span>,
                      b.institutionNumber,
                      mono(b.accountNumber),
                      b.bankName || "-",
                      b.currency || "-",
                      <ActiveBadge active={b.active} />,
                    ])}
                  />
                )}
              </section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficiariesDialog;
