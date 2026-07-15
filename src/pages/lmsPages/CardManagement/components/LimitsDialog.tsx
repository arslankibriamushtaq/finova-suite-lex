import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("cardManagement");
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
      return toast.error(t("limits.toast.enterAtLeastOne"));
    }

    try {
      setIsSaving(true);
      await updateAdminCardLimits(card.id, body);
      toast.success(t("limits.toast.updated"));
      onOpenChange(false);
      onUpdated();
    } catch (error: any) {
      if (!error?.response?.data?.message) toast.error(t("limits.toast.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!card} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="pro-dialog sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{t("limits.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("limits.field.dailyLimit")}</Label>
            <Input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("limits.field.monthlyLimit")}</Label>
            <Input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t("common:cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? t("action.saving") : t("common:update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LimitsDialog;
