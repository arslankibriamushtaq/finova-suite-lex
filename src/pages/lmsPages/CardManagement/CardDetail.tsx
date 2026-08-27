import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CreditCard,
  SlidersHorizontal,
  Users,
  Truck,
  Clock,
  Receipt,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { cn } from "../../../lib/utils";
import {
  getAdminCardById,
  getAdminCardTransactions,
  recordAdminCardTransaction,
} from "../../../redux/apis/apisCardManagement";
import {
  CARD_TYPE_LABELS,
  TXN_TYPES,
  TXN_STATUSES,
  cardStatusClasses,
  txnStatusClasses,
  isCreditTxn,
  formatDate,
  formatMoney,
  prettyEnum,
} from "./cardConstants";

const Field = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="min-w-0 space-y-0.5">
    <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className={cn("m-0 break-words text-sm font-semibold text-foreground", mono && "font-mono")}>
      {value ?? "-"}
    </p>
  </div>
);

const Section = ({
  icon: Icon,
  title,
  action,
  children,
  bodyClassName,
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}) => (
  <div className="pro-card p-4">
    <div className="relative mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 ring-1 ring-red-500/15">
          <Icon className="size-4" />
        </span>
        <p className="m-0 text-sm font-semibold text-foreground">{title}</p>
      </div>
      {action}
    </div>
    <div
      className={cn(
        "relative grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3",
        bodyClassName
      )}
    >
      {children}
    </div>
  </div>
);

const emptyTxn = {
  txnType: "PURCHASE",
  status: "COMPLETED",
  amount: "",
  currency: "",
  merchantName: "",
  description: "",
  reference: "",
};

const CardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("cardManagement");
  const [card, setCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(false);

  const [showRecord, setShowRecord] = useState(false);
  const [txnForm, setTxnForm] = useState({ ...emptyTxn });
  const [isSaving, setIsSaving] = useState(false);

  const setTxnField = (key: keyof typeof emptyTxn, value: any) =>
    setTxnForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getAdminCardById(id)
      .then((res) => setCard(res?.data?.data ?? res?.data))
      .catch(() => {
        /* interceptor toasts errors */
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const loadTransactions = useCallback(() => {
    if (!id) return;
    setIsLoadingTxns(true);
    getAdminCardTransactions(id)
      .then((res) => {
        const body = res?.data;
        const list = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body?.data?.content)
          ? body.data.content
          : Array.isArray(body)
          ? body
          : [];
        setTransactions(list);
      })
      .catch(() => {
        /* interceptor toasts errors */
      })
      .finally(() => setIsLoadingTxns(false));
  }, [id]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const openRecord = () => {
    setTxnForm({ ...emptyTxn, currency: card?.currency || "" });
    setShowRecord(true);
  };

  const saveTransaction = async () => {
    if (!id) return;
    if (txnForm.amount === "" || Number(txnForm.amount) <= 0)
      return toast.error(t("detail.toast.amountRequired"));
    try {
      setIsSaving(true);
      const body: any = {
        txnType: txnForm.txnType,
        status: txnForm.status,
        amount: Number(txnForm.amount),
      };
      if (txnForm.currency.trim()) body.currency = txnForm.currency.trim();
      if (txnForm.merchantName.trim()) body.merchantName = txnForm.merchantName.trim();
      if (txnForm.description.trim()) body.description = txnForm.description.trim();
      if (txnForm.reference.trim()) body.reference = txnForm.reference.trim();
      await recordAdminCardTransaction(id, body);
      toast.success(t("detail.toast.recorded"));
      setShowRecord(false);
      loadTransactions();
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error(t("detail.toast.recordFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="service card-detail-page">
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between gap-2">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <CreditCard className="h-4 w-4" />
          </span>
          {t("detail.title")}
          {card?.status && (
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${cardStatusClasses(card.status)}`}
            >
              {prettyEnum(card.status)}
            </span>
          )}
        </h3>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/CardManagement/Cards")}>
          <ArrowLeft className="h-4 w-4" />
          {t("detail.backToCards")}
        </Button>
      </div>

      {isLoading || !card ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {isLoading ? t("common:loading") : t("detail.noDetails")}
        </p>
      ) : (
        <div className="mx-auto max-w-5xl space-y-4">
          {/* Card visual preview */}
          <div
            className="relative overflow-hidden rounded-xl p-5 text-white"
            style={{
              background: "linear-gradient(135deg, #C81D25 0%, #AB1920 100%)",
              boxShadow: "0 10px 26px -12px rgba(200, 29, 37, 0.55)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full"
              style={{ background: "rgba(255,255,255,0.12)" }}
            />
            <div className="relative flex items-start justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                {prettyEnum(card.tier)} · {CARD_TYPE_LABELS[card.cardType] || prettyEnum(card.cardType)}
              </span>
              <span className="text-base font-bold tracking-wide">{card.brand || ""}</span>
            </div>
            <div className="relative mt-7 font-mono text-xl font-semibold tracking-[0.18em]">
              {card.maskedPan || "•••• •••• •••• ••••"}
            </div>
            <div className="relative mt-5 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-white/70">
                  {t("detail.card.cardholder")}
                </div>
                <div className="text-sm font-semibold">{card.cardholderName || "-"}</div>
              </div>
              <div className="text-end">
                <div className="text-[10px] font-medium uppercase tracking-wider text-white/70">
                  {t("detail.card.expires")}
                </div>
                <div className="text-sm font-semibold">
                  {card.expiryMonth ? `${card.expiryMonth}/${card.expiryYear}` : "-"}
                </div>
              </div>
            </div>
          </div>

          <Section icon={CreditCard} title={t("detail.section.cardInformation")}>
            <Field label={t("detail.field.cardReference")} value={card.cardReference} mono />
            <Field label={t("detail.field.productCode")} value={card.productCode} mono />
            <Field label={t("detail.field.bin")} value={card.bin} mono />
            <Field label={t("detail.field.currency")} value={card.currency} />
            <Field label={t("detail.field.pinSet")} value={card.pinSet ? t("common:yes") : t("common:no")} />
            <Field label={t("detail.field.contactless")} value={card.contactlessEnabled ? t("common:yes") : t("common:no")} />
          </Section>

          <Section icon={SlidersHorizontal} title={t("detail.section.limits")}>
            <Field label={t("detail.field.dailyLimit")} value={formatMoney(card.dailyLimit, card.currency)} />
            <Field label={t("detail.field.monthlyLimit")} value={formatMoney(card.monthlyLimit, card.currency)} />
            <Field label={t("detail.field.requiresActivation")} value={card.requiresActivation ? t("common:yes") : t("common:no")} />
          </Section>

          <Section icon={Users} title={t("detail.section.ownership")}>
            <Field label={t("detail.field.customerId")} value={card.customerId} mono />
            <Field label={t("detail.field.ownerUserId")} value={card.ownerUserId} mono />
            <Field label={t("detail.field.walletId")} value={card.walletId} mono />
          </Section>

          {card.shipping && (
            <Section icon={Truck} title={t("detail.section.shipping")}>
              <Field label={t("detail.field.address")} value={card.shipping.address} />
              <Field label={t("detail.field.city")} value={card.shipping.city} />
              <Field label={t("detail.field.postalCode")} value={card.shipping.postalCode} />
              <Field label={t("detail.field.deliveryMethod")} value={prettyEnum(card.deliveryMethod)} />
              <Field label={t("detail.field.carrier")} value={card.carrier} />
              <Field label={t("detail.field.trackingNumber")} value={card.trackingNumber} mono />
              <Field label={t("detail.field.shipmentStatus")} value={prettyEnum(card.shipmentStatus)} />
              <Field label={t("detail.field.estDelivery")} value={formatDate(card.estimatedDeliveryDate)} />
            </Section>
          )}

          <Section icon={Clock} title={t("detail.section.timeline")}>
            <Field label={t("detail.field.issuedAt")} value={formatDate(card.issuedAt)} />
            <Field label={t("detail.field.activatedAt")} value={formatDate(card.activatedAt)} />
            <Field label={t("detail.field.createdAt")} value={formatDate(card.createdAt)} />
          </Section>

          {/* Transactions statement (§4.9) */}
          <div className="pro-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 ring-1 ring-red-500/15">
                  <Receipt className="size-4" />
                </span>
                <p className="m-0 text-sm font-semibold text-foreground">{t("detail.txn.title")}</p>
              </div>
              <Button size="sm" className="h-8 gap-1.5 px-3 text-xs" onClick={openRecord}>
                <Plus className="size-3.5" />
                {t("detail.txn.record")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-start" style={{ background: "var(--theme-table-background-color)" }}>
                    <th className="px-3 py-2.5 text-xs font-semibold text-white">{t("common:date")}</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-white">{t("common:type")}</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-white">{t("detail.txn.col.merchant")}</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-white">{t("detail.txn.col.reference")}</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-white">{t("common:status")}</th>
                    <th className="px-3 py-2.5 text-end text-xs font-semibold text-white">{t("common:amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTxns ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                        {t("common:loading")}
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                        {t("detail.txn.empty")}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t, i) => {
                      const credit = isCreditTxn(t.txnType);
                      return (
                        <tr
                          key={t.id || i}
                          className="border-t"
                          style={{ borderColor: "var(--surface-border)" }}
                        >
                          <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                            {formatDate(t.occurredAt)}
                          </td>
                          <td className="px-3 py-2.5 text-xs font-medium text-foreground">
                            {prettyEnum(t.txnType)}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-foreground">
                            <div className="font-medium">{t.merchantName || "-"}</div>
                            {t.description && (
                              <div className="text-[11px] text-muted-foreground">{t.description}</div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                            {t.reference || "-"}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${txnStatusClasses(
                                t.status
                              )}`}
                            >
                              {prettyEnum(t.status)}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold",
                              credit ? "text-red-600" : "text-foreground"
                            )}
                          >
                            {credit ? "+" : "-"}
                            {formatMoney(t.amount, t.currency || card.currency)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record transaction dialog */}
      <Dialog open={showRecord} onOpenChange={(o) => !o && setShowRecord(false)}>
        <DialogContent className="pro-dialog sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{t("detail.txn.dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("detail.txn.dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("detail.txn.field.type")}</Label>
                <Select value={txnForm.txnType} onValueChange={(v) => setTxnField("txnType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TXN_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {prettyEnum(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("detail.txn.field.status")}</Label>
                <Select value={txnForm.status} onValueChange={(v) => setTxnField("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TXN_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {prettyEnum(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("detail.txn.field.amount")}</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={txnForm.amount}
                  onChange={(e) => setTxnField("amount", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("detail.txn.field.currency")}</Label>
                <Input
                  placeholder={card?.currency || "CAD"}
                  value={txnForm.currency}
                  onChange={(e) => setTxnField("currency", e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t("detail.txn.field.merchantName")}</Label>
                <Input
                  placeholder="Amazon.ca"
                  value={txnForm.merchantName}
                  onChange={(e) => setTxnField("merchantName", e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t("detail.txn.field.description")}</Label>
                <Input
                  placeholder={t("detail.txn.placeholder.description")}
                  value={txnForm.description}
                  onChange={(e) => setTxnField("description", e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t("detail.txn.field.reference")}</Label>
                <Input
                  placeholder="AUTH-8837123"
                  value={txnForm.reference}
                  onChange={(e) => setTxnField("reference", e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecord(false)} disabled={isSaving}>
              {t("common:cancel")}
            </Button>
            <Button onClick={saveTransaction} disabled={isSaving}>
              {isSaving ? t("action.saving") : t("detail.txn.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardDetail;
