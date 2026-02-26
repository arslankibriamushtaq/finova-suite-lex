import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const dynamicTranslations = {
  // Dynamic translations based on user input
  en: {
    translation: {
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
    },
  },
  ar: {
    translation: {
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
    },
  },
};

i18n.use(initReactI18next).init({
  resources: dynamicTranslations,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export const updateUserTranslations = (
  language: string,
  userTranslations: { [key: string]: string }
): void => {
  i18n.addResourceBundle(language, "translation", userTranslations);
};
