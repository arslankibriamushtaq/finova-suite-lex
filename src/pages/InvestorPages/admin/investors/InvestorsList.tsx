import { useState, useEffect } from 'react';
import { Plus as PlusIcon, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getInvestorDashboard, getAllCountries, getAllKycInvestors, getAllKybInvestors, createBusinessShare, Country, InvestorKyc, InvestorKyb } from '../../../../redux/apis/apisInvestor';

import { 
  Plus, 

  Download, 
  Eye, 
  UserCheck, 
  Mail,
  Phone,

  AlertTriangle,
  X,
  Upload,
  FileText,

  User,
  Building,


} from 'lucide-react';
import toast from 'react-hot-toast';




export default function InvestorsList() {
  const navigate = useNavigate();
  const { t } = useTranslation('investor');
  const tLevel = (v: number) => {
    const m: Record<number, string> = { 0: 'ils.lvl.beginner', 1: 'ils.lvl.intermediate', 2: 'ils.lvl.advanced', 3: 'ils.lvl.premium' };
    return t(m[v] || 'ils.lvl.unknown');
  };
  const tEmployment = (v: number) => {
    const m: Record<number, string> = { 0: 'ils.emp.employed', 1: 'ils.emp.selfEmployed', 2: 'ils.emp.businessOwner', 3: 'ils.emp.retired' };
    return t(m[v] || 'ils.lvl.unknown');
  };
  const tDesigCell = (v: number) => {
    const m: Record<number, string> = { 0: 'ils.desig.ceo', 1: 'ils.desig.cfo', 2: 'ils.desig.director', 3: 'ils.desig.manager' };
    return t(m[v] || 'ils.desig.unknown');
  };
  const tVerification = (v: number) => t(v === 0 ? 'ilst.kyc.pending' : v === 1 ? 'ilst.kyc.verified' : 'ilst.kyc.rejected');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);

  const [showNotesModal, setShowNotesModal] = useState(false);


  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Countries state
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'individual' | 'business'>('individual');
  
  // KYC and KYB data state
  const [kycInvestors, setKycInvestors] = useState<InvestorKyc[]>([]);
  const [kybInvestors, setKybInvestors] = useState<InvestorKyb[]>([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [kybLoading, setKybLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Pagination logic
  const getCurrentInvestors = () => {
    const investors = activeTab === 'individual' ? kycInvestors : kybInvestors;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return investors.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const totalItems = activeTab === 'individual' ? kycInvestors.length : kybInvestors.length;
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Form state for individual investor
  const [formData, setFormData] = useState({
    investorId: '',
    firstNameInEnglish: '',
    lastNameInEnglish: '',
    firstNameInArabic: '',
    lastNameInArabic: '',
    nationalId: '',
    IssuanceCountryId: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    lastLogin: new Date().toISOString(),
    investorLevel: 0,
    password: '',
    twoFactorEnabled: false,
    countryId: '',
    employmentStatus: 0,
    // Business-specific fields
    employeeDesignation: 0,
    companyName: '',
    companyEmail: '',
    companyAddress: '',
    companyWebsite: '',
    crNumber: '',
    incorporationDate: '',
    expiryDate: '',
    paidUpCapital: '',
    shareValue: '',
    isLegalEntityIdentifier: false,
    lei: 0,
    addressLine2: '',
    city: '',
    state: '',
    shareholders: [] as Array<{
      fullName: string;
      idPassportNumber: string;
      sharesPercentage: string;
      nationality: string;
      isPEP: boolean;
      isDirector: boolean;
      isManager: boolean;
    }>
  });
  const [formLoading, setFormLoading] = useState(false);
  const [selectedInvestorType, setSelectedInvestorType] = useState<'individual' | 'business' | null>(null);
  const [showSendLink, setShowSendLink] = useState(false);
  const [createdInvestorId, setCreatedInvestorId] = useState<string>('');


  // Handle send link
  const handleSendLink = async () => {
    try {
    
      
      // Prepare the payload with form data
      const payload = {
        email: formData.email,
        link: `https://dev-v2-portfolio-frontend.awn-sa.com/onboarding/${createdInvestorId}`, // Generate link with investor ID
        name: `${formData.firstNameInEnglish} ${formData.lastNameInEnglish}`.trim() || 'Investor'
      };
      
    
      const response = await fetch('https://devapi.awn-sa.com/portfolio/api/v1/Investment/send-link', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(t('ils.toast.linkSent'));
        // Close modal and reset form on success
        setShowCreateModal(false);
        resetFormData();
        setShowSendLink(false);
        // Refresh the dashboard data
        window.location.reload();
      } else {
        toast.error(result.notificationMessage || t('ils.toast.linkFailed'));
      }
    } catch (error) {

      toast.error(t('ils.toast.linkError'));
    }
  };
  // Reset form data function
  const resetFormData = () => {
    setShowSendLink(false);
    setCreatedInvestorId('');
    setFormData({
      investorId: '',
      firstNameInEnglish: '',
      lastNameInEnglish: '',
      firstNameInArabic: '',
      lastNameInArabic: '',
      nationalId: '',
      IssuanceCountryId: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: '',
      lastLogin: new Date().toISOString(),
      investorLevel: 0,
      password: '',
      twoFactorEnabled: false,
      countryId: '',
      employmentStatus: 0,
      employeeDesignation: 0,
      companyName: '',
      companyEmail: '',
      companyAddress: '',
      companyWebsite: '',
      crNumber: '',
      incorporationDate: '',
      expiryDate: '',
      paidUpCapital: '',
      shareValue: '',
      isLegalEntityIdentifier: false,
      lei: 0,
      addressLine2: '',
      city: '',
      state: '',
      shareholders: []
    });
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getInvestorDashboard();
        
        if (result.success) {
          setDashboardData(result.data);
          // toast.success('Dashboard data loaded successfully!');
        } else {
          throw new Error(result.notificationMessage || 'Failed to fetch investor dashboard data');
        }
      } catch (err) {
        console.error('Error fetching investor dashboard data:', err);
        setError(t('ils.err.dashboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        const result = await getAllCountries(1, 100); // Get first 100 countries
        
        if (result.success) {
          setCountries(result.data);
          // toast.success('Countries loaded successfully!');
        } else {
          console.error('Failed to fetch countries:', result.notificationMessage);
          toast.error(t('ils.toast.countriesFailed'));
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
        toast.error(t('ils.toast.countriesError'));
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch KYC investors
  const fetchKycInvestors = async () => {
    try {
      setKycLoading(true);
      const result = await getAllKycInvestors(1, 100);
      
      if (result.success) {
        setKycInvestors(result.data);
        toast.success(result.notificationMessage || t('ils.toast.individualLoaded'));
      } else {
        console.error('Failed to fetch KYC investors:', result.notificationMessage);
        toast.error(t('ils.toast.individualFailed'));
      }
    } catch (err) {
      console.error('Error fetching KYC investors:', err);
      toast.error(t('ils.toast.individualError'));
    } finally {
      setKycLoading(false);
    }
  };

  // Fetch KYB investors
  const fetchKybInvestors = async () => {
    try {
      setKybLoading(true);
      const result = await getAllKybInvestors(1, 100);
      
      if (result.success) {
        setKybInvestors(result.data);
        toast.success(t('ils.toast.businessLoaded'));
      } else {
        console.error('Failed to fetch KYB investors:', result.notificationMessage);
        toast.error(t('ils.toast.businessFailed'));
      }
    } catch (err) {
      console.error('Error fetching KYB investors:', err);
      toast.error(t('ils.toast.businessError'));
    } finally {
      setKybLoading(false);
    }
  };

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'individual') {
      fetchKycInvestors();
    } else if (activeTab === 'business') {
      fetchKybInvestors();
    }
  }, [activeTab]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const apiUrl = selectedInvestorType === 'individual' 
        ? 'https://devapi.awn-sa.com/portfolio/api/v1/InvestorKyc/Create'
        : 'https://devapi.awn-sa.com/portfolio/api/v1/InvestorKyb/Create';
      
      // Create different payloads for KYC vs KYB
      let payload;
   
      
      // Use fallback if createdInvestorId is empty
      const investorIdToUse = createdInvestorId || "";
  
      
      if (selectedInvestorType === 'individual') {
        // KYC payload - individual investor fields only
        payload = {
          investorId: investorIdToUse,
          firstNameInEnglish: formData.firstNameInEnglish,
          lastNameInEnglish: formData.lastNameInEnglish,
          firstNameInArabic: formData.firstNameInArabic,
          lastNameInArabic: formData.lastNameInArabic,
          nationalId: formData.nationalId,
          IssuanceCountryId: formData.IssuanceCountryId,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : new Date().toISOString(),
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          lastLogin: formData.lastLogin,
          profileImage: "",
          // investorLevel: formData.investorLevel,
          // password: formData.password,
          twoFactorEnabled: formData.twoFactorEnabled,
          currencyId: "fa3f58d0-4706-4cb4-245a-08de1204497d",
          countryId: formData.countryId || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          employmentStatus: formData.employmentStatus
        };
      } else {
        // KYB payload - business investor fields
        payload = {
          investorId: investorIdToUse,
          firstNameInEnglish: formData.firstNameInEnglish,
          lastNameInEnglish: formData.lastNameInEnglish,
          firstNameInArabic: formData.firstNameInArabic,
          lastNameInArabic: formData.lastNameInArabic,
          nationalId: formData.nationalId,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : new Date().toISOString(),
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          countryId: formData.countryId || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          employeeDesignation: formData.employeeDesignation,
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          companyAddress: formData.companyAddress,
          companyWebsite: formData.companyWebsite,
          crNumber: formData.crNumber,
          incorporationDate: formData.incorporationDate ? new Date(formData.incorporationDate).toISOString() : '',
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : '',
          paidUpCapital: formData.paidUpCapital,
          shareValue: formData.shareValue,
          shareholders: formData.shareholders,
          currencyId: "fa3f58d0-4706-4cb4-245a-08de1204497d",
          isLegalEntityIdentifier: formData.isLegalEntityIdentifier,
          lei: formData.lei,
          IssuanceCountryId: formData.IssuanceCountryId,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          // password: formData.password,
          twoFactorEnabled: formData.twoFactorEnabled
        };
        }
        
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      
        const result = await response.json();
        
        if (result.success) {
          // For business investors, check if shareholders exist and create them
          if (selectedInvestorType === 'business' && formData.shareholders && formData.shareholders.length > 0) {
            try {
              // Get the KYB ID from the result - check multiple possible locations
              const kybId = result.data?.id || result.data?.investorKybId || result.data?.kybId || result.id || '';
              
              if (!kybId) {
                console.error('KYB ID not found in result:', result);
                toast.error(t('ils.toast.kybIdNotFound'));
                setFormLoading(false);
                return;
              }

              // Map shareholders to the API format
              const businessShares = formData.shareholders.map(shareholder => ({
                investorKybId: kybId,
                fullName: shareholder.fullName,
                idOrPassport: shareholder.idPassportNumber,
                sharePercentage: parseFloat(shareholder.sharesPercentage) || 0,
                countryId: shareholder.nationality,
                isPep: shareholder.isPEP,
                isDirector: shareholder.isDirector,
                isManager: shareholder.isManager
              }));

              // Call BusinessShare API
              const shareResult = await createBusinessShare({ businessShares });
              
              if (shareResult.success) {
                toast.success(result.notificationMessage || t('ils.toast.businessSharesCreated'));
              } else {
                toast.error(t('ils.toast.sharesFailed', { error: shareResult.notificationMessage || t('ils.unknownError') }));
              }
            } catch (shareError) {
              console.error('Error creating business shares:', shareError);
              toast.error(t('ils.toast.sharesFailedNoMsg'));
            }
          } else {
            // Individual investor or business without shareholders
            const successMessage = selectedInvestorType === 'business'
              ? t('ils.toast.businessCreated')
              : t('ils.toast.individualCreated');
            toast.success(result.notificationMessage || successMessage);
          }
          
          setShowSendLink(true);
          // Don't close modal yet, show send link button
        } else {
          const errorMessage = selectedInvestorType === 'business'
            ? t('ils.toast.businessCreateFailed')
            : t('ils.toast.individualCreateFailed');
          console.error('Failed to create investor:', result.notificationMessage);
          toast.error(result.notificationMessage || errorMessage);
        }
    } catch (error) {
      const errorMessage = selectedInvestorType === 'business'
        ? t('ils.toast.businessCreateError')
        : t('ils.toast.individualCreateError');
      console.error('Error creating investor:', error);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-red-100 text-red-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-gray-100 text-gray-900';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Action Handlers
  const handleViewInvestor = (investor: any) => {
    const investorId = investor.investorId || investor.id;
    const investorType = activeTab === 'individual' ? 'kyc' : 'kyb';
    if (investorId) {
      navigate(`/InvestorDashboard/Investors/kyc-kyb-detail/${investorId}?type=${investorType}`);
    } else {
      toast.error(t('ils.toast.investorIdNotFound'));
    }
  };

  const handleEditInvestor = (investor: any) => {
    setSelectedInvestor(investor);
    setShowEditModal(true);
  };



  const handleViewDocuments = (investor: any) => {
    // Navigate to document preview page with investor ID and type
    window.location.href = `Investors/document-preview/${investor.investorId}?type=${activeTab}`;
  };



  const handleViewNotes = (investor: any) => {
    setSelectedInvestor(investor);
    setShowNotesModal(true);
  };


  const confirmDeleteInvestor = () => {
    alert(t('ilst.alert.deleted', { name: selectedInvestor?.name }));
    setShowDeleteModal(false);
    setSelectedInvestor(null);
  };



  const handleExportData = () => {
    alert(t('ilst.alert.exported'));
  };

  const handleImportData = () => {
    alert(t('ilst.alert.importInitiated'));
  };


  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('ilst.title')}</h1>
            <p className="text-gray-600">{t('ilst.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleImportData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 me-2" />
              {t('ilst.import')}
            </button>
            <button 
              onClick={handleExportData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 me-2" />
              {t('ilst.exportData')}
            </button>
            <button 
              onClick={() => setShowTypeSelectionModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 me-2" />
              {t('ilst.addInvestor')}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 me-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('ilst.stat.totalInvestors')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardData?.totalInvestors || '0'}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {t('ils.pctThisMonth', { value: `${dashboardData?.monthlyChangeInInvestors >= 0 ? '+' : ''}${dashboardData?.monthlyChangeInInvestors || 0}` })}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('ilst.stat.activeInvestors')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardData?.activeInvestors || '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('ils.pctOfTotal', { value: dashboardData?.activeInvestorPercentage || 0 })}
              </p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('ilst.stat.totalAum')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : `SAR ${dashboardData?.totalAum || 0}`}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {t('ils.pctThisQuarter', { value: `${dashboardData?.quaterlyChangeInAum >= 0 ? '+' : ''}${dashboardData?.quaterlyChangeInAum || 0}` })}
              </p>
            </div>
          
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('ilst.stat.pendingKyc')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardData?.pendingKyc || '0'}
              </p>
              <p className="text-xs text-yellow-600 mt-1">{t('ilst.stat.requiresReview')}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('individual')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'individual'
                  ? 'border-gray-700 text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('ils.tab.individual')}
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-gray-700 text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('ils.tab.business')}
          </button>
          </nav>
        </div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: 'var(--color-surface-mint)' }}>
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  {t('ilst.col.investor')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  {t('common:type')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  {activeTab === 'individual' ? t('ils.col.investorLevel') : t('ils.col.companyInfo')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  {activeTab === 'individual' ? t('ils.col.nationalId') : t('ils.col.crNumber')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  {activeTab === 'individual' ? t('ils.col.email') : t('ils.col.designation')}
                </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                {t('ils.col.address')}
              </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
              {t('ils.col.verificationStatus')}
            </th>

                <th className="px-6 py-3 text-start text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  {t('common:actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTab === 'individual' ? (
                kycLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {t('ils.loadingIndividual')}
                    </td>
                  </tr>
                ) : kycInvestors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {t('ils.noIndividual')}
                    </td>
                  </tr>
                ) : (
                  getCurrentInvestors().map((investor:any) => (
                <tr key={investor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center me-4">
                        <span className="text-sm font-medium text-gray-700">
                          {investor.firstNameInEnglish.charAt(0)}{investor.lastNameInEnglish.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {investor.firstNameInEnglish} {investor.lastNameInEnglish}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 me-1" />
                          {investor.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 me-1" />
                          {investor.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{t('ilst.type.individual')}</span>
                      <div className="mt-1">
                        {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          KYC Verified
                        </span> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                       {t('ils.levelLabel', { level: tLevel(investor.investorLevel) })}

                      </div>
                      <div className="text-sm text-gray-500">
                      {t('ils.employmentLabel', { status: tEmployment(investor.employmentStatus) })}

                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* <Shield className="w-4 h-4 text-gray-700 me-1" /> */}
                      <span className="text-sm font-medium text-black">
                        {investor.nationalId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {investor.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {investor.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      investor.verificationStatus === 0
                        ? "bg-orange-100 text-orange-800"
                        : investor.verificationStatus === 1
                        ? "bg-red-100 text-red-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {tVerification(investor.verificationStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2 space-x-2">
                      <button 
                        onClick={() => handleViewInvestor(investor)}
                        className="text-black hover:text-blue-900" 
                        title={t('ilst.action.viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleViewDocuments(investor)}
                        className="text-purple-600 hover:text-purple-900" 
                        title={t('ilst.action.viewDocuments')}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                  ))
                )
              ) : (
                kybLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {t('ils.loadingBusiness')}
                    </td>
                  </tr>
                ) : kybInvestors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {t('ils.noBusiness')}
                    </td>
                  </tr>
                ) : (
                  getCurrentInvestors().map((investor:any) => (
                    <tr key={investor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center me-4">
                            <span className="text-sm font-medium text-gray-700">
                              {investor.firstNameInEnglish.charAt(0)}{investor.lastNameInEnglish.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {investor.firstNameInEnglish} {investor.lastNameInEnglish}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 me-1" />
                              {investor.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 me-1" />
                              {investor.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="text-sm text-gray-900 font-medium">{t('ils.business')}</span>
                          <div className="mt-1">
                            {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              KYB Verified
                            </span> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {investor.companyName}
                          </div>
                     
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      
                         
                          <div className="text-sm text-gray-500">
                            {t('ils.crLabel', { value: investor.crNumber })}
                          </div>
                      
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* <Building className="w-4 h-4 text-purple-500 me-1" /> */}
                          <span className="text-sm font-medium text-purple-600">
                                                    {tDesigCell(investor.employeeDesignation)}

                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                     {investor.companyAddress}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          investor.verificationStatus === 0
                            ? "bg-orange-100 text-orange-800"
                            : investor.verificationStatus === 1
                            ? "bg-red-100 text-red-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {tVerification(investor.verificationStatus)}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-3 h-3 me-1" />
                          {new Date(investor.createdAt).toLocaleDateString()}
                        </div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2 space-x-2">
                          <button
                            onClick={() => handleViewInvestor(investor)}
                            className="text-black hover:text-blue-900"
                            title={t('ilst.action.viewDetails')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewDocuments(investor)}
                            className="text-purple-600 hover:text-purple-900"
                            title={t('ilst.action.viewDocuments')}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {activeTab === 'individual'
            ? t('ils.showingIndividual', { start: ((currentPage - 1) * itemsPerPage) + 1, end: Math.min(currentPage * itemsPerPage, kycInvestors.length), total: kycInvestors.length })
            : t('ils.showingBusiness', { start: ((currentPage - 1) * itemsPerPage) + 1, end: Math.min(currentPage * itemsPerPage, kybInvestors.length), total: kybInvestors.length })}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common:previous')}
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm font-medium border rounded-lg ${
                currentPage === page
                  ? 'text-white bg-black border-black'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={handleNextPage}
            disabled={currentPage === getTotalPages()}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common:next')}
          </button>
        </div>
      </div>

      {/* Type Selection Modal */}
      {showTypeSelectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('ils.selectType')}</h3>
              <button
                onClick={() => setShowTypeSelectionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 mb-4">{t('ils.chooseType')}</p>
              
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('https://devapi.awn-sa.com/portfolio/api/v1/Investor/Create', {
                        method: 'POST',
                        headers: {
                          'accept': '*/*',
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          investorType: 0,
                          isNational: true
                        })
                      });
                      
                      const result = await response.json();
                      
                      if (result.success) {
                        
                        setCreatedInvestorId(result.data?.id || '');
                        setSelectedInvestorType('individual');
                        setShowTypeSelectionModal(false);
                        setShowCreateModal(true);
                        
                        // Fetch countries for dropdown
                        try {
                          const countriesResult = await getAllCountries(1, 100);
                          if (countriesResult.success) {
                            setCountries(countriesResult.data);
                            toast.success(t('ils.toast.countriesLoaded'));
                          }
                        } catch (err) {
                          console.error('Error fetching countries:', err);
                          toast.error(t('ils.toast.countriesError'));
                        }
                        
                        // Reset form data but keep the investor ID
                        setFormData({
                          investorId: '',
                          firstNameInEnglish: '',
                          lastNameInEnglish: '',
                          firstNameInArabic: '',
                          lastNameInArabic: '',
                          nationalId: '',
                          IssuanceCountryId: '',
                          dateOfBirth: '',
                          phone: '',
                          email: '',
                          address: '',
                          lastLogin: new Date().toISOString(),
                          investorLevel: 0,
                          password: '',
                          twoFactorEnabled: false,
                          countryId: '',
                          employmentStatus: 0,
                          employeeDesignation: 0,
                          companyName: '',
                          companyEmail: '',
                          companyAddress: '',
                          companyWebsite: '',
                          crNumber: '',
                          incorporationDate: '',
                          expiryDate: '',
                          paidUpCapital: '',
                          shareValue: '',
                          isLegalEntityIdentifier: false,
                          lei: 0,
                          addressLine2: '',
                          city: '',
                          state: '',
                          shareholders: []
                        });
                      } else {
                        console.error('Failed to create investor:', result.notificationMessage);
                        toast.error(result.notificationMessage || t('ils.toast.createFailed'));
                      }
                    } catch (error) {
                      console.error('Error creating investor:', error);
                    }
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-700 hover:bg-gray-50 transition-colors text-start"
                >
                  <div className="flex items-center">
                    <User className="w-8 h-8 text-gray-700 me-4" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{t('ilst.type.individual')}</h4>
                      <p className="text-sm text-gray-600">{t('ils.individualDesc')}</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('https://devapi.awn-sa.com/portfolio/api/v1/Investor/Create', {
                        method: 'POST',
                        headers: {
                          'accept': '*/*',
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          investorType: 1
                        })
                      });
                      
                      const result = await response.json();
                      
                      if (result.success) {
                    
                        setCreatedInvestorId(result.data?.id || '');
                        setSelectedInvestorType('business');
                        setShowTypeSelectionModal(false);
                        setShowCreateModal(true);
                        
                        // Fetch countries for dropdown
                        try {
                          const countriesResult = await getAllCountries(1, 100);
                          if (countriesResult.success) {
                            setCountries(countriesResult.data);
                            toast.success(t('ils.toast.countriesLoaded'));
                          }
                        } catch (err) {
                          console.error('Error fetching countries:', err);
                          toast.error(t('ils.toast.countriesError'));
                        }
                        
                        // Reset form data but keep the investor ID
                        setFormData({
                          investorId: '',
                          firstNameInEnglish: '',
                          lastNameInEnglish: '',
                          firstNameInArabic: '',
                          lastNameInArabic: '',
                          nationalId: '',
                          IssuanceCountryId: '',
                          dateOfBirth: '',
                          phone: '',
                          email: '',
                          address: '',
                          lastLogin: new Date().toISOString(),
                          investorLevel: 0,
                          password: '',
                          twoFactorEnabled: false,
                          countryId: '',
                          employmentStatus: 0,
                          employeeDesignation: 0,
                          companyName: '',
                          companyEmail: '',
                          companyAddress: '',
                          companyWebsite: '',
                          crNumber: '',
                          incorporationDate: '',
                          expiryDate: '',
                          paidUpCapital: '',
                          shareValue: '',
                          isLegalEntityIdentifier: false,
                          lei: 0,
                          addressLine2: '',
                          city: '',
                          state: '',
                          shareholders: []
                        });
                      } else {
                        console.error('Failed to create investor:', result.notificationMessage);
                        toast.error(result.notificationMessage || t('ils.toast.createFailed'));
                      }
                    } catch (error) {
                      console.error('Error creating investor:', error);
                    }
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-700 hover:bg-gray-50 transition-colors text-start"
                >
                  <div className="flex items-center">
                    <Building className="w-8 h-8 text-red-500 me-4" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{t('ils.business')}</h4>
                      <p className="text-sm text-gray-600">{t('ils.businessDesc')}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTypeSelectionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Investor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {t('ils.createTitle', { type: selectedInvestorType === 'individual' ? t('ilst.type.individual') : t('ils.business') })}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowSendLink(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.firstNameEn')}</label>
                  <input
                    type="text"
                    placeholder={t('ils.ph.firstNameEn')}
                    value={formData.firstNameInEnglish}
                    onChange={(e) => setFormData({ ...formData, firstNameInEnglish: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.lastNameEn')}</label>
                  <input
                    type="text"
                    placeholder={t('ils.ph.lastNameEn')}
                    value={formData.lastNameInEnglish}
                    onChange={(e) => setFormData({ ...formData, lastNameInEnglish: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.firstNameAr')}</label>
                  <input
                    type="text"
                    placeholder={t('ils.ph.firstNameAr')}
                    value={formData.firstNameInArabic}
                    onChange={(e) => setFormData({ ...formData, firstNameInArabic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.lastNameAr')}</label>
                  <input
                    type="text"
                    placeholder={t('ils.ph.lastNameAr')}
                    value={formData.lastNameInArabic}
                    onChange={(e) => setFormData({ ...formData, lastNameInArabic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.idPassport')}</label>
                  <input
                    type="text"
                    placeholder={t('ils.ph.idPassport')}
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.issuingAuthority')}</label>
                  <select
                    value={formData.IssuanceCountryId}
                    onChange={(e) => setFormData({ ...formData, IssuanceCountryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="">{t('ils.selectIssuingAuthority')}</option>
                    {countries.map((country: any) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.dateOfBirth')}</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.address')}</label>
                <input
                  type="text"
                  placeholder={t('ils.ph.address')}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.phone')}</label>
                  <input
                    type="tel"
                    placeholder={t('ils.ph.phone')}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.email')}</label>
                  <input
                    type="email"
                    placeholder={t('ils.ph.email')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.country')}</label>
                  <select
                    value={formData.countryId}
                    onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                    disabled={countriesLoading}
                  >
                    <option value="">{t('ils.selectCountry')}</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name} 
                      </option>
                    ))}
                  </select>
                  {countriesLoading && (
                    <p className="text-sm text-gray-500 mt-1">{t('ils.loadingCountries')}</p>
                  )}
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investor Level</label>
                  <select 
                    value={formData.investorLevel}
                    onChange={(e) => setFormData({ ...formData, investorLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  >
                    <option value="0">Level 0</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                  </select>
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.employmentStatus')}</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  >
                    <option value="0">{t('ils.emp.employed')}</option>
                    <option value="1">{t('ils.emp.selfEmployed')}</option>
                    <option value="2">{t('ils.emp.businessOwner')}</option>
                    <option value="3">{t('ils.emp.retired')}</option>
     
                  </select>
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  required
                  />
                </div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              </div>
{/* 
              <div className="space-y-3">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={formData.twoFactorEnabled}
                    onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-black focus:ring-gray-500 me-3" 
                  />
                  <span className="text-sm text-gray-700">Two Factor Authentication Enabled</span>
                </label>
              </div> */}

              {/* Business-specific fields */}
              {selectedInvestorType === 'business' && (
                <>
                  <div className="border-t pt-6 mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('ils.businessInfo')}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.employeeDesignation')}</label>
                        <select
                          value={formData.employeeDesignation}
                          onChange={(e) => setFormData({ ...formData, employeeDesignation: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        >
                          <option value="0">{t('ils.desig.ceo')}</option>
                          <option value="1">{t('ils.desig.director')}</option>
                          <option value="2">{t('ils.desig.manager')}</option>
                          <option value="3">{t('ils.desig.employee')}</option>
                          <option value="4">{t('ils.desig.other')}</option>
                  </select>
                </div>
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.companyName')}</label>
                  <input
                    type="text"
                          placeholder={t('ils.ph.companyName')}
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                          required
                  />
                </div>
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.companyEmail')}</label>
                <input
                          type="email"
                          placeholder={t('ils.ph.companyEmail')}
                          value={formData.companyEmail}
                          onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.companyWebsite')}</label>
                        <input
                          type="url"
                          placeholder={t('ils.ph.companyWebsite')}
                          value={formData.companyWebsite}
                          onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
              </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.companyAddress')}</label>
                      <input
                        type="text"
                        placeholder={t('ils.ph.companyAddress')}
                        value={formData.companyAddress}
                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div className='mt-4'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.city')}</label>
                        <input
                          type="text"
                          placeholder={t('ils.ph.city')}
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.crNumber')}</label>
                        <input
                          type="text"
                          placeholder={t('ils.ph.crNumber')}
                          value={formData.crNumber}
                          onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.incorporationDate')}</label>
                        <input
                          type="date"
                          value={formData.incorporationDate}
                          onChange={(e) => setFormData({ ...formData, incorporationDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.expiryDate')}</label>
                        <input
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.paidUpCapital')}</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={t('ils.ph.paidUpCapital')}
                          value={formData.paidUpCapital}
                          onChange={(e) => setFormData({ ...formData, paidUpCapital: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.shareValue')}</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={t('ils.ph.shareValue')}
                          value={formData.shareValue}
                          onChange={(e) => setFormData({ ...formData, shareValue: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.state')}</label>
                        <input
                          type="text"
                          placeholder={t('ils.ph.state')}
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className=''>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.addressLine2')}</label>
                        <input
                          type="text"
                          placeholder={t('ils.ph.addressLine2')}
                          value={formData.addressLine2}
                          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
         
                      <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.country')}</label>
                      <select
                        value={formData.countryId}
                        onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        required
                        disabled={countriesLoading}
                      >
                        <option value="">{t('ils.selectCountry')}</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name} ({country.code})
                          </option>
                        ))}
                      </select>
                      {countriesLoading && (
                        <p className="text-sm text-gray-500 mt-1">{t('ils.loadingCountries')}</p>
                      )}
                    </div>
                    </div>

                    {/* Shareholders Section */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{t('ils.shareholders')}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              shareholders: [
                                ...formData.shareholders,
                                {
                                  fullName: '',
                                  idPassportNumber: '',
                                  sharesPercentage: '',
                                  nationality: '',
                                  isPEP: false,
                                  isDirector: false,
                                  isManager: false
                                }
                              ]
                            });
                          }}
                          className="flex items-center px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
                        >
                          <PlusIcon className="w-4 h-4 me-2" />
                          {t('ils.addShareholder')}
                        </button>
                      </div>

                      {formData.shareholders.map((shareholder, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-md font-medium text-gray-700">{t('ils.shareholderN', { n: index + 1 })}</h5>
                            <button
                              type="button"
                              onClick={() => {
                                const newShareholders = formData.shareholders.filter((_, i) => i !== index);
                                setFormData({ ...formData, shareholders: newShareholders });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.shareholderFullName')}</label>
                              <input
                                type="text"
                                placeholder={t('ils.ph.fullName')}
                                value={shareholder.fullName}
                                onChange={(e) => {
                                  const newShareholders = [...formData.shareholders];
                                  newShareholders[index].fullName = e.target.value;
                                  setFormData({ ...formData, shareholders: newShareholders });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.idPassport')}</label>
                              <input
                                type="text"
                                placeholder={t('ils.ph.idPassport')}
                                value={shareholder.idPassportNumber}
                                onChange={(e) => {
                                  const newShareholders = [...formData.shareholders];
                                  newShareholders[index].idPassportNumber = e.target.value;
                                  setFormData({ ...formData, shareholders: newShareholders });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.sharesPercentage')}</label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder={t('ils.ph.sharesPercentage')}
                                value={shareholder.sharesPercentage}
                                onChange={(e) => {
                                  const newShareholders = [...formData.shareholders];
                                  newShareholders[index].sharesPercentage = e.target.value;
                                  setFormData({ ...formData, shareholders: newShareholders });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('ils.field.nationality')}</label>
                              <select
                                value={shareholder.nationality}
                                onChange={(e) => {
                                  const newShareholders = [...formData.shareholders];
                                  newShareholders[index].nationality = e.target.value;
                                  setFormData({ ...formData, shareholders: newShareholders });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                required
                              >
                                <option value="">{t('ils.selectNationality')}</option>
                                {countries.map((country: any) => (
                                  <option key={country.id} value={country.id}>
                                    {country.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center space-x-6">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={shareholder.isPEP}
                                  onChange={(e) => {
                                    const newShareholders = [...formData.shareholders];
                                    newShareholders[index].isPEP = e.target.checked;
                                    setFormData({ ...formData, shareholders: newShareholders });
                                  }}
                                  className="rounded border-gray-300 text-black focus:ring-2 focus:ring-[#C81D25] focus:ring-offset-0 me-2 accent-[#C81D25]"
                                  style={{ accentColor: '#C81D25' }}
                                />
                                <span className="text-sm text-gray-700">{t('ils.isPep')}</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={shareholder.isDirector}
                                  onChange={(e) => {
                                    const newShareholders = [...formData.shareholders];
                                    newShareholders[index].isDirector = e.target.checked;
                                    setFormData({ ...formData, shareholders: newShareholders });
                                  }}
                                  className="rounded border-gray-300 text-black focus:ring-2 focus:ring-[#C81D25] focus:ring-offset-0 me-2 accent-[#C81D25]"
                                  style={{ accentColor: '#C81D25' }}
                                />
                                <span className="text-sm text-gray-700">{t('ils.isDirector')}</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={shareholder.isManager}
                                  onChange={(e) => {
                                    const newShareholders = [...formData.shareholders];
                                    newShareholders[index].isManager = e.target.checked;
                                    setFormData({ ...formData, shareholders: newShareholders });
                                  }}
                                  className="rounded border-gray-300 text-black focus:ring-2 focus:ring-[#C81D25] focus:ring-offset-0 me-2 accent-[#C81D25]"
                                  style={{ accentColor: '#C81D25' }}
                                />
                                <span className="text-sm text-gray-700">{t('ils.isManager')}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}

                      {formData.shareholders.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">{t('ils.noShareholders')}</p>
                      )}
                    </div>

         

              
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowSendLink(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common:cancel')}
                </button>
                <button
                  type={showSendLink ? "button" : "submit"}
                  onClick={showSendLink ? handleSendLink : undefined}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2"></div>
                      {t('ils.creating')}
                    </div>
                  ) : showSendLink ? (
                    t('ils.sendLink')
                  ) : (
                    t('ils.createInvestor')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Investor Modal */}
      {showViewModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('ilst.viewTitle')}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.name')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.email')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.phone')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:type')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:status')}</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvestor.status)}`}>
                    {selectedInvestor.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.kycStatus')}</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKycStatusColor(selectedInvestor.kycStatus)}`}>
                    {selectedInvestor.kycStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.riskProfile')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.riskProfile}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.totalInvestment')}</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvestor.totalInvestment)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.portfolioValue')}</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvestor.portfolioValue)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.unrealizedGains')}</label>
                  <p className="text-sm text-red-600">{formatCurrency(selectedInvestor.unrealizedGains)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.onboardingDate')}</label>
                  <p className="text-sm text-gray-900">{new Date(selectedInvestor.onboardingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.lastActivity')}</label>
                  <p className="text-sm text-gray-900">{new Date(selectedInvestor.lastActivity).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.country')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.accredited')}</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.accreditedInvestor ? t('common:yes') : t('common:no')}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.tags')}</label>
                <div className="flex flex-wrap gap-1">
                  {selectedInvestor?.tags?.map((tag: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.label.portfolioAllocation')}</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedInvestor?.portfolioAllocation?.equity}%</div>
                    <div className="text-sm text-gray-500">{t('ilst.label.equity')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedInvestor?.portfolioAllocation?.bonds}%</div>
                    <div className="text-sm text-gray-500">{t('ilst.label.bonds')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedInvestor?.portfolioAllocation?.alternatives}%</div>
                    <div className="text-sm text-gray-500">{t('ilst.label.alternatives')}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ilst.field.notes')}</label>
                <p className="text-sm text-gray-900">{selectedInvestor?.notes}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:close')}
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditInvestor(selectedInvestor);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                {t('ilst.action.editInvestor')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('ilst.deleteTitle')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {t('ilst.deletePrefix')}<strong>{selectedInvestor.name}</strong>{t('ilst.deleteSuffix')}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={confirmDeleteInvestor}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
              >
                {t('ilst.action.deleteInvestor')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
