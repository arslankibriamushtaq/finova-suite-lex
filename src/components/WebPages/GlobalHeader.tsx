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

interface GlobalHeaderProps {
  locale?: string;
  onLocaleChange?: (newLocale: string) => void;
}

const GlobalHeader = ({ locale = 'en', onLocaleChange }: GlobalHeaderProps) => {
  const location = useLocation();
  const [headerContent, setHeaderContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Hide header if we're in WebPageManagement template preview
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

  // Fetch global header section
  const fetchHeaderSection = async () => {
    try {
      setLoading(true);
      const response = await getGlobalSections();
      const result = response.data;
      
      if (result.success && result.data && result.data.data) {
        const sections = result.data.data;
        const headerSection = sections.find((s: GlobalSection) => s.key === 'header');
        
        if (headerSection) {
          const headerData = getContentForLocale(headerSection, locale);
          setHeaderContent(headerData);
        }
      }
    } catch (err) {
      console.error('Error fetching header section:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeaderSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Handle scroll for sticky header
  useEffect(() => {
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
	}, []);


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

  // Helper function to get full image URL
  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || '';
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    const normalizedBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${normalizedBaseUrl}${normalizedPath}`;
  };

  const handleLanguageToggle = () => {
    // Find the alternative language (the one that's not currently selected)
    const alternativeLang = headerContent?.language_options?.find((lang: any) => lang.code !== locale);
    
    if (alternativeLang && onLocaleChange) {
      onLocaleChange(alternativeLang.code);
    } else {
      // Fallback: toggle between 'en' and 'ar'
      const newLocale = locale === 'en' ? 'ar' : 'en';
      if (onLocaleChange) {
        onLocaleChange(newLocale);
      }
    }
  };

  if (loading || !headerContent) {
    return null; // Or a loading skeleton
  }

  return (
    <header
      className={`header-footer-settings__landing-header ${isScrolled ? 'is-sticky scrolled' : ''}`}
      data-scrolled={isScrolled ? 'true' : 'false'}
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 50,
        backgroundColor: isScrolled ? '#ffffff' : 'transparent',
        transition: 'background-color 200ms ease',
        boxShadow: isScrolled ? '0 1px 8px rgba(0,0,0,0.08)' : 'none'
      }}
    >
      <div className="header-footer-settings__landing-header-content">
        <div className="header-footer-settings__landing-logo">
          <a href={preserveLocaleInUrl(headerContent?.logoLink || '/')}>
            <img
              src={Images.awnLogoWhite}
              alt={headerContent?.logoAlt || 'Factoring Valley Logo'}
              style={{ height: '40px', filter: isScrolled ? 'invert(0)' : 'none' }}
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
                const preservedUrl = preserveLocaleInUrl(url);
                
                return (
                  <a 
                    key={idx} 
                    href={preservedUrl} 
                    target={target}
                    className="header-footer-settings__landing-nav-link" 
                    style={{ color: isScrolled ? '#000' : '#fff' }}
                  >
                    {label}
                  </a>
                );
              })
          ) : (
            {/* <>
              <a href="/about" className="header-footer-settings__landing-nav-link" style={{ color: isScrolled ? '#000' : '#fff' }}>
                About Us
              </a>
              <a href="/contact" className="header-footer-settings__landing-nav-link" style={{ color: isScrolled ? '#000' : '#fff' }}>
                Contact
              </a>
            </> */}
          )}
          
          {/* Language Options - Display only the alternative (non-selected) language */}
          {headerContent?.language_options && headerContent.language_options.length > 0 && (() => {
            // Find the alternative language (the one that's not currently selected)
            const alternativeLang = headerContent.language_options.find((lang: any) => lang.code !== locale);
            
            if (!alternativeLang) return null;
            
            const flagValue = alternativeLang.flag;
            const flagUrl = typeof flagValue === 'string' ? flagValue : (flagValue?.url || flagValue);
            // Check if it's an image URL (not an icon class name)
            const isImageUrl = typeof flagUrl === 'string' && (flagUrl.startsWith('http') || flagUrl.startsWith('/'));
            
            return (
              <div 
                className="header-footer-settings__landing-language" 
                style={{ color: isScrolled ? '#000' : '#fff', cursor: 'pointer' }}
                onClick={handleLanguageToggle}
                >
                <span>{alternativeLang.name || alternativeLang.code || 'Language'}</span>
                {flagUrl && isImageUrl && (
                  <img 
                  src={getFullImageUrl(flagUrl)} 
                  alt={alternativeLang.name || alternativeLang.code || 'Flag'} 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    objectFit: 'contain',
                    marginLeft: '10px'
                  }} 
                  />
                )}
              </div>
            );
          })()}
        </nav>
      </div>
      
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
            background: #ffffff !important;
            transition: background-color 200ms ease;
            box-shadow: 0 1px 8px rgba(0,0,0,0.08);
            animation: sticky-slide-down 220ms ease both;
          }
          .header-footer-settings__landing-header.is-sticky .header-footer-settings__landing-nav,
          .header-footer-settings__landing-header.is-sticky .header-footer-settings__landing-nav-link,
          .header-footer-settings__landing-header.is-sticky .header-footer-settings__landing-language {
            color: #000000 !important;
          }
          @keyframes sticky-slide-down {
            0% { transform: translateY(-8px); opacity: 0.85; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </header>
  );
};

export default GlobalHeader;

