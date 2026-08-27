import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Images } from '../Config/Images';
// URL for external RTL stylesheet
const rtlCssUrl = new URL('../../styles/arabic-rtl.css', import.meta.url).href;
import { getPageData } from '../../redux/apis/apisCrudWebPageManagement';
import Loader from '../Loader/Loader';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';

// Types for FAQ page data
interface FaqPageData {
  header: {
    logo: string;
    navigation: {
      about: { text: string; url: string };
      contact: { text: string; url: string };
    };
  };
  hero: {
    image: string;
    title: string;
  };
  breadcrumb: {
    home: { text: string; url: string };
    faq: { text: string; url: string };
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

const Faqs = () => {
  const { t } = useTranslation('webPages');
  const [pageData, setPageData] = useState<FaqPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  // Initialize locale from URL query parameter synchronously
  const getInitialLocale = (): string => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('locale') === 'ar' ? 'ar' : 'en';
    }
    return 'en';
  };
  
  // Set dir attribute synchronously BEFORE React renders to prevent flash on reload
  const initialLocale = getInitialLocale();
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    if (initialLocale === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.classList.add('rtl');
      // Inject RTL stylesheet synchronously if not present
      const existing = document.getElementById('rtl-css-link') as HTMLLinkElement | null;
      if (!existing) {
        const link = document.createElement('link');
        link.id = 'rtl-css-link';
        link.rel = 'stylesheet';
        link.href = rtlCssUrl;
        document.head.appendChild(link);
      }
    } else {
      root.setAttribute('dir', 'ltr');
      root.classList.remove('rtl');
    }
  }
  
  const [locale, setLocale] = useState<string>(initialLocale);

  // API Configuration
  const PAGE_SLUG = 'faq';

  // Helper function to safely extract content from a section
  const getSectionContent = (section: any) => {
    if (!section || !section.translations || section.translations.length === 0) {
      return {};
    }
    const content = section.translations[0].content || {};
    return content;
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const fetchPageData = async (currentLocale: string = locale) => {
    try {
      setLoading(true);
      setError(null);
      
      
      const response = await getPageData(PAGE_SLUG, currentLocale);
      const result = response.data;
      
      // Extract breadcrumbs from config (available in both success and fallback cases)
      // Breadcrumbs are structured as { "en": [...], "ar": [...] }
      const breadcrumbsObj = result.data?.page?.config?.breadcrumbs;
      const breadcrumbsRaw = breadcrumbsObj?.[currentLocale] || breadcrumbsObj?.en || [];
      const breadcrumbs = Array.isArray(breadcrumbsRaw) ? breadcrumbsRaw : [];
      const homeBreadcrumb = breadcrumbs.find((b: any) => b.url === '/') || { name: 'Home', url: '/' };
      const currentBreadcrumb = breadcrumbs.find((b: any) => !b.url) || { name: 'FAQ' };
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        const globalSections = result.data.global_sections || [];
        
        // Extract FAQ data based on section structure
        const faqHeroSection = getSectionContent(sections.find((s: any) => s.key === 'faq_hero')) || {};
        const faqIntroSection = getSectionContent(sections.find((s: any) => s.key === 'faq_intro')) || {};
        const faqListSection = getSectionContent(sections.find((s: any) => s.key === 'faq_list')) || {};
        
        // Extract header and footer from global_sections
        const headerSection = globalSections.find((s: any) => s.key === 'header');
        const headerContent = headerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};
        
        const footerSection = globalSections.find((s: any) => s.key === 'footer');
        const footerContent = footerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};

        const parsedData: FaqPageData = {
          header: {
            logo: headerContent?.logo?.url || Images.awnLogoWhite,
            navigation: {
              about: { text: (headerContent?.main_menu?.[1]?.label) || 'About', url: (headerContent?.main_menu?.[1]?.url) || '/about' },
              contact: { text: (headerContent?.main_menu?.[3]?.label) || 'Contact', url: (headerContent?.main_menu?.[3]?.url) || '/contact' }
            }
          },
          hero: {
            image: faqHeroSection.hero_image?.url || '',
            title: faqIntroSection.heading || 'Frequently Asked Questions'
          },
          breadcrumb: {
            home: { 
              text: homeBreadcrumb.name, 
              url: homeBreadcrumb.url 
            },
            faq: { 
              text: currentBreadcrumb.name, 
              url: currentBreadcrumb.url || '/faq' 
            }
          },
          faqs: faqListSection.faqs || []
        };

        // Store header data for rendering (similar to LandingPage)
        (parsedData as any).header = {
          ...parsedData.header,
          logo: headerContent?.logo?.url || Images.awnLogoWhite,
          logoLink: headerContent?.logo?.link || '/',
          logoAlt: headerContent?.logo?.alt || 'Factoring Valley Logo',
          navigationLinks: headerContent?.main_menu || []
        };

        // Store footer data for rendering (similar to LandingPage)
        (parsedData as any).footer = {
          logo: footerContent?.logo || '',
          contact: {
            phone: footerContent?.contact?.phone || '800 100 322',
            email: footerContent?.contact?.email || 'info@factoringvalley-sa.com',
            address: footerContent?.address || 'Al Urubah 2815, Al Maathar North District, Riyadh 12314, KSA'
          },
          copyright: footerContent?.copyright || '© factoringvalley-sa.com, 2022. All rights reserved.',
          disclaimer: footerContent?.disclaimer || 'Factoring Valley company subject to the control and supervision of the Central Bank of Saudi Arabia',
          footer_menus: footerContent?.footer_menus || [],
          social_links: footerContent?.social_links || []
        };

        setPageData(parsedData);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('Error fetching FAQ page data:', err);
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        const fallbackData: FaqPageData = {
          header: {
            logo: Images.awnLogoWhite,
            navigation: {
              about: { text: 'About', url: '/about' },
              contact: { text: 'Contact', url: '/contact' }
            }
          },
          hero: {
            image: '',
            title: 'Frequently Asked Questions'
          },
          breadcrumb: {
            home: { 
              text: 'Home', 
              url: '/' 
            },
            faq: { 
              text: 'FAQ', 
              url: '/faq' 
            }
          },
          faqs: []
        };
        
        setPageData(fallbackData);
        setError('API Connection Error: Using fallback data.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(locale);
  }, [locale]);

  // Apply RTL/LTR and sync URL when locale changes
  useEffect(() => {
    const root = document.documentElement;
    if (locale === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.classList.add('rtl');
      // inject RTL stylesheet if not present
      const existing = document.getElementById('rtl-css-link') as HTMLLinkElement | null;
      if (!existing) {
        const link = document.createElement('link');
        link.id = 'rtl-css-link';
        link.rel = 'stylesheet';
        link.href = rtlCssUrl;
        document.head.appendChild(link);
      }
    } else {
      root.setAttribute('dir', 'ltr');
      root.classList.remove('rtl');
      // remove RTL stylesheet
      const existing = document.getElementById('rtl-css-link');
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    }

    try {
      const url = new URL(window.location.href);
      if (locale === 'ar') {
        url.searchParams.set('locale', 'ar');
      } else {
        url.searchParams.delete('locale');
      }
      // Only update if the URL actually changed
      const newUrl = url.toString();
      if (newUrl !== window.location.href) {
        window.history.replaceState({}, '', newUrl);
      }
    } catch {}
  }, [locale]);

  // Sync locale with URL query parameter changes (e.g., browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLocale = urlParams.get('locale');
      const newLocale = urlLocale === 'ar' ? 'ar' : 'en';
      if (newLocale !== locale) {
        setLocale(newLocale);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [locale]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#e74c3c'
      }}>
        {t('errorWithMessage', { message: error })}
      </div>
    );
  }

  if (!pageData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#333'
      }}>
        {t('state.noDataAvailableShort')}
      </div>
    );
  }

  return (
    <div className="header-footer-settings__landing-template page-faq">
      {/* Global Header */}
      <GlobalHeader locale={locale} onLocaleChange={setLocale} />

      {/* Hero Image Section */}
      {pageData.hero.image && (
        <section style={{
          position: 'relative',
          height: '300px',
          backgroundImage: `url("${pageData.hero.image}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }} />
        </section>
      )}

      {/* Breadcrumb */}
      <div className='container'>
           <div style={{
        backgroundColor: '#f5f5f5',
        padding: '10px 20px',
        fontSize: '14px',
        color: '#7f8c8d',
        display: 'flex',
        alignItems: 'center'
      }}>
        <a href={pageData.breadcrumb.home.url} style={{ textDecoration: 'underline', cursor: 'pointer', color: '#7f8c8d' }}>
          {pageData.breadcrumb.home.text}
        </a>
        <span style={{ margin: '0 5px' }}> / </span>
        <span style={{ color: '#7f8c8d' }}>
          {pageData.breadcrumb.faq.text}
        </span>
      </div>
      </div>
     

      {/* FAQ Content */}
      <section style={{
        backgroundColor: '#f5f5f5',
        padding: '60px 40px',
        maxWidth: '90%',
        margin: '0 auto'
      }}>
        <div className='container'>

      
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#333',
          margin: '0 0 40px 0',
          textAlign: 'left'
        }}>
          {pageData.hero.title}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {pageData.faqs.map((faq, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '2px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <button
                onClick={() => toggleExpanded(index)}
                style={{
                  width: '100%',
                  padding: '0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#333',
                  flex: 1
                }}>
                  {faq.question}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fff0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: '#000',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  marginLeft: '15px',
                  border: 'none'
                }}>
                  {expandedItems.has(index) ? '−' : '+'}
                </div>
              </button>

              {expandedItems.has(index) && (
                <div style={{
                  paddingTop: '15px',
                  marginTop: '15px',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#666',
                  borderTop: '1px solid #d0d0d0'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {pageData.faqs.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999'
          }}>
            No FAQs available at the moment.
          </div>
        )}
          </div>
      </section>

      {/* Global Footer */}
      <GlobalFooter locale={locale} />
    </div>
  );
};

export default Faqs;

