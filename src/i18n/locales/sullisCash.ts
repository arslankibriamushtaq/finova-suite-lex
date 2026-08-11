import type { ModuleLocale } from "../types";

/**
 * SullisCash module — admin configuration of the short-term cash advance
 * (wallet-service). One config row per tenant owns every term the product runs
 * on: borrowing limit, daily profit rate, tenure window, quick-pick amounts and
 * the late-penalty settings.
 */
const sullisCash: ModuleLocale = {
  namespace: "sullisCash",
  en: {
    "cfg.title": "SullisCash Settings",
    "cfg.subtitle":
      "Every term the cash advance runs on — the borrowing limit, the daily profit rate, the tenure window and the late penalty.",

    // Availability
    "cfg.availability.title": "Availability",
    "cfg.availability.enabled": "SullisCash is available",
    "cfg.availability.enabledHint":
      "Turning this off blocks all new borrowing. Customers with an open loan can still repay.",
    "cfg.availability.on": "Accepting new loans",
    "cfg.availability.off": "New borrowing is blocked",

    // Loan amounts
    "cfg.amounts.title": "Loan amounts",
    "cfg.field.minLoanAmount": "Minimum loan",
    "cfg.field.maxLoanAmount": "Borrowing limit",
    "cfg.field.maxLoanAmountHint":
      "Counted across every open loan a wallet holds, not per loan — someone 2,500 in with a 3,000 limit can borrow 500 more.",
    "cfg.field.quickAmounts": "Quick amounts",
    "cfg.field.quickAmountsHint":
      "The chips the app offers. Each must sit inside the loan range above.",
    "cfg.field.quickAmountsAdd": "Add amount",
    "cfg.field.quickAmountsEmpty": "No quick amounts — the app will ask the customer to type one.",
    "cfg.field.quickAmountsRemove": "Remove {{amount}}",

    // Profit
    "cfg.profit.title": "Profit",
    "cfg.field.dailyProfitRate": "Daily profit rate (%)",
    "cfg.field.dailyProfitRateHint":
      "A percent of the principal per day, fixed at disbursement. 0.0833 over 60 days works out at about 5%.",
    "cfg.profit.effective": "{{rate}} over {{days}} days",
    "cfg.profit.perDay": "{{rate}} per day × {{days}} days",

    // Tenure
    "cfg.tenure.title": "Tenure",
    "cfg.field.minTenureDays": "Shortest tenure (days)",
    "cfg.field.maxTenureDays": "Longest tenure (days)",
    "cfg.field.defaultTenureDays": "Default tenure (days)",
    "cfg.field.defaultTenureDaysHint": "Used when the app does not send a tenure.",

    // Penalty
    "cfg.penalty.title": "Late penalty",
    "cfg.field.penaltyDailyRate": "Penalty rate (% per overdue day)",
    "cfg.field.penaltyDailyRateHint": "A percent of the principal for each overdue day.",
    "cfg.field.penaltyGraceDays": "Grace period (days)",
    "cfg.field.penaltyGraceDaysHint": "Free days after the due date before the penalty starts.",

    // Worked example
    "cfg.preview.title": "Worked example",
    "cfg.preview.subtitle": "At the borrowing limit, over the default tenure.",
    "cfg.preview.principal": "Customer receives",
    "cfg.preview.profit": "Profit",
    "cfg.preview.totalDue": "Repaid in one payment",
    "cfg.preview.penaltyPerDay": "Then each overdue day",
    "cfg.preview.penaltyAfterGrace": "after {{days}} grace days",
    "cfg.preview.penaltyNoGrace": "from the day after it is due",

    // Actions
    "cfg.save": "Save settings",
    "cfg.saving": "Saving…",
    "cfg.discard": "Discard changes",
    "cfg.unsaved": "Unsaved changes",
    "cfg.updatedAt": "Last updated {{date}}",
    // Paired with a clock icon, so it carries no "Last updated" prefix.
    "cfg.updatedAtShort": "Updated",
    "cfg.readOnly": "You have read-only access to these settings.",

    // Save confirmation
    "cfg.confirm.title": "Save these terms?",
    "cfg.confirm.description":
      "New terms apply to future loans only. Every loan already taken keeps the terms it was disbursed on, so nothing a customer has agreed to changes.",
    "cfg.confirm.disableWarning":
      "SullisCash will stop accepting new loans. Customers with an open loan can still repay.",
    "cfg.confirm.action": "Save settings",

    // Validation
    "cfg.valid.minLoanAmount": "The minimum loan must be greater than 0",
    "cfg.valid.maxLoanAmount": "The borrowing limit must be greater than or equal to the minimum",
    "cfg.valid.quickAmountRange": "{{amount}} sits outside the loan range",
    "cfg.valid.quickAmountInvalid": "Quick amounts must be valid numbers",
    "cfg.valid.dailyProfitRate": "The daily profit rate cannot be negative",
    "cfg.valid.minTenureDays": "The shortest tenure must be greater than 0",
    "cfg.valid.maxTenureDays": "The longest tenure must be greater than or equal to the shortest",
    "cfg.valid.defaultTenureDays": "The default tenure must fall inside the tenure window",
    "cfg.valid.penaltyDailyRate": "The penalty rate cannot be negative",
    "cfg.valid.penaltyGraceDays": "The grace period cannot be negative",

    // Toasts
    "cfg.toast.loadFailed": "Failed to load the SullisCash settings",
    "cfg.toast.saved": "SullisCash settings saved",
    "cfg.toast.saveFailed": "Failed to save the settings",
  },

  fr: {
    "cfg.title": "Paramètres SullisCash",
    "cfg.subtitle":
      "Toutes les conditions de l’avance de trésorerie — la limite d’emprunt, le taux de profit journalier, la durée et la pénalité de retard.",

    "cfg.availability.title": "Disponibilité",
    "cfg.availability.enabled": "SullisCash est disponible",
    "cfg.availability.enabledHint":
      "Désactiver bloque tout nouvel emprunt. Les clients ayant un prêt en cours peuvent toujours rembourser.",
    "cfg.availability.on": "Nouveaux prêts acceptés",
    "cfg.availability.off": "Nouveaux emprunts bloqués",

    "cfg.amounts.title": "Montants des prêts",
    "cfg.field.minLoanAmount": "Prêt minimum",
    "cfg.field.maxLoanAmount": "Limite d’emprunt",
    "cfg.field.maxLoanAmountHint":
      "Calculée sur l’ensemble des prêts en cours d’un portefeuille, et non par prêt — avec 2 500 en cours et une limite de 3 000, il reste 500 à emprunter.",
    "cfg.field.quickAmounts": "Montants rapides",
    "cfg.field.quickAmountsHint":
      "Les raccourcis proposés dans l’application. Chacun doit se situer dans la plage ci-dessus.",
    "cfg.field.quickAmountsAdd": "Ajouter un montant",
    "cfg.field.quickAmountsEmpty":
      "Aucun montant rapide — l’application demandera au client de saisir le sien.",
    "cfg.field.quickAmountsRemove": "Supprimer {{amount}}",

    "cfg.profit.title": "Profit",
    "cfg.field.dailyProfitRate": "Taux de profit journalier (%)",
    "cfg.field.dailyProfitRateHint":
      "Un pourcentage du principal par jour, figé au décaissement. 0,0833 sur 60 jours équivaut à environ 5 %.",
    "cfg.profit.effective": "{{rate}} sur {{days}} jours",
    "cfg.profit.perDay": "{{rate}} par jour × {{days}} jours",

    "cfg.tenure.title": "Durée",
    "cfg.field.minTenureDays": "Durée la plus courte (jours)",
    "cfg.field.maxTenureDays": "Durée la plus longue (jours)",
    "cfg.field.defaultTenureDays": "Durée par défaut (jours)",
    "cfg.field.defaultTenureDaysHint": "Utilisée lorsque l’application n’envoie pas de durée.",

    "cfg.penalty.title": "Pénalité de retard",
    "cfg.field.penaltyDailyRate": "Taux de pénalité (% par jour de retard)",
    "cfg.field.penaltyDailyRateHint": "Un pourcentage du principal pour chaque jour de retard.",
    "cfg.field.penaltyGraceDays": "Délai de grâce (jours)",
    "cfg.field.penaltyGraceDaysHint":
      "Jours gratuits après l’échéance avant le début de la pénalité.",

    "cfg.preview.title": "Exemple chiffré",
    "cfg.preview.subtitle": "À la limite d’emprunt, sur la durée par défaut.",
    "cfg.preview.principal": "Le client reçoit",
    "cfg.preview.profit": "Profit",
    "cfg.preview.totalDue": "Remboursé en une fois",
    "cfg.preview.penaltyPerDay": "Puis chaque jour de retard",
    "cfg.preview.penaltyAfterGrace": "après {{days}} jours de grâce",
    "cfg.preview.penaltyNoGrace": "dès le lendemain de l’échéance",

    "cfg.save": "Enregistrer",
    "cfg.saving": "Enregistrement…",
    "cfg.discard": "Annuler les modifications",
    "cfg.unsaved": "Modifications non enregistrées",
    "cfg.updatedAt": "Dernière mise à jour {{date}}",
    "cfg.updatedAtShort": "Modifié le",
    "cfg.readOnly": "Vous avez un accès en lecture seule à ces paramètres.",

    "cfg.confirm.title": "Enregistrer ces conditions ?",
    "cfg.confirm.description":
      "Les nouvelles conditions ne s’appliquent qu’aux prêts futurs. Chaque prêt déjà accordé conserve les conditions de son décaissement : rien de ce qu’un client a accepté ne change.",
    "cfg.confirm.disableWarning":
      "SullisCash cessera d’accepter de nouveaux prêts. Les clients ayant un prêt en cours pourront toujours rembourser.",
    "cfg.confirm.action": "Enregistrer",

    "cfg.valid.minLoanAmount": "Le prêt minimum doit être supérieur à 0",
    "cfg.valid.maxLoanAmount":
      "La limite d’emprunt doit être supérieure ou égale au montant minimum",
    "cfg.valid.quickAmountRange": "{{amount}} se situe hors de la plage de prêt",
    "cfg.valid.quickAmountInvalid": "Les montants rapides doivent être des nombres valides",
    "cfg.valid.dailyProfitRate": "Le taux de profit journalier ne peut pas être négatif",
    "cfg.valid.minTenureDays": "La durée la plus courte doit être supérieure à 0",
    "cfg.valid.maxTenureDays":
      "La durée la plus longue doit être supérieure ou égale à la plus courte",
    "cfg.valid.defaultTenureDays": "La durée par défaut doit se situer dans la plage des durées",
    "cfg.valid.penaltyDailyRate": "Le taux de pénalité ne peut pas être négatif",
    "cfg.valid.penaltyGraceDays": "Le délai de grâce ne peut pas être négatif",

    "cfg.toast.loadFailed": "Échec du chargement des paramètres SullisCash",
    "cfg.toast.saved": "Paramètres SullisCash enregistrés",
    "cfg.toast.saveFailed": "Échec de l’enregistrement des paramètres",
  },

  ar: {
    "cfg.title": "إعدادات SullisCash",
    "cfg.subtitle":
      "كل شروط السلفة النقدية قصيرة الأجل — حد الاقتراض ونسبة الربح اليومية ومدة السداد وغرامة التأخير.",

    "cfg.availability.title": "الإتاحة",
    "cfg.availability.enabled": "SullisCash متاح",
    "cfg.availability.enabledHint":
      "إيقاف هذا الخيار يمنع أي اقتراض جديد. ويظل بإمكان العملاء أصحاب القروض القائمة السداد.",
    "cfg.availability.on": "يقبل قروضاً جديدة",
    "cfg.availability.off": "الاقتراض الجديد متوقف",

    "cfg.amounts.title": "مبالغ القروض",
    "cfg.field.minLoanAmount": "الحد الأدنى للقرض",
    "cfg.field.maxLoanAmount": "حد الاقتراض",
    "cfg.field.maxLoanAmountHint":
      "يُحتسب على مجموع القروض القائمة للمحفظة وليس لكل قرض على حدة — من عليه 2,500 وحده 3,000 يمكنه اقتراض 500 فقط.",
    "cfg.field.quickAmounts": "المبالغ السريعة",
    "cfg.field.quickAmountsHint":
      "الاختصارات التي يعرضها التطبيق. يجب أن يقع كل مبلغ ضمن نطاق القرض أعلاه.",
    "cfg.field.quickAmountsAdd": "إضافة مبلغ",
    "cfg.field.quickAmountsEmpty": "لا توجد مبالغ سريعة — سيطلب التطبيق من العميل إدخال المبلغ.",
    "cfg.field.quickAmountsRemove": "إزالة {{amount}}",

    "cfg.profit.title": "الربح",
    "cfg.field.dailyProfitRate": "نسبة الربح اليومية (%)",
    "cfg.field.dailyProfitRateHint":
      "نسبة من أصل المبلغ لكل يوم، تُثبَّت عند الصرف. 0.0833 على مدى 60 يوماً تعادل نحو 5%.",
    "cfg.profit.effective": "{{rate}} على مدى {{days}} يوماً",
    "cfg.profit.perDay": "{{rate}} يومياً × {{days}} يوماً",

    "cfg.tenure.title": "مدة السداد",
    "cfg.field.minTenureDays": "أقصر مدة (بالأيام)",
    "cfg.field.maxTenureDays": "أطول مدة (بالأيام)",
    "cfg.field.defaultTenureDays": "المدة الافتراضية (بالأيام)",
    "cfg.field.defaultTenureDaysHint": "تُستخدم عندما لا يرسل التطبيق مدة.",

    "cfg.penalty.title": "غرامة التأخير",
    "cfg.field.penaltyDailyRate": "نسبة الغرامة (% لكل يوم تأخير)",
    "cfg.field.penaltyDailyRateHint": "نسبة من أصل المبلغ عن كل يوم تأخير.",
    "cfg.field.penaltyGraceDays": "فترة السماح (بالأيام)",
    "cfg.field.penaltyGraceDaysHint": "أيام مجانية بعد تاريخ الاستحقاق قبل بدء الغرامة.",

    "cfg.preview.title": "مثال محسوب",
    "cfg.preview.subtitle": "عند حد الاقتراض وعلى المدة الافتراضية.",
    "cfg.preview.principal": "يستلم العميل",
    "cfg.preview.profit": "الربح",
    "cfg.preview.totalDue": "يُسدَّد دفعة واحدة",
    "cfg.preview.penaltyPerDay": "ثم عن كل يوم تأخير",
    "cfg.preview.penaltyAfterGrace": "بعد {{days}} أيام سماح",
    "cfg.preview.penaltyNoGrace": "اعتباراً من اليوم التالي للاستحقاق",

    "cfg.save": "حفظ الإعدادات",
    "cfg.saving": "جارٍ الحفظ…",
    "cfg.discard": "تجاهل التغييرات",
    "cfg.unsaved": "تغييرات غير محفوظة",
    "cfg.updatedAt": "آخر تحديث {{date}}",
    "cfg.updatedAtShort": "حُدِّث",
    "cfg.readOnly": "لديك صلاحية اطّلاع فقط على هذه الإعدادات.",

    "cfg.confirm.title": "حفظ هذه الشروط؟",
    "cfg.confirm.description":
      "تنطبق الشروط الجديدة على القروض المستقبلية فقط. ويحتفظ كل قرض سبق صرفه بشروطه، فلا يتغير شيء ممّا وافق عليه العميل.",
    "cfg.confirm.disableWarning":
      "سيتوقف SullisCash عن قبول قروض جديدة. ويظل بإمكان أصحاب القروض القائمة السداد.",
    "cfg.confirm.action": "حفظ الإعدادات",

    "cfg.valid.minLoanAmount": "يجب أن يكون الحد الأدنى للقرض أكبر من 0",
    "cfg.valid.maxLoanAmount": "يجب أن يكون حد الاقتراض أكبر من أو يساوي الحد الأدنى",
    "cfg.valid.quickAmountRange": "المبلغ {{amount}} خارج نطاق القرض",
    "cfg.valid.quickAmountInvalid": "يجب أن تكون المبالغ السريعة أرقاماً صحيحة",
    "cfg.valid.dailyProfitRate": "لا يمكن أن تكون نسبة الربح اليومية سالبة",
    "cfg.valid.minTenureDays": "يجب أن تكون أقصر مدة أكبر من 0",
    "cfg.valid.maxTenureDays": "يجب أن تكون أطول مدة أكبر من أو تساوي أقصر مدة",
    "cfg.valid.defaultTenureDays": "يجب أن تقع المدة الافتراضية ضمن نطاق المدد",
    "cfg.valid.penaltyDailyRate": "لا يمكن أن تكون نسبة الغرامة سالبة",
    "cfg.valid.penaltyGraceDays": "لا يمكن أن تكون فترة السماح سالبة",

    "cfg.toast.loadFailed": "تعذّر تحميل إعدادات SullisCash",
    "cfg.toast.saved": "تم حفظ إعدادات SullisCash",
    "cfg.toast.saveFailed": "تعذّر حفظ الإعدادات",
  },
};

export default sullisCash;
