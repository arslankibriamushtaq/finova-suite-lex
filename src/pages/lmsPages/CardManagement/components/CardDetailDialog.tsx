import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
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

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground break-words">{value ?? "-"}</p>
  </div>
);

const CardDetailDialog = ({ cardId, onOpenChange }: CardDetailDialogProps) => {
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
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Card Details
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
            {isLoading ? "Loading..." : "No details available"}
          </p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Card Reference" value={card.cardReference} />
              <Field label="Cardholder" value={card.cardholderName} />
              <Field label="Type" value={CARD_TYPE_LABELS[card.cardType] || prettyEnum(card.cardType)} />
              <Field label="Tier" value={prettyEnum(card.tier)} />
              <Field label="Brand" value={card.brand} />
              <Field label="Masked PAN" value={card.maskedPan} />
              <Field label="Expiry" value={card.expiryMonth ? `${card.expiryMonth}/${card.expiryYear}` : "-"} />
              <Field label="Currency" value={card.currency} />
              <Field label="Contactless" value={card.contactlessEnabled ? "Yes" : "No"} />
            </div>

            <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Daily Limit" value={formatMoney(card.dailyLimit, card.currency)} />
              <Field label="Monthly Limit" value={formatMoney(card.monthlyLimit, card.currency)} />
              <Field label="Requires Activation" value={card.requiresActivation ? "Yes" : "No"} />
            </div>

            <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Customer ID" value={card.customerId} />
              <Field label="Owner User ID" value={card.ownerUserId} />
              <Field label="Wallet ID" value={card.walletId} />
            </div>

            {card.shipping && (
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3">Shipping</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Field label="Address" value={card.shipping.address} />
                  <Field label="City" value={card.shipping.city} />
                  <Field label="Postal Code" value={card.shipping.postalCode} />
                  <Field label="Delivery Method" value={prettyEnum(card.deliveryMethod)} />
                  <Field label="Carrier" value={card.carrier} />
                  <Field label="Tracking Number" value={card.trackingNumber} />
                  <Field label="Shipment Status" value={prettyEnum(card.shipmentStatus)} />
                  <Field label="Est. Delivery" value={formatDate(card.estimatedDeliveryDate)} />
                </div>
              </div>
            )}

            <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Issued At" value={formatDate(card.issuedAt)} />
              <Field label="Activated At" value={formatDate(card.activatedAt)} />
              <Field label="Created At" value={formatDate(card.createdAt)} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailDialog;
