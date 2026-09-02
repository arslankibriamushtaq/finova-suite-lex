import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";

import BrandLogo from "../../components/shared/BrandLogo";
import {
  getCatalogPackages,
  type BillingCycle,
  type CatalogPackage,
} from "../../redux/apis/apisTenantProvisioning";
import { formatMoney } from "../TenantSignup/format";
import { setSelection } from "../../utils/tenantSignupSession";
import heroImage from "../../assets/images/landing/hero.jpg";
import aboutImage from "../../assets/images/landing/experience.jpg";
import bandImage from "../../assets/images/landing/intro.jpg";
import portraitImage from "../../assets/images/landing/portrait.png";
import "../../styles/landing.css";

/**
 * The public front door, built to the Finova Tenant Onboarding design.
 *
 * Every claim on this page is drawn from what the platform actually ships — the
 * module catalogue the tenant signup sells and the integrations the onboarding
 * flow calls. No invented metrics and no invented prices: a lending platform
 * sold to regulated lenders cannot open with numbers it cannot evidence, and
 * the real quote is computed by the signup flow this page links into.
 */

/** The three headline products, worded as the design words them. */
const PRODUCTS = [
  {
    name: "Onboarding Studio",
    promise: "Revolutionize Customer Onboarding with Seamless Integration",
    points: [
      "Simplify onboarding with intuitive tools.",
      "Customize workflows to fit your needs.",
      "Track progress with real-time analytics.",
    ],
  },
  {
    name: "Loan Origination System",
    promise: "Transform Loan Processing with Speed and Accuracy",
    points: [
      "Automate approvals for faster decisions.",
      "Ensure compliance with built-in checks.",
      "Integrate effortlessly with existing systems.",
    ],
  },
  {
    name: "Loan Management System",
    promise: "Optimize Loan Portfolio Management with Advanced Tools",
    points: [
      "Centralize loan tracking and management.",
      "Automate payment schedules and reminders.",
      "Integrate effortlessly with existing systems.",
    ],
  },
];

const REASONS = [
  {
    icon: ShieldCheck,
    title: "100% Secure",
    body: "Your data is protected with industry-leading security measures, ensuring peace of mind for you and your customers.",
  },
  {
    icon: RefreshCw,
    title: "Auto Update",
    body: "Our platform automatically updates with the latest features, so you are always ahead of the curve without lifting a finger.",
  },
  {
    icon: Lock,
    title: "Account Isolation",
    body: "Every workspace is provisioned with its own identity realm, roles and permission set, so no tenant can reach another one's data.",
  },
  {
    icon: BadgeCheck,
    title: "Saudi Compliance",
    body: "Nafath, Yakeen and Simah for identity and credit, and ZATCA-compliant e-invoicing with the QR on every document we issue.",
  },
  {
    icon: BookOpen,
    title: "Shariah-Compliant",
    body: "Murabaha and Ijara servicing are first-class in the ledger, not adapted from a conventional amortisation model.",
  },
  {
    icon: Zap,
    title: "Live in Minutes",
    body: "Payment completes, provisioning runs on its own, and your first administrator receives an activation link to sign in.",
  },
];

const FAQS = [
  {
    q: "How long does it take to go live?",
    a: "Minutes, not quarters. Once payment completes, provisioning runs on its own and your first administrator receives an activation link to set a password and sign in.",
  },
  {
    q: "Can I start with one module and add more later?",
    a: "Yes. Subscribe to what you run today and add the rest whenever you are ready. A plan change takes effect on new quotes — invoices already issued never move.",
  },
  {
    q: "Is the platform Shariah-compliant?",
    a: "Murabaha and Ijara servicing are first-class in the ledger rather than adapted from a conventional amortisation model, so the profit treatment is correct from disbursement through settlement.",
  },
  {
    q: "Which Saudi services do you integrate with?",
    a: "Nafath and Yakeen for identity, Simah for credit, and ZATCA-compliant e-invoicing with the QR encoded on every document we issue.",
  },
  {
    q: "Does it work in Arabic?",
    a: "The whole product runs in Arabic and English, right-to-left included — not a translated skin over a left-to-right layout.",
  },
  {
    q: "Is my data separated from other tenants?",
    a: "Every workspace is provisioned with its own identity realm, roles and permission set, and entitlements decide which modules that company can reach at all.",
  },
];

/**
 * A scroll-snap rail with page dots, arrows and optional autoplay.
 *
 * Pages are measured rather than declared: how many cards fit in a viewport is
 * what decides how many pages there are, and that changes with the window. Two
 * sections use this, so it lives here rather than being written twice.
 */
function useRail(autoplayMs = 0) {
  /**
   * A callback ref held in state, not a useRef.
   *
   * The plans rail only mounts once the catalogue resolves — before that the
   * section renders skeletons. With a useRef and an empty dependency list the
   * measuring effect ran against a rail that did not exist yet, bailed out, and
   * never ran again: pages stayed at 1, so the dots rendered nothing and
   * autoplay refused to start. A callback ref re-renders when the element
   * arrives, which is the signal the effect needs.
   */
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const ref = useCallback((element: HTMLDivElement | null) => setNode(element), []);

  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!node) return;

    const measure = () => {
      const width = node.clientWidth || 1;
      // A hair under a whole page, so a track a fraction of a pixel wider than
      // its viewport does not report a second page nobody can reach.
      setPages(Math.max(1, Math.ceil((node.scrollWidth - 2) / width)));
      // RTL reports a negative offset in some engines.
      setPage(Math.round(Math.abs(node.scrollLeft) / width));
    };

    measure();
    node.addEventListener("scroll", measure, { passive: true });

    // The rail's own box changing — a window resize, a sidebar opening.
    const resize = new ResizeObserver(measure);
    resize.observe(node);

    // Cards being added or removed changes scrollWidth without touching the
    // box, so a ResizeObserver alone would miss it.
    const mutation = new MutationObserver(measure);
    mutation.observe(node, { childList: true });

    return () => {
      node.removeEventListener("scroll", measure);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [node]);

  const goToPage = useCallback(
    (index: number) => {
      if (!node) return;
      const offset = index * node.clientWidth;
      node.scrollTo({ left: node.scrollLeft < 0 ? -offset : offset, behavior: "smooth" });
    },
    [node]
  );

  // Refs, not the state values, so the callback stays stable and the autoplay
  // interval is not torn down and rebuilt on every page change.
  const pageRef = useRef(0);
  const pagesRef = useRef(1);
  pageRef.current = page;
  pagesRef.current = pages;

  const step = useCallback(
    (delta: number) => {
      // Wraps, so the arrows are never dead ends and autoplay never stalls on
      // the last card.
      const count = pagesRef.current;
      if (count < 2) return;
      goToPage((pageRef.current + delta + count) % count);
    },
    [goToPage]
  );

  /**
   * Autoplay, with every reason to stop honoured: a pointer over the rail, the
   * keyboard inside it, a background tab, a reduced-motion preference, or
   * nowhere to advance to. Movement a reader did not ask for should never fight
   * the reader who is mid-sentence.
   */
  useEffect(() => {
    if (!autoplayMs || paused || pages < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (document.hidden) return;
      step(1);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, paused, pages, step]);

  /** Spread on the rail element so hover and focus suspend autoplay. */
  const holdProps = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
    onTouchStart: () => setPaused(true),
  };

  return { ref, page, pages, goToPage, step, holdProps };
}

/** Arrows and dots under a rail. Drawn only when there is somewhere to go. */
function RailControls({ rail, label }: { rail: ReturnType<typeof useRail>; label: string }) {
  if (rail.pages < 2) return null;

  return (
    <div className="ln-railctl">
      <button
        type="button"
        className="ln-arrow"
        aria-label={`${label}: previous`}
        onClick={() => rail.step(-1)}
      >
        <ChevronLeft />
      </button>

      <div className="ln-dots">
        {Array.from({ length: rail.pages }).map((_, index) => (
          <button
            key={index}
            type="button"
            className="ln-dot"
            data-active={index === rail.page}
            aria-label={`${label}: go to slide ${index + 1} of ${rail.pages}`}
            aria-current={index === rail.page}
            onClick={() => rail.goToPage(index)}
          />
        ))}
      </div>

      <button
        type="button"
        className="ln-arrow"
        aria-label={`${label}: next`}
        onClick={() => rail.step(1)}
      >
        <ChevronRight />
      </button>
    </div>
  );
}

/**
 * Entitlement codes are what the catalogue ships (LOAN_ORIGINATION, PII_VAULT).
 * They are the honest content for a plan's feature list — they are exactly what
 * the subscription grants — but they are not English, so they get title-cased
 * for display. The code itself is never edited, only how it is printed.
 */
/**
 * How many entitlements a plan card prints before it summarises the rest.
 *
 * The cards stretch to the tallest in the row, and the everything-tier carries
 * every module in the catalogue — left uncapped, one plan with thirty codes
 * gave every other plan thirty codes' worth of empty space under a five-line
 * list. Seven is what the design draws.
 */
const PLAN_MODULES_SHOWN = 7;

/** Questions shown before "View all" — the design's own count. */
const FAQ_COLLAPSED = 5;

const moduleLabel = (code: string): string =>
  code
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

const LandingHome = () => {
  const navigate = useNavigate();

  const [stuck, setStuck] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqExpanded, setFaqExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const reasonsRail = useRail(6500);
  // Five seconds: long enough to read a plan, short enough to notice movement.
  const plansRail = useRail(5000);

  // The catalogue, priced by the server. Nothing on this page computes a total.
  const [packages, setPackages] = useState<CatalogPackage[] | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>("MONTHLY");

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

    // Only what is still hidden. The effect re-runs as async sections mount, and
    // re-observing something already revealed would be pure waste.
    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal-item]:not([data-revealed])")
    );
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
    // Both lists arrive from the network after first paint. Without them here
    // the effect ran once against the markup that existed at mount, and every
    // card that came later stayed at opacity 0 — present, occupying its space,
    // and never revealed.
  }, [packages?.length]);

  useEffect(() => {
    getCatalogPackages()
      .then((list) =>
        setPackages(
          (list ?? []).filter((pkg) => pkg.active).sort((a, b) => a.displayOrder - b.displayOrder)
        )
      )
      .catch((error) => {
        // Pricing still has a home at /tenant, so a failure here degrades to
        // the section's own call to action rather than to a broken page.
        console.error("Failed to load catalog packages", error);
        setPackages([]);
      });
  }, []);

  /**
   * Hands the choice to the signup rather than re-implementing it.
   *
   * The signup seeds its selection from sessionStorage on mount — that is how a
   * refresh mid-flow keeps a basket — so writing the same key here means the
   * package arrives already ticked, priced by the server, with no extra state
   * threaded through the router.
   *
   * The everything-tier is exclusive: it already contains every other package,
   * so a basket holding both would bill for a module and for the bundle that
   * includes it. Selecting one from here therefore replaces the basket rather
   * than adding to it, which is the rule the pricing screen enforces too.
   */
  /**
   * There is no subscription endpoint yet, so this hands the address to the
   * reader's own mail client instead of collecting it into nothing. A field
   * that silently swallows what someone typed is worse than no field.
   */
  const onSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;
    window.location.href = `mailto:sales@finova.sa?subject=${encodeURIComponent(
      "Newsletter signup"
    )}&body=${encodeURIComponent(`Please add ${address} to the Finova newsletter.`)}`;
  };

  const choosePlan = (pkg: CatalogPackage) => {
    setSelection({ packageCodes: [pkg.packageCode], billingCycle: cycle });
    // Carrying `resume` stops the pricing page clearing its stored selection on
    // arrival — which it does for any fresh visit, and which would otherwise
    // wipe the package this click just wrote a line before.
    navigate("/tenant", { state: { resume: true } });
  };

  /** Staggers a group so a row of cards arrives in sequence, not as a block. */
  const stagger = (index: number) =>
    ({ "--reveal-delay": `${Math.min(index, 6) * 70}ms` }) as React.CSSProperties;

  return (
    <div className="fin-landing" ref={rootRef}>
      {/* --- Header ------------------------------------------------------ */}
      <header className="ln-header" data-stuck={stuck}>
        <div className="ln-wrap flex h-16 items-center justify-between gap-4 px-5">
          <BrandLogo alt="Finova" className="h-8 w-auto" />

          <nav className="hidden items-center gap-8 lg:flex">
            <a className="ln-navlink" href="#top">
              Home
            </a>
            <a className="ln-navlink" href="#products">
              Products
            </a>
            <a className="ln-navlink" href="#why">
              Products Guide
            </a>
            <a className="ln-navlink" href="#pricing">
              Packages
            </a>
          </nav>

          {/* An outlined pill, not a filled one: the design keeps the only
              solid red on the page for the hero's own call to action. */}
          <a className="ln-navbtn" href="/login">
            Sign In
          </a>
        </div>
      </header>

      {/* --- Hero -------------------------------------------------------- */}
      <section className="ln-hero" id="top">
        {/* Eager and high priority: this is the largest contentful paint on the
            page, and deferring the thing the viewer is already looking at only
            delays it. */}
        <img
          className="ln-hero__img"
          src={heroImage}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
        />

        <div className="ln-wrap">
          <div className="ln-hero__copy text-center">
            <h1 className="ln-display" data-reveal-item>
              The starting point of a winning customer experience
            </h1>

            <p className="ln-hero__sub" data-reveal-item style={stagger(1)}>
              Unlock your potential with our Suite of SaaS Solutions
            </p>

            {/* One action, not two. A second button beside it splits the
                attention the design deliberately puts on this one. */}
            <div className="mt-9" data-reveal-item style={stagger(2)}>
              <a className="ln-btn ln-btn--primary ln-btn--pill" href="/tenant">
                Subscribe Today And Start Lending
                <span className="ln-btn__badge" aria-hidden="true">
                  <ArrowRight />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- About ------------------------------------------------------- */}
      <section className="ln-section">
        <div className="ln-wrap ln-split">
          <div data-reveal-item>
            <h2 className="ln-h2">Empowering Businesses Worldwide with Seamless SaaS Solutions</h2>
            <p className="ln-body mt-6">
              At Finova, we specialize in providing cutting-edge SaaS solutions designed to
              streamline your business operations and enhance customer satisfaction. Our platform
              integrates seamlessly with your existing systems, ensuring a smooth transition and
              optimal performance.
            </p>
            <p className="ln-body mt-4">
              Our mission is to empower businesses of all sizes to achieve their goals through
              innovative technology and unparalleled support. Whether you are looking to improve
              efficiency, reduce costs, or enhance customer engagement, we have the tools and
              expertise to help you succeed.
            </p>

            <a className="ln-btn ln-btn--primary ln-btn--sm mt-8" href="#products">
              Read More
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          {/* Two red corner brackets rather than a filled plate — the design's
              own device, and it leaves the photograph its full frame instead of
              cropping a slab out from behind it. */}
          <figure className="ln-figure ln-figure--brackets" data-reveal-item style={stagger(2)}>
            <img src={aboutImage} alt="Two colleagues reviewing an application together" />
          </figure>
        </div>
      </section>

      {/* --- Products ---------------------------------------------------- */}
      <section className="ln-section" id="products">
        {/* A grey panel inset from the page rather than a full-bleed band: the
            design keeps white margins either side so the red cards read as
            sitting on something, not as the page itself turning red. */}
        <div className="ln-panel">
          <div className="ln-panel__head text-center" data-reveal-item>
            <h2 className="ln-h2">Our Products</h2>
            <p className="ln-body mt-4">
              Explore our comprehensive suite of financing products crafted to suit various
              financial needs. From flexible payment options to competitive rates, our diverse range
              of products ensures financial support that empowers your goals.
            </p>
          </div>

          <div className="ln-products mt-12">
            {PRODUCTS.map((product, index) => (
              <article
                className="ln-product"
                key={product.name}
                data-reveal-item
                style={stagger(index)}
              >
                <h3 className="ln-product__name">{product.name}</h3>
                <p className="ln-product__promise">{product.promise}</p>

                {/* An ordered list, so the numbers are the list's own rather
                    than typed into the strings — they stay correct if a point
                    is added or dropped, and a screen reader announces the
                    count. */}
                <ol className="ln-product__points">
                  {product.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ol>

                <a className="ln-btn ln-btn--dark ln-btn--sm" href="mailto:sales@finova.sa">
                  Book a Demo
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- Why choose us ----------------------------------------------- */}
      <section className="ln-section" id="why">
        <div className="ln-wrap">
          <div data-reveal-item>
            <div className="ln-heading-row">
              <span className="ln-headrule" aria-hidden="true" />
              <h2 className="ln-h2">Why Choose Us</h2>
            </div>
            <p className="ln-heading-sub">Your Trusted Partner for Seamless SaaS Solutions.</p>
          </div>

          {/* Scroll-snap rather than a carousel library: the browser already
              does momentum, keyboard scrolling and touch for free, and the dots
              only have to drive scrollTo. It also degrades honestly — with no
              JS the cards are still all there and still scrollable. */}
          <div
            className="ln-rail mt-10"
            data-reveal-item
            ref={reasonsRail.ref}
            {...reasonsRail.holdProps}
            role="region"
            aria-label="Why choose Finova"
            tabIndex={0}
          >
            {REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <article className="ln-why" key={reason.title}>
                  <div className="ln-why__top">
                    <h3 className="ln-why__title">{reason.title}</h3>
                    <span className="ln-why__icon" aria-hidden="true">
                      <Icon />
                    </span>
                  </div>
                  <p className="ln-why__body">{reason.body}</p>
                  <a className="ln-btn ln-btn--outline ln-btn--sm" href="#faq">
                    Learn More
                  </a>
                </article>
              );
            })}
          </div>

          <RailControls rail={reasonsRail} label="Why choose Finova" />
        </div>
      </section>

      {/* --- Pricing ----------------------------------------------------- */}
      <section className="ln-section ln-section--tint" id="pricing">
        <div className="ln-wrap">
          <div className="ln-narrow text-center" data-reveal-item>
            <h2 className="ln-h2">Our Pricing Plan</h2>
            <p className="ln-body mt-4">
              Choose the plan that best fits your business needs. Our flexible pricing options are
              designed to provide maximum value at a competitive price.
            </p>
          </div>

          {/* Monthly / yearly. Both figures come from the catalogue, so this
              only decides which of the two the server already sent is shown —
              nothing here derives an annual price from a monthly one. */}
          <div className="ln-toggle mt-8" role="group" aria-label="Billing cycle">
            <button
              type="button"
              className="ln-toggle__btn"
              data-active={cycle === "MONTHLY"}
              aria-pressed={cycle === "MONTHLY"}
              onClick={() => setCycle("MONTHLY")}
            >
              Monthly
            </button>
            <button
              type="button"
              className="ln-toggle__btn"
              data-active={cycle === "ANNUAL"}
              aria-pressed={cycle === "ANNUAL"}
              onClick={() => setCycle("ANNUAL")}
            >
              Yearly
            </button>
          </div>

          {packages === null ? (
            <div className="ln-rail mt-10" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div className="ln-plan ln-plan--skeleton" key={i} />
              ))}
            </div>
          ) : packages.length === 0 ? (
            // The catalogue is the only source of prices; without it the
            // section says so and hands over rather than inventing a figure.
            <div className="mt-10 text-center">
              <p className="ln-body">
                Our plans are priced live. Open the signup to see today&apos;s prices.
              </p>
              <a className="ln-btn ln-btn--primary ln-btn--pill mt-6" href="/tenant">
                See pricing
                <span className="ln-btn__badge" aria-hidden="true">
                  <ArrowRight />
                </span>
              </a>
            </div>
          ) : (
            <>
              <div
                className="ln-rail ln-rail--plans mt-10"
                data-reveal-item
                ref={plansRail.ref}
                {...plansRail.holdProps}
                role="region"
                aria-label="Pricing plans"
                tabIndex={0}
              >
                {packages.map((pkg) => (
                  <article className="ln-plan" key={pkg.packageCode}>
                    {/* The everything-tier is the recommended one by
                        construction — it is the only package that contains the
                        others. */}
                    {pkg.bundle && <span className="ln-plan__ribbon">Recommended</span>}

                    <header className="ln-plan__head">
                      <h3 className="ln-plan__name">{pkg.nameEn}</h3>
                      <p className="ln-plan__cycle">
                        {cycle === "MONTHLY" ? "Monthly At" : "Yearly At"}
                      </p>
                      <p className="ln-plan__price">
                        {formatMoney(
                          cycle === "MONTHLY" ? pkg.monthlyPrice : pkg.annualPrice,
                          pkg.currency
                        )}
                      </p>
                      <span className="ln-plan__mark" aria-hidden="true">
                        <Boxes />
                      </span>
                    </header>

                    <div className="ln-plan__body">
                      {pkg.descriptionEn && <p className="ln-plan__note">{pkg.descriptionEn}</p>}

                      <ul className="ln-plan__list">
                        {pkg.moduleCodes.slice(0, PLAN_MODULES_SHOWN).map((code) => (
                          <li key={code}>
                            <Check aria-hidden="true" />
                            {moduleLabel(code)}
                          </li>
                        ))}
                        {pkg.moduleCodes.length > PLAN_MODULES_SHOWN && (
                          <li className="ln-plan__more">
                            +{pkg.moduleCodes.length - PLAN_MODULES_SHOWN} more modules
                          </li>
                        )}
                      </ul>

                      <button
                        type="button"
                        className="ln-btn ln-btn--primary ln-btn--sm"
                        onClick={() => choosePlan(pkg)}
                      >
                        Subscribe Now
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <RailControls rail={plansRail} label="Pricing plans" />
            </>
          )}

          <p className="ln-narrow mt-8 text-center text-xs text-muted-foreground" data-reveal-item>
            Prices exclude VAT, which is shown on the quote before you commit. Core Platform is
            included with every subscription at no cost.
          </p>
        </div>
      </section>

      {/* --- Invitation --------------------------------------------------- */}
      <section className="ln-section">
        <div className="ln-wrap ln-invite" data-reveal-item>
          <div className="ln-invite__copy">
            <span className="ln-chip">Loan Management System</span>
            <h2 className="ln-h2 mt-4">
              A Seamless <span className="ln-underline">Lending Experience</span>
              <br />
              You Can Trust
            </h2>
            <p className="ln-body mt-3">
              Experience fast, secure, and seamless lending like never before.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="ln-btn ln-btn--primary ln-btn--sm ln-btn--round"
                href="mailto:sales@finova.sa?subject=Schedule%20a%20meeting"
              >
                Schedule a meeting
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                className="ln-btn ln-btn--outline ln-btn--sm ln-btn--round"
                href="mailto:sales@finova.sa?subject=Brochure%20request"
              >
                Download Brochure
              </a>
            </div>
          </div>

          {/* The cut-out stands in the card rather than being framed by it, so
              the brackets belong to the card corners, not to the image. */}
          <figure className="ln-invite__figure">
            <img src={portraitImage} alt="" aria-hidden="true" loading="lazy" />
          </figure>
        </div>
      </section>

      {/* --- FAQ ---------------------------------------------------------- */}
      <section className="ln-section" id="faq">
        <div className="ln-wrap">
          <div className="ln-narrow text-center" data-reveal-item>
            <h2 className="ln-h2">Frequently Ask Questions</h2>
          </div>

          <div className="ln-faq mt-12" data-reveal-item>
            {(faqExpanded ? FAQS : FAQS.slice(0, FAQ_COLLAPSED)).map((faq, index) => {
              const open = openFaq === index;
              return (
                <div className="ln-faq__item" key={faq.q} data-open={open}>
                  <button
                    type="button"
                    className="ln-faq__q"
                    aria-expanded={open}
                    aria-controls={`faq-${index}`}
                    onClick={() => setOpenFaq(open ? null : index)}
                  >
                    <span className="ln-faq__mark" aria-hidden="true">
                      {open ? <Minus /> : <Plus />}
                    </span>
                    <span className="min-w-0 flex-1">{faq.q}</span>
                  </button>
                  {open && (
                    <p className="ln-faq__a" id={`faq-${index}`}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Only worth offering while something is still hidden. */}
          {!faqExpanded && FAQS.length > FAQ_COLLAPSED && (
            <div className="mt-8 text-center">
              <button
                type="button"
                className="ln-btn ln-btn--primary ln-btn--sm ln-btn--round"
                onClick={() => setFaqExpanded(true)}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- Dark call to action ------------------------------------------ */}
      <section className="ln-section">
        <div className="ln-wrap">
          <div className="ln-slab" data-reveal-item>
            <p className="ln-slab__kicker">Take the First Step Toward Efficiency</p>
            <h2 className="ln-slab__title">Loan Origination System</h2>
            <p className="ln-slab__sub">
              Lending redefined — fast, secure, and effortlessly intuitive.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                className="ln-btn ln-btn--primary ln-btn--sm ln-btn--round"
                href="mailto:sales@finova.sa?subject=Demo%20request"
              >
                Request a demo
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                className="ln-btn ln-btn--outlineDark ln-btn--sm ln-btn--round"
                href="mailto:sales@finova.sa?subject=Brochure%20request"
              >
                Download Brochure
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- Newsletter --------------------------------------------------- */}
      <section className="ln-section pt-0">
        <div className="ln-wrap ln-news" data-reveal-item>
          <div>
            <h2 className="ln-news__title">Join Our Newsletter</h2>
            <p className="ln-news__sub">
              Subscribe to our newsletter to receive exclusive offers, latest news and updates.
            </p>
          </div>

          {/* No subscription endpoint exists yet, so this hands the address to
              the mail client rather than pretending to store it. A field that
              silently swallows an address is worse than one that does not. */}
          <form className="ln-news__form" onSubmit={onSubscribe}>
            <label className="sr-only" htmlFor="ln-news-email">
              Email address
            </label>
            <input
              id="ln-news-email"
              className="ln-news__input"
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="ln-btn ln-btn--primary ln-btn--sm ln-btn--round">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* --- Closing band -------------------------------------------------- */}
      <section className="ln-band">
        <img className="ln-band__img" src={bandImage} alt="" aria-hidden="true" loading="lazy" />
        <div className="ln-wrap ln-narrow text-center" data-reveal-item>
          <h2 className="ln-band__title">
            Experience Seamless Integration of LOS, LMS, and Onboarding Modules for Optimal
            Performance
          </h2>
        </div>
      </section>

      {/* --- Footer -------------------------------------------------------- */}
      <footer className="ln-footer">
        <p>Copyright Finova Finance Company</p>
        <p>Powered by MYTM LLC KSA</p>
      </footer>
    </div>
  );
};

export default LandingHome;
