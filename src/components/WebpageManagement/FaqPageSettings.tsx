import React, { useState, useEffect } from 'react';
import { Images } from '../Config/Images';
import { store } from '../../redux/store';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { getPageData, updatePageData } from '../../redux/apis/apisCrudWebPageManagement';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';

// Types for FAQ page data
interface FaqPageData {
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
    faq: { text: string; url: string };
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

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

const FaqPageSettings = () => {
  
  // UI States
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingFieldPath, setEditingFieldPath] = useState<any>('');
  const [editingFieldValue, setEditingFieldValue] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [formValue, setFormValue] = useState<any>({});
  const [sectionIds, setSectionIds] = useState<any>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [sectionsSchema, setSectionsSchema] = useState<any>({});
  const [faqData, setFaqData] = useState<FaqPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>('en');

  // Breadcrumb editing state
  const [editingBreadcrumbIndex, setEditingBreadcrumbIndex] = useState<number | null>(null);
  const [editingBreadcrumbText, setEditingBreadcrumbText] = useState('');

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || 'https://giuliana-gadolinic-corporately.ngrok-free.dev';
  const BEARER_TOKEN = (store.getState() as any).block.token;
  const PAGE_SLUG = 'faq';

  const fetchFaqData = async (currentLocale: string = locale) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getPageData(PAGE_SLUG, currentLocale);
      const result = response.data;
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        
        // Map section keys to schema and store section IDs
        const schemaMap: any = {};
        const sectionIdMap: any = {};
        sections.forEach((section: any) => {
          schemaMap[section.key] = section.schema;
          sectionIdMap[section.key] = section.id;
        });
        setSectionsSchema(schemaMap);
        setSectionIds(sectionIdMap);
        
        const faqHeroSection = getSectionContent(sections.find((s: any) => s.key === 'faq_hero')) || {};
        const faqIntroSection = getSectionContent(sections.find((s: any) => s.key === 'faq_intro')) || {};
        const faqListSection = getSectionContent(sections.find((s: any) => s.key === 'faq_list')) || {};
        
        // Extract breadcrumbs from config
        const breadcrumbsRaw = result.data.page?.config?.breadcrumbs;
        const breadcrumbs = Array.isArray(breadcrumbsRaw) ? breadcrumbsRaw : [];
        const homeBreadcrumb = breadcrumbs.find((b: any) => b.url === '/') || { name: 'Home', url: '/' };
        const currentBreadcrumb = breadcrumbs.find((b: any) => !b.url) || { name: 'FAQ' };
        
        const parsedData: FaqPageData = {
          header: {
            logo: Images.FactoringLogo,
            navigation: {
              about: { text: 'About', url: '/about' },
              contact: { text: 'Contact', url: '/contact' }
            }
          },
          hero: {
            image: faqHeroSection.hero_image?.url || '',
            title: faqIntroSection.heading || 'Frequently Asked Questions'
          },
          breadcrumb: {
            home: { 
              text: homeBreadcrumb.name, 
              url: homeBreadcrumb.url 
            },
            faq: { 
              text: currentBreadcrumb.name, 
              url: currentBreadcrumb.url || '/faq' 
            }
          },
          faqs: faqListSection.faqs || []
        };

        setFaqData(parsedData);
        
        // Initialize form values for editing
        setFormValue({
          faq_hero: {
            hero_image: faqHeroSection.hero_image || { url: '', alt: '' }
          },
          faq_intro: {
            heading: faqIntroSection.heading || 'Frequently Asked Questions',
            sub_heading: faqIntroSection.sub_heading || ''
          },
          faq_list: {
            faqs: faqListSection.faqs || []
          },
          config: {
            breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : [
              { name: homeBreadcrumb.name, url: homeBreadcrumb.url || '/' },
              { name: currentBreadcrumb.name, url: currentBreadcrumb.url || '/faq' }
            ]
          }
        });
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('Error fetching FAQ data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqData(locale);
  }, [locale]);

  const handleDeleteFaq = (index: number) => {
    const currentFaqs = formValue.faq_list?.faqs || [];
    const updatedFaqs = currentFaqs.filter((_: any, i: number) => i !== index);
    updateFormValue('faq_list.faqs', updatedFaqs);
    
    // Also remove from expanded items if it was expanded
    const newExpanded = new Set(expandedItems);
    newExpanded.delete(index);
    setExpandedItems(newExpanded);
    
    // Adjust expanded items indices for items after the deleted one
    const adjustedExpanded = new Set<number>();
    newExpanded.forEach((expIndex) => {
      if (expIndex > index) {
        adjustedExpanded.add(expIndex - 1);
      } else {
        adjustedExpanded.add(expIndex);
      }
    });
    setExpandedItems(adjustedExpanded);
    
    // Close modal
    setShowDeleteModal(false);
    setFaqToDelete(null);
  };

  const confirmDeleteFaq = (index: number) => {
    setFaqToDelete(index);
    setShowDeleteModal(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const currentFaqs = formValue.faq_list?.faqs || [];
    const draggedFaq = currentFaqs[draggedIndex];
    
    // Create new array with dragged item moved to new position
    const newFaqs = [...currentFaqs];
    newFaqs.splice(draggedIndex, 1); // Remove from original position
    newFaqs.splice(dropIndex, 0, draggedFaq); // Insert at new position
    
    updateFormValue('faq_list.faqs', newFaqs);
    
    // Update expanded items to reflect new positions
    const newExpanded = new Set<number>();
    expandedItems.forEach(expIndex => {
      if (draggedIndex < dropIndex) {
        // Moving down
        if (expIndex === draggedIndex) {
          newExpanded.add(dropIndex);
        } else if (expIndex > draggedIndex && expIndex <= dropIndex) {
          newExpanded.add(expIndex - 1);
        } else {
          newExpanded.add(expIndex);
        }
      } else {
        // Moving up
        if (expIndex === draggedIndex) {
          newExpanded.add(dropIndex);
        } else if (expIndex >= dropIndex && expIndex < draggedIndex) {
          newExpanded.add(expIndex + 1);
        } else {
          newExpanded.add(expIndex);
        }
      }
    });
    setExpandedItems(newExpanded);
    
    setDraggedIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Render field editor based on field type
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
            value={value || ''}
            onChange={(e) => updateFormValue(fieldPath, e.target.value)}
            onBlur={() => setEditingFieldPath('')}
            style={{
              width: '100%',
              padding: '5px',
              border: '2px solid var(--color-action-blue)',
              borderRadius: '4px'
            }}
            autoFocus
          />
        );
      }
      return (
        <span
          onClick={() => setEditingFieldPath(fieldPath)}
          style={{ cursor: 'pointer', display: 'inline-block' }}
        >
          {value || 'Click to edit'}
        </span>
      );
    }

    if (fieldType === 'textarea') {
      return (
        <div 
          onClick={() => {
            setEditingFieldPath(fieldPath);
            setEditingFieldValue(value || '');
            setShowTextEditor(true);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div dangerouslySetInnerHTML={{ __html: value || '' }} />
        </div>
      );
    }

    if (fieldType === 'media') {
      return (
        <div 
          onClick={() => handleImageClick(fieldPath)}
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
            <img 
              src={getFullImageUrl(value.url, API_BASE_URL)} 
              alt={value.alt || 'Image'} 
              style={{ maxWidth: '100%', maxHeight: '200px' }} 
            />
          ) : (
            `Click to upload ${placeholder || 'image'}`
          )}
        </div>
      );
    }

    return <span>{value || 'N/A'}</span>;
  };

  const updateFormValue = (path: string, value: any) => {
    const keys = path.split('.');
    setFormValue((prev: any) => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
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
          } else if (field.includes('faq')) {
            folder = 'faq-images';
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
          
          if (result.success && result.data && result.data.path) {
            // Construct full URL from the relative path
            const fullUrl = `${API_BASE_URL}${result.data.path}`;
            
            // Update formValue with the uploaded image URL
            updateFormValue(field, {
              url: fullUrl,
              alt: result.data.alt || 'Uploaded image'
            });
            
          } else {
            throw new Error('Invalid response from upload API');
          }
        } catch (error) {
          console.error('❌ Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        }
      }
    };
    input.click();
  };

  // Helper function to validate and ensure proper structure
  const validateAndPrepareData = (data: any, fieldName: string) => {
    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === 'object' && data !== null) {
      return data;
    } else {
      return data;
    }
  };

  const handlePublish = async () => {
    if (!faqData) return;

    try {
      setIsLoading(true);
      
      // Prepare sections data for the API with proper structure validation using dynamic section IDs
      const sections = [
        {
          section_id: sectionIds.faq_hero, // Dynamic section ID from API response
          content: {
            hero_image: validateAndPrepareData(formValue.faq_hero?.hero_image, 'faq_hero.hero_image'),
          }
        },
        {
          section_id: sectionIds.faq_intro, // Dynamic section ID from API response
          content: {
            heading: validateAndPrepareData(formValue.faq_intro?.heading, 'faq_intro.heading'),
            sub_heading: validateAndPrepareData(formValue.faq_intro?.sub_heading, 'faq_intro.sub_heading'),
          }
        },
        {
          section_id: sectionIds.faq_list, // Dynamic section ID from API response
          content: {
            faqs: validateAndPrepareData(formValue.faq_list?.faqs, 'faq_list.faqs'),
          }
        }
      ];

      const requestBody = {
        locale: locale,
        sections: sections,
        config: formValue.config || {}
      };

      
      const response = await updatePageData(7, requestBody);

      if (response.status === 200) {
        // Show success toast
        toast.success('FAQ page published successfully!');
        // Fetch updated data from API
        await fetchFaqData(locale);
      } else {
        const errorData = response.data?.message || 'Unknown error';
        console.error('❌ Publish failed:', errorData);
        toast.error(`Failed to publish FAQ page: ${errorData}`);
      }
    } catch (error) {
      console.error('❌ Publish error:', error);
      
      toast.error('Failed to publish FAQ page');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <div>Error: {error}</div>;
  if (!faqData) return <div>No data available</div>;

  return (
    <div style={{ padding: '20px' }}>
      {/* PUBLISH Bar */}
      {/* Header with Language Switcher */}
      <div className="header-footer-settings__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h2 className="header-footer-settings__header-title" style={{ margin: 0 }}>
          FAQ Page
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

      <div className="header-footer-settings__publish-bar" onClick={handlePublish}>
        <div className="header-footer-settings__publish-text">
          {isLoading ? 'Publishing...' : 'PUBLISH'}
        </div>
      </div>

      {/* FAQ Template with Inline Editing */}
      <div className="header-footer-settings__landing-template">

        {/* Hero Section */}
        <section style={{
          position: 'relative',
          height: '300px',
          backgroundImage: formValue.faq_hero?.hero_image?.url ? `url("${getFullImageUrl(formValue.faq_hero.hero_image.url, API_BASE_URL)}")` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {/* Hero Image Upload Button */}
          <button
            onClick={() => handleImageClick('faq_hero.hero_image')}
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
            {formValue.faq_hero?.hero_image?.url ? 'Change Hero Image' : 'Upload Hero Image'}
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
                  {breadcrumb.name || (index === 0 ? (faqData?.breadcrumb?.home?.text || 'Home') : (faqData?.breadcrumb?.faq?.text || 'FAQ'))}
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
                        { name: faqData?.breadcrumb?.faq?.text || 'FAQ', url: '/faq' }
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
                          { name: faqData?.breadcrumb?.faq?.text || 'FAQ', url: '/faq' }
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
                    setEditingBreadcrumbText(faqData?.breadcrumb?.home?.text || 'Home');
                  }}
                  style={{ 
                    cursor: 'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  {faqData?.breadcrumb?.home?.text || 'Home'}
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
                        { name: faqData?.breadcrumb?.home?.text || 'Home', url: '/' },
                        { name: editingBreadcrumbText, url: '/faq' }
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
                          { name: faqData?.breadcrumb?.home?.text || 'Home', url: '/' },
                          { name: editingBreadcrumbText, url: '/faq' }
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
                    setEditingBreadcrumbText(faqData?.breadcrumb?.faq?.text || 'FAQ');
                  }}
                  style={{ 
                    cursor: 'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  {faqData?.breadcrumb?.faq?.text || 'FAQ'}
                </button>
              )}
            </>
          )}
        </div>

        {/* FAQ Content */}
        <section style={{
          backgroundColor: 'var(--color-surface-subtle)',
          padding: '60px 40px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--color-text-dark)',
            margin: '0 0 40px 0',
            textAlign: 'center'
          }}>
            {renderFieldEditor(
              'faq_intro.heading',
              formValue.faq_intro?.heading,
              sectionsSchema.faq_intro?.heading?.field_type || 'text',
              'Enter heading'
            )}
          </h1>

          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px',
              minHeight: '50px'
            }}
          >
            {(formValue.faq_list?.faqs || []).map((faq: any, index: number) => (
              <div 
                key={index} 
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                style={{
                  //backgroundColor: 'white',
                  color: 'black',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'move',
                  opacity: draggedIndex === index ? 0.5 : 1,
                  transform: draggedIndex === index ? 'rotate(2deg)' : 'none',
                  transition: 'all 0.2s ease',
                  border: draggedIndex === index ? '2px dashed var(--color-action-blue)' : dragOverIndex === index ? '2px dashed var(--color-status-active)' : '2px solid transparent',
                  backgroundColor: dragOverIndex === index ? 'var(--color-surface-snow)' : 'var(--background)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Drag Handle Icon */}
                  <div style={{ color: 'var(--color-text-subtle)', fontSize: '14px', userSelect: 'none' }}>
                    ⋮⋮
                  </div>
                  
                  <button
                    onClick={() => toggleExpanded(index)}
                    style={{
                      flex: 1,
                      padding: '0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: 'var(--color-text-dark)',
                      flex: 1
                    }}>
                      {renderFieldEditor(
                        `faq_list.faqs.${index}.question`,
                        faq.question,
                        'text',
                        locale === 'ar' ? 'أدخل السؤال' : 'Enter question'
                      )}
                    </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-teal-light-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      color: 'var(--foreground)',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {expandedItems.has(index) ? '−' : '+'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeleteFaq(index);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--theme-secondary)',
                        border: 'none',
                        color: 'var(--primary-foreground)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        padding: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#c82333';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
                      }}
                    >
                      {/* Trash/Delete Icon SVG */}
                      <svg 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                  </button>
                </div>

                {expandedItems.has(index) && (
                  <div style={{
                    paddingTop: '15px',
                    marginTop: '15px',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: 'var(--color-text-muted)',
                    borderTop: '1px solid #d0d0d0'
                  }}>
                    {renderFieldEditor(
                      `faq_list.faqs.${index}.answer`,
                      faq.answer,
                      'textarea',
                      locale === 'ar' ? 'أدخل الإجابة' : 'Enter answer'
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New FAQ Button */}
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button
              className="theme-btn-next"
              onClick={() => {
                const newFaq = { 
                  question: locale === 'ar' ? 'سؤال جديد' : 'New Question', 
                  answer: locale === 'ar' ? 'إجابة جديدة' : 'New Answer' 
                };
                const currentFaqs = formValue.faq_list?.faqs || [];
                updateFormValue('faq_list.faqs', [...currentFaqs, newFaq]);
                // Auto-expand the new FAQ
                setExpandedItems(prev => new Set([...prev, currentFaqs.length]));
              }}
            >
              {locale === 'ar' ? '+ إضافة سؤال جديد' : '+ Add New FAQ'}
            </button>
          </div>
        </section>

        {/* Footer */}
        {/* <footer className="header-footer-settings__landing-footer">
        </footer> */}
      </div>

      {/* Text Editor Modal */}
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
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <CKEditor
              editor={ClassicEditor as any}
              data={editingFieldValue}
              onChange={(_, editor) => {
                const data = editor.getData();
                setEditingFieldValue(data);
              }}
              config={{
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'mediaEmbed', 'undo', 'redo']
              }}
            />
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                className="theme-btn-next"
                onClick={() => { setShowTextEditor(false); setEditingFieldPath(''); }}
              >
                Cancel
              </button>
              <button 
                className="theme-btn-next"
                onClick={() => { updateFormValue(editingFieldPath, editingFieldValue); setShowTextEditor(false); setEditingFieldPath(''); }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
          zIndex: 10002
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: 'var(--theme-secondary)'
            }}>
              🗑️
            </div>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--color-text-dark)'
            }}>
              Delete FAQ
            </h3>
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFaqToDelete(null);
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--color-border-muted)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--color-text-muted)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--background)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (faqToDelete !== null) {
                    handleDeleteFaq(faqToDelete);
                  }
                }}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: 'var(--theme-secondary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqPageSettings;

