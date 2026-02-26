"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "../../lib/router"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  FileText,
} from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import ProductCreateEditTabs from "./ProductCreateEditTabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useLanguage } from "../../hooks/use-language"
import { getProductDocuments, storeProductDocuments, updateProductDocument } from "../../redux/apis/apisCrudProductManagement"
import TableView from "../TableView/TableView"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Switch } from "../ui/switch"
import { ChevronDown, Pencil } from "lucide-react"
import toast from "react-hot-toast"


export default function CreateRequiredDocuments() {
  const { isRTL } = useLanguage()
  const router = useRouter()
  const [searchParams] = useSearchParams()
  const productIdFromUrl = searchParams.get("id")
  const [productId, setProductId] = useState<string | null>(productIdFromUrl || sessionStorage.getItem("productId"))
  const [data, setData] = useState<any>([])
  const [skelitonLoading, setSkelitonLoading] = useState(false)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [totalRows, setTotalRows] = useState(0)
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<any>(null)
  const [documentForm, setDocumentForm] = useState({
    name: "",
    type: "PDF",
    category: "Request",
    step_no: 1,
    status: 0,
  })
  const [documentErrors, setDocumentErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const productIdForTabs = productId || productIdFromUrl || sessionStorage.getItem("productId")

  useEffect(() => {
    const effectiveProductId = productIdFromUrl || sessionStorage.getItem("productId")
    if (effectiveProductId) {
      setProductId(effectiveProductId)
      sessionStorage.setItem("productId", effectiveProductId)
      getDocumentsData(effectiveProductId)
    } else {
      toast.error("Product ID not found. Please start from Basic Information.")
      router.push("/Los/ProductManagement/Create/BasicInfo")
    }
  }, [productIdFromUrl])

  useEffect(() => {
    if (productId && page) {
      getDocumentsData(productId)
    }
  }, [page, pageSize, productId])

  const getDocumentsData = async (id: string) => {
    setSkelitonLoading(true)
    try {
      const response = await getProductDocuments(id)
      if (response?.data?.success) {
        const documentsData = response?.data?.data?.data || []
        setData(documentsData)
        setTotalRows(documentsData.length || 0)
        setFrom(1)
        setTo(documentsData.length || 0)
        setPage(1)
        setTotalPage(Math.ceil(documentsData.length / pageSize) || 1)
      } else {
        toast.error(response?.data?.message || "Failed to fetch documents")
      }
    } catch (error: any) {
      console.error("Error fetching documents:", error)
      toast.error(error?.response?.data?.message || "Failed to fetch documents")
    } finally {
      setSkelitonLoading(false)
    }
  }

  const setDocumentFormField = (field: string, value: any) => {
    setDocumentForm((prev) => ({ ...prev, [field]: value }))
    if (documentErrors[field]) {
      setDocumentErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const openAddDialog = () => {
    setEditingDocument(null)
    setDocumentForm({ name: "", type: "PDF", category: "Request", step_no: 1, status: 0 })
    setDocumentErrors({})
    setIsDocumentDialogOpen(true)
  }

  const handleAddDocument = async () => {
    if (!productId) {
      toast.error("Product ID not found")
      return
    }
    if (!documentForm.name?.trim()) {
      setDocumentErrors((prev) => ({ ...prev, name: "Document name is required" }))
      toast.error("Document name is required")
      return
    }
    try {
      setIsLoading(true)
      setDocumentErrors({})
      const submitData = {
        category: documentForm.category,
        product_id: parseInt(productId, 10),
        name: documentForm.name.trim(),
        type: documentForm.type || "PDF",
        status: documentForm.status,
        step_no: documentForm.step_no,
      }
      const response = await storeProductDocuments(submitData)
      if (response?.data?.success) {
        toast.success(response?.data?.message || "Document added successfully")
        setIsDocumentDialogOpen(false)
        setEditingDocument(null)
        setDocumentForm({ name: "", type: "PDF", category: "Request", step_no: 1, status: 0 })
        getDocumentsData(productId)
      } else {
        const errors = response?.data?.errors || {}
        const errMap: Record<string, string> = {}
        Object.keys(errors).forEach((key) => {
          errMap[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key]
        })
        if (errMap.name && !errMap.name_en) errMap.name_en = errMap.name
        setDocumentErrors(errMap)
        toast.error(response?.data?.message || "Failed to add document")
      }
    } catch (error: any) {
      const errors = error?.response?.data?.errors || {}
      const errMap: Record<string, string> = {}
      Object.keys(errors).forEach((key) => {
        errMap[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key]
      })
      if (errMap.name && !errMap.name_en) errMap.name_en = errMap.name
      setDocumentErrors(errMap)
      toast.error(error?.response?.data?.message || "Failed to add document")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/Los/ProductManagement")
    }, 500)
  }

  const handlePrevious = () => {
    router.push("/Los/ProductManagement/Create/ProductAffiliation")
  }

  const normalizeType = (t: string) => {
    if (!t) return "PDF"
    const u = (t || "").toLowerCase()
    if (u === "image") return "Image"
    if (u === "pdf") return "PDF"
    if (u === "doc") return "DOC"
    return t
  }

  const openUpdateDialog = (row: any) => {
    setEditingDocument(row)
    setDocumentForm({
      name: row.name || row.name_en || "",
      type: normalizeType(row.type || "PDF"),
      category: row.category || "Request",
      step_no: typeof row.step_no === "number" ? row.step_no : parseInt(String(row.step_no), 10) || 1,
      status: row.status ?? 0,
    })
    setDocumentErrors({})
    setIsDocumentDialogOpen(true)
  }

  const handleUpdateDocument = async () => {
    if (!editingDocument?.id || !productId) {
      toast.error("Document or product ID not found")
      return
    }
    if (!documentForm.name?.trim()) {
      setDocumentErrors((prev) => ({ ...prev, name: "Document name is required" }))
      toast.error("Document name is required")
      return
    }
    try {
      setIsLoading(true)
      setDocumentErrors({})
      const payload = {
        category: documentForm.category,
        product_id: parseInt(productId, 10),
        name: documentForm.name.trim(),
        type: documentForm.type || "PDF",
        status: documentForm.status,
        step_no: documentForm.step_no,
      }
      const response = await updateProductDocument(String(editingDocument.id), payload)
      if (response?.data?.success) {
        toast.success(response?.data?.message || "Document updated successfully")
        setIsDocumentDialogOpen(false)
        setEditingDocument(null)
        getDocumentsData(productId)
      } else {
        const errors = response?.data?.errors || {}
        const errMap: Record<string, string> = {}
        Object.keys(errors).forEach((key) => {
          errMap[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key]
        })
        setDocumentErrors(errMap)
        toast.error(response?.data?.message || "Failed to update document")
      }
    } catch (error: any) {
      const errors = error?.response?.data?.errors || {}
      const errMap: Record<string, string> = {}
      Object.keys(errors).forEach((key) => {
        errMap[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key]
      })
      setDocumentErrors(errMap)
      toast.error(error?.response?.data?.message || "Failed to update document")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDocument = () => {
    if (editingDocument) {
      handleUpdateDocument()
    } else {
      handleAddDocument()
    }
  }

  const formatCreationDate = (dateStr: any) => {
    if (!dateStr) return "-"
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  }

  const handleSaveDraft = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/")
    }, 1000)
  }

  const Documents_Header = [
    {
      name: "Name",
      selector: (row: any) => row.name || row.name_en || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Type",
      selector: (row: any) => row.type || "-",
      sortable: true,
      width: "100px",
    },
    {
      name: "Category",
      selector: (row: any) => row.category || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Step No",
      selector: (row: any) => row.step_no ?? "-",
      sortable: true,
      width: "90px",
    },
    {
      name: "Created By",
      selector: (row: any) => row.created_by || row.created_by_name || "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "Creation Date",
      selector: (row: any) => formatCreationDate(row.created_at),
      sortable: true,
      // width: "140px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span className={row.status === true ? "text-green-600 font-medium" : "text-muted-foreground"}>
          {row.status === true ? "Active" : "Inactive"}
        </span>
      ),
      width: "100px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <div
          className="relative z-10 inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Select
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  openUpdateDialog(row)
                }}
              >
                <Pencil className="h-4 w-4" />
                Update
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ]

  const mappedData =
    data &&
    data?.map((item: any) => ({
      id: item?.id,
      name: item?.name || item?.name_en,
      name_en: item?.name_en || item?.name,
      name_ar: item?.name_ar,
      type: item?.type || "-",
      category: item?.category || "-",
      step_no: item?.step_no,
      created_by: item?.created_by || item?.created_by_name,
      created_at: item?.created_at,
      status: item?.status ?? 0,
      is_required: item?.is_required ?? 0,
      notes: item?.notes,
    }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header with tabs (no steps / progress) */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="max-w-8xl mx-auto">
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
              activeTab="required-documents"
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
                    <FileText className="h-5 w-5" />
                    Document Management
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Configure required documents and templates for this product.
                  </p>
                </div>
                <Button className="gap-2" onClick={openAddDialog}>
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
                <Dialog open={isDocumentDialogOpen} onOpenChange={(open) => {
                  if (!open) {
                    setIsDocumentDialogOpen(false)
                    setEditingDocument(null)
                    setDocumentErrors({})
                  } else {
                    setIsDocumentDialogOpen(open)
                  }
                }}>
                  <DialogContent className="max-w-md rounded-xl border border-border/50 shadow-lg p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
                      <DialogTitle className="text-lg font-semibold">
                        {editingDocument ? "Edit Document" : "Add Document"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-6 py-5">
                      <div className="sm:col-span-2 space-y-2">
                        <Label className="text-sm font-medium text-foreground">Document Name</Label>
                        <Input
                          value={documentForm.name}
                          onChange={(e) => setDocumentFormField("name", e.target.value)}
                          placeholder="Enter document name"
                          className={`h-10 ${documentErrors.name || documentErrors.name_en ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {(documentErrors.name || documentErrors.name_en) && (
                          <p className="text-xs text-red-500 mt-1">{documentErrors.name || documentErrors.name_en}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Document Type</Label>
                        <Select
                          value={documentForm.type}
                          onValueChange={(value: string) => setDocumentFormField("type", value)}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Image">Image</SelectItem>
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="DOC">DOC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Document Category</Label>
                        <Select
                          value={documentForm.category}
                          onValueChange={(value: string) => setDocumentFormField("category", value)}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Request">Request</SelectItem>
                            <SelectItem value="Upload">Upload</SelectItem>
                            <SelectItem value="Required">Required</SelectItem>
                            <SelectItem value="Application Form">Application Form</SelectItem>
                          </SelectContent>
                        </Select>
                        {documentErrors.category && <p className="text-xs text-red-500 mt-1">{documentErrors.category}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Step Number</Label>
                        <Input
                          type="number"
                          min={1}
                          value={documentForm.step_no}
                          onChange={(e) => setDocumentFormField("step_no", parseInt(e.target.value, 10) || 1)}
                          placeholder="e.g. 1"
                          className={`h-10 ${documentErrors.step_no ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {documentErrors.step_no && <p className="text-xs text-red-500 mt-1">{documentErrors.step_no}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Status</Label>
                        <div className="flex items-center h-10 gap-2">
                          <Switch
                            checked={documentForm.status === 1}
                            onCheckedChange={(checked) => setDocumentFormField("status", checked ? 1 : 0)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {documentForm.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
                      <Button
                        variant="outline"
                        onClick={() => { setIsDocumentDialogOpen(false); setEditingDocument(null); setDocumentErrors({}) }}
                        className="min-w-[80px]"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveDocument} disabled={isLoading} className="min-w-[80px]">
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <TableView
                header={Documents_Header}
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

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  {data.filter((doc: any) => doc.is_required === 1).length} required document(s) configured for this product
                </p>
                <p className="text-xs text-muted-foreground">
                  Required documents will be automatically requested from customers during the application process.
                </p>
              </div>
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
                <Button onClick={handleFinish} disabled={isLoading} className="gap-2">
                  {isLoading ? "Creating Product..." : "Create Product"}
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
