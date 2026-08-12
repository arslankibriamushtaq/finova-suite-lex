import type { ModuleLocale } from "../types";

/**
 * Which GL account each wallet rail posts to (ledger-service).
 *
 * The wording carries two warnings the API cannot enforce: a change applies
 * only from the next transaction, and the account type is never checked
 * against the rail.
 */
const walletGlAccounts: ModuleLocale = {
  namespace: "walletGlAccounts",
  en: {
    "wga.title": "Wallet GL Accounts",
    "wga.subtitle":
      "The account each wallet rail posts to. Changing one is a settings change, not a redeploy.",
    "wga.notRetrospective":
      "A change applies from the next transaction onward. Entries already posted stay on the old account — moving them is a reclassification entry, which cannot be made here.",
    "wga.empty": "No wallet GL accounts are configured.",
    "wga.col.rail": "Rail",
    "wga.col.account": "GL account",
    "wga.col.type": "Account type",
    "wga.col.action": "Action",
    "wga.edit.title": "Change the account for {{rail}}",
    "wga.edit.explain":
      "Only postable accounts are offered — a header account groups its children and rejects postings.",
    "wga.edit.current": "Currently posts to",
    "wga.edit.new": "Post to instead",
    "wga.edit.choose": "Choose an account",
    "wga.edit.noAccounts":
      "The account list could not be loaded, so there is nothing to choose from.",
    "wga.edit.confirmHint":
      "From the next transaction this rail posts to {{code}} {{name}}, an {{type}} account. The account type is not checked against the rail — an unsuitable type posts cleanly and shows up later as a wrong report.",
    "wga.edit.save": "Save account",
    "wga.toast.loadFailed": "Failed to load the wallet GL accounts",
    "wga.toast.saved": "{{key}} now posts to the new account",
    "wga.toast.saveFailed": "Failed to change the account",
  },
  fr: {
    "wga.title": "Comptes du grand livre — portefeuille",
    "wga.subtitle":
      "Le compte sur lequel chaque canal du portefeuille est comptabilisé. Le modifier est un réglage, pas un redéploiement.",
    "wga.notRetrospective":
      "Une modification s'applique à partir de la transaction suivante. Les écritures déjà comptabilisées restent sur l'ancien compte — les déplacer suppose une écriture de reclassement, impossible depuis cet écran.",
    "wga.empty": "Aucun compte n'est configuré.",
    "wga.col.rail": "Canal",
    "wga.col.account": "Compte",
    "wga.col.type": "Type de compte",
    "wga.col.action": "Action",
    "wga.edit.title": "Modifier le compte de {{rail}}",
    "wga.edit.explain":
      "Seuls les comptes imputables sont proposés — un compte d'en-tête regroupe ses enfants et refuse les écritures.",
    "wga.edit.current": "Comptabilisé actuellement sur",
    "wga.edit.new": "Comptabiliser désormais sur",
    "wga.edit.choose": "Choisir un compte",
    "wga.edit.noAccounts": "La liste des comptes n'a pas pu être chargée : aucun choix possible.",
    "wga.edit.confirmHint":
      "À partir de la prochaine transaction, ce canal sera comptabilisé sur {{code}} {{name}}, un compte de type {{type}}. Le type n'est pas vérifié par rapport au canal — un type inadapté se comptabilise sans erreur et n'apparaît que plus tard, dans un état faux.",
    "wga.edit.save": "Enregistrer",
    "wga.toast.loadFailed": "Échec du chargement des comptes",
    "wga.toast.saved": "{{key}} est désormais comptabilisé sur le nouveau compte",
    "wga.toast.saveFailed": "Échec de la modification du compte",
  },
  ar: {
    "wga.title": "حسابات دفتر الأستاذ للمحفظة",
    "wga.subtitle":
      "الحساب الذي تُرحَّل إليه كل قناة من قنوات المحفظة. تغييره إعداد، لا إعادة نشر.",
    "wga.notRetrospective":
      "يسري التغيير اعتبارًا من المعاملة التالية. أما القيود المرحَّلة سابقًا فتبقى على الحساب القديم — ونقلها يتطلب قيد إعادة تصنيف لا يمكن إجراؤه من هنا.",
    "wga.empty": "لا توجد حسابات مُهيّأة.",
    "wga.col.rail": "القناة",
    "wga.col.account": "الحساب",
    "wga.col.type": "نوع الحساب",
    "wga.col.action": "الإجراء",
    "wga.edit.title": "تغيير حساب {{rail}}",
    "wga.edit.explain":
      "تُعرض الحسابات القابلة للترحيل فقط — الحساب التجميعي يجمع حساباته الفرعية ولا يقبل القيود.",
    "wga.edit.current": "يُرحَّل حاليًا إلى",
    "wga.edit.new": "يُرحَّل بدلًا من ذلك إلى",
    "wga.edit.choose": "اختر حسابًا",
    "wga.edit.noAccounts": "تعذّر تحميل قائمة الحسابات، فلا يوجد ما يمكن اختياره.",
    "wga.edit.confirmHint":
      "اعتبارًا من المعاملة التالية تُرحَّل هذه القناة إلى {{code}} {{name}}، وهو حساب من نوع {{type}}. لا يُتحقق من ملاءمة النوع للقناة — فالنوع غير المناسب يُرحَّل دون خطأ ولا يظهر إلا لاحقًا في تقرير خاطئ.",
    "wga.edit.save": "حفظ الحساب",
    "wga.toast.loadFailed": "تعذّر تحميل حسابات المحفظة",
    "wga.toast.saved": "أصبحت {{key}} تُرحَّل إلى الحساب الجديد",
    "wga.toast.saveFailed": "تعذّر تغيير الحساب",
  },
};

export default walletGlAccounts;
