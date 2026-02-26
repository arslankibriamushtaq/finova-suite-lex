import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface FormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    taxId: string;
  };
  addressInfo: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  investorProfile: {
    type: 'Individual' | 'Corporate' | 'Trust' | 'Family Office' | 'Institutional';
    riskProfile: 'Conservative' | 'Moderate' | 'Moderate-Aggressive' | 'Aggressive';
    investmentExperience: 'Novice' | 'Intermediate' | 'Advanced' | 'Professional';
    liquidNetWorth: string;
    annualIncome: string;
    investmentObjectives: string[];
    accreditedInvestor: boolean;
  };
  complianceInfo: {
    kycDocuments: File[];
    politicallyExposed: boolean;
    sanctions: boolean;
    sourceOfFunds: string;
    regulatoryRestrictions: string;
  };
}

export default function AddInvestor() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      taxId: '',
    },
    addressInfo: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    investorProfile: {
      type: 'Individual',
      riskProfile: 'Moderate',
      investmentExperience: 'Intermediate',
      liquidNetWorth: '',
      annualIncome: '',
      investmentObjectives: [],
      accreditedInvestor: false,
    },
    complianceInfo: {
      kycDocuments: [],
      politicallyExposed: false,
      sanctions: false,
      sourceOfFunds: '',
      regulatoryRestrictions: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, name: 'Personal Info', description: 'Basic personal information' },
    { id: 2, name: 'Address', description: 'Contact and address details' },
    { id: 3, name: 'Investor Profile', description: 'Investment preferences and profile' },
    { id: 4, name: 'Compliance', description: 'KYC and compliance documentation' },
  ];

  const investmentObjectives = [
    'Capital Preservation',
    'Income Generation',
    'Capital Appreciation',
    'Diversification',
    'Tax Efficiency',
    'ESG/Sustainable Investing',
    'Alternative Investments',
    'Real Estate',
  ];

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.personalInfo.firstName) newErrors.firstName = 'First name is required';
        if (!formData.personalInfo.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.personalInfo.email) newErrors.email = 'Email is required';
        if (!formData.personalInfo.phone) newErrors.phone = 'Phone is required';
        break;
      case 2:
        if (!formData.addressInfo.street) newErrors.street = 'Street address is required';
        if (!formData.addressInfo.city) newErrors.city = 'City is required';
        if (!formData.addressInfo.state) newErrors.state = 'State is required';
        if (!formData.addressInfo.zipCode) newErrors.zipCode = 'ZIP code is required';
        break;
      case 3:
        if (!formData.investorProfile.liquidNetWorth) newErrors.liquidNetWorth = 'Net worth is required';
        if (!formData.investorProfile.annualIncome) newErrors.annualIncome = 'Annual income is required';
        break;
      case 4:
        if (!formData.complianceInfo.sourceOfFunds) newErrors.sourceOfFunds = 'Source of funds is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to investor detail page
      navigate('/admin/investors/123'); // In real app, use actual ID from response
    } catch (error) {
      console.error('Error creating investor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const toggleInvestmentObjective = (objective: string) => {
    const current = formData.investorProfile.investmentObjectives;
    const updated = current.includes(objective)
      ? current.filter(o => o !== objective)
      : [...current, objective];
    
    updateFormData('investorProfile', 'investmentObjectives', updated);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            to="/admin/investors"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Investors
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Investor</h1>
        <p className="text-gray-600">Complete the form below to onboard a new investor</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? 'bg-green-600 text-white'
                      : step.id === currentStep
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {step.id < steps.length && (
                  <div className={`ml-6 w-16 h-0.5 ${
                    step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.firstName}
                    onChange={(e) => updateFormData('personalInfo', 'firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.lastName}
                    onChange={(e) => updateFormData('personalInfo', 'lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) => updateFormData('personalInfo', 'email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.personalInfo.phone}
                    onChange={(e) => updateFormData('personalInfo', 'phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.nationality}
                    onChange={(e) => updateFormData('personalInfo', 'nationality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Identification Number
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.taxId}
                    onChange={(e) => updateFormData('personalInfo', 'taxId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="SSN, EIN, or other tax ID"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.addressInfo.street}
                    onChange={(e) => updateFormData('addressInfo', 'street', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.street ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.street}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.addressInfo.city}
                    onChange={(e) => updateFormData('addressInfo', 'city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={formData.addressInfo.state}
                    onChange={(e) => updateFormData('addressInfo', 'state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.addressInfo.zipCode}
                    onChange={(e) => updateFormData('addressInfo', 'zipCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.zipCode ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.zipCode}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={formData.addressInfo.country}
                    onChange={(e) => updateFormData('addressInfo', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="USA">United States</option>
                    <option value="CAN">Canada</option>
                    <option value="GBR">United Kingdom</option>
                    <option value="DEU">Germany</option>
                    <option value="FRA">France</option>
                    <option value="JPN">Japan</option>
                    <option value="AUS">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Investor Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investor Type
                  </label>
                  <select
                    value={formData.investorProfile.type}
                    onChange={(e) => updateFormData('investorProfile', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Trust">Trust</option>
                    <option value="Family Office">Family Office</option>
                    <option value="Institutional">Institutional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Profile
                  </label>
                  <select
                    value={formData.investorProfile.riskProfile}
                    onChange={(e) => updateFormData('investorProfile', 'riskProfile', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Conservative">Conservative</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Moderate-Aggressive">Moderate-Aggressive</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Experience
                  </label>
                  <select
                    value={formData.investorProfile.investmentExperience}
                    onChange={(e) => updateFormData('investorProfile', 'investmentExperience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Novice">Novice</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liquid Net Worth *
                  </label>
                  <input
                    type="text"
                    value={formData.investorProfile.liquidNetWorth}
                    onChange={(e) => updateFormData('investorProfile', 'liquidNetWorth', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.liquidNetWorth ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="$1,000,000"
                  />
                  {errors.liquidNetWorth && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.liquidNetWorth}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income *
                  </label>
                  <input
                    type="text"
                    value={formData.investorProfile.annualIncome}
                    onChange={(e) => updateFormData('investorProfile', 'annualIncome', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.annualIncome ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="$200,000"
                  />
                  {errors.annualIncome && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.annualIncome}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Objectives
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {investmentObjectives.map((objective) => (
                      <label key={objective} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.investorProfile.investmentObjectives.includes(objective)}
                          onChange={() => toggleInvestmentObjective(objective)}
                          className="rounded border-gray-300 text-black focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700">{objective}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.investorProfile.accreditedInvestor}
                      onChange={(e) => updateFormData('investorProfile', 'accreditedInvestor', e.target.checked)}
                      className="rounded border-gray-300 text-black focus:ring-gray-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Accredited Investor</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    I certify that I meet the criteria for an accredited investor as defined by SEC regulations
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance & Documentation</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KYC Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload identification documents, proof of address, and financial statements
                    </p>
                    <button className="text-black hover:text-gray-800 font-medium">
                      Choose Files
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source of Funds *
                  </label>
                  <textarea
                    value={formData.complianceInfo.sourceOfFunds}
                    onChange={(e) => updateFormData('complianceInfo', 'sourceOfFunds', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.sourceOfFunds ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe the source of investment funds..."
                  />
                  {errors.sourceOfFunds && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.sourceOfFunds}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Regulatory Restrictions or Notes
                  </label>
                  <textarea
                    value={formData.complianceInfo.regulatoryRestrictions}
                    onChange={(e) => updateFormData('complianceInfo', 'regulatoryRestrictions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Any regulatory restrictions or special considerations..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="pep"
                      checked={formData.complianceInfo.politicallyExposed}
                      onChange={(e) => updateFormData('complianceInfo', 'politicallyExposed', e.target.checked)}
                      className="rounded border-gray-300 text-black focus:ring-gray-500"
                    />
                    <label htmlFor="pep" className="text-sm text-gray-700">
                      Politically Exposed Person (PEP) or related to PEP
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sanctions"
                      checked={formData.complianceInfo.sanctions}
                      onChange={(e) => updateFormData('complianceInfo', 'sanctions', e.target.checked)}
                      className="rounded border-gray-300 text-black focus:ring-gray-500"
                    />
                    <label htmlFor="sanctions" className="text-sm text-gray-700">
                      Subject to economic sanctions or restrictions
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/admin/investors"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Link>

              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Investor
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
