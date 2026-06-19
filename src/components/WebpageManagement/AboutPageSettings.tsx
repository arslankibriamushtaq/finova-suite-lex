import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Images } from '../Config/Images';
import { store } from '../../redux/store';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { getPageData, updatePageData } from '../../redux/apis/apisCrudWebPageManagement';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';

// Types for API integration
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

// Helper function to safely extract content from API sections
const getSectionContent = (section: any) => {
  if (!section || !section.translations || section.translations.length === 0) {
    return {};
  }
  const content = section.translations[0].content || {};
  if (content.subheadiheadingng && !content.subheading) {
    content.subheading = content.subheadiheadingng;
    delete content.subheadiheadingng;
  }
  return content;
};


const AboutPageSettings = () => {
  const navigate = useNavigate();
  
  // UI States
  const [isPublished, setIsPublished] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [editingUrl, setEditingUrl] = useState('');
  const [editingField, setEditingField] = useState('');
  const [sectionsSchema, setSectionsSchema] = useState<any>({});
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingFieldPath, setEditingFieldPath] = useState<any>('');
  const [editingFieldValue, setEditingFieldValue] = useState('');
  const [showRepeaterModal, setShowRepeaterModal] = useState(false);
  const [editingRepeaterField, setEditingRepeaterField] = useState('');
  const [editingRepeaterData, setEditingRepeaterData] = useState<any[]>([]);
  const [formValue, setFormValue] = useState<any>({});
  const [sectionIds, setSectionIds] = useState<any>({});
  // Template Data State - populated from API
  const [aboutData, setAboutData] = useState<AboutPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>('en');

  // Breadcrumb editing state
  const [editingBreadcrumbIndex, setEditingBreadcrumbIndex] = useState<number | null>(null);
  const [editingBreadcrumbText, setEditingBreadcrumbText] = useState('');

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || 'https://giuliana-gadolinic-corporately.ngrok-free.dev';
  const BEARER_TOKEN = (store.getState() as any).block.token;
  const PAGE_SLUG = 'about';



  // Helper function to validate and prepare data for API
  const validateAndPrepareData = (data: any, fieldName: string) => {
    if (data === null || data === undefined) {
      return '';
    }
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'number') {
      return data;
    }
    
    if (typeof data === 'boolean') {
      return data;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (typeof data === 'object') {
      return data;
    }
    
    // Fallback for any other type
    return data;
  };


  // Load template data on component mount and when locale changes
  useEffect(() => {
    fetchAboutData(locale);
  }, [locale]);


  // API Integration Functions
  const fetchAboutData = async (currentLocale: string = locale) => {
    try {
      setIsLoading(true);
      setError(null);
      
  
      
      const response = await getPageData(PAGE_SLUG, currentLocale);
      const result = response.data;
      
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        
        // Store schema information and section IDs for each section
        const schemaMap: any = {};
        const sectionIdMap: any = {};
        sections.forEach((section: any) => {
          schemaMap[section.key] = section.schema;
          sectionIdMap[section.key] = section.id;
        });
        setSectionsSchema(schemaMap);
        setSectionIds(sectionIdMap);
        
        // Map API sections to AboutPageData structure based on actual API response
        const aboutHeroSection = getSectionContent(sections.find((s: any) => s.key === 'about_hero')) || {};
        const aboutSection = getSectionContent(sections.find((s: any) => s.key === 'about')) || {};
        
        // Extract breadcrumbs from config
        const breadcrumbsRaw = result.data.page?.config?.breadcrumbs;
        const breadcrumbs = Array.isArray(breadcrumbsRaw) ? breadcrumbsRaw : [];
        const homeBreadcrumb = breadcrumbs.find((b: any) => b.url === '/') || { name: 'Home', url: '/' };
        const aboutBreadcrumb = breadcrumbs.find((b: any) => !b.url || b.url === '/about') || { name: 'About' };
        
        const parsedData: AboutPageData = {
  header: {
            logo: Images.FactoringLogo, // Keep header logo for navigation
    navigation: {
      about: { text: 'About', url: '/about' },
      contact: { text: 'Contact', url: '/contact' }
    }
  },
  hero: {
            image: aboutHeroSection.hero_image?.url || '',
            title: ''
  },
  breadcrumb: {
    home: { text: homeBreadcrumb.name, url: homeBreadcrumb.url || '/' },
    about: { text: aboutBreadcrumb.name, url: aboutBreadcrumb.url || '/about' }
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
    headerLogo: Images.FactoringLogo,
            contentLogo: aboutSection.about_image?.url || ''
          }
        };

        // Set formValue for editing with proper structure
        const newFormValue = {
          about_hero: {
            hero_image: aboutHeroSection.hero_image || { url: '', alt: '' }
          },
          about: {
            heading: aboutSection.heading || '',
            description: aboutSection.description || '',
            about_image: aboutSection.about_image || { url: '', alt: '' },
            below_description: aboutSection.below_description || ''
          },
          config: {
            breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : [
              { name: homeBreadcrumb.name, url: homeBreadcrumb.url || '/' },
              { name: aboutBreadcrumb.name, url: aboutBreadcrumb.url || '/about' }
            ]
          }
        };
        
        setFormValue(newFormValue);

        setAboutData(parsedData);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('❌ AboutPageSettings Error:', err);
      
      // Check if it's a CORS error or connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Use fallback data when API is not available
        const fallbackData: AboutPageData = {
          header: {
            logo: Images.FactoringLogo,
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
            home: { text: 'Home', url: '/' },
            about: { text: 'About', url: '/about' }
          },
          content: {
            title: 'About Factoring Valley!',
            paragraph1: 'At Factoring Valley Alraidah Microfinance Company (Factoring Valley), we offer a unique proposition for the financial industry, specifically in Saudi Arabia. Building on a proven and tested concept, we provide consumer microfinance services using state-of-the-art digital technology, with user experience at the forefront of our approach.',
            paragraph2: '',
            paragraph3: '',
            paragraph4: 'We are committed to safeguarding our customers and investors through clear governance, risk controls, and other protective measures that ensure the safety and confidentiality of data and information.'
          },
          logo: {
            arabic: '',
            english: ''
          },
          images: {
            heroImage: '',
            headerLogo: Images.FactoringLogo,
            contentLogo: ''
          }
        };
        
        const fallbackFormValue = {
          about_hero: {
            hero_image: { url: '', alt: '' }
          },
          about: {
            heading: 'About Factoring Valley!',
            description: 'At Factoring Valley Alraidah Microfinance Company (Factoring Valley), we offer a unique proposition for the financial industry, specifically in Saudi Arabia. Building on a proven and tested concept, we provide consumer microfinance services using state-of-the-art digital technology, with user experience at the forefront of our approach.',
            about_image: { url: '', alt: '' },
            below_description: 'We are committed to safeguarding our customers and investors through clear governance, risk controls, and other protective measures that ensure the safety and confidentiality of data and information.'
          }
        };
        
        setFormValue(fallbackFormValue);
        setAboutData(fallbackData);
        setError('API Connection Error: Using fallback data. Please check if the backend server and ngrok tunnel are running.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching data');
      }
    } finally {
    setIsLoading(false);
    }
  };

  const saveAboutData = async (data: AboutPageData): Promise<void> => {
    // TODO: Replace with actual API call
    // await api.post('/api/about-page', data);
  };

  const handlePublish = async () => {
    if (!aboutData) return;

    try {
      setIsLoading(true);
      
      // Prepare sections data for the API with proper structure validation using dynamic section IDs
      const sections = [
        {
          section_id: sectionIds.about_hero, // Dynamic section ID from API response
          content: {
            hero_image: validateAndPrepareData(formValue.about_hero?.hero_image, 'about_hero.hero_image'),
          }
        },
        {
          section_id: sectionIds.about, // Dynamic section ID from API response
          content: {
            heading: validateAndPrepareData(formValue.about?.heading, 'about.heading'),
            description: validateAndPrepareData(formValue.about?.description, 'about.description'),
            about_image: validateAndPrepareData(formValue.about?.about_image, 'about.about_image'),
            below_description: validateAndPrepareData(formValue.about?.below_description, 'about.below_description'),
          }
        }
      ];

      const requestBody = {
        locale: locale,
        sections: sections,
        config: formValue.config || {}
      };

      
      const response = await updatePageData(2, requestBody);

      if (response.status === 200) {
        toast.success('About page published successfully!');
        // Fetch updated data from API
        await fetchAboutData(locale);
      } else {
        throw new Error(response.data.message || 'Failed to publish about page');
      }
    } catch (err) {
        console.error('Error publishing about page:', err);
      toast.error('Failed to publish about page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (buttonType: string) => {
    if (!aboutData) return;
    
    const buttonKey = buttonType.toLowerCase() as keyof typeof aboutData.header.navigation;
    setEditingText(aboutData.header.navigation[buttonKey].text);
    setEditingUrl(aboutData.header.navigation[buttonKey].url);
    setEditingField(`header.navigation.${buttonType.toLowerCase()}`);
    setShowEditModal(true);
  };

  const handleApply = () => {
    if (!aboutData) return;
    
    // Update about data with new button text and URL
    const fieldParts = editingField.split('.');
    const section = fieldParts[0];
    const buttonKey = fieldParts[1] as keyof typeof aboutData.header.navigation;
    
    setAboutData(prev => {
      if (!prev) return prev;
      
      if (section === 'header') {
        return {
          ...prev,
          header: {
            ...prev.header,
            navigation: {
              ...prev.header.navigation,
              [buttonKey]: {
                text: editingText,
                url: editingUrl
              }
            }
          }
        };
      }
      return prev;
    });
    
    setShowEditModal(false);
    setEditingField('');
    setEditingText('');
    setEditingUrl('');
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingField('');
    setEditingText('');
    setEditingUrl('');
  };

  const handleTextClick = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingText(currentValue);
  };

  const handleTextSave = () => {
    if (!editingField || !editingText) return;
    
    // Update formValue instead of aboutData
    updateFormValue(editingField, editingText);
    setEditingField('');
    setEditingText('');
  };

  const handleTextCancel = () => {
    setEditingField('');
    setEditingText('');
  };

  const handleImageClick = (field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          // Create FormData for API upload
          const formData = new FormData();
          formData.append('image', file);
          
          // Determine folder based on field type
          let folder = `${PAGE_SLUG}-images`;
          /* if (field.includes('hero')) {
            folder = 'hero-images';
          } else if (field.includes('about')) {
            folder = 'about-images';
          } else if (field.includes('button') || field.includes('icon')) {
            folder = 'button-icons';
          } */
          
          formData.append('folder', folder);
          
          // Upload image to API
          const response = await fetch(`${API_BASE_URL}/api/v1/media/upload`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${BEARER_TOKEN}`,
            },
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          // Check if upload was successful and path exists
          if (result.success && result.data && result.data.path) {
            // Get the path from response (e.g., "/storage/about-images/XKPD1GKMmi-1762265490.png")
            const path = result.data.path;
            
            // Clean up any escaped slashes
            const cleanPath = path.replace(/\\\//g, '/');
            
            // Ensure path starts with /
            const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
            
            // Construct full URL by combining API_BASE_URL with the path
            const imageUrl = `${API_BASE_URL}${normalizedPath}`;
            
            
            // Update formValue with the uploaded image URL
            updateFormValue(field, {
              url: imageUrl,
              alt: result.data.alt || result.data.original_name || 'Uploaded image'
            });
            
            toast.success('Image uploaded successfully!');
          } else {
            throw new Error(result.message || 'Invalid response from upload API');
          }
        } catch (error: any) {
          console.error('❌ Error uploading image:', error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upload image. Please try again.';
          toast.error(errorMessage);
        }
      }
    };
    input.click();
  };

  // Helper function to update form values
  const updateFormValue = (path: string, value: any) => {
    setFormValue((prev: any) => {
      const newFormValue = { ...prev };
      const pathParts = path.split('.');
      let current: any = newFormValue;
      
      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      
      // Set the final value
      current[pathParts[pathParts.length - 1]] = value;
      
      return newFormValue;
    });
  };

  // Dynamic field editor based on field_type
  const renderFieldEditor = (fieldPath: string, value: any, fieldType: string, label?: string) => {
    const handleFieldClick = (e: React.MouseEvent) => {
                  e.preventDefault();
      
      if (fieldType === 'text') {
        // Inline editing for text fields
        setEditingField(fieldPath);
        setEditingText(value || '');
      } else if (fieldType === 'textarea') {
        // Open rich text editor for textarea fields
        setEditingFieldPath(fieldPath);
        setEditingFieldValue(value || '');
        setShowTextEditor(true);
      } else if (fieldType === 'media') {
        // Handle image/media fields
        handleImageClick(fieldPath);
      } else if (fieldType === 'repeater') {
        // Handle repeater fields (like buttons)
        setEditingRepeaterField(fieldPath);
        setEditingRepeaterData(Array.isArray(value) ? value : []);
        setShowRepeaterModal(true);
      } else if (fieldType === 'group') {
        // Group fields are handled inline, no modal needed
        return;
      }
    };

    if (fieldType === 'text') {
      return (
        <EditableText 
          value={value || ''} 
          field={fieldPath} 
          placeholder={label || 'Enter text'}
        />
      );
    } else if (fieldType === 'date') {
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => {
            updateFormValue(fieldPath, e.target.value);
          }}
              style={{
                padding: '8px',
            border: '1px solid var(--color-border-light)',
            borderRadius: '6px',
            fontSize: '14px',
            color: 'var(--color-text-dark)',
            backgroundColor: 'var(--color-surface-subtle)',
            outline: 'none'
          }}
          placeholder={label || 'Select date'}
        />
      );
    } else if (fieldType === 'textarea') {
      return (
        <span
          onClick={handleFieldClick}
          style={{
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '6px',
            display: 'inline-block',
            border: '1px solid transparent',
            color: 'var(--color-text-dark)',
            fontSize: '14px',
            lineHeight: '1.4',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#ddd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          dangerouslySetInnerHTML={{ __html: value || label || 'Click to edit' }}
        >
        </span>
      );
    } else if (fieldType === 'media') {
      return (
        <div 
          onClick={handleFieldClick}
          style={{ 
            cursor: 'pointer', 
            padding: '20px',
            border: '2px dashed var(--color-border-light)',
            borderRadius: '6px',
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
            `Click to upload ${label || 'image'}`
          )}
        </div>
      );
    }

    // Default fallback
    return (
      <span
        onClick={handleFieldClick}
        style={{
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'inline-block',
          minHeight: '20px',
          border: '1px solid transparent',
          backgroundColor: 'var(--color-surface-muted)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e0e0e0';
          e.currentTarget.style.borderColor = '#ccc';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        {typeof value === 'object' ? JSON.stringify(value) : (value || label || 'Click to edit')}
      </span>
    );
  };

  const EditableText: React.FC<{ 
    value: string; 
    field: string; 
    placeholder?: string;
    multiline?: boolean;
  }> = ({ value, field, placeholder, multiline = false }) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      const Component = multiline ? 'textarea' : 'input';
      return (
        <Component
              type="text"
          value={typeof editingText === 'object' ? JSON.stringify(editingText) : editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onKeyDown={(e) => {
            if (e.key === 'Enter' && !multiline) {
                  e.preventDefault();
                  handleTextSave();
            } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
                  e.preventDefault();
                  handleTextSave();
            } else if (e.key === 'Escape') {
                  e.preventDefault();
                  handleTextCancel();
                }
              }}
          onBlur={() => {
                setTimeout(() => {
              if (editingField === field) {
                    handleTextSave();
                  }
                }, 100);
              }}
              onFocus={(e) => {
            if (multiline) {
              e.target.setSelectionRange(e.target.value.length, e.target.value.length);
            }
          }}
          placeholder={placeholder}
              style={{
            width: '100%',
            padding: '8px',
            border: '1px solid var(--color-border-light)',
            borderRadius: '6px',
            fontSize: '14px',
                color: 'var(--color-text-dark)',
                backgroundColor: 'var(--color-surface-subtle)',
            outline: 'none',
            resize: multiline ? 'vertical' : 'none',
            minHeight: multiline ? '60px' : 'auto',
              }}
              autoFocus
            />
      );
    }
    
    return (
      <span 
        onClick={() => handleTextClick(field, value)}
        style={{
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'inline-block',
          minHeight: '20px',
          border: '1px solid transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
          e.currentTarget.style.borderColor = '#ddd';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        {typeof value === 'object' ? JSON.stringify(value) : (value || placeholder)}
      </span>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="header-footer-settings">
        <div className="header-footer-settings__error">
          <h3>Error Loading About Page Data</h3>
          <p>{error}</p>
          <button onClick={() => fetchAboutData(locale)} className="theme-btn-next">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="header-footer-settings">
        <div className="header-footer-settings__error">
          <h3>No Data Available</h3>
          <p>No about page data was found.</p>
          <button onClick={() => fetchAboutData(locale)} className="theme-btn-next">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="header-footer-settings">
      {/* Header Section */}
      <div className="header-footer-settings__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h2 className="header-footer-settings__header-title" style={{ margin: 0 }}>
          About Page
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
            borderRadius: '6px',
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

      {/* PUBLISH Bar */}
      <div className="header-footer-settings__publish-bar" onClick={handlePublish}>
        <div className="header-footer-settings__publish-text">PUBLISH</div>
      </div>

      {/* Main Content Area */}
      <div className="header-footer-settings__main-content">
        {/* Template Preview */}
        <div className="header-footer-settings__template-preview">
          {/* About Page Template */}
          <div className="header-footer-settings__about-template">
            {/* Header - Excluded from Settings pages */}
            {/* <div className="header-footer-settings__about-header">
              <div className="header-footer-settings__about-logo">
                <img 
                  src={aboutData.images.headerLogo} 
                  alt="Factoring Valley Logo" 
                  className="header-footer-settings__logo-img header-footer-settings__logo-clickable"
                  onClick={() => handleImageClick('headerLogo')}
                />
              </div>

              <div className="header-footer-settings__about-navigation">
                <button 
                  onClick={() => handleButtonClick('About')}
                  className="header-footer-settings__nav-button"
                >
                  {aboutData.header.navigation.about.text}
                </button>
                <button 
                  onClick={() => handleButtonClick('Contact')}
                  className="header-footer-settings__nav-button"
                >
                  {aboutData.header.navigation.contact.text}
                </button>
                <div className="header-footer-settings__language-selector">
                  <span className="header-footer-settings__language-text">عربي</span>
                  <div className="header-footer-settings__language-icon">
                    ✓
                  </div>
                </div>
              </div>
            </div> */}

            {/* Hero Image */}
            <div 
              className="header-footer-settings__about-hero" 
              style={{ 
                position: 'relative', 
                height: '400px',
                backgroundImage: formValue.about_hero?.hero_image?.url ? `url(${formValue.about_hero.hero_image.url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Hero Image Upload Button */}
              <button
                onClick={() => handleImageClick('about_hero.hero_image')}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  zIndex: 10,
                  backgroundColor: 'var(--color-overlay-dark)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
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
                {formValue.about_hero?.hero_image?.url ? 'Change Hero Image' : 'Upload Hero Image'}
              </button>
            </div>

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
                        borderRadius: '6px',
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
                      {breadcrumb.name || (index === 0 ? (aboutData?.breadcrumb?.home?.text || 'Home') : (aboutData?.breadcrumb?.about?.text || 'About'))}
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
                            { name: aboutData?.breadcrumb?.about?.text || 'About', url: '/about' }
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
                              { name: aboutData?.breadcrumb?.about?.text || 'About', url: '/about' }
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
                        borderRadius: '6px',
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
                        setEditingBreadcrumbText(aboutData?.breadcrumb?.home?.text || 'Home');
                      }}
                      style={{ 
                        cursor: 'pointer', 
                        background: 'none', 
                        border: 'none', 
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      {aboutData?.breadcrumb?.home?.text || 'Home'}
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
                            { name: aboutData?.breadcrumb?.home?.text || 'Home', url: '/' },
                            { name: editingBreadcrumbText, url: '/about' }
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
                              { name: aboutData?.breadcrumb?.home?.text || 'Home', url: '/' },
                              { name: editingBreadcrumbText, url: '/about' }
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
                        borderRadius: '6px',
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
                        setEditingBreadcrumbText(aboutData?.breadcrumb?.about?.text || 'About');
                      }}
                      style={{ 
                        cursor: 'pointer', 
                        background: 'none', 
                        border: 'none', 
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      {aboutData?.breadcrumb?.about?.text || 'About'}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Main Content */}
            <div className="header-footer-settings__about-content">
              <div className="header-footer-settings__about-content-wrapper">
                {/* Left Column - Text Content */}
                <div className="header-footer-settings__about-text-column">
                  {formValue.about?.heading && (
                  <h1 className="header-footer-settings__about-title">
                      {renderFieldEditor(
                        'about.heading',
                        formValue.about?.heading,
                        sectionsSchema.about?.heading?.field_type || 'text',
                        'Enter heading'
                      )}
                  </h1>
                  )}

                  <div className="header-footer-settings__about-paragraphs">
                    {formValue.about?.description && (
                    <p className="header-footer-settings__about-paragraph">
                        {renderFieldEditor(
                          'about.description',
                          formValue.about?.description,
                          sectionsSchema.about?.description?.field_type || 'textarea',
                          'Enter description'
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column - Large Image Area */}
                {formValue.about?.about_image?.url && (
                <div className="header-footer-settings__about-logo-column">
                    <div
                      className="header-footer-settings__about-logo-display"
                      style={{
                        backgroundColor: 'var(--color-surface-subtle)',
                        padding: '30px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        marginBottom: '20px',
                        border: '1px solid var(--color-border-light)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minHeight: '400px',
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => handleImageClick('about.about_image')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e8e8e8';
                        e.currentTarget.style.borderColor = '#bbb';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.borderColor = '#ddd';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <img 
                        src={formValue.about.about_image.url} 
                        alt={formValue.about.about_image.alt || "Factoring Valley Logo"} 
                      className="header-footer-settings__about-logo-img"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          width: 'auto', 
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', formValue.about.about_image.url);
                          console.error('❌ Error event:', e);
                        }}
                    />
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Bottom Section - Commitment Statement */}
            {formValue.about?.below_description && (
            <div className="header-footer-settings__about-bottom-section">
              <p className="header-footer-settings__about-bottom-text">
                  {renderFieldEditor(
                    'about.below_description',
                    formValue.about?.below_description,
                    sectionsSchema.about?.below_description?.field_type || 'textarea',
                    'Enter commitment statement'
                  )}
              </p>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Button Edit Modal */}
      {showEditModal && (
        <div className="header-footer-settings__edit-modal-overlay">
          <div className="header-footer-settings__edit-modal">
            <div className="header-footer-settings__edit-modal-header">
              <h3 className="header-footer-settings__edit-modal-title">
                Edit Button Details
              </h3>
              <button 
                onClick={handleCloseModal}
                className="header-footer-settings__edit-modal-close"
              >
                ×
              </button>
            </div>
            <div className="header-footer-settings__edit-modal-content">
              <div className="header-footer-settings__edit-field">
                <label className="header-footer-settings__edit-label">Button text</label>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="header-footer-settings__edit-input"
                />
              </div>
              {editingField.startsWith('header.') && (
                <div className="header-footer-settings__edit-field">
                  <label className="header-footer-settings__edit-label">Button URL</label>
                  <input
                    type="text"
                    value={editingUrl}
                    onChange={(e) => setEditingUrl(e.target.value)}
                    className="header-footer-settings__edit-input"
                  />
                </div>
              )}
            </div>
            <div className="header-footer-settings__edit-modal-footer">
              <button
                onClick={handleApply}
                className="header-footer-settings__edit-apply-btn"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

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
            borderRadius: '6px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Edit Text</h3>
              <button
                onClick={() => {
                  setShowTextEditor(false);
                  setEditingFieldPath('');
                  setEditingFieldValue('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              border: '1px solid var(--color-border-light)',
              borderRadius: '6px',
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
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => {
                  setShowTextEditor(false);
                  setEditingFieldPath('');
                  setEditingFieldValue('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-text-slate)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateFormValue(editingFieldPath, editingFieldValue);
                  setShowTextEditor(false);
                  setEditingFieldPath('');
                  setEditingFieldValue('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-action-blue)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repeater Modal */}
      {showRepeaterModal && (
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
            borderRadius: '6px',
            width: '80%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Edit Items</h3>
              <button
                onClick={() => {
                  setShowRepeaterModal(false);
                  setEditingRepeaterField('');
                  setEditingRepeaterData([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              {editingRepeaterData.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: 'var(--color-surface-snow)',
                  borderRadius: '6px'
                }}>
                  <input
                    type="text"
                    value={typeof item === 'string' ? item : (item.label || item.title || '')}
                    onChange={(e) => {
                      const newData = [...editingRepeaterData];
                      if (typeof item === 'string') {
                        newData[index] = e.target.value;
                      } else {
                        newData[index] = { ...item, label: e.target.value };
                      }
                      setEditingRepeaterData(newData);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid var(--color-border-light)',
                      borderRadius: '6px'
                    }}
                    placeholder="Label"
                  />
                  <button
                    onClick={() => {
                      const newData = editingRepeaterData.filter((_, i) => i !== index);
                      setEditingRepeaterData(newData);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--theme-secondary)',
                      color: 'var(--primary-foreground)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  setEditingRepeaterData([...editingRepeaterData, 'New Item']);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-status-active)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Add Item
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={() => {
                  setShowRepeaterModal(false);
                  setEditingRepeaterField('');
                  setEditingRepeaterData([]);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-text-slate)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateFormValue(editingRepeaterField, editingRepeaterData);
                  setShowRepeaterModal(false);
                  setEditingRepeaterField('');
                  setEditingRepeaterData([]);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-action-blue)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isPublished && (
        <div className="header-footer-settings__success-modal">
          <div className="header-footer-settings__success-content">
            <div className="header-footer-settings__success-icon">
              ✓
            </div>
            <h3 className="header-footer-settings__success-title">About Page Published!</h3>
            <p className="header-footer-settings__success-text">
              Your about page has been successfully published.
            </p>
            <button
              onClick={() => {
                setIsPublished(false);
                navigate('/WebPageManagement/AboutPage');
              }}
              className="theme-btn-next"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPageSettings;
