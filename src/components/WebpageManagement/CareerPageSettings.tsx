import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Types for API integration
interface CareerPageData {
  header: {
    title: string;
    subtitle: string;
  };
  description: {
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  };
  opportunities: {
    title: string;
    jobs: Array<{
      id: string;
      title: string;
      postedDate: string;
      location: string;
      buttonText: string;
    }>;
  };
}

// Dummy data - will be replaced with API data in future
const DUMMY_CAREER_DATA: CareerPageData = {
  header: {
    title: "Careers",
    subtitle: "Why work with Factoring Valley!"
  },
  description: {
    paragraph1: "At Factoring Valley, we pride ourselves on fostering a dynamic and inclusive work environment that values innovation, collaboration, and individual growth. Joining our team means becoming part of a community where diverse perspectives are celebrated, and every voice is heard. We are committed to providing our employees with opportunities for professional development, ensuring that they stay at the forefront of their respective fields.",
    paragraph2: "Our organization encourages a healthy work-life balance, recognizing the importance of both personal and professional fulfillment. We believe in empowering our team members to unleash their full potential, fostering a culture that rewards creativity and initiative. As a company, we are dedicated to making a positive impact not only within our industry but also within the communities we serve.",
    paragraph3: "At the heart of our success lies a commitment to excellence, where each employee plays a crucial role in driving the company forward. We offer competitive compensation packages, comprehensive benefits, and a range of perks that contribute to a fulfilling and rewarding career. If you are looking for a challenging yet supportive work environment where your skills are valued and your aspirations are nurtured, Factoring Valley is the place for you. Join us on our journey of innovation, collaboration, and continuous growth."
  },
  opportunities: {
    title: "Current Opportunities",
    jobs: [
      {
        id: "1",
        title: "Finance Manager",
        postedDate: "20 Jan, 2024",
        location: "Riyadh - Saudi Arabia",
        buttonText: "Apply now →"
      },
      {
        id: "2",
        title: "Senior Sales Manager",
        postedDate: "20 Jan, 2024",
        location: "Riyadh - Saudi Arabia",
        buttonText: "Apply now →"
      },
      {
        id: "3",
        title: "Digital Account Manager",
        postedDate: "20 Jan, 2024",
        location: "Riyadh - Saudi Arabia",
        buttonText: "Apply now →"
      },
      {
        id: "4",
        title: "Business Development Officer",
        postedDate: "20 Jan, 2024",
        location: "Riyadh - Saudi Arabia",
        buttonText: "Apply now →"
      },
      {
        id: "5",
        title: "Senior Sales Manager",
        postedDate: "20 Jan, 2024",
        location: "Riyadh - Saudi Arabia",
        buttonText: "Apply now →"
      },
      {
        id: "6",
        title: "Senior Sales Manager",
        postedDate: "20 Jan, 2024",
        location: "Riyadh - Saudi Arabia",
        buttonText: "Apply now →"
      }
    ]
  }
};

const CareerPageSettings = () => {
  const { t } = useTranslation('webPages');
  const navigate = useNavigate();
  
  // UI States
  const [isPublished, setIsPublished] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [editingField, setEditingField] = useState('');
  
  // Template Data State - will be populated from API in future
  const [careerData, setCareerData] = useState<CareerPageData>(DUMMY_CAREER_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Load template data on component mount
  useEffect(() => {
    const loadCareerData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCareerData();
        setCareerData(data);
      } catch (error) {
        console.error('Error loading career data:', error);
        // Keep dummy data on error
      } finally {
        setIsLoading(false);
      }
    };

    loadCareerData();
  }, []);

  // API Integration Functions - to be implemented later
  const fetchCareerData = async (): Promise<CareerPageData> => {
    // TODO: Replace with actual API call
    // const response = await api.get('/api/career-page');
    // return response.data;
    return DUMMY_CAREER_DATA;
  };

  const saveCareerData = async (data: CareerPageData): Promise<void> => {
    // TODO: Replace with actual API call
    // await api.post('/api/career-page', data);
  };

  const handlePublish = async () => {
    try {
      // Save all career data to API
      await saveCareerData(careerData);
      setIsPublished(true);
      // Remove auto-navigation - let user close modal manually
    } catch (error) {
      console.error('Error saving career template:', error);
      // Handle error - show error message to user
    }
  };

  const handleButtonClick = (jobIndex?: number) => {
    if (jobIndex !== undefined) {
      setEditingText(careerData.opportunities.jobs[jobIndex].buttonText);
      setEditingField(`opportunities.jobs.${jobIndex}.buttonText`);
    } else {
      setEditingText('Apply now →');
      setEditingField('buttonText');
    }
    setShowEditModal(true);
  };

  const handleApply = () => {
    // Update career data with new button text
    if (editingField.includes('jobs')) {
      const jobIndex = parseInt(editingField.split('.')[2]);
      setCareerData(prev => ({
        ...prev,
        opportunities: {
          ...prev.opportunities,
          jobs: prev.opportunities.jobs.map((job, index) => 
            index === jobIndex ? { ...job, buttonText: editingText } : job
          )
        }
      }));
    }
    setShowEditModal(false);
    setEditingField('');
    setEditingText('');
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingField('');
    setEditingText('');
  };

  const handleTextClick = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingText(currentValue);
  };

  const handleTextSave = () => {
    // Update career data based on field path
    setCareerData(prev => {
      const newData = { ...prev };
      const fieldParts = editingField.split('.');
      
      if (fieldParts.length === 1) {
        // Direct field
        (newData as any)[fieldParts[0]] = editingText;
      } else if (fieldParts.length === 2) {
        // Nested field (e.g., header.title)
        (newData as any)[fieldParts[0]][fieldParts[1]] = editingText;
      } else if (fieldParts.length === 3) {
        // Deeply nested field (e.g., description.paragraph1)
        (newData as any)[fieldParts[0]][fieldParts[1]] = editingText;
      } else if (fieldParts.length === 4) {
        // Array field (e.g., opportunities.jobs.0.title)
        const [section, subSection, index, field] = fieldParts;
        const items = [...(newData as any)[section][subSection]];
        items[parseInt(index)] = { ...items[parseInt(index)], [field]: editingText };
        (newData as any)[section][subSection] = items;
      }
      
      return newData;
    });
    setEditingField('');
    setEditingText('');
  };

  const handleTextCancel = () => {
    setEditingField('');
    setEditingText('');
  };

  const EditableText = ({ field, value, className = '', isTextarea = false }: { field: string, value: string, className?: string, isTextarea?: boolean }) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      return (
        <div className="header-footer-settings__editable-container">
          {isTextarea ? (
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleTextSave();
                if (e.key === 'Escape') handleTextCancel();
              }}
              onBlur={handleTextSave}
              className={`header-footer-settings__editable-input ${className}`}
              rows={4}
              autoFocus
            />
          ) : (
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
              autoFocus
            />
          )}
        </div>
      );
    }
    
    return (
      <span 
        className={`header-footer-settings__editable-text ${className}`}
        onClick={() => handleTextClick(field, value)}
      >
        {value}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="header-footer-settings">
        <div className="header-footer-settings__loading">
          <div className="header-footer-settings__loading-spinner"></div>
          <p>{t('loading.career')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="header-footer-settings">
      {/* Header Section */}
      <div className="header-footer-settings__header">
        <h2 className="header-footer-settings__header-title">
          {t('header.careerPage')}
        </h2>
      </div>

      {/* PUBLISH Bar */}
      <div className="header-footer-settings__publish-bar" onClick={handlePublish}>
        <div className="header-footer-settings__publish-text">{t('publish')}</div>
      </div>

      {/* Main Content Area */}
      <div className="header-footer-settings__main-content">
        {/* Template Preview */}
        <div className="header-footer-settings__template-preview">
          {/* Career Page Template */}
          <div className="header-footer-settings__career-template">
            {/* Header */}
            <div className="header-footer-settings__career-header">
              <h1 className="header-footer-settings__career-title">
                <EditableText 
                  field="header.title" 
                  value={careerData.header.title}
                />
              </h1>
              <h2 className="header-footer-settings__career-subtitle">
                <EditableText 
                  field="header.subtitle" 
                  value={careerData.header.subtitle}
                />
              </h2>
            </div>

            {/* Company Description */}
            <div className="header-footer-settings__career-description">
              <p className="header-footer-settings__career-paragraph">
                <EditableText 
                  field="description.paragraph1" 
                  value={careerData.description.paragraph1}
                  isTextarea={true}
                />
              </p>
              <p className="header-footer-settings__career-paragraph">
                <EditableText 
                  field="description.paragraph2" 
                  value={careerData.description.paragraph2}
                  isTextarea={true}
                />
              </p>
              <p className="header-footer-settings__career-paragraph">
                <EditableText 
                  field="description.paragraph3" 
                  value={careerData.description.paragraph3}
                  isTextarea={true}
                />
              </p>
            </div>

            {/* Current Opportunities */}
            <div className="header-footer-settings__career-opportunities">
              <h2 className="header-footer-settings__career-opportunities-title">
                <EditableText 
                  field="opportunities.title" 
                  value={careerData.opportunities.title}
                />
              </h2>

              {/* Job Listings */}
              <div className="header-footer-settings__career-jobs">
                {careerData.opportunities.jobs.map((job, index) => (
                  <div key={job.id} className="header-footer-settings__career-job">
                    <div className="header-footer-settings__career-job-info">
                      <h3 className="header-footer-settings__career-job-title">
                        <EditableText 
                          field={`opportunities.jobs.${index}.title`} 
                          value={job.title}
                        />
                      </h3>
                      <p className="header-footer-settings__career-job-date">
                        {t('career.postedOn')} <EditableText
                          field={`opportunities.jobs.${index}.postedDate`} 
                          value={job.postedDate}
                        />
                      </p>
                      <p className="header-footer-settings__career-job-location">
                        {t('career.location')} <EditableText
                          field={`opportunities.jobs.${index}.location`} 
                          value={job.location}
                        />
                      </p>
                    </div>
                    <button 
                      onClick={() => handleButtonClick(index)}
                      className="header-footer-settings__career-job-button"
                    >
                      {job.buttonText}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button Edit Modal */}
      {showEditModal && (
        <div className="header-footer-settings__edit-modal-overlay">
          <div className="header-footer-settings__edit-modal">
            <div className="header-footer-settings__edit-modal-header">
              <h3 className="header-footer-settings__edit-modal-title">
                {t('modal.editButtonDetails')}
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
                <label className="header-footer-settings__edit-label">{t('field.buttonText')}</label>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="header-footer-settings__edit-input"
                />
              </div>
            </div>
            <div className="header-footer-settings__edit-modal-footer">
              <button
                onClick={handleApply}
                className="header-footer-settings__edit-apply-btn"
              >
                {t('common:apply')}
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
            <h3 className="header-footer-settings__success-title">{t('success.careerTitle')}</h3>
            <p className="header-footer-settings__success-text">
              {t('success.careerText')}
            </p>
            <button
              onClick={() => {
                setIsPublished(false);
                navigate('/WebPageManagement/CareerPage');
              }}
              className="theme-btn-next"
            >
              {t('common:ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPageSettings;
