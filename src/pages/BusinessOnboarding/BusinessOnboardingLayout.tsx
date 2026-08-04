// Real flag artwork, self-hosted. Unicode flag emoji are not an option: Windows
// ships no regional-indicator glyphs, so 🇸🇦 renders as the letters "SA".
// Imported here, at the flow's root, so it loads with these routes and nowhere else.
import "flag-icons/css/flag-icons.min.css";

import { Loader2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Images } from "../../components/Config/Images";
import { languages } from "../../lib/i18n";
import { useLanguage } from "../../hooks/use-language";
import { cn } from "../../lib/utils";
import BackLink from "./components/BackLink";
import PhaseStepper from "./components/PhaseStepper";
import { BusinessOnboardingProvider, useBusinessOnboarding } from "./OnboardingContext";
import {
  BUSINESS_ONBOARDING_ROUTES,
  phaseForRoute,
  previousRoute,
} from "./navigation";

/** The only screen reachable without a session — everything else needs one. */
const ENTRY_ROUTE = BUSINESS_ONBOARDING_ROUTES.start;

/**
 * Screens that hold a two-column grid or a document list need more room than a
 * single-column form; everything else reads better in a narrow column.
 */
const WIDE_ROUTES = new Set<string>([
  BUSINESS_ONBOARDING_ROUTES.documents,
  BUSINESS_ONBOARDING_ROUTES.passportReview,
  BUSINESS_ONBOARDING_ROUTES.pep,
]);

function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation("businessOnboarding");

  return (
    <div
      role="group"
      aria-label={t("shell.language")}
      className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5"
    >
      {languages.map((language) => {
        const active = language.code === currentLanguage.code;
        return (
          <button
            key={language.code}
            type="button"
            onClick={() => setLanguage(language)}
            aria-pressed={active}
            className={cn(
              "biz-xs rounded-md px-2.5 py-1.5 font-medium transition-colors",
              active
                ? "bg-[var(--surface-card)] text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {language.nativeName}
          </button>
        );
      })}
    </div>
  );
}

function OnboardingShell() {
  const { pathname } = useLocation();
  const { sessionId, data, rehydrating } = useBusinessOnboarding();
  const { t } = useTranslation("businessOnboarding");

  // Deep-linking into the middle of the flow without a session is a dead end:
  // /initiate re-finds an in-flight application from email + mobile, so the
  // entry screen is always the right place to land.
  if (!sessionId && pathname !== ENTRY_ROUTE) {
    return <Navigate to={ENTRY_ROUTE} replace />;
  }

  const phase = phaseForRoute(pathname);
  const columnWidth = WIDE_ROUTES.has(pathname) ? "max-w-2xl" : "max-w-xl";
  const backTo = previousRoute(pathname, { passportReused: data.passportReused });

  return (
    <div className="biz-onboarding flex min-h-screen flex-col bg-[var(--color-surface-page)] text-foreground">
      <header className="border-b border-[color-mix(in_srgb,var(--primary)_12%,var(--surface-border))] bg-[var(--surface-card)]">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-[1rem] px-[1.25rem] sm:px-8">
          <img
            src={Images.DashboardLogo}
            alt={t("shell.brandAlt")}
            className="h-8 w-auto"
          />
          <LanguageSwitcher />
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full flex-1 px-[1.25rem] py-10 sm:px-8 sm:py-14",
          columnWidth
        )}
      >
        {phase ? (
          <div className="mb-7">
            <PhaseStepper current={phase} />
          </div>
        ) : null}

        {backTo && !rehydrating ? (
          <div className="mb-4">
            <BackLink to={backTo} />
          </div>
        ) : null}

        {rehydrating ? (
          <div
            role="status"
            aria-live="polite"
            className="biz-card flex flex-col items-center gap-[0.75rem] rounded-2xl px-6 py-20"
          >
            <Loader2 className="size-6 animate-spin text-[var(--primary)]" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{t("shell.restoring")}</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <footer className="px-[1.25rem] pb-10 sm:px-8">
        <p className="mx-auto flex max-w-xl items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
          {t("shell.footer")}
        </p>
      </footer>
    </div>
  );
}

/** Route element for `/business/*` — public, no auth guard. */
export default function BusinessOnboardingLayout() {
  return (
    <BusinessOnboardingProvider>
      <OnboardingShell />
    </BusinessOnboardingProvider>
  );
}
