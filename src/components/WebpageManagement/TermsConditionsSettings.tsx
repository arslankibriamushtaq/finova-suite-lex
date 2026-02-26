import React, { useState, useEffect } from 'react';
import { store } from '../../redux/store';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import  ClassicEditor  from '@ckeditor/ckeditor5-build-classic';
import { getPageData, updatePageData } from '../../redux/apis/apisCrudWebPageManagement';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';

interface TermsConditionsData {
  hero: {
    image: string;
  };
  breadcrumb: {
    home: { text: string; url: string };
    terms: { text: string; url: string };
  };
  content: {
    heading: string;
    description: string;
  };
}

const TermsConditionsSettings: React.FC = () => {
  const [termsData, setTermsData] = useState<TermsConditionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [editingText, setEditingText] = useState('');
  const [editingFieldPath, setEditingFieldPath] = useState<string>('');
  const [editingFieldValue, setEditingFieldValue] = useState<string>('');
  const [formValue, setFormValue] = useState<any>({});
  const [sectionIds, setSectionIds] = useState<any>({});
  const [sectionsSchema, setSectionsSchema] = useState<any>({});
  const [showRepeaterModal, setShowRepeaterModal] = useState(false);
  const [editingRepeaterField, setEditingRepeaterField] = useState('');
  const [editingRepeaterData, setEditingRepeaterData] = useState<any[]>([]);
  const [locale, setLocale] = useState<string>('en');

  // Breadcrumb editing state
  const [editingBreadcrumbIndex, setEditingBreadcrumbIndex] = useState<number | null>(null);
  const [editingBreadcrumbText, setEditingBreadcrumbText] = useState('');
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || 'https://giuliana-gadolinic-corporately.ngrok-free.dev';
  const BEARER_TOKEN = (store.getState() as any).block.token;
  const PAGE_SLUG = 'terms';
  const PAGE_ID = 4; // Assuming terms page has ID 4

  const getSectionContent = (section: any) => {
    if (!section || !section.translations || section.translations.length === 0) {
      return {};
    }
    return section.translations[0].content || {};
  };

  // Helper function to construct full image URL
  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

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

  const handleTextClick = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingText(currentValue);
  };

  const handleTextSave = () => {
    if (!formValue) return;

    const fieldParts = editingField.split('.');
    const fullPath = fieldParts.join('.');
    updateFormValue(fullPath, editingText);
    
    setEditingField('');
    setEditingText('');
  };

  const handleTextCancel = () => {
    setEditingField('');
    setEditingText('');
  };

  // Dynamic field editor based on field_type
  const renderFieldEditor = (fieldPath: string, value: any, fieldType: string, label?: string, schema?: any) => {
    // Get value from formValue instead of passed value
    const getFormValue = (path: string) => {
      const pathParts = path.split('.');
      let current: any = formValue;
      for (const part of pathParts) {
        if (current && typeof current === 'object') {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return current;
    };
    
    const currentValue = getFormValue(fieldPath) || value;
    const handleFieldClick = (e: React.MouseEvent) => {
      e.preventDefault();
      
      if (fieldType === 'textarea') {
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
      const isEditing = editingField === fieldPath;
      
      if (isEditing) {
        return (
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTextSave();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleTextCancel();
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                if (editingField === fieldPath) {
                  handleTextSave();
                }
              }, 100);
            }}
            placeholder={label || 'Enter text'}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#333',
              backgroundColor: '#f5f5f5',
              outline: 'none',
            }}
            autoFocus
          />
        );
      }

      return (
        <span
          onClick={() => handleTextClick(fieldPath, value || '')}
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
          {value || label || 'Click to edit'}
        </span>
      );
    } else if (fieldType === 'textarea') {
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
            padding: '8px',
            borderRadius: '4px',
            border: '2px dashed #ccc',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f8ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
          }}
        >
          {currentValue?.url ? (
            <img 
              src={getFullImageUrl(currentValue.url)} 
              alt={currentValue.alt || 'Uploaded image'} 
              style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
            />
          ) : (
            <span style={{ color: '#666' }}>Click to upload image</span>
          )}
        </div>
      );
    } else if (fieldType === 'repeater') {
      if (schema?.ui?.fields) {
        // Handle structured repeater (like criteria with icon and title)
        return (
          <div>
            {Array.isArray(currentValue) && currentValue.map((item: any, index: number) => (
              <div key={index} style={{ 
                marginBottom: '8px', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Icon field */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Icon:
                    </label>
                    {renderFieldEditor(
                      `${fieldPath}.${index}.icon`,
                      item.icon,
                      schema.ui.fields.icon.type || 'media',
                      'Criteria Icon',
                      schema.ui.fields.icon
                    )}
                  </div>
                  
                  {/* Title field */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Title:
                    </label>
                    {renderFieldEditor(
                      `${fieldPath}.${index}.title`,
                      item.title,
                      schema.ui.fields.title.type || 'text',
                      'Criteria Title',
                      schema.ui.fields.title
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      } else {
        // Handle other repeater types (like CTA buttons) with separate modals
        return (
          <div>
            {Array.isArray(currentValue) && currentValue.map((item: any, index: number) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <button 
                  onClick={(e: any) => {
                    e.preventDefault();
                    setEditingRepeaterField(`${fieldPath}.${index}`);
                    setEditingRepeaterData([item]);
                    setShowRepeaterModal(true);
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Edit Item {index + 1}
                </button>
                <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                  {typeof item === 'object' ? JSON.stringify(item) : item}
                </span>
              </div>
            ))}
          </div>
        );
      }
    } else if (fieldType === 'group') {
      // Handle group fields
      if (schema?.ui?.fields) {
        return (
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '10px', 
            backgroundColor: '#f9f9f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {Object.entries(schema.ui.fields).map(([childKey, childField]: [string, any]) => {
              const childValue = currentValue?.[childKey];
              const childType = childField.type || 'text';
              const childLabel = childField.label || childKey;
              
              return (
                <div key={childKey} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                    {childLabel}:
                  </label>
                  {renderFieldEditor(
                    `${fieldPath}.${childKey}`,
                    childValue,
                    childType,
                    childLabel,
                    childField
                  )}
                </div>
              );
            })}
          </div>
        );
      }
    }

    return (
      <div
        onClick={handleFieldClick}
        style={{
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
          minHeight: fieldType === 'textarea' ? '60px' : 'auto'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f8ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {fieldType === 'textarea' ? (
          <div 
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: currentValue || 'Click to edit...' }}
          />
        ) : (
          <span>{currentValue || 'Click to edit...'}</span>
        )}
      </div>
    );
  };

  const handleTextEditorSave = () => {
    if (editingFieldPath && editingFieldValue !== undefined) {
      updateFormValue(editingFieldPath, editingFieldValue);
    }
    
    setShowTextEditor(false);
    setEditingFieldPath('');
    setEditingFieldValue('');
  };

  const handleTextEditorCancel = () => {
    setShowTextEditor(false);
    setEditingFieldPath('');
    setEditingFieldValue('');
  };

  const handleRepeaterSave = () => {
    if (editingRepeaterField && editingRepeaterData) {
      updateFormValue(editingRepeaterField, editingRepeaterData);
    }
    
    setShowRepeaterModal(false);
    setEditingRepeaterField('');
    setEditingRepeaterData([]);
  };

  const handleRepeaterCancel = () => {
    setShowRepeaterModal(false);
    setEditingRepeaterField('');
    setEditingRepeaterData([]);
  };

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
        let folder = `${PAGE_SLUG}-images`;
        formData.append('folder', folder);

        const response = await fetch(`${API_BASE_URL}/api/v1/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data?.url) {
          // Construct full URL from the relative path
          const fullUrl =`${API_BASE_URL}${result.data.path}`;
          
          // Update the form value with the new image URL
          updateFormValue(fieldPath, {
            url: fullUrl,
            alt: result.data.filename || 'Uploaded image'
          });
          toast.success('Image uploaded successfully!');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Failed to upload image');
      }
    };
    
    input.click();
  };

  const handlePublish = async () => {
    try {
      const validateAndPrepareData = () => {
        const sections = [];
        
        // Prepare terms_hero section
        if (formValue.terms_hero) {
          sections.push({
            section_id: sectionIds.terms_hero, // Dynamic section ID from API response
            content: formValue.terms_hero
          });
        }
        
        // Prepare terms section
        if (formValue.terms) {
          sections.push({
            section_id: sectionIds.terms, // Dynamic section ID from API response
            content: formValue.terms
          });
        }
        
        return sections;
      };

      const sections = validateAndPrepareData();
      
      if (sections.length === 0) {
        toast.error('No changes to publish');
        return;
      }


      const response = await updatePageData(PAGE_ID, {
        locale: locale,
        sections: sections,
        config: formValue.config || {}
      });

      if (response.status === 200) {
        const result = response.data;
        toast.success('Terms & Conditions published successfully!');
        
        // Refresh data after successful publish
        setTimeout(() => {
          fetchTermsData(locale);
        }, 1000);
      } else {
        throw new Error(response.data.message || 'Publish failed');
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish changes');
    }
  };

  const fetchTermsData = async (currentLocale: string = locale) => {
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
        
        // Map API sections to our data structure
        const termsHeroSection = getSectionContent(sections.find((s: any) => s.key === 'terms_hero')) || {};
        const termsContentSection = getSectionContent(sections.find((s: any) => s.key === 'terms')) || {};
        
        // Extract breadcrumbs from config
        const breadcrumbsRaw = result.data.page?.config?.breadcrumbs;
        const breadcrumbs = Array.isArray(breadcrumbsRaw) ? breadcrumbsRaw : [];
        const homeBreadcrumb = breadcrumbs.find((b: any) => b.url === '/') || { name: 'Home', url: '/' };
        const currentBreadcrumb = breadcrumbs.find((b: any) => !b.url || b.url === '/terms') || { name: 'Terms and Conditions', url: '/terms' };
        
        const parsedData: TermsConditionsData = {
          hero: {
            image: getFullImageUrl(termsHeroSection.hero_image?.url || '')
          },
          breadcrumb: {
            home: { 
              text: homeBreadcrumb.name, 
              url: homeBreadcrumb.url 
            },
            terms: { 
              text: currentBreadcrumb.name, 
              url: currentBreadcrumb.url || '/terms' 
            }
          },
          content: {
            heading: termsContentSection.heading || '',
            description: termsContentSection.description || ''
          }
        };

        setTermsData(parsedData);
        
        // Initialize form value with parsed data
        const fallbackFormValue = {
          terms_hero: {
            hero_image: {
              url: getFullImageUrl(termsHeroSection.hero_image?.url || ''),
              alt: termsHeroSection.hero_image?.alt || ''
            }
          },
          terms: {
            heading: termsContentSection.heading || '',
            description: termsContentSection.description || ''
          },
          config: {
            breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : [
              { name: homeBreadcrumb.name, url: homeBreadcrumb.url || '/' },
              { name: currentBreadcrumb.name, url: currentBreadcrumb.url || '/terms' }
            ]
          }
        };
        
        setFormValue(fallbackFormValue);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('Error fetching terms & conditions data:', err);
      
      // Check if it's a CORS error or connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Use fallback data when API is not available - show "N/A" for all content
        const fallbackData: TermsConditionsData = {
          hero: {
            image: ''
          },
          breadcrumb: {
            home: { text: 'Home', url: '/' },
            terms: { text: 'Terms and Conditions', url: '/terms' }
          },
          content: {
            heading: 'N/A',
            description: 'N/A'
          }
        };
        
        const fallbackFormValue = {
          terms_hero: {
            hero_image: { url: '', alt: '' }
          },
          terms: {
            heading: 'N/A',
            description: 'N/A'
          }
        };
        
        setTermsData(fallbackData);
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

  useEffect(() => {
    fetchTermsData(locale);
  }, [locale]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'red',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h3>Error Loading Terms & Conditions</h3>
        <p>{error}</p>
        <button 
          onClick={() => fetchTermsData(locale)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!termsData) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px',
        border: '1px solid #e0e0e0'
      }}>
        No terms & conditions data available.
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Header with Language Switcher */}
      <div className="header-footer-settings__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
        <h2 className="header-footer-settings__header-title" style={{ margin: 0 }}>
          Terms & Conditions Page
        </h2>
        {/* Language Switcher */}
        <div 
          className="header-footer-settings__landing-language" 
          style={{ 
            color: '#000000', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: '#f9f9f9',
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

      {/* Hero Image Section */}
      <section 
        onClick={() => handleImageClick('terms_hero.hero_image')}
        style={{
          position: 'relative',
          height: '400px',
          backgroundImage: (formValue.terms_hero?.hero_image?.url || termsData.hero.image) ? `url("${getFullImageUrl(formValue.terms_hero?.hero_image?.url || termsData.hero.image)}")` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          cursor: 'pointer'
        }}
      >
        {/* Overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }} />
        
        {/* Upload/Change Image Button */}
        {!(formValue.terms_hero?.hero_image?.url || termsData.hero.image) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '20px 40px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            Upload Hero Image
          </div>
        )}
        
        {(formValue.terms_hero?.hero_image?.url || termsData.hero.image) && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            Click to change image
          </div>
        )}
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
                  border: '2px solid #007bff',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 'inherit',
                  background: 'white',
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
                {breadcrumb.name || (index === 0 ? (termsData?.breadcrumb?.home?.text || 'Home') : (termsData?.breadcrumb?.terms?.text || 'Terms and Conditions'))}
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
                      { name: termsData?.breadcrumb?.terms?.text || 'Terms and Conditions', url: '/terms' }
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
                        { name: termsData?.breadcrumb?.terms?.text || 'Terms and Conditions', url: '/terms' }
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
                  border: '2px solid #007bff',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 'inherit',
                  background: 'white',
                  minWidth: '100px'
                }}
              />
            ) : (
              <button 
                className="header-footer-settings__breadcrumb-button"
                onClick={() => {
                  setEditingBreadcrumbIndex(0);
                  setEditingBreadcrumbText(termsData?.breadcrumb?.home?.text || 'Home');
                }}
                style={{ 
                  cursor: 'pointer', 
                  background: 'none', 
                  border: 'none', 
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                {termsData?.breadcrumb?.home?.text || 'Home'}
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
                      { name: termsData?.breadcrumb?.home?.text || 'Home', url: '/' },
                      { name: editingBreadcrumbText, url: '/terms' }
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
                        { name: termsData?.breadcrumb?.home?.text || 'Home', url: '/' },
                        { name: editingBreadcrumbText, url: '/terms' }
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
                  border: '2px solid #007bff',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 'inherit',
                  background: 'white',
                  minWidth: '100px'
                }}
              />
            ) : (
              <button 
                className="header-footer-settings__breadcrumb-button"
                onClick={() => {
                  setEditingBreadcrumbIndex(1);
                  setEditingBreadcrumbText(termsData?.breadcrumb?.terms?.text || 'Terms and Conditions');
                }}
                style={{ 
                  cursor: 'pointer', 
                  background: 'none', 
                  border: 'none', 
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                {termsData?.breadcrumb?.terms?.text || 'Terms and Conditions'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          {/* Title */}
          {(formValue.terms?.heading || termsData.content.heading) && (
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              {renderFieldEditor(
                'terms.heading',
                formValue.terms?.heading || termsData.content.heading,
                sectionsSchema.terms?.heading?.field_type || 'text',
                'Terms and Conditions Heading',
                sectionsSchema.terms?.heading
              )}
            </h1>
          )}

          {/* Description */}
          {(formValue.terms?.description || termsData.content.description) && (
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#555',
              marginBottom: '30px'
            }}>
              {renderFieldEditor(
                'terms.description',
                formValue.terms?.description || termsData.content.description,
                sectionsSchema.terms?.description?.field_type || 'textarea',
                'Description',
                sectionsSchema.terms?.description
              )}
            </div>
          )}

          {/* Show message if no content available */}
          {!(formValue.terms?.heading || termsData.content.heading) && !(formValue.terms?.description || termsData.content.description) && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              fontSize: '18px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              No terms & conditions content available.
            </div>
          )}
        </div>
      </div>

      {/* Repeater Modal */}
      {showRepeaterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>Edit Repeater Field</h3>
            <div style={{ marginBottom: '20px' }}>
              {editingRepeaterData.map((item, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <h4>Item {index + 1}</h4>
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        {key}:
                      </label>
                      <input
                        type="text"
                        value={value as string}
                        onChange={(e) => {
                          const newData = [...editingRepeaterData];
                          newData[index] = { ...newData[index], [key]: e.target.value };
                          setEditingRepeaterData(newData);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  updateFormValue(editingRepeaterField, editingRepeaterData);
                  setShowRepeaterModal(false);
                  setEditingRepeaterField('');
                  setEditingRepeaterData([]);
                }}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowRepeaterModal(false);
                  setEditingRepeaterField('');
                  setEditingRepeaterData([]);
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Editor Modal */}
      {showTextEditor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>Edit Content</h3>
            <div style={{ marginBottom: '20px' }}>
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleTextEditorSave}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={handleTextEditorCancel}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>Edit Repeater Field</h3>
            <div style={{ marginBottom: '20px' }}>
              {editingRepeaterData.map((item, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <h4>Item {index + 1}</h4>
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        {key}:
                      </label>
                      <input
                        type="text"
                        value={value as string}
                        onChange={(e) => {
                          const newData = [...editingRepeaterData];
                          newData[index] = { ...newData[index], [key]: e.target.value };
                          setEditingRepeaterData(newData);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRepeaterSave}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={handleRepeaterCancel}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsConditionsSettings;
