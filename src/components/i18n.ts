import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { moduleResources, moduleNamespaces } from "../i18n";

/**
 * Single source of truth for app localization (react-i18next).
 *
 * Supported languages: English (en), French (fr), Arabic (ar — RTL).
 *
 * Namespaces
 *  - translation (default)  legacy landing-page + product-management keys,
 *                           kept inline below. Flat (keySeparator:false) so
 *                           existing dotted keys like "products.title" resolve.
 *  - everything else        per-module locale files under `src/i18n/locales/`,
 *                           assembled by `src/i18n/index.ts` (common, sidebar,
 *                           customerManagement, …). Add a module = add a file
 *                           and register it in that index; no change here.
 *
 * Direction is driven by `src/hooks/use-language.tsx`, which calls
 * `i18n.changeLanguage()` and sets `document.documentElement.dir`.
 */

export const SUPPORTED_LANGUAGES = ["en", "fr", "ar"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ---------------------------------------------------------------------------
// translation (default namespace) — legacy landing + product keys
// ---------------------------------------------------------------------------
const translationEn = {
  // Landing / marketing
  publish: "Publish",
  imageText: "Change Background Image",
  heading: "A simple way to finance your business",
  apply: "Apply For Financing",
  whyChoose: "Why Choose Merchant Cash Advance",
  fundingHead: "Fast Funding Decisions",
  fundingText: "POS Financing Decision with in 24 hours",
  orinationHead: "No Orignation Fee",
  orinationText: "Shariah complaint with no hidden charges",
  serveHead: "We Serve Most Industries",
  serveText: " We are the pioneer in shariah complaint financing",
  about: "About Us",
  aboutText:
    "Tanmeya Capital is a pioneering sharia-compliant financing platform offering a wide range of flexible and innovative solutions, with commercial registration (1010337706) licensed by the Saudi Central Bank No. 22/أ ش/201410 dated 11/19/1435 AH",
  aboutTextOne:
    "Established in 2012, the company, with capital 500,000,000 SR , has a head office in Riyadh and 16 branches located in 13 cities across Kingdom, it specializes in providing flexible financial leasing, small and medium enterprises financing, productive assets and consumer financing, subject to control and supervision The Central Bank of Saudi Arabia.",
  pos: "POS Financing",
  postext:
    "POS Financing is the fastest financing facility, It is a quick fix for your business problems. This facility can be availed within 24 hours and can be utilised for 30 days. Below are the salient features for POS Financing product",
  pos1: "Shariah Compliance",
  pos2: "Amount: Upto SR 150,000",
  pos3: "Duration: One month financing",
  pos4: "Approval within 24 hours",
  applyB: "Apply",
  us: "Why choose us?",
  usText:
    "Within our values and the Islamic Shari’a spirit and principles, we have started our journey in 2012. And throughout, we have been inspired to deal with our clients and partners, and that’s how we started. Tanmeya Capital launched its operations promoting its financing services for individuals and SME’s in compliancy with the Islamic Shariah principles, by providing a variety of financing products that our individual and corporate clients entail.",
  need: " Whether you need SR 8000 or SR 250,000 We can help you!",

  // Product Management (legacy keys, kept so pages using
  // useLanguage().t("products.title") keep working through i18next).
  products: "Products",
  partners: "Partners",
  documents: "Documents",
  settings: "Settings",
  "products.title": "Products Management",
  "products.subtitle": "Manage your financial products and services",
  "products.addNew": "Add New Product",
  "products.search": "Search products...",
  "products.filters": "Filters",
  "products.export": "Export",
  "products.bulkActions": "Bulk Actions",
  "products.selectAll": "Select All",
  "products.clearSelection": "Clear Selection",
  "table.logo": "Logo",
  "table.productName": "Product Name",
  "table.email": "Email",
  "table.country": "Country",
  "table.productType": "Product Type",
  "table.status": "Status",
  "table.createdDate": "Created Date",
  "table.actions": "Actions",
  "status.active": "Active",
  "status.draft": "Draft",
  "status.disabled": "Disabled",
  "actions.edit": "Edit",
  "actions.view": "View",
  "actions.delete": "Delete",
  "actions.duplicate": "Duplicate",
  "actions.export": "Export",
  "wizard.basicInfo": "Basic Information",
  "wizard.commodityInfo": "Commodity Information",
  "wizard.settings": "Settings",
  "wizard.partnerAffiliation": "Partner Affiliation",
  "wizard.requiredDocuments": "Required Documents",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.next": "Next",
  "common.previous": "Previous",
  "common.publish": "Publish",
  "common.saveDraft": "Save Draft",
  "common.loading": "Loading...",
  "common.noData": "No data available",
};

const translationFr = {
  publish: "Publier",
  imageText: "Modifier l’image d’arrière-plan",
  heading: "Une manière simple de financer votre entreprise",
  apply: "Demander un financement",
  whyChoose: "Pourquoi choisir l’avance de trésorerie commerçant",
  fundingHead: "Décisions de financement rapides",
  fundingText: "Décision de financement TPE sous 24 heures",
  orinationHead: "Aucuns frais de dossier",
  orinationText: "Conforme à la Charia, sans frais cachés",
  serveHead: "Nous servons la plupart des secteurs",
  serveText: " Nous sommes les pionniers du financement conforme à la Charia",
  about: "À propos de nous",
  aboutText:
    "Tanmeya Capital est une plateforme de financement pionnière conforme à la Charia, proposant un large éventail de solutions flexibles et innovantes, immatriculée au registre du commerce (1010337706) et agréée par la Banque centrale saoudienne sous le n° 22/أ ش/201410 du 19/11/1435 AH.",
  aboutTextOne:
    "Fondée en 2012, la société, dotée d’un capital de 500 000 000 SAR, dispose d’un siège social à Riyad et de 16 agences réparties dans 13 villes du Royaume. Elle est spécialisée dans le crédit-bail flexible, le financement des petites et moyennes entreprises, des actifs productifs et le financement à la consommation, sous le contrôle et la supervision de la Banque centrale saoudienne.",
  pos: "Financement TPE",
  postext:
    "Le financement TPE est la facilité de financement la plus rapide ; c’est une solution rapide aux besoins de votre entreprise. Cette facilité peut être obtenue sous 24 heures et utilisée pendant 30 jours. Voici les principales caractéristiques du produit de financement TPE.",
  pos1: "Conformité à la Charia",
  pos2: "Montant : jusqu’à 150 000 SAR",
  pos3: "Durée : financement sur un mois",
  pos4: "Approbation sous 24 heures",
  applyB: "Demander",
  us: "Pourquoi nous choisir ?",
  usText:
    "Dans le respect de nos valeurs et de l’esprit et des principes de la Charia islamique, nous avons entamé notre parcours en 2012. Tout au long de celui-ci, nous nous sommes attachés à servir nos clients et nos partenaires. Tanmeya Capital a lancé ses activités en promouvant ses services de financement destinés aux particuliers et aux PME, conformément aux principes de la Charia islamique, en proposant une gamme variée de produits de financement adaptés à nos clients particuliers et entreprises.",
  need: " Que vous ayez besoin de 8 000 SAR ou de 250 000 SAR, nous pouvons vous aider !",

  products: "Produits",
  partners: "Partenaires",
  documents: "Documents",
  settings: "Paramètres",
  "products.title": "Gestion des produits",
  "products.subtitle": "Gérez vos produits et services financiers",
  "products.addNew": "Ajouter un nouveau produit",
  "products.search": "Rechercher des produits...",
  "products.filters": "Filtres",
  "products.export": "Exporter",
  "products.bulkActions": "Actions groupées",
  "products.selectAll": "Tout sélectionner",
  "products.clearSelection": "Effacer la sélection",
  "table.logo": "Logo",
  "table.productName": "Nom du produit",
  "table.email": "E-mail",
  "table.country": "Pays",
  "table.productType": "Type de produit",
  "table.status": "Statut",
  "table.createdDate": "Date de création",
  "table.actions": "Actions",
  "status.active": "Actif",
  "status.draft": "Brouillon",
  "status.disabled": "Désactivé",
  "actions.edit": "Modifier",
  "actions.view": "Consulter",
  "actions.delete": "Supprimer",
  "actions.duplicate": "Dupliquer",
  "actions.export": "Exporter",
  "wizard.basicInfo": "Informations de base",
  "wizard.commodityInfo": "Informations sur la marchandise",
  "wizard.settings": "Paramètres",
  "wizard.partnerAffiliation": "Affiliation partenaire",
  "wizard.requiredDocuments": "Documents requis",
  "common.save": "Enregistrer",
  "common.cancel": "Annuler",
  "common.next": "Suivant",
  "common.previous": "Précédent",
  "common.publish": "Publier",
  "common.saveDraft": "Enregistrer le brouillon",
  "common.loading": "Chargement...",
  "common.noData": "Aucune donnée disponible",
};

const translationAr = {
  publish: "ينشر",
  imageText: "تغيير صورة الخلفية",
  heading: "طريقة بسيطة لتمويل عملك",
  apply: "تقدم بطلب التمويل",
  whyChoose: "لماذا تختار السلفة النقدية للتاجر",
  fundingHead: "قرارات تمويل سريعة",
  fundingText: "قرار التمويل عبر نقاط البيع خلال 24 ساعة",
  orinationHead: "لا توجد رسوم الإنشاء",
  orinationText: "شكوى شرعية بدون رسوم خفية",
  serveHead: "نحن نخدم معظم الصناعات",
  serveText: "نحن الرواد في التمويل المتوافق مع أحكام الشريعة الإسلامية",
  about: "معلومات عنا",
  aboutText:
    "تنمية كابيتال هي منصة تمويل رائدة متوافقة مع أحكام الشريعة الإسلامية تقدم مجموعة واسعة من الحلول المرنة والمبتكرة، بسجل تجاري (1010337706) مرخص من البنك المركزي السعودي برقم 22/أ ش/201410 بتاريخ 1435/11/14هـ",
  aboutTextOne:
    "تأسست الشركة عام 2012 برأس مال 500,000,000 ريال سعودي، ولها مكتب رئيسي في الرياض و16 فرعاً منتشرة في 13 مدينة في جميع أنحاء المملكة، وهي متخصصة في تقديم التأجير التمويلي المرن وتمويل المؤسسات الصغيرة والمتوسطة والأصول الإنتاجية والتمويل الاستهلاكي، خاضعة لشروط الرقابة والإشراف على البنك المركزي السعودي.",
  pos: "تمويل نقاط البيع",
  postext:
    "تمويل نقاط البيع هو أسرع وسيلة تمويل، وهو حل سريع لمشاكل عملك. يمكن الاستفادة من هذا المرفق خلال 24 ساعة ويمكن استخدامه لمدة 30 يومًا. فيما يلي الميزات البارزة لمنتج تمويل نقاط البيع",
  pos1: "الامتثال للشريعة",
  pos2: "المبلغ: يصل إلى 150,000 ريال سعودي",
  pos3: "المدة: تمويل شهر واحد",
  pos4: "الموافقة خلال 24 ساعة",
  applyB: "يتقدم",
  us: "لماذا أخترتنا؟",
  usText:
    "في إطار قيمنا وروح ومبادئ الشريعة الإسلامية، بدأنا رحلتنا في عام 2012. وطوال الوقت، ألهمنا التعامل مع عملائنا وشركائنا، وهكذا بدأنا. أطلقت شركة تنمية كابيتال عملياتها للترويج لخدماتها التمويلية للأفراد والشركات الصغيرة والمتوسطة المتوافقة مع مبادئ الشريعة الإسلامية، وذلك من خلال توفير مجموعة متنوعة من المنتجات التمويلية التي يقدمها عملاؤنا من الأفراد والشركات.",
  need: "سواء كنت بحاجة إلى 8000 ريال سعودي أو 250,000 ريال سعودي، يمكننا مساعدتك!",

  products: "المنتجات",
  partners: "الشركاء",
  documents: "المستندات",
  settings: "الإعدادات",
  "products.title": "إدارة المنتجات",
  "products.subtitle": "إدارة منتجاتك وخدماتك المالية",
  "products.addNew": "إضافة منتج جديد",
  "products.search": "البحث في المنتجات...",
  "products.filters": "المرشحات",
  "products.export": "تصدير",
  "products.bulkActions": "الإجراءات المجمعة",
  "products.selectAll": "تحديد الكل",
  "products.clearSelection": "إلغاء التحديد",
  "table.logo": "الشعار",
  "table.productName": "اسم المنتج",
  "table.email": "البريد الإلكتروني",
  "table.country": "البلد",
  "table.productType": "نوع المنتج",
  "table.status": "الحالة",
  "table.createdDate": "تاريخ الإنشاء",
  "table.actions": "الإجراءات",
  "status.active": "نشط",
  "status.draft": "مسودة",
  "status.disabled": "معطل",
  "actions.edit": "تعديل",
  "actions.view": "عرض",
  "actions.delete": "حذف",
  "actions.duplicate": "نسخ",
  "actions.export": "تصدير",
  "wizard.basicInfo": "المعلومات الأساسية",
  "wizard.commodityInfo": "معلومات السلعة",
  "wizard.settings": "الإعدادات",
  "wizard.partnerAffiliation": "انتماء الشريك",
  "wizard.requiredDocuments": "المستندات المطلوبة",
  "common.save": "حفظ",
  "common.cancel": "إلغاء",
  "common.next": "التالي",
  "common.previous": "السابق",
  "common.publish": "نشر",
  "common.saveDraft": "حفظ كمسودة",
  "common.loading": "جاري التحميل...",
  "common.noData": "لا توجد بيانات متاحة",
};

// ---------------------------------------------------------------------------
// Resource assembly — inline `translation` ns + per-module locale files
// ---------------------------------------------------------------------------
const resources = {
  en: { translation: translationEn, ...moduleResources.en },
  fr: { translation: translationFr, ...moduleResources.fr },
  ar: { translation: translationAr, ...moduleResources.ar },
};

const savedLanguage =
  (typeof window !== "undefined" && window.localStorage.getItem("language")) ||
  "en";
const initialLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(
  savedLanguage
)
  ? savedLanguage
  : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
  ns: ["translation", ...moduleNamespaces],
  defaultNS: "translation",
  // Flat keys: legacy keys like "products.title" must resolve literally, so we
  // disable "." nesting. Namespaces are still selected via the ":" separator.
  keySeparator: false,
  nsSeparator: ":",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export const updateUserTranslations = (
  language: string,
  userTranslations: { [key: string]: string }
): void => {
  i18n.addResourceBundle(language, "translation", userTranslations, true, true);
};
