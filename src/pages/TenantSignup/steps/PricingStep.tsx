import { Check, Loader2, Sparkles } from "lucide-react";
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
import { cn } from "../../../lib/utils";
import QuoteLines from "../components/QuoteLines";
import StatusMessage from "../components/StatusMessage";
import SubmitButton from "../components/SubmitButton";
import { formatMoney } from "../format";
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

  const { packageCodes, billingCycle, setSelection, togglePackage } =
    useTenantSignup();

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
      .catch((err) =>
        setCatalogError(toTenantSignupError(err, t("pricing.error")).message)
      );
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

  const onContinue = () => {
    setSelection(packageCodes, billingCycle);
    navigate(TENANT_SIGNUP_ROUTES.details);
  };

  return (
    <div className="space-y-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="ts-display">{t("pricing.headline")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("pricing.sub")}
        </p>
      </header>

      <div className="flex justify-center">
        <CycleToggle
          value={billingCycle}
          onChange={(cycle) => setSelection(packageCodes, cycle)}
        />
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-[1rem] sm:grid-cols-2">
          {packages
            ? packages.map((pkg) => (
                <PackageCard
                  key={pkg.packageCode}
                  pkg={pkg}
                  isArabic={isArabic}
                  billingCycle={billingCycle}
                  selected={packageCodes.includes(pkg.packageCode)}
                  onToggle={() => togglePackage(pkg.packageCode)}
                />
              ))
            : [0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="ts-card space-y-4 rounded-2xl p-[1.25rem]">
            <h2 className="ts-card-title">{t("pricing.summaryTitle")}</h2>

            {packageCodes.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                {t("pricing.summaryEmpty")}
              </p>
            ) : quoteError ? (
              <StatusMessage>{quoteError}</StatusMessage>
            ) : quote && !quoting ? (
              <QuoteLines quote={quote} />
            ) : (
              <p
                role="status"
                className="flex items-center gap-2 text-[13px] text-muted-foreground"
              >
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                {t("quote.pricing")}
              </p>
            )}

            <SubmitButton
              type="button"
              onClick={onContinue}
              disabled={packageCodes.length === 0 || !quote || quoting}
            >
              {t("pricing.continue")}
            </SubmitButton>

            <p className="ts-xs text-muted-foreground">
              {t("pricing.coreIncluded")}
            </p>
          </div>
        </aside>
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
    <div
      role="group"
      aria-label={t("pricing.cycleLabel")}
      className="flex items-center gap-0.5 rounded-xl bg-muted p-1"
    >
      {cycles.map((cycle) => (
        <button
          key={cycle}
          type="button"
          aria-pressed={value === cycle}
          onClick={() => onChange(cycle)}
          className={cn(
            "rounded-lg px-[1rem] py-2 text-[13px] font-medium transition-colors",
            value === cycle
              ? "bg-[var(--surface-card)] text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
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

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      data-selected={selected}
      data-bundle={pkg.bundle}
      className={cn(
        // The whole card is the hit target, so it is a real <button>: keyboard
        // and screen-reader behaviour come free, and there is no invisible
        // checkbox to fall out of sync with it.
        "ts-package flex h-full flex-col rounded-2xl p-[1.25rem] text-start",
        pkg.bundle && "sm:col-span-2"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-[0.75rem]">
        <h3 className="ts-card-title min-w-0">
          {isArabic ? pkg.nameAr : pkg.nameEn}
        </h3>

        {pkg.bundle ? (
          <span className="ts-xs inline-flex shrink-0 items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] px-2 py-0.5 font-semibold text-[var(--primary)]">
            <Sparkles className="size-3" aria-hidden="true" />
            {t("pricing.bundleTag")}
          </span>
        ) : null}
      </div>

      <p className="ts-xs mb-4 leading-relaxed text-muted-foreground">
        {isArabic ? pkg.descriptionAr : pkg.descriptionEn}
      </p>

      <div className="mt-auto space-y-3">
        <div className="flex items-baseline gap-1.5">
          <span className="ts-price">{formatMoney(price, pkg.currency)}</span>
          <span className="ts-xs text-muted-foreground">
            {annual ? t("pricing.perYear") : t("pricing.perMonth")}
          </span>
        </div>

        {annual && saving > 0 ? (
          <p className="ts-xs font-medium text-[var(--color-success-text)]">
            {t("pricing.save", {
              amount: formatMoney(saving, pkg.currency),
            })}
          </p>
        ) : null}

        <span
          className={cn(
            "ts-xs inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold",
            selected
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--muted)] text-foreground"
          )}
        >
          {selected ? <Check className="size-3.5" aria-hidden="true" /> : null}
          {selected ? t("pricing.selected") : t("pricing.select")}
        </span>
      </div>
    </button>
  );
}
