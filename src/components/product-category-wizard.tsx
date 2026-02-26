"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Building2, CreditCard, Users, TrendingUp, Banknote, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useLanguage } from "../hooks/use-language"

interface ProductCategoryWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const masterCategories = [
  {
    id: "murabaha",
    name: "Murabaha",
    description: "Cost-plus financing for asset purchases",
    icon: Building2,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    subCategories: [
      { id: "home-financing", name: "Home Financing", template: "home-financing-murabaha" },
      { id: "vehicle-financing", name: "Vehicle Financing", template: "vehicle-financing-murabaha" },
      { id: "inventory-financing", name: "Inventory Financing", template: "inventory-financing-murabaha" },
      { id: "equipment-financing", name: "Equipment Financing", template: "equipment-financing-murabaha" },
    ],
  },
  {
    id: "ijarah",
    name: "Ijarah",
    description: "Islamic leasing and rental financing",
    icon: CreditCard,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    subCategories: [
      { id: "property-leasing", name: "Property Leasing", template: "property-leasing-ijarah" },
      { id: "vehicle-leasing", name: "Vehicle Leasing", template: "vehicle-leasing-ijarah" },
      { id: "equipment-leasing", name: "Equipment Leasing", template: "equipment-leasing-ijarah" },
    ],
  },
  {
    id: "tawarruq",
    name: "Tawarruq",
    description: "Monetization through commodity trading",
    icon: Banknote,
    color: "bg-teal-100 text-teal-800 border-teal-200",
    subCategories: [
      {
        id: "personal-financing",
        name: "Personal Financing (Commodity is involved in tawarruq)",
        template: "personal-financing-tawarruq",
      },
      { id: "business-financing", name: "Business Financing", template: "business-financing-tawarruq" },
      { id: "trade-financing", name: "Trade Financing", template: "trade-financing-tawarruq" },
      { id: "investment-financing", name: "Investment Financing", template: "investment-financing-tawarruq" },
      { id: "cash-management", name: "Cash Management", template: "cash-management-tawarruq" },
      { id: "microfinance", name: "Microfinance", template: "microfinance-tawarruq" },
      { id: "quick-cash", name: "Quick cash", template: "quick-cash-tawarruq" },
      { id: "invoice-factoring", name: "Invoice factoring", template: "invoice-factoring-tawarruq" },
      { id: "invoice-discounting", name: "Invoice discounting", template: "invoice-discounting-tawarruq" },
      { id: "reverse-factoring", name: "reverse factoring", template: "reverse-factoring-tawarruq" },
    ],
  },
  {
    id: "bnpl",
    name: "Buy Now Pay Later",
    description: "Sharia-compliant installment payments",
    icon: Users,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    subCategories: [
      { id: "consumer-bnpl", name: "Consumer BNPL", template: "consumer-bnpl" },
      { id: "business-bnpl", name: "Business BNPL", template: "business-bnpl" },
      { id: "marketplace-bnpl", name: "Marketplace BNPL", template: "marketplace-bnpl" },
    ],
  },
  {
    id: "crowd-funding",
    name: "Crowd Funding",
    description: "Community-based investment products",
    icon: TrendingUp,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    subCategories: [
      { id: "equity-crowdfunding", name: "Equity Crowdfunding", template: "equity-crowdfunding" },
      { id: "debt-crowdfunding", name: "Debt Crowdfunding", template: "debt-crowdfunding" },
      { id: "real-estate-crowdfunding", name: "Real Estate Crowdfunding", template: "real-estate-crowdfunding" },
    ],
  },
]

export function ProductCategoryWizard({ open, onOpenChange }: ProductCategoryWizardProps) {
  const { t, isRTL } = useLanguage()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedMasterCategory, setSelectedMasterCategory] = useState<string | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)

  const totalSteps = 2
  const progress = (currentStep / totalSteps) * 100

  const handleMasterCategorySelect = (categoryId: string) => {
    setSelectedMasterCategory(categoryId)
  }

  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId)
  }

  const handleNext = () => {
    if (currentStep === 1 && selectedMasterCategory) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedSubCategory) {
      // Start the setup wizard with selected template
      const masterCategory = masterCategories.find((cat) => cat.id === selectedMasterCategory)
      const subCategory = masterCategory?.subCategories.find((sub) => sub.id === selectedSubCategory)

      if (subCategory) {
        // Navigate to product creation with template
        router.push(
          `/products/create?template=${subCategory.template}&master=${selectedMasterCategory}&sub=${selectedSubCategory}`,
        )
        onOpenChange(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      if (currentStep === 2) {
        setSelectedSubCategory(null)
      }
    }
  }

  const selectedMasterCategoryData = masterCategories.find((cat) => cat.id === selectedMasterCategory)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {currentStep === 1 ? "Select Product Master Category" : "Select Sub-Category"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? "Choose the main category that best describes your product type"
              : `Select a specific sub-category within ${selectedMasterCategoryData?.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Master Category Selection */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {masterCategories.map((category) => {
                const Icon = category.icon
                const isSelected = selectedMasterCategory === category.id

                return (
                  <Card
                    key={category.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary shadow-md" : ""
                    }`}
                    onClick={() => handleMasterCategorySelect(category.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${category.color.replace("text-", "bg-").replace("border-", "").split(" ")[0]}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">{category.description}</CardDescription>
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          {category.subCategories.length} sub-categories
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Step 2: Sub-Category Selection */}
          {currentStep === 2 && selectedMasterCategoryData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div
                  className={`p-2 rounded-lg ${selectedMasterCategoryData.color.replace("text-", "bg-").replace("border-", "").split(" ")[0]}`}
                >
                  <selectedMasterCategoryData.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedMasterCategoryData.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMasterCategoryData.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedMasterCategoryData.subCategories.map((subCategory) => {
                  const isSelected = selectedSubCategory === subCategory.id

                  return (
                    <Card
                      key={subCategory.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? "ring-2 ring-primary shadow-md" : ""
                      }`}
                      onClick={() => handleSubCategorySelect(subCategory.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{subCategory.name}</CardTitle>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Template: {subCategory.template}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={(currentStep === 1 && !selectedMasterCategory) || (currentStep === 2 && !selectedSubCategory)}
                className="gap-2"
              >
                {currentStep === totalSteps ? "Start Setup Wizard" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
