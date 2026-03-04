import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AboutPage from '../WebPages/AboutPage';

const AboutPageManagement: React.FC = () => {
  const navigate = useNavigate();
  const [showEditOption, setShowEditOption] = useState(false);

  const handleEditClick = () => {
    navigate('/Los/WebPageManagement/AboutPage/Settings');
  };

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowEditOption(true)}
      onMouseLeave={() => setShowEditOption(false)}
    >
      {/* Edit Overlay */}
      {showEditOption && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--color-overlay-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={handleEditClick}
        >
          <div 
            style={{
              backgroundColor: 'var(--background)',
              padding: '20px 40px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--color-text-dark)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            Edit Template
          </div>
        </div>
      )}
      
      {/* Render the actual AboutPage component */}
      <AboutPage />
    </div>
  );
};

export default AboutPageManagement;
