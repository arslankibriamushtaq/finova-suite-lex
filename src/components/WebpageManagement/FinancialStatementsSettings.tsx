import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Images } from '../Config/Images';
import { store } from '../../redux/store';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { themeStyle } from '../Config/Theme';
import { Switch } from 'antd';
import toast from 'react-hot-toast';
import { getPageData, updatePageData } from '../../redux/apis/apisCrudWebPageManagement';
import Loader from '../Loader/Loader';

// Types for Financial Statements page data
interface FinancialStatementsPageData {
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
    financialStatements: { text: string; url: string };
  };
  content: {
    title: string;
    description: string;
  };
  statements: Array<{
    url: string;
    title: string;
    status: boolean;
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

const FinancialStatementsSettings = () => {
  const { t } = useTranslation('webPages');
  // UI States
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingFieldPath, setEditingFieldPath] = useState<any>('');
  const [editingFieldValue, setEditingFieldValue] = useState('');
  const [formValue, setFormValue] = useState<any>({});
  const [sectionIds, setSectionIds] = useState<any>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statementToDelete, setStatementToDelete] = useState<number | null>(null);
  
  const [pageData, setPageData] = useState<FinancialStatementsPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locale, setLocale] = useState<string>('en');

  // Table headers - locale-aware
  const financialStatementsHeaders = [
    { name: locale === 'ar' ? 'العنوان' : 'Title', selector: 'title', sortable: true },
    { name: locale === 'ar' ? 'الرابط' : 'URL', selector: 'url', sortable: true },
    { name: locale === 'ar' ? 'الحالة' : 'Status', selector: 'status', sortable: true },
    { name: locale === 'ar' ? 'الإجراءات' : 'Actions', selector: 'actions', sortable: false }
  ];

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL || 'https://giuliana-gadolinic-corporately.ngrok-free.dev';
  const BEARER_TOKEN = (store.getState() as any).block.token;
  const PAGE_SLUG = 'financial-statement';

  const fetchPageData = async (currentLocale: string = locale) => {
    try {
      setIsLoading(true);
      
      const response = await getPageData(PAGE_SLUG, currentLocale);
      const result = response.data;

      if (result.success && result.data && result.data.page && result.data.page.sections) {
        const sections = result.data.page.sections;
        
        // Map section keys to schema and store section IDs
        const sectionIdMap: any = {};
        sections.forEach((section: any) => {
          sectionIdMap[section.key] = section.id;
        });
        setSectionIds(sectionIdMap);
        
        // Extract hero section
        const heroSection = getSectionContent(sections.find((s: any) => s.key === 'financial_statement_hero')) || {};
        const statementSection = getSectionContent(sections.find((s: any) => s.key === 'financial_statement')) || {};
        
        const parsedData: FinancialStatementsPageData = {
          header: {
            logo: Images.FactoringLogo,
            navigation: {
              about: { text: 'About', url: '/about' },
              contact: { text: 'Contact', url: '/contact' }
            }
          },
          hero: {
            image: heroSection.hero_image?.url ? getFullImageUrl(heroSection.hero_image.url, API_BASE_URL) : '',
            title: statementSection.heading || (currentLocale === 'ar' ? 'البيانات المالية' : 'Financial Statements')
          },
          breadcrumb: {
            home: { text: currentLocale === 'ar' ? 'الرئيسية' : 'Home', url: '/' },
            financialStatements: { text: currentLocale === 'ar' ? 'البيانات المالية' : 'Financial Statements', url: '/financial-statements' }
          },
          content: {
            title: statementSection.heading || (currentLocale === 'ar' ? 'البيانات المالية' : 'Financial Statements'),
            description: statementSection.description || ''
          },
          statements: statementSection.statements || []
        };
        
        
        // Set form values for editing
        setFormValue({
          financial_statement_hero: {
            hero_image: {
              url: heroSection.hero_image?.url || ''
            }
          },
          financial_statement: {
            heading: statementSection.heading || '',
            description: statementSection.description || '',
            statements: statementSection.statements || []
          }
        });
        
        setPageData(parsedData);
      } else {
      }
    } catch (err) {
      console.error('Error fetching financial statements data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(locale);
  }, [locale]);

  const mappedData = formValue.financial_statement?.statements?.map((statement: any, index: number) => ({
    id: index + 1,
    title: statement.title || '',
    url: statement.url || '',
    status: statement.status || false
  }));

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
          toast.success(t('toast.fileUploaded'));
        } else {
          toast.error(t('toast.failedUploadFile'));
        }
      } catch (err) {
        console.error('Error uploading file:', err);
        toast.error(t('toast.errorUploadingFile'));
      }
    };
    input.click();
  };

  const handleDeleteStatement = (rowIndex: number) => {
    setStatementToDelete(rowIndex);
    setShowDeleteModal(true);
  };

  const confirmDeleteStatement = () => {
    if (statementToDelete !== null) {
      setFormValue((prev: any) => ({
        ...prev,
        financial_statement: {
          ...prev.financial_statement,
          statements: prev.financial_statement?.statements?.filter((_: any, index: number) => index !== statementToDelete) || []
        }
      }));
      
      // Close modal
      setShowDeleteModal(false);
      setStatementToDelete(null);
      
      // Show success message
      toast.success(t('toast.statementDeleted'));
    }
  };

  const renderTableCell = (row: any, column: any, rowIndex: number) => {
    const fieldPath = `financial_statement.statements.${rowIndex}.${column.selector}`;
    
    if (column.selector === 'actions') {
      // Actions column - delete button (same as FaqPageSettings)
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => handleDeleteStatement(rowIndex)}
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
            title={t('financial.deleteStatement')}
          >
            {/* Trash/Delete Icon SVG (same as FaqPageSettings) */}
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
      );
    } else if (column.selector === 'url') {
      // Media type field - show URL and allow file upload
      return (
        <div
          onClick={() => handleFileUpload(fieldPath)}
          style={{
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '2px',
            backgroundColor: 'var(--color-surface-muted)',
            border: '1px solid var(--color-border-light)',
            fontSize: '12px',
            color: 'var(--color-action-blue)',
            textDecoration: 'underline'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
        >
          {row.url ? '📄 ' + row.url.split('/').pop() : (locale === 'ar' ? '📄 رفع ملف' : '📄 Upload File')}
        </div>
      );
    } else if (column.selector === 'title') {
      // Text type field - inline editing
      const isEditing = editingFieldPath === fieldPath;
      
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
              borderRadius: '2px',
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
              setEditingFieldValue(row.title || '');
            }}
            style={{
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '2px',
              transition: 'background-color 0.2s',
              minWidth: '100px',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {row.title || 'Click to edit'}
          </span>
        );
      }
    } else if (column.selector === 'status') {
      // Switch type field - use Antd Switch component
      return (
        <Switch
        className='red-switch'
          checked={row.status}
          onChange={(checked) => {
            updateFormValue(fieldPath, checked);
          }}
        />
      );
    }
    
    return row[column.selector] || 'N/A';
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

  const renderFieldEditor = (
    fieldPath: string,
    value: any,
    fieldType: string,
    placeholder: string = t('field.enterValue')
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
              borderRadius: '2px',
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
              borderRadius: '2px',
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
            borderRadius: '2px',
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
    }

    return <span>{value || 'N/A'}</span>;
  };

  const handlePublish = async () => {
    try {
      setIsLoading(true);
      
      
      const sections = [
        {
          section_id: sectionIds.financial_statement_hero,
          content: {
            hero_image: {
              url: formValue.financial_statement_hero?.hero_image?.url || ''
            }
          }
        },
        {
          section_id: sectionIds.financial_statement,
          content: {
            heading: formValue.financial_statement?.heading || '',
            description: formValue.financial_statement?.description || '',
            statements: formValue.financial_statement?.statements || []
          }
        }
      ];
      
      
      const response = await updatePageData(5, {
        locale: locale,
        sections: sections
      });

      if (response.status === 200) {
        const result = response.data;
        
        toast.success(t('toast.financialPublished'));
        
        // Re-fetch data to reflect changes
        await fetchPageData(locale);
      } else {
        const errorText = response.data?.message || 'Unknown error';
        console.error('❌ Publish failed:', errorText);
        toast.error(t('toast.failedPublishFinancial'));
      }
    } catch (err) {
      console.error('Error publishing financial statements:', err);
      toast.error(t('toast.errorPublishingFinancial'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !pageData) {
    return <Loader />;
  }

  return (
    <div className="header-footer-settings__landing-template">
      {/* Header with Language Switcher */}
      <div className="header-footer-settings__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h2 className="header-footer-settings__header-title" style={{ margin: 0 }}>
          {t('header.financialStatementsPage')}
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
            borderRadius: '2px',
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
          {isLoading ? t('publishing') : t('publish')}
        </div>
      </div>

      {/* Header */}
      {/* <header className="header-footer-settings__landing-header">
        <div className="header-footer-settings__landing-header-content">
          <div className="header-footer-settings__landing-logo">
            <img src={pageData.header.logo} alt="Factoring Valley Logo" style={{ height: '40px' }} />
          </div>
          <nav className="header-footer-settings__landing-nav">
            <a href={pageData.header.navigation.about.url} className="header-footer-settings__landing-nav-link">
              {pageData.header.navigation.about.text}
            </a>
            <a href={pageData.header.navigation.contact.url} className="header-footer-settings__landing-nav-link">
              {pageData.header.navigation.contact.text}
            </a>
            <div className="header-footer-settings__landing-language">
              <span>عربي</span>
              <div className="header-footer-settings__landing-language-indicator">✓</div>
            </div>
          </nav>
        </div>
      </header> */}

      {/* Hero Image Section */}
      <section style={{
        position: 'relative',
        height: '400px',
        backgroundColor: 'var(--color-overlay-light)',
        backgroundImage: formValue.financial_statement_hero?.hero_image?.url ? `url(${getFullImageUrl(formValue.financial_statement_hero.hero_image.url, API_BASE_URL)})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Hero Image Upload Button */}
        <button
          onClick={() => handleFileUpload('financial_statement_hero.hero_image.url')}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            backgroundColor: 'var(--color-overlay-dark)',
            color: 'var(--primary-foreground)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '2px',
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
          {formValue.financial_statement_hero?.hero_image?.url ? t('changeHeroImage') : t('uploadHeroImage')}
        </button>
      </section>

      {/* Breadcrumb */}
      <div className="header-footer-settings__about-breadcrumb">
        <button 
          className="header-footer-settings__breadcrumb-button"
          style={{ cursor: 'default', background: 'none', border: 'none', padding: 0 }}
        >
          {pageData.breadcrumb.home.text}
        </button>
        <span className="header-footer-settings__breadcrumb-separator"> / </span>
        <button 
          className="header-footer-settings__breadcrumb-button"
          style={{ cursor: 'default', background: 'none', border: 'none', padding: 0 }}
        >
          {pageData.breadcrumb.financialStatements.text}
        </button>
      </div>

      {/* Main Content */}
      <section style={{
        backgroundColor: 'var(--background)',
        color: 'var(--color-text-dark)',
        padding: '60px 40px',
        minHeight: '400px'
      }}>
        {/* Heading and Description Editor */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'var(--color-text-dark)',
            marginBottom: '20px'
          }}>
            {renderFieldEditor('financial_statement.heading', formValue.financial_statement?.heading, 'text', 'Enter heading')}
          </h1>
          {renderFieldEditor('financial_statement.description', formValue.financial_statement?.description, 'textarea', 'Enter description')}
        </div>

        {/* Statements Table */}
        <div style={{
          backgroundColor: 'var(--background)',
          borderRadius: '2px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* Table Header with Add Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--color-text-dark)'
            }}>
              {t('financial.financialStatements')}
            </h3>
            <button
              className="theme-btn-next"
              onClick={() => {
                // Add new statement to the form value
                const newStatement = {
                  title: locale === 'ar' ? 'بيان جديد' : 'New Statement',
                  url: '',
                  status: true
                };
                
                setFormValue((prev: any) => ({
                  ...prev,
                  financial_statement: {
                    ...prev.financial_statement,
                    statements: [
                      ...(prev.financial_statement?.statements || []),
                      newStatement
                    ]
                  }
                }));
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {t('financial.addStatement')}
            </button>
        </div>
          
          {/* Custom Table */}
          <div style={{
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid var(--color-border-subtle)',
              background: themeStyle?.table.backgroundColor || '#FAF2F3',
              borderRadius: '2px 2px 0 0',
            }}>
              {financialStatementsHeaders.map((column: any, index: number) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    justifyContent: 'start',
                    alignItems: 'center',
                    background: themeStyle?.table.backgroundColor || '#FAF2F3',
                    color: themeStyle?.table.headingColor || '#090909',
                    fontSize: '12px',
                    fontWeight: '400',
                    display: 'flex',
                    cursor: column.sortable ? 'pointer' : 'default'
                  }}
                >
                  {column.name}
                  {column.sortable && (
                    <span style={{ marginLeft: '4px', opacity: 0.5 }}>↕</span>
                  )}
        </div>
              ))}
      </div>

            {/* Table Body */}
            <div>
              {mappedData && mappedData.length > 0 ? (
                mappedData.map((row: any, rowIndex: number) => (
                  <div
                    key={rowIndex}
                    style={{
                      display: 'flex',
                      borderBottom: rowIndex === mappedData.length - 1 ? 'none' : '1px solid var(--color-border-subtle)',
                      minHeight: '44px',
                      padding: '0px 10px',
                      backgroundColor: rowIndex % 2 === 0 ? 'var(--background)' : 'var(--color-surface-cloud)'
                    }}
                  >
                    {financialStatementsHeaders.map((column: any, colIndex: number) => (
                      <div
                        key={colIndex}
                        style={{
                          flex: 1,
                          padding: '12px 8px',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          fontSize: '15px',
                          color: themeStyle?.table.bodyTextColor || 'black',
                          justifyContent: 'start',
                          alignItems: 'center',
                          display: 'flex'
                        }}
                      >
                        {renderTableCell(row, column, rowIndex)}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
        <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'var(--color-text-muted)',
                  fontSize: '16px',
                  backgroundColor: 'var(--background)'
                }}>
                  No financial statements available at the moment.
        </div>
      )}
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
            borderRadius: '2px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--color-text-dark)' }}>{t('modal.editContent')}</h3>
            <div style={{
              border: '1px solid var(--color-border-light)',
              borderRadius: '2px',
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
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowTextEditor(false);
                  setEditingFieldPath('');
                }}
              >
                {t('common:cancel')}
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-action-blue)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  updateFormValue(editingFieldPath, editingFieldValue);
                  setShowTextEditor(false);
                  setEditingFieldPath('');
                }}
              >
                {t('common:save')}
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
            borderRadius: '2px',
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
              {t('financial.deleteStatement')}
            </h3>
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              lineHeight: '1.5'
            }}>
              {t('financial.deleteConfirm')}
            </p>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStatementToDelete(null);
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--color-border-muted)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--color-text-muted)',
                  borderRadius: '2px',
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
                {t('common:cancel')}
              </button>
              <button
                onClick={confirmDeleteStatement}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: 'var(--theme-secondary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: '2px',
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
                {t('common:delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialStatementsSettings;
