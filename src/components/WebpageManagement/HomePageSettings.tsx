import React, { useState, useEffect } from 'react';
import { store } from '../../redux/store';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import  {Images}  from '../Config/Images';
import { getPageData, updatePageData } from '../../redux/apis/apisCrudWebPageManagement';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';
// Types for API response
interface CMSSection {
  id: number;
  key: string;
  name: string;
  translations: Array<{
    locale: string;
    content: any;
  }>;
}

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
  // Note: Footer section is not present in the API response, so we'll remove it
}

const HomepageSettings: React.FC = () => {
  const BEARER_TOKEN = (store.getState() as any).block.token;
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [formValue, setFormValue] = useState<any>({});
  const [sectionIds, setSectionIds] = useState<any>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [editingField, setEditingField] = useState('');
  const [editingUrl, setEditingUrl] = useState('');
  const [editingIcon, setEditingIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [sectionsSchema, setSectionsSchema] = useState<any>({});
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingFieldPath, setEditingFieldPath] = useState<any>('');
  const [editingFieldValue, setEditingFieldValue] = useState('');
  const [showRepeaterModal, setShowRepeaterModal] = useState(false);
  const [editingRepeaterField, setEditingRepeaterField] = useState('');
  const [editingRepeaterData, setEditingRepeaterData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>('en');

  // Icon modal state (similar to ContactUsSettings)
  const [showIconModal, setShowIconModal] = useState(false);
  const [editingIconIndex, setEditingIconIndex] = useState<number | null>(null);
  const [editingIconField, setEditingIconField] = useState<string>('');
  const [tempIcon, setTempIcon] = useState('');
  const [tempIconFile, setTempIconFile] = useState<File | null>(null);
  const [tempIconUrl, setTempIconUrl] = useState('');



  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL;
  const PAGE_SLUG = 'home';

  // Calculator function (currently unused but kept for future use)
  // const calculateMonthlyPayment = (amount: number) => {
  //   // Simple calculation: amount / 3 months
  //   return amount / 3;
  // };

  // Helper function to update form values
  const updateFormValue = (path: string, value: any) => {
    setFormValue((prev: any) => {
      const newFormValue = { ...prev };
      const pathParts = path.split('.');
      let current = newFormValue;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          // Check if this should be an array (if next part is a number)
          if (i < pathParts.length - 2 && !isNaN(parseInt(pathParts[i + 1]))) {
            current[part] = [];
          } else {
            current[part] = {};
          }
        }
        current = current[part];
      }
      
      // Handle array assignment properly
      const lastPart = pathParts[pathParts.length - 1];
      if (Array.isArray(current) && !isNaN(parseInt(lastPart))) {
        const index = parseInt(lastPart);
        
        // Create a new array to ensure immutability
        const newArray = [...current];
        
        // Ensure array has enough elements
        while (newArray.length <= index) {
          newArray.push({});
        }
        // Assign the value to the specific index
        newArray[index] = value;
        
        // Update the parent object with the new array
        const parentPath = pathParts.slice(0, -1);
        let parent = newFormValue;
        for (let i = 0; i < parentPath.length - 1; i++) {
          parent = parent[parentPath[i]];
        }
        parent[parentPath[parentPath.length - 1]] = newArray;
        
      } else {
        // For non-array assignments
        current[lastPart] = value;
      }
      return newFormValue;
    });
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
            const newPageData: any = { ...pageData };
            const fieldParts = fieldPath.split('.');
            let current: any = newPageData;
            
            for (let i = 0; i < fieldParts.length - 1; i++) {
              if (!current[fieldParts[i]]) {
                current[fieldParts[i]] = {};
              }
              current = current[fieldParts[i]];
            }
            
            current[fieldParts[fieldParts.length - 1]] = e.target.value;
            setPageData(newPageData);
          }}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#333',
            backgroundColor: '#f5f5f5',
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
            border: '1px dashed #ccc', 
            borderRadius: '4px',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9'
          }}
        >
          {value?.url ? (
            <img src={value.url} alt={value.alt || 'Image'} style={{ maxHeight: '50px', maxWidth: '100px', objectFit: 'cover' }} />
          ) : (
            `Click to upload ${label || 'image'}`
          )}
        </div>
      );
    } else if (fieldType === 'button') {
      // Handle button fields with icon support
      return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', flexWrap: 'wrap' }}>
          {Array.isArray(currentValue) && currentValue.map((item: any, index: number) => {
            // For download_app_button, show only icon covering the whole button
            if (fieldPath.includes('download_app_button') || fieldPath.includes('apply_steps')) {
              return (
                <button 
                  key={index}
                  onClick={(e: any) => {
                    e.preventDefault();
                    if (typeof item === 'object' && item.icon) {
                      handleIconClick(fieldPath, index);
                    } else {
                      setEditingText(item.label || item.title || '');
                      setEditingUrl(item.url || '#');
                      setEditingIcon('icon-app-store');
                      setEditingField(`${fieldPath}.${index}`);
                      setShowEditModal(true);
                    }
                  }}
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
                  {typeof item === 'object' && item.icon ? (
                    isIconUrl(item.icon) ? (
                      <img 
                        src={item.icon} 
                        alt="Button Icon" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                      />
                    ) : (
                      <img 
                        src={item.icon === 'icon-app-store' ? Images.FactoringLogo : 
                              item.icon === 'icon-google-play' ? Images.FactoringLogo : 
                              Images.FactoringLogo} 
                        alt="Button Icon" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                      />
                    )
                  ) : (
                    <span style={{ padding: '10px 20px' }}>{typeof item === 'string' ? item : (item.label || item.title || 'N/A')}</span>
                  )}
                </button>
              );
            }
            // For other buttons (like finance_button), show label with icon
            return (
              <button 
                key={index}
                onClick={(e: any) => {
                  e.preventDefault();
                  // Handle both string and object cases
                  if (typeof item === 'string') {
                    setEditingText(item);
                    setEditingUrl('#');
                    setEditingIcon('icon-app-store');
                  } else {
                    setEditingText(item.label || item.title || '');
                    setEditingUrl(item.url || '');
                    setEditingIcon('');
                  }
                  setEditingField(`${fieldPath}.${index}`);
                  setShowEditModal(true);
                }}
                className="theme-btn-next"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {typeof item === 'string' ? item : (item.label || item.title || 'N/A')}
              </button>
            );
          })}
        </div>
      );
    } else if (fieldType === 'tags') {
      // Handle tags field type (like features array)
      return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', flexWrap: 'wrap' }}>
          {Array.isArray(currentValue) && currentValue.map((item: any, index: number) => (
            <div key={index} style={{
              backgroundColor: '#f0f0f0',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              border: '1px solid #ddd'
            }}>
              <EditableText 
                value={typeof item === 'string' ? item : (typeof item === 'object' && item !== null ? (item as any)?.title || (item as any)?.text || JSON.stringify(item) : '')} 
                field={`${fieldPath}.${index}`} 
                placeholder={`Feature ${index + 1}`}
              />
            </div>
          ))}
        </div>
      );
    } else if (fieldType === 'list') {
      // Handle list fields (like steps)
      return (
        <div>
          {Array.isArray(currentValue) && currentValue.map((item: any, index: number) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '15px',
              gap: '15px'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                backgroundColor: '#0ae3be',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                flexShrink: 0
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <EditableText 
                  value={typeof item === 'string' ? item : (typeof item === 'object' && item !== null ? (item as any)?.title || (item as any)?.text || JSON.stringify(item) : '')} 
                  field={`${fieldPath}.${index}`} 
                  placeholder={`Step ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      );
    } else if (fieldType === 'repeater') {
      // Check if this is eligibility criteria (has ui.fields with icon and title)
      if (schema && schema.ui && schema.ui.fields && schema.ui.fields.icon && schema.ui.fields.title) {
        // Render eligibility criteria with inline child fields
        return (
          <div>
            {Array.isArray(value) && value.map((item: any, index: number) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '10px',
                backgroundColor: '#f9f9f9'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
                  Criterion {index + 1}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Icon field */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Icon:
                    </label>
                    <div
                      onClick={() => handleIconClick(fieldPath, index)}
                      style={{ 
                        cursor: 'pointer',
                        padding: '8px',
                        border: '1px dashed #ccc',
                        borderRadius: '4px',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      {isIconUrl(item.icon) ? (
                        <img 
                          src={item.icon} 
                          alt="Criteria Icon" 
                          style={{ maxHeight: '50px', maxWidth: '100px', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '24px' }}>{item.icon || '📋'}</span>
                      )}
                    </div>
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
            {Array.isArray(value) && value.map((item: any, index: number) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <button 
                  onClick={(e: any) => {
                    e.preventDefault();
                    // Handle different repeater types
                    if (item.label && item.url) {
                      // CTA buttons structure
                      setEditingText(item.label || '');
                      setEditingUrl(item.url || '');
                    } else {
                      // Generic fallback
                      setEditingText(item.title || item.label || item.text || '');
                      setEditingUrl(item.icon || item.url || '');
                    }
                    setEditingField(`${fieldPath}.${index}`);
                    setShowEditModal(true);
                  }}
                  className="theme-btn-next"
                >
                  {item.title || item.label || `Item ${index + 1}`}
                </button>
              </div>
            ))}
          </div>
        );
      }
    } else if (fieldType === 'group') {
      // For group fields, render child fields directly based on their individual types
      if (!schema || !schema.ui || !schema.ui.fields) {
        return <span>No schema available for group</span>;
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.keys(schema.ui.fields).map((childKey) => {
            const childField = schema.ui.fields[childKey];
            const childValue = value?.[childKey] || '';
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

    return <span>{typeof value === 'object' ? JSON.stringify(value) : (value || 'N/A')}</span>;
  };

  // Helper function to construct full image URLs
  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  // Helper function to safely extract content from a section
  const getSectionContent = (section: CMSSection) => {
    if (!section.translations || section.translations.length === 0) {
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

  const fetchPageData = async (currentLocale: string = locale) => {
    try {
      setIsLoading(true);
      setError(null);
      
      
      const response = await getPageData(PAGE_SLUG, currentLocale);
      const result = response.data;
      
      
      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        const globalSections = result.data.global_sections || [];
        
        // Store schema information and section IDs for each section
        const schemaMap: any = {};
        const sectionIdMap: any = {};
        sections.forEach((section: any) => {
          schemaMap[section.key] = section.schema;
          sectionIdMap[section.key] = section.id;
        });
        setSectionsSchema(schemaMap);
        setSectionIds(sectionIdMap);
        
        // Extract header from global sections (like LandingPage)
        const headerSection = globalSections.find((s: any) => s.key === 'header');
        const headerContent = headerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};
        
        // Extract footer from global sections (like LandingPage)
        const footerSection = globalSections.find((s: any) => s.key === 'footer');
        const footerContent = footerSection?.translations?.find((t: any) => t.locale === currentLocale)?.content || {};
        
        const heroSection = getSectionContent(sections.find((s: CMSSection) => s.id === 1)) || {};
        if (Array.isArray(heroSection.download_app_button)) {
        }
        
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
        
        const parsedData: LandingPageData = {
          hero: {
            heading: heroSection.heading || 'N/A',
            subheading: heroSection.subheading || 'N/A',
            features: heroSection.features || ['N/A'],
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
            hero_image: heroSection.hero_image ? {
              url: getFullImageUrl(heroSection.hero_image.url || ''),
              alt: heroSection.hero_image.alt || ''
            } : { url: 'N/A', alt: 'N/A' },
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
            const calculatorSection = getSectionContent(sections.find((s: CMSSection) => s.id === 2)) || {};
            return {
              heading: calculatorSection.heading || 'N/A',
              description: calculatorSection.description || 'N/A',
              options: calculatorSection.options || [0],
              amount_text: calculatorSection.amount_text || 'N/A',
              tenure_text: calculatorSection.tenure_text || 'N/A',
              payable_text: calculatorSection.payable_text || 'N/A',
              payable_value: calculatorSection.payable_value || 'N/A',
              payable_installment_text: calculatorSection.payable_installment_text || 'N/A',
              finance_button: calculatorSection.finance_button || [{ label: 'N/A', url: 'N/A' }]
            };
          })(),
          tracker: getSectionContent(sections.find((s: CMSSection) => s.id === 3)) || {
            heading: 'N/A',
            description: 'N/A',
            image: { url: 'N/A', alt: 'N/A' }
          },
          eligibility: (() => {
            const eligibilitySection = getSectionContent(sections.find((s: CMSSection) => s.id === 4)) || {};
            return {
              heading: eligibilitySection.heading || 'N/A',
              criteria: eligibilitySection.criteria || [{ icon: 'N/A', title: 'N/A' }],
              description: eligibilitySection.description || 'N/A'
            };
          })(),
          apply_steps: (() => {
            const applyStepsSection = getSectionContent(sections.find((s: CMSSection) => s.id === 5)) || {};
            return {
              heading: applyStepsSection.heading || 'N/A',
              steps: applyStepsSection.steps || ['N/A'],
              image: applyStepsSection.image || { url: 'N/A', alt: 'N/A' },
              download_app_button: applyStepsSection.download_app_button || [{ label: 'N/A', url: 'N/A', icon: 'N/A' }]
            };
          })(),
        };

        // Store header and footer data for rendering (like LandingPage)
        (parsedData as any).header = {
          logo: headerContent?.logo?.url || Images.awnLogoWhite,
          logoLink: headerContent?.logo?.link || '/',
          logoAlt: headerContent?.logo?.alt || 'Factoring Valley Logo',
          navigationLinks: headerContent?.main_menu || []
        };

        (parsedData as any).footer = {
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
        };

        setPageData(parsedData);
        setFormValue(parsedData);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      
      // Check if it's a CORS error or connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('API Connection Error: Using fallback data. Please check if the backend server and ngrok tunnel are running.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching data');
      }
      
      // Set fallback data with N/A values
      const fallbackData: LandingPageData = {
        hero: {
          heading: 'N/A',
          subheading: 'N/A',
          features: ['N/A'],
          download_app_button: [{ label: 'N/A', url: 'N/A', icon: 'N/A' }],
          hero_image: { url: 'N/A', alt: 'N/A' },
          finance_card: {
            title: 'N/A',
            amount: 'N/A',
            subheading: 'N/A',
            description: 'N/A',
            installment_title: 'N/A',
            installment_value: 'N/A',
            installment_due_date_title: 'N/A',
            installment_due_date: 'N/A'
          },
          finance_card_list: [{ icon: 'N/A', title: 'N/A' }]
        },
        calculator: {
          heading: 'N/A',
          description: 'N/A',
          options: [0],
          amount_text: 'N/A',
          tenure_text: 'N/A',
          payable_text: 'N/A',
          payable_value: 'N/A',
          payable_installment_text: 'N/A',
          finance_button: [{ label: 'N/A', url: 'N/A' }]
        },
        tracker: {
          heading: 'N/A',
          description: 'N/A',
          image: { url: 'N/A', alt: 'N/A' }
        },
        eligibility: {
          heading: 'N/A',
          criteria: [{ icon: 'N/A', title: 'N/A' }],
          description: 'N/A'
        },
        apply_steps: {
          heading: 'N/A',
          steps: ['N/A'],
          image: { url: 'N/A', alt: 'N/A' },
          download_app_button: [{ label: 'N/A', url: 'N/A', icon: 'N/A' }]
        }
      };
      setPageData(fallbackData);
      setFormValue(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(locale);
  }, [locale]);

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
    if (!pageData) return;

    try {
      setIsLoading(true);
      
      // Prepare sections data for the API with proper structure validation using dynamic section IDs
      const sections = [
        {
          section_id: sectionIds.hero, // Dynamic section ID from API response
          content: {
            heading: validateAndPrepareData(formValue.hero?.heading, 'hero.heading'),
            subheading: validateAndPrepareData(formValue.hero?.subheading, 'hero.subheading'),
            features: validateAndPrepareData(formValue.hero?.features, 'hero.features'),
            hero_image: validateAndPrepareData(formValue.hero?.hero_image, 'hero.hero_image'),
            download_app_button: validateAndPrepareData(formValue.hero?.download_app_button, 'hero.download_app_button'),
            finance_card: validateAndPrepareData(formValue.hero?.finance_card, 'hero.finance_card'),
            finance_card_list: validateAndPrepareData(formValue.hero?.finance_card_list, 'hero.finance_card_list'),
          }
        },
        {
          section_id: sectionIds.calculator, // Dynamic section ID from API response
          content: {
            heading: validateAndPrepareData(formValue.calculator?.heading, 'calculator.heading'),
            description: validateAndPrepareData(formValue.calculator?.description, 'calculator.description'),
            options: validateAndPrepareData(formValue.calculator?.options, 'calculator.options'),
            amount_text: validateAndPrepareData(formValue.calculator?.amount_text, 'calculator.amount_text'),
            tenure_text: validateAndPrepareData(formValue.calculator?.tenure_text, 'calculator.tenure_text'),
            payable_text: validateAndPrepareData(formValue.calculator?.payable_text, 'calculator.payable_text'),
            payable_value: validateAndPrepareData(formValue.calculator?.payable_value, 'calculator.payable_value'),
            payable_installment_text: validateAndPrepareData(formValue.calculator?.payable_installment_text, 'calculator.payable_installment_text'),
            finance_button: validateAndPrepareData(formValue.calculator?.finance_button, 'calculator.finance_button'),
          }
        },
        {
          section_id: sectionIds.tracker, // Dynamic section ID from API response
          content: {
            heading: validateAndPrepareData(formValue.tracker?.heading, 'tracker.heading'),
            description: validateAndPrepareData(formValue.tracker?.description, 'tracker.description'),
            image: validateAndPrepareData(formValue.tracker?.image, 'tracker.image'),
          }
        },
        {
          section_id: sectionIds.eligibility, // Dynamic section ID from API response
          content: {
            heading: validateAndPrepareData(formValue.eligibility?.heading, 'eligibility.heading'),
            criteria: validateAndPrepareData(formValue.eligibility?.criteria, 'eligibility.criteria'),
            description: validateAndPrepareData(formValue.eligibility?.description, 'eligibility.description'),
          }
        },
        {
          section_id: sectionIds.apply_steps, // Dynamic section ID from API response
          content: {
            heading: validateAndPrepareData(formValue.apply_steps?.heading, 'apply_steps.heading'),
            steps: validateAndPrepareData(formValue.apply_steps?.steps, 'apply_steps.steps'),
            image: validateAndPrepareData(formValue.apply_steps?.image, 'apply_steps.image'),
            download_app_button: validateAndPrepareData(formValue.apply_steps?.download_app_button, 'apply_steps.download_app_button'),
          }
        }
      ];

      const requestBody = {
        locale: locale,
        sections: sections
      };

      
 
      const response = await updatePageData(1, requestBody);

      if (response.status === 200) {
        toast.success('Page published successfully!');
        // Fetch updated data from API
        await fetchPageData();
      } else {
        throw new Error('Failed to publish page');
      }
    } catch (err) {
      console.error('Error publishing page:', err);
      toast.error('Error publishing page');
    } finally {
      setIsLoading(false);
    }
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


  const handleApply = () => {
    if (!formValue) return;

    const fieldParts = editingField.split('.');
    
    if (fieldParts.length === 5) {
      // Handle inline repeater child fields: e.g., "eligibility.criteria.0.icon" or "eligibility.criteria.0.title"
      const [section, arrayName, index, childField] = fieldParts;
      const fullPath = `${section}.${arrayName}.${index}.${childField}`;
      updateFormValue(fullPath, editingText);
    } else if (fieldParts.length === 4) {
      // Handle button items with modals: e.g., "hero.download_app_button.0"
      const [section, arrayName, index] = fieldParts;
      
      // Determine the structure based on the field path
      if (arrayName === 'download_app_button') {
        // Download app buttons structure with icon
        const buttonData = {
          label: editingText,
          url: editingUrl,
          icon: editingIcon || 'icon-app-store'
        };
        updateFormValue(`${section}.${arrayName}.${index}`, buttonData);
      } else if (arrayName === 'finance_button') {
        // Finance button structure (no icon)
        const buttonData = {
        label: editingText,
        url: editingUrl
      };
        updateFormValue(`${section}.${arrayName}.${index}`, buttonData);
      } else if (arrayName === 'download_app_button' && section === 'apply_steps') {
        // Apply steps download app buttons structure with icon
        const buttonData = {
          label: editingText,
          url: editingUrl,
          icon: editingIcon || 'icon-app-store'
        };
        updateFormValue(`${section}.${arrayName}.${index}`, buttonData);
      } else if (arrayName === 'cta_buttons') {
        // Legacy CTA buttons structure
        const buttonData = {
        label: editingText,
        url: editingUrl
      };
        updateFormValue(`${section}.${arrayName}.${index}`, buttonData);
      } else {
        // Generic structure
        const buttonData = {
          title: editingText,
          icon: editingUrl
        };
        updateFormValue(`${section}.${arrayName}.${index}`, buttonData);
      }
    } else if (fieldParts.length === 3) {
      // Handle regular array items: e.g., "hero.features.0"
      const [section, arrayName, index] = fieldParts;
      updateFormValue(`${section}.${arrayName}.${index}`, editingText);
    }

    setShowEditModal(false);
    setEditingField('');
    setEditingText('');
    setEditingUrl('');
    setEditingIcon('');
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingField('');
    setEditingText('');
    setEditingUrl('');
    setEditingIcon('');
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

  // Helper function to check if icon is a URL
  const isIconUrl = (icon: string) => {
    return icon && (icon.startsWith('http') || icon.startsWith('/'));
  };

  // Icon modal handlers (similar to ContactUsSettings)
  const handleIconClick = (fieldPath: string, index: number) => {
    const fieldParts = fieldPath.split('.');
    let iconValue = '';
    let urlValue = '';
    
    // Get current icon value and URL based on field path
    if (fieldParts.includes('download_app_button')) {
      const buttons = formValue[fieldParts[0]]?.download_app_button || [];
      iconValue = buttons[index]?.icon || '';
      urlValue = buttons[index]?.url || '';
    } else if (fieldParts.includes('finance_card_list')) {
      const items = formValue.hero?.finance_card_list || [];
      iconValue = items[index]?.icon || '';
    } else if (fieldParts.includes('criteria')) {
      const criteria = formValue.eligibility?.criteria || [];
      iconValue = criteria[index]?.icon || '';
    }
    
    setEditingIconIndex(index);
    setEditingIconField(fieldPath);
    setTempIcon(iconValue);
    setTempIconUrl(urlValue);
    setTempIconFile(null);
    setShowIconModal(true);
  };

  const handleIconModalSave = async () => {
    if (editingIconIndex !== null && editingIconField) {
      const fieldParts = editingIconField.split('.');
      
      // If there's a file to upload, upload it first
      if (tempIconFile) {
        try {
          const formData = new FormData();
          formData.append('image', tempIconFile);
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
            if (fieldParts.includes('download_app_button')) {
              const section = fieldParts[0]; // 'hero' or 'apply_steps'
              updateFormValue(`${section}.download_app_button.${editingIconIndex}.icon`, fileUrl);
              // Also update URL
              updateFormValue(`${section}.download_app_button.${editingIconIndex}.url`, tempIconUrl || '');
            } else if (fieldParts.includes('finance_card_list')) {
              updateFormValue(`hero.finance_card_list.${editingIconIndex}.icon`, fileUrl);
            } else if (fieldParts.includes('criteria')) {
              updateFormValue(`eligibility.criteria.${editingIconIndex}.icon`, fileUrl);
            }
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
        // No file to upload, just update the icon name/URL and button URL
        if (fieldParts.includes('download_app_button')) {
          const section = fieldParts[0]; // 'hero' or 'apply_steps'
          updateFormValue(`${section}.download_app_button.${editingIconIndex}.icon`, tempIcon);
          // Update URL
          updateFormValue(`${section}.download_app_button.${editingIconIndex}.url`, tempIconUrl || '');
        } else if (fieldParts.includes('finance_card_list')) {
          updateFormValue(`hero.finance_card_list.${editingIconIndex}.icon`, tempIcon);
        } else if (fieldParts.includes('criteria')) {
          updateFormValue(`eligibility.criteria.${editingIconIndex}.icon`, tempIcon);
        }
      }
    }
    
    // Close modal and reset state
    setShowIconModal(false);
    setEditingIconIndex(null);
    setEditingIconField('');
    setTempIcon('');
    setTempIconUrl('');
    setTempIconFile(null);
  };

  const handleIconModalCancel = () => {
    setShowIconModal(false);
    setEditingIconIndex(null);
    setEditingIconField('');
    setTempIcon('');
    setTempIconUrl('');
    setTempIconFile(null);
  };

  const handleIconFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTempIconFile(file);
      // Don't set icon name from filename - we'll upload the file and get URL
    }
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
          } else if (field.includes('tracker')) {
            folder = 'tracker-images';
          } else if (field.includes('apply_steps')) {
            folder = 'apply-images';
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
          if (result.success && result.data && result.data.url) {
            // Construct full URL from the relative path
          const fullUrl =  `${API_BASE_URL}${result.data.path}`;
            // Update form value with the full URL
          const fieldParts = field.split('.');
          
          if (fieldParts.length === 2) {
              const imageData = {
                url: fullUrl,
              alt: 'Updated image'
            };
              updateFormValue(field, imageData);
            } else if (fieldParts.length === 3) {
              // For nested fields like finance_card_list.0.icon
              updateFormValue(field, fullUrl);
            }
          } else {
            throw new Error('Invalid API response structure');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        }
      }
    };
    input.click();
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
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#333',
            backgroundColor: '#f5f5f5',
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
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'red',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h3>Error Loading Homepage</h3>
        <p>{error}</p>
        <button 
          onClick={() => fetchPageData(locale)}
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

  if (!formValue || Object.keys(formValue).length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px',
        border: '1px solid #e0e0e0'
      }}>
        No homepage data available.
      </div>
    );
  }

  return (
    <div className="header-footer-settings home-page-settings">
      {/* Header Section */}
      <div className="header-footer-settings__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
        <h2 className="header-footer-settings__header-title" style={{ margin: 0 }}>
          Home Page
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

      {/* Main Content Area */}
      <div className="header-footer-settings__main-content">
        {/* Template Preview */}
        <div className="header-footer-settings__template-preview">
          {/* Landing Page Template with Inline Editing */}
          <div className="header-footer-settings__landing-template">

      {/* Hero Section */}
        <section 
          className="header-footer-settings__landing-hero" 
          style={{
            backgroundImage: formValue.hero?.hero_image?.url ? `url(${getFullImageUrl(formValue.hero.hero_image.url)})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
          }}
        >
          {/* Hero Image Upload Button */}
          <button
            onClick={() => handleImageClick('hero.hero_image')}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
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
            {formValue.hero?.hero_image?.url ? 'Change Hero Image' : 'Upload Hero Image'}
          </button>
          
          <div className="header-footer-settings__landing-hero-overlay">
            <div className="header-footer-settings__landing-hero-content">
              <div className="header-footer-settings__landing-hero-left">
                <h1 className="header-footer-settings__landing-hero-title">
                  {renderFieldEditor(
                    'hero.heading',
                    formValue.hero?.heading,
                    sectionsSchema.hero?.heading?.field_type || 'text',
                    'Enter hero heading',
                    sectionsSchema.hero?.heading
                  )}
                </h1>
                <p className="header-footer-settings__landing-hero-subtitle">
                  {renderFieldEditor(
                    'hero.subheading',
                    formValue.hero?.subheading,
                    sectionsSchema.hero?.subheading?.field_type || 'textarea',
                    'Enter hero subheading',
                    sectionsSchema.hero?.subheading
                  )}
                </p>

                {/* CTA Buttons */}
                <div className="header-footer-settings__landing-hero-buttons">
                  {renderFieldEditor(
                    'hero.download_app_button',
                    formValue.hero?.download_app_button,
                    sectionsSchema.hero?.download_app_button?.field_type || 'button',
                    'Download App Buttons',
                    sectionsSchema.hero?.download_app_button
                  )}
                      </div>
        </div>

              {/* Finance Cards Container */}
              <div className="header-footer-settings__finance-cards-container">
                {/* Main Finance Card */}
                <div className="header-footer-settings__finance-card">
                  <h3 className="header-footer-settings__finance-card-title">
                    {renderFieldEditor(
                      'hero.finance_card.title',
                      formValue.hero.finance_card?.title,
                      sectionsSchema.hero?.finance_card?.ui?.fields?.title?.type || 'text',
                      'Enter title',
                      sectionsSchema.hero?.finance_card?.ui?.fields?.title
                    )}
                  </h3>
                  <div className="header-footer-settings__finance-card-amount">
                    {renderFieldEditor(
                      'hero.finance_card.amount',
                      formValue.hero.finance_card?.amount,
                      sectionsSchema.hero?.finance_card?.ui?.fields?.amount?.type || 'text',
                      'Enter amount',
                      sectionsSchema.hero?.finance_card?.ui?.fields?.amount
                    )}
                    </div>
                  <p className="header-footer-settings__finance-card-total">
                    {renderFieldEditor(
                      'hero.finance_card.subheading',
                      formValue.hero.finance_card?.subheading,
                      sectionsSchema.hero?.finance_card?.ui?.fields?.subheading?.type || 'text',
                      'Enter total payable amount',
                      sectionsSchema.hero?.finance_card?.ui?.fields?.subheading
                    )}
                  </p>
                  <div className="header-footer-settings__finance-card-divider" />
                  <p className="header-footer-settings__finance-card-status">
                    {renderFieldEditor(
                      'hero.finance_card.description',
                      formValue.hero.finance_card?.description,
                      sectionsSchema.hero?.finance_card?.ui?.fields?.description?.type || 'textarea',
                      'Enter description',
                      sectionsSchema.hero?.finance_card?.ui?.fields?.description
                    )}
                  </p>
                  <div className="header-footer-settings__finance-card-details">
                    <div className="header-footer-settings__finance-card-detail">
                      <div className="header-footer-settings__finance-card-detail-label">
                        {renderFieldEditor(
                          'hero.finance_card.installment_title',
                          formValue.hero.finance_card?.installment_title,
                          sectionsSchema.hero?.finance_card?.ui?.fields?.installment_title?.type || 'text',
                          'Enter installment title',
                          sectionsSchema.hero?.finance_card?.ui?.fields?.installment_title
                        )}
                      </div>
                      <div className="header-footer-settings__finance-card-detail-value">
                        {renderFieldEditor(
                          'hero.finance_card.installment_value',
                          formValue.hero.finance_card?.installment_value,
                          sectionsSchema.hero?.finance_card?.ui?.fields?.installment_value?.type || 'text',
                          'Enter installment value',
                          sectionsSchema.hero?.finance_card?.ui?.fields?.installment_value
                        )}
                    </div>
                  </div>
                    <div className="header-footer-settings__finance-card-detail">
                      <div className="header-footer-settings__finance-card-detail-label">
                        {renderFieldEditor(
                          'hero.finance_card.installment_due_date_title',
                          formValue.hero.finance_card?.installment_due_date_title,
                          sectionsSchema.hero?.finance_card?.ui?.fields?.installment_due_date_title?.type || 'text',
                          'Enter due date title',
                          sectionsSchema.hero?.finance_card?.ui?.fields?.installment_due_date_title
                        )}
                      </div>
                      <div className="header-footer-settings__finance-card-detail-value">
                        {renderFieldEditor(
                          'hero.finance_card.installment_due_date',
                          formValue.hero.finance_card?.installment_due_date,
                          sectionsSchema.hero?.finance_card?.ui?.fields?.installment_due_date?.type || 'text',
                          'Enter due date',
                          sectionsSchema.hero?.finance_card?.ui?.fields?.installment_due_date
                        )}
                </div>
                    </div>
                  </div>
        </div>

                {/* Finance Card List */}
                {formValue.hero?.finance_card_list?.map((item: any, index: number) => (
                  <div key={index} className="header-footer-settings__personal-finance-card">
                    <div 
                      className="header-footer-settings__personal-finance-icon"
                      onClick={() => handleIconClick('hero.finance_card_list', index)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isIconUrl(item.icon) ? (
                        <img 
                          src={item.icon} 
                          alt="Finance Icon" 
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        />
                      ) : (
                        <img 
                          src={item.icon === 'icon-finance-card-2' ? Images.FactoringLogo : 
                                item.icon === 'icon-finance-card-1' ? Images.FactoringLogo : 
                                item.icon || Images.FactoringLogo} 
                          alt="Finance Icon" 
                          style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                    <span className="header-footer-settings__personal-finance-text">
          <EditableText 
                        value={typeof item.title === 'string' ? item.title : (typeof item.title === 'object' && item.title !== null ? (item.title as any)?.title || (item.title as any)?.text || JSON.stringify(item.title) : '')} 
                        field={`hero.finance_card_list.${index}.title`} 
                        placeholder={`Finance Item ${index + 1}`}
                      />
                    </span>
        </div>
                )) || (
                  <div className="header-footer-settings__personal-finance-card">
                    <div className="header-footer-settings__personal-finance-icon">💰</div>
                    <span className="header-footer-settings__personal-finance-text">Personal Finance</span>
                  </div>
                )}
          </div>
        </div>
      </div>
        </section>

        {/* Features Banner */}
        <div className="header-footer-settings__features-banner">
          {formValue.hero?.features?.map((feature: any, index: number ) => (
            <span key={index} className="header-footer-settings__features-banner-item">
              <EditableText 
                value={typeof feature === 'string' ? feature : (typeof feature === 'object' && feature !== null ? (feature as any)?.title || (feature as any)?.text || JSON.stringify(feature) : '')} 
                field={`hero.features.${index}`} 
                placeholder={`Feature ${index + 1}`}
              />
            </span>
          ))}
            </div>

        {/* Finance Calculator Section */}
        <section className="header-footer-settings__landing-calculator">
          <div className="header-footer-settings__landing-calculator-content">
            <h2 className="header-footer-settings__landing-calculator-title">
                {renderFieldEditor(
                  'calculator.heading',
                  formValue.calculator.heading,
                  sectionsSchema.calculator?.heading?.field_type || 'text',
                  'Enter calculator heading',
                  sectionsSchema.calculator?.heading
                )}
            </h2>
            <p className="header-footer-settings__landing-calculator-description">
                {renderFieldEditor(
                  'calculator.description',
                  formValue.calculator.description,
                  sectionsSchema.calculator?.description?.field_type || 'textarea',
                  'Enter calculator description',
                  sectionsSchema.calculator?.description
                )}
              </p>

            {/* Calculator */}
            <div className="header-footer-settings__landing-calculator-card">
              <div className="header-footer-settings__landing-calculator-slider-container">
                <label className="header-footer-settings__landing-calculator-label" style={{ textAlign: 'center', display: 'block' }}>
                  {renderFieldEditor(
                    'calculator.amount_text',
                    formValue.calculator.amount_text,
                    sectionsSchema.calculator?.amount_text?.field_type || 'text',
                    'Enter amount text',
                    sectionsSchema.calculator?.amount_text
                  )}
                </label>
                <div className="header-footer-settings__landing-calculator-slider-wrapper">
                  <input
                    type="range"
                    min="1000"
                    max="2000"
                    step="500"
                    value={selectedAmount}
                    onChange={(e) => setSelectedAmount(parseInt(e.target.value))}
                    className="header-footer-settings__landing-calculator-slider"
                  />
                  <div className="header-footer-settings__landing-calculator-slider-tooltip">
                    {selectedAmount.toLocaleString()} SAR
            </div>
          </div>
                <div className="header-footer-settings__landing-calculator-options">
                  {formValue.calculator?.options?.map((amount: number, index: number) => (
                    <span 
                      key={index} 
                      className={`header-footer-settings__landing-calculator-option ${selectedAmount === amount ? 'active' : ''}`}
                      onClick={() => setSelectedAmount(amount)}
                    >
                      {amount.toLocaleString()} SAR
                    </span>
          ))}
        </div>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontWeight: 'normal', textAlign: 'center' }}>
                  {renderFieldEditor(
                    'calculator.tenure_text',
                    formValue.calculator.tenure_text,
                    sectionsSchema.calculator?.tenure_text?.field_type || 'text',
                    'Enter tenure text',
                    sectionsSchema.calculator?.tenure_text
                  )}
            </div>
          </div>
        </div>

            {/* Results Section - Outside Card */}
            <div className="header-footer-settings__landing-calculator-result">
              <div className="header-footer-settings__landing-calculator-result-content">
                <div className="header-footer-settings__landing-calculator-result-label">
                  {renderFieldEditor(
                    'calculator.payable_text',
                    formValue.calculator.payable_text,
                    sectionsSchema.calculator?.payable_text?.field_type || 'text',
                    'Enter payable text',
                    sectionsSchema.calculator?.payable_text
                  )}
                </div>
                <div className="header-footer-settings__landing-calculator-result-amount">
                  {renderFieldEditor(
                    'calculator.payable_value',
                    formValue.calculator.payable_value,
                    sectionsSchema.calculator?.payable_value?.field_type || 'text',
                    'Enter payable value',
                    sectionsSchema.calculator?.payable_value
                  )}
            </div>
                <div className="header-footer-settings__landing-calculator-result-installments">
                  {renderFieldEditor(
                    'calculator.payable_installment_text',
                    formValue.calculator.payable_installment_text,
                    sectionsSchema.calculator?.payable_installment_text?.field_type || 'text',
                    'Enter installment text',
                    sectionsSchema.calculator?.payable_installment_text
                  )}
                </div>
          </div>
              <div className="header-footer-settings__landing-calculator-buttons">
                {renderFieldEditor(
                  'calculator.finance_button',
                  formValue.calculator.finance_button,
                  sectionsSchema.calculator?.finance_button?.field_type || 'button',
                  'Finance Button',
                  sectionsSchema.calculator?.finance_button
                )}
              </div>
            </div>
        </div>
        </section>

        {/* Tracker Section */}
        <section className="header-footer-settings__landing-tracker">
          <div className="header-footer-settings__landing-tracker-content">
            <div className="header-footer-settings__landing-tracker-image-container">
              {/* Background Phone (Left, Rotated) */}
              {/* <div 
                onClick={() => handleImageClick('tracker.image')}
                className="header-footer-settings__landing-tracker-image-background"
                style={{
                  width: '250px',
                  height: '500px',
                  border: '2px dashed #0ae3be',
                  borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
                  backgroundColor: '#1a1a1a',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {formValue.tracker?.image?.url ? (
                  <img 
                    src={formValue.tracker?.image.url} 
                    alt={formValue.tracker?.image.alt || 'App Screens'} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: '18px' }}
              />
            ) : (
      <div style={{ 
                    color: 'white', 
                    textAlign: 'center', 
        padding: '20px', 
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '10px'
                  }}>
                    <div>📱</div>
                    <div style={{ fontSize: '14px', marginTop: '10px' }}>Click to upload background phone</div>
            </div>
                )}
        </div> */}

              {/* Foreground Phone (Right, Main) */}
          <div 
            onClick={() => handleImageClick('tracker.image')}
                className="header-footer-settings__landing-tracker-image"
            style={{
                  width: '500px',
                  height: '700px',
                 // border: '2px dashed #0ae3be',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  //backgroundColor: '#1a1a1a',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
            }}
          >
            {formValue.tracker?.image?.url ? (
              <img 
                src={formValue.tracker?.image.url} 
                    alt={formValue.tracker?.image.alt || 'App Screens'} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: '18px' }}
              />
            ) : (
      <div style={{ 
                    color: 'white', 
                    textAlign: 'center', 
        padding: '20px', 
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '10px'
                  }}>
                    <div>📱</div>
                    <div style={{ fontSize: '14px', marginTop: '10px' }}>Click to upload main phone</div>
        </div>
            )}
          </div>
        </div>
            <div>
              <h2 className="header-footer-settings__landing-tracker-title">
          <EditableText 
                  value={typeof formValue.tracker?.heading === 'string' ? formValue.tracker?.heading : (typeof formValue.tracker?.heading === 'object' && formValue.tracker?.heading !== null ? (formValue.tracker?.heading as any)?.title || (formValue.tracker?.heading as any)?.text || JSON.stringify(formValue.tracker?.heading) : '')} 
                  field="tracker.heading" 
                  placeholder="Enter tracker heading"
                />
              </h2>
              <p className="header-footer-settings__landing-tracker-description">
            {renderFieldEditor(
                  'tracker.description',
                  formValue.tracker.description,
                  'textarea',
                  'Enter tracker description',
                  sectionsSchema.tracker?.description
            )}
          </p>
        </div>
        </div>
        </section>

        {/* Eligibility Section */}
        <section className="header-footer-settings__landing-eligibility">
          <div className="header-footer-settings__landing-eligibility-content">
            <div className="header-footer-settings__landing-eligibility-criteria">
              {formValue.eligibility.criteria?.map((criterion: any, index: number) => (
                <div key={index} className="header-footer-settings__landing-eligibility-criterion">
                  <div 
                    className="header-footer-settings__landing-eligibility-criterion-icon"
                    onClick={() => handleIconClick('eligibility.criteria', index)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isIconUrl(criterion.icon) ? (
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
                    {renderFieldEditor(
                      `eligibility.criteria.${index}.title`,
                      typeof criterion.title === 'string' ? criterion.title : (typeof criterion.title === 'object' && criterion.title !== null ? (criterion.title as any)?.title || (criterion.title as any)?.text || JSON.stringify(criterion.title) : ''),
                      sectionsSchema.eligibility?.criteria?.ui?.fields?.title?.type || 'text',
                      'Criteria Title',
                      sectionsSchema.eligibility?.criteria?.ui?.fields?.title
                    )}
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
                    <span className="header-footer-settings__landing-eligibility-criterion-text">
          <EditableText 
                        value="The minimum of Salary SAR 5,000" 
                        field="eligibility.criteria.0.title" 
                        placeholder="Criterion 1"
                      />
                    </span>
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
                    <span className="header-footer-settings__landing-eligibility-criterion-text">
          <EditableText 
                        value="The service period is more than 6 months" 
                        field="eligibility.criteria.1.title" 
                        placeholder="Criterion 2"
                      />
                    </span>
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
                    <span className="header-footer-settings__landing-eligibility-criterion-text">
          <EditableText 
                        value="National ID or Iqama" 
                        field="eligibility.criteria.2.title" 
                        placeholder="Criterion 3"
                      />
                    </span>
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
                    <span className="header-footer-settings__landing-eligibility-criterion-text">
          <EditableText 
                        value="Age between 18 - 60" 
                        field="eligibility.criteria.3.title" 
                        placeholder="Criterion 4"
                      />
                    </span>
                    <div className="header-footer-settings__landing-eligibility-criterion-check">✓</div>
        </div>
                </>
              )}
      </div>
            <div className="header-footer-settings__landing-eligibility-text">
              <h2 className="header-footer-settings__landing-eligibility-title">
                {renderFieldEditor(
                  'eligibility.heading',
                  formValue.eligibility.heading,
                  sectionsSchema.eligibility?.heading?.field_type || 'text',
                  'Enter eligibility heading',
                  sectionsSchema.eligibility?.heading
                )}
              </h2>
              <p className="header-footer-settings__landing-eligibility-description">
                {renderFieldEditor(
                  'eligibility.description',
                  formValue.eligibility.description || 'To be eligible for a finance, you must meet the following criteria:',
                  sectionsSchema.eligibility?.description?.field_type || 'textarea',
                  'Enter eligibility description',
                  sectionsSchema.eligibility?.description
                )}
              </p>
      </div>
          </div>
        </section>

        {/* How to Apply Section */}
        <section className="header-footer-settings__landing-apply">
          <div className="header-footer-settings__landing-apply-content">
            <div>
              <h2 className="header-footer-settings__landing-apply-title">
                {renderFieldEditor(
                  'apply_steps.heading',
                  formValue.apply_steps?.heading,
                  sectionsSchema.apply_steps?.heading?.field_type || 'text',
                  'Enter apply steps heading',
                  sectionsSchema.apply_steps?.heading
                )}
              </h2>
              <div className="header-footer-settings__landing-apply-steps">
                {renderFieldEditor(
                  'apply_steps.steps',
                  formValue.apply_steps?.steps,
                  sectionsSchema.apply_steps?.steps?.field_type || 'list',
                  'Apply Steps',
                  sectionsSchema.apply_steps?.steps
                )}
              </div>
              <div className="header-footer-settings__landing-apply-buttons">
                {renderFieldEditor(
                  'apply_steps.download_app_button',
                  formValue.apply_steps?.download_app_button,
                  sectionsSchema.apply_steps?.download_app_button?.field_type || 'button',
                  'Download App Buttons',
                  sectionsSchema.apply_steps?.download_app_button
                )}
              </div>
            </div>
            <div 
              onClick={() => handleImageClick('apply_steps.image')}
              className="header-footer-settings__landing-apply-image"
              style={{
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              {formValue.apply_steps?.image?.url ? (
                <img 
                  src={formValue.apply_steps?.image.url} 
                  alt={formValue.apply_steps?.image.alt || 'Apply Steps'} 
                  className="header-footer-settings__landing-apply-image-content"
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    borderRadius: '20px',
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
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #0ae3be'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📱</div>
                  <div style={{ fontSize: '14px' }}>Click to upload apply steps image</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        {/* <div className="header-footer-settings__about-breadcrumb">
          <button 
            className="header-footer-settings__breadcrumb-button"
            style={{ cursor: 'default', background: 'none', border: 'none', padding: 0 }}
          >
            Home
          </button>
        </div> */}
          </div>
        </div>
      </div>

      {/* Edit Button Modal */}
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
              <div className="header-footer-settings__edit-field">
                <label className="header-footer-settings__edit-label">Button URL</label>
                <input
                  type="text"
                  value={editingUrl}
                  onChange={(e) => setEditingUrl(e.target.value)}
                  className="header-footer-settings__edit-input"
          />
        </div>
              {(editingField.includes('download_app_button') || editingField.includes('apply_steps')) && (
                <div className="header-footer-settings__edit-field">
                  <label className="header-footer-settings__edit-label">Button Icon</label>
                  <div 
                    onClick={() => {
                      const fieldParts = editingField.split('.');
                      const index = parseInt(fieldParts[fieldParts.length - 1]);
                      handleIconClick(editingField.replace(`.${index}`, ''), index);
                    }}
                    style={{
                      cursor: 'pointer', 
                      padding: '8px', 
                      border: '1px dashed #ccc', 
                      borderRadius: '4px',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    {isIconUrl(editingIcon) ? (
                      <img 
                        src={editingIcon} 
                        alt="Button Icon" 
                        style={{ maxHeight: '40px', maxWidth: '80px', objectFit: 'contain' }}
                      />
                    ) : (
                      <img 
                        src={editingIcon === 'icon-app-store' ? Images.FactoringLogo : 
                              editingIcon === 'icon-google-play' ? Images.FactoringLogo : 
                              editingIcon || Images.FactoringLogo} 
                        alt="Button Icon" 
                        style={{ maxHeight: '40px', maxWidth: '80px', objectFit: 'contain' }}
                      />
                    )}
                  </div>
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
      <div style={{ 
        backgroundColor: 'white', 
            padding: '30px',
        borderRadius: '8px',
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
              <h3 style={{ margin: 0, color: '#333' }}>Edit Description</h3>
              <button
                onClick={handleTextEditorCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
        </div>

      <div style={{ 
                  border: '1px solid #ddd',
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
                onClick={handleTextEditorCancel}
                className="theme-btn-next"
              >
                Cancel
              </button>
              <button
                onClick={handleTextEditorSave}
                className="theme-btn-next"
              >
                Apply
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
            padding: '30px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Edit Repeater</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {editingRepeaterData.map((item, index) => (
                <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
                  <h4>Item {index + 1}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.keys(item).map((key) => (
                      <div key={key}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </label>
              <input
                type="text"
                          value={item[key] || ''}
                          onChange={(e) => {
                            const newData = [...editingRepeaterData];
                            newData[index] = { ...newData[index], [key]: e.target.value };
                            setEditingRepeaterData(newData);
                          }}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
                    ))}
                  </div>
              <button
                    onClick={() => {
                      const newData = editingRepeaterData.filter((_, i) => i !== index);
                      setEditingRepeaterData(newData);
                    }}
                    className="theme-btn-next"
                  >
                    Remove
              </button>
            </div>
              ))}
              <button
                onClick={() => {
                  const newData = [...editingRepeaterData, { label: '', url: '' }];
                  setEditingRepeaterData(newData);
                }}
                className="theme-btn-next"
              >
                + Add New Item
              </button>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleRepeaterCancel}
                className="theme-btn-next"
              >
                Cancel
              </button>
              <button
                onClick={handleRepeaterSave}
                className="theme-btn-next"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Modal (similar to ContactUsSettings) */}
      {showIconModal && (
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
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Dark Header */}
            <div style={{
              backgroundColor: '#333',
              color: 'white',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {editingIconField.includes('download_app_button') ? 'Edit Button Details' : 'Edit Icon'}
              </h3>
              <button
                onClick={handleIconModalCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
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
              {/* URL Input - Only show for download_app_button */}
              {editingIconField.includes('download_app_button') && (
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: '#333' 
                  }}>
                    Button URL
                  </label>
                  <input
                    type="url"
                    value={tempIconUrl}
                    onChange={(e) => setTempIconUrl(e.target.value)}
                    placeholder="Enter button URL"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff'
                    }}
                  />
                </div>
              )}

              {/* Icon Selection */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333' 
                }}>
                  Icon
                </label>
                <div style={{ 
                  border: '2px dashed #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => document.getElementById('icon-file-input-modal')?.click()}
                >
                  <input
                    id="icon-file-input-modal"
                    type="file"
                    accept="image/*"
                    onChange={handleIconFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ textAlign: 'center' }}>
                    {tempIconFile ? (
                      <div>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                          📁
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {tempIconFile.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
                          Click to change
                        </div>
                      </div>
                    ) : isIconUrl(tempIcon) ? (
                      <div>
                        <img 
                          src={tempIcon} 
                          alt="Icon" 
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            objectFit: 'contain',
                            marginBottom: '10px'
                          }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                          Current: Uploaded Image
                        </div>
                        <div style={{ fontSize: '10px', color: '#999' }}>
                          Click to change
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                          {tempIcon || '🔗'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                          Current: {tempIcon || 'No icon selected'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#999' }}>
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
                    backgroundColor: '#000',
                    color: 'white',
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
                    e.currentTarget.style.backgroundColor = '#000';
                  }}
                  onClick={handleIconModalSave}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageSettings;