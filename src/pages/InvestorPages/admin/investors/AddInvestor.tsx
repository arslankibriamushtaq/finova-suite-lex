import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('investor');
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
    { id: 1, name: t('ai.step1.name'), description: t('ai.step1.desc') },
    { id: 2, name: t('ai.step2.name'), description: t('ai.step2.desc') },
    { id: 3, name: t('ai.step3.name'), description: t('ai.step3.desc') },
    { id: 4, name: t('ai.step4.name'), description: t('ai.step4.desc') },
  ];

  const investmentObjectives = [
    'ai.obj.capitalPreservation',
    'ai.obj.incomeGeneration',
    'ai.obj.capitalAppreciation',
    'ai.obj.diversification',
    'ai.obj.taxEfficiency',
    'ai.obj.esg',
    'ai.obj.alternative',
    'ai.obj.realEstate',
  ];

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.personalInfo.firstName) newErrors.firstName = t('ai.err.firstName');
        if (!formData.personalInfo.lastName) newErrors.lastName = t('ai.err.lastName');
        if (!formData.personalInfo.email) newErrors.email = t('ai.err.email');
        if (!formData.personalInfo.phone) newErrors.phone = t('ai.err.phone');
        break;
      case 2:
        if (!formData.addressInfo.street) newErrors.street = t('ai.err.street');
        if (!formData.addressInfo.city) newErrors.city = t('ai.err.city');
        if (!formData.addressInfo.state) newErrors.state = t('ai.err.state');
        if (!formData.addressInfo.zipCode) newErrors.zipCode = t('ai.err.zipCode');
        break;
      case 3:
        if (!formData.investorProfile.liquidNetWorth) newErrors.liquidNetWorth = t('ai.err.liquidNetWorth');
        if (!formData.investorProfile.annualIncome) newErrors.annualIncome = t('ai.err.annualIncome');
        break;
      case 4:
        if (!formData.complianceInfo.sourceOfFunds) newErrors.sourceOfFunds = t('ai.err.sourceOfFunds');
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
            <ArrowLeft className="w-4 h-4 me-2" />
            {t('kycd.backToInvestors')}
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('ai.title')}</h1>
        <p className="text-gray-600">{t('ai.subtitle')}</p>
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
                      ? 'bg-red-600 text-white'
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
                <div className="ms-3">
                  <p className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {step.id < steps.length && (
                  <div className={`ms-6 w-16 h-0.5 ${
                    step.id < currentStep ? 'bg-red-600' : 'bg-gray-200'
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('ai.personalInfo')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.firstName')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.lastName')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.emailAddr')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.phoneNum')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.dob')}
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
                    {t('ai.nationality')}
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
                    {t('ai.taxId')}
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.taxId}
                    onChange={(e) => updateFormData('personalInfo', 'taxId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder={t('ai.taxIdPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('ai.addressInfo')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.street')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.street}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.city')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.state')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.zip')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.zipCode}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.country')}
                  </label>
                  <select
                    value={formData.addressInfo.country}
                    onChange={(e) => updateFormData('addressInfo', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="USA">{t('ai.country.usa')}</option>
                    <option value="CAN">{t('ai.country.can')}</option>
                    <option value="GBR">{t('ai.country.gbr')}</option>
                    <option value="DEU">{t('ai.country.deu')}</option>
                    <option value="FRA">{t('ai.country.fra')}</option>
                    <option value="JPN">{t('ai.country.jpn')}</option>
                    <option value="AUS">{t('ai.country.aus')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('ai.investorProfile')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.investorType')}
                  </label>
                  <select
                    value={formData.investorProfile.type}
                    onChange={(e) => updateFormData('investorProfile', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Individual">{t('ai.type.individual')}</option>
                    <option value="Corporate">{t('ai.type.corporate')}</option>
                    <option value="Trust">{t('ai.type.trust')}</option>
                    <option value="Family Office">{t('ai.type.familyOffice')}</option>
                    <option value="Institutional">{t('ai.type.institutional')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.riskProfile')}
                  </label>
                  <select
                    value={formData.investorProfile.riskProfile}
                    onChange={(e) => updateFormData('investorProfile', 'riskProfile', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Conservative">{t('ai.risk.conservative')}</option>
                    <option value="Moderate">{t('ai.risk.moderate')}</option>
                    <option value="Moderate-Aggressive">{t('ai.risk.moderateAggressive')}</option>
                    <option value="Aggressive">{t('ai.risk.aggressive')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.investmentExperience')}
                  </label>
                  <select
                    value={formData.investorProfile.investmentExperience}
                    onChange={(e) => updateFormData('investorProfile', 'investmentExperience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="Novice">{t('ai.exp.novice')}</option>
                    <option value="Intermediate">{t('ai.exp.intermediate')}</option>
                    <option value="Advanced">{t('ai.exp.advanced')}</option>
                    <option value="Professional">{t('ai.exp.professional')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.liquidNetWorth')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.liquidNetWorth}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.annualIncome')}
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
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.annualIncome}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.investmentObjectives')}
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
                        <span className="text-sm text-gray-700">{t(objective)}</span>
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
                    <span className="text-sm font-medium text-gray-700">{t('ai.accreditedInvestor')}</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('ai.accreditedNote')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('ai.compliance')}</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.kycDocuments')}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      {t('ai.kycUploadText')}
                    </p>
                    <button className="text-black hover:text-gray-800 font-medium">
                      {t('ai.chooseFiles')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.sourceOfFunds')}
                  </label>
                  <textarea
                    value={formData.complianceInfo.sourceOfFunds}
                    onChange={(e) => updateFormData('complianceInfo', 'sourceOfFunds', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.sourceOfFunds ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={t('ai.sourcePlaceholder')}
                  />
                  {errors.sourceOfFunds && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 me-1" />
                      {errors.sourceOfFunds}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ai.regulatoryRestrictions')}
                  </label>
                  <textarea
                    value={formData.complianceInfo.regulatoryRestrictions}
                    onChange={(e) => updateFormData('complianceInfo', 'regulatoryRestrictions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder={t('ai.regulatoryPlaceholder')}
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
                      {t('ai.pep')}
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
                      {t('ai.sanctions')}
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
                  {t('common:previous')}
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/admin/investors"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4 me-2" />
                {t('common:cancel')}
              </Link>

              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                >
                  {t('common:next')}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2" />
                      {t('ai.creating')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 me-2" />
                      {t('ai.createInvestor')}
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
