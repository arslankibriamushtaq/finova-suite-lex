// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
const resources = {
  en: {
    translation: {
      greeting: "Hello, world!",
      welcome: "Welcome to my app.",
    },
  },
  ar: {
    translation: {
      greeting: "مرحبًا بك في العالم!",
      welcome: "مرحبًا في تطبيقي.",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ar", // default language
  keySeparator: false, // we do not use keys in form messages.welcome
  interpolation: {
    escapeValue: false, // react already safe from xss
  },
});

export default i18n;
