import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, SlidersHorizontal, Users, Truck, Clock, type LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { cn } from "../../../../lib/utils";
import { getAdminCardById } from "../../../../redux/apis/apisCardManagement";
import {
  CARD_TYPE_LABELS,
  cardStatusClasses,
  formatDate,
  formatMoney,
  prettyEnum,
} from "../cardConstants";

interface CardDetailDialogProps {
  cardId: string | null;
  onOpenChange: (open: boolean) => void;
}

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
    <p className={cn("m-0 break-words text-xs font-semibold text-foreground", mono && "font-mono")}>
      {value ?? "-"}
    </p>
  </div>
);

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border bg-muted/20 p-4">
    <div className="mb-3 flex items-center gap-2">
      <span className="inline-flex size-7 items-center justify-center rounded-md bg-red-500/10 text-red-600 ring-1 ring-red-500/15">
        <Icon className="size-3.5" />
      </span>
      <p className="m-0 text-[13px] font-semibold text-foreground">{title}</p>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3">{children}</div>
  </div>
);

const CardDetailDialog = ({ cardId, onOpenChange }: CardDetailDialogProps) => {
  const { t } = useTranslation("cardManagement");
  const [card, setCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!cardId) {
      setCard(null);
      return;
    }
    setIsLoading(true);
    getAdminCardById(cardId)
      .then((res) => setCard(res?.data?.data ?? res?.data))
      .catch(() => {
        /* interceptor toasts errors */
      })
      .finally(() => setIsLoading(false));
  }, [cardId]);

  return (
    <Dialog open={!!cardId} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="pro-dialog sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("detail.title")}
            {card?.status && (
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${cardStatusClasses(
                  card.status
                )}`}
              >
                {prettyEnum(card.status)}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !card ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {isLoading ? t("common:loading") : t("detail.noDetails")}
          </p>
        ) : (
          <div className="space-y-4">
            {/* Card visual preview */}
            <div
              className="relative overflow-hidden rounded-xl p-5 text-white"
              style={{
                background: "linear-gradient(135deg, #e60000 0%, #c00000 100%)",
                boxShadow: "0 10px 26px -12px rgba(230, 0, 0, 0.55)",
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
              <Field label={t("detail.field.currency")} value={card.currency} />
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailDialog;
