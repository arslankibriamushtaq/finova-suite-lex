import { useState, useEffect } from "react"
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
        if (response?.data?.success && response?.data?.data) {
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
          <CardTitle>Product Rules</CardTitle>
          <p className="text-muted-foreground">
            Configure product-specific rules and constraints.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Max Outstanding Balance</Label>
              <Input
                type="number"
                placeholder="Enter Max Outstanding Balance"
                value={formData.max_outstanding_balance}
                onChange={(e) => updateFormData("max_outstanding_balance", Number(e.target.value))}
                className={errors.max_outstanding_balance ? "border-destructive" : ""}
              />
              {errors.max_outstanding_balance && (
                <p className="text-sm text-destructive">{errors.max_outstanding_balance}</p>
              )}
              <p className="text-xs text-muted-foreground">Maximum outstanding balance allowed</p>
            </div>

            <div className="space-y-2">
              <Label>Age at Maturity</Label>
              <Input
                type="number"
                placeholder="Enter Age at Maturity"
                value={formData.age_at_maturity}
                onChange={(e) => updateFormData("age_at_maturity", Number(e.target.value))}
                className={errors.age_at_maturity ? "border-destructive" : ""}
              />
              {errors.age_at_maturity && (
                <p className="text-sm text-destructive">{errors.age_at_maturity}</p>
              )}
              <p className="text-xs text-muted-foreground">Age at maturity requirement</p>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Cooling Off Period</Label>
                <Button type="button" onClick={addCoolingOffEntry} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                 Cooling Period
                </Button>
              </div>
              
              {(!formData.cooling_off || formData.cooling_off.length === 0) ? (
                <div className="text-center py-4 text-muted-foreground border border-dashed rounded-md">
                  <p>No cooling off periods configured. Click "Add Loan" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.cooling_off.map((entry: any, index: number) => (
                    <div key={entry.id || index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-md">
                      <div className="space-y-2">
                        <Label>Cooling Type</Label>
                        <AntSelect
                          style={{ width: "100%" }}
                          placeholder="Select Loan Type"
                          value={entry.loan_type || undefined}
                          onChange={(value) => updateCoolingOffEntry(entry.id, "loan_type", value)}
                        >
                          <AntSelect.Option value="1st">After First Loan </AntSelect.Option>
                          <AntSelect.Option value="2nd">After Second Loan</AntSelect.Option>
                          <AntSelect.Option value="3rd">After Third Loan</AntSelect.Option>
                        </AntSelect>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Cooling Days</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Enter Loan Days"
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
              <p className="text-xs text-muted-foreground">Configure cooling off periods for different loan types</p>
            </div>

            <div className="space-y-2">
              <Label>Maximum Internal Payable Allowed</Label>
              <Input
                type="number"
                placeholder="Enter Maximum Internal Payable Allowed"
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
                Caps the internal payable amount for the product
              </p>
            </div>

            <div className="space-y-2">
              <Label>SIMAH Cooling Period</Label>
              <Input
                type="number"
                min="0"
                placeholder="Enter SIMAH cooling period (days)"
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
                Number of days for SIMAH cooling period enforcement
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Eligible Nationalities</Label>
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={isLoadingCountries || countries.length === 0}
                >
                  Select All
                </Checkbox>
              </div>
              <AntSelect
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select Eligible Nationalities"
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
                maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} more`}
                tagRender={(props) => {
                  const { label, value, closable } = props
                  
                  // If all are selected, show "All Nationalities Selected" tag
                  if (isAllSelected && value === selectedNationalities[0]) {
                    return (
                      <span
                        className="bg-blue-50 border border-blue-300 rounded py-0.5 px-2 my-0.5 inline-block"
                      >
                        All Nationalities Selected
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
              <p className="text-xs text-muted-foreground">Select eligible nationalities for this product</p>
            </div>

            <div className="space-y-2">
              <Label>Employment Status Vendor</Label>
              <AntSelect
                style={{ width: "100%" }}
                placeholder="Select Employment Status Vendor"
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
              <p className="text-xs text-muted-foreground">Select employment status vendor</p>
            </div>

            <div className="space-y-2">
              <Label>Commodity Vendor</Label>
              <AntSelect
                style={{ width: "100%" }}
                placeholder="Select Commodity Vendor"
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
              <p className="text-xs text-muted-foreground">Select commodity vendor</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simah Check Rules Section */}
      <Card>
        <CardHeader>
          <CardTitle>Simah Check Rules</CardTitle>
          <p className="text-muted-foreground">
            Configure SIMAH credit check rules and thresholds.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Minimum SIMAH Score Allowed</Label>
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
              <p className="text-xs text-muted-foreground">Minimum SIMAH credit score required for eligibility</p>
            </div>

            <div className="space-y-2">
              <Label>Delinquency Allowed</Label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={formData.delinquency_allowed === true}
                  onChange={(checked) => updateFormData("delinquency_allowed", checked)}
                  style={{ backgroundColor: formData.delinquency_allowed ? 'var(--primary)' : undefined }}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.delinquency_allowed ? "Allowed" : "Not Allowed"}
                </span>
              </div>
              {errors.delinquency_allowed && (
                <p className="text-sm text-destructive">{errors.delinquency_allowed}</p>
              )}
              <p className="text-xs text-muted-foreground">Enable to allow delinquencies</p>
            </div>

            <div className="space-y-2">
              <Label>Stage 2 Allowed (Last 12 Months)</Label>
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
              <p className="text-xs text-muted-foreground">Maximum Stage 2 accounts allowed in the last 12 months</p>
            </div>

            <div className="space-y-2">
              <Label>Stage 3 Allowed (Last 12 Months)</Label>
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
              <p className="text-xs text-muted-foreground">Maximum Stage 3 accounts allowed in the last 12 months</p>
            </div>

            <div className="space-y-2">
              <Label>Max Utility Write-off Amount</Label>
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
              <p className="text-xs text-muted-foreground">Maximum utility write-off amount allowed</p>
            </div>

            <div className="space-y-2">
              <Label>Max Telecom Write-off Amount</Label>
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
              <p className="text-xs text-muted-foreground">Maximum telecom write-off amount allowed</p>
            </div>

            <div className="space-y-2">
              <Label>Partial Settlements Allowed (Last 12 Months)</Label>
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
              <p className="text-xs text-muted-foreground">Maximum partial settlements allowed in the last 12 months</p>
            </div>

            <div className="space-y-2">
              <Label>Bounced Cheques Allowed</Label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={formData.bounced_cheques_allowed === true}
                  onCheckedChange={(checked) => updateFormData("bounced_cheques_allowed", checked)}
                  style={{ backgroundColor: formData.bounced_cheques_allowed ? 'var(--primary)' : undefined }}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.bounced_cheques_allowed ? "Allowed" : "Not Allowed"}
                </span>
              </div>
              {errors.bounced_cheques_allowed && (
                <p className="text-sm text-destructive">{errors.bounced_cheques_allowed}</p>
              )}
              <p className="text-xs text-muted-foreground">Enable to allow bounced cheques</p>
            </div>

            <div className="space-y-2">
              <Label>Default Allowed (Last 12 Months)</Label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={formData.default_allowed_last_12 === true}
                  onChange={(checked) => updateFormData("default_allowed_last_12", checked)}
                  style={{ backgroundColor: formData.default_allowed_last_12 ? 'var(--primary)' : undefined }}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.default_allowed_last_12 ? "Allowed" : "Not Allowed"}
                </span>
              </div>
              {errors.default_allowed_last_12 && (
                <p className="text-sm text-destructive">{errors.default_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">Enable to allow defaults in the last 12 months</p>
            </div>

            <div className="space-y-2">
              <Label>Write-off Allowed (Last 12 Months)</Label>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={formData.writeoff_allowed_last_12 === true}
                  onCheckedChange={(checked) => updateFormData("writeoff_allowed_last_12", checked)}
                  style={{ backgroundColor: formData.writeoff_allowed_last_12 ? 'var(--primary)' : undefined }}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.writeoff_allowed_last_12 ? "Allowed" : "Not Allowed"}
                </span>
              </div>
              {errors.writeoff_allowed_last_12 && (
                <p className="text-sm text-destructive">{errors.writeoff_allowed_last_12}</p>
              )}
              <p className="text-xs text-muted-foreground">Enable to allow write-offs in the last 12 months</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex justify-end gap-3 mb-2 pt-4">
       
        <Button onClick={onNext} className="gap-2">
        Save
         
        </Button>
      </div>
    </div>
  )
}

