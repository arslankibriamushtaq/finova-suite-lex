import React, { useState, useEffect } from 'react';
import { store } from '../../redux/store';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { getPageData, updatePageData } from '../../redux/apis/apisCrudWebPageManagement';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';

// Types for API integration
interface PrivacyPolicyData {
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
}

// Helper function to safely extract content from API sections
const getSectionContent = (section: any) => {
  if (!section || !section.translations || section.translations.length === 0) {
    return {};
  }
  return section.translations[0].content || {};
};

const PrivacyPolicySettings = () => {
  // UI States
  const [editingText, setEditingText] = useState('');
  const [editingField, setEditingField] = useState('');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingFieldPath, setEditingFieldPath] = useState<any>('');
  const [editingFieldValue, setEditingFieldValue] = useState('');
  const [formValue, setFormValue] = useState<any>({});
  const [sectionIds, setSectionIds] = useState<any>({});
  const [privacyData, setPrivacyData] = useState<PrivacyPolicyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>('en');

  // Breadcrumb editing state
  const [editingBreadcrumbIndex, setEditingBreadcrumbIndex] = useState<number | null>(null);
  const [editingBreadcrumbText, setEditingBreadcrumbText] = useState('');

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || 'https://giuliana-gadolinic-corporately.ngrok-free.dev';
  const BEARER_TOKEN = (store.getState() as any).block.token;
  const PAGE_SLUG = 'privacy';


  // Fetch privacy policy data from API
  const fetchPrivacyData = async (currentLocale: string = locale) => {
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
        setSectionIds(sectionIdMap);
        
        // Map API sections to our data structure
        const privacyHeroSection = getSectionContent(sections.find((s: any) => s.key === 'privacy_hero')) || {};
        const privacyContentSection = getSectionContent(sections.find((s: any) => s.key === 'privacy')) || {};
        
        // Extract breadcrumbs from config
        const breadcrumbsRaw = result.data.page?.config?.breadcrumbs;
        const breadcrumbs = Array.isArray(breadcrumbsRaw) ? breadcrumbsRaw : [];
        const homeBreadcrumb = breadcrumbs.find((b: any) => b.url === '/') || { name: 'Home', url: '/' };
        const currentBreadcrumb = breadcrumbs.find((b: any) => !b.url || b.url === '/privacy') || { name: 'Privacy Policy', url: '/privacy' };
        
        const parsedData: PrivacyPolicyData = {
          hero: {
            image: privacyHeroSection.hero_image?.url || ''
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
          }
        };

        setPrivacyData(parsedData);
        
        // Initialize form value with API data
        const initialFormValue = {
          privacy_hero: {
            hero_image: privacyHeroSection.hero_image || { url: '', alt: '' }
          },
          privacy: {
            heading: privacyContentSection.heading || '',
            description: privacyContentSection.description || ''
          },
          config: {
            breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : [
              { name: homeBreadcrumb.name, url: homeBreadcrumb.url || '/' },
              { name: currentBreadcrumb.name, url: currentBreadcrumb.url || '/privacy' }
            ]
          }
        };
        setFormValue(initialFormValue);
        
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('Error fetching privacy policy data:', err);
      
      // Check if it's a CORS error or connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Use fallback data when API is not available - show "N/A" for all content
        const fallbackData: PrivacyPolicyData = {
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
          }
        };
        
        const fallbackFormValue = {
          privacy_hero: {
            hero_image: { url: '', alt: '' }
          },
          privacy: {
            heading: 'N/A',
            description: 'N/A'
          }
        };
        
        setPrivacyData(fallbackData);
        setFormValue(fallbackFormValue);
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

  // Update form value helper
  const updateFormValue = (path: string, value: any) => {
    setFormValue((prev: any) => {
      if (!prev) return prev;
      const keys = path.split('.');
      const newValue = { ...prev };
      let current = newValue;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newValue;
    });
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  // Handle image upload
  const handleImageClick = async (fieldPath: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('image', file);
        
        // Determine folder based on field path
        let folder = 'privacy-images';
        if (fieldPath.includes('hero')) {
          folder = 'hero-images';
        }
        
        formData.append('folder', folder);

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
          if (result.success && result.data?.url) {
            const imageData = {
              url: `${API_BASE_URL}${result.data.path}`,
              alt: file.name
            };
            updateFormValue(fieldPath, imageData);
          }
        } else {
          console.error('Image upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    };
    
    input.click();
  };


  // Validate and prepare data for API
  const validateAndPrepareData = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    return value || '';
  };

  // Handle publish
  const handlePublish = async () => {
    if (!privacyData) return;

    try {
      setIsLoading(true);
      
      const sections = [
        {
          section_id: sectionIds.privacy_hero, // Dynamic section ID from API response
          content: {
            hero_image: validateAndPrepareData(formValue.privacy_hero?.hero_image),
          }
        },
        {
          section_id: sectionIds.privacy, // Dynamic section ID from API response
          content: {
            heading: validateAndPrepareData(formValue.privacy?.heading),
            description: validateAndPrepareData(formValue.privacy?.description),
          }
        }
      ];

      const requestBody = {
        locale: locale,
        sections: sections,
        config: formValue.config || {}
      };

      
      const response = await updatePageData(3, requestBody);

      if (response.status === 200) {
        toast.success('Privacy policy published successfully!');
        await fetchPrivacyData(locale);
      } else {
        throw new Error('Failed to publish privacy policy');
      }
    } catch (err) {
      console.error('Error publishing privacy policy:', err);
      toast.error('Error publishing privacy policy');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacyData(locale);
  }, [locale]);

  // Handle text editing
  const handleTextClick = (field: string, value: any) => {
    setEditingField(field);
    setEditingText(typeof value === 'object' ? JSON.stringify(value) : (value || ''));
  };

  const handleTextSave = () => {
    if (editingField) {
      updateFormValue(editingField, editingText);
      setEditingField('');
      setEditingText('');
    }
  };

  const handleTextCancel = () => {
    setEditingField('');
    setEditingText('');
  };


  // Render field editor based on field type
  const renderFieldEditor = (fieldPath: string, value: any, fieldType: string, label?: string) => {
    const handleFieldClick = () => {
      if (fieldType === 'textarea') {
        setEditingFieldPath(fieldPath);
        setEditingFieldValue(value || '');
        setShowTextEditor(true);
      } else if (fieldType === 'media') {
        handleImageClick(fieldPath);
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
    } else if (fieldType === 'textarea') {
      return (
        <span
          onClick={handleFieldClick}
          style={{
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '3px',
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
          borderRadius: '4px',
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
        {value || label || 'Click to edit'}
      </span>
    );
  };

  // EditableText component
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
          style={{
            padding: '4px 8px',
            border: '2px solid var(--color-action-blue)',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'var(--background)',
            minWidth: '100px'
          }}
          placeholder={placeholder}
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
          borderRadius: '4px',
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
          <h3>Error Loading Privacy Policy Data</h3>
          <p>{error}</p>
          <button onClick={() => fetchPrivacyData(locale)} className="theme-btn-next">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!privacyData) {
    return (
      <div className="header-footer-settings">
        <div className="header-footer-settings__error">
          <h3>No Data Available</h3>
          <p>No privacy policy data was found.</p>
          <button onClick={() => fetchPrivacyData(locale)} className="theme-btn-next">
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
          Privacy Policy Page
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

      {/* PUBLISH Bar */}
      <div className="header-footer-settings__publish-bar" onClick={handlePublish}>
        <div className="header-footer-settings__publish-text">PUBLISH</div>
      </div>

      {/* Main Content Area */}
      <div className="header-footer-settings__main-content">
        {/* Template Preview */}
        <div className="header-footer-settings__template-preview">
          {/* Privacy Policy Template */}
          <div className="header-footer-settings__privacy-template">
            {/* Hero Image Section */}
            <section 
              style={{
                position: 'relative',
                height: '400px',
                backgroundImage: formValue.privacy_hero?.hero_image?.url ? `url(${getFullImageUrl(formValue.privacy_hero.hero_image.url)})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Hero Image Upload Button */}
              <button
                onClick={() => handleImageClick('privacy_hero.hero_image')}
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
                {formValue.privacy_hero?.hero_image?.url ? 'Change Hero Image' : 'Upload Hero Image'}
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
                      {breadcrumb.name || (index === 0 ? (privacyData?.breadcrumb?.home?.text || 'Home') : (privacyData?.breadcrumb?.privacy?.text || 'Privacy Policy'))}
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
                            { name: privacyData?.breadcrumb?.privacy?.text || 'Privacy Policy', url: '/privacy' }
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
                              { name: privacyData?.breadcrumb?.privacy?.text || 'Privacy Policy', url: '/privacy' }
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
                        setEditingBreadcrumbText(privacyData?.breadcrumb?.home?.text || 'Home');
                      }}
                      style={{ 
                        cursor: 'pointer', 
                        background: 'none', 
                        border: 'none', 
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      {privacyData?.breadcrumb?.home?.text || 'Home'}
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
                            { name: privacyData?.breadcrumb?.home?.text || 'Home', url: '/' },
                            { name: editingBreadcrumbText, url: '/privacy' }
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
                              { name: privacyData?.breadcrumb?.home?.text || 'Home', url: '/' },
                              { name: editingBreadcrumbText, url: '/privacy' }
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
                        setEditingBreadcrumbText(privacyData?.breadcrumb?.privacy?.text || 'Privacy Policy');
                      }}
                      style={{ 
                        cursor: 'pointer', 
                        background: 'none', 
                        border: 'none', 
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      {privacyData?.breadcrumb?.privacy?.text || 'Privacy Policy'}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Main Content */}
            <div style={{
              backgroundColor: 'var(--background)',
              padding: '40px',
              minHeight: 'calc(100vh - 200px)'
            }}>
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
              }}>
                {/* Title */}
                {(formValue.privacy?.heading || privacyData.content.heading) && (
                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: 'var(--color-text-dark)',
                    marginBottom: '30px',
                    textAlign: 'left'
                  }}>
                    {renderFieldEditor('privacy.heading', formValue.privacy?.heading || privacyData.content.heading, 'text')}
                  </h1>
                )}

                {/* Description */}
                {(formValue.privacy?.description || privacyData.content.description) && (
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: '#555',
                    marginBottom: '20px'
                  }}>
                    {renderFieldEditor('privacy.description', formValue.privacy?.description || privacyData.content.description, 'textarea')}
                  </div>
                )}

                {/* Show message if no content available */}
                {!(formValue.privacy?.heading || privacyData.content.heading) && !(formValue.privacy?.description || privacyData.content.description) && (
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '18px',
                    backgroundColor: 'var(--color-surface-snow)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border-subtle)'
                  }}>
                    No privacy policy content available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Text</h3>
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
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowTextEditor(false)}
                style={{
                  padding: '8px 16px',
                  marginRight: '10px',
                  backgroundColor: 'var(--color-text-slate)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateFormValue(editingFieldPath, editingFieldValue);
                  setShowTextEditor(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-action-blue)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicySettings;
