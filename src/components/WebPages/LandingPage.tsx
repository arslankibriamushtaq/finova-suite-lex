import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Images } from '../Config/Images';
// URL for external RTL stylesheet
const rtlCssUrl = new URL('../../styles/arabic-rtl.css', import.meta.url).href;
import { getPageData, getFinanceCalculation } from '../../redux/apis/apisCrudWebPageManagement';
import Loader from '../Loader/Loader';
// Removed AOS; using lightweight custom scroll animations

import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';

// Types for API response
// interface CMSSection {
//   id: number;
//   key: string;
//   name: string;
//   translations: Array<{
//     locale: string;
//     content: string;
//     is_published: boolean;
//   }>;
// }

interface LandingPageData {
  hero: {
    heading: string;
    subheading: string;
    features: string[];
    download_app_button: Array<{ label: string; url: string; icon: string }>;
    hero_image: { url: string; alt: string };
    finance_card: {
      title: string;
      amount: string;
      subheading: string;
      description: string;
      installment_title: string;
      installment_value: string;
      installment_due_date_title: string;
      installment_due_date: string;
    };
    finance_card_list: Array<{ icon: string; title: string }>;
  };
  calculator: {
    heading: string;
    description: string;
    options: number[];
    amount_text: string;
    tenure_text: string;
    payable_text: string;
    payable_value: string;
    payable_installment_text: string;
    finance_button: Array<{ label: string; url: string }>;
  };
  tracker: {
    heading: string;
    description: string;
    image: { url: string; alt: string };
  };
  eligibility: {
    heading: string;
    criteria: Array<{ icon: string; title: string }>;
    description: string;
  };
  apply_steps: {
    heading: string;
    steps: string[];
    image: { url: string; alt: string };
    download_app_button: Array<{ label: string; url: string; icon: string }>;
  };
  header?: {
    logo?: string;
    logoLink?: string;
    logoAlt?: string;
    navigationLinks?: Array<{ label: string; url: string; target?: string }>;
  };
  footer: {
    logo?: string;
    contact: {
      phone: string;
      email: string;
      address: string;
    };
    copyright?: string;
    disclaimer?: string;
    footer_menus?: Array<{
      title: string;
      links: Array<{ label: string; url: string; target?: string }>;
    }>;
    social_links?: Array<{ url: string; icon: string; platform?: string; target?: string }>;
  };
}

const LandingPage = () => {
  const { t } = useTranslation('webPages');
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
	const [sliderMin, setSliderMin] = useState<number>(1000);
	const [sliderMax, setSliderMax] = useState<number>(2000);
	const [sliderStep, setSliderStep] = useState<number>(1);
	const [maxTenure, setMaxTenure] = useState<number>(3);
	const [totalPayable, setTotalPayable] = useState<number>(0);
	const [isCalculating, setIsCalculating] = useState<boolean>(false);
	const sliderRef = useRef<HTMLInputElement | null>(null);
	const sliderWrapperRef = useRef<HTMLDivElement | null>(null);
	const [isDraggingSlider, setIsDraggingSlider] = useState(false);
	const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
	const handleSliderChange = (value: number) => {
		if (Number.isNaN(value)) return;
		const clamped = Math.max(sliderMin, Math.min(sliderMax, value));
		// Round to nearest step
		const rounded = Math.round(clamped / sliderStep) * sliderStep;
		setSelectedAmount(rounded);
		
		// Debounce API call for calculation
		if (calculationTimeoutRef.current) {
			clearTimeout(calculationTimeoutRef.current);
		}
		
		calculationTimeoutRef.current = setTimeout(() => {
			fetchCalculation(rounded);
		}, 300); // 300ms debounce
	};
	
	// Fetch finance calculation options on mount
	const fetchFinanceOptions = async () => {
		try {
			const response = await getFinanceCalculation(1);
			const data = response.data?.data;
			
			if (data) {
				const minAmount = data.min_amount || 1000;
				const maxAmount = data.max_amount || 2000;
				const numberOfSteps = data.step || 10; // This is the number of steps, not step size
				
				// Calculate step size: (max_amount - min_amount) / number_of_steps
				const calculatedStepSize = (maxAmount - minAmount) / numberOfSteps;
				
				setSliderMin(minAmount);
				setSliderMax(maxAmount);
				setSliderStep(calculatedStepSize);
				setMaxTenure(data.max_tenure || 3);
				
				// Set initial amount to suggested amount or min
				const initialAmount = data.suggested_amount || minAmount;
				setSelectedAmount(initialAmount);
				
				// Fetch initial calculation
				await fetchCalculation(initialAmount);
			}
		} catch (error) {
			console.error('Error fetching finance options:', error);
			// Keep default values on error
		}
	};
	
	// Fetch calculation for a specific amount
	const fetchCalculation = async (amount: number) => {
		try {
			setIsCalculating(true);
			const response = await getFinanceCalculation(1);
			const data = response.data?.data;
			
			if (data) {
				// Set total payable amount
				setTotalPayable(amount);
			}
		} catch (error) {
			console.error('Error fetching calculation:', error);
		} finally {
			setIsCalculating(false);
		}
	};

	const setValueFromClientX = (clientX: number) => {
		const rect = (sliderWrapperRef.current || sliderRef.current)?.getBoundingClientRect();
		if (!rect) return;
		const x = Math.max(rect.left, Math.min(clientX, rect.right));
		// For RTL (Arabic), reverse the percentage calculation
		const isRTL = locale === 'ar' || document.documentElement.getAttribute('dir') === 'rtl';
		const pct = isRTL 
			? (rect.right - x) / rect.width  // Reverse for RTL
			: (x - rect.left) / rect.width;  // Normal for LTR
		const raw = sliderMin + pct * (sliderMax - sliderMin);
		handleSliderChange(raw);
	};

	const onTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDraggingSlider(true);
		setValueFromClientX(e.clientX);
	};

	const onTrackTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDraggingSlider(true);
		const touch = e.changedTouches[0];
		if (touch) setValueFromClientX(touch.clientX);
	};

	useEffect(() => {
		if (!isDraggingSlider) return;
		const onMove = (e: MouseEvent) => setValueFromClientX(e.clientX);
		const onUp = () => setIsDraggingSlider(false);
		const onTouchMove = (e: TouchEvent) => {
			const t = e.changedTouches[0];
			if (t) setValueFromClientX(t.clientX);
		};
		const onTouchEnd = () => setIsDraggingSlider(false);
		window.addEventListener('mousemove', onMove, { passive: true });
		window.addEventListener('mouseup', onUp, { passive: true });
		window.addEventListener('touchmove', onTouchMove, { passive: true });
		window.addEventListener('touchend', onTouchEnd, { passive: true });
		return () => {
			window.removeEventListener('mousemove', onMove as any);
			window.removeEventListener('mouseup', onUp as any);
			window.removeEventListener('touchmove', onTouchMove as any);
			window.removeEventListener('touchend', onTouchEnd as any);
		};
	}, [isDraggingSlider]);

  // API Configuration
  const PAGE_SLUG = 'home';

  // Fallback data for when API is not available (matches API structure exactly)
  // const FALLBACK_DATA: LandingPageData = {
  //   hero: {
  //     heading: "Unlock financial possibilities with our hassle-free finance app today.",
  //     subheading: "Elevate Your Financial Aspirations Swiftly and Securely with Factoring Valley.",
  //     cta_buttons: [
  //       { label: "App Store", url: "#" },
  //       { label: "Google Play", url: "#" }
  //     ],
  //     features: ["Instant Approval", "No Hidden Charges", "Hassle Free"],
  //     hero_image: {
  //       url: "https://yourcdn.com/uploads/hero.jpg",
  //       alt: "Hero Image"
  //     },
  //     finance_card: {
  //       amount: "2000.00 SAR",
  //       due_date: "21 Nov 2025",
  //       monthly_installment: "745.33 SAR"
  //     }
  //   },
  //   calculator: {
  //     heading: "Calculate your Finance",
  //     description: "Utilize our finance calculator to effortlessly estimate loan payments.",
  //     options: [1000, 1500, 2000],
  //     result_text: "Monthly payable 410 SAR (3 Equal Installments)"
  //   },
  //   tracker: {
  //     heading: "Track Your Finances and Applications",
  //     description: "Manage your finances effortlessly with tools to track transactions, stay on top of repayments, and monitor your loan applications in real time.",
  //     image: {
  //       url: "https://yourcdn.com/uploads/tracker.jpg",
  //       alt: "App Screens"
  //     }
  //   },
  //   eligibility: {
  //     heading: "Eligibility Criteria",
  //     criteria: [
  //       "The minimum of Salary SAR 4,000",
  //       "The service period is more than 6 months",
  //       "National ID or Iqama",
  //       "Age between 18 - 60"
  //     ]
  //   },
  //   apply_steps: {
  //     heading: "How to Apply?",
  //     steps: [
  //       "Fill out the required information.",
  //       "Select the required financing amount.",
  //       "The financing amount will be deposited into your account once approved."
  //     ]
  //   },
  //   footer: {
  //     contact: {
  //       phone: "800 100 322",
  //       email: "info@factoringvalley-sa.com",
  //       address: "Al Urubah 2815, Al Maathar North District, Riyadh 12314, KSA"
  //     },
  //     company_links: ["About Us", "Consumer Protection", "Financial Statements"],
  //     help_links: ["FAQ's", "Terms & Conditions", "Privacy Policy"],
  //     social_links: ["facebook", "instagram", "youtube", "tiktok"]
  //   }
  // };

  // Fetch page data from API
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
<style>
      {`
      /* Ensure header is sticky at all times; enhance when scrolled */
      .header-footer-settings__landing-header { position: sticky; top: 0; z-index: 50; background: transparent; transition: background-color 200ms ease, box-shadow 200ms ease, transform 220ms ease, opacity 220ms ease; will-change: background-color, box-shadow, transform, opacity; }
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
 
      /* Remove red underline pseudo-element under calculator option number (without changing existing CSS files) */
      .header-footer-settings__landing-calculator .header-footer-settings__landing-calculator-option.active::after {
        content: none !important;
        display: none !important;
        border: 0 !important;
        background: transparent !important;
      }
 
      /* Custom lightweight scroll animations (AOS-like) */
      [data-animate] { opacity: 0; transform: translateZ(0); will-change: opacity, transform; transition: opacity 600ms ease, transform 600ms ease; }
      [data-animate="fade-up"] { transform: translate3d(0, 24px, 0); }
      [data-animate="fade-left"] { transform: translate3d(24px, 0, 0); }
      [data-animate="fade-right"] { transform: translate3d(-24px, 0, 0); }
      [data-animate].in-view { opacity: 1; transform: none; }
 
      /* Mobile: hide desktop nav entirely */
      @media (max-width: 767px) {
        .header-footer-settings__landing-nav { display: none !important; }
      }
 
      /* Mobile dropdown open animation */
      .mobile-dropdown { animation: dropdown-enter 180ms ease-out both; transform-origin: top; }
      @keyframes dropdown-enter { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
 
 
      `}
    </style>
  const fetchPageData = async (currentLocale: string = locale) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPageData(PAGE_SLUG, currentLocale);
      const result = response.data;
      
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        const globalSections = result.data.global_sections || [];
        
        const heroSection = getSectionContent(sections.find((s: any) => s.id === 1)) || {};
        
        // Map old API structure to new schema structure
        const financeCard = heroSection.finance_card || {};
        const mappedFinanceCard = {
          title: financeCard.title || 'Financed Amount',
          amount: financeCard.amount || 'N/A',
          subheading: financeCard.subheading || 'Monthly Installment',
          description: financeCard.description || 'Has been financed and sent to your bank account— enjoy your funds',
          installment_title: financeCard.installment_title || 'Next Installment',
          installment_value: financeCard.monthly_installment || financeCard.installment_value || 'N/A',
          installment_due_date_title: financeCard.installment_due_date_title || 'Due on',
          installment_due_date: financeCard.due_date || financeCard.installment_due_date || 'N/A'
        };
        const headerSection = globalSections.find((s: any) => s.key === 'header');
        const headerContent = headerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};
       
        // Extract footer from global sections
        const footerSection = globalSections.find((s: any) => s.key === 'footer');
        const footerContent = footerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};

        const parsedData: LandingPageData = {
          hero: {
            heading: heroSection.heading || 'Unlock financial possibilities with our hassle-free finance app today.',
            subheading: heroSection.subheading || 'Elevate Your Financial Aspirations Swiftly and Securely with Factoring Valley.',
            features: heroSection.features || ['Instant Approval', 'No Hidden Charges', 'Hassle Free'],
            download_app_button: (() => {
              const buttons = heroSection.download_app_button || 
                             (heroSection.cta_buttons ? heroSection.cta_buttons.map((btn: any) => ({
                               label: btn.label || 'N/A',
                               url: btn.url || 'N/A',
                               icon: 'icon-app-store' // Default icon
                             })) : [{ label: 'N/A', url: 'N/A', icon: 'N/A' }]);
              
              // Ensure all items in the array are objects, not strings
              return buttons.map((btn: any, index: number) => {
                if (typeof btn === 'string') {
                  return {
                    label: btn,
                    url: '#',
                    icon: 'icon-app-store'
                  };
                }
                return btn;
              });
            })(),
            hero_image: heroSection.hero_image || { url: 'N/A', alt: 'N/A' },
            finance_card: mappedFinanceCard,
            finance_card_list: (() => {
              const list = heroSection.finance_card_list || [{ icon: 'N/A', title: 'N/A' }];
              // Remove duplicates based on icon and title combination
              // Normalize values for comparison
              const seen = new Set<string>();
              return list.filter((item: any) => {
                // Handle both string and object formats for title
                const titleValue = typeof item.title === 'string' 
                  ? item.title 
                  : (item.title?.title || item.title?.text || item.title || '');
                const iconValue = item.icon || '';
                // Create a normalized key (trim and lowercase for better matching)
                const key = `${String(iconValue).trim().toLowerCase()}_${String(titleValue).trim().toLowerCase()}`;
                if (seen.has(key)) {
                  return false;
                }
                seen.add(key);
                return true;
              });
            })()
          },
          calculator: (() => {
            const calculatorSection = getSectionContent(sections.find((s: any) => s.id === 2)) || {};
            return {
              heading: calculatorSection.heading || 'Calculate your Finance',
              description: calculatorSection.description || 'Utilize our finance calculator to effortlessly estimate loan payments.',
              options: calculatorSection.options || [1000, 1500, 2000],
              amount_text: calculatorSection.amount_text || 'Amount (SAR)',
              tenure_text: calculatorSection.tenure_text || 'Tenure: 3 months',
              payable_text: calculatorSection.payable_text || 'Total Payable Amount',
              payable_value: calculatorSection.payable_value || 'N/A',
              payable_installment_text: calculatorSection.payable_installment_text || 'Monthly Payable: 333.33 SAR',
              finance_button: calculatorSection.finance_button || [{ label: 'Apply Now', url: '#' }]
            };
          })(),
          tracker: getSectionContent(sections.find((s: any) => s.id === 3)) || {
            heading: 'Track Your Finances and Applications',
            description: 'Manage your finances effortlessly with tools to track transactions, stay on top of repayments, and monitor your loan applications in real time.',
            image: { url: 'N/A', alt: 'N/A' }
          },
          eligibility: (() => {
            const eligibilitySection = getSectionContent(sections.find((s: any) => s.id === 4)) || {};
            return {
              heading: eligibilitySection.heading || 'Eligibility Criteria',
              criteria: eligibilitySection.criteria || [{ icon: 'N/A', title: 'N/A' }],
              description: eligibilitySection.description || 'To be eligible for a finance, you must meet the following criteria:'
            };
          })(),
          apply_steps: (() => {
            const applyStepsSection = getSectionContent(sections.find((s: any) => s.id === 5)) || {};
            return {
              heading: applyStepsSection.heading || 'How to Apply?',
              steps: applyStepsSection.steps || [
                'Fill out the required information.',
                'Select the required financing amount.',
                'The financing amount will be deposited into your account once approved.'
              ],
              image: applyStepsSection.image || { url: 'N/A', alt: 'N/A' },
              download_app_button: applyStepsSection.download_app_button || [{ label: 'N/A', url: 'N/A', icon: 'N/A' }]
            };
          })(),
          footer: {
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
          }
        };
 
        // Store header data for rendering
        (parsedData as any).header = {
          logo: headerContent?.logo?.url || Images.awnLogoWhite,
          logoLink: headerContent?.logo?.link || '/',
          logoAlt: headerContent?.logo?.alt || 'Factoring Valley Logo',
          navigationLinks: headerContent?.main_menu || []
        };
      

        setPageData(parsedData);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('Error fetching page data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to preserve locale in navigation URLs using query parameters
  const preserveLocaleInUrl = (url: string): string => {
    if (!url || url === '#' || url === '') return url;
    
    // Don't modify external URLs or anchor links
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') || url.startsWith('#')) {
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

  useEffect(() => {
    fetchPageData(locale);
    fetchFinanceOptions();
  }, [locale]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, []);

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
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-animate]')) as HTMLElement[];
    if (elements.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        const once = (target.dataset.animateOnce || 'true') === 'true';
        if (entry.isIntersecting) {
          if (!target.classList.contains('in-view')) {
            const delay = parseInt(target.dataset.animateDelay || '0', 10) || 0;
            if (delay > 0) {
              setTimeout(() => target.classList.add('in-view'), delay);
            } else {
              target.classList.add('in-view');
            }
          }
          if (once) io.unobserve(target);
        } else if (!once) {
          target.classList.remove('in-view');
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
   
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pageData]);
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
    <div className="header-footer-settings__landing-template w-full page-landing">
      {/* Global Header */}
      <GlobalHeader locale={locale} onLocaleChange={setLocale} />

		{/* Minimal scoped styles for sticky nav behavior, animations, and calculator */}
		<style>
			{`
			/* Ensure header is sticky at all times; enhance when scrolled */
			.header-footer-settings__landing-header { position: sticky; top: 0; z-index: 50; background: transparent; transition: background-color 200ms ease, box-shadow 200ms ease, transform 220ms ease, opacity 220ms ease; will-change: background-color, box-shadow, transform, opacity; }
			.header-footer-settings__landing-header.is-sticky { background: #ffffff !important; transition: background-color 200ms ease; box-shadow: 0 1px 8px rgba(0,0,0,0.08); animation: sticky-slide-down 220ms ease both; }
			.header-footer-settings__landing-header.is-sticky .header-footer-settings__landing-nav,
			.header-footer-settings__landing-header.is-sticky .header-footer-settings__landing-nav-link,
			.header-footer-settings__landing-header.is-sticky .header-footer-settings__landing-language { color: #000000 !important; }
			@keyframes sticky-slide-down { 0% { transform: translateY(-8px); opacity: 0.85; } 100% { transform: translateY(0); opacity: 1; } }

			/* Remove red underline pseudo-element under calculator option number (without changing existing CSS files) */
			.header-footer-settings__landing-calculator .header-footer-settings__landing-calculator-option.active::after { content: none !important; display: none !important; border: 0 !important; background: transparent !important; }

			/* Custom lightweight scroll animations (AOS-like) */
			[data-animate] { opacity: 0; transform: translateZ(0); will-change: opacity, transform; transition: opacity 600ms ease, transform 600ms ease; }
			[data-animate="fade-up"] { transform: translate3d(0, 24px, 0); }
			[data-animate="fade-left"] { transform: translate3d(24px, 0, 0); }
			[data-animate="fade-right"] { transform: translate3d(-24px, 0, 0); }
			[data-animate].in-view { opacity: 1; transform: none; }

			/* Mobile: hide desktop nav entirely */
			@media (max-width: 767px) { .header-footer-settings__landing-nav { display: none !important; } }

			/* Mobile dropdown open animation */
			.mobile-dropdown { animation: dropdown-enter 180ms ease-out both; transform-origin: top; }
			@keyframes dropdown-enter { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

			/* Hamburger button visibility and style */
			@media (min-width: 768px) { .landing-mobile-menu-btn { display: none !important; } }
			@media (max-width: 767px) { .landing-mobile-menu-btn { display: inline-flex; position: fixed; top: 14px; right: 14px; z-index: 60; background: rgba(255,255,255,0.95); border: 1px solid #eaeaea; border-radius: 8px; padding: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); } }


			`}
		</style>

      {/* Mobile hamburger toggle (independent of GlobalHeader) */}
      <button
        className="landing-mobile-menu-btn"
        aria-label="Open main menu"
        aria-controls="mobile-menu"
        aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
        onClick={() => setIsMobileMenuOpen((v) => !v)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '22px', height: '22px' }}>
          {isMobileMenuOpen ? (
            <path fillRule="evenodd" d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zm0 5.25c0-.414.336-.75.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75z" clipRule="evenodd" />
          )}
        </svg>
      </button>

      {/* Mobile dropdown menu content */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="mobile-dropdown" style={{ position: 'fixed', top: 58, left: 0, right: 0, zIndex: 59, background: '#fff', borderTop: '1px solid #eee', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(((pageData as any).header?.navigationLinks || []).length > 0)
              ? (pageData as any).header.navigationLinks.map((item: any, idx: number) => {
                  const preservedUrl = preserveLocaleInUrl(item.url || '#');
                  return (
                    <a key={idx} href={preservedUrl} target={item.target || '_self'} onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#111', textDecoration: 'none', padding: '10px 6px', borderRadius: 2, background: 'rgba(17,24,39,0.03)' }}>{item.label}</a>
                  );
                })
              : (
                <>
                  <a href="#about" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#111', textDecoration: 'none', padding: '10px 6px', borderRadius: 2, background: 'rgba(17,24,39,0.03)' }}>About</a>
                  <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#111', textDecoration: 'none', padding: '10px 6px', borderRadius: 2, background: 'rgba(17,24,39,0.03)' }}>Contact</a>
                </>
              )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="header-footer-settings__landing-hero bg-no-repeat bg-cover bg-center"   data-animate="fade-up"
 style={{
        backgroundImage: `url(${pageData.hero.hero_image?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})`
      }}>
        <div className="header-footer-settings__landing-hero-overlay">
          <div className="header-footer-settings__landing-hero-content container mx-auto px-4" data-animate="fade-up"
    data-aos-delay="100">
           <>
            <>
             <div className="header-footer-settings__landing-hero-left">
              <h1 className="header-footer-settings__landing-hero-title" data-animate="fade-right">
                {pageData.hero.heading || 'Unlock financial possibilities with our hassle-free finance app today.'}
              </h1>
              <div data-animate="fade-left" className="header-footer-settings__landing-hero-subtitle" dangerouslySetInnerHTML={{ __html: pageData.hero.subheading || 'Elevate Your Financial Aspirations Swiftly and Securely with Factoring Valley.' }} />

              {/* CTA Buttons */}
              <div className="header-footer-settings__landing-hero-buttons" data-animate="fade-left">
                {pageData.hero.download_app_button?.map((button, index) => (
                  <button 
                    key={index} 
                    className="theme-btn-next" 
                    data-animate="fade-left" 
                    style={{ 
                      padding: 0,
                      overflow: 'hidden',
                      position: 'relative',
                      width: '168px',
                      height: '56px',
                      maxWidth: '168px',
                      maxHeight: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {button.icon && (button.icon.startsWith('http') || button.icon.startsWith('/')) ? (
                      <img 
                        src={button.icon} 
                        alt="Button Icon" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                      />
                    ) : button.icon ? (
                      <img 
                        src={button.icon === 'icon-app-store' ? Images.FactoringLogo : 
                              button.icon === 'icon-google-play' ? Images.FactoringLogo : 
                              Images.FactoringLogo} 
                        alt="Button Icon" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span style={{ padding: '10px 20px' }}>{button.label}</span>
                    )}
                  </button>
                )) || (
                  <>
                    <button className="theme-btn-next">App Store</button>
                    <button className="theme-btn-next">Google Play</button>
                  </>
                )}
              </div>
             </div>
            </>

            {/* Finance Cards Container */}
            <>
             <div className="header-footer-settings__finance-cards-container" data-animate="fade-left">
              {/* Main Finance Card */}
              <div className="header-footer-settings__finance-card">
                <h3 className="header-footer-settings__finance-card-title">
                  {pageData.hero.finance_card?.title || 'Financed Amount'}
                </h3>
                <div className="header-footer-settings__finance-card-amount">
                  {pageData.hero.finance_card?.amount || '2000 SAR'}
                </div>
                <p className="header-footer-settings__finance-card-total">
                  {pageData.hero.finance_card?.subheading || 'Total Payable Amount: 2000.00 SAR'}
                </p>
                <div className="header-footer-settings__finance-card-status" dangerouslySetInnerHTML={{ __html: pageData.hero.finance_card?.description || 'Has been financed and sent to your bank account— enjoy your funds' }} />
                               <div className="header-footer-settings__finance-card-divider" />

                <div className="header-footer-settings__finance-card-details">
                  <div className="header-footer-settings__finance-card-detail">
                    <div className="header-footer-settings__finance-card-detail-label">
                      {pageData.hero.finance_card?.installment_title || 'Next Installment'}
                    </div>
                    <div className="header-footer-settings__finance-card-detail-value">
                      {pageData.hero.finance_card?.installment_value || '666.66 SAR'}
                    </div>
                  </div>
                  <div className="header-footer-settings__finance-card-detail">
                    <div className="header-footer-settings__finance-card-detail-label">
                      {pageData.hero.finance_card?.installment_due_date_title || 'Due on'}
                    </div>
                    <div className="header-footer-settings__finance-card-detail-value">
                      {pageData.hero.finance_card?.installment_due_date || '23, Nov 2025'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Finance Card List */}
              {pageData.hero.finance_card_list?.map((item, index) => (
                <div key={index} className="header-footer-settings__personal-finance-card" data-animate="fade-up">
                  <div className="header-footer-settings__personal-finance-icon">
                    <img 
                      src={item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? item.icon :
                            item.icon === 'icon-finance-card-2' ? Images.FactoringLogo : 
                            item.icon === 'icon-finance-card-1' ? Images.FactoringLogo : 
                            item.icon || Images.FactoringLogo} 
                      alt="Finance Icon" 
                      style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    />
                  </div>
                  <span className="header-footer-settings__personal-finance-text">
                    {typeof item.title === 'string' ? item.title : (typeof item.title === 'object' && item.title !== null ? (item.title as any)?.title || (item.title as any)?.text || JSON.stringify(item.title) : '')}
                  </span>
                </div>
              )) || (
                <div className="header-footer-settings__personal-finance-card">
                  <div className="header-footer-settings__personal-finance-icon">💰</div>
                  <span className="header-footer-settings__personal-finance-text">Personal Finance</span>
                </div>
              )}
             </div>
            </>
           </>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <div className="header-footer-settings__features-banner">
        {pageData.hero.features?.map((feature, index) => (
          <span key={index} className="header-footer-settings__features-banner-item">
            {typeof feature === 'string' ? feature : (typeof feature === 'object' && feature !== null ? (feature as any)?.title || (feature as any)?.text || JSON.stringify(feature) : '')}
          </span>
        )) || (
          <>
            <span className="header-footer-settings__features-banner-item">Instant Approval</span>
            <span className="header-footer-settings__features-banner-item">No Hidden Charges</span>
            <span className="header-footer-settings__features-banner-item">Hassle Free</span>
          </>
        )}
      </div>

      {/* Finance Calculator Section */}
      <section className="header-footer-settings__landing-calculator">
        <div className="header-footer-settings__landing-calculator-content container mx-auto px-4">
          <h2 className="header-footer-settings__landing-calculator-title" data-animate="fade-left">
            {pageData.calculator?.heading || 'Calculate your Finance'}
          </h2>
          <div className="header-footer-settings__landing-calculator-description" dangerouslySetInnerHTML={{ __html: pageData.calculator?.description || 'Utilize our finance calculator to effortlessly estimate loan payments.' }} />

          {/* Calculator */}
          <div className="header-footer-settings__landing-calculator-card">
            <div className="header-footer-settings__landing-calculator-slider-container">
              <label className="header-footer-settings__landing-calculator-label" style={{ textAlign: 'center', display: 'block' }}>
                {pageData.calculator?.amount_text || 'Amount (SAR)'}
              </label>
				<div className="header-footer-settings__landing-calculator-slider-wrapper" ref={sliderWrapperRef} style={{ position: 'relative' }}>
				<input
				  type="range"
					  min={sliderMin}
					  max={sliderMax}
					  step={sliderStep}
					  value={selectedAmount}
					  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
					  onInput={(e: any) => handleSliderChange(parseInt(e.target.value))}
					  className="header-footer-settings__landing-calculator-slider"
					  ref={sliderRef}
				/>
					{/* Click/drag overlay that maps pointer position to value without changing existing CSS */}
					<div
						style={{ position: 'absolute', inset: 0, background: 'transparent', cursor: 'pointer' }}
						onMouseDown={onTrackMouseDown}
						onTouchStart={onTrackTouchStart}
					/>
				{(() => {
				  const percent = (selectedAmount - sliderMin) / (sliderMax - sliderMin);
				  const pct = isFinite(percent) ? Math.max(0, Math.min(1, percent)) : 0;
				  // For RTL, reverse the position
				  const isRTL = locale === 'ar' || document.documentElement.getAttribute('dir') === 'rtl';
				  const left = isRTL 
				    ? `calc(${(1 - pct) * 100}% )`  // Reverse for RTL
				    : `calc(${pct * 100}% )`;        // Normal for LTR
				  return (
				    <div
					    	className="header-footer-settings__landing-calculator-slider-tooltip"
					    	style={{
					    		left,
					    		transform: 'translateX(-50%)',
					    		pointerEvents: 'none',
					    		transition: isDraggingSlider ? 'none' : 'left 150ms ease',
					    		textDecoration: 'none',
					    		textDecorationColor: 'transparent',
					    		border: 'none',
					    		borderBottom: '0 none transparent',
					    		outline: 'none'
					    	}}
				    >
				    	{selectedAmount.toLocaleString()} SAR
				    </div>
				  );
				})()}
              </div>
              <div className="header-footer-settings__landing-calculator-options">
                {[sliderMin, Math.round((sliderMin + sliderMax) / 2), sliderMax].map((amount, index) => (
                  <span 
                    key={index} 
                    className={`header-footer-settings__landing-calculator-option ${selectedAmount === amount ? 'active' : ''}`}
                    onClick={() => {
                      const rounded = Math.round(amount / sliderStep) * sliderStep;
                      handleSliderChange(rounded);
                    }}
                  >
                    {amount.toLocaleString()} SAR
                  </span>
                ))}
              </div>
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontWeight: 'normal', textAlign: 'center' }}>
                {pageData.calculator?.tenure_text || `${maxTenure} Months Tenure`}
              </div>
            </div>
          </div>

          {/* Results Section - Outside Card */}
          <div className="header-footer-settings__landing-calculator-result">
            <div className="header-footer-settings__landing-calculator-result-content">
              <div className="header-footer-settings__landing-calculator-result-label">
                {pageData.calculator?.payable_text || 'Total Payable Amount'}
              </div>
              <div className="header-footer-settings__landing-calculator-result-amount">
                {/* {isCalculating ? (
                  <span style={{ fontSize: '14px', color: '#999' }}>Calculating...</span>
                ) : (
                  `${totalPayable > 0 ? totalPayable.toLocaleString() : selectedAmount.toLocaleString()} SAR`
                )} */}
              </div>
              {/* Monthly Payable Amount - displayed above installments text */}
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#333', 
                marginTop: '10px',
                marginBottom: '5px'
              }}>
                {isCalculating ? (
                  <span style={{ fontSize: '14px', color: '#999' }}>{t('state.calculating')}</span>
                ) : (
                  `${(selectedAmount / 3).toFixed(2)} SAR`
                )}
              </div>
              <div className="header-footer-settings__landing-calculator-result-installments">
                {isCalculating ? (
                  <span style={{ fontSize: '12px', color: '#999' }}>{t('state.calculating')}</span>
                ) : (
                  pageData.calculator?.payable_installment_text || 
                  `${maxTenure || 3} Equal Installments`
                )}
              </div>
            </div>
            <div className="header-footer-settings__landing-calculator-buttons">
              {pageData.calculator?.finance_button?.map((button, index) => (
                <button key={index} className="theme-btn-next">
                  {button.label}
                </button>
              )) || (
                <button className="theme-btn-next">Apply Now</button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tracker Section */}
      <section className="header-footer-settings__landing-tracker">
        <div className="header-footer-settings__landing-tracker-content container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <>
          <>
          <div className="header-footer-settings__landing-tracker-image-container" data-animate="fade-right">
            {/* Background Phone (Left, Rotated) */}
           {/*  <div className="header-footer-settings__landing-tracker-image-background">
              <img
                src={pageData.tracker?.image?.url || 'https://via.placeholder.com/400x300'}
                alt={pageData.tracker?.image?.alt || 'App Screens'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }}
              />
            </div> */}

            {/* Foreground Phone (Right, Main) */}
            <div className="header-footer-settings__landing-tracker-image">
              <img
                src={pageData.tracker?.image?.url || 'https://via.placeholder.com/400x300'}
                alt={pageData.tracker?.image?.alt || 'App Screens'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }}
              />
            </div>
          </div>
          </>
          <>
          <div data-animate="fade-left">
            <h2 className="header-footer-settings__landing-tracker-title">
              {pageData.tracker?.heading || 'Track Your Finances and Applications'}
            </h2>
            <div className="header-footer-settings__landing-tracker-description" dangerouslySetInnerHTML={{ __html: pageData.tracker?.description || 'Manage your finances effortlessly with tools to track transactions, stay on top of repayments, and monitor your loan applications in real time.' }} />
          </div>
          </>
          </>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="header-footer-settings__landing-eligibility">
        <div className="header-footer-settings__landing-eligibility-content">
          <>
           <>
          <div className="header-footer-settings__landing-eligibility-criteria" data-animate="fade-up">
            {pageData.eligibility?.criteria?.map((criterion, index) => (
              <div key={index} className="header-footer-settings__landing-eligibility-criterion">
                <div className="header-footer-settings__landing-eligibility-criterion-icon">
                  {criterion.icon && (criterion.icon.startsWith('http') || criterion.icon.startsWith('/')) ? (
                    <img 
                      src={criterion.icon} 
                      alt="Criteria Icon" 
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                  ) : (
                    <img 
                      src={Images.FactoringLogo} 
                      alt="Criteria Icon" 
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                  )}
                </div>
                <span className="header-footer-settings__landing-eligibility-criterion-text">
                  {typeof criterion.title === 'string' ? criterion.title : (typeof criterion.title === 'object' && criterion.title !== null ? (criterion.title as any)?.title || (criterion.title as any)?.text || JSON.stringify(criterion.title) : '')}
                </span>
                <div className="header-footer-settings__landing-eligibility-criterion-check">✓</div>
              </div>
            )) || (
              <>
                <div className="header-footer-settings__landing-eligibility-criterion">
                  <div className="header-footer-settings__landing-eligibility-criterion-icon">
                    <img 
                      src={Images.FactoringLogo} 
                      alt="Salary Icon" 
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                  </div>
                  <span className="header-footer-settings__landing-eligibility-criterion-text">The minimum of Salary SAR 5,000</span>
                  <div className="header-footer-settings__landing-eligibility-criterion-check">✓</div>
                </div>
                <div className="header-footer-settings__landing-eligibility-criterion">
                  <div className="header-footer-settings__landing-eligibility-criterion-icon">
                    <img 
                      src={Images.FactoringLogo} 
                      alt="Service Period Icon" 
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                  </div>
                  <span className="header-footer-settings__landing-eligibility-criterion-text">The service period is more than 6 months</span>
                  <div className="header-footer-settings__landing-eligibility-criterion-check">✓</div>
                </div>
                <div className="header-footer-settings__landing-eligibility-criterion">
                  <div className="header-footer-settings__landing-eligibility-criterion-icon">
                    <img 
                      src={Images.FactoringLogo} 
                      alt="ID Icon" 
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                  </div>
                  <span className="header-footer-settings__landing-eligibility-criterion-text">National ID or Iqama</span>
                  <div className="header-footer-settings__landing-eligibility-criterion-check">✓</div>
                </div>
                <div className="header-footer-settings__landing-eligibility-criterion">
                  <div className="header-footer-settings__landing-eligibility-criterion-icon">
                    <img 
                      src={Images.FactoringLogo} 
                      alt="Age Icon" 
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                  </div>
                  <span className="header-footer-settings__landing-eligibility-criterion-text">Age between 18 - 60</span>
                  <div className="header-footer-settings__landing-eligibility-criterion-check">✓</div>
                </div>
              </>
            )}
          </div>
           </>
           <>
           <div className="header-footer-settings__landing-eligibility-text" data-animate="fade-left">
            <h2 className="header-footer-settings__landing-eligibility-title">
              {pageData.eligibility?.heading || 'Eligibility Criteria'}
            </h2>
            <div className="header-footer-settings__landing-eligibility-description" dangerouslySetInnerHTML={{ __html: pageData.eligibility?.description || 'To be eligible for a finance, you must meet the following criteria:' }} />
          </div>
           </>
          </>
        </div>
      </section>

      {/* How to Apply Section */}
      <section className="header-footer-settings__landing-apply">
        <div className="header-footer-settings__landing-apply-content">
          <>
          <>
          <div data-animate="fade-up">
            <h2 className="header-footer-settings__landing-apply-title">
              {pageData.apply_steps?.heading || 'How to Apply?'}
            </h2>
            <div className="header-footer-settings__landing-apply-steps">
              {pageData.apply_steps?.steps?.map((step, index) => (
                <div key={index} className="header-footer-settings__landing-apply-step" data-animate="fade-up" data-animate-delay={(index % 3) * 100}>
                  <div className="header-footer-settings__landing-apply-step-number">{index + 1}</div>
                  <p className="header-footer-settings__landing-apply-step-text">
                    {typeof step === 'string' ? step : (typeof step === 'object' && step !== null ? (step as any)?.title || (step as any)?.text || JSON.stringify(step) : '')}
                  </p>
                </div>
              )) || (
                <>
                  <div className="header-footer-settings__landing-apply-step">
                    <div className="header-footer-settings__landing-apply-step-number">1</div>
                    <p className="header-footer-settings__landing-apply-step-text">Fill out the required information.</p>
                  </div>
                  <div className="header-footer-settings__landing-apply-step">
                    <div className="header-footer-settings__landing-apply-step-number">2</div>
                    <p className="header-footer-settings__landing-apply-step-text">Select the required financing amount.</p>
                  </div>
                  <div className="header-footer-settings__landing-apply-step">
                    <div className="header-footer-settings__landing-apply-step-number">3</div>
                    <p className="header-footer-settings__landing-apply-step-text">The financing amount will be deposited into your account once approved.</p>
                  </div>
                </>
              )}
            </div>
            <div className="header-footer-settings__landing-apply-buttons" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {pageData.apply_steps?.download_app_button?.map((button, index) => (
                <button 
                  key={index} 
                  className="theme-btn-next" 
                  style={{ 
                    padding: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    width: '168px',
                    height: '56px',
                    maxWidth: '168px',
                    maxHeight: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {button.icon && (button.icon.startsWith('http') || button.icon.startsWith('/')) ? (
                    <img 
                      src={button.icon} 
                      alt="Button Icon" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                    />
                  ) : button.icon ? (
                    <img 
                      src={button.icon === 'icon-app-store' ? Images.FactoringLogo : 
                            button.icon === 'icon-google-play' ? Images.FactoringLogo : 
                            Images.FactoringLogo} 
                      alt="Button Icon" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span style={{ padding: '10px 20px' }}>{button.label}</span>
                  )}
                </button>
              )) || (
                <>
                  <button className="theme-btn-next" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={Images.FactoringLogo} 
                      alt="App Store Icon" 
                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    />
                    App Store
                  </button>
                  <button className="theme-btn-next" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={Images.FactoringLogo} 
                      alt="Google Play Icon" 
                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    />
                    Google Play
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="header-footer-settings__landing-apply-image">
          {pageData.apply_steps?.image?.url ? (
              <img
                src={pageData.apply_steps.image.url}
                alt={pageData.apply_steps?.image?.alt || 'App Preview'}
                className="header-footer-settings__landing-apply-image-content"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: '2px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                  display: 'block'
                }}
              />
            ) : (
              <div style={{ 
                width: '350px',
                height: '600px',
                margin: '0 auto',
                color: 'white', 
                textAlign: 'center', 
                padding: '20px', 
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
                borderRadius: '2px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #D96368'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📱</div>
                <div style={{ fontSize: '14px' }}>No image available</div>
              </div>
            )}
          </div>
          </>
          </>
        </div>
      </section>

      {/* Global Footer */}
      <GlobalFooter locale={locale} />
    </div>
  );
};

export default LandingPage;

