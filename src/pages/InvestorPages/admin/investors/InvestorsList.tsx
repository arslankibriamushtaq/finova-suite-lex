import { useState, useEffect } from 'react';
import { Plus as PlusIcon, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
        toast.success('Link sent successfully to investor!');
        // Close modal and reset form on success
        setShowCreateModal(false);
        resetFormData();
        setShowSendLink(false);
        // Refresh the dashboard data
        window.location.reload();
      } else {
        toast.error(result.notificationMessage || 'Failed to send link. Please try again.');
      }
    } catch (error) {
    
      toast.error('Error sending link. Please try again.');
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
        setError('Failed to load investor dashboard data. Please try again.');
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
          toast.error('Failed to load countries');
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
        toast.error('Error loading countries');
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
        toast.success(result.notificationMessage || 'Individual investors loaded successfully!');
      } else {
        console.error('Failed to fetch KYC investors:', result.notificationMessage);
        toast.error('Failed to load individual investors');
      }
    } catch (err) {
      console.error('Error fetching KYC investors:', err);
      toast.error('Error loading individual investors');
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
        toast.success('Business investors loaded successfully!');
      } else {
        console.error('Failed to fetch KYB investors:', result.notificationMessage);
        toast.error('Failed to load business investors');
      }
    } catch (err) {
      console.error('Error fetching KYB investors:', err);
      toast.error('Error loading business investors');
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
      case 'Active': return 'bg-green-100 text-green-800';
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
                toast.error('KYB ID not found. Cannot create shareholders.');
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
                toast.success(result.notificationMessage || 'Business investor and shareholders created successfully!');
              } else {
                toast.error('Business investor created but failed to create shareholders: ' + (shareResult.notificationMessage || 'Unknown error'));
              }
            } catch (shareError) {
              console.error('Error creating business shares:', shareError);
              toast.error('Business investor created but failed to create shareholders');
            }
          } else {
            // Individual investor or business without shareholders
            const successMessage = selectedInvestorType === 'business' 
              ? 'Business investor created successfully!'
              : 'Individual investor created successfully!';
            toast.success(result.notificationMessage || successMessage);
          }
          
          setShowSendLink(true);
          // Don't close modal yet, show send link button
        } else {
          const errorMessage = selectedInvestorType === 'business'
            ? 'Failed to create business investor'
            : 'Failed to create individual investor';
          console.error('Failed to create investor:', result.notificationMessage);
          toast.error(result.notificationMessage || errorMessage);
        }
    } catch (error) {
      const errorMessage = selectedInvestorType === 'business'
        ? 'Error creating business investor'
        : 'Error creating individual investor';
      console.error('Error creating investor:', error);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
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
      toast.error('Investor ID not found');
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
    alert(`Investor ${selectedInvestor?.name} deleted successfully!`);
    setShowDeleteModal(false);
    setSelectedInvestor(null);
  };



  const handleExportData = () => {
    alert('Investor data exported successfully!');
  };

  const handleImportData = () => {
    alert('Import data functionality initiated');
  };


  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investors</h1>
            <p className="text-gray-600">Manage and oversee all investor accounts</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleImportData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
            <button 
              onClick={handleExportData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
            <button 
              onClick={() => setShowTypeSelectionModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Investor
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Investors</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardData?.totalInvestors || '0'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {dashboardData?.monthlyChangeInInvestors >= 0 ? '+' : ''}{dashboardData?.monthlyChangeInInvestors || 0}% this month
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Investors</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardData?.activeInvestors || '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardData?.activeInvestorPercentage || 0}% of total
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total AUM</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : `SAR ${dashboardData?.totalAum || 0}`}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {dashboardData?.quaterlyChangeInAum >= 0 ? '+' : ''}{dashboardData?.quaterlyChangeInAum || 0}% this quarter
              </p>
            </div>
          
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending KYC</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardData?.pendingKyc || '0'}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Requires review</p>
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
              Individual Investors
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-gray-700 text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business Investors
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  Investor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  {activeTab === 'individual' ? 'Investor Level' : 'Company Info'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  {activeTab === 'individual' ? 'National ID' : 'CR Number'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  {activeTab === 'individual' ? 'Email' : 'Designation'}
                </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                Address
              </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
              Verification Status
            </th>
              
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider" style={{ backgroundColor: 'var(--color-surface-mint)', color: 'var(--theme-heading-text-color)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTab === 'individual' ? (
                kycLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Loading individual investors...
                    </td>
                  </tr>
                ) : kycInvestors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No individual investors found
                    </td>
                  </tr>
                ) : (
                  getCurrentInvestors().map((investor:any) => (
                <tr key={investor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                        <span className="text-sm font-medium text-gray-700">
                          {investor.firstNameInEnglish.charAt(0)}{investor.lastNameInEnglish.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {investor.firstNameInEnglish} {investor.lastNameInEnglish}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {investor.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {investor.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm text-gray-900 font-medium">Individual</span>
                      <div className="mt-1">
                        {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          KYC Verified
                        </span> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                       Level: {
                              investor.investorLevel === 0
                                ? 'Beginner'
                                : investor.investorLevel === 1
                                ? 'Intermediate'
                                : investor.investorLevel === 2
                                ? 'Advanced'
                                : investor.investorLevel === 3
                                ? 'Premium'
                                : 'Unknown'
                            }

                      </div>
                      <div className="text-sm text-gray-500">
                      Employment: {
                            investor.employmentStatus === 0
                          ? 'Employed'
                          : investor.employmentStatus === 1
                          ? 'Self-Employed'
                          : investor.employmentStatus === 2
                          ? 'Business Owner'
                          : investor.employmentStatus === 3
                          ? 'Retired'
                          : 'Unknown'
                      }

                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* <Shield className="w-4 h-4 text-gray-700 mr-1" /> */}
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
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {investor.verificationStatus === 0
                          ? "Pending"
                          : investor.verificationStatus === 1
                          ? "Verified"
                          : "Rejected"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2 space-x-2">
                      <button 
                        onClick={() => handleViewInvestor(investor)}
                        className="text-black hover:text-blue-900" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleViewDocuments(investor)}
                        className="text-purple-600 hover:text-purple-900" 
                        title="View Documents"
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
                      Loading business investors...
                    </td>
                  </tr>
                ) : kybInvestors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No business investors found
                    </td>
                  </tr>
                ) : (
                  getCurrentInvestors().map((investor:any) => (
                    <tr key={investor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                            <span className="text-sm font-medium text-gray-700">
                              {investor.firstNameInEnglish.charAt(0)}{investor.lastNameInEnglish.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {investor.firstNameInEnglish} {investor.lastNameInEnglish}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {investor.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {investor.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="text-sm text-gray-900 font-medium">Business</span>
                          <div className="mt-1">
                            {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                            CR: {investor.crNumber}
                          </div>
                      
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* <Building className="w-4 h-4 text-purple-500 mr-1" /> */}
                          <span className="text-sm font-medium text-purple-600">
                                                    {
                            investor.employeeDesignation === 0 ? 'CEO' :
                            investor.employeeDesignation === 1 ? 'CFO' :
                            investor.employeeDesignation === 2 ? 'Director' :
                            investor.employeeDesignation === 3 ? 'Manager' :
                       
                            'Unknown'
                          }

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
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {investor.verificationStatus === 0
                        ? "Pending"
                        : investor.verificationStatus === 1
                        ? "Verified"
                        : "Rejected"}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(investor.createdAt).toLocaleDateString()}
                        </div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2 space-x-2">
                          <button
                            onClick={() => handleViewInvestor(investor)}
                            className="text-black hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewDocuments(investor)}
                            className="text-purple-600 hover:text-purple-900"
                            title="View Documents"
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
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, activeTab === 'individual' ? kycInvestors.length : kybInvestors.length)} of {activeTab === 'individual' ? kycInvestors.length : kybInvestors.length} {activeTab === 'individual' ? 'individual' : 'business'} investors
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
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
            Next
          </button>
        </div>
      </div>

      {/* Type Selection Modal */}
      {showTypeSelectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Select Investor Type</h3>
              <button
                onClick={() => setShowTypeSelectionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Choose the type of investor you want to add:</p>
              
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
                            toast.success('Countries loaded successfully!');
                          }
                        } catch (err) {
                          console.error('Error fetching countries:', err);
                          toast.error('Error loading countries');
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
                        toast.error(result.notificationMessage || 'Failed to create investor');
                      }
                    } catch (error) {
                      console.error('Error creating investor:', error);
                    }
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <User className="w-8 h-8 text-gray-700 mr-4" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Individual</h4>
                      <p className="text-sm text-gray-600">Personal investor account</p>
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
                            toast.success('Countries loaded successfully!');
                          }
                        } catch (err) {
                          console.error('Error fetching countries:', err);
                          toast.error('Error loading countries');
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
                        toast.error(result.notificationMessage || 'Failed to create investor');
                      }
                    } catch (error) {
                      console.error('Error creating investor:', error);
                    }
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <Building className="w-8 h-8 text-green-500 mr-4" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Business</h4>
                      <p className="text-sm text-gray-600">Corporate or business entity</p>
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
                Cancel
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
                Add New {selectedInvestorType === 'individual' ? 'Individual' : 'Business'} Investor
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name (English) *</label>
                  <input
                    type="text"
                    placeholder="Enter first name in English"
                    value={formData.firstNameInEnglish}
                    onChange={(e) => setFormData({ ...formData, firstNameInEnglish: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name (English) *</label>
                  <input
                    type="text"
                    placeholder="Enter last name in English"
                    value={formData.lastNameInEnglish}
                    onChange={(e) => setFormData({ ...formData, lastNameInEnglish: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name (Arabic)</label>
                  <input
                    type="text"
                    placeholder="Enter first name in Arabic"
                    value={formData.firstNameInArabic}
                    onChange={(e) => setFormData({ ...formData, firstNameInArabic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name (Arabic)</label>
                  <input
                    type="text"
                    placeholder="Enter last name in Arabic"
                    value={formData.lastNameInArabic}
                    onChange={(e) => setFormData({ ...formData, lastNameInArabic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID / Passport Number *</label>
                  <input
                    type="text"
                    placeholder="Enter ID or Passport Number"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Authority *</label>
                  <select
                    value={formData.IssuanceCountryId}
                    onChange={(e) => setFormData({ ...formData, IssuanceCountryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="">Select Issuing Authority</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <select
                    value={formData.countryId}
                    onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                    required
                    disabled={countriesLoading}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name} 
                      </option>
                    ))}
                  </select>
                  {countriesLoading && (
                    <p className="text-sm text-gray-500 mt-1">Loading countries...</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                  <select 
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  >
                    <option value="0">Employed</option>
                    <option value="1">Self-Employed</option>
                    <option value="2">BusinessOwner</option>
                    <option value="3">Retired</option>
     
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
                    className="rounded border-gray-300 text-black focus:ring-gray-500 mr-3" 
                  />
                  <span className="text-sm text-gray-700">Two Factor Authentication Enabled</span>
                </label>
              </div> */}

              {/* Business-specific fields */}
              {selectedInvestorType === 'business' && (
                <>
                  <div className="border-t pt-6 mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Designation</label>
                        <select 
                          value={formData.employeeDesignation}
                          onChange={(e) => setFormData({ ...formData, employeeDesignation: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        >
                          <option value="0">CEO</option>
                          <option value="1">Director</option>
                          <option value="2">Manager</option>
                          <option value="3">Employee</option>
                          <option value="4">Other</option>
                  </select>
                </div>
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                          placeholder="Enter company name"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                          required
                  />
                </div>
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Email *</label>
                <input
                          type="email"
                          placeholder="Enter company email"
                          value={formData.companyEmail}
                          onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                        <input
                          type="url"
                          placeholder="Enter company website"
                          value={formData.companyWebsite}
                          onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
              </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Address *</label>
                      <input
                        type="text"
                        placeholder="Enter company address"
                        value={formData.companyAddress}
                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div className='mt-4'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          placeholder="Enter city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CR Number *</label>
                        <input
                          type="text"
                          placeholder="Enter CR number"
                          value={formData.crNumber}
                          onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Incorporation Date *</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Paid-Up Capital</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Enter paid-up capital"
                          value={formData.paidUpCapital}
                          onChange={(e) => setFormData({ ...formData, paidUpCapital: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Share Value</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Enter share value"
                          value={formData.shareValue}
                          onChange={(e) => setFormData({ ...formData, shareValue: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          placeholder="Enter state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className=''>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                        <input
                          type="text"
                          placeholder="Enter address line 2"
                          value={formData.addressLine2}
                          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        />
                      </div>
         
                      <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                      <select
                        value={formData.countryId}
                        onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                        required
                        disabled={countriesLoading}
                      >
                        <option value="">Select a country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name} ({country.code})
                          </option>
                        ))}
                      </select>
                      {countriesLoading && (
                        <p className="text-sm text-gray-500 mt-1">Loading countries...</p>
                      )}
                    </div>
                    </div>

                    {/* Shareholders Section */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Shareholders</h4>
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
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Add Shareholder
                        </button>
                      </div>

                      {formData.shareholders.map((shareholder, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-md font-medium text-gray-700">Shareholder {index + 1}</h5>
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name of Shareholder *</label>
                              <input
                                type="text"
                                placeholder="Enter full name"
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">ID / Passport Number *</label>
                              <input
                                type="text"
                                placeholder="Enter ID or Passport Number"
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">Shares Percentage *</label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Enter shares percentage"
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
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
                                <option value="">Select Nationality</option>
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
                                  className="rounded border-gray-300 text-black focus:ring-2 focus:ring-[#10B981] focus:ring-offset-0 mr-2 accent-[#10B981]"
                                  style={{ accentColor: '#10B981' }}
                                />
                                <span className="text-sm text-gray-700">Is PEP?</span>
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
                                  className="rounded border-gray-300 text-black focus:ring-2 focus:ring-[#10B981] focus:ring-offset-0 mr-2 accent-[#10B981]"
                                  style={{ accentColor: '#10B981' }}
                                />
                                <span className="text-sm text-gray-700">Is Director?</span>
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
                                  className="rounded border-gray-300 text-black focus:ring-2 focus:ring-[#10B981] focus:ring-offset-0 mr-2 accent-[#10B981]"
                                  style={{ accentColor: '#10B981' }}
                                />
                                <span className="text-sm text-gray-700">Is Manager?</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}

                      {formData.shareholders.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No shareholders added. Click "Add Shareholder" to add one.</p>
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
                  Cancel
                </button>
                <button
                  type={showSendLink ? "button" : "submit"}
                  onClick={showSendLink ? handleSendLink : undefined}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : showSendLink ? (
                    'Send Link'
                  ) : (
                    'Create Investor'
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
              <h3 className="text-xl font-semibold text-gray-900">Investor Details</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvestor.status)}`}>
                    {selectedInvestor.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKycStatusColor(selectedInvestor.kycStatus)}`}>
                    {selectedInvestor.kycStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Profile</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.riskProfile}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Investment</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvestor.totalInvestment)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Value</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvestor.portfolioValue)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unrealized Gains</label>
                  <p className="text-sm text-green-600">{formatCurrency(selectedInvestor.unrealizedGains)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedInvestor.onboardingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Activity</label>
                  <p className="text-sm text-gray-900">{new Date(selectedInvestor.lastActivity).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accredited Investor</label>
                  <p className="text-sm text-gray-900">{selectedInvestor.accreditedInvestor ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {selectedInvestor?.tags?.map((tag: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Allocation</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedInvestor?.portfolioAllocation?.equity}%</div>
                    <div className="text-sm text-gray-500">Equity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedInvestor?.portfolioAllocation?.bonds}%</div>
                    <div className="text-sm text-gray-500">Bonds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedInvestor?.portfolioAllocation?.alternatives}%</div>
                    <div className="text-sm text-gray-500">Alternatives</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-sm text-gray-900">{selectedInvestor?.notes}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditInvestor(selectedInvestor);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                Edit Investor
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Investor</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>{selectedInvestor.name}</strong>? This action cannot be undone and will remove all associated data.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteInvestor}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Investor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
