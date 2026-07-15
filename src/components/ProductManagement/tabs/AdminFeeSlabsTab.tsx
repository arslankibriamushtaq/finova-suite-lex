import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { usePermissions, PROCESSING_FEE_SLAB_PERMISSIONS } from "../../../hooks/useProductPermissions"

interface FeeSlab {
  id: string
  min_amount: number
  max_amount: number
  min_tenure: number
  max_tenure: number
  profit_percentage: number
  profit_type: "percentage" | "fixed"
  admin_fee: number
  type: "monthly" | "tenure"
  processing_fee: number
  partner_scope: string
  status: "active" | "inactive"
}

interface AdminFeeSlabsTabProps {
  formData: any
  onNext: () => void
  onPrevious: () => void
  addFeeSlab: () => void
  removeFeeSlab: (id: string) => void
  updateFeeSlab: (id: string, field: keyof FeeSlab, value: any) => void
}

export default function AdminFeeSlabsTab({
  formData,
  onNext,
  onPrevious,
  addFeeSlab,
  removeFeeSlab,
  updateFeeSlab,
}: AdminFeeSlabsTabProps) {
  const { t } = useTranslation("productManagement2")
  // TODO: Re-enable when permission API is implemented
  // const { canCreate, canRemove, canUpdate } = usePermissions();
  // const canAddSlab = canCreate(PROCESSING_FEE_SLAB_PERMISSIONS);
  // const canDeleteSlab = canRemove(PROCESSING_FEE_SLAB_PERMISSIONS);
  // const canEditSlab = canUpdate(PROCESSING_FEE_SLAB_PERMISSIONS);
  const canAddSlab = true;
  const canDeleteSlab = true;
  const canEditSlab = true;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("feeSlabs.title")}</CardTitle>
              <p className="mt-2 text-muted-foreground">{t("feeSlabs.subtitle")}</p>
            </div>
            {canAddSlab && (
              <Button onClick={addFeeSlab} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("feeSlabs.addSlab")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {formData.admin_fee_slabs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("feeSlabs.empty")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("feeSlabs.minAmount")}</TableHead>
                  <TableHead>{t("feeSlabs.maxAmount")}</TableHead>
                  <TableHead>{t("feeSlabs.minTenure")}</TableHead>
                  <TableHead>{t("feeSlabs.maxTenure")}</TableHead>
                  <TableHead>{t("feeSlabs.profitPct")}</TableHead>
                  <TableHead>{t("feeSlabs.profitType")}</TableHead>
                  <TableHead>{t("feeSlabs.processingFee")}</TableHead>
                  <TableHead>{t("feeSlabs.adminFee")}</TableHead>
                  <TableHead>{t("feeSlabs.profitCategory")}</TableHead>
                  <TableHead>{t("feeSlabs.partnerScope")}</TableHead>
                  <TableHead>{t("common:status")}</TableHead>
                  <TableHead>{t("common:actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.admin_fee_slabs.map((slab: any) => (
                  <TableRow key={slab.id}>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={slab.min_amount}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value) || 0)
                          updateFeeSlab(slab.id, "min_amount", value)
                        }}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={slab.max_amount}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value) || 0)
                          updateFeeSlab(slab.id, "max_amount", value)
                        }}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={slab.min_tenure !== null && slab.min_tenure !== undefined ? slab.min_tenure : 0}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value) || 0)
                          updateFeeSlab(slab.id, "min_tenure", value)
                        }}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={slab.max_tenure !== null && slab.max_tenure !== undefined ? slab.max_tenure : 0}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value) || 0)
                          updateFeeSlab(slab.id, "max_tenure", value)
                        }}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={slab.profit_percentage}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value) || 0)
                          updateFeeSlab(slab.id, "profit_percentage", value)
                        }}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={slab.profit_type}
                        onValueChange={(value: "percentage" | "fixed") =>
                          updateFeeSlab(slab.id, "profit_type", value)
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">{t("feeSlabs.percentage")}</SelectItem>
                          <SelectItem value="fixed">{t("feeSlabs.fixed")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={slab.processing_fee}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value) || 0)
                          updateFeeSlab(slab.id, "processing_fee", value)
                        }}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={slab.admin_fee}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value) || 0)
                          updateFeeSlab(slab.id, "admin_fee", value)
                        }}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={slab.type}
                        onValueChange={(value: "monthly" | "amount") =>
                          updateFeeSlab(slab.id, "type", value)
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{t("feeSlabs.monthly")}</SelectItem>
                          <SelectItem value="amount">{t("feeSlabs.tenure")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={slab.partner_scope}
                        onValueChange={(value) => updateFeeSlab(slab.id, "partner_scope", value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("feeSlabs.allPartners")}</SelectItem>
                          <SelectItem value="specific">{t("feeSlabs.specificPartners")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={slab.status}
                        onValueChange={(value: "active" | "inactive") =>
                          updateFeeSlab(slab.id, "status", value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">{t("common:active")}</SelectItem>
                          <SelectItem value="inactive">{t("common:inactive")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {canDeleteSlab && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeeSlab(slab.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex justify-between gap-3 pt-4">
        <Button variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("common:previous")}
        </Button>
        <Button onClick={onNext} className="gap-2">
          {t("nav.nextDurationSettings")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

