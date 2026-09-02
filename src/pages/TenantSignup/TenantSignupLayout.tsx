import { useEffect } from "react";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import BrandLogo from "../../components/shared/BrandLogo";
import { useLanguage } from "../../hooks/use-language";
import { languages } from "../../lib/i18n";
import StepRail from "./components/StepRail";
import { stepForRoute } from "./navigation";
import { TenantSignupProvider } from "./TenantSignupContext";

/**
 * Short codes, not native names.
 *
 * The rail beside it is the widest thing in the header, and "Français" next to
 * "العربية" pushed the switch onto a second line on a laptop. Two letters is
 * what the design shows and all anyone needs to recognise their own language.
 */
function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation("tenantSignup");

  return (
    <div role="group" aria-label={t("shell.language")} className="ts-lang">
      {languages.map((language) => {
        const active = language.code === currentLanguage.code;
        return (
          <button
            key={language.code}
            type="button"
            onClick={() => setLanguage(language)}
            aria-pressed={active}
            data-active={active}
            className="ts-lang__btn"
            title={language.nativeName}
          >
            {language.code.slice(0, 2).toUpperCase()}
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

  // A router navigation keeps the window's scroll offset. Pricing is a long
  // page, so anyone who scrolled to the packages and continued arrived at the
  // details form already scrolled past the step rail and into the middle of it —
  // looking, on first sight, like a broken page. Jump, don't smooth-scroll:
  // this is a new screen, not a move within one.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <TenantSignupProvider>
      <div className="tenant-signup ts-shell text-foreground">
        <div className="ts-frame">
          <header className="ts-topbar">
            <BrandLogo alt={t("shell.brandAlt")} className="h-7 w-auto" />
            <LanguageSwitcher />
          </header>

          {/* Rail and content are siblings in one grid rather than the rail
              being fixed: the rail has to stop at the footer, and a fixed
              element does not know where the footer is. */}
          <div className="ts-body">
            {step && (
              <aside className="ts-aside">
                <StepRail current={step} />
              </aside>
            )}

            <main className="ts-main">
              <Outlet />
            </main>
          </div>

          <footer className="ts-bottombar">
            <BrandLogo alt={t("shell.brandAlt")} className="h-6 w-auto" />
            <a className="ts-phone" href={`tel:${t("shell.phone").replace(/\s/g, "")}`}>
              <Phone aria-hidden="true" />
              {t("shell.phone")}
            </a>
          </footer>
        </div>
      </div>
    </TenantSignupProvider>
  );
}
