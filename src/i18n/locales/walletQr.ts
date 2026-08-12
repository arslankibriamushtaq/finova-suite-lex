import type { ModuleLocale } from "../types";

/**
 * Wallet QR payments (wallet-service). A code points at exactly one wallet, so
 * the credited account and its currency are settled when the code is minted —
 * never inferred at scan time.
 */
const walletQr: ModuleLocale = {
  namespace: "walletQr",
  en: {
    title: "Wallet QR Codes",
    subtitle:
      "A wallet's permanent code, one-off payment requests, and paying a scanned code. Every code belongs to exactly one wallet, so the credited account and its currency are fixed when the code is created.",

    "tab.codes": "Codes",
    "tab.pay": "Scan & Pay",

    "wallet.title": "Wallet",
    "wallet.search": "Search wallet number, account or customer…",
    "wallet.searching": "Searching…",
    "wallet.change": "Change",

    "empty.pickWallet": "Pick a wallet above to see its QR codes.",

    "static.title": "Permanent code",
    "static.loading": "Loading…",
    "static.none": "No code available for this wallet.",
    "static.inactiveHint":
      "This code is no longer payable. Refreshing mints a fresh one automatically.",

    "list.title": "Codes",
    "list.sessionHint":
      "Payment requests created in this session are listed here; older ones are looked up in support.",

    "dynamic.latest": "Latest payment request",
    "dynamic.expires": "Expires {{when}}",
    "dynamic.dialogTitle": "Request money",
    "dynamic.dialogDescription":
      "Creates a one-off code for a fixed amount. It can be paid once, and expires on its own.",
    "dynamic.amount": "Amount",
    "dynamic.amountHint": "Charged in {{currency}} — the wallet's own currency.",
    "dynamic.ttl": "Valid for (minutes)",
    "dynamic.ttlHint":
      "Leave empty to use the service default. The service caps how long a request may stay payable.",
    "dynamic.reference": "Reference",
    "dynamic.referencePlaceholder": "Invoice 1042",
    "dynamic.creating": "Creating…",

    "col.type": "Type",
    "col.amount": "Amount",
    "col.status": "Status",
    "col.expiresAt": "Expires",
    "col.token": "Token",
    "col.action": "Action",

    "type.static": "Permanent",
    "type.dynamic": "Request",
    anyAmount: "Any amount",

    "status.ACTIVE": "Active",
    "status.USED": "Paid",
    "status.EXPIRED": "Expired",
    "status.REVOKED": "Revoked",

    "action.revoke": "Revoke",
    "action.copyPayload": "Copy",
    "action.requestMoney": "Request money",

    "pay.title": "Pay a scanned code",
    "pay.payload": "Scanned code",
    "pay.payloadPlaceholder": "Paste the scanned QR content here",
    "pay.payloadHint":
      "Preview first — the amount, status and destination are read from the server, not from the scanned text.",
    "pay.resolve": "Preview",
    "pay.resolving": "Reading…",
    "pay.payee": "Payee",
    "pay.creditWallet": "Credited wallet",
    "pay.amount": "Amount to pay",
    "pay.note": "Note",
    "pay.notePlaceholder": "Optional",
    "pay.needsSourceWallet": "Select the wallet to pay from above.",
    "pay.confirm": "Pay",
    "pay.paying": "Paying…",

    "valid.amount": "Enter an amount greater than 0.",
    "valid.ttl": "Validity must be a positive number of minutes.",
    "valid.payload": "Paste the scanned code first.",
    "valid.sourceWallet": "Select the wallet to pay from.",

    "toast.walletSearchFailed": "Could not search wallets.",
    "toast.loadFailed": "Could not load this wallet's code.",
    "toast.dynamicCreated": "Payment request created.",
    "toast.dynamicFailed": "Could not create the payment request.",
    "toast.revoked": "Code revoked.",
    "toast.revokeFailed": "Could not revoke this code.",
    "toast.copied": "Copied.",
    "toast.resolveFailed": "This code was not recognised.",
    "toast.paid": "Payment sent.",
    "toast.payFailed": "The payment could not be completed.",
  },
  fr: {
    title: "Codes QR du portefeuille",
    subtitle:
      "Le code permanent d'un portefeuille, les demandes de paiement ponctuelles et le paiement d'un code scanné. Chaque code appartient à un seul portefeuille : le compte crédité et sa devise sont fixés à la création.",

    "tab.codes": "Codes",
    "tab.pay": "Scanner et payer",

    "wallet.title": "Portefeuille",
    "wallet.search": "Rechercher un numéro de portefeuille, un compte ou un client…",
    "wallet.searching": "Recherche…",
    "wallet.change": "Changer",

    "empty.pickWallet": "Sélectionnez un portefeuille ci-dessus pour voir ses codes QR.",

    "static.title": "Code permanent",
    "static.loading": "Chargement…",
    "static.none": "Aucun code disponible pour ce portefeuille.",
    "static.inactiveHint":
      "Ce code n'est plus payable. L'actualisation en génère automatiquement un nouveau.",

    "list.title": "Codes",
    "list.sessionHint":
      "Les demandes créées pendant cette session apparaissent ici ; les plus anciennes se consultent via le support.",

    "dynamic.latest": "Dernière demande de paiement",
    "dynamic.expires": "Expire le {{when}}",
    "dynamic.dialogTitle": "Demander un paiement",
    "dynamic.dialogDescription":
      "Crée un code à usage unique pour un montant fixe. Il ne peut être payé qu'une fois et expire de lui-même.",
    "dynamic.amount": "Montant",
    "dynamic.amountHint": "Facturé en {{currency}} — la devise du portefeuille.",
    "dynamic.ttl": "Valable (minutes)",
    "dynamic.ttlHint":
      "Laissez vide pour la valeur par défaut du service. Le service plafonne la durée de validité.",
    "dynamic.reference": "Référence",
    "dynamic.referencePlaceholder": "Facture 1042",
    "dynamic.creating": "Création…",

    "col.type": "Type",
    "col.amount": "Montant",
    "col.status": "Statut",
    "col.expiresAt": "Expiration",
    "col.token": "Jeton",
    "col.action": "Action",

    "type.static": "Permanent",
    "type.dynamic": "Demande",
    anyAmount: "Montant libre",

    "status.ACTIVE": "Actif",
    "status.USED": "Payé",
    "status.EXPIRED": "Expiré",
    "status.REVOKED": "Révoqué",

    "action.revoke": "Révoquer",
    "action.copyPayload": "Copier",
    "action.requestMoney": "Demander un paiement",

    "pay.title": "Payer un code scanné",
    "pay.payload": "Code scanné",
    "pay.payloadPlaceholder": "Collez ici le contenu du QR scanné",
    "pay.payloadHint":
      "Prévisualisez d'abord — le montant, le statut et la destination sont lus sur le serveur, pas dans le texte scanné.",
    "pay.resolve": "Prévisualiser",
    "pay.resolving": "Lecture…",
    "pay.payee": "Bénéficiaire",
    "pay.creditWallet": "Portefeuille crédité",
    "pay.amount": "Montant à payer",
    "pay.note": "Note",
    "pay.notePlaceholder": "Facultatif",
    "pay.needsSourceWallet": "Sélectionnez ci-dessus le portefeuille à débiter.",
    "pay.confirm": "Payer",
    "pay.paying": "Paiement…",

    "valid.amount": "Saisissez un montant supérieur à 0.",
    "valid.ttl": "La validité doit être un nombre de minutes positif.",
    "valid.payload": "Collez d'abord le code scanné.",
    "valid.sourceWallet": "Sélectionnez le portefeuille à débiter.",

    "toast.walletSearchFailed": "Impossible de rechercher les portefeuilles.",
    "toast.loadFailed": "Impossible de charger le code de ce portefeuille.",
    "toast.dynamicCreated": "Demande de paiement créée.",
    "toast.dynamicFailed": "Impossible de créer la demande de paiement.",
    "toast.revoked": "Code révoqué.",
    "toast.revokeFailed": "Impossible de révoquer ce code.",
    "toast.copied": "Copié.",
    "toast.resolveFailed": "Ce code n'a pas été reconnu.",
    "toast.paid": "Paiement envoyé.",
    "toast.payFailed": "Le paiement n'a pas pu être effectué.",
  },
  ar: {
    title: "رموز QR للمحفظة",
    subtitle:
      "الرمز الدائم للمحفظة، وطلبات الدفع لمرة واحدة، ودفع رمز ممسوح. كل رمز يخص محفظة واحدة فقط، لذا يتحدد الحساب الدائن وعملته عند إنشاء الرمز.",

    "tab.codes": "الرموز",
    "tab.pay": "المسح والدفع",

    "wallet.title": "المحفظة",
    "wallet.search": "ابحث برقم المحفظة أو الحساب أو العميل…",
    "wallet.searching": "جارٍ البحث…",
    "wallet.change": "تغيير",

    "empty.pickWallet": "اختر محفظة بالأعلى لعرض رموز QR الخاصة بها.",

    "static.title": "الرمز الدائم",
    "static.loading": "جارٍ التحميل…",
    "static.none": "لا يوجد رمز لهذه المحفظة.",
    "static.inactiveHint": "لم يعد هذا الرمز قابلاً للدفع. التحديث ينشئ رمزاً جديداً تلقائياً.",

    "list.title": "الرموز",
    "list.sessionHint":
      "تظهر هنا الطلبات المنشأة في هذه الجلسة؛ أما الأقدم فتُراجع عبر الدعم.",

    "dynamic.latest": "أحدث طلب دفع",
    "dynamic.expires": "ينتهي في {{when}}",
    "dynamic.dialogTitle": "طلب مبلغ",
    "dynamic.dialogDescription":
      "ينشئ رمزاً لمرة واحدة بمبلغ محدد. يمكن دفعه مرة واحدة وينتهي تلقائياً.",
    "dynamic.amount": "المبلغ",
    "dynamic.amountHint": "يُحتسب بعملة {{currency}} — عملة المحفظة نفسها.",
    "dynamic.ttl": "صالح لمدة (دقائق)",
    "dynamic.ttlHint":
      "اتركه فارغاً لاستخدام القيمة الافتراضية. تضع الخدمة حداً أقصى لمدة الصلاحية.",
    "dynamic.reference": "المرجع",
    "dynamic.referencePlaceholder": "فاتورة 1042",
    "dynamic.creating": "جارٍ الإنشاء…",

    "col.type": "النوع",
    "col.amount": "المبلغ",
    "col.status": "الحالة",
    "col.expiresAt": "الانتهاء",
    "col.token": "الرمز المميز",
    "col.action": "الإجراء",

    "type.static": "دائم",
    "type.dynamic": "طلب",
    anyAmount: "أي مبلغ",

    "status.ACTIVE": "نشط",
    "status.USED": "مدفوع",
    "status.EXPIRED": "منتهٍ",
    "status.REVOKED": "ملغى",

    "action.revoke": "إلغاء",
    "action.copyPayload": "نسخ",
    "action.requestMoney": "طلب مبلغ",

    "pay.title": "دفع رمز ممسوح",
    "pay.payload": "الرمز الممسوح",
    "pay.payloadPlaceholder": "الصق محتوى رمز QR الممسوح هنا",
    "pay.payloadHint":
      "اعرض المعاينة أولاً — المبلغ والحالة والوجهة تُقرأ من الخادم لا من النص الممسوح.",
    "pay.resolve": "معاينة",
    "pay.resolving": "جارٍ القراءة…",
    "pay.payee": "المستفيد",
    "pay.creditWallet": "المحفظة الدائنة",
    "pay.amount": "المبلغ المطلوب دفعه",
    "pay.note": "ملاحظة",
    "pay.notePlaceholder": "اختياري",
    "pay.needsSourceWallet": "اختر بالأعلى المحفظة التي سيتم الخصم منها.",
    "pay.confirm": "دفع",
    "pay.paying": "جارٍ الدفع…",

    "valid.amount": "أدخل مبلغاً أكبر من 0.",
    "valid.ttl": "يجب أن تكون مدة الصلاحية عدد دقائق موجباً.",
    "valid.payload": "الصق الرمز الممسوح أولاً.",
    "valid.sourceWallet": "اختر المحفظة التي سيتم الخصم منها.",

    "toast.walletSearchFailed": "تعذر البحث في المحافظ.",
    "toast.loadFailed": "تعذر تحميل رمز هذه المحفظة.",
    "toast.dynamicCreated": "تم إنشاء طلب الدفع.",
    "toast.dynamicFailed": "تعذر إنشاء طلب الدفع.",
    "toast.revoked": "تم إلغاء الرمز.",
    "toast.revokeFailed": "تعذر إلغاء هذا الرمز.",
    "toast.copied": "تم النسخ.",
    "toast.resolveFailed": "لم يتم التعرف على هذا الرمز.",
    "toast.paid": "تم إرسال الدفعة.",
    "toast.payFailed": "تعذر إتمام الدفع.",
  },
};

export default walletQr;
