export interface Language {
  code: string
  name: string
  nativeName: string
  dir: "ltr" | "rtl"
}

export const languages: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
  },
]

export const translations = {
  en: {
    // Navigation
    products: "Products",
    partners: "Partners",
    documents: "Documents",
    settings: "Settings",

    // Products Page
    "products.title": "Products Management",
    "products.subtitle": "Manage your financial products and services",
    "products.addNew": "Add New Product",
    "products.search": "Search products...",
    "products.filters": "Filters",
    "products.export": "Export",
    "products.bulkActions": "Bulk Actions",
    "products.selectAll": "Select All",
    "products.clearSelection": "Clear Selection",

    // Table Headers
    "table.logo": "Logo",
    "table.productName": "Product Name",
    "table.email": "Email",
    "table.country": "Country",
    "table.productType": "Product Type",
    "table.status": "Status",
    "table.createdDate": "Created Date",
    "table.actions": "Actions",

    // Status
    "status.active": "Active",
    "status.draft": "Draft",
    "status.disabled": "Disabled",

    // Actions
    "actions.edit": "Edit",
    "actions.view": "View",
    "actions.delete": "Delete",
    "actions.duplicate": "Duplicate",
    "actions.export": "Export",

    // Wizard
    "wizard.basicInfo": "Basic Information",
    "wizard.commodityInfo": "Commodity Information",
    "wizard.settings": "Settings",
    "wizard.partnerAffiliation": "Partner Affiliation",
    "wizard.requiredDocuments": "Required Documents",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.publish": "Publish",
    "common.saveDraft": "Save Draft",
    "common.loading": "Loading...",
    "common.noData": "No data available",
  },
  ar: {
    // Navigation
    products: "المنتجات",
    partners: "الشركاء",
    documents: "المستندات",
    settings: "الإعدادات",

    // Products Page
    "products.title": "إدارة المنتجات",
    "products.subtitle": "إدارة منتجاتك وخدماتك المالية",
    "products.addNew": "إضافة منتج جديد",
    "products.search": "البحث في المنتجات...",
    "products.filters": "المرشحات",
    "products.export": "تصدير",
    "products.bulkActions": "الإجراءات المجمعة",
    "products.selectAll": "تحديد الكل",
    "products.clearSelection": "إلغاء التحديد",

    // Table Headers
    "table.logo": "الشعار",
    "table.productName": "اسم المنتج",
    "table.email": "البريد الإلكتروني",
    "table.country": "البلد",
    "table.productType": "نوع المنتج",
    "table.status": "الحالة",
    "table.createdDate": "تاريخ الإنشاء",
    "table.actions": "الإجراءات",

    // Status
    "status.active": "نشط",
    "status.draft": "مسودة",
    "status.disabled": "معطل",

    // Actions
    "actions.edit": "تعديل",
    "actions.view": "عرض",
    "actions.delete": "حذف",
    "actions.duplicate": "نسخ",
    "actions.export": "تصدير",

    // Wizard
    "wizard.basicInfo": "المعلومات الأساسية",
    "wizard.commodityInfo": "معلومات السلعة",
    "wizard.settings": "الإعدادات",
    "wizard.partnerAffiliation": "انتماء الشريك",
    "wizard.requiredDocuments": "المستندات المطلوبة",

    // Common
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.next": "التالي",
    "common.previous": "السابق",
    "common.publish": "نشر",
    "common.saveDraft": "حفظ كمسودة",
    "common.loading": "جاري التحميل...",
    "common.noData": "لا توجد بيانات متاحة",
  },
}

export type TranslationKey = keyof typeof translations.en
