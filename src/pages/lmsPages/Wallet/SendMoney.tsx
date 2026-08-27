import { useState } from "react";
import toast from "react-hot-toast";
import { Send, History } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

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
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
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
  const { t } = useTranslation("walletBlocks");
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
    if (!ft.senderMobile.trim()) return toast.error(t("send.valid.senderMobile"));
    if (!ft.counterpartyName.trim())
      return toast.error(t("send.valid.beneficiaryName"));
    if (!ft.counterpartyAccount.trim())
      return toast.error(t("send.valid.beneficiaryAccount"));
    if (!ft.counterpartyBankCode.trim())
      return toast.error(t("send.valid.bankCode"));
    if (!Number(ft.amount) || Number(ft.amount) <= 0)
      return toast.error(t("send.valid.amount"));

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
      toast.success(t("send.toast.ftInitiated"));
      setFt((s) => ({
        ...s,
        counterpartyName: "",
        counterpartyAccount: "",
        counterpartyEmail: "",
        amount: "",
        purposeNote: "",
      }));
      // Immediately reflect the new transfer in the history below.
      setRail("FT");
      setHistoryMobile(body.senderMobile);
      loadHistory(body.senderMobile, "FT");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || t("send.toast.ftFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitIbft = async () => {
    if (!ibft.senderMobile.trim()) return toast.error(t("send.valid.senderMobile"));
    if (!ibft.institutionNumber.trim())
      return toast.error(t("send.valid.institutionNumber"));
    if (!ibft.accountNumber.trim())
      return toast.error(t("send.valid.accountNumber"));
    if (!ibft.beneficiaryName.trim())
      return toast.error(t("send.valid.beneficiaryName"));
    if (!Number(ibft.amount) || Number(ibft.amount) <= 0)
      return toast.error(t("send.valid.amount"));

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
      toast.success(t("send.toast.ibftInitiated"));
      setIbft((s) => ({
        ...s,
        accountNumber: "",
        beneficiaryName: "",
        bankName: "",
        amount: "",
        purposeNote: "",
      }));
      // Immediately reflect the new transfer in the history below.
      setRail("IBFT");
      setHistoryMobile(body.senderMobile);
      loadHistory(body.senderMobile, "IBFT");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("send.toast.ibftFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadHistory = async (mobileArg?: string, railArg?: Rail) => {
    const mobile = (typeof mobileArg === "string" ? mobileArg : historyMobile).trim();
    if (!mobile) return toast.error(t("send.toast.enterMobile"));
    const activeRail = railArg || rail;
    setIsHistoryLoading(true);
    try {
      const fn =
        activeRail === "FT" ? adminListExternalFtByMobile : adminListIbftByMobile;
      const res = await fn(mobile, 0, 20);
      // Unwrap the response envelope: supports { data: [] }, { data: { content: [] } },
      // { content: [] }, or a bare array.
      const body = res?.data ?? {};
      const inner = body?.data ?? body;
      const rows = Array.isArray(inner)
        ? inner
        : inner?.content ?? inner?.data ?? [];
      setHistory(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error(t("send.toast.loadHistoryFailed"));
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const historyHeaders = [
    {
      name: t("send.col.reference"),
      cell: (row: any) => (
        <span className="font-mono text-xs">
          {row.transferNumber || row.reference || row.id || "-"}
        </span>
      ),
      width: "200px",
    },
    {
      name: t("send.col.beneficiary"),
      cell: (row: any) => (
        <span className="text-sm">
          {row.counterpartyName || row.beneficiaryName || "-"}
        </span>
      ),
      width: "180px",
    },
    {
      name: t("send.col.amount"),
      cell: (row: any) => (
        <span className="font-medium">{formatMoney(row.amount, row.currency)}</span>
      ),
      width: "150px",
    },
    {
      name: t("send.col.status"),
      cell: (row: any) => <StatusBadge status={row.status} />,
      width: "140px",
    },
    {
      name: t("send.col.date"),
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
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <Send className="h-4 w-4" />
          </span>
          {t("send.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">
          {t("send.subtitle")}
        </p>
      </div>

      <Card className="mb-4 pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 ring-1 ring-red-500/15">
              <Send className="h-4 w-4" />
            </span>
            {t("send.newTransfer")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={rail} onValueChange={(v) => setRail(v as Rail)}>
            <TabsList className="mb-4 coa-tabs">
              <TabsTrigger value="FT" className="coa-tab-trigger">
                {t("send.tab.ft")}
              </TabsTrigger>
              <TabsTrigger value="IBFT" className="coa-tab-trigger">
                {t("send.tab.ibft")}
              </TabsTrigger>
            </TabsList>

            {/* FT form */}
            <TabsContent value="FT">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 coa-form">
                <FormField label={t("send.field.senderMobile")} required>
                  <Input
                    placeholder="+9665XXXXXXXX"
                    value={ft.senderMobile}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, senderMobile: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.beneficiaryName")} required>
                  <Input
                    placeholder={t("send.ph.beneficiaryName")}
                    value={ft.counterpartyName}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, counterpartyName: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.beneficiaryAccount")} required>
                  <Input
                    placeholder="1234567"
                    value={ft.counterpartyAccount}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, counterpartyAccount: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.bankCode")} required>
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
                <FormField label={t("send.field.beneficiaryEmail")}>
                  <Input
                    placeholder="john@example.com"
                    value={ft.counterpartyEmail}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, counterpartyEmail: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.amount")} required>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={ft.amount}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, amount: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.currency")}>
                  <Input
                    value={ft.currency}
                    onChange={(e) =>
                      setFt((s) => ({ ...s, currency: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.purposeNote")} className="md:col-span-2">
                  <Textarea
                    placeholder={t("send.ph.purposeNoteFt")}
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
                  {isSubmitting ? t("send.sending") : t("send.sendFt")}
                </Button>
              </div>
            </TabsContent>

            {/* IBFT form */}
            <TabsContent value="IBFT">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 coa-form">
                <FormField label={t("send.field.senderMobile")} required>
                  <Input
                    placeholder="+9665XXXXXXXX"
                    value={ibft.senderMobile}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, senderMobile: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.beneficiaryName")} required>
                  <Input
                    placeholder={t("send.ph.beneficiaryName")}
                    value={ibft.beneficiaryName}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, beneficiaryName: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.institutionNumber")} required>
                  <Input
                    placeholder="002"
                    value={ibft.institutionNumber}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, institutionNumber: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.accountNumber")} required>
                  <Input
                    placeholder="1234567"
                    value={ibft.accountNumber}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, accountNumber: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.bankName")}>
                  <Input
                    placeholder="Scotiabank"
                    value={ibft.bankName}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, bankName: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.amount")} required>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={ibft.amount}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, amount: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.currency")}>
                  <Input
                    value={ibft.currency}
                    onChange={(e) =>
                      setIbft((s) => ({ ...s, currency: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label={t("send.field.purposeNote")} className="md:col-span-2">
                  <Textarea
                    placeholder={t("send.ph.purposeNoteIbft")}
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
                  {isSubmitting ? t("send.sending") : t("send.sendIbft")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 ring-1 ring-red-500/15">
                <History className="h-4 w-4" />
              </span>
              {t("send.history.title", { rail })}
            </span>
            <AntInput
              allowClear
              placeholder={t("send.history.searchPlaceholder")}
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={historyMobile}
              onChange={(e) => setHistoryMobile(e.target.value)}
              onPressEnter={() => loadHistory()}
              style={{ width: 300, minWidth: 200, borderRadius: 2, height: 40 }}
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
