import { Boxes, Check, Loader2, Plus, TrendingDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  getCatalogPackages,
  getQuote,
  toTenantSignupError,
  type BillingCycle,
  type CatalogPackage,
  type Quote,
} from "../../../redux/apis/apisTenantProvisioning";
import { getCurrentLanguage } from "../../../utils/acceptLanguage";
import { Skeleton } from "../../../components/ui/skeleton";
import StatusMessage from "../components/StatusMessage";
import SubmitButton from "../components/SubmitButton";
import { descriptionPoints, formatMoney } from "../format";
import { TENANT_SIGNUP_ROUTES } from "../navigation";
import { useTenantSignup } from "../TenantSignupContext";

/**
 * Screen 1 — what is on sale, and what it costs.
 *
 * The catalog deliberately omits CORE (sign-in, employees, roles, permissions,
 * notifications): it ships free with every subscription, and a checkbox for it
 * would let someone deselect what the platform cannot run without. It is
 * mentioned as a footnote, never rendered as a sixth card.
 */
export default function PricingStep() {
  const { t } = useTranslation("tenantSignup");
  const navigate = useNavigate();
  const isArabic = getCurrentLanguage() === "ar";

  const { packageCodes, billingCycle, setSelection } = useTenantSignup();

  /*
   * Nothing is cleared here.
   *
   * This screen used to wipe the draft on arrival, so that typing /tenant into
   * the address bar mid-signup — or coming back to change a package — threw
   * away everything already filled in. Starting fresh is a decision the
   * *landing page* makes, on the click that means "I want to buy this", and it
   * clears the session itself before writing the plan. Every other way of
   * reaching this URL is somebody stepping back inside a signup they are still
   * in the middle of.
   */

  const [packages, setPackages] = useState<CatalogPackage[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const loadCatalog = useCallback(() => {
    setCatalogError(null);
    setPackages(null);

    getCatalogPackages()
      .then((data) =>
        // The contract promises displayOrder; sorting here means a mis-ordered
        // response degrades to "wrong order", not "cards in insertion order".
        setPackages(
          [...(data ?? [])]
            .filter((pkg) => pkg.active)
            .sort((a, b) => a.displayOrder - b.displayOrder)
        )
      )
      .catch((err) => setCatalogError(toTenantSignupError(err, t("pricing.error")).message));
  }, [t]);

  useEffect(loadCatalog, [loadCatalog]);

  // --- Live pricing --------------------------------------------------------
  // Every checkbox and every cycle toggle re-prices the selection server-side.
  // The call writes nothing, so it is safe to make this often; a request
  // counter drops responses that arrive after a newer one, which is what a
  // fast-clicking buyer produces.
  const requestRef = useRef(0);

  useEffect(() => {
    if (packageCodes.length === 0) {
      requestRef.current += 1;
      setQuote(null);
      setQuoting(false);
      setQuoteError(null);
      return;
    }

    const requestId = ++requestRef.current;
    setQuoting(true);
    setQuoteError(null);

    const timer = window.setTimeout(() => {
      getQuote({ packageCodes, billingCycle })
        .then((data) => {
          if (requestRef.current !== requestId) return;
          setQuote(data);
        })
        .catch((err) => {
          if (requestRef.current !== requestId) return;

          const error = toTenantSignupError(err, t("common.error.generic"));

          // A package withdrawn from sale mid-session makes the whole catalog
          // stale, so refetch rather than leaving a card no one can buy.
          if (
            error.code === "TENANCY.PACKAGE.INACTIVE" ||
            error.code === "TENANCY.PACKAGE.NOT_FOUND"
          ) {
            loadCatalog();
          }

          setQuote(null);
          setQuoteError(error.message);
        })
        .finally(() => {
          if (requestRef.current === requestId) setQuoting(false);
        });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [packageCodes, billingCycle, loadCatalog, t]);

  /**
   * The bundle and the individual modules are mutually exclusive.
   *
   * "All Modules" already contains every other card, so a basket holding both
   * bills the buyer for a module and for the bundle that includes it. Picking
   * the bundle therefore clears the rest, and picking any single module drops
   * the bundle — the same rule read from either end.
   *
   * `togglePackage` from the context cannot do this: it is handed a code and
   * has no way to know which one is the everything-tier. That fact lives on the
   * catalogue, which is here.
   */
  const onTogglePackage = (pkg: CatalogPackage) => {
    const bundleCodes = new Set((packages ?? []).filter((p) => p.bundle).map((p) => p.packageCode));

    if (packageCodes.includes(pkg.packageCode)) {
      setSelection(
        packageCodes.filter((code) => code !== pkg.packageCode),
        billingCycle
      );
      return;
    }

    setSelection(
      pkg.bundle
        ? [pkg.packageCode]
        : [...packageCodes.filter((code) => !bundleCodes.has(code)), pkg.packageCode],
      billingCycle
    );
  };

  /**
   * The product name for a quote line.
   *
   * A quote line carries a description, not a name, and CORE is not in the
   * catalogue at all — it is appended server-side and never sold as a card. So
   * this falls back to the line's own code rather than rendering nothing.
   */
  const nameFor = (code: string): string => {
    const found = packages?.find((pkg) => pkg.packageCode === code);
    if (!found) return code;
    return isArabic ? found.nameAr : found.nameEn;
  };

  const onContinue = () => {
    setSelection(packageCodes, billingCycle);
    navigate(TENANT_SIGNUP_ROUTES.details);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <CycleToggle value={billingCycle} onChange={(cycle) => setSelection(packageCodes, cycle)} />
      </div>

      {catalogError ? (
        <StatusMessage className="mx-auto max-w-2xl">
          <div className="space-y-2">
            <p>{catalogError}</p>
            <button type="button" className="ts-link" onClick={loadCatalog}>
              {t("common.retry")}
            </button>
          </div>
        </StatusMessage>
      ) : null}

      <div className="grid gap-[1rem] sm:grid-cols-2 xl:grid-cols-3">
        {packages
          ? packages.map((pkg) => (
              <PackageCard
                key={pkg.packageCode}
                pkg={pkg}
                isArabic={isArabic}
                billingCycle={billingCycle}
                selected={packageCodes.includes(pkg.packageCode)}
                onToggle={() => onTogglePackage(pkg)}
              />
            ))
          : [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="ts-skeleton h-56" />)}
      </div>

      {/* --- What is in the basket ------------------------------------------
          Every figure here is the server's. VAT is calculated per line and
          rounded before summing, because ZATCA rejects an invoice whose printed
          lines do not add up to its total — so a browser applying 15% to the
          subtotal would disagree with the invoice by a halala on some
          selections. Nothing in this table is computed locally. */}
      <section className="ts-packages">
        <h2 className="ts-packages__title">{t("pricing.tableTitle")}</h2>

        <div className="ts-packages__scroll">
          <table className="ts-packages__table">
            <thead>
              <tr>
                <th scope="col">{t("pricing.col.product")}</th>
                <th scope="col">{t("pricing.col.details")}</th>
                <th scope="col">{t("pricing.col.cycle")}</th>
                <th scope="col" className="text-end">
                  {t("pricing.col.price")}
                </th>
                <th scope="col" className="text-end">
                  {t("pricing.col.taxes")}
                </th>
                <th scope="col" className="text-end">
                  {t("pricing.col.total")}
                </th>
              </tr>
            </thead>

            <tbody>
              {quote && !quoting && packageCodes.length > 0 ? (
                // Rendered in the order the server sent them: CORE is appended
                // last at zero, and it is shown rather than filtered because
                // the buyer should see exactly what the invoice will say.
                quote.lines.map((line) => (
                  <tr key={line.packageCode}>
                    <td className="font-semibold">{nameFor(line.packageCode)}</td>
                    <td className="ts-packages__detail">
                      {isArabic ? line.descriptionAr : line.descriptionEn}
                    </td>
                    <td>{t(`pricing.cycle.${quote.billingCycle}`)}</td>
                    <td className="ts-num text-end">
                      {formatMoney(line.lineSubtotal, quote.currency)}
                    </td>
                    <td className="ts-num text-end">
                      {formatMoney(line.lineVatAmount, quote.currency)}
                    </td>
                    <td className="ts-num text-end font-semibold">
                      {formatMoney(line.lineTotal, quote.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="ts-packages__empty">
                  {/* Dashes rather than a message: the row is a placeholder for
                      the shape of what is coming, and the buyer is already
                      looking at the cards that fill it. */}
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td className="text-end">—</td>
                  <td className="text-end">—</td>
                  <td className="text-end">—</td>
                </tr>
              )}
            </tbody>

            {quote && !quoting && packageCodes.length > 0 && (
              <tfoot>
                <tr>
                  <th scope="row" colSpan={3}>
                    {t("quote.total")}
                  </th>
                  <td className="ts-num text-end">{formatMoney(quote.subtotal, quote.currency)}</td>
                  <td className="ts-num text-end">
                    {formatMoney(quote.vatAmount, quote.currency)}
                  </td>
                  <td className="ts-num text-end">
                    {formatMoney(quote.totalAmount, quote.currency)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {quoteError ? <StatusMessage>{quoteError}</StatusMessage> : null}

        {quoting && packageCodes.length > 0 ? (
          <p role="status" className="ts-xs flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            {t("quote.pricing")}
          </p>
        ) : null}

        <p className="ts-xs text-muted-foreground">{t("pricing.coreIncluded")}</p>
      </section>

      <div className="flex justify-end">
        <SubmitButton
          type="button"
          onClick={onContinue}
          disabled={packageCodes.length === 0 || !quote || quoting}
          className="w-full sm:w-auto sm:min-w-40"
        >
          {t("pricing.continue")}
        </SubmitButton>
      </div>
    </div>
  );
}

function CycleToggle({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}) {
  const { t } = useTranslation("tenantSignup");
  const cycles: BillingCycle[] = ["MONTHLY", "ANNUAL"];

  return (
    <div role="group" aria-label={t("pricing.cycleLabel")} className="ts-cycle">
      {cycles.map((cycle) => (
        <button
          key={cycle}
          type="button"
          aria-pressed={value === cycle}
          data-active={value === cycle}
          onClick={() => onChange(cycle)}
          className="ts-cycle-btn"
        >
          {t(`pricing.cycle.${cycle}`)}
        </button>
      ))}
    </div>
  );
}

function PackageCard({
  pkg,
  isArabic,
  billingCycle,
  selected,
  onToggle,
}: {
  pkg: CatalogPackage;
  isArabic: boolean;
  billingCycle: BillingCycle;
  selected: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation("tenantSignup");

  const annual = billingCycle === "ANNUAL";
  const price = annual ? pkg.annualPrice : pkg.monthlyPrice;

  // "2 months free" is a claim about these two numbers, so it is computed from
  // them — hardcoding it would go stale the moment pricing moves.
  const saving = pkg.monthlyPrice * 12 - pkg.annualPrice;

  const points = descriptionPoints(isArabic ? pkg.descriptionAr : pkg.descriptionEn);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      data-selected={selected}
      data-bundle={pkg.bundle}
      // The whole card is the hit target, so it is a real <button>: keyboard
      // and screen-reader behaviour come free, and there is no invisible
      // checkbox to fall out of sync with it.
      className="ts-plan"
    >
      {/* The everything-tier is the recommended one by construction — it is the
          only package that contains the others — so the ribbon follows the
          catalogue rather than a hardcoded position in the grid. */}
      {pkg.bundle && <span className="ts-plan__ribbon">{t("pricing.bundleTag")}</span>}

      <span className="ts-plan__head">
        <span className="ts-plan__name">{isArabic ? pkg.nameAr : pkg.nameEn}</span>
        <span className="ts-plan__cycle">
          {annual ? t("pricing.perYear") : t("pricing.perMonth")}
        </span>
        <span className="ts-plan__price ts-num">{formatMoney(price, pkg.currency)}</span>

        <span className="ts-plan__mark" aria-hidden="true">
          <Boxes />
        </span>
      </span>

      <span className="ts-plan__body">
        {/* The catalogue's own sentence, split on its commas. The moduleCodes
            array would be a truer list but it is identity-service internals —
            DASHBOARD, BLOCK_CODE — and the contract says to show the
            description instead. */}
        <span className="ts-plan__list">
          {points.map((point) => (
            <span key={point}>
              <Check aria-hidden="true" />
              {point}
            </span>
          ))}
        </span>

        {annual && saving > 0 ? (
          <span className="ts-plan__save">
            <TrendingDown className="size-3.5" aria-hidden="true" />
            {t("pricing.save", { amount: formatMoney(saving, pkg.currency) })}
          </span>
        ) : null}

        {/* Not "Subscribe Now": this card adds to a basket that is priced and
            paid for two screens later, and a button that says otherwise makes
            a promise the next click does not keep. */}
        <span className="ts-plan__pick" data-selected={selected}>
          {selected ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          {selected ? t("pricing.selected") : t("pricing.select")}
        </span>
      </span>
    </button>
  );
}
