import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowRightLeft, RefreshCw, Eye, Send, History } from "lucide-react";
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

import {
  adminResolveInternal,
  adminInitiateInternal,
  adminListInternalByMobile,
  AdminInternalTransferRequest,
} from "../../../redux/apis/apisWalletAdmin";

const newIdemKey = () => {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return `admin-int-${rand}`;
};

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  PROCESSING: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
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

const PartyCard = ({ title, party }: { title: string; party: any }) => {
  const { t } = useTranslation("walletBlocks");
  return (
  <div className="rounded-md border border-border p-3">
    <h5 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
      {title}
    </h5>
    {party ? (
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">{t("internal.party.name")}</span>
          <span className="font-medium">
            {party.name || party.maskedName || "-"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">{t("internal.party.account")}</span>
          <span className="font-mono text-xs">{party.accountNumber || "-"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">{t("internal.party.balance")}</span>
          <span>
            {formatMoney(
              party.availableBalance ?? party.balance,
              party.currency
            )}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">{t("internal.party.status")}</span>
          <StatusBadge status={party.status} />
        </div>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">-</p>
    )}
  </div>
  );
};

const InternalTransfer = () => {
  const { t } = useTranslation("walletBlocks");
  const [form, setForm] = useState({
    senderMobile: "",
    receiverMobile: "",
    amount: "",
    currency: "CAD",
    purposeNote: "",
  });

  const [resolved, setResolved] = useState<any | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History
  const [historyMobile, setHistoryMobile] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const validate = () => {
    if (!form.senderMobile.trim()) {
      toast.error(t("internal.valid.senderMobile"));
      return false;
    }
    if (!form.receiverMobile.trim()) {
      toast.error(t("internal.valid.receiverMobile"));
      return false;
    }
    if (!Number(form.amount) || Number(form.amount) <= 0) {
      toast.error(t("internal.valid.amount"));
      return false;
    }
    return true;
  };

  const handleResolve = async () => {
    if (!validate()) return;
    setIsResolving(true);
    try {
      const res = await adminResolveInternal({
        senderMobile: form.senderMobile.trim(),
        receiverMobile: form.receiverMobile.trim(),
        amount: Number(form.amount),
        currency: form.currency.trim() || "CAD",
      });
      setResolved(res?.data?.data || res?.data || null);
      toast.success(t("internal.toast.resolved"));
    } catch (error: any) {
      console.error(error);
      setResolved(null);
      toast.error(error?.response?.data?.message || t("internal.toast.resolveFailed"));
    } finally {
      setIsResolving(false);
    }
  };

  const handleInitiate = async () => {
    if (!validate()) return;
    const body: AdminInternalTransferRequest = {
      senderMobile: form.senderMobile.trim(),
      receiverMobile: form.receiverMobile.trim(),
      amount: Number(form.amount),
      currency: form.currency.trim() || "CAD",
      purposeNote: form.purposeNote.trim() || undefined,
      idempotencyKey: newIdemKey(),
    };
    setIsSubmitting(true);
    try {
      await adminInitiateInternal(body);
      toast.success(t("internal.toast.initiated"));
      setForm((s) => ({ ...s, amount: "", purposeNote: "" }));
      setResolved(null);
      // Immediately reflect the new transfer in the history below.
      setHistoryMobile(body.senderMobile);
      loadHistory(body.senderMobile);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("internal.toast.initiateFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadHistory = async (mobileArg?: string) => {
    const mobile = (typeof mobileArg === "string" ? mobileArg : historyMobile).trim();
    if (!mobile) return toast.error(t("internal.toast.enterMobile"));
    setIsHistoryLoading(true);
    try {
      const res = await adminListInternalByMobile(mobile, 0, 20);
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
      toast.error(t("internal.toast.loadHistoryFailed"));
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const historyHeaders = [
    {
      name: t("internal.col.reference"),
      cell: (row: any) => (
        <span className="font-mono text-xs">
          {row.transferNumber || row.id || "-"}
        </span>
      ),
      width: "200px",
    },
    {
      name: t("internal.col.direction"),
      cell: (row: any) => (
        <span className="text-sm">
          {row.senderName || row.sourceWalletNumber || "-"} →{" "}
          {row.receiverName || row.destinationWalletNumber || "-"}
        </span>
      ),
      width: "220px",
    },
    {
      name: t("internal.col.amount"),
      cell: (row: any) => (
        <span className="font-medium">{formatMoney(row.amount, row.currency)}</span>
      ),
      width: "150px",
    },
    {
      name: t("internal.col.status"),
      cell: (row: any) => <StatusBadge status={row.status} />,
      width: "140px",
    },
    {
      name: t("internal.col.date"),
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
            <ArrowRightLeft className="h-4 w-4" />
          </span>
          {t("internal.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">
          {t("internal.subtitle")}
        </p>
      </div>

      <Card className="mb-4 pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 ring-1 ring-red-500/15">
              <ArrowRightLeft className="h-4 w-4" />
            </span>
            {t("internal.newTransfer")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label={t("internal.field.senderMobile")} required>
              <Input
                placeholder="+9665XXXXXXXX"
                value={form.senderMobile}
                onChange={(e) =>
                  setForm((s) => ({ ...s, senderMobile: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("internal.field.receiverMobile")} required>
              <Input
                placeholder="+9665XXXXXXXX"
                value={form.receiverMobile}
                onChange={(e) =>
                  setForm((s) => ({ ...s, receiverMobile: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("internal.field.amount")} required>
              <Input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, amount: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("internal.field.currency")}>
              <Input
                value={form.currency}
                onChange={(e) =>
                  setForm((s) => ({ ...s, currency: e.target.value }))
                }
              />
            </FormField>
            <FormField label={t("internal.field.purposeNote")} className="md:col-span-2">
              <Textarea
                placeholder={t("internal.ph.purposeNote")}
                rows={2}
                value={form.purposeNote}
                onChange={(e) =>
                  setForm((s) => ({ ...s, purposeNote: e.target.value }))
                }
              />
            </FormField>
          </div>

          {resolved && (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <PartyCard
                title={t("internal.party.sender")}
                party={resolved.sender || resolved.source}
              />
              <PartyCard
                title={t("internal.party.receiver")}
                party={resolved.receiver || resolved.destination}
              />
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleResolve}
              disabled={isResolving}
            >
              {isResolving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {t("internal.resolvePreview")}
            </Button>
            <Button
              className="gap-2 wallet-brand-btn"
              onClick={handleInitiate}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? t("internal.transferring") : t("internal.initiateTransfer")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 ring-1 ring-red-500/15">
                <History className="h-4 w-4" />
              </span>
              {t("internal.history.title")}
            </span>
            <AntInput
              allowClear
              placeholder={t("internal.history.searchPlaceholder")}
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

export default InternalTransfer;
