import { useState, useEffect, useRef } from "react"
import { useRouter } from "../../lib/router"
import { useSearchParams } from "../../lib/router"
import { ArrowLeft, ArrowRight, HelpCircle, Upload } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "antd"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useLanguage } from "../../hooks/use-language"
import { getCountries } from "../../redux/apis/apisCrud"
import { getAllProductTypes, getProductById } from "../../redux/apis/apisCrudProductManagement"
import toast from "react-hot-toast"
import axios from "axios"
import { store } from "../../redux/store";
import Loader from "../Loader/Loader"
import ProductCreateEditTabs from "./ProductCreateEditTabs"

interface ProductFormData {
  name: string
  name_ar: string
  notification_email: string
  country: string
  master_category: string
  sub_categories: string[]
  customer_types: string[]
  status: "draft" | "active"
  logo_url: string
  short_desc_en: string
  short_desc_ar: string
  has_commodity: boolean
  category_id: string
  product_type_id: string
}

const subCategoriesMap: Record<string, string[]> = {
  Murabaha: ["Home Financing", "Vehicle Financing", "Inventory Financing", "Equipment Financing", "Property Leasing"],
  Ijarah: ["Vehicle Leasing", "Equipment Leasing"],
  "Personal Financing": ["Personal Loans", "Education Financing", "Medical Financing", "Home Improvement"],
  "Business Financing": ["Working Capital", "Equipment Purchase", "Business Expansion", "Trade Finance"],
  "Trade Financing": ["Import Financing", "Export Financing", "Letter of Credit", "Documentary Collections"],
  Tawarruq: [
    "Investment Financing",
    "Cash Management",
    "Microfinance",
    "Quick Cash",
    "Invoice Advancing",
    "Invoice Discounting",
    "Reverse Factoring",
  ],
  BNPL: ["E-commerce", "Retail", "Healthcare", "Education"],
  "Crowd Funding": ["Real Estate", "Business Ventures", "Technology Startups", "Social Impact"],
}

const LOCAL_STORAGE_KEY = "productBasicInfoFormData"


export default function CreateBasicInfo() {
  const { isRTL } = useLanguage()
  const router = useRouter()
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get("template")
  const productId = searchParams.get("id") // Get product ID from URL for edit mode
  const savedProductId = sessionStorage.getItem("productId") // Check sessionStorage for productId (from create API)
  // Use URL productId if available, otherwise use sessionStorage productId (user coming back from next step)
  const effectiveProductId = productId || savedProductId
  const isEditMode = !!effectiveProductId

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    name_ar: "",
    notification_email: "",
    country: "",
    master_category: "",
    sub_categories: [],
    customer_types: [],
    status: "draft",
    logo_url: "",
    short_desc_en: "",
    short_desc_ar: "",
    has_commodity: false,
    category_id: "",
    product_type_id: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [countries, setCountries] = useState<any>([])
  const [productTypes, setProductTypes] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProductData, setIsLoadingProductData] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null) // Store the file for API upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInitialLoadRef = useRef(true) // Track if we're in initial load phase
  const isNavigatingToNextStepRef = useRef(false) // Track if we're navigating to next step
  const token = (store.getState() as any).block.token;
  
  useEffect(()=>{
    getCountryList()
    getProductTypesList()
    loadCategoryFromSession()
    
    // Check if we have a productId (from URL or sessionStorage)
    if (effectiveProductId) {
      // Persist to sessionStorage immediately so all tabs have it (edit mode: from URL; create flow: from prior step)
      sessionStorage.setItem("productId", effectiveProductId)
      // Load product data from API (edit mode)
      loadProductData(effectiveProductId).finally(() => {
        // Mark initial load as complete after data is loaded (or failed)
        setTimeout(() => {
          isInitialLoadRef.current = false
        }, 500)
      })
    } else {
      // No productId in URL AND no productId in sessionStorage - this is a fresh start
      // Clear all storage to ensure fresh start
      clearAllProductData()
      // Reset form to initial state
      setFormData({
        name: "",
        name_ar: "",
        notification_email: "",
        country: "",
        master_category: "",
        sub_categories: [],
        customer_types: [],
        status: "draft",
        logo_url: "",
        short_desc_en: "",
        short_desc_ar: "",
        has_commodity: false,
        category_id: "",
        product_type_id: "",
      })
      // Mark initial load as complete
      setTimeout(() => {
        isInitialLoadRef.current = false
      }, 500)
    }
  },[])

  // Load product data after countries are loaded (for edit mode)
  useEffect(() => {
    if (isEditMode && effectiveProductId && productId) {
      // Only reload if productId from URL changes (not from sessionStorage)
      loadProductData(effectiveProductId)
    }
  }, [productId])

  // Auto-save form data to localStorage whenever it changes (after initial load)
  useEffect(() => {
    // Only save if initial load is complete, not loading product data, and form has some data
    if (!isInitialLoadRef.current && !isLoadingProductData && (formData.name || formData.name_ar || formData.notification_email)) {
      saveFormDataToLocalStorage()
    }
  }, [formData, isLoadingProductData])

  // Handle cancel/back navigation - clear storage
  const handleCancel = () => {
    clearAllProductData()
    router.push("/Los/ProductManagement")
  }

  const handleBackToProducts = () => {
    clearAllProductData()
    router.push("/Los/ProductManagement")
  }

  // Cleanup: Clear storage when component unmounts or user navigates away
  useEffect(() => {
    // Handle beforeunload (user closes tab/window)
    const handleBeforeUnload = () => {
      if (!isNavigatingToNextStepRef.current) {
        clearAllProductData()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      // Cleanup event listener
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Only clear if we're NOT navigating to the next step
      // This handles cases where user navigates via sidebar or other routes
      if (!isNavigatingToNextStepRef.current) {
        clearAllProductData()
      }
      // Reset the flag for next time
      isNavigatingToNextStepRef.current = false
    }
  }, [])
  const getCountryList = async () => {
    const response = await getCountries(2,100)
    if (response?.data?.success) {
      setCountries(response?.data?.data?.data)
    }
  }
  
  const getProductTypesList = async () => {
    try {
      const response = await getAllProductTypes()
      if (response?.data?.success) {
        setProductTypes(response?.data?.data?.data)
      }
    } catch (error) {
      console.error("Error fetching product types:", error)
    }
  }
  
  const loadCategoryFromSession = () => {
    const savedCategories = sessionStorage.getItem("selectedCategories")
    if (savedCategories) {
      const categories = JSON.parse(savedCategories)
      // Set the category_id from masterCategory selection
      if (categories.masterCategory) {
        updateFormData("category_id", String(categories.masterCategory))
      }
    }
  }

  const loadFormDataFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        const storedProductId = parsedData._productId
        
        // Only load if productId matches current effectiveProductId (URL or sessionStorage)
        if (effectiveProductId && storedProductId === effectiveProductId) {
          const { _productId, ...formDataToSet } = parsedData
          setFormData(formDataToSet)
        } else {
          // No match or no productId - clear old data
          clearFormDataFromLocalStorage()
        }
      }
    } catch (error) {
      console.error("Error loading form data from localStorage:", error)
    }
  }

  const saveFormDataToLocalStorage = () => {
    try {
      // Find the product type name from the productTypes list
      const selectedProductType = productTypes?.find((type: any) => String(type?.id) === String(formData.product_type_id))
      const productTypeName = selectedProductType?.name || selectedProductType?.type_name || selectedProductType?.product_type || ""
      
      const dataToSave = {
        ...formData,
        _productId: effectiveProductId || null, // Use effective productId (URL or sessionStorage)
        product_type_name: productTypeName // Save the product type name for settings page
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave))
    } catch (error) {
      console.error("Error saving form data to localStorage:", error)
    }
  }

  const clearFormDataFromLocalStorage = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing form data from localStorage:", error)
    }
  }

  const clearAllProductData = () => {
    try {
      // Clear localStorage
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      
      // Clear sessionStorage items related to product creation
      sessionStorage.removeItem("productId")
      sessionStorage.removeItem("productFormData")
      
    } catch (error) {
      console.error("Error clearing product data:", error)
    }
  }

  const loadProductData = async (id: string) => {
    try {
      setIsLoadingProductData(true)
      const response = await getProductById(id)
      if (response?.data?.success && response?.data?.data) {
        const product = response.data.data
        
        // Handle country - it might be country_id (number/string) or country object with id
        let countryValue = ""
        if (product.country_id) {
          countryValue = String(product.country_id)
        } else if (product.country?.id) {
          countryValue = String(product.country.id)
        }
        
        // Handle status - API can return "Active"/"Inactive" or 1/0
        let statusValue: "draft" | "active" = "draft"
        if (product.status === 1 || product.status === "1" || product.status === "Active") {
          statusValue = "active"
        } else if (product.status === 0 || product.status === "0" || product.status === "Inactive") {
          statusValue = "draft"
        }
        
        // Map API response to form data
        const mappedFormData: ProductFormData = {
          name: product.name_en || "",
          name_ar: product.name_ar || "",
          notification_email: product.email || "",
          country: countryValue,
          master_category: product.master_category || "",
          sub_categories: product.sub_categories || [],
          customer_types: product.customer_types || [],
          status: statusValue,
          logo_url: product.logo ? `${import.meta.env.VITE_REACT_APP_API_BASE_PRODUCT_MANAGEMENT_URL}${product.logo}` : "",
          short_desc_en: product.short_desc_en || "",
          short_desc_ar: product.short_desc_ar || "",
          has_commodity: product.has_commodity || false,
          category_id: product.category_id ? String(product.category_id) : "",
          product_type_id: product.product_type_id ? String(product.product_type_id) : "",
        }
        
        setFormData(mappedFormData)
        
        // Save to localStorage for persistence when navigating between steps
        const dataToSave = {
          ...mappedFormData,
          _productId: id
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave))
        
      }
    } catch (error: any) {
      console.error("Error loading product data:", error)
      toast.error(error?.response?.data?.message || error?.message || "Failed to load product data")
    } finally {
      setIsLoadingProductData(false)
    }
  }


  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Product name (English) is required"
    if (!formData.name_ar.trim()) newErrors.name_ar = "Product name (Arabic) is required"
    if (!formData.notification_email.trim()) {
      newErrors.notification_email = "Notification email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.notification_email)) {
      newErrors.notification_email = "Please enter a valid email address"
    }
    if (!formData.country) newErrors.country = "Country is required"
    // if (formData.customer_types.length === 0) newErrors.customer_types = "At least one customer type is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Custom function to create product with FormData
  const createProductWithFormData = async (formDataToSend: FormData) => {
    const baseURL = import.meta.env.VITE_REACT_APP_API_FACTORING
    return axios.post(`${baseURL}v1/product`, formDataToSend, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  const updateProductWithFormData = async (productId: string, formDataToSend: FormData) => {
    const baseURL = import.meta.env.VITE_REACT_APP_API_FACTORING
    return axios.post(`${baseURL}v1/product/${productId}/update`, formDataToSend, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  const handleNext = async () => {
    if (validateForm()) {
      setIsLoading(true)
      
      try {
        // Create FormData for multipart/form-data request
        const formDataToSend = new FormData()
        
        // Add form fields to FormData
        formDataToSend.append("name_en", formData.name)
        formDataToSend.append("name_ar", formData.name_ar)
        formDataToSend.append("email", formData.notification_email)
        formDataToSend.append("country_id", formData.country)
        formDataToSend.append("category_id", formData.category_id || "1")
        formDataToSend.append("product_type_id", formData.product_type_id || "1")
        formDataToSend.append("status", formData.status === "active" ? "1" : "0")
        
        // Add logo file if it exists
        if (logoFile) {
          formDataToSend.append("logo", logoFile)
        }

        let response: any
        if (isEditMode && effectiveProductId) {
          // Update existing product (using effectiveProductId - from URL or sessionStorage)
          response = await updateProductWithFormData(effectiveProductId, formDataToSend)
          
          if (response?.data?.success) {
            toast.success(response?.data?.message || "Product updated successfully!")
            
            // Save form data to localStorage for persistence
            saveFormDataToLocalStorage()
            
            // Save form data to session storage for next steps
            sessionStorage.setItem("productFormData", JSON.stringify(formData))
            sessionStorage.setItem("productId", effectiveProductId)
            
            // Mark that we're navigating to next step (don't clear storage)
            isNavigatingToNextStepRef.current = true
            
            // Navigate to next step
            router.push("/Los/ProductManagement/Create/ProductSettings")
          } else {
            // Handle validation errors from API
            if (response?.data?.errors) {
              const apiErrors: Record<string, string> = {}
              Object.keys(response.data.errors).forEach((field) => {
                const fieldErrors = response.data.errors[field]
                if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                  // Map API field names to form field names if needed
                  const formField = field === "name_en" ? "name" 
                                 : field === "name_ar" ? "name_ar"
                                 : field === "email" ? "notification_email"
                                 : field === "country_id" ? "country"
                                 : field === "category_id" ? "category_id"
                                 : field === "product_type_id" ? "product_type_id"
                                 : field
                  apiErrors[formField] = fieldErrors[0] // Take first error message
                }
              })
              setErrors(apiErrors)
              
              // Show first error in toast
              const firstError = Object.values(apiErrors)[0]
              if (firstError) {
                toast.error(firstError)
              } else {
                toast.error(response?.data?.message || "Validation failed")
              }
            } else {
              toast.error(response?.data?.message || "Failed to update product")
            }
          }
        } else {
          // Create new product
          response = await createProductWithFormData(formDataToSend)
          
          if (response?.data?.success) {
            toast.success(response?.data?.message || "Product created successfully!")
            
            const createdProduct = response?.data?.data
            const newProductId = String(createdProduct?.id || response?.data?.data?.id)
            
            // Map API response to form data format and save to localStorage
            if (createdProduct) {
              // Handle status - API returns "Active"/"Inactive"
              const statusValue = createdProduct.status === "Active" ? "active" : "draft"
              
              const apiFormData: ProductFormData = {
                name: createdProduct.name_en || formData.name,
                name_ar: createdProduct.name_ar || formData.name_ar,
                notification_email: createdProduct.email || formData.notification_email,
                country: createdProduct.country_id ? String(createdProduct.country_id) : formData.country,
                master_category: formData.master_category || "",
                sub_categories: formData.sub_categories || [],
                customer_types: formData.customer_types || [],
                status: statusValue,
                logo_url: formData.logo_url || "",
                short_desc_en: formData.short_desc_en || "",
                short_desc_ar: formData.short_desc_ar || "",
                has_commodity: createdProduct.commodity || formData.has_commodity,
                category_id: createdProduct.category_id ? String(createdProduct.category_id) : formData.category_id,
                product_type_id: createdProduct.product_type_id ? String(createdProduct.product_type_id) : formData.product_type_id,
              }
              
              // Save to localStorage with productId for persistence
              const dataToSave = {
                ...apiFormData,
                _productId: newProductId
              }
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave))
            }
            
            // Save form data to session storage for next steps
            sessionStorage.setItem("productFormData", JSON.stringify(formData))
            sessionStorage.setItem("productId", newProductId)
            
            // Mark that we're navigating to next step (don't clear storage)
            isNavigatingToNextStepRef.current = true
            
            // Navigate to next step
            router.push("/Los/ProductManagement/Create/ProductSettings")
          } else {
            // Handle validation errors from API
            if (response?.data?.errors) {
              const apiErrors: Record<string, string> = {}
              Object.keys(response.data.errors).forEach((field) => {
                const fieldErrors = response.data.errors[field]
                if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                  // Map API field names to form field names if needed
                  const formField = field === "name_en" ? "name" 
                                 : field === "name_ar" ? "name_ar"
                                 : field === "email" ? "notification_email"
                                 : field === "country_id" ? "country"
                                 : field === "category_id" ? "category_id"
                                 : field === "product_type_id" ? "product_type_id"
                                 : field
                  apiErrors[formField] = fieldErrors[0] // Take first error message
                }
              })
              setErrors(apiErrors)
              
              // Show first error in toast
              const firstError = Object.values(apiErrors)[0]
              if (firstError) {
                toast.error(firstError)
              } else {
                toast.error(response?.data?.message || "Validation failed")
              }
            } else {
              toast.error(response?.data?.message || "Failed to create product")
            }
          }
        }
      } catch (error: any) {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, error)
        
        // Handle validation errors from API response
        if (error?.response?.data?.errors) {
          const apiErrors: Record<string, string> = {}
          Object.keys(error.response.data.errors).forEach((field) => {
            const fieldErrors = error.response.data.errors[field]
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
              // Map API field names to form field names if needed
              const formField = field === "name_en" ? "name" 
                             : field === "name_ar" ? "name_ar"
                             : field === "email" ? "notification_email"
                             : field === "country_id" ? "country"
                             : field === "category_id" ? "category_id"
                             : field === "product_type_id" ? "product_type_id"
                             : field
              apiErrors[formField] = fieldErrors[0] // Take first error message
            }
          })
          setErrors(apiErrors)
          
          // Show first error in toast
          const firstError = Object.values(apiErrors)[0]
          if (firstError) {
            toast.error(firstError)
          } else {
            toast.error(error?.response?.data?.message || "Validation failed")
          }
        } else {
          toast.error(error?.response?.data?.message || error?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`)
        }
      } finally {
        setIsLoading(false)
      }
    }
  }



  const handleLogoClick = () => {
    fileInputRef.current?.click()
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, logo: 'Please upload a PNG, JPG, or WEBP image' }))
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, logo: 'Image size should not exceed 5MB' }))
        return
      }

      // Clear any previous logo errors
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.logo
        return newErrors
      })

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        updateFormData('logo_url', reader.result as string)
      }
      reader.readAsDataURL(file)
      
      setLogoFile(file)
    }
  }

  const handleSubCategoryToggle = (category: string) => {
    const newSubCategories = formData.sub_categories.includes(category)
      ? formData.sub_categories.filter((c) => c !== category)
      : [...formData.sub_categories, category]
    updateFormData("sub_categories", newSubCategories)
  }

  const handleCustomerTypeToggle = (type: string) => {
    const newCustomerTypes = formData.customer_types.includes(type)
      ? formData.customer_types.filter((t) => t !== type)
      : [...formData.customer_types, type]
    updateFormData("customer_types", newCustomerTypes)
  }

  const availableSubCategories = formData.master_category ? subCategoriesMap[formData.master_category] || [] : []

  return (
    <div className="min-h-screen bg-background">
      {isLoadingProductData && <Loader />}
      {/* Header with tabs (no steps / progress) */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="max-w-8xl mx-auto">
            <div className={`flex items-center justify-between mb-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                <Button variant="ghost" size="sm" onClick={handleBackToProducts} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Products
                </Button>
                {templateId && (
                  <Badge variant="outline" className="gap-1">
                    Using Template
                  </Badge>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-semibold mb-4">{isEditMode ? "Edit Product" : "Create Product"}</h1>
            <ProductCreateEditTabs
              activeTab="basic-info"
              productId={effectiveProductId}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-8xl mx-auto">
          <TooltipProvider>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Product Details</CardTitle>
                <p className="text-muted-foreground">
                  Enter the basic information for your new product. All fields marked with * are required.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="name">Product Name (English) *</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the primary product name in English (max 120 characters)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="name"
                      placeholder="e.g., Home Financing Plus"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      maxLength={120}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="name_ar">Product Name (Arabic) *</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the product name in Arabic (max 120 characters)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="name_ar"
                      placeholder="مثال: التمويل العقاري بلس"
                      value={formData.name_ar}
                      onChange={(e) => updateFormData("name_ar", e.target.value)}
                      maxLength={120}
                      dir="rtl"
                      className={errors.name_ar ? "border-destructive" : ""}
                    />
                    {errors.name_ar && <p className="text-sm text-destructive">{errors.name_ar}</p>}
                  </div>
                </div>

                {/* Notification Email */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="email">Notification Email *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Email address for product-related notifications and alerts</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="product-notify@bank.com"
                    value={formData.notification_email}
                    onChange={(e) => updateFormData("notification_email", e.target.value)}
                    className={errors.notification_email ? "border-destructive" : ""}
                  />
                  {errors.notification_email && <p className="text-sm text-destructive">{errors.notification_email}</p>}
                </div>

                {/* Country and Product Type */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <Select value={formData.country || undefined} onValueChange={(value) => updateFormData("country", value)}>
                      <SelectTrigger className={`w-full ${errors.country ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries?.map((country:any) => (
                          <SelectItem key={country?.id} value={String(country?.id)}>
                            {country?.flag} {country?.country_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Product Type</Label>
                    <Select  value={formData.product_type_id} onValueChange={(value) => updateFormData("product_type_id", value)}>
                      <SelectTrigger className={"w-full "}>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes?.map((type:any) => (
                          <SelectItem key={type?.id} value={String(type?.id)}>
                            {type?.name || type?.type_name || type?.product_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sub-categories */}
                {availableSubCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sub-categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableSubCategories.map((category) => (
                        <Badge
                          key={category}
                          variant={formData.sub_categories.includes(category) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleSubCategoryToggle(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Click to select/deselect sub-categories</p>
                  </div>
                )}

                {/* Customer Types */}
                {/* <div className="space-y-2">
                  <Label>Customer Types *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {customerTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={formData.customer_types.includes(type)}
                          onCheckedChange={() => handleCustomerTypeToggle(type)}
                        />
                        <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.customer_types && <p className="text-sm text-destructive">{errors.customer_types}</p>}
                </div> */}

                {/* Status and Logo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                       className="red-switch"
                       checked={formData.status === "active"}
                        onChange={(checked) => updateFormData("status", checked ? "active" : "draft")}
                      />
                      <Label className="text-sm">{formData.status === "active" ? "Active" : "Draft"}</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Draft products are not visible to customers</p>
                  </div>

                  <div className="space-y-2 w-full">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={formData.logo_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {formData.name ? formData.name.substring(0, 2).toUpperCase() : "PR"}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="gap-2 bg-transparent"
                        onClick={handleLogoClick}
                      >
                        <Upload className="h-4 w-4" />
                        {formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                    </div>
                    {errors.logo && (
                      <p className="text-xs text-red-500">{errors.logo}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Recommended: 200x200px, PNG or JPG (Max 5MB)</p>
                  </div>
                </div>

                {/* Descriptions */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="desc_en">Short Description (English)</Label>
                    <Textarea
                      id="desc_en"
                      placeholder="Brief description of the product..."
                      value={formData.short_desc_en}
                      onChange={(e) => updateFormData("short_desc_en", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc_ar">Short Description (Arabic)</Label>
                    <Textarea
                      id="desc_ar"
                      placeholder="وصف مختصر للمنتج..."
                      value={formData.short_desc_ar}
                      onChange={(e) => updateFormData("short_desc_ar", e.target.value)}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </div> */}

                {/* Commodity Checkbox */}
                {/* <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_commodity"
                      checked={formData.has_commodity}
                      onCheckedChange={(checked) => updateFormData("has_commodity", checked)}
                    />
                    <Label htmlFor="has_commodity" className="cursor-pointer">
                      This product involves a commodity
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Check this if the product involves physical or digital commodities</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If checked, you'll configure commodity details in the next step
                  </p>
                </div> */}
              </CardContent>
            </Card>
          </TooltipProvider>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-card sticky bottom-0">
        <div className="container mx-auto px-6 py-4">
          <div className="max-w-8xl mx-auto">
            <div className={`flex items-center justify-between ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-3 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                {/* <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button> */}
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
              </div>

              <Button onClick={handleNext} disabled={isLoading} className="gap-2">
                {isLoading ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update & Next: Settings" : "Next: Settings")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
