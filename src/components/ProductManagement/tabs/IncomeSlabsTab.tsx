import { useState, useEffect } from "react"
import { useFormik } from "formik"
import { useTranslation } from "react-i18next"
import { ArrowLeft, ArrowRight, Eye, Pencil, Trash2, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button as UIButton } from "../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Switch } from "../../ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog"
import TableView from "../../TableView/TableView"
import toast from "react-hot-toast"
import { getIncomeSlabByProductId, createIncomeSlab, updateIncomeSlab, deleteIncomeSlab } from "../../../redux/apis/apisCrudProductManagement"

interface IncomeSlabsTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
  onNext: () => void
  onPrevious: () => void
  productId: string | null
}

export default function IncomeSlabsTab({
  formData,
  updateFormData,
  errors,
  onNext,
  onPrevious,
  productId,
}: IncomeSlabsTabProps) {
  const { t } = useTranslation("productManagement2")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalRows, setTotalRows] = useState(0)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [rowToDelete, setRowToDelete] = useState<any>(null)

  const formik = useFormik({
    initialValues: {
      from_income: "",
      to_income: "",
      multiplier_percentage: "",
      status: true,
    },
    validate: (values) => {
      const err: Record<string, string> = {}
      if (!values.from_income) err.from_income = t("incomeSlabs.fromRequired")
      else if (isNaN(Number(values.from_income)) || Number(values.from_income) < 0)
        err.from_income = t("incomeSlabs.fromNumber")
      if (!values.to_income) err.to_income = t("incomeSlabs.toRequired")
      else if (isNaN(Number(values.to_income)) || Number(values.to_income) < 0)
        err.to_income = t("incomeSlabs.toNumber")
      if (!values.multiplier_percentage) err.multiplier_percentage = t("incomeSlabs.multiplierRequired")
      else if (isNaN(Number(values.multiplier_percentage)) || Number(values.multiplier_percentage) < 0)
        err.multiplier_percentage = t("incomeSlabs.multiplierNumber")
      return err
    },
    onSubmit: async (values) => {
      if (!productId) {
        toast.error(t("incomeSlabs.noProductId"))
        return
      }
      const payload = {
        product_id: parseInt(productId),
        from_income: parseFloat(values.from_income),
        to_income: parseFloat(values.to_income),
        multiplier_percentage: parseFloat(values.multiplier_percentage),
        status: values.status ? "active" : "inactive",
      }
      try {
        if (isEditMode && selectedRow) {
          const response = await updateIncomeSlab(selectedRow.id, payload)
          if (response?.data?.message === "success") {
            toast.success(t("incomeSlabs.updated"))
            setShowModal(false)
            fetchIncomeSlabs()
          } else {
            toast.error(response?.data?.message || t("incomeSlabs.updateFailed"))
          }
        } else {
          const response = await createIncomeSlab(payload)
          if (response?.data?.message === "success") {
            toast.success(t("incomeSlabs.created"))
            setShowModal(false)
            fetchIncomeSlabs()
          } else {
            toast.error(response?.data?.message || t("incomeSlabs.createFailed"))
          }
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t("incomeSlabs.saveFailed"))
      }
    },
  })

  const fetchIncomeSlabs = async () => {
    if (!productId) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const response = await getIncomeSlabByProductId(productId)
      if (response?.data?.message === "success" && response?.data?.data) {
        const responseData = response.data.data
        setData(responseData.data || [])
        setTotalRows(responseData.total || 0)
        setFrom(responseData.from || 0)
        setTo(responseData.to || 0)
        setPage(responseData.current_page || page)
        setTotalPage(responseData.last_page || 1)
      }
    } catch (error: any) {
      console.error("Error fetching income slabs:", error)
      toast.error(error?.response?.data?.message || t("incomeSlabs.fetchFailed"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchIncomeSlabs()
    }
  }, [page, pageSize, productId])

  const handleAdd = () => {
    setIsEditMode(false)
    setIsViewMode(false)
    setSelectedRow(null)
    formik.resetForm()
    formik.setValues({ from_income: "", to_income: "", multiplier_percentage: "", status: true })
    setShowModal(true)
  }

  const handleEdit = (row: any) => {
    setIsEditMode(true)
    setIsViewMode(false)
    setSelectedRow(row)
    formik.setValues({
      from_income: String(row.from_income ?? ""),
      to_income: String(row.to_income ?? ""),
      multiplier_percentage: String(row.multiplier_percentage ?? ""),
      status: row.status === "active",
    })
    setShowModal(true)
  }

  const handleView = (row: any) => {
    setIsEditMode(false)
    setIsViewMode(true)
    setSelectedRow(row)
    formik.setValues({
      from_income: String(row.from_income ?? ""),
      to_income: String(row.to_income ?? ""),
      multiplier_percentage: String(row.multiplier_percentage ?? ""),
      status: row.status === "active",
    })
    setShowModal(true)
  }

  const handleDelete = async (row: any) => {
    try {
      const response = await deleteIncomeSlab(row.id)
      if (response?.data?.message === "success") {
        toast.success(t("incomeSlabs.deleted"))
        fetchIncomeSlabs()
      } else {
        toast.error(response?.data?.message || t("incomeSlabs.deleteFailed"))
      }
    } catch (error: any) {
      console.error("Error deleting income slab:", error)
      toast.error(error?.response?.data?.message || t("incomeSlabs.deleteFailed"))
    }
  }

  const handleMenuClick = (action: string, row: any) => {
    switch (action) {
      case "view":
        handleView(row)
        break
      case "edit":
        handleEdit(row)
        break
      case "delete":
        setRowToDelete(row)
        setDeleteConfirmOpen(true)
        break
    }
  }

  const handleDeleteConfirm = async () => {
    if (rowToDelete) {
      await handleDelete(rowToDelete)
      setRowToDelete(null)
      setDeleteConfirmOpen(false)
    }
  }

  const tableHeaders = [
    {
      name: t("incomeSlabs.srNo"),
      selector: (row: any) => row.srNo,
      sortable: true,
      width: "100px",
    },
    {
      name: t("incomeSlabs.fromIncome"),
      selector: (row: any) => row.from_income || "-",
      sortable: true,
    },
    {
      name: t("incomeSlabs.toIncome"),
      selector: (row: any) => row.to_income || "-",
      sortable: true,
    },
    {
      name: t("incomeSlabs.multiplier"),
      selector: (row: any) => row.multiplier_percentage || "-",
      sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor: row.status === "active" ? "var(--chart-2)" : "var(--destructive)",
            color: "var(--primary-foreground)",
            display: "inline-block",
            textTransform: "capitalize",
          }}
        >
          {row.status || "inactive"}
        </span>
      ),
      sortable: true,
    },
    {
      name: t("common:actions"),
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UIButton className="gradient-btn bg-red-600 text-foreground border border-primary-foreground rounded-lg py-2.5 px-5">
              {t("common:select")} <ChevronDown className="h-4 w-4" />
            </UIButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleMenuClick("view", row)}>
              <Eye className="h-4 w-4" />
              {t("common:view")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleMenuClick("edit", row)}>
              <Pencil className="h-4 w-4" />
              {t("common:edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => handleMenuClick("delete", row)}
            >
              <Trash2 className="h-4 w-4" />
              {t("common:delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const mappedData = data?.map((item: any, index: number) => ({
    id: item.id,
    srNo: (page - 1) * pageSize + index + 1,
    from_income: item.from_income,
    to_income: item.to_income,
    multiplier_percentage: item.multiplier_percentage,
    status: item.status,
  })) || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t("incomeSlabs.title")}</CardTitle>
              <p className="text-muted-foreground">
                {t("incomeSlabs.subtitle")}
              </p>
            </div>
            <button className="theme-btn-next" onClick={handleAdd}>
              {t("incomeSlabs.addSlab")}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <TableView
            header={tableHeaders}
            data={mappedData}
            totalRows={totalRows}
            isLoading={loading}
            from={from}
            page={page}
            totalPage={totalPage}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            to={to}
          />
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={(open) => {
        if (!open) {
          setShowModal(false)
          formik.resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? t("incomeSlabs.viewTitle") : isEditMode ? t("incomeSlabs.editTitle") : t("incomeSlabs.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_income">{t("incomeSlabs.fromIncome")}</Label>
                <Input
                  id="from_income"
                  type="number"
                  step="0.01"
                  placeholder={t("incomeSlabs.fromIncomePlaceholder")}
                  value={formik.values.from_income}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewMode}
                />
                {formik.touched.from_income && formik.errors.from_income && (
                  <p className="text-sm text-destructive">{formik.errors.from_income}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_income">{t("incomeSlabs.toIncome")}</Label>
                <Input
                  id="to_income"
                  type="number"
                  step="0.01"
                  placeholder={t("incomeSlabs.toIncomePlaceholder")}
                  value={formik.values.to_income}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewMode}
                />
                {formik.touched.to_income && formik.errors.to_income && (
                  <p className="text-sm text-destructive">{formik.errors.to_income}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="multiplier_percentage">{t("incomeSlabs.multiplier")}</Label>
                <Input
                  id="multiplier_percentage"
                  type="number"
                  step="0.01"
                  placeholder={t("incomeSlabs.multiplierPlaceholder")}
                  value={formik.values.multiplier_percentage}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewMode}
                />
                {formik.touched.multiplier_percentage && formik.errors.multiplier_percentage && (
                  <p className="text-sm text-destructive">{formik.errors.multiplier_percentage}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t("common:status")}</Label>
                <div className="pt-2">
                  <Switch
                    id="status"
                    checked={formik.values.status}
                    onCheckedChange={(checked) => formik.setFieldValue("status", checked)}
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <UIButton
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false)
                  formik.resetForm()
                }}
              >
                {isViewMode ? t("common:close") : t("common:cancel")}
              </UIButton>
              {!isViewMode && (
                <UIButton type="submit">
                  {isEditMode ? t("common:update") : t("common:add")}
                </UIButton>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("incomeSlabs.deleteTitle")}</AlertDialogTitle>
            <p className="text-sm text-muted-foreground">{t("incomeSlabs.deleteMessage")}</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common:no")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t("common:yes")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tab Navigation */}
      <div className="flex justify-between gap-3 pt-4">
        <UIButton variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("common:previous")}
        </UIButton>
        <UIButton onClick={onNext} className="gap-2">
          {t("nav.nextDurationSettings")}
          <ArrowRight className="h-4 w-4" />
        </UIButton>
      </div>
    </div>
  )
}

