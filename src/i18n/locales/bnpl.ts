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
    "cat.filter.currency": "Currency",
    "cat.filter.allCurrencies": "All currencies",
    "cat.filter.clear": "Clear filters",

    // Table
    "cat.col.order": "Order",
    "cat.col.code": "Code",
    "cat.col.name": "Name",
    "cat.col.currency": "Currency",
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
    "cat.field.codeHint":
      "Unique per currency — the same code can exist in another currency. Upper-cased on save.",
    "cat.field.codeLocked": "The code cannot be changed — create a new category instead.",
    "cat.field.nameEn": "Name (English)",
    "cat.field.nameEnPlaceholder": "Utility Bill",
    "cat.field.currency": "Currency",
    "cat.field.currencyPlaceholder": "Select a currency",
    "cat.field.currencyHint": "The purchase band and any flat fee are in this currency.",
    "cat.field.currencyLocked":
      "The currency cannot be changed — create the category again in the other currency.",
    "cat.field.currencyNone":
      "No currency offers BNPL yet. Set a currency limit first, then come back.",
    "cat.field.currencyFallback": "the category currency",
    "cat.field.minAmount": "Minimum amount",
    "cat.field.maxAmount": "Maximum amount",
    "cat.field.feeType": "Fee type",
    "cat.field.feeValue": "Fee value",
    "cat.field.feeValueFlatHint": "A flat amount in {{currency}} added to every purchase.",
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
    "cat.valid.currencyRequired": "Currency is required",
    "cat.valid.minAmount": "Minimum amount must be greater than 0",
    "cat.valid.maxAmount": "Maximum amount must be greater than or equal to the minimum",
    "cat.valid.feeValue": "Fee value cannot be negative",
    "cat.valid.percentRange": "A percent fee must be between 0 and 100",
    "cat.valid.dueDays": "Repayment due days must be greater than 0",

    // Customer input fields
    "cat.fields.title": "Customer inputs",
    "cat.fields.hint":
      "What the customer is asked for when buying — a mobile number, a bill reference. The app builds its form from this list, in this order.",
    "cat.fields.add": "Add input",
    "cat.fields.empty": "No inputs — the customer is only asked for an amount.",
    "cat.fields.position": "Input {{index}} of {{total}}",
    "cat.fields.moveUp": "Move up",
    "cat.fields.moveDown": "Move down",
    "cat.fields.remove": "Remove input",
    "cat.fields.type.text": "Text",
    "cat.fields.type.number": "Number",
    "cat.fields.type.mobile": "Mobile number",
    "cat.fields.field.key": "Key",
    "cat.fields.field.label": "Label",
    "cat.fields.field.labelPlaceholder": "Mobile Number",
    "cat.fields.field.type": "Type",
    "cat.fields.field.placeholder": "Placeholder",
    "cat.fields.field.pattern": "Pattern",
    "cat.fields.field.patternHint":
      "A regular expression the whole value must match. Leave blank for no pattern.",
    "cat.fields.field.minLength": "Min length",
    "cat.fields.field.maxLength": "Max length",
    "cat.fields.field.minValue": "Min value",
    "cat.fields.field.maxValue": "Max value",
    "cat.fields.field.required": "Required",
    "cat.fields.field.requiredOnHint": "The customer cannot leave this blank.",
    "cat.fields.field.requiredOffHint": "The customer may leave this blank.",

    "cat.valid.field.keyRequired": "Input {{index}}: a key is required",
    "cat.valid.field.keyFormat":
      "{{label}}: the key may only use lower-case letters, numbers and underscores",
    "cat.valid.field.keyDuplicate":
      "{{label}}: the key \u201c{{key}}\u201d is used by another input",
    "cat.valid.field.labelRequired": "Input {{index}}: a label is required",
    "cat.valid.field.pattern": "{{label}}: the pattern is not a valid regular expression",
    "cat.valid.field.lengthNegative": "{{label}}: lengths cannot be negative",
    "cat.valid.field.lengthOrder": "{{label}}: the max length must be at least the min length",
    "cat.valid.field.valueOrder": "{{label}}: the max value must be at least the min value",

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
    "cat.toast.duplicateCode": "That code is already used by another category in this currency",
    "cat.toast.activated": "Category activated",
    "cat.toast.deactivated": "Category deactivated",
    "cat.toast.statusFailed": "Failed to change the category status",
    "cat.toast.deleted": "Category deactivated",
    "cat.toast.deleteFailed": "Failed to delete the category",

    // ---- Currency limits ----
    "lim.title": "BNPL Currency Limits",
    "lim.subtitle":
      "How much a wallet may owe at once, set per currency. A currency with no limit, or a disabled one, does not offer BNPL at all.",
    "lim.search": "Search currency…",
    "lim.new": "Add Currency",

    "lim.col.currency": "Currency",
    "lim.col.totalLimit": "Borrowing limit",
    "lim.col.status": "Status",
    "lim.col.updatedAt": "Last updated",
    "lim.col.action": "Action",

    "lim.status.enabled": "Enabled",
    "lim.status.disabled": "Disabled",
    "lim.action.edit": "Edit",

    "lim.dialog.newTitle": "Add a currency",
    "lim.dialog.editTitle": "Edit {{currency}} limit",
    "lim.dialog.newDescription":
      "BNPL becomes available to wallets in this currency as soon as the limit is saved and enabled.",
    "lim.dialog.editDescription":
      "The limit applies to open purchases only — lowering it never calls in money a customer already owes.",

    "lim.field.currency": "Currency",
    "lim.field.currencyHint": "Three-letter ISO code, e.g. SAR.",
    "lim.field.currencyLocked": "The currency identifies the limit and cannot be changed.",
    "lim.field.totalLimit": "Borrowing limit",
    "lim.field.totalLimitHint":
      "The most a wallet in this currency may owe across all its open purchases.",
    "lim.field.enabled": "Offer BNPL in this currency",
    "lim.field.enabledOnHint":
      "Customers with a wallet in this currency can buy now and pay later.",
    "lim.field.enabledOffHint":
      "New purchases are blocked. Purchases already open stay repayable as normal.",

    "lim.valid.currencyRequired": "Currency is required",
    "lim.valid.currencyFormat": "Enter a three-letter ISO currency code",
    "lim.valid.currencyExists": "That currency already has a limit — edit it instead",
    "lim.valid.totalLimit": "The borrowing limit must be greater than 0",

    "lim.toast.loadFailed": "Failed to load the currency limits",
    "lim.toast.created": "Currency limit added",
    "lim.toast.updated": "Currency limit updated",
    "lim.toast.saveFailed": "Failed to save the currency limit",
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
    "cat.filter.currency": "Devise",
    "cat.filter.allCurrencies": "Toutes les devises",
    "cat.filter.clear": "Effacer les filtres",

    "cat.col.order": "Ordre",
    "cat.col.code": "Code",
    "cat.col.name": "Nom",
    "cat.col.currency": "Devise",
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
    "cat.field.codeHint":
      "Unique par devise — le même code peut exister dans une autre devise. Mis en majuscules à l’enregistrement.",
    "cat.field.codeLocked":
      "Le code ne peut pas être modifié — créez plutôt une nouvelle catégorie.",
    "cat.field.nameEn": "Nom (anglais)",
    "cat.field.nameEnPlaceholder": "Utility Bill",
    "cat.field.currency": "Devise",
    "cat.field.currencyPlaceholder": "Sélectionnez une devise",
    "cat.field.currencyHint": "La plage d’achat et tout frais fixe sont dans cette devise.",
    "cat.field.currencyLocked":
      "La devise ne peut pas être modifiée — recréez la catégorie dans l’autre devise.",
    "cat.field.currencyNone":
      "Aucune devise ne propose encore le BNPL. Définissez d’abord une limite par devise.",
    "cat.field.currencyFallback": "la devise de la catégorie",
    "cat.field.minAmount": "Montant minimum",
    "cat.field.maxAmount": "Montant maximum",
    "cat.field.feeType": "Type de frais",
    "cat.field.feeValue": "Valeur des frais",
    "cat.field.feeValueFlatHint": "Un montant fixe en {{currency}} ajouté à chaque achat.",
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
    "cat.valid.currencyRequired": "La devise est obligatoire",
    "cat.valid.minAmount": "Le montant minimum doit être supérieur à 0",
    "cat.valid.maxAmount": "Le montant maximum doit être supérieur ou égal au minimum",
    "cat.valid.feeValue": "La valeur des frais ne peut pas être négative",
    "cat.valid.percentRange": "Un pourcentage doit être compris entre 0 et 100",
    "cat.valid.dueDays": "Le délai de remboursement doit être supérieur à 0",

    // Champs saisis par le client
    "cat.fields.title": "Saisies du client",
    "cat.fields.hint":
      "Ce qui est demandé au client lors de l’achat — un numéro de mobile, une référence de facture. L’application construit son formulaire à partir de cette liste, dans cet ordre.",
    "cat.fields.add": "Ajouter une saisie",
    "cat.fields.empty": "Aucune saisie — seul le montant est demandé au client.",
    "cat.fields.position": "Saisie {{index}} sur {{total}}",
    "cat.fields.moveUp": "Monter",
    "cat.fields.moveDown": "Descendre",
    "cat.fields.remove": "Supprimer la saisie",
    "cat.fields.type.text": "Texte",
    "cat.fields.type.number": "Nombre",
    "cat.fields.type.mobile": "Numéro de mobile",
    "cat.fields.field.key": "Clé",
    "cat.fields.field.label": "Libellé",
    "cat.fields.field.labelPlaceholder": "Numéro de mobile",
    "cat.fields.field.type": "Type",
    "cat.fields.field.placeholder": "Texte indicatif",
    "cat.fields.field.pattern": "Motif",
    "cat.fields.field.patternHint":
      "Une expression régulière que toute la valeur doit respecter. Laissez vide pour aucun motif.",
    "cat.fields.field.minLength": "Longueur min",
    "cat.fields.field.maxLength": "Longueur max",
    "cat.fields.field.minValue": "Valeur min",
    "cat.fields.field.maxValue": "Valeur max",
    "cat.fields.field.required": "Obligatoire",
    "cat.fields.field.requiredOnHint": "Le client ne peut pas laisser ce champ vide.",
    "cat.fields.field.requiredOffHint": "Le client peut laisser ce champ vide.",

    "cat.valid.field.keyRequired": "Saisie {{index}} : une clé est obligatoire",
    "cat.valid.field.keyFormat":
      "{{label}} : la clé ne peut contenir que des minuscules, des chiffres et des tirets bas",
    "cat.valid.field.keyDuplicate":
      "{{label}} : la clé \u00ab {{key}} \u00bb est déjà utilisée par une autre saisie",
    "cat.valid.field.labelRequired": "Saisie {{index}} : un libellé est obligatoire",
    "cat.valid.field.pattern": "{{label}} : le motif n’est pas une expression régulière valide",
    "cat.valid.field.lengthNegative": "{{label}} : les longueurs ne peuvent pas être négatives",
    "cat.valid.field.lengthOrder":
      "{{label}} : la longueur max doit être au moins égale à la longueur min",
    "cat.valid.field.valueOrder":
      "{{label}} : la valeur max doit être au moins égale à la valeur min",

    "cat.delete.title": "Supprimer {{name}} ?",
    "cat.delete.description":
      "La catégorie est désactivée plutôt que supprimée, afin que les achats passés gardent une référence valide. Les clients cessent immédiatement de la voir ; les transactions en cours ne sont pas affectées.",
    "cat.delete.confirm": "Désactiver la catégorie",

    "cat.toast.loadFailed": "Échec du chargement des catégories BNPL",
    "cat.toast.created": "Catégorie créée",
    "cat.toast.updated": "Catégorie mise à jour",
    "cat.toast.saveFailed": "Échec de l’enregistrement de la catégorie",
    "cat.toast.duplicateCode": "Ce code est déjà utilisé par une autre catégorie dans cette devise",
    "cat.toast.activated": "Catégorie activée",
    "cat.toast.deactivated": "Catégorie désactivée",
    "cat.toast.statusFailed": "Échec du changement de statut de la catégorie",
    "cat.toast.deleted": "Catégorie désactivée",
    "cat.toast.deleteFailed": "Échec de la suppression de la catégorie",

    // ---- Limites par devise ----
    "lim.title": "Limites BNPL par devise",
    "lim.subtitle":
      "Le montant qu’un portefeuille peut devoir à la fois, défini par devise. Une devise sans limite, ou dont la limite est désactivée, ne propose pas le BNPL.",
    "lim.search": "Rechercher une devise…",
    "lim.new": "Ajouter une devise",

    "lim.col.currency": "Devise",
    "lim.col.totalLimit": "Limite d’emprunt",
    "lim.col.status": "Statut",
    "lim.col.updatedAt": "Dernière mise à jour",
    "lim.col.action": "Action",

    "lim.status.enabled": "Activée",
    "lim.status.disabled": "Désactivée",
    "lim.action.edit": "Modifier",

    "lim.dialog.newTitle": "Ajouter une devise",
    "lim.dialog.editTitle": "Modifier la limite {{currency}}",
    "lim.dialog.newDescription":
      "Le BNPL devient disponible pour les portefeuilles dans cette devise dès que la limite est enregistrée et activée.",
    "lim.dialog.editDescription":
      "La limite ne concerne que les achats en cours — la baisser n’exige jamais le remboursement immédiat d’une somme déjà due.",

    "lim.field.currency": "Devise",
    "lim.field.currencyHint": "Code ISO à trois lettres, par ex. SAR.",
    "lim.field.currencyLocked": "La devise identifie la limite et ne peut pas être modifiée.",
    "lim.field.totalLimit": "Limite d’emprunt",
    "lim.field.totalLimitHint":
      "Le maximum qu’un portefeuille dans cette devise peut devoir sur l’ensemble de ses achats en cours.",
    "lim.field.enabled": "Proposer le BNPL dans cette devise",
    "lim.field.enabledOnHint":
      "Les clients ayant un portefeuille dans cette devise peuvent acheter maintenant et payer plus tard.",
    "lim.field.enabledOffHint":
      "Les nouveaux achats sont bloqués. Les achats en cours restent remboursables normalement.",

    "lim.valid.currencyRequired": "La devise est obligatoire",
    "lim.valid.currencyFormat": "Saisissez un code devise ISO à trois lettres",
    "lim.valid.currencyExists": "Cette devise a déjà une limite — modifiez-la plutôt",
    "lim.valid.totalLimit": "La limite d’emprunt doit être supérieure à 0",

    "lim.toast.loadFailed": "Échec du chargement des limites par devise",
    "lim.toast.created": "Limite par devise ajoutée",
    "lim.toast.updated": "Limite par devise mise à jour",
    "lim.toast.saveFailed": "Échec de l’enregistrement de la limite par devise",
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
    "cat.filter.currency": "العملة",
    "cat.filter.allCurrencies": "كل العملات",
    "cat.filter.clear": "مسح عوامل التصفية",

    "cat.col.order": "الترتيب",
    "cat.col.code": "الرمز",
    "cat.col.name": "الاسم",
    "cat.col.currency": "العملة",
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
    "cat.field.codeHint":
      "فريد لكل عملة — يمكن أن يوجد الرمز نفسه بعملة أخرى، ويُحوَّل إلى أحرف كبيرة عند الحفظ.",
    "cat.field.codeLocked": "لا يمكن تغيير الرمز — أنشئ فئة جديدة بدلاً من ذلك.",
    "cat.field.nameEn": "الاسم (بالإنجليزية)",
    "cat.field.nameEnPlaceholder": "Utility Bill",
    "cat.field.currency": "العملة",
    "cat.field.currencyPlaceholder": "اختر عملة",
    "cat.field.currencyHint": "نطاق الشراء وأي رسوم ثابتة تكون بهذه العملة.",
    "cat.field.currencyLocked": "لا يمكن تغيير العملة — أنشئ الفئة من جديد بالعملة الأخرى.",
    "cat.field.currencyNone":
      "لا توجد عملة تدعم الخدمة بعد. حدّد حداً للعملة أولاً ثم عُد إلى هنا.",
    "cat.field.currencyFallback": "عملة الفئة",
    "cat.field.minAmount": "الحد الأدنى للمبلغ",
    "cat.field.maxAmount": "الحد الأقصى للمبلغ",
    "cat.field.feeType": "نوع الرسوم",
    "cat.field.feeValue": "قيمة الرسوم",
    "cat.field.feeValueFlatHint": "مبلغ ثابت بعملة {{currency}} يُضاف إلى كل عملية شراء.",
    "cat.field.feeValuePercentHint": "نسبة مئوية صحيحة — أدخل 2 لتعني 2%.",
    "cat.field.repaymentDueDays": "مدة السداد (بالأيام)",
    "cat.field.repaymentDueDaysHint": "عدد الأيام من الشراء حتى تاريخ السداد الوحيد.",
    "cat.field.sortOrder": "ترتيب العرض",
    "cat.field.saving": "جارٍ الحفظ…",

    "cat.preview.title": "معاينة الرسوم",
    "cat.preview.line": "شراء بقيمة {{amount}} تترتب عليه رسوم {{fee}} — الإجمالي {{total}}.",

    "cat.valid.codeRequired": "الرمز مطلوب",
    "cat.valid.nameRequired": "الاسم بالإنجليزية مطلوب",
    "cat.valid.currencyRequired": "العملة مطلوبة",
    "cat.valid.minAmount": "يجب أن يكون الحد الأدنى أكبر من 0",
    "cat.valid.maxAmount": "يجب أن يكون الحد الأقصى أكبر من أو يساوي الحد الأدنى",
    "cat.valid.feeValue": "لا يمكن أن تكون قيمة الرسوم سالبة",
    "cat.valid.percentRange": "يجب أن تكون النسبة بين 0 و100",
    "cat.valid.dueDays": "يجب أن تكون مدة السداد أكبر من 0",

    // مدخلات العميل
    "cat.fields.title": "مدخلات العميل",
    "cat.fields.hint":
      "ما يُطلب من العميل عند الشراء — رقم جوال أو رقم فاتورة. يبني التطبيق نموذجه من هذه القائمة وبهذا الترتيب.",
    "cat.fields.add": "إضافة مُدخل",
    "cat.fields.empty": "لا توجد مدخلات — يُطلب من العميل المبلغ فقط.",
    "cat.fields.position": "المُدخل {{index}} من {{total}}",
    "cat.fields.moveUp": "تحريك لأعلى",
    "cat.fields.moveDown": "تحريك لأسفل",
    "cat.fields.remove": "حذف المُدخل",
    "cat.fields.type.text": "نص",
    "cat.fields.type.number": "رقم",
    "cat.fields.type.mobile": "رقم جوال",
    "cat.fields.field.key": "المفتاح",
    "cat.fields.field.label": "التسمية",
    "cat.fields.field.labelPlaceholder": "رقم الجوال",
    "cat.fields.field.type": "النوع",
    "cat.fields.field.placeholder": "نص إرشادي",
    "cat.fields.field.pattern": "النمط",
    "cat.fields.field.patternHint":
      "تعبير نمطي يجب أن تطابقه القيمة بالكامل. اتركه فارغاً لعدم اشتراط نمط.",
    "cat.fields.field.minLength": "أدنى طول",
    "cat.fields.field.maxLength": "أقصى طول",
    "cat.fields.field.minValue": "أدنى قيمة",
    "cat.fields.field.maxValue": "أقصى قيمة",
    "cat.fields.field.required": "إلزامي",
    "cat.fields.field.requiredOnHint": "لا يمكن للعميل تركه فارغاً.",
    "cat.fields.field.requiredOffHint": "يمكن للعميل تركه فارغاً.",

    "cat.valid.field.keyRequired": "المُدخل {{index}}: المفتاح مطلوب",
    "cat.valid.field.keyFormat":
      "{{label}}: يقبل المفتاح الأحرف الصغيرة والأرقام والشرطة السفلية فقط",
    "cat.valid.field.keyDuplicate": "{{label}}: المفتاح \u201c{{key}}\u201d مستخدم في مُدخل آخر",
    "cat.valid.field.labelRequired": "المُدخل {{index}}: التسمية مطلوبة",
    "cat.valid.field.pattern": "{{label}}: النمط ليس تعبيراً نمطياً صالحاً",
    "cat.valid.field.lengthNegative": "{{label}}: لا يمكن أن يكون الطول سالباً",
    "cat.valid.field.lengthOrder": "{{label}}: يجب ألا يقل أقصى طول عن أدنى طول",
    "cat.valid.field.valueOrder": "{{label}}: يجب ألا تقل أقصى قيمة عن أدنى قيمة",

    "cat.delete.title": "حذف {{name}}؟",
    "cat.delete.description":
      "يتم إلغاء تفعيل الفئة بدلاً من حذفها، حتى تحتفظ عمليات الشراء السابقة بمرجع صالح. يتوقف ظهورها للعملاء فوراً، ولا تتأثر المعاملات القائمة.",
    "cat.delete.confirm": "إلغاء تفعيل الفئة",

    "cat.toast.loadFailed": "تعذّر تحميل فئات BNPL",
    "cat.toast.created": "تم إنشاء الفئة",
    "cat.toast.updated": "تم تحديث الفئة",
    "cat.toast.saveFailed": "تعذّر حفظ الفئة",
    "cat.toast.duplicateCode": "هذا الرمز مستخدم بالفعل في فئة أخرى بهذه العملة",
    "cat.toast.activated": "تم تفعيل الفئة",
    "cat.toast.deactivated": "تم إلغاء تفعيل الفئة",
    "cat.toast.statusFailed": "تعذّر تغيير حالة الفئة",
    "cat.toast.deleted": "تم إلغاء تفعيل الفئة",
    "cat.toast.deleteFailed": "تعذّر حذف الفئة",

    // ---- حدود العملات ----
    "lim.title": "حدود العملات لخدمة اشترِ الآن وادفع لاحقاً",
    "lim.subtitle":
      "الحد الذي يمكن أن تدين به المحفظة في وقت واحد، يُحدَّد لكل عملة. العملة بلا حد، أو ذات الحد المعطّل، لا تتيح الخدمة إطلاقاً.",
    "lim.search": "ابحث عن عملة…",
    "lim.new": "إضافة عملة",

    "lim.col.currency": "العملة",
    "lim.col.totalLimit": "حد الاقتراض",
    "lim.col.status": "الحالة",
    "lim.col.updatedAt": "آخر تحديث",
    "lim.col.action": "الإجراء",

    "lim.status.enabled": "مُفعّلة",
    "lim.status.disabled": "معطّلة",
    "lim.action.edit": "تعديل",

    "lim.dialog.newTitle": "إضافة عملة",
    "lim.dialog.editTitle": "تعديل حد {{currency}}",
    "lim.dialog.newDescription": "تتاح الخدمة للمحافظ بهذه العملة فور حفظ الحد وتفعيله.",
    "lim.dialog.editDescription":
      "ينطبق الحد على المشتريات القائمة فقط — خفضه لا يستدعي أبداً مبلغاً على العميل بالفعل.",

    "lim.field.currency": "العملة",
    "lim.field.currencyHint": "رمز ISO من ثلاثة أحرف، مثل SAR.",
    "lim.field.currencyLocked": "العملة هي معرّف الحد ولا يمكن تغييرها.",
    "lim.field.totalLimit": "حد الاقتراض",
    "lim.field.totalLimitHint":
      "أقصى ما يمكن أن تدين به محفظة بهذه العملة عبر كل مشترياتها القائمة.",
    "lim.field.enabled": "إتاحة الخدمة بهذه العملة",
    "lim.field.enabledOnHint": "يستطيع أصحاب المحافظ بهذه العملة الشراء الآن والدفع لاحقاً.",
    "lim.field.enabledOffHint":
      "تُمنع المشتريات الجديدة، وتبقى المشتريات القائمة قابلة للسداد كالمعتاد.",

    "lim.valid.currencyRequired": "العملة مطلوبة",
    "lim.valid.currencyFormat": "أدخل رمز عملة ISO من ثلاثة أحرف",
    "lim.valid.currencyExists": "هذه العملة لها حد بالفعل — عدّله بدلاً من ذلك",
    "lim.valid.totalLimit": "يجب أن يكون حد الاقتراض أكبر من 0",

    "lim.toast.loadFailed": "تعذّر تحميل حدود العملات",
    "lim.toast.created": "تمت إضافة حد العملة",
    "lim.toast.updated": "تم تحديث حد العملة",
    "lim.toast.saveFailed": "تعذّر حفظ حد العملة",
  },
};

export default bnpl;
