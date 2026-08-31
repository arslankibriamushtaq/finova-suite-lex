import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import BrandLogo from "../../components/shared/BrandLogo";
import { useLanguage } from "../../hooks/use-language";
import { languages } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import StepBar from "./components/StepBar";
import { stepForRoute } from "./navigation";
import { TenantSignupProvider } from "./TenantSignupContext";

/**
 * How wide each step's column runs.
 *
 * Pricing is a marketing page — five cards side by side plus a summary rail —
 * and needs the full width. Details carries the same rail beside a form, so it
 * needs room for two columns but not six cards: 64rem seats a ~40rem form, the
 * 20rem rail and the gutter between them without stretching the fields to an
 * uncomfortable line length. Payment and setup are a single column of status.
 */
const STEP_WIDTH: Record<string, string> = {
  pricing: "max-w-6xl",
  details: "max-w-5xl",
};

const DEFAULT_WIDTH = "max-w-2xl";

function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation("tenantSignup");

  return (
    <div
      role="group"
      aria-label={t("shell.language")}
      className="ts-cycle ts-cycle--sm"
    >
      {languages.map((language) => {
        const active = language.code === currentLanguage.code;
        return (
          <button
            key={language.code}
            type="button"
            onClick={() => setLanguage(language)}
            aria-pressed={active}
            data-active={active}
            className="ts-cycle-btn"
          >
            {language.nativeName}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Route element for `/tenant/*` — the public self-signup journey.
 *
 * Deliberately NOT wrapped in `<PublicRoute>`, for the same reason the business
 * onboarding flow is not: that guard bounces anyone holding an admin token to
 * the dashboard, which would stop a signed-in employee from ever showing a
 * prospect the pricing page.
 *
 * There is no session guard on the inner screens either. Each one re-reads what
 * it needs from `sessionStorage` and redirects itself when it is missing, which
 * keeps a refresh on the provisioning screen — the one place where money has
 * already changed hands — from being routed away by a shell that hydrates a
 * beat later.
 */
export default function TenantSignupLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation("tenantSignup");

  const step = stepForRoute(pathname);
  const columnWidth = (step && STEP_WIDTH[step]) ?? DEFAULT_WIDTH;

  return (
    <TenantSignupProvider>
      <div className="tenant-signup ts-shell flex min-h-screen flex-col text-foreground">
        <header className="ts-header">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-[1rem] px-[1.25rem] sm:px-8">
            <BrandLogo alt={t("shell.brandAlt")} className="h-8 w-auto" />
            <LanguageSwitcher />
          </div>
        </header>

        <main
          className={cn(
            "mx-auto w-full flex-1 px-[1.25rem] py-10 sm:px-8 sm:py-14",
            columnWidth
          )}
        >
          {step ? (
            <div className="mx-auto mb-9 max-w-2xl">
              <StepBar current={step} />
            </div>
          ) : null}

          <Outlet />
        </main>

        <footer className="px-[1.25rem] pb-10 sm:px-8">
          <p className="mx-auto flex max-w-2xl items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
            {t("shell.footer")}
          </p>
        </footer>
      </div>
    </TenantSignupProvider>
  );
}
