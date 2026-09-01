import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  Boxes,
  Building2,
  FileCheck2,
  Landmark,
  Layers,
  LineChart,
  Lock,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import BrandLogo from "../../components/shared/BrandLogo";
import { getProductsListing } from "../../redux/apis/apisCrudFactoring";
import { setProdId } from "../../redux/apis/apisSlice";
import "../../styles/landing.css";

/**
 * The public front door.
 *
 * Every claim on this page is drawn from what the platform actually ships —
 * the module catalogue the tenant signup sells, and the integrations the
 * onboarding flow calls. No invented metrics: a lending platform sold to
 * regulated lenders cannot open with numbers it cannot evidence.
 */

/** The shape this page needs from the (untyped) products endpoint. */
interface ListedProduct {
  id: number | string;
  name_en: string;
}

/** The catalogue, in the words the pricing screen sells it with. */
const MODULES = [
  {
    icon: Building2,
    name: "Loan Origination",
    blurb:
      "Customer onboarding, Nafath/Yakeen/Simah KYC, risk and fraud screening, product catalogue and the application workflow.",
  },
  {
    icon: Landmark,
    name: "Loan Management",
    blurb:
      "Disbursement, Murabaha and Ijara servicing, repayment schedules, restructuring and the double-entry ledger.",
  },
  {
    icon: FileCheck2,
    name: "Exception Handling",
    blurb:
      "Verification-exception cases, a decision matrix, SLA policies, document requests, a knowledge base and BI dashboards.",
  },
  {
    icon: Banknote,
    name: "Collections & Dunning",
    blurb:
      "Delinquency tracking, dunning campaigns, payment capture, settlements and promise-to-pay management.",
  },
  {
    icon: Layers,
    name: "Wallet, Cards & Crypto",
    blurb:
      "Wallets and ledgers, card issuing and management, crypto treasury and the PII vault — in the everything tier.",
  },
  {
    icon: Users,
    name: "Core Platform",
    blurb:
      "Sign-in, employees, departments, roles, permissions and notifications. Included with every subscription, at no cost.",
  },
];

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Built for Saudi compliance",
    body: "Nafath, Yakeen and Simah for identity and credit. ZATCA-compliant e-invoicing with the QR on every document, generated once and never re-encoded.",
  },
  {
    icon: BookOpen,
    title: "Shariah-compliant by construction",
    body: "Murabaha and Ijara servicing are first-class in the ledger, not adapted from a conventional amortisation model.",
  },
  {
    icon: Boxes,
    title: "Buy only the modules you run",
    body: "Subscribe to what you use today and add the rest whenever you are ready. Changing your plan takes effect on new quotes; existing bills never move.",
  },
  {
    icon: LineChart,
    title: "A double-entry ledger underneath",
    body: "Disbursement, repayment, restructuring and settlement all post to the same ledger, so the books reconcile without a nightly export.",
  },
  {
    icon: Lock,
    title: "Isolated per tenant",
    body: "Every workspace is provisioned with its own identity realm, roles and permission set. Entitlements decide what each company can reach.",
  },
  {
    icon: BadgeCheck,
    title: "Live in minutes, not quarters",
    body: "Pick your modules, tell us about the company, pay, and the workspace provisions itself. The first administrator gets an activation email.",
  },
];

/** Mirrors the real signup: choose, describe, pay, and it provisions. */
const STEPS = [
  {
    title: "Choose your modules",
    body: "Price the platform monthly or annually and see the quote — including VAT — before you commit to anything.",
  },
  {
    title: "Tell us about the company",
    body: "Commercial registration, VAT number and the first administrator. That is what raises your invoice and creates your workspace.",
  },
  {
    title: "Go live",
    body: "Payment completes, provisioning runs, and your administrator receives an activation link to set a password and sign in.",
  },
];

const TRUST = [
  "Nafath · Yakeen · Simah",
  "ZATCA e-invoicing",
  "Murabaha & Ijara",
  "Double-entry ledger",
  "Arabic & English",
];

const LandingHome = () => {
  const { t } = useTranslation("webPages");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [products, setProducts] = useState<ListedProduct[]>([]);
  const [stuck, setStuck] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProductsListing();
        if (res?.data?.success && Array.isArray(res.data.data)) {
          setProducts(res.data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        // The rest of the page stands on its own; a missing catalogue just
        // means that section is not rendered.
        console.error("Failed to load products listing", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  /** The header only earns its border once the hero has moved under it. */
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Reveal on scroll.
   *
   * The hidden starting state is applied by `data-reveal="on"`, which is set
   * here rather than in the markup — so if this effect never runs, the page
   * renders fully visible instead of permanently blank. One-way on purpose:
   * re-hiding what you scroll back to reads as a bug, not as polish.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-item]"));
    if (items.length === 0) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      items.forEach((el) => el.setAttribute("data-revealed", "true"));
      return;
    }

    root.setAttribute("data-reveal", "on");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        });
      },
      // A little before the element arrives, so it finishes settling as it
      // reaches comfortable reading height rather than starting there.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products.length]);

  const handleApply = (product: ListedProduct) => {
    dispatch(setProdId({ prodId: product.id }));
    navigate("/applyloan/partner");
  };

  /** Staggers a group so a row of cards arrives in sequence, not as a block. */
  const stagger = (index: number) =>
    ({ "--reveal-delay": `${Math.min(index, 6) * 70}ms` }) as React.CSSProperties;

  return (
    <div className="fin-landing" ref={rootRef}>
      {/* ---------------------------------------------------------------- */}
      <header className="ln-header" data-stuck={stuck}>
        <div className="ln-wrap flex h-16 items-center justify-between gap-4 px-5">
          <BrandLogo alt="Finova" className="h-8 w-auto" />

          <nav className="hidden items-center gap-7 lg:flex">
            <a className="ln-navlink" href="#modules">
              Modules
            </a>
            <a className="ln-navlink" href="#why">
              Why Finova
            </a>
            <a className="ln-navlink" href="#how">
              How it works
            </a>
            <a className="ln-navlink" href="/tenant">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a className="ln-btn ln-btn--ghost ln-btn--sm" href="/login">
              Sign in
            </a>
            <a className="ln-btn ln-btn--primary ln-btn--sm" href="/tenant">
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* --- Hero -------------------------------------------------------- */}
      <section className="ln-hero">
        {/* Background, back to front: a slow aurora built from the brand ramp,
            then the technical grid over it. Both purely decorative. */}
        <div className="ln-aurora" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="ln-grid" aria-hidden="true" />

        <div className="ln-wrap">
          <div className="ln-narrow text-center">
            <div data-reveal-item>
              <span className="ln-eyebrow">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Lending platform for Saudi Arabia
              </span>
            </div>

            <h1 className="ln-display mt-6" data-reveal-item style={stagger(1)}>
              Originate, service and collect
              <span className="ln-accent"> on one platform</span>
            </h1>

            <p className="ln-lead mt-6" data-reveal-item style={stagger(2)}>
              Finova runs the whole lending lifecycle: onboarding and KYC, Shariah-compliant
              servicing, exception handling and collections — on a double-entry ledger, with
              ZATCA-compliant invoicing built in.
            </p>

            <div
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              data-reveal-item
              style={stagger(3)}
            >
              <a className="ln-btn ln-btn--primary" href="/tenant">
                See pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a className="ln-btn ln-btn--ghost" href="#modules">
                Explore the modules
              </a>
            </div>

            {/* The rails, as chips rather than a run of grey words. Its own rule
                and generous top margin keep it off the action row — as bare
                text it crowded the buttons and read as a caption to them. */}
            <ul className="ln-trust" data-reveal-item style={stagger(4)}>
              {TRUST.map((item) => (
                <li key={item} className="ln-trust-item">
                  <span className="ln-trust-dot" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* --- Modules ----------------------------------------------------- */}
      <section className="ln-section" id="modules">
        <div className="ln-wrap">
          <div className="ln-narrow text-center" data-reveal-item>
            <span className="ln-kicker">The platform</span>
            <h2 className="ln-h2">Everything a lender runs, as modules</h2>
            <p className="ln-lead mt-4">
              Subscribe to what you use today and add the rest whenever you are ready. Core is
              included with every plan.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <article
                  className="ln-card ln-card--ruled"
                  key={mod.name}
                  data-reveal-item
                  style={stagger(i)}
                >
                  <span className="ln-card__icon">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{mod.name}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {mod.blurb}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Why --------------------------------------------------------- */}
      <section
        className="ln-section"
        id="why"
        style={{
          background: "color-mix(in srgb, var(--primary) 4%, var(--surface-card))",
        }}
      >
        <div className="ln-wrap">
          <div className="ln-narrow text-center" data-reveal-item>
            <span className="ln-kicker">Why Finova</span>
            <h2 className="ln-h2">Built for this market, not adapted to it</h2>
            <p className="ln-lead mt-4">
              Built for the regulation, the products and the languages this market actually
              uses.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <article
                  className="ln-card ln-card--ruled"
                  key={reason.title}
                  data-reveal-item
                  style={stagger(i)}
                >
                  <span className="ln-card__icon">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{reason.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {reason.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- How it works ------------------------------------------------ */}
      <section className="ln-section" id="how">
        <div className="ln-wrap">
          <div className="ln-narrow text-center" data-reveal-item>
            <span className="ln-kicker">Getting started</span>
            <h2 className="ln-h2">Live in three steps</h2>
            <p className="ln-lead mt-4">
              The whole journey is self-serve. No sales call is required to see the price.
            </p>
          </div>

          <div className="ln-steps mt-14 grid gap-10 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                className="text-center"
                key={step.title}
                data-reveal-item
                style={stagger(i)}
              >
                <span className="ln-step__num">{i + 1}</span>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Financing products, when the catalogue has any --------------- */}
      {products.length > 0 && (
        <section
          className="ln-section"
          style={{
            background: "color-mix(in srgb, var(--primary) 4%, var(--surface-card))",
          }}
        >
          <div className="ln-wrap">
            <div className="ln-narrow text-center" data-reveal-item>
              <span className="ln-kicker">Financing</span>
              <h2 className="ln-h2">{t("form.ourProducts")}</h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => (
                <article
                  className="ln-card flex flex-col"
                  key={product.id}
                  data-reveal-item
                  style={stagger(i)}
                >
                  <span className="ln-card__icon">
                    <Banknote className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{product.name_en}</h3>
                  <button
                    type="button"
                    className="ln-btn ln-btn--ghost ln-btn--sm mt-6 w-full"
                    onClick={() => handleApply(product)}
                  >
                    {t("form.applyFor", { name: product.name_en })}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- Closing band ------------------------------------------------ */}
      <section className="ln-section">
        <div className="ln-wrap">
          <div className="ln-band" data-reveal-item>
            <h2 className="ln-h2">Ready to see what it costs?</h2>
            <p className="ln-lead ln-narrow mt-4" style={{ color: "rgba(255,255,255,0.9)" }}>
              Price the modules you need, monthly or annually, with VAT shown before you
              commit to anything.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                className="ln-btn"
                href="/tenant"
                style={{ background: "#ffffff", color: "var(--brand-700, #8d161c)" }}
              >
                See pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                className="ln-btn"
                href="/Contact"
                style={{
                  background: "transparent",
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.55)",
                }}
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                Talk to us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer ------------------------------------------------------ */}
      <footer className="ln-footer">
        <div className="ln-wrap px-5 py-12">
          {/* One group of four links is not a column — as a column it left the
              middle of the footer empty and the links stranded in the far
              corner. Laid out as a row on the brand's own line instead. */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <BrandLogo alt="Finova" className="h-7 w-auto" />
              <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                The lending platform for Saudi Arabia — origination, servicing, exceptions
                and collections on one ledger.
              </p>
            </div>

            <nav className="ln-foot-nav">
              <a className="ln-foot-link" href="#modules">
                Modules
              </a>
              <a className="ln-foot-link" href="#how">
                How it works
              </a>
              <a className="ln-foot-link" href="/tenant">
                Pricing
              </a>
              <a className="ln-foot-link" href="/login">
                Sign in
              </a>
            </nav>
          </div>

          <div className="mt-9 flex flex-col gap-3 border-t border-[var(--surface-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Finova. Powered by MYTM LLC KSA.
            </p>
            <p className="text-xs text-muted-foreground">
              Riyadh, Kingdom of Saudi Arabia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingHome;
