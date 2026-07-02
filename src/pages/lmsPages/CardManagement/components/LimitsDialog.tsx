import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { updateAdminCardLimits } from "../../../../redux/apis/apisCardManagement";

interface LimitsDialogProps {
  card: any | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

const LimitsDialog = ({ card, onOpenChange, onUpdated }: LimitsDialogProps) => {
  const [dailyLimit, setDailyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setDailyLimit(card.dailyLimit ?? "");
      setMonthlyLimit(card.monthlyLimit ?? "");
    }
  }, [card]);

  const handleSubmit = async () => {
    if (!card) return;
    const body: { dailyLimit?: number; monthlyLimit?: number } = {};
    if (dailyLimit !== "") body.dailyLimit = Number(dailyLimit);
    if (monthlyLimit !== "") body.monthlyLimit = Number(monthlyLimit);
    if (body.dailyLimit === undefined && body.monthlyLimit === undefined) {
      return toast.error("Enter at least one limit");
    }

    try {
      setIsSaving(true);
      await updateAdminCardLimits(card.id, body);
      toast.success("Limits updated successfully");
      onOpenChange(false);
      onUpdated();
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error("Failed to update limits");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!card} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit Limits</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Daily Limit</Label>
            <Input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Monthly Limit</Label>
            <Input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LimitsDialog;
