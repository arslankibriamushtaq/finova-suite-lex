import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleCheck, Minus, Plus } from "lucide-react";

import type { SiteSection, SiteSectionType } from "../../../redux/apis/apisTenantSite";
import { pickCopy } from "../../../utils/tenantSite";
import { useTenantSite } from "../TenantSiteContext";
import SiteImage from "../SiteImage";

/**
 * One component per `section.type`. The page renders whatever the API returned,
 * in the order it returned it — see `TenantSitePage`.
 *
 * The markup is the platform landing page's own: `src/styles/landing.css`,
 * scoped under `.fin-landing`, which `TenantSitePage` puts on the page root.
 * Reusing those classes rather than writing a second set of section styles is
 * what keeps a tenant site looking like the product it was bought from — and
 * every colour in that sheet comes from the brand ramp, which `applyTenantTheme`
 * has already overwritten with the tenant's own, so the shared stylesheet
 * re-skins per tenant with no work here.
 *
 * Every field on every section is optional, so each of these renders what it
 * was given and omits the rest. All copy is plain text: the API sends no
 * markup, and nothing here may use `dangerouslySetInnerHTML`.
 */

export interface SectionProps {
  section: SiteSection;
}

/** Anchor target, so the header nav can link to a section that is present. */
export const sectionId = (type: SiteSectionType) => `site-${type.toLowerCase()}`;

const useCopy = (section: SiteSection) => {
  const { locale } = useTenantSite();
  return {
    title: pickCopy(section.titleEn, section.titleAr, locale),
    subtitle: pickCopy(section.subtitleEn, section.subtitleAr, locale),
    body: pickCopy(section.bodyEn, section.bodyAr, locale),
    ctaLabel: pickCopy(section.ctaLabelEn, section.ctaLabelAr, locale),
  };
};

/** `ctaTarget` is either an in-app route or an external address. */
const SectionCta = ({
  label,
  target,
  className = "ln-btn ln-btn--primary ln-btn--sm ln-btn--round",
}: {
  label: string;
  target: string | null;
  className?: string;
}) => {
  if (!label || !target) return null;

  const content = (
    <>
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </>
  );

  return /^https?:\/\//i.test(target) ? (
    <a href={target} className={className} target="_blank" rel="noreferrer noopener">
      {content}
    </a>
  ) : (
    <Link to={target} className={className}>
      {content}
    </Link>
  );
};

const Hero = ({ section }: SectionProps) => {
  const { title, subtitle, body, ctaLabel } = useCopy(section);
  const { site } = useTenantSite();
  const image = section.imageUrl ?? site.branding.heroImageUrl;

  // No `alt`: the photograph is decoration behind the headline, and the dark
  // plate under it is what the section actually relies on for contrast — so a
  // tenant that uploaded no hero image still gets a readable hero.
  return (
    <section className="ln-hero" id={sectionId(section.type)}>
      <SiteImage
        src={image}
        alt=""
        className="ln-hero__img"
        imgProps={{ "aria-hidden": true, loading: "eager", fetchPriority: "high" }}
      />

      <div className="ln-wrap">
        <div className="ln-hero__copy text-center">
          {title && <h1 className="ln-display">{title}</h1>}
          {subtitle && <p className="ln-hero__sub">{subtitle}</p>}
          {body && <p className="ln-hero__sub">{body}</p>}
          {ctaLabel && section.ctaTarget && (
            <div className="mt-9">
              <SectionCta
                label={ctaLabel}
                target={section.ctaTarget}
                className="ln-btn ln-btn--primary ln-btn--pill"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const About = ({ section }: SectionProps) => {
  const { title, subtitle, body, ctaLabel } = useCopy(section);

  return (
    <section className="ln-section" id={sectionId(section.type)}>
      <div className="ln-wrap ln-split">
        <div>
          {title && <h2 className="ln-h2">{title}</h2>}
          {subtitle && <p className="ln-body mt-6">{subtitle}</p>}
          {body && <p className="ln-body mt-4 whitespace-pre-line">{body}</p>}
          {ctaLabel && section.ctaTarget && (
            <div className="mt-8">
              <SectionCta label={ctaLabel} target={section.ctaTarget} />
            </div>
          )}
        </div>

        {/* The two brand-coloured corner brackets are the design's own device,
            and they only read as a frame when there is something to frame — so
            the whole figure is dropped when the tenant uploaded no image. */}
        {section.imageUrl && (
          <figure className="ln-figure ln-figure--brackets">
            <SiteImage src={section.imageUrl} alt="" />
          </figure>
        )}
      </div>
    </section>
  );
};

/**
 * The tenant's own financing products — Murabaha, Ijara and the rest — on the
 * red gradient cards the landing page uses for its own. Not the platform's
 * LOS/LMS/Collections cards, which belong to a different page.
 */
const Products = ({ section }: SectionProps) => {
  const { locale } = useTenantSite();
  const { title, subtitle } = useCopy(section);

  return (
    <section className="ln-section" id={sectionId(section.type)}>
      <div className="ln-panel">
        <div className="ln-panel__head text-center">
          {title && <h2 className="ln-h2">{title}</h2>}
          {subtitle && <p className="ln-body mt-4">{subtitle}</p>}
        </div>

        {section.items.length > 0 && (
          <div className="ln-products mt-12">
            {section.items.map((item, index) => {
              // `items` is free-form. Treat every key as absent rather than
              // assuming a shape.
              const cardTitle = pickCopy(item.title, item.titleAr, locale);
              const cardBody = pickCopy(item.body, item.bodyAr, locale);
              return (
                <article className="ln-product" key={`${cardTitle || "product"}-${index}`}>
                  {cardTitle && <h3 className="ln-product__name">{cardTitle}</h3>}
                  {cardBody && <p className="ln-product__promise">{cardBody}</p>}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Why choose this lender. A scroll-snap rail rather than a carousel library:
 * the browser already does momentum, keyboard scrolling and touch for free, and
 * with no JS at all the cards are still there and still scrollable.
 */
const WhyUs = ({ section }: SectionProps) => {
  const { locale } = useTenantSite();
  const { title, subtitle } = useCopy(section);

  return (
    <section className="ln-section" id={sectionId(section.type)}>
      <div className="ln-wrap">
        <div className="ln-heading-row">
          <span className="ln-headrule" aria-hidden="true" />
          {title && <h2 className="ln-h2">{title}</h2>}
        </div>
        {subtitle && <p className="ln-heading-sub">{subtitle}</p>}

        {section.items.length > 0 && (
          <div className="ln-rail mt-10" role="region" aria-label={title || "Why us"} tabIndex={0}>
            {section.items.map((item, index) => {
              const cardTitle = pickCopy(item.title, item.titleAr, locale);
              const cardBody = pickCopy(item.body, item.bodyAr, locale);
              return (
                <article className="ln-why" key={`${cardTitle || "why"}-${index}`}>
                  <div className="ln-why__top">
                    {cardTitle && <h3 className="ln-why__title">{cardTitle}</h3>}
                    {/* The tenant's own icon where it uploaded one, and the
                        brand tick where it did not — an empty circle would read
                        as an image that failed to load. */}
                    <span className="ln-why__icon" aria-hidden="true">
                      <SiteImage
                        src={item.imageUrl ?? null}
                        alt=""
                        className="h-6 w-6 object-contain"
                        fallback={<CircleCheck />}
                      />
                    </span>
                  </div>
                  {cardBody && <p className="ln-why__body">{cardBody}</p>}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const Faq = ({ section }: SectionProps) => {
  const { locale } = useTenantSite();
  const { title, subtitle } = useCopy(section);
  // The first answer open, as the landing page opens its own: an accordion that
  // starts entirely shut reads as a list of headings with nothing under it.
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="ln-section" id={sectionId(section.type)}>
      <div className="ln-wrap">
        <div className="ln-narrow text-center">
          {title && <h2 className="ln-h2">{title}</h2>}
          {subtitle && <p className="ln-body mt-4">{subtitle}</p>}
        </div>

        <div className="ln-faq mt-12">
          {section.items.map((item, index) => {
            const question = pickCopy(item.question, item.questionAr, locale);
            const answer = pickCopy(item.answer, item.answerAr, locale);
            if (!question && !answer) return null;
            const isOpen = open === index;
            return (
              <div className="ln-faq__item" key={`${question || "faq"}-${index}`} data-open={isOpen}>
                <button
                  type="button"
                  className="ln-faq__q"
                  aria-expanded={isOpen}
                  aria-controls={`site-faq-${index}`}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span className="ln-faq__mark" aria-hidden="true">
                    {isOpen ? <Minus /> : <Plus />}
                  </span>
                  <span className="min-w-0 flex-1">{question}</span>
                </button>
                {isOpen && answer && (
                  <p className="ln-faq__a" id={`site-faq-${index}`}>
                    {answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/**
 * Gated: the backend only returns this section for a tenant holding the
 * Investor Portfolio module, and re-checks on every request — a tenant can
 * drop the module long after its site went live. So its presence in the array
 * is itself the entitlement; nothing here re-tests `modules`.
 */
const InvestorCta = ({ section }: SectionProps) => {
  const { title, subtitle, body, ctaLabel } = useCopy(section);

  return (
    <section className="ln-section" id={sectionId(section.type)}>
      <div className="ln-wrap">
        <div className="ln-slab">
          {subtitle && <p className="ln-slab__kicker">{subtitle}</p>}
          {title && <h2 className="ln-slab__title">{title}</h2>}
          {body && <p className="ln-slab__sub">{body}</p>}
          {ctaLabel && section.ctaTarget && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <SectionCta label={ctaLabel} target={section.ctaTarget} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Contact = ({ section }: SectionProps) => {
  const { site } = useTenantSite();
  const { title, subtitle, body } = useCopy(section);
  const { supportEmail, supportPhone } = site.branding;

  return (
    <section className="ln-section ln-section--tint" id={sectionId(section.type)}>
      <div className="ln-wrap ln-narrow text-center">
        {title && <h2 className="ln-h2">{title}</h2>}
        {subtitle && <p className="ln-body mt-4">{subtitle}</p>}
        {body && <p className="ln-body mt-3 whitespace-pre-line">{body}</p>}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {supportEmail && (
            <a className="ln-btn ln-btn--primary ln-btn--sm ln-btn--round" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
          )}
          {supportPhone && (
            <a className="ln-btn ln-btn--outline ln-btn--sm ln-btn--round" href={`tel:${supportPhone}`}>
              {supportPhone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

const Footer = ({ section }: SectionProps) => {
  const { site, locale } = useTenantSite();
  const { title, body } = useCopy(section);
  const companyName = pickCopy(site.companyName, site.companyNameAr, locale);
  const social = Object.entries(site.branding.socialLinks ?? {});

  return (
    <footer className="ln-footer">
      <p className="font-semibold text-white">{title || companyName}</p>
      {body && <p className="whitespace-pre-line">{body}</p>}
      {social.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {social.map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noreferrer noopener" className="hover:text-white">
              {name}
            </a>
          ))}
        </div>
      )}
    </footer>
  );
};

/**
 * An unknown `type` is skipped silently: a new section type shipped by the
 * backend must not blank the page of every tenant running an older bundle.
 */
export const SECTION_COMPONENTS: Partial<
  Record<SiteSectionType, (props: SectionProps) => JSX.Element>
> = {
  HERO: Hero,
  ABOUT: About,
  PRODUCTS: Products,
  WHY_US: WhyUs,
  INVESTOR_CTA: InvestorCta,
  FAQ: Faq,
  CONTACT: Contact,
  FOOTER: Footer,
};
