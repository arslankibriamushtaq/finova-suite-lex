import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Checkbox } from "../../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { issueAdminCard } from "../../../../redux/apis/apisCardManagement";
import {
  CARD_TYPES,
  CARD_TIERS,
  CARD_TYPE_LABELS,
  DELIVERY_METHODS,
  prettyEnum,
  isPhysical,
} from "../cardConstants";

interface IssueCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssued: () => void;
}

const emptyForm = {
  walletId: "",
  cardholderName: "",
  cardType: "VIRTUAL_DEBIT",
  customerId: "",
  ownerUserId: "",
  tier: "CLASSIC",
  currency: "CAD",
  dailyLimit: "",
  monthlyLimit: "",
  contactlessEnabled: false,
  deliveryMethod: "STANDARD",
  address: "",
  city: "",
  postalCode: "",
};

const IssueCardDialog = ({ open, onOpenChange, onIssued }: IssueCardDialogProps) => {
  const { t } = useTranslation("cardManagement");
  const [form, setForm] = useState({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);

  const setField = (key: keyof typeof emptyForm, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!open) return;
    setForm({ ...emptyForm });
  }, [open]);

  const physical = isPhysical(form.cardType);

  const handleSubmit = async () => {
    if (!form.walletId.trim()) return toast.error(t("issue.toast.walletIdRequired"));
    if (!form.cardholderName.trim()) return toast.error(t("issue.toast.cardholderRequired"));
    if (!form.cardType) return toast.error(t("validation.cardTypeRequired"));
    if (physical && (!form.address.trim() || !form.city.trim() || !form.postalCode.trim())) {
      return toast.error(t("issue.toast.shippingRequired"));
    }

    const body: any = {
      walletId: form.walletId.trim(),
      cardholderName: form.cardholderName.trim(),
      cardType: form.cardType,
      tier: form.tier,
      currency: form.currency.trim() || "CAD",
      contactlessEnabled: form.contactlessEnabled,
    };
    if (form.customerId.trim()) body.customerId = form.customerId.trim();
    if (form.ownerUserId.trim()) body.ownerUserId = form.ownerUserId.trim();
    if (form.dailyLimit !== "") body.dailyLimit = Number(form.dailyLimit);
    if (form.monthlyLimit !== "") body.monthlyLimit = Number(form.monthlyLimit);
    if (physical) {
      body.deliveryMethod = form.deliveryMethod;
      body.shipping = {
        address: form.address.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
      };
    }

    try {
      setIsSaving(true);
      await issueAdminCard(body);
      toast.success(t("issue.toast.issued"));
      onOpenChange(false);
      onIssued();
    } catch (error: any) {
      // Interceptor already toasts business errors; guard for the rest.
      if (!error?.response?.data?.message) toast.error(t("issue.toast.issueFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="pro-dialog sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("issue.title")}</DialogTitle>
          <DialogDescription>
            {t("issue.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("issue.field.walletId")}</Label>
              <Input
                placeholder={t("issue.placeholder.walletId")}
                value={form.walletId}
                onChange={(e) => setField("walletId", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("issue.field.cardholderName")}</Label>
              <Input
                placeholder={t("issue.placeholder.cardholderName")}
                value={form.cardholderName}
                onChange={(e) => setField("cardholderName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("issue.field.cardType")}</Label>
              <Select
                value={form.cardType}
                onValueChange={(v) => {
                  setField("cardType", v);
                  setField("tier", "CLASSIC");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("issue.placeholder.cardType")} />
                </SelectTrigger>
                <SelectContent>
                  {CARD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CARD_TYPE_LABELS[t] || prettyEnum(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("issue.field.tier")}</Label>
              <Select value={form.tier} onValueChange={(v) => setField("tier", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("issue.placeholder.tier")} />
                </SelectTrigger>
                <SelectContent>
                  {CARD_TIERS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {prettyEnum(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("issue.field.customerId")}</Label>
              <Input
                placeholder={t("issue.placeholder.customerId")}
                value={form.customerId}
                onChange={(e) => setField("customerId", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("issue.field.ownerUserId")}</Label>
              <Input
                placeholder={t("issue.placeholder.ownerUserId")}
                value={form.ownerUserId}
                onChange={(e) => setField("ownerUserId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("issue.field.currency")}</Label>
              <Input
                placeholder="CAD"
                value={form.currency}
                onChange={(e) => setField("currency", e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer h-10">
                <Checkbox
                  checked={form.contactlessEnabled}
                  onCheckedChange={(c) => setField("contactlessEnabled", !!c)}
                />
                <span className="text-sm">{t("issue.field.contactlessEnabled")}</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label>{t("issue.field.dailyLimit")}</Label>
              <Input
                type="number"
                placeholder={t("issue.placeholder.dailyLimit")}
                value={form.dailyLimit}
                onChange={(e) => setField("dailyLimit", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("issue.field.monthlyLimit")}</Label>
              <Input
                type="number"
                placeholder={t("issue.placeholder.monthlyLimit")}
                value={form.monthlyLimit}
                onChange={(e) => setField("monthlyLimit", e.target.value)}
              />
            </div>
          </div>

          {physical && (
            <div className="border-t pt-4 space-y-4">
              <p className="text-sm font-semibold text-foreground">{t("issue.shippingTitle")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("issue.field.address")}</Label>
                  <Input
                    placeholder="12 King St W, Unit 5"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("issue.field.city")}</Label>
                  <Input
                    placeholder="Toronto"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("issue.field.postalCode")}</Label>
                  <Input
                    placeholder="M5H1A1"
                    value={form.postalCode}
                    onChange={(e) => setField("postalCode", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("issue.field.deliveryMethod")}</Label>
                  <Select
                    value={form.deliveryMethod}
                    onValueChange={(v) => setField("deliveryMethod", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m.charAt(0) + m.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t("common:cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? t("issue.submitting") : t("issue.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IssueCardDialog;
