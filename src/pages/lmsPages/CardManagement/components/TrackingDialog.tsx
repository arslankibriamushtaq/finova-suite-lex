import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Circle, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import {
  getAdminCardTracking,
  advanceAdminCardTracking,
} from "../../../../redux/apis/apisCardManagement";
import { formatDate } from "../cardConstants";

interface TrackingDialogProps {
  cardId: string | null;
  onOpenChange: (open: boolean) => void;
  onAdvanced?: () => void;
}

const TrackingDialog = ({ cardId, onOpenChange, onAdvanced }: TrackingDialogProps) => {
  const [tracking, setTracking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const load = useCallback(() => {
    if (!cardId) return;
    setIsLoading(true);
    getAdminCardTracking(cardId)
      .then((res) => setTracking(res?.data?.data ?? res?.data))
      .catch(() => {
        /* interceptor toasts errors */
      })
      .finally(() => setIsLoading(false));
  }, [cardId]);

  useEffect(() => {
    if (!cardId) {
      setTracking(null);
      return;
    }
    load();
  }, [cardId, load]);

  const handleAdvance = async () => {
    if (!cardId) return;
    try {
      setIsAdvancing(true);
      await advanceAdminCardTracking(cardId);
      toast.success("Shipment advanced");
      load();
      onAdvanced?.();
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error("Failed to advance shipment");
    } finally {
      setIsAdvancing(false);
    }
  };

  const timeline: any[] = Array.isArray(tracking?.timeline) ? tracking.timeline : [];
  const isDelivered = tracking?.currentStage === "DELIVERED";

  return (
    <Dialog open={!!cardId} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Shipment Tracking
          </DialogTitle>
          {tracking?.trackingNumber && (
            <DialogDescription>
              {tracking.carrier} · {tracking.trackingNumber}
              {tracking.estimatedDeliveryDate
                ? ` · ETA ${formatDate(tracking.estimatedDeliveryDate)}`
                : ""}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
        ) : tracking && tracking.shippable === false ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            This card is not shippable (virtual card).
          </p>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No tracking information available.
          </p>
        ) : (
          <ol className="relative ml-2 border-l border-border pl-6 py-2 space-y-6">
            {timeline.map((step) => (
              <li key={step.stage} className="relative">
                <span className="absolute -left-[31px] top-0 bg-background">
                  {step.reached ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </span>
                <p
                  className={`text-sm font-medium ${
                    step.reached ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label || step.stage}
                </p>
                {step.at && (
                  <p className="text-xs text-muted-foreground">{formatDate(step.at)}</p>
                )}
              </li>
            ))}
          </ol>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAdvancing}>
            Close
          </Button>
          {tracking?.shippable && !isDelivered && timeline.length > 0 && (
            <Button onClick={handleAdvance} disabled={isAdvancing || isLoading}>
              {isAdvancing ? "Advancing..." : "Advance Shipment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrackingDialog;
