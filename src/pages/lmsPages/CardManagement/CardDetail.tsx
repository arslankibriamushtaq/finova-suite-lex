import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  SlidersHorizontal,
  Users,
  Truck,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { getAdminCardById } from "../../../redux/apis/apisCardManagement";
import {
  CARD_TYPE_LABELS,
  cardStatusClasses,
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
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="pro-card p-4">
    <div className="relative mb-3 flex items-center gap-2">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
        <Icon className="size-4" />
      </span>
      <p className="m-0 text-sm font-semibold text-foreground">{title}</p>
    </div>
    <div className="relative grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3">{children}</div>
  </div>
);

const CardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="service card-detail-page">
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between gap-2">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <CreditCard className="h-4 w-4" />
          </span>
          Card Details
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
          Back to Cards
        </Button>
      </div>

      {isLoading || !card ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {isLoading ? "Loading..." : "No details available"}
        </p>
      ) : (
        <div className="mx-auto max-w-5xl space-y-4">
          {/* Card visual preview */}
          <div
            className="relative overflow-hidden rounded-xl p-5 text-white"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "0 10px 26px -12px rgba(16, 185, 129, 0.55)",
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
                  Cardholder
                </div>
                <div className="text-sm font-semibold">{card.cardholderName || "-"}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-medium uppercase tracking-wider text-white/70">
                  Expires
                </div>
                <div className="text-sm font-semibold">
                  {card.expiryMonth ? `${card.expiryMonth}/${card.expiryYear}` : "-"}
                </div>
              </div>
            </div>
          </div>

          <Section icon={CreditCard} title="Card Information">
            <Field label="Card Reference" value={card.cardReference} mono />
            <Field label="Currency" value={card.currency} />
            <Field label="Contactless" value={card.contactlessEnabled ? "Yes" : "No"} />
          </Section>

          <Section icon={SlidersHorizontal} title="Limits">
            <Field label="Daily Limit" value={formatMoney(card.dailyLimit, card.currency)} />
            <Field label="Monthly Limit" value={formatMoney(card.monthlyLimit, card.currency)} />
            <Field label="Requires Activation" value={card.requiresActivation ? "Yes" : "No"} />
          </Section>

          <Section icon={Users} title="Ownership">
            <Field label="Customer ID" value={card.customerId} mono />
            <Field label="Owner User ID" value={card.ownerUserId} mono />
            <Field label="Wallet ID" value={card.walletId} mono />
          </Section>

          {card.shipping && (
            <Section icon={Truck} title="Shipping">
              <Field label="Address" value={card.shipping.address} />
              <Field label="City" value={card.shipping.city} />
              <Field label="Postal Code" value={card.shipping.postalCode} />
              <Field label="Delivery Method" value={prettyEnum(card.deliveryMethod)} />
              <Field label="Carrier" value={card.carrier} />
              <Field label="Tracking Number" value={card.trackingNumber} mono />
              <Field label="Shipment Status" value={prettyEnum(card.shipmentStatus)} />
              <Field label="Est. Delivery" value={formatDate(card.estimatedDeliveryDate)} />
            </Section>
          )}

          <Section icon={Clock} title="Timeline">
            <Field label="Issued At" value={formatDate(card.issuedAt)} />
            <Field label="Activated At" value={formatDate(card.activatedAt)} />
            <Field label="Created At" value={formatDate(card.createdAt)} />
          </Section>
        </div>
      )}
    </div>
  );
};

export default CardDetail;
