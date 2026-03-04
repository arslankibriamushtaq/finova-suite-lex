import React, { useState, useEffect } from 'react';
import { Images } from '../Config/Images';
import { store } from '../../redux/store';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import toast from 'react-hot-toast';
import { getPageData, updatePageData } from '../../redux/apis/apisCrudWebPageManagement';
import Loader from '../Loader/Loader';

// Types for API integration
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
  socialMedia: {
    youtube: string;
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    linkedin: string;
    snapchat: string;
  };
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

const ContactUsSettings = () => {
  // UI States
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingFieldPath, setEditingFieldPath] = useState<any>('');
  const [editingFieldValue, setEditingFieldValue] = useState('');
  const [formValue, setFormValue] = useState<any>({});
  const [sectionIds, setSectionIds] = useState<any>({});
  const [locale, setLocale] = useState<string>('en');

  const [contactData, setContactData] = useState<ContactUsPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Social media modal state
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingSocialIndex, setEditingSocialIndex] = useState<number | null>(null);
  const [tempSocialIcon, setTempSocialIcon] = useState('');
  const [tempSocialUrl, setTempSocialUrl] = useState('');
  const [tempSocialIconFile, setTempSocialIconFile] = useState<File | null>(null);

  // Contact info modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [tempContactValue, setTempContactValue] = useState('');
  const [tempContactUrl, setTempContactUrl] = useState('');

  // Button text modal state
  const [showButtonTextModal, setShowButtonTextModal] = useState(false);
  const [tempButtonText, setTempButtonText] = useState('');

  // Breadcrumb editing state
  const [editingBreadcrumbIndex, setEditingBreadcrumbIndex] = useState<number | null>(null);
  const [editingBreadcrumbText, setEditingBreadcrumbText] = useState('');

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || 'https://giuliana-gadolinic-corporately.ngrok-free.dev';
  const BEARER_TOKEN = (store.getState() as any).block.token;
  const PAGE_SLUG = 'contact-us';

  const iconEmojiMap: { [key: string]: string } = {
    'youtube': '📺',
    'facebook': '📘',
    'instagram': '📷',
    'twitter': '🐦',
    'tiktok': '🎵',
    'linkedin': '💼',
    'snapchat': '👻',
    'pinterest': '📌',
    'whatsapp': '💬',
    'telegram': '✈️',
    'discord': '🎮',
    'reddit': '🔴',
    'github': '🐙',
    'behance': '🎨'
  };

  // Helper function to safely extract content from API sections
  const getSectionContent = (section: any) => {
    if (!section || !section.translations || section.translations.length === 0) {
      return {};
    }
    const content = section.translations[0].content || {};
    return content;
  };

  // Helper function to construct full image URLs
  const getFullImageUrl = (url: string, API_BASE_URL: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const fetchPageData = async (currentLocale: string = locale) => {
    try {
      setIsLoading(true);
      
      const response = await getPageData(PAGE_SLUG, currentLocale);
      const result = response.data;

      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        const globalSections = result.data.global_sections || [];
        
        // Map section keys to section IDs
        const sectionIdMap: any = {};
        sections.forEach((section: any) => {
          sectionIdMap[section.key] = section.id;
        });
        setSectionIds(sectionIdMap);
        
        // Extract header from global sections (like ContactUs)
        const headerSection = globalSections.find((s: any) => s.key === 'header');
        const headerContent = headerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};
        
        // Extract data based on section structure
        const heroSection = getSectionContent(sections.find((s: any) => s.key === 'contact_hero')) || {};
        const introSection = getSectionContent(sections.find((s: any) => s.key === 'contact_intro')) || {};
        const detailsSection = getSectionContent(sections.find((s: any) => s.key === 'contact_details')) || {};
        const formSection = getSectionContent(sections.find((s: any) => s.key === 'contact_form')) || {};
        
        // Extract breadcrumbs from config
        const breadcrumbsRaw = result.data.page?.config?.breadcrumbs;
        const breadcrumbs = Array.isArray(breadcrumbsRaw) ? breadcrumbsRaw : [];
        const homeBreadcrumb = breadcrumbs.find((b: any) => b.url === '/') || { name: 'Home', url: '/' };
        const contactBreadcrumb = breadcrumbs.find((b: any) => !b.url || b.url === '/contact') || { name: 'Contact Us' };
        
        const parsedData: ContactUsPageData = {
          header: {
            logo: headerContent?.logo?.url || Images.FactoringLogo,
            navigation: {
              about: { text: (headerContent?.main_menu?.[1]?.label) || 'About', url: (headerContent?.main_menu?.[1]?.url) || '/about' },
              contact: { text: (headerContent?.main_menu?.[3]?.label) || 'Contact', url: (headerContent?.main_menu?.[3]?.url) || '/contact' }
            },
            // @ts-ignore include all menu items
            navigationLinks: headerContent?.main_menu || []
          },
          hero: {
            image: heroSection.hero_image?.url ? getFullImageUrl(heroSection.hero_image.url, API_BASE_URL) : '',
            title: introSection.heading || 'Contact Us'
          },
          breadcrumb: {
            home: { text: homeBreadcrumb.name, url: homeBreadcrumb.url || '/' },
            contact: { text: contactBreadcrumb.name, url: contactBreadcrumb.url || '/contact' }
          },
          content: {
            title: introSection.heading || 'Contact Us',
            subtitle: introSection.sub_heading || 'Let\'s Start a Conversation',
            description: ''
          },
          contactInfo: {
            address: detailsSection.contact_information?.find((item: any) => item.icon === 'map-marker-alt')?.value || '-',
            email: detailsSection.contact_information?.find((item: any) => item.icon === 'envelope')?.value || '-',
            phone: detailsSection.contact_information?.find((item: any) => item.icon === 'phone')?.value || "-"
          },
          socialMedia: {
            youtube: detailsSection.social_links?.find((item: any) => item.icon === 'youtube')?.url || '#',
            facebook: detailsSection.social_links?.find((item: any) => item.icon === 'facebook')?.url || '#',
            instagram: detailsSection.social_links?.find((item: any) => item.icon === 'instagram')?.url || '#',
            twitter: detailsSection.social_links?.find((item: any) => item.icon === 'twitter')?.url || '#',
            tiktok: detailsSection.social_links?.find((item: any) => item.icon === 'tiktok')?.url || '#',
            linkedin: detailsSection.social_links?.find((item: any) => item.icon === 'linkedin')?.url || '#',
            snapchat: detailsSection.social_links?.find((item: any) => item.icon === 'snapchat')?.url || '#'
          },
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
        
        // Store header data for rendering (like ContactUs)
        (parsedData as any).header = {
          ...parsedData.header,
          logo: headerContent?.logo?.url || Images.awnLogoWhite,
          logoLink: headerContent?.logo?.link || '/',
          logoAlt: headerContent?.logo?.alt || 'Factoring Valley Logo',
          navigationLinks: headerContent?.main_menu || []
        };
        
        
        // Set form values for editing
        setFormValue({
          contact_hero: {
            hero_image: {
              url: heroSection.hero_image?.url || ''
            }
          },
          contact_intro: {
            heading: introSection.heading || '',
            sub_heading: introSection.sub_heading || ''
          },
          contact_details: {
            social_links: detailsSection.social_links || [],
            contact_information: detailsSection.contact_information || [
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
            ]
          },
          contact_form: {
            heading: formSection.heading || '',
            fields: formSection.fields || [],
            button_text: formSection.button_text || (currentLocale === 'ar' ? 'إرسال الرسالة' : 'Send Message')
          }
        });
        
        // Store breadcrumbs in formValue
        setFormValue((prev: any) => ({
          ...prev,
          config: {
            breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : [
              { name: homeBreadcrumb.name, url: homeBreadcrumb.url || '/' },
              { name: contactBreadcrumb.name, url: contactBreadcrumb.url || '/contact' }
            ]
          }
        }));
        
        setContactData(parsedData);
      } else {
      }
    } catch (err) {
      console.error('Error fetching contact us data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(locale);
  }, [locale]);

  const handleFileUpload = async (fieldPath: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', `${PAGE_SLUG}-images`);

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const fileUrl = `${API_BASE_URL}${result.data.path}`;
          updateFormValue(fieldPath, fileUrl);
          toast.success('File uploaded successfully!');
        } else {
          toast.error('Failed to upload file');
        }
      } catch (err) {
        console.error('Error uploading file:', err);
        toast.error('Error uploading file');
      }
    };
    input.click();
  };


  const renderContactInfoItem = (item: any, index: number) => {
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
    
    // Get the title for editing (use original API title or default)
    const getTitleForEditing = () => {
      const apiTitle = item.title || item.heading;
      if (apiTitle) {
        // If it's a mapped title, return the English version for editing
        const mapped = titleMap[apiTitle];
        if (mapped) {
          return mapped.en;
        }
        return apiTitle;
      }
      return defaultTitles[index] || 'Contact Info';
    };

    return (
      <div key={index} style={{
        backgroundColor: 'var(--background)',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Title - Editable */}
        <div
          onClick={() => {
            setEditingFieldPath(`contact_details.contact_information.${index}.title`);
            setEditingFieldValue(getTitleForEditing());
          }}
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'var(--color-text-dark)',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {editingFieldPath === `contact_details.contact_information.${index}.title` ? (
            <input
              type="text"
              value={editingFieldValue}
              onChange={(e) => setEditingFieldValue(e.target.value)}
              onBlur={() => {
                updateFormValue(`contact_details.contact_information.${index}.title`, editingFieldValue);
                setEditingFieldPath('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFormValue(`contact_details.contact_information.${index}.title`, editingFieldValue);
                  setEditingFieldPath('');
                }
              }}
              autoFocus
              style={{
                width: '100%',
                padding: '4px 8px',
                border: '2px solid var(--color-action-blue)',
                borderRadius: '4px',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                fontFamily: 'inherit'
              }}
            />
          ) : (
            getTitle()
          )}
        </div>

        {/* Value and Icon Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div
            onClick={() => handleContactTextClick(index)}
            style={{
              flex: 1,
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              lineHeight: '1.5',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {item.value}
          </div>
          <div
            onClick={() => handleFileUpload(`contact_details.contact_information.${index}.icon`)}
            style={{
              color: 'var(--theme-secondary)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isIconUrl(item.icon) ? (
              <img 
                src={item.icon} 
                alt="Contact Icon"
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  objectFit: 'contain'
                }}
              />
            ) : (
              '📋'
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFormFieldItem = (field: any, index: number) => {
    // Get placeholder based on field name and locale
    const getPlaceholder = () => {
      const fieldName = field.name || '';
      if (locale === 'ar') {
        const placeholderMap: { [key: string]: string } = {
          'full_name': 'أدخل اسمك الكامل',
          'subject': 'أدخل الموضوع',
          'email': 'أدخل بريدك الإلكتروني',
          'message': 'اكتب رسالتك هنا'
        };
        return placeholderMap[fieldName] || field.placeholder || 'أدخل القيمة';
      } else {
        return field.placeholder || `Enter ${field.label?.toLowerCase() || 'value'}`;
      }
    };

    return (
      <div key={index} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            {renderFieldEditor(`contact_form.fields.${index}.label`, field.label, 'text', locale === 'ar' ? 'أدخل التسمية' : 'Enter label')}
          </div>
        </div>
        <input
          type={field.type || 'text'}
          placeholder={getPlaceholder()}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid var(--color-border-light)',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>
    );
  };

  const updateFormValue = (path: string, value: any) => {
    setFormValue((prev: any) => {
      const keys = path.split('.');
      const newValue = { ...prev };
      let current = newValue;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newValue;
    });
  };

  // Social media modal handlers
  const handleSocialIconClick = (index: number) => {
    const socialLink = formValue.contact_details?.social_links?.[index];
    if (socialLink) {
      setEditingSocialIndex(index);
      setTempSocialIcon(socialLink.icon);
      setTempSocialUrl(socialLink.url);
      setTempSocialIconFile(null);
      setShowSocialModal(true);
    }
  };

  const handleSocialModalSave = async () => {
    if (editingSocialIndex !== null) {
      // Update URL immediately
      updateFormValue(`contact_details.social_links.${editingSocialIndex}.url`, tempSocialUrl);
      
      // If there's a file to upload, upload it first
      if (tempSocialIconFile) {
        try {
          const formData = new FormData();
          formData.append('image', tempSocialIconFile);
          formData.append('folder', `${PAGE_SLUG}-images`);
          
          const response = await fetch(`${API_BASE_URL}/api/v1/media/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${BEARER_TOKEN}`,
              'ngrok-skip-browser-warning': 'true',
            },
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            const fileUrl = `${API_BASE_URL}${result.data.path}`;
            
            // Update the icon with the uploaded file URL
            updateFormValue(`contact_details.social_links.${editingSocialIndex}.icon`, fileUrl);
            toast.success('Icon uploaded successfully!');
          } else {
            toast.error('Failed to upload icon');
            return; // Don't close modal if upload failed
          }
        } catch (err) {
          console.error('Error uploading icon:', err);
          toast.error('Error uploading icon');
          return; // Don't close modal if upload failed
        }
      } else {
        // No file to upload, just update the icon name
        updateFormValue(`contact_details.social_links.${editingSocialIndex}.icon`, tempSocialIcon);
      }
    }
    
    // Close modal and reset state
    setShowSocialModal(false);
    setEditingSocialIndex(null);
    setTempSocialIcon('');
    setTempSocialUrl('');
    setTempSocialIconFile(null);
  };

  const handleSocialModalCancel = () => {
    setShowSocialModal(false);
    setEditingSocialIndex(null);
    setTempSocialIcon('');
    setTempSocialUrl('');
    setTempSocialIconFile(null);
  };

  // Contact info modal handlers
  const handleContactTextClick = (index: number) => {
    const contactItem = formValue.contact_details?.contact_information?.[index];
    if (contactItem) {
      setEditingContactIndex(index);
      setTempContactValue(contactItem.value);
      setTempContactUrl(contactItem.url);
      setShowContactModal(true);
    }
  };

  const handleButtonTextModalSave = () => {
    updateFormValue('contact_form.button_text', tempButtonText);
    setShowButtonTextModal(false);
    toast.success('Button text updated! Click PUBLISH to save changes.');
  };

  const handleContactModalSave = () => {
    if (editingContactIndex !== null) {
      updateFormValue(`contact_details.contact_information.${editingContactIndex}.value`, tempContactValue);
      updateFormValue(`contact_details.contact_information.${editingContactIndex}.url`, tempContactUrl);
    }
    setShowContactModal(false);
    setEditingContactIndex(null);
    setTempContactValue('');
    setTempContactUrl('');
  };

  const handleContactModalCancel = () => {
    setShowContactModal(false);
    setEditingContactIndex(null);
    setTempContactValue('');
    setTempContactUrl('');
  };

  const handleIconFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTempSocialIconFile(file);
      // Don't set icon name from filename - we'll upload the file and get URL
    }
  };

  // Helper function to check if icon is a URL
  const isIconUrl = (icon: string) => {
    return icon && (icon.startsWith('http') || icon.startsWith('/'));
  };

  const renderFieldEditor = (
    fieldPath: string,
    value: any,
    fieldType: string,
    placeholder: string = 'Enter value'
  ) => {
    const isEditing = editingFieldPath === fieldPath;

    if (fieldType === 'text') {
      if (isEditing) {
        return (
          <input
            type="text"
            value={editingFieldValue}
            onChange={(e) => setEditingFieldValue(e.target.value)}
            onBlur={() => {
              updateFormValue(fieldPath, editingFieldValue);
              setEditingFieldPath('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFormValue(fieldPath, editingFieldValue);
                setEditingFieldPath('');
              }
            }}
            autoFocus
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '2px solid var(--color-action-blue)',
              borderRadius: '4px',
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
          />
        );
      } else {
        return (
          <span
            onClick={() => {
              setEditingFieldPath(fieldPath);
              setEditingFieldValue(value || '');
            }}
            style={{
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {value || placeholder}
          </span>
        );
      }
    } else if (fieldType === 'textarea') {
      return (
        <span
          onClick={() => {
            setEditingFieldPath(fieldPath);
            setEditingFieldValue(value || '');
            setShowTextEditor(true);
          }}
          style={{
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '3px',
            display: 'inline-block',
            border: '1px solid transparent',
            color: 'var(--color-text-dark)',
            fontSize: '14px',
            lineHeight: '1.4',
            transition: 'all 0.2s ease',
            minHeight: '40px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#ddd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          dangerouslySetInnerHTML={{ __html: value || placeholder || 'Click to edit' }}
        >
        </span>
      );
    } else if (fieldType === 'media') {
      return (
        <div 
          onClick={() => handleFileUpload(fieldPath)}
          style={{ 
            cursor: 'pointer', 
            padding: '20px',
            border: '2px dashed var(--color-border-light)',
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface-cloud)',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {value && value.url ? (
            <img src={value.url} alt={value.alt || 'Image'} style={{ maxWidth: '100%', maxHeight: '200px' }} />
          ) : (
            `Click to upload ${placeholder || 'image'}`
          )}
        </div>
      );
    }

    return <span>{value || 'N/A'}</span>;
  };

  const handlePublish = async () => {
    try {
      setIsLoading(true);
      
      
      const sections = [
        {
          section_id: sectionIds.contact_hero,
          content: {
            hero_image: {
              url: formValue.contact_hero?.hero_image?.url || ''
            }
          }
        },
        {
          section_id: sectionIds.contact_intro,
          content: {
            heading: formValue.contact_intro?.heading || '',
            sub_heading: formValue.contact_intro?.sub_heading || ''
          }
        },
        {
          section_id: sectionIds.contact_details,
          content: {
            social_links: formValue.contact_details?.social_links || [],
            contact_information: formValue.contact_details?.contact_information || []
          }
        },
        {
          section_id: sectionIds.contact_form,
          content: {
            heading: formValue.contact_form?.heading || '',
            fields: formValue.contact_form?.fields || [],
            button_text: formValue.contact_form?.button_text || ''
          }
        }
      ];
      
      
      const response = await updatePageData(6, {
        locale: locale,
        sections: sections,
        config: formValue.config || {}
      });

      if (response.status === 200) {
        const result = response.data;
        
        toast.success('Contact Us page published successfully!');
        
        // Re-fetch data to reflect changes
        await fetchPageData();
      } else {
        const errorText = response.data?.message || 'Unknown error';
        console.error('❌ Publish failed:', errorText);
        toast.error('Failed to publish contact us page');
      }
    } catch (err) {
      console.error('Error publishing contact us page:', err);
      toast.error('Error publishing contact us page');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !contactData) {
    return <Loader />;
  }

  return (
    <div className="header-footer-settings__landing-template">
      {/* Header with Language Switcher */}
      <div className="header-footer-settings__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h2 className="header-footer-settings__header-title" style={{ margin: 0 }}>
          Contact Us Page
        </h2>
        {/* Language Switcher */}
        <div
          className="header-footer-settings__landing-language"
          style={{
            color: 'var(--foreground)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid var(--color-border-light)',
            backgroundColor: 'var(--color-surface-cloud)',
            transition: 'background-color 0.2s ease'
          }}
          onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
          }}
        >
          <span>{locale === 'en' ? 'عربي' : 'English'}</span>
          <div className="header-footer-settings__landing-language-indicator">
            {locale === 'ar' ? '✓' : ''}
          </div>
        </div>
      </div>

      {/* Publish Bar */}
      <div className="header-footer-settings__publish-bar" onClick={handlePublish}>
        <div className="header-footer-settings__publish-text">
          {isLoading ? 'Publishing...' : 'PUBLISH'}
        </div>
      </div>

      {/* Hero Image Section */}
      <section style={{
        position: 'relative',
        height: '400px',
        backgroundColor: 'var(--color-overlay-light)',
        backgroundImage: formValue.contact_hero?.hero_image?.url ? `url(${getFullImageUrl(formValue.contact_hero.hero_image.url, API_BASE_URL)})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Hero Image Upload Button */}
        <button
          onClick={() => handleFileUpload('contact_hero.hero_image.url')}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            backgroundColor: 'var(--color-overlay-dark)',
            color: 'var(--primary-foreground)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          }}
        >
          {formValue.contact_hero?.hero_image?.url ? 'Change Hero Image' : 'Upload Hero Image'}
        </button>
      </section>

      {/* Breadcrumb */}
      <div className="header-footer-settings__about-breadcrumb">
        {(formValue.config?.breadcrumbs || []).map((breadcrumb: any, index: number) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="header-footer-settings__breadcrumb-separator"> / </span>}
            {editingBreadcrumbIndex === index ? (
              <input
                type="text"
                value={editingBreadcrumbText}
                onChange={(e) => setEditingBreadcrumbText(e.target.value)}
                onBlur={() => {
                  if (editingBreadcrumbIndex !== null) {
                    const updatedBreadcrumbs = [...(formValue.config?.breadcrumbs || [])];
                    updatedBreadcrumbs[editingBreadcrumbIndex] = {
                      ...updatedBreadcrumbs[editingBreadcrumbIndex],
                      name: editingBreadcrumbText
                    };
                    updateFormValue('config.breadcrumbs', updatedBreadcrumbs);
                    setEditingBreadcrumbIndex(null);
                    setEditingBreadcrumbText('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (editingBreadcrumbIndex !== null) {
                      const updatedBreadcrumbs = [...(formValue.config?.breadcrumbs || [])];
                      updatedBreadcrumbs[editingBreadcrumbIndex] = {
                        ...updatedBreadcrumbs[editingBreadcrumbIndex],
                        name: editingBreadcrumbText
                      };
                      updateFormValue('config.breadcrumbs', updatedBreadcrumbs);
                      setEditingBreadcrumbIndex(null);
                      setEditingBreadcrumbText('');
                    }
                  } else if (e.key === 'Escape') {
                    setEditingBreadcrumbIndex(null);
                    setEditingBreadcrumbText('');
                  }
                }}
                autoFocus
                style={{
                  border: '2px solid var(--color-action-blue)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 'inherit',
                  background: 'var(--background)',
                  minWidth: '100px'
                }}
              />
            ) : (
              <button 
                className="header-footer-settings__breadcrumb-button"
                onClick={() => {
                  setEditingBreadcrumbIndex(index);
                  setEditingBreadcrumbText(breadcrumb.name || '');
                }}
                style={{ 
                  cursor: 'pointer', 
                  background: 'none', 
                  border: 'none', 
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                {breadcrumb.name || (index === 0 ? (contactData?.breadcrumb?.home?.text || 'Home') : (contactData?.breadcrumb?.contact?.text || 'Contact Us'))}
              </button>
            )}
          </React.Fragment>
        ))}
        {(!formValue.config?.breadcrumbs || formValue.config.breadcrumbs.length === 0) && (
          <>
            {editingBreadcrumbIndex === 0 ? (
              <input
                type="text"
                value={editingBreadcrumbText}
                onChange={(e) => setEditingBreadcrumbText(e.target.value)}
                onBlur={() => {
                  if (editingBreadcrumbIndex === 0) {
                    const updatedBreadcrumbs = [
                      { name: editingBreadcrumbText, url: '/' },
                      { name: contactData?.breadcrumb?.contact?.text || 'Contact Us', url: '/contact' }
                    ];
                    updateFormValue('config.breadcrumbs', updatedBreadcrumbs);
                    setEditingBreadcrumbIndex(null);
                    setEditingBreadcrumbText('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (editingBreadcrumbIndex === 0) {
                      const updatedBreadcrumbs = [
                        { name: editingBreadcrumbText, url: '/' },
                        { name: contactData?.breadcrumb?.contact?.text || 'Contact Us', url: '/contact' }
                      ];
                      updateFormValue('config.breadcrumbs', updatedBreadcrumbs);
                      setEditingBreadcrumbIndex(null);
                      setEditingBreadcrumbText('');
                    }
                  } else if (e.key === 'Escape') {
                    setEditingBreadcrumbIndex(null);
                    setEditingBreadcrumbText('');
                  }
                }}
                autoFocus
                style={{
                  border: '2px solid var(--color-action-blue)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 'inherit',
                  background: 'var(--background)',
                  minWidth: '100px'
                }}
              />
            ) : (
              <button 
                className="header-footer-settings__breadcrumb-button"
                onClick={() => {
                  setEditingBreadcrumbIndex(0);
                  setEditingBreadcrumbText(contactData?.breadcrumb?.home?.text || 'Home');
                }}
                style={{ 
                  cursor: 'pointer', 
                  background: 'none', 
                  border: 'none', 
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                {contactData?.breadcrumb?.home?.text || 'Home'}
              </button>
            )}
            <span className="header-footer-settings__breadcrumb-separator"> / </span>
            {editingBreadcrumbIndex === 1 ? (
              <input
                type="text"
                value={editingBreadcrumbText}
                onChange={(e) => setEditingBreadcrumbText(e.target.value)}
                onBlur={() => {
                  if (editingBreadcrumbIndex === 1) {
                    const updatedBreadcrumbs = [
                      { name: contactData?.breadcrumb?.home?.text || 'Home', url: '/' },
                      { name: editingBreadcrumbText, url: '/contact' }
                    ];
                    updateFormValue('config.breadcrumbs', updatedBreadcrumbs);
                    setEditingBreadcrumbIndex(null);
                    setEditingBreadcrumbText('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (editingBreadcrumbIndex === 1) {
                      const updatedBreadcrumbs = [
                        { name: contactData?.breadcrumb?.home?.text || 'Home', url: '/' },
                        { name: editingBreadcrumbText, url: '/contact' }
                      ];
                      updateFormValue('config.breadcrumbs', updatedBreadcrumbs);
                      setEditingBreadcrumbIndex(null);
                      setEditingBreadcrumbText('');
                    }
                  } else if (e.key === 'Escape') {
                    setEditingBreadcrumbIndex(null);
                    setEditingBreadcrumbText('');
                  }
                }}
                autoFocus
                style={{
                  border: '2px solid var(--color-action-blue)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 'inherit',
                  background: 'var(--background)',
                  minWidth: '100px'
                }}
              />
            ) : (
              <button 
                className="header-footer-settings__breadcrumb-button"
                onClick={() => {
                  setEditingBreadcrumbIndex(1);
                  setEditingBreadcrumbText(contactData?.breadcrumb?.contact?.text || 'Contact Us');
                }}
                style={{ 
                  cursor: 'pointer', 
                  background: 'none', 
                  border: 'none', 
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                {contactData?.breadcrumb?.contact?.text || 'Contact Us'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Main Content */}
      <section style={{
        backgroundColor: 'var(--background)',
        color: 'var(--color-text-dark)',
        padding: '60px 40px',
        minHeight: '600px'
      }}>
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
              color: 'var(--color-text-dark)',
              margin: '0 0 10px 0'
            }}>
              {renderFieldEditor('contact_intro.heading', formValue.contact_intro?.heading, 'text', 'Enter heading')}
            </h1>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 'normal',
              color: 'var(--color-text-muted)',
              margin: '0 0 30px 0',
              textAlign: 'left'
            }}>
              {renderFieldEditor('contact_intro.sub_heading', formValue.contact_intro?.sub_heading, 'text', 'Enter subtitle')}
            </h2>

            {/* Contact Information Cards */}
            <div style={{ marginBottom: '40px' }}>
              {(formValue.contact_details?.contact_information || []).map((item: any, index: number) => 
                renderContactInfoItem(item, index)
              )}
            </div>

            {/* Social Media Card */}
            <div style={{
              backgroundColor: 'var(--background)',
              padding: '20px',
              borderRadius: '8px',
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
                  {(formValue.contact_details?.social_links || []).map((item: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => handleSocialIconClick(index)}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {isIconUrl(item.icon) ? (
                        <img 
                          src={item.icon} 
                          alt="Social Media Icon"
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
                    </div>
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
              color: 'var(--color-text-dark)',
              margin: '0 0 30px 0'
            }}>
              {renderFieldEditor('contact_form.heading', formValue.contact_form?.heading, 'text', 'Enter form title')}
            </h2>

            <div style={{
              backgroundColor: 'var(--background)',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <form>
                {(formValue.contact_form?.fields || []).map((field: any, index: number) =>
                  renderFormFieldItem(field, index)
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--primary-foreground)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    marginTop: '20px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#000';
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setTempButtonText(formValue.contact_form?.button_text || contactData?.form?.submitButton || (locale === 'ar' ? 'إرسال الرسالة' : 'Send Message'));
                    setShowButtonTextModal(true);
                  }}
                >
                  {formValue.contact_form?.button_text || contactData?.form?.submitButton || (locale === 'ar' ? 'إرسال الرسالة' : 'Send Message')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CKEditor Modal */}
      {showTextEditor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-overlay-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--color-text-dark)' }}>Edit Content</h3>
            <div style={{
              border: '1px solid var(--color-border-light)',
              borderRadius: '4px',
              minHeight: '300px'
            }}>
              <CKEditor
                editor={ClassicEditor as any}
                data={editingFieldValue}
                onChange={(_, editor) => {
                  const data = editor.getData();
                  setEditingFieldValue(data);
                }}
                config={{
                  toolbar: [
                    'heading', '|',
                    'bold', 'italic', 'underline', 'strikethrough', '|',
                    'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                    'alignment', '|',
                    'bulletedList', 'numberedList', '|',
                    'outdent', 'indent', '|',
                    'blockQuote', 'insertTable', '|',
                    'link', '|',
                    'undo', 'redo'
                  ]
                }}
              />
            </div>
            <div style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-text-slate)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowTextEditor(false);
                  setEditingFieldPath('');
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-action-blue)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  updateFormValue(editingFieldPath, editingFieldValue);
                  setShowTextEditor(false);
                  setEditingFieldPath('');
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Modal */}
      {showSocialModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-overlay-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Dark Header */}
            <div style={{
              backgroundColor: 'var(--color-text-dark)',
              color: 'var(--primary-foreground)',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                Edit Social Media Details
              </h3>
              <button
                onClick={handleSocialModalCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-foreground)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '30px' }}>
              {/* URL Input */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'var(--color-text-dark)'
                }}>
                  Social Media URL
                </label>
                <input
                  type="url"
                  value={tempSocialUrl}
                  onChange={(e) => setTempSocialUrl(e.target.value)}
                  placeholder="Enter social media URL"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--background)'
                  }}
                />
              </div>

              {/* Icon Selection */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'var(--color-text-dark)'
                }}>
                  Social Media Icon
                </label>
                <div style={{
                  border: '2px dashed var(--color-border-light)',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'var(--color-surface-ice)',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => document.getElementById('icon-file-input')?.click()}
                >
                  <input
                    id="icon-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleIconFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ textAlign: 'center' }}>
                    {tempSocialIconFile ? (
                      <div>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                          📁
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {tempSocialIconFile.name}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)', marginTop: '5px' }}>
                          Click to change
                        </div>
                      </div>
                    ) : isIconUrl(tempSocialIcon) ? (
                      <div>
                        <img 
                          src={tempSocialIcon} 
                          alt="Social Media Icon"
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            objectFit: 'contain',
                            marginBottom: '10px'
                          }}
                        />
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                          Current: Uploaded Image
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>
                          Click to change
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                          {iconEmojiMap[tempSocialIcon] || '🔗'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                          Current: {tempSocialIcon || 'No icon selected'}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>
                          Click to select image
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end' 
              }}>
                <button
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--primary-foreground)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--foreground)';
                  }}
                  onClick={handleSocialModalSave}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Info Modal */}
      {showContactModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-overlay-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Dark Header */}
            <div style={{
              backgroundColor: 'var(--color-text-dark)',
              color: 'var(--primary-foreground)',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                Edit Contact Information
              </h3>
              <button
                onClick={handleContactModalCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-foreground)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '30px' }}>
              {/* Value Input */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'var(--color-text-dark)'
                }}>
                  Value
                </label>
                <input
                  type="text"
                  value={tempContactValue}
                  onChange={(e) => setTempContactValue(e.target.value)}
                  placeholder="Enter contact information"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--background)'
                  }}
                />
              </div>

              {/* URL Input */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'var(--color-text-dark)'
                }}>
                  URL
                </label>
                <input
                  type="url"
                  value={tempContactUrl}
                  onChange={(e) => setTempContactUrl(e.target.value)}
                  placeholder="Enter URL"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--background)'
                  }}
                />
              </div>

              {/* Apply Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--primary-foreground)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--foreground)';
                  }}
                  onClick={handleContactModalSave}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Button Text Modal */}
      {showButtonTextModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-overlay-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowButtonTextModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--background)',
              padding: '30px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              marginBottom: '20px',
              color: 'var(--color-text-dark)',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              Edit Button Text
            </h3>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'var(--color-text-dark)'
              }}>
                Button Text
              </label>
              <input
                type="text"
                value={tempButtonText}
                onChange={(e) => setTempButtonText(e.target.value)}
                placeholder="Enter button text"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--background)'
                }}
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-text-slate)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6268';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-text-slate)';
                }}
                onClick={() => setShowButtonTextModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--foreground)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--foreground)';
                }}
                onClick={handleButtonTextModalSave}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUsSettings;
