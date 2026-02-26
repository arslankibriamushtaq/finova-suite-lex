import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Images } from '../Config/Images';
import { getGlobalSections } from '../../redux/apis/apisCrudWebPageManagement';

interface GlobalSection {
  id: number;
  key: string;
  name: string;
  translations: Array<{
    locale: string;
    content: any;
  }>;
}

interface GlobalFooterProps {
  locale?: string;
}

const GlobalFooter = ({ locale = 'en' }: GlobalFooterProps) => {
  const location = useLocation();
  const [footerContent, setFooterContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || '';

  // Hide footer if we're in WebPageManagement template preview
  if (location.pathname.toLowerCase().includes('/webpagemanagement')) {
    return null;
  }

  // Helper function to get content for a specific locale
  const getContentForLocale = (section: GlobalSection, locale: string) => {
    if (!section || !section.translations || section.translations.length === 0) {
      return null;
    }
    const translation = section.translations.find(t => t.locale === locale);
    return translation ? translation.content : (section.translations[0]?.content || null);
  };

  // Helper function to preserve locale in navigation URLs using query parameters
  const preserveLocaleInUrl = (url: string): string => {
    if (!url || url === '#' || url === '') return url;
    
    // Don't modify external URLs
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return url;
    }
    
    try {
      // Parse the URL to handle query parameters
      const urlObj = url.startsWith('/') 
        ? new URL(url, window.location.origin) 
        : new URL(`/${url}`, window.location.origin);
      
      // If locale is 'ar', add locale=ar query parameter
      if (locale === 'ar') {
        urlObj.searchParams.set('locale', 'ar');
      } else {
        // For non-arabic locale, remove locale parameter if present
        urlObj.searchParams.delete('locale');
      }
      
      // Return the pathname with query string (remove origin for relative URLs)
      const pathWithQuery = urlObj.pathname + (urlObj.search ? urlObj.search : '');
      return pathWithQuery;
    } catch (e) {
      // Fallback: if URL parsing fails, append query parameter manually
      if (locale === 'ar') {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}locale=ar`;
      }
      // Remove locale param if present
      return url.replace(/[?&]locale=ar(&|$)/, (_match, after) => after ? '?' : '').replace(/\?$/, '');
    }
  };

  // Helper to get full image URL
  const getFullImageUrl = (url: string) => {
    if (!url) return Images.FactoringLogo;
    if (url.startsWith('http')) return url;
    // Ensure path starts with / and base URL doesn't end with /
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    const normalizedBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${normalizedBaseUrl}${normalizedPath}`;
  };

  // Fetch global footer section
  const fetchFooterSection = async () => {
    try {
      setLoading(true);
      const response = await getGlobalSections();
      const result = response.data;
      
      
      if (result.success && result.data && result.data.data) {
        const sections = result.data.data;
        const footerSection = sections.find((s: GlobalSection) => s.key === 'footer');
        
        
        if (footerSection) {
          const footerData = getContentForLocale(footerSection, locale);
          setFooterContent(footerData);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching footer section:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  if (loading || !footerContent) {
    return null; // Or a loading skeleton
  }

  const isRTL = locale === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  // Helper function to render social icons
  const renderSocialIcon = (social: any, index: number) => {
            const socialUrl = typeof social === 'object' && social !== null ? social.url || '#' : '#';
            const socialIcon = typeof social === 'object' && social !== null ? social.icon || '' : '';
            const socialPlatform = typeof social === 'object' && social !== null ? social.platform || '' : '';
            const socialTitle = typeof social === 'string' ? social : (social?.platform || social?.icon || 'Social');
            // Social links are typically external, but preserve locale just in case
            const preservedSocialUrl = preserveLocaleInUrl(socialUrl);
            
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
              // Check if it contains a domain pattern
              (socialIcon.includes('.') && socialIcon.includes('/'))
            );
            
            // Map icon names to display characters
            const getSocialIcon = (icon: string, platform: string) => {
              const iconLower = icon?.toLowerCase() || '';
              const platformLower = platform?.toLowerCase() || '';
             
              if (iconLower.includes('facebook') || platformLower.includes('facebook')) return 'f';
              if (iconLower.includes('instagram') || platformLower.includes('instagram')) return '📷';
              if (iconLower.includes('youtube') || platformLower.includes('youtube')) return '▶';
              if (iconLower.includes('tiktok') || platformLower.includes('tiktok')) return '🎵';
              if (iconLower.includes('linkedin') || platformLower.includes('linkedin')) return 'in';
              if (iconLower.includes('snapchat') || platformLower.includes('snapchat')) return '👻';
              if (iconLower.includes('x') || platformLower.includes('twitter')) return 'X';
              return '🔗';
            };
            
            return (
              <a
                key={index}
                href={preservedSocialUrl}
        target={typeof social === 'object' && social !== null ? (social.target || '_blank') : '_blank'}
                title={socialTitle}
                style={{
          display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
          width: '32px',
          height: '32px',
                  textDecoration: 'none',
                  transition: 'transform 0.2s',
          fontSize: '20px',
          color: '#fff',
          ...(isRTL ? { marginLeft: '4px' } : { marginRight: '4px' })
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
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
                  getSocialIcon(socialIcon, socialPlatform)
                )}
              </a>
            );
  };

  return (
    <footer className="header-footer-settings__landing-footer" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="header-footer-settings__footer-content" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '40px', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        {/* Logo and Address Column */}
        <div className="header-footer-settings__footer-column" style={{ 
          flex: '1 1 200px', 
          minWidth: '200px',
          maxWidth: '300px',
          textAlign: textAlign
        }}>
          <div className="header-footer-settings__footer-logo">
            <img 
              src={Images.awnLogoWhite} 
              alt="Company Logo" 
              style={{alignItems: 'center', maxWidth: '120px', maxHeight: '60px', objectFit: 'contain', filter: 'invert(1)' }}
            />
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', textAlign: textAlign }}>
            • A W N •
          </div>
          <p className="header-footer-settings__footer-address" style={{ 
            wordWrap: 'break-word', 
            overflowWrap: 'break-word',
            lineHeight: '1.6',
            textAlign: textAlign
          }}>
            {footerContent?.address /* || 'Al Urubah 2815, Al Maathar North District, Riyadh 12314, KSA' */}
          </p>
        </div>
        
        {/* Contact Us Column with Social Links */}
        <div className="header-footer-settings__footer-column" style={{ 
          flex: '1 1 200px', 
          minWidth: '200px',
          maxWidth: '300px',
          textAlign: textAlign
        }}>
          <h3 style={{ marginBottom: '15px', textAlign: textAlign }}>
            {footerContent?.contact_title || (locale === 'ar' ? 'اتصل بنا' : 'Contact us')}
          </h3>
          {/* Render all contact fields dynamically */}
          {footerContent?.contact && Object.keys(footerContent.contact)
            .filter(key => key !== 'title') // Exclude title if present
            .map((fieldKey) => {
              const fieldValue = footerContent.contact[fieldKey];
              // Only render if field has a value
              if (!fieldValue) return null;
              
              return (
                <p 
                  key={fieldKey}
                  style={{ 
                    wordWrap: 'break-word', 
                    overflowWrap: 'break-word',
                    marginBottom: '8px',
                    textAlign: textAlign
                  }}
                >
                  {fieldValue}
                </p>
              );
            })}
          
          {/* Social Links under Contact Us */}
          {footerContent?.social_links && footerContent.social_links.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'nowrap', 
              gap: '2px', 
              marginTop: '15px',
              alignItems: 'center',
              justifyContent: isRTL ? 'flex-end' : 'flex-start'
            }}>
              {footerContent.social_links.map((social: any, index: number) => 
                renderSocialIcon(social, index)
              )}
        </div>
      )}
        </div>
        
        {/* Dynamic Footer Menus */}
        {footerContent?.footer_menus?.map((menu: any, menuIndex: number) => (
          <div key={menuIndex} className="header-footer-settings__footer-column" style={{ 
            flex: '1 1 180px', 
            minWidth: '180px',
            maxWidth: '250px',
            textAlign: textAlign
          }}>
            <h3 style={{ marginBottom: '15px', textAlign: textAlign }}>
              {menu.title || (menuIndex === 0 ? 'Company' : 'Help & Support')}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {menu.links?.filter((link: any) => {
                const label = typeof link === 'string' ? link : (link?.label || '');
                return !label.toLowerCase().includes('consumer protection');
              }).map((link: any, linkIndex: number) => {
                const linkUrl = link.url || '#';
                const preservedLinkUrl = preserveLocaleInUrl(linkUrl);
                
                return (
                  <li key={linkIndex} style={{ marginBottom: '10px' }}>
                    <a 
                      href={preservedLinkUrl} 
                      target={link.target || '_self'}
                      style={{ 
                        wordWrap: 'break-word', 
                        overflowWrap: 'break-word',
                        display: 'inline-block',
                        lineHeight: '1.5',
                        textAlign: textAlign
                      }}
                    >
                      {link.label || (typeof link === 'string' ? link : 'Link')}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        
        {/* Fallback Menus if no data */}
        {(!footerContent?.footer_menus || footerContent.footer_menus.length === 0) && (
          <>
            <div className="header-footer-settings__footer-column" style={{ 
              flex: '1 1 180px', 
              minWidth: '180px',
              maxWidth: '250px',
              textAlign: textAlign
            }}>
              <h3 style={{ marginBottom: '15px', textAlign: textAlign }}>Company</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ textAlign: textAlign }}>About Us</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ textAlign: textAlign }}>Careers</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ textAlign: textAlign }}>Contact</a></li>
              </ul>
            </div>
            <div className="header-footer-settings__footer-column" style={{ 
              flex: '1 1 180px', 
              minWidth: '180px',
              maxWidth: '250px',
              textAlign: textAlign
            }}>
              <h3 style={{ marginBottom: '15px', textAlign: textAlign }}>Help & Support</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ textAlign: textAlign }}>Help Center</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ textAlign: textAlign }}>FAQ</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ textAlign: textAlign }}>Support</a></li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Copyright */}
      <div className="header-footer-settings__footer-bottom" style={{ 
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        <p style={{ 
          wordWrap: 'break-word', 
          overflowWrap: 'break-word',
          textAlign: 'center'
        }}>
          {footerContent?.copyright || '© 2024 Factoring Valley. All rights reserved.'}
        </p>
        {footerContent?.disclaimer && (
          <div 
            style={{ 
              fontSize: '12px', 
              color: '#999', 
              marginTop: '10px',
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
  );
};

export default GlobalFooter;

