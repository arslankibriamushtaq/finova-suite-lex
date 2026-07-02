import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";
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
      <DialogContent className="pro-dialog sm:max-w-[820px]">
        <style>{`
          @keyframes trackStepIn {
            from { opacity: 0; transform: translateX(-8px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          .track-step {
            animation: trackStepIn 0.4s cubic-bezier(0.33, 1, 0.68, 1) both;
          }
          @media (prefers-reduced-motion: reduce) {
            .track-step { animation: none !important; }
          }
        `}</style>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
              <Truck className="size-4" />
            </span>
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
          <div className="overflow-x-auto pb-1 pt-2">
            <div
              className="flex items-start"
              style={{ minWidth: `${timeline.length * 96}px` }}
            >
              {timeline.map((step, i) => {
                const reached = !!step.reached;
                const isCurrent = step.stage === tracking?.currentStage;
                const isLast = i === timeline.length - 1;
                return (
                  <div
                    key={step.stage}
                    className="track-step relative flex flex-1 flex-col items-center px-1 text-center"
                    style={{ animationDelay: `${i * 0.09}s` }}
                  >
                    {/* connector to the next node (centred on the circle row) */}
                    {!isLast && (
                      <span
                        className="absolute left-1/2 top-[13px] h-0.5 w-full"
                        style={{ background: reached ? "#10b981" : "var(--surface-border)" }}
                      />
                    )}
                    {/* node */}
                    <span
                      className={cn(
                        "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-colors",
                        reached
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                          : isCurrent
                          ? "border-emerald-500 text-emerald-600 ring-4 ring-emerald-500/15"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {reached ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : (
                        <span className="size-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <p
                      className={cn(
                        "m-0 mt-2 px-0.5 text-[12px] font-semibold leading-tight",
                        reached || isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label || step.stage}
                    </p>
                    {isCurrent && !reached && (
                      <span className="mt-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                        Current
                      </span>
                    )}
                    {step.at && (
                      <p className="m-0 mt-0.5 text-[10px] text-muted-foreground">
                        {formatDate(step.at)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
