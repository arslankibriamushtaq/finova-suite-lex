import { useState, useEffect } from 'react';
import { Images } from '../Config/Images';
// URL for external RTL stylesheet
const rtlCssUrl = new URL('../../styles/arabic-rtl.css', import.meta.url).href;
import { getPageData } from '../../redux/apis/apisCrudWebPageManagement';
import Loader from '../Loader/Loader';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';

// Types for API response
interface AboutPageData {
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
    about: { text: string; url: string };
  };
  content: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    paragraph4: string;
  };
  logo: {
    arabic: string;
    english: string;
  };
  images: {
    heroImage: string;
    headerLogo: string;
    contentLogo: string;
  };
}

const AboutPage = () => {
  const [pageData, setPageData] = useState<AboutPageData | null>(null);
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

  // API Configuration
  const PAGE_SLUG = 'about';

  // Helper function to safely extract content from a section
  const getSectionContent = (section: any) => {
    if (!section || !section.translations || section.translations.length === 0) {
      return {};
    }
    const content = section.translations[0].content || {};
    
    // Handle the typo in the API response for subheading
    if (content.subheadiheadingng && !content.subheading) {
      content.subheading = content.subheadiheadingng;
      delete content.subheadiheadingng;
    }
    
    return content;
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
      const currentBreadcrumb = breadcrumbs.find((b: any) => !b.url) || { name: 'About' };
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        const globalSections = result.data.global_sections || [];
        
        // Map API sections to AboutPageData structure based on actual API response
        const aboutHeroSection = getSectionContent(sections.find((s: any) => s.key === 'about_hero')) || {};
        const aboutSection = getSectionContent(sections.find((s: any) => s.key === 'about')) || {};
        
        const headerSection = globalSections.find((s: any) => s.key === 'header');
        const headerContent = headerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};
        
        const footerSection = globalSections.find((s: any) => s.key === 'footer');
        const footerContent = footerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};

        const parsedData: AboutPageData = {
          header: {
            logo: headerContent?.logo?.url || Images.awnLogoWhite,
            navigation: {
              about: { text: (headerContent?.main_menu?.[1]?.label) || 'About', url: (headerContent?.main_menu?.[1]?.url) || '/about' },
              contact: { text: (headerContent?.main_menu?.[3]?.label) || 'Contact', url: (headerContent?.main_menu?.[3]?.url) || '/contact' }
            },
            // @ts-ignore include all menu items
            navigationLinks: headerContent?.main_menu || []
          },
          hero: {
            image: aboutHeroSection.hero_image?.url || '',
            title: ''
          },
          breadcrumb: {
            home: { 
              text: homeBreadcrumb.name, 
              url: homeBreadcrumb.url 
            },
            about: { 
              text: currentBreadcrumb.name, 
              url: currentBreadcrumb.url || '/about' 
            }
          },
          content: {
            title: aboutSection.heading || '',
            paragraph1: aboutSection.description || '',
            paragraph2: '',
            paragraph3: '',
            paragraph4: aboutSection.below_description || ''
          },
          logo: {
            arabic: '',
            english: ''
          },
          images: {
            heroImage: aboutHeroSection.hero_image?.url || '',
            headerLogo: Images.awnLogoWhite,
            contentLogo: aboutSection.about_image?.url || ''
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
      console.error('Error fetching about page data:', err);
      
      // Check if it's a CORS error or connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Use fallback data when API is not available - show "N/A" for all content
        const fallbackData: AboutPageData = {
          header: {
            logo: Images.awnLogoWhite,
            navigation: {
              about: { text: 'About', url: '/about' },
              contact: { text: 'Contact', url: '/contact' }
            }
          },
          hero: {
            image: '',
            title: ''
          },
          breadcrumb: {
            home: { 
              text: 'Home', 
              url: '/' 
            },
            about: { 
              text: 'About', 
              url: '/about' 
            }
          },
          content: {
            title: 'N/A',
            paragraph1: 'N/A',
            paragraph2: 'N/A',
            paragraph3: 'N/A',
            paragraph4: 'N/A'
          },
          logo: {
            arabic: '',
            english: ''
          },
          images: {
            heroImage: '',
            headerLogo: Images.awnLogoWhite,
            contentLogo: ''
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
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#e74c3c'
      }}>
        Error: {error}
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
        No data available
      </div>
    );
  }

  return (
    <div className="header-footer-settings__landing-template page-about">
      {/* Global Header */}
      <GlobalHeader locale={locale} onLocaleChange={setLocale} />

      {/* Hero Image Section */}
      {pageData.images.heroImage && (
        <section style={{
          position: 'relative',
          height: '400px',
          backgroundImage: `url("${pageData.images.heroImage}")`,
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
      )}

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
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
          {pageData.breadcrumb.home.text}
        </span>
        <span style={{ margin: '0 5px' }}> / </span>
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
          {pageData.breadcrumb.about.text}
        </span>
      </div>
      </div>
      

      {/* Main Content */}
      <section  style={{
        backgroundColor: '#ffffff',
        color: '#333',
        padding: '60px 40px',
        minHeight: '400px'
      }}>
        <div className='container'>
              <div style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'flex-start'
        }}>
          {/* Left Column - Text Content */}
          <div style={{
            flex: '2',
            lineHeight: '1.8'
          }}>
            {pageData.content.title && (
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#333',
                margin: '0 0 30px 0'
              }}>
                {pageData.content.title}
              </h1>
            )}

            <div style={{ marginBottom: '25px' }}>
              {pageData.content.paragraph1 && (
                <div style={{ marginBottom: '20px', fontSize: '16px', color: '#333' }} dangerouslySetInnerHTML={{ __html: pageData.content.paragraph1 }} />
              )}
              {pageData.content.paragraph2 && (
                <div style={{ marginBottom: '20px', fontSize: '16px', color: '#333' }} dangerouslySetInnerHTML={{ __html: pageData.content.paragraph2 }} />
              )}
              {pageData.content.paragraph3 && (
                <div style={{ marginBottom: '20px', fontSize: '16px', color: '#333' }} dangerouslySetInnerHTML={{ __html: pageData.content.paragraph3 }} />
              )}
            </div>
          </div>

          {/* Right Column - Logo */}
          {pageData.images.contentLogo && (
            <div style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                padding: '0px',
                borderRadius: '6px',
                textAlign: 'center',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                width: '100%'
              }}>
                <img 
                  src={pageData.images.contentLogo} 
                  alt="Factoring Valley Logo" 
                  style={{ maxWidth: '100%', maxHeight: '520px', width: 'auto', objectFit: 'contain' , borderRadius: '6px' }}
                />
              </div>
            </div>
          )}
        </div>
        </div>
        
      </section>

      {/* Bottom Section - Commitment Statement */}
      {pageData.content.paragraph4 && (
        <section style={{
          backgroundColor: 'white',
          padding: '40px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '30px 40px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            maxWidth: '800px',
            width: '100%'
          }}>
            <div style={{
              margin: '0',
              fontSize: '16px',
              color: '#333',
              lineHeight: '1.6',
              textAlign: 'left'
            }} dangerouslySetInnerHTML={{ __html: pageData.content.paragraph4 }} />
          </div>
        </section>
      )}

      {/* Global Footer */}
      <GlobalFooter locale={locale} />
    </div>
  );
};

export default AboutPage;
