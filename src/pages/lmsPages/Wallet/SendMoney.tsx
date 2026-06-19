import { useState } from "react";
import toast from "react-hot-toast";
import { Send, Banknote, Building2 } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";

import {
  adminSendExternalFt,
  adminSendIbft,
  adminListExternalFtByMobile,
  adminListIbftByMobile,
  AdminExternalFtRequest,
  AdminIbftRequest,
} from "../../../redux/apis/apisWalletAdmin";

type Rail = "FT" | "IBFT";

const newIdemKey = (prefix: string) => {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return `${prefix}-${rand}`;
};

const STATUS_BADGE: Record<string, string> = {
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  PROCESSING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const formatMoney = (value: number | null | undefined, currency?: string) => {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${amount} ${currency}` : amount;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const StatusBadge = ({ status }: { status?: string }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      STATUS_BADGE[status || ""] || "bg-muted text-foreground"
    }`}
  >
    {status || "-"}
  </span>
);

const SendMoney = () => {
  const [rail, setRail] = useState<Rail>("FT");

  // FT form
  const [ft, setFt] = useState({
    senderMobile: "",
    counterpartyName: "",
    counterpartyAccount: "",
    counterpartyEmail: "",
    counterpartyBankCode: "",
    amount: "",
    currency: "CAD",
    purposeNote: "",
  });

  // IBFT form
  const [ibft, setIbft] = useState({
    senderMobile: "",
    institutionNumber: "",
    accountNumber: "",
    beneficiaryName: "",
    bankName: "",
    amount: "",
    currency: "CAD",
    purposeNote: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // History
  const [historyMobile, setHistoryMobile] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const submitFt = async () => {
    if (!ft.senderMobile.trim()) return toast.error("Sender mobile is required");
    if (!ft.counterpartyName.trim())
      return toast.error("Beneficiary name is required");
    if (!ft.counterpartyAccount.trim())
      return toast.error("Beneficiary account is required");
    if (!ft.counterpartyBankCode.trim())
      return toast.error("Bank code is required");
    if (!Number(ft.amount) || Number(ft.amount) <= 0)
      return toast.error("Enter a valid amount");

    const body: AdminExternalFtRequest = {
      senderMobile: ft.senderMobile.trim(),
      counterpartyName: ft.counterpartyName.trim(),
      counterpartyAccount: ft.counterpartyAccount.trim(),
      counterpartyEmail: ft.counterpartyEmail.trim() || undefined,
      counterpartyBankCode: ft.counterpartyBankCode.trim(),
      amount: Number(ft.amount),
      currency: ft.currency.trim() || "CAD",
      purposeNote: ft.purposeNote.trim() || undefined,
      idempotencyKey: newIdemKey("admin-ext"),
    };
    setIsSubmitting(true);
    try {
      await adminSendExternalFt(body);
      toast.success("FT transfer initiated");
      setFt((s) => ({
        ...s,
        counterpartyName: "",
        counterpartyAccount: "",
        counterpartyEmail: "",
        amount: "",
        purposeNote: "",
      }));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to send FT transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitIbft = async () => {
    if (!ibft.senderMobile.trim()) return toast.error("Sender mobile is required");
    if (!ibft.institutionNumber.trim())
      return toast.error("Institution number is required");
    if (!ibft.accountNumber.trim())
      return toast.error("Account number is required");
    if (!ibft.beneficiaryName.trim())
      return toast.error("Beneficiary name is required");
    if (!Number(ibft.amount) || Number(ibft.amount) <= 0)
      return toast.error("Enter a valid amount");

    const body: AdminIbftRequest = {
      senderMobile: ibft.senderMobile.trim(),
      institutionNumber: ibft.institutionNumber.trim(),
      accountNumber: ibft.accountNumber.trim(),
      beneficiaryName: ibft.beneficiaryName.trim(),
      bankName: ibft.bankName.trim() || undefined,
      amount: Number(ibft.amount),
      currency: ibft.currency.trim() || "CAD",
      purposeNote: ibft.purposeNote.trim() || undefined,
      idempotencyKey: newIdemKey("admin-ibft"),
    };
    setIsSubmitting(true);
    try {
      await adminSendIbft(body);
      toast.success("IBFT transfer initiated");
      setIbft((s) => ({
        ...s,
        accountNumber: "",
        beneficiaryName: "",
        bankName: "",
        amount: "",
        purposeNote: "",
      }));
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to send IBFT transfer"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadHistory = async () => {
    if (!historyMobile.trim()) return toast.error("Enter a sender mobile");
    setIsHistoryLoading(true);
    try {
      const fn = rail === "FT" ? adminListExternalFtByMobile : adminListIbftByMobile;
      const res = await fn(historyMobile.trim(), 0, 20);
      const payload = res?.data?.data ? res.data : res?.data || {};
      const rows = payload?.data || payload || [];
      setHistory(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load transfer history");
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const historyHeaders = [
    {
      name: "Reference",
      cell: (row: any) => (
        <span className="font-mono text-xs">
          {row.transferNumber || row.reference || row.id || "-"}
        </span>
      ),
      width: "200px",
    },
    {
      name: "Beneficiary",
      cell: (row: any) => (
        <span className="text-sm">
          {row.counterpartyName || row.beneficiaryName || "-"}
        </span>
      ),
      width: "180px",
    },
    {
      name: "Amount",
      cell: (row: any) => (
        <span className="font-medium">{formatMoney(row.amount, row.currency)}</span>
      ),
      width: "150px",
    },
    {
      name: "Status",
      cell: (row: any) => <StatusBadge status={row.status} />,
      width: "140px",
    },
    {
      name: "Date",
      cell: (row: any) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
      width: "180px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0">Send Money</h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">
          Send funds out of a customer wallet (identified by sender mobile) to an
          external bank account.
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">New Transfer</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={rail} onValueChange={(v) => setRail(v as Rail)}>
            <TabsList className="mb-4 wallet-tabs">
              <TabsTrigger value="FT" className="gap-2 wallet-tab-trigger">
                <Banknote className="h-4 w-4" /> FT (Scotia RTP)
              </TabsTrigger>
              <TabsTrigger value="IBFT" className="gap-2 wallet-tab-trigger">
                <Building2 className="h-4 w-4" /> IBFT (Scotia EFT)
              </TabsTrigger>
            </TabsList>

            {/* FT form */}
            <TabsContent value="FT">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Sender Mobile" required>
                  <Input
                    placeholder="+9665XXXXXXXX"
                    value={ft.senderMobile}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, senderMobile: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Beneficiary Name" required>
                  <Input
                    placeholder="John Doe"
                    value={ft.counterpartyName}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, counterpartyName: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Beneficiary Account" required>
                  <Input
                    placeholder="1234567"
                    value={ft.counterpartyAccount}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, counterpartyAccount: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Bank Code" required>
                  <Input
                    placeholder="002"
                    value={ft.counterpartyBankCode}
                    onChange={(e) =>
                      setFt((s) => ({
                        ...s,
                        counterpartyBankCode: e.target.value,
                      }))
                    }
                  />
                </FormField>
                <FormField label="Beneficiary Email">
                  <Input
                    placeholder="john@example.com"
                    value={ft.counterpartyEmail}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, counterpartyEmail: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Amount" required>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={ft.amount}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, amount: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Currency">
                  <Input
                    value={ft.currency}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, currency: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Purpose Note" className="md:col-span-2">
                  <Textarea
                    placeholder="Invoice payment"
                    rows={2}
                    value={ft.purposeNote}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, purposeNote: e.target.value }))
                    }
                  />
                </FormField>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  className="gap-2 wallet-brand-btn"
                  onClick={submitFt}
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send FT Transfer"}
                </Button>
              </div>
            </TabsContent>

            {/* IBFT form */}
            <TabsContent value="IBFT">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Sender Mobile" required>
                  <Input
                    placeholder="+9665XXXXXXXX"
                    value={ibft.senderMobile}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, senderMobile: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Beneficiary Name" required>
                  <Input
                    placeholder="John Doe"
                    value={ibft.beneficiaryName}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, beneficiaryName: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Institution Number" required>
                  <Input
                    placeholder="002"
                    value={ibft.institutionNumber}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, institutionNumber: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Account Number" required>
                  <Input
                    placeholder="1234567"
                    value={ibft.accountNumber}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, accountNumber: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Bank Name">
                  <Input
                    placeholder="Scotiabank"
                    value={ibft.bankName}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, bankName: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Amount" required>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={ibft.amount}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, amount: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Currency">
                  <Input
                    value={ibft.currency}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, currency: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Purpose Note" className="md:col-span-2">
                  <Textarea
                    placeholder="Transfer"
                    rows={2}
                    value={ibft.purposeNote}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, purposeNote: e.target.value }))
                    }
                  />
                </FormField>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  className="gap-2 wallet-brand-btn"
                  onClick={submitIbft}
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send IBFT Transfer"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              Transfer History ({rail})
            </span>
            <AntInput
              allowClear
              placeholder="Search by sender mobile"
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={historyMobile}
              onChange={(e) => setHistoryMobile(e.target.value)}
              onPressEnter={loadHistory}
              style={{ width: 300, minWidth: 200, borderRadius: 6, height: 40 }}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableView
            header={historyHeaders}
            data={history}
            isLoading={isHistoryLoading}
            paginationShow={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const FormField = ({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`space-y-2 ${className || ""}`}>
    <Label>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
  </div>
);

export default SendMoney;
