import { useState } from "react"
import { useRouter, useSearchParams } from "../../lib/router"
import { ArrowLeft, ArrowRight, Plus, Users } from "lucide-react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { useLanguage } from "../../hooks/use-language"
import { getPartnersList, updatePartnerStatus } from "../../redux/apis/apisCrud"
import { createPartnerAdmin } from "../../redux/apis/apisCrudProductManagement"
import TableView from "../TableView/TableView"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react";
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
  const [newPartner, setNewPartner] = useState({
    partnerCode: "",
    nameEn: "",
    nameAr: "",
    email: "",
    phone: "",
    contactPerson: "",
  })
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

  const handleInputChange = (field: string, value: any) => {
    setNewPartner({ ...newPartner, [field]: value });
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[field];
      setFieldErrors(newErrors);
    }
  };

  const resetForm = () => {
    setNewPartner({
      partnerCode: "",
      nameEn: "",
      nameAr: "",
      email: "",
      phone: "",
      contactPerson: "",
    });
    setFieldErrors({});
  };

  const handleAddPartner = async () => {
    try {
      if (!newPartner.partnerCode || !newPartner.nameEn || !newPartner.nameAr || !newPartner.email || !newPartner.phone || !newPartner.contactPerson) {
        toast.error("Please fill all required fields");
        return;
      }

      setIsLoading(true);

      const response = await createPartnerAdmin(newPartner);

      if (response?.data?.message === "success") {
        toast.success("Partner added successfully");
        setIsAddDialogOpen(false);
        resetForm();
        getPartnersData();
      } else {
        toast.error(response?.data?.message || "Failed to add partner");
      }
    } catch (error: any) {
      const errors = error?.response?.data?.errors || {};
      const errorMessages: Record<string, string> = {};

      Object.keys(errors).forEach((field) => {
        if (Array.isArray(errors[field]) && errors[field].length > 0) {
          errorMessages[field] = errors[field][0];
        }
      });

      if (Object.keys(errorMessages).length > 0) {
        setFieldErrors(errorMessages);
        toast.error(Object.values(errorMessages)[0]);
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

  const handleStatusToggle = async (partnerId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

      const body = {
        status: newStatus === "Active" ? "1" : "0",
      };

      const response = await updatePartnerStatus(partnerId, body);

      if (response?.data?.message === "success") {
        // Update mapped display status
        setData((prevData: any) =>
          prevData.map((item: any) =>
            item.id === partnerId ? { ...item, status: newStatus === "Active" ? "ACTIVE" : "INACTIVE" } : item
          )
        );
        toast.success("Partner status updated successfully");
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
    name: "Name (En)",
    selector: (row: { name_en: any }) => row.name_en,
    sortable: true,
    width: "180px",
  },
  {
    name: "Name (Ar)",
    selector: (row: { name_ar: any }) => row.name_ar,
    sortable: true,
    width: "180px",
  },
  {
    name: "Email",
    selector: (row: { email: any }) => row.email,
    sortable: true,
    width: "220px",
  },
  {
    name: "Phone",
    selector: (row: { phone: any }) => row.phone,
    sortable: true,
    width: "160px",
  },
  {
    name: "Contact Person",
    selector: (row: { contactPerson: any }) => row.contactPerson,
    sortable: true,
    width: "180px",
  },
  {
    name: "Logo",
    cell: (row: any) => (
      row.logo ? <img src={row.logo} alt="logo" style={{ width: "30px", height: "30px" }} /> : "-"
    ),
    width: "80px",
  },
  {
    name: "Status",
    cell: (row: any) => (
      <Switch
        checked={row.status === "Active"}
        onCheckedChange={() => handleStatusToggle(row.id, row.status)}
      />
    ),
    width: "100px",
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
        const partnersData = response?.data?.data || [];
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
        name_en: item?.nameEn || item?.name_en || "-",
        name_ar: item?.nameAr || item?.name_ar || "-",
        email: item?.email || "-",
        phone: item?.phone || "-",
        contactPerson: item?.contactPerson || "-",
        logo: item?.logoUrl || item?.logo,
        status: item?.status === "ACTIVE" ? "Active" : item?.status === "INACTIVE" ? "Inactive" : (item?.status || "Inactive"),
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
                  <DialogContent style={{ maxWidth: "36rem" }} className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Partner</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      {/* Partner Code */}
                      <div className="space-y-2">
                        <Label>Partner Code</Label>
                        <Input
                          placeholder="e.g. PTR-001"
                          value={newPartner.partnerCode}
                          onChange={(e) => handleInputChange("partnerCode", e.target.value)}
                          className={fieldErrors.partnerCode ? "border-red-500" : ""}
                        />
                        {fieldErrors.partnerCode && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.partnerCode}</p>
                        )}
                      </div>

                      {/* Contact Person */}
                      <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <Input
                          placeholder="Contact Person"
                          value={newPartner.contactPerson}
                          onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                          className={fieldErrors.contactPerson ? "border-red-500" : ""}
                        />
                        {fieldErrors.contactPerson && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.contactPerson}</p>
                        )}
                      </div>

                      {/* Name (En) */}
                      <div className="space-y-2">
                        <Label>Name (En)</Label>
                        <Input
                          placeholder="Name in English"
                          value={newPartner.nameEn}
                          onChange={(e) => handleInputChange("nameEn", e.target.value)}
                          className={fieldErrors.nameEn ? "border-red-500" : ""}
                        />
                        {fieldErrors.nameEn && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.nameEn}</p>
                        )}
                      </div>

                      {/* Name (Ar) */}
                      <div className="space-y-2">
                        <Label style={{ textAlign: "right", display: "block" }}>الاسم (عربي)</Label>
                        <Input
                          placeholder="الاسم بالعربي"
                          value={newPartner.nameAr}
                          onChange={(e) => handleInputChange("nameAr", e.target.value)}
                          dir="rtl"
                          className={fieldErrors.nameAr ? "border-red-500" : ""}
                        />
                        {fieldErrors.nameAr && (
                          <p className="text-sm text-red-500 mt-1" dir="rtl">{fieldErrors.nameAr}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label>Email</Label>
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

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          placeholder="+966112345678"
                          value={newPartner.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className={fieldErrors.phone ? "border-red-500" : ""}
                        />
                        {fieldErrors.phone && (
                          <p className="text-sm text-red-500 mt-1">{fieldErrors.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => {
                        setIsAddDialogOpen(false);
                        resetForm();
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
