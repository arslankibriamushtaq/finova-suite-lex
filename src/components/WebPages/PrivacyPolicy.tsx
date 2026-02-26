import React, { useState, useEffect } from 'react';
import { Images } from '../Config/Images';
// URL for external RTL stylesheet
const rtlCssUrl = new URL('../../styles/arabic-rtl.css', import.meta.url).href;
import { getPageData } from '../../redux/apis/apisCrudWebPageManagement';
import Loader from '../Loader/Loader';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';

interface PrivacyPolicyData {
  header: {
    logo: string;
    navigation: {
      about: { text: string; url: string };
      contact: { text: string; url: string };
    };
  };
  hero: {
    image: string;
  };
  breadcrumb: {
    home: { text: string; url: string };
    privacy: { text: string; url: string };
  };
  content: {
    heading: string;
    description: string;
  };
  images: {
    headerLogo: string;
  };
}

const PrivacyPolicy: React.FC = () => {
  const [pageData, setPageData] = useState<PrivacyPolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const PAGE_SLUG = 'privacy';

  const getSectionContent = (section: any) => {
    if (!section || !section.translations || section.translations.length === 0) {
      return {};
    }
    return section.translations[0].content || {};
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const fetchPageData = async (currentLocale: string = locale) => {
    try {
      setLoading(true);
      setError(null);
      
      
      const response = await getPageData(PAGE_SLUG, currentLocale);
      const result = response.data;
      
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        const globalSections = result.data.global_sections || [];
        
        // Map API sections to our data structure
        const privacyHeroSection = getSectionContent(sections.find((s: any) => s.key === 'privacy_hero')) || {};
        const privacyContentSection = getSectionContent(sections.find((s: any) => s.key === 'privacy')) || {};
        
        // Extract breadcrumbs from config
        // Breadcrumbs are structured as { "en": [...], "ar": [...] }
        const breadcrumbsObj = result.data.page?.config?.breadcrumbs;
        const breadcrumbsRaw = breadcrumbsObj?.[currentLocale] || breadcrumbsObj?.en || [];
        const breadcrumbs = Array.isArray(breadcrumbsRaw) ? breadcrumbsRaw : [];
        const homeBreadcrumb = breadcrumbs.find((b: any) => b.url === '/') || { name: 'Home', url: '/' };
        const currentBreadcrumb = breadcrumbs.find((b: any) => !b.url) || { name: 'Privacy Policy' };
        
        // Extract header and footer from global_sections
        const headerSection = globalSections.find((s: any) => s.key === 'header');
        const headerContent = headerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};
        
        const footerSection = globalSections.find((s: any) => s.key === 'footer');
        const footerContent = footerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};

        const parsedData: PrivacyPolicyData = {
          header: {
            logo: headerContent?.logo?.url || Images.awnLogoWhite,
            navigation: {
              about: { text: (headerContent?.main_menu?.[1]?.label) || 'About', url: (headerContent?.main_menu?.[1]?.url) || '/about' },
              contact: { text: (headerContent?.main_menu?.[3]?.label) || 'Contact', url: (headerContent?.main_menu?.[3]?.url) || '/contact' }
            }
          },
          hero: {
            image: getFullImageUrl(privacyHeroSection.hero_image?.url || '')
          },
          breadcrumb: {
            home: { 
              text: homeBreadcrumb.name, 
              url: homeBreadcrumb.url 
            },
            privacy: { 
              text: currentBreadcrumb.name, 
              url: currentBreadcrumb.url || '/privacy' 
            }
          },
          content: {
            heading: privacyContentSection.heading || '',
            description: privacyContentSection.description || ''
          },
          images: {
            headerLogo: Images.awnLogoWhite
          }
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
      console.error('Error fetching privacy policy data:', err);
      
      // Check if it's a CORS error or connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Use fallback data when API is not available - show "N/A" for all content
        const fallbackData: PrivacyPolicyData = {
          header: {
            logo: Images.awnLogoWhite,
            navigation: {
              about: { text: 'About', url: '/about' },
              contact: { text: 'Contact', url: '/contact' }
            }
          },
          hero: {
            image: ''
          },
          breadcrumb: {
            home: { text: 'Home', url: '/' },
            privacy: { text: 'Privacy Policy', url: '/privacy' }
          },
          content: {
            heading: 'N/A',
            description: 'N/A'
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

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'red',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h3>Error Loading Privacy Policy</h3>
        <p>{error}</p>
        <button 
          onClick={() => fetchPageData(locale)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px',
        border: '1px solid #e0e0e0'
      }}>
        No privacy policy data available.
      </div>
    );
  } 

  return (
    <div className="header-footer-settings__landing-template page-privacy">
      {/* Global Header */}
      <GlobalHeader locale={locale} onLocaleChange={setLocale} />

      {/* Hero Image Section */}
      <section style={{
        position: 'relative',
        height: '400px',
        backgroundImage: pageData.hero.image ? `url("${pageData.hero.image}")` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }} />
      </section>

      {/* Breadcrumb */}
      <div className='container'>
         <div style={{
        backgroundColor: '#f5f5f5',
        padding: '10px 20px',
        fontSize: '14px',
        color: '#7f8c8d',
        display: 'flex',
        alignItems: 'center',
        gap: '0'
      }}>
        <a href={pageData.breadcrumb.home.url} style={{ textDecoration: 'underline', cursor: 'pointer', color: '#7f8c8d' }}>
          {pageData.breadcrumb.home.text}
        </a>
        <span style={{ margin: '0 5px' }}> / </span>
        <span style={{ color: '#7f8c8d' }}>
          {pageData.breadcrumb.privacy.text}
        </span>
      </div>
      </div>
     

      {/* Main Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        <div className='container'>
          {/* Title */}
          {pageData.content.heading && (
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              {pageData.content.heading}
            </h1>
          )}

          {/* Description */}
          {pageData.content.description && (
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#555',
              marginBottom: '20px'
            }} dangerouslySetInnerHTML={{ __html: pageData.content.description }} />
          )}

          {/* Show message if no content available */}
          {!pageData.content.heading && !pageData.content.description && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              fontSize: '18px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              No privacy policy content available.
            </div>
          )}
        </div>
      </div>

      {/* Global Footer */}
      <GlobalFooter locale={locale} />
    </div>
  );
};

export default PrivacyPolicy;
