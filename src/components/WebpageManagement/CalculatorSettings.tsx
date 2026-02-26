import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Types for API integration
interface CalculatorData {
  financingAmount: {
    minAmount: number;
    maxAmount: number;
    suggestAmount: number;
  };
  financingFee: {
    costOfFinancingAmount: number;
    costOfTermAmount: number;
  };
  loanTenure: {
    minTenure: number;
    maxTenure: number;
  };
}

// Dummy data - will be replaced with API data in future
const DUMMY_CALCULATOR_DATA: CalculatorData = {
  financingAmount: {
    minAmount: 1000,
    maxAmount: 2000,
    suggestAmount: 1500
  },
  financingFee: {
    costOfFinancingAmount: 230,
    costOfTermAmount: 0
  },
  loanTenure: {
    minTenure: 0,
    maxTenure: 3
  }
};

const CalculatorSettings = () => {
  const navigate = useNavigate();
  
  // UI States
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculator Data State - will be populated from API in future
  const [calculatorData, setCalculatorData] = useState<CalculatorData>(DUMMY_CALCULATOR_DATA);

  // Load calculator data on component mount
  useEffect(() => {
    const loadCalculatorData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCalculatorData();
        setCalculatorData(data);
      } catch (error) {
        console.error('Error loading calculator data:', error);
        // Keep dummy data on error
      } finally {
        setIsLoading(false);
      }
    };

    loadCalculatorData();
  }, []);

  // API Integration Functions - to be implemented later
  const fetchCalculatorData = async (): Promise<CalculatorData> => {
    // TODO: Replace with actual API call
    // const response = await api.get('/calculator/settings');
    // return response.data;
    return DUMMY_CALCULATOR_DATA;
  };

  const saveCalculatorData = async (data: CalculatorData): Promise<void> => {
    // TODO: Replace with actual API call
    // await api.post('/calculator/settings', data);
  };

  const handlePublish = async () => {
    try {
      // Save all calculator data to API
      await saveCalculatorData(calculatorData);
      setIsPublished(true);
      // Remove auto-navigation - let user close modal manually
    } catch (error) {
      console.error('Error saving calculator:', error);
      // Handle error - show error message to user
    }
  };

  const handleInputChange = (field: keyof CalculatorData, subField: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setCalculatorData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: numericValue
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="calculator-settings">
        <div className="calculator-settings__loading">
          <div className="calculator-settings__loading-spinner"></div>
          <p>Loading calculator data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calculator-settings">
      {/* Header Section */}
      <div className="calculator-settings__header">
        <h2 className="calculator-settings__header-title">
          Calculator Page / Setting
        </h2>
      </div>

      {/* PUBLISH Bar */}
      <div className="calculator-settings__publish-bar" onClick={handlePublish}>
        <div className="calculator-settings__publish-text">PUBLISH</div>
      </div>

      {/* Main Content Area */}
      <div className="calculator-settings__main-content">
        {/* Calculator Form */}
        <div className="calculator-settings__form-container">
          {/* Language Selector */}
          <div className="calculator-settings__language-selector">
            <span className="calculator-settings__language-text">ENGLISH</span>
            <div className="calculator-settings__language-icon">
              ✓
            </div>
          </div>

          {/* Financing Amount Section */}
          <div className="calculator-settings__section">
            <h3 className="calculator-settings__section-title">
              Financing Amount:
            </h3>
            <div className="calculator-settings__input-row">
              <div className="calculator-settings__input-group">
                <label className="calculator-settings__label">
                  Min Financing Amount
                </label>
                <input
                  type="number"
                  value={calculatorData.financingAmount.minAmount}
                  onChange={(e) => handleInputChange('financingAmount', 'minAmount', e.target.value)}
                  className="calculator-settings__input"
                />
              </div>
              <div className="calculator-settings__input-group">
                <label className="calculator-settings__label">
                  Max Financing Amount
                </label>
                <input
                  type="number"
                  value={calculatorData.financingAmount.maxAmount}
                  onChange={(e) => handleInputChange('financingAmount', 'maxAmount', e.target.value)}
                  className="calculator-settings__input"
                />
              </div>
            </div>
            <div className="calculator-settings__input-group calculator-settings__input-group--full">
              <label className="calculator-settings__label">
                Suggest Financing Amount
              </label>
              <input
                type="number"
                value={calculatorData.financingAmount.suggestAmount}
                onChange={(e) => handleInputChange('financingAmount', 'suggestAmount', e.target.value)}
                className="calculator-settings__input"
              />
            </div>
          </div>

          {/* Financing Fee Section */}
          <div className="calculator-settings__section">
            <h3 className="calculator-settings__section-title">
              Financing Fee:
            </h3>
            <div className="calculator-settings__input-row">
              <div className="calculator-settings__input-group">
                <label className="calculator-settings__label">
                  Cost of Financing Amount
                </label>
                <input
                  type="number"
                  value={calculatorData.financingFee.costOfFinancingAmount}
                  onChange={(e) => handleInputChange('financingFee', 'costOfFinancingAmount', e.target.value)}
                  className="calculator-settings__input"
                />
              </div>
              <div className="calculator-settings__input-group">
                <label className="calculator-settings__label">
                  Cost of Term Amount
                </label>
                <input
                  type="number"
                  value={calculatorData.financingFee.costOfTermAmount}
                  onChange={(e) => handleInputChange('financingFee', 'costOfTermAmount', e.target.value)}
                  className="calculator-settings__input"
                />
              </div>
            </div>
          </div>

          {/* Loan Tenure Section */}
          <div className="calculator-settings__section">
            <h3 className="calculator-settings__section-title">
              Loan Tenure:
            </h3>
            <div className="calculator-settings__input-row">
              <div className="calculator-settings__input-group">
                <label className="calculator-settings__label">
                  Min Tenure
                </label>
                <input
                  type="number"
                  value={calculatorData.loanTenure.minTenure}
                  onChange={(e) => handleInputChange('loanTenure', 'minTenure', e.target.value)}
                  className="calculator-settings__input"
                />
              </div>
              <div className="calculator-settings__input-group">
                <label className="calculator-settings__label">
                  Max Tenure
                </label>
                <input
                  type="number"
                  value={calculatorData.loanTenure.maxTenure}
                  onChange={(e) => handleInputChange('loanTenure', 'maxTenure', e.target.value)}
                  className="calculator-settings__input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {isPublished && (
        <div className="calculator-settings__success-modal">
          <div className="calculator-settings__success-content">
            <div className="calculator-settings__success-icon">
              ✓
            </div>
            <h3 className="calculator-settings__success-title">Calculator Settings Published!</h3>
            <p className="calculator-settings__success-text">
              Your calculator settings have been successfully published.
            </p>
            <button
              onClick={() => {
                setIsPublished(false);
                navigate('/WebPageManagement/CalculatorTemplatePage');
              }}
              className="theme-btn-next"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorSettings;
