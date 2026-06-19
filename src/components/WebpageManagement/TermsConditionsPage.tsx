import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TermsConditions from '../WebPages/TermsConditions';

const TermsConditionsPage: React.FC = () => {
  const [showEditOption, setShowEditOption] = useState(false);
  const navigate = useNavigate();

  const handleEditTemplate = () => {
    navigate('/Los/WebPageManagement/TermsConditionsTemplatePage/Settings');
  };

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowEditOption(true)}
      onMouseLeave={() => setShowEditOption(false)}
    >
      {/* Render the actual TermsConditions component */}
      <TermsConditions />
      
      {/* Edit Template Overlay */}
      {showEditOption && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--color-overlay-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={handleEditTemplate}
        >
          <div
            style={{
              backgroundColor: 'var(--background)',
              padding: '20px 40px',
              borderRadius: '2px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--color-text-dark)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Edit Template
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsConditionsPage;
