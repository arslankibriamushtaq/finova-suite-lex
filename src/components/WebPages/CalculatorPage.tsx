import { useState, useEffect } from 'react';
import { store } from '../../redux/store';
import { Images } from '../Config/Images';
// URL for external RTL stylesheet
const rtlCssUrl = new URL('../../styles/arabic-rtl.css', import.meta.url).href;
import { getPageData } from '../../redux/apis/apisCrudWebPageManagement';

// Types for API integration
interface CalculatorPageData {
  header: {
    logo: string;
    navigation: {
      about: { text: string; url: string };
      contact: { text: string; url: string };
    };
  };
  breadcrumb: {
    home: { text: string; url: string };
    calculator: { text: string; url: string };
  };
  content: {
    title: string;
    description: string;
    financingAmount: {
      minAmount: string;
      maxAmount: string;
      suggestedAmount: string;
    };
    financingFee: {
      costOfFinancing: string;
      costOfTerm: string;
    };
    loanTenure: {
      minTenure: string;
      maxTenure: string;
    };
  };
  images: {
    headerLogo: string;
  };
}

// Helper function to safely extract content from API sections
const getSectionContent = (section: any, currentLocale: string = 'en') => {
  if (!section || !section.translations || section.translations.length === 0) {
    return {};
  }
  const translation = section.translations.find((t: any) => t.locale === currentLocale) || section.translations[0];
  const content = translation?.content || {};
  if (content.subheadiheadingng && !content.subheading) {
    content.subheading = content.subheadiheadingng;
    delete content.subheadiheadingng;
  }
  return content;
};

const CalculatorPage = () => {
  const [pageData, setPageData] = useState<CalculatorPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
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

  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || 'https://giuliana-gadolinic-corporately.ngrok-free.dev';
  const BEARER_TOKEN = (store.getState() as any).block.token;
  const PAGE_SLUG = 'calculator';

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
      const currentBreadcrumb = breadcrumbs.find((b: any) => !b.url) || { name: 'Calculator' };
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        const globalSections = result.data.global_sections || [];
        
        // Map API sections to CalculatorPageData structure based on actual API response
        const calculatorSection = getSectionContent(sections.find((s: any) => s.key === 'calculator'), currentLocale) || {};
        
        const headerSection = globalSections.find((s: any) => s.key === 'header');
        const headerContent = headerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};

        const parsedData: CalculatorPageData = {
          header: {
            logo: headerContent?.logo?.url || Images.awnLogoWhite,
            navigation: {
              about: { text: (headerContent?.main_menu?.[1]?.label) || 'About', url: (headerContent?.main_menu?.[1]?.url) || '/about' },
              contact: { text: (headerContent?.main_menu?.[3]?.label) || 'Contact', url: (headerContent?.main_menu?.[3]?.url) || '/contact' }
            }
          },
          breadcrumb: {
            home: { 
              text: homeBreadcrumb.name, 
              url: homeBreadcrumb.url 
            },
            calculator: { 
              text: currentBreadcrumb.name, 
              url: currentBreadcrumb.url || '/calculator' 
            }
          },
          content: {
            title: calculatorSection.title || '',
            description: calculatorSection.description || '',
            financingAmount: {
              minAmount: calculatorSection.min_amount || '',
              maxAmount: calculatorSection.max_amount || '',
              suggestedAmount: calculatorSection.suggested_amount || ''
            },
            financingFee: {
              costOfFinancing: calculatorSection.cost_of_financing || '',
              costOfTerm: calculatorSection.cost_of_term || ''
            },
            loanTenure: {
              minTenure: calculatorSection.min_tenure || '',
              maxTenure: calculatorSection.max_tenure || ''
            }
          },
          images: {
            headerLogo: Images.awnLogoWhite
          }
        };

        setPageData(parsedData);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('❌ CalculatorPage Error:', err);
      
      // Check if it's a CORS error or connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Use fallback data when API is not available - show "N/A" for all content
        const fallbackData: CalculatorPageData = {
          header: {
            logo: Images.awnLogoWhite,
            navigation: {
              about: { text: 'About', url: '/about' },
              contact: { text: 'Contact', url: '/contact' }
            }
          },
          breadcrumb: {
            home: { 
              text: 'Home', 
              url: '/' 
            },
            calculator: { 
              text: 'Calculator', 
              url: '/calculator' 
            }
          },
          content: {
            title: 'N/A',
            description: 'N/A',
            financingAmount: {
              minAmount: 'N/A',
              maxAmount: 'N/A',
              suggestedAmount: 'N/A'
            },
            financingFee: {
              costOfFinancing: 'N/A',
              costOfTerm: 'N/A'
            },
            loanTenure: {
              minTenure: 'N/A',
              maxTenure: 'N/A'
            }
          },
          images: {
            headerLogo: Images.awnLogoWhite
          }
        };
        
        setPageData(fallbackData);
        setError('API Connection Error: Using fallback data. Please check if the backend server and ngrok tunnel are running.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching data');
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
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <div className="header-footer-settings">
        <div className="header-footer-settings__loading">
          <div className="header-footer-settings__loading-spinner"></div>
          <p>Loading calculator data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="header-footer-settings">
        <div className="header-footer-settings__error">
          <h3>Error Loading Calculator Page Data</h3>
          <p>{error}</p>
          <button onClick={() => fetchPageData(locale)} className="theme-btn-next">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="header-footer-settings">
        <div className="header-footer-settings__error">
          <h3>No Data Available</h3>
          <p>No calculator page data was found.</p>
          <button onClick={() => fetchPageData(locale)} className="theme-btn-next">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="header-footer-settings__landing-template page-calculator">
      {/* Header */}
      <header className="header-footer-settings__landing-header" style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: isScrolled ? '#ffffff' : 'transparent',
        transition: 'background-color 200ms ease',
        boxShadow: isScrolled ? '0 1px 8px rgba(0,0,0,0.08)' : 'none'
      }}>
        <div className="header-footer-settings__landing-header-content">
          <div className="header-footer-settings__landing-logo">
            <img src={isScrolled ? (pageData.images.headerLogo || Images.awnLogoWhite) : Images.awnLogoWhite} alt="Factoring Valley Logo" style={{ height: '40px' }} />
          </div>
          <nav className="header-footer-settings__landing-nav" style={{ color: isScrolled ? '#000' : '#fff' }}>
            {((pageData as any).header?.navigationLinks && (pageData as any).header.navigationLinks.length > 0)
              ? (pageData as any).header.navigationLinks.filter((item: any) => {
                  const label = item?.label || '';
                  return !label.toLowerCase().includes('services');
                }).map((item: any, idx: number) => (
                  <a key={idx} href={item.url} className="header-footer-settings__landing-nav-link" style={{ color: isScrolled ? '#000' : '#fff' }}>
                    {item.label}
                  </a>
                ))
              : (
                <>
                  <a href={pageData.header.navigation.about.url} className="header-footer-settings__landing-nav-link" style={{ color: isScrolled ? '#000' : '#fff' }}>
                    {pageData.header.navigation.about.text}
                  </a>
                  <a href={pageData.header.navigation.contact.url} className="header-footer-settings__landing-nav-link" style={{ color: isScrolled ? '#000' : '#fff' }}>
                    {pageData.header.navigation.contact.text}
                  </a>
                </>
              )}
            <div 
              className="header-footer-settings__landing-language" 
              style={{ color: isScrolled ? '#000' : '#fff', cursor: 'pointer' }}
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
            >
              <span>{locale === 'en' ? 'عربي' : 'English'}</span>
              <div className="header-footer-settings__landing-language-indicator">
                {locale === 'ar' ? '✓' : ''}
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div style={{ 
        padding: '20px 40px', 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <span style={{ 
          color: '#007bff', 
          textDecoration: 'none',
          cursor: 'pointer'
        }}>
          {pageData.breadcrumb.home.text}
        </span>
        <span style={{ margin: '0 5px', color: '#666' }}> / </span>
        <span style={{ 
          color: '#333', 
          fontWeight: '500'
        }}>
          {pageData.breadcrumb.calculator.text}
        </span>
      </div>

      {/* Main Content */}
      <section style={{ 
        backgroundColor: 'white', 
        padding: '40px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto'
        }}>
          {/* Page Title */}
          {pageData.content.title && (
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#333', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {pageData.content.title}
            </h1>
          )}

          {/* Page Description */}
          {pageData.content.description && (
            <div style={{ 
              fontSize: '16px', 
              color: '#666', 
              marginBottom: '40px',
              textAlign: 'center',
              lineHeight: '1.6'
            }} dangerouslySetInnerHTML={{ __html: pageData.content.description }} />
          )}

          {/* Calculator Content */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '30px',
            border: '1px solid #e0e0e0'
          }}>
            {/* Financing Amount Section */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px'
              }}>
                Financing Amount:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Min Financing Amount
                  </label>
                  <input
                    type="text"
                    value={pageData.content.financingAmount.minAmount}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Max Financing Amount
                  </label>
                  <input
                    type="text"
                    value={pageData.content.financingAmount.maxAmount}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Suggested Financing Amount
                </label>
                <input
                  type="text"
                  value={pageData.content.financingAmount.suggestedAmount}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#333'
                  }}
                />
              </div>
            </div>

            {/* Financing Fee Section */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px'
              }}>
                Financing Fee:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Cost of Financing Amount
                  </label>
                  <input
                    type="text"
                    value={pageData.content.financingFee.costOfFinancing}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Cost of Term Amount
                  </label>
                  <input
                    type="text"
                    value={pageData.content.financingFee.costOfTerm}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Loan Tenure Section */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px'
              }}>
                Loan Tenure:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Min Tenure
                  </label>
                  <input
                    type="text"
                    value={pageData.content.loanTenure.minTenure}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Max Tenure
                  </label>
                  <input
                    type="text"
                    value={pageData.content.loanTenure.maxTenure}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      color: '#333'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="header-footer-settings__landing-footer">
        <div className="header-footer-settings__landing-footer-content">
          <div className="header-footer-settings__landing-footer-section">
            <h4 style={{ color: '#333', marginBottom: '15px' }}>Quick Links</h4>
            <a href="/about" style={{ color: '#666', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>About Us</a>
            <a href="/contact" style={{ color: '#666', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>Contact</a>
            <a href="/calculator" style={{ color: '#666', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>Calculator</a>
          </div>
          <div className="header-footer-settings__landing-footer-section">
            <h4 style={{ color: '#333', marginBottom: '15px' }}>Services</h4>
            <a href="/loans" style={{ color: '#666', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>Personal Loans</a>
            <a href="/finance" style={{ color: '#666', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>Business Finance</a>
          </div>
          <div className="header-footer-settings__landing-footer-section">
            <h4 style={{ color: '#333', marginBottom: '15px' }}>Contact Info</h4>
            <p style={{ color: '#666', marginBottom: '8px' }}>Email: info@factoringvalley.com</p>
            <p style={{ color: '#666', marginBottom: '8px' }}>Phone: +966 XX XXX XXXX</p>
          </div>
        </div>
        <div className="header-footer-settings__landing-footer-bottom">
          <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
            © 2024 Factoring Valley Finance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CalculatorPage;
