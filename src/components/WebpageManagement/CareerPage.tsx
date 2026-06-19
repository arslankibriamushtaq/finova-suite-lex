import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CareerPage = () => {
  const navigate = useNavigate();
  const [showEditButton, setShowEditButton] = useState(false);

  const handleEditTemplate = () => {
    navigate('/WebPageManagement/CareerPage/Settings');
  };

  return (
    <>
      {/* Main Content */}
      <div style={{
        backgroundColor: 'var(--color-surface-snow)',
        padding: '40px 20px',
        minHeight: '100vh'
      }}>
        {/* Page Header */}
        <div style={{
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            borderRadius: '6px',
            padding: '12px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'inline-block',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '1rem',
              fontStyle: 'italic',
              color: 'var(--color-text-silver)',
              margin: '0',
              fontWeight: 'normal'
            }}>
              Career Page
            </h1>
          </div>
        </div>

        {/* Template Preview */}
        <div style={{
          backgroundColor: 'var(--background)',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
        onMouseEnter={() => setShowEditButton(true)}
        onMouseLeave={() => setShowEditButton(false)}
        >
          {/* Smoke Screen Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--color-overlay-light)',
            borderRadius: '6px',
            zIndex: 1
          }} />

          {/* Template Preview - Career Page Content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'var(--color-surface-alt)',
            borderRadius: '6px',
            padding: '0',
            border: '1px solid var(--color-border-subtle)',
            overflow: 'hidden'
          }}>
            {/* Edit Template Button - Positioned in top right corner */}
            {showEditButton && (
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                zIndex: 3
              }}>
                <button
                  onClick={handleEditTemplate}
                  className="theme-btn-next"
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Edit Template
                </button>
              </div>
            )}

            {/* Career Page Template Content */}
            <div style={{ 
              backgroundColor: "var(--color-surface-alt)",
              filter: showEditButton ? 'blur(2px)' : 'none',
              transition: 'filter 0.3s ease',
              padding: '40px',
              minHeight: '600px'
            }}>
              {/* Header */}
              <div style={{
                marginBottom: '40px',
                position: 'relative'
              }}>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  margin: '0 0 20px 0'
                }}>
                  Careers
                </h1>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  margin: '0 0 30px 0'
                }}>
                  Why work with Factoring Valley!
                </h2>
              </div>

              {/* Company Description */}
              <div style={{
                marginBottom: '40px',
                lineHeight: '1.6',
                color: '#2c3e50'
              }}>
                <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                  At Factoring Valley, we pride ourselves on fostering a dynamic and inclusive work environment that values innovation, collaboration, and individual growth. Joining our team means becoming part of a community where diverse perspectives are celebrated, and every voice is heard. We are committed to providing our employees with opportunities for professional development, ensuring that they stay at the forefront of their respective fields.
                </p>
                <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                  Our organization encourages a healthy work-life balance, recognizing the importance of both personal and professional fulfillment. We believe in empowering our team members to unleash their full potential, fostering a culture that rewards creativity and initiative. As a company, we are dedicated to making a positive impact not only within our industry but also within the communities we serve.
                </p>
                <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                  At the heart of our success lies a commitment to excellence, where each employee plays a crucial role in driving the company forward. We offer competitive compensation packages, comprehensive benefits, and a range of perks that contribute to a fulfilling and rewarding career. If you are looking for a challenging yet supportive work environment where your skills are valued and your aspirations are nurtured, Factoring Valley is the place for you. Join us on our journey of innovation, collaboration, and continuous growth.
                </p>
              </div>

              {/* Current Opportunities Section */}
              <div>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  marginBottom: '30px'
                }}>
                  Current Opportunities
                </h2>

                {/* Job Listings */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  {/* Finance Manager */}
                  <div style={{
                    backgroundColor: 'var(--color-surface-pressed)',
                    borderRadius: '6px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        margin: '0 0 8px 0'
                      }}>
                        Finance Manager
                      </h3>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Posted on: 20 Jan, 2024
                      </p>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Location: Riyadh - Saudi Arabia
                      </p>
                    </div>
                    <button style={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid #2c3e50',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      color: '#2c3e50',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      Apply now →
                    </button>
                  </div>

                  {/* Senior Sales Manager */}
                  <div style={{
                    backgroundColor: 'var(--color-surface-pressed)',
                    borderRadius: '6px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        margin: '0 0 8px 0'
                      }}>
                        Senior Sales Manager
                      </h3>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Posted on: 20 Jan, 2024
                      </p>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Location: Riyadh - Saudi Arabia
                      </p>
                    </div>
                    <button style={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid #2c3e50',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      color: '#2c3e50',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      Apply now →
                    </button>
                  </div>

                  {/* Digital Account Manager */}
                  <div style={{
                    backgroundColor: 'var(--color-surface-pressed)',
                    borderRadius: '6px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        margin: '0 0 8px 0'
                      }}>
                        Digital Account Manager
                      </h3>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Posted on: 20 Jan, 2024
                      </p>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Location: Riyadh - Saudi Arabia
                      </p>
                    </div>
                    <button style={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid #2c3e50',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      color: '#2c3e50',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      Apply now →
                    </button>
                  </div>

                  {/* Business Development Officer */}
                  <div style={{
                    backgroundColor: 'var(--color-surface-pressed)',
                    borderRadius: '6px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        margin: '0 0 8px 0'
                      }}>
                        Business Development Officer
                      </h3>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Posted on: 20 Jan, 2024
                      </p>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Location: Riyadh - Saudi Arabia
                      </p>
                    </div>
                    <button style={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid #2c3e50',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      color: '#2c3e50',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      Apply now →
                    </button>
                  </div>

                  {/* Additional Senior Sales Manager */}
                  <div style={{
                    backgroundColor: 'var(--color-surface-pressed)',
                    borderRadius: '6px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        margin: '0 0 8px 0'
                      }}>
                        Senior Sales Manager
                      </h3>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Posted on: 20 Jan, 2024
                      </p>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Location: Riyadh - Saudi Arabia
                      </p>
                    </div>
                    <button style={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid #2c3e50',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      color: '#2c3e50',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      Apply now →
                    </button>
                  </div>

                  {/* Another Senior Sales Manager */}
                  <div style={{
                    backgroundColor: 'var(--color-surface-pressed)',
                    borderRadius: '6px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        margin: '0 0 8px 0'
                      }}>
                        Senior Sales Manager
                      </h3>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Posted on: 20 Jan, 2024
                      </p>
                      <p style={{ color: '#2c3e50', margin: '4px 0', fontSize: '14px' }}>
                        Location: Riyadh - Saudi Arabia
                      </p>
                    </div>
                    <button style={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid #2c3e50',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      color: '#2c3e50',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      Apply now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareerPage;
