"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useRouter, useSearchParams } from "../../lib/router"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  FileText,
  Package,
  X,
} from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import ProductCreateEditTabs from "./ProductCreateEditTabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useLanguage } from "../../hooks/use-language"
import { addProductDocument, editProductDocument, removeProductDocument, getProductById } from "../../redux/apis/apisCrudProductManagement"
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
  const { t } = useTranslation("productManagement2")
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
  const initialDocumentForm = {
    nameEn: "",
    nameAr: "",
    documentType: "TEMPLATE",
    fileUrl: null as string | null,
    fileSizeBytes: null as number | null,
    fileVersion: "v1",
    createdByName: "Admin",
    required: true,
  }
  const [documentForm, setDocumentForm] = useState(initialDocumentForm)
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
      toast.error(t("createDocs.startFromBasicInfo"))
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
      const response = await getProductById(id)
      if (response?.data?.message === "success") {
        const documentsData = response?.data?.data?.documents || response?.data?.data || []
        const list = Array.isArray(documentsData) ? documentsData : []
        setData(list)
        setTotalRows(list.length || 0)
        setFrom(1)
        setTo(list.length || 0)
        setPage(1)
        setTotalPage(Math.ceil(list.length / pageSize) || 1)
      } else {
        toast.error(response?.data?.message || t("createDocs.fetchFailed"))
      }
    } catch (error: any) {
      console.error("Error fetching documents:", error)
      toast.error(error?.response?.data?.message || t("createDocs.fetchFailed"))
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
    setDocumentForm(initialDocumentForm)
    setDocumentErrors({})
    setIsDocumentDialogOpen(true)
  }

  const handleAddDocument = async () => {
    if (!productId) {
      toast.error(t("requiredDoc.productIdNotFound"))
      return
    }
    if (!documentForm.nameEn?.trim() || !documentForm.nameAr?.trim()) {
      toast.error(t("requiredDoc.fillNames"))
      return
    }
    try {
      setIsLoading(true)
      setDocumentErrors({})
      const body = {
        nameEn: documentForm.nameEn.trim(),
        nameAr: documentForm.nameAr.trim(),
        documentType: documentForm.documentType,
        fileUrl: documentForm.fileUrl,
        fileSizeBytes: documentForm.fileSizeBytes,
        fileVersion: documentForm.fileVersion,
        required: documentForm.required,
      }

      const response = editingDocument
        ? await editProductDocument(productId, String(editingDocument.id), body)
        : await addProductDocument(productId, body)

      if (response?.data?.message === "success") {
        toast.success(editingDocument ? t("createDocs.updated") : t("createDocs.added"))
        setIsDocumentDialogOpen(false)
        setEditingDocument(null)
        setDocumentForm(initialDocumentForm)
        getDocumentsData(productId)
      } else {
        toast.error(response?.data?.message || (editingDocument ? t("createDocs.updateFailed") : t("createDocs.addFailed")))
      }
    } catch (error: any) {
      const errors = error?.response?.data?.errors || {}
      const errMap: Record<string, string> = {}
      Object.keys(errors).forEach((key) => {
        errMap[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key]
      })
      if (Object.keys(errMap).length > 0) {
        setDocumentErrors(errMap)
        toast.error(Object.values(errMap)[0])
      } else {
        toast.error(error?.response?.data?.message || (editingDocument ? t("createDocs.updateFailed") : t("createDocs.addFailed")))
      }
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

  const openUpdateDialog = (row: any) => {
    setEditingDocument(row)
    setDocumentForm({
      nameEn: row.nameEn || "",
      nameAr: row.nameAr || "",
      documentType: row.documentType || "TEMPLATE",
      fileUrl: row.fileUrl || null,
      fileSizeBytes: row.fileSizeBytes || null,
      fileVersion: row.fileVersion || "v1",
      createdByName: row.createdByName || "Admin",
      required: !!row.required,
    })
    setDocumentErrors({})
    setIsDocumentDialogOpen(true)
  }

  const handleSaveDocument = () => {
    handleAddDocument()
  }

  const Documents_Header = [
    {
      name: t("requiredDoc.nameEn"),
      selector: (row: any) => row.nameEn || "-",
      sortable: true,
      // width: "200px",
    },
    {
      name: t("requiredDoc.nameAr"),
      selector: (row: any) => row.nameAr || "-",
      sortable: true,
      // width: "200px",
    },
    {
      name: t("requiredDoc.documentType"),
      selector: (row: any) => row.documentType || "-",
      sortable: true,
      // width: "130px",
    },
    {
      name: t("requiredDoc.version"),
      selector: (row: any) => row.fileVersion || "-",
      sortable: true,
      // width: "90px",
    },
    {
      name: t("requiredDoc.createdBy"),
      selector: (row: any) => row.createdByName || "-",
      sortable: true,
      // width: "130px",
    },
    {
      name: t("requiredDoc.required"),
      cell: (row: any) => (
        <span className={row.required ? "text-green-600 font-medium" : "text-muted-foreground"}>
          {row.required ? t("common:yes") : t("common:no")}
        </span>
      ),
      // width: "100px",
    },
    {
      name: t("createDocs.actionHeader"),
      cell: (row: any) => (
        <div
          className="relative inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("list.select")}
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
                {t("common:update")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      // width: "120px",
    },
  ]

  const mappedData =
    data &&
    data?.map((item: any) => ({
      id: item?.id,
      nameEn: item?.nameEn || item?.name_en || item?.name || "-",
      nameAr: item?.nameAr || item?.name_ar || "-",
      documentType: item?.documentType || item?.type || "-",
      fileUrl: item?.fileUrl,
      fileSizeBytes: item?.fileSizeBytes,
      fileVersion: item?.fileVersion || "-",
      createdByName: item?.createdByName || item?.created_by || "-",
      required: item?.required ?? true,
    }))

  return (
    <div className="min-h-screen bg-background pm-create-page">
      {/* Header with tabs (no steps / progress) */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="px-3 py-3">
          <div className="max-w-8xl mx-auto">
            <div className={`flex items-center justify-between mb-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                <Button variant="ghost" size="sm" onClick={() => router.push("/Los/ProductManagement")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("createCategories.backToProducts")}
                </Button>
              </div>
            </div>
            <h1 className="text-xl font-semibold mb-4 flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                <Package className="h-4 w-4" />
              </span>
              {t("createDocs.editProduct")}
            </h1>
            <ProductCreateEditTabs
              activeTab="required-documents"
              productId={productIdForTabs}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 py-4">
        <div className="max-w-8xl mx-auto">
          <Card className="pro-card-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("createDocs.documentManagement")}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {t("createDocs.documentManagementDesc")}
                  </p>
                </div>
                <Button className="gap-2" onClick={openAddDialog}>
                  <Plus className="h-4 w-4" />
                  {t("requiredDoc.addDocument")}
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
                        {editingDocument ? t("requiredDoc.editDocument") : t("requiredDoc.addDocument")}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-6 py-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">{t("requiredDoc.nameEn")}</Label>
                        <Input
                          value={documentForm.nameEn}
                          onChange={(e) => setDocumentFormField("nameEn", e.target.value)}
                          placeholder={t("requiredDoc.nameEnPlaceholder")}
                          className={`h-10 ${documentErrors.nameEn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {documentErrors.nameEn && (
                          <p className="text-xs text-red-500 mt-1">{documentErrors.nameEn}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground" style={{ textAlign: "right", display: "block" }}>{t("requiredDoc.nameAr")}</Label>
                        <Input
                          value={documentForm.nameAr}
                          onChange={(e) => setDocumentFormField("nameAr", e.target.value)}
                          placeholder={t("requiredDoc.nameArPlaceholder")}
                          dir="rtl"
                          className={`h-10 ${documentErrors.nameAr ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                        {documentErrors.nameAr && (
                          <p className="text-xs text-red-500 mt-1" dir="rtl">{documentErrors.nameAr}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">{t("requiredDoc.documentType")}</Label>
                        <Select
                          value={documentForm.documentType}
                          onValueChange={(value: string) => setDocumentFormField("documentType", value)}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={t("requiredDoc.selectType")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEMPLATE">{t("requiredDoc.typeTemplate")}</SelectItem>
                            <SelectItem value="UPLOAD">{t("requiredDoc.typeUpload")}</SelectItem>
                            <SelectItem value="GENERATED">{t("requiredDoc.typeGenerated")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">{t("requiredDoc.fileVersion")}</Label>
                        <Input
                          value={documentForm.fileVersion}
                          onChange={(e) => setDocumentFormField("fileVersion", e.target.value)}
                          placeholder={t("requiredDoc.fileVersionPlaceholder")}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">{t("requiredDoc.createdBy")}</Label>
                        <Input
                          value={documentForm.createdByName}
                          onChange={(e) => setDocumentFormField("createdByName", e.target.value)}
                          placeholder={t("requiredDoc.createdByPlaceholder")}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">{t("requiredDoc.required")}</Label>
                        <div className="flex items-center h-10 gap-2">
                          <Switch
                            checked={documentForm.required}
                            onCheckedChange={(checked) => setDocumentFormField("required", checked)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {documentForm.required ? t("common:yes") : t("common:no")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
                      <Button
                        variant="outline"
                        onClick={() => { setIsDocumentDialogOpen(false); setEditingDocument(null); setDocumentErrors({}); setDocumentForm(initialDocumentForm) }}
                        className="min-w-[80px]"
                      >
                        {t("common:cancel")}
                      </Button>
                      <Button onClick={handleSaveDocument} disabled={isLoading} className="min-w-[80px]">
                        {isLoading ? t("creditScoring.saving") : t("common:save")}
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
                  {t("createDocs.requiredCount", { count: data.filter((doc: any) => doc.required === true || doc.required === 1).length })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("createDocs.requiredNote")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-card sticky bottom-0">
        <div className="px-3 py-3">
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
                <Button variant="outline" onClick={() => router.push("/products/create")} className="gap-2">
                  <X className="h-4 w-4" />
                  {t("common:cancel")}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handlePrevious} className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  {t("common:previous")}
                </Button>
                <Button onClick={handleFinish} disabled={isLoading} className="gap-2">
                  {isLoading ? t("createDocs.creatingProduct") : t("createDocs.createProduct")}
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
