import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "../../lib/router"
import { ArrowLeft, ArrowRight, Save, Plus, Users } from "lucide-react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { useLanguage } from "../../hooks/use-language"
import { getPartnersList, updatePartnerStatus } from "../../redux/apis/apisCrud"
import TableView from "../TableView/TableView"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react";
import { Select as AntSelect, Input as AntInput } from "antd";
import axios from "axios";
import { store } from "../../redux/store";
import { Pencil, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import toast from "react-hot-toast";
import ProductCreateEditTabs from "./ProductCreateEditTabs"

export default function CreateProductAffiliation() {
  const { isRTL } = useLanguage()
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [newPartner, setNewPartner] = useState({
    name_en: "",
    name_ar: "",
    email: "",
    contact_no: "",
    country_id: "1",
    affiliation_url: "",
    affiliation_code: "",
    brand_color: "#000000",
    secret_key: "",
    enable_api: false,
    status: false,
    revenue_verification_method: "Manual",
    get_revenue_url: "",
    get_revenue_secret_key: "",
  })
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconPreview, setFaviconPreview] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [searchParams] = useSearchParams()
  const productIdFromUrl = searchParams.get("id")
  const productIdForTabs = productIdFromUrl || sessionStorage.getItem("productId")

  useEffect(() => {
    if (productIdFromUrl) {
      sessionStorage.setItem("productId", productIdFromUrl)
    }
  }, [productIdFromUrl])

  useEffect(() => {
    const effectiveProductId = productIdFromUrl || sessionStorage.getItem("productId")
    if (!effectiveProductId) {
      toast.error("Product ID not found. Please start from Basic Information.")
      router.push("/Los/ProductManagement/Create/BasicInfo")
    }
  }, [productIdFromUrl])

  // Function to generate random secret key
  const generateSecretKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secretKey = '';
    for (let i = 0; i < 50; i++) {
      secretKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return secretKey;
  };

  // Auto-generate secret key when dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      setNewPartner(prev => ({ ...prev, secret_key: generateSecretKey() }));
    }
  }, [isAddDialogOpen]);

  const handleInputChange = (field: string, value: any) => {
    setNewPartner({ ...newPartner, [field]: value });
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[field];
      setFieldErrors(newErrors);
    }
  };

  const handleAddPartner = async () => {
    try {
      // Validation
      if (!newPartner.name_en || !newPartner.name_ar || !newPartner.email || !newPartner.contact_no) {
        toast.error("Please fill all required fields");
        return;
      }

      setIsLoading(true);

      // Create FormData
      const submitData: any = new FormData();
      submitData.append("name_en", newPartner.name_en);
      submitData.append("name_ar", newPartner.name_ar);
      submitData.append("email", newPartner.email);
      submitData.append("contact_no", newPartner.contact_no);
      submitData.append("country_id", newPartner.country_id);
      submitData.append("affiliation_url", newPartner.affiliation_url);
      submitData.append("affiliation_code", newPartner.affiliation_code);
      submitData.append("color_code", newPartner.brand_color);
      submitData.append("secret_key", newPartner.secret_key);
      submitData.append("enable_api", newPartner.enable_api ? "1" : "0");
      submitData.append("status", newPartner.status ? "Active" : "Inactive");
      submitData.append("revenue_verification_method", newPartner.revenue_verification_method);
      submitData.append("get_revenue_url", newPartner.get_revenue_url);
      submitData.append("get_revenue_secret_key", newPartner.get_revenue_secret_key);

      if (logo) {
        submitData.append("logo", logo);
      }
      if (favicon) {
        submitData.append("favicon", favicon);
      }

      const token = (store.getState() as any).block.token;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/partner`,
        submitData,
        { headers: headers }
      );

      if (response?.data?.message === "success") {
        toast.success(response?.data?.message || "Partner added successfully");
        setIsAddDialogOpen(false);
        setFieldErrors({});
        // Reset form
        setNewPartner({
          name_en: "",
          name_ar: "",
          email: "",
          contact_no: "",
          country_id: "1",
          affiliation_url: "",
          affiliation_code: "",
          brand_color: "#000000",
          secret_key: "",
          enable_api: false,
          status: false,
          revenue_verification_method: "Manual",
          get_revenue_url: "",
          get_revenue_secret_key: "",
        });
        setLogo(null);
        setFavicon(null);
        setLogoPreview("");
        setFaviconPreview("");
        if (logoInputRef.current) logoInputRef.current.value = "";
        if (faviconInputRef.current) faviconInputRef.current.value = "";
        // Refresh partners list
        getPartnersData();
      } else {
        // Handle validation errors
        const errors = response?.data?.errors || {};
        const errorMessages: Record<string, string> = {};
        
        // Map API field names to form field names and extract first error message
        Object.keys(errors).forEach((field) => {
          if (Array.isArray(errors[field]) && errors[field].length > 0) {
            errorMessages[field] = errors[field][0];
          }
        });
        
        setFieldErrors(errorMessages);
        
        // Show first error in toast
        const firstError = Object.values(errorMessages)[0];
        if (firstError) {
          toast.error(firstError);
        } else {
          toast.error(response?.data?.message || "Failed to add partner");
        }
      }
    } catch (error: any) {
      console.error("Error adding partner:", error);
      
      // Handle validation errors from catch block
      const errors = error?.response?.data?.errors || {};
      const errorMessages: Record<string, string> = {};
      
      Object.keys(errors).forEach((field) => {
        if (Array.isArray(errors[field]) && errors[field].length > 0) {
          errorMessages[field] = errors[field][0];
        }
      });
      
      if (Object.keys(errorMessages).length > 0) {
        setFieldErrors(errorMessages);
        const firstError = Object.values(errorMessages)[0];
        toast.error(firstError);
      } else {
        toast.error(error?.response?.data?.message || "Failed to add partner");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleNext = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/Los/ProductManagement/Create/RequiredDocuments")
    }, 500)
  }

  const handlePrevious = () => {
    router.push("/Los/ProductManagement/Create/ProductSettings")
  }

  const handleSaveDraft = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/")
    }, 1000)
  }

  const handleStatusToggle = async (partnerId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      
      const body = {
        status: newStatus === "Active" ? "1" : "0", // Send as "1" or "0"
      };

      const response = await updatePartnerStatus(partnerId, body);

      if (response?.data?.message === "success") {
        setData((prevData: any) =>
          prevData.map((item: any) =>
            item.id === partnerId ? { ...item, status: newStatus } : item
          )
        );
        toast.success(response?.data?.message || "Partner status updated successfully");
      } else {
        toast.error(response?.data?.message || "Failed to update partner status");
      }
    } catch (error: any) {
      console.error("Error updating partner status:", error);
      toast.error(error?.response?.data?.message || "Failed to update partner status");
    }
  };

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      navigate(`/LOS/PartnerManagement/UpdatePartner?id=${row.id}`);
    } else if (key === "adminList") {
      navigate(`/PartnerManagement/PartnerAdminList?id=${row.id}`);
    }
  };

  const Activity_Loans_Header = [
  {
    name: "Name",
    selector: (row: { name_en: any }) => row.name_en,
    sortable: true,
    width: "150px",
  },
  {
    name: "اسم",
    selector: (row: { name_ar: any }) => row.name_ar,
    sortable: true,
    width: "150px",
  },
  {
    name: "Email",
    selector: (row: { email: any }) => row.email,
    sortable: true,
    width: "250px",
  },
  {
    name: "Logo",
    cell: (row: any) => (
      row.logo ? <img src={row.logo} alt="logo" style={{ width: "30px", height: "30px" }} /> : "-"
    ),
    width: "120px",
  },
  {
    name: "Favicon",
    cell: (row: any) => (
      row.favicon ? <img src={row.favicon} alt="favicon" style={{ width: "20px", height: "20px" }} /> : "-"
    ),
    width: "100px",
  },
  {
    name: "Affiliation URL",
    selector: (row: { affiliation_url: any }) => row.affiliation_url || "-",
    sortable: true,
    width: "320px",
  },
  {
    name: "Commission",
    selector: (row: { commission_value: any }) => row.commission_value ? `${row.commission_value}%` : "0%",
    sortable: true,
    width: "120px",
  },
  {
    name: "Secret Key",
    cell: (row: any) => (
      <div
        style={{
          wordBreak: "break-word",
          whiteSpace: "normal",
          lineHeight: "1.4",
          fontSize: "12px",
        }}
      >
        {row.secret_key || "-"}
      </div>
    ),
    width: "350px",
  },
  {
    name: "Status",
    cell: (row: any) => (
      <Switch
        checked={row.status === "Active"}
        onCheckedChange={() => handleStatusToggle(row.id, row.status)}
      />
    ),
    width: "120px",
  },
  {
    name: "Action",
    cell: (row: any) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="gradient-btn text-xs rounded py-2 px-2 gap-1"
            variant="outline"
          >
            Action
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => handleMenuClick("edit", row)}>
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    width: "120px",
  },
];

  useEffect(() => {
    getPartnersData();
  }, [page, pageSize]);

  const getPartnersData = async () => {
    setSkelitonLoading(true);
    try {
      const response = await getPartnersList();
      if (response?.data?.message === "success") {
        const partnersData = response?.data?.data?.data || [];
        setData(partnersData);
        setTotalRows(partnersData.length || 0);
        setFrom(1);
        setTo(partnersData.length || 0);
        setPage(1);
        setTotalPage(Math.ceil(partnersData.length / pageSize) || 1);
        toast.success(response?.data?.message || "Partners fetched successfully");
      } else {
        toast.error(response?.data?.message || "Failed to fetch partners");
      }
    } catch (error: any) {
      console.error("Error fetching partners:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch partners");
    } finally {
      setSkelitonLoading(false);
    }
  };

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        name_en: item?.name_en || "-",
        name_ar: item?.name_ar || "-",
        email: item?.email || "-",
        logo: item?.logo,
        favicon: item?.favicon,
        affiliation_url: item?.affiliation_url,
        commission_value: item?.commission_value,
        secret_key: item?.secret_key,
        status: item?.status || "Inactive",
      };
    });
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Progress */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className={`flex items-center justify-between mb-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                <Button variant="ghost" size="sm" onClick={() => router.push("/Los/ProductManagement")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Products
                </Button>
              </div>
            </div>
            <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
            <ProductCreateEditTabs
              activeTab="partner-affiliation"
              productId={productIdForTabs}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Partner Management
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Configure partner affiliations and commission structures for this product.
                  </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) {
                    setFieldErrors({});
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Partner
                    </Button>
                  </DialogTrigger>
                  <DialogContent style={{ maxWidth: "42rem" }} className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Partner</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="Name"
                          value={newPartner.name_en}
                          onChange={(e) => handleInputChange("name_en", e.target.value)}
                          className={fieldErrors.name_en ? "border-red-500" : ""}
                        />
                        {fieldErrors.name_en && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.name_en}</p>
                        )}
                      </div>

                      {/* اسم */}
                      <div className="space-y-2">
                        <Label style={{ textAlign: "right", display: "block" }}>اسم</Label>
                        <Input
                          placeholder="اسم"
                          value={newPartner.name_ar}
                          onChange={(e) => handleInputChange("name_ar", e.target.value)}
                          dir="rtl"
                          className={fieldErrors.name_ar ? "border-red-500" : ""}
                        />
                        {fieldErrors.name_ar && (
                          <p className="text-sm text-red-500 mt-1" dir="rtl">{fieldErrors.name_ar}</p>
                        )}
                      </div>

                      {/* Partner Email */}
                      <div className="space-y-2">
                        <Label>Partner Email</Label>
                        <Input
                          type="email"
                          placeholder="Partner Email"
                          value={newPartner.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={fieldErrors.email ? "border-red-500" : ""}
                        />
                        {fieldErrors.email && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
                        )}
                      </div>

                      {/* Contact No */}
                      <div className="space-y-2">
                        <Label>Contact No.</Label>
                        <AntInput
                          addonBefore="+966"
                          placeholder="Contact No"
                          value={newPartner.contact_no}
                          onChange={(e) => handleInputChange("contact_no", e.target.value)}
                          status={fieldErrors.contact_no ? "error" : undefined}
                        />
                        {fieldErrors.contact_no && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.contact_no}</p>
                        )}
                      </div>

                      {/* Country */}
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <AntSelect
                          value={newPartner.country_id}
                          onChange={(value) => handleInputChange("country_id", value)}
                          style={{ width: "100%" }}
                        >
                          <AntSelect.Option value="1">Saudi Arabia</AntSelect.Option>
                        </AntSelect>
                      </div>

                      {/* Choose Brand Color */}
                      <div className="space-y-2">
                        <Label>Choose Brand Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={newPartner.brand_color}
                            onChange={(e) => handleInputChange("brand_color", e.target.value)}
                            style={{ width: "50%" }}
                          />
                          <Input
                            value={newPartner.brand_color}
                            onChange={(e) => handleInputChange("brand_color", e.target.value)}
                            style={{ width: "50%" }}
                          />
                        </div>
                      </div>

                      {/* Affiliation URL */}
                      <div className="space-y-2">
                        <Label>Affiliation URL</Label>
                        <Input
                          placeholder="Affiliation URL"
                          value={newPartner.affiliation_url}
                          onChange={(e) => handleInputChange("affiliation_url", e.target.value)}
                          className={fieldErrors.affiliation_url ? "border-red-500" : ""}
                        />
                        {fieldErrors.affiliation_url && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.affiliation_url}</p>
                        )}
                      </div>

                      {/* Affiliation Code */}
                      <div className="space-y-2">
                        <Label>Affiliation Code</Label>
                        <Input
                          placeholder="Affiliation Code"
                          value={newPartner.affiliation_code}
                          onChange={(e) => handleInputChange("affiliation_code", e.target.value)}
                          className={fieldErrors.affiliation_code ? "border-red-500" : ""}
                        />
                        {fieldErrors.affiliation_code && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.affiliation_code}</p>
                        )}
                      </div>

                      {/* Logo */}
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <div style={{ position: "relative" }}>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="form-control fs-6"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              if (!file) return;
                              if (logoPreview) URL.revokeObjectURL(logoPreview);
                              setLogo(file);
                              setLogoPreview(URL.createObjectURL(file));
                            }}
                          />
                          {logo && (
                            <button
                              type="button"
                              onClick={() => {
                                if (logoPreview) URL.revokeObjectURL(logoPreview);
                                setLogo(null);
                                setLogoPreview("");
                                if (logoInputRef.current) logoInputRef.current.value = "";
                              }}
                              style={{
                                position: "absolute",
                                top: "50%",
                                right: "10px",
                                transform: "translateY(-50%)",
                                background: "transparent",
                                color: "var(--foreground)",
                                border: "none",
                                borderRadius: "50%",
                                width: "28px",
                                height: "28px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "18px",
                                padding: 0,
                                zIndex: 10,
                              }}
                              title="Remove logo"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {logoPreview && (
                          <div className="d-flex justify-content-center" style={{ marginTop: 10 }}>
                            <img
                              src={logoPreview}
                              width={150}
                              height={150}
                              style={{ objectFit: "contain" }}
                              alt="Logo preview"
                            />
                          </div>
                        )}
                      </div>

                      {/* Favicon */}
                      <div className="space-y-2">
                        <Label>Favicon</Label>
                        <div style={{ position: "relative" }}>
                          <input
                            ref={faviconInputRef}
                            type="file"
                            accept="image/*"
                            className="form-control fs-6"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              if (!file) return;
                              if (faviconPreview) URL.revokeObjectURL(faviconPreview);
                              setFavicon(file);
                              setFaviconPreview(URL.createObjectURL(file));
                            }}
                          />
                          {favicon && (
                            <button
                              type="button"
                              onClick={() => {
                                if (faviconPreview) URL.revokeObjectURL(faviconPreview);
                                setFavicon(null);
                                setFaviconPreview("");
                                if (faviconInputRef.current) faviconInputRef.current.value = "";
                              }}
                              style={{
                                position: "absolute",
                                top: "50%",
                                right: "10px",
                                transform: "translateY(-50%)",
                                background: "transparent",
                                color: "var(--foreground)",
                                border: "none",
                                borderRadius: "50%",
                                width: "28px",
                                height: "28px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "18px",
                                padding: 0,
                                zIndex: 10,
                              }}
                              title="Remove favicon"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {faviconPreview && (
                          <div className="d-flex justify-content-center" style={{ marginTop: 10 }}>
                            <img
                              src={faviconPreview}
                              width={150}
                              height={150}
                              style={{ objectFit: "contain" }}
                              alt="Favicon preview"
                            />
                          </div>
                        )}
                      </div>

                      {/* API Secret Key */}
                      <div className="space-y-2">
                        <Label>API Secret Key</Label>
                        <Input
                          placeholder="Auto-generated key"
                          value={newPartner.secret_key}
                          onChange={(e) => handleInputChange("secret_key", e.target.value)}
                          style={{ backgroundColor: "var(--muted)" }}
                          readOnly
                        />
                      </div>

                      {/* Revenue Verification Method */}
                      <div className="space-y-2">
                        <Label>Revenue Verification Method</Label>
                        <AntSelect
                          value={newPartner.revenue_verification_method}
                          onChange={(value) => {
                            handleInputChange("revenue_verification_method", value);
                            // Auto enable API for Email_Triggering or Both
                            if (value === "Email_Triggering" || value === "Both_Api_Email") {
                              handleInputChange("enable_api", true);
                            }
                          }}
                          style={{ width: "100%" }}
                        >
                          <AntSelect.Option value="Manual">Manual</AntSelect.Option>
                          <AntSelect.Option value="Verify_Through_Api">Verify Through Api</AntSelect.Option>
                          <AntSelect.Option value="Email_Triggering">Email Triggering</AntSelect.Option>
                          <AntSelect.Option value="Both_Api_Email">Both(Verify Through Api & Email Triggering)</AntSelect.Option>
                        </AntSelect>
                      </div>

                      {/* Get Revenue URL - Show if Verify_Through_Api or Both */}
                      {(newPartner.revenue_verification_method === "Verify_Through_Api" || 
                        newPartner.revenue_verification_method === "Both_Api_Email") && (
                        <>
                          <div className="space-y-2">
                            <Label>Get Revenue URL</Label>
                            <Input
                              placeholder="Get Revenue URL"
                              value={newPartner.get_revenue_url}
                              onChange={(e) => handleInputChange("get_revenue_url", e.target.value)}
                              className={fieldErrors.get_revenue_url ? "border-red-500" : ""}
                            />
                            {fieldErrors.get_revenue_url && (
                              <p className="text-sm text-red-500 mt-1">{fieldErrors.get_revenue_url}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Get Revenue Secret Key</Label>
                            <Input
                              placeholder="Get Revenue Secret Key"
                              value={newPartner.get_revenue_secret_key}
                              onChange={(e) => handleInputChange("get_revenue_secret_key", e.target.value)}
                              className={fieldErrors.get_revenue_secret_key ? "border-red-500" : ""}
                            />
                            {fieldErrors.get_revenue_secret_key && (
                              <p className="text-sm text-red-500 mt-1">{fieldErrors.get_revenue_secret_key}</p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Enable API */}
                      <div className="space-y-2">
                        <div className="d-flex align-items-center gap-2">
                          <Switch
                            className="red-switch"
                            checked={newPartner.enable_api}
                            onChange={(checked) => handleInputChange("enable_api", checked)}
                          />
                          <Label className="mb-0">Enable API</Label>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <div className="d-flex align-items-center gap-2">
                          <Switch
                            className="red-switch"
                            checked={newPartner.status}
                            onChange={(checked) => handleInputChange("status", checked)}
                          />
                          <Label className="mb-0">Status</Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => {
                        setIsAddDialogOpen(false);
                        setFieldErrors({});
                        // Reset form
                        setNewPartner({
                          name_en: "",
                          name_ar: "",
                          email: "",
                          contact_no: "",
                          country_id: "1",
                          affiliation_url: "",
                          affiliation_code: "",
                          brand_color: "#000000",
                          secret_key: "",
                          enable_api: false,
                          status: false,
                          revenue_verification_method: "Manual",
                          get_revenue_url: "",
                          get_revenue_secret_key: "",
                        });
                        setLogo(null);
                        setFavicon(null);
                        setLogoPreview("");
                        setFaviconPreview("");
                        if (logoInputRef.current) logoInputRef.current.value = "";
                        if (faviconInputRef.current) faviconInputRef.current.value = "";
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPartner} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Add Partner"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              {/* <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search partners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAffiliation} onValueChange={setFilterAffiliation}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Affiliation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Primary">Primary</SelectItem>
                    <SelectItem value="Secondary">Secondary</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Partners Table */}
              {/* <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPartners.length === filteredPartners.length && filteredPartners.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Partner Name (EN)</TableHead>
                      <TableHead>Partner Name (AR)</TableHead>
                      <TableHead>Affiliation</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPartners.includes(partner.id)}
                            onCheckedChange={(checked) => handleSelectPartner(partner.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{partner.name_en}</TableCell>
                        <TableCell dir="rtl">{partner.name_ar}</TableCell>
                        <TableCell>
                          <Badge variant={partner.affiliation_type === "Primary" ? "default" : "secondary"}>
                            {partner.affiliation_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{partner.commission}%</TableCell>
                        <TableCell>
                          <Badge variant={partner.status === "Active" ? "default" : "secondary"}>
                            {partner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Partner</DropdownMenuItem>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Set Commission</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Remove Partner</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div> */}
 <TableView
          header={Activity_Loans_Header}
          data={mappedData}
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />
              {/* {selectedPartners.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedPartners.length} partner(s) selected for this product
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Set Bulk Commission
                    </Button>
                    <Button size="sm" variant="outline">
                      Configure Fee Slabs
                    </Button>
                  </div>
                </div>
              )} */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-card sticky bottom-0">
        <div className="container mx-auto px-6 py-4">
          <div className="max-w-6xl mx-auto">
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
                <Button variant="ghost" onClick={() => router.push("/products/create")}>
                  Cancel
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handlePrevious} className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={handleNext} disabled={isLoading} className="gap-2">
                  {isLoading ? "Saving..." : "Next: Documents"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
