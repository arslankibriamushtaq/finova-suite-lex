import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Images } from '../Config/Images';
import { store } from '../../redux/store';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import toast from 'react-hot-toast';
import { getGlobalSections, updateGlobalSection } from '../../redux/apis/apisCrudWebPageManagement';
import Loader from '../Loader/Loader';
// URL for external RTL stylesheet
const rtlCssUrl = new URL('../../styles/arabic-rtl.css', import.meta.url).href;

// Types for API integration
interface GlobalSection {
  id: number;
  key: string;
  name: string;
  schema: any;
  translations: Array<{
    id: number;
    cms_section_id: number;
    locale: string;
    version: number;
    is_published: boolean;
    content: any;
    notes: string;
    created_by: number;
    created_at: string;
    updated_at: string;
  }>;
}

const GlobalSectionsSettings = () => {
  const [searchParams] = useSearchParams();
  
  // Get section info from URL params
  const sectionId = searchParams.get('section_id');
  const sectionKey = searchParams.get('section_key');
  
  // UI States
  const [editingText, setEditingText] = useState('');
  const [editingField, setEditingField] = useState('');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingFieldPath, setEditingFieldPath] = useState('');
  const [editingFieldValue, setEditingFieldValue] = useState('');
  const [showRepeaterModal, setShowRepeaterModal] = useState(false);
  const [editingRepeaterField, setEditingRepeaterField] = useState('');
  const [editingRepeaterData, setEditingRepeaterData] = useState<any[]>([]);
  const [editingRepeaterIndex, setEditingRepeaterIndex] = useState<number | null>(null);
  
  // External Link Modal State
  const [showExternalLinkModal, setShowExternalLinkModal] = useState(false);
  const [externalLinkText, setExternalLinkText] = useState('');
  const [externalLinkUrl, setExternalLinkUrl] = useState('');
  const [externalLinkMenuIndex, setExternalLinkMenuIndex] = useState<number | null>(null);
  
  // Section Data State
  const [sectionData, setSectionData] = useState<GlobalSection | null>(null);
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [formValue, setFormValue] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>('en');
  
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || '';
  const BEARER_TOKEN = (store.getState() as any).block.token;

  // Helper function to get content for a specific locale
  const getContentForLocale = (section: GlobalSection, locale: string) => {
    if (!section || !section.translations || section.translations.length === 0) {
      return null;
    }
    const translation = section.translations.find(t => t.locale === locale);
    return translation ? translation.content : (section.translations[0]?.content || null);
  };

  // Fetch specific section from API
  const fetchSectionData = async () => {
    if (!sectionId || !sectionKey) {
      setError('Missing section ID or key in URL parameters');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getGlobalSections();
      const result = response.data;
      
      if (result.success && result.data && result.data.data) {
        const sections = result.data.data;
        
        // Find the section matching both ID and key
        const section = sections.find(
          (s: GlobalSection) => s.id === parseInt(sectionId) && s.key === sectionKey
        );
        
        if (section) {
          setSectionData(section);
          const content = getContentForLocale(section, locale);
          setSectionContent(content);
          setFormValue(content || {});
        } else {
          setError(`Section with ID ${sectionId} and key ${sectionKey} not found`);
        }
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('Error fetching section data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Load section data on component mount and when locale changes
  useEffect(() => {
    fetchSectionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, sectionKey, locale]);

  // Inject RTL stylesheet for scoped RTL support (only for header/footer components)
  useEffect(() => {
    const existing = document.getElementById('rtl-css-link-global-settings') as HTMLLinkElement | null;
    if (!existing) {
      const link = document.createElement('link');
      link.id = 'rtl-css-link-global-settings';
      link.rel = 'stylesheet';
      link.href = rtlCssUrl;
      document.head.appendChild(link);
    }
  }, []);

  // Helper to get full image URL
  const getFullImageUrl = (url: string) => {
    if (!url) return Images.FactoringLogo;
    if (url.startsWith('http')) return url;
    // Ensure path starts with / and base URL doesn't end with /
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    const normalizedBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${normalizedBaseUrl}${normalizedPath}`;
  };

  // Helper function to update form values
  const updateFormValue = (path: string, value: any) => {
    setFormValue((prev: any) => {
      const newFormValue = JSON.parse(JSON.stringify(prev)); // Deep clone
      const pathParts = path.split('.');
      
      // Navigate to the parent of the target field
      let current: any = newFormValue;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const isNumericIndex = !isNaN(parseInt(part));
        
        if (isNumericIndex) {
          // Current is an array, access by index
          const index = parseInt(part);
          if (!Array.isArray(current)) {
            // This shouldn't happen, but handle it
            return newFormValue;
          }
          if (!current[index]) {
            current[index] = {};
          }
          current = current[index];
        } else {
          // Current is an object, access by property
          if (!current[part]) {
            // Check if next part is numeric (array index)
            if (i + 1 < pathParts.length - 1 && !isNaN(parseInt(pathParts[i + 1]))) {
              current[part] = [];
            } else {
              current[part] = {};
            }
          }
          current = current[part];
        }
      }
      
      // Set the value at the final path
      const lastPart = pathParts[pathParts.length - 1];
      current[lastPart] = value;
      
      return newFormValue;
    });
  };

  // Image upload handler
  const handleImageClick = async (fieldPath: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('folder', 'global-sections');
          
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
            // Use path from response and construct full URL with base URL
            const fileUrl = result.data?.path 
              ? getFullImageUrl(result.data.path)
              : '';
            
            if (!fileUrl) {
              throw new Error('No path in API response');
            }
            
            // For footer logo, it's a string URL in the API, not an object
            if (fieldPath === 'logo') {
              // Store as string URL directly
              updateFormValue(fieldPath, fileUrl);
            } else {
              // Check if this is a repeater field (contains array index in path)
              const pathParts = fieldPath.split('.');
              const hasArrayIndex = pathParts.some(part => !isNaN(parseInt(part)));
              
              if (hasArrayIndex) {
                // For repeater fields (like language_options.0.flag, social_links.0.icon)
                // Store as string URL directly
                updateFormValue(fieldPath, fileUrl);
                
                // If we're currently editing this repeater field in the modal, update editingRepeaterData
                if (showRepeaterModal && editingRepeaterField && editingRepeaterIndex !== null) {
                  const repeaterFieldName = pathParts[0];
                  const itemIndex = parseInt(pathParts[1]);
                  const fieldName = pathParts.slice(2).join('.');
                  
                  if (repeaterFieldName === editingRepeaterField && itemIndex === editingRepeaterIndex) {
                    const updatedData = [...editingRepeaterData];
                    if (updatedData[editingRepeaterIndex]) {
                      if (fieldName) {
                        // Nested field like language_options.0.flag
                        const nestedParts = fieldName.split('.');
                        let target = updatedData[editingRepeaterIndex];
                        for (let i = 0; i < nestedParts.length - 1; i++) {
                          if (!target[nestedParts[i]]) target[nestedParts[i]] = {};
                          target = target[nestedParts[i]];
                        }
                        target[nestedParts[nestedParts.length - 1]] = fileUrl;
                      } else {
                        // Direct field (shouldn't happen with nested paths, but just in case)
                        updatedData[editingRepeaterIndex] = { ...updatedData[editingRepeaterIndex], [fieldName]: fileUrl };
                      }
                      setEditingRepeaterData(updatedData);
                    }
                  }
                }
              } else {
                // For object fields, preserve structure with url and alt
                const currentValue = formValue[fieldPath] || {};
                const newValue = {
                  ...currentValue,
                  url: fileUrl,
                  alt: currentValue.alt || 'Image'
                };
                updateFormValue(fieldPath, newValue);
              }
            }
            
            toast.success('Image uploaded successfully!');
          } else {
            toast.error('Failed to upload image');
          }
        } catch (err) {
          console.error('Error uploading image:', err);
          toast.error('Error uploading image');
        }
      }
    };
    input.click();
  };

  const handlePublish = async () => {
    if (!sectionId || !formValue || !sectionData) return;
    
    try {
      setIsLoading(true);
      
      // Prepare content to publish (external_links are now part of footer_menus)
      const contentToPublish = {
        ...formValue
      };
      
      const requestBody = {
        key: sectionData.key,
        name: sectionData.name,
        content: contentToPublish
      };
      
      
      const response = await updateGlobalSection(parseInt(sectionId), locale, requestBody);
      
      if (response.status === 200) {
        toast.success('Section published successfully!');
        await fetchSectionData();
      } else {
        throw new Error('Failed to publish section');
      }
    } catch (error) {
      console.error('Error publishing section:', error);
      toast.error('Error publishing section');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed old modal handlers - now using dynamic renderFieldEditor

  const handleTextClick = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingText(currentValue);
  };

  const handleTextSave = () => {
    if (editingField) {
      updateFormValue(editingField, editingText);
    }
    setEditingField('');
    setEditingText('');
  };

  const handleTextCancel = () => {
    setEditingField('');
    setEditingText('');
  };

  const handleLogoClick = () => {
    handleImageClick('logo');
  };

  // Repeater modal handlers - used by renderFieldEditor for repeater fields

  const handleRepeaterModalSave = () => {
    if (editingRepeaterField && editingRepeaterIndex !== null) {
      const updatedData = [...editingRepeaterData];
      updateFormValue(editingRepeaterField, updatedData);
    }
    setShowRepeaterModal(false);
    setEditingRepeaterField('');
    setEditingRepeaterIndex(null);
    setEditingRepeaterData([]);
  };

  const handleRepeaterModalCancel = () => {
    setShowRepeaterModal(false);
    setEditingRepeaterField('');
    setEditingRepeaterIndex(null);
    setEditingRepeaterData([]);
  };

  // Dynamic field editor based on field_type from schema
  const renderFieldEditor = (fieldPath: string, value: any, fieldType: string, label?: string, schema?: any) => {
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
    
    const currentValue = getFormValue(fieldPath) !== undefined ? getFormValue(fieldPath) : value;

    if (fieldType === 'text' || fieldType === 'email' || !fieldType) {
      return (
        <EditableText 
          field={fieldPath}
          value={currentValue || ''} 
          className={label}
        />
      );
    } else if (fieldType === 'textarea') {
      // Determine text alignment based on locale and field context
      const getTextAlign = () => {
        // Copyright and disclaimer should always be centered
        if (fieldPath.includes('copyright') || fieldPath.includes('disclaimer')) {
          return 'center';
        }
        if (fieldPath.includes('footer_menus') || fieldPath.includes('address') || fieldPath.includes('contact')) {
          return locale === 'ar' ? 'right' : 'left';
        }
        return locale === 'ar' ? 'right' : 'left';
      };
      
      const textAlign = getTextAlign();
      const direction = locale === 'ar' ? 'rtl' : 'ltr';
      
      return (
        <span
          onClick={() => {
            setEditingFieldPath(fieldPath);
            setEditingFieldValue(currentValue || '');
            setShowTextEditor(true);
          }}
          style={{
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '6px',
            display: textAlign === 'center' ? 'block' : 'inline-block',
            border: '1px solid transparent',
            color: 'var(--color-text-dark)',
            fontSize: '14px',
            lineHeight: '1.4',
            transition: 'all 0.2s ease',
            minHeight: '40px',
            textAlign: textAlign,
            direction: direction,
            width: textAlign === 'center' ? '100%' : '100%',
            margin: textAlign === 'center' ? '0 auto' : '0'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#ddd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          dangerouslySetInnerHTML={{ __html: currentValue || label || 'Click to edit' }}
        />
      );
    } else if (fieldType === 'media') {
      const mediaValue = typeof currentValue === 'object' ? currentValue : { url: currentValue, alt: label || 'Image' };
      return (
        <div 
          onClick={() => handleImageClick(fieldPath)}
          style={{ 
            cursor: 'pointer',
            padding: '8px',
            border: '2px dashed var(--color-border-muted)',
            borderRadius: '6px',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-surface-cloud)'
          }}
        >
          {mediaValue?.url ? (
            <img src={getFullImageUrl(mediaValue.url)} alt={mediaValue.alt || 'Image'} style={{ maxHeight: '50px', maxWidth: '100px', objectFit: 'cover' }} />
          ) : (
            `Click to upload ${label || 'image'}`
          )}
        </div>
      );
    } else if (fieldType === 'repeater') {
      // Handle repeater fields based on schema
      const repeaterSchema = schema?.ui?.fields || {};
      const repeaterFields = Object.keys(repeaterSchema);
      
      // Special handling for footer_menus - render as columns like display pages
      if (fieldPath === 'footer_menus') {
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
            {Array.isArray(currentValue) && currentValue.map((item: any, index: number) => (
              <div key={index} className="header-footer-settings__footer-column-mini" style={{ 
                flex: '1', 
                minWidth: '150px', 
                marginBottom: '20px',
                border: '1px solid var(--color-border-light)',
                borderRadius: '6px',
                padding: '15px',
                backgroundColor: 'var(--color-surface-cloud)'
              }}>
                {/* Menu Title */}
                <h3 className="header-footer-settings__footer-heading" style={{ marginBottom: '15px' }}>
                  {renderFieldEditor(
                    `${fieldPath}.${index}.title`,
                    item.title || '',
                    repeaterSchema.title?.type || 'text',
                    repeaterSchema.title?.label,
                    repeaterSchema.title
                  )}
                </h3>
                {/* Menu Links - nested repeater */}
                {repeaterSchema.links && (
                  <div className="header-footer-settings__footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Array.isArray(item.links) && item.links.map((link: any, linkIndex: number) => {
                      const linkSchema = repeaterSchema.links?.fields || {};
                      const linkFields = Object.keys(linkSchema);
                      return (
                        <div key={linkIndex} style={{ 
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          padding: '8px',
                          backgroundColor: 'var(--background)',
                          marginBottom: '8px'
                        }}>
                          {linkFields.map((linkFieldName: string) => {
                            const linkFieldSchema = linkSchema[linkFieldName];
                            const linkFieldType = linkFieldSchema?.type || 'text';
                            const linkFieldValue = link[linkFieldName] || '';
                            return (
                              <div key={linkFieldName} style={{ marginBottom: '5px' }}>
                                <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>
                                  {linkFieldSchema?.label || linkFieldName}:
                                </label>
                                {renderFieldEditor(
                                  `${fieldPath}.${index}.links.${linkIndex}.${linkFieldName}`,
                                  linkFieldValue,
                                  linkFieldType,
                                  linkFieldSchema?.label,
                                  linkFieldSchema
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                    {/* Add new link button */}
                   {/*  <button
                      onClick={() => {
                        const newLink = { url: '', label: '', target: '_self' };
                        const updatedMenus = [...(currentValue || [])];
                        if (!updatedMenus[index].links) {
                          updatedMenus[index].links = [];
                        }
                        updatedMenus[index].links.push(newLink);
                        updateFormValue(fieldPath, updatedMenus);
                      }}
                      style={{
                        marginTop: '5px',
                        padding: '5px 10px',
                        fontSize: '11px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      + Add Link
                    </button> */}
                  </div>
                )}
              </div>
            ))}
            {/* Add new menu button */}
            {/* <button
              onClick={() => {
                const newMenu = { title: '', links: [] };
                const updatedMenus = [...(currentValue || []), newMenu];
                updateFormValue(fieldPath, updatedMenus);
              }}
              style={{
                padding: '10px 20px',
                fontSize: '12px',
                backgroundColor: '#f0f0f0',
                border: '1px solid var(--color-border-light)',
                borderRadius: '6px',
                cursor: 'pointer',
                alignSelf: 'flex-start'
              }}
            >
              + Add Menu
            </button> */}
          </div>
        );
      }
      
      // Default repeater handling for other fields
      return (
        <div>
          {Array.isArray(currentValue) && currentValue.map((item: any, index: number) => (
            <div key={index} style={{ 
              border: '1px solid var(--color-border-light)', 
              borderRadius: '6px', 
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: 'var(--color-surface-cloud)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
                Item {index + 1}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {repeaterFields.map((fieldName: string) => {
                  const fieldSchema = repeaterSchema[fieldName];
                  const fieldType = fieldSchema?.type || 'text';
                  const fieldValue = item[fieldName] || '';
                  
                  // Handle nested repeater (like links in footer_menus)
                  if (fieldType === 'repeater' && fieldSchema?.fields) {
                    const nestedFields = Object.keys(fieldSchema.fields);
                    return (
                      <div key={fieldName}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                          {fieldSchema?.label || fieldName}:
                        </label>
                        <div style={{ marginLeft: '15px', borderLeft: '2px solid var(--color-border-light)', paddingLeft: '10px' }}>
                          {Array.isArray(fieldValue) && fieldValue.map((nestedItem: any, nestedIndex: number) => (
                            <div key={nestedIndex} style={{ marginBottom: '10px', padding: '8px', backgroundColor: 'var(--background)', borderRadius: '6px' }}>
                              {nestedFields.map((nestedFieldName: string) => {
                                const nestedFieldSchema = fieldSchema.fields[nestedFieldName];
                                const nestedFieldType = nestedFieldSchema?.type || 'text';
                                const nestedFieldValue = nestedItem[nestedFieldName] || '';
                                return (
                                  <div key={nestedFieldName} style={{ marginBottom: '5px' }}>
                                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>
                                      {nestedFieldSchema?.label || nestedFieldName}:
                                    </label>
                                    {renderFieldEditor(
                                      `${fieldPath}.${index}.${fieldName}.${nestedIndex}.${nestedFieldName}`,
                                      nestedFieldValue,
                                      nestedFieldType,
                                      nestedFieldSchema?.label,
                                      nestedFieldSchema
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newNestedItem: any = {};
                              nestedFields.forEach((field: string) => {
                                newNestedItem[field] = '';
                              });
                              const updatedItems = [...(fieldValue || []), newNestedItem];
                              const updatedParent = { ...item, [fieldName]: updatedItems };
                              const updatedArray = [...(currentValue || [])];
                              updatedArray[index] = updatedParent;
                              updateFormValue(fieldPath, updatedArray);
                            }}
                            style={{
                              marginTop: '5px',
                              padding: '5px 10px',
                              fontSize: '11px',
                              backgroundColor: 'var(--color-surface-muted)',
                              border: '1px solid var(--color-border-light)',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            + Add Item
                          </button>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={fieldName}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                        {fieldSchema?.label || fieldName}:
                      </label>
                      {renderFieldEditor(
                        `${fieldPath}.${index}.${fieldName}`,
                        fieldValue,
                        fieldType,
                        fieldSchema?.label,
                        fieldSchema
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Add new item button for default repeaters */}
          <button
            onClick={() => {
              const newItem: any = {};
              repeaterFields.forEach((field: string) => {
                const fieldSchema = repeaterSchema[field];
                if (fieldSchema?.type === 'repeater') {
                  newItem[field] = [];
                } else {
                  newItem[field] = '';
                }
              });
              const updatedArray = [...(currentValue || []), newItem];
              updateFormValue(fieldPath, updatedArray);
            }}
            style={{
              marginTop: '10px',
              padding: '8px 15px',
              fontSize: '12px',
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border-light)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            + Add Item
          </button>
        </div>
      );
    } else if (fieldType === 'list') {
      // Handle list fields - check if items are groups (like social_links)
      const itemField = schema?.ui?.item_field;
      const isGroupList = itemField?.type === 'group';
      
      if (isGroupList && itemField?.fields) {
        // Handle list of groups (like social_links with url, icon, target)
        const groupFields = Object.keys(itemField.fields);
        
        return (
          <div style={{ display: 'flex', gap: '2px', flexWrap: 'nowrap', alignItems: 'center' }}>
            {Array.isArray(currentValue) && currentValue.map((item: any, index: number) => {
              // Get current item from formValue or fallback to item
              const currentItem = (formValue[fieldPath]?.[index] !== undefined) 
                ? formValue[fieldPath][index] 
                : item;
              
              // Extract values for display
              const socialIcon = typeof currentItem === 'object' && currentItem !== null 
                ? (currentItem.icon || currentItem.platform || '') 
                : '';
              const socialValue = typeof socialIcon === 'string' ? socialIcon.toLowerCase() : '';
              
              // Check if icon is a URL/path (image) or text/emoji
              // More robust check: includes file extension, contains domain, or starts with path/protocol
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
              
              // Debug logging
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    width: '32px',
                    height: '32px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    //backgroundColor: '#000',
                    borderRadius: '50%',
                    fontSize: '20px',
                    color: 'var(--primary-foreground)',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    ...(locale === 'ar' ? { marginLeft: '4px' } : { marginRight: '4px' })
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = ' #1963b9';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onClick={() => {
                    // Open modal to edit this social link
                    setEditingRepeaterField(fieldPath);
                    setEditingRepeaterIndex(index);
                    setEditingRepeaterData(currentValue || []);
                    setShowRepeaterModal(true);
                  }}
                  title="Click to edit"
                >
                  {isImageIcon ? (
                    <img 
                      src={getFullImageUrl(socialIcon)} 
                      alt="Social icon" 
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
                </div>
              );
            })}
            {/* Add new social link button */}
            <button
              onClick={() => {
                const newSocialLink: any = {};
                groupFields.forEach((field: string) => {
                  const fieldSchema = itemField.fields[field];
                  if (fieldSchema?.type === 'select') {
                    newSocialLink[field] = fieldSchema.options?.[0] || '';
                  } else {
                    newSocialLink[field] = '';
                  }
                });
                const updatedLinks = [...(currentValue || []), newSocialLink];
                updateFormValue(fieldPath, updatedLinks);
              }}
              style={{
                width: '32px',
                height: '32px',
                padding: '0',
                fontSize: '18px',
                backgroundColor: 'var(--color-surface-muted)',
                border: '2px dashed var(--color-border-light)',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                ...(locale === 'ar' ? { marginLeft: '4px' } : { marginRight: '4px' })
              }}
              title="Add social link"
            >
              +
            </button>
          </div>
        );
      }
      
      // For simple list fields (strings), render as text fields with inline editing
      return (
        <div>
          {Array.isArray(currentValue) && currentValue.map((item: string, index: number) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <EditableText 
                field={`${fieldPath}.${index}`}
                value={formValue[fieldPath]?.[index] || item || ''} 
                className={label}
              />
            </div>
          ))}
        </div>
      );
    } else if (fieldType === 'group') {
      // Group fields are rendered inline, handled by parent
      return <span>{JSON.stringify(currentValue)}</span>;
    }

    return <span>{currentValue || 'N/A'}</span>;
  };

  const EditableText = ({ field, value, className = '' }: { field: string, value: string, className?: string }) => {
    const isEditing = editingField === field;
    
    // Determine text alignment based on locale and field context
    const getTextAlign = () => {
      // Copyright and disclaimer should always be centered
      if (field.includes('copyright') || field.includes('disclaimer')) {
        return 'center';
      }
      // Check if this is in a footer context (footer_menus, address, contact, etc.)
      if (field.includes('footer_menus') || field.includes('address') || field.includes('contact')) {
        return locale === 'ar' ? 'right' : 'left';
      }
      // For header context, check if it's navigation
      if (field.includes('main_menu')) {
        return locale === 'ar' ? 'right' : 'left';
      }
      // Default based on locale
      return locale === 'ar' ? 'right' : 'left';
    };
    
    const textAlign = getTextAlign();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';
    
    if (isEditing) {
      return (
        <div className="header-footer-settings__editable-container" style={{ 
          width: '100%',
          direction: direction
        }}>
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSave();
              if (e.key === 'Escape') handleTextCancel();
            }}
            onBlur={handleTextSave}
            className={`header-footer-settings__editable-input ${className}`}
            style={{
              textAlign: textAlign,
              direction: direction,
              width: '100%'
            }}
            autoFocus
          />
        </div>
      );
    }
    
    return (
      <span 
        className={`header-footer-settings__editable-text ${className}`}
        onClick={() => handleTextClick(field, value)}
        style={{
          textAlign: textAlign,
          direction: direction,
          display: 'inline-block',
          width: '100%'
        }}
      >
        {value}
      </span>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="header-footer-settings">
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          color: 'var(--theme-secondary)'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!sectionData || !sectionContent) {
    return (
      <div className="header-footer-settings">
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          Section not found or no content available.
        </div>
      </div>
    );
  }

  const sectionTitle = sectionKey === 'header' ? 'Header' : sectionKey === 'footer' ? 'Footer' : 'Section';

  return (
    <div className="header-footer-settings">
      {/* Header Section */}
      <div className="header-footer-settings__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h2 className="header-footer-settings__header-title" style={{ margin: 0 }}>
          {sectionTitle}
        </h2>
        {/* Language Switcher - Show alternative language (like GlobalHeader) */}
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
          {/* Show the alternative language (the one NOT currently selected) */}
          <span>{locale === 'en' ? 'عربي' : 'English'}</span>
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
          {/* Render Header Section */}
          {sectionKey === 'header' && sectionContent && (
            <header
              className="header-footer-settings__landing-header"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              style={{
                position: 'relative',
                backgroundColor: 'transparent',
                direction: locale === 'ar' ? 'rtl' : 'ltr',
                //backgroundImage: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
              }}
            >
              <div className="header-footer-settings__landing-header-content" style={{ 
                direction: locale === 'ar' ? 'rtl' : 'ltr',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
              }}>
                <div className="header-footer-settings__landing-logo" style={{ 
                  order: locale === 'ar' ? 2 : 1 
                }}>
                  <a 
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogoClick();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={/* (formValue.logo?.url || sectionContent.logo?.url) ? getFullImageUrl(formValue.logo?.url || sectionContent.logo.url) :  */Images.awnLogoWhite}
                      alt={(formValue.logo?.alt || sectionContent.logo?.alt) || 'Factoring Valley Logo'}
                      style={{ height: '40px', filter: 'invert(1)' }}
                    />
                  </a>
                </div>
                <nav className="header-footer-settings__landing-nav" style={{ 
                  direction: locale === 'ar' ? 'rtl' : 'ltr',
                  order: locale === 'ar' ? 1 : 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  {(formValue.main_menu || sectionContent?.main_menu) && (formValue.main_menu || sectionContent.main_menu).length > 0 ? (
                    (formValue.main_menu || sectionContent.main_menu)
                      .filter((item: any) => {
                        const label = typeof item === 'string' ? item : (item?.label || '');
                        return !label.toLowerCase().includes('services');
                      })
                      .map((item: any, index: number) => {
                        const label = typeof item === 'string' ? item : (item?.label || '');
                        
                        return (
                          <a 
                            key={index}
                            onClick={(e) => {
                              e.preventDefault();
                              setEditingRepeaterField('main_menu');
                              setEditingRepeaterIndex(index);
                              setEditingRepeaterData(formValue.main_menu || sectionContent.main_menu || []);
                              setShowRepeaterModal(true);
                            }}
                            className="header-footer-settings__landing-nav-link" 
                            style={{
                              color: 'var(--foreground)',
                              cursor: 'pointer',
                              textAlign: locale === 'ar' ? 'right' : 'left',
                              direction: locale === 'ar' ? 'rtl' : 'ltr'
                            }}
                          >
                            {label}
                          </a>
                        );
                      })
                  ) : null}
                  
                  {/* Language Options - Display only the alternative (non-selected) language, like GlobalHeader */}
                  {(formValue.language_options || sectionContent?.language_options) && (formValue.language_options || sectionContent.language_options).length > 0 && (() => {
                    // Find the alternative language (the one that's not currently selected)
                    const allLanguageOptions = formValue.language_options || sectionContent.language_options || [];
                    const alternativeLang = allLanguageOptions.find((lang: any) => lang.code !== locale);
                    
                    if (!alternativeLang) return null;
                    
                    const flagValue = alternativeLang.flag;
                    const flagUrl = typeof flagValue === 'string' ? flagValue : (flagValue?.url || flagValue);
                    const isIconClass = typeof flagUrl === 'string' && flagUrl.startsWith('icon-');
                    const isImageUrl = typeof flagUrl === 'string' && (flagUrl.startsWith('http') || flagUrl.startsWith('/'));
                    
                    // Find the index of the alternative language in the original array for editing
                    const alternativeLangIndex = allLanguageOptions.findIndex((lang: any) => lang.code === alternativeLang.code);
                    
                    return (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        ...(locale === 'ar' ? { marginRight: '20px' } : { marginLeft: '20px' })
                      }}>
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingRepeaterField('language_options');
                            setEditingRepeaterIndex(alternativeLangIndex);
                            setEditingRepeaterData(allLanguageOptions);
                            setShowRepeaterModal(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--foreground)',
                            border: '1px solid transparent',
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
                          title={`Click to edit ${alternativeLang.name || alternativeLang.code || 'language option'}`}
                        >
                          {flagUrl && isImageUrl ? (
                            <img
                              src={getFullImageUrl(flagUrl)}
                              alt={alternativeLang.name || alternativeLang.code || 'Flag'}
                              style={{ 
                                width: '20px', 
                                height: '20px', 
                                objectFit: 'contain'
                              }} 
                            />
                          ) : flagUrl && isIconClass ? (
                            <i className={flagUrl} style={{ fontSize: '20px' }}></i>
                          ) : null}
                          <span>{alternativeLang.name || alternativeLang.code || 'Language'}</span>
                        </div>
                      </div>
                    );
                  })()}
                </nav>
              </div>
            </header>
          )}

          {/* Main Content Area - placeholder */}
          <div className="header-footer-settings__main-content-area">
          </div>

          {/* Render Footer Section */}
          {sectionKey === 'footer' && sectionContent && sectionData?.schema && (
            <div className="header-footer-settings__footer-template" dir={locale === 'ar' ? 'rtl' : 'ltr'} style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="header-footer-settings__footer-content" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '40px',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                direction: locale === 'ar' ? 'rtl' : 'ltr',
                flexDirection: locale === 'ar' ? 'row-reverse' : 'row'
              }}>
                {/* Company Info with Logo and Address */}
                {(sectionData.schema.logo || sectionData.schema.address) && (
                  <div className="header-footer-settings__footer-column" style={{
                    flex: '1 1 200px',
                    minWidth: '200px',
                    maxWidth: '300px',
                    textAlign: locale === 'ar' ? 'right' : 'left',
                    order: locale === 'ar' ? 3 : 1
                  }}>
                    <div className="header-footer-settings__company-info">
                      {/* Footer Logo - editable with image upload */}
                      {sectionData.schema.logo && (
                        <div 
                          onClick={() => handleImageClick('logo')}
                          style={{ 
                            cursor: 'pointer',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {(formValue.logo || sectionContent.logo) ? (
                            <img 
                            src={/* (formValue.logo?.url || sectionContent.logo?.url) ? getFullImageUrl(formValue.logo?.url || sectionContent.logo.url) :  */Images.awnLogoWhite}
                            alt={(formValue.logo?.alt || sectionContent.logo?.alt) || 'Factoring Valley Logo'}
                            style={{ height: '40px', filter: 'invert(1)' }}
                            />
                          ) : (
                            <img 
                              src={Images.FactoringLogo} 
                              alt="Factoring Valley Logo" 
                              style={{ 
                                maxHeight: '60px', 
                                maxWidth: '150px',
                                objectFit: 'contain'
                              }} 
                            />
                          )}
                        </div>
                      )}
                    </div>
                    {/* Render address field (separate field, not inside contact) */}
                    {sectionData.schema.address && (
                      <p className="header-footer-settings__company-address" style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        lineHeight: '1.6',
                        textAlign: locale === 'ar' ? 'right' : 'left',
                        direction: locale === 'ar' ? 'rtl' : 'ltr'
                      }}>
                        {renderFieldEditor(
                          'address',
                          formValue.address || sectionContent.address || '',
                          sectionData.schema.address.field_type || 'textarea',
                          sectionData.schema.address.label,
                          sectionData.schema.address
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Contact Info Column with Social Links */}
                {sectionData.schema.contact && (
                  <div className="header-footer-settings__footer-column-small" style={{
                    flex: '1 1 200px',
                    minWidth: '200px',
                    maxWidth: '300px',
                    textAlign: locale === 'ar' ? 'right' : 'left',
                    order: locale === 'ar' ? 2 : 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: locale === 'ar' ? 'flex-end' : 'flex-start'
                  }}>
                    <h3 className="header-footer-settings__footer-heading" style={{ 
                      marginBottom: '15px',
                      textAlign: locale === 'ar' ? 'right' : 'left',
                      width: '100%',
                      alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start'
                    }}>
                      {sectionContent?.contact_title || (locale === 'ar' ? 'اتصل بنا' : 'Contact us')}
                    </h3>
                    {/* Render all contact fields dynamically */}
                    {(() => {
                      const contactData = formValue.contact || sectionContent?.contact || {};
                      const schemaFields = sectionData.schema.contact?.fields || {};
                      const allContactFields = { ...schemaFields };
                      
                      // Add any dynamically added fields that aren't in schema
                      Object.keys(contactData).forEach(key => {
                        if (!allContactFields[key] && key !== 'title') {
                          allContactFields[key] = { type: 'text', label: key };
                        }
                      });
                      
                      return Object.keys(allContactFields).map((fieldKey) => {
                        const fieldSchema = allContactFields[fieldKey];
                        const fieldValue = contactData[fieldKey] || '';
                        
                        return (
                          <p 
                            key={fieldKey}
                            className="header-footer-settings__footer-text" 
                            style={{ 
                              marginBottom: '8px',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              textAlign: locale === 'ar' ? 'right' : 'left',
                              direction: locale === 'ar' ? 'rtl' : 'ltr',
                              width: '100%',
                              alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start',
                              paddingRight: locale === 'ar' ? '0' : '0',
                              paddingLeft: locale === 'ar' ? '0' : '0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexDirection: locale === 'ar' ? 'row-reverse' : 'row'
                            }}
                          >
                            {renderFieldEditor(
                              `contact.${fieldKey}`,
                              fieldValue,
                              fieldSchema.type || 'text',
                              fieldSchema.label || fieldKey,
                              fieldSchema
                            )}
                            {!schemaFields[fieldKey] && (
                              <button
                                onClick={() => {
                                  const updatedContact = { ...contactData };
                                  delete updatedContact[fieldKey];
                                  updateFormValue('contact', updatedContact);
                                  toast.success(locale === 'ar' ? 'تم الحذف بنجاح' : 'Field deleted successfully!');
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--theme-secondary)',
                                  cursor: 'pointer',
                                  fontSize: '16px',
                                  padding: '0 4px',
                                  lineHeight: '1'
                                }}
                                title={locale === 'ar' ? 'حذف' : 'Delete'}
                              >
                                ×
                              </button>
                            )}
                          </p>
                        );
                      });
                    })()}
                    
                    {/* Add Contact Field Button - Above Social Icons */}
                    <button
                      onClick={() => {
                        const contactData = formValue.contact || sectionContent?.contact || {};
                        // Get all field keys (excluding title)
                        const fieldKeys = Object.keys(contactData).filter(key => key !== 'title');
                        // Get the last field's value to duplicate, or use initial text
                        const lastFieldValue = fieldKeys.length > 0 
                          ? contactData[fieldKeys[fieldKeys.length - 1]] || (locale === 'ar' ? 'أدخل النص هنا' : 'Enter text here')
                          : (locale === 'ar' ? 'أدخل النص هنا' : 'Enter text here');
                        
                        // Generate a unique field name
                        let fieldIndex = 1;
                        let newFieldName = `field_${fieldIndex}`;
                        while (contactData[newFieldName]) {
                          fieldIndex++;
                          newFieldName = `field_${fieldIndex}`;
                        }
                        // Add new field with duplicated value from last field
                        const updatedContact = {
                          ...contactData,
                          [newFieldName]: lastFieldValue
                        };
                        updateFormValue('contact', updatedContact);
                      }}
                      style={{
                        marginTop: '10px',
                        marginBottom: '10px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        backgroundColor: 'var(--color-surface-muted)',
                        border: '1px dashed var(--color-border-muted)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        transition: 'all 0.2s ease',
                        alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start',
                        direction: locale === 'ar' ? 'rtl' : 'ltr',
                        textAlign: locale === 'ar' ? 'right' : 'left',
                        marginLeft: locale === 'ar' ? 'auto' : '0',
                        marginRight: locale === 'ar' ? '0' : 'auto'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e0e0e0';
                        e.currentTarget.style.borderColor = '#999';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                        e.currentTarget.style.borderColor = '#ccc';
                      }}
                    >
                      {locale === 'ar' ? 'إضافة +' : '+ Add'}
                    </button>
                    
                    {/* Social Links under Contact Us */}
              {sectionData.schema.social_links && (formValue.social_links || sectionContent.social_links)?.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                        gap: '2px',
                        flexWrap: 'nowrap',
                        marginTop: '15px',
                        alignItems: 'center',
                        justifyContent: locale === 'ar' ? 'flex-end' : 'flex-start',
                        width: '100%',
                        alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start'
                }}>
                  {(formValue.social_links || sectionContent.social_links).map((social: any, index: number) => {
                    const socialIcon = typeof social === 'string' ? social : (social?.icon || social?.platform || '');
                    const socialValue = typeof socialIcon === 'string' ? socialIcon.toLowerCase() : '';
                    
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
                      <div
                        key={index}
                        onClick={() => {
                          setEditingRepeaterField('social_links');
                          setEditingRepeaterIndex(index);
                          setEditingRepeaterData(formValue.social_links || sectionContent.social_links || []);
                          setShowRepeaterModal(true);
                        }}
                        style={{
                                width: '32px',
                                height: '32px',
                                display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                                fontSize: '20px',
                          cursor: 'pointer',
                          color: 'var(--primary-foreground)',
                          border: '2px solid transparent',
                          transition: 'all 0.2s ease',
                                overflow: 'hidden',
                                ...(locale === 'ar' ? { marginLeft: '4px' } : { marginRight: '4px' })
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = ' #1963b9';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Click to edit"
                      >
                        {isImageIcon ? (
                          <img 
                            src={getFullImageUrl(socialIcon)} 
                            alt="Social icon" 
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
                      </div>
                    );
                  })}
                      </div>
                    )}
                </div>
              )}

                {/* Footer Menus - render as columns like display pages, with inline editing for text fields */}
                {sectionData.schema.footer_menus && (formValue.footer_menus || sectionContent.footer_menus)?.length > 0 && (
                  (formValue.footer_menus || sectionContent.footer_menus).map((menu: any, menuIndex: number) => (
                    <div 
                      key={menuIndex} 
                      className="header-footer-settings__footer-column-mini"
                      style={{ 
                        flex: '1 1 180px', 
                        minWidth: '180px',
                        maxWidth: '250px',
                        marginBottom: '20px',
                        padding: '10px',
                        borderRadius: '6px',
                        textAlign: locale === 'ar' ? 'right' : 'left',
                        order: locale === 'ar' ? 1 : 3
                      }}
                    >
                      {/* Menu Title - inline editable */}
                      <h3 className="header-footer-settings__footer-heading" style={{ 
                        marginBottom: '15px',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        textAlign: locale === 'ar' ? 'right' : 'left'
                      }}>
                        <EditableText 
                          field={`footer_menus.${menuIndex}.title`}
                          value={formValue.footer_menus?.[menuIndex]?.title || menu.title || 'Menu'} 
                          className=""
                        />
                      </h3>
                      <div className="header-footer-settings__footer-links" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        alignItems: locale === 'ar' ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}>
                        {menu.links && menu.links
                          .filter((link: any) => {
                            const label = link.label || (typeof link === 'string' ? link : '');
                            const labelLower = label.toLowerCase();
                            // Hide "Consumer Protection Principles and Rules" in both English and Arabic
                            return !labelLower.includes('consumer protection') && 
                                   !labelLower.includes('مبادئ وقواعد حماية المستهلك');
                          })
                          .map((link: any) => {
                            // Recalculate index after filtering
                            const originalIndex = menu.links.findIndex((l: any) => l === link);
                            // Get schema for links from footer_menus repeater schema
                            const footerMenusSchema = sectionData.schema.footer_menus;
                            const linksSchema = footerMenusSchema?.links?.fields || {};
                            const labelFieldSchema = linksSchema.label || { type: 'text' };
                            const labelFieldType = labelFieldSchema.type || 'text';
                            
                            return (
                              <div key={originalIndex} style={{
                                fontSize: '14px',
                                color: 'var(--foreground)',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                lineHeight: '1.5',
                                textAlign: locale === 'ar' ? 'right' : 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexDirection: locale === 'ar' ? 'row-reverse' : 'row',
                                width: '100%',
                                justifyContent: locale === 'ar' ? 'flex-end' : 'flex-start'
                              }}>
                                {/* Link - render using renderFieldEditor based on field_type (only label/text is editable) */}
                                <div style={{ 
                                  textAlign: locale === 'ar' ? 'right' : 'left',
                                  direction: locale === 'ar' ? 'rtl' : 'ltr',
                                  flex: 1
                                }}>
                                  {renderFieldEditor(
                                    `footer_menus.${menuIndex}.links.${originalIndex}.label`,
                                    formValue.footer_menus?.[menuIndex]?.links?.[originalIndex]?.label || link.label || (typeof link === 'string' ? link : 'Link'),
                                    labelFieldType,
                                    labelFieldSchema?.label || 'Label',
                                    labelFieldSchema
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    const currentMenus = formValue.footer_menus || sectionContent?.footer_menus || [];
                                    const updatedMenus = [...currentMenus];
                                    const updatedLinks = updatedMenus[menuIndex].links.filter((_: any, idx: number) => idx !== originalIndex);
                                    updatedMenus[menuIndex] = { ...updatedMenus[menuIndex], links: updatedLinks };
                                    updateFormValue('footer_menus', updatedMenus);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--theme-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    padding: '0 4px',
                                    lineHeight: '1'
                                  }}
                                  title={locale === 'ar' ? 'حذف' : 'Delete'}
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        {/* Add Link Button for Footer Menus */}
                        <button
                          onClick={() => {
                            setExternalLinkText('');
                            setExternalLinkUrl('');
                            setExternalLinkMenuIndex(menuIndex);
                            setShowExternalLinkModal(true);
                          }}
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: 'var(--color-surface-muted)',
                            border: '1px dashed var(--color-border-muted)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            transition: 'all 0.2s ease',
                            alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start',
                            direction: locale === 'ar' ? 'rtl' : 'ltr',
                            textAlign: locale === 'ar' ? 'right' : 'left',
                            marginLeft: locale === 'ar' ? 'auto' : '0',
                            marginRight: locale === 'ar' ? '0' : 'auto'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e0e0e0';
                            e.currentTarget.style.borderColor = '#999';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                            e.currentTarget.style.borderColor = '#ccc';
                          }}
                        >
                          {locale === 'ar' ? 'إضافة +' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Copyright and Disclaimer */}
              <div style={{ 
                borderTop: '1px solid var(--color-border-light)',
                paddingTop: '20px', 
                textAlign: 'center',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                marginTop: '40px',
                direction: locale === 'ar' ? 'rtl' : 'ltr'
              }}>
                {sectionData.schema.copyright && (
                  <p style={{ 
                    margin: '0 0 10px 0',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    textAlign: 'center',
                    direction: locale === 'ar' ? 'rtl' : 'ltr'
                  }}>
                    {renderFieldEditor(
                      'copyright',
                      formValue.copyright || sectionContent.copyright || '',
                      sectionData.schema.copyright.field_type || 'text',
                      sectionData.schema.copyright.label,
                      sectionData.schema.copyright
                    )}
                  </p>
                )}
                {sectionData.schema.disclaimer && (
                  <div style={{ 
                    margin: '0',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: '1.6',
                    textAlign: 'center',
                    direction: locale === 'ar' ? 'rtl' : 'ltr'
                  }}>
                    {renderFieldEditor(
                      'disclaimer',
                      formValue.disclaimer || sectionContent.disclaimer || '',
                      sectionData.schema.disclaimer.field_type || 'textarea',
                      sectionData.schema.disclaimer.label,
                      sectionData.schema.disclaimer
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scoped RTL Styles for Header and Footer Components */}
      <style>
        {`
          /* RTL support for header component */
          header[dir="rtl"].header-footer-settings__landing-header,
          header[dir="rtl"] .header-footer-settings__landing-header-content,
          header[dir="rtl"] .header-footer-settings__landing-nav {
            direction: rtl;
          }
          
          header[dir="rtl"] .header-footer-settings__landing-nav-link {
            text-align: right;
          }
          
          header[dir="rtl"] .header-footer-settings__landing-logo {
            order: 2;
          }
          
          header[dir="rtl"] .header-footer-settings__landing-nav {
            order: 1;
          }
          
          /* RTL support for footer component */
          div[dir="rtl"].header-footer-settings__footer-template,
          div[dir="rtl"] .header-footer-settings__footer-content {
            direction: rtl;
          }
          
          div[dir="rtl"] .header-footer-settings__footer-column,
          div[dir="rtl"] .header-footer-settings__footer-column-small,
          div[dir="rtl"] .header-footer-settings__footer-column-mini {
            text-align: right;
          }
          
          div[dir="rtl"] .header-footer-settings__footer-heading {
            text-align: right;
          }
          
          div[dir="rtl"] .header-footer-settings__footer-text {
            text-align: right;
          }
          
          div[dir="rtl"] .header-footer-settings__footer-links {
            align-items: flex-end;
          }
          
          div[dir="rtl"] .header-footer-settings__footer-links > * {
            text-align: right;
          }
          
          /* RTL footer content - direction:rtl will naturally reverse the order */
          div[dir="rtl"] .header-footer-settings__footer-content {
            direction: rtl;
          }
          
          /* Ensure proper text direction for all footer elements */
          div[dir="rtl"] .header-footer-settings__company-address {
            text-align: right;
            direction: rtl;
          }
          
          /* Social links container RTL */
          div[dir="rtl"] .header-footer-settings__footer-content > div {
            direction: rtl;
          }
          
          /* Force text alignment for all editable text elements in RTL (except copyright/disclaimer) */
          div[dir="rtl"] .header-footer-settings__editable-text:not([style*="text-align: center"]),
          div[dir="rtl"] .header-footer-settings__editable-input:not([style*="text-align: center"]),
          div[dir="rtl"] .header-footer-settings__editable-container:not([style*="text-align: center"]) {
            text-align: right !important;
            direction: rtl !important;
          }
          
          /* Force text alignment for all footer text elements (except copyright/disclaimer) */
          div[dir="rtl"] .header-footer-settings__footer-text:not([style*="text-align: center"]),
          div[dir="rtl"] .header-footer-settings__footer-heading:not([style*="text-align: center"]),
          div[dir="rtl"] .header-footer-settings__footer-links:not([style*="text-align: center"]),
          div[dir="rtl"] .header-footer-settings__footer-links > *:not([style*="text-align: center"]) {
            text-align: right !important;
            direction: rtl !important;
          }
          
          /* Keep copyright and disclaimer centered */
          div[dir="rtl"] p[style*="text-align: center"],
          div[dir="rtl"] div[style*="text-align: center"] {
            text-align: center !important;
          }
          
          /* Force all children of centered copyright/disclaimer containers to be centered */
          div[dir="rtl"] p[style*="text-align: center"] > *,
          div[dir="rtl"] div[style*="text-align: center"] > *,
          div[dir="rtl"] p[style*="text-align: center"] span,
          div[dir="rtl"] div[style*="text-align: center"] span {
            text-align: center !important;
            display: block !important;
            width: 100% !important;
          }
          
          /* Ensure textarea content maintains alignment (except copyright/disclaimer) */
          div[dir="rtl"] span[style*="cursor: pointer"]:not([style*="text-align: center"]) {
            text-align: right !important;
            direction: rtl !important;
          }
          
          /* Force centered alignment for copyright and disclaimer textarea spans */
          div[dir="rtl"] span[style*="cursor: pointer"][style*="text-align: center"],
          div[dir="rtl"] div[style*="text-align: center"] span[style*="cursor: pointer"] {
            text-align: center !important;
            display: block !important;
            width: 100% !important;
            margin: 0 auto !important;
          }
          
          /* Header navigation links RTL */
          header[dir="rtl"] .header-footer-settings__landing-nav-link {
            text-align: right;
            direction: rtl;
          }
          
          /* Contact section alignment - ensure all content aligns to right in RTL */
          div[dir="rtl"] .header-footer-settings__footer-column-small {
            align-items: flex-end !important;
          }
          
          div[dir="rtl"] .header-footer-settings__footer-column-small > * {
            align-self: flex-end !important;
            text-align: right !important;
          }
          
          /* Social icons container alignment */
          div[dir="rtl"] .header-footer-settings__footer-column-small > div[style*="display: flex"] {
            justify-content: flex-end !important;
            align-self: flex-end !important;
          }
        `}
      </style>

      {/* Old Edit Button Modal removed - now using dynamic repeater editor */}

      {/* CKEditor Modal for textarea fields */}
      {showTextEditor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-overlay-medium)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            padding: '20px',
            borderRadius: '6px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            direction: locale === 'ar' ? 'rtl' : 'ltr'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              direction: locale === 'ar' ? 'rtl' : 'ltr'
            }}>
              <h3 style={{ 
                textAlign: locale === 'ar' ? 'right' : 'left',
                direction: locale === 'ar' ? 'rtl' : 'ltr'
              }}>Edit Content</h3>
              <button onClick={() => {
                setShowTextEditor(false);
                setEditingFieldPath('');
                setEditingFieldValue('');
              }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{
              direction: locale === 'ar' ? 'rtl' : 'ltr',
              textAlign: locale === 'ar' ? 'right' : 'left'
            }}>
              <CKEditor
                editor={ClassicEditor as any}
                data={editingFieldValue}
                onChange={(_event, editor) => {
                  const data = editor.getData();
                  setEditingFieldValue(data);
                }}
                config={{
                  language: locale === 'ar' ? 'ar' : 'en'
                }}
              />
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowTextEditor(false);
                  setEditingFieldPath('');
                  setEditingFieldValue('');
                }}
                style={{ padding: '10px 20px', border: '1px solid var(--color-border-light)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateFormValue(editingFieldPath, editingFieldValue);
                  setShowTextEditor(false);
                  setEditingFieldPath('');
                  setEditingFieldValue('');
                  toast.success('Content saved!');
                }}
                style={{ padding: '10px 20px', backgroundColor: 'var(--color-action-blue)', color: 'var(--primary-foreground)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repeater Modal */}
      {showRepeaterModal && editingRepeaterField && editingRepeaterIndex !== null && sectionData?.schema && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-overlay-medium)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            padding: '20px',
            borderRadius: '6px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Edit {sectionData.schema[editingRepeaterField]?.label || 'Item'}</h3>
              <button onClick={handleRepeaterModalCancel} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              {(() => {
                // Handle social_links (list of groups) - only URL and Icon fields
                if (editingRepeaterField === 'social_links') {
                  const itemFieldSchema = sectionData.schema[editingRepeaterField]?.ui?.item_field;
                  const groupFields = itemFieldSchema?.fields || {};
                  const currentItem = editingRepeaterData[editingRepeaterIndex] || {};
                  
                  return (
                    <div style={{ border: '1px solid var(--color-border-light)', padding: '15px', borderRadius: '6px' }}>
                      {/* URL Field */}
                      {groupFields.url && (
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            {groupFields.url.label || 'URL'}:
                          </label>
                          <input
                            type="url"
                            value={currentItem.url || ''}
                            onChange={(e) => {
                              const newData = [...editingRepeaterData];
                              newData[editingRepeaterIndex] = { ...newData[editingRepeaterIndex], url: e.target.value };
                              setEditingRepeaterData(newData);
                            }}
                            style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border-light)', borderRadius: '6px' }}
                            placeholder="Enter URL"
                          />
                        </div>
                      )}
                      
                      {/* Icon Field with Browse Button */}
                      {groupFields.icon && (
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            {groupFields.icon.label || 'Icon'}:
                          </label>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={currentItem.icon || ''}
                              onChange={(e) => {
                                const newData = [...editingRepeaterData];
                                newData[editingRepeaterIndex] = { ...newData[editingRepeaterIndex], icon: e.target.value };
                                setEditingRepeaterData(newData);
                              }}
                              style={{ flex: 1, padding: '8px', border: '1px solid var(--color-border-light)', borderRadius: '6px' }}
                              placeholder="Icon class or path"
                            />
                            <button
                              onClick={async () => {
                                // Open file explorer for icon upload
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    try {
                                      const formData = new FormData();
                                      formData.append('image', file);
                                      formData.append('folder', 'global-sections');
                                      
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
                                        // Use path from response and construct full URL with base URL
                                        const fileUrl = result.data?.path 
                                          ? getFullImageUrl(result.data.path)
                                          : '';
                                        
                                        if (!fileUrl) {
                                          toast.error('No path in API response');
                                          return;
                                        }
                                        
                                        // Update the icon field with the uploaded image URL
                                        const newData = [...editingRepeaterData];
                                        newData[editingRepeaterIndex] = { 
                                          ...newData[editingRepeaterIndex], 
                                          icon: fileUrl 
                                        };
                                        setEditingRepeaterData(newData);
                                        
                                        toast.success('Icon uploaded successfully!');
                                      } else {
                                        toast.error('Failed to upload icon');
                                      }
                                    } catch (err) {
                                      console.error('Error uploading icon:', err);
                                      toast.error('Error uploading icon');
                                    }
                                  }
                                };
                                input.click();
                              }}
                              style={{
                                padding: '8px 15px',
                                backgroundColor: 'var(--color-action-blue)',
                                color: 'var(--primary-foreground)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              Browse
                            </button>
                          </div>
                          {currentItem.icon && (
                            <div style={{ marginTop: '10px' }}>
                              {(() => {
                                const iconValue = currentItem.icon;
                                const isImageIcon = iconValue && (
                                  iconValue.startsWith('http') || 
                                  iconValue.startsWith('/') || 
                                  iconValue.includes('.svg') || 
                                  iconValue.includes('.png') || 
                                  iconValue.includes('.jpg') || 
                                  iconValue.includes('.jpeg') || 
                                  iconValue.includes('.gif')
                                );
                                
                                if (isImageIcon) {
                                  return (
                                    <img 
                                      src={getFullImageUrl(iconValue)} 
                                      alt="Icon preview" 
                                      style={{ 
                                        maxWidth: '50px', 
                                        maxHeight: '50px', 
                                        objectFit: 'contain',
                                        //backgroundColor: '#000',
                                        borderRadius: '50%',
                                        padding: '8px'
                                      }} 
                                    />
                                  );
                                } else {
                                  const iconLower = iconValue.toLowerCase();
                                  return (
                                    <div style={{ 
                                      width: '50px', 
                                      height: '50px', 
                                      //backgroundColor: '#000', 
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'var(--primary-foreground)',
                                      fontSize: '20px'
                                    }}>
                                      {iconLower.includes('facebook') ? 'f' : 
                                       iconLower.includes('instagram') ? '📷' :
                                       iconLower.includes('youtube') ? '▶' :
                                       iconLower.includes('tiktok') ? '🎵' : 
                                       iconLower.includes('linkedin') ? 'in' :
                                       iconLower.includes('snapchat') ? '👻' :
                                       iconLower.includes('x') || iconLower.includes('twitter') ? 'X' : '🔗'}
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                
                
                // Handle other repeater fields (like main_menu, language_options)
                const fieldSchema = sectionData.schema[editingRepeaterField]?.ui?.fields || {};
                const currentItem = editingRepeaterData[editingRepeaterIndex] || {};
                return (
                  <div style={{ border: '1px solid var(--color-border-light)', padding: '15px', borderRadius: '6px' }}>
                    {Object.keys(fieldSchema)
                      .filter((fieldName: string) => {
                        // Remove target and url fields from main_menu editing (only label/text should be editable)
                        if (editingRepeaterField === 'main_menu' && (fieldName === 'target' || fieldName === 'url')) {
                          return false;
                        }
                        return true;
                      })
                      .map((fieldName: string) => {
                      const fieldConfig = fieldSchema[fieldName];
                      const fieldType = fieldConfig?.type || 'text';
                      return (
                        <div key={fieldName} style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            {fieldConfig?.label || fieldName}:
                          </label>
                          {fieldType === 'url' ? (
                            <input
                              type="url"
                              value={currentItem[fieldName] || ''}
                              onChange={(e) => {
                                const newData = [...editingRepeaterData];
                                newData[editingRepeaterIndex] = { ...newData[editingRepeaterIndex], [fieldName]: e.target.value };
                                setEditingRepeaterData(newData);
                              }}
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border-light)', borderRadius: '6px' }}
                              placeholder={`Enter ${fieldConfig?.label || fieldName}`}
                            />
                          ) : fieldType === 'select' ? (
                            <select
                              value={currentItem[fieldName] || ''}
                              onChange={(e) => {
                                const newData = [...editingRepeaterData];
                                newData[editingRepeaterIndex] = { ...newData[editingRepeaterIndex], [fieldName]: e.target.value };
                                setEditingRepeaterData(newData);
                              }}
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border-light)', borderRadius: '6px' }}
                            >
                              {fieldConfig?.options?.map((option: string) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : fieldType === 'media' ? (
                            <div 
                              onClick={() => {
                                // Create a temporary handler for this specific repeater field
                                const fieldPath = `${editingRepeaterField}.${editingRepeaterIndex}.${fieldName}`;
                                handleImageClick(fieldPath);
                              }}
                              style={{ 
                                cursor: 'pointer', 
                                padding: '8px', 
                                border: '2px dashed #ccc', 
                                borderRadius: '6px',
                                minHeight: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--color-surface-cloud)',
                                marginTop: '5px'
                              }}
                            >
                              {(() => {
                                const flagValue = currentItem[fieldName];
                                // Handle both string URL and object with url property
                                const flagUrl = typeof flagValue === 'string' ? flagValue : (flagValue?.url || flagValue);
                                if (flagUrl) {
                                  // Check if it's an icon class name or an image URL
                                  const isIconClass = typeof flagUrl === 'string' && flagUrl.startsWith('icon-');
                                  const isImageUrl = typeof flagUrl === 'string' && (flagUrl.startsWith('http') || flagUrl.startsWith('/'));
                                  
                                  if (isImageUrl) {
                                    return (
                                      <img 
                                        src={getFullImageUrl(flagUrl)} 
                                        alt={fieldConfig?.label || 'Flag'} 
                                        style={{ maxHeight: '50px', maxWidth: '100px', objectFit: 'contain' }} 
                                      />
                                    );
                                  } else if (isIconClass) {
                                    return (
                                      <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        gap: '5px' 
                                      }}>
                                        <div 
                                          className={flagUrl}
                                          style={{ 
                                            width: '40px', 
                                            height: '40px',
                                            display: 'inline-block',
                                            backgroundColor: 'var(--theme-secondary)',
                                            borderRadius: '50%'
                                          }}
                                          title={fieldConfig?.label || 'Flag'}
                                        />
                                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                          {flagUrl} (icon class)
                                        </span>
                                      </div>
                                    );
                                  }
                                }
                                return `Click to upload ${fieldConfig?.label || fieldName}`;
                              })()}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={currentItem[fieldName] || ''}
                              onChange={(e) => {
                                const newData = [...editingRepeaterData];
                                newData[editingRepeaterIndex] = { ...newData[editingRepeaterIndex], [fieldName]: e.target.value };
                                setEditingRepeaterData(newData);
                              }}
                              style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border-light)', borderRadius: '6px' }}
                              placeholder={`Enter ${fieldConfig?.label || fieldName}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleRepeaterModalCancel} style={{ padding: '10px 20px', border: '1px solid var(--color-border-light)', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleRepeaterModalSave} style={{ padding: '10px 20px', backgroundColor: 'var(--color-action-blue)', color: 'var(--primary-foreground)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Link Modal */}
      {showExternalLinkModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-overlay-medium)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            padding: '20px',
            borderRadius: '6px',
            width: '90%',
            maxWidth: '500px',
            direction: locale === 'ar' ? 'rtl' : 'ltr'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              direction: locale === 'ar' ? 'rtl' : 'ltr'
            }}>
              <h3 style={{ 
                margin: 0,
                textAlign: locale === 'ar' ? 'right' : 'left',
                direction: locale === 'ar' ? 'rtl' : 'ltr'
              }}>
                {locale === 'ar' ? 'إضافة رابط خارجي' : 'External Link'}
              </h3>
              <button 
                onClick={() => {
                  setShowExternalLinkModal(false);
                  setExternalLinkText('');
                  setExternalLinkUrl('');
                  setExternalLinkMenuIndex(null);
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: 'bold', 
                  fontSize: '14px',
                  textAlign: locale === 'ar' ? 'right' : 'left',
                  direction: locale === 'ar' ? 'rtl' : 'ltr'
                }}>
                  {locale === 'ar' ? 'النص' : 'Text'}:
                </label>
                <input
                  type="text"
                  value={externalLinkText}
                  onChange={(e) => setExternalLinkText(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid var(--color-border-light)', 
                    borderRadius: '6px',
                    direction: locale === 'ar' ? 'rtl' : 'ltr',
                    textAlign: locale === 'ar' ? 'right' : 'left'
                  }}
                  placeholder={locale === 'ar' ? 'أدخل النص' : 'Enter link text'}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: 'bold', 
                  fontSize: '14px',
                  textAlign: locale === 'ar' ? 'right' : 'left',
                  direction: locale === 'ar' ? 'rtl' : 'ltr'
                }}>
                  {locale === 'ar' ? 'الرابط' : 'URL'}:
                </label>
                <input
                  type="url"
                  value={externalLinkUrl}
                  onChange={(e) => setExternalLinkUrl(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid var(--color-border-light)', 
                    borderRadius: '6px',
                    direction: 'ltr',
                    textAlign: 'left'
                  }}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div style={{ 
              marginTop: '20px', 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end',
              direction: locale === 'ar' ? 'rtl' : 'ltr'
            }}>
              <button
                onClick={() => {
                  setShowExternalLinkModal(false);
                  setExternalLinkText('');
                  setExternalLinkUrl('');
                  setExternalLinkMenuIndex(null);
                }}
                style={{ 
                  padding: '10px 20px', 
                  border: '1px solid var(--color-border-light)', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: 'var(--background)'
                }}
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (externalLinkText && externalLinkUrl && externalLinkMenuIndex !== null) {
                    const currentMenus = formValue.footer_menus || sectionContent?.footer_menus || [];
                    const updatedMenus = [...currentMenus];
                    const currentLinks = updatedMenus[externalLinkMenuIndex]?.links || [];
                    const newLink = {
                      label: externalLinkText,
                      text: externalLinkText,
                      url: externalLinkUrl,
                      target: '_blank'
                    };
                    updatedMenus[externalLinkMenuIndex] = {
                      ...updatedMenus[externalLinkMenuIndex],
                      links: [...currentLinks, newLink]
                    };
                    updateFormValue('footer_menus', updatedMenus);
                    setShowExternalLinkModal(false);
                    setExternalLinkText('');
                    setExternalLinkUrl('');
                    setExternalLinkMenuIndex(null);
                    toast.success(locale === 'ar' ? 'تمت الإضافة بنجاح' : 'Link added successfully!');
                  } else {
                    toast.error(locale === 'ar' ? 'يرجى إدخال النص والرابط' : 'Please enter both text and URL');
                  }
                }}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: 'var(--color-action-blue)', 
                  color: 'var(--primary-foreground)', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
              >
                {locale === 'ar' ? 'إضافة' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GlobalSectionsSettings;
