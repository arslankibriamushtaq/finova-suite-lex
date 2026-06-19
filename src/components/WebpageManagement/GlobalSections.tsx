import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Images } from '../Config/Images';
import { getGlobalSections } from '../../redux/apis/apisCrudWebPageManagement';
import Loader from '../Loader/Loader';

interface GlobalSection {
  id: number;
  key: string;
  name: string;
  translations: Array<{
    locale: string;
    content: any;
  }>;
}

const GlobalSections = () => {
  const navigate = useNavigate();
  const [showEditHeader, setShowEditHeader] = useState(false);
  const [showEditFooter, setShowEditFooter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerContent, setHeaderContent] = useState<any>(null);
  const [footerContent, setFooterContent] = useState<any>(null);
  const [headerSectionId, setHeaderSectionId] = useState<number | null>(null);
  const [footerSectionId, setFooterSectionId] = useState<number | null>(null);
  const [locale, setLocale] = useState<string>('en');
  const [isScrolled] = useState(false);

  const handleEditHeader = () => {
    if (headerSectionId) {
      navigate(`/Los/WebPageManagement/GlobalSections/Settings?section_id=${headerSectionId}&section_key=header`);
    }
  };

  const handleEditFooter = () => {
    if (footerSectionId) {
      navigate(`/Los/WebPageManagement/GlobalSections/Settings?section_id=${footerSectionId}&section_key=footer`);
    }
  };

  // Helper function to get content for a specific locale
  const getContentForLocale = (section: GlobalSection, locale: string) => {
    if (!section || !section.translations || section.translations.length === 0) {
      return null;
    }
    const translation = section.translations.find(t => t.locale === locale);
    return translation ? translation.content : (section.translations[0]?.content || null);
  };

  // Fetch global sections from API
  const fetchGlobalSections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getGlobalSections();
      const result = response.data;
      
      if (result.success && result.data && result.data.data) {
        const sections = result.data.data;
        
        // Find header and footer sections
        const headerSection = sections.find((s: GlobalSection) => s.key === 'header');
        const footerSection = sections.find((s: GlobalSection) => s.key === 'footer');
        
        if (headerSection) {
          const headerData = getContentForLocale(headerSection, locale);
          setHeaderContent(headerData);
          setHeaderSectionId(headerSection.id);
        }
        
        if (footerSection) {
          const footerData = getContentForLocale(footerSection, locale);
          setFooterContent(footerData);
          setFooterSectionId(footerSection.id);
        }
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('Error fetching global sections:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Handle scroll for sticky header
  /* useEffect(() => {
		const onScroll = () => {
			const y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
			const scrolled = y > 0;
			setIsScrolled(scrolled);
			const rootEl = document.documentElement;
			if (scrolled) {
				rootEl.classList.add('scrolled');
			} else {
				rootEl.classList.remove('scrolled');
			}
		};
		// Capture scroll events at the document level to catch scrollable containers
		window.addEventListener('scroll', onScroll, { passive: true, capture: true });
		document.addEventListener('scroll', onScroll, { passive: true, capture: true });
		onScroll();
		return () => {
			window.removeEventListener('scroll', onScroll, { capture: true } as any);
			document.removeEventListener('scroll', onScroll, { capture: true } as any);
		};
	}, []); */


  // Helper to get full image URL
  const getFullImageUrl = (url: string) => {
    if (!url) return Images.FactoringLogo;
    if (url.startsWith('http')) return url;
    const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || '';
    // Ensure path starts with / and base URL doesn't end with /
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    const normalizedBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${normalizedBaseUrl}${normalizedPath}`;
  };

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
        color: 'var(--theme-secondary)'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-surface-subtle)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      

      {/* Header Section */}
      {headerContent && (
        <div style={{
          backgroundColor: 'var(--background)',
          borderRadius: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '20px',
          position: 'relative'
        }}
        onMouseEnter={() => setShowEditHeader(true)}
        onMouseLeave={() => setShowEditHeader(false)}
        >
          {/* Edit Header Button - appears on hover */}
          {showEditHeader && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 100
            }}>
              <button
                onClick={handleEditHeader}
                style={{
                  backgroundColor: 'var(--foreground)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Edit Header
              </button>
            </div>
          )}

          {/* Header Template - Using GlobalHeader styling */}
          <header
            className={`header-footer-settings__landing-header `}
            //data-scrolled={isScrolled ? 'true' : 'false'}
            style={{
              position: 'relative',
              //backgroundColor: isScrolled ? '#ffffff' : 'transparent',
              //transition: 'background-color 200ms ease',
              color: 'var(--foreground)',
              boxShadow: isScrolled ? '0 1px 8px rgba(0,0,0,0.08)' : 'none',
              filter: showEditHeader ? 'blur(2px)' : 'none',
              //backgroundImage: !isScrolled ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' : 'none'
            }}
          >
            <div className="header-footer-settings__landing-header-content">
              <div className="header-footer-settings__landing-logo">
                <a 
                  href={headerContent?.logo?.link || '/'}
                  onClick={(e) => e.preventDefault()}
                  style={{ cursor: 'default', pointerEvents: 'none' }}
                >
                  <img
                    src={Images.awnLogoWhite}
                    alt={headerContent?.logo?.alt || 'Factoring Valley Logo'}
                    style={{ height: '40px', filter: 'invert(1)' }}
                  />
                </a>
              </div>
              <nav 
                className={`header-footer-settings__landing-nav ${isScrolled ? 'is-sticky scrolled' : ''}`} 
                data-scrolled={isScrolled ? 'true' : 'false'}
              >
                {headerContent?.main_menu && headerContent.main_menu.length > 0 ? (
                  headerContent.main_menu
                    .filter((item: any) => {
                      const label = typeof item === 'string' ? item : (item?.label || '');
                      return !label.toLowerCase().includes('services');
                    })
                    .map((item: any, idx: number) => {
                      const label = typeof item === 'string' ? item : (item?.label || '');
                      const url = typeof item === 'object' && item !== null ? (item?.url || '#') : '#';
                      const target = typeof item === 'object' && item !== null ? (item?.target || '_self') : '_self';
                      
                      return (
                        <a 
                          key={idx} 
                          href={url} 
                          target={target}
                          onClick={(e) => e.preventDefault()}
                          className="header-footer-settings__landing-nav-link" 
                          style={{ color: 'var(--foreground)', cursor: 'default', pointerEvents: 'none' }}
                        >
                          {label}
                        </a>
                      );
                    })
                ) : null}
                
                {headerContent?.language_options && headerContent.language_options.length > 0 && (
                  <div 
                    className="header-footer-settings__landing-language" 
                    style={{ /* color: isScrolled ? '#000' : '#fff', */ cursor: 'pointer' }}
                    onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                  >
                    <span>{locale === 'en' ? 'عربي' : 'English'}</span>
                    <div className="header-footer-settings__landing-language-indicator">
                      {locale === 'ar' ? '✓' : ''}
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </header>
        </div>
      )}

      {/* Footer Section */}
      {footerContent && (
        <div style={{
          backgroundColor: 'var(--background)',
          borderRadius: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              position: 'relative',
              backgroundColor: 'var(--color-surface-snow)',
              padding: '40px 20px'
            }}
            onMouseEnter={() => setShowEditFooter(true)}
            onMouseLeave={() => setShowEditFooter(false)}
          >
            {/* Edit Footer Button - appears on hover */}
            {showEditFooter && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 10
              }}>
                <button
                  onClick={handleEditFooter}
                  style={{
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--primary-foreground)',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Edit Footer
                </button>
              </div>
            )}

            {/* Footer Template */}
            <footer style={{
              color: 'var(--foreground)',
              filter: showEditFooter ? 'blur(2px)' : 'none',
              transition: 'filter 0.3s ease',
              direction: locale === 'ar' ? 'rtl' : 'ltr'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '30px', direction: locale === 'ar' ? 'rtl' : 'ltr' }}>
                {/* Company Info with Logo and Address */}
                {(footerContent?.logo || footerContent?.address) && (
                  <div style={{ flex: '1', minWidth: '250px', marginBottom: '20px', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    <div style={{ marginBottom: '15px' }}>
                      {/* Use static logo like LandingPage */}
                      <div className="header-footer-settings__footer-logo" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                        عون
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '10px', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                        • A W N •
                      </div>
                    </div>
                    {footerContent?.address && (
                      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0', textAlign: locale === 'ar' ? 'right' : 'left', lineHeight: '1.6', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {footerContent.address}
                      </p>
                    )}
                  </div>
                )}

                {/* Contact Us with Social Links */}
                {footerContent?.contact && (
                  <div style={{ flex: '1', minWidth: '200px', marginBottom: '20px', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: 'var(--foreground)', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                      {footerContent?.contact_title || (locale === 'ar' ? 'اتصل بنا' : 'Contact us')}
                    </h3>
                    {footerContent.contact.phone && (
                      <p style={{ fontSize: '14px', margin: '5px 0', color: 'var(--foreground)', textAlign: locale === 'ar' ? 'right' : 'left', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {footerContent.contact.phone}
                      </p>
                    )}
                    {footerContent.contact.email && (
                      <p style={{ fontSize: '14px', margin: '5px 0 15px 0', color: 'var(--foreground)', textAlign: locale === 'ar' ? 'right' : 'left', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {footerContent.contact.email}
                      </p>
                    )}
                    
                    {/* Social Links under Contact Us */}
              {footerContent?.social_links && footerContent.social_links.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                        gap: '2px', 
                        marginTop: '15px',
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        justifyContent: locale === 'ar' ? 'flex-end' : 'flex-start'
                }}>
                  {footerContent.social_links.map((social: any, index: number) => {
                    // Handle both string and object formats
                    const socialIcon = typeof social === 'string' ? social : (social?.icon || social?.platform || '');
                    const socialUrl = typeof social === 'object' && social !== null ? (social?.url || '#') : '#';
                    const socialTitle = typeof social === 'string' ? social : (social?.platform || social?.icon || 'Social');
                    
                    // Get lowercase value for comparison
                    const socialValue = typeof socialIcon === 'string' ? socialIcon.toLowerCase() : '';
                    
                    // Check if icon is a URL/path (image) or text/emoji
                    const isImageIcon = socialIcon && typeof socialIcon === 'string' && (
                      socialIcon.startsWith('http') || 
                      socialIcon.startsWith('/storage') || 
                      socialIcon.startsWith('/') || 
                      socialIcon.includes('.svg') || 
                      socialIcon.includes('.png') || 
                      socialIcon.includes('.jpg') || 
                      socialIcon.includes('.jpeg') || 
                      socialIcon.includes('.gif') ||
                      socialIcon.includes('.webp') ||
                      (socialIcon.includes('.') && socialIcon.includes('/'))
                    );
                    
                    return (
                      <a
                        key={index}
                        href={socialUrl}
                        target={typeof social === 'object' && social !== null ? (social?.target || '_self') : '_self'}
                        onClick={(e) => e.preventDefault()}
                        style={{
                                width: '32px',
                                height: '32px',
                          borderRadius: '50%',
                                display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                                fontSize: '20px',
                          cursor: 'default',
                          color: 'var(--primary-foreground)',
                          textDecoration: 'none',
                                overflow: 'hidden',
                                transition: 'transform 0.2s',
                                pointerEvents: 'none',
                                ...(locale === 'ar' ? { marginLeft: '4px' } : { marginRight: '4px' })
                        }}
                        title={socialTitle}
                      >
                        {isImageIcon ? (
                          <img 
                            src={getFullImageUrl(socialIcon)} 
                            alt={socialTitle} 
                            style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    objectFit: 'contain'
                            }} 
                          />
                        ) : (
                          socialValue.includes('facebook') ? 'f' : 
                          socialValue.includes('instagram') ? '📷' :
                          socialValue.includes('youtube') ? '▶' :
                          socialValue.includes('tiktok') ? '🎵' : 
                          socialValue.includes('linkedin') ? 'in' :
                          socialValue.includes('snapchat') ? '👻' :
                          socialValue.includes('x') || socialValue.includes('twitter') ? 'X' : '🔗'
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
                  </div>
                )}

                {/* Footer Menus - render from footer_menus array */}
                {footerContent?.footer_menus && footerContent.footer_menus.length > 0 && footerContent.footer_menus.map((menu: any, menuIndex: number) => (
                  <div key={menuIndex} style={{ flex: '1', minWidth: '150px', marginBottom: '20px', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: 'var(--foreground)', textAlign: locale === 'ar' ? 'right' : 'left', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                      {menu.title || 'Menu'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {menu.links && menu.links
                        .filter((link: any) => {
                          const label = link.label || (typeof link === 'string' ? link : '');
                          const labelLower = label.toLowerCase();
                          // Hide "Consumer Protection Principles and Rules" in both English and Arabic
                          return !labelLower.includes('consumer protection') && 
                                 !labelLower.includes('مبادئ وقواعد حماية المستهلك');
                        })
                        .map((link: any, linkIndex: number) => (
                          <a 
                            key={linkIndex} 
                            href={link.url || '#'} 
                            target={link.target || '_self'}
                            onClick={(e) => e.preventDefault()}
                            style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px', textAlign: locale === 'ar' ? 'right' : 'left', wordWrap: 'break-word', overflowWrap: 'break-word', lineHeight: '1.5', cursor: 'default', pointerEvents: 'none' }}
                          >
                            {link.label || (typeof link === 'string' ? link : 'Link')}
                          </a>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Copyright and Disclaimer */}
              <div style={{
                borderTop: '1px solid var(--color-border-light)',
                paddingTop: '20px',
                textAlign: 'center',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                direction: locale === 'ar' ? 'rtl' : 'ltr'
              }}>
                {footerContent?.copyright && (
                  <p style={{ margin: '0 0 10px 0', textAlign: 'center', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                    {footerContent.copyright}
                  </p>
                )}
                {footerContent?.disclaimer && (
                  <div 
                    style={{ 
                      margin: '0',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      lineHeight: '1.6',
                      textAlign: 'center'
                    }}
                    dangerouslySetInnerHTML={{ __html: footerContent.disclaimer }}
                  />
                )}
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Show message if no sections found */}
      {!headerContent && !footerContent && !loading && (
        <div style={{
          backgroundColor: 'var(--background)',
          borderRadius: '2px',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          No global sections found in the API response.
        </div>
      )}

      {/* Sticky Header Styles */}
      <style>
        {`
          /* Ensure header is sticky at all times; enhance when scrolled */
          .header-footer-settings__landing-header { 
            position: sticky; 
            top: 0; 
            z-index: 50; 
            background: transparent; 
            transition: background-color 200ms ease, box-shadow 200ms ease, transform 220ms ease, opacity 220ms ease; 
            will-change: background-color, box-shadow, transform, opacity; 
          }
          .header-footer-settings__landing-header.is-sticky {
            background: var(--background) !important;
            transition: background-color 200ms ease;
            box-shadow: 0 1px 8px rgba(0,0,0,0.08);
            animation: sticky-slide-down 220ms ease both;
          }
          .header-footer-settings__landing-header.is-sticky .header-footer-settings__landing-nav,
          .header-footer-settings__landing-header.is-sticky .header-footer-settings__landing-nav-link,
          .header-footer-settings__landing-header.is-sticky .header-footer-settings__landing-language {
            color: var(--foreground) !important;
          }
          @keyframes sticky-slide-down {
            0% { transform: translateY(-8px); opacity: 0.85; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default GlobalSections;
