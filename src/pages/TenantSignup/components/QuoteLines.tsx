import { useTranslation } from "react-i18next";

import { getCurrentLanguage } from "../../../utils/acceptLanguage";
import type { Quote } from "../../../redux/apis/apisTenantProvisioning";
import { formatMoney, formatVatRate } from "../format";

/**
 * The invoice, exactly as the server priced it.
 *
 * Two rules this component exists to enforce:
 *
 *  1. **Nothing is recomputed.** VAT is calculated per line and rounded before
 *     summing, because ZATCA rejects an invoice whose printed lines do not add
 *     up to its total. Applying 15% to the subtotal in the browser disagrees
 *     with the real invoice by a halala on some selections. So every figure
 *     here is read straight off the quote.
 *  2. **The zero-priced CORE line is shown, not filtered.** It was not
 *     selected, but it is on the invoice, and the buyer should see the same
 *     document we will bill.
 */
export default function QuoteLines({ quote }: { quote: Quote }) {
  const { t } = useTranslation("tenantSignup");
  const isArabic = getCurrentLanguage() === "ar";

  return (
    <div className="space-y-3">
      <ul className="space-y-2.5">
        {quote.lines.map((line) => (
          <li
            key={line.packageCode}
            className="flex items-baseline justify-between gap-[1rem] text-[13px]"
          >
            <span className="min-w-0 text-muted-foreground">
              {isArabic ? line.descriptionAr : line.descriptionEn}
            </span>
            <span className="ts-num shrink-0 font-medium text-foreground">
              {line.lineTotal === 0
                ? t("quote.included")
                : formatMoney(line.lineTotal, quote.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t border-[var(--surface-border)] pt-3">
        <Row
          label={t("quote.subtotal")}
          value={formatMoney(quote.subtotal, quote.currency)}
        />
        <Row
          label={t("quote.vat", { rate: formatVatRate(quote.vatRate) })}
          value={formatMoney(quote.vatAmount, quote.currency)}
        />
      </div>

      <div className="flex items-baseline justify-between gap-[1rem] border-t border-[var(--surface-border)] pt-3">
        <span className="text-sm font-semibold text-foreground">
          {t("quote.total")}
        </span>
        <span className="ts-total text-foreground">
          {formatMoney(quote.totalAmount, quote.currency)}
        </span>
      </div>

      <p className="ts-xs text-muted-foreground">
        {quote.billingCycle === "ANNUAL"
          ? t("quote.billedAnnually")
          : t("quote.billedMonthly")}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-[1rem] text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="ts-num text-foreground">{value}</span>
    </div>
  );
}
