import { useState, useEffect } from 'react';
import { Images } from '../Config/Images';
// URL for external RTL stylesheet
const rtlCssUrl = new URL('../../styles/arabic-rtl.css', import.meta.url).href;
import { getPageData } from '../../redux/apis/apisCrudWebPageManagement';
import Loader from '../Loader/Loader';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';

// Types for API response
interface ContactUsPageData {
  header: {
    logo?: string;
    logoLink?: string;
    logoAlt?: string;
    navigation: {
      about: { text: string; url: string };
      contact: { text: string; url: string };
    };
    navigationLinks?: Array<{ label: string; url: string; target?: string }>;
  };
  hero: {
    image: string;
    title: string;
  };
  breadcrumb: {
    home: { text: string; url: string };
    contact: { text: string; url: string };
  };
  content: {
    title: string;
    subtitle: string;
    description: string;
  };
  contactInfo: {
    address: string;
    email: string;
    phone: string;
  };
  contactInfoItems: Array<{
    icon: string;
    value: string;
    title?: string;
    heading?: string;
    url?: string;
    target?: string;
  }>;
  socialLinks: Array<{
    icon: string;
    url: string;
    platform?: string;
  }>;
  form: {
    title: string;
    fields: {
      fullName: { label: string; placeholder: string };
      subject: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      message: { label: string; placeholder: string };
    };
    submitButton: string;
  };
}

const ContactUs = () => {
  const [pageData, setPageData] = useState<ContactUsPageData | null>(null);
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
  const PAGE_SLUG = 'contact-us';

  // Helper: Icon emoji mapping
  const iconEmojiMap: { [key: string]: string } = {
    youtube: '▶',
    facebook: 'f',
    instagram: '📷',
    twitter: 'X',
    tiktok: '🎵',
    linkedin: 'in',
    snapchat: '👻'
  };

  // Helper: Check if icon is a URL/path (image)
  const isIconUrl = (icon: string): boolean => {
    if (!icon) return false;
    return icon.startsWith('http') || 
           icon.startsWith('/storage') || 
           icon.startsWith('/') || 
           icon.includes('.svg') || 
           icon.includes('.png') || 
           icon.includes('.jpg') || 
           icon.includes('.jpeg') || 
           icon.includes('.gif') ||
           icon.includes('.webp') ||
           (icon.includes('.') && icon.includes('/'));
  };

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
      const currentBreadcrumb = breadcrumbs.find((b: any) => !b.url) || { name: 'Contact Us' };
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        const globalSections = result.data.global_sections || [];
        
        // Extract data based on section structure
        const heroSection = getSectionContent(sections.find((s: any) => s.key === 'contact_hero'), currentLocale) || {};
        const introSection = getSectionContent(sections.find((s: any) => s.key === 'contact_intro'), currentLocale) || {};
        const detailsSection = getSectionContent(sections.find((s: any) => s.key === 'contact_details'), currentLocale) || {};
        const formSection = getSectionContent(sections.find((s: any) => s.key === 'contact_form'), currentLocale) || {};
        
        // Extract header and footer from global_sections
        const headerSection = globalSections.find((s: any) => s.key === 'header');
        const headerContent = headerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};
        
        const footerSection = globalSections.find((s: any) => s.key === 'footer');
        const footerContent = footerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};

        const parsedData: ContactUsPageData = {
          header: {
            logo: headerContent?.logo?.url || Images.awnLogoWhite,
            navigation: {
              about: { text: (headerContent?.main_menu?.[1]?.label) || 'About', url: (headerContent?.main_menu?.[1]?.url) || '/about' },
              contact: { text: (headerContent?.main_menu?.[3]?.label) || 'Contact', url: (headerContent?.main_menu?.[3]?.url) || '/contact' }
            }
          },
          hero: {
            image: heroSection.hero_image?.url ? getFullImageUrl(heroSection.hero_image.url) : '',
            title: introSection.heading || 'Contact Us'
          },
          breadcrumb: {
            home: { 
              text: homeBreadcrumb.name, 
              url: homeBreadcrumb.url 
            },
            contact: { 
              text: currentBreadcrumb.name, 
              url: currentBreadcrumb.url || '/contact' 
            }
          },
          content: {
            title: introSection.heading || 'Contact Us',
            subtitle: introSection.sub_heading || 'Let\'s Start a Conversation',
            description: ''
          },
          contactInfo: {
            address: detailsSection.contact_information?.find((item: any) => item.icon === 'map-marker-alt')?.value || 'Al-Urubah 2163, Al-Maathar North District 7795, Riyadh 12334, Kingdom of Saudi Arabia.',
            email: detailsSection.contact_information?.find((item: any) => item.icon === 'envelope')?.value || 'info@factoringvalley-sa.com',
            phone: detailsSection.contact_information?.find((item: any) => item.icon === 'phone')?.value || '800 1000 322'
          },
          contactInfoItems: detailsSection.contact_information || [],
          socialLinks: detailsSection.social_links || [],
          form: {
            title: formSection.heading || (currentLocale === 'ar' ? 'راسلنا' : 'Message Us'),
            fields: {
              fullName: {
                label: formSection.fields?.find((field: any) => field.name === 'full_name')?.label || (currentLocale === 'ar' ? 'الاسم الكامل' : 'Full Name'),
                placeholder: currentLocale === 'ar' 
                  ? 'أدخل اسمك الكامل'
                  : `Enter your ${formSection.fields?.find((field: any) => field.name === 'full_name')?.label?.toLowerCase() || 'full name'}`
              },
              subject: {
                label: formSection.fields?.find((field: any) => field.name === 'subject')?.label || (currentLocale === 'ar' ? 'الموضوع' : 'Subject'),
                placeholder: currentLocale === 'ar'
                  ? 'أدخل الموضوع'
                  : `Enter the ${formSection.fields?.find((field: any) => field.name === 'subject')?.label?.toLowerCase() || 'subject'}`
              },
              email: {
                label: formSection.fields?.find((field: any) => field.name === 'email')?.label || (currentLocale === 'ar' ? 'البريد الإلكتروني' : 'Email'),
                placeholder: currentLocale === 'ar'
                  ? 'أدخل بريدك الإلكتروني'
                  : `Enter your ${formSection.fields?.find((field: any) => field.name === 'email')?.label?.toLowerCase() || 'email address'}`
              },
              message: {
                label: formSection.fields?.find((field: any) => field.name === 'message')?.label || (currentLocale === 'ar' ? 'الرسالة' : 'Message'),
                placeholder: currentLocale === 'ar'
                  ? 'اكتب رسالتك هنا'
                  : `Type your ${formSection.fields?.find((field: any) => field.name === 'message')?.label?.toLowerCase() || 'message'} here`
              }
            },
            submitButton: formSection.button_text || (currentLocale === 'ar' ? 'إرسال الرسالة' : 'Send Message')
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
        throw new Error('API response indicates failure or missing data');
      }
    } catch (err) {
      console.error('Error fetching contact us data:', err);
      
      // Check if it's a CORS error or connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Use fallback data when API is not available
        const fallbackData: ContactUsPageData = {
          header: {
            logo: Images.awnLogoWhite,
            navigation: {
              about: { text: 'About', url: '/about' },
              contact: { text: 'Contact', url: '/contact' }
            }
          },
          hero: {
            image: '',
            title: 'Contact Us'
          },
          breadcrumb: {
            home: { 
              text: 'Home', 
              url: '/' 
            },
            contact: { 
              text: 'Contact Us', 
              url: '/contact' 
            }
          },
          content: {
            title: 'Contact Us',
            subtitle: 'Let\'s Start a Conversation',
            description: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'
          },
          contactInfo: {
            address: 'Al-Urubah 2163, Al-Maathar North District 7795, Riyadh 12334, Kingdom of Saudi Arabia.',
            email: 'info@factoringvalley-sa.com',
            phone: '800 1000 322'
          },
          contactInfoItems: [
            {
              icon: 'map-marker-alt',
              value: 'Al-Urubah 2163, Al-Maathar North District 7795, Riyadh 12334, Kingdom of Saudi Arabia.',
              title: 'Our Address'
            },
            {
              icon: 'envelope',
              value: 'info@factoringvalley-sa.com',
              title: 'Our Email'
            },
            {
              icon: 'phone',
              value: '800 1000 322',
              title: 'Our Phone Number'
            }
          ],
          socialLinks: [],
          form: {
            title: locale === 'ar' ? 'راسلنا' : 'Message Us',
            fields: {
              fullName: {
                label: locale === 'ar' ? 'الاسم الكامل' : 'Full Name',
                placeholder: locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'
              },
              subject: {
                label: locale === 'ar' ? 'الموضوع' : 'Subject',
                placeholder: locale === 'ar' ? 'أدخل الموضوع' : 'Enter the subject'
              },
              email: {
                label: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
                placeholder: locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'
              },
              message: {
                label: locale === 'ar' ? 'الرسالة' : 'Message',
                placeholder: locale === 'ar' ? 'اكتب رسالتك هنا' : 'Type your message here'
              }
            },
            submitButton: 'Send Message'
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
        <div>Error: {error}</div>
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
        No data available
      </div>
    );
  }

  return (
    <div className="header-footer-settings__landing-template page-contact">
      {/* Global Header */}
      <GlobalHeader locale={locale} onLocaleChange={setLocale} />

      {/* Hero Image Section */}
      <section style={{
        position: 'relative',
        height: '400px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backgroundImage: pageData.hero.image ? `url("${pageData.hero.image}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Overlay for better text readability when image is present */}
        {pageData.hero.image && (
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
          {pageData.breadcrumb.contact.text}
        </span>
      </div>
      </div>
      

      {/* Main Content */}
      <section style={{
        backgroundColor: '#ffffff',
        color: '#333',
        padding: '60px 40px',
        minHeight: '600px'
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

        {/* Contact Us Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Left Side - Contact Info */}
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 10px 0'
            }}>
              {pageData.content.title}
            </h1>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 'normal',
              color: '#666',
              margin: '0 0 30px 0',
              textAlign: 'left'
            }}>
              {pageData.content.subtitle}
            </h2>

            {/* Contact Information Cards */}
            <div style={{ marginBottom: '40px' }}>
              {(pageData.contactInfoItems || []).map((item: any, index: number) => {
                // Default titles based on index and locale
                const defaultTitles = locale === 'ar' 
                  ? ['عنواننا', 'بريدنا الإلكتروني', 'رقمنا']
                  : ['Our Address', 'Our Email', 'Our Number'];
                
                // Map English titles to Arabic
                const titleMap: { [key: string]: { en: string; ar: string } } = {
                  'Our Address': { en: 'Our Address', ar: 'عنواننا' },
                  'Our Email': { en: 'Our Email', ar: 'بريدنا الإلكتروني' },
                  'Our Number': { en: 'Our Number', ar: 'رقمنا' },
                  'Our Phone Number': { en: 'Our Phone Number', ar: 'رقمنا' }
                };
                
                // Get the title, checking if it needs translation
                const getTitle = () => {
                  const apiTitle = item.title || item.heading;
                  if (apiTitle) {
                    // Check if this title exists in our map and translate if needed
                    const mapped = titleMap[apiTitle];
                    if (mapped) {
                      return locale === 'ar' ? mapped.ar : mapped.en;
                    }
                    return apiTitle;
                  }
                  return defaultTitles[index] || 'Contact Info';
                };

                return (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '2px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                        {getTitle()}
                      </h3>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                        {item.value}
                      </p>
                    </div>
                    <div style={{ color: ' #1963b9', fontSize: '24px' }}>
                      {isIconUrl(item.icon) ? (
                        <img 
                          src={item.icon} 
                          alt="Contact Icon"
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        '📞'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social Media Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '2px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ flex: 1 }}>
                {/* <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                  Follow Us
                </h3> */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  {(pageData.socialLinks || []).map((item: any, index: number) => (
                    <a
                      key={index}
                      href={item.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        textDecoration: 'none',
                        color: '#333',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {isIconUrl(item.icon) ? (
                        <img 
                          src={item.icon} 
                          alt={item.platform || 'Social Media Icon'}
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '32px' }}>
                          {iconEmojiMap[item.icon] || '🔗'}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 30px 0'
            }}>
              {pageData.form.title}
            </h2>

            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '2px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <form>
                {/* Full Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    {pageData.form.fields.fullName.label}
                  </label>
                  <input
                    type="text"
                    placeholder={pageData.form.fields.fullName.placeholder}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '2px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Subject */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    {pageData.form.fields.subject.label}
                  </label>
                  <input
                    type="text"
                    placeholder={pageData.form.fields.subject.placeholder}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '2px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    {pageData.form.fields.email.label}
                  </label>
                  <input
                    type="email"
                    placeholder={pageData.form.fields.email.placeholder}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '2px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    {pageData.form.fields.message.label}
                  </label>
                  <textarea
                    placeholder={pageData.form.fields.message.placeholder}
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '2px',
                      fontSize: '14px',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '2px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#000';
                  }}
                >
                  {pageData.form.submitButton}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <GlobalFooter locale={locale} />
    </div>
  );
};

export default ContactUs;
