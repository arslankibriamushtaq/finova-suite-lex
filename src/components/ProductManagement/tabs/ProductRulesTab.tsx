import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Select as AntSelect, Checkbox } from "antd"
import { Switch } from "../../ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { getCountries } from "../../../redux/apis/apisCrud"
import { getSelectedNationalities } from "../../../redux/apis/apisCrudProductManagement"

interface ProductRulesTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
  onNext: () => void
 
  productId?: string | null
}

export default function ProductRulesTab({
  formData,
  updateFormData,
  errors,
  onNext,

  productId,
}: ProductRulesTabProps) {
  const { t } = useTranslation("productManagement2")
  const [countries, setCountries] = useState<any[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePages, setHasMorePages] = useState(true)
  const [allCountriesLoaded, setAllCountriesLoaded] = useState(false)
  const [isLoadingAllCountries, setIsLoadingAllCountries] = useState(false)

  // Initialize cooling_off array if it doesn't exist
  useEffect(() => {
    if (!formData.cooling_off || !Array.isArray(formData.cooling_off)) {
      updateFormData("cooling_off", [])
    }
  }, [])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true)
        const response = await getCountries(1, 100)
        if (response?.data?.success && response?.data?.data?.data) {
          setCountries(response.data.data.data || [])
          const totalPages = response.data.data.last_page || 1
          setHasMorePages(1 < totalPages)
          setCurrentPage(1)
        }
      } catch (error) {
        console.error("Error fetching countries:", error)
      } finally {
        setIsLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

  // Fetch selected nationalities for edit flow
  useEffect(() => {
    const fetchSelectedNationalities = async () => {
      if (!productId) return // Only fetch in edit mode
      
      try {
        const response = await getSelectedNationalities(productId)
        if (response?.data?.message === "success" && response?.data?.data) {
          // Extract nationality IDs from the nationalities array
          const nationalities = response.data.data.nationalities || []
          // Convert to strings to match the dropdown value format
          const selectedIds = nationalities.map((nationality: any) => String(nationality.id))
          updateFormData("eligible_nationalities", selectedIds)
        }
      } catch (error) {
        console.error("Error fetching selected nationalities:", error)
      }
    }

    fetchSelectedNationalities()
  }, [productId])

  const fetchAllCountries = async () => {
    if (allCountriesLoaded || isLoadingAllCountries) return

    try {
      setIsLoadingAllCountries(true)
      let page = currentPage
      let hasMore = hasMorePages
      let allCountries = [...countries]

      // Fetch all remaining pages
      while (hasMore) {
        const nextPage = page + 1
        const response = await getCountries(nextPage, 100)
        if (response?.data?.success && response?.data?.data?.data) {
          const newCountries = response.data.data.data || []
          allCountries = [...allCountries, ...newCountries]
          const totalPages = response.data.data.last_page || 1
          hasMore = nextPage < totalPages
          page = nextPage
        } else {
          hasMore = false
        }
      }

      setCountries(allCountries)
      setHasMorePages(false)
      setCurrentPage(page)
      setAllCountriesLoaded(true)
    } catch (error) {
      console.error("Error fetching all countries:", error)
    } finally {
      setIsLoadingAllCountries(false)
    }
  }

  const handleDropdownVisibleChange = (open: boolean) => {
    if (open && !allCountriesLoaded && !isLoadingAllCountries) {
      fetchAllCountries()
    }
  }

  const addCoolingOffEntry = () => {
    const currentCoolingOff = Array.isArray(formData.cooling_off) ? formData.cooling_off : []
    const newEntry = {
      id: Date.now().toString(),
      loan_type: "",
      loan_days: 0
    }
    updateFormData("cooling_off", [...currentCoolingOff, newEntry])
  }

  const removeCoolingOffEntry = (id: string) => {
    const currentCoolingOff = Array.isArray(formData.cooling_off) ? formData.cooling_off : []
    updateFormData("cooling_off", currentCoolingOff.filter((entry: any) => entry.id !== id))
  }

  const updateCoolingOffEntry = (id: string, field: "loan_type" | "loan_days", value: any) => {
    const currentCoolingOff = Array.isArray(formData.cooling_off) ? formData.cooling_off : []
    const updated = currentCoolingOff.map((entry: any) => 
      entry.id === id ? { ...entry, [field]: value } : entry
    )
    updateFormData("cooling_off", updated)
  }

  // Check if all countries are selected
  const allCountryIds = countries.map((c: any) => String(c.id))
  const selectedNationalities = Array.isArray(formData.eligible_nationalities) 
    ? formData.eligible_nationalities 
    : (formData.eligible_nationalities ? [formData.eligible_nationalities] : [])
  const isAllSelected = countries.length > 0 && 
    selectedNationalities.length === allCountryIds.length &&
    allCountryIds.every((id: string) => selectedNationalities.includes(id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      updateFormData("eligible_nationalities", allCountryIds)
    } else {
      updateFormData("eligible_nationalities", [])
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("productRules.title")}</CardTitle>
          <p className="text-muted-foreground">
            {t("productRules.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("productRules.maxOutstanding")}</Label>
              <Input
                type="number"
                placeholder={t("productRules.maxOutstandingPlaceholder")}
                value={formData.max_outstanding_balance}
                onChange={(e) => updateFormData("max_outstanding_balance", Number(e.target.value))}
                className={errors.max_outstanding_balance ? "border-destructive" : ""}
              />
              {errors.max_outstanding_balance && (
                <p className="text-sm text-destructive">{errors.max_outstanding_balance}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.maxOutstandingHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("productRules.ageAtMaturity")}</Label>
              <Input
                type="number"
                placeholder={t("productRules.ageAtMaturityPlaceholder")}
                value={formData.age_at_maturity}
                onChange={(e) => updateFormData("age_at_maturity", Number(e.target.value))}
                className={errors.age_at_maturity ? "border-destructive" : ""}
              />
              {errors.age_at_maturity && (
                <p className="text-sm text-destructive">{errors.age_at_maturity}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.ageAtMaturityHint")}</p>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t("productRules.coolingOffPeriod")}</Label>
                <Button type="button" onClick={addCoolingOffEntry} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                 {t("productRules.coolingPeriodBtn")}
                </Button>
              </div>

              {(!formData.cooling_off || formData.cooling_off.length === 0) ? (
                <div className="text-center py-4 text-muted-foreground border border-dashed rounded-md">
                  <p>{t("productRules.coolingEmpty")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.cooling_off.map((entry: any, index: number) => (
                    <div key={entry.id || index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-md">
                      <div className="space-y-2">
                        <Label>{t("productRules.coolingType")}</Label>
                        <AntSelect
                          style={{ width: "100%" }}
                          placeholder={t("productRules.selectLoanType")}
                          value={entry.loan_type || undefined}
                          onChange={(value) => updateCoolingOffEntry(entry.id, "loan_type", value)}
                        >
                          <AntSelect.Option value="1st">{t("productRules.afterFirstLoan")} </AntSelect.Option>
                          <AntSelect.Option value="2nd">{t("productRules.afterSecondLoan")}</AntSelect.Option>
                          <AntSelect.Option value="3rd">{t("productRules.afterThirdLoan")}</AntSelect.Option>
                        </AntSelect>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("productRules.coolingDays")}</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder={t("productRules.enterLoanDays")}
                          value={entry.loan_days || 0}
                          onChange={(e) => {
                            const value = Math.max(0, Number(e.target.value) || 0)
                            updateCoolingOffEntry(entry.id, "loan_days", value)
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCoolingOffEntry(entry.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.coolingHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("productRules.maxInternalPayable")}</Label>
              <Input
                type="number"
                placeholder={t("productRules.maxInternalPayablePlaceholder")}
                value={formData.max_internal_payable_amount ?? ""}
                onChange={(e) =>
                  updateFormData(
                    "max_internal_payable_amount",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                className={errors.max_internal_payable_amount ? "border-destructive" : ""}
              />
              {errors.max_internal_payable_amount && (
                <p className="text-sm text-destructive">{errors.max_internal_payable_amount}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("productRules.maxInternalPayableHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("productRules.simahCoolingPeriod")}</Label>
              <Input
                type="number"
                min="0"
                placeholder={t("productRules.simahCoolingPlaceholder")}
                value={formData.simah_cooling_off_days ?? ""}
                onChange={(e) =>
                  updateFormData(
                    "simah_cooling_off_days",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                className={errors.simah_cooling_off_days ? "border-destructive" : ""}
              />
              {errors.simah_cooling_off_days && (
                <p className="text-sm text-destructive">{errors.simah_cooling_off_days}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("productRules.simahCoolingHint")}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("productRules.eligibleNationalities")}</Label>
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={isLoadingCountries || countries.length === 0}
                >
                  {t("common:selectAll")}
                </Checkbox>
              </div>
              <AntSelect
                mode="multiple"
                style={{ width: "100%" }}
                placeholder={t("productRules.selectNationalities")}
                value={selectedNationalities}
                onChange={(value) => {
                  updateFormData("eligible_nationalities", value)
                }}
                disabled={isLoadingCountries}
                loading={isLoadingCountries || isLoadingAllCountries}
                showSearch
                onDropdownVisibleChange={handleDropdownVisibleChange}
                filterOption={(input, option) => {
                  const searchText = input.toLowerCase().trim()
                  if (!searchText) return true
                  
                  // Get the country name from the option
                  const countryName = typeof option?.children === 'string' 
                    ? option.children 
                    : (option?.children as any)?.props?.children || ''
                  
                  // Also check if we can get it from the countries array
                  const countryId = option?.value
                  const country = countries.find((c: any) => String(c.id) === String(countryId))
                  const nameToSearch = country?.country_name || countryName || ''
                  
                  return nameToSearch.toLowerCase().includes(searchText)
                }}
                maxTagCount={isAllSelected ? 1 : undefined}
                maxTagPlaceholder={(omittedValues) => t("productRules.moreCount", { count: omittedValues.length })}
                tagRender={(props) => {
                  const { label, value, closable } = props
                  
                  // If all are selected, show "All Nationalities Selected" tag
                  if (isAllSelected && value === selectedNationalities[0]) {
                    return (
                      <span
                        className="bg-blue-50 border border-blue-300 rounded py-0.5 px-2 my-0.5 inline-block"
                      >
                        {t("productRules.allNationalitiesSelected")}
                        {closable && (
                          <span
                            style={{ marginLeft: '4px', cursor: 'pointer' }}
                            onClick={(e: React.MouseEvent) => {
                              e.preventDefault()
                              e.stopPropagation()
                              updateFormData("eligible_nationalities", [])
                            }}
                          >
                            ×
                          </span>
                        )}
                      </span>
                    )
                  }
                  // For individual country tags, use default rendering
                  const country = countries.find((c: any) => String(c.id) === String(value))
                  return (
                    <span
                      className="bg-gray-100 border border-gray-300 rounded py-0.5 px-2 my-0.5 inline-block"
                    >
                      {country?.country_name || label || value}
                      {closable && (
                        <span
                          style={{ marginLeft: '4px', cursor: 'pointer' }}
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const newValue = selectedNationalities.filter((v: string) => v !== value)
                            updateFormData("eligible_nationalities", newValue)
                          }}
                        >
                          ×
                        </span>
                      )}
                    </span>
                  )
                }}
                dropdownStyle={{ maxHeight: "300px", overflowY: "auto" }}
                className={errors.eligible_nationalities ? "border-destructive" : "nationalities-select"}
              >
                {countries.map((country: any) => (
                  <AntSelect.Option key={country?.id} value={String(country?.id)} label={country?.country_name}>
                    {country?.country_name}
                  </AntSelect.Option>
                ))}
              </AntSelect>
              <style>{`
                .nationalities-select .ant-select-selector {
                  overflow-x: auto !important;
                  overflow-y: hidden !important;
                  white-space: nowrap !important;
                }
                .nationalities-select .ant-select-selection-overflow {
                  flex-wrap: nowrap !important;
                  overflow-x: auto !important;
                  overflow-y: hidden !important;
                }
                .nationalities-select .ant-select-selection-item {
                  flex-shrink: 0 !important;
                  white-space: nowrap !important;
                }
                .nationalities-select .ant-select-selection-search {
                  flex-shrink: 0 !important;
                }
              `}</style>
              {errors.eligible_nationalities && (
                <p className="text-sm text-destructive">{errors.eligible_nationalities}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.nationalitiesHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("productRules.employmentVendor")}</Label>
              <AntSelect
                style={{ width: "100%" }}
                placeholder={t("productRules.selectEmploymentVendor")}
                value={formData.employment_status_vendor || undefined}
                onChange={(value) => updateFormData("employment_status_vendor", value)}
                className={errors.employment_status_vendor ? "border-destructive" : ""}
              >
                <AntSelect.Option value="MASDAR">MASDAR</AntSelect.Option>
                <AntSelect.Option value="DAKHLI">DAKHLI</AntSelect.Option>
              </AntSelect>
              {errors.employment_status_vendor && (
                <p className="text-sm text-destructive">{errors.employment_status_vendor}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.employmentVendorHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("productRules.commodityVendor")}</Label>
              <AntSelect
                style={{ width: "100%" }}
                placeholder={t("productRules.selectCommodityVendor")}
                value={formData.commodity_vendor || undefined}
                onChange={(value) => updateFormData("commodity_vendor", value)}
                className={errors.commodity_vendor ? "border-destructive" : ""}
              >
                <AntSelect.Option value="EIGER">EIGER</AntSelect.Option>
                <AntSelect.Option value="LYNK">LYNK</AntSelect.Option>
              </AntSelect>
              {errors.commodity_vendor && (
                <p className="text-sm text-destructive">{errors.commodity_vendor}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.commodityVendorHint")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simah Check Rules Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("simah.title")}</CardTitle>
          <p className="text-muted-foreground">
            {t("simah.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("simah.minScoreLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.minimum_simah_score_allowed ?? ""}
                onChange={(e) => updateFormData("minimum_simah_score_allowed", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.minimum_simah_score_allowed ? "border-destructive" : ""}
              />
              {errors.minimum_simah_score_allowed && (
                <p className="text-sm text-destructive">{errors.minimum_simah_score_allowed}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.minScoreHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.delinquencyLabel")}</Label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={formData.delinquency_allowed === true}
                  onChange={(checked) => updateFormData("delinquency_allowed", checked)}
                  style={{ backgroundColor: formData.delinquency_allowed ? 'var(--primary)' : undefined }}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.delinquency_allowed ? t("productRules.allowed") : t("productRules.notAllowed")}
                </span>
              </div>
              {errors.delinquency_allowed && (
                <p className="text-sm text-destructive">{errors.delinquency_allowed}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.delinquencyToggleHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.stage2Label")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.stage2_allowed_last_12 ?? ""}
                onChange={(e) => updateFormData("stage2_allowed_last_12", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.stage2_allowed_last_12 ? "border-destructive" : ""}
              />
              {errors.stage2_allowed_last_12 && (
                <p className="text-sm text-destructive">{errors.stage2_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.stage2Hint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.stage3Label")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.stage3_allowed_last_12 ?? ""}
                onChange={(e) => updateFormData("stage3_allowed_last_12", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.stage3_allowed_last_12 ? "border-destructive" : ""}
              />
              {errors.stage3_allowed_last_12 && (
                <p className="text-sm text-destructive">{errors.stage3_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.stage3Hint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.utilityLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.max_utility_writeoff_amount ?? ""}
                onChange={(e) => updateFormData("max_utility_writeoff_amount", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.max_utility_writeoff_amount ? "border-destructive" : ""}
              />
              {errors.max_utility_writeoff_amount && (
                <p className="text-sm text-destructive">{errors.max_utility_writeoff_amount}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.utilityHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.telecomLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.max_telecom_writeoff_amount ?? ""}
                onChange={(e) => updateFormData("max_telecom_writeoff_amount", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.max_telecom_writeoff_amount ? "border-destructive" : ""}
              />
              {errors.max_telecom_writeoff_amount && (
                <p className="text-sm text-destructive">{errors.max_telecom_writeoff_amount}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.telecomHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.partialLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.partial_settlements_allowed_last_12 ?? ""}
                onChange={(e) => updateFormData("partial_settlements_allowed_last_12", e.target.value === "" ? null : Number(e.target.value))}
                className={errors.partial_settlements_allowed_last_12 ? "border-destructive" : ""}
              />
              {errors.partial_settlements_allowed_last_12 && (
                <p className="text-sm text-destructive">{errors.partial_settlements_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("simah.partialHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.bouncedLabel")}</Label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={formData.bounced_cheques_allowed === true}
                  onCheckedChange={(checked) => updateFormData("bounced_cheques_allowed", checked)}
                  style={{ backgroundColor: formData.bounced_cheques_allowed ? 'var(--primary)' : undefined }}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.bounced_cheques_allowed ? t("productRules.allowed") : t("productRules.notAllowed")}
                </span>
              </div>
              {errors.bounced_cheques_allowed && (
                <p className="text-sm text-destructive">{errors.bounced_cheques_allowed}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.bouncedToggleHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.defaultLabel")}</Label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={formData.default_allowed_last_12 === true}
                  onChange={(checked) => updateFormData("default_allowed_last_12", checked)}
                  style={{ backgroundColor: formData.default_allowed_last_12 ? 'var(--primary)' : undefined }}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.default_allowed_last_12 ? t("productRules.allowed") : t("productRules.notAllowed")}
                </span>
              </div>
              {errors.default_allowed_last_12 && (
                <p className="text-sm text-destructive">{errors.default_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.defaultToggleHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("simah.writeoffLabel")}</Label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={formData.writeoff_allowed_last_12 === true}
                  onCheckedChange={(checked) => updateFormData("writeoff_allowed_last_12", checked)}
                  style={{ backgroundColor: formData.writeoff_allowed_last_12 ? 'var(--primary)' : undefined }}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.writeoff_allowed_last_12 ? t("productRules.allowed") : t("productRules.notAllowed")}
                </span>
              </div>
              {errors.writeoff_allowed_last_12 && (
                <p className="text-sm text-destructive">{errors.writeoff_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("productRules.writeoffToggleHint")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex justify-end gap-3 mb-2 pt-4">
       
        <Button onClick={onNext} className="gap-2">
        {t("common:save")}

        </Button>
      </div>
    </div>
  )
}

