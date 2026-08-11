import type { ModuleLocale } from "../types";

/**
 * BNPL module — admin management of the dynamic Buy-Now-Pay-Later category
 * catalog (wallet-service). Categories are data, not code: an admin sets the
 * purchase band, the service fee and the repayment window per category.
 */
const bnpl: ModuleLocale = {
  namespace: "bnpl",
  en: {
    "cat.title": "BNPL Categories",
    "cat.subtitle":
      "What customers can buy now and pay later — each category carries its own purchase band, service fee and repayment window.",
    "cat.search": "Search code, name…",
    "cat.new": "New Category",
    "cat.count": "{{count}} categories",

    // Filters
    "cat.filter.title": "Filters",
    "cat.filter.active": "{{count}} active",
    "cat.filter.status": "Status",
    "cat.filter.allStatuses": "All statuses",
    "cat.filter.feeType": "Fee type",
    "cat.filter.allFeeTypes": "All fee types",
    "cat.filter.clear": "Clear filters",

    // Table
    "cat.col.order": "Order",
    "cat.col.code": "Code",
    "cat.col.name": "Name",
    "cat.col.range": "Purchase range",
    "cat.col.fee": "Service fee",
    "cat.col.dueDays": "Repayment due",
    "cat.col.status": "Status",
    "cat.col.action": "Action",
    "cat.dueDays": "{{count}} days",

    // Row actions
    "cat.action.edit": "Edit",
    "cat.action.activate": "Activate",
    "cat.action.deactivate": "Deactivate",
    "cat.action.delete": "Delete",

    // Fee types
    "cat.feeType.flat": "Flat",
    "cat.feeType.percent": "Percent",

    // Dialog
    "cat.dialog.newTitle": "New BNPL Category",
    "cat.dialog.editTitle": "Edit BNPL Category",
    "cat.dialog.newDescription": "Customers see this category as soon as it is created and active.",
    "cat.dialog.editDescription":
      "Changing the fee never re-prices a purchase that is already open — the terms are snapshotted when a customer buys.",

    // Fields
    "cat.field.code": "Code",
    "cat.field.codePlaceholder": "UTILITY_BILL",
    "cat.field.codeHint": "Unique per tenant, upper-cased on save.",
    "cat.field.codeLocked": "The code cannot be changed — create a new category instead.",
    "cat.field.nameEn": "Name (English)",
    "cat.field.nameEnPlaceholder": "Utility Bill",
    "cat.field.nameAr": "Name (Arabic)",
    "cat.field.nameArPlaceholder": "فاتورة",
    "cat.field.minAmount": "Minimum amount",
    "cat.field.maxAmount": "Maximum amount",
    "cat.field.feeType": "Fee type",
    "cat.field.feeValue": "Fee value",
    "cat.field.feeValueFlatHint": "A flat amount in SAR added to every purchase.",
    "cat.field.feeValuePercentHint": "A whole-number percent — enter 2 for 2%.",
    "cat.field.repaymentDueDays": "Repayment due (days)",
    "cat.field.repaymentDueDaysHint": "Days from purchase to the single repayment date.",
    "cat.field.sortOrder": "Display order",
    "cat.field.saving": "Saving…",

    // Live fee preview
    "cat.preview.title": "Fee preview",
    "cat.preview.line": "A {{amount}} purchase carries a {{fee}} fee — {{total}} to repay.",

    // Validation
    "cat.valid.codeRequired": "Code is required",
    "cat.valid.nameRequired": "English name is required",
    "cat.valid.minAmount": "Minimum amount must be greater than 0",
    "cat.valid.maxAmount": "Maximum amount must be greater than or equal to the minimum",
    "cat.valid.feeValue": "Fee value cannot be negative",
    "cat.valid.percentRange": "A percent fee must be between 0 and 100",
    "cat.valid.dueDays": "Repayment due days must be greater than 0",

    // Delete confirmation
    "cat.delete.title": "Delete {{name}}?",
    "cat.delete.description":
      "The category is deactivated rather than removed, so past purchases keep a valid reference. Customers stop seeing it immediately; open transactions are unaffected.",
    "cat.delete.confirm": "Deactivate category",

    // Toasts
    "cat.toast.loadFailed": "Failed to load BNPL categories",
    "cat.toast.created": "Category created",
    "cat.toast.updated": "Category updated",
    "cat.toast.saveFailed": "Failed to save the category",
    "cat.toast.duplicateCode": "That code is already used by another category",
    "cat.toast.activated": "Category activated",
    "cat.toast.deactivated": "Category deactivated",
    "cat.toast.statusFailed": "Failed to change the category status",
    "cat.toast.deleted": "Category deactivated",
    "cat.toast.deleteFailed": "Failed to delete the category",
  },

  fr: {
    "cat.title": "Catégories BNPL",
    "cat.subtitle":
      "Ce que les clients peuvent acheter maintenant et payer plus tard — chaque catégorie porte sa propre plage d’achat, ses frais de service et son délai de remboursement.",
    "cat.search": "Rechercher un code, un nom…",
    "cat.new": "Nouvelle catégorie",
    "cat.count": "{{count}} catégories",

    "cat.filter.title": "Filtres",
    "cat.filter.active": "{{count}} actifs",
    "cat.filter.status": "Statut",
    "cat.filter.allStatuses": "Tous les statuts",
    "cat.filter.feeType": "Type de frais",
    "cat.filter.allFeeTypes": "Tous les types de frais",
    "cat.filter.clear": "Effacer les filtres",

    "cat.col.order": "Ordre",
    "cat.col.code": "Code",
    "cat.col.name": "Nom",
    "cat.col.range": "Plage d’achat",
    "cat.col.fee": "Frais de service",
    "cat.col.dueDays": "Échéance",
    "cat.col.status": "Statut",
    "cat.col.action": "Action",
    "cat.dueDays": "{{count}} jours",

    "cat.action.edit": "Modifier",
    "cat.action.activate": "Activer",
    "cat.action.deactivate": "Désactiver",
    "cat.action.delete": "Supprimer",

    "cat.feeType.flat": "Fixe",
    "cat.feeType.percent": "Pourcentage",

    "cat.dialog.newTitle": "Nouvelle catégorie BNPL",
    "cat.dialog.editTitle": "Modifier la catégorie BNPL",
    "cat.dialog.newDescription":
      "Les clients voient cette catégorie dès qu’elle est créée et active.",
    "cat.dialog.editDescription":
      "Modifier les frais ne change jamais un achat déjà en cours — les conditions sont figées au moment de l’achat.",

    "cat.field.code": "Code",
    "cat.field.codePlaceholder": "UTILITY_BILL",
    "cat.field.codeHint": "Unique par locataire, mis en majuscules à l’enregistrement.",
    "cat.field.codeLocked":
      "Le code ne peut pas être modifié — créez plutôt une nouvelle catégorie.",
    "cat.field.nameEn": "Nom (anglais)",
    "cat.field.nameEnPlaceholder": "Utility Bill",
    "cat.field.nameAr": "Nom (arabe)",
    "cat.field.nameArPlaceholder": "فاتورة",
    "cat.field.minAmount": "Montant minimum",
    "cat.field.maxAmount": "Montant maximum",
    "cat.field.feeType": "Type de frais",
    "cat.field.feeValue": "Valeur des frais",
    "cat.field.feeValueFlatHint": "Un montant fixe en SAR ajouté à chaque achat.",
    "cat.field.feeValuePercentHint": "Un pourcentage entier — saisissez 2 pour 2 %.",
    "cat.field.repaymentDueDays": "Échéance de remboursement (jours)",
    "cat.field.repaymentDueDaysHint": "Jours entre l’achat et l’unique date de remboursement.",
    "cat.field.sortOrder": "Ordre d’affichage",
    "cat.field.saving": "Enregistrement…",

    "cat.preview.title": "Aperçu des frais",
    "cat.preview.line":
      "Un achat de {{amount}} entraîne des frais de {{fee}} — {{total}} à rembourser.",

    "cat.valid.codeRequired": "Le code est obligatoire",
    "cat.valid.nameRequired": "Le nom en anglais est obligatoire",
    "cat.valid.minAmount": "Le montant minimum doit être supérieur à 0",
    "cat.valid.maxAmount": "Le montant maximum doit être supérieur ou égal au minimum",
    "cat.valid.feeValue": "La valeur des frais ne peut pas être négative",
    "cat.valid.percentRange": "Un pourcentage doit être compris entre 0 et 100",
    "cat.valid.dueDays": "Le délai de remboursement doit être supérieur à 0",

    "cat.delete.title": "Supprimer {{name}} ?",
    "cat.delete.description":
      "La catégorie est désactivée plutôt que supprimée, afin que les achats passés gardent une référence valide. Les clients cessent immédiatement de la voir ; les transactions en cours ne sont pas affectées.",
    "cat.delete.confirm": "Désactiver la catégorie",

    "cat.toast.loadFailed": "Échec du chargement des catégories BNPL",
    "cat.toast.created": "Catégorie créée",
    "cat.toast.updated": "Catégorie mise à jour",
    "cat.toast.saveFailed": "Échec de l’enregistrement de la catégorie",
    "cat.toast.duplicateCode": "Ce code est déjà utilisé par une autre catégorie",
    "cat.toast.activated": "Catégorie activée",
    "cat.toast.deactivated": "Catégorie désactivée",
    "cat.toast.statusFailed": "Échec du changement de statut de la catégorie",
    "cat.toast.deleted": "Catégorie désactivée",
    "cat.toast.deleteFailed": "Échec de la suppression de la catégorie",
  },

  ar: {
    "cat.title": "فئات اشترِ الآن وادفع لاحقاً",
    "cat.subtitle":
      "ما يمكن للعملاء شراؤه الآن ودفعه لاحقاً — لكل فئة نطاق شراء ورسوم خدمة ومدة سداد خاصة بها.",
    "cat.search": "ابحث عن رمز أو اسم…",
    "cat.new": "فئة جديدة",
    "cat.count": "{{count}} فئات",

    "cat.filter.title": "عوامل التصفية",
    "cat.filter.active": "{{count}} مُفعّل",
    "cat.filter.status": "الحالة",
    "cat.filter.allStatuses": "كل الحالات",
    "cat.filter.feeType": "نوع الرسوم",
    "cat.filter.allFeeTypes": "كل أنواع الرسوم",
    "cat.filter.clear": "مسح عوامل التصفية",

    "cat.col.order": "الترتيب",
    "cat.col.code": "الرمز",
    "cat.col.name": "الاسم",
    "cat.col.range": "نطاق الشراء",
    "cat.col.fee": "رسوم الخدمة",
    "cat.col.dueDays": "استحقاق السداد",
    "cat.col.status": "الحالة",
    "cat.col.action": "الإجراء",
    "cat.dueDays": "{{count}} يوماً",

    "cat.action.edit": "تعديل",
    "cat.action.activate": "تفعيل",
    "cat.action.deactivate": "إلغاء التفعيل",
    "cat.action.delete": "حذف",

    "cat.feeType.flat": "مبلغ ثابت",
    "cat.feeType.percent": "نسبة مئوية",

    "cat.dialog.newTitle": "فئة جديدة",
    "cat.dialog.editTitle": "تعديل الفئة",
    "cat.dialog.newDescription": "يرى العملاء هذه الفئة فور إنشائها وتفعيلها.",
    "cat.dialog.editDescription":
      "تغيير الرسوم لا يُعيد تسعير عملية شراء قائمة — تُحفظ الشروط لحظة الشراء.",

    "cat.field.code": "الرمز",
    "cat.field.codePlaceholder": "UTILITY_BILL",
    "cat.field.codeHint": "فريد لكل مستأجر، ويُحوَّل إلى أحرف كبيرة عند الحفظ.",
    "cat.field.codeLocked": "لا يمكن تغيير الرمز — أنشئ فئة جديدة بدلاً من ذلك.",
    "cat.field.nameEn": "الاسم (بالإنجليزية)",
    "cat.field.nameEnPlaceholder": "Utility Bill",
    "cat.field.nameAr": "الاسم (بالعربية)",
    "cat.field.nameArPlaceholder": "فاتورة",
    "cat.field.minAmount": "الحد الأدنى للمبلغ",
    "cat.field.maxAmount": "الحد الأقصى للمبلغ",
    "cat.field.feeType": "نوع الرسوم",
    "cat.field.feeValue": "قيمة الرسوم",
    "cat.field.feeValueFlatHint": "مبلغ ثابت بالريال يُضاف إلى كل عملية شراء.",
    "cat.field.feeValuePercentHint": "نسبة مئوية صحيحة — أدخل 2 لتعني 2%.",
    "cat.field.repaymentDueDays": "مدة السداد (بالأيام)",
    "cat.field.repaymentDueDaysHint": "عدد الأيام من الشراء حتى تاريخ السداد الوحيد.",
    "cat.field.sortOrder": "ترتيب العرض",
    "cat.field.saving": "جارٍ الحفظ…",

    "cat.preview.title": "معاينة الرسوم",
    "cat.preview.line": "شراء بقيمة {{amount}} تترتب عليه رسوم {{fee}} — الإجمالي {{total}}.",

    "cat.valid.codeRequired": "الرمز مطلوب",
    "cat.valid.nameRequired": "الاسم بالإنجليزية مطلوب",
    "cat.valid.minAmount": "يجب أن يكون الحد الأدنى أكبر من 0",
    "cat.valid.maxAmount": "يجب أن يكون الحد الأقصى أكبر من أو يساوي الحد الأدنى",
    "cat.valid.feeValue": "لا يمكن أن تكون قيمة الرسوم سالبة",
    "cat.valid.percentRange": "يجب أن تكون النسبة بين 0 و100",
    "cat.valid.dueDays": "يجب أن تكون مدة السداد أكبر من 0",

    "cat.delete.title": "حذف {{name}}؟",
    "cat.delete.description":
      "يتم إلغاء تفعيل الفئة بدلاً من حذفها، حتى تحتفظ عمليات الشراء السابقة بمرجع صالح. يتوقف ظهورها للعملاء فوراً، ولا تتأثر المعاملات القائمة.",
    "cat.delete.confirm": "إلغاء تفعيل الفئة",

    "cat.toast.loadFailed": "تعذّر تحميل فئات BNPL",
    "cat.toast.created": "تم إنشاء الفئة",
    "cat.toast.updated": "تم تحديث الفئة",
    "cat.toast.saveFailed": "تعذّر حفظ الفئة",
    "cat.toast.duplicateCode": "هذا الرمز مستخدم بالفعل في فئة أخرى",
    "cat.toast.activated": "تم تفعيل الفئة",
    "cat.toast.deactivated": "تم إلغاء تفعيل الفئة",
    "cat.toast.statusFailed": "تعذّر تغيير حالة الفئة",
    "cat.toast.deleted": "تم إلغاء تفعيل الفئة",
    "cat.toast.deleteFailed": "تعذّر حذف الفئة",
  },
};

export default bnpl;
