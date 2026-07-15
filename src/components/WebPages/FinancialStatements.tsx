import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Images } from '../Config/Images';
// URL for external RTL stylesheet
const rtlCssUrl = new URL('../../styles/arabic-rtl.css', import.meta.url).href;
import { getPageData } from '../../redux/apis/apisCrudWebPageManagement';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';
import TableView from '../TableView/TableView';
import Loader from '../Loader/Loader';

// Types for API response
interface FinancialStatementsData {
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
    financialStatements: { text: string; url: string };
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
  tableData: {
    headers: any[];
    data: any[];
  };
}

const FinancialStatements = () => {
  const { t } = useTranslation('webPages');
  const [pageData, setPageData] = useState<FinancialStatementsData | null>(null);
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
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL;
  const PAGE_SLUG = 'financial-statement';

  // Helper function to safely extract content from a section
  const getSectionContent = (section: any, currentLocale: string = locale) => {
    if (!section || !section.translations || !Array.isArray(section.translations)) {
      return {};
    }
    const translation = section.translations.find((t: any) => t.locale === currentLocale);
    return translation?.content || {};
  };

  // Helper function to construct full image URLs
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
      
      // Extract breadcrumbs from config (available in both success and fallback cases)
      // Breadcrumbs are structured as { "en": [...], "ar": [...] }
      const breadcrumbsObj = result.data?.page?.config?.breadcrumbs;
      const breadcrumbsRaw = breadcrumbsObj?.[currentLocale] || breadcrumbsObj?.en || [];
      const breadcrumbs = Array.isArray(breadcrumbsRaw) ? breadcrumbsRaw : [];
      const homeBreadcrumb = breadcrumbs.find((b: any) => b.url === '/') || { name: 'Home', url: '/' };
      const currentBreadcrumb = breadcrumbs.find((b: any) => !b.url) || { name: currentLocale === 'ar' ? 'البيانات المالية' : 'Financial Statements' };
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        const globalSections = result.data.global_sections || [];
        
        // Extract data based on section structure
        const heroSection = getSectionContent(sections.find((s: any) => s.key === 'financial_statement_hero'), currentLocale) || {};
        const statementSection = getSectionContent(sections.find((s: any) => s.key === 'financial_statement'), currentLocale) || {};
        
        // Transform statements data for table display
        const tableHeaders = [
          {
            name: currentLocale === 'ar' ? 'العنوان' : 'Title',
            selector: 'title',
            sortable: true,
            cell: (row: any) => (
              <span style={{ fontWeight: '500' }}>{row.title}</span>
            )
          },
          {
            name: currentLocale === 'ar' ? 'تحميل الملف' : 'Download File',
            selector: 'url',
            sortable: true,
            cell: (row: any) => (
              <a 
                href={row.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#007bff', 
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                📄 {currentLocale === 'ar' ? 'تحميل PDF' : 'Download PDF'}
              </a>
            )
          },
          
          {
            name: currentLocale === 'ar' ? 'الحالة' : 'Status',
            selector: 'status',
            sortable: true,
            cell: (row: any) => (
              <span style={{
                padding: '4px 8px',
                borderRadius: '2px',
                backgroundColor: row.status ? 'var(--color-success)' : 'var(--color-error)',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {row.status ? (currentLocale === 'ar' ? 'نشط' : 'Active') : (currentLocale === 'ar' ? 'غير نشط' : 'Inactive')}
              </span>
            )
          }
        ];
        
        // Extract header and footer from global_sections
        const headerSection = globalSections.find((s: any) => s.key === 'header');
        const headerContent = headerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};
        
        const footerSection = globalSections.find((s: any) => s.key === 'footer');
        const footerContent = footerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};

        const parsedData: FinancialStatementsData = {
          header: {
            logo: headerContent?.logo?.url || Images.awnLogoWhite,
            navigation: {
              about: { text: (headerContent?.main_menu?.[1]?.label) || 'About', url: (headerContent?.main_menu?.[1]?.url) || '/about' },
              contact: { text: (headerContent?.main_menu?.[3]?.label) || 'Contact', url: (headerContent?.main_menu?.[3]?.url) || '/contact' }
            }
          },
          hero: {
            image: heroSection.hero_image?.url ? getFullImageUrl(heroSection.hero_image.url) : '',
            title: statementSection.heading || (currentLocale === 'ar' ? 'البيانات المالية' : 'Financial Statements')
          },
          breadcrumb: {
            home: { 
              text: homeBreadcrumb.name, 
              url: homeBreadcrumb.url 
            },
            financialStatements: { 
              text: currentBreadcrumb.name, 
              url: currentBreadcrumb.url || '/financial-statements' 
            }
          },
          content: {
            title: statementSection.heading || (currentLocale === 'ar' ? 'البيانات المالية' : 'Financial Statements'),
            paragraph1: statementSection.description || '',
            paragraph2: '',
            paragraph3: '',
            paragraph4: ''
          },
          logo: {
            arabic: '',
            english: ''
          },
          images: {
            heroImage: heroSection.hero_image?.url ? getFullImageUrl(heroSection.hero_image.url) : '',
            headerLogo: Images.FactoringLogo,
            contentLogo: ''
          },
          tableData: {
            headers: tableHeaders,
            data: statementSection.statements || []
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

        // Store footer data for rendering
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
        throw new Error('API response indicates failure or missing data');
      }
    } catch (err) {
      console.error('Error fetching financial statements data:', err);
      
      // Check if it's a CORS error or connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Use fallback data when API is not available - show "N/A" for all content
        const fallbackData: FinancialStatementsData = {
          header: {
            logo: Images.FactoringLogo,
            navigation: {
              about: { text: 'About', url: '/about' },
              contact: { text: 'Contact', url: '/contact' }
            }
          },
          hero: {
            image: '',
            title: locale === 'ar' ? 'البيانات المالية' : 'Financial Statements'
          },
          breadcrumb: {
            home: { 
              text: locale === 'ar' ? 'الرئيسية' : 'Home', 
              url: '/' 
            },
            financialStatements: { 
              text: locale === 'ar' ? 'البيانات المالية' : 'Financial Statements', 
              url: '/financial-statements' 
            }
          },
          content: {
            title: locale === 'ar' ? 'البيانات المالية' : 'Financial Statements',
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
            headerLogo: Images.FactoringLogo,
            contentLogo: ''
          },
          tableData: {
            headers: [],
            data: []
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

  if (error && !pageData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: ' #1963b9',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div>{t('errorWithMessage', { message: error })}</div>
        <button 
          onClick={() => fetchPageData(locale)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer'
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
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        {t('state.noDataAvailableShort')}
      </div>
    );
  }

  return (
    <div className="header-footer-settings__landing-template page-financial-statements">
      {/* Global Header */}
      <GlobalHeader locale={locale} onLocaleChange={setLocale} />

      {/* Hero Image Section */}
      <section style={{
        position: 'relative',
        height: '400px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backgroundImage: pageData.images.heroImage ? `url("${pageData.images.heroImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Overlay for better text readability when image is present */}
        {pageData.images.heroImage && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }} />
        )}
        
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
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
          {pageData.breadcrumb.home.text}
        </span>
        <span style={{ margin: '0 5px' }}> / </span>
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
          {pageData.breadcrumb.financialStatements.text}
        </span>
      </div>
      </div>
     

      {/* Main Content */}
      <section style={{
        backgroundColor: '#ffffff',
        color: '#333',
        padding: '60px 40px',
        minHeight: '400px'
      }}>
        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '2px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>Notice:</strong> {error}
          </div>
        )}

        {/* Heading and Description */}
        <div className='container'>
        <div style={{ marginBottom: '40px', textAlign: 'left' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
            margin: '0 0 20px 0'
          }}>
            {pageData.content.title}
          </h1>
          {pageData.content.paragraph1 && (
            <div 
              style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.6',
                maxWidth: '100%',
                textAlign: 'left',
                margin: '0 auto'
              }}
              dangerouslySetInnerHTML={{ __html: pageData.content.paragraph1 }}
            />
          )}
        </div>
</div>
        {/* Table Section */}
        <div className='container'>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '2px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {pageData.tableData.data && pageData.tableData.data.length > 0 ? (
            <TableView
              header={pageData.tableData.headers}
              data={pageData.tableData.data}
              isLoading={false}
              paginationShow={false}
              totalRows={pageData.tableData.data.length}
              pageSize={10}
              page={1}
              totalPage={Math.ceil(pageData.tableData.data.length / 10)}
              from={1}
              to={pageData.tableData.data.length}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              fontSize: '16px'
            }}>
              {t('state.noFinancialStatements')}
            </div>
          )}
        </div>
                </div>

      </section>

      {/* Global Footer */}
      <GlobalFooter locale={locale} />
    </div>
  );
};

export default FinancialStatements;
